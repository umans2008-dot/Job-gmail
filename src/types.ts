export interface GmailAccount {
  email: string;
  pass: string;
  recovery: string;
  status?: 'pending' | 'valid' | 'invalid';
}

export interface Transaction {
  id: string; // JRG-XXXXXXXX
  userId?: string; // linked user id
  timestamp: string;
  whatsapp: string;
  paymentMethod: string;
  paymentAccountName: string;
  paymentAccountNumber: string;
  rawGmails: string;
  gmails: GmailAccount[];
  categoryKey: string; // fresh, aged_3m, etc.
  categoryLabel: string;
  ratePerAccount: number;
  quantitySubmitted: number;
  quantityValid: number; // updated by admin
  totalPayout: number; // quantityValid * ratePerAccount
  status: 'pending' | 'checking' | 'completed' | 'rejected';
  adminNotes: string;
  updatedAt?: string;
}

export interface GmailRate {
  key: string;
  label: string;
  price: number;
  description: string;
  requirements: string[];
}

export interface AppSettings {
  adminPin: string;
  whatsappAdmin: string; // e.g. 628123456789 (Admin 1)
  whatsappAdmin2: string; // e.g. 6285716766584 (Admin 2)
  recommendedRecoveryDomain: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  whatsapp: string;
  passwordHash: string; // stored as simple hash or string for client auth simulation
  balance: number; // current withdrawable balance in IDR
  bankName: string;
  bankNumber: string;
  bankHolderName: string;
  createdAt: string;
}

export interface Withdrawal {
  id: string; // WD-XXXXXXXX
  userId: string;
  userUsername: string;
  amount: number;
  paymentMethod: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'completed' | 'rejected';
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  createdAt: string;
}
