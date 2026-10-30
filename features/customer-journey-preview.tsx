'use client';

import {useState} from 'react';
import {CustomerNavigation,CustomerShellHeader} from './customer-shell';
import './customer-journey-preview.css';

type Journey='pearl'|'parking';
type SampleItem={name:string;category:string;description:string};
const samples:SampleItem[]=[
  {name:'Milk tea',category:'Tea',description:'Sample drink for testing the ordering flow.'},
  {name:'Matcha drink',category:'Tea',description:'Sample drink for testing customization.'},
  {name:'Coffee drink',category:'Coffee',description:'Sample drink for testing pickup.'},
];
const pearlSteps=['Menu','Customize','Bag','Pickup','Review'];
const parkingSteps=['When','Availability','Vehicle','Review'];

function StepIndicator({labels,step}:{labels:string[];step:number}){
  return <ol className="journey-steps" aria-label="Journey progress">{labels.map((label,index)=><li key={label} aria-current={step===index?'step':undefined} className={index<step?'complete':''}><span>{index+1}</span><small>{label}</small></li>)}</ol>;
}

export default function CustomerJourneyPreview({initialJourney}:{initialJourney:Journey}){
  const [journey,setJourney]=useState<Journey>(initialJourney);
  const [step,setStep]=useState(0);
  const [item,setItem]=useState<SampleItem>(samples[0]);
  const [size,setSize]=useState('Regular');
  const [quantity,setQuantity]=useState(1);
  const [pickup,setPickup]=useState('');
  const [date,setDate]=useState('');
  const [arrival,setArrival]=useState('');
  const [duration,setDuration]=useState('2 hours');
  const [vehicle,setVehicle]=useState('');
  const today=new Date().toLocaleDateString('en-CA');
  const isPearl=journey==='pearl';
  const labels=isPearl?pearlSteps:parkingSteps;
  const switchJourney=(next:Journey)=>{setJourney(next);setStep(0);history.replaceState(null,'',`/app/preview?journey=${next}`)};

  return <main className={`customer-preview-page ${isPearl?'journey-pearl':'journey-parking'}`}><div className="customer-preview-wrap">
    <CustomerShellHeader/>
    <div className="journey-notice" role="note"><strong>Interactive preview</strong><span>Sample content only. No live availability, order, reservation, or payment.</span></div>
    <div className="journey-switch" role="group" aria-label="Choose a journey"><button type="button" aria-pressed={isPearl} onClick={()=>switchJourney('pearl')}>Pearl & Leaf pickup</button><button type="button" aria-pressed={!isPearl} onClick={()=>switchJourney('parking')}>Parking reservation</button></div>
    <header className="journey-heading"><p>{isPearl?'PEARL & LEAF':'DM PLAZA PARKING'}</p><h1>{isPearl?'Make it yours.':'A space for your visit.'}</h1><span>{isPearl?'Preview the steps from drink selection to pickup review.':'Preview a reservation for the planned 21-space lot.'}</span></header>
    <StepIndicator labels={labels} step={step}/>
    <div className="journey-panel" aria-live="polite">
      {isPearl&&step===0&&<section aria-labelledby="journey-menu"><h2 id="journey-menu">Choose a drink</h2><p>These are sample items. The real menu, modifiers, prices, and availability still need Toast approval.</p><div className="journey-menu-list">{samples.map(sample=><button type="button" key={sample.name} onClick={()=>{setItem(sample);setStep(1)}}><span><small>{sample.category}</small><strong>{sample.name}</strong><em>{sample.description}</em></span><span aria-hidden="true">→</span></button>)}</div></section>}
      {isPearl&&step===1&&<section aria-labelledby="journey-customize"><h2 id="journey-customize">{item.name}</h2><p>Try the selection controls. Available sizes and add-ons will come from the approved menu.</p><fieldset className="journey-choice"><legend>Sample size</legend>{['Regular','Large'].map(option=><label key={option}><input type="radio" name="size" checked={size===option} onChange={()=>setSize(option)}/><span>{option}</span></label>)}</fieldset><div className="journey-quantity"><span>Quantity</span><div><button type="button" aria-label="Decrease quantity" disabled={quantity<=1} onClick={()=>setQuantity(value=>value-1)}>−</button><output aria-live="polite">{quantity}</output><button type="button" aria-label="Increase quantity" disabled={quantity>=20} onClick={()=>setQuantity(value=>value+1)}>+</button></div></div></section>}
      {isPearl&&step===2&&<section aria-labelledby="journey-bag"><h2 id="journey-bag">Your sample bag</h2><div className="journey-summary-row"><span>{quantity} × {item.name}<small>{size}</small></span><button type="button" onClick={()=>setStep(1)}>Edit</button></div><p>Prices and taxes will be displayed before checkout once the approved Toast menu is connected.</p></section>}
      {isPearl&&step===3&&<section aria-labelledby="journey-pickup"><h2 id="journey-pickup">Choose a pickup window</h2><p>Pickup capacity is not connected. This selection is for previewing the flow only.</p><label className="journey-field">Preferred time<input type="time" value={pickup} onChange={event=>setPickup(event.target.value)}/></label></section>}
      {isPearl&&step===4&&<section aria-labelledby="journey-review"><h2 id="journey-review">Review your sample order</h2><div className="journey-summary-row"><span>{quantity} × {size} {item.name}</span><button type="button" onClick={()=>setStep(1)}>Edit</button></div><div className="journey-summary-row"><span>Preferred pickup</span><span>{pickup||'Not selected'}</span></div><p className="journey-unavailable">Toast checkout is not enabled. No order was placed, and no pickup time is held.</p></section>}
      {!isPearl&&step===0&&<section aria-labelledby="journey-when"><h2 id="journey-when">When are you visiting?</h2><p>Choose a date and arrival window to see how parking will be requested.</p><div className="journey-field-grid"><label className="journey-field">Date<input type="date" min={today} value={date} onChange={event=>setDate(event.target.value)}/></label><label className="journey-field">Arrival<input type="time" value={arrival} onChange={event=>setArrival(event.target.value)}/></label><label className="journey-field">Duration<select value={duration} onChange={event=>setDuration(event.target.value)}><option>1 hour</option><option>2 hours</option><option>3 hours</option><option>4 hours</option><option>All day</option></select></label></div></section>}
      {!isPearl&&step===1&&<section aria-labelledby="journey-availability"><h2 id="journey-availability">Availability and rate</h2><p>The lot is planned for 21 spaces. Live inventory, operating hours, pricing, and booking rules are still being set.</p><div className="journey-state"><strong>Availability not connected</strong><span>No space is held by this preview.</span></div><button type="button" className="journey-text-button" onClick={()=>setStep(0)}>Change visit details</button></section>}
      {!isPearl&&step===2&&<section aria-labelledby="journey-vehicle"><h2 id="journey-vehicle">Vehicle details</h2><p>For this preview, use a sample vehicle label only. Do not enter a real license plate.</p><label className="journey-field">Sample vehicle label<input type="text" maxLength={30} placeholder="e.g. Blue sedan" value={vehicle} onChange={event=>setVehicle(event.target.value)}/></label></section>}
      {!isPearl&&step===3&&<section aria-labelledby="journey-parking-review"><h2 id="journey-parking-review">Review your sample visit</h2><div className="journey-summary-row"><span>Date and arrival</span><span>{date||'Not selected'} {arrival}</span></div><div className="journey-summary-row"><span>Duration</span><span>{duration}</span></div><div className="journey-summary-row"><span>Vehicle</span><span>{vehicle||'Not provided'}</span></div><p className="journey-unavailable">Square checkout and parking inventory are not enabled. No reservation or payment was made.</p></section>}
    </div>
    <div className="journey-controls">{step>0&&<button type="button" className="journey-back" onClick={()=>setStep(value=>value-1)}>Back</button>}{step<labels.length-1&&!(isPearl&&step===0)&&<button type="button" className="journey-next" disabled={!isPearl&&step===0&&(!date||!arrival)} onClick={()=>setStep(value=>value+1)}>Continue</button>}{step===labels.length-1&&<a href="/app">Back to the app</a>}</div>
    <footer className="journey-footer"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></footer>
  </div><CustomerNavigation active="home"/></main>;
}
