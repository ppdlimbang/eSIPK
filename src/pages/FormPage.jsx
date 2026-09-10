function FormPage() {
  const { authUser, view, submissions, schools, loading, setSelectedUnit, activeSchool, setActiveSchool, editingRecordId, setEditingRecordId, gambarFiles, setGambarFiles, namaBangunanDipilih, setNamaBangunanDipilih, unitBangunanDipilih, setUnitBangunanDipilih, initialFormState, formData, setFormData, roleFilteredSubmissions, handleChange, handleEditRow, handleCancelEdit, handleRemoveExistingImage, handleRemoveNewFile, handleSubmit, handleDeleteRow, inputClass, isSpecialSchool } = useAppContext();
  const schoolRecords = useMemo(() => roleFilteredSubmissions.filter(row => isSchoolMatch(row.namaSekolah, activeSchool)), [roleFilteredSubmissions, activeSchool]);
  const activeSpecialOptions = getSpecialSchoolOptions(activeSchool);
  return (
<>
            {view === 'form' && !activeSchool && authUser?.type === 'admin' && (
              <div className="fade-in w-full mx-auto mt-8">
                <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-8 sm:p-12 text-center">
                  <div className="mx-auto w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner border border-indigo-100/50"><Icons.School className="w-10 h-10" /></div>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">Pilih Sekolah Anda</h2>
                  <p className="text-sm text-slate-500 mb-8 font-medium px-4">Senarai sekolah. Kotak berwarna <span className="text-emerald-600 font-bold">hijau</span> menandakan sekolah tersebut telah menghantar maklumat.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 text-left">
                    {(Array.isArray(schools)?schools:[]).map((school, i) => {
                      if(!school) return null;
                      const { code, name } = parseSchoolStr(school);
                      const schoolSubmissions = (Array.isArray(submissions) ? submissions : []).filter(sub => sub && isSchoolMatch(sub.namaSekolah, school));
                      const hasSubmitted = schoolSubmissions.length > 0;

                      let latestUpdateDate = '';
                      if (hasSubmitted) {
                         const validDates = schoolSubmissions
                           .map(sub => {
                             if (!(sub.updatedAtDate || sub.createdAtDate)) return 0;
                             let d = new Date((sub.updatedAtDate || sub.createdAtDate));
                             // Membaca format pelik / manual DD/MM/YYYY jika ada
                             if (isNaN(d.getTime()) && typeof (sub.updatedAtDate || sub.createdAtDate) === 'string' && (sub.updatedAtDate || sub.createdAtDate).includes('/')) {
                                const parts = (sub.updatedAtDate || sub.createdAtDate).split('/');
                                if (parts.length >= 3) d = new Date(`${parts[2].substring(0,4)}-${parts[1]}-${parts[0]}T00:00:00Z`);
                             }
                             return isNaN(d.getTime()) ? 0 : d.getTime();
                           })
                           .filter(time => time > 0);

                         if (validDates.length > 0) {
                            const maxTime = Math.max(...validDates);
                            const d = new Date(maxTime);
                            latestUpdateDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                         }
                      }

                      return (
                      <button
                        key={i}
                        onClick={() => { setActiveSchool(school); setFormData(prev => ({...prev, namaSekolah: school})); }}
                        className={`relative flex items-start gap-3 sm:gap-4 border hover:shadow-md hover:-translate-y-1 rounded-2xl p-4 transition-all focus:outline-none focus:ring-4 group overflow-hidden min-h-[116px] ${hasSubmitted ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-500 focus:ring-emerald-500/20' : 'bg-slate-50 border-slate-200 hover:border-indigo-500 focus:ring-indigo-500/20'}`}
                      >
                        <div className={`h-11 w-11 sm:h-12 sm:w-12 mt-1 rounded-xl shadow-sm flex items-center justify-center shrink-0 transition-colors ${hasSubmitted ? 'bg-emerald-100 text-emerald-600 border border-emerald-200 group-hover:bg-emerald-200' : 'bg-white text-indigo-500 border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}><Icons.School /></div>
                        <div className="min-w-0 flex-1 flex flex-col text-left pt-0.5">
                          <div className="min-h-[24px] mb-1 flex justify-end">
                            {hasSubmitted && (
                              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 whitespace-nowrap" title={`${schoolSubmissions.length} Unit Direkodkan`}>
                                <Icons.CheckCircle2 className="w-3 h-3" /> {schoolSubmissions.length} Unit
                              </span>
                            )}
                          </div>
                          <span className={`font-semibold text-sm line-clamp-3 leading-tight transition-colors break-words ${hasSubmitted ? 'text-emerald-800 group-hover:text-emerald-900' : 'text-slate-700 group-hover:text-indigo-700'}`}>{name}</span>
                          {code && <span className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 transition-colors ${hasSubmitted ? 'text-emerald-500 group-hover:text-emerald-600' : 'text-slate-400 group-hover:text-indigo-400'}`}>{code}</span>}
                          {hasSubmitted && latestUpdateDate && <span className="text-[9px] font-bold text-emerald-600/70 mt-1">Kemaskini: {latestUpdateDate}</span>}
                        </div>
                      </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {view === 'form' && activeSchool && (
              <div className="fade-in space-y-8 max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] p-8 sm:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-indigo-800">
                  <div className="flex items-center gap-5">
                     <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-yellow-400 border border-white/20"><Icons.School className="w-8 h-8"/></div>
                     <div>
                       <p className="text-[11px] font-bold text-indigo-200 uppercase tracking-widest mb-1">{parseSchoolStr(activeSchool).code || 'Papan Pemuka Sekolah'}</p>
                       <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{parseSchoolStr(activeSchool).name}</h2>
                     </div>
                  </div>
                  {authUser?.type === 'admin' && (
                    <button onClick={() => { setActiveSchool(''); setFormData(initialFormState); setEditingRecordId(null); setGambarFiles([]); setNamaBangunanDipilih(''); setUnitBangunanDipilih(''); }} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all backdrop-blur-sm border border-white/10 whitespace-nowrap">Tukar Sekolah</button>
                  )}
                </div>

                <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-6 sm:p-10">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3"><span className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><Icons.Database /></span> Rekod Kuarters Semasa</h3>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">{schoolRecords.length} Unit</span>
                  </div>

                  {schoolRecords.length === 0 ? (
                     <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center"><p className="text-sm font-medium text-slate-500">Tiada rekod kuarters didaftarkan untuk sekolah ini lagi.</p></div>
                  ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                       {schoolRecords.map(sub => (
                         <div key={sub.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow relative">
                           <div className="absolute top-4 right-4 flex gap-1 z-10">
                             <button type="button" onClick={() => setSelectedUnit(sub)} className="p-2 bg-indigo-600 text-white shadow-md border border-indigo-700 rounded-xl hover:bg-indigo-700 transition-colors" title="Papar"><Icons.Eye className="w-4 h-4" /></button>
                             <button type="button" onClick={() => handleEditRow(sub)} className="p-2 bg-yellow-500 text-white shadow-md border border-yellow-600 rounded-xl hover:bg-yellow-600 transition-colors" title="Kemaskini"><Icons.Edit3 className="w-4 h-4" /></button>
                             {authUser?.type === 'admin' && (
                               <button type="button" onClick={() => handleDeleteRow(sub.id)} className="p-2 bg-rose-500 text-white shadow-md border border-rose-600 rounded-xl hover:bg-rose-600 transition-colors" title="Padam"><Icons.Trash2 className="w-4 h-4" /></button>
                             )}
                           </div>
                           <div className="flex justify-between items-start mb-3 pr-24">
                             <div>
                               <h4 className="font-bold text-slate-900 text-sm">{String(sub.namaKuarters || '')}</h4>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{String(sub.jenisRumah || '')}</p>
                             </div>
                           </div>
                           <div className="mb-3">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${sub.statusHunian === 'Berpenghuni' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                 {sub.statusHunian === 'Berpenghuni' ? 'Dihuni' : 'Kosong'}
                              </span>
                           </div>
                           {sub.statusHunian === 'Berpenghuni' ? (
                             <div className="bg-white border border-slate-100 p-3 rounded-xl mt-3"><p className="text-xs font-semibold text-slate-700">{String(sub.namaPenghuni || '')}</p><p className="text-[10px] text-slate-500 truncate">{String(sub.jawatan || '')}</p></div>
                           ) : (
                             <div className="bg-white border border-slate-100 p-3 rounded-xl mt-3"><p className="text-[10px] text-slate-400 font-bold uppercase">Kondisi</p><p className="text-xs font-semibold text-rose-600 mt-0.5">{String(sub.statusFizikalKuarters || '')}</p></div>
                           )}
                         </div>
                       ))}
                     </div>
                  )}
                </div>

                <div id="borang-pengisian" className="pt-6 border-t border-slate-200 mt-8">
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{editingRecordId ? 'Kemaskini Unit Kuarters' : 'Daftar Unit Baharu'}</h2>
                  <p className="mt-2 text-sm text-slate-500 font-medium">Borang pengisian ini diikat secara automatik kepada {parseSchoolStr(activeSchool).name}.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="bg-gradient-to-b from-blue-50/40 to-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-blue-100/50 p-6 sm:p-10">
                    <h3 className="text-base font-bold text-slate-900 mb-8 border-b border-blue-100/50 pb-4 flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</div> Profil Bangunan Kediaman
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {isSpecialSchool ? (
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                           <div>
                             <label htmlFor="formpage-field-1" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Nama Bangunan <span className="text-rose-500">*</span></label>
                             <select id="formpage-field-1" value={namaBangunanDipilih} onChange={(e) => setNamaBangunanDipilih(e.target.value)} required className={inputClass}>
                               <option value="" disabled>-- Sila Pilih --</option>
                               {activeSpecialOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                             </select>
                           </div>
                           <div>
                             <label htmlFor="formpage-field-2" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Tingkat / Nombor Unit <span className="text-rose-500">*</span></label>
                             <input id="formpage-field-2" type="text" value={unitBangunanDipilih} onChange={(e) => setUnitBangunanDipilih(e.target.value)} required placeholder="Cth: Tingkat 1, Unit 12" className={inputClass} />
                           </div>
                           <p className="md:col-span-2 text-[10px] text-blue-600 font-bold bg-blue-100/50 p-2 rounded-lg border border-blue-200">Sistem mengesan sekolah ini mempunyai struktur kuarters khas. Sila pilih nama bangunan dari senarai di atas.</p>
                        </div>
                      ) : (
                        <div>
                          <label htmlFor="formpage-field-3" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Nama/Label Kuarters <span className="text-rose-500">*</span></label>
                          <input id="formpage-field-3" required type="text" name="namaKuarters" value={formData.namaKuarters} onChange={handleChange} placeholder="Cth: Flat Guru Blok A, Unit 12" className={inputClass} />
                        </div>
                      )}

                      <div>
                        <label htmlFor="formpage-field-4" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Jenis Rumah</label>
                        <select id="formpage-field-4" name="jenisRumah" value={formData.jenisRumah} onChange={handleChange} className={inputClass}><option value="KUARTERS">KUARTERS</option><option value="FLAT">FLAT</option></select>
                      </div>
                      <div>
                        <label htmlFor="formpage-field-5" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Tahun Dibina</label>
                        <input id="formpage-field-5" type="number" name="tahunDibina" value={formData.tahunDibina} onChange={handleChange} placeholder="Cth: 2010" className={inputClass} />
                      </div>
                      <div>
                        <label htmlFor="formpage-field-6" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Kapasiti Bilik Utama</label>
                        <select id="formpage-field-6" name="bilanganBilik" value={formData.bilanganBilik} onChange={handleChange} className={inputClass}><option value="1">1 Bilik</option><option value="2">2 Bilik</option><option value="3">3 Bilik</option><option value="4">4 Bilik atau lebih</option></select>
                      </div>
                      <div>
                        <label htmlFor="formpage-field-7" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Kuantiti Unit</label>
                        <input id="formpage-field-7" type="number" min="1" name="bilanganHunian" value={formData.bilanganHunian} onChange={handleChange} className={inputClass} />
                      </div>
                      <div className="md:col-span-2 mt-2">
                        <label className="relative flex cursor-pointer items-center gap-3 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-colors">
                          <input type="checkbox" name="projekNRDA" checked={formData.projekNRDA} onChange={handleChange} className="w-5 h-5 text-indigo-600 rounded border-indigo-300 focus:ring-indigo-500" />
                          <span className="text-sm font-bold text-indigo-900">Bangunan ini dibina di bawah projek NRDA</span>
                        </label>
                      </div>
                      <div className="md:col-span-2 mt-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Status Pengisian Semasa <span className="text-rose-500">*</span></label>
                        <div className="grid grid-cols-2 gap-4">
                          <label className="relative flex cursor-pointer">
                            <input type="radio" name="statusHunian" value="Berpenghuni" checked={formData.statusHunian === 'Berpenghuni'} onChange={handleChange} className="peer sr-only radio-card" />
                            <span className="w-full rounded-2xl border-2 border-slate-100 bg-white px-6 py-5 text-sm font-semibold text-slate-600 transition-all peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white flex items-center justify-center gap-3"><span className="text-yellow-400"><Icons.CheckCircle2 /></span> Berpenghuni</span>
                          </label>
                          <label className="relative flex cursor-pointer">
                            <input type="radio" name="statusHunian" value="Tidak Berpenghuni" checked={formData.statusHunian === 'Tidak Berpenghuni'} onChange={handleChange} className="peer sr-only radio-card" />
                            <span className="w-full rounded-2xl border-2 border-slate-100 bg-white px-6 py-5 text-sm font-semibold text-slate-600 transition-all peer-checked:border-slate-800 peer-checked:bg-slate-800 peer-checked:text-white flex items-center justify-center gap-3"><Icons.AlertTriangle /> Kosong / Tidak Dihuni</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-b from-indigo-50/40 to-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-indigo-100/50 p-6 sm:p-10">
                    <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">2</div> Perincian Bilik Kongsi
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mb-8 border-b border-indigo-100/50 pb-4 ml-9">{formData.statusHunian === 'Berpenghuni' ? 'Isi sekiranya unit dikongsi bersama pegawai bujang lain. Maksimum tiga penghuni bilik direkodkan; bilik tambahan termasuk dalam jumlah bilik sahaja.' : 'Perincian bilik kongsi dikosongkan kerana unit ditanda sebagai Kosong / Tidak Dihuni.'}</p>
                    {formData.statusHunian === 'Berpenghuni' ? (
                      <div className="space-y-5">
                        {['bilik1', 'bilik2', 'bilik3'].slice(0, Math.min(3, Number(formData.bilanganBilik) || 3)).map((bilik, idx) => (
                          <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start bg-white/60 p-5 rounded-2xl border border-indigo-100/40 shadow-sm">
                            <div className="sm:col-span-2 pt-3"><span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Bilik {idx + 1}</span></div>
                            <div className="sm:col-span-4"><select name={`${bilik}Status`} value={formData[`${bilik}Status`]} onChange={handleChange} className={inputClass}><option value="Kosong">Sedia Didiami</option><option value="Diisi">Berpenghuni</option><option value="Rosak">Rosak / Tutup</option></select></div>
                            <div className="sm:col-span-6">
                              <input type="text" name={`${bilik}Penghuni`} value={formData[`${bilik}Penghuni`]} onChange={handleChange} disabled={formData[`${bilik}Status`] !== 'Diisi'} placeholder={formData[`${bilik}Status`] === 'Diisi' ? "Nama Penghuni..." : "Tidak berkaitan"} className={`${inputClass} ${formData[`${bilik}Status`] !== 'Diisi' ? 'bg-slate-50 border-transparent text-slate-400 shadow-none' : ''}`} />
                              {formData[`${bilik}Status`] === 'Diisi' && (
                                <label className="flex items-center gap-2 mt-3 cursor-pointer w-max pl-2">
                                  <input type="checkbox" name="ketuaRumah" value={bilik} checked={formData.ketuaRumah === bilik} onChange={(e) => { if (e.target.checked) setFormData(prev => ({ ...prev, ketuaRumah: bilik })); else setFormData(prev => ({ ...prev, ketuaRumah: '' })); }} className="w-4 h-4 text-indigo-600 rounded border-indigo-300 focus:ring-indigo-500" />
                                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">Tandakan Sebagai Ketua Rumah</span>
                                </label>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 text-sm font-semibold text-slate-500 flex items-center gap-3">
                        <Icons.AlertTriangle /> Semua status bilik, nama penghuni bilik dan ketua rumah akan disimpan kosong.
                      </div>
                    )}
                  </div>

                  {formData.statusHunian === 'Berpenghuni' && (
                    <div className="bg-gradient-to-b from-emerald-50/40 to-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-emerald-100/50 p-6 sm:p-10 fade-in">
                      <h3 className="text-base font-bold text-slate-900 mb-8 border-b border-emerald-100/50 pb-4 flex items-center gap-3"><div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">3</div> Maklumat Penghuni Utama</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2"><label htmlFor="formpage-field-8" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Nama Penuh <span className="text-rose-500">*</span></label><input id="formpage-field-8" required type="text" name="namaPenghuni" value={formData.namaPenghuni} onChange={handleChange} className={inputClass} /></div>
                        <div><label htmlFor="formpage-field-9" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">No. Kad Pengenalan <span className="text-rose-500">*</span></label><input id="formpage-field-9" required type="text" name="noKP" value={formData.noKP} onChange={handleChange} placeholder="Cth: 900101-13-5500" className={inputClass} /></div>
                        <div><label htmlFor="formpage-field-10" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Jawatan & Gred Hakiki <span className="text-rose-500">*</span></label><input id="formpage-field-10" required type="text" name="jawatan" value={formData.jawatan} onChange={handleChange} placeholder="Cth: Pegawai PPP, DG44" className={inputClass} /></div>
                        <div><label htmlFor="formpage-field-11" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">No. Telefon <span className="text-rose-500">*</span></label><input id="formpage-field-11" required type="tel" name="noTelefon" value={formData.noTelefon} onChange={handleChange} className={inputClass} /></div>
                        <div><label htmlFor="formpage-field-12" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Tarikh Mendiami <span className="text-rose-500">*</span></label><input id="formpage-field-12" required type="date" name="tarikhMendiami" value={formData.tarikhMendiami} onChange={handleChange} className={inputClass} /></div>
                        <div className="sm:col-span-2"><label htmlFor="formpage-field-13" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Stesen Tempat Bertugas <span className="text-rose-500">*</span></label><input id="formpage-field-13" required type="text" name="stesenBertugas" value={formData.stesenBertugas} onChange={handleChange} className={inputClass} /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label htmlFor="formpage-field-14" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Status Kahwin</label><select id="formpage-field-14" name="statusPerkahwinan" value={formData.statusPerkahwinan} onChange={handleChange} className={inputClass}><option value="Bujang">Bujang</option><option value="Berkahwin">Berkahwin</option></select></div>
                          <div><label htmlFor="formpage-field-15" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Warden Asrama?</label><select id="formpage-field-15" name="warden" value={formData.warden} onChange={handleChange} className={inputClass}><option value="Tidak">Bukan Warden</option><option value="Ya">Warden Asrama</option></select></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-b from-yellow-50/40 to-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-yellow-100/50 p-6 sm:p-10">
                    <h3 className="text-base font-bold text-slate-900 mb-8 border-b border-yellow-100/50 pb-4 flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold">{formData.statusHunian === 'Berpenghuni' ? '4' : '3'}</div> Kondisi Fizikal & Justifikasi
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label htmlFor="formpage-field-16" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Tahap Kelayakan Bangunan</label>
                        <select id="formpage-field-16" name="statusFizikalKuarters" value={formData.statusFizikalKuarters} onChange={handleChange} className={inputClass}>
                          <option value="Baik">Baik (Sedia Diduduki)</option>
                          <option value="Rosak Ringan">Rosak Ringan (Pembaikan Biasa)</option>
                          <option value="Rosak Berat">Kerosakan Kritikal (Tidak Selamat)</option>
                          <option value="Sedang Diselenggara">Sedang Dibaiki</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="formpage-field-17" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Status Kuarters</label>
                        <textarea id="formpage-field-17" name="justifikasi" rows="4" value={formData.justifikasi} onChange={handleChange} placeholder="Tuliskan sebarang nota, status atau punca mengapa unit tidak dihuni..." className={inputClass}></textarea>
                      </div>

                      <div>
                        <label htmlFor="formpage-field-18" className="block text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">JUSTIFIKASI PEGAWAI PEMBANGUNAN PPD / PENOLONG JURUTERA PPD {authUser?.type !== 'admin' && <span className="bg-slate-200 text-slate-500 text-[9px] px-2 py-0.5 rounded-md">Khas Admin</span>}</label>
                        <textarea id="formpage-field-18" name="justifikasiPPD" rows="4" value={formData.justifikasiPPD} onChange={handleChange} disabled={authUser?.type !== 'admin'} placeholder={authUser?.type === 'admin' ? "Ruangan ulasan khas untuk kegunaan pihak PPD..." : "Hanya Admin (PPD) yang boleh mengisi ruangan ini."} className={`${inputClass} ${authUser?.type !== 'admin' ? 'bg-slate-100 cursor-not-allowed text-slate-500 border-slate-200' : 'bg-indigo-50 border-indigo-200 text-indigo-900 focus:bg-white focus:ring-indigo-500/20'}`}></textarea>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Lampiran Gambar Kerosakan (Pilihan)</label>

                        <p className="text-[11px] text-rose-600 mb-2 font-extrabold bg-rose-50 p-3 rounded-xl border border-rose-100 flex items-start gap-2">
                          <Icons.AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          SILA NAMAKAN SEMULA (RENAME) GAMBAR MENGIKUT JENIS KEROSAKAN SEBELUM MUAT NAIK. <br/> Contoh: Sinki_Bocor.jpg, Tandas_Rosak.png
                        </p>

                        <input type="file" accept="image/*" multiple onChange={(e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10 || files.some(file => !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024)) {
      window.alert('Pilih maksimum 10 gambar, setiap satu tidak melebihi 5MB.'); e.target.value = ''; return;
    }
    setGambarFiles(files);
  }} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all shadow-sm" />
                        <p className="text-[10px] text-slate-400 mt-1.5 ml-2 font-medium">Boleh pilih lebih daripada satu gambar serentak.</p>

                        {formData.gambarKerosakan && gambarFiles.length === 0 && (
                          <div className="mt-4 space-y-2">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Gambar Terdahulu:</p>
                             {formData.gambarKerosakan.split(',').map((url, idx) => {
                                const trimmedUrl = url.trim();
                                if(!trimmedUrl) return null;
                                return (
                                  <div key={idx} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-sm">
                                    <p className="text-xs text-indigo-600 font-semibold flex items-center gap-2 truncate pr-4">
                                      <Icons.ImageIcon className="w-4 h-4 shrink-0"/>
                                      <Attachment value={trimmedUrl} target="_blank" rel="noreferrer" className="hover:underline truncate">Lampiran {idx + 1} Semasa</Attachment>
                                    </p>
                                    <button type="button" onClick={() => handleRemoveExistingImage(idx)} className="p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors border border-transparent hover:border-rose-200 shrink-0" title="Padam Gambar Ini">
                                      <Icons.Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                );
                             })}
                          </div>
                        )}

                        {gambarFiles.length > 0 && (
                          <div className="mt-4 space-y-2">
                             <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-1">Sedia Dimuat Naik:</p>
                             {gambarFiles.map((file, idx) => (
                               <div key={idx} className="flex items-center justify-between bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 shadow-sm">
                                 <p className="text-xs text-emerald-700 font-semibold flex items-center gap-2 truncate pr-4">
                                   <Icons.CheckCircle2 className="w-4 h-4 shrink-0"/> <span className="truncate">{file.name}</span>
                                 </p>
                                 <button type="button" onClick={() => handleRemoveNewFile(idx)} className="p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors border border-transparent hover:border-rose-200 shrink-0" title="Batal Muat Naik">
                                    <Icons.Trash2 className="w-4 h-4" />
                                 </button>
                               </div>
                             ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-6 flex flex-col sm:flex-row justify-end gap-4">
                        {editingRecordId && <button type="button" onClick={handleCancelEdit} disabled={loading} className="w-full sm:w-auto bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-10 py-4 rounded-2xl text-sm font-bold transition-all shadow-sm">Batal</button>}
                        <button type="submit" disabled={loading} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl text-sm font-bold transition-all shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] flex items-center justify-center gap-3">
                          {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span className="text-yellow-400"><Icons.CheckCircle2 /></span>}
                          {loading ? 'Menyimpan...' : (editingRecordId ? 'Simpan Kemaskini' : 'Hantar Pengisian')}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {}

</>
  );
}
