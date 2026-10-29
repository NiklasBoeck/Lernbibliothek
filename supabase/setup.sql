-- Lernbibliothek: einmalig im Supabase SQL Editor ausführen (SQL Editor > New query > Run).

-- Metadaten der Skripte (Titel, Klausurstatus, Lesefortschritt, Lesezeichen)
create table if not exists public.scripts (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null,
  pages int not null default 0,
  status text not null default 'open' check (status in ('open', 'ready', 'done')),
  last_page int not null default 1,
  bookmarks int[] not null default '{}',
  zoom real not null default 1,
  locked boolean not null default false,
  added bigint not null default 0,
  last_opened bigint not null default 0,
  updated_at bigint not null default 0,
  deleted boolean not null default false
);
alter table public.scripts enable row level security;
drop policy if exists "Nur eigene Skripte" on public.scripts;
create policy "Nur eigene Skripte" on public.scripts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Privater Speicher für die PDFs und Titelbilder, ein Ordner pro Nutzer
insert into storage.buckets (id, name, public)
values ('skripte', 'skripte', false)
on conflict (id) do nothing;

drop policy if exists "Eigene Dateien lesen" on storage.objects;
drop policy if exists "Eigene Dateien hochladen" on storage.objects;
drop policy if exists "Eigene Dateien ändern" on storage.objects;
drop policy if exists "Eigene Dateien löschen" on storage.objects;
create policy "Eigene Dateien lesen" on storage.objects for select
  using (bucket_id = 'skripte' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Eigene Dateien hochladen" on storage.objects for insert
  with check (bucket_id = 'skripte' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Eigene Dateien ändern" on storage.objects for update
  using (bucket_id = 'skripte' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Eigene Dateien löschen" on storage.objects for delete
  using (bucket_id = 'skripte' and (storage.foldername(name))[1] = auth.uid()::text);
