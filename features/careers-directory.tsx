'use client';

import {useEffect,useRef,useState} from 'react';
import type {KeyboardEvent} from 'react';
import type {Job} from './careers-domain';

type Filters={brand:string;department:string;employment:string;sort:string};
const defaults:Filters={brand:'all',department:'all',employment:'all',sort:'priority'};
const brands=[
  {key:'all',label:'All Roles'},
  {key:'Desi Dragon',label:'Desi Dragon'},
  {key:'Pearl & Leaf',label:'Pearl & Leaf'},
  {key:'Nature’s Bazaar',label:'Nature’s Bazaar'},
  {key:'Meridian Hill',label:'Meridian Hill'},
  {key:'Dhanmondi Plaza',label:'DM Plaza'},
] as const;
const departments=['Leadership','Kitchen','Beverage','Marketing','Facilities','Contract / Specialized'] as const;
const canonicalBrand=(brand:string)=>brand==='DM Plaza'?'Dhanmondi Plaza':brand;
const brandClass=(brand:string)=>canonicalBrand(brand)==='Dhanmondi Plaza'?'dm-plaza':brand==='Pearl & Leaf'?'pearl-and-leaf':brand==='Desi Dragon'?'desi-dragon':brand==='Nature’s Bazaar'?'natures-bazaar':'meridian-hill';
const displayBrand=(brand:string)=>canonicalBrand(brand)==='Dhanmondi Plaza'?'DM Plaza':brand;
const priority=(job:Job)=>Number.isFinite(job.display_priority)?job.display_priority!:1000;
function department(job:Job){
  const team=(job.team||'').toLowerCase();
  const title=job.title.toLowerCase();
  if(team.includes('assessment')||job.employment_type.toLowerCase().includes('contract'))return 'Contract / Specialized';
  if(title.includes('executive chef')||team.includes('leadership'))return 'Leadership';
  if(team.includes('beverage')||title.includes('barista'))return 'Beverage';
  if(team.includes('marketing')||team.includes('community'))return 'Marketing';
  if(team.includes('facilities')||team.includes('maintenance'))return 'Facilities';
  if(team.includes('kitchen')||team.includes('culinary'))return 'Kitchen';
  return job.team||'Other';
}
function pay(job:Job){
  const value=job.compensation||'';
  const amount=value.match(/\$\s*([\d,]+)/);
  const unit=/per hour|hourly/i.test(value)?'hour':/per year|salary|annual/i.test(value)?'year':null;
  return amount&&unit?{value:Number(amount[1].replace(/,/g,'')),unit}:null;
}
function readFilters(){
  const query=new URLSearchParams(window.location.search);
  const brand=canonicalBrand(query.get('brand')||'all');
  const department=query.get('department')||'all';
  const employment=query.get('type')||'all';
  const sort=query.get('sort')||'priority';
  return {
    brand:brands.some(item=>item.key===brand)?brand:'all',
    department:departments.some(item=>item===department)?department:'all',
    employment:['all','Full-time','Part-time','Contract'].includes(employment)?employment:'all',
    sort:['priority','title','pay'].includes(sort)?sort:'priority',
  };
}
function jobUrl(job:Job,preview:boolean){return '/careers/'+encodeURIComponent(job.slug)+(preview?'?preview=1':'')}

