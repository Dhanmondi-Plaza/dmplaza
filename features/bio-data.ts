export const languages = ['en', 'bn', 'es', 'zh-CN'] as const;
export type Language = (typeof languages)[number];
type Translated = Record<Language, string>;

export const text = {
  opening: {en: 'Coming soon in Jamaica, Queens', bn: 'জামাইকা, কুইন্সে শীঘ্রই আসছে', es: 'Próximamente en Jamaica, Queens', 'zh-CN': '即将来到皇后区牙买加'},
  note: {en: 'We are building this experience now. Opening details and final offerings are still being confirmed.', bn: 'আমরা এই অভিজ্ঞতা তৈরি করছি। খোলার তথ্য ও চূড়ান্ত সেবা এখনও নিশ্চিত করা হচ্ছে।', es: 'Estamos preparando esta experiencia. La fecha de apertura y la oferta final aún no están confirmadas.', 'zh-CN': '我们正在筹备这一体验。开业时间和最终服务内容尚待确认。'},
  updates: {en: 'Get opening updates', bn: 'খোলার খবর পান', es: 'Recibe novedades de apertura', 'zh-CN': '获取开业消息'},
  explore: {en: 'Explore DM Plaza', bn: 'ডিএম প্লাজা দেখুন', es: 'Explora DM Plaza', 'zh-CN': '探索 DM Plaza'},
  microsite: {en: 'Explore this brand', bn: 'এই ব্র্যান্ড সম্পর্কে জানুন', es: 'Explora esta marca', 'zh-CN': '了解这个品牌'},
  progress: {en: 'Follow the buildout', bn: 'নির্মাণের অগ্রগতি দেখুন', es: 'Sigue la construcción', 'zh-CN': '关注施工进展'},
  location: {en: 'Location and directions', bn: 'ঠিকানা ও যাতায়াত', es: 'Ubicación e indicaciones', 'zh-CN': '地址与路线'},
  careers: {en: 'Explore open roles', bn: 'খোলা পদগুলো দেখুন', es: 'Explora las vacantes', 'zh-CN': '查看招聘职位'},
  event: {en: 'Ask about an event', bn: 'অনুষ্ঠান সম্পর্কে জিজ্ঞাসা করুন', es: 'Consulta sobre un evento', 'zh-CN': '咨询活动'},
  vendor: {en: 'Ask about vendor partnerships', bn: 'বিক্রেতা অংশীদারিত্ব সম্পর্কে জিজ্ঞাসা করুন', es: 'Consulta sobre alianzas con proveedores', 'zh-CN': '咨询供应商合作'},
  instagram: {en: 'Follow our progress on Instagram', bn: 'ইনস্টাগ্রামে আমাদের অনুসরণ করুন', es: 'Síguenos en Instagram', 'zh-CN': '在 Instagram 关注我们'},
  brand: {en: 'Part of DM Plaza · More Together', bn: 'ডিএম প্লাজার অংশ · একসঙ্গে আরও', es: 'Parte de DM Plaza · Más juntos', 'zh-CN': 'DM Plaza 旗下 · 携手同行'},
  concept: {en: 'Concept image. This is not a photo of the finished space or final offering.', bn: 'ধারণামূলক ছবি। এটি সম্পূর্ণ স্থানের বা চূড়ান্ত সেবার ছবি নয়।', es: 'Imagen conceptual. No muestra el espacio terminado ni la oferta final.', 'zh-CN': '概念图片，并非完工场地或最终服务的实景。'},
  care: {en: 'Care is not available at this location yet.', bn: 'এই স্থানে এখনও চিকিৎসা সেবা চালু হয়নি।', es: 'La atención médica aún no está disponible en este lugar.', 'zh-CN': '此地点尚未提供医疗服务。'},
  language: {en: 'Language', bn: 'ভাষা', es: 'Idioma', 'zh-CN': '语言'},
  menu: {en: 'Menu', bn: 'মেনু', es: 'Menú', 'zh-CN': '菜单'},
  skip: {en: 'Skip to links', bn: 'লিংকে যান', es: 'Ir a los enlaces', 'zh-CN': '跳转到链接'},
  privacy: {en: 'Privacy', bn: 'গোপনীয়তা', es: 'Privacidad', 'zh-CN': '隐私'},
} satisfies Record<string, Translated>;

type LinkKey = 'updates' | 'explore' | 'progress' | 'location' | 'careers' | 'event' | 'vendor' | 'instagram';
type Brand = {name: string; tag: Translated; links: LinkKey[]; image?: boolean;};

export const brands = {
  'dm-plaza': {name: 'DM Plaza', tag: {en: 'One destination. Many experiences.', bn: 'এক গন্তব্য। অনেক অভিজ্ঞতা।', es: 'Un destino. Muchas experiencias.', 'zh-CN': '一个目的地，多种体验。'}, links: ['updates', 'explore', 'progress', 'location', 'careers']},
  'desi-dragon': {name: 'Desi Dragon', tag: {en: 'Bold flavors. Good company.', bn: 'সাহসী স্বাদ। দারুণ সঙ্গ।', es: 'Sabores intensos. Buena compañía.', 'zh-CN': '浓郁风味，欢聚时光。'}, links: ['updates', 'explore', 'instagram', 'careers'], image: true},
  'pearl-and-leaf': {name: 'Pearl & Leaf', tag: {en: 'Better drinks. Brighter days.', bn: 'দারুণ পানীয়। উজ্জ্বল দিন।', es: 'Mejores bebidas. Días más alegres.', 'zh-CN': '好饮品，亮生活。'}, links: ['updates', 'explore', 'instagram', 'careers'], image: true},
  'natures-bazaar': {name: 'Nature’s Bazaar', tag: {en: 'Fresh choices. Everyday discoveries.', bn: 'তাজা পছন্দ। প্রতিদিন নতুন কিছু।', es: 'Opciones frescas. Descubrimientos diarios.', 'zh-CN': '新鲜选择，每日发现。'}, links: ['updates', 'vendor', 'explore', 'instagram'], image: true},
  'meridian-hill': {name: 'Meridian Hill', tag: {en: 'Celebrate. Connect. Belong.', bn: 'উদ্‌যাপন। মিলন। আপনজন।', es: 'Celebra. Conecta. Comparte.', 'zh-CN': '庆祝。相聚。归属。'}, links: ['event', 'explore', 'updates', 'progress', 'location'], image: true},
  'top-level-urgent-care': {name: 'Top Level Urgent Care', tag: {en: 'Care for our community.', bn: 'আমাদের সমাজের জন্য সেবা।', es: 'Atención para nuestra comunidad.', 'zh-CN': '关爱我们的社区。'}, links: ['updates', 'explore', 'location']},
} satisfies Record<string, Brand>;

export type BrandId = keyof typeof brands;
export const brandIds = Object.keys(brands) as BrandId[];
export const linkUrls: Record<LinkKey, string> = {
  updates: '/#notify', explore: '/#businesses', progress: '/#buildout', location: '/#location', careers: '/careers',
  event: 'mailto:info@dhanmondiplaza.com?subject=Meridian%20Hill%20event%20inquiry',
  vendor: 'mailto:info@dhanmondiplaza.com?subject=Nature%27s%20Bazaar%20vendor%20inquiry',
  instagram: 'https://www.instagram.com/dhanmondiplaza',
};
