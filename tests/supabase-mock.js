const fixtures = {
  esipk_schools: [{ id: 'school-a', display_name: 'YBA1234 SK CONTOH' }, { id: 'school-b', display_name: 'YBA5678 SK CONTOH 2' }],
  esipk_profiles: [{ id: 'user-a', role: 'school', school_id: 'school-a' }, { id: 'admin', role: 'admin', school_id: null }],
  esipk_quarters: [{ id: 'record-a', school_id: 'school-a', data: { namaKuarters: 'Unit A', statusHunian: 'Tidak Berpenghuni', bilanganBilik: 3 }, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }],
  esipk_documents: []
};
let queryCount = 0, failNextMutation = false, authListener, activeSession = null;
const mockAuth = {
  onAuthStateChange(fn) { authListener = fn; fn('INITIAL_SESSION', activeSession); return { data: { subscription: { unsubscribe() {} } } }; },
  async signInWithPassword({ email, password }) {
    if (password !== 'test-password') return { error: new Error('Invalid login credentials') };
    const user = { id: email === 'admin@example.com' ? 'admin' : 'user-a', email };
    activeSession = { user }; authListener('SIGNED_IN', activeSession); return { data: { user } };
  },
  async signOut() { activeSession = null; authListener('SIGNED_OUT', null); return { error: null }; }
};
function mockQuery(table) {
  let action = 'read', values, filters = [], single = false, range = [0, Infinity];
  const query = {
    select() { return query; }, order() { return query; },
    range(a, b) { range = [a, b]; return query; },
    eq(key, value) { filters.push(row => row[key] === value); return query; },
    single() { single = true; return query; },
    insert(value) { action = 'insert'; values = value; return query; },
    update(value) { action = 'update'; values = value; return query; },
    delete() { action = 'delete'; return query; },
    then(resolve, reject) {
      queryCount++;
      try {
        if (action !== 'read' && failNextMutation) { failNextMutation = false; return Promise.resolve({ error: new Error('Write failed') }).then(resolve, reject); }
        let rows = fixtures[table].filter(row => filters.every(fn => fn(row)));
        if (action === 'insert') { const row = { id: 'new-' + queryCount, ...values }; fixtures[table].push(row); rows = [row]; }
        if (action === 'update') rows.forEach(row => Object.assign(row, values));
        if (action === 'delete') fixtures[table] = fixtures[table].filter(row => !rows.includes(row));
        rows = rows.slice(range[0], range[1] + 1).map(row => ({ ...row, ...(row.school_id ? { esipk_schools: fixtures.esipk_schools.find(s => s.id === row.school_id) } : {}) }));
        if (single && rows.length !== 1) return Promise.resolve({ error: new Error('Expected one row') }).then(resolve, reject);
        return Promise.resolve({ data: single ? rows[0] : rows }).then(resolve, reject);
      } catch (error) { return Promise.reject(error).then(resolve, reject); }
    }
  };
  return query;
}
window.supabase = { createClient: () => ({ auth: mockAuth, from: mockQuery }) };
