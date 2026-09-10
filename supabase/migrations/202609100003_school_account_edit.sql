begin;
alter table public.esipk_schools add column account_editing boolean not null default false;

-- School account edits go through the authenticated Edge Function only.
revoke update on public.esipk_schools from authenticated;
create function public.esipk_is_account_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.esipk_profiles p join auth.users u on u.id = p.id
    where p.id = (select auth.uid()) and p.role = 'admin'
      and lower(u.email) = 'ppdlimbang@moe.gov.my'
  );
$$;
revoke all on function public.esipk_is_account_admin() from public, anon;
grant execute on function public.esipk_is_account_admin() to authenticated;
alter policy schools_insert on public.esipk_schools with check (public.esipk_is_account_admin());
alter policy schools_delete on public.esipk_schools using (public.esipk_is_account_admin());
commit;
