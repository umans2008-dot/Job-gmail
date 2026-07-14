import React, { useState, useMemo } from 'react';
import { GmailRate, AppSettings, Transaction, User, Withdrawal, Announcement } from '../types';
import { 
  Users, DollarSign, ClipboardList, TrendingUp, ShieldCheck, 
  Settings, AlertCircle, MessageSquare, Trash2, CheckCircle, 
  XCircle, ArrowRight, RefreshCw, Plus, Calendar, Edit, Database, Landmark, ShieldAlert,
  Copy, Check
} from 'lucide-react';
import SupabaseGuide from './SupabaseGuide';

interface AdminDashboardProps {
  rates: GmailRate[];
  onSaveRates: (newRates: GmailRate[]) => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  transactions: Transaction[];
  onUpdateTransaction: (updatedTx: Transaction) => void;
  withdrawals: Withdrawal[];
  onUpdateWithdrawal: (updatedWd: Withdrawal) => void;
  users: User[];
  onDeleteUser?: (userId: string) => void;
  announcements: Announcement[];
  onAddAnnouncement: (ann: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export default function AdminDashboard({
  rates,
  onSaveRates,
  settings,
  onSaveSettings,
  transactions,
  onUpdateTransaction,
  withdrawals,
  onUpdateWithdrawal,
  users,
  onDeleteUser,
  announcements,
  onAddAnnouncement,
  onDeleteAnnouncement,
}: AdminDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'setoran' | 'withdrawals' | 'users' | 'announcements' | 'rates' | 'supabase'>('setoran');

  // New Announcement states
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState<'info' | 'success' | 'warning' | 'danger'>('info');

  // Selected Transaction for Checking Detail
  const [selectedTxForReview, setSelectedTxForReview] = useState<Transaction | null>(null);
  const [adminReviewNotes, setAdminReviewNotes] = useState('');
  const [txStatusFilter, setTxStatusFilter] = useState<'all' | 'pending' | 'checking' | 'completed' | 'rejected'>('all');
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New states for Withdrawals (replacing prompts)
  const [selectedWdForReview, setSelectedWdForReview] = useState<Withdrawal | null>(null);
  const [wdActionType, setWdActionType] = useState<'completed' | 'rejected' | null>(null);
  const [wdAdminNotes, setWdAdminNotes] = useState('');
  const [wdStatusFilter, setWdStatusFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');
  const [wdSearchQuery, setWdSearchQuery] = useState('');
  const [wdSuccessMessage, setWdSuccessMessage] = useState<string | null>(null);

  // New states for User management
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userSuccessMessage, setUserSuccessMessage] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Toast notification state
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // General App Settings states
  const [adminPin, setAdminPin] = useState(settings.adminPin);
  const [whatsappAdmin, setWhatsappAdmin] = useState(settings.whatsappAdmin);
  const [whatsappAdmin2, setWhatsappAdmin2] = useState(settings.whatsappAdmin2 || '6285716766584');
  const [recoveryDomain, setRecoveryDomain] = useState(settings.recommendedRecoveryDomain);

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  const counts = useMemo(() => {
    return {
      all: transactions.length,
      pending: transactions.filter(t => t.status === 'pending').length,
      checking: transactions.filter(t => t.status === 'checking').length,
      completed: transactions.filter(t => t.status === 'completed').length,
      rejected: transactions.filter(t => t.status === 'rejected').length,
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let list = transactions;
    if (txStatusFilter !== 'all') {
      list = list.filter(t => t.status === txStatusFilter);
    }
    if (txSearchQuery.trim()) {
      const q = txSearchQuery.trim().toLowerCase();
      list = list.filter(t => t.id.toLowerCase().includes(q) || t.whatsapp.toLowerCase().includes(q));
    }
    return list;
  }, [transactions, txStatusFilter, txSearchQuery]);

  const wdCounts = useMemo(() => {
    return {
      all: withdrawals.length,
      pending: withdrawals.filter(w => w.status === 'pending').length,
      completed: withdrawals.filter(w => w.status === 'completed').length,
      rejected: withdrawals.filter(w => w.status === 'rejected').length,
    };
  }, [withdrawals]);

  const filteredWithdrawals = useMemo(() => {
    let list = withdrawals;
    if (wdStatusFilter !== 'all') {
      list = list.filter(w => w.status === wdStatusFilter);
    }
    if (wdSearchQuery.trim()) {
      const q = wdSearchQuery.trim().toLowerCase();
      list = list.filter(w => 
        w.id.toLowerCase().includes(q) || 
        w.userUsername.toLowerCase().includes(q) ||
        w.accountNumber.toLowerCase().includes(q) ||
        w.accountName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [withdrawals, wdStatusFilter, wdSearchQuery]);

  const filteredUsers = useMemo(() => {
    let list = users;
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.trim().toLowerCase();
      list = list.filter(u => 
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.whatsapp.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, userSearchQuery]);

  // 1. ANNOUNCEMENT ACTIONS
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      showToast('Mohon isi judul dan konten pengumuman!', 'error');
      return;
    }

    const newAnn: Announcement = {
      id: 'ANN-' + Math.floor(100 + Math.random() * 900),
      title: annTitle.trim(),
      content: annContent.trim(),
      type: annType,
      createdAt: new Date().toISOString()
    };

    onAddAnnouncement(newAnn);
    setAnnTitle('');
    setAnnContent('');
    setAnnType('info');
    showToast('Pengumuman berhasil diterbitkan!', 'success');
  };

  // 2. TRANSACTION / SETORAN GMAIL ACTIONS
  const handleToggleAccountCheck = (tx: Transaction, index: number, isOk: boolean) => {
    // Clone transaction and update the individual account status
    const clonedTx = JSON.parse(JSON.stringify(tx)) as Transaction;
    if (clonedTx.gmails[index]) {
      clonedTx.gmails[index].status = isOk ? 'valid' : 'invalid';
    }

    // Calculate valid count
    const validCount = clonedTx.gmails.filter(g => g.status === 'valid').length;
    clonedTx.quantityValid = validCount;
    clonedTx.totalPayout = validCount * clonedTx.ratePerAccount;

    onUpdateTransaction(clonedTx);
    
    // Sync review interface
    if (selectedTxForReview && selectedTxForReview.id === tx.id) {
      setSelectedTxForReview(clonedTx);
    }
  };

  const handleUpdateStatusAndSubmitReview = (tx: Transaction, finalStatus: 'completed' | 'rejected' | 'checking') => {
    const clonedTx = JSON.parse(JSON.stringify(tx)) as Transaction;
    clonedTx.status = finalStatus;
    clonedTx.adminNotes = adminReviewNotes.trim() || (finalStatus === 'completed' ? 'Semua akun valid, dana disalurkan ke saldo.' : 'Setoran ditolak, mohon periksa catatan.');
    clonedTx.updatedAt = new Date().toISOString();

    onUpdateTransaction(clonedTx);
    setSelectedTxForReview(null);
    setAdminReviewNotes('');
    showToast(`Status setoran ${tx.id} berhasil diupdate ke: ${finalStatus.toUpperCase()}!`, 'success');
  };

  // 3. WITHDRAWAL ACTIONS
  const handleOpenWdReview = (wd: Withdrawal, action: 'completed' | 'rejected') => {
    setSelectedWdForReview(wd);
    setWdActionType(action);
    setWdAdminNotes(action === 'completed' ? 'Pencairan sukses ditransfer.' : 'Ditolak: Detail bank tidak valid / error.');
  };

  const handleSubmitWdReview = () => {
    if (!selectedWdForReview || !wdActionType) return;

    const clonedWd = { ...selectedWdForReview };
    clonedWd.status = wdActionType;
    clonedWd.adminNotes = wdAdminNotes.trim() || (wdActionType === 'completed' ? 'Pencairan sukses ditransfer.' : 'Ditolak.');
    clonedWd.updatedAt = new Date().toISOString();

    onUpdateWithdrawal(clonedWd);

    setWdSuccessMessage(`Sukses mengubah status penarikan ${selectedWdForReview.id} ke ${wdActionType.toUpperCase()}`);
    setSelectedWdForReview(null);
    setWdActionType(null);
    setWdAdminNotes('');

    setTimeout(() => {
      setWdSuccessMessage(null);
    }, 4000);
  };

  // 3.5 USER MANAGEMENT ACTIONS
  const handleConfirmDeleteUser = (user: User) => {
    setUserToDelete(user);
  };

  const executeDeleteUser = () => {
    if (!userToDelete) return;
    if (onDeleteUser) {
      onDeleteUser(userToDelete.id);
      setUserSuccessMessage(`Mitra @${userToDelete.username} berhasil dihapus.`);
    }
    setUserToDelete(null);
    setTimeout(() => {
      setUserSuccessMessage(null);
    }, 4000);
  };

  // 4. RATE CHANGING
  const handleRateFieldChange = (key: string, field: 'price' | 'description', value: any) => {
    const updatedRates = rates.map(r => {
      if (r.key === key) {
        return { ...r, [field]: value };
      }
      return r;
    });
    onSaveRates(updatedRates);
  };

  // 5. SYSTEM SETTINGS SAVING
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const newSettings: AppSettings = {
      adminPin: adminPin.trim() || '123456',
      whatsappAdmin: whatsappAdmin.trim().replace('+', ''),
      whatsappAdmin2: whatsappAdmin2.trim().replace('+', ''),
      recommendedRecoveryDomain: recoveryDomain.trim().replace('@', '')
    };
    onSaveSettings(newSettings);
    showToast('Konfigurasi sistem berhasil disimpan!', 'success');
  };

  // Statistics calculation for admin
  const adminStats = useMemo(() => {
    const pendingSubmissions = transactions.filter(t => t.status === 'pending' || t.status === 'checking').length;
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
    
    const totalTransactionsCompleted = transactions.filter(t => t.status === 'completed');
    const totalDepositedVolume = totalTransactionsCompleted.reduce((acc, curr) => acc + curr.quantityValid, 0);
    const totalPayoutDisbursed = totalTransactionsCompleted.reduce((acc, curr) => acc + curr.totalPayout, 0);
    
    const totalWdDisbursed = withdrawals.filter(w => w.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0);

    return {
      pendingSubmissions,
      pendingWithdrawals,
      totalDepositedVolume,
      totalPayoutDisbursed,
      totalWdDisbursed,
      totalUsers: users.length
    };
  }, [transactions, withdrawals, users]);

  return (
    <div className="space-y-8 relative" id="admin-dashboard">

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-950 border border-slate-900 rounded-2xl p-4 shadow-2xl flex items-center gap-3.5 max-w-sm font-mono border-l-4 border-l-amber-500">
          <div className={`w-2.5 h-2.5 rounded-full ${
            toast.type === 'success' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' :
            toast.type === 'error' ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
            'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
          }`} />
          <span className="text-xs font-bold text-slate-100">{toast.text}</span>
        </div>
      )}
      
      {/* Top Admin Summary Banner */}
      <div className="bg-[#0c0f0a] border border-emerald-950 rounded-2xl p-6 shadow-md grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-500 font-mono block">SETORAN ANTRI</span>
          <strong className="text-amber-400 font-mono text-base">{adminStats.pendingSubmissions} Antrian</strong>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-500 font-mono block">WD PENDING</span>
          <strong className="text-amber-400 font-mono text-base">{adminStats.pendingWithdrawals} Request</strong>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-500 font-mono block">GMAIL TERVERIFIKASI</span>
          <strong className="text-slate-200 font-mono text-base">{adminStats.totalDepositedVolume} Akun</strong>
        </div>
        <div className="space-y-0.5 col-span-1">
          <span className="text-[10px] text-slate-500 font-mono block">TOTAL TRANSFERAN</span>
          <strong className="text-emerald-400 font-mono text-base">{formatRupiah(adminStats.totalPayoutDisbursed)}</strong>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-500 font-mono block">SALDO DICARIKAN</span>
          <strong className="text-slate-200 font-mono text-base">{formatRupiah(adminStats.totalWdDisbursed)}</strong>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-500 font-mono block">MITRA TERDAFTAR</span>
          <strong className="text-slate-200 font-mono text-base">{adminStats.totalUsers} User</strong>
        </div>
      </div>

      {/* Admin Panel Tabs */}
      <div className="flex flex-wrap border-b border-slate-900 bg-slate-950/20 p-1 rounded-xl max-w-3xl">
        <button
          onClick={() => { setActiveSubTab('setoran'); setSelectedTxForReview(null); }}
          className={`px-4 py-2 text-xs font-bold font-mono rounded-lg transition-all ${
            activeSubTab === 'setoran' ? 'bg-slate-900 text-amber-400 border border-slate-800' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Check Setoran ({adminStats.pendingSubmissions})
        </button>
        <button
          onClick={() => setActiveSubTab('withdrawals')}
          className={`px-4 py-2 text-xs font-bold font-mono rounded-lg transition-all ${
            activeSubTab === 'withdrawals' ? 'bg-slate-900 text-amber-400 border border-slate-800' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Konfirmasi WD ({adminStats.pendingWithdrawals})
        </button>
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 text-xs font-bold font-mono rounded-lg transition-all ${
            activeSubTab === 'users' ? 'bg-slate-900 text-amber-400 border border-slate-800' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Daftar Mitra ({users.length})
        </button>
        <button
          onClick={() => setActiveSubTab('announcements')}
          className={`px-4 py-2 text-xs font-bold font-mono rounded-lg transition-all ${
            activeSubTab === 'announcements' ? 'bg-slate-900 text-amber-400 border border-slate-800' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Buat Pengumuman
        </button>
        <button
          onClick={() => setActiveSubTab('rates')}
          className={`px-4 py-2 text-xs font-bold font-mono rounded-lg transition-all ${
            activeSubTab === 'rates' ? 'bg-slate-900 text-amber-400 border border-slate-800' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Rates & PIN
        </button>
        <button
          onClick={() => setActiveSubTab('supabase')}
          className={`px-4 py-2 text-xs font-bold font-mono rounded-lg transition-all ${
            activeSubTab === 'supabase' ? 'bg-slate-900 text-emerald-400 border border-slate-800' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Supabase SQL Setup
        </button>
      </div>

      {/* Admin Sections */}
      <div className="min-h-[400px]">

        {/* 1. CHECK SETORAN / VERIFY GMAILS */}
        {activeSubTab === 'setoran' && (
          <div className="space-y-6">
            
            {/* If a transaction is being reviewed/checked */}
            {selectedTxForReview ? (
              <div className="bg-[#080d0f] border border-slate-900 rounded-2xl p-6 space-y-6 shadow-md" id="admin-checker-panel">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3 flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono font-bold block uppercase">VERIFIKATOR MANUAL JURAGAN</span>
                    <h3 className="text-sm font-black text-slate-100 font-mono uppercase">Menilai Setoran: {selectedTxForReview.id}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedTxForReview(null)}
                    className="bg-slate-950 border border-slate-900 hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-xs px-3 py-1.5 rounded-lg font-mono font-bold cursor-pointer"
                  >
                    ← Kembali ke List
                  </button>
                </div>

                {/* Submitter Quick info bar */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-950/60 rounded-xl border border-slate-900 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px]">WhatsApp</span>
                    <strong className="text-emerald-400">+{selectedTxForReview.whatsapp}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px]">Kategori</span>
                    <strong className="text-slate-200">{selectedTxForReview.categoryLabel}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px]">Harga / Akun</span>
                    <strong className="text-amber-400">Rp {selectedTxForReview.ratePerAccount}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px]">Estimasi Payout</span>
                    <strong className="text-emerald-400">{formatRupiah(selectedTxForReview.totalPayout)}</strong>
                  </div>
                </div>                {/* Gmail list to check */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-400 border-b border-slate-900 pb-3">
                    <div className="space-y-0.5">
                      <span className="font-bold block text-slate-200">Daftar Akun yang Disetor ({selectedTxForReview.gmails.length} Akun):</span>
                      <span className="text-[10px] text-slate-500">Klik tombol <strong className="text-emerald-400">VALID</strong> / <strong className="text-rose-400 font-bold">INVALID</strong> pada masing-masing akun untuk memverifikasi.</span>
                    </div>
                    
                    <button
                      onClick={() => {
                        const allTxt = selectedTxForReview.gmails.map(g => `${g.email}|${g.pass}|${g.recovery || ''}`).join('\n');
                        navigator.clipboard.writeText(allTxt);
                        setCopiedId('bulk-all');
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className="bg-amber-500 hover:bg-amber-400 active:translate-y-0.5 text-slate-950 font-black px-4 py-2 rounded-xl text-[10px] uppercase font-mono tracking-wider cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
                    >
                      {copiedId === 'bulk-all' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Berhasil Disalin! ({selectedTxForReview.gmails.length} Akun)</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Semua Akun (Bulk Copy)</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {selectedTxForReview.gmails.map((g, idx) => {
                      const accountText = `${g.email}|${g.pass}|${g.recovery || ''}`;
                      const isLineCopied = copiedId === `line-${idx}`;
                      const isEmailCopied = copiedId === `email-${idx}`;
                      const isPassCopied = copiedId === `pass-${idx}`;
                      const isRecCopied = copiedId === `rec-${idx}`;

                      const copyToClipboard = (text: string, id: string) => {
                        navigator.clipboard.writeText(text);
                        setCopiedId(id);
                        setTimeout(() => setCopiedId(null), 1500);
                      };

                      return (
                        <div key={idx} className="bg-[#0b1215] border border-slate-900 rounded-xl p-4 space-y-3.5 transition-colors hover:border-slate-800">
                          {/* Top row with Index, Status indicator, and quick-copy the whole account */}
                          <div className="flex items-center justify-between border-b border-slate-900/50 pb-2 text-xs font-mono">
                            <div className="flex items-center gap-2">
                              <span className="bg-slate-950 text-amber-500 font-black px-2 py-0.5 rounded text-[10px] border border-slate-900">
                                #{idx + 1}
                              </span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                g.status === 'valid'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : g.status === 'invalid'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-slate-950 text-slate-500 border border-slate-900'
                              }`}>
                                {g.status === 'valid' ? '✔ Valid' : g.status === 'invalid' ? '❌ Invalid' : '⏳ Belum Diperiksa'}
                              </span>
                            </div>

                            <button
                              onClick={() => copyToClipboard(accountText, `line-${idx}`)}
                              className="text-[10px] text-slate-400 hover:text-amber-400 font-bold flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-900 cursor-pointer transition-colors"
                            >
                              {isLineCopied ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400 font-mono">Tersalin!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-slate-500" />
                                  <span>Salin Format Setor (Email|Sandi|Pemulihan)</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Grid with structured, labeled fields & Copy buttons */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                            {/* Email field */}
                            <div className="bg-slate-950/65 border border-slate-900 p-2.5 rounded-xl flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">EMAIL</span>
                                <span className="text-slate-200 select-all break-all font-black text-xs block">{g.email}</span>
                              </div>
                              <button
                                onClick={() => copyToClipboard(g.email, `email-${idx}`)}
                                className="p-1.5 hover:bg-slate-900 text-slate-500 hover:text-slate-200 rounded-lg transition-all cursor-pointer border border-transparent hover:border-slate-800"
                                title="Salin Email"
                              >
                                {isEmailCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>

                            {/* Password field */}
                            <div className="bg-slate-950/65 border border-slate-900 p-2.5 rounded-xl flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">SANDI / PASSWORD</span>
                                <span className="text-amber-400 select-all break-all font-black text-xs block">{g.pass}</span>
                              </div>
                              <button
                                onClick={() => copyToClipboard(g.pass, `pass-${idx}`)}
                                className="p-1.5 hover:bg-slate-900 text-slate-500 hover:text-slate-200 rounded-lg transition-all cursor-pointer border border-transparent hover:border-slate-800"
                                title="Salin Sandi"
                              >
                                {isPassCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>

                            {/* Recovery field */}
                            <div className="bg-slate-950/65 border border-slate-900 p-2.5 rounded-xl flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">EMAIL PEMULIHAN / RECOVERY</span>
                                <span className="text-slate-300 select-all break-all block text-xs font-semibold">{g.recovery || '(Kosong / Belum Diset)'}</span>
                              </div>
                              <button
                                onClick={() => copyToClipboard(g.recovery || '', `rec-${idx}`)}
                                className="p-1.5 hover:bg-slate-900 text-slate-500 hover:text-slate-200 rounded-lg transition-all cursor-pointer border border-transparent hover:border-slate-800"
                                title="Salin Pemulihan"
                                disabled={!g.recovery}
                              >
                                {isRecCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Quick checking status switcher bar */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-900/40">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hasil Verifikasi Akun:</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleAccountCheck(selectedTxForReview, idx, true)}
                                className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase transition-all cursor-pointer border ${
                                  g.status === 'valid'
                                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-sm'
                                    : 'bg-slate-950 text-emerald-500 border-emerald-950/40 hover:bg-emerald-500/10 hover:text-emerald-400'
                                }`}
                              >
                                ✔ Valid
                              </button>
                              <button
                                onClick={() => handleToggleAccountCheck(selectedTxForReview, idx, false)}
                                className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase transition-all cursor-pointer border ${
                                  g.status === 'invalid'
                                    ? 'bg-rose-500 text-slate-950 border-rose-400 font-extrabold shadow-sm'
                                    : 'bg-slate-950 text-rose-500 border-rose-950/40 hover:bg-rose-500/10 hover:text-rose-400'
                                }`}
                              >
                                ❌ Invalid
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Final Decision Form */}
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 space-y-4">
                  <div className="flex justify-between items-center text-xs font-mono border-b border-slate-900 pb-2">
                    <span className="text-slate-400">Total Akun Valid: <strong className="text-emerald-400">{selectedTxForReview.quantityValid}</strong></span>
                    <span className="text-slate-400">Payout Akhir: <strong className="text-emerald-400">{formatRupiah(selectedTxForReview.totalPayout)}</strong></span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Catatan Owner untuk Mitra</label>
                    <textarea
                      rows={2}
                      value={adminReviewNotes}
                      onChange={(e) => setAdminReviewNotes(e.target.value)}
                      placeholder="Contoh: 3 akun valid, 2 akun salah sandi. Saldo otomatis disalurkan ke akun Anda."
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => handleUpdateStatusAndSubmitReview(selectedTxForReview, 'completed')}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-2.5 rounded-lg text-xs uppercase font-mono cursor-pointer"
                    >
                      Selesaikan (Cairkan ke Saldo User)
                    </button>
                    <button
                      onClick={() => handleUpdateStatusAndSubmitReview(selectedTxForReview, 'rejected')}
                      className="bg-rose-500 hover:bg-rose-400 text-slate-950 font-black px-6 py-2.5 rounded-lg text-xs uppercase font-mono cursor-pointer"
                    >
                      Tolak Semua Setoran
                    </button>
                    <button
                      onClick={() => handleUpdateStatusAndSubmitReview(selectedTxForReview, 'checking')}
                      className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-black px-6 py-2.5 rounded-lg text-xs uppercase font-mono cursor-pointer"
                    >
                      Set Sedang Diperiksa
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="space-y-5">
                
                {/* Header and Search Actions */}
                <div className="bg-[#080d0f] border border-slate-900 rounded-2xl p-6 shadow-md space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-base font-black text-slate-100 font-mono uppercase tracking-tight flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-amber-500" />
                        <span>ANTRIAN PEMERIKSAAN SETORAN GMAIL</span>
                      </h3>
                      <p className="text-slate-400 text-xs mt-0.5">Daftar setoran Gmail dari mitra yang menunggu verifikasi keabsahan data.</p>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="relative max-w-xs w-full">
                      <input
                        type="text"
                        value={txSearchQuery}
                        onChange={(e) => setTxSearchQuery(e.target.value)}
                        placeholder="Cari WA / ID Setoran..."
                        className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500/50 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                      />
                      {txSearchQuery && (
                        <button
                          onClick={() => setTxSearchQuery('')}
                          className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-xs font-mono font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Tabs with Counts */}
                  <div className="flex flex-wrap gap-1.5 border-t border-slate-900/60 pt-4">
                    {[
                      { key: 'all', label: 'Semua', count: counts.all, color: 'text-slate-400' },
                      { key: 'pending', label: 'Pending', count: counts.pending, color: 'text-amber-400' },
                      { key: 'checking', label: 'Diperiksa', count: counts.checking, color: 'text-blue-400' },
                      { key: 'completed', label: 'Selesai', count: counts.completed, color: 'text-emerald-400' },
                      { key: 'rejected', label: 'Ditolak', count: counts.rejected, color: 'text-rose-400' }
                    ].map((tab) => {
                      const isActive = txStatusFilter === tab.key;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setTxStatusFilter(tab.key as any)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 border ${
                            isActive
                              ? 'bg-slate-900 text-amber-400 border-slate-800 shadow-md'
                              : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-950/50'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                            isActive 
                              ? 'bg-amber-500/10 text-amber-400' 
                              : 'bg-slate-950 text-slate-500'
                          }`}>
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Queue Cards list */}
                {filteredTransactions.length === 0 ? (
                  <div className="bg-[#080d0f] border border-slate-900 rounded-2xl p-12 text-center text-slate-500 text-xs font-mono">
                    Tidak ada antrian setoran Gmail yang cocok dengan kriteria filter saat ini.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTransactions.slice().reverse().map((tx) => {
                      const isPending = tx.status === 'pending';
                      const isChecking = tx.status === 'checking';
                      const isCompleted = tx.status === 'completed';
                      const isRejected = tx.status === 'rejected';

                      return (
                        <div
                          key={tx.id}
                          className={`bg-[#080d0f]/90 border rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 transition-all ${
                            isPending 
                              ? 'border-amber-950/60 shadow-[0_0_12px_rgba(245,158,11,0.02)]' 
                              : isChecking
                              ? 'border-blue-950/60 shadow-[0_0_12px_rgba(59,130,246,0.02)]'
                              : 'border-slate-900/80 hover:border-slate-800'
                          }`}
                        >
                          {/* Left Details Group */}
                          <div className="space-y-2 font-mono flex-1">
                            <div className="flex items-center flex-wrap gap-2.5">
                              <span className="text-[10px] font-black tracking-widest text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-900 uppercase">
                                SETORAN ID
                              </span>
                              <strong className="text-amber-400 text-sm tracking-tight">{tx.id}</strong>
                              
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                                isPending
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                                  : isChecking
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                  : isCompleted
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}>
                                {isPending ? '⏳ Antri' : isChecking ? '🔍 Diperiksa' : isCompleted ? '✔ Selesai' : '❌ Ditolak'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
                              <div className="text-slate-400 flex items-center gap-1.5">
                                <span className="text-slate-600">Mitra:</span>
                                <strong className="text-slate-300 font-bold font-mono">+{tx.whatsapp}</strong>
                              </div>
                              <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                                <span>{new Date(tx.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                              </div>
                            </div>
                          </div>

                          {/* Center Stats Group */}
                          <div className="grid grid-cols-3 gap-6 px-5 py-3 bg-slate-950/65 rounded-xl border border-slate-900/60 font-mono text-center lg:text-left shrink-0">
                            <div className="space-y-0.5 min-w-[70px]">
                              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider block">SETOR</span>
                              <span className="text-slate-200 text-xs font-black">{tx.quantitySubmitted} <span className="text-[10px] font-normal text-slate-500">pcs</span></span>
                            </div>
                            <div className="space-y-0.5 border-x border-slate-900 px-4 min-w-[70px]">
                              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider block">VALID</span>
                              <span className={`text-xs font-black ${isCompleted ? 'text-emerald-400' : isRejected ? 'text-rose-500' : 'text-slate-400'}`}>
                                {isPending ? '-' : `${tx.quantityValid} pcs`}
                              </span>
                            </div>
                            <div className="space-y-0.5 min-w-[100px]">
                              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider block">TOTAL PAYOUT</span>
                              <span className="text-emerald-400 text-xs font-black">{formatRupiah(tx.totalPayout)}</span>
                            </div>
                          </div>

                          {/* Right Action Button */}
                          <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                            <button
                              onClick={() => {
                                setSelectedTxForReview(tx);
                                setAdminReviewNotes(tx.adminNotes);
                              }}
                              className="bg-amber-500 hover:bg-amber-400 active:translate-y-0.5 text-slate-950 font-black px-4 py-2.5 rounded-xl text-[10px] uppercase font-mono tracking-wider cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                            >
                              <span>Periksa Akun</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* 2. KONFIRMASI WITHDRAWALS */}
        {activeSubTab === 'withdrawals' && (
          <div className="space-y-5">
            {wdSuccessMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs font-mono flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{wdSuccessMessage}</span>
              </div>
            )}

            {selectedWdForReview ? (
              <div className="bg-[#080d0f] border border-slate-900 rounded-2xl p-6 shadow-md space-y-6">
                <div className="border-b border-slate-900 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-black text-slate-100 font-mono uppercase tracking-tight">PROSES PENARIKAN SALDO</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Tinjau permohonan penarikan dana dan berikan catatan sebelum konfirmasi.</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedWdForReview(null);
                      setWdActionType(null);
                      setWdAdminNotes('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-300 font-mono font-bold"
                  >
                    ← Kembali
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 border border-slate-900 p-4 rounded-xl text-xs font-mono">
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">INFORMASI MITRA & PENARIKAN</span>
                    <p className="text-slate-300">ID Penarikan: <strong className="text-amber-400 text-sm font-black">{selectedWdForReview.id}</strong></p>
                    <p className="text-slate-300">Username: <strong className="text-slate-100">@{selectedWdForReview.userUsername}</strong></p>
                    <p className="text-slate-300">Tanggal Pengajuan: <span className="text-slate-400">{new Date(selectedWdForReview.createdAt).toLocaleString('id-ID')}</span></p>
                    <p className="text-slate-300">Tipe Aksi: <span className={`font-black uppercase ${wdActionType === 'completed' ? 'text-emerald-400' : 'text-rose-400'}`}>{wdActionType === 'completed' ? 'PENCIRAN / APPROVE' : 'PENOLAKAN / REJECT'}</span></p>
                  </div>

                  <div className="space-y-2 md:border-l md:border-slate-900 md:pl-4">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">INFORMASI REKENING TUJUAN</span>
                    <p className="text-slate-300">Nominal Tarik: <strong className="text-emerald-400 text-sm font-black">{formatRupiah(selectedWdForReview.amount)}</strong></p>
                    <p className="text-slate-300">Bank / E-Wallet: <strong className="text-slate-200 uppercase">{selectedWdForReview.paymentMethod}</strong></p>
                    <p className="text-slate-300">No. Rekening: <strong className="text-amber-400 select-all font-black">{selectedWdForReview.accountNumber}</strong></p>
                    <p className="text-slate-300 font-bold">A/N Pemilik: <span className="text-slate-200 uppercase">{selectedWdForReview.accountName}</span></p>
                  </div>
                </div>

                {/* Input catatan */}
                <div className="space-y-2 font-mono text-xs">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Catatan Admin untuk Mitra *</label>
                  <textarea
                    rows={3}
                    value={wdAdminNotes}
                    onChange={(e) => setWdAdminNotes(e.target.value)}
                    placeholder="Masukkan bukti transfer atau alasan penolakan..."
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 placeholder:text-slate-700"
                  />
                  <p className="text-[10px] text-slate-500 italic">Catatan ini akan langsung terlihat oleh mitra di riwayat penarikan dana mereka.</p>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 font-mono">
                  <button
                    onClick={() => {
                      setSelectedWdForReview(null);
                      setWdActionType(null);
                      setWdAdminNotes('');
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-black px-5 py-3 rounded-xl text-xs uppercase cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmitWdReview}
                    className={`font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all ${
                      wdActionType === 'completed'
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                        : 'bg-rose-500 hover:bg-rose-400 text-slate-950'
                    }`}
                  >
                    {wdActionType === 'completed' ? '✔ Konfirmasi Cairkan' : '❌ Konfirmasi Tolak'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Header, Search and Filter */}
                <div className="bg-[#080d0f] border border-slate-900 rounded-2xl p-6 shadow-md space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-base font-black text-slate-100 font-mono uppercase tracking-tight">KONFIRMASI PENARIKAN SALDO MITRA</h3>
                      <p className="text-slate-400 text-xs mt-0.5">Proses permohonan penarikan saldo dan transfer dana ke rekening e-wallet/bank mitra Anda.</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-xs w-full">
                      <input
                        type="text"
                        value={wdSearchQuery}
                        onChange={(e) => setWdSearchQuery(e.target.value)}
                        placeholder="Cari Username/Rekening/Nama..."
                        className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500/50 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                      />
                      {wdSearchQuery && (
                        <button
                          onClick={() => setWdSearchQuery('')}
                          className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-xs font-mono font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Tabs with Counts */}
                  <div className="flex flex-wrap gap-1.5 border-t border-slate-900/60 pt-4">
                    {[
                      { key: 'all', label: 'Semua', count: wdCounts.all, color: 'text-slate-400' },
                      { key: 'pending', label: 'Pending', count: wdCounts.pending, color: 'text-amber-400' },
                      { key: 'completed', label: 'Cair', count: wdCounts.completed, color: 'text-emerald-400' },
                      { key: 'rejected', label: 'Ditolak', count: wdCounts.rejected, color: 'text-rose-400' }
                    ].map((tab) => {
                      const isActive = wdStatusFilter === tab.key;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setWdStatusFilter(tab.key as any)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 border ${
                            isActive
                              ? 'bg-slate-900 text-amber-400 border-slate-800 shadow-md'
                              : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-950/50'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                            isActive 
                              ? 'bg-amber-500/10 text-amber-400' 
                              : 'bg-slate-950 text-slate-500'
                          }`}>
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* List withdrawals */}
                {filteredWithdrawals.length === 0 ? (
                  <div className="bg-[#080d0f] border border-slate-900 rounded-2xl p-12 text-center text-slate-500 text-xs font-mono">
                    Tidak ada data penarikan saldo yang cocok dengan kriteria filter saat ini.
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {filteredWithdrawals.slice().reverse().map((wd) => {
                      const isPending = wd.status === 'pending';
                      const isCompleted = wd.status === 'completed';
                      const isRejected = wd.status === 'rejected';

                      return (
                        <div 
                          key={wd.id} 
                          className={`bg-[#080d0f]/90 border rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 transition-all ${
                            isPending 
                              ? 'border-amber-950/60 shadow-[0_0_12px_rgba(245,158,11,0.02)]' 
                              : isCompleted
                              ? 'border-emerald-950/20'
                              : 'border-slate-900/80 hover:border-slate-800'
                          }`}
                        >
                          <div className="space-y-2 font-mono flex-1">
                            <div className="flex items-center flex-wrap gap-2.5">
                              <span className="text-[10px] font-black tracking-widest text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-900 uppercase">
                                PENARIKAN ID
                              </span>
                              <strong className="text-amber-400 text-sm tracking-tight">{wd.id}</strong>
                              
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                                isPending
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                                  : isCompleted
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                {isPending ? '⏳ Pending' : isCompleted ? '✔ Cair' : '❌ Ditolak'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
                              <div className="text-slate-400 flex items-center gap-1.5">
                                <span className="text-slate-600">Mitra:</span>
                                <strong className="text-slate-200">@{wd.userUsername}</strong>
                              </div>
                              <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                                <span>{new Date(wd.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                              </div>
                            </div>

                            {/* Show Admin Notes if verified */}
                            {wd.adminNotes && (
                              <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-900/40 text-[11px] text-slate-400">
                                <span className="text-[9px] font-bold text-slate-500 block uppercase mb-0.5">Catatan Admin:</span>
                                <span>{wd.adminNotes}</span>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-5 py-3.5 bg-slate-950/65 rounded-xl border border-slate-900/60 font-mono text-left shrink-0 sm:min-w-[320px]">
                            <div className="space-y-0.5">
                              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider block">NOMINAL</span>
                              <span className="text-emerald-400 text-sm font-black">{formatRupiah(wd.amount)}</span>
                            </div>
                            <div className="space-y-0.5 border-t sm:border-t-0 sm:border-l border-slate-900 pt-2 sm:pt-0 sm:pl-4">
                              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider block">TUJUAN TRANSFER</span>
                              <span className="text-slate-200 text-[11px] block uppercase font-bold">{wd.paymentMethod} • <span className="text-amber-400 select-all font-black">{wd.accountNumber}</span></span>
                              <span className="text-slate-400 text-[10px] block uppercase truncate max-w-[160px]" title={wd.accountName}>A/N: {wd.accountName}</span>
                            </div>
                          </div>

                          {isPending && (
                            <div className="flex lg:flex-col items-stretch gap-2 shrink-0 self-stretch sm:self-end lg:self-center">
                              <button
                                onClick={() => handleOpenWdReview(wd, 'completed')}
                                className="bg-emerald-500 hover:bg-emerald-400 active:translate-y-0.5 text-slate-950 font-black px-4 py-2.5 rounded-xl text-[10px] uppercase font-mono tracking-wider cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5 flex-1"
                              >
                                <span>✔ Cairkan</span>
                              </button>
                              <button
                                onClick={() => handleOpenWdReview(wd, 'rejected')}
                                className="bg-rose-500/10 hover:bg-rose-500/20 active:translate-y-0.5 text-rose-400 border border-rose-500/20 font-black px-4 py-2.5 rounded-xl text-[10px] uppercase font-mono tracking-wider cursor-pointer shadow-sm transition-all flex items-center justify-center gap-1.5 flex-1"
                              >
                                <span>❌ Tolak</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. DAFTAR USER */}
        {activeSubTab === 'users' && (
          <div className="space-y-5">
            {userSuccessMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs font-mono flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{userSuccessMessage}</span>
              </div>
            )}

            {userToDelete && (
              <div className="bg-rose-500/5 border border-rose-500/20 p-5 rounded-2xl font-mono text-xs space-y-4">
                <div className="flex items-start gap-3 text-rose-400">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black uppercase tracking-wider text-sm">KONFIRMASI HAPUS MITRA</h4>
                    <p className="text-slate-400 mt-1 leading-relaxed">
                      Apakah Anda yakin ingin menghapus mitra <strong className="text-slate-200">@{userToDelete.username}</strong> (ID: {userToDelete.id})? 
                      Semua data saldo saat ini (<strong className="text-emerald-400">{formatRupiah(userToDelete.balance)}</strong>) akan terhapus dan mitra tidak akan bisa login lagi ke aplikasi.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3.5">
                  <button
                    onClick={() => setUserToDelete(null)}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl text-[10px] uppercase cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={executeDeleteUser}
                    className="bg-rose-500 hover:bg-rose-400 text-slate-950 font-black px-4 py-2 rounded-xl text-[10px] uppercase cursor-pointer shadow-md"
                  >
                    Hapus Permanen
                  </button>
                </div>
              </div>
            )}

            <div className="bg-[#080d0f] border border-slate-900 rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-100 font-mono uppercase tracking-tight flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-500" />
                    <span>MITRA / USER TERDAFTAR</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">Daftar lengkap seluruh mitra yang memiliki akun di Juragan Gmail.</p>
                </div>

                {/* User Search Bar */}
                <div className="relative max-w-xs w-full">
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Cari Username/WA/ID..."
                    className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500/50 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                  />
                  {userSearchQuery && (
                    <button
                      onClick={() => setUserSearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-xs font-mono font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="bg-[#080d0f] border border-slate-900 rounded-2xl p-12 text-center text-slate-500 text-xs font-mono">
                Tidak ada data mitra yang cocok dengan kriteria pencarian Anda.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="bg-slate-950/60 border border-slate-900 p-5 rounded-2xl text-xs font-mono space-y-3.5 transition-colors hover:border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <strong className="text-slate-200 text-sm">@{u.username}</strong>
                          <span className="block text-[10px] text-slate-500 mt-0.5">ID: {u.id} • Join: {new Date(u.createdAt).toLocaleDateString('id-ID')}</span>
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-xl font-bold border border-emerald-500/20 whitespace-nowrap shrink-0">
                          {formatRupiah(u.balance)}
                        </span>
                      </div>

                      <div className="pt-3.5 border-t border-slate-900/60 space-y-1.5 text-slate-400">
                        <div className="flex justify-between"><span className="text-slate-600">Email:</span> <span className="text-slate-200 break-all select-all font-semibold">{u.email}</span></div>
                        <div className="flex justify-between"><span className="text-slate-600">WhatsApp:</span> <span className="text-slate-200 select-all font-black">+{u.whatsapp}</span></div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-slate-600 shrink-0">Default Bank:</span> 
                          <span className="text-amber-500 font-bold uppercase text-right leading-relaxed select-all">
                            {u.bankName} • {u.bankNumber} <br />
                            <span className="text-slate-400 text-[10px] lowercase italic font-normal">a/n {u.bankHolderName}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-900/30 flex justify-end">
                      <button
                        onClick={() => handleConfirmDeleteUser(u)}
                        className="text-rose-500 hover:text-rose-400 font-bold flex items-center gap-1.5 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/30 px-3.5 py-2 rounded-xl transition-all cursor-pointer text-[10px] uppercase font-mono"
                        title="Hapus Mitra dari Sistem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Mitra</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. ANNOUNCEMENTS SETTINGS */}
        {activeSubTab === 'announcements' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Create Announcement */}
            <div className="lg:col-span-5 bg-[#080d0f] border border-slate-900 rounded-2xl p-6 space-y-6 shadow-md">
              <div className="border-b border-slate-900 pb-3">
                <h3 className="text-base font-black text-slate-100 font-mono uppercase tracking-tight">TERBITKAN PENGUMUMAN</h3>
                <p className="text-slate-400 text-xs mt-0.5">Publikasikan broadcast penting yang akan langsung muncul di dasbor semua user.</p>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Judul Pengumuman *</label>
                  <input
                    type="text"
                    required
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="Contoh: Kenaikan Rate Aged 6+ Bulan!"
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none placeholder:text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Pilih Tipe Tampilan</label>
                  <select
                    value={annType}
                    onChange={(e) => setAnnType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none font-mono"
                  >
                    <option value="info">Info (Slate)</option>
                    <option value="success">Success (Hijau)</option>
                    <option value="warning">Warning (Kuning)</option>
                    <option value="danger">Danger (Merah)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Isi Pengumuman *</label>
                  <textarea
                    required
                    rows={4}
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    placeholder="Tulis detail pengumuman yang jelas..."
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none placeholder:text-slate-700"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer font-mono"
                >
                  Terbitkan Pengumuman
                </button>
              </form>
            </div>

            {/* Announcement List */}
            <div className="lg:col-span-7 bg-[#080d0f] border border-slate-900 rounded-2xl p-6 shadow-md space-y-6">
              <div className="border-b border-slate-900 pb-3">
                <h3 className="text-base font-black text-slate-100 font-mono uppercase tracking-tight">PENGUMUMAN AKTIF ({announcements.length})</h3>
                <p className="text-slate-400 text-xs mt-0.5">Daftar pengumuman yang sedang aktif ditayangkan di platform.</p>
              </div>

              {announcements.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-mono">
                  Belum ada pengumuman terdaftar.
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl text-xs font-mono flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-200 text-xs uppercase">{ann.title}</strong>
                          <span className={`text-[8px] font-black px-1.5 rounded uppercase ${
                            ann.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-900 text-slate-400'
                          }`}>{ann.type}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">{ann.content}</p>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm('Hapus pengumuman ini?')) {
                            onDeleteAnnouncement(ann.id);
                          }
                        }}
                        className="bg-rose-950/40 hover:bg-rose-950/80 text-rose-400 border border-rose-900/30 p-2 rounded-lg cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* 5. EDIT RATES & SYSTEM SETTINGS */}
        {activeSubTab === 'rates' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Rates Adjustment */}
            <div className="lg:col-span-7 bg-[#080d0f] border border-slate-900 rounded-2xl p-6 shadow-md space-y-6">
              <div className="border-b border-slate-900 pb-3">
                <h3 className="text-base font-black text-slate-100 font-mono uppercase tracking-tight">HARGA BELI GMAIL</h3>
                <p className="text-slate-400 text-xs mt-0.5">Atur harga beli per akun yang langsung mempengaruhi kalkulator & keuntungan mitra.</p>
              </div>

              <div className="space-y-4">
                {rates.map((r) => (
                  <div key={r.key} className="p-4 bg-slate-950 rounded-xl border border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-xs font-mono">
                    <div>
                      <strong className="text-slate-200">{r.label}</strong>
                      <span className="block text-[10px] text-slate-500 uppercase">{r.key}</span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">Rp</span>
                      <input
                        type="number"
                        value={r.price}
                        onChange={(e) => handleRateFieldChange(r.key, 'price', parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 pl-7 text-emerald-400 font-bold focus:outline-none"
                      />
                    </div>

                    <input
                      type="text"
                      value={r.description}
                      onChange={(e) => handleRateFieldChange(r.key, 'description', e.target.value)}
                      placeholder="Deskripsi singkat"
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-slate-300 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* General Admin PIN Config */}
            <div className="lg:col-span-5 bg-[#080d0f] border border-slate-900 rounded-2xl p-6 shadow-md">
              <div className="border-b border-slate-900 pb-3">
                <h3 className="text-base font-black text-slate-100 font-mono uppercase tracking-tight">SETTING KUNCI ADMIN</h3>
                <p className="text-slate-400 text-xs mt-0.5">Konfigurasi PIN akses dan nomor WhatsApp official rujukan platform.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 pt-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">PIN Akses Admin</label>
                  <input
                    type="text"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-amber-400 font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">WA Admin 1 (Kode Negara)</label>
                  <input
                    type="text"
                    value={whatsappAdmin}
                    onChange={(e) => setWhatsappAdmin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-slate-300 focus:outline-none font-bold"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">Format: 6283867031565 (Tanpa tanda +)</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">WA Admin 2 (Kode Negara)</label>
                  <input
                    type="text"
                    value={whatsappAdmin2}
                    onChange={(e) => setWhatsappAdmin2(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-slate-300 focus:outline-none font-bold"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">Format: 6285716766584 (Tanpa tanda +)</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Domain Email Pemulihan Rekomendasi</label>
                  <input
                    type="text"
                    value={recoveryDomain}
                    onChange={(e) => setRecoveryDomain(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-emerald-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                >
                  Simpan Konfigurasi
                </button>
              </form>
            </div>

          </div>
        )}

        {/* 6. SUPABASE SQL SETUP GUIDE */}
        {activeSubTab === 'supabase' && (
          <div className="space-y-6">
            <SupabaseGuide />
          </div>
        )}

      </div>
    </div>
  );
}
