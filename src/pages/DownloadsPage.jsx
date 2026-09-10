function DownloadsPage() {
  const { view, filesList } = useAppContext();
  return (
<>
            {view === 'muatTurun' && (
              <div className="fade-in space-y-6 max-w-5xl mx-auto">
                <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-8 sm:p-12">
                  <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                    <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 border border-indigo-100"><Icons.Download className="w-8 h-8" /></div>
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pusat Muat Turun</h2>
                      <p className="text-sm font-medium text-slate-500 mt-1">Muat turun data pangkalan dan dokumen rujukan yang disediakan oleh PPD.</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><Icons.Database className="w-5 h-5 text-indigo-500" /> Dokumen Sokongan & Rujukan</h3>

                  {(!filesList || filesList.length === 0) ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                       <Icons.FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                       <p className="text-sm font-medium text-slate-500">Tiada dokumen dimuat naik buat masa ini.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filesList.map((f, index) => (
                        <Attachment key={f.id} value={f.url} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-5 border border-slate-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group shadow-sm">
                          <div className="bg-blue-50 p-3 rounded-xl text-blue-600 border border-blue-100 group-hover:bg-blue-100 transition-colors"><Icons.FileText className="w-6 h-6" /></div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-700">{f.tajuk}</h3>
                            <p className="text-[10px] font-medium text-slate-500 truncate mt-0.5">{f.namaFail}</p>
                          </div>
                        </Attachment>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}


</>
  );
}
