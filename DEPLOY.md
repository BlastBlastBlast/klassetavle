# KlasseTavle — Deploy-guide

## Rask lokal start (uten backend)

```bash
npm install
npm run dev
# Åpne http://localhost:5173
# Fungerer uten Supabase — data lagres i localStorage
```

---

## Supabase oppsett (backend)

### Steg 1 — Opprett Supabase-prosjekt
1. Gå til [supabase.com](https://supabase.com) og klikk **New project**
2. Velg et navn (f.eks. `klassetavle`) og en region nær Norge (f.eks. `West EU`)
3. Vent til prosjektet er klart

### Steg 2 — Opprett databasetabell

Gå til **SQL Editor** i Supabase og kjør dette:

```sql
-- Boards-tabell
create table boards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null default 'Min tavle',
  data jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security: brukere ser bare sine egne tavler
alter table boards enable row level security;

create policy "Brukere kan lese egne tavler"
  on boards for select using (auth.uid() = user_id);

create policy "Brukere kan opprette tavler"
  on boards for insert with check (auth.uid() = user_id);

create policy "Brukere kan oppdatere egne tavler"
  on boards for update using (auth.uid() = user_id);

create policy "Brukere kan slette egne tavler"
  on boards for delete using (auth.uid() = user_id);
```

### Steg 3 — Opprett Storage bucket for bilder

Gå til **Storage** i Supabase og:
1. Klikk **New bucket**, kall den `images`, sett den til **Public**
2. Gå til **Policies** og legg til:

```sql
-- Brukere kan laste opp til sin egen mappe
create policy "Brukere kan laste opp bilder"
  on storage.objects for insert
  with check (bucket_id = 'images' and auth.uid()::text = (storage.foldername(name))[1]);

-- Alle kan lese bilder (public bucket)
create policy "Alle kan lese bilder"
  on storage.objects for select
  using (bucket_id = 'images');
```

### Steg 4 — Aktiver Magic Link auth

Gå til **Authentication → Providers** og sørg for at **Email** er aktivert.

### Steg 5 — Hent API-nøkler

Gå til **Settings → API** og kopier:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon / public key** → `VITE_SUPABASE_ANON_KEY`

### Steg 6 — Sett opp .env.local

```bash
cp .env.example .env.local
```

Fyll inn:
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Deploy til Vercel

### Steg 1 — Push til GitHub
```bash
git remote add origin https://github.com/BlastBlastBlast/klassetavle.git
git push -u origin main
```

### Steg 2 — Koble til Vercel
1. Gå til [vercel.com](https://vercel.com) → **Add New Project**
2. Velg GitHub-repositoriet `klassetavle`
3. Under **Environment Variables**, legg til:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Klikk **Deploy**

### Steg 3 — Eget domene (klassetavle.no)
1. Kjøp domenet på [domeneshop.no](https://domeneshop.no)
2. Vercel-dashboardet: **Settings → Domains** → skriv inn `klassetavle.no`
3. Hos Domeneshop, gå til **DNS** og legg til:
   - `A`-record: `@` → `76.76.21.21`
   - `CNAME`-record: `www` → `cname.vercel-dns.com`
4. Vent 5–30 min på DNS-propagering

### Steg 4 — Oppdater Supabase redirect URL
Gå til **Authentication → URL Configuration** og legg til:
```
https://klassetavle.no
https://klassetavle.no/**
```

---

## Lokal utvikling med produksjonsbygg

```bash
npm run build     # Bygger til /dist
npm run preview   # Forhåndsvis på http://localhost:4173
```

---

## Teknisk stack
| Lag | Teknologi |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| State | Zustand (localStorage + Supabase sync) |
| Drag/Resize | Custom pointer events + react-resizable |
| Backend | Supabase (Auth, Database, Storage) |
| Deploy | Vercel |
