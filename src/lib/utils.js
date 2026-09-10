const parseSchoolStr = (value) => {
  const text = String(value || '').trim();
  const match = text.match(/^([A-Za-z]{3}\d{4})\s+(?:-\s*)?(.+)$/);
  return match ? { code: match[1].toUpperCase(), name: match[2].trim() } : { code: '', name: text };
};
const isSchoolMatch = (left, right) => {
  const a = parseSchoolStr(left), b = parseSchoolStr(right);
  if (!a.name || !b.name) return false;
  if (a.code && b.code) return a.code === b.code;
  return a.name.toLowerCase() === b.name.toLowerCase();
};
const normalizeOccupancy = (data) => {
  const result = { ...data };
  const rooms = Math.min(3, Math.max(1, Number(data.bilanganBilik) || 3));
  for (let i = 1; i <= 3; i++) {
    const room = `bilik${i}`;
    if (i > rooms || (data.statusHunian !== 'Berpenghuni' && result[`${room}Status`] === 'Diisi')) result[`${room}Status`] = 'Kosong';
    if (result[`${room}Status`] !== 'Diisi') {
      result[`${room}Penghuni`] = '';
      if (result.ketuaRumah === room) result.ketuaRumah = '';
    }
  }
  if (data.statusHunian !== 'Berpenghuni') {
    ['namaPenghuni', 'noKP', 'jawatan', 'noTelefon', 'stesenBertugas', 'tarikhMendiami', 'statusPerkahwinan', 'warden'].forEach(key => result[key] = '');
  }
  return result;
};
const routeNames = ['dashboard', 'form', 'muatTurun', 'settings'];
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


      const specialSchoolOptions = {
        'flat pendidikan': ['Blok A', 'Blok B', 'Blok C'],
        'smk seri patiambun limbang': ['Flat A', 'Flat B', 'Kuarters', 'Rumah Pengetua'],
        'smk seri patiambun': ['Flat A', 'Flat B', 'Kuarters', 'Rumah Pengetua'],
        'smk kubong': ['Flat A', 'Flat B', 'Flat C', 'Rumah PK HEM', 'Rumah PKP', 'Rumah Pengetua'],
        'smk medamit': ['Flat Baru A', 'Flat Baru B', 'Flat Baru C', 'Flat Lama D', 'Flat Lama E', 'Kuarters', 'Rumah Pengetua'],
        'smk limbang': ['Flat A', 'Flat B', 'Flat Junior', 'Flat Lama', 'Kuarters', 'Rumah Pengetua'],
        'smk agama limbang': ['Flat A', 'Flat B', 'Flat C', 'Rumah Pengetua']
      };

      const specialSchoolKey = (school) => formatSchoolName(parseSchoolStr(school).name).toLowerCase().replace(/\s+/g, ' ').trim();
      const getSpecialSchoolOptions = (school) => specialSchoolOptions[specialSchoolKey(school)] || null;
