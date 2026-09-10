begin;

alter table public.esipk_schools
  add column school_code text,
  add column account_email text;

alter table public.esipk_schools
  add constraint esipk_schools_school_code_format
  check (school_code is null or school_code ~ '^[A-Z0-9-]{3,20}$');

create unique index esipk_schools_school_code_unique
  on public.esipk_schools (school_code)
  where school_code is not null;

create unique index esipk_schools_account_email_unique
  on public.esipk_schools (lower(account_email))
  where account_email is not null;

commit;
