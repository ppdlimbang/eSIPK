#!/usr/bin/env python3
"""Verify newly imported accounts with real sign-in and school-scoped reads."""
import argparse
import json
from pathlib import Path
from import_school_accounts import Client, normalized_name, read_schools


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('xlsx', type=Path)
    parser.add_argument('report', type=Path)
    args = parser.parse_args()
    imported = {row['code'] for row in json.loads(args.report.read_text()) if row['status'] == 'created'}
    results = []
    for school in read_schools(args.xlsx):
        if school['schoolCode'] not in imported:
            continue
        client = Client()
        result = {'code': school['schoolCode'], 'verified': False}
        try:
            session = client.request('/auth/v1/token?grant_type=password', {
                'email': school['email'],
                'password': normalized_name(school['schoolName']) + '@' + school['schoolCode'].lower(),
            })
            client.token = session['access_token']
            uid = session['user']['id']
            del session
            profile = client.request('/rest/v1/esipk_profiles?select=role,school_id&id=eq.' + uid)
            visible = client.schools()
            result['verified'] = (len(profile) == 1 and profile[0]['role'] == 'school' and
                                  len(visible) == 1 and visible[0]['id'] == profile[0]['school_id'] and
                                  visible[0]['school_code'] == school['schoolCode'] and
                                  visible[0]['account_email'] == school['email'])
        except Exception as error:
            result['error'] = type(error).__name__
        finally:
            if client.token:
                try:
                    client.request('/auth/v1/logout?scope=local', method='POST')
                except Exception:
                    result['logout_failed'] = True
                client.token = None
        results.append(result)
        print(result['code'] + ': ' + ('verified' if result['verified'] else 'FAILED'), flush=True)
        if not result['verified']:
            break
    args.report.with_name('verification-result.json').write_text(json.dumps(results, indent=2) + '\n')
    passed = sum(row['verified'] for row in results)
    print(f'Verified {passed}/{len(imported)} newly created accounts.', flush=True)
    if passed != len(imported) or not imported:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
