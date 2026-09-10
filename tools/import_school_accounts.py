#!/usr/bin/env python3
"""Import the official directory via authenticated eSIPK functions; dry-run by default.

Passwords and tokens stay in memory. Reports contain no passwords.
"""
import argparse
import collections
import getpass
import json
import re
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}


def short_name(name):
    name = ' '.join(name.upper().split())
    for pattern, replacement in [
        (r'^SEKOLAH MENENGAH KEBANGSAAN\b', 'SMK'),
        (r'^SEKOLAH JENIS KEBANGSAAN\s*\(CINA\)', 'SJKC'),
        (r'^SEKOLAH KEBANGSA+N\b', 'SK'),
        (r'^SJK\s*\(C\)', 'SJKC'),
    ]:
        name = re.sub(pattern, replacement, name)
    return name


def normalized_name(name):
    name = re.sub(r'^[A-Z]{3}\d{4}\s+', '', name.upper())
    return re.sub(r'[^a-z0-9]', '', short_name(name).lower())


def read_schools(path):
    schools = []
    with zipfile.ZipFile(path) as archive:
        strings = []
        if 'xl/sharedStrings.xml' in archive.namelist():
            strings = [''.join(t.text or '' for t in si.findall('.//s:t', NS))
                       for si in ET.fromstring(archive.read('xl/sharedStrings.xml')).findall('s:si', NS)]
        for filename in archive.namelist():
            if not re.fullmatch(r'xl/worksheets/sheet\d+\.xml', filename):
                continue
            for row in ET.fromstring(archive.read(filename)).findall('.//s:sheetData/s:row', NS):
                cells = {}
                for cell in row.findall('s:c', NS):
                    value = cell.find('s:v', NS)
                    value = value.text if value is not None else ''
                    if cell.get('t') == 's':
                        value = strings[int(value)]
                    elif cell.get('t') == 'inlineStr':
                        value = ''.join(t.text or '' for t in cell.findall('.//s:t', NS))
                    cells[re.sub(r'\d', '', cell.get('r'))] = value or ''
                code = cells.get('B', '').strip().upper()
                if not code or code == 'KOD SEKOLAH':
                    continue
                name = ' '.join(cells.get('C', '').split())
                email = cells.get('E', '').strip().lower()
                if not re.fullmatch(r'[A-Z]{3}\d{4}', code) or not name or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email):
                    raise ValueError('Invalid directory row ' + row.get('r'))
                schools.append({'schoolCode': code, 'schoolName': name, 'email': email})
    if not schools:
        raise ValueError('No schools found')
    for key in ('schoolCode', 'email'):
        if len({s[key] for s in schools}) != len(schools):
            raise ValueError('Duplicate ' + key + ' in spreadsheet')
    return schools


def match_school(incoming, existing):
    matches = []
    for school in existing:
        code = school.get('school_code') or school.get('display_name', '').split(' ')[0]
        if (code.upper() == incoming['schoolCode'] or
            (school.get('account_email') or '').lower() == incoming['email'] or
            normalized_name(school.get('display_name', '')) == normalized_name(incoming['schoolName'])):
            matches.append(school)
    if len(matches) > 1:
        return 'conflict', None
    if not matches:
        return 'new', None
    school = matches[0]
    if school.get('school_code') and school['school_code'].upper() != incoming['schoolCode']:
        return 'conflict', school
    if school.get('account_email') and school['account_email'].lower() != incoming['email']:
        return 'conflict', school
    return ('existing' if school.get('account_email') else 'missing_account'), school


class APIError(Exception):
    def __init__(self, status, message):
        self.status = status
        super().__init__(f'HTTP {status}: {message}')


class Client:
    def __init__(self):
        config = (ROOT / 'src/config.js').read_text()
        self.url = re.search(r"url: '([^']+)'", config).group(1)
        self.key = re.search(r"publishableKey: '([^']+)'", config).group(1)
        self.token = None

    def request(self, path, body=None, method=None):
        headers = {'apikey': self.key, 'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = 'Bearer ' + self.token
        req = urllib.request.Request(self.url + path, data=json.dumps(body).encode() if body is not None else None,
                                     headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=45) as res:
                value = res.read()
                return json.loads(value) if value else None
        except urllib.error.HTTPError as error:
            # Do not print response bodies: upstream errors can include submitted values.
            raise APIError(error.code, 'Request rejected; review function/Auth logs without sharing credentials') from None

    def schools(self):
        rows = []
        while True:
            batch = self.request('/rest/v1/esipk_schools?select=id,display_name,school_code,account_email&order=id&limit=500&offset=' + str(len(rows)))
            rows.extend(batch)
            if len(batch) < 500:
                return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('xlsx', type=Path)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--reset-existing', action='store_true', help='Explicitly reset existing accounts too')
    parser.add_argument('--report', type=Path, default=ROOT / 'local-import/report.json')
    args = parser.parse_args()
    schools = read_schools(args.xlsx)
    print(f'Validated {len(schools)} spreadsheet schools.', flush=True)
    client = Client()
    report = []
    try:
        password = getpass.getpass('PPD administrator password: ')
        session = client.request('/auth/v1/token?grant_type=password', {'email': 'admin@moe.gov.my', 'password': password})
        del password
        client.token = session['access_token']
        uid = session['user']['id']
        del session
        profile = client.request('/rest/v1/esipk_profiles?select=role&id=eq.' + uid)
        if profile != [{'role': 'admin'}]:
            raise ValueError('Designated account is not an administrator')
        existing = client.schools()
        for incoming in schools:
            status, matched = match_school(incoming, existing)
            item = {'code': incoming['schoolCode'], 'name': incoming['schoolName'], 'email': incoming['email'], 'status': status}
            report.append(item)
            if args.apply and (status == 'new' or (status == 'existing' and args.reset_existing)):
                body = dict(incoming)
                body['password'] = normalized_name(incoming['schoolName']) + '@' + incoming['schoolCode'].lower()
                function = 'create-school-account'
                if matched:
                    function = 'update-school-account'
                    body['schoolId'] = matched['id']
                try:
                    result = client.request('/functions/v1/' + function, body)
                    if not result or not result.get('school'):
                        raise ValueError('Function returned no school')
                    item['status'] = 'updated' if matched else 'created'
                    existing = client.schools()
                except Exception as error:
                    item['status'] = 'failed'
                    item['error'] = str(error) if isinstance(error, APIError) else type(error).__name__
                    print(item['code'] + ': ' + item['error'], flush=True)
                    # Stop after a failure; reruns re-check stored rows instead of retrying creates blindly.
                    break
                finally:
                    body.pop('password', None)
            print(item['code'] + ': ' + item['status'], flush=True)
        print(json.dumps(dict(collections.Counter(row['status'] for row in report))), flush=True)
    finally:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
        if client.token:
            try:
                client.request('/auth/v1/logout?scope=local', method='POST')
            except Exception:
                print('Could not close this import session; token not saved.', flush=True)
            client.token = None


if __name__ == '__main__':
    main()
