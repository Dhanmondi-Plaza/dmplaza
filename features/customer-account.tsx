'use client';

import {useEffect,useMemo,useState,type FormEvent} from 'react';
import {createClient,type SupabaseClient,type User} from '@supabase/supabase-js';
import {normalizePhone,safeReturnTo} from './customer-auth';
import './customer-account.css';

const brands=['Desi Dragon','Pearl & Leaf','Nature’s Bazaar','Meridian Hill','Top-Level Urgent Care'] as const;
let sharedClient:{url:string;keyValue:string;client:SupabaseClient}|undefined;

export default function Account({url,keyValue,appleEnabled,googleEnabled,smsEnabled,linkingEnabled}:{url:string;keyValue:string;appleEnabled:boolean;googleEnabled:boolean;smsEnabled:boolean;linkingEnabled:boolean}){
  const client=useMemo(()=>{
    if(!url||!keyValue)return null;
    if(!sharedClient||sharedClient.url!==url||sharedClient.keyValue!==keyValue)
      sharedClient={url,keyValue,client:createClient(url,keyValue,{auth:{persistSession:true,autoRefreshToken:true}})};
    return sharedClient.client;
  },[url,keyValue]);
  const [user,setUser]=useState<User|null>(null);
  const [email,setEmail]=useState('');
  const [phone,setPhone]=useState('');
  const [method,setMethod]=useState<'email'|'phone'>('email');
  const [code,setCode]=useState('');
  const [codeSent,setCodeSent]=useState(false);
  const [favorites,setFavorites]=useState<string[]>([]);
  const [displayName,setDisplayName]=useState('');
  const [consents,setConsents]=useState({email:false,sms:false});
  const [deletionPending,setDeletionPending]=useState(false);
  const [cooldown,setCooldown]=useState(0);
  const [attempts,setAttempts]=useState(0);
  const [returnTo,setReturnTo]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');

  useEffect(()=>{setReturnTo(safeReturnTo(new URLSearchParams(window.location.search).get('next')))},[]);
  useEffect(()=>{if(!cooldown)return;const timer=window.setInterval(()=>setCooldown(value=>Math.max(0,value-1)),1000);return()=>window.clearInterval(timer)},[cooldown>0]);
  useEffect(()=>{if(user&&returnTo)window.location.assign(returnTo)},[user,returnTo]);

  useEffect(()=>{
    if(!client){setLoading(false);return}
    let active=true;
    const refresh=async()=>{
      const {data:{user},error}=await client.auth.getUser();
      if(!active)return;
      if(error||!user){setUser(null);setFavorites([]);setLoading(false);return}
      setUser(user);
      const [profile,emailConsent,smsConsent,deletion]=await Promise.all([
        client.schema('os_api').from('customer_profiles').select('favorite_brands,display_name').eq('user_id',user.id).maybeSingle(),
        client.schema('os_api').from('customer_marketing_consents').select('consented').eq('customer_id',user.id).eq('channel','email').order('created_at',{ascending:false}).limit(1),
        client.schema('os_api').from('customer_marketing_consents').select('consented').eq('customer_id',user.id).eq('channel','sms').order('created_at',{ascending:false}).limit(1),
        client.schema('os_api').from('customer_deletion_requests').select('id').eq('customer_id',user.id).in('status',['pending','processing']).limit(1)
      ]);
      if(!active)return;
      if(profile.error)setMessage('Your account details could not be loaded. Please try again.');
      else {setFavorites(profile.data?.favorite_brands||[]);setDisplayName(profile.data?.display_name||'')}
      if(!emailConsent.error&&!smsConsent.error)setConsents({email:emailConsent.data?.[0]?.consented||false,sms:smsConsent.data?.[0]?.consented||false});
      if(!deletion.error)setDeletionPending(Boolean(deletion.data?.length));
      setLoading(false);
    };
    void refresh();
    // Avoid calling another Auth method inside the Auth callback's lock.
    const {data:{subscription}}=client.auth.onAuthStateChange(()=>{setTimeout(()=>{void refresh()},0)});
    return()=>{active=false;subscription.unsubscribe()};
  },[client]);

  async function signIn(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(!client||busy||cooldown)return;
    const normalized=method==='phone'?normalizePhone(phone):null;
    if(method==='phone'&&!normalized){setMessage('Enter a valid phone number, including country code outside the US.');return}
    setBusy(true);setMessage('');
    const {error}=method==='email'?await client.auth.signInWithOtp({email:email.trim()}):await client.auth.signInWithOtp({phone:normalized!});
    if(!error){if(normalized)setPhone(normalized);setCodeSent(true);setCooldown(60);setAttempts(0)}
    setMessage(error?error.message:`Check your ${method==='email'?'email':'text messages'} for a six-digit code.`);setBusy(false);
  }

  async function verify(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(!client||busy||attempts>=5)return;
    setBusy(true);setMessage('');
    const {error}=method==='email'?await client.auth.verifyOtp({email:email.trim(),token:code.trim(),type:'email'}):await client.auth.verifyOtp({phone,token:code.trim(),type:'sms'});
    if(error){setAttempts(value=>value+1);setMessage(attempts>=4?'Too many attempts. Request a new code.':error.message)}
    else{setMessage('Signed in. Loading your account…');setCode('');setCodeSent(false);const {data}=await client.auth.getUser();if(data.user)setUser(data.user)}
    setBusy(false);
  }

  async function social(provider:'apple'|'google',link=false){
    if(!client||busy)return;
    setBusy(true);setMessage('');
    const redirectTo=`${window.location.origin}/account${window.location.search}`;
    const {error}=link?await client.auth.linkIdentity({provider,options:{redirectTo}}):await client.auth.signInWithOAuth({provider,options:{redirectTo}});
    if(error){setMessage(error.message);setBusy(false)}
  }

  async function save(){
    if(!client||!user||busy)return;
    setBusy(true);setMessage('');
    const name=displayName.trim();
    if(name.length>100){setBusy(false);setMessage('Display name must be 100 characters or less.');return}
    const {error}=await client.schema('os_api').from('customer_profiles').upsert({user_id:user.id,favorite_brands:favorites,display_name:name||null,updated_at:new Date().toISOString()});
    setMessage(error?'Could not save your account details. Please try again.':'Your account details were saved.');setBusy(false);
  }

  async function setMarketing(channel:'email'|'sms',consented:boolean){
    if(!client||!user||busy)return;
    setBusy(true);setMessage('');
    const {error}=await client.schema('os_api').from('customer_marketing_consents').insert({customer_id:user.id,channel,consented,notice_version:'2026-10-21'});
    if(error)setMessage('Your preference could not be saved. Please try again.');
    else{setConsents(current=>({...current,[channel]:consented}));setMessage('Communication preference saved.')}
    setBusy(false);
  }

  async function requestDeletion(){
    if(!client||!user||busy||deletionPending||!window.confirm('Request deletion of your DM Plaza customer account? Our team will review the request and contact you about any records we must retain.'))return;
    setBusy(true);setMessage('');
    const {error}=await client.schema('os_api').from('customer_deletion_requests').insert({customer_id:user.id});
    if(error)setMessage('Could not submit the request. Contact info@dhanmondiplaza.com.');
    else{setDeletionPending(true);setMessage('Deletion request received. Your account is not deleted immediately.')}
    setBusy(false);
  }

  async function signOut(){
    if(!client)return;
    setBusy(true);const {error}=await client.auth.signOut();
    if(error)setMessage('Could not sign out. Please try again.');
    else{setUser(null);setFavorites([]);setEmail('');setCode('');setCodeSent(false);setMessage('Signed out.')}setBusy(false);
  }

  const connected=new Set(user?.identities?.map(identity=>identity.provider)||[]);
  const codeForm=<><p>Enter the code sent to <strong>{method==='email'?email.trim():phone}</strong>.</p>
    <form onSubmit={verify}><label htmlFor="account-code">Six-digit verification code</label><input id="account-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required value={code} onChange={event=>setCode(event.target.value)}/><button disabled={busy||attempts>=5}>{busy?'Checking…':'Verify and continue'}</button></form>
    <div className="account-actions"><button className="account-link-button" type="button" disabled={busy||cooldown>0} onClick={()=>{setCodeSent(false);setCode('');setAttempts(0)}}>{cooldown?`Resend available in ${cooldown}s`:'Request a new code'}</button><button className="account-link-button" type="button" onClick={()=>{setCodeSent(false);setCode('');setAttempts(0)}}>Correct {method==='email'?'email':'phone number'}</button></div></>;
  return <main className="account-page"><div className="account-wrap">
    <header className="account-header"><a href="/" aria-label="DM Plaza home"><img src="/brands/dm-plaza/logo.png" alt="DM Plaza"/></a></header>
    <section className="account-card" aria-labelledby="account-title">
      <h1 id="account-title">{user?'Your DM Plaza account':'Welcome to DM Plaza'}</h1>
      {loading?<p role="status">Loading your account…</p>:!client?<p role="alert">Accounts are temporarily unavailable. Please try again later.</p>:user?<>
        <p>One account across DM Plaza. Signed in as <strong>{user.email||user.phone||'customer'}</strong>.</p>
        <h2>Account details</h2><label htmlFor="account-name">Display name</label><input id="account-name" type="text" autoComplete="name" maxLength={100} value={displayName} onChange={event=>setDisplayName(event.target.value)}/>
        <p className="account-small">Verified email: {user.email_confirmed_at?user.email:'None'}<br/>Verified phone: {user.phone_confirmed_at?user.phone:'None'}</p>
        <h2>Brands you want to follow</h2><p>Save your interests for future DM Plaza experiences. This does not subscribe you to marketing.</p>
        <div className="account-choices">{brands.map(brand=><label key={brand}><input type="checkbox" checked={favorites.includes(brand)} onChange={event=>setFavorites(current=>event.target.checked?[...current,brand]:current.filter(value=>value!==brand))}/><span>{brand}</span></label>)}</div>
        <button onClick={save} disabled={busy}>{busy?'Working…':'Save account details'}</button>
        <h2>Sign-in methods</h2><p className="account-small">Connected: {[...connected].join(', ')||'email or phone'}. Additional methods will appear here after secure linking is available. Accounts are never merged automatically.</p>
        <div className="account-actions">{linkingEnabled&&appleEnabled&&!connected.has('apple')&&<button className="account-quiet" onClick={()=>social('apple',true)} disabled={busy}>Link Apple</button>}{linkingEnabled&&googleEnabled&&!connected.has('google')&&<button className="account-quiet" onClick={()=>social('google',true)} disabled={busy}>Link Google</button>}</div>
        {!user.phone_confirmed_at&&<p className="account-small">Adding a phone sign-in method will be available after secure linking is verified. Your existing account ID will stay the same.</p>}
        <h2>Communication preferences</h2><p className="account-small">Promotional messages are optional. Sign-in codes and transaction notices are separate. These account preferences do not enroll you in the separate opening-updates list.</p>
        <div className="account-preferences"><label><input type="checkbox" checked={consents.email} disabled={busy||!user.email_confirmed_at} onChange={event=>void setMarketing('email',event.target.checked)}/> Email updates</label><label><input type="checkbox" checked={consents.sms} disabled={busy||!user.phone_confirmed_at} onChange={event=>void setMarketing('sms',event.target.checked)}/> Text updates</label></div>
        <h2>Account controls</h2><div className="account-actions"><button className="account-quiet" onClick={signOut} disabled={busy}>Sign out</button><button className="account-quiet" onClick={requestDeletion} disabled={busy||deletionPending}>{deletionPending?'Deletion request pending':'Request account deletion'}</button></div>
      </>:codeSent?codeForm:<><p>One account. All your favorite places.</p>
        {(appleEnabled||googleEnabled||smsEnabled)&&<div className="account-methods">{appleEnabled&&<button type="button" disabled={busy} onClick={()=>social('apple')}>Continue with Apple</button>}{googleEnabled&&<button type="button" disabled={busy} onClick={()=>social('google')}>Continue with Google</button>}{smsEnabled&&<button type="button" disabled={busy} onClick={()=>{setMethod('phone');setMessage('')}}>Continue with Phone</button>}<button type="button" onClick={()=>{setMethod('email');setMessage('')}}>Continue with Email</button></div>}
        <form onSubmit={signIn}><label htmlFor="account-contact">{method==='email'?'Email address':'Phone number'}</label><input id="account-contact" type={method==='email'?'email':'tel'} autoComplete={method==='email'?'email':'tel'} required maxLength={method==='email'?254:24} value={method==='email'?email:phone} onChange={event=>method==='email'?setEmail(event.target.value):setPhone(event.target.value)}/><button disabled={busy||cooldown>0}>{busy?'Sending…':cooldown?`Try again in ${cooldown}s`:'Send sign-in code'}</button></form>
        <p className="account-small">Sign-in does not subscribe you to marketing. By continuing, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.</p>
      </>}
      {message&&<p role="status" className="account-message">{message}</p>}
    </section><footer className="account-footer"><a href="/privacy">Privacy & cookies</a><a href="mailto:info@dhanmondiplaza.com">Account help</a></footer>
  </div></main>
}
