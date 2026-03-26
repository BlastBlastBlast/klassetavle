# Supabase — Integrasjoner som må implementeres

Dette dokumentet holder oversikt over alt som skal kobles til Supabase
når backend-fasen starter. Lokalt fungerer alt via `localStorage`, men
for produksjon og delt lagring trenger vi databasen og storage.

---

## ✅ Allerede implementert (klar til å skrus på)

| Funksjon | Fil | Notat |
|---|---|---|
| Auth (magic link) | `src/lib/supabase.ts`, `src/store/authStore.ts` | Skjules hvis env-variabler mangler |
| Lagre/laste tavle | `src/lib/boardService.ts` → `boards`-tabellen | Hele board-state som JSON-blob |
| Multi-board (liste, bytt, slett) | `src/components/canvas/AuthBar.tsx` | UI klart |
| Bildeopplasting | `boardService.ts → uploadImage()` | Supabase Storage, bucket `images` |

**Hva som trengs for å aktivere:** Sett `VITE_SUPABASE_URL` og `VITE_SUPABASE_ANON_KEY` i `.env.local`.

---

## 🔲 Planlagt — ikke implementert ennå

### 1. Realtime student-visning (Phase C)
- **Hva:** Elever åpner en read-only URL og ser tavlen live
- **Tabell:** `board_sessions` — `{ id, board_id, teacher_id, state_json, updated_at }`
- **Mekanisme:** Supabase Realtime (channel subscribe) på `board_sessions`
- **Supabase-oppsett:**
  ```sql
  create table board_sessions (
    id uuid primary key default gen_random_uuid(),
    board_id uuid references boards(id) on delete cascade,
    teacher_id uuid references auth.users(id),
    state jsonb not null default '{}',
    updated_at timestamptz default now()
  );
  alter table board_sessions enable row level security;
  -- Lærere kan skrive (insert/update) egne sesjoner
  create policy "teacher_write" on board_sessions
    for all using (auth.uid() = teacher_id);
  -- Alle kan lese (elever er ikke innlogget)
  create policy "public_read" on board_sessions
    for select using (true);
  ```
- **Broadcast-kanal:** `realtime:board_sessions:id=eq.<session_id>`

---

### 2. Klasseromlister (Navnvelger-widget, Phase B)
- **Hva:** Lærer legger inn elevnavn, hjulet/trekkeren bruker dem
- **Tabell:** `class_lists` — `{ id, user_id, name, students: text[] }`
- **Widget:** `Navnvelger` — trekker tilfeldig navn
- **Supabase-oppsett:**
  ```sql
  create table class_lists (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id),
    name text not null,
    students text[] not null default '{}',
    created_at timestamptz default now()
  );
  alter table class_lists enable row level security;
  create policy "owner_only" on class_lists
    for all using (auth.uid() = user_id);
  ```

---

### 3. Poengtavle (Phase B)
- **Hva:** Team-poeng som persists mellom økter
- **Tabell:** `scoreboards` — `{ id, user_id, board_id, teams: jsonb }`
- **Struktur teams:** `[{ name: string, score: number, color: string }]`
- **Supabase-oppsett:**
  ```sql
  create table scoreboards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id),
    board_id uuid references boards(id) on delete cascade,
    teams jsonb not null default '[]',
    updated_at timestamptz default now()
  );
  alter table scoreboards enable row level security;
  create policy "owner_only" on scoreboards
    for all using (auth.uid() = user_id);
  ```

---

### 4. Bildeopplasting — bruker-isolasjon (forbedring)
- **Hva:** Nå lagres bilder under `{userId}/{timestamp}.{ext}` — dette er korrekt
- **Mangler:** Storage bucket-policy som sørger for at kun eieren kan slette
- **Supabase Storage policy:**
  ```sql
  -- Bucket: images (public read, autentisert write)
  create policy "public_read" on storage.objects
    for select using (bucket_id = 'images');
  create policy "auth_upload" on storage.objects
    for insert with check (
      bucket_id = 'images'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
  create policy "owner_delete" on storage.objects
    for delete using (
      bucket_id = 'images'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
  ```

---

### 5. Tidslinje / Timeplan (Klokke-widget)
- **Hva:** Lærer setter opp dagsplan (aktiviteter med tidspunkter) — bør lagres mellom dager
- **Tabell:** Del av `boards`-tabellen via `data`-kolonnen (JSON) — ingen ny tabell nødvendig
- **Status:** Klokke-widgeten lagrer allerede timeplan i widget `data`-feltet → persists via board-save

---

## SQL-oppsett til eksisterende tabeller

Kjøres i Supabase SQL Editor (se også `DEPLOY.md`):

```sql
-- Boards-tabellen (allerede i DEPLOY.md)
create table if not exists boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null default 'Min tavle',
  data jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table boards enable row level security;
create policy "owner_only" on boards
  for all using (auth.uid() = user_id);
```

---

## Prioriteringsrekkefølge

1. **Aktiver eksisterende** — sett env-variabler → auth + board-sync fungerer umiddelbart
2. **Storage policies** — sikre bildeopplasting (10 min jobb)
3. **Realtime student-visning** — største verdi for klasserombruk
4. **Klasseromlister** — nødvendig for Navnvelger-widget
5. **Poengtavle** — nice-to-have
