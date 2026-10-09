import type {Metadata} from 'next';
import './fonts.css';
import './base.css';

export const metadata:Metadata={icons:{icon:[{url:'/favicon.ico',sizes:'any'},{url:'/favicon-32x32.png',type:'image/png',sizes:'32x32'}],apple:'/apple-touch-icon.png'}};

export default function Layout({children}:{children:React.ReactNode}){return <html lang='en'><body>{children}</body></html>}
