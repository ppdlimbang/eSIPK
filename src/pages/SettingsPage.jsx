function SettingsPage() {
  const { editSchoolEmail, setEditSchoolEmail, editSchoolPassword, setEditSchoolPassword, handleEditSchoolStart, authUser, view, schools, filesList, newSchoolCode, setNewSchoolCode, newSchoolName, setNewSchoolName, newSchoolEmail, setNewSchoolEmail, newSchoolPassword, setNewSchoolPassword, loading, editingSchool, setEditingSchool, editSchoolCode, setEditSchoolCode, editSchoolName, setEditSchoolName, handleAddSchool, handleEditSchoolSave, handleDeleteSchool, handleResetSchools, handleFileUpload, handleDeleteFile, inputClass } = useAppContext();
  return (
<>
            {view === 'settings' && isSettingsAdmin(authUser) && (
              <div className="fade-in max-w-5xl mx-auto space-y-8">
                <div className="mb-4">
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tetapan Konfigurasi</h2>
                  <p className="mt-2 text-sm text-slate-500 font-medium">Urus senarai sekolah dan fail muat turun anda.</p>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 sm:p-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-50 p-2 rounded-xl text-blue-600 border border-blue-100"><Icons.FileText className="w-5 h-5"/></div>
                    <h3 className="text-lg font-bold text-slate-900">Urus Dokumen Muat Turun</h3>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-6 pl-12">Muat naik fail rujukan untuk dimuat turun oleh pengguna di tab Muat Turun.</p>

                  <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
                      <div><label htmlFor="tajukFailInput" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Tajuk Paparan</label><input type="text" id="tajukFailInput" placeholder="Cth: Pekeliling Kuarters 2024" className={inputClass} /></div>
                      <div><label htmlFor="failInput" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Pilih Fail</label><input type="file" id="failInput" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all shadow-sm" /></div>
                      <div className="md:col-span-2 flex justify-end mt-2"><button type="button" onClick={handleFileUpload} disabled={loading} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2">{loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><span className="text-yellow-400"><Icons.Plus /></span> Muat Naik Dokumen</>}</button></div>
                    </div>
                  </div>

                  {filesList && filesList.length > 0 && (
                    <div className="mt-6 border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <div className="max-h-64 overflow-y-auto p-3">
                        {filesList.map((f, index) => (
                          <div key={index} className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-xl transition-colors group mb-1 border border-transparent hover:border-slate-100">
                            <div className="flex flex-col"><span className="text-sm font-semibold text-slate-700">{f.tajuk}</span><span className="text-[10px] font-bold text-slate-400 tracking-widest mt-0.5">{f.namaFail}</span></div>
                            <button type="button" onClick={() => handleDeleteFile(f.id, f.tajuk)} className="text-slate-400 hover:text-rose-600 transition-all p-2 rounded-lg hover:bg-rose-50 opacity-0 group-hover:opacity-100" title="Padam Dokumen"><Icons.Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 sm:p-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600 border border-indigo-100"><Icons.Building2 className="w-5 h-5"/></div>
                    <h3 className="text-lg font-bold text-slate-900">Urus Pangkalan Sekolah</h3>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-6 pl-12">Daftar atau kemas kini akaun sekolah. Kosongkan kata laluan baharu untuk mengekalkan kata laluan semasa.</p>

                  <form onSubmit={handleAddSchool} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-200 shadow-inner">
                    <div><label htmlFor="school-code" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Kod Sekolah <span className="text-rose-500">*</span></label><input id="school-code" required pattern="[A-Za-z0-9-]{3,20}" title="Gunakan 3 hingga 20 huruf, nombor atau sengkang" type="text" value={newSchoolCode} onChange={(e) => setNewSchoolCode(e.target.value)} placeholder="Cth: YBA1234" className={inputClass} /></div>
                    <div><label htmlFor="school-name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Nama Sekolah <span className="text-rose-500">*</span></label><input id="school-name" required type="text" value={newSchoolName} onChange={(e) => setNewSchoolName(e.target.value)} placeholder="Cth: SK CONTOH" className={inputClass} /></div>
                    <div><label htmlFor="school-email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2">E-mel Sekolah <span className="text-rose-500">*</span></label><input id="school-email" required type="email" autoComplete="off" value={newSchoolEmail} onChange={(e) => setNewSchoolEmail(e.target.value)} placeholder="sekolah@moe.gov.my" className={inputClass} /></div>
                    <div><label htmlFor="school-password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Kata Laluan <span className="text-rose-500">*</span></label><input id="school-password" required minLength="8" type="password" autoComplete="new-password" value={newSchoolPassword} onChange={(e) => setNewSchoolPassword(e.target.value)} placeholder="Minimum 8 aksara" className={inputClass} /></div>
                    <div className="md:col-span-2 xl:col-span-4 flex justify-end"><button type="submit" disabled={loading} className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-2xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm flex items-center justify-center gap-2 h-[50px]">{loading ? 'Mendaftar...' : <><span className="text-yellow-400"><Icons.Plus /></span> Daftar Sekolah & Akaun</>}</button></div>
                  </form>

                  <div className="mt-8 border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <div className="max-h-96 overflow-y-auto p-3">
                      {(Array.isArray(schools)?schools:[]).map((sekolah, index) => {
                        if(!sekolah) return null;
                        const isEditing = editingSchool === sekolah;

                        if (isEditing) {
                          return (
                            <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-indigo-50/50 rounded-xl mb-1 border border-indigo-200">
                              <input aria-label="Kod Sekolah" type="text" value={editSchoolCode} onChange={(e) => setEditSchoolCode(e.target.value)} placeholder="Kod Sekolah" className="w-full sm:w-32 bg-white border border-indigo-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-sm uppercase" />
                              <input aria-label="Nama Sekolah" type="text" value={editSchoolName} onChange={(e) => setEditSchoolName(e.target.value)} placeholder="Nama Sekolah" className="flex-1 w-full bg-white border border-indigo-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-sm" autoFocus />
                              <label className="text-sm font-semibold">E-mel Sekolah<input type="email" value={editSchoolEmail} onChange={e => setEditSchoolEmail(e.target.value)} className={inputClass} /></label>
                              <label className="text-sm font-semibold">Kata Laluan Baharu<input type="password" autoComplete="new-password" minLength={8} value={editSchoolPassword} onChange={e => setEditSchoolPassword(e.target.value)} placeholder="Kosongkan untuk kekalkan kata laluan" className={inputClass} /></label>
                              <div className="flex w-full sm:w-auto gap-2">
                                <button type="button" onClick={() => handleEditSchoolSave(sekolah)} className="flex-1 sm:flex-none p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex justify-center items-center" title="Simpan"><Icons.CheckCircle2 className="w-5 h-5" /></button>
                                <button type="button" onClick={() => { setEditingSchool(null); setEditSchoolPassword(''); }} className="flex-1 sm:flex-none p-3 bg-white text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex justify-center items-center" title="Batal"><span className="font-bold">✕</span></button>
                              </div>
                            </div>
                          );
                        }
                        const { code, name } = parseSchoolStr(sekolah);
                        return (
                        <div key={index} className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-xl transition-colors group mb-1 border border-transparent hover:border-slate-100">
                          <div className="flex flex-col"><span className="text-sm font-semibold text-slate-700">{name}</span>{code && <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">{code}</span>}</div>
                          <div className="flex gap-1 transition-all">
                            <button type="button" onClick={() => handleEditSchoolStart(sekolah)} className="text-slate-400 hover:text-indigo-600 transition-all p-2 rounded-lg hover:bg-indigo-50" title="Kemaskini"><Icons.Edit3 className="w-4 h-4" /></button>
                            <button type="button" onClick={() => handleDeleteSchool(sekolah)} className="text-slate-400 hover:text-rose-600 transition-all p-2 rounded-lg hover:bg-rose-50" title="Padam"><Icons.Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">

                  </div>
                </div>
              </div>
            )}


</>
  );
}
