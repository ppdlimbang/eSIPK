let handler, caller, role, school, failAuth, updates, writes, linkedSchoolUsers;
const schoolId = '10000000-0000-0000-0000-000000000001';
class Response { constructor(body, options) { this.body = JSON.parse(body === 'ok' ? '{}' : body); this.status = options.status || 200; } }
const Deno = { env: { get: key => key }, serve: fn => { handler = fn; } };
const createClient = () => ({
  auth: {
    getUser: async () => ({data: {user: caller}}),
    admin: {
      getUserById: async () => ({data: {user: {id: 'school-user', email: 'old@example.com'}}}),
      updateUserById: async (id, values) => { updates.push({id, values}); return {error: failAuth ? new Error('duplicate') : null}; }
    }
  },
  from(table) {
    let values, one = false; const filters = [];
    const q = {
      select() { return q; }, eq(k,v) { filters.push([k,v]); return q; },
      single() { one = true; return q; }, maybeSingle() { one = true; return q; },
      update(v) { values = v; return q; },
      then(resolve, reject) {
        let rows = table === 'esipk_schools' ? [school] : [{id: caller.id, role}, ...linkedSchoolUsers];
        rows = rows.filter(row => filters.every(([k,v]) => row[k] === v));
        if (values) { writes++; rows.forEach(row => Object.assign(row, values)); }
        return Promise.resolve({data: one ? (rows[0] ? {...rows[0]} : null) : rows.map(row => ({...row}))}).then(resolve,reject);
      }
    }; return q;
  }
});
/* FUNCTION */
function reset() {
  caller = {id:'admin', email:'admin@moe.gov.my'}; role = 'admin'; failAuth = false; updates = []; writes = 0;
  school = {id:schoolId,display_name:'OLD School',school_code:'OLD',account_email:'old@example.com',account_editing:false};
  linkedSchoolUsers = [{id:'school-user', role:'school', school_id: schoolId}];
}
const payload = {schoolId,schoolName:'School Updated',schoolCode:'NEW',email:'new@example.com',password:''};
const ppdPayload = {schoolId,schoolName:'FLAT PENDIDIKAN',schoolCode:'Y050',email:'',password:''};
const call = (body = payload, authorization = true) => handler({method:'POST', headers:{get: () => authorization ? 'Bearer test' : null},json:async()=>body});
function check(value, message) { if (!value) throw new Error(message); }
(async () => {
  reset(); check((await call(payload,false)).status === 401 && writes === 0, 'Anonymous blocked');
  reset(); role = 'school'; check((await call()).status === 403 && writes === 0, 'School blocked even with admin email');
  reset(); caller.email = 'another@example.com'; check((await call()).status === 403 && writes === 0, 'Other admin blocked');
  reset(); check((await call({...payload,password:'short'})).status === 400 && writes === 0, 'Weak password blocked');
  reset(); check((await call()).status === 200, 'Update succeeds');
  check(school.school_code === 'NEW' && school.account_email === payload.email, 'School synchronized');
  check(!('password' in updates[0].values) && updates[0].id === 'school-user', 'Blank password preserves password and target is linked user');
  reset(); check((await call({...payload,password:'replacement-password'})).status === 200 && updates[0].values.password === 'replacement-password', 'Password reset submitted');
  reset(); failAuth = true; check((await call()).status === 500, 'Auth failure reported');
  check(school.school_code === 'OLD' && school.account_email === 'old@example.com', 'Auth failure restores school');
  reset(); linkedSchoolUsers = []; check((await call(ppdPayload)).status === 200, 'PPD-managed unit updates without school account');
  check(school.school_code === 'Y050' && school.account_email === null && updates.length === 0, 'PPD-managed unit skips Auth updates');
  print('PASS account permissions and updates');
})().catch(error => print('FAIL ' + error.stack));
