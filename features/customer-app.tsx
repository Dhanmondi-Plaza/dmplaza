'use client';

import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import type {User} from '@supabase/supabase-js';
import {QRCodeSVG} from 'qrcode.react';
import {customerClient} from './customer-supabase';
import './customer-app.css';

type Event={id:string;slug:string;title:string;summary:string;starts_at:string;ends_at:string;location:string;capacity:number};
type Registration={id:string;event_id:string;ticket_token:string;created_at:string};
const brandCards=[
  {name:'Desi Dragon',slug:'desi-dragon',kind:'Food',description:'A new Indo-Chinese table is taking shape.'},
  {name:'Pearl & Leaf',slug:'pearl-and-leaf',kind:'Drinks',description:'Tea, coffee, and good company are on the way.'},
  {name:'Nature’s Bazaar',slug:'natures-bazaar',kind:'Shopping',description:'Fresh choices and everyday discoveries.'},
  {name:'Meridian Hill',slug:'meridian-hill',kind:'Events',description:'A gathering place for the moments that matter.'},
] as const;

function accountReturn(intent:string){return '/account?next='+encodeURIComponent('/app?'+intent)}
function localDate(value:string){return new Intl.DateTimeFormat('en-US',{dateStyle:'full',timeStyle:'short',timeZone:'America/New_York'}).format(new Date(value))}

