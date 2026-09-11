function UnitDetails() {
  const { selectedUnit, setSelectedUnit } = useAppContext();
  const dialogRef = useRef(null);
  useEffect(() => {
    if (!selectedUnit) return;
    const previousFocus = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    const onKeyDown = event => {
      if (event.key === 'Escape') { event.preventDefault(); setSelectedUnit(null); }
      if (event.key !== 'Tab') return;
      const nodes = dialogRef.current?.querySelectorAll('button, a[href], input, select, textarea, iframe, [tabindex="0"]');
      if (!nodes?.length) { event.preventDefault(); return; }
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener('keydown', onKeyDown); previousFocus?.focus(); };
  }, [selectedUnit]);
  return (
<>
          {selectedUnit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedUnit(null)}></div>
              <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="unit-details-title" tabIndex={-1} className="animate-zoom-in relative bg-white rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                  <h3 id="unit-details-title" className="text-xl font-bold text-slate-900 tracking-tight">{String(selectedUnit.namaKuarters || '')}</h3>
                  <button aria-label="Tutup butiran" onClick={() => setSelectedUnit(null)} className="h-10 w-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-colors font-bold">✕</button>
                </div>
                <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50 space-y-6">
                  <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-5">
                    <div className="h-12 w-12 bg-white text-blue-600 shadow-sm border border-blue-100 rounded-xl flex items-center justify-center"><Icons.School /></div>
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institusi / Sekolah</p><p className="text-base font-bold text-slate-900 mt-1">{parseSchoolStr(selectedUnit.namaSekolah).name}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 shadow-sm"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Pengisian</p><p className="text-sm font-bold text-slate-900 mt-2">{String(selectedUnit.statusHunian || '')}</p></div>
                    <div className="bg-yellow-50/50 p-5 rounded-2xl border border-yellow-100 shadow-sm"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kondisi Fizikal</p><p className="text-sm font-bold text-slate-900 mt-2">{formatConditionStatus(selectedUnit.statusFizikalKuarters)}</p></div>
                  </div>
                  <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tahun Dibina</p><p className="text-sm font-bold text-slate-900 mt-2">{String(selectedUnit.tahunDibina || 'Tidak Dinyatakan')}</p></div>
                    {(selectedUnit.projekNRDA === true || String(selectedUnit.projekNRDA).toUpperCase() === 'TRUE' || selectedUnit.projekNRDA === 'Ya') && ( <div className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-200">Projek NRDA</div> )}
                  </div>
                  <div className="bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Status Pengisian Bilik Kongsi</p>
                    <div className="grid grid-cols-3 gap-4">
                      {['bilik1', 'bilik2', 'bilik3'].slice(0, Math.min(3, Number(selectedUnit.bilanganBilik) || 3)).map((b, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative">
                          {selectedUnit.ketuaRumah === b && selectedUnit[`${b}Status`] === 'Diisi' && ( <span className="absolute -top-3 -right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-lg shadow-sm text-[9px] font-extrabold uppercase tracking-wider border border-yellow-500 flex items-center gap-1 z-10" title="Ketua Rumah"><Icons.CheckCircle2 className="w-3 h-3" /> KETUA</span> )}
                          <p className="text-[10px] font-bold text-slate-500">Bilik {i+1}</p><p className="text-xs font-bold text-slate-900 mt-1.5">{String(selectedUnit[`${b}Status`] || '')}</p>
                          {selectedUnit[`${b}Status`] === 'Diisi' && ( <div className="mt-2 pt-2 border-t border-slate-50"><p className="text-[11px] font-semibold text-indigo-600 truncate">{String(selectedUnit[`${b}Penghuni`] || '')}</p></div> )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {selectedUnit.statusHunian === 'Berpenghuni' && (
                    <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-emerald-100/50 pb-3">Profil Penghuni Utama</p>
                      <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                        <div><p className="text-[10px] font-bold text-slate-400">NAMA LENGKAP</p><p className="text-sm font-bold text-slate-900 mt-1">{String(selectedUnit.namaPenghuni || '')}</p></div>
                        <div><p className="text-[10px] font-bold text-slate-400">NO. K/P (MYKAD)</p><p className="text-sm font-bold text-slate-900 mt-1">{String(selectedUnit.noKP || '')}</p></div>
                        <div><p className="text-[10px] font-bold text-slate-400">JAWATAN</p><p className="text-sm font-bold text-slate-900 mt-1">{String(selectedUnit.jawatan || '')}</p></div>
                        <div><p className="text-[10px] font-bold text-slate-400">NO TEL</p><p className="text-sm font-bold text-slate-900 mt-1">{String(selectedUnit.noTelefon || '')}</p></div>
                      </div>
                    </div>
                  )}
                  {selectedUnit.justifikasi && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Kuarters</p><p className="text-sm font-medium text-slate-700 mt-2 leading-relaxed">{String(selectedUnit.justifikasi || '')}</p></div>
                  )}
                  {selectedUnit.justifikasiPPD && (
                    <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-200"><p className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest">Justifikasi Pegawai Pembangunan / Penolong Jurutera PPD</p><p className="text-sm font-semibold text-indigo-900 mt-2 leading-relaxed">{String(selectedUnit.justifikasiPPD || '')}</p></div>
                  )}
                  {selectedUnit.gambarKerosakan && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Lampiran Gambar Kerosakan</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                         {selectedUnit.gambarKerosakan.split(',').map((url, idx) => {
                            const trimmedUrl = url.trim();
                            if(!trimmedUrl) return null;
                            return (
                              <div key={idx} className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 relative flex flex-col items-center justify-center p-3">
                                 <Attachment preview value={trimmedUrl} title="Pratonton lampiran" loading="lazy"  className="w-full h-[300px] rounded-lg shadow-sm border-0 bg-slate-100" allow="autoplay" />
                                 <Attachment value={trimmedUrl} target="_blank" rel="noreferrer" className="mt-4 bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-slate-700 transition-colors w-full text-center">Buka Saiz Penuh (Lampiran {idx + 1})</Attachment>
                              </div>
                            );
                         })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

</>
  );
}