export function CareersList({jobs,preview,accepting}:{jobs:Job[];preview:boolean;accepting:boolean}){
  const [filters,setFilters]=useState<Filters>(defaults);
  const [ready,setReady]=useState(false);
  const tabRefs=useRef<Array<HTMLButtonElement|null>>([]);
  const activeJobs=jobs.filter(job=>job.visibility==='published'||preview);
  const brandCount=(brand:string)=>brand==='all'?activeJobs.length:activeJobs.filter(job=>canonicalBrand(job.brand)===brand).length;
  const hiringBrands=new Set(activeJobs.map(job=>canonicalBrand(job.brand))).size;
  const featured=activeJobs.filter(job=>job.is_featured).sort((a,b)=>priority(a)-priority(b)).slice(0,3);
  const base=activeJobs.filter(job=>
    (filters.brand==='all'||canonicalBrand(job.brand)===filters.brand)&&
    (filters.department==='all'||department(job)===filters.department)&&
    (filters.employment==='all'||job.employment_type.toLowerCase().includes(filters.employment.toLowerCase()))
  );
  const units=base.map(pay);
  const canSortPay=base.length>0&&units.every(Boolean)&&new Set(units.map(item=>item?.unit)).size===1;
  const results=[...base].sort((a,b)=>{
    if(filters.sort==='title')return a.title.localeCompare(b.title);
    if(filters.sort==='pay'&&canSortPay)return (pay(b)?.value||0)-(pay(a)?.value||0)||priority(a)-priority(b);
    return priority(a)-priority(b)||b.created_at.localeCompare(a.created_at);
  });
  const selectedIndex=brands.findIndex(item=>item.key===filters.brand);
  const selectedBrand=brands[selectedIndex]||brands[0];
  const hasFilters=filters.brand!=='all'||filters.department!=='all'||filters.employment!=='all'||filters.sort!=='priority';

  useEffect(()=>{
    setFilters(readFilters());
    setReady(true);
    const query=new URLSearchParams(window.location.search);
    for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'])
      if(query.has(key))sessionStorage.setItem('careers:'+key,(query.get(key)||'').slice(0,500));
    const onPop=()=>setFilters(readFilters());
    window.addEventListener('popstate',onPop);
    return ()=>window.removeEventListener('popstate',onPop);
  },[]);
  useEffect(()=>{
    if(!ready)return;
    const query=new URLSearchParams(window.location.search);
    for(const [key,value] of Object.entries({brand:filters.brand,department:filters.department,type:filters.employment,sort:filters.sort}))
      if(value==='all'||value==='priority')query.delete(key);else query.set(key,value);
    const url=window.location.pathname+(query.size?'?'+query.toString():'')+window.location.hash;
    if(url!==window.location.pathname+window.location.search+window.location.hash)window.history.replaceState(null,'',url);
  },[filters,ready]);
  useEffect(()=>{
    if(filters.sort==='pay'&&!canSortPay)setFilters(current=>({...current,sort:'priority'}));
  },[filters.sort,canSortPay]);
  const update=(key:keyof Filters,value:string)=>setFilters(current=>({...current,[key]:value}));
  const onTabKey=(event:KeyboardEvent<HTMLButtonElement>,index:number)=>{
    let next=index;
    if(event.key==='ArrowRight')next=(index+1)%brands.length;
    else if(event.key==='ArrowLeft')next=(index-1+brands.length)%brands.length;
    else if(event.key==='Home')next=0;
    else if(event.key==='End')next=brands.length-1;
    else return;
    event.preventDefault();
    update('brand',brands[next].key);
    tabRefs.current[next]?.focus();
  };

  return <div className="careers-directory">
    <section className="directory-hero" aria-labelledby="careers-title">
      <p className="directory-kicker">Careers at DM Plaza</p>
      <h1 id="careers-title">Build something <em>with us.</em></h1>
      <p className="directory-intro">Join the team bringing food, culture, community, and hospitality together in Jamaica, Queens.</p>
      <p className="directory-count"><strong>{activeJobs.length}</strong> open {activeJobs.length===1?'position':'positions'} across <strong>{hiringBrands}</strong> {hiringBrands===1?'brand':'brands'}</p>
    </section>
    {preview&&<p className="jobs-notice">Local preview · Approved JD drafts. Applications are not being collected yet.</p>}
    {featured.length>0&&<section className="directory-featured" aria-labelledby="featured-title">
      <div className="directory-heading"><div><p className="directory-kicker">Where we’re hiring now</p><h2 id="featured-title">Featured Opportunities</h2></div></div>
      <div className="featured-grid">{featured.map(job=><a key={job.id} className={'featured-card brand-'+brandClass(job.brand)} href={jobUrl(job,preview)} aria-label={'View position: '+job.title+' at '+displayBrand(job.brand)}>
        <span className="featured-brand">{displayBrand(job.brand)}</span>
        <h3>{job.title}</h3>
        <span className="featured-detail">{job.employment_type} <span aria-hidden="true">·</span> {job.location}</span>
        <span className="featured-pay">{job.compensation}</span>
        <span className="featured-action">View Position <span aria-hidden="true">↗</span></span>
      </a>)}</div>
    </section>}
    <section className="directory-openings" aria-labelledby="openings-title">
      <div className="directory-heading"><div><p className="directory-kicker">Find your place</p><h2 id="openings-title">Explore Open Positions</h2></div></div>
      <div className="brand-tabs-scroll"><div className="brand-tabs" role="tablist" aria-label="Filter positions by brand">
        {brands.map((brand,index)=><button key={brand.key} ref={node=>{tabRefs.current[index]=node}} type="button" role="tab" id={'brand-tab-'+index} aria-controls="careers-results" aria-selected={filters.brand===brand.key} tabIndex={filters.brand===brand.key?0:-1} className={filters.brand===brand.key?'is-selected':''} onClick={()=>update('brand',brand.key)} onKeyDown={event=>onTabKey(event,index)}>
          {brand.label} <span className="brand-tab-count">({brandCount(brand.key)})</span>
        </button>)}
      </div></div>
      <div id="careers-results" role="tabpanel" aria-labelledby={'brand-tab-'+selectedIndex} tabIndex={0}>
        <div className="directory-controls">
          <label>Department<select value={filters.department} onChange={event=>update('department',event.target.value)}><option value="all">All Departments</option>{departments.map(value=><option key={value}>{value}</option>)}</select></label>
          <label>Employment type<select value={filters.employment} onChange={event=>update('employment',event.target.value)}><option value="all">All Types</option><option>Full-time</option><option>Part-time</option><option>Contract</option></select></label>
          <label>Sort by<select value={filters.sort} onChange={event=>update('sort',event.target.value)}><option value="priority">Hiring Priority</option><option value="title">Job Title A–Z</option><option value="pay" disabled={!canSortPay}>Compensation: high to low{canSortPay?'':' (mixed pay types)'}</option></select></label>
        </div>
        <div className="results-toolbar"><p aria-live="polite" aria-atomic="true"><strong>{results.length}</strong> matching {results.length===1?'position':'positions'}</p>{hasFilters&&<button type="button" className="directory-reset" onClick={()=>setFilters(defaults)}>Reset Filters</button>}</div>
        {results.length>0?<div className="job-rows">{results.map(job=><a className={'job-row brand-'+brandClass(job.brand)} key={job.id} href={jobUrl(job,preview)} aria-label={'View position: '+job.title+' at '+displayBrand(job.brand)}>
          <span className="job-row-title"><span className="job-row-mobile-brand">{displayBrand(job.brand)}</span><strong>{job.title}</strong><small>{job.location}</small></span>
          <span className="job-row-team"><strong>{displayBrand(job.brand)}</strong><small>{department(job)}</small></span>
          <span className="job-row-type">{job.employment_type}</span>
          <span className="job-row-pay">{job.compensation}</span>
          <span className="job-row-arrow" aria-hidden="true">→</span>
        </a>)}</div>:<div className="directory-empty"><h3>{filters.brand!=='all'&&brandCount(filters.brand)===0?'No current openings at '+selectedBrand.label+'.':'No positions match these filters.'}</h3><p>{filters.brand!=='all'&&brandCount(filters.brand)===0?'Please check back as this team grows.':'Try another department, employment type, or brand.'}</p></div>}
      </div>
    </section>
    <section className="directory-talent" aria-labelledby="talent-title"><div><p className="directory-kicker">Keep in touch</p><h2 id="talent-title">Don’t see the right role?</h2><p>We’re always looking for talented people who want to help build what’s next at DM Plaza.</p></div><p className="directory-talent-note">Talent network applications will be available soon. Please check back for new openings.</p></section>
    {accepting&&<p className="directory-apply-note">Applications are submitted through each position’s detail page.</p>}
  </div>;
}