export default function CustomerApp({url,keyValue}:{url:string;keyValue:string}){
  const client=useMemo(()=>customerClient(url,keyValue),[url,keyValue]);
  const [user,setUser]=useState<User|null>(null);
  const [events,setEvents]=useState<Event[]>([]);
  const [eventById,setEventById]=useState<Record<string,Event>>({});
  const [tickets,setTickets]=useState<Registration[]>([]);
  const [favorites,setFavorites]=useState<string[]>([]);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const intentHandled=useRef(false);
  const ticketHeading=useRef<HTMLHeadingElement>(null);

  const refresh=useCallback(async()=>{
    if(!client){setLoading(false);return}
    const {data:{user:currentUser}}=await client.auth.getUser();
    const {data:eventData,error:eventError}=await client.schema('os_api').from('customer_events')
      .select('id,slug,title,summary,starts_at,ends_at,location,capacity')
      .eq('status','published').gt('starts_at',new Date().toISOString()).order('starts_at');
    if(eventError)setMessage('Upcoming events could not be loaded. Please try again.');
    setEvents((eventData||[]) as Event[]);
    setUser(currentUser);
    if(currentUser){
      const [profileResult,ticketResult]=await Promise.all([
        client.schema('os_api').from('customer_profiles').select('favorite_brands').eq('user_id',currentUser.id).maybeSingle(),
        client.schema('os_api').from('customer_event_registrations').select('id,event_id,ticket_token,created_at').eq('user_id',currentUser.id).order('created_at',{ascending:false}),
      ]);
      if(profileResult.error||ticketResult.error)setMessage('Some of your account details could not be loaded. Please try again.');
      setFavorites(profileResult.data?.favorite_brands||[]);
      const registrations=(ticketResult.data||[]) as Registration[];
      setTickets(registrations);
      if(registrations.length){
        const {data:ticketEvents}=await client.schema('os_api').from('customer_events')
          .select('id,slug,title,summary,starts_at,ends_at,location,capacity').in('id',registrations.map(ticket=>ticket.event_id));
        setEventById(Object.fromEntries(((ticketEvents||[]) as Event[]).map(event=>[event.id,event])));
      }else setEventById({});
    }else{setFavorites([]);setTickets([]);setEventById({})}
    setLoading(false);
  },[client]);

  useEffect(()=>{
    void refresh();
    if(!client)return;
    const {data:{subscription}}=client.auth.onAuthStateChange(()=>{setTimeout(()=>{void refresh()},0)});
    return()=>subscription.unsubscribe();
  },[client,refresh]);

  const saveBrand=useCallback(async(name:string,currentUser:User)=>{
    if(!client||busy)return;
    setBusy(true);setMessage('');
    const next=favorites.includes(name)?favorites.filter(value=>value!==name):[...favorites,name];
    const {error}=await client.schema('os_api').from('customer_profiles').upsert({user_id:currentUser.id,favorite_brands:next,updated_at:new Date().toISOString()});
    if(error)setMessage('Could not save that brand. Please try again.');
    else{setFavorites(next);setMessage(next.includes(name)?`${name} saved to your account.`:`${name} removed from your saved brands.`)}
    setBusy(false);
  },[client,busy,favorites]);

  const claimTicket=useCallback(async(eventId:string,currentUser:User)=>{
    if(!client||busy)return;
    setBusy(true);setMessage('');
    const table=client.schema('os_api').from('customer_event_registrations');
    let {data:ticket,error}=await table.select('id,event_id,ticket_token,created_at').eq('event_id',eventId).eq('user_id',currentUser.id).maybeSingle();
    if(!error&&!ticket){
      const submitted=await table.insert({event_id:eventId,user_id:currentUser.id}).select('id,event_id,ticket_token,created_at').single();
      ticket=submitted.data;error=submitted.error;
      if(error){
        // An uncertain network result or a second tap may already have created the ticket.
        const existing=await table.select('id,event_id,ticket_token,created_at').eq('event_id',eventId).eq('user_id',currentUser.id).maybeSingle();
        if(existing.data){ticket=existing.data;error=null}
      }
    }
    if(error||!ticket){
      const reason=error?.message;
      setMessage(reason==='This event is full.'?'This event is full.':reason==='This event is not open for registration.'?'Registration for this event is closed.':'We could not confirm your ticket. Please try again.');
    }
    else{
      setTickets(current=>[ticket as Registration,...current.filter(item=>item.id!==ticket.id)]);
      const matching=events.find(event=>event.id===eventId);
      if(matching)setEventById(current=>({...current,[eventId]:matching}));
      setMessage('Your free ticket is ready and saved to your account.');
      setTimeout(()=>ticketHeading.current?.focus(),0);
    }
    setBusy(false);
  },[client,busy,events]);

  useEffect(()=>{
    if(loading||intentHandled.current||!client)return;
    const params=new URLSearchParams(location.search);
    const claim=params.get('claim');
    const save=params.get('save');
    if(!claim&&!save)return;
    intentHandled.current=true;
    const event=events.find(item=>item.id===claim);
    const brand=brandCards.find(item=>item.slug===save);
    if(!event&&!brand){setMessage('That action is no longer available.');return}
    if(!user){location.assign(accountReturn(claim?'claim='+encodeURIComponent(claim!):'save='+encodeURIComponent(save!)));return}
    if(event)void claimTicket(event.id,user);
    else if(brand&&!favorites.includes(brand.name))void saveBrand(brand.name,user);
    history.replaceState(null,'','/app');
  },[loading,client,user,events,favorites,claimTicket,saveBrand]);

  function onSave(slug:string,name:string){
    if(!user){location.assign(accountReturn('save='+encodeURIComponent(slug)));return}
    void saveBrand(name,user);
  }
  function onClaim(event:Event){
    if(!user){location.assign(accountReturn('claim='+encodeURIComponent(event.id)));return}
    void claimTicket(event.id,user);
  }

  return <main className="customer-app-page"><div className="customer-app-wrap">
    <header className="customer-app-header"><a href="/" aria-label="DM Plaza home"><img src="/bio/dm-plaza/logo.webp" alt="DM Plaza"/></a><nav aria-label="Customer"><a href="/app" aria-current="page">Explore</a><a href="/account">{user?'Account':'Sign in'}</a></nav></header>
    <section className="customer-app-hero"><p className="customer-app-eyebrow">YOUR PLAZA</p><h1>Find your next favorite.</h1><p>Explore what is taking shape in Jamaica, Queens. Browse freely; sign in when you want to save a brand or claim an event ticket.</p></section>
    {message&&<p className="customer-app-message" role="status">{message}</p>}
    {!client&&<p role="alert">Customer accounts and events are temporarily unavailable. You can still explore our brands below.</p>}
    <section className="customer-app-section" aria-labelledby="customer-brands"><div className="customer-app-heading"><h2 id="customer-brands">Explore the brands</h2>{user&&<span>{favorites.length} saved</span>}</div><div className="customer-brand-grid">{brandCards.map(brand=><article className="customer-brand-card" key={brand.slug}><img src={`/bio/${brand.slug}/hero.webp`} alt="" loading="lazy"/><div><span className="customer-app-eyebrow">{brand.kind}</span><h3>{brand.name}</h3><p>{brand.description}</p><div className="customer-brand-actions"><a href={`/${brand.slug}`}>Explore {brand.name} <span aria-hidden="true">↗</span></a>{client&&<button type="button" disabled={busy||loading} aria-pressed={favorites.includes(brand.name)} onClick={()=>onSave(brand.slug,brand.name)}>{favorites.includes(brand.name)?'Saved ✓':'Save for later'}</button>}</div></div></article>)}</div></section>
    <section className="customer-app-section" aria-labelledby="customer-events"><div className="customer-app-heading"><h2 id="customer-events">Upcoming free events</h2></div>{loading?<p role="status">Loading events…</p>:events.length?<div className="customer-event-list">{events.map(event=><article className="customer-event" key={event.id}><div><p className="customer-app-eyebrow">{localDate(event.starts_at)}</p><h3>{event.title}</h3><p>{event.summary}</p><p>{event.location}</p></div><button type="button" disabled={busy||tickets.some(ticket=>ticket.event_id===event.id)} onClick={()=>onClaim(event)}>{tickets.some(ticket=>ticket.event_id===event.id)?'Ticket saved':'Claim free ticket'}</button></article>)}</div>:<p className="customer-app-empty">No free events have been announced yet. This section will show dates and ticket details once they are confirmed.</p>}</section>
    {user&&<section className="customer-app-section" aria-labelledby="customer-tickets"><div className="customer-app-heading"><h2 ref={ticketHeading} tabIndex={-1} id="customer-tickets">Your tickets</h2></div>{tickets.length?<div className="customer-ticket-list">{tickets.map(ticket=>{const event=eventById[ticket.event_id];return <article className="customer-ticket" key={ticket.id}><div><p className="customer-app-eyebrow">FREE TICKET</p><h3>{event?.title||'DM Plaza event'}</h3>{event&&<p>{localDate(event.starts_at)} · {event.location}</p>}<p className="customer-ticket-code">Ticket ID: {ticket.id}</p></div><div className="customer-qr"><QRCodeSVG value={`DMPLAZA:TICKET:${ticket.ticket_token}`} size={168} title={`QR ticket for ${event?.title||'DM Plaza event'}`}/><span>Keep this code for event check-in.</span></div></article>})}</div>:<p className="customer-app-empty">Tickets you claim will appear here whenever you sign in.</p>}</section>}
    <footer className="customer-app-footer"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="mailto:info@dhanmondiplaza.com">Help</a></footer>
  </div></main>;
}
