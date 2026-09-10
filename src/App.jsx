const AppContext = React.createContext(null);
const useAppContext = () => React.useContext(AppContext);
function App() {
  const model = useDashboard();
  const { view, authUser, loading, statusMessage, handleLogout } = model;
  if (!model.isAuthenticated) return <AppContext.Provider value={model}><LoginPage /></AppContext.Provider>;
      return (
        <AppContext.Provider value={model}>
        <div className="min-h-screen flex flex-col relative z-0" style={{ backgroundColor: '#F8FAFC' }}>
          <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden" style={{ backgroundColor: '#F5F7FA' }}>
            <div className="absolute top-[-15%] left-[-5%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-yellow-500/10 blur-[100px]"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent_90%)]"></div>
          </div>

          <div className="sticky top-6 z-40 px-4 sm:px-8 xl:px-12 w-full mx-auto mb-6">
            <header className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] rounded-full flex flex-col sm:flex-row items-center justify-between p-2 sm:p-2.5 gap-4 sm:gap-0">
              <div className="flex items-center gap-3 sm:gap-4 pl-2 sm:pl-3 w-full sm:w-auto">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-yellow-400 p-2.5 rounded-full shadow-sm border border-indigo-500/20"><Icons.LayoutDashboard /></div>
                <div className="pr-2 flex-1">
                  <h1 className="text-lg font-extrabold tracking-tight text-slate-900 leading-none flex items-baseline gap-1.5">eSIPK <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline-block normal-case tracking-normal">Sistem Integrasi Profil Kuarters</span></h1>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Pejabat Pendidikan Daerah Limbang</p>
                </div>
                <button aria-label="Log Keluar" onClick={handleLogout} className="sm:hidden p-2 text-rose-500 bg-rose-50 rounded-full hover:bg-rose-100 transition-colors"><Icons.LogOut /></button>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 pr-1 sm:pr-2 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                <TopNavLink name="dashboard" label="Dashboard" icon={Icons.LayoutGrid} />
                <TopNavLink name="form" label="Pengisian" icon={Icons.Edit3} />
                <TopNavLink name="muatTurun" label="Muat Turun" icon={Icons.Download} />
                {isSettingsAdmin(authUser) && <TopNavLink name="settings" label="Tetapan" icon={Icons.Sliders} />}
                <button aria-label="Log Keluar" onClick={handleLogout} className="hidden sm:flex items-center gap-2.5 px-4 sm:px-6 py-3 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap text-rose-500 hover:text-rose-700 hover:bg-rose-50 ml-2">
                  <Icons.LogOut className="w-5 h-5" /> <span className="hidden lg:inline">Log Keluar</span>
                </button>
              </div>
            </header>
          </div>

          <main className="flex-1 w-full mx-auto px-4 sm:px-8 xl:px-12 py-8 pt-4 pb-24">

            {statusMessage.text && (
              <div role="status" aria-live="polite" className="fixed top-6 right-6 z-50 fade-in">
                <div className="bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-lg flex items-center gap-3 border border-slate-800">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full ${statusMessage.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {statusMessage.type === 'success' ? <Icons.CheckCircle2 /> : <Icons.AlertTriangle />}
                  </div>
                  <p className="text-sm font-semibold">{statusMessage.text}</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="fixed inset-0 bg-white/60 backdrop-blur-md z-50 flex items-center justify-center">
                <div className="bg-white px-8 py-5 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center gap-4">
                  <div className="h-8 w-8 border-4 border-yellow-100 border-t-yellow-500 rounded-full animate-spin"></div>
                  <span className="text-sm font-bold text-slate-800 tracking-wide">Memproses Data...</span>
                </div>
              </div>
            )}

            {}
            {view === "dashboard" && <DashboardPage />}
            {view === "form" && <FormPage />}
            {view === "muatTurun" && <DownloadsPage />}
            {view === "settings" && isSettingsAdmin(authUser) && <SettingsPage />}
          </main>

          <footer className="w-full mx-auto px-4 sm:px-8 xl:px-12 pb-8 z-10 relative mt-auto">
            <div className="bg-white/60 backdrop-blur-xl border border-slate-200/60 shadow-sm rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left transition-all hover:bg-white/80">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-yellow-400 p-3 rounded-2xl shadow-sm border border-indigo-500/20"><Icons.School /></div>
                <div><h4 className="text-sm font-extrabold text-slate-900 tracking-tight">eSIPK Pejabat Pendidikan Daerah Limbang</h4><p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Sistem Integrasi Profil Kuarters</p></div>
              </div>
              <div className="text-[11px] font-semibold text-slate-400">
                <p>&copy; {new Date().getFullYear()} Pejabat Pendidikan Daerah Limbang.</p>
                <div className="mt-1 flex items-center justify-center md:justify-end gap-3">
                  <span className="hover:text-indigo-600 transition-colors cursor-pointer">Hak Cipta Terpelihara.</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="hover:text-indigo-600 transition-colors cursor-pointer">Versi 4.1 (Kemas Kini Tajuk)</span>
                </div>
              </div>
            </div>
          </footer>

          <UnitDetails />

        </div>
        </AppContext.Provider>
      );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ErrorBoundary><App /></ErrorBoundary>);
