create table public.notification_subscribers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.notification_subscribers enable row level security;

create policy "Anyone can subscribe"
  on public.notification_subscribers for insert
  to anon, authenticated
  with check (true);

create policy "Staff view subscribers"
  on public.notification_subscribers for select
  to authenticated
  using (is_staff(auth.uid()));