import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('school_import', Path(__file__).resolve().parents[1] / 'tools/import_school_accounts.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class SchoolImportTests(unittest.TestCase):
    def test_abbreviations(self):
        for full, short in [
            ('SEKOLAH KEBANGSAAN BUKIT LUBA', 'skbukitluba'),
            ('SEKOLAH MENENGAH KEBANGSAAN KUBONG', 'smkkubong'),
            ('SEKOLAH MENENGAH KEBANGSAAN AGAMA LIMBANG', 'smkagamalimbang'),
            ('SEKOLAH JENIS KEBANGSAAN (CINA) CHUNG HWA LIMBANG', 'sjkcchunghwalimbang'),
            ('SEKOLAH KEBANGSAN BATU EMPAT LIMBANG', 'skbatuempatlimbang'),
            ('SEKOLAH KEBANGSAAN TEDUNGAN (BAMBANGAN)', 'sktedunganbambangan'),
        ]:
            self.assertEqual(module.normalized_name(full), short)

    def test_existing_school_matches_without_duplicate(self):
        incoming = {'schoolCode': 'YBA5123', 'schoolName': 'SEKOLAH KEBANGSAAN BANDAR LIMBANG', 'email': 'school@example.com'}
        existing = {'id': 'one', 'display_name': 'YBA5123 SK Bandar Limbang', 'account_email': 'school@example.com'}
        self.assertEqual(module.match_school(incoming, [existing])[0], 'existing')
        self.assertEqual(module.match_school(incoming, [{**existing, 'account_email': None}])[0], 'missing_account')
        self.assertEqual(module.match_school(incoming, [{**existing, 'account_email': 'other@example.com'}])[0], 'conflict')
        self.assertEqual(module.match_school(incoming, [existing, {**existing, 'id': 'two'}])[0], 'conflict')
        self.assertEqual(module.match_school(incoming, [])[0], 'new')


if __name__ == '__main__':
    unittest.main()
