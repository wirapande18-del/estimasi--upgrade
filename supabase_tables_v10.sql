-- Jalankan di Supabase > SQL Editor kalau tabel sublets belum ada.
-- Ini tidak mengubah data estimasi_history lama.

create table if not exists public.sublets (
  id uuid primary key default gen_random_uuid(),
  sublet_no text unique not null,
  sublet_name text not null default '-',
  price numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sublets enable row level security;

-- Policy sederhana untuk aplikasi internal. Jika sudah punya policy sendiri, boleh skip bagian ini.
drop policy if exists "sublets_select" on public.sublets;
drop policy if exists "sublets_insert" on public.sublets;
drop policy if exists "sublets_update" on public.sublets;
drop policy if exists "sublets_delete" on public.sublets;

create policy "sublets_select" on public.sublets for select using (true);
create policy "sublets_insert" on public.sublets for insert with check (true);
create policy "sublets_update" on public.sublets for update using (true) with check (true);
create policy "sublets_delete" on public.sublets for delete using (true);
create table if not exists advisors (
  id uuid primary key default gen_random_uuid(),
  nama text not null unique,
  jabatan text default 'Service Advisor',
  role text default 'SA',
  aktif boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table advisors enable row level security;

drop policy if exists "advisors_select_all" on advisors;
create policy "advisors_select_all" on advisors
for select using (true);

drop policy if exists "advisors_insert_all" on advisors;
create policy "advisors_insert_all" on advisors
for insert with check (true);

drop policy if exists "advisors_update_all" on advisors;
create policy "advisors_update_all" on advisors
for update using (true) with check (true);

drop policy if exists "advisors_delete_all" on advisors;
create policy "advisors_delete_all" on advisors
for delete using (true);

insert into advisors (nama, jabatan, role, aktif) values
('Komang Ayu Wardani', 'Service Advisor', 'SA', true),
('Pande Wira', 'Service Advisor', 'SA', true),
('I Nengah Andika', 'Kepala Bengkel', 'KABENG', true)
on conflict (nama) do update set
  jabatan = excluded.jabatan,
  role = excluded.role,
  aktif = excluded.aktif,
  updated_at = now();
