'use client';

import {useState,type FormEvent} from 'react';

const copy={
  en:{title:'Get opening updates',intro:'Choose how you would like to hear from Nature’s Bazaar.',first:'First name',last:'Last name',email:'Email address',phone:'Mobile number for text updates',emailConsent:'Email me Nature’s Bazaar opening and market updates. I can unsubscribe at any time.',smsConsent:'Text me recurring Nature’s Bazaar opening and market updates. Frequency varies; message and data rates may apply. Consent is optional and is not a condition of purchase. Reply STOP to opt out or HELP for help.',privacy:'Read our privacy notice.',submit:'Keep me posted',sending:'Sending…',success:'Thanks! We’ll keep you posted through your chosen channel.',error:'We could not confirm your signup. Please try again later.',choice:'Choose at least one update channel.',phoneError:'Enter a mobile number to receive texts.'},
  bn:{title:'খোলার খবর পান',intro:'Nature’s Bazaar-এর খবর কীভাবে পেতে চান তা বেছে নিন।',first:'নামের প্রথম অংশ',last:'নামের শেষ অংশ',email:'ইমেইল ঠিকানা',phone:'এসএমএসের জন্য মোবাইল নম্বর',emailConsent:'Nature’s Bazaar-এর খোলার ও বাজারের খবর ইমেইলে পাঠান। যেকোনো সময় বন্ধ করতে পারব।',smsConsent:'Nature’s Bazaar-এর খোলার ও বাজারের নিয়মিত খবর এসএমএসে পাঠান। বার্তার সংখ্যা পরিবর্তিত হতে পারে; বার্তা ও ডেটা চার্জ প্রযোজ্য হতে পারে। সম্মতি ঐচ্ছিক এবং কেনাকাটার শর্ত নয়। বন্ধ করতে STOP, সহায়তার জন্য HELP লিখুন।',privacy:'গোপনীয়তা নীতি পড়ুন।',submit:'আমাকে খবর দিন',sending:'পাঠানো হচ্ছে…',success:'ধন্যবাদ! আপনার নির্বাচিত মাধ্যমে আমরা খবর পাঠাব।',error:'নিবন্ধন নিশ্চিত করা যায়নি। পরে আবার চেষ্টা করুন।',choice:'অন্তত একটি মাধ্যম বেছে নিন।',phoneError:'এসএমএস পেতে একটি মোবাইল নম্বর দিন।'},
  es:{title:'Recibe novedades de apertura',intro:'Elige cómo quieres recibir noticias de Nature’s Bazaar.',first:'Nombre',last:'Apellido',email:'Correo electrónico',phone:'Número móvil para mensajes de texto',emailConsent:'Quiero recibir por correo novedades de apertura y del mercado. Puedo cancelar la suscripción en cualquier momento.',smsConsent:'Quiero recibir mensajes recurrentes sobre Nature’s Bazaar. La frecuencia varía; pueden aplicarse cargos de mensajes y datos. El consentimiento es opcional y no es condición de compra. Responde STOP para cancelar o HELP para recibir ayuda.',privacy:'Lee nuestro aviso de privacidad.',submit:'Mantenerme al tanto',sending:'Enviando…',success:'¡Gracias! Te informaremos por el canal que elegiste.',error:'No pudimos confirmar tu registro. Inténtalo más tarde.',choice:'Elige al menos un canal.',phoneError:'Ingresa un número móvil para recibir mensajes.'},
  'zh-CN':{title:'获取开业消息',intro:'选择您希望接收 Nature’s Bazaar 消息的方式。',first:'名',last:'姓',email:'电子邮箱',phone:'接收短信的手机号码',emailConsent:'通过邮件接收 Nature’s Bazaar 开业和市场消息。我可以随时退订。',smsConsent:'通过短信定期接收 Nature’s Bazaar 消息。发送频率不固定，可能产生短信和数据费用。是否同意为自愿选择，不影响购买。回复 STOP 退订，回复 HELP 获取帮助。',privacy:'阅读隐私声明。',submit:'通知我',sending:'发送中…',success:'谢谢！我们会通过您选择的方式发送消息。',error:'暂时无法确认订阅，请稍后重试。',choice:'请至少选择一种通知方式。',phoneError:'请输入手机号码以接收短信。'}
} as const;

export default function BazaarSignup({lang}:{lang:keyof typeof copy}){
  const t=copy[lang];
  const [pending,setPending]=useState(false),[done,setDone]=useState(false),[error,setError]=useState('');
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const form=event.currentTarget,data=new FormData(form);
    const emailConsent=data.has('email_consent'),smsConsent=data.has('sms_consent');
    if(!emailConsent&&!smsConsent){setError(t.choice);return}
    if(smsConsent&&!String(data.get('phone')||'').trim()){setError(t.phoneError);return}
    setPending(true);setError('');
    try{
      const response=await fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        first_name:data.get('first_name'),last_name:data.get('last_name'),email:data.get('email'),phone:data.get('phone'),
        email_consent:emailConsent?'yes':'no',sms_consent:smsConsent?'yes':'no',website:data.get('website'),page_url:location.href
      })});
      if(!response.ok)throw new Error('Signup failed');
      setDone(true);form.reset();
    }catch{setError(t.error)}finally{setPending(false)}
  }
  return <section id="opening-updates" className="microsite-section microsite-signup"><div><p className="microsite-eyebrow">Nature’s Bazaar</p><h2>{t.title}</h2><p className="microsite-muted">{t.intro}</p></div><div>{done?<p className="microsite-signup-success" role="status">{t.success}</p>:<form onSubmit={submit}>
    <div className="microsite-signup-names"><label>{t.first} <span aria-hidden="true">*</span><input name="first_name" autoComplete="given-name" required maxLength={80}/></label><label>{t.last}<input name="last_name" autoComplete="family-name" maxLength={80}/></label></div>
    <label>{t.email} <span aria-hidden="true">*</span><input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
    <label>{t.phone}<input name="phone" type="tel" autoComplete="tel" maxLength={30}/></label>
    <label className="microsite-signup-check"><input name="email_consent" type="checkbox"/>{t.emailConsent}</label>
    <label className="microsite-signup-check"><input name="sms_consent" type="checkbox"/>{t.smsConsent}</label>
    <div className="microsite-signup-trap" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    <a href="/privacy">{t.privacy}</a>
    {error&&<p role="alert" className="microsite-signup-error">{error}</p>}
    <button type="submit" disabled={pending}>{pending?t.sending:t.submit}</button>
  </form>}</div></section>;
}
