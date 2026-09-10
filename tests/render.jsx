const sample = {
  id: 'test-1', namaSekolah: 'YBA1234 SK CONTOH', namaKuarters: 'Unit fixture',
  statusHunian: 'Berpenghuni', statusFizikalKuarters: 'Baik', bilanganBilik: 3,
  namaPenghuni: 'Nama Ujian', bilik1Status: 'Diisi', bilik1Penghuni: 'Nama Ujian',
  bilik2Status: 'Kosong', bilik3Status: 'Kosong', gambarKerosakan: ''
};
function Fixture({ component: Component, overrides = {} }) {
  const model = useDashboard();
  return <AppContext.Provider value={{ ...model, ...overrides }}><Component /></AppContext.Provider>;
}
const cases = [
  ['Login', LoginPage, {}, 'Log Masuk'],
  ['Dashboard', DashboardPage, { view: 'dashboard', authUser: { type: 'admin' }, filteredSubmissions: Array.from({ length: 60 }, (_, i) => ({ ...sample, id: 'row-' + i })) }, 'Halaman 1 / 3'],
  ['School selection', FormPage, { view: 'form', authUser: { type: 'admin' }, schools: [sample.namaSekolah], submissions: [sample] }, 'Pilih Sekolah Anda'],
  ['Record form', FormPage, { view: 'form', activeSchool: sample.namaSekolah, roleFilteredSubmissions: [sample], authUser: { type: 'school' }, formData: sample }, 'Rekod Kuarters Semasa'],
  ['Downloads', DownloadsPage, { view: 'muatTurun', filesList: [] }, 'Pusat Muat Turun'],
  ['Settings', SettingsPage, { view: 'settings', authUser: { type: 'admin', email: 'admin@moe.gov.my' }, schools: [sample.namaSekolah] }, 'Tetapan Konfigurasi'],
  ['Unit details', UnitDetails, { selectedUnit: sample }, 'role="dialog"']
];
for (const [name, Component, overrides, expected] of cases) {
  const html = ReactDOMServer.renderToStaticMarkup(<Fixture component={Component} overrides={overrides} />);
  if (!html.includes(expected)) throw new Error(name + ' missing expected content');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  if (new Set(ids).size !== ids.length) throw new Error(name + ' has duplicate input IDs');
  if (name === 'Dashboard' && (html.match(/Unit fixture/g) || []).length !== 25) throw new Error('Dashboard did not paginate 60 records to 25');
  print('PASS render: ' + name);
}

for (const user of [{ type: 'school', email: 'school@example.com' }, { type: 'admin', email: 'other@example.com' }]) {
  const html = ReactDOMServer.renderToStaticMarkup(<Fixture component={SettingsPage} overrides={{view: 'settings', authUser: user}} />);
  if (html.includes('Urus Pangkalan Sekolah')) throw new Error('Unauthorized settings content rendered');
}
const editHtml = ReactDOMServer.renderToStaticMarkup(<Fixture component={SettingsPage} overrides={{
  view: 'settings', authUser: {type: 'admin', email: 'admin@moe.gov.my'},
  schools: [sample.namaSekolah], editingSchool: sample.namaSekolah,
  editSchoolEmail: 'school@example.com', editSchoolPassword: ''
}} />);
if (!editHtml.includes('Kata Laluan Baharu') || !editHtml.includes('school@example.com')) throw new Error('Missing account editing fields');
