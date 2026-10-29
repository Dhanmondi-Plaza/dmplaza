import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import './microsite.css';
import BazaarSignup from './BazaarSignup';
import BazaarAnalytics from './BazaarAnalytics';

const languages=['en','bn','es','zh-CN'] as const;
type Language=typeof languages[number];
type Copy={headline:string;intro:string;offerTitle:string;offers:string[];statusTitle:string;status:string;contact:string;secondary:string;};
type Site={name:string;emailSubject:string;copy:Record<Language,Copy>};

const sites={
  'desi-dragon':{
    name:'Desi Dragon',emailSubject:'Desi Dragon opening updates',
    copy:{
      en:{headline:'A bold new table is taking shape.',intro:'Desi Dragon is our planned Indo-Chinese restaurant with Bangladeshi roots. Expect a lively cellar setting, expressive flavors, and meals made for gathering. The chef, final menu, and opening date are still being confirmed.',offerTitle:'What we are building',offers:['A full-service dining experience','Indian and Chinese culinary influences','A place for family meals, friends, and celebrations'],statusTitle:'Before we open',status:'Kitchen development, hiring, and menu testing are underway. The food shown is concept imagery, not a confirmed dish or final menu.',contact:'Ask for opening updates by email',secondary:'See open roles'},
      bn:{headline:'নতুন স্বাদের এক আড্ডাখানা তৈরি হচ্ছে।',intro:'Desi Dragon হলো আমাদের পরিকল্পিত ইন্দো-চাইনিজ রেস্তোরাঁ, যার শিকড় বাংলাদেশি খাবারের ঐতিহ্যে। প্রাণবন্ত নিচতলার পরিবেশ, বৈচিত্র্যময় স্বাদ এবং একসঙ্গে খাওয়ার আনন্দের পরিকল্পনা চলছে। শেফ, চূড়ান্ত মেনু ও খোলার তারিখ এখনও নিশ্চিত নয়।',offerTitle:'আমরা যা গড়ছি',offers:['পূর্ণ সেবার রেস্তোরাঁ','ভারতীয় ও চীনা রান্নার প্রভাব','পরিবার, বন্ধু ও উদ্‌যাপনের জন্য মিলনস্থল'],statusTitle:'খোলার আগে',status:'রান্নাঘর তৈরি, নিয়োগ ও মেনু পরীক্ষার কাজ চলছে। দেখানো খাবার ধারণামূলক; এটি নিশ্চিত পদ বা চূড়ান্ত মেনু নয়।',contact:'ইমেইলে খোলার খবর জানতে চান',secondary:'চাকরির সুযোগ দেখুন'},
      es:{headline:'Una mesa llena de sabor está tomando forma.',intro:'Desi Dragon es nuestro restaurante indo-chino planeado, con raíces bangladesíes. Imaginamos un espacio animado en el nivel inferior, sabores expresivos y comidas para compartir. El chef, el menú final y la fecha de apertura aún están por confirmarse.',offerTitle:'Lo que estamos creando',offers:['Una experiencia gastronómica de servicio completo','Influencias culinarias indias y chinas','Un lugar para comidas familiares, amigos y celebraciones'],statusTitle:'Antes de abrir',status:'Estamos desarrollando la cocina, contratando personal y probando el menú. La comida mostrada es conceptual; no representa platos ni un menú confirmado.',contact:'Solicita novedades por correo',secondary:'Ver empleos'},
      'zh-CN':{headline:'一张充满风味的新餐桌正在成形。',intro:'Desi Dragon 是我们筹备中的印式中餐厅，融入孟加拉饮食文化。我们希望打造热闹的地下用餐空间，让亲友因美食相聚。主厨、最终菜单和开业日期尚未确定。',offerTitle:'正在筹备的体验',offers:['提供完整服务的餐饮体验','融合印度与中国烹饪风味','适合家庭、朋友与庆祝聚会的空间'],statusTitle:'开业前进展',status:'厨房筹备、招聘和菜单测试正在进行。所示食物为概念图片，并非确定菜品或最终菜单。',contact:'通过电子邮件了解开业消息',secondary:'查看招聘职位'}
    }
  },
  'pearl-and-leaf':{
    name:'Pearl & Leaf',emailSubject:'Pearl and Leaf opening updates',
    copy:{
      en:{headline:'A better drink, a brighter pause.',intro:'Pearl & Leaf is taking shape as a welcoming tea and café experience at DM Plaza. We are developing drinks and treats inspired by the flavors and communities around us. The final menu, team, and opening date are not yet set.',offerTitle:'What we are exploring',offers:['Tea and bubble tea','Coffee and seasonal drinks','Desserts and light bites'],statusTitle:'Before we open',status:'Recipes, service flow, and the café space are still in development. Images are concept visuals; drinks and products are not yet confirmed.',contact:'Ask for opening updates by email',secondary:'See open roles'},
      bn:{headline:'ভালো পানীয়, একটু উজ্জ্বল বিরতি।',intro:'DM Plaza-তে Pearl & Leaf একটি স্বাগতপূর্ণ চা ও ক্যাফের অভিজ্ঞতা হিসেবে গড়ে উঠছে। আশপাশের স্বাদ ও মানুষের অনুপ্রেরণায় পানীয় ও খাবার তৈরি করছি। চূড়ান্ত মেনু, দল ও খোলার তারিখ এখনও নির্ধারিত নয়।',offerTitle:'আমাদের পরিকল্পনায়',offers:['চা ও বাবল টি','কফি ও মৌসুমি পানীয়','মিষ্টান্ন ও হালকা খাবার'],statusTitle:'খোলার আগে',status:'রেসিপি, সেবার পদ্ধতি ও ক্যাফের জায়গা এখনও তৈরি হচ্ছে। ছবিগুলো ধারণামূলক; পানীয় ও পণ্য নিশ্চিত নয়।',contact:'ইমেইলে খোলার খবর জানতে চান',secondary:'চাকরির সুযোগ দেখুন'},
      es:{headline:'Una mejor bebida, una pausa más alegre.',intro:'Pearl & Leaf está tomando forma como un espacio acogedor de té y café en DM Plaza. Desarrollamos bebidas y delicias inspiradas en los sabores y comunidades de nuestro entorno. El menú final, el equipo y la fecha de apertura aún no están definidos.',offerTitle:'Lo que estamos explorando',offers:['Té y bubble tea','Café y bebidas de temporada','Postres y bocados ligeros'],statusTitle:'Antes de abrir',status:'Las recetas, el servicio y el espacio del café siguen en desarrollo. Las imágenes son conceptuales; las bebidas y los productos aún no están confirmados.',contact:'Solicita novedades por correo',secondary:'Ver empleos'},
      'zh-CN':{headline:'好饮品，让片刻更明亮。',intro:'Pearl & Leaf 正在 DM Plaza 筹备一个温馨的茶饮与咖啡空间。我们从周边社区和风味中汲取灵感，开发饮品与小食。最终菜单、团队和开业日期尚未确定。',offerTitle:'正在探索的产品',offers:['茶饮与珍珠奶茶','咖啡与季节饮品','甜点与轻食'],statusTitle:'开业前进展',status:'配方、服务流程和咖啡空间仍在开发中。图片仅为概念展示，饮品与产品尚未确定。',contact:'通过电子邮件了解开业消息',secondary:'查看招聘职位'}
    }
  },
  'natures-bazaar':{
    name:'Nature’s Bazaar',emailSubject:'Natures Bazaar opening updates',
    copy:{
      en:{headline:'Fresh choices for everyday life.',intro:'Nature’s Bazaar is our planned neighborhood market at DM Plaza. We are shaping an assortment of fresh foods, pantry staples, international favorites, and everyday essentials. Suppliers, inventory, and opening details are still being finalized.',offerTitle:'The market we envision',offers:['Fresh produce and grocery staples','International foods and household essentials','Prepared and convenient options as plans develop'],statusTitle:'Before we open',status:'We are sourcing vendors and building the store experience. Product photography is illustrative; specific items, departments, and availability may change.',contact:'Ask for opening updates by email',secondary:'Explore vendor opportunities'},
      bn:{headline:'প্রতিদিনের জন্য তাজা পছন্দ।',intro:'Nature’s Bazaar হলো DM Plaza-তে আমাদের পরিকল্পিত পাড়ার বাজার। তাজা খাবার, নিত্যপ্রয়োজনীয় পণ্য, আন্তর্জাতিক খাবার ও ঘরোয়া সামগ্রীর সম্ভার গড়ছি। সরবরাহকারী, মজুত ও খোলার তথ্য এখনও চূড়ান্ত হচ্ছে।',offerTitle:'আমাদের পরিকল্পিত বাজার',offers:['তাজা ফলমূল ও নিত্যপ্রয়োজনীয় মুদি পণ্য','আন্তর্জাতিক খাবার ও গৃহস্থালি সামগ্রী','পরিকল্পনা অনুযায়ী প্রস্তুত ও সুবিধাজনক খাবার'],statusTitle:'খোলার আগে',status:'বিক্রেতা খোঁজা ও দোকানের অভিজ্ঞতা তৈরি চলছে। পণ্যের ছবিগুলো উদাহরণস্বরূপ; নির্দিষ্ট পণ্য, বিভাগ ও প্রাপ্যতা বদলাতে পারে।',contact:'ইমেইলে খোলার খবর জানতে চান',secondary:'সরবরাহকারী হওয়ার সুযোগ'},
      es:{headline:'Opciones frescas para cada día.',intro:'Nature’s Bazaar es nuestro mercado de barrio planeado en DM Plaza. Estamos creando una selección de alimentos frescos, productos básicos, favoritos internacionales y artículos cotidianos. Los proveedores, el inventario y los detalles de apertura aún se están definiendo.',offerTitle:'El mercado que imaginamos',offers:['Frutas, verduras y productos básicos','Alimentos internacionales y artículos para el hogar','Opciones preparadas y prácticas según avancen los planes'],statusTitle:'Antes de abrir',status:'Estamos buscando proveedores y diseñando la experiencia de compra. Las fotos son ilustrativas; los productos, departamentos y su disponibilidad pueden cambiar.',contact:'Solicita novedades por correo',secondary:'Oportunidades para proveedores'},
      'zh-CN':{headline:'为日常生活带来新鲜选择。',intro:'Nature’s Bazaar 是我们计划在 DM Plaza 开设的社区市场。我们正在规划新鲜食品、日常杂货、各国风味和生活用品。供应商、库存与开业详情仍在确认中。',offerTitle:'我们期待的市场',offers:['新鲜果蔬与日常杂货','国际食品与家居必需品','随着计划推进推出的便利食品'],statusTitle:'开业前进展',status:'供应商招募和店铺体验设计正在进行。产品图片仅供参考；具体商品、部门和供应情况可能变化。',contact:'通过电子邮件了解开业消息',secondary:'了解供应商合作'}
    }
  },
  'meridian-hill':{
    name:'Meridian Hill',emailSubject:'Meridian Hill event inquiry',
    copy:{
      en:{headline:'Your occasion. Our care.',intro:'Meridian Hill is a planned event venue at DM Plaza for moments worth bringing people together. We are developing two event rooms on floors two and three, with a working planning capacity of about 120 guests per floor. Layouts, packages, and availability remain subject to confirmation.',offerTitle:'Events we are planning for',offers:['Weddings and nikah ceremonies','Birthdays, anniversaries, and graduations','Showers and private dinners','Corporate dinners, meetings, and offsites','Community gatherings and a future ticketed calendar'],statusTitle:'Buildout and planning',status:'Space layouts and event packages are in development. We will add verified construction photos, floor plans, and opening updates as they become available. The image shown is a concept, not the finished venue.',contact:'Discuss an event by email',secondary:'Ask about vendor partnerships'},
      bn:{headline:'আপনার অনুষ্ঠান। আমাদের যত্ন।',intro:'Meridian Hill হলো DM Plaza-তে পরিকল্পিত একটি অনুষ্ঠানস্থল, যেখানে মানুষ একসঙ্গে বিশেষ মুহূর্ত উদ্‌যাপন করতে পারবেন। দ্বিতীয় ও তৃতীয় তলায় দুটি হলের পরিকল্পনা চলছে; প্রাথমিক হিসাবে প্রতি তলায় প্রায় ১২০ জন অতিথি। বিন্যাস, প্যাকেজ ও প্রাপ্যতা এখনও নিশ্চিত নয়।',offerTitle:'যেসব অনুষ্ঠানের পরিকল্পনা করছি',offers:['বিয়ে ও নিকাহ অনুষ্ঠান','জন্মদিন, বিবাহবার্ষিকী ও স্নাতক উদ্‌যাপন','শাওয়ার ও ব্যক্তিগত নৈশভোজ','কর্পোরেট নৈশভোজ, সভা ও কর্মশালা','কমিউনিটি অনুষ্ঠান ও ভবিষ্যতের টিকিটভিত্তিক আয়োজন'],statusTitle:'নির্মাণ ও পরিকল্পনা',status:'স্থানের বিন্যাস ও অনুষ্ঠানের প্যাকেজ তৈরি হচ্ছে। যাচাইকৃত নির্মাণের ছবি, ফ্লোর প্ল্যান ও খোলার খবর পাওয়া গেলে যোগ করা হবে। দেখানো ছবিটি ধারণামূলক, সম্পূর্ণ স্থানের ছবি নয়।',contact:'ইমেইলে অনুষ্ঠান নিয়ে আলোচনা করুন',secondary:'সরবরাহকারী সহযোগিতা সম্পর্কে জিজ্ঞাসা করুন'},
      es:{headline:'Tu ocasión. Nuestro cuidado.',intro:'Meridian Hill es un espacio para eventos planeado en DM Plaza, pensado para reunir a las personas en momentos especiales. Estamos desarrollando dos salones en los pisos dos y tres, con una capacidad preliminar aproximada de 120 invitados por piso. La distribución, los paquetes y la disponibilidad aún deben confirmarse.',offerTitle:'Eventos que estamos planeando',offers:['Bodas y ceremonias nikah','Cumpleaños, aniversarios y graduaciones','Celebraciones prenatales y cenas privadas','Cenas corporativas, reuniones y jornadas de trabajo','Encuentros comunitarios y futuros eventos con entrada'],statusTitle:'Construcción y planificación',status:'Estamos desarrollando la distribución y los paquetes. Añadiremos fotos verificadas de la obra, planos y novedades cuando estén disponibles. La imagen es conceptual, no muestra el espacio terminado.',contact:'Consulta por un evento por correo',secondary:'Consulta sobre proveedores'},
      'zh-CN':{headline:'您的重要时刻，我们用心相伴。',intro:'Meridian Hill 是 DM Plaza 筹备中的活动场地，为值得相聚的时刻而设。我们计划在二楼和三楼设置两个活动厅，初步规划每层约容纳 120 位宾客。布局、套餐和档期仍待确认。',offerTitle:'计划承办的活动',offers:['婚礼与尼卡仪式','生日、周年纪念与毕业庆祝','迎婴派对与私人晚宴','企业晚宴、会议与团队活动','社区聚会及未来售票活动'],statusTitle:'施工与筹备',status:'场地布局和活动套餐仍在开发。经核实的施工照片、平面图和开业消息将在准备好后发布。所示图片为概念图，并非完工场地。',contact:'通过电子邮件咨询活动',secondary:'咨询供应商合作'}
    }
  }
} satisfies Record<string,Site>;

