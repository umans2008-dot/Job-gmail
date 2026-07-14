import React from 'react';
import { Crown, ArrowRight, CheckCircle2, DollarSign, TrendingUp, ShieldCheck, Zap, Coins, Users, HelpCircle, BookOpen } from 'lucide-react';
import { GmailRate } from '../types';

interface LandingPageProps {
  rates: GmailRate[];
  onStart: (tab: 'login' | 'register') => void;
  onViewRates: () => void;
  totalWithdrawn: number;
}

export default function LandingPage({ rates, onStart, onViewRates, totalWithdrawn }: LandingPageProps) {
  const stats = [
    { label: 'Total Payout Cair', value: 'Rp 148,400,000+', icon: DollarSign, color: 'text-emerald-400 bg-emerald-950/40' },
    { label: 'Akun Terverifikasi', value: '184,290 Akun', icon: CheckCircle2, color: 'text-amber-400 bg-amber-950/40' },
    { label: 'Juragan Aktif', value: '412 Member', icon: Users, color: 'text-sky-400 bg-sky-950/40' },
  ];

  return (
    <div className="space-y-16 py-8" id="landing-page">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-radial from-slate-900/60 via-[#060a0c] to-[#030607] border border-slate-900 p-8 md:p-14 text-center space-y-8 shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-950/60 to-slate-900/80 px-3.5 py-1.5 rounded-full border border-emerald-500/20 shadow-inner">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] font-bold text-slate-200 tracking-wider font-mono uppercase">
            Platform Penyetoran Gmail Bulk Terpercaya #1
          </span>
        </div>

        {/* Title */}
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-100 uppercase leading-none">
            Ubah Akun Gmail Anda <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400 bg-size-200 animate-gradient">
              Menjadi Saldo Rupiah
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Punya stok akun Gmail Fresh atau Aged melimpah? Setorkan ke Juragan Gmail! Proses verifikasi cepat, saldo langsung masuk ke dasbor, dan bisa ditarik kapan saja ke Rekening Bank atau E-Wallet pilihan Anda.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onStart('register')}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 font-black px-8 py-3.5 rounded-xl flex items-center justify-center space-x-2 text-sm shadow-xl hover:shadow-emerald-500/10 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <span>Daftar Sekarang & Setor</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            onClick={() => onStart('login')}
            className="w-full sm:w-auto bg-slate-900/60 hover:bg-slate-900 text-slate-200 border border-slate-800 hover:border-slate-700 font-bold px-8 py-3.5 rounded-xl text-center text-sm transition-all cursor-pointer"
          >
            Masuk ke Dasbor
          </button>
        </div>

        {/* Quick Features Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 border-t border-slate-900/60">
          <div className="flex items-center space-x-2 justify-center text-slate-400 text-xs font-mono">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verifikasi Handal</span>
          </div>
          <div className="flex items-center space-x-2 justify-center text-slate-400 text-xs font-mono">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Sistem Saldo Instan</span>
          </div>
          <div className="flex items-center space-x-2 justify-center text-slate-400 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Garansi Data Aman</span>
          </div>
          <div className="flex items-center space-x-2 justify-center text-slate-400 text-xs font-mono">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Rate Kompetitif</span>
          </div>
        </div>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-[#080d0f] border border-slate-900 rounded-2xl p-6 flex items-center space-x-4 shadow-lg">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <span className="text-slate-400 text-[11px] font-bold font-mono tracking-wider uppercase block">{s.label}</span>
              <strong className="text-slate-100 text-xl font-extrabold font-mono tracking-tight">{s.value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Accepted Rates & Pricing Catalog */}
      <div className="space-y-6">
        <div className="text-center md:text-left space-y-1">
          <span className="text-[10px] font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">KATALOG PRODUK</span>
          <h2 className="text-2xl font-black text-slate-100 font-mono tracking-tight uppercase">DAFTAR HARGA BELI GMAIL TERBARU</h2>
          <p className="text-slate-400 text-xs max-w-xl">Rate harga transparan per akun Gmail valid yang disetor ke platform kami.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rates.map((rate) => (
            <div
              key={rate.key}
              className="bg-[#080d0f] border border-slate-900 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-800 transition-all shadow-md group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
              
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-slate-200 font-bold text-sm block group-hover:text-amber-400 transition-colors">{rate.label}</span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">ID: {rate.key}</span>
                  </div>
                  <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-black px-3 py-1.5 rounded-lg text-xs font-mono shrink-0">
                    Rp {rate.price.toLocaleString('id-ID')} <span className="text-[9px] text-slate-400 font-medium">/ Akun</span>
                  </div>
                </div>

                {/* Desc */}
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {rate.description}
                </p>

                {/* Requirements checklist */}
                <div className="space-y-2 pt-2 border-t border-slate-950">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 font-mono block">Persyaratan Mutlak:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                    {rate.requirements.map((req, i) => (
                      <div key={i} className="flex items-start space-x-1.5 text-[10px] text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guide Card banner */}
      <div className="bg-gradient-to-r from-[#05090a] via-[#0b1215] to-[#05090a] border border-slate-900 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-3 max-w-xl">
          <h3 className="text-lg font-extrabold text-slate-200 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>Ingin Mempelajari Cara Pembuatan & Penyetoran?</span>
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Kami menyediakan panduan lengkap, tips agar akun awet (anti-disabled), panduan cara mengisi email pemulihan (recovery) massal, hingga format teks setor. Klik tombol panduan untuk membaca selengkapnya.
          </p>
        </div>
        <button
          onClick={onViewRates}
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-extrabold text-xs px-6 py-3 rounded-xl border border-slate-800 transition-colors whitespace-nowrap cursor-pointer shrink-0"
        >
          Pelajari Panduan Lengkap
        </button>
      </div>
    </div>
  );
}
