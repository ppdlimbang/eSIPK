begin;
create table public.esipk_schools (
  id uuid primary key default gen_random_uuid(),
  display_name text not null unique check (length(trim(display_name)) > 0)
);
create table public.esipk_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'school')),
  school_id uuid references public.esipk_schools(id) on delete restrict,
  check ((role = 'admin' and school_id is null) or (role = 'school' and school_id is not null))
);
create table public.esipk_quarters (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.esipk_schools(id) on delete restrict,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index esipk_quarters_school on public.esipk_quarters(school_id);
create table public.esipk_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  file_name text not null,
  path text not null unique,
  created_at timestamptz not null default now()
);
-- Profiles can only be provisioned by a trusted administrator through SQL.
create function public.esipk_is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.esipk_profiles where id = (select auth.uid()) and role = 'admin');
$$;
create function public.esipk_can_access_school(target uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.esipk_profiles where id = (select auth.uid()) and (role = 'admin' or school_id = target));
$$;
create function public.esipk_is_member() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.esipk_profiles where id = (select auth.uid()));
$$;
revoke all on function public.esipk_is_admin(), public.esipk_can_access_school(uuid), public.esipk_is_member() from public, anon;
grant execute on function public.esipk_is_admin(), public.esipk_can_access_school(uuid), public.esipk_is_member() to authenticated;
alter table public.esipk_schools enable row level security;
alter table public.esipk_profiles enable row level security;
alter table public.esipk_quarters enable row level security;
alter table public.esipk_documents enable row level security;
revoke all on public.esipk_schools, public.esipk_profiles, public.esipk_quarters, public.esipk_documents from anon, authenticated;
grant select on public.esipk_profiles to authenticated;
grant select, insert, update, delete on public.esipk_schools, public.esipk_quarters, public.esipk_documents to authenticated;
create policy profiles_read_self on public.esipk_profiles for select to authenticated using (id = (select auth.uid()));
create policy schools_read on public.esipk_schools for select to authenticated using (public.esipk_can_access_school(id));
create policy schools_insert on public.esipk_schools for insert to authenticated with check (public.esipk_is_admin());
create policy schools_update on public.esipk_schools for update to authenticated using (public.esipk_is_admin()) with check (public.esipk_is_admin());
create policy schools_delete on public.esipk_schools for delete to authenticated using (public.esipk_is_admin());
create policy quarters_read on public.esipk_quarters for select to authenticated using (public.esipk_can_access_school(school_id));
create policy quarters_insert on public.esipk_quarters for insert to authenticated with check (public.esipk_can_access_school(school_id));
create policy quarters_update on public.esipk_quarters for update to authenticated using (public.esipk_can_access_school(school_id)) with check (public.esipk_can_access_school(school_id));
create policy quarters_delete on public.esipk_quarters for delete to authenticated using (public.esipk_is_admin());
create policy documents_read on public.esipk_documents for select to authenticated using (public.esipk_is_member());
create policy documents_insert on public.esipk_documents for insert to authenticated with check (public.esipk_is_admin());
create policy documents_delete on public.esipk_documents for delete to authenticated using (public.esipk_is_admin());
create function public.esipk_validate_quarter() returns trigger language plpgsql set search_path = '' as $$
begin
  if not public.esipk_is_admin() and coalesce(new.data->>'justifikasiPPD', '') <> case when TG_OP = 'INSERT' then '' else coalesce(old.data->>'justifikasiPPD', '') end then
    raise exception 'Only administrators can edit PPD justification';
  end if;
  if TG_OP = 'UPDATE' then new.created_at := old.created_at; end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger validate_quarter before insert or update on public.esipk_quarters for each row execute function public.esipk_validate_quarter();
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types) values
 ('esipk-damage', 'esipk-damage', false, 5242880, array['image/jpeg','image/png','image/webp','image/gif']),
 ('esipk-documents', 'esipk-documents', false, 5242880, null);
-- The first folder of every damage image is the immutable school UUID.
create function public.esipk_can_access_image(object_name text) returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.esipk_profiles where id = (select auth.uid()) and (role = 'admin' or school_id::text = split_part(object_name, '/', 1)));
$$;
revoke all on function public.esipk_can_access_image(text) from public, anon;
grant execute on function public.esipk_can_access_image(text) to authenticated;
create policy esipk_damage_read on storage.objects for select to authenticated using (bucket_id = 'esipk-damage' and public.esipk_can_access_image(name));
create policy esipk_damage_upload on storage.objects for insert to authenticated with check (bucket_id = 'esipk-damage' and public.esipk_can_access_image(name));
create policy esipk_damage_delete on storage.objects for delete to authenticated using (bucket_id = 'esipk-damage' and public.esipk_is_admin());
create policy esipk_documents_read on storage.objects for select to authenticated using (bucket_id = 'esipk-documents' and public.esipk_is_member());
create policy esipk_documents_upload on storage.objects for insert to authenticated with check (bucket_id = 'esipk-documents' and public.esipk_is_admin());
create policy esipk_documents_delete on storage.objects for delete to authenticated using (bucket_id = 'esipk-documents' and public.esipk_is_admin());
commit;
