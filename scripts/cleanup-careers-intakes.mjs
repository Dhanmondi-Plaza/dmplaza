// Run with server-only Supabase credentials. Defaults to a read-only dry run.
import {createClient} from '@supabase/supabase-js';

const execute=process.argv.includes('--execute');
const {SUPABASE_URL,SUPABASE_SECRET_KEY}=process.env;
if(!SUPABASE_URL||!SUPABASE_SECRET_KEY)throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY in the shell.');
const db=createClient(SUPABASE_URL,SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const {data:rows,error}=await db.schema('os_api').rpc('list_expired_careers_intakes');
if(error)throw error;
let removed=0;
for(const row of rows||[]){
  const prefix=`${row.organization_id}/${row.id}`;
  if(!execute){console.log(`Would remove ${row.state} intake ${row.id}${row.state==='reserved'?' and any abandoned PDFs':''}`);continue;}
  if(row.state==='reserved'){
    const bucket=db.storage.from('hiring-resumes');
    const {data:files,error:listError}=await bucket.list(prefix,{limit:100});
    if(listError)throw listError;
    const paths=(files||[]).filter(file=>file.name).map(file=>`${prefix}/${file.name}`);
    if(paths.length){
      const {error:removeError}=await bucket.remove(paths);
      if(removeError)throw removeError;
    }
  }
  const {data:purged,error:purgeError}=await db.schema('os_api').rpc('purge_expired_careers_intake',{p_intake:row.id});
  if(purgeError)throw purgeError;
  if(!purged)throw new Error(`Intake ${row.id} was not purged; review its age and Storage objects.`);
  removed++;
}
console.log(execute?`Purged ${removed} expired intake copies. Run again if more than 100 were eligible.`:`Dry run: ${(rows||[]).length} expired intake copies. Pass --execute after review.`);
