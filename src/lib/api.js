let pdfLibrariesPromise;
const loadScript = (src) => new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = src;
  script.onload = resolve;
  script.onerror = () => { script.remove(); reject(new Error('Gagal memuatkan pustaka PDF.')); };
  document.head.appendChild(script);
});
const loadPdfLibraries = () => {
  if (!pdfLibrariesPromise) pdfLibrariesPromise = (async () => {
    if (!window.jspdf) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    if (!window.jspdf.jsPDF.API.autoTable) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.6.0/jspdf.plugin.autotable.min.js');
  })().catch(error => { pdfLibrariesPromise = null; throw error; });
  return pdfLibrariesPromise;
};
