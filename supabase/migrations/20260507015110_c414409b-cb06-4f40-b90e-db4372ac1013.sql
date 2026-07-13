
create table public.chatbot_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  source text default 'event-chatbot',
  message_count int default 0,
  created_at timestamptz not null default now()
);

alter table public.chatbot_leads enable row level security;

create policy "anyone can insert chatbot leads"
on public.chatbot_leads for insert
to anon, authenticated
with check (true);
