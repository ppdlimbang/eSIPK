begin;

create or replace function public.esipk_is_account_admin()
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists(
    select 1
    from public.esipk_profiles p
    join auth.users u on u.id = p.id
    where p.id = (select auth.uid())
      and p.role = 'admin'
      and lower(u.email) = 'admin@moe.gov.my'
  );
$$;

revoke all on function public.esipk_is_account_admin() from public, anon;
grant execute on function public.esipk_is_account_admin() to authenticated;

commit;
