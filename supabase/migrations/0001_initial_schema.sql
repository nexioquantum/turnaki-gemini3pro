create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

create type public.role_type as enum ('ADMIN', 'ODONTOLOGO', 'ASISTENTE');
create type public.appointment_status as enum ('PENDIENTE', 'CONFIRMADA', 'ATENDIDA', 'NO_ASISTIO', 'CANCELADA');
create type public.appointment_origin as enum ('ODONTOLOGO', 'PACIENTE', 'ASISTENTE');
create type public.payment_status as enum ('PENDIENTE', 'PARCIAL', 'PAGADO');
create type public.payment_method as enum ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OTROS');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role role_type not null default 'ODONTOLOGO',
  active boolean not null default true,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  ci text unique,
  date_of_birth date,
  address text,
  phone text not null,
  email text,
  emergency_contact_name text,
  emergency_contact_phone text,
  allergies text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sillones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  active boolean not null default true,
  priority int not null default 1,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.odontologo_sillon (
  id uuid primary key default gen_random_uuid(),
  odontologo_id uuid not null references public.profiles(id) on delete cascade,
  sillon_id uuid not null references public.sillones(id) on delete cascade,
  priority int not null default 1,
  active boolean not null default true,
  valid_from date,
  valid_to date,
  unique (odontologo_id, sillon_id)
);

create table if not exists public.motivos_cita (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  position int not null default 1,
  active boolean not null default true
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  odontologo_id uuid not null references public.profiles(id),
  paciente_id uuid not null references public.patients(id),
  sillon_id uuid not null references public.sillones(id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  duration_minutes int generated always as ((extract(epoch from (end_at - start_at)) / 60)::int) stored,
  status appointment_status not null default 'PENDIENTE',
  origin appointment_origin not null default 'ODONTOLOGO',
  motivo_id uuid references public.motivos_cita(id),
  motivo_detalle text,
  honorario_estimado numeric(10,2),
  honorario_final numeric(10,2),
  estado_pago payment_status not null default 'PENDIENTE',
  metodo_pago_preferido payment_method,
  reprogramada_desde_id uuid references public.appointments(id),
  ultima_reprogramacion_at timestamptz,
  cancelada_por uuid references public.profiles(id),
  cancelada_at timestamptz,
  motivo_cancelacion text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pagos (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  amount numeric(10,2) not null,
  currency text not null default 'USD',
  method payment_method not null,
  paid_at timestamptz not null default now(),
  recorded_by uuid references public.profiles(id),
  notes text
);

create table if not exists public.cita_notas (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  motivo_id uuid references public.motivos_cita(id),
  extra_notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.cita_eventos (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  event_type text not null,
  description text,
  previous_data jsonb,
  new_data jsonb,
  triggered_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.metodos_pago_catalogo (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  active boolean not null default true
);

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.sillones enable row level security;
alter table public.odontologo_sillon enable row level security;
alter table public.appointments enable row level security;
alter table public.pagos enable row level security;
alter table public.cita_notas enable row level security;
alter table public.cita_eventos enable row level security;

create policy "Public profiles are viewable by authenticated users" on public.profiles
for select using (auth.uid() = id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
));

create policy "Users can manage their own profile" on public.profiles
for all using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Admins manage patients" on public.patients
for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'));

create policy "Odontologos read their patients" on public.patients
for select using (exists (
  select 1
  from public.appointments a
  where a.paciente_id = patients.id
    and a.odontologo_id = auth.uid()
));

create policy "Admins manage appointments" on public.appointments
for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'));

create policy "Odontologos manage their appointments" on public.appointments
for all using (auth.uid() = odontologo_id)
with check (auth.uid() = odontologo_id);
