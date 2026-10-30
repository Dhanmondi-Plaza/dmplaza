'use client';

import {createClient,type SupabaseClient} from '@supabase/supabase-js';

let shared:{url:string;key:string;client:SupabaseClient}|undefined;

export function customerClient(url:string,key:string){
  if(!url||!key)return null;
  if(!shared||shared.url!==url||shared.key!==key)
    shared={url,key,client:createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true}})};
  return shared.client;
}
