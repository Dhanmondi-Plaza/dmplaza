'use client';

import {useEffect, useState} from 'react';
import {brands, languages, linkUrls, text, type BrandId, type Language} from './bio-data';
import './bio-page.css';

export default function BioPage({brandId, initialLanguage}: {brandId: BrandId; initialLanguage: Language}) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const brand = brands[brandId];
  const hasImage = 'image' in brand && brand.image;
  const hasMicrosite = ['desi-dragon','pearl-and-leaf','natures-bazaar','meridian-hill'].includes(brandId);
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
      <nav className="bio-plaza-bar" aria-label="Dhanmondi Plaza">
        <a href="/" className="bio-plaza-link">Dhanmondi Plaza</a>
        <div className="bio-language">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.4 3.6 5.4 3.6 9S14.4 18.6 12 21c-2.4-2.4-3.6-5.4-3.6-9S9.6 5.4 12 3Z"/></svg>
          <select aria-label={t('language')} value={language} onChange={event => setLanguage(event.target.value as Language)}>
            <option value="en">English</option><option value="bn">বাংলা</option><option value="es">Español</option><option value="zh-CN">中文</option>
          </select>
        </div>
      </nav>
      <header className={`bio-hero ${hasImage ? 'has-image' : ''}`} style={hasImage ? {backgroundImage: `linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,.79)),url(/bio/${brandId}/hero.webp)`} : undefined}>
        <img className="bio-logo" src={`/bio/${brandId}/logo.webp`} width="330" height="170" fetchPriority="high" alt=""/>
        <h1 className="bio-sr-only">{brandId==='dm-plaza' ? 'Dhanmondi Plaza' : brand.name}</h1><p className="bio-tag">{brand.tag[language]}</p><p className="bio-opening">{t('opening')}</p>
      </header>
      <section id="bio-content" className="bio-content" aria-label={brand.name}>
        <p className="bio-intro">{t('note')}</p>
        {brandId==='top-level-urgent-care'&&<p className="bio-care">{t('care')}</p>}
        <nav className="bio-links" aria-label={brand.name}>
          {brand.links.map((key, index) => <a key={key} className={index===0 ? 'bio-primary' : ''} href={key==='explore'&&hasMicrosite?`/${brandId}?lang=${language}`:linkUrls[key]}><span>{key==='explore'&&hasMicrosite?t('microsite'):t(key)}</span><span aria-hidden="true">↗</span></a>)}
        </nav>
        <footer className="bio-footer">
          {hasImage&&<p>{t('concept')}</p>}
          <a href="/">DM Plaza</a><span aria-hidden="true">·</span><a href="/privacy">{t('privacy')}</a>
        </footer>
      </section>
    </div>
  </main>;
}
