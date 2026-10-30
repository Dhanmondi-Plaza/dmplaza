import type {Metadata} from 'next';
import CustomerApp from '../../features/customer-app';

export const metadata:Metadata={title:'DM Plaza App',description:'Explore DM Plaza brands and manage your activity.',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';

export default async function Page({searchParams}:{searchParams:Promise<{view?:string}>}){
  const {view}=await searchParams;
  const active=view==='explore'||view==='activity'?view:'home';
  const previewEnabled=process.env.CUSTOMER_APP_PREVIEW_ENABLED==='true'||process.env.VERCEL_ENV==='preview'||process.env.NODE_ENV==='development';
  return <CustomerApp url={process.env.SUPABASE_URL||''} keyValue={process.env.SUPABASE_PUBLISHABLE_KEY||''} view={active} previewEnabled={previewEnabled}/>;
}
