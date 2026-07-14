import { GmailRate, AppSettings, Transaction, User, Withdrawal, Announcement } from './types';

export const DEFAULT_RATES: GmailRate[] = [
  {
    key: 'fresh',
    label: 'Gmail Fresh (Baru Dibuat)',
    price: 1800,
    description: 'Akun baru dibuat dengan IP Indonesia bersih, wajib verifikasi email pemulihan.',
    requirements: [
      'Umur 0-7 hari',
      'Sudah diisi Email Pemulihan (Recovery)',
      'Tanpa Verifikasi 2 Langkah (2FA)',
      'Hapus nomor HP setelah verifikasi',
      'Bahasa akun diset ke English'
    ]
  },
  {
    key: 'aged_1m',
    label: 'Gmail Aged (1 - 3 Bulan)',
    price: 3200,
    description: 'Akun berumur 1 hingga 3 bulan, memiliki riwayat aktivitas ringan lebih disukai.',
    requirements: [
      'Umur 30-90 hari',
      'Wajib Email Pemulihan aktif',
      'Tidak ada riwayat spam/banned',
      'Bisa login langsung tanpa OTP HP',
      'IP pembuatan Indonesia'
    ]
  },
  {
    key: 'aged_6m',
    label: 'Gmail Aged Tua (6+ Bulan)',
    price: 4800,
    description: 'Akun berumur lebih dari 6 bulan, sangat stabil dan aman untuk pendaftaran.',
    requirements: [
      'Umur 180+ hari',
      'Email pemulihan aktif dan terhubung',
      'Hapus nomor HP verifikasi',
      'Bebas dari spam/banned',
      'Sandi aman dan permanen'
    ]
  },
  {
    key: 'play_console',
    label: 'Gmail Google Play Console',
    price: 450000,
    description: 'Akun Gmail yang sudah terdaftar developer Google Play Console aktif dan bersih.',
    requirements: [
      'Akun Developer Google Play Console aktif',
      'Sertakan email pemulihan & detail pendaftaran',
      'Tidak ada pelanggaran aplikasi/banned',
      'Akun terverifikasi identitas lengkap'
    ]
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  adminPin: '123456',
  whatsappAdmin: '6281234567890',
  recommendedRecoveryDomain: 'juragangmail.com'
};

export const MOCK_USERS: User[] = [
  {
    id: 'USR-839201',
    email: 'budi@gmail.com',
    username: 'budisantoso',
    whatsapp: '6285711223344',
    passwordHash: 'budi123', // stored simple for local auth
    balance: 75000,
    bankName: 'DANA',
    bankNumber: '085711223344',
    bankHolderName: 'Budi Santoso',
    createdAt: '2026-06-01T08:00:00.000Z'
  },
  {
    id: 'USR-192837',
    email: 'siti@gmail.com',
    username: 'sitirahma',
    whatsapp: '6281299887766',
    passwordHash: 'siti123',
    balance: 14800,
    bankName: 'BCA',
    bankNumber: '8012345678',
    bankHolderName: 'Siti Rahma',
    createdAt: '2026-06-10T11:30:00.000Z'
  },
  {
    id: 'USR-482910',
    email: 'agus@gmail.com',
    username: 'agussetiawan',
    whatsapp: '6289944332211',
    passwordHash: 'agus123',
    balance: 154000,
    bankName: 'GOPAY',
    bankNumber: '089944332211',
    bankHolderName: 'Agus Setiawan',
    createdAt: '2026-07-01T14:20:00.000Z'
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'JRG-260714-381',
    userId: 'USR-839201',
    timestamp: '2026-07-14T01:30:00.000Z',
    whatsapp: '6285711223344',
    paymentMethod: 'DANA',
    paymentAccountName: 'Budi Santoso',
    paymentAccountNumber: '085711223344',
    rawGmails: 'budisantoso99@gmail.com|rahasia123|rec_budi@juragangmail.com\nbudisantoso100@gmail.com|rahasia123|rec_budi@juragangmail.com\nbudisantoso101@gmail.com|rahasia123|rec_budi@juragangmail.com',
    gmails: [
      { email: 'budisantoso99@gmail.com', pass: 'rahasia123', recovery: 'rec_budi@juragangmail.com', status: 'valid' },
      { email: 'budisantoso100@gmail.com', pass: 'rahasia123', recovery: 'rec_budi@juragangmail.com', status: 'valid' },
      { email: 'budisantoso101@gmail.com', pass: 'rahasia123', recovery: 'rec_budi@juragangmail.com', status: 'valid' }
    ],
    categoryKey: 'fresh',
    categoryLabel: 'Gmail Fresh (Baru Dibuat)',
    ratePerAccount: 1800,
    quantitySubmitted: 3,
    quantityValid: 3,
    totalPayout: 5400,
    status: 'completed',
    adminNotes: 'Semua akun valid, pembayaran sukses ditransfer ke DANA Budi Santoso.',
    updatedAt: '2026-07-14T02:15:00.000Z'
  },
  {
    id: 'JRG-260713-712',
    userId: 'USR-192837',
    timestamp: '2026-07-13T10:15:00.000Z',
    whatsapp: '6281299887766',
    paymentMethod: 'BCA',
    paymentAccountName: 'Siti Rahma',
    paymentAccountNumber: '8012345678',
    rawGmails: 'sitiair1@gmail.com|pwSiti123|siti_rec@juragangmail.com\nsitiair2@gmail.com|pwSiti123|siti_rec@juragangmail.com\nsitiair3@gmail.com|pwSiti123|siti_rec@juragangmail.com\nsitiair4@gmail.com|pwSiti123|siti_rec@juragangmail.com\nsitiair5@gmail.com|pwSiti123|siti_rec@juragangmail.com',
    gmails: [
      { email: 'sitiair1@gmail.com', pass: 'pwSiti123', recovery: 'siti_rec@juragangmail.com', status: 'valid' },
      { email: 'sitiair2@gmail.com', pass: 'pwSiti123', recovery: 'siti_rec@juragangmail.com', status: 'valid' },
      { email: 'sitiair3@gmail.com', pass: 'pwSiti123', recovery: 'siti_rec@juragangmail.com', status: 'valid' },
      { email: 'sitiair4@gmail.com', pass: 'pwSiti123', recovery: 'siti_rec@juragangmail.com', status: 'invalid' },
      { email: 'sitiair5@gmail.com', pass: 'pwSiti123', recovery: 'siti_rec@juragangmail.com', status: 'valid' }
    ],
    categoryKey: 'aged_1m',
    categoryLabel: 'Gmail Aged (1 - 3 Bulan)',
    ratePerAccount: 3200,
    quantitySubmitted: 5,
    quantityValid: 4,
    totalPayout: 12800,
    status: 'completed',
    adminNotes: 'Akun sitiair4 sandi salah/minta OTP nomor HP. Sisanya 4 akun valid. Pembayaran ditransfer ke BCA.',
    updatedAt: '2026-07-13T11:00:00.000Z'
  },
  {
    id: 'JRG-260714-994',
    userId: 'USR-482910',
    timestamp: '2026-07-14T06:00:00.000Z',
    whatsapp: '6289944332211',
    paymentMethod: 'GOPAY',
    paymentAccountName: 'Agus Setiawan',
    paymentAccountNumber: '089944332211',
    rawGmails: 'agusold1@gmail.com|aguspass12|rec_agus@juragangmail.com\nagusold2@gmail.com|aguspass12|rec_agus@juragangmail.com',
    gmails: [
      { email: 'agusold1@gmail.com', pass: 'aguspass12', recovery: 'rec_agus@juragangmail.com' },
      { email: 'agusold2@gmail.com', pass: 'aguspass12', recovery: 'rec_agus@juragangmail.com' }
    ],
    categoryKey: 'aged_6m',
    categoryLabel: 'Gmail Aged Tua (6+ Bulan)',
    ratePerAccount: 4800,
    quantitySubmitted: 2,
    quantityValid: 0,
    totalPayout: 0,
    status: 'checking',
    adminNotes: 'Sedang diverifikasi oleh tim checkers.',
    updatedAt: '2026-07-14T06:05:00.000Z'
  },
  {
    id: 'JRG-260712-402',
    timestamp: '2026-07-12T04:20:00.000Z',
    whatsapp: '6287877665544',
    paymentMethod: 'OVO',
    paymentAccountName: 'Dewi Lestari',
    paymentAccountNumber: '087877665544',
    rawGmails: 'dewigame1@gmail.com|dewipass|rec_dewi@juragangmail.com',
    gmails: [
      { email: 'dewigame1@gmail.com', pass: 'dewipass', recovery: 'rec_dewi@juragangmail.com', status: 'invalid' }
    ],
    categoryKey: 'fresh',
    categoryLabel: 'Gmail Fresh (Baru Dibuat)',
    ratePerAccount: 1800,
    quantitySubmitted: 1,
    quantityValid: 0,
    totalPayout: 0,
    status: 'rejected',
    adminNotes: 'Akun ditolak karena meminta verifikasi OTP SMS saat login. Mohon nonaktifkan nomor HP.',
    updatedAt: '2026-07-12T05:10:00.000Z'
  }
];

export const MOCK_WITHDRAWALS: Withdrawal[] = [
  {
    id: 'WD-260714-001',
    userId: 'USR-839201',
    userUsername: 'budisantoso',
    amount: 50000,
    paymentMethod: 'DANA',
    accountNumber: '085711223344',
    accountName: 'Budi Santoso',
    status: 'completed',
    adminNotes: 'Pencairan sukses ditransfer ke nomor DANA.',
    createdAt: '2026-07-14T03:00:00.000Z',
    updatedAt: '2026-07-14T03:45:00.000Z'
  },
  {
    id: 'WD-260714-002',
    userId: 'USR-482910',
    userUsername: 'agussetiawan',
    amount: 100000,
    paymentMethod: 'GOPAY',
    accountNumber: '089944332211',
    accountName: 'Agus Setiawan',
    status: 'pending',
    adminNotes: 'Sedang diproses oleh bendahara Juragan.',
    createdAt: '2026-07-14T06:30:00.000Z',
    updatedAt: '2026-07-14T06:30:00.000Z'
  }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ANN-001',
    title: '📢 UPDATE RATE JURAGAN GMAIL MARET 2026',
    content: 'Kabar gembira! Menjelang pertengahan tahun, kami menaikkan rate untuk Gmail Aged Tua (6+ Bulan) menjadi Rp 4.800 per akun valid. Dan Gmail Aged biasa menjadi Rp 3.200 per akun. Setor sekarang juga dan maksimalkan keuntungan Anda!',
    type: 'success',
    createdAt: '2026-07-10T12:00:00.000Z'
  },
  {
    id: 'ANN-002',
    title: '⚠️ SYARAT PEMULIHAN WAJIB (RECOVERY EMAIL)',
    content: 'Harap diperhatikan kembali kepada semua penyetor, wajib mengisi email pemulihan (recovery email) sesuai dengan domain rekomendasi admin atau email pemulihan aktif yang telah ditentukan di tab Panduan. Akun tanpa email pemulihan akan langsung kami TOLAK saat verifikasi.',
    type: 'warning',
    createdAt: '2026-07-12T09:15:00.000Z'
  }
];
