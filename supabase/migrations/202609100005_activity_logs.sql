begin;

create table if not exists public.esipk_activity_logs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.esipk_schools(id) on delete cascade,
  quarter_id uuid not null references public.esipk_quarters(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('insert', 'update')),
  summary text not null,
  changes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists esipk_activity_logs_created_at on public.esipk_activity_logs(created_at desc);
create index if not exists esipk_activity_logs_school on public.esipk_activity_logs(school_id);

alter table public.esipk_activity_logs enable row level security;
revoke all on public.esipk_activity_logs from anon, authenticated;
grant select on public.esipk_activity_logs to authenticated;

drop policy if exists activity_logs_admin_read on public.esipk_activity_logs;
create policy activity_logs_admin_read on public.esipk_activity_logs
  for select to authenticated using (public.esipk_is_admin());

create or replace function public.esipk_log_school_activity()
returns trigger language plpgsql security definer set search_path = public, auth as $$
declare
  actor_role text;
  changed jsonb := '[]'::jsonb;
  field text;
  watched_fields text[] := array[
    'namaKuarters', 'statusHunian', 'statusFizikalKuarters', 'bilanganHunian',
    'jenisRumah', 'tahunDibina', 'bilanganBilik', 'justifikasi'
  ];
begin
  select role into actor_role from public.esipk_profiles where id = auth.uid();
  if actor_role <> 'school' then
    return new;
  end if;

  if TG_OP = 'INSERT' then
    insert into public.esipk_activity_logs(school_id, quarter_id, actor_id, action, summary, changes)
    values (
      new.school_id,
      new.id,
      auth.uid(),
      'insert',
      'Pengisian baharu: ' || coalesce(new.data->>'namaKuarters', 'Unit tanpa nama'),
      jsonb_build_array(
        jsonb_build_object('field', 'namaKuarters', 'after', coalesce(new.data->>'namaKuarters', '')),
        jsonb_build_object('field', 'statusHunian', 'after', coalesce(new.data->>'statusHunian', '')),
        jsonb_build_object('field', 'statusFizikalKuarters', 'after', coalesce(new.data->>'statusFizikalKuarters', ''))
      )
    );
    return new;
  end if;

  foreach field in array watched_fields loop
    if coalesce(old.data->>field, '') is distinct from coalesce(new.data->>field, '') then
      changed := changed || jsonb_build_array(jsonb_build_object(
        'field', field,
        'before', coalesce(old.data->>field, ''),
        'after', coalesce(new.data->>field, '')
      ));
    end if;
  end loop;

  if jsonb_array_length(changed) > 0 then
    insert into public.esipk_activity_logs(school_id, quarter_id, actor_id, action, summary, changes)
    values (
      new.school_id,
      new.id,
      auth.uid(),
      'update',
      'Perubahan rekod: ' || coalesce(new.data->>'namaKuarters', old.data->>'namaKuarters', 'Unit tanpa nama'),
      changed
    );
  end if;

  return new;
end;
$$;

drop trigger if exists log_school_activity on public.esipk_quarters;
create trigger log_school_activity
after insert or update on public.esipk_quarters
for each row execute function public.esipk_log_school_activity();

commit;
