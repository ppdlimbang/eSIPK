#!/usr/bin/env python3
"""Read-only project connectivity check. Never prints keys or response bodies."""
from pathlib import Path
import re
import urllib.request
import urllib.error
text = (Path(__file__).resolve().parent.parent / 'src/config.js').read_text()
url = re.search(r"url: '([^']+)'", text).group(1)
key = re.search(r"publishableKey: '([^']+)'", text).group(1)
for label, path in [('Supabase Auth', '/auth/v1/settings'), ('eSIPK schema', '/rest/v1/esipk_schools?select=id&limit=0')]:
    request = urllib.request.Request(url + path, headers={'apikey': key})
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            print(f'{label}: HTTP {response.status}')
    except urllib.error.HTTPError as error:
        print(f'{label}: HTTP {error.code}')
        if error.code == 404: print('The eSIPK migration may not have been applied yet.')
        elif error.code in (401, 403): print('Anonymous access denied; authenticated permissions must be checked after provisioning.')
    except urllib.error.URLError as error:
        print(f'{label}: connection failed ({error.reason})')