type Brand=keyof typeof sites;
const ids=Object.keys(sites) as Brand[];
const labels={
  en:{parent:'Part of DM Plaza',coming:'Coming soon in Jamaica, Queens',planned:'Planned experience',concept:'Concept image — not the finished space or final product',careers:'Careers',home:'Visit DM Plaza',more:'More details will be shared as plans are confirmed.'},
  bn:{parent:'DM Plaza-র অংশ',coming:'জামাইকা, কুইন্সে শীঘ্রই আসছে',planned:'পরিকল্পিত অভিজ্ঞতা',concept:'ধারণামূলক ছবি — সম্পূর্ণ স্থান বা চূড়ান্ত পণ্য নয়',careers:'চাকরি',home:'DM Plaza দেখুন',more:'পরিকল্পনা নিশ্চিত হলে আরও তথ্য জানানো হবে।'},
  es:{parent:'Parte de DM Plaza',coming:'Próximamente en Jamaica, Queens',planned:'Experiencia planeada',concept:'Imagen conceptual; no es el espacio terminado ni el producto final',careers:'Empleos',home:'Visita DM Plaza',more:'Compartiremos más detalles cuando los planes estén confirmados.'},
  'zh-CN':{parent:'DM Plaza 旗下',coming:'即将来到皇后区牙买加',planned:'筹备中的体验',concept:'概念图片，并非完工场地或最终产品',careers:'招聘',home:'访问 DM Plaza',more:'计划确认后将公布更多信息。'}
} satisfies Record<Language,Record<string,string>>;

