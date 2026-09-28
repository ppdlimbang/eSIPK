const parseSchoolStr = (value) => {
  const text = String(value || '').trim();
  const match = text.match(/^([A-Za-z]{3}\d{4}|[A-Za-z]\d{3})\s+(?:-\s*)?(.+)$/);
  return match ? { code: match[1].toUpperCase(), name: match[2].trim() } : { code: '', name: text };
};
const isSchoolMatch = (left, right) => {
  const a = parseSchoolStr(left), b = parseSchoolStr(right);
  if (!a.name || !b.name) return false;
  if (a.code && b.code) return a.code === b.code;
  return a.name.toLowerCase() === b.name.toLowerCase();
};
const vacantOccupancyFields = {
  bilik1Status: 'Kosong', bilik1Penghuni: '',
  bilik2Status: 'Kosong', bilik2Penghuni: '',
  bilik3Status: 'Kosong', bilik3Penghuni: '',
  ketuaRumah: '',
  namaPenghuni: '', noKP: '', jawatan: '', noTelefon: '',
  stesenBertugas: '', tarikhMendiami: '',
  statusPerkahwinan: '', warden: ''
};
const clearVacantOccupancy = (data) => ({ ...data, ...vacantOccupancyFields });
const normalizeOccupancy = (data) => {
  if (data.statusHunian !== 'Berpenghuni') return clearVacantOccupancy(data);
  const result = { ...data };
  const rooms = Math.min(3, Math.max(1, Number(data.bilanganBilik) || 3));
  for (let i = 1; i <= 3; i++) {
    const room = `bilik${i}`;
    if (i > rooms) result[`${room}Status`] = 'Kosong';
    if (result[`${room}Status`] !== 'Diisi') {
      result[`${room}Penghuni`] = '';
      if (result.ketuaRumah === room) result.ketuaRumah = '';
    }
  }
  return result;
};
const routeNames = ['dashboard', 'form', 'muatTurun', 'logAktiviti', 'settings'];
const readRoute = () => {
  const route = window.location.hash.replace(/^#\/?/, '');
  return routeNames.includes(route) ? route : 'dashboard';
};

      // FUNGSI PEMAPAR IFRAME (KEBAL 404 & SEKATAN BROWSER)
      const getPreviewUrl = (url) => {
        if (!url) return '';
        const match = String(url).match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        const id = match ? match[1] : (String(url).match(/id=([a-zA-Z0-9_-]+)/) || [])[1];
        if (id) return `https://drive.google.com/file/d/${id}/preview`;
        return url;
      };

      // FUNGSI LIHAT SAIZ PENUH
      const getViewerUrl = (url) => {
        if (!url) return '';
        const match = String(url).match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        const id = match ? match[1] : (String(url).match(/id=([a-zA-Z0-9_-]+)/) || [])[1];
        if (id) return `https://drive.google.com/file/d/${id}/view`;
        return url;
      };


      const formatSchoolName = (name) => {
        if (!name) return '';
        return String(name).replace(/SEKOLAH KEBANGSAAN/gi, 'SK').replace(/SEKOLAH MENENGAH KEBANGSAAN/gi, 'SMK');
      };


const formatDateTimeString = (dateObj) => {
        if (!dateObj) return '-';
        const d = new Date(dateObj);
        if (isNaN(d.getTime())) return '-';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      };

      const criticalDamageStatus = 'Kerosakan Kritikal';
      const legacyCriticalDamageStatus = ['Rosak', 'Berat'].join(' ');
      const isCriticalDamageStatus = (value) => [criticalDamageStatus, legacyCriticalDamageStatus].includes(String(value || ''));
      const formatConditionStatus = (value) => isCriticalDamageStatus(value) ? criticalDamageStatus : String(value || '');
      const isConditionMatch = (value, filter) => {
        if (filter === 'Semua') return true;
        if (filter === criticalDamageStatus) return isCriticalDamageStatus(value);
        return String(value || '') === filter;
      };


      const specialSchoolOptions = {
        'flat pendidikan': ['Blok A', 'Blok B', 'Blok C'],
        'smk seri patiambun limbang': ['Flat A', 'Flat B', 'Kuarters', 'Rumah Pengetua'],
        'smk seri patiambun': ['Flat A', 'Flat B', 'Kuarters', 'Rumah Pengetua'],
        'smk kubong': ['Flat A', 'Flat B', 'Flat C', 'Rumah PK HEM', 'Rumah PKP', 'Rumah Pengetua'],
        'smk medamit': ['Flat Baru A', 'Flat Baru B', 'Flat Baru C', 'Flat Lama D', 'Flat Lama E', 'Kuarters', 'Rumah Pengetua'],
        'smk limbang': ['Flat A', 'Flat B', 'Flat Junior', 'Flat Lama', 'Kuarters', 'Rumah Pengetua'],
        'smk agama limbang': ['Flat A', 'Flat B', 'Flat C', 'Flat D', 'Rumah Pengetua']
      };

      const specialSchoolKey = (school) => formatSchoolName(parseSchoolStr(school).name).toLowerCase().replace(/\s+/g, ' ').trim();
      const getSpecialSchoolOptions = (school) => specialSchoolOptions[specialSchoolKey(school)] || null;

      const naturalCompare = (left, right) => String(left || '').localeCompare(String(right || ''), 'ms', { numeric: true, sensitivity: 'base' });
      const getSpecialRecordSortInfo = (record) => {
        const options = getSpecialSchoolOptions(record?.namaSekolah);
        const name = String(record?.namaKuarters || '').trim();
        if (!options || !name) return { hasSpecialOrder: false, buildingIndex: 999, unitText: name, unitNumbers: [] };
        const lowerName = name.toLowerCase();
        const buildingIndex = options.findIndex((option) => lowerName.startsWith(option.toLowerCase()));
        const matchedBuilding = buildingIndex >= 0 ? options[buildingIndex] : '';
        const unitText = matchedBuilding ? name.slice(matchedBuilding.length).replace(/^\s*[-–—:,]*\s*/, '') : name;
        const unitNumbers = (unitText.match(/\d+/g) || []).map((value) => Number(value));
        return { hasSpecialOrder: true, buildingIndex: buildingIndex >= 0 ? buildingIndex : 999, unitText, unitNumbers };
      };
      const compareUnitNumbers = (leftNumbers, rightNumbers) => {
        const length = Math.max(leftNumbers.length, rightNumbers.length);
        for (let i = 0; i < length; i++) {
          const left = leftNumbers[i] ?? -1;
          const right = rightNumbers[i] ?? -1;
          if (left !== right) return left - right;
        }
        return 0;
      };
      const compareSubmissionRecords = (left, right) => {
        const leftSchool = parseSchoolStr(left?.namaSekolah);
        const rightSchool = parseSchoolStr(right?.namaSekolah);
        const schoolOrder = naturalCompare(leftSchool.name || left?.namaSekolah, rightSchool.name || right?.namaSekolah) || naturalCompare(leftSchool.code, rightSchool.code);
        if (schoolOrder) return schoolOrder;
        const leftInfo = getSpecialRecordSortInfo(left);
        const rightInfo = getSpecialRecordSortInfo(right);
        if (leftInfo.hasSpecialOrder || rightInfo.hasSpecialOrder) {
          if (leftInfo.buildingIndex !== rightInfo.buildingIndex) return leftInfo.buildingIndex - rightInfo.buildingIndex;
          const unitOrder = compareUnitNumbers(leftInfo.unitNumbers, rightInfo.unitNumbers);
          if (unitOrder) return unitOrder;
          return naturalCompare(leftInfo.unitText, rightInfo.unitText);
        }
        return naturalCompare(left?.namaKuarters, right?.namaKuarters);
      };
      const sortSubmissionRecords = (records) => [...(Array.isArray(records) ? records : [])].sort(compareSubmissionRecords);
      const isPpdManagedLocation = (value) => {
        const parsed = typeof value === 'object' ? { code: value.code || '', name: value.name || '' } : parseSchoolStr(value);
        return parsed.code.toUpperCase() === 'Y050' && specialSchoolKey(parsed.name) === 'flat pendidikan';
      };
