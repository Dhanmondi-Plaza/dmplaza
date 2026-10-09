import type {Metadata} from 'next';
import './fonts.css';
import './base.css';

export const metadata:Metadata={icons:{icon:[{url:'/favicon-large.svg',type:'image/svg+xml',sizes:'any'}],apple:'/apple-touch-icon.png'}};

export default function Layout({children}:{children:React.ReactNode}){return <html lang='en'><body>{children}</body></html>}
