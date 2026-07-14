import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, DollarSign, ClipboardList, CheckCircle, TrendingUp, Coins, Lock, 
  Settings, AlertCircle, BookOpen, Users, Check, Copy, Plus, Trash2, 
  Search, MessageSquare, Menu, X, ChevronDown, RefreshCw, FileText, 
  HelpCircle, Send, Eye, EyeOff, Database, Filter, Clock, ArrowRight, 
  Sparkles, Calculator, ShieldAlert, Info, ExternalLink, ChevronRight, UserCheck 
} from 'lucide-react';

import { Transaction, GmailRate, AppSettings, GmailAccount, User, Withdrawal, Announcement } from './types';
import { DEFAULT_RATES, DEFAULT_SETTINGS, MOCK_USERS, MOCK_TRANSACTIONS, MOCK_WITHDRAWALS, MOCK_ANNOUNCEMENTS } from './data';

// Import modular components
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'panduan' | 'kalkulator' | 'auth' | 'dashboard' | 'admin'>('home');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core App States (Synchronized with localStorage)
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [rates, setRates] = useState<GmailRate[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  // Auth State
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  // Admin Access PIN modal state
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Submission Status / Success modal
  const [successSubmission, setSuccessSubmission] = useState<Transaction | null>(null);

  // Load and Persist State from localStorage
  useEffect(() => {
    // 1. Rates
    const storedRates = localStorage.getItem('jg_rates');
    if (storedRates) {
      try { 
        const parsed = JSON.parse(storedRates);
        const hasOldKeys = Array.isArray(parsed) && parsed.some(r => r.key === 'fresh' || r.key === 'aged_1m' || r.key === 'aged_6m');
        if (hasOldKeys) {
          setRates(DEFAULT_RATES);
          localStorage.setItem('jg_rates', JSON.stringify(DEFAULT_RATES));
        } else {
          setRates(parsed);
        }
      } catch (e) { 
        setRates(DEFAULT_RATES); 
      }
    } else {
      setRates(DEFAULT_RATES);
      localStorage.setItem('jg_rates', JSON.stringify(DEFAULT_RATES));
    }

    // 2. Settings
    const storedSettings = localStorage.getItem('jg_settings');
    if (storedSettings) {
      try { setSettings(JSON.parse(storedSettings)); } catch (e) { setSettings(DEFAULT_SETTINGS); }
    } else {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem('jg_settings', JSON.stringify(DEFAULT_SETTINGS));
    }

    // 3. Users
    const storedUsers = localStorage.getItem('jg_users');
    if (storedUsers) {
      try { setUsers(JSON.parse(storedUsers)); } catch (e) { setUsers(MOCK_USERS); }
    } else {
      setUsers(MOCK_USERS);
      localStorage.setItem('jg_users', JSON.stringify(MOCK_USERS));
    }

    // 4. Transactions (Deposits)
    const storedTx = localStorage.getItem('jg_transactions');
    if (storedTx) {
      try { 
        const parsed = JSON.parse(storedTx);
        const hasOldKeys = Array.isArray(parsed) && parsed.some(tx => tx.categoryKey === 'fresh' || tx.categoryKey === 'aged_1m' || tx.categoryKey === 'aged_6m');
        if (hasOldKeys) {
          setTransactions(MOCK_TRANSACTIONS);
          localStorage.setItem('jg_transactions', JSON.stringify(MOCK_TRANSACTIONS));
        } else {
          setTransactions(parsed);
        }
      } catch (e) { 
        setTransactions(MOCK_TRANSACTIONS); 
      }
    } else {
      setTransactions(MOCK_TRANSACTIONS);
      localStorage.setItem('jg_transactions', JSON.stringify(MOCK_TRANSACTIONS));
    }

    // 5. Withdrawals
    const storedWd = localStorage.getItem('jg_withdrawals');
    if (storedWd) {
      try { setWithdrawals(JSON.parse(storedWd)); } catch (e) { setWithdrawals(MOCK_WITHDRAWALS); }
    } else {
      setWithdrawals(MOCK_WITHDRAWALS);
      localStorage.setItem('jg_withdrawals', JSON.stringify(MOCK_WITHDRAWALS));
    }

    // 6. Announcements
    const storedAnn = localStorage.getItem('jg_announcements');
    if (storedAnn) {
      try { setAnnouncements(JSON.parse(storedAnn)); } catch (e) { setAnnouncements(MOCK_ANNOUNCEMENTS); }
    } else {
      setAnnouncements(MOCK_ANNOUNCEMENTS);
      localStorage.setItem('jg_announcements', JSON.stringify(MOCK_ANNOUNCEMENTS));
    }

    // 7. Active Session
    const storedUserSession = localStorage.getItem('jg_session_user');
    if (storedUserSession) {
      try { setLoggedInUser(JSON.parse(storedUserSession)); } catch (e) { setLoggedInUser(null); }
    }
  }, []);

  // Sync Logged-in User balance automatically when users state changes
  useEffect(() => {
    if (loggedInUser) {
      const refreshedUser = users.find(u => u.id === loggedInUser.id);
      if (refreshedUser && JSON.stringify(refreshedUser) !== JSON.stringify(loggedInUser)) {
        setLoggedInUser(refreshedUser);
        localStorage.setItem('jg_session_user', JSON.stringify(refreshedUser));
      }
    }
  }, [users, loggedInUser]);

  // DB Sync helper utilities
  const syncUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('jg_users', JSON.stringify(newUsers));
  };

  const syncTransactions = (newTx: Transaction[]) => {
    setTransactions(newTx);
    localStorage.setItem('jg_transactions', JSON.stringify(newTx));
  };

  const syncWithdrawals = (newWd: Withdrawal[]) => {
    setWithdrawals(newWd);
    localStorage.setItem('jg_withdrawals', JSON.stringify(newWd));
  };

  const syncAnnouncements = (newAnn: Announcement[]) => {
    setAnnouncements(newAnn);
    localStorage.setItem('jg_announcements', JSON.stringify(newAnn));
  };

  const syncRates = (newRates: GmailRate[]) => {
    setRates(newRates);
    localStorage.setItem('jg_rates', JSON.stringify(newRates));
  };

  const syncSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('jg_settings', JSON.stringify(newSettings));
  };

  // AUTH ACTIONS
  const handleAuthSuccess = (authenticatedUser: User) => {
    setLoggedInUser(authenticatedUser);
    localStorage.setItem('jg_session_user', JSON.stringify(authenticatedUser));
    setActiveTab('dashboard');
  };

  const handleRegisterUser = (newUser: User) => {
    const updatedUsers = [...users, newUser];
    syncUsers(updatedUsers);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('jg_session_user');
    setActiveTab('home');
  };

  // USER DASHBOARD ACTIONS
  const handleNewSubmission = (
    rawGmails: string, 
    categoryKey: string, 
    whatsapp: string, 
    paymentMethod: string, 
    paymentAccountName: string, 
    paymentAccountNumber: string
  ) => {
    if (!loggedInUser) return;

    // Build unique tracking id JRG-YYMMDD-XXX
    const now = new Date();
    const yymmdd = now.toISOString().slice(2, 10).replace(/-/g, '');
    const rand = Math.floor(100 + Math.random() * 900);
    const trackingId = `JRG-${yymmdd}-${rand}`;

    // Get current rate details
    const rateObj = rates.find(r => r.key === categoryKey) || rates[0];

    // Parse accounts
    const lines = rawGmails.split('\n');
    const parsedAccounts: GmailAccount[] = lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      
      let parts: string[] = [];
      if (trimmed.includes('|')) parts = trimmed.split('|');
      else if (trimmed.includes(';')) parts = trimmed.split(';');
      else if (trimmed.includes(',')) parts = trimmed.split(',');
      else parts = trimmed.split(/\s+/);

      const email = parts[0]?.trim() || '';
      const pass = parts[1]?.trim() || '';
      const recovery = parts[2]?.trim() || '';

      return { email, pass, recovery, status: 'pending' as const };
    }).filter(Boolean) as GmailAccount[];

    const newTx: Transaction = {
      id: trackingId,
      userId: loggedInUser.id,
      timestamp: now.toISOString(),
      whatsapp,
      paymentMethod,
      paymentAccountName,
      paymentAccountNumber,
      rawGmails,
      gmails: parsedAccounts,
      categoryKey,
      categoryLabel: rateObj.label,
      ratePerAccount: rateObj.price,
      quantitySubmitted: parsedAccounts.length,
      quantityValid: 0,
      totalPayout: 0, // starts at 0, updated by admin check
      status: 'pending',
      adminNotes: 'Menunggu verifikasi admin.'
    };

    const updatedTx = [...transactions, newTx];
    syncTransactions(updatedTx);
    setSuccessSubmission(newTx);
  };

  const handleNewWithdrawal = (amount: number, method: string, accNumber: string, accName: string) => {
    if (!loggedInUser) return;

    // Deduct balance immediately in local user state
    const updatedUsers = users.map(u => {
      if (u.id === loggedInUser.id) {
        return { ...u, balance: u.balance - amount };
      }
      return u;
    });
    syncUsers(updatedUsers);

    // Create withdrawal tracking record
    const now = new Date();
    const yymmdd = now.toISOString().slice(2, 10).replace(/-/g, '');
    const rand = Math.floor(100 + Math.random() * 900);
    const wdId = `WD-${yymmdd}-${rand}`;

    const newWd: Withdrawal = {
      id: wdId,
      userId: loggedInUser.id,
      userUsername: loggedInUser.username,
      amount,
      paymentMethod: method,
      accountNumber: accNumber,
      accountName: accName,
      status: 'pending',
      adminNotes: 'Sedang diproses oleh bendahara Juragan.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const updatedWds = [...withdrawals, newWd];
    syncWithdrawals(updatedWds);
  };

  // ADMIN DASHBOARD MUTATORS
  const handleUpdateTransactionByAdmin = (updatedTx: Transaction) => {
    // Check if the status transitioned to COMPLETED
    const originalTx = transactions.find(t => t.id === updatedTx.id);
    const becameCompleted = originalTx && originalTx.status !== 'completed' && updatedTx.status === 'completed';

    // 1. Update Transaction
    const nextTransactions = transactions.map(t => t.id === updatedTx.id ? updatedTx : t);
    syncTransactions(nextTransactions);

    // 2. If completed, credit user's balance!
    if (becameCompleted && updatedTx.userId) {
      const payoutAmount = updatedTx.totalPayout;
      const nextUsers = users.map(u => {
        if (u.id === updatedTx.userId) {
          return { ...u, balance: u.balance + payoutAmount };
        }
        return u;
      });
      syncUsers(nextUsers);
    }
  };

  const handleUpdateWithdrawalByAdmin = (updatedWd: Withdrawal) => {
    const originalWd = withdrawals.find(w => w.id === updatedWd.id);
    const becameRejected = originalWd && originalWd.status !== 'rejected' && updatedWd.status === 'rejected';

    // 1. Update Withdrawal Record
    const nextWithdrawals = withdrawals.map(w => w.id === updatedWd.id ? updatedWd : w);
    syncWithdrawals(nextWithdrawals);

    // 2. If rejected, REFUND balance back to user's wallet!
    if (becameRejected) {
      const refundAmount = updatedWd.amount;
      const nextUsers = users.map(u => {
        if (u.id === updatedWd.userId) {
          return { ...u, balance: u.balance + refundAmount };
        }
        return u;
      });
      syncUsers(nextUsers);
    }
  };

  const handleAddAnnouncementByAdmin = (newAnn: Announcement) => {
    const nextAnn = [...announcements, newAnn];
    syncAnnouncements(nextAnn);
  };

  const handleDeleteAnnouncementByAdmin = (id: string) => {
    const nextAnn = announcements.filter(a => a.id !== id);
    syncAnnouncements(nextAnn);
  };

  const handleDeleteUserByAdmin = (userId: string) => {
    const nextUsers = users.filter(u => u.id !== userId);
    syncUsers(nextUsers);
  };

  // ADMIN PIN HANDLERS
  const handleAdminPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    if (enteredPin === settings.adminPin) {
      setAdminUnlocked(true);
      setShowAdminPinModal(false);
      setEnteredPin('');
      setActiveTab('admin');
    } else {
      setPinError('PIN Admin salah! PIN default adalah 123456');
    }
  };

  // CALCULATOR VARIABLES
  const [calcQty, setCalcQty] = useState(50);
  const calcRatePerAccount = useMemo(() => {
    if (calcQty <= 20) return 2200;
    if (calcQty <= 50) return 3200;
    if (calcQty <= 300) return 4200;
    return 5200;
  }, [calcQty]);
  const calcTotalPayout = useMemo(() => calcRatePerAccount * calcQty, [calcRatePerAccount, calcQty]);

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  // Helper WA link
  const getWhatsAppLink = (tx: Transaction) => {
    const text = `Halo Admin Juragan Gmail,%0ASaya ingin memberitahu bahwa saya baru saja menyetor Gmail dengan rincian berikut:%0A%0A- *ID Transaksi:* ${tx.id}%0A- *Kategori:* ${tx.categoryLabel}%0A- *Jumlah Akun:* ${tx.quantitySubmitted} Akun%0A- *Tujuan Payout:* ${tx.paymentMethod} - ${tx.paymentAccountNumber}%0A%0AMohon bantuan pengecekan manual, terima kasih!`;
    return `https://wa.me/${settings.whatsappAdmin}?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-[#040608] text-slate-200 selection:bg-amber-400 selection:text-slate-900">
      
      {/* GLOW DECORATIONS */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-10 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-[#040608]/85 backdrop-blur-md border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Branding Logo */}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-8 h-8 bg-gradient-to-tr from-emerald-600 to-amber-400 rounded-lg flex items-center justify-center shadow-md">
                <Crown className="w-4.5 h-4.5 text-slate-950 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-sm tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400 font-mono">
                JURAGAN GMAIL
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-5 text-xs font-bold font-mono">
              <button
                onClick={() => setActiveTab('home')}
                className={`transition-colors uppercase tracking-wider cursor-pointer ${activeTab === 'home' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('panduan')}
                className={`transition-colors uppercase tracking-wider cursor-pointer ${activeTab === 'panduan' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Panduan Setor
              </button>
              <button
                onClick={() => setActiveTab('kalkulator')}
                className={`transition-colors uppercase tracking-wider cursor-pointer ${activeTab === 'kalkulator' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Kalkulator
              </button>

              {loggedInUser ? (
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`bg-[#080d0f] border border-slate-800 text-emerald-400 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'dashboard' ? 'border-emerald-500/40 text-amber-400 bg-emerald-500/5' : 'hover:border-slate-700'
                  }`}
                >
                  DASBOR MITRA ({loggedInUser.username})
                </button>
              ) : (
                <button
                  onClick={() => { setAuthMode('login'); setActiveTab('auth'); }}
                  className={`bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2 rounded-lg hover:border-slate-700 cursor-pointer ${
                    activeTab === 'auth' ? 'border-amber-400/40 text-amber-400' : ''
                  }`}
                >
                  MASUK / DAFTAR
                </button>
              )}

              {/* Secure Admin Gate Button */}
              {adminUnlocked ? (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 rounded-lg uppercase transition-all cursor-pointer flex items-center gap-1 ${
                    activeTab === 'admin' ? 'ring-2 ring-amber-400/50' : ''
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>KONSOL ADMIN</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAdminPinModal(true)}
                  className="bg-slate-950/80 border border-slate-900 text-slate-500 hover:text-slate-300 px-3 py-2 rounded-lg hover:border-slate-800 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>OWNER PIN</span>
                </button>
              )}
            </nav>

            {/* Mobile Menu Icon */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-400 p-2 focus:outline-none cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#040608] border-b border-slate-900 px-4 py-4 space-y-3 font-mono text-xs font-bold"
            >
              <button
                onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 text-slate-300 uppercase"
              >
                Home
              </button>
              <button
                onClick={() => { setActiveTab('panduan'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 text-slate-300 uppercase"
              >
                Panduan Setor
              </button>
              <button
                onClick={() => { setActiveTab('kalkulator'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 text-slate-300 uppercase"
              >
                Kalkulator
              </button>

              {loggedInUser ? (
                <button
                  onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                  className="block w-full text-left py-2.5 text-emerald-400 uppercase font-black"
                >
                  Dasbor Mitra ({loggedInUser.username})
                </button>
              ) : (
                <button
                  onClick={() => { setAuthMode('login'); setActiveTab('auth'); setMobileMenuOpen(false); }}
                  className="block w-full text-left py-2 text-slate-300 uppercase"
                >
                  Masuk / Daftar Akun
                </button>
              )}

              {/* Admin Gate for Mobile */}
              {adminUnlocked ? (
                <button
                  onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                  className="block w-full text-left py-2.5 text-amber-400 uppercase font-black"
                >
                  Konsol Administrator
                </button>
              ) : (
                <button
                  onClick={() => { setShowAdminPinModal(true); setMobileMenuOpen(false); }}
                  className="block w-full text-left py-2 text-slate-500 uppercase font-normal"
                >
                  Gembok Owner PIN
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 min-h-[70vh]">
        
        {/* TAB SWITCHER ROUTER */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            {/* 1. HOME LANDING PAGE */}
            {activeTab === 'home' && (
              <LandingPage
                rates={rates}
                onStart={(tab) => { setAuthMode(tab); setActiveTab('auth'); }}
                onViewRates={() => setActiveTab('panduan')}
                totalWithdrawn={148400000}
              />
            )}

            {/* 2. AUTHENTICATION PAGE (LOGIN / SIGNUP) */}
            {activeTab === 'auth' && (
              <Auth
                initialTab={authMode}
                onAuthSuccess={handleAuthSuccess}
                existingUsers={users}
                onRegisterUser={handleRegisterUser}
              />
            )}

            {/* 3. USER DASHBOARD INTERFACE */}
            {activeTab === 'dashboard' && loggedInUser && (
              <UserDashboard
                user={loggedInUser}
                onLogout={handleLogout}
                rates={rates}
                transactions={transactions}
                withdrawals={withdrawals}
                announcements={announcements}
                recommendedRecoveryDomain={settings.recommendedRecoveryDomain}
                onNewSubmission={handleNewSubmission}
                onNewWithdrawal={handleNewWithdrawal}
              />
            )}

            {/* 4. ADMIN DASHBOARD INTERFACE */}
            {activeTab === 'admin' && adminUnlocked && (
              <AdminDashboard
                rates={rates}
                onSaveRates={syncRates}
                settings={settings}
                onSaveSettings={syncSettings}
                transactions={transactions}
                onUpdateTransaction={handleUpdateTransactionByAdmin}
                withdrawals={withdrawals}
                onUpdateWithdrawal={handleUpdateWithdrawalByAdmin}
                users={users}
                onDeleteUser={handleDeleteUserByAdmin}
                announcements={announcements}
                onAddAnnouncement={handleAddAnnouncementByAdmin}
                onDeleteAnnouncement={handleDeleteAnnouncementByAdmin}
              />
            )}

            {/* 5. PANDUAN SETOR */}
            {activeTab === 'panduan' && (
              <div className="space-y-8 max-w-4xl mx-auto" id="panduan-setor">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-[#080d0f] to-slate-950 border border-slate-900 rounded-3xl p-6 sm:p-10 space-y-4 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                  <span className="text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase">INFORMASI UTAMA</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-100 font-mono tracking-tight uppercase">📝 RULES & RATE SUPPLIER JURAGAN GMAIL</h2>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">
                    Sistem kerja ini menggunakan metode setoran. Artinya, Anda membuat email sesuai ketentuan yang diberikan oleh admin di bawah ini, lalu menyetorkannya ke dasbor ini untuk dilakukan pengecekan transparan.
                  </p>
                  <div className="pt-2">
                    <a
                      href="https://whatsapp.com/channel/0029Vb8VtFzDeONEEfhW8J1D"
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl transition-all"
                    >
                      <span>Ikuti Channel WhatsApp Resmi</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* 4 Rules Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ketentuan Akun */}
                  <div className="bg-[#080d0f] border border-slate-900 p-6 rounded-2xl space-y-4 shadow-md text-xs">
                    <h3 className="text-sm font-black text-amber-400 font-mono uppercase tracking-tight flex items-center gap-2 border-b border-slate-950 pb-2">
                      <span className="bg-amber-400/10 w-6 h-6 rounded-md flex items-center justify-center text-amber-400 font-mono text-[11px]">1</span>
                      <span>KETENTUAN AKUN (WAJIB)</span>
                    </h3>
                    <ul className="space-y-3 text-slate-300 leading-relaxed list-none">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-mono">✔</span>
                        <div><strong>Nama Asli:</strong> Wajib nama manusia asli Indonesia (bukan bot/huruf acak).</div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-mono">✔</span>
                        <div><strong>Tahun Lahir:</strong> Harus berjarak rentang tahun 1990 - 2005.</div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-mono">✔</span>
                        <div>
                          <strong>Pilihan Password:</strong> Sandi wajib menggunakan salah satu kata berikut:
                          <div className="bg-slate-950/80 border border-slate-900 px-2.5 py-1.5 rounded font-mono text-emerald-400 mt-1.5 flex gap-1.5 flex-wrap text-[10px]">
                            <span>aass1122</span>
                            <span className="text-slate-700">|</span>
                            <span>sgsg1122</span>
                            <span className="text-slate-700">|</span>
                            <span>fineirga</span>
                            <span className="text-slate-700">|</span>
                            <span>prabujaya</span>
                          </div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 font-mono">⚠</span>
                        <div><strong>Pemulihan Kosong:</strong> Email pemulihan & No. HP wajib <strong>KOSONG</strong> (bersih dari pemulihan/2FA).</div>
                      </li>
                    </ul>
                  </div>

                  {/* Daftar Rate */}
                  <div className="bg-[#080d0f] border border-slate-900 p-6 rounded-2xl space-y-4 shadow-md text-xs">
                    <h3 className="text-sm font-black text-amber-400 font-mono uppercase tracking-tight flex items-center gap-2 border-b border-slate-950 pb-2">
                      <span className="bg-amber-400/10 w-6 h-6 rounded-md flex items-center justify-center text-amber-400 font-mono text-[11px]">2</span>
                      <span>DAFTAR RATE PENDAPATAN</span>
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      Rate ditentukan secara progresif berdasarkan akumulasi jumlah akun valid yang Anda setorkan sekaligus:
                    </p>
                    <div className="space-y-2 font-mono">
                      <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded border border-slate-900">
                        <span className="text-slate-300">1 - 20 Akun:</span>
                        <strong className="text-emerald-400">Rp 2.200 <span className="text-slate-500 font-normal">/ akun</span></strong>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded border border-slate-900">
                        <span className="text-slate-300">21 - 50 Akun:</span>
                        <strong className="text-emerald-400">Rp 3.200 <span className="text-slate-500 font-normal">/ akun</span></strong>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded border border-slate-900">
                        <span className="text-slate-300">51 - 300 Akun:</span>
                        <strong className="text-emerald-400">Rp 4.200 <span className="text-slate-500 font-normal">/ akun</span></strong>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded border border-slate-900">
                        <span className="text-slate-300">300+ Akun:</span>
                        <strong className="text-emerald-400">Rp 5.200 <span className="text-slate-500 font-normal">/ akun</span></strong>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">
                      📌 Khusus supplier besar/rutin harian, tersedia rate khusus. Hubungi admin.
                    </p>
                  </div>

                  {/* Jam Kerja */}
                  <div className="bg-[#080d0f] border border-slate-900 p-6 rounded-2xl space-y-4 shadow-md text-xs">
                    <h3 className="text-sm font-black text-amber-400 font-mono uppercase tracking-tight flex items-center gap-2 border-b border-slate-950 pb-2">
                      <span className="bg-amber-400/10 w-6 h-6 rounded-md flex items-center justify-center text-amber-400 font-mono text-[11px]">3</span>
                      <span>JAM KERJA & PROSES WD</span>
                    </h3>
                    <ul className="space-y-3 text-slate-300 leading-relaxed list-disc pl-4">
                      <li><strong>Buka Toko / Jam Operasional:</strong> Mulai pukul 06.00 hingga 16.00 WIB setiap hari.</li>
                      <li><strong>Pencairan Dana (WD):</strong> Permintaan penarikan diproses paling cepat 1x24 jam, paling lambat 24-48 jam kerja (antri sesuai antrean bendahara).</li>
                    </ul>
                  </div>

                  {/* Garansi Kami */}
                  <div className="bg-[#080d0f] border border-slate-900 p-6 rounded-2xl space-y-4 shadow-md text-xs">
                    <h3 className="text-sm font-black text-amber-400 font-mono uppercase tracking-tight flex items-center gap-2 border-b border-slate-950 pb-2">
                      <span className="bg-amber-400/10 w-6 h-6 rounded-md flex items-center justify-center text-amber-400 font-mono text-[11px]">4</span>
                      <span>GARANSI JURAGAN GMAIL</span>
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      Semua data akun yang disetorkan akan diperiksa secara teliti, adil, jujur dan transparan oleh checker kami.
                    </p>
                    <p className="text-slate-300 leading-relaxed font-bold">
                      Hasil pengecekan akan dilaporkan apa adanya di riwayat transaksi tanpa manipulasi atau pengurangan jumlah akun valid.
                    </p>
                  </div>
                </div>

                {/* Text Formatting format guide */}
                <div className="bg-[#080d0f] border border-slate-900 p-6 rounded-2xl space-y-4 shadow-md text-xs">
                  <h3 className="text-sm font-black text-amber-400 font-mono uppercase tracking-tight">Format Penulisan Teks Setor</h3>
                  <p className="text-slate-400">Saat menginput daftar Gmail di tab Setor Gmail, ikuti format pemisah garis tegak <strong className="text-slate-300">|</strong> berikut (Satu akun per baris):</p>
                  
                  <div className="bg-[#030607] border border-slate-900 p-4 rounded-xl text-emerald-400 font-mono leading-relaxed select-all">
                    alamatemailmu1@gmail.com|passwordpilihanmu<br />
                    alamatemailmu2@gmail.com|passwordpilihanmu
                  </div>

                  <p className="text-slate-400">Pastikan tidak ada spasi berlebih atau baris kosong agar parsing otomatis sistem tidak error.</p>
                </div>
              </div>
            )}

            {/* 6. KALKULATOR PENDAPATAN */}
            {activeTab === 'kalkulator' && (
              <div className="max-w-2xl mx-auto space-y-6" id="kalkulator-pendapatan">
                <div className="bg-[#080d0f] border border-slate-900 rounded-3xl p-6 sm:p-10 text-center space-y-4 shadow-xl">
                  <span className="text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">CALCULATOR</span>
                  <h2 className="text-3xl font-black text-slate-100 font-mono tracking-tight uppercase">KALKULATOR ESTIMASI PENDAPATAN</h2>
                  <p className="text-slate-400 text-xs">Hitung taksiran keuntungan uang tunai otomatis berdasarkan skema rate progresif harian kami.</p>
                </div>

                {/* Interactive Calc block */}
                <div className="bg-[#080d0f] border border-slate-900 rounded-2xl p-6 space-y-6 shadow-md text-xs font-mono">
                  
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jumlah Akun yang Disetor</label>
                      <span className="text-amber-400 font-bold text-sm bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg">{calcQty} Akun</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={500}
                      step={1}
                      value={calcQty}
                      onChange={(e) => setCalcQty(parseInt(e.target.value) || 1)}
                      className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-400 my-4"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                      <span>1 Akun</span>
                      <span>50 Akun (Rate Rp3.400)</span>
                      <span>300 Akun (Rate Rp4.500)</span>
                      <span>500 Akun (Rate Rp5.600)</span>
                    </div>
                  </div>

                  {/* Active Rate Indicator */}
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-900 flex justify-between items-center">
                    <span className="text-slate-400 font-mono text-[11px]">Rate Aktif Anda:</span>
                    <strong className="text-emerald-400 text-sm">Rp {calcRatePerAccount.toLocaleString('id-ID')} / Akun</strong>
                  </div>

                  <div className="p-5 bg-slate-950 rounded-2xl border border-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">ESTIMASI TOTAL PENCAIRAN (PAYOUT):</span>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Total yang akan Anda dapatkan dari {calcQty} akun valid senilai {formatRupiah(calcTotalPayout)}.
                      </p>
                    </div>
                    <strong className="text-emerald-400 text-2xl font-black font-mono shrink-0">{formatRupiah(calcTotalPayout)}</strong>
                  </div>

                  {/* Sign-up trigger for guest */}
                  {!loggedInUser && (
                    <div className="text-center pt-2">
                      <button
                        onClick={() => { setAuthMode('register'); setActiveTab('auth'); }}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-2.5 rounded-lg text-xs uppercase tracking-wide cursor-pointer"
                      >
                        Daftar & Cairkan Sekarang
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* GLOBAL FOOTER */}
      <footer className="bg-[#05080a] border-t border-slate-900 text-xs py-10 mt-16 text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 bg-gradient-to-tr from-emerald-600 to-amber-400 rounded flex items-center justify-center">
              <Crown className="w-3 h-3 text-slate-950" />
            </div>
            <span className="font-extrabold text-sm tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-amber-400">
              JURAGAN GMAIL
            </span>
          </div>
          <p className="text-slate-600 text-[11px] max-w-md mx-auto leading-relaxed">
            Juragan Gmail adalah sistem penyetoran bulk Gmail terintegrasi terkemuka di Indonesia. Semua data diproses secara aman, instan, dan transparan.
          </p>
          <div className="text-[10px] text-slate-600">
            &copy; 2026 JURAGAN GMAIL. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* MODAL: ADMIN ACCESS PIN ENTRY */}
      <AnimatePresence>
        {showAdminPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAdminPinModal(false); setPinError(''); setEnteredPin(''); }}
              className="absolute inset-0 bg-[#040608]/90 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#080d0f] border border-amber-950/40 rounded-2xl p-6 max-w-sm w-full relative shadow-2xl space-y-4 z-10 text-center"
            >
              <div className="w-12 h-12 bg-amber-950/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                <Lock className="w-6 h-6 stroke-[2]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-100 font-mono uppercase">Masukkan PIN Owner Admin</h3>
                <p className="text-slate-400 text-[11px]">Masukkan PIN Owner yang dikonfigurasi untuk mengakses dasbor admin pengelola.</p>
              </div>

              {pinError && (
                <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 p-2.5 rounded-lg text-[10px] leading-relaxed">
                  {pinError}
                </div>
              )}

              <form onSubmit={handleAdminPinSubmit} className="space-y-3">
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="PIN Keamanan (Default: 123456)"
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  className="w-full text-center bg-slate-950 border border-slate-900 focus:border-amber-500/40 rounded-xl p-3 text-sm font-mono tracking-widest text-amber-400 focus:outline-none"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowAdminPinModal(false); setPinError(''); setEnteredPin(''); }}
                    className="flex-1 bg-slate-900 text-slate-300 border border-slate-800 p-2.5 rounded-xl text-xs font-bold font-mono cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 p-2.5 rounded-xl text-xs font-black font-mono cursor-pointer"
                  >
                    Unlock
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: NEW SUBMISSION SUCCESS OVERLAY */}
      <AnimatePresence>
        {successSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSuccessSubmission(null)}
              className="absolute inset-0 bg-[#040608]/90 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#080d0f] border border-emerald-500/30 rounded-2xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl space-y-6 z-10"
            >
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-950 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight font-mono">Setoran Sukses Dikirim!</h3>
                <p className="text-slate-400 text-xs">
                  Sistem telah mencatat setoran akun Gmail Anda dengan kode pelacakan unik.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl space-y-2.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">ID Transaksi:</span>
                  <strong className="text-amber-400 font-black text-sm">{successSubmission.id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kategori Gmail:</span>
                  <span className="text-slate-300 font-semibold">{successSubmission.categoryLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jumlah Akun:</span>
                  <span className="text-emerald-400 font-bold">{successSubmission.quantitySubmitted} Akun</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tujuan Payout:</span>
                  <span className="text-slate-300 uppercase font-bold">{successSubmission.paymentMethod} • {successSubmission.paymentAccountNumber}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-900">
                  <span className="text-slate-400">Status Awal:</span>
                  <span className="text-amber-400 font-bold uppercase">{successSubmission.status}</span>
                </div>
              </div>

              <div className="bg-emerald-950/10 border border-emerald-900/20 rounded-xl p-3.5 text-xs text-emerald-300 space-y-1.5 leading-relaxed">
                <span className="font-extrabold uppercase text-[9px] tracking-wider block font-mono">⚡ Hubungi Admin Untuk Mempercepat:</span>
                <p>Klik tombol di bawah untuk memberi tahu admin via WhatsApp. Tim verifikasi manual akan langsung memproses antrian Anda!</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href={getWhatsAppLink(successSubmission)}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black p-3 rounded-xl text-center flex items-center justify-center space-x-2 text-xs cursor-pointer font-mono decoration-transparent"
                >
                  <MessageSquare className="w-4 h-4 stroke-[2.5]" />
                  <span>Kirim Notifikasi WA</span>
                </a>
                <button
                  onClick={() => {
                    setSuccessSubmission(null);
                    setActiveTab('dashboard');
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold p-3 rounded-xl text-center text-xs cursor-pointer font-mono"
                >
                  Pantau di Dasbor Mitra
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
