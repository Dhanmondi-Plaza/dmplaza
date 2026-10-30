'use client';

import {useEffect,useMemo,useState,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {type User} from '@supabase/supabase-js';
import {customerClient} from './customer-supabase';
import {CustomerNavigation,CustomerShellHeader} from './customer-shell';
import './customer-account.css';

const brands=['Desi Dragon','Pearl & Leaf','Nature’s Bazaar','Meridian Hill','Top-Level Urgent Care'] as const;
export default function Account({url,keyValue,next}:{url:string;keyValue:string;next?:string}){
  const router=useRouter();
  const client=useMemo(()=>customerClient(url,keyValue),[url,keyValue]);
  const [user,setUser]=useState<User|null>(null);
  const [email,setEmail]=useState('');
  const [code,setCode]=useState('');
  const [codeSent,setCodeSent]=useState(false);
  const [resendAfter,setResendAfter]=useState(0);
  const [resendSeconds,setResendSeconds]=useState(0);
  const [favorites,setFavorites]=useState<string[]>([]);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');

  useEffect(()=>{
    if(!client){setLoading(false);return}
    let active=true;
    const refresh=async()=>{
      const {data:{user},error}=await client.auth.getUser();
      if(!active)return;
      if(error||!user){setUser(null);setFavorites([]);setLoading(false);return}
      setUser(user);
      if(next){setLoading(false);router.replace(next);return}
      const {data,error:profileError}=await client.schema('os_api').from('customer_profiles').select('favorite_brands').eq('user_id',user.id).maybeSingle();
      if(!active)return;
      if(profileError)setMessage('Your saved brands could not be loaded. Please try again.');
      else {setFavorites(data?.favorite_brands||[]);setMessage('')}
      setLoading(false);
    };
    void refresh();
    // Avoid calling another Auth method inside the Auth callback's lock.
    const {data:{subscription}}=client.auth.onAuthStateChange(()=>{setTimeout(()=>{void refresh()},0)});
    return()=>{active=false;subscription.unsubscribe()};
  },[client,next,router]);

  useEffect(()=>{
    if(!resendAfter)return;
    const update=()=>setResendSeconds(Math.max(0,Math.ceil((resendAfter-Date.now())/1000)));
    update();const timer=setInterval(update,1000);return()=>clearInterval(timer);
  },[resendAfter]);

  async function signIn(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(!client||busy||Date.now()<resendAfter)return;
    setBusy(true);setMessage('');
    const {error}=await client.auth.signInWithOtp({email:email.trim()});
    if(!error){setCodeSent(true);setResendAfter(Date.now()+60_000)}
    setMessage(error?error.message:'Check your email for your one-time sign-in code.');setBusy(false);
  }

  async function verify(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(!client||busy)return;
    setBusy(true);setMessage('');
    const {error}=await client.auth.verifyOtp({email:email.trim(),token:code.trim(),type:'email'});
    setMessage(error?error.message:next?'Signed in. Returning to your activity…':'Signed in. Loading your choices…');setBusy(false);
    if(!error&&next)router.replace(next);
  }

  async function save(){
    if(!client||!user||busy)return;
    setBusy(true);setMessage('');
    const {error}=await client.schema('os_api').from('customer_profiles').upsert({user_id:user.id,favorite_brands:favorites,updated_at:new Date().toISOString()});
    setMessage(error?'Could not save your choices. Please try again.':'Your favorite brands were saved.');setBusy(false);
  }

  async function signOut(){
    if(!client)return;
    setBusy(true);const {error}=await client.auth.signOut();
    if(error)setMessage('Could not sign out. Please try again.');
    else{setUser(null);setFavorites([]);setEmail('');setCode('');setCodeSent(false);setResendAfter(0);setMessage('Signed out.')}setBusy(false);
  }

  return <main className="account-page"><div className="account-wrap">
    <CustomerShellHeader/>
    <section className="account-card" aria-labelledby="account-title">
      <h1 id="account-title">{next?'Continue with DM Plaza':'Your account'}</h1>
      {loading?<p role="status">Loading your account…</p>:!client?<p role="alert">Accounts are temporarily unavailable. Please try again later.</p>:user?<>
        <p>Signed in as <strong>{user.email}</strong></p>
        <h2>Brands you want to follow</h2><p>Save your interests so they are ready when more DM Plaza experiences open. This does not subscribe you to marketing messages.</p>
        <div className="account-choices">{brands.map(brand=><label key={brand}><input type="checkbox" checked={favorites.includes(brand)} onChange={event=>setFavorites(current=>event.target.checked?[...current,brand]:current.filter(value=>value!==brand))}/><span>{brand}</span></label>)}</div>
        <div className="account-actions"><button onClick={save} disabled={busy}>{busy?'Working…':'Save choices'}</button><button className="account-quiet" onClick={signOut} disabled={busy}>Sign out</button></div>
      </>:codeSent?<><p>Enter the one-time code sent to <strong>{email.trim()}</strong>.</p>
        <form onSubmit={verify}><label htmlFor="account-code">Sign-in code</label><input id="account-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" minLength={6} maxLength={8} required value={code} onChange={event=>setCode(event.target.value)}/><button disabled={busy}>{busy?'Checking…':'Sign in'}</button></form>
        <button className="account-link-button" type="button" onClick={()=>{setCode('');setCodeSent(false);setMessage('')}}>Use another email</button>
        <button className="account-link-button" type="button" disabled={busy||resendSeconds>0} onClick={()=>{setCode('');setCodeSent(false);setMessage('')}}>{resendSeconds>0?`Request another code in ${resendSeconds}s`:'Request another code'}</button>
      </>:<><p>{next?'Sign in to continue where you left off. We’ll email you a one-time code; no password is needed.':'Sign in to save the DM Plaza brands you care about. We’ll email you a one-time code; no password is needed.'}</p>
        <form onSubmit={signIn}><label htmlFor="account-email">Email address</label><input id="account-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event=>setEmail(event.target.value)}/><button disabled={busy||resendSeconds>0}>{busy?'Sending…':resendSeconds>0?`Try again in ${resendSeconds}s`:'Send sign-in code'}</button></form>
        <p className="account-small">Creating an account does not sign you up for marketing. By continuing, you agree to our <a href="/terms">website terms</a> and <a href="/privacy">privacy notice</a>.</p>
      </>}
      {message&&<p role="status" className="account-message">{message}</p>}
    </section><footer className="account-footer"><a href="/privacy">Privacy & cookies</a><a href="mailto:info@dhanmondiplaza.com">Account help</a></footer>
  </div><CustomerNavigation active="account"/></main>
}
