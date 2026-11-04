-- Qualify the outer event ID; bare `id` resolves to the registration subquery.
drop policy customer_events_ticket_holder_read on os_api.customer_events;
create policy customer_events_ticket_holder_read on os_api.customer_events
  for select to authenticated using (
    exists (select 1 from os_api.customer_event_registrations registration
      where registration.event_id = customer_events.id
        and registration.user_id = (select auth.uid()))
  );

