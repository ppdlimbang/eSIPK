function Attachment({ value, preview = false, children, ...props }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let timer;
    setUrl(''); setError(false);
    const refresh = async () => {
      try {
        const resolved = await resolveAttachmentUrl(value);
        if (!cancelled) { setUrl(resolved); timer = setTimeout(refresh, 50 * 60 * 1000); }
      } catch (_) { if (!cancelled) setError(true); }
    };
    refresh();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [value]);
  if (error) return <span role="status" className="text-sm text-rose-600">Lampiran tidak dapat dibuka.</span>;
  if (!url) return <span className="text-sm text-slate-500">Memuatkan lampiran...</span>;
  if (preview) return <iframe {...props} title="Pratonton lampiran" loading="lazy" src={getPreviewUrl(url)} />;
  return <a {...props} href={getViewerUrl(url)} target="_blank" rel="noreferrer">{children}</a>;
}
