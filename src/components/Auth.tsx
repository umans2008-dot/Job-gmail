import React, { useState } from 'react';
import { User } from '../types';
import { motion } from 'motion/react';
import { Mail, User as UserIcon, Lock, Smartphone, CreditCard, UserCheck, AlertCircle, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

interface AuthProps {
  initialTab: 'login' | 'register';
  onAuthSuccess: (user: User) => void;
  existingUsers: User[];
  onRegisterUser: (newUser: User) => void;
}

export default function Auth({ initialTab, onAuthSuccess, existingUsers, onRegisterUser }: AuthProps) {
  const [activeSubTab, setActiveSubTab] = useState<'login' | 'register'>(initialTab);
  
  // General Form States
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Bank Details States (For Register)
  const [bankName, setBankName] = useState('DANA');
  const [bankNumber, setBankNumber] = useState('');
  const [bankHolderName, setBankHolderName] = useState('');

  // Error & Status
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Username/Email dan Password wajib diisi!');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      const q = username.trim().toLowerCase();
      // Look up user by username or email
      const foundUser = existingUsers.find(
        u => (u.username.toLowerCase() === q || u.email.toLowerCase() === q) && u.passwordHash === password
      );

      setLoading(false);
      
      if (foundUser) {
        onAuthSuccess(foundUser);
      } else {
        setError('Kombinasi Username/Email dan password salah!');
      }
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!email.trim() || !username.trim() || !whatsapp.trim() || !password.trim()) {
      setError('Mohon lengkapi semua bidang bertanda bintang (*)!');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Format email tidak valid!');
      return;
    }

    const cleanedUsername = username.trim().replace(/\s+/g, '').toLowerCase();
    if (cleanedUsername.length < 4) {
      setError('Username minimal 4 karakter tanpa spasi!');
      return;
    }

    // Check if username/email already exists
    if (existingUsers.some(u => u.username.toLowerCase() === cleanedUsername)) {
      setError('Username sudah terdaftar! Pilih username lain.');
      return;
    }

    if (existingUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setError('Email sudah terdaftar!');
      return;
    }

    if (whatsapp.trim().length < 9) {
      setError('Nomor WhatsApp tidak valid!');
      return;
    }

    if (password.length < 5) {
      setError('Password minimal 5 karakter!');
      return;
    }

    if (!bankNumber.trim() || !bankHolderName.trim()) {
      setError('Detail bank/e-wallet pembayaran wajib diisi agar payout dapat diproses otomatis!');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const newUserId = 'USR-' + Math.floor(100000 + Math.random() * 900000);
      const newUserObj: User = {
        id: newUserId,
        email: email.trim().toLowerCase(),
        username: cleanedUsername,
        whatsapp: whatsapp.trim().replace('+', ''),
        passwordHash: password, // client simulation
        balance: 0, // starts at zero rupiah
        bankName,
        bankNumber: bankNumber.trim(),
        bankHolderName: bankHolderName.trim(),
        createdAt: new Date().toISOString()
      };

      onRegisterUser(newUserObj);
      setLoading(false);
      onAuthSuccess(newUserObj);
    }, 800);
  };

  return (
    <div className="max-w-md mx-auto my-6" id="auth-panel">
      {/* Container Card */}
      <div className="bg-[#080d0f] border border-slate-900 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Tab Toggle */}
        <div className="flex border-b border-slate-900/60 bg-slate-950/40">
          <button
            onClick={() => { setActiveSubTab('login'); setError(''); }}
            className={`flex-1 py-4 text-center text-xs font-black font-mono tracking-wider transition-colors uppercase border-b-2 ${
              activeSubTab === 'login'
                ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            Masuk Akun
          </button>
          <button
            onClick={() => { setActiveSubTab('register'); setError(''); }}
            className={`flex-1 py-4 text-center text-xs font-black font-mono tracking-wider transition-colors uppercase border-b-2 ${
              activeSubTab === 'register'
                ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center space-y-1.5">
            <h3 className="text-lg font-black text-slate-100 font-mono uppercase tracking-tight">
              {activeSubTab === 'login' ? 'Masuk Juragan Gmail' : 'Daftar Mitra Juragan'}
            </h3>
            <p className="text-slate-400 text-xs">
              {activeSubTab === 'login' 
                ? 'Silakan masuk untuk mulai menyetor Gmail dan menarik saldo' 
                : 'Bergabunglah bersama ratusan juragan dan mulailah menghasilkan'}
            </p>
          </div>

          {/* Error Message Alert */}
          {error && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-rose-950/20 border border-rose-500/20 text-rose-300 p-3.5 rounded-xl flex items-start space-x-2.5 text-xs"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form Content */}
          {activeSubTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Username atau Email</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="budisantoso atau budi@gmail.com"
                    className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500/40 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-200 focus:outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500/40 rounded-xl py-3 pl-11 pr-11 text-xs text-slate-200 focus:outline-none placeholder:text-slate-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-lg font-mono flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Masuk Akun</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Account Credentials block */}
              <div className="space-y-3 p-3 bg-slate-950/40 rounded-xl border border-slate-900">
                <span className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider font-mono block">1. Akun & Kredensial *</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide font-mono">Username *</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                        placeholder="username"
                        className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500/40 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide font-mono">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@gmail.com"
                        className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500/40 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide font-mono">No. WhatsApp *</label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="tel"
                        required
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="6281234567"
                        className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500/40 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none placeholder:text-slate-600 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide font-mono">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Sandi"
                        className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500/40 rounded-lg py-2 pl-9 pr-8 text-xs text-slate-200 focus:outline-none placeholder:text-slate-600 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Destination block */}
              <div className="space-y-3 p-3 bg-slate-950/40 rounded-xl border border-slate-900">
                <span className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider font-mono block">2. Tujuan Pembayaran Payout *</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide font-mono block mb-1">E-Wallet / Bank</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500/40 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
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

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide font-mono">No. Rekening / No. HP *</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={bankNumber}
                        onChange={(e) => setBankNumber(e.target.value)}
                        placeholder="Nomor rekening / No HP wallet"
                        className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500/40 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none placeholder:text-slate-600 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide font-mono block">Nama Lengkap Pemilik Rekening *</label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={bankHolderName}
                      onChange={(e) => setBankHolderName(e.target.value)}
                      placeholder="Nama lengkap sesuai e-wallet / buku tabungan"
                      className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500/40 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-lg font-mono flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Daftar Sekarang</span>
                    <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
