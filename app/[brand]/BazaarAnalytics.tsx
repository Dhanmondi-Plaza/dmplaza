'use client';

import {useEffect,useState} from 'react';

const key='dm-analytics-choice';
const measurementId='G-3DYCBN8V1F';
const copy={
  en:{settings:'Cookie settings',title:'Your privacy choices',description:'With your permission, Google Analytics helps us understand visits to Nature’s Bazaar.',privacy:'Privacy & cookies',reject:'Reject analytics',accept:'Allow analytics'},
  bn:{settings:'কুকি সেটিংস',title:'আপনার গোপনীয়তার পছন্দ',description:'আপনার অনুমতি পেলে Google Analytics দিয়ে Nature’s Bazaar-এর ভিজিট সম্পর্কে জানতে পারি।',privacy:'গোপনীয়তা ও কুকিজ',reject:'অ্যানালিটিক্স প্রত্যাখ্যান',accept:'অ্যানালিটিক্স অনুমোদন'},
  es:{settings:'Configurar cookies',title:'Tus opciones de privacidad',description:'Con tu permiso, Google Analytics nos ayuda a conocer las visitas a Nature’s Bazaar.',privacy:'Privacidad y cookies',reject:'Rechazar analíticas',accept:'Permitir analíticas'},
  'zh-CN':{settings:'Cookie 设置',title:'您的隐私选择',description:'经您同意后，我们使用 Google Analytics 了解 Nature’s Bazaar 的访问情况。',privacy:'隐私与 Cookie',reject:'拒绝分析',accept:'允许分析'}
} as const;

function savedChoice(){
  try{
    const saved=JSON.parse(localStorage.getItem(key)||'null');
    return saved&&Date.now()-saved.at<180*86400000&&['accepted','declined'].includes(saved.value)?saved.value:null;
  }catch{return null}
}

function startAnalytics(){
  if(document.getElementById('bazaar-google-analytics'))return;
  const analyticsWindow=window as Window & {dataLayer?:unknown[];gtag?:(...args:unknown[])=>void};
  analyticsWindow.dataLayer=analyticsWindow.dataLayer||[];
  analyticsWindow.gtag=function(){analyticsWindow.dataLayer?.push(arguments)};
  analyticsWindow.gtag('js',new Date());
  analyticsWindow.gtag('config',measurementId);
  const script=document.createElement('script');
  script.id='bazaar-google-analytics';
  script.async=true;
  script.src=`https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

export default function BazaarAnalytics({lang}:{lang:keyof typeof copy}){
  const t=copy[lang];
  const [open,setOpen]=useState(false);
  useEffect(()=>{
    const choice=savedChoice();
    if(choice==='accepted')startAnalytics();
    else if(!choice)setOpen(true);
  },[]);
  function save(value:'accepted'|'declined'){
    const wasRunning=Boolean(document.getElementById('bazaar-google-analytics'));
    try{localStorage.setItem(key,JSON.stringify({value,at:Date.now()}))}catch{}
    setOpen(false);
    if(value==='accepted')startAnalytics();
    else if(wasRunning){
      document.cookie.split(';').forEach(part=>{
        const name=part.trim().split('=')[0];
        if(name==='_ga'||name.startsWith('_ga_')){
          document.cookie=`${name}=; Max-Age=0; Path=/`;
          document.cookie=`${name}=; Max-Age=0; Path=/; Domain=.dhanmondiplaza.com`;
        }
      });
      location.reload();
    }
  }
  return <>
    <button className="microsite-cookie-settings" type="button" onClick={()=>setOpen(true)}>{t.settings}</button>
    {open&&<section className="microsite-cookie-choice" aria-labelledby="bazaar-cookie-title">
      <h2 id="bazaar-cookie-title">{t.title}</h2>
      <p>{t.description} <a href="/privacy#cookies">{t.privacy}</a></p>
      <div><button type="button" onClick={()=>save('declined')}>{t.reject}</button><button type="button" onClick={()=>save('accepted')}>{t.accept}</button></div>
    </section>}
  </>;
}
