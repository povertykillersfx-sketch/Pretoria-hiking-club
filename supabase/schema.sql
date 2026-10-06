-- Pretoria Hiking Club — run this in the Supabase SQL editor once.
-- Bookings and QR check-in tokens live here so Netlify serverless functions
-- never write to a local disk.

create table if not exists public.events (
  id bigint generated always as identity primary key,
  slug text not null unique,
  title text not null,
  category text not null default 'hike',
  summary text not null default '',
  description text not null default '',
  location text not null default '',
  meeting_point text not null default '',
  map_url text,
  event_date date not null,
  start_time text not null default '08:30',
  arrival_time text not null default '07:00',
  end_time text,
  distance_5km boolean not null default true,
  distance_10km boolean not null default true,
  difficulty text not null default 'Moderate',
  price_cents integer not null default 0,
  payment_link text,
  capacity integer not null default 60,
  image text not null default '/images/event-magaliesberg.jpg',
  gallery jsonb not null default '[]'::jsonb,
  schedule jsonb not null default '[]'::jsonb,
  includes jsonb not null default '[]'::jsonb,
  bring jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  bookings_closed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id bigint generated always as identity primary key,
  reference text not null unique,
  event_id bigint not null references public.events(id) on delete cascade,
  distance text not null default '5KM',
  name text not null,
  email text not null,
  phone text not null,
  people integer not null default 1 check (people between 1 and 10),
  amount_cents integer not null default 0,
  payment_method text not null default 'free',
  payment_status text not null default 'not_required',
  status text not null default 'confirmed',
  notes text,
  checkin_token text not null unique,
  qr_payload text not null unique,
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_bookings_event on public.bookings(event_id);
create index if not exists idx_bookings_email on public.bookings(email);
create index if not exists idx_events_date on public.events(event_date);

alter table public.events enable row level security;
alter table public.bookings enable row level security;

-- Server uses the service role key, which bypasses RLS. No anon policies:
-- hikers never talk to the tables directly.

create or replace function public.create_hike_booking(
  p_event_slug text,
  p_distance text,
  p_name text,
  p_email text,
  p_phone text,
  p_people integer,
  p_amount_cents integer,
  p_payment_method text,
  p_payment_status text,
  p_notes text,
  p_reference text,
  p_checkin_token text,
  p_qr_payload text
)
returns public.bookings
language plpgsql
as $$
declare
  ev public.events%rowtype;
  booked integer;
  rec public.bookings%rowtype;
  today date := (timezone('Africa/Johannesburg', now()))::date;
begin
  select * into ev from public.events where slug = p_event_slug for update;
  if not found then
    raise exception 'not_found';
  end if;

  if ev.event_date < today then
    raise exception 'closed';
  end if;

  if not ev.published or ev.bookings_closed then
    raise exception 'closed';
  end if;

  if p_people < 1 or p_people > 10 then
    raise exception 'invalid';
  end if;

  if p_distance = '5KM' and not ev.distance_5km then
    raise exception 'invalid';
  end if;

  if p_distance = '10KM' and not ev.distance_10km then
    raise exception 'invalid';
  end if;

  select coalesce(sum(people), 0) into booked
  from public.bookings
  where event_id = ev.id and status = 'confirmed';

  if p_people > (ev.capacity - booked) then
    raise exception 'sold_out';
  end if;

  insert into public.bookings (
    reference, event_id, distance, name, email, phone, people,
    amount_cents, payment_method, payment_status, status, notes,
    checkin_token, qr_payload
  ) values (
    p_reference, ev.id, p_distance, p_name, p_email, p_phone, p_people,
    p_amount_cents, p_payment_method, p_payment_status, 'confirmed', p_notes,
    p_checkin_token, p_qr_payload
  )
  returning * into rec;

  return rec;
end;
$$;

create or replace function public.check_in_hike_booking(p_booking_id bigint)
returns public.bookings
language plpgsql
as $$
declare
  rec public.bookings%rowtype;
begin
  update public.bookings
     set checked_in_at = now()
   where id = p_booking_id
     and checked_in_at is null
     and status = 'confirmed'
  returning * into rec;

  if not found then
    raise exception 'already_checked_in';
  end if;

  return rec;
end;
$$;
