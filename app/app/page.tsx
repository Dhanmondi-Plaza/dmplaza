import type {Metadata} from 'next';
import CustomerApp from '../../features/customer-app';

export const metadata:Metadata={title:'Explore | DM Plaza',description:'Explore DM Plaza brands and upcoming free events.',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';

export default function Page(){
  return <CustomerApp url={process.env.SUPABASE_URL||''} keyValue={process.env.SUPABASE_PUBLISHABLE_KEY||''}/>;
}
