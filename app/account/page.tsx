import type {Metadata} from 'next';
import Account from '../../features/customer-account';

export const metadata:Metadata={title:'Your Account | DM Plaza',description:'Save the DM Plaza brands you want to follow.'};
export const dynamic='force-dynamic';

export default function Page(){return <Account url={process.env.SUPABASE_URL||''} keyValue={process.env.SUPABASE_PUBLISHABLE_KEY||''} appleEnabled={process.env.DM_CUSTOMER_APPLE_ENABLED==='true'} googleEnabled={process.env.DM_CUSTOMER_GOOGLE_ENABLED==='true'} smsEnabled={process.env.DM_CUSTOMER_SMS_ENABLED==='true'} linkingEnabled={process.env.DM_CUSTOMER_LINKING_ENABLED==='true'}/>}
