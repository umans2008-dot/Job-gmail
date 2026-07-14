import React, { useState, useMemo } from 'react';
import { GmailRate, AppSettings, Transaction, User, Withdrawal, Announcement } from '../types';
import { 
  Users, DollarSign, ClipboardList, TrendingUp, ShieldCheck, 
  Settings, AlertCircle, MessageSquare, Trash2, CheckCircle, 
  XCircle, ArrowRight, RefreshCw, Plus, Calendar, Edit, Database, Landmark, ShieldAlert 
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

  // General App Settings states
  const [adminPin, setAdminPin] = useState(settings.adminPin);
  const [whatsappAdmin, setWhatsappAdmin] = useState(settings.whatsappAdmin);
  const [recoveryDomain, setRecoveryDomain] = useState(settings.recommendedRecoveryDomain);

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  // 1. ANNOUNCEMENT ACTIONS
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      alert('Mohon isi judul dan konten pengumuman!');
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
    alert('Pengumuman berhasil diterbitkan!');
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
    alert(`Status setoran ${tx.id} berhasil diupdate ke: ${finalStatus.toUpperCase()}!`);
  };

  // 3. WITHDRAWAL ACTIONS
  const handleProcessWithdrawal = (wd: Withdrawal, finalStatus: 'completed' | 'rejected') => {
    const notes = prompt(`Masukkan catatan admin untuk penarikan ${wd.id}:`, finalStatus === 'completed' ? 'Pencairan sukses ditransfer.' : 'Ditolak: Detail bank tidak valid / error.');
    if (notes === null) return; // cancelled prompt

    const clonedWd = { ...wd };
    clonedWd.status = finalStatus;
    clonedWd.adminNotes = notes.trim() || (finalStatus === 'completed' ? 'Pencairan sukses ditransfer.' : 'Ditolak.');
    clonedWd.updatedAt = new Date().toISOString();

    onUpdateWithdrawal(clonedWd);
    alert(`Status penarikan ${wd.id} telah diupdate ke: ${finalStatus.toUpperCase()}`);
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
      recommendedRecoveryDomain: recoveryDomain.trim().replace('@', '')
    };
    onSaveSettings(newSettings);
    alert('Konfigurasi sistem berhasil disimpan!');
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
    <div className="space-y-8" id="admin-dashboard">
      
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
                </div>

                {/* Gmail list to check */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                    <span className="font-bold">Daftar Akun yang Disetor ({selectedTxForReview.gmails.length} Akun):</span>
                    <span>Klik tombol <strong className="text-emerald-400">VALID</strong> atau <strong className="text-rose-400 font-bold">INVALID</strong> untuk memperbarui balance</span>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedTxForReview.gmails.map((g, idx) => (
                      <div key={idx} className="bg-slate-950/40 border border-slate-900/60 p-3 rounded-lg flex items-center justify-between gap-4 text-xs font-mono">
                        <div className="space-y-0.5 truncate">
                          <span className="text-[10px] text-slate-500 mr-2 font-bold">{idx + 1}.</span>
                          <strong className="text-slate-200 select-all">{g.email}</strong>
                          <span className="text-slate-500 mx-1.5">|</span>
                          <span className="text-slate-400 font-medium select-all">{g.pass}</span>
                          <span className="text-slate-500 mx-1.5">|</span>
                          <span className="text-slate-500 select-all">{g.recovery}</span>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => handleToggleAccountCheck(selectedTxForReview, idx, true)}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase transition-all cursor-pointer ${
                              g.status === 'valid'
                                ? 'bg-emerald-500 text-slate-950 font-extrabold'
                                : 'bg-slate-900 text-emerald-400 border border-emerald-950 hover:bg-emerald-500/10'
                            }`}
                          >
                            Valid
                          </button>
                          <button
                            onClick={() => handleToggleAccountCheck(selectedTxForReview, idx, false)}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase transition-all cursor-pointer ${
                              g.status === 'invalid'
                                ? 'bg-rose-500 text-slate-950 font-extrabold'
                                : 'bg-slate-900 text-rose-400 border border-rose-950 hover:bg-rose-500/10'
                            }`}
                          >
                            Invalid
                          </button>
                        </div>
                      </div>
                    ))}
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
              <div className="space-y-4 bg-[#080d0f] border border-slate-900 rounded-2xl p-6 shadow-md">
                <div className="border-b border-slate-900 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-black text-slate-100 font-mono uppercase tracking-tight">ANTRIAN PEMERIKSAAN SETORAN GMAIL</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Daftar setoran Gmail dari mitra yang menunggu verifikasi keabsahan data.</p>
                  </div>
                </div>

                {transactions.length === 0 ? (
                  <div className="p-10 text-center text-slate-500 text-xs font-mono">
                    Belum ada riwayat setoran terekam di sistem.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice().reverse().map((tx) => (
                      <div key={tx.id} className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs font-mono">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-amber-400 text-sm">{tx.id}</strong>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              tx.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                                : tx.status === 'checking'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : tx.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {tx.status}
                            </span>
                          </div>
                          <span className="block text-slate-500 text-[10px]">{new Date(tx.timestamp).toLocaleString('id-ID')}</span>
                          <span className="block text-slate-300">Setor oleh: <strong className="text-slate-200">+{tx.whatsapp}</strong></span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-l border-slate-900 pl-4">
                          <div>
                            <span className="text-slate-500 text-[9px] block">SUBMITTED</span>
                            <span className="text-slate-300 font-bold">{tx.quantitySubmitted} Akun</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[9px] block">VALID</span>
                            <span className="text-emerald-400 font-bold">{tx.quantityValid} Akun</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[9px] block">TOTAL PAYOUT</span>
                            <span className="text-slate-200 font-bold">{formatRupiah(tx.totalPayout)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          <button
                            onClick={() => {
                              setSelectedTxForReview(tx);
                              setAdminReviewNotes(tx.adminNotes);
                            }}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-lg text-[10px] uppercase font-mono cursor-pointer"
                          >
                            Periksa Akun →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* 2. KONFIRMASI WITHDRAWALS */}
        {activeSubTab === 'withdrawals' && (
          <div className="bg-[#080d0f] border border-slate-900 rounded-2xl p-6 shadow-md space-y-6">
            <div className="border-b border-slate-900 pb-3">
              <h3 className="text-base font-black text-slate-100 font-mono uppercase tracking-tight">KONFIRMASI PENARIKAN SALDO MITRA</h3>
              <p className="text-slate-400 text-xs mt-0.5">Proses permohonan penarikan saldo dan transfer dana ke rekening e-wallet/bank mitra Anda.</p>
            </div>

            {withdrawals.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-xs font-mono">
                Belum ada pengajuan pencairan dana.
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawals.slice().reverse().map((wd) => (
                  <div key={wd.id} className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs font-mono">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-amber-400 text-sm">{wd.id}</strong>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          wd.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : wd.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {wd.status}
                        </span>
                      </div>
                      <span className="block text-slate-500 text-[10px]">{new Date(wd.createdAt).toLocaleString('id-ID')}</span>
                      <span className="block text-slate-300">User: <strong className="text-slate-200">@{wd.userUsername} (ID: {wd.userId})</strong></span>
                    </div>

                    <div className="border-l border-slate-900 pl-4 space-y-1">
                      <div className="text-slate-400">
                        Nominal Tarik: <strong className="text-emerald-400 text-sm">{formatRupiah(wd.amount)}</strong>
                      </div>
                      <div className="text-slate-400">
                        Tujuan transfer: <strong className="text-slate-200 uppercase">{wd.paymentMethod} • {wd.accountNumber}</strong>
                      </div>
                      <div className="text-slate-500">
                        A/N Rekening: <span className="text-slate-300 font-bold uppercase">{wd.accountName}</span>
                      </div>
                    </div>

                    {wd.status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => handleProcessWithdrawal(wd, 'completed')}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3.5 py-2 rounded-lg text-[10px] uppercase cursor-pointer"
                        >
                          Approve (Cair)
                        </button>
                        <button
                          onClick={() => handleProcessWithdrawal(wd, 'rejected')}
                          className="bg-rose-500 hover:bg-rose-400 text-slate-950 font-black px-3.5 py-2 rounded-lg text-[10px] uppercase cursor-pointer"
                        >
                          Reject (Tolak)
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. DAFTAR USER */}
        {activeSubTab === 'users' && (
          <div className="bg-[#080d0f] border border-slate-900 rounded-2xl p-6 shadow-md space-y-6">
            <div className="border-b border-slate-900 pb-3">
              <h3 className="text-base font-black text-slate-100 font-mono uppercase tracking-tight">MITRA / USER TERDAFTAR</h3>
              <p className="text-slate-400 text-xs mt-0.5">Daftar lengkap seluruh mitra yang memiliki akun di Juragan Gmail.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map((u) => (
                <div key={u.id} className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl text-xs font-mono space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-slate-200 text-sm">@{u.username}</strong>
                      <span className="block text-[10px] text-slate-500 mt-0.5">ID: {u.id} • Join: {new Date(u.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded font-bold">
                      Saldo: {formatRupiah(u.balance)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-900 space-y-1 text-slate-400">
                    <div>Email: <span className="text-slate-200">{u.email}</span></div>
                    <div>WhatsApp: <span className="text-slate-200 font-bold">+{u.whatsapp}</span></div>
                    <div>Default Bank: <span className="text-amber-500 font-bold uppercase">{u.bankName} • {u.bankNumber} ({u.bankHolderName})</span></div>
                  </div>
                </div>
              ))}
            </div>
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
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">WA Admin Official (Kode Negara)</label>
                  <input
                    type="text"
                    value={whatsappAdmin}
                    onChange={(e) => setWhatsappAdmin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-slate-300 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">Format: 628123456789 (tanpa tanda +)</span>
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
