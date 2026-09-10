# Connect eSIPK to Supabase

## Kemas kini akaun sekolah (10 September 2026)

1. Selepas migrasi 001 dan 002, jalankan keseluruhan `supabase/migrations/202609100003_school_account_edit.sql` sekali dalam SQL Editor.
2. Kemas kini kod Edge Function **create-school-account** menggunakan fail `supabase/functions/create-school-account/index.ts`, kemudian deploy semula.
3. Cipta Edge Function bernama tepat **update-school-account**. Tampal keseluruhan `supabase/functions/update-school-account/index.ts` ke dalam editor **index.ts**. Masukkan nama fungsi dalam kotak **Function name**, kemudian klik **Deploy function**.
4. Log masuk sebagai `ppdlimbang@moe.gov.my` dengan profil `admin`. Di Tetapan, klik ikon edit sekolah. Isi nama, kod dan e-mel; isi kata laluan baharu hanya jika hendak menukarnya. Klik Simpan.
5. Uji log masuk sekolah menggunakan maklumat baharu. Akaun sekolah tidak melihat Tetapan dan pautan `#/settings` akan dialihkan ke Dashboard.

Sekolah mesti mempunyai tepat satu profil akaun sekolah yang dipautkan. Rekod kuarters kekal dipautkan melalui ID sekolah walaupun nama atau kod berubah. Kata laluan lama tidak boleh dipaparkan.

Fungsi mengesahkan pengguna melalui Auth dan menyemak peranan serta e-mel pentadbir sebelum mengubah akaun. Perubahan e-mel/kata laluan menggunakan [Supabase Admin updateUserById](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid). Kemas kini langsung jadual sekolah oleh klien disekat supaya perubahan melalui fungsi ini.

Kemas kini Auth dan jadual sekolah melibatkan dua operasi berasingan. Jika Auth menolak kemas kini, fungsi cuba memulihkan rekod sekolah. Jika operasi terganggu atau pemulihan gagal, semak rekod Auth dan sekolah secara manual sebelum melepaskan `account_editing` kepada `false` melalui SQL Editor. Jangan lepaskan kunci ketika permintaan masih berjalan.

Ujian setempat: `python3 tools/test_accounts.py`, `python3 tools/test.py`, `python3 tools/test_render.py`. Ujian polisi SQL dijalankan dalam pangkalan data sementara GitHub Actions; jangan jalankan fail `tests/` pada projek sebenar.

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

Before registering a school from Tetapan, run `supabase/migrations/202609100002_school_accounts.sql` once in SQL Editor. Then deploy the `create-school-account` Edge Function from `supabase/functions/create-school-account/` in the Supabase Dashboard or CLI. The function uses the project-managed `SUPABASE_SERVICE_ROLE_KEY`; never place that key in the app, GitHub, or browser. The registration form requires school name, school code, school email, and a password with at least eight characters.

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
