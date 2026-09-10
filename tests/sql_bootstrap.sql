-- CI-only stand-ins for Supabase-managed schemas. Never run on the live project.
create role anon nologin;
create role authenticated nologin;
create schema auth;
create schema storage;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid; $$;
grant usage on schema auth, public, storage to authenticated, anon;
grant execute on function auth.uid() to authenticated, anon;
create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id), name text);
alter table storage.objects enable row level security;
grant select, insert, delete on storage.objects to authenticated;
