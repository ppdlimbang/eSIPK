# eSIPK

School quarters management for PPD Limbang. The separated React pages now use Supabase Auth, Postgres, and private Storage.

**Setup is required:** run the database migration and provision an administrator before logging in. Follow [the setup guide](docs/SETUP.md).

- Supabase project: `https://jluqnqqtwdnfccadbzxp.supabase.co`
- GitHub repository: `https://github.com/ppdlimbang/eSIPK`
- App preview: `http://localhost:8000/esipk_dashboard.html`
- GitHub Pages deployment: `https://ppdlimbang.github.io/eSIPK/` after Pages is enabled

The repository's existing `index.html` still embeds the Apps Script version. The Supabase app is `esipk_dashboard.html`; the existing live entry page has not been replaced. Data is not automatically migrated from Apps Script or the earlier browser preview.

GitHub Pages deploys the Supabase version from the `supabase-setup` branch through `.github/workflows/deploy-pages.yml`. Enable Pages with the GitHub Actions source once; each later push to that branch publishes a fresh build.

## Development

Edit `src/` files, then build and test:

```sh
python3 tools/build.py
python3 tools/test.py
python3 tools/test_render.py
python3 -m http.server 8000 --bind 127.0.0.1
```

The build needs Python 3 plus Node.js or macOS JavaScriptCore. Build dependencies are vendored. Browser dependencies load from CDNs. The generated HTML is committed, and CI checks that it matches the source.

| Page | Source | Route |
| --- | --- | --- |
| Login | `src/pages/LoginPage.jsx` | Displayed before login |
| Dashboard | `src/pages/DashboardPage.jsx` | `#/dashboard` |
| Pengisian | `src/pages/FormPage.jsx` | `#/form` |
| Muat Turun | `src/pages/DownloadsPage.jsx` | `#/muatTurun` |
| Tetapan | `src/pages/SettingsPage.jsx` | `#/settings` |

`src/config.js` contains the URL and browser-safe publishable key. Never add secret/service-role keys or passwords. `src/lib/supabase.js` handles authentication profiles, database operations, and file uploads. `src/useDashboard.js` manages UI state. The adapter retains the old operation names internally but does not call Apps Script or save records to local storage.

## Access rules

- Supabase Auth handles email/password login and session refresh. No embedded administrator password remains.
- Application data loads only after login and successful profile lookup.
- Profiles are provisioned through trusted SQL; users cannot promote themselves or change school assignments.
- Schools read and update their own quarters; administrators manage all schools and delete records.
- School access uses immutable school UUIDs. Names can change without moving records.
- Damage images are private and scoped by school. Shared documents are private to provisioned users and managed by administrators.
- Attachments store stable object references; the UI requests one-hour signed links and refreshes them while mounted.

## Validation and limits

Local checks cover the Supabase adapter using a mock transport, authentication transitions, save failures, routing, occupancy cleanup, pagination, and React rendering. GitHub Actions additionally runs the migration and SQL authorization checks against a disposable Postgres database with Supabase schema stand-ins. Real project integration still needs verification after setup.

Uploads are limited to 5 MB; damage images support JPEG, PNG, WebP, and GIF. The existing three-occupant room schema is retained. Removing a damage-image reference does not automatically delete its Storage object; administrators should periodically review unused uploads. Tailwind still generates utility styles in the browser. Existing Google Drive links can be retained, but their access remains controlled by Google Drive.
