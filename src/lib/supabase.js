let supabaseClient;
const getSupabase = () => {
  if (!window.supabase) throw new Error('Sambungan Supabase gagal dimuatkan. Sila muat semula halaman.');
  if (!supabaseClient) supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  });
  return supabaseClient;
};
const unwrap = ({ data, error }) => { if (error) throw error; return data; };
const getAuthProfile = async (user) => {
  const profile = unwrap(await getSupabase().from('esipk_profiles').select('role,school_id,esipk_schools(display_name)').eq('id', user.id).single());
  if (!profile || !['admin', 'school'].includes(profile.role) || (profile.role === 'school' && !profile.esipk_schools)) {
    throw new Error('Akaun belum diberi akses. Sila hubungi pentadbir.');
  }
  return { id: user.id, email: user.email, type: profile.role, schoolId: profile.school_id, schoolData: profile.esipk_schools?.display_name || null };
};
const signIn = async (email, password) => {
  const data = unwrap(await getSupabase().auth.signInWithPassword({ email, password }));
  return data.user;
};
const signOut = async () => { unwrap(await getSupabase().auth.signOut({ scope: 'local' })); };
const createSchoolAccount = async ({ schoolName, schoolCode, email, password }) => {
  const { data, error } = await getSupabase().functions.invoke('create-school-account', {
    body: { schoolName, schoolCode, email, password }
  });
  if (error) throw new Error(error.context?.message || error.message || 'Pendaftaran akaun sekolah gagal.');
  if (!data?.school) throw new Error(data?.message || 'Pendaftaran akaun sekolah gagal.');
  return data.school;
};
const listSchools = async () => unwrap(await getSupabase().from('esipk_schools').select('id,display_name').order('display_name'));
const schoolByName = async (name) => {
  const rows = await listSchools();
  const school = rows.find(row => row.display_name === name);
  if (!school) throw new Error('Sekolah tidak ditemui atau akses tidak dibenarkan.');
  return school;
};
const listRecords = async () => {
  const rows = [];
  // Supabase limits responses; page through the authorized rows to avoid truncated totals.
  for (let start = 0; ; start += 500) {
    const batch = unwrap(await getSupabase().from('esipk_quarters').select('id,data,created_at,updated_at,esipk_schools(display_name)').order('id').range(start, start + 499));
    rows.push(...batch.map(row => ({ ...row.data, id: row.id, namaSekolah: row.esipk_schools.display_name, createdAtDate: row.created_at, updatedAtDate: row.updated_at })));
    if (batch.length < 500) return rows;
  }
};
const listDocuments = async () => unwrap(await getSupabase().from('esipk_documents').select('*').order('created_at', { ascending: false }))
  .map(row => ({ id: row.id, tajuk: row.title, namaFail: row.file_name, url: 'storage://esipk-documents/' + row.path }));
const storageReference = (bucket, path) => 'storage://' + bucket + '/' + path;
const resolveAttachmentUrl = async (value) => {
  if (!value?.startsWith('storage://')) return /^https:\/\//i.test(value || '') ? value : '';
  const [bucket, ...parts] = value.slice(10).split('/');
  if (!['esipk-damage', 'esipk-documents'].includes(bucket) || !parts.length) throw new Error('Lampiran tidak sah.');
  return unwrap(await getSupabase().storage.from(bucket).createSignedUrl(parts.join('/'), 3600)).signedUrl;
};
const uploadAttachment = async (payload, bucket) => {
  const client = getSupabase();
  const bytes = Uint8Array.from(window.atob(payload.data), char => char.charCodeAt(0));
  if (bytes.length > 5 * 1024 * 1024) throw new Error('Saiz fail melebihi had 5MB.');
  if (bucket === 'esipk-damage' && !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(payload.mimeType)) throw new Error('Gunakan gambar JPEG, PNG, WebP atau GIF.');
  const folder = bucket === 'esipk-damage' ? (await schoolByName(payload.namaSekolah)).id : 'documents';
  const safeName = payload.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = folder + '/' + window.crypto.randomUUID() + '-' + safeName;
  unwrap(await client.storage.from(bucket).upload(path, bytes, { contentType: payload.mimeType, upsert: false }));
  return path;
};
// Adapter retains the UI's operation names; all data and files now use Supabase.
const runGas = async (name, ...args) => {
  const client = getSupabase();
  const [first, second] = args;
  switch (name) {
    case 'getSchools': return (await listSchools()).map(row => row.display_name);
    case 'getKuartersData': return listRecords();
    case 'getFilesList': return listDocuments();
    case 'saveKuartersData': case 'updateKuartersData': {
      const data = { ...(name === 'saveKuartersData' ? first : second) };
      const school = await schoolByName(data.namaSekolah);
      delete data.namaSekolah; delete data.createdAtDate; delete data.updatedAtDate; delete data.id;
      const values = { school_id: school.id, data };
      const query = name === 'saveKuartersData' ? client.from('esipk_quarters').insert(values) : client.from('esipk_quarters').update(values).eq('id', first);
      unwrap(await query.select('id').single()); return true;
    }
    case 'deleteKuartersData': unwrap(await client.from('esipk_quarters').delete().eq('id', first).select('id').single()); return true;
    case 'addSchool': unwrap(await client.from('esipk_schools').insert({ display_name: first })); return runGas('getSchools');
    case 'editSchool': {
      const parsed = parseSchoolStr(second);
      unwrap(await client.from('esipk_schools').update({ display_name: second, school_code: parsed.code || null }).eq('display_name', first).select('id').single());
      return runGas('getSchools');
    }
    case 'deleteSchool': unwrap(await client.from('esipk_schools').delete().eq('display_name', first).select('id').single()); return runGas('getSchools');
    case 'resetSchools': throw new Error('Tetapan semula sekolah tidak tersedia. Urus sekolah satu persatu.');
    case 'simpanImejKerosakan': return { success: true, url: storageReference('esipk-damage', await uploadAttachment(first, 'esipk-damage')) };
    case 'uploadFileToDrive': {
      const path = await uploadAttachment(first, 'esipk-documents');
      try { unwrap(await client.from('esipk_documents').insert({ title: first.tajuk, file_name: first.fileName, path })); }
      catch (error) { await client.storage.from('esipk-documents').remove([path]); throw error; }
      return { success: true, data: await listDocuments() };
    }
    case 'deleteFile': {
      const row = unwrap(await client.from('esipk_documents').select('path').eq('id', first).single());
      unwrap(await client.storage.from('esipk-documents').remove([row.path]));
      unwrap(await client.from('esipk_documents').delete().eq('id', first));
      return listDocuments();
    }
    default: throw new Error('Operasi tidak disokong: ' + name);
  }
};