export const dynamicParams=false;
export function generateStaticParams(){return ids.map(brand=>({brand}));}
export async function generateMetadata({params}:{params:Promise<{brand:string}>}):Promise<Metadata>{
  const {brand}=await params;
  if(!ids.includes(brand as Brand))return {};
  const site=sites[brand as Brand];
  return {title:`${site.name} | Coming Soon at DM Plaza`,description:site.copy.en.intro};
}
export default async function Page({params,searchParams}:{params:Promise<{brand:string}>;searchParams:Promise<{lang?:string}>}){
  const [{brand},{lang}]=await Promise.all([params,searchParams]);
  if(!ids.includes(brand as Brand))notFound();
  const id=brand as Brand,site=sites[id],locale=languages.includes(lang as Language)?lang as Language:'en';
  const c=site.copy[locale],l=labels[locale];
  const email=(subject:string)=>`mailto:info@dhanmondiplaza.com?subject=${encodeURIComponent(subject)}`;
  const bazaarSignupReady=id==='natures-bazaar'&&Boolean(process.env.GHL_NATURES_BAZAAR_WEBHOOK_URL);
  const primary=bazaarSignupReady?'#opening-updates':email(site.emailSubject);
  const primaryLabel=bazaarSignupReady?{en:'Get opening updates',bn:'খোলার খবর পান',es:'Recibe novedades de apertura','zh-CN':'获取开业消息'}[locale]:c.contact;
  const secondary=id==='meridian-hill'?email('Meridian Hill vendor partnership'):id==='natures-bazaar'?email('Natures Bazaar vendor partnership'):'/careers';
  return <main className={`microsite microsite--${id}`} lang={locale}>
    <a className="microsite-skip" href="#content">Skip to content</a>
    <div className="microsite-parent"><a href="/"><img src="/bio/dm-plaza/logo.webp" alt="DM Plaza"/>{l.parent}</a></div>
    <header className="microsite-header"><a className="microsite-brand" href={`/${id}`} aria-label={`${site.name} home`}><img src={`/bio/${id}/logo.webp`} alt={site.name}/></a><nav aria-label="Page links"><a href="/careers">{l.careers}</a><a href="/">{l.home}</a><details><summary aria-label="Language">{locale==='en'?'EN':locale==='bn'?'বাংলা':locale==='es'?'ES':'中文'}</summary><div className="microsite-languages">{languages.map(code=><a key={code} href={`/${id}?lang=${code}`} lang={code} aria-current={locale===code?'page':undefined}>{code==='en'?'English':code==='bn'?'বাংলা':code==='es'?'Español':'中文'}</a>)}</div></details></nav></header>
    <div id="content"><section className="microsite-hero"><div className="microsite-hero-copy"><p className="microsite-eyebrow">{l.coming}</p><h1>{c.headline}</h1><p className="microsite-intro">{c.intro}</p><div className="microsite-actions"><a className="microsite-button" href={primary}>{primaryLabel} <span aria-hidden="true">↗</span></a><a className="microsite-outline" href={secondary}>{c.secondary} <span aria-hidden="true">↗</span></a></div></div><figure><img src={`/bio/${id}/hero.webp`} alt=""/><figcaption>{l.concept}</figcaption></figure></section>
    <section className="microsite-section microsite-offers"><div><p className="microsite-eyebrow">{l.planned}</p><h2>{c.offerTitle}</h2></div><ul>{c.offers.map(item=><li key={item}>{item}</li>)}</ul></section>
    <section className="microsite-section microsite-status"><div><p className="microsite-eyebrow">{l.coming}</p><h2>{c.statusTitle}</h2></div><div><p>{c.status}</p>{id==='meridian-hill'&&<p className="microsite-capacity">{locale==='en'?'Working capacity: approximately 120 guests per floor; approximately 240 across both floors. Final occupancy depends on the completed layout and approvals.':locale==='bn'?'প্রাথমিক ধারণক্ষমতা: প্রতি তলায় প্রায় ১২০ জন, দুই তলায় প্রায় ২৪০ জন। চূড়ান্ত সংখ্যা সম্পূর্ণ বিন্যাস ও অনুমোদনের ওপর নির্ভর করবে।':locale==='es'?'Capacidad preliminar: aproximadamente 120 invitados por piso y 240 entre ambos pisos. La ocupación final depende de la distribución terminada y las aprobaciones.':'初步容量：每层约 120 位宾客，两层合计约 240 位。最终人数取决于完工布局与审批。'}</p>}<p className="microsite-muted">{l.more}</p></div></section>{bazaarSignupReady&&<BazaarSignup lang={locale}/>}</div>
    <footer className="microsite-footer"><strong>{site.name}</strong><a href="/">DM Plaza</a><a href="/privacy">Privacy</a><a href="/careers">{l.careers}</a>{id==='natures-bazaar'&&<BazaarAnalytics lang={locale}/>}</footer>
  </main>;
}
