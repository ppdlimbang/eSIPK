begin;

create table if not exists public.esipk_login_logs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.esipk_schools(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  created_at timestamptz not null default now()
);

create index if not exists esipk_login_logs_created_at on public.esipk_login_logs(created_at desc);
create index if not exists esipk_login_logs_school on public.esipk_login_logs(school_id);

alter table public.esipk_login_logs enable row level security;
revoke all on public.esipk_login_logs from anon, authenticated;
grant select, insert on public.esipk_login_logs to authenticated;

drop policy if exists login_logs_admin_read on public.esipk_login_logs;
create policy login_logs_admin_read on public.esipk_login_logs
  for select to authenticated using (public.esipk_is_admin());

drop policy if exists login_logs_school_insert_own on public.esipk_login_logs;
create policy login_logs_school_insert_own on public.esipk_login_logs
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and school_id = (
      select p.school_id
      from public.esipk_profiles p
      where p.id = (select auth.uid())
        and p.role = 'school'
    )
  );

commit;
