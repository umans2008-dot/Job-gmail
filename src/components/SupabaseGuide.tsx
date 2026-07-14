import React, { useState } from 'react';
import { Copy, Check, Database, ExternalLink, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

export default function SupabaseGuide() {
  const [copied, setCopied] = useState(false);

  const sqlSchema = `-- ==========================================
-- SQL DDL SCHEMA UNTUK JURAGAN GMAIL (SUPABASE)
-- Silakan salin dan jalankan di SQL Editor Supabase Anda.
-- ==========================================

-- 1. Tabel Users (Menyimpan profil, Whatsapp, dan Saldo)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY, -- Format: USR-XXXXXX
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    whatsapp TEXT NOT NULL,
    password_hash TEXT NOT NULL, -- Simpan sandi terenkripsi / teks murni untuk sandbox
    balance BIGINT DEFAULT 0 NOT NULL, -- Saldo IDR
    bank_name TEXT, -- DANA, OVO, GOPAY, BCA, Mandiri, dll
    bank_number TEXT,
    bank_holder_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Kategori & Rate Gmail (Sync harga beli)
CREATE TABLE IF NOT EXISTS public.gmail_rates (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    price INT NOT NULL,
    description TEXT,
    requirements TEXT[] NOT NULL
);

-- Seeding Rate Awal
INSERT INTO public.gmail_rates (key, label, price, description, requirements) VALUES
('tier_1', 'Tier 1 (1 - 20 Akun)', 2200, 'Rate progresif untuk setoran 1 s/d 20 akun sekaligus.', ARRAY['Nama manusia asli', 'Tahun lahir 1990 - 2005', 'Password wajib seragam', 'Email & No. Pemulihan KOSONG']),
('tier_2', 'Tier 2 (21 - 50 Akun)', 3200, 'Rate progresif untuk setoran 21 s/d 50 akun sekaligus.', ARRAY['Nama manusia asli', 'Tahun lahir 1990 - 2005', 'Password wajib seragam', 'Email & No. Pemulihan KOSONG']),
('tier_3', 'Tier 3 (51 - 300 Akun)', 4200, 'Rate progresif untuk setoran 51 s/d 300 akun sekaligus.', ARRAY['Nama manusia asli', 'Tahun lahir 1990 - 2005', 'Password wajib seragam', 'Email & No. Pemulihan KOSONG']),
('tier_4', 'Tier 4 (300+ Akun)', 5200, 'Rate progresif untuk setoran lebih dari 300 akun sekaligus.', ARRAY['Nama manusia asli', 'Tahun lahir 1990 - 2005', 'Password wajib seragam', 'Email & No. Pemulihan KOSONG'])
ON CONFLICT (key) DO UPDATE SET 
    price = EXCLUDED.price, 
    description = EXCLUDED.description,
    requirements = EXCLUDED.requirements;

-- 3. Tabel Transaksi Setoran Gmail (Submissions)
CREATE TABLE IF NOT EXISTS public.submissions (
    id TEXT PRIMARY KEY, -- Format: JRG-XXXXXX
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    whatsapp TEXT NOT NULL,
    category_key TEXT NOT NULL,
    category_label TEXT NOT NULL,
    rate_per_account INT NOT NULL,
    quantity_submitted INT NOT NULL,
    quantity_valid INT DEFAULT 0 NOT NULL,
    total_payout INT DEFAULT 0 NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL, -- pending, checking, completed, rejected
    admin_notes TEXT DEFAULT '' NOT NULL,
    raw_gmails TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabel Log Akun Gmail Detail
CREATE TABLE IF NOT EXISTS public.gmail_accounts (
    id BIGSERIAL PRIMARY KEY,
    submission_id TEXT REFERENCES public.submissions(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    pass TEXT NOT NULL,
    recovery TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL -- pending, valid, invalid
);

-- 5. Tabel Penarikan Saldo (Withdrawals)
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id TEXT PRIMARY KEY, -- Format: WD-XXXXXX
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    user_username TEXT NOT NULL,
    amount INT NOT NULL,
    payment_method TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL, -- pending, completed, rejected
    admin_notes TEXT DEFAULT '' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabel Informasi Pengumuman Admin (Announcements)
CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY, -- Format: ANN-XXXXXX
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'info' NOT NULL, -- info, success, warning, danger
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seeding Pengumuman Awal
INSERT INTO public.announcements (id, title, content, type) VALUES
('ANN-001', '📢 UPDATE RATE JURAGAN GMAIL', 'Kenaikan rate untuk Gmail Aged Tua (6+ Bulan) menjadi Rp 4.800 per akun valid. Maksimalkan keuntungan Anda!', 'success'),
('ANN-002', '⚠️ SYARAT PEMULIHAN WAJIB (RECOVERY EMAIL)', 'Harap diperhatikan kembali kepada semua penyetor, wajib mengisi email pemulihan (recovery email) sesuai panduan.', 'warning')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- KEAMANAN / ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmail_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Buat Kebijakan Publik (Agar mudah diakses di sandbox):
CREATE POLICY "Akses publik untuk Rates" ON public.gmail_rates FOR SELECT USING (true);
CREATE POLICY "Akses publik untuk Pengumuman" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Akses kontrol Users" ON public.users FOR ALL USING (true);
CREATE POLICY "Akses kontrol Submissions" ON public.submissions FOR ALL USING (true);
CREATE POLICY "Akses kontrol Withdrawals" ON public.withdrawals FOR ALL USING (true);
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#080d0f] rounded-2xl border border-slate-900 overflow-hidden shadow-xl" id="supabase-guide">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-emerald-950/40 via-slate-950 to-amber-950/20 border-b border-slate-900 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#05080a] border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-100 flex items-center gap-1.5 font-mono uppercase">
              Supabase Backend SQL
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono font-medium">READY</span>
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">Integrasikan dasbor Juragan Gmail dengan database PostgreSQL Supabase Anda secara instan.</p>
          </div>
        </div>
        <a 
          href="https://supabase.com" 
          target="_blank" 
          referrerPolicy="no-referrer"
          className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 border border-emerald-500/20 px-3 py-1.5 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10 transition-all"
        >
          <span>Supabase Console</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Guide Content */}
      <div className="p-6 space-y-6">
        
        {/* Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950/50 border border-slate-900 p-4 rounded-xl space-y-2">
            <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">LANGKAH 1</span>
            <h4 className="text-xs font-bold text-slate-200">Buat Project Supabase</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Daftar gratis di Supabase, buat project baru bernama <strong className="text-slate-200 font-mono">Juragan Gmail</strong>, dan tunggu server provision selesai.
            </p>
          </div>

          <div className="bg-slate-950/50 border border-slate-900 p-4 rounded-xl space-y-2">
            <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">LANGKAH 2</span>
            <h4 className="text-xs font-bold text-slate-200">Jalankan SQL Query</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Klik menu <strong className="text-slate-200 font-mono">SQL Editor</strong> di sidebar Supabase, buat query baru, salin kode SQL di bawah ini, lalu klik <strong className="text-emerald-400 font-bold">Run</strong>.
            </p>
          </div>

          <div className="bg-slate-950/50 border border-slate-900 p-4 rounded-xl space-y-2">
            <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase">LANGKAH 3</span>
            <h4 className="text-xs font-bold text-slate-200">Salin Credentials</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Buka <strong className="text-slate-200 font-mono">Project Settings &gt; API</strong>, salin Project URL dan Anon Key Anda untuk dipasang di file <strong className="text-slate-200 font-mono">.env</strong> aplikasi ini.
            </p>
          </div>
        </div>

        {/* Info Alert */}
        <div className="bg-amber-950/10 border border-amber-900/30 text-amber-300 p-4 rounded-xl flex items-start space-x-3 text-xs leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold uppercase text-[10px] tracking-wider block font-mono text-amber-400">💡 INFORMASI SIMULASI DATABASE AUTOMATIS:</span>
            <p>
              Aplikasi ini dilengkapi dengan <strong className="text-slate-200">Supabase Engine Local Fallback</strong>. Semua aktivitas login, daftar, setor Gmail, saldo, withdraw, pengumuman admin, dan approval admin akan <strong className="text-emerald-400 font-bold">langsung aktif dan disimulasikan secara real-time</strong> menggunakan memori browser (localStorage) bila kredensial Supabase Anda belum dihubungkan. Hal ini mempermudah review dan pengujian langsung di preview AI Studio!
            </p>
          </div>
        </div>

        {/* SQL Code block */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-950 p-3 rounded-t-xl border-t border-x border-slate-900">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              juragan_gmail_schema.sql
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1 rounded-md hover:bg-slate-800 transition-colors text-[11px]"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin SQL</span>
                </>
              )}
            </button>
          </div>
          <div className="bg-[#030607] border border-slate-900 rounded-b-xl overflow-hidden text-slate-300 p-4 font-mono text-[11px] leading-relaxed max-h-96 overflow-y-auto shadow-inner">
            <pre className="whitespace-pre">{sqlSchema}</pre>
          </div>
        </div>

      </div>
    </div>
  );
}
