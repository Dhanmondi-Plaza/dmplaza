'use client';

import {useEffect, useRef, useState} from 'react';
import './customer-shell.css';
import './customer-journey-preview.css';

type Journey = 'pearl' | 'parking';
type SampleItem = {name: string; category: string};

const sampleItems: SampleItem[] = [
  {name: 'Milk tea', category: 'Tea'},
  {name: 'Matcha drink', category: 'Tea'},
  {name: 'Coffee drink', category: 'Coffee'},
];
const pearlSteps = ['Menu', 'Make it yours', 'Bag', 'Pickup', 'Review'];
const parkingSteps = ['Visit', 'Availability', 'Vehicle', 'Review'];

function Progress({steps, current}: {steps: string[]; current: number}) {
  return <div className="journey-progress" role="group" aria-label={`Step ${current + 1} of ${steps.length}: ${steps[current]}`}>
    <p><span>STEP {current + 1} OF {steps.length}</span><strong>{steps[current]}</strong></p>
    <div role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={current + 1} aria-label="Journey progress"><span style={{width: `${((current + 1) / steps.length) * 100}%`}}/></div>
  </div>;
}

export default function CustomerJourneyPreview({initialJourney}: {initialJourney: Journey}) {
  const [step, setStep] = useState(0);
  const [item, setItem] = useState<SampleItem>(sampleItems[0]);
  const [size, setSize] = useState('Regular');
  const [quantity, setQuantity] = useState(1);
  const [pickup, setPickup] = useState('');
  const [date, setDate] = useState('');
  const [arrival, setArrival] = useState('');
  const [duration, setDuration] = useState('2 hours');
  const [vehicle, setVehicle] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    const heading = contentRef.current?.querySelector('h2');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus();
  }, [step]);
  const isPearl = initialJourney === 'pearl';
  const steps = isPearl ? pearlSteps : parkingSteps;
  const nextLabel = isPearl
    ? ['Select a Drink', 'Add to Sample Bag', 'Choose Pickup Time', 'Review Sample Order'][step]
    : ['Preview Availability', 'Continue Preview', 'Review Sample Visit'][step];
  const canContinue = isPearl ? step !== 0 && (step !== 3 || !!pickup) : step !== 0 || (!!date && !!arrival);

  return <main className={`customer-preview-page ${isPearl ? 'journey-pearl' : 'journey-parking'}`}>
    <div className="customer-preview-wrap">
      <header className="journey-topbar">
        <a className="journey-exit" href="/app" aria-label="Back to DM Plaza app">← <span>DM Plaza</span></a>
        {isPearl ? <img className="journey-brand-logo" src="/bio/pearl-and-leaf/logo.webp" width="180" height="120" alt="Pearl & Leaf"/> : <strong>Parking</strong>}
      </header>

      <p className="journey-preview-label">INTERACTIVE PREVIEW <span aria-hidden="true">·</span> NO BOOKING OR PAYMENT</p>

      {isPearl && step === 0 && <div className="journey-pearl-hero">
        <img src="/bio/pearl-and-leaf/hero.webp" width="1200" height="800" alt="Iced tea with tapioca pearls beside tea leaves" fetchPriority="high"/>
        <div><h1>Better drinks. <br />Brighter days.</h1><span>Explore how pickup ordering will work.</span></div>
      </div>}
      {!isPearl && <div className="journey-parking-heading"><p>DM PLAZA PARKING</p><h1>Plan your parking.</h1><span>One visit at a time. Rates and live spaces are still being set up.</span></div>}
      {isPearl && step > 0 && <div className="journey-pearl-compact"><p>PEARL & LEAF</p><h1>{step === 1 ? 'Make it yours.' : step === 2 ? 'Your bag.' : step === 3 ? 'Pickup time.' : 'One last look.'}</h1></div>}

      <Progress steps={steps} current={step}/>

      <div key={`${initialJourney}-${step}`} ref={contentRef} className="journey-content">
        {isPearl && step === 0 && <section aria-labelledby="journey-menu">
          <div className="journey-section-heading"><h2 id="journey-menu">Menu preview</h2><span>Sample items</span></div>
          <p className="journey-note">The approved menu, prices, and availability will replace these examples.</p>
          <div className="journey-menu-list">{sampleItems.map(sample => <button type="button" key={sample.name} onClick={() => {setItem(sample); setStep(1)}}>
            <span><small>{sample.category}</small><strong>{sample.name}</strong></span><span aria-hidden="true">↗</span>
          </button>)}</div>
        </section>}

        {isPearl && step === 1 && <section aria-labelledby="journey-customize">
          <div className="journey-item-head"><img src="/bio/pearl-and-leaf/hero.webp" width="1200" height="800" alt="Illustrative iced tea drink"/><div><p>PREVIEW ITEM</p><h2 id="journey-customize">{item.name}</h2><span>Shown to test customization; final options will come from Toast.</span></div></div>
          <fieldset className="journey-choice"><legend>Size</legend>{['Regular', 'Large'].map(option => <label key={option}><input type="radio" name="sample-size" checked={size === option} onChange={() => setSize(option)}/><span>{option}</span></label>)}</fieldset>
          <div className="journey-quantity"><span>Quantity</span><div><button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity(value => value - 1)}>−</button><output key={quantity} aria-live="polite">{quantity}</output><button type="button" aria-label="Increase quantity" disabled={quantity >= 20} onClick={() => setQuantity(value => value + 1)}>+</button></div></div>
        </section>}

        {isPearl && step === 2 && <section aria-labelledby="journey-bag"><h2 id="journey-bag">Sample bag</h2><div className="journey-summary-row"><span>{quantity} × {item.name}<small>{size}</small></span><button type="button" onClick={() => setStep(1)}>Edit drink</button></div><p className="journey-note">A real bag will show item prices, tax, and totals before checkout.</p></section>}
        {isPearl && step === 3 && <section aria-labelledby="journey-pickup"><h2 id="journey-pickup">When would you pick up?</h2><p className="journey-note">This time is a preview choice. No pickup capacity is held.</p><label className="journey-field">Preferred time<input type="time" name="sample-pickup-time" autoComplete="off" value={pickup} onChange={event => setPickup(event.target.value)}/></label></section>}
        {isPearl && step === 4 && <section aria-labelledby="journey-review"><h2 id="journey-review">Review your sample order</h2><div className="journey-summary-row"><span>{quantity} × {size} {item.name}</span><button type="button" onClick={() => setStep(1)}>Edit drink</button></div><div className="journey-summary-row"><span>Preferred pickup</span><span>{pickup || 'Not selected'}</span></div><p className="journey-unavailable">Toast checkout is not connected. No order was placed, and no pickup time is held.</p></section>}

        {!isPearl && step === 0 && <section aria-labelledby="journey-when"><h2 id="journey-when">When are you visiting?</h2><div className="journey-field-grid"><label className="journey-field">Date<input type="date" name="sample-parking-date" autoComplete="off" value={date} onChange={event => setDate(event.target.value)}/></label><label className="journey-field">Arrival time<input type="time" name="sample-parking-arrival" autoComplete="off" value={arrival} onChange={event => setArrival(event.target.value)}/></label><label className="journey-field">Duration<select name="sample-parking-duration" value={duration} onChange={event => setDuration(event.target.value)}><option>1 hour</option><option>2 hours</option><option>3 hours</option><option>4 hours</option><option>All day</option></select></label></div></section>}
        {!isPearl && step === 1 && <section aria-labelledby="journey-availability"><h2 id="journey-availability">Availability & rate</h2><p className="journey-note">The initial lot is planned for 21 spaces. Live inventory, rates, and hours are not connected.</p><div className="journey-state"><strong>Availability not yet available</strong><span>No space is held by this preview.</span></div><button type="button" className="journey-text-button" onClick={() => setStep(0)}>Change visit details</button></section>}
        {!isPearl && step === 2 && <section aria-labelledby="journey-vehicle"><h2 id="journey-vehicle">Which vehicle?</h2><p className="journey-note">Use a sample label only. Do not enter a real license plate here.</p><label className="journey-field">Sample vehicle label<input type="text" name="sample-vehicle" autoComplete="off" maxLength={30} placeholder="Blue sedan…" value={vehicle} onChange={event => setVehicle(event.target.value)}/></label></section>}
        {!isPearl && step === 3 && <section aria-labelledby="journey-parking-review"><h2 id="journey-parking-review">Review your sample visit</h2><div className="journey-summary-row"><span>Date & arrival</span><span>{date || 'Not selected'} {arrival}</span></div><div className="journey-summary-row"><span>Duration</span><span>{duration}</span></div><div className="journey-summary-row"><span>Vehicle</span><span>{vehicle || 'Not provided'}</span></div><p className="journey-unavailable">Square checkout and parking inventory are not connected. No reservation or payment was made.</p></section>}
      </div>

      <div className="journey-actions">{step > 0 && <button type="button" className="journey-back" onClick={() => setStep(value => value - 1)}>Back</button>}{step < steps.length - 1 && !(isPearl && step === 0) && <button type="button" className="journey-next" disabled={!canContinue} onClick={() => setStep(value => value + 1)}>{nextLabel}</button>}{step === steps.length - 1 && <a href="/app">Return to DM Plaza</a>}</div>
      <footer className="journey-footer"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></footer>
    </div>
  </main>;
}
