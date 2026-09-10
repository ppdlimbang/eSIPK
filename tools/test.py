#!/usr/bin/env python3
from pathlib import Path
import shutil
import subprocess
import tempfile
ROOT = Path(__file__).resolve().parent.parent
files = ['tests/regression.js', 'tests/supabase-mock.js', 'src/config.js', 'src/lib/utils.js', 'src/lib/api.js', 'src/lib/supabase.js', 'src/useDashboard.js', 'tests/cases.js']
source = '\n'.join((ROOT / name).read_text() for name in files)
node = shutil.which('node')
jsc = '/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc'
if node:
    source = 'const print = console.log;\n' + source
with tempfile.TemporaryDirectory() as folder:
    script = Path(folder) / 'tests.js'
    script.write_text(source)
    result = subprocess.run([node or jsc, str(script)], capture_output=True, text=True)
    print(result.stdout, end='')
    print(result.stderr, end='')
    if result.returncode or 'FAIL:' in result.stdout or 'PASS:' not in result.stdout:
        raise SystemExit(1)
