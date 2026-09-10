class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, errorMessage: '' };
      }
      static getDerivedStateFromError(error) {
        return { hasError: true, errorMessage: error.toString() };
      }
      render() {
        if (this.state.hasError) {
          return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
              <div className="bg-white p-8 rounded-3xl shadow-xl max-w-xl w-full text-center border border-rose-100">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.AlertTriangle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Sistem Pulih Dari Ralat</h2>
                <p className="text-sm text-slate-500 mb-6 font-medium">Sistem mengesan anomali semasa merender data.</p>
                <div className="bg-slate-50 p-4 rounded-xl text-left font-mono text-xs text-rose-500 overflow-x-auto mb-6">{this.state.errorMessage}</div>
                <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-indigo-700">Muat Semula Aplikasi</button>
              </div>
            </div>
          );
        }
        return this.props.children;
      }
    }
