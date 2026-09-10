begin;
insert into auth.users(id,email) values
 ('00000000-0000-0000-0000-000000000001','admin@moe.gov.my'),
 ('00000000-0000-0000-0000-000000000002','other@example.com');
insert into public.esipk_profiles(id,role) values
 ('00000000-0000-0000-0000-000000000001','admin'),
 ('00000000-0000-0000-0000-000000000002','admin');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
do $$ declare denied boolean := false; begin
 if public.esipk_is_account_admin() then raise exception 'Other admin allowed'; end if;
 begin insert into public.esipk_schools(display_name) values ('Unauthorized'); exception when insufficient_privilege then denied := true; end;
 if not denied then raise exception 'Other admin created school'; end if;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
do $$ declare denied boolean := false; begin
 if not public.esipk_is_account_admin() then raise exception 'PPD admin denied'; end if;
 insert into public.esipk_schools(display_name) values ('Authorized');
 begin update public.esipk_schools set account_email='bypass@example.com'; exception when insufficient_privilege then denied := true; end;
 if not denied then raise exception 'Direct update bypassed account function'; end if;
end $$;
rollback;
