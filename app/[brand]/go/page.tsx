import {notFound} from 'next/navigation';
import BioPage from '../../../features/bio-page';
import {brandIds, brands, languages, type BrandId, type Language} from '../../../features/bio-data';

export const dynamicParams = false;
export function generateStaticParams() {return brandIds.map(brand => ({brand}));}
export async function generateMetadata({params}: {params: Promise<{brand: string}>}) {
  const {brand} = await params;
  if (!brandIds.includes(brand as BrandId)) return {};
  const name = brands[brand as BrandId].name;
  return {title: brand === 'dm-plaza' ? 'Dhanmondi Plaza | Links' : `${name} | DM Plaza`, description: `${name} is coming to DM Plaza in Jamaica, Queens. Follow opening updates and explore what's taking shape.`};
}
export default async function Page({params, searchParams}: {params: Promise<{brand: string}>; searchParams: Promise<{lang?: string}>}) {
  const [{brand}, {lang}] = await Promise.all([params, searchParams]);
  if (!brandIds.includes(brand as BrandId)) notFound();
  return <BioPage brandId={brand as BrandId} initialLanguage={languages.includes(lang as Language) ? lang as Language : 'en'}/>;
}
