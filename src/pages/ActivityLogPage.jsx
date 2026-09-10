function ActivityLogPage() {
  const { authUser, view, loginLogs } = useAppContext();
  const rows = Array.isArray(loginLogs) ? loginLogs : [];
  const groupedLogs = useMemo(() => {
    const grouped = {};
    rows.forEach((log) => {
      const key = log.namaSekolah || log.email || 'Akaun tidak diketahui';
      if (!grouped[key]) grouped[key] = { namaSekolah: key, email: log.email || '-', count: 0, lastLogin: log.createdAtDate };
      grouped[key].count += 1;
      if (!grouped[key].lastLogin || new Date(log.createdAtDate) > new Date(grouped[key].lastLogin)) grouped[key].lastLogin = log.createdAtDate;
      if (log.email) grouped[key].email = log.email;
    });
    return Object.values(grouped).sort((a, b) => new Date(b.lastLogin || 0) - new Date(a.lastLogin || 0));
  }, [rows]);
  const totalLogins = rows.length;
  const activeSchools = groupedLogs.length;
  const latestLog = rows[0];

  if (view !== 'logAktiviti' || authUser?.type !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 fade-in">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-[0.25em] mb-2">Audit log masuk sekolah</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Log Aktiviti</h2>
          <p className="text-sm font-semibold text-slate-500 mt-2">Paparan admin sahaja untuk kekerapan, tarikh dan masa sekolah log masuk ke eSIPK.</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Log masuk terakhir</p>
          <p className="text-sm font-extrabold text-slate-900 mt-1">{latestLog ? formatDateTimeString(latestLog.createdAtDate) : '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-[1.75rem] border border-indigo-100 p-6 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5"><Icons.FileText className="w-6 h-6" /></div>
          <p className="text-4xl font-black text-indigo-700">{totalLogins}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Jumlah log masuk direkod</p>
        </div>
        <div className="bg-white rounded-[1.75rem] border border-emerald-100 p-6 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5"><Icons.School className="w-6 h-6" /></div>
          <p className="text-4xl font-black text-emerald-700">{activeSchools}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Sekolah pernah log masuk</p>
        </div>
        <div className="bg-white rounded-[1.75rem] border border-amber-100 p-6 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5"><Icons.Users className="w-6 h-6" /></div>
          <p className="text-4xl font-black text-amber-700">{groupedLogs[0]?.count || 0}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Kekerapan tertinggi</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-indigo-50 bg-indigo-50/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-slate-900">Kekerapan Mengikut Sekolah</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Disusun mengikut log masuk paling terkini.</p>
          </div>
          <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">{activeSchools} sekolah</span>
        </div>
        {groupedLogs.length === 0 ? (
          <div className="p-10 text-center text-sm font-semibold text-slate-400">Belum ada rekod log masuk sekolah.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-50">
                  <th className="px-6 py-4">Sekolah</th>
                  <th className="px-6 py-4">E-mel</th>
                  <th className="px-6 py-4 text-center">Kekerapan</th>
                  <th className="px-6 py-4">Log Masuk Terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {groupedLogs.map((log) => (
                  <tr key={log.namaSekolah} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-extrabold text-slate-800">{formatSchoolName(log.namaSekolah)}</td>
                    <td className="px-6 py-4 font-semibold text-slate-500">{log.email}</td>
                    <td className="px-6 py-4 text-center"><span className="inline-flex items-center justify-center min-w-10 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-black">{log.count}</span></td>
                    <td className="px-6 py-4 font-bold text-slate-600">{formatDateTimeString(log.lastLogin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-50">
          <h3 className="text-xl font-black text-slate-900">Senarai Log Masuk Terkini</h3>
          <p className="text-xs font-semibold text-slate-500 mt-1">Masa dan tarikh untuk 50 log masuk sekolah terbaru.</p>
        </div>
        {rows.length === 0 ? (
          <div className="p-10 text-center text-sm font-semibold text-slate-400">Belum ada sejarah log masuk.</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {rows.slice(0, 50).map((log) => (
              <div key={log.id} className="p-5 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-slate-50/70 transition-colors">
                <div>
                  <p className="font-extrabold text-slate-800">{formatSchoolName(log.namaSekolah || 'Sekolah tidak diketahui')}</p>
                  <p className="text-xs font-bold text-indigo-600 mt-1">{log.email || '-'}</p>
                </div>
                <p className="text-sm font-black text-slate-600 bg-slate-100 px-4 py-2 rounded-xl">{formatDateTimeString(log.createdAtDate)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
