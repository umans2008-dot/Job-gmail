import React, { useState, useMemo } from 'react';
import { User, Transaction, Withdrawal, Announcement, GmailRate } from '../types';
import { 
  Plus, Check, Copy, Trash2, ClipboardList, TrendingUp, AlertCircle, 
  HelpCircle, Sparkles, Send, Coins, ArrowUpRight, ArrowDownLeft, Clock, 
  CheckCircle, User as UserIcon, LogOut, Landmark, BookOpen, MessageSquare, Info, ShieldAlert, FileText 
} from 'lucide-react';

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
  rates: GmailRate[];
  transactions: Transaction[];
  withdrawals: Withdrawal[];
  announcements: Announcement[];
  recommendedRecoveryDomain: string;
  onNewSubmission: (
    rawGmails: string, 
    categoryKey: string, 
    whatsapp: string, 
    paymentMethod: string, 
    paymentAccountName: string, 
    paymentAccountNumber: string
  ) => void;
  onNewWithdrawal: (amount: number, method: string, accNumber: string, accName: string) => void;
}

export default function UserDashboard({
  user,
  onLogout,
  rates,
  transactions,
  withdrawals,
  announcements,
  recommendedRecoveryDomain,
  onNewSubmission,
  onNewWithdrawal,
}: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<'setor' | 'saldo' | 'transaksi' | 'profil' | 'announcements'>('setor');
  
  // Setor Form States
  const [inputGmails, setInputGmails] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('fresh');
  const [whatsapp, setWhatsapp] = useState(user.whatsapp);
  const [paymentMethod, setPaymentMethod] = useState(user.bankName);
  const [paymentAccountName, setPaymentAccountName] = useState(user.bankHolderName);
  const [paymentAccountNumber, setPaymentAccountNumber] = useState(user.bankNumber);
  const [submitting, setSubmitting] = useState(false);

  // Withdraw States
  const [wdAmount, setWdAmount] = useState<number | ''>('');
  const [wdMethod, setWdMethod] = useState(user.bankName);
  const [wdNumber, setWdNumber] = useState(user.bankNumber);
  const [wdName, setWdName] = useState(user.bankHolderName);
  const [wdError, setWdError] = useState('');
  const [wdSuccess, setWdSuccess] = useState('');

  // Parsed Gmail details preview state
  const parsedGmails = useMemo(() => {
    if (!inputGmails.trim()) return [];
    
    const lines = inputGmails.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return null;

      // Detect separator: |, comma, semicolon, colon
      let parts: string[] = [];
      if (trimmed.includes('|')) {
        parts = trimmed.split('|');
      } else if (trimmed.includes(';')) {
        parts = trimmed.split(';');
      } else if (trimmed.includes(',')) {
        parts = trimmed.split(',');
      } else if (trimmed.includes(':') && trimmed.split(':').length > 2) {
        parts = trimmed.split(':');
      } else {
        parts = trimmed.split(/\s+/); // fallback space
      }

      const email = parts[0]?.trim() || '';
      const pass = parts[1]?.trim() || '';
      const recovery = parts[2]?.trim() || '';

      // Simple validation checks
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.toLowerCase().endsWith('gmail.com');
      const hasPass = pass.length > 0;
      const isRecoveryValid = recovery.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recovery);
      
      const isValid = isEmailValid && hasPass && isRecoveryValid;
      let error = '';
      if (!email) error = 'Email kosong';
      else if (!isEmailValid) error = 'Format Gmail tidak valid';
      else if (!hasPass) error = 'Password kosong';
      else if (!recovery) error = 'Email pemulihan kosong';
      else if (!isRecoveryValid) error = 'Format pemulihan tidak valid';

      return {
        lineIndex: idx + 1,
        raw: trimmed,
        email,
        pass,
        recovery,
        isValid,
        error
      };
    }).filter(Boolean) as Array<{
      lineIndex: number;
      raw: string;
      email: string;
      pass: string;
      recovery: string;
      isValid: boolean;
      error: string;
    }>;
  }, [inputGmails]);

  const parsedStats = useMemo(() => {
    const total = parsedGmails.length;
    const validCount = parsedGmails.filter(p => p.isValid).length;
    const invalidCount = total - validCount;

    const emails = parsedGmails.map(p => p.email.toLowerCase());
    const uniqueEmails = new Set(emails);
    const duplicatesCount = total - uniqueEmails.size;

    return { total, validCount, invalidCount, duplicatesCount };
  }, [parsedGmails]);

  const currentRateObj = useMemo(() => {
    return rates.find(r => r.key === selectedCategory) || rates[0];
  }, [rates, selectedCategory]);

  const estimatedPayout = useMemo(() => {
    if (!currentRateObj) return 0;
    return parsedStats.validCount * currentRateObj.price;
  }, [parsedStats.validCount, currentRateObj]);

  const userTransactions = useMemo(() => {
    return transactions.filter(tx => tx.userId === user.id);
  }, [transactions, user.id]);

  const userWithdrawals = useMemo(() => {
    return withdrawals.filter(wd => wd.userId === user.id);
  }, [withdrawals, user.id]);

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  // Submission handler
  const handleSetorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedStats.validCount === 0) {
      alert('Mohon masukkan minimal 1 akun Gmail dengan format yang valid!');
      return;
    }

    if (!whatsapp.trim()) {
      alert('Mohon masukkan nomor WhatsApp Anda!');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      onNewSubmission(
        inputGmails,
        selectedCategory,
        whatsapp,
        paymentMethod,
        paymentAccountName,
        paymentAccountNumber
      );
      setInputGmails('');
      setSubmitting(false);
    }, 600);
  };

  // Withdrawal handler
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWdError('');
    setWdSuccess('');

    const amt = Number(wdAmount);
    if (!wdAmount || isNaN(amt) || amt <= 0) {
      setWdError('Mohon masukkan nominal penarikan yang valid!');
      return;
    }

    if (amt < 20000) {
      setWdError('Batas minimal penarikan saldo adalah Rp 20.000!');
      return;
    }

    if (amt > user.balance) {
      setWdError(`Saldo tidak mencukupi! Saldo Anda saat ini adalah ${formatRupiah(user.balance)}`);
      return;
    }

    if (!wdNumber.trim() || !wdName.trim()) {
      setWdError('Mohon lengkapi data rekening/e-wallet tujuan penarikan!');
      return;
    }

    onNewWithdrawal(amt, wdMethod, wdNumber.trim(), wdName.trim());
    setWdSuccess(`Permintaan penarikan Rp ${amt.toLocaleString('id-ID')} berhasil diajukan! Menunggu persetujuan admin.`);
    setWdAmount('');
  };

  // Copy Template helper
  const handleCopyTemplate = () => {
    const template = `alamatemail1@gmail.com|katasandi123|emailpemulihan1@${recommendedRecoveryDomain}\nalamatemail2@gmail.com|katasandi123|emailpemulihan2@${recommendedRecoveryDomain}`;
    navigator.clipboard.writeText(template);
    alert('Format template berhasil disalin ke clipboard!');
  };

  return (
    <div className="space-y-8" id="user-dashboard">
      
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#080d0f] border border-slate-900 rounded-2xl p-6 shadow-md">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-100 font-mono tracking-tight uppercase">JURAGAN • {user.username}</h2>
              <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold font-mono px-2 py-0.5 rounded-md border border-emerald-500/20">MITRA AKTIF</span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">ID Akun: {user.id} • WhatsApp: +{user.whatsapp}</p>
          </div>
        </div>

        {/* Balance Panel Widget */}
        <div className="flex items-center justify-between sm:justify-start gap-4 p-3 bg-slate-950/60 border border-slate-900/60 rounded-xl">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-500 font-bold font-mono uppercase tracking-wider block">Saldo Bisa Ditarik</span>
            <strong className="text-amber-400 text-lg font-black font-mono tracking-tight">{formatRupiah(user.balance)}</strong>
          </div>
          <button
            onClick={() => setActiveTab('saldo')}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] uppercase font-mono px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1 shadow-sm transition-all"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Withdraw</span>
          </button>
        </div>

        {/* Logout button */}
        <button
          onClick={onLogout}
          className="border border-rose-500/15 hover:border-rose-500/30 text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer self-start md:self-center"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar</span>
        </button>
      </div>

      {/* Broadcast alert if any announcements */}
      {announcements.length > 0 && (
        <div className="bg-emerald-950/10 border border-emerald-500/20 p-4 rounded-xl flex items-start space-x-3 text-xs shadow-inner">
          <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold uppercase text-[9px] tracking-wider text-emerald-400 block font-mono">PENGUMUMAN ADMIN TERBARU:</span>
            <p className="text-slate-300">{announcements[0].title} — <span className="text-slate-400">{announcements[0].content}</span></p>
          </div>
        </div>
      )}

      {/* Dashboard Sub-Tabs */}
      <div className="flex flex-wrap border-b border-slate-900/60 bg-slate-950/20 p-1 rounded-xl max-w-xl">
        <button
          onClick={() => setActiveTab('setor')}
          className={`px-4 py-2.5 text-xs font-bold font-mono rounded-lg transition-all ${
            activeTab === 'setor' ? 'bg-slate-900 text-amber-400 border border-slate-800' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Setor Gmail
        </button>
        <button
          onClick={() => setActiveTab('saldo')}
          className={`px-4 py-2.5 text-xs font-bold font-mono rounded-lg transition-all ${
            activeTab === 'saldo' ? 'bg-slate-900 text-amber-400 border border-slate-800' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tarik Saldo
        </button>
        <button
          onClick={() => setActiveTab('transaksi')}
          className={`px-4 py-2.5 text-xs font-bold font-mono rounded-lg transition-all ${
            activeTab === 'transaksi' ? 'bg-slate-900 text-amber-400 border border-slate-800' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Riwayat Setor & WD ({userTransactions.length + userWithdrawals.length})
        </button>
        <button
          onClick={() => setActiveTab('profil')}
          className={`px-4 py-2.5 text-xs font-bold font-mono rounded-lg transition-all ${
            activeTab === 'profil' ? 'bg-slate-900 text-amber-400 border border-slate-800' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Info Akun
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2.5 text-xs font-bold font-mono rounded-lg transition-all ${
            activeTab === 'announcements' ? 'bg-slate-900 text-amber-400 border border-slate-800' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Kabar Admin
        </button>
      </div>

      {/* Main Panel Content switching */}
      <div className="min-h-[400px]">

        {/* Tab 1: SETOR GMAIL */}
        {activeTab === 'setor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form Column */}
            <div className="lg:col-span-7 bg-[#080d0f] border border-slate-900 rounded-2xl p-6 space-y-6 shadow-md">
              <div className="border-b border-slate-900 pb-3">
                <h3 className="text-base font-black text-slate-100 font-mono uppercase tracking-tight">SETOR STOK GMAIL MASSAL</h3>
                <p className="text-slate-400 text-xs mt-0.5">Masukkan data Gmail Anda sesuai dengan format penginputan yang didukung.</p>
              </div>

              <form onSubmit={handleSetorSubmit} className="space-y-4">
                
                {/* Category Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Pilih Kategori Gmail</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rates.map((r) => (
                      <div
                        key={r.key}
                        onClick={() => setSelectedCategory(r.key)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedCategory === r.key
                            ? 'border-emerald-500/40 bg-emerald-950/10'
                            : 'border-slate-900 hover:border-slate-800 bg-[#05080a]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-200">{r.label}</span>
                          {selectedCategory === r.key && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <span className="block text-[11px] font-mono text-emerald-400 font-bold mt-1">Rp {r.price.toLocaleString('id-ID')} / Akun</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Text Area */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold font-mono">
                    <label className="text-slate-500 uppercase tracking-wider">Daftar Akun Gmail (Format: Email|Sandi|Pemulihan)</label>
                    <button
                      type="button"
                      onClick={handleCopyTemplate}
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Template</span>
                    </button>
                  </div>
                  <textarea
                    required
                    rows={7}
                    value={inputGmails}
                    onChange={(e) => setInputGmails(e.target.value)}
                    placeholder={`contoh99@gmail.com|sandirahasianya|recovery99@${recommendedRecoveryDomain}\ncontoh100@gmail.com|sandirahasianya|recovery100@${recommendedRecoveryDomain}`}
                    className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500/40 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none placeholder:text-slate-700 leading-relaxed"
                  />
                  <span className="block text-[10px] text-slate-500 leading-relaxed font-mono">
                    💡 Gunakan pemisah garis tegak <strong className="text-slate-300">|</strong>, koma <strong className="text-slate-300">,</strong>, titik koma <strong className="text-slate-300">;</strong> atau spasi. Masukkan satu akun per baris.
                  </span>
                </div>

                {/* Submitter Credentials detail */}
                <div className="p-3 bg-[#05080a] border border-slate-900 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-500 font-mono mb-1">WHATSAPP RUJUKAN</label>
                    <input
                      type="text"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-500 font-mono mb-1">PAYOUT DESTINATION</label>
                    <div className="text-xs text-slate-300 font-mono mt-2 flex items-center gap-1 bg-slate-950/60 px-2 py-1 rounded border border-slate-900">
                      <Landmark className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate uppercase font-bold">{paymentMethod} • {paymentAccountNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting || parsedStats.validCount === 0}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer font-mono flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span>Setorkan {parsedStats.validCount} Gmail Valid</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>
            </div>

            {/* Parsing Side Stats Column */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Parse Summary Widget */}
              <div className="bg-[#080d0f] border border-slate-900 rounded-2xl p-5 space-y-4 shadow-md">
                <span className="text-[10px] font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">REAL-TIME INSPECTOR</span>
                
                <h4 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-tight">ANALISIS VALIDASI AKUN</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 font-mono block">TOTAL BARIS</span>
                    <strong className="text-xl font-mono text-slate-200">{parsedStats.total}</strong>
                  </div>
                  <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-xl text-center">
                    <span className="text-[10px] text-emerald-500 font-mono block">FORMAT VALID</span>
                    <strong className="text-xl font-mono text-emerald-400">{parsedStats.validCount}</strong>
                  </div>
                  <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-xl text-center">
                    <span className="text-[10px] text-rose-500 font-mono block">FORMAT ERROR</span>
                    <strong className="text-xl font-mono text-rose-400">{parsedStats.invalidCount}</strong>
                  </div>
                  <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-xl text-center">
                    <span className="text-[10px] text-amber-500 font-mono block">DUPLIKAT</span>
                    <strong className="text-xl font-mono text-amber-400">{parsedStats.duplicatesCount}</strong>
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-3 flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Estimasi Pendapatan:</span>
                  <strong className="text-emerald-400 text-sm font-black">{formatRupiah(estimatedPayout)}</strong>
                </div>
              </div>

              {/* Requirement Checklist */}
              <div className="bg-[#080d0f] border border-slate-900 rounded-2xl p-5 space-y-3.5 shadow-md text-xs">
                <h4 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-tight flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>KETENTUAN KATEGORI INI</span>
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Harap pastikan semua akun diset sesuai panduan berikut sebelum menekan tombol setor:
                </p>
                <div className="space-y-2">
                  {currentRateObj.requirements.map((req, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-slate-300 text-[11px]">
                      <span className="text-emerald-400 font-bold shrink-0 mt-0.5 font-mono">✔</span>
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: SALDO & WITHDRAWAL */}
        {activeTab === 'saldo' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Submit Withdrawal Form */}
            <div className="lg:col-span-5 bg-[#080d0f] border border-slate-900 rounded-2xl p-6 space-y-6 shadow-md">
              <div className="border-b border-slate-900 pb-3">
                <h3 className="text-base font-black text-slate-100 font-mono uppercase tracking-tight">AJUKAN PENARIKAN SALDO</h3>
                <p className="text-slate-400 text-xs mt-0.5">Tarik saldo hasil setoran Gmail valid Anda ke rekening bank atau e-wallet pilihan Anda.</p>
              </div>

              {wdError && (
                <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 p-3.5 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  <span>{wdError}</span>
                </div>
              )}

              {wdSuccess && (
                <div className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 p-3.5 rounded-xl text-xs flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{wdSuccess}</span>
                </div>
              )}

              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                
                {/* Balance Summary widget inside Form */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">SALDO ANDA</span>
                    <strong className="text-emerald-400 font-mono font-black text-base">{formatRupiah(user.balance)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">MINIMAL PENARIKAN</span>
                    <strong className="text-slate-400 font-mono font-bold text-xs">Rp 20.000</strong>
                  </div>
                </div>

                {/* Amount input */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Jumlah Penarikan (IDR) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 font-bold">Rp</span>
                    <input
                      type="number"
                      required
                      value={wdAmount}
                      onChange={(e) => setWdAmount(parseInt(e.target.value) || '')}
                      placeholder="Minimal 20000"
                      className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500/40 rounded-xl py-3 pl-9 pr-4 text-xs font-mono font-bold text-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Wallet select */}
                <div className="space-y-3 p-3 bg-slate-950/40 rounded-xl border border-slate-900">
                  <span className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider font-mono block">Detail Rekening Tujuan *</span>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <select
                        value={wdMethod}
                        onChange={(e) => setWdMethod(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-xs text-slate-200 focus:outline-none font-mono"
                      >
                        <option value="DANA">DANA</option>
                        <option value="GOPAY">GOPAY</option>
                        <option value="OVO">OVO</option>
                        <option value="BCA">BCA</option>
                        <option value="Mandiri">Mandiri</option>
                        <option value="BRI">BRI</option>
                        <option value="BNI">BNI</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <input
                        type="text"
                        required
                        value={wdNumber}
                        onChange={(e) => setWdNumber(e.target.value)}
                        placeholder="No Rekening / HP Wallet"
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      value={wdName}
                      onChange={(e) => setWdName(e.target.value)}
                      placeholder="Nama Lengkap Pemilik Rekening"
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-xs text-slate-300 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer font-mono flex items-center justify-center gap-2"
                >
                  <span>Ajukan Pencairan Saldo</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </button>

              </form>
            </div>

            {/* Withdrawal List History */}
            <div className="lg:col-span-7 bg-[#080d0f] border border-slate-900 rounded-2xl p-6 space-y-6 shadow-md">
              <div className="border-b border-slate-900 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-black text-slate-100 font-mono uppercase tracking-tight">STATUS PENARIKAN SALDO Anda</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Riwayat penarikan saldo dari akun Anda ke bank / e-wallet.</p>
                </div>
              </div>

              {userWithdrawals.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-900/60 text-slate-500 font-mono text-xs">
                  Belum ada pengajuan penarikan saldo.
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {userWithdrawals.slice().reverse().map((wd) => (
                    <div key={wd.id} className="bg-[#05080a] border border-slate-900 rounded-xl p-4 space-y-2.5 text-xs font-mono">
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <strong className="text-amber-400 text-sm">{wd.id}</strong>
                          <span className="block text-[10px] text-slate-500">{new Date(wd.createdAt).toLocaleString('id-ID')}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          wd.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : wd.status === 'rejected'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {wd.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-950/60 text-slate-400">
                        <div>
                          <span className="text-[10px] text-slate-500 block">NOMINAL</span>
                          <strong className="text-slate-200">{formatRupiah(wd.amount)}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">TUJUAN PAYOUT</span>
                          <span className="text-slate-200 uppercase font-bold">{wd.paymentMethod} • {wd.accountNumber}</span>
                        </div>
                      </div>

                      {wd.adminNotes && (
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900 text-[11px] text-slate-400 mt-1">
                          <span className="font-extrabold text-[10px] text-amber-400 block mb-0.5">CATATAN OWNER:</span>
                          {wd.adminNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 3: TRANSAKSI */}
        {activeTab === 'transaksi' && (
          <div className="bg-[#080d0f] border border-slate-900 rounded-2xl p-6 space-y-6 shadow-md">
            <div className="border-b border-slate-900 pb-3">
              <h3 className="text-base font-black text-slate-100 font-mono uppercase tracking-tight">RIWAYAT AKTIVITAS ANDA</h3>
              <p className="text-slate-400 text-xs mt-0.5">Menampilkan seluruh data penyetoran Gmail dan penarikan dana untuk akun Anda.</p>
            </div>

            {userTransactions.length === 0 && userWithdrawals.length === 0 ? (
              <div className="p-12 text-center bg-slate-950/40 rounded-2xl border border-slate-900/60 text-slate-500 font-mono text-xs">
                Belum ada aktivitas terekam untuk akun Anda. Silakan lakukan Setor Gmail atau Tarik Saldo.
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Deposit Submissions list */}
                {userTransactions.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-black font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full inline-block mb-1">
                      📥 RIWAYAT SETORAN GMAIL ({userTransactions.length})
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userTransactions.slice().reverse().map((tx) => (
                        <div key={tx.id} className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl text-xs font-mono space-y-2 relative overflow-hidden group">
                          <div className="flex justify-between items-start">
                            <div>
                              <strong className="text-amber-400 text-sm group-hover:text-amber-300 transition-colors">{tx.id}</strong>
                              <span className="block text-[10px] text-slate-500 mt-0.5">{new Date(tx.timestamp).toLocaleString('id-ID')}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                              tx.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : tx.status === 'rejected'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : tx.status === 'checking'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-slate-500/10 text-slate-400 border border-slate-800'
                            }`}>
                              {tx.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 py-1.5 border-y border-slate-900 text-slate-400">
                            <div>
                              <span className="text-[9px] text-slate-500 block uppercase">Disetor</span>
                              <strong className="text-slate-200">{tx.quantitySubmitted} Akun</strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 block uppercase">Valid</span>
                              <strong className="text-emerald-400">{tx.quantityValid} Akun</strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 block uppercase">Pembayaran</span>
                              <strong className="text-slate-200">{formatRupiah(tx.totalPayout)}</strong>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-400">
                            <span className="text-slate-500 font-bold block uppercase text-[9px] tracking-wide">Kategori:</span>
                            {tx.categoryLabel}
                          </div>

                          {tx.adminNotes && (
                            <div className="bg-slate-950 p-2 rounded-lg border border-slate-900 text-[10px] text-slate-400">
                              <span className="font-extrabold text-[8px] text-amber-500 block uppercase">Catatan Pemeriksa:</span>
                              {tx.adminNotes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Withdraw List under Transactions Tab */}
                {userWithdrawals.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-900/60">
                    <span className="text-[10px] font-black font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full inline-block mb-1">
                      📤 RIWAYAT PENARIKAN SALDO ({userWithdrawals.length})
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userWithdrawals.slice().reverse().map((wd) => (
                        <div key={wd.id} className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl text-xs font-mono space-y-2 relative overflow-hidden">
                          <div className="flex justify-between items-start">
                            <div>
                              <strong className="text-amber-400 text-sm">{wd.id}</strong>
                              <span className="block text-[10px] text-slate-500 mt-0.5">{new Date(wd.createdAt).toLocaleString('id-ID')}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                              wd.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : wd.status === 'rejected'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {wd.status}
                            </span>
                          </div>

                          <div className="flex justify-between text-slate-400 py-1 border-t border-slate-900">
                            <span>Jumlah Tarik:</span>
                            <strong className="text-slate-200">{formatRupiah(wd.amount)}</strong>
                          </div>

                          <div className="text-[10px] text-slate-400">
                            <span className="text-slate-500 font-bold block uppercase text-[8px] tracking-wide">Tujuan transfer:</span>
                            {wd.paymentMethod} • {wd.accountNumber} ({wd.accountName})
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* Tab 4: PROFIL / INFO AKUN */}
        {activeTab === 'profil' && (
          <div className="bg-[#080d0f] border border-slate-900 rounded-2xl p-6 space-y-6 shadow-md max-w-2xl">
            <div className="border-b border-slate-900 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-100 font-mono uppercase tracking-tight">INFORMASI AKUN MITRA JURAGAN</h3>
                <p className="text-slate-400 text-xs mt-0.5">Detail informasi pendaftaran, kontak WhatsApp, dan default rekening payout Anda.</p>
              </div>
            </div>

            <div className="space-y-4">
              
              {/* Account Card Profile */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                
                <div className="space-y-3">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-black">USER ID</span>
                    <strong className="text-slate-300 font-black">{user.id}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-black">USERNAME</span>
                    <strong className="text-slate-300 font-black">@{user.username}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-black">EMAIL TERHUBUNG</span>
                    <strong className="text-slate-300">{user.email}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-black">KONTAK WHATSAPP</span>
                    <strong className="text-emerald-400 font-bold">+{user.whatsapp}</strong>
                  </div>
                </div>

                <div className="space-y-3 sm:border-l sm:border-slate-900 sm:pl-5">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-black">DEFAULT BANK PAYOUT</span>
                    <strong className="text-slate-300 uppercase font-black">{user.bankName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-black">NOMOR REKENING</span>
                    <strong className="text-slate-300 font-bold font-mono">{user.bankNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-black">NAMA PEMILIK REKENING</span>
                    <strong className="text-slate-300 font-bold uppercase">{user.bankHolderName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-black">TANGGAL BERGABUNG</span>
                    <strong className="text-slate-400">{new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                  </div>
                </div>

              </div>

              {/* Statistics Widget inside Profile */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-[#05080a] border border-slate-900 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-mono block">SALDO AKTIF</span>
                  <strong className="text-emerald-400 text-lg font-mono font-black">{formatRupiah(user.balance)}</strong>
                </div>

                <div className="bg-[#05080a] border border-slate-900 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-mono block">TOTAL SETORAN GMAIL</span>
                  <strong className="text-slate-300 text-lg font-mono font-black">
                    {userTransactions.reduce((acc, curr) => acc + curr.quantitySubmitted, 0)} Akun
                  </strong>
                </div>

                <div className="bg-[#05080a] border border-slate-900 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-mono block">SUKSES DICAIRKAN</span>
                  <strong className="text-amber-400 text-lg font-mono font-black">
                    {formatRupiah(
                      userWithdrawals
                        .filter(wd => wd.status === 'completed')
                        .reduce((acc, curr) => acc + curr.amount, 0)
                    )}
                  </strong>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 5: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="space-y-6 max-w-3xl">
            <div className="bg-[#080d0f] border border-slate-900 rounded-2xl p-6 shadow-md">
              <h3 className="text-base font-black text-slate-100 font-mono uppercase tracking-tight">KABAR & INFORMASI DARI ADMIN</h3>
              <p className="text-slate-400 text-xs mt-0.5">Informasi pengumuman penting, kenaikan rate beli Gmail, libur pembayaran, atau pemeliharaan platform.</p>
            </div>

            {announcements.length === 0 ? (
              <div className="p-12 text-center bg-[#080d0f] rounded-2xl border border-slate-900 text-slate-500 font-mono text-xs">
                Belum ada pengumuman yang diterbitkan oleh admin.
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.slice().reverse().map((ann) => (
                  <div
                    key={ann.id}
                    className={`p-6 rounded-2xl border bg-[#080d0f] shadow-md space-y-3 transition-all ${
                      ann.type === 'success'
                        ? 'border-emerald-500/20 shadow-emerald-900/5'
                        : ann.type === 'warning'
                        ? 'border-amber-500/20 shadow-amber-900/5'
                        : ann.type === 'danger'
                        ? 'border-rose-500/20 shadow-rose-900/5'
                        : 'border-slate-900 shadow-slate-900/5'
                    }`}
                  >
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        ann.type === 'success'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : ann.type === 'warning'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : ann.type === 'danger'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-slate-950 text-slate-400 border-slate-900'
                      }`}>
                        ID: {ann.id} • {ann.type.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{new Date(ann.createdAt).toLocaleDateString('id-ID', { hour: 'numeric', minute: 'numeric' })}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-200 uppercase tracking-tight">{ann.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
