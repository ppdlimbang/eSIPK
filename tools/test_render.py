#!/usr/bin/env python3
from pathlib import Path
import json
import shutil
import subprocess
import tempfile
from build import ROOT, SOURCES

source = 'const { useState, useEffect, useMemo, useRef } = React;\n'
for name in SOURCES:
    text = (ROOT / 'src' / name).read_text()
    if name == 'App.jsx': text = text.split('ReactDOM.createRoot')[0]
    source += text + '\n'
source += (ROOT / 'tests/render.jsx').read_text()
vendor = ROOT / 'tools/vendor'
node = shutil.which('node')
jsc = '/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc'
with tempfile.TemporaryDirectory() as folder:
    folder = Path(folder)
    jsx = folder / 'render.jsx'
    jsx.write_text(source)
    prelude = 'var self = this; var console = { log: print, warn: print, error: print, debug: function(){} }; var window = { location: { hash: "#/dashboard" } };\n'
    if node:
        driver = '''const fs = require('fs'), vm = require('vm');
const sandbox = vm.createContext({ print: console.log });
sandbox.load = path => vm.runInContext(fs.readFileSync(path, 'utf8'), sandbox);
sandbox.readFile = path => fs.readFileSync(path, 'utf8');
'''
        driver += f'vm.runInContext({json.dumps(prelude)}, sandbox);\n'
        for filename in ['babel.min.js', 'react.production.min.js', 'react-dom-server-legacy.browser.production.min.js']:
            driver += f'sandbox.load({json.dumps(str(vendor / filename))});\n'
        driver += f'vm.runInContext(sandbox.Babel.transform(sandbox.readFile({json.dumps(str(jsx))}), {{presets: ["react"]}}).code, sandbox);'
    else:
        driver = prelude
        for filename in ['babel.min.js', 'react.production.min.js', 'react-dom-server-legacy.browser.production.min.js']:
            driver += f'load({json.dumps(str(vendor / filename))});\n'
        driver += f'eval(Babel.transform(readFile({json.dumps(str(jsx))}), {{presets: ["react"]}}).code);'
    script = folder / 'driver.js'; script.write_text(driver)
    result = subprocess.run([node or jsc, str(script)], capture_output=True, text=True)
    print(result.stdout, end=''); print(result.stderr, end='')
    if result.returncode or result.stdout.count('PASS render:') != 7: raise SystemExit(1)
