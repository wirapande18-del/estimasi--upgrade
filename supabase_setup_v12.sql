-- ESTIMASI APP V12 - SETUP DATABASE SUPABASE
-- Jalankan seluruh isi file ini di Supabase > SQL Editor > Run.
-- File ini tidak menghapus tabel atau data lama.

create extension if not exists pgcrypto;

create table if not exists public.spareparts (
  id uuid primary key default gen_random_uuid(),
  part_no text unique not null,
  part_name text not null default '-',
  price numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sublets (
  id uuid primary key default gen_random_uuid(),
  sublet_no text unique not null,
  sublet_name text not null default '-',
  price numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.advisors (
  id uuid primary key default gen_random_uuid(),
  nama text unique not null,
  jabatan text not null default 'Service Advisor',
  role text not null default 'SA',
  aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  polisi text unique not null,
  kendaraan text default '',
  rangka text default '',
  tahun text default '',
  customer text default '',
  contact text default '',
  phone text default '',
  alamat text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.labor_prices (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  price numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.estimasi_history (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null default '{}'::jsonb,
  grand_total numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Aktifkan RLS.
alter table public.spareparts enable row level security;
alter table public.sublets enable row level security;
alter table public.advisors enable row level security;
alter table public.customers enable row level security;
alter table public.labor_prices enable row level security;
alter table public.estimasi_history enable row level security;

-- Policy aplikasi internal menggunakan anon key.
-- Untuk tahap berikutnya dapat diperketat menjadi hanya user yang login.
do $$
declare
  t text;
begin
  foreach t in array array['spareparts','sublets','advisors','customers','labor_prices','estimasi_history']
  loop
    execute format('drop policy if exists %I on public.%I', t || '_select', t);
    execute format('drop policy if exists %I on public.%I', t || '_insert', t);
    execute format('drop policy if exists %I on public.%I', t || '_update', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete', t);
    execute format('create policy %I on public.%I for select using (true)', t || '_select', t);
    execute format('create policy %I on public.%I for insert with check (true)', t || '_insert', t);
    execute format('create policy %I on public.%I for update using (true) with check (true)', t || '_update', t);
    execute format('create policy %I on public.%I for delete using (true)', t || '_delete', t);
  end loop;
end $$;

-- Data awal. Data yang sudah ada tidak ditimpa sembarangan.
insert into public.advisors (nama, jabatan, role, aktif) values
('Komang Ayu Wardani', 'Service Advisor', 'SA', true),
('Pande Wira', 'Service Advisor', 'SA', true),
('I Nengah Andika', 'Kepala Bengkel', 'KABENG', true)
on conflict (nama) do nothing;

insert into public.labor_prices (name, price) values
('Tidak Ada', 0), ('LGGC', 180930), ('LCGC', 180930), ('NEW ENTRY', 180930),
('COM', 223110), ('ECO', 256410), ('PAS', 329670), ('MEXL', 567210),
('HEXL', 643800), ('CBU', 643800), ('LEXUS', 705960)
on conflict (name) do nothing;
