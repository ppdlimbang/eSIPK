# Connect eSIPK to Supabase

The public URL and publishable key are already configured. The project key was verified against Supabase Auth. The database check returned HTTP 404 because the eSIPK tables are not installed yet.

## 1. Create the tables and access rules

1. Open [your project's SQL Editor](https://supabase.com/dashboard/project/jluqnqqtwdnfccadbzxp/sql/new).
2. Open `supabase/migrations/202609100001_esipk.sql` in this repository.
3. Copy the entire file into a new SQL query and click **Run** once.

The migration creates four `esipk_` tables, access policies, and two private Storage buckets. It runs in a transaction. Do not run the files under `tests/` against your real project; they are for disposable test databases only. If any named table or bucket already exists, stop and inspect it before changing the migration.

## 2. Create your administrator login

1. Open **Authentication → Users** in Supabase.
2. Use **Add user → Create new user** with your administrator email and a strong password. Confirm the email using the dashboard option if offered.
3. Copy that user's UUID.
4. Run the following in SQL Editor, replacing `ADMIN_USER_UUID`:

```sql
insert into public.esipk_profiles (id, role)
values ('ADMIN_USER_UUID'::uuid, 'admin');
```

No password belongs in this SQL, the source code, or GitHub. The previous browser-only username/password no longer works.

## 3. Log in and add schools

Start the preview and open `http://localhost:8000/esipk_dashboard.html`. Log in with the administrator **email and password** created in step 2. Add schools through **Tetapan**.

To provision a school account, create another Auth user, copy its UUID, and look up the school UUID:

```sql
select id, display_name from public.esipk_schools order by display_name;

insert into public.esipk_profiles (id, role, school_id)
values ('SCHOOL_USER_UUID'::uuid, 'school', 'SCHOOL_UUID'::uuid);
```

Public sign-up has no application access without a profile. For this administrator-provisioned system, disable new-user sign-ups in the Auth settings. Password reset/invitation screens are not implemented; use dashboard-created accounts for initial setup.

## 4. Verify before switching the live site

- Sign in as administrator and create a test school and quarters record.
- Sign in as a school user and confirm only their school's records appear.
- Try another school account and verify it cannot read the first school's records or images.
- Upload an image and a document, then verify previews and downloads.
- Sign out and verify the private data disappears.
- Run `python3 tools/check_connection.py` for a read-only connectivity check. Anonymous table access should be denied after applying the migration.

## GitHub

The `supabase-setup` branch is based on the repository's existing `main` history. `.github/workflows/checks.yml` builds the application, runs frontend tests, and tests database policies on a disposable Postgres service. It needs no Supabase or production database secrets.

The original `index.html` is preserved. Do not switch it to the new app until the migration, accounts, and access checks are complete. No production data or existing Apps Script users have been imported automatically.

References: [Supabase email/password Auth](https://supabase.com/docs/guides/auth/passwords), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control).
