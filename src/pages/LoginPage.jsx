function LoginPage() {
  const { statusMessage, fetchInitialData, loginUsername, setLoginUsername, loginPassword, setLoginPassword, loginError, loading, handleLogin } = useAppContext();
  return (

          <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex overflow-hidden z-10 mx-4 lg:h-[600px] border border-slate-200 fade-in">
              <div className="w-1/2 relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-900 to-slate-900 animate-bg-gradient opacity-90"></div>
                <div className="absolute top-10 left-10 w-32 h-32 bg-violet-500/30 rounded-full blur-3xl animate-drift"></div>
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl animate-drift" style={{ animationDelay: '2s' }}></div>

                <div className="relative z-10 flex items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl shadow-sm text-yellow-400 border border-white/20"><Icons.School className="w-8 h-8" /></div>
                  <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight leading-none flex items-baseline gap-2">eSIPK <span className="text-sm font-medium text-indigo-200 normal-case tracking-normal">Sistem Integrasi Profil Kuarters</span></h1>
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mt-1">Pejabat Pendidikan Daerah Limbang</p>
                  </div>
                </div>

                <div className="relative z-10 mb-20 mt-auto flex flex-col items-center text-center">
                  <img src="https://lh3.googleusercontent.com/d/1ylwGSAt-_CPuWzNPNx_GJRZf6RDhkcSS" alt="Logo PPD Limbang" className="h-48 sm:h-56 w-auto mb-2 object-contain mx-auto transition-transform hover:scale-105" style={{ filter: "drop-shadow(1px 1px 0px rgba(255,255,255,0.85)) drop-shadow(-1px -1px 0px rgba(255,255,255,0.85)) drop-shadow(1px -1px 0px rgba(255,255,255,0.85)) drop-shadow(-1px 1px 0px rgba(255,255,255,0.85)) drop-shadow(0px 20px 30px rgba(0,0,0,0.65))" }} onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/200x80/4f46e5/ffffff?text=Logo+PPD+Limbang"; }} />
                  <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">Pengurusan Kuarters<br/>Moden & Pintar.</h2>
                  <p className="text-indigo-200 text-sm font-medium max-w-sm mx-auto leading-relaxed">Sistem pangkalan data bersepadu untuk pemantauan dan pengagihan kuarters kediaman guru di bawah seliaan PPD Limbang.</p>
                </div>
              </div>

              <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 md:p-16 bg-white relative">
                <div className="lg:hidden flex flex-col items-center text-center mb-8 mt-0">
                  <img src="https://lh3.googleusercontent.com/d/1ylwGSAt-_CPuWzNPNx_GJRZf6RDhkcSS" alt="Logo PPD Limbang" className="h-32 sm:h-40 w-auto mb-4 object-contain mx-auto transition-transform hover:scale-105" style={{ filter: "drop-shadow(1px 1px 0px rgba(255,255,255,1)) drop-shadow(-1px -1px 0px rgba(255,255,255,1)) drop-shadow(1px -1px 0px rgba(255,255,255,1)) drop-shadow(-1px 1px 0px rgba(255,255,255,1)) drop-shadow(0px 15px 25px rgba(0,0,0,0.15))" }} onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/150x60/4f46e5/ffffff?text=Logo+PPD"; }} />
                  <div className="flex items-center justify-center gap-3 mt-2">
                    <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-sm"><Icons.School className="w-6 h-6" /></div>
                    <div className="text-left">
                      <h1 className="text-xl font-extrabold text-slate-900 leading-none flex items-baseline gap-1.5">eSIPK <span className="text-[10px] font-medium text-slate-500 normal-case tracking-normal">Sistem Integrasi Profil Kuarters</span></h1>
                      <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mt-1">PPD Limbang</p>
                    </div>
                  </div>
                </div>

                <div className="max-w-md w-full mx-auto">
                  <div className="mb-10 text-center lg:text-left">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Log Masuk</h2>
                    <p className="text-sm text-slate-500 mt-2 font-medium">Log masuk menggunakan e-mel akaun eSIPK anda.</p>
                  </div>

                  {statusMessage.type === 'error' && <div role="alert" className="mb-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{statusMessage.text}<button type="button" disabled={loading} onClick={fetchInitialData} className="block mt-2 underline font-bold">Cuba lagi</button></div>}
                  {loginError && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-semibold rounded-2xl flex items-center gap-3 animate-zoom-in">
                      <Icons.AlertTriangle className="w-5 h-5 shrink-0" /> {loginError}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-2">Alamat E-mel</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-slate-400"><Icons.Users className="w-5 h-5" /></span>
                        <input aria-label="Alamat E-mel" autoComplete="username" type="email" required disabled={loading} value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm" placeholder="nama@moe.gov.my" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-2">Kata Laluan</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-slate-400"><Icons.Lock className="w-5 h-5" /></span>
                        <input aria-label="Kata Laluan" autoComplete="current-password" type="password" required disabled={loading} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm" placeholder="••••••••" />
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-sm font-bold transition-all shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] mt-4 flex items-center justify-center gap-2">
                      {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Akses Sistem"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

  );
}
