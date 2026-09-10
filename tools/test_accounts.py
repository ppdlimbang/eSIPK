#!/usr/bin/env python3
import json, shutil, subprocess, tempfile
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
source = (ROOT / 'supabase/functions/update-school-account/index.ts').read_text().split('\n', 1)[1]
tests = (ROOT / 'tests/accounts.js').read_text()
compiler = str(ROOT / 'tools/vendor/babel.min.js')
node = shutil.which('node')
with tempfile.TemporaryDirectory() as folder:
    script = Path(folder) / 'accounts.js'
    prelude = ('const print = console.log; const Babel = require(' + json.dumps(compiler) + ');') if node else ('var console = {log:print,warn:print,error:print}; load(' + json.dumps(compiler) + ');')
    script.write_text(prelude + '\n' + tests.replace('/* FUNCTION */', 'eval(Babel.transform(' + json.dumps(source) + ', {filename:"index.ts", presets:["typescript"]}).code);'))
    result = subprocess.run([node or '/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc', str(script)], capture_output=True, text=True)
    print(result.stdout + result.stderr, end='')
    if result.returncode or 'PASS account permissions and updates' not in result.stdout or 'FAIL' in result.stdout: raise SystemExit(1)
