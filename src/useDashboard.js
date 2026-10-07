function useDashboard() {
      const [isAuthenticated, setIsAuthenticated] = useState(false);
      const [authReady, setAuthReady] = useState(false);
      const [authUser, setAuthUser] = useState(null);

      const [loginUsername, setLoginUsername] = useState('');
      const [loginPassword, setLoginPassword] = useState('');
      const [loginError, setLoginError] = useState('');

      const [view, setView] = useState(readRoute);
      const statusTimer = useRef(null);
      const requestVersion = useRef(0);
      const [submissions, setSubmissions] = useState([]);
      const [schools, setSchools] = useState([]);
      const [filesList, setFilesList] = useState([]);
      const [activityLogs, setActivityLogs] = useState([]);
      const [loginLogs, setLoginLogs] = useState([]);

      const [newSchoolCode, setNewSchoolCode] = useState('');
      const [newSchoolName, setNewSchoolName] = useState('');
      const [newSchoolEmail, setNewSchoolEmail] = useState('');
      const [newSchoolPassword, setNewSchoolPassword] = useState('');

      const [searchTerm, setSearchTerm] = useState('');
      const [selectedSchoolFilter, setSelectedSchoolFilter] = useState('Semua');
      const [statusFilter, setStatusFilter] = useState('Semua');
      const [kondisiFilter, setKondisiFilter] = useState('Semua');
      const [loading, setLoading] = useState(true);
      const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

      const [selectedUnit, setSelectedUnit] = useState(null);
      const [activeSchool, setActiveSchool] = useState('');

      const [editingRecordId, setEditingRecordId] = useState(null);
      const [editingSchool, setEditingSchool] = useState(null);
      const [editSchoolCode, setEditSchoolCode] = useState('');
      const [editSchoolName, setEditSchoolName] = useState('');
      const [editSchoolEmail, setEditSchoolEmail] = useState('');
      const [editSchoolPassword, setEditSchoolPassword] = useState('');
      const [editSchoolId, setEditSchoolId] = useState(null);
      const [gambarFiles, setGambarFiles] = useState([]);
      const [namaBangunanDipilih, setNamaBangunanDipilih] = useState('');
      const [unitBangunanDipilih, setUnitBangunanDipilih] = useState('');

      const initialFormState = {
        namaSekolah: '', statusHunian: 'Berpenghuni', bilanganHunian: 1, namaKuarters: '', jenisRumah: 'KUARTERS',
        tahunDibina: '', bilanganBilik: '3', bilik1Status: 'Kosong', bilik1Penghuni: '', bilik2Status: 'Kosong', bilik2Penghuni: '',
        bilik3Status: 'Kosong', bilik3Penghuni: '', ketuaRumah: '', namaPenghuni: '', noKP: '', jawatan: '', noTelefon: '',
        stesenBertugas: '', statusPerkahwinan: 'Bujang', warden: 'Tidak', tarikhMendiami: '', statusFizikalKuarters: 'Baik', justifikasi: '', justifikasiPPD: '', gambarKerosakan: '', permintaanGambarPPD: false, permintaanGambarPPDAt: '', sejarahPenghuni: [], projekNRDA: false
      };
      const [formData, setFormData] = useState(initialFormState);

      const fetchInitialData = async () => {
        const version = ++requestVersion.current;
        setLoading(true);
        try {
          const tasks = [runGas('getKuartersData'), runGas('getSchools'), runGas('getFilesList')];
          if (authUser?.type === 'admin') tasks.push(runGas('getActivityLogs'), runGas('getLoginLogs'));
          const results = await Promise.allSettled(tasks);
          if (version !== requestVersion.current) return;
          const setters = [setSubmissions, setSchools, setFilesList, setActivityLogs, setLoginLogs];
          results.forEach((result, index) => {
            if (result.status === 'fulfilled' && Array.isArray(result.value)) setters[index](result.value.filter(Boolean));
          });
          if (authUser?.type !== 'admin') { setActivityLogs([]); setLoginLogs([]); }
          if (results.some(result => result.status === 'rejected')) showStatus('error', 'Sebahagian data gagal dimuatkan. Sila cuba muat semula.');
        } finally {
          if (version === requestVersion.current) setLoading(false);
        }
      };
      useEffect(() => {
        let cancelled = false;
        let generation = 0;
        let timer;
        let subscription;
        let activeUserId;
        const applySession = async (session, event) => {
          const current = ++generation;
          activeUserId = null;
          requestVersion.current++;
          setIsAuthenticated(false); setAuthUser(null);
          setSubmissions([]); setSchools([]); setFilesList([]); setActivityLogs([]); setLoginLogs([]); setSelectedUnit(null);
          setFormData(initialFormState); setEditingRecordId(null); setGambarFiles([]);
          setSelectedSchoolFilter('Semua'); setStatusFilter('Semua'); setKondisiFilter('Semua'); setSearchTerm('');
          if (!session?.user) { setLoading(false); setAuthReady(true); return; }
          setLoading(true);
          try {
            const profile = await getAuthProfile(session.user);
            if (cancelled || generation !== current) return;
            activeUserId = session.user.id;
            setAuthUser(profile); setIsAuthenticated(true); setLoginPassword('');
            setActiveSchool(profile.schoolData || '');
            setFormData({ ...initialFormState, namaSekolah: profile.schoolData || '' });
            setLoginError('');
            setAuthReady(true);
            if (event === 'SIGNED_IN' && profile.type === 'school') {
              recordLoginLog(profile).catch(() => {});
            }
          } catch (error) {
            if (!cancelled && generation === current) { setLoginError(error.message || 'Akaun belum diberi akses.'); setLoading(false); setAuthReady(true); }
          }
        };
        try {
          subscription = getSupabase().auth.onAuthStateChange((event, session) => {
            // Do database work outside the Auth callback to avoid its session lock.
            if (event === 'TOKEN_REFRESHED' || (event === 'SIGNED_IN' && session?.user?.id === activeUserId)) return;
            clearTimeout(timer);
            timer = setTimeout(() => applySession(session, event), 0);
          }).data.subscription;
        } catch (error) { setLoginError(error.message); setLoading(false); setAuthReady(true); }
        return () => { cancelled = true; generation++; clearTimeout(timer); subscription?.unsubscribe(); clearTimeout(statusTimer.current); requestVersion.current++; };
      }, []);
      useEffect(() => { if (isAuthenticated && authUser) fetchInitialData(); }, [isAuthenticated, authUser]);

      const navigate = (next) => {
        if (!routeNames.includes(next)) return;
        if (next === 'logAktiviti' && authUser?.type !== 'admin') return;
        if (next === 'settings' && !isSettingsAdmin(authUser)) return;
        if (view === next) return;
        window.location.hash = '/' + next;
      };
      useEffect(() => {
        const syncRoute = () => {
          let next = readRoute();
          if (isAuthenticated && ((next === 'settings' && !isSettingsAdmin(authUser)) || (next === 'logAktiviti' && authUser?.type !== 'admin'))) {
            next = 'dashboard';
            window.location.replace('#/dashboard');
          }
          setView(next);
        };
        syncRoute();
        window.addEventListener('hashchange', syncRoute);
        return () => window.removeEventListener('hashchange', syncRoute);
      }, [isAuthenticated, authUser]);
      useEffect(() => {
        if (view !== 'form') {
          setEditingRecordId(null); setGambarFiles([]);
          setNamaBangunanDipilih(''); setUnitBangunanDipilih('');
          setActiveSchool(authUser?.type === 'school' ? authUser.schoolData : '');
          setFormData({ ...initialFormState, namaSekolah: authUser?.schoolData || '' });
        }
      }, [view]);

      const handleLogin = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true); setLoginError('');
        try { await signIn(loginUsername.trim().toLowerCase(), loginPassword); }
        catch (error) { setLoginError(error.message || 'Log masuk gagal.'); setLoading(false); }
      };

      const handleLogout = async () => {
        try { await signOut(); }
        catch (error) { showStatus('error', 'Log keluar gagal. Sila cuba lagi.'); return; }
        requestVersion.current++;
        setSubmissions([]); setSchools([]); setFilesList([]); setActivityLogs([]); setLoginLogs([]); setLoading(false);
        setIsAuthenticated(false);
        setAuthUser(null);
        setLoginUsername('');
        setLoginPassword('');
        window.location.replace('#/dashboard');
        setView('dashboard');
        setSelectedUnit(null);
        setSelectedSchoolFilter('Semua');
        setStatusFilter('Semua');
        setStatusMessage({ type: '', text: '' });
        clearTimeout(statusTimer.current);
        setActiveSchool('');
        setFormData(initialFormState);
        setEditingRecordId(null);
        setGambarFiles([]);
        setKondisiFilter('Semua');
        setSearchTerm('');
        setNamaBangunanDipilih('');
        setUnitBangunanDipilih('');
      };

      const safeSubmissions = useMemo(() => sortSubmissionRecords(Array.isArray(submissions) ? submissions.filter(Boolean) : []), [submissions]);
      const roleFilteredSubmissions = useMemo(() => authUser?.type === 'admin' ? safeSubmissions : safeSubmissions.filter(sub => isSchoolMatch(sub.namaSekolah, authUser?.schoolData)), [safeSubmissions, authUser]);

      const baseFilteredSubmissions = useMemo(() => roleFilteredSubmissions.filter(sub => {
        if (!sub) return false;
        const searchStr = String(searchTerm || '').toLowerCase();
        const matchSearch = !searchTerm || (String(sub.namaSekolah || '').toLowerCase().includes(searchStr)) || (String(sub.namaPenghuni || '').toLowerCase().includes(searchStr)) || (String(sub.namaKuarters || '').toLowerCase().includes(searchStr)) || (String(sub.noKP || '').toLowerCase().includes(searchStr));
        const matchSchool = selectedSchoolFilter === 'Semua' || isSchoolMatch(sub.namaSekolah, selectedSchoolFilter);
        let matchStatus = true;
        if (statusFilter === 'Dihuni') matchStatus = sub.statusHunian === 'Berpenghuni';
        else if (statusFilter === 'Kosong') matchStatus = sub.statusHunian === 'Tidak Berpenghuni';
        return matchSearch && matchSchool && matchStatus;
      }), [roleFilteredSubmissions, searchTerm, selectedSchoolFilter, statusFilter]);

      const filteredSubmissions = useMemo(() => baseFilteredSubmissions.filter(sub => {
        return isConditionMatch(sub.statusFizikalKuarters, kondisiFilter);
      }), [baseFilteredSubmissions, kondisiFilter]);

      const totalUnits = useMemo(() => filteredSubmissions.reduce((acc, curr) => acc + (Number(curr?.bilanganHunian) || 1), 0), [filteredSubmissions]);
      const occupiedUnits = useMemo(() => filteredSubmissions.filter(s => s?.statusHunian === 'Berpenghuni').reduce((acc, curr) => acc + (Number(curr?.bilanganHunian) || 1), 0), [filteredSubmissions]);
      const unoccupiedUnits = useMemo(() => filteredSubmissions.filter(s => s?.statusHunian === 'Tidak Berpenghuni').reduce((acc, curr) => acc + (Number(curr?.bilanganHunian) || 1), 0), [filteredSubmissions]);

      const kondisiBaik = useMemo(() => baseFilteredSubmissions.filter(s => s?.statusFizikalKuarters === 'Baik').reduce((acc, curr) => acc + (Number(curr?.bilanganHunian) || 1), 0), [baseFilteredSubmissions]);
      const kondisiRosakRingan = useMemo(() => baseFilteredSubmissions.filter(s => s?.statusFizikalKuarters === 'Rosak Ringan').reduce((acc, curr) => acc + (Number(curr?.bilanganHunian) || 1), 0), [baseFilteredSubmissions]);
      const kondisiRosakBerat = useMemo(() => baseFilteredSubmissions.filter(s => isCriticalDamageStatus(s?.statusFizikalKuarters)).reduce((acc, curr) => acc + (Number(curr?.bilanganHunian) || 1), 0), [baseFilteredSubmissions]);
      const kondisiDiselenggara = useMemo(() => baseFilteredSubmissions.filter(s => s?.statusFizikalKuarters === 'Sedang Diselenggara').reduce((acc, curr) => acc + (Number(curr?.bilanganHunian) || 1), 0), [baseFilteredSubmissions]);

      const showStatus = (type, text) => {
        setStatusMessage({ type, text: String(text) });
        clearTimeout(statusTimer.current);
        statusTimer.current = setTimeout(() => setStatusMessage({ type: '', text: '' }), 6000);
      };

      const handleChange = (e) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? e.target.checked : type === 'number' ? parseInt(value) || 0 : value;
        setFormData(prev => normalizeOccupancy({ ...prev, [name]: val }));
      };

      const handleEditRow = (record) => {
        setEditingRecordId(record.id);
        setGambarFiles([]);

        let splitNama = '';
        let splitUnit = '';
        if (record.namaKuarters) {
           const parts = record.namaKuarters.split(' - ');
           if (parts.length > 1) {
              splitNama = parts[0];
              splitUnit = parts.slice(1).join(' - ');
           } else {
              splitNama = record.namaKuarters;
           }
        }
        setNamaBangunanDipilih(splitNama);
        setUnitBangunanDipilih(splitUnit);

        // PENYELESAIAN BUG MUTLAK: Tukar segala jenis format tarikh ke YYYY-MM-DD (format wajib HTML Date Input)
        let parsedTarikh = '';
        if (record.tarikhMendiami) {
           let val = String(record.tarikhMendiami).trim().replace(/'/g, '');
           if (val.includes('/') && val.split('/').length === 3) {
              const parts = val.split('/');
              const d = parts[0].padStart(2, '0');
              const m = parts[1].padStart(2, '0');
              const y = parts[2].substring(0, 4);
              parsedTarikh = `${y}-${m}-${d}`;
           } else {
              const match = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
              if (match) {
                 parsedTarikh = match[0];
              } else {
                 const d = new Date(val);
                 if (!isNaN(d.getTime())) {
                    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                    parsedTarikh = d.toISOString().substring(0, 10);
                 }
              }
           }
        }

        setFormData({
          namaSekolah: record.namaSekolah || '', statusHunian: record.statusHunian || 'Berpenghuni',
          bilanganHunian: record.bilanganHunian || 1, namaKuarters: record.namaKuarters || '', jenisRumah: record.jenisRumah || 'KUARTERS',
          tahunDibina: record.tahunDibina || '', bilanganBilik: record.bilanganBilik || '3', bilik1Status: record.bilik1Status || 'Kosong',
          bilik1Penghuni: record.bilik1Penghuni || '', bilik2Status: record.bilik2Status || 'Kosong', bilik2Penghuni: record.bilik2Penghuni || '',
          bilik3Status: record.bilik3Status || 'Kosong', bilik3Penghuni: record.bilik3Penghuni || '', ketuaRumah: record.ketuaRumah || '',
          namaPenghuni: record.namaPenghuni || '', noKP: record.noKP || '', jawatan: record.jawatan || '', noTelefon: record.noTelefon || '',
          stesenBertugas: record.stesenBertugas || '', statusPerkahwinan: record.statusPerkahwinan || 'Bujang', warden: record.warden || 'Tidak',
          tarikhMendiami: parsedTarikh, statusFizikalKuarters: formatConditionStatus(record.statusFizikalKuarters) || 'Baik',
          justifikasi: record.justifikasi || '', justifikasiPPD: record.justifikasiPPD || '', gambarKerosakan: record.gambarKerosakan || '', permintaanGambarPPD: record.permintaanGambarPPD === true, permintaanGambarPPDAt: record.permintaanGambarPPDAt || '', sejarahPenghuni: Array.isArray(record.sejarahPenghuni) ? record.sejarahPenghuni : [],
          projekNRDA: record.projekNRDA === true || record.projekNRDA === 'TRUE' || String(record.projekNRDA).toUpperCase() === 'TRUE' || record.projekNRDA === 'Ya' || false
        });
        setActiveSchool(record.namaSekolah);
        navigate('form');
        setTimeout(() => {
          const formElement = document.getElementById('borang-pengisian');
          if (formElement) { window.scrollTo({ top: formElement.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' }); }
        }, 100);
      };

      const handleCancelEdit = () => {
        setEditingRecordId(null);
        setGambarFiles([]);
        setFormData({ ...initialFormState, namaSekolah: activeSchool });
        setNamaBangunanDipilih('');
        setUnitBangunanDipilih('');
        setTimeout(() => {
          const formElement = document.getElementById('borang-pengisian');
          if (formElement) { window.scrollTo({ top: formElement.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' }); }
        }, 100);
      };

      const handleRequestImageUpload = async (record) => {
        if (loading || authUser?.type !== 'admin' || !record || record.statusFizikalKuarters === 'Baik' || String(record.gambarKerosakan || '').trim() || record.permintaanGambarPPD) return;
        setLoading(true);
        const updatedRecord = { ...record, permintaanGambarPPD: true, permintaanGambarPPDAt: new Date().toISOString() };
        try {
          const result = await runGas('updateKuartersData', record.id, updatedRecord);
          if (!result) throw new Error('Permintaan gagal disimpan.');
          setSubmissions(prev => prev.map(item => item.id === record.id ? updatedRecord : item));
          setSelectedUnit(updatedRecord);
          showStatus('success', 'Permintaan muat naik gambar telah dihantar kepada sekolah.');
        } catch (error) {
          showStatus('error', error.message || 'Permintaan gambar gagal dihantar.');
        } finally { setLoading(false); }
      };

      const handleSavePpdFeedback = async (record, feedback) => {
        if (loading || authUser?.type !== 'admin' || !record || record.statusFizikalKuarters === 'Baik') return;
        const cleanFeedback = String(feedback || '').trim();
        if (!cleanFeedback) { showStatus('error', 'Sila isi maklum balas PPD terlebih dahulu.'); return; }
        setLoading(true);
        const updatedRecord = { ...record, justifikasiPPD: cleanFeedback, updatedAtDate: new Date().toISOString() };
        try {
          const result = await runGas('updateKuartersData', record.id, updatedRecord);
          if (!result) throw new Error('Maklum balas gagal disimpan.');
          setSubmissions(prev => prev.map(item => item.id === record.id ? updatedRecord : item));
          setSelectedUnit(updatedRecord);
          showStatus('success', 'Maklum balas PPD berjaya disimpan.');
        } catch (error) {
          showStatus('error', error.message || 'Maklum balas PPD gagal disimpan.');
        } finally { setLoading(false); }
      };

      const handleOccupantMovedOut = async (record) => {
        if (loading || !record || record.statusHunian !== 'Berpenghuni') return;
        if (!window.confirm('Rekod penghuni semasa akan disimpan dalam sejarah dan unit ini ditandakan sebagai Kosong. Teruskan?')) return;
        setLoading(true);
        const previousOccupant = {
          namaPenghuni: String(record.namaPenghuni || ''), noKP: String(record.noKP || ''),
          jawatan: String(record.jawatan || ''), noTelefon: String(record.noTelefon || ''),
          stesenBertugas: String(record.stesenBertugas || ''), statusPerkahwinan: String(record.statusPerkahwinan || ''),
          warden: String(record.warden || ''), tarikhMendiami: String(record.tarikhMendiami || ''),
          bilik1Status: String(record.bilik1Status || ''), bilik1Penghuni: String(record.bilik1Penghuni || ''),
          bilik2Status: String(record.bilik2Status || ''), bilik2Penghuni: String(record.bilik2Penghuni || ''),
          bilik3Status: String(record.bilik3Status || ''), bilik3Penghuni: String(record.bilik3Penghuni || ''),
          ketuaRumah: String(record.ketuaRumah || ''), tarikhKeluar: new Date().toISOString()
        };
        const history = Array.isArray(record.sejarahPenghuni) ? record.sejarahPenghuni : [];
        const updatedRecord = normalizeOccupancy({
          ...record,
          statusHunian: 'Tidak Berpenghuni',
          sejarahPenghuni: [...history, previousOccupant],
          updatedAtDate: new Date().toISOString()
        });
        try {
          const result = await runGas('updateKuartersData', record.id, updatedRecord);
          if (!result) throw new Error('Rekod penghuni keluar gagal disimpan.');
          setSubmissions(prev => prev.map(item => item.id === record.id ? { ...updatedRecord, id: record.id } : item));
          setSelectedUnit(null);
          showStatus('success', 'Penghuni disimpan dalam sejarah dan unit ditandakan sebagai kosong.');
        } catch (error) {
          showStatus('error', error.message || 'Gagal merekodkan penghuni keluar.');
        } finally { setLoading(false); }
      };

      const handleSingleOccupantMovedOut = async (record, selectedRoom) => {
        if (loading || !record || record.statusHunian !== 'Berpenghuni') return;
        const occupants = [1, 2, 3]
          .filter(index => record[`bilik${index}Status`] === 'Diisi' || (index === 1 && String(record.namaPenghuni || '').trim()))
          .map(index => ({ room: index, name: String(record[`bilik${index}Penghuni`] || (index === 1 ? record.namaPenghuni : '')).trim() || `Penghuni Bilik ${index}` }))
          .filter(item => item.name);
        if (occupants.length <= 1) {
          showStatus('error', 'Hanya seorang penghuni direkodkan. Gunakan pilihan semua penghuni keluar.');
          return;
        }
        const selected = occupants.find(item => item.room === Number(selectedRoom));
        if (!selected) return;
        if (!window.confirm(`Rekod ${selected.name} sebagai penghuni yang keluar?`)) return;
        setLoading(true);
        const previousOccupant = {
          namaPenghuni: selected.name, noKP: String(selected.room === 1 ? record.noKP || '' : ''),
          jawatan: String(selected.room === 1 ? record.jawatan || '' : ''), noTelefon: String(selected.room === 1 ? record.noTelefon || '' : ''),
          bilik: selected.room, tarikhMendiami: String(selected.room === 1 ? record.tarikhMendiami || '' : ''),
          jenisRekod: 'Seorang penghuni keluar', tarikhKeluar: new Date().toISOString()
        };
        const updatedRecord = { ...record, sejarahPenghuni: [...(Array.isArray(record.sejarahPenghuni) ? record.sejarahPenghuni : []), previousOccupant], updatedAtDate: new Date().toISOString() };
        if (selected.room === 1) {
          updatedRecord.namaPenghuni = '';
          updatedRecord.noKP = '';
          updatedRecord.jawatan = '';
          updatedRecord.noTelefon = '';
          updatedRecord.stesenBertugas = '';
          updatedRecord.tarikhMendiami = '';
          updatedRecord.statusPerkahwinan = '';
          updatedRecord.warden = '';
        }
        updatedRecord[`bilik${selected.room}Status`] = 'Kosong';
        updatedRecord[`bilik${selected.room}Penghuni`] = '';
        if (updatedRecord.ketuaRumah === `bilik${selected.room}`) updatedRecord.ketuaRumah = '';
        const remaining = [1, 2, 3].some(index => updatedRecord[`bilik${index}Status`] === 'Diisi' || (index === 1 && String(updatedRecord.namaPenghuni || '').trim()));
        updatedRecord.statusHunian = remaining ? 'Berpenghuni' : 'Tidak Berpenghuni';
        const normalizedRecord = normalizeOccupancy(updatedRecord);
        try {
          const result = await runGas('updateKuartersData', record.id, normalizedRecord);
          if (!result) throw new Error('Rekod penghuni keluar gagal disimpan.');
          setSubmissions(prev => prev.map(item => item.id === record.id ? { ...normalizedRecord, id: record.id } : item));
          setSelectedUnit(null);
          showStatus('success', `${selected.name} disimpan dalam sejarah penghuni.`);
        } catch (error) {
          showStatus('error', error.message || 'Gagal merekodkan penghuni keluar.');
        } finally { setLoading(false); }
      };

      const handleRemoveExistingImage = (indexToRemove) => {
        if (!window.confirm('Adakah anda pasti untuk memadam gambar ini dari senarai?')) return;
        const currentUrls = formData.gambarKerosakan.split(',').map(s => s.trim()).filter(Boolean);
        const updatedUrls = currentUrls.filter((_, idx) => idx !== indexToRemove);
        setFormData(prev => ({ ...prev, gambarKerosakan: updatedUrls.join(', ') }));
      };

      const handleRemoveNewFile = (indexToRemove) => {
        setGambarFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        if (editingRecordId && formData.statusHunian === 'Tidak Berpenghuni') {
          const confirmed = window.confirm('Unit ini akan disimpan sebagai Kosong / Tidak Dihuni. Perincian Bilik Kongsi dan Maklumat Penghuni Utama akan dikosongkan. Teruskan simpan?');
          if (!confirmed) return;
        }
        setLoading(true);
        const currentActiveSchool = String(activeSchool || '');

        let finalNamaKuarters = formData.namaKuarters;
        if (getSpecialSchoolOptions(currentActiveSchool)) {
            if (!namaBangunanDipilih || !unitBangunanDipilih) {
                showStatus('error', 'Sila lengkapkan pilihan nama bangunan dan nombor unit/tingkat.');
                setLoading(false);
                return;
            }
            finalNamaKuarters = `${namaBangunanDipilih} - ${unitBangunanDipilih}`;
        }

        let uploadedImageUrls = formData.gambarKerosakan ? formData.gambarKerosakan.split(',').map(s => s.trim()).filter(Boolean) : [];

        if (gambarFiles && gambarFiles.length > 0) {
           showStatus('success', `Sedang memuat naik ${gambarFiles.length} gambar (sila tunggu sebentar)...`);

           for (let i = 0; i < gambarFiles.length; i++) {
               let gFile = gambarFiles[i];
               try {
                 const base64Data = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (event) => resolve(event.target.result.split(',')[1]);
                    reader.onerror = () => reject(new Error("Gagal membaca fail."));
                    reader.readAsDataURL(gFile);
                 });

                 const imgPayload = {
                    fileName: gFile.name || `IMG_${Date.now()}_${i}.jpg`,
                    namaSekolah: currentActiveSchool,
                    mimeType: gFile.type || 'image/jpeg',
                    data: base64Data
                 };

                 const response = await runGas('simpanImejKerosakan', imgPayload);
                 if (response && response.success) {
                    uploadedImageUrls.push(response.url);
                    setFormData(prev => ({ ...prev, gambarKerosakan: uploadedImageUrls.join(', ') }));
                    setGambarFiles(prev => prev.filter(file => file !== gFile));
                 } else {
                    const errMsg = response ? response.message : 'Ralat Pelayan Google';
                    showStatus('error', `Gambar ${gFile.name} gagal dimuat naik: ${errMsg}`);
                    setLoading(false);
                    return;
                 }
               } catch(err) {
                 showStatus('error', `Ralat fail ${gFile.name}: ${err.message}`);
                 setLoading(false);
                 return;
               }
           }
        }

        const finalGambarKerosakanStr = uploadedImageUrls.join(', ');

        const finalFormData = normalizeOccupancy({
          namaSekolah: currentActiveSchool, statusHunian: String(formData.statusHunian || ''), bilanganHunian: Number(formData.bilanganHunian || 1),
          namaKuarters: finalNamaKuarters, jenisRumah: String(formData.jenisRumah || ''), tahunDibina: String(formData.tahunDibina || ''),
          bilanganBilik: String(formData.bilanganBilik || ''), bilik1Status: String(formData.bilik1Status || ''), bilik1Penghuni: String(formData.bilik1Penghuni || ''),
          bilik2Status: String(formData.bilik2Status || ''), bilik2Penghuni: String(formData.bilik2Penghuni || ''), bilik3Status: String(formData.bilik3Status || ''),
          bilik3Penghuni: String(formData.bilik3Penghuni || ''), ketuaRumah: String(formData.ketuaRumah || ''), namaPenghuni: String(formData.namaPenghuni || ''),
          noKP: String(formData.noKP || ''), jawatan: String(formData.jawatan || ''), noTelefon: String(formData.noTelefon || ''),
          stesenBertugas: String(formData.stesenBertugas || ''), statusPerkahwinan: String(formData.statusPerkahwinan || ''), warden: String(formData.warden || ''),
          tarikhMendiami: String(formData.tarikhMendiami || ''), statusFizikalKuarters: String(formData.statusFizikalKuarters || ''),
          justifikasi: String(formData.justifikasi || ''), justifikasiPPD: String(formData.justifikasiPPD || ''), gambarKerosakan: finalGambarKerosakanStr, permintaanGambarPPD: Boolean(finalGambarKerosakanStr ? false : formData.permintaanGambarPPD), permintaanGambarPPDAt: String(formData.permintaanGambarPPDAt || ''), sejarahPenghuni: Array.isArray(formData.sejarahPenghuni) ? formData.sejarahPenghuni : [], projekNRDA: Boolean(formData.projekNRDA),
          updatedAtDate: new Date().toISOString(),
          createdAtDate: editingRecordId ? (safeSubmissions.find(row => row.id === editingRecordId)?.createdAtDate || new Date().toISOString()) : new Date().toISOString()
        });

        try {
          if (editingRecordId) {
            const cleanLocalEntry = { ...finalFormData, id: editingRecordId };
            const result = await runGas('updateKuartersData', editingRecordId, finalFormData);

            if (result) {
              setSubmissions(prev => prev.map(s => s.id === editingRecordId ? cleanLocalEntry : s));
              showStatus('success', 'Data berjaya dikemas kini.');
              setEditingRecordId(null); setGambarFiles([]); setFormData({ ...initialFormState, namaSekolah: currentActiveSchool });
              setNamaBangunanDipilih(''); setUnitBangunanDipilih('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              await fetchInitialData();
            } else {
              showStatus('error', 'Gagal mengemas kini rekod. Sila muat semula sistem.');
              await fetchInitialData();
            }
          } else {
            const result = await runGas('saveKuartersData', finalFormData);

            if (result) {
              showStatus('success', 'Data berjaya didaftarkan.');
              setGambarFiles([]); setFormData({ ...initialFormState, namaSekolah: currentActiveSchool });
              setNamaBangunanDipilih(''); setUnitBangunanDipilih('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              await fetchInitialData();
            } else {
              showStatus('error', 'Gagal menyimpan rekod.');
            }
          }
        } catch (err) {
          showStatus('error', 'Terjadi ralat pada pelayan.');
          await fetchInitialData();
        } finally {
          setLoading(false);
        }
      };

      const handleAddSchool = async (e) => {
        e.preventDefault();
        if (loading || !isSettingsAdmin(authUser)) return;
        const cleanCode = newSchoolCode.trim().toUpperCase();
        const cleanName = formatSchoolName(newSchoolName.trim());
        const ppdManaged = isPpdManagedLocation({ code: cleanCode, name: cleanName });
        const cleanEmail = ppdManaged ? '' : newSchoolEmail.trim().toLowerCase();
        if (!cleanName || !/^[A-Z0-9-]{3,20}$/.test(cleanCode) || (!ppdManaged && (!/^\S+@\S+\.\S+$/.test(cleanEmail) || newSchoolPassword.length < 8))) {
          showStatus('error', ppdManaged ? 'Isi kod dan nama unit PPD yang sah.' : 'Isi nama, kod, e-mel dan kata laluan sekurang-kurangnya 8 aksara.');
          return;
        }

        setLoading(true);
        try {
          const school = await createSchoolAccount({ schoolName: cleanName, schoolCode: cleanCode, email: cleanEmail, password: ppdManaged ? '' : newSchoolPassword });
          setSchools(prev => [...prev, school.display_name].sort());
          setNewSchoolCode(''); setNewSchoolName(''); setNewSchoolEmail(''); setNewSchoolPassword('');
          showStatus('success', ppdManaged ? 'Unit PPD berjaya didaftarkan.' : 'Sekolah dan akaun log masuk berjaya didaftarkan.');
        } catch (err) {
          showStatus('error', err.message || 'Gagal mendaftarkan sekolah.');
        } finally { setLoading(false); }
      };

      const handleEditSchoolStart = async (schoolName) => {
        if (loading || !isSettingsAdmin(authUser)) return;
        setLoading(true); setEditSchoolPassword(''); setEditingSchool(null);
        try {
          const school = await getSchoolAccount(schoolName);
          const parsed = parseSchoolStr(school.display_name);
          setEditSchoolId(school.id); setEditSchoolCode(school.school_code || parsed.code);
          setEditSchoolName(parsed.name); setEditSchoolEmail(school.account_email || '');
          setEditingSchool(schoolName);
        } catch (error) { showStatus('error', error.message || 'Gagal membaca akaun sekolah.'); }
        finally { setLoading(false); }
      };
      useEffect(() => {
        if (view !== 'settings' || !isSettingsAdmin(authUser)) {
          setEditingSchool(null); setEditSchoolId(null); setEditSchoolEmail('');
          setEditSchoolPassword(''); setNewSchoolPassword('');
        }
      }, [view, authUser]);
      const handleEditSchoolSave = async (oldSchoolName) => {
        if (loading || !isSettingsAdmin(authUser)) return;
        const cleanCode = editSchoolCode.trim().toUpperCase();
        const cleanName = formatSchoolName(editSchoolName.trim());
        const ppdManaged = isPpdManagedLocation({ code: cleanCode, name: cleanName });
        const cleanEmail = ppdManaged ? '' : editSchoolEmail.trim().toLowerCase();
        if (!cleanName || !/^[A-Z0-9-]{3,20}$/.test(cleanCode) || (!ppdManaged && (!/^\S+@\S+\.\S+$/.test(cleanEmail) || (editSchoolPassword && editSchoolPassword.length < 8)))) {
          showStatus('error', ppdManaged ? 'Isi kod dan nama unit PPD yang sah.' : 'Isi nama, kod dan e-mel sah. Kata laluan baharu mestilah sekurang-kurangnya 8 aksara.'); return;
        }

        setLoading(true);
        try {
          const school = await updateSchoolAccount({ schoolId: editSchoolId, schoolName: cleanName, schoolCode: cleanCode, email: cleanEmail, password: ppdManaged ? '' : editSchoolPassword });
          setSchools(prev => prev.map(name => name === oldSchoolName ? school.display_name : name).sort());
          setSelectedSchoolFilter(prev => prev === oldSchoolName ? school.display_name : prev);
          setEditSchoolPassword('');
          setEditingSchool(null);
          await fetchInitialData();
          showStatus('success', 'Sekolah dikemas kini.');
        } catch (err) {
          showStatus('error', err.message || 'Gagal mengemas kini sekolah.');
          await fetchInitialData();
        } finally { setLoading(false); }
      };

      const handleDeleteSchool = async (schoolName) => {
        if (!window.confirm(`Padam rujukan "${schoolName}"?`)) return;
        setLoading(true);
        try {
          const updatedSchools = await runGas('deleteSchool', schoolName);
          if (!Array.isArray(updatedSchools)) throw new Error('Respons sekolah tidak sah.');
          setSchools(updatedSchools.filter(Boolean));
          showStatus('success', 'Sekolah berjaya dipadam.');
        } catch (err) {
          showStatus('error', 'Gagal memadam.');
          await fetchInitialData();
        } finally { setLoading(false); }
      };

      const handleResetSchools = async () => {
        if (!window.confirm('Kembalikan rujukan ke tetapan asal?')) return;
        setLoading(true);
        try {
          const updatedSchools = await runGas('resetSchools');
          if (!Array.isArray(updatedSchools)) throw new Error('Respons sekolah tidak sah.');
          setSchools(updatedSchools.filter(Boolean));
          showStatus('success', 'Senarai diset semula.');
        } catch (err) { showStatus('error', 'Gagal reset.'); } finally { setLoading(false); }
      };

      const handleFileUpload = async () => {
        const titleInput = document.getElementById('tajukFailInput');
        const fileInput = document.getElementById('failInput');
        const tajuk = titleInput.value.trim();
        const fail = fileInput.files[0];

        if (!tajuk) { showStatus('error', 'Sila masukkan tajuk paparan dokumen.'); return; }
        if (!fail) { showStatus('error', 'Sila pilih fail untuk dimuat naik.'); return; }
        if (fail.size > 5 * 1024 * 1024) { showStatus('error', 'Saiz fail melebihi had 5MB.'); return; }

        setLoading(true);
        const reader = new FileReader();
        reader.onload = async function(e) {
          const base64Data = e.target.result.split(',')[1];
          try {
            const payload = { fileName: fail.name, mimeType: fail.type || 'application/octet-stream', data: base64Data, tajuk: tajuk };
            const response = await runGas('uploadFileToDrive', payload);

            if (response && response.success) {
               setFilesList(response.data);
               titleInput.value = ''; fileInput.value = '';
               showStatus('success', 'Dokumen berjaya dimuat naik ke dalam sistem.');
            } else {
               showStatus('error', 'Gagal: ' + (response ? response.message : 'Ralat dari pelayan.'));
            }
          } catch (err) { showStatus('error', 'Ralat pelayan semasa berhubung dengan Supabase Storage.'); } finally { setLoading(false); }
        };
        reader.onerror = () => { showStatus('error', 'Gagal membaca fail dari peranti anda.'); setLoading(false); };
        reader.readAsDataURL(fail);
      };

      const handleDeleteFile = async (id, tajuk) => {
        if (!window.confirm(`Padam fail dokumen "${tajuk}" dari sistem?`)) return;
        setLoading(true);
        try {
          const updatedFiles = await runGas('deleteFile', id);
          if (!Array.isArray(updatedFiles)) throw new Error('Respons fail tidak sah.');
          setFilesList(updatedFiles.filter(Boolean));
          showStatus('success', 'Dokumen berjaya dipadam.');
        } catch (err) {
          showStatus('error', 'Gagal memadam dokumen.');
          await fetchInitialData();
        } finally {
          setLoading(false);
        }
      };

      const handleDeleteRow = async (id) => {
        if (!window.confirm('Padam secara kekal rekod ini?')) return;
        setLoading(true);
        try {
          const result = await runGas('deleteKuartersData', id);
          if (result) {
            setSubmissions(prev => prev.filter(s => s.id !== id));
            if (selectedUnit && selectedUnit.id === id) setSelectedUnit(null);
            showStatus('success', 'Rekod berjaya dipadam.');
          } else {
            showStatus('error', 'Rekod gagal dipadam. Berkemungkinan ID lama tidak sah.');
            await fetchInitialData();
          }
        } catch (err) { showStatus('error', 'Ralat memadam data.'); await fetchInitialData(); } finally { setLoading(false); }
      };

      const exportToExcel = async () => {
        if (filteredSubmissions.length === 0) { showStatus('error', 'Tiada data.'); return; }
        setLoading(true);
        try {
          const escapeCell = (value) => {
            const raw = value === null || value === undefined || value === '' ? '-' : String(value);
            const safeFormula = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
            return safeFormula
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/\n/g, '<br>');
          };
          const columns = [
            'Bil.', 'Sekolah', 'Nama/Label Kuarters', 'Jenis Rumah', 'Tahun Dibina', 'Kapasiti Bilik Utama',
            'Status Pengisian', 'Bilangan Hunian', 'Kondisi Fizikal', 'Bilik 1 Status', 'Bilik 1 Penghuni',
            'Bilik 2 Status', 'Bilik 2 Penghuni', 'Bilik 3 Status', 'Bilik 3 Penghuni', 'Ketua Rumah',
            'Nama Penghuni Utama', 'No. KP', 'Jawatan', 'No. Telefon', 'Stesen Bertugas', 'Status Perkahwinan',
            'Warden', 'Tarikh Mendiami', 'Justifikasi', 'Gambar Kerosakan', 'Projek NRDA'
          ];
          const rows = filteredSubmissions.map((sub, index) => [
            index + 1,
            parseSchoolStr(sub.namaSekolah).name || sub.namaSekolah,
            sub.namaKuarters,
            sub.jenisRumah,
            sub.tahunDibina,
            sub.bilanganBilik,
            sub.statusHunian,
            sub.bilanganHunian,
            formatConditionStatus(sub.statusFizikalKuarters),
            sub.bilik1Status,
            sub.bilik1Penghuni,
            sub.bilik2Status,
            sub.bilik2Penghuni,
            sub.bilik3Status,
            sub.bilik3Penghuni,
            sub.ketuaRumah,
            sub.statusHunian === 'Berpenghuni' ? sub.namaPenghuni : '',
            sub.statusHunian === 'Berpenghuni' ? sub.noKP : '',
            sub.statusHunian === 'Berpenghuni' ? sub.jawatan : '',
            sub.statusHunian === 'Berpenghuni' ? sub.noTelefon : '',
            sub.statusHunian === 'Berpenghuni' ? sub.stesenBertugas : '',
            sub.statusHunian === 'Berpenghuni' ? sub.statusPerkahwinan : '',
            sub.statusHunian === 'Berpenghuni' ? sub.warden : '',
            sub.statusHunian === 'Berpenghuni' ? sub.tarikhMendiami : '',
            sub.justifikasi,
            sub.gambarKerosakan,
            sub.projekNRDA ? 'Ya' : 'Tidak'
          ]);
          const generatedAt = new Date().toLocaleString('ms-MY');
          const head = columns.map((cell) => `<td>${escapeCell(cell)}</td>`).join('');
          const body = rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeCell(cell)}</td>`).join('')}</tr>`).join('');
          const html = `<!doctype html><html><head><meta charset="utf-8"><style>
            table{border-collapse:collapse;font-family:Arial,sans-serif;font-size:12px} th,td{border:1px solid #cbd5e1;padding:6px;vertical-align:top;mso-number-format:'\@'}
            .title{font-size:16px;font-weight:700;color:#1e1b4b}.meta{color:#64748b;font-size:12px}.head td{background:#eef2ff;font-weight:700;color:#4338ca}
          </style></head><body>
            <p class="title">PEJABAT PENDIDIKAN DAERAH LIMBANG, SARAWAK</p>
            <p class="meta">SISTEM PROFIL KUARTERS KEDIAMAN SEKOLAH (eSIPK)</p>
            <p class="meta">Dijana pada: ${escapeCell(generatedAt)} | Rekod: ${filteredSubmissions.length} unit</p>
            <table><tbody><tr class="head">${head}</tr>${body}</tbody></table>
          </body></html>`;
          const blob = new window.Blob(['﻿', html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
          const link = document.createElement('a');
          const url = window.URL.createObjectURL(blob);
          link.href = url;
          link.download = `Laporan_eSIPK_${new Date().toISOString().slice(0,10)}.xls`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          showStatus('success', 'Fail Excel berjaya dijana.');
        } catch (error) {
          showStatus('error', 'Gagal menjana Excel.');
        } finally { setLoading(false); }
      };


      const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm";

      const isSpecialSchool = Boolean(getSpecialSchoolOptions(activeSchool));


  return { editSchoolEmail, setEditSchoolEmail, editSchoolPassword, setEditSchoolPassword, handleEditSchoolStart, isAuthenticated, setIsAuthenticated, authReady, authUser, setAuthUser, loginUsername, setLoginUsername, loginPassword, setLoginPassword, loginError, setLoginError, view, setView, submissions, setSubmissions, schools, setSchools, filesList, setFilesList, activityLogs, setActivityLogs, loginLogs, setLoginLogs, newSchoolCode, setNewSchoolCode, newSchoolName, setNewSchoolName, newSchoolEmail, setNewSchoolEmail, newSchoolPassword, setNewSchoolPassword, searchTerm, setSearchTerm, selectedSchoolFilter, setSelectedSchoolFilter, statusFilter, setStatusFilter, kondisiFilter, setKondisiFilter, loading, setLoading, statusMessage, setStatusMessage, selectedUnit, setSelectedUnit, activeSchool, setActiveSchool, editingRecordId, setEditingRecordId, editingSchool, setEditingSchool, editSchoolCode, setEditSchoolCode, editSchoolName, setEditSchoolName, gambarFiles, setGambarFiles, namaBangunanDipilih, setNamaBangunanDipilih, unitBangunanDipilih, setUnitBangunanDipilih, initialFormState, formData, setFormData, fetchInitialData, handleLogin, handleLogout, safeSubmissions, roleFilteredSubmissions, baseFilteredSubmissions, filteredSubmissions, totalUnits, occupiedUnits, unoccupiedUnits, kondisiBaik, kondisiRosakRingan, kondisiRosakBerat, kondisiDiselenggara, showStatus, handleChange, handleEditRow, handleCancelEdit, handleRequestImageUpload, handleSavePpdFeedback, handleOccupantMovedOut, handleSingleOccupantMovedOut, handleRemoveExistingImage, handleRemoveNewFile, handleSubmit, handleAddSchool, handleEditSchoolSave, handleDeleteSchool, handleResetSchools, handleFileUpload, handleDeleteFile, handleDeleteRow, exportToExcel, inputClass, isSpecialSchool, navigate };
}
