import type {NextConfig} from 'next';
const config:NextConfig={
  poweredByHeader:false,
  async rewrites(){return {beforeFiles:[{source:'/',destination:'/index.html'}]}},
  async headers(){return [
    {source:'/:path*',headers:[
      {key:'X-Content-Type-Options',value:'nosniff'},
      {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
      {key:'X-Frame-Options',value:'DENY'},
      {key:'Content-Security-Policy',value:"object-src 'none'; base-uri 'self'"}
    ]},
    ...['/careers/:path*','/account/:path*'].map(source=>({source,headers:[
      {key:'X-Frame-Options',value:'DENY'},
      {key:'Content-Security-Policy',value:"object-src 'none'; base-uri 'self'; frame-ancestors 'none'"},
      {key:'Cache-Control',value:'private, no-store'}
    ]}))
  ]}
};
export default config;
