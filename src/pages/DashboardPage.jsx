function DashboardPage() {
  const { authUser, view, schools, activityLogs, searchTerm, setSearchTerm, selectedSchoolFilter, setSelectedSchoolFilter, statusFilter, setStatusFilter, kondisiFilter, setKondisiFilter, setSelectedUnit, filteredSubmissions, totalUnits, occupiedUnits, unoccupiedUnits, kondisiBaik, kondisiRosakRingan, kondisiRosakBerat, kondisiDiselenggara, exportToExcel } = useAppContext();
  const [page, setPage] = useState(1);
  const [showActivityLogs, setShowActivityLogs] = useState(false);
  const pageSize = 25;
  const pageCount = Math.max(1, Math.ceil(filteredSubmissions.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filteredSubmissions.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  useEffect(() => { setPage(1); }, [searchTerm, selectedSchoolFilter, statusFilter, kondisiFilter]);
  return (
<>
            {view === 'dashboard' && (
              <div className="fade-in space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h2>
                    <p className="text-sm text-slate-500 mt-2 font-medium">Laporan masa nyata status pendudukan premis {authUser?.type === 'admin' ? 'daerah' : 'anda'}.</p>
                  </div>
                  {authUser?.type === 'admin' && (
                    <div className="flex gap-3 w-full md:w-auto">
                      <button onClick={exportToExcel} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 border border-indigo-700 text-white hover:bg-indigo-700 px-5 py-3 rounded-xl text-sm font-bold shadow-sm transition-all"><Icons.Download /> Excel</button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-indigo-50/80 to-white p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-indigo-100 flex flex-col justify-between">
                    <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 mb-6"><Icons.Building2 /></div>
                    <div><p className="text-4xl font-extrabold text-indigo-900">{totalUnits}</p><p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-2">Kapasiti Terdaftar</p></div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50/80 to-white p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-emerald-100 flex flex-col justify-between">
                    <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100 mb-6"><Icons.Users /></div>
                    <div><p className="text-4xl font-extrabold text-emerald-700">{occupiedUnits}</p><p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-2">Sedang Dihuni</p></div>
                  </div>
                  <div className="bg-gradient-to-br from-rose-50/80 to-white p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-rose-100 flex flex-col justify-between">
                    <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm border border-rose-100 mb-6"><Icons.AlertTriangle /></div>
                    <div><p className="text-4xl font-extrabold text-rose-700">{unoccupiedUnits}</p><p className="text-xs font-bold text-rose-400 uppercase tracking-widest mt-2">Unit Kosong</p></div>
                  </div>
                </div>

                {authUser?.type === 'admin' && (
                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowActivityLogs((value) => !value)}
                      aria-expanded={showActivityLogs}
                      className="w-full p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-indigo-50/30 hover:bg-indigo-50/60 transition-colors text-left"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-slate-900">Notifikasi Aktiviti Sekolah</h3>
                          <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">{(activityLogs || []).length} terkini</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-500 mt-1">Paparan admin sahaja untuk pengisian baharu dan perubahan yang dibuat oleh sekolah.</p>
                      </div>
                      <span className="inline-flex items-center justify-center gap-2 bg-white border border-indigo-100 text-indigo-600 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm">
                        {showActivityLogs ? 'Sembunyi notifikasi' : 'Lihat notifikasi'}
                        <span className={`text-sm transition-transform ${showActivityLogs ? 'rotate-180' : ''}`}>⌄</span>
                      </span>
                    </button>
                    {showActivityLogs && (
                      <div className="divide-y divide-slate-100 border-t border-indigo-50/70">
                        {(!activityLogs || activityLogs.length === 0) ? (
                          <div className="p-6 text-sm font-medium text-slate-400">Belum ada aktiviti sekolah direkodkan.</div>
                        ) : (
                          activityLogs.slice(0, 8).map((log) => (
                            <div key={log.id} className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-start gap-4 hover:bg-slate-50/60 transition-colors">
                              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${log.action === 'insert' ? 'bg-emerald-50 text-emerald-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                {log.action === 'insert' ? <Icons.Plus className="w-5 h-5" /> : <Icons.Edit3 className="w-5 h-5" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                  <p className="font-bold text-slate-900">{log.summary}</p>
                                  <span className="text-[11px] font-bold text-slate-400">{formatDateTimeString(log.createdAtDate)}</span>
                                </div>
                                <p className="text-xs font-semibold text-indigo-600 mt-1">{parseSchoolStr(log.namaSekolah).name || log.namaSekolah}</p>
                                {Array.isArray(log.changes) && log.changes.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {log.changes.slice(0, 4).map((change, index) => (
                                      <span key={index} className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                                        {change.field}: {change.before ? `${formatConditionStatus(change.before)} → ` : ''}{formatConditionStatus(change.after) || 'Kosong'}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-8 mb-6">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Statistik Kondisi Fizikal Bangunan</h3>
                      <p className="text-xs font-semibold text-indigo-600 mt-1">Klik pada kad untuk menapis rekod di bawah</p>
                    </div>
                    {kondisiFilter !== 'Semua' && (
                      <button onClick={() => setKondisiFilter('Semua')} className="text-xs font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors">✕ Batal Tapisan</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                     <div onClick={() => setKondisiFilter(prev => prev === 'Baik' ? 'Semua' : 'Baik')} className={`p-5 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer transition-all hover:-translate-y-1 ${kondisiFilter === 'Baik' ? 'bg-emerald-50/80 border-2 border-emerald-400 ring-4 ring-emerald-500/10' : 'bg-white border border-emerald-100 hover:border-emerald-300'}`}>
                       <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Baik</p><p className="text-2xl font-extrabold text-emerald-600 mt-1">{kondisiBaik}</p></div>
                       <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500"><Icons.CheckCircle2 className="w-5 h-5"/></div>
                     </div>
                     <div onClick={() => setKondisiFilter(prev => prev === 'Rosak Ringan' ? 'Semua' : 'Rosak Ringan')} className={`p-5 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer transition-all hover:-translate-y-1 ${kondisiFilter === 'Rosak Ringan' ? 'bg-yellow-50/80 border-2 border-yellow-400 ring-4 ring-yellow-500/10' : 'bg-white border border-yellow-100 hover:border-yellow-300'}`}>
                       <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rosak Ringan</p><p className="text-2xl font-extrabold text-yellow-600 mt-1">{kondisiRosakRingan}</p></div>
                       <div className="h-10 w-10 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-500"><Icons.AlertTriangle className="w-5 h-5"/></div>
                     </div>
                     <div onClick={() => setKondisiFilter(prev => prev === criticalDamageStatus ? 'Semua' : criticalDamageStatus)} className={`p-5 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer transition-all hover:-translate-y-1 ${kondisiFilter === criticalDamageStatus ? 'bg-rose-50/80 border-2 border-rose-400 ring-4 ring-rose-500/10' : 'bg-white border border-rose-100 hover:border-rose-300'}`}>
                       <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kerosakan Kritikal</p><p className="text-2xl font-extrabold text-rose-600 mt-1">{kondisiRosakBerat}</p></div>
                       <div className="h-10 w-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-500"><Icons.AlertTriangle className="w-5 h-5"/></div>
                     </div>
                     <div onClick={() => setKondisiFilter(prev => prev === 'Sedang Diselenggara' ? 'Semua' : 'Sedang Diselenggara')} className={`p-5 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer transition-all hover:-translate-y-1 ${kondisiFilter === 'Sedang Diselenggara' ? 'bg-blue-50/80 border-2 border-blue-400 ring-4 ring-blue-500/10' : 'bg-white border border-blue-100 hover:border-blue-300'}`}>
                       <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diselenggara</p><p className="text-2xl font-extrabold text-blue-600 mt-1">{kondisiDiselenggara}</p></div>
                       <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500"><Icons.Sliders className="w-5 h-5"/></div>
                     </div>
                  </div>
                </div>

                {}
                <div className="w-full max-w-[1360px] mx-auto bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
                  <div className="p-4 sm:p-5 border-b border-indigo-50/50 flex flex-col lg:flex-row lg:items-center gap-3 justify-between bg-indigo-50/30">
                    <div className="relative w-full sm:max-w-md">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-indigo-400"><Icons.Search /></span>
                      <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari nama, kp, blok..." className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm" />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-48 px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm">
                        <option value="Semua">Semua Status</option>
                        <option value="Dihuni">Sedang Dihuni</option>
                        <option value="Kosong">Unit Kosong</option>
                      </select>
                      {authUser?.type === 'admin' && (
                        <select value={selectedSchoolFilter} onChange={(e) => setSelectedSchoolFilter(e.target.value)} className="w-full sm:w-64 px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm">
                          <option value="Semua">Semua Sekolah</option>
                          {(Array.isArray(schools)?schools:[]).map((s, i) => <option key={i} value={s}>{s}</option>)}
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto px-3 sm:px-5 pb-2 bg-white">
                    <table className="w-full min-w-[900px] table-fixed text-sm text-left">
                      <colgroup>
                        <col className="w-[30%]" />
                        <col className="w-[27%]" />
                        <col className="w-[25%]" />
                        <col className="w-[10%]" />
                        <col className="w-[8%]" />
                      </colgroup>
                      <thead>
                        <tr className="bg-slate-50/60 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                          <th scope="col" className="px-4 py-3">Sekolah / Unit</th>
                          <th scope="col" className="px-4 py-3">Ketua Rumah</th>
                          <th scope="col" className="px-4 py-3">Status & Kondisi</th>
                          <th scope="col" className="px-4 py-3">Tahun Dibina</th>
                          <th scope="col" className="px-4 py-3 text-center">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredSubmissions.length === 0 ? (
                          <tr><td colSpan="5" className="px-6 py-16 text-center text-slate-400 font-medium">Tiada data dijumpai.</td></tr>
                        ) : (
                          pageRows.map((sub) => {
                            if(!sub) return null;
                            let ketuaName = ''; let ketuaRole = '';
                            if (sub.statusHunian === 'Berpenghuni') {
                                if (sub.ketuaRumah && sub[`${sub.ketuaRumah}Status`] === 'Diisi') {
                                    ketuaName = sub[`${sub.ketuaRumah}Penghuni`];
                                    const roomNum = sub.ketuaRumah.replace('bilik', '');
                                    ketuaRole = `Ketua Rumah (Bilik ${roomNum})`;
                                } else if (sub.namaPenghuni) {
                                    ketuaName = sub.namaPenghuni; ketuaRole = sub.jawatan || 'Penghuni Utama';
                                }
                            }

                            return (
                            <tr key={sub.id} className="hover:bg-indigo-50/30 transition-colors group">
                              <td className="px-4 py-3 align-middle">
                                <div className="font-semibold text-slate-900 leading-tight">{String(sub.namaSekolah || '')}</div>
                                <div className="text-xs font-medium text-slate-500 mt-1 leading-snug">{String(sub.namaKuarters || '')}{sub.jenisRumah && <span className="text-slate-400"> · {String(sub.jenisRumah)}</span>}</div>
                              </td>
                              <td className="px-4 py-3 align-middle">
                                {ketuaName ? (
                                  <div>
                                    <div className="font-semibold text-slate-900 text-xs leading-snug flex flex-wrap items-center gap-x-1.5 gap-y-1">
                                      {String(ketuaName)} <span className="bg-amber-50 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-amber-200">KETUA</span>
                                    </div>
                                    <div className="text-[10px] font-medium text-slate-400 mt-0.5 leading-snug">{String(ketuaRole)}</div>
                                  </div>
                                ) : ( <div className="text-xs text-slate-400 italic font-medium bg-slate-50 px-2 py-1 rounded-md inline-block">Tiada penghuni</div> )}
                              </td>
                              <td className="px-4 py-3 align-middle">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-semibold text-slate-800 text-xs">
                                    <span className={`h-2 w-2 rounded-full ${sub.statusHunian === 'Berpenghuni' ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                                    {String(sub.statusHunian || '')}
                                  </span>
                                  {sub.statusFizikalKuarters && <span className="text-[10px] font-bold text-slate-600 px-2 py-1 bg-slate-100 rounded-md">{formatConditionStatus(sub.statusFizikalKuarters)}</span>}
                                  {(sub.projekNRDA === true || String(sub.projekNRDA).toUpperCase() === 'TRUE' || sub.projekNRDA === 'Ya') && <span className="text-[10px] font-bold text-indigo-600 px-2 py-1 bg-indigo-50 rounded-md">Projek NRDA</span>}
                                </div>
                              </td>
                              <td className="px-4 py-3 align-middle">
                                <span className="font-semibold text-slate-700 tabular-nums">{sub.tahunDibina ? String(sub.tahunDibina) : '-'}</span>
                              </td>
                              <td className="px-4 py-3 text-center align-middle">
                                <button type="button" onClick={() => setSelectedUnit(sub)} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors border border-indigo-100" title="Papar Butiran Penuh" aria-label="Papar butiran penuh"><Icons.Eye className="w-4 h-4" /></button>
                              </td>
                            </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  <nav aria-label="Halaman rekod" className="flex items-center justify-between gap-3 p-5 border-t border-slate-100">
                    <span className="text-sm text-slate-500">{filteredSubmissions.length} rekod • Halaman {currentPage} / {pageCount}</span>
                    <div className="flex gap-2">
                      <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="px-4 py-2 rounded-xl bg-slate-100 disabled:opacity-40">Sebelum</button>
                      <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-40">Seterusnya</button>
                    </div>
                  </nav>
                </div>
              </div>
            )}

            {}

</>
  );
}
