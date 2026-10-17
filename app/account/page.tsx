import type {Metadata} from 'next';
import Account from '../../features/customer-account';

export const metadata:Metadata={title:'Your Account | DM Plaza',description:'Save the DM Plaza brands you want to follow.'};
export const dynamic='force-dynamic';

export default function Page(){return <Account url={process.env.SUPABASE_URL||''} keyValue={process.env.SUPABASE_PUBLISHABLE_KEY||''}/>}
