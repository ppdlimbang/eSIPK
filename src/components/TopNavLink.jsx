function TopNavLink({ name, label, icon: Icon }) {
  const { view, navigate } = useAppContext();
  return <button type="button" aria-label={label} aria-current={view === name ? "page" : undefined} onClick={() => navigate(name)} className={`flex items-center gap-2.5 px-4 sm:px-6 py-3 rounded-full font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${view === name ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80"}`}><span className={view === name ? "text-yellow-400" : ""}><Icon /></span><span className="hidden sm:inline">{label}</span></button>;
}
