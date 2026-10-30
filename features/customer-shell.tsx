import './customer-shell.css';

export type CustomerView = 'home' | 'explore' | 'activity';

const destinations = [
  {label: 'Home', href: '/app', view: 'home'},
  {label: 'Explore', href: '/app?view=explore', view: 'explore'},
  {label: 'Activity', href: '/app?view=activity', view: 'activity'},
  {label: 'Account', href: '/account', view: 'account'},
] as const;

export function CustomerShellHeader() {
  return <header className="customer-shell-header"><a className="customer-shell-logo" href="/app" aria-label="DM Plaza app home"><img src="/bio/dm-plaza/logo.webp" alt="DM Plaza"/></a><a className="customer-shell-site" href="/">Visit DM Plaza <span aria-hidden="true">↗</span></a></header>;
}

export function CustomerNavigation({active}: {active: CustomerView | 'account'}) {
  return <nav className="customer-shell-nav" aria-label="Customer app">{destinations.map(item => <a key={item.view} href={item.href} aria-current={active === item.view ? 'page' : undefined}><span className={`customer-nav-mark customer-nav-mark--${item.view}`} aria-hidden="true"/><span>{item.label}</span></a>)}</nav>;
}
