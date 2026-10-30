import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import CustomerJourneyPreview from '../../../features/customer-journey-preview';

export const metadata:Metadata={title:'Customer Journeys | DM Plaza Preview',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';

export default async function Page({searchParams}:{searchParams:Promise<{journey?:string}>}){
  const enabled=process.env.CUSTOMER_APP_PREVIEW_ENABLED==='true'||process.env.VERCEL_ENV==='preview'||process.env.NODE_ENV==='development';
  if(!enabled)notFound();
  const {journey}=await searchParams;
  return <CustomerJourneyPreview initialJourney={journey==='parking'?'parking':'pearl'}/>;
}
