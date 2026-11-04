const {test}=require('node:test');
const assert=require('node:assert/strict');
const {stripTypeScriptTypes}=require('node:module');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');

test('public pages disable object embeds; careers and accounts also prevent framing and caching',async()=>{
  const configSource=stripTypeScriptTypes(fs.readFileSync(path.join(__dirname,'../next.config.ts'),'utf8'));
  const {default:config}=await import(`data:text/javascript,${encodeURIComponent(configSource)}`);
  const rules=await config.headers();
  assert.equal(config.poweredByHeader,false);
  const all=rules.find(r=>r.source==='/:path*');
  assert(all.headers.some(h=>h.key==='X-Content-Type-Options'&&h.value==='nosniff'));
  for(const source of ['/careers/:path*','/account/:path*']){
    const rule=rules.find(r=>r.source===source);
    assert(rule.headers.some(h=>h.key==='Content-Security-Policy'&&h.value.includes("frame-ancestors 'none'")));
    assert(rule.headers.some(h=>h.key==='Cache-Control'&&h.value.includes('no-store')));
  }
});

test('careers body reader rejects lying Content-Length and cancels oversized streams',async()=>{
  const {readBoundedBody}=await import(pathToFileURL(path.join(__dirname,'../features/careers-validation.ts')).href);
  let cancelled=false;
  const stream=new ReadableStream({start(c){c.enqueue(new Uint8Array(9))},cancel(){cancelled=true}});
  const req=new Request('https://www.dhanmondiplaza.com/careers/api',{method:'POST',headers:{'content-length':'1'},body:stream,duplex:'half'});
  await assert.rejects(readBoundedBody(req,8),/BODY_TOO_LARGE/);
  assert.equal(cancelled,true);
});
