'use client';

import {useEffect, useRef, useState} from 'react';
import {brands, languages, linkUrls, text, type BrandId, type Language} from './bio-data';
import './bio-page.css';

export default function BioPage({brandId, initialLanguage}: {brandId: BrandId; initialLanguage: Language}) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const menu = useRef<HTMLDetailsElement>(null);
  const brand = brands[brandId];
  const hasImage = 'image' in brand && brand.image;
  const t = (key: keyof typeof text) => text[key][language];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dm-language');
      if (languages.includes(saved as Language) && !new URL(location.href).searchParams.has('lang')) setLanguage(saved as Language);
    } catch { /* Language remains available for this visit. */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem('dm-language', language); } catch { /* Language remains available for this visit. */ }
    document.documentElement.lang = language;
  }, [language]);

  return <main className={`bio-page bio-${brandId}`} lang={language}>
    <a className="bio-skip" href="#bio-content">{t('skip')}</a>
    <div className="bio-shell">
      <nav className="bio-plaza-bar" aria-label="DM Plaza">
        <a href="/" className="bio-plaza-link"><img src="/brands/dm-plaza/logo.png" width="49" height="35" alt="DM Plaza"/><span>{t('brand')}</span></a>
        <details ref={menu} className="bio-menu"><summary aria-label={t('menu')}>☰ <span>{t('menu')}</span></summary>
          <div className="bio-menu-panel"><strong>{t('language')}</strong>
            {([['en','English'],['bn','বাংলা'],['es','Español'],['zh-CN','中文']] as const).map(([code,label]) => <button key={code} type="button" aria-pressed={language===code} onClick={() => {setLanguage(code); menu.current?.removeAttribute('open')}}>{label}{language===code&&<span aria-hidden="true"> ✓</span>}</button>)}
          </div>
        </details>
      </nav>
      <header className={`bio-hero ${hasImage ? 'has-image' : ''}`} style={hasImage ? {backgroundImage: `linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,.79)),url(/bio/${brandId}/hero.webp)`} : undefined}>
        <img className="bio-logo" src={`/bio/${brandId}/logo.webp`} width="330" height="170" fetchPriority="high" alt={`${brand.name} logo`}/>
        <h1>{brand.name}</h1><p className="bio-tag">{brand.tag[language]}</p><p className="bio-opening">{t('opening')}</p>
      </header>
      <section id="bio-content" className="bio-content" aria-label={brand.name}>
        <p className="bio-intro">{t('note')}</p>
        {brandId==='top-level-urgent-care'&&<p className="bio-care">{t('care')}</p>}
        <nav className="bio-links" aria-label={brand.name}>
          {brand.links.map((key, index) => <a key={key} className={index===0 ? 'bio-primary' : ''} href={linkUrls[key]}><span>{t(key)}</span><span aria-hidden="true">↗</span></a>)}
        </nav>
        <footer className="bio-footer">
          {hasImage&&<p>{t('concept')}</p>}
          <a href="/">DM Plaza</a><span aria-hidden="true">·</span><a href="/privacy">{t('privacy')}</a>
        </footer>
      </section>
    </div>
  </main>;
}
