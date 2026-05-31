// Central API utility — all backend endpoints wired here
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('trust2pay_token');
}

async function req<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`);
  return data as T;
}

// ── Auth ──────────────────────────────────────────────
export async function register(phoneNumber: string, firstName: string) {
  return req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber, firstName }),
  }, false);
}

export async function sendOtp(phoneNumber: string) {
  return req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
  }, false);
}

export async function verifyOtp(phoneNumber: string, otp: string): Promise<{
  success: boolean;
  data: { token: string; merchant: { id: string; phoneNumber: string; firstName: string } };
}> {
  return req('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber, otp }),
  }, false);
}

// Dev-only: fetch latest OTP (backend exposes this for development)
export async function devGetOtp(phoneNumber: string): Promise<{ otp: string | null }> {
  const res = await fetch(`${BASE}/auth/dev-latest-otp?phoneNumber=${encodeURIComponent(phoneNumber)}`);
  return res.json();
}

// ── Merchant ──────────────────────────────────────────
export async function getMerchantProfile() {
  return req<{
    id: string; phoneNumber: string; firstName: string;
    walletBalance: number; cryptoPreferences: string[];
    isPhoneVerified: boolean; createdAt: string;
  }>('/merchant/profile');
}

export async function getDashboard() {
  return req<{
    totalPayments: number;
    totalAmount: number;
    recentTransactions: any[];
    totalTransactions: number;
  }>('/merchant/dashboard');
}

// ── Payment ───────────────────────────────────────────
export async function createPayment(amount: number, description?: string) {
  return req<{ id: string; merchantId: string; amount: number; description?: string; status: string; createdAt: string }>(
    '/payment/create',
    { method: 'POST', body: JSON.stringify({ amount, description }) },
  );
}

export async function sendCrypto(body: {
  amount: number;
  recipientAddress: string;
  cryptoType?: string;
  description?: string;
}) {
  return req('/payment/send', { method: 'POST', body: JSON.stringify(body) });
}

export async function getPayment(id: string) {
  return req<{ id: string; amount: number; description?: string; status: string; createdAt: string }>(
    `/payment/${id}`,
    {},
    false,
  );
}

export async function getPaymentQr(id: string) {
  return req<{ paymentId: string; qrCodeData: string; paymentLink: string }>(
    `/payment/${id}/qr`,
    {},
    false,
  );
}

// ── Transaction ───────────────────────────────────────
export async function getTransactionHistory(params?: {
  startDate?: string; endDate?: string; page?: number; limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.startDate) qs.set('startDate', params.startDate);
  if (params?.endDate) qs.set('endDate', params.endDate);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  return req<{ transactions: any[]; total: number; page: number; limit: number }>(
    `/transaction/history?${qs}`,
  );
}

export async function completePayment(paymentId: string, cryptoType = 'bitcoin', shouldFail = false) {
  return req(`/transaction/${paymentId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ cryptoType, shouldFail }),
  });
}

// ── Wallet ────────────────────────────────────────────
export async function getWalletBalance() {
  return req<{ balance: number; message: string }>('/wallet/balance');
}

export async function fundWallet(amount: number, method: string, metadata?: any) {
  return req<{ transactionId: string; status: string }>('/wallet/fund', {
    method: 'POST',
    body: JSON.stringify({ amount, method, metadata }),
  });
}

export async function completeFunding(transactionId: string, amount: number) {
  return req('/wallet/fund/complete', {
    method: 'POST',
    body: JSON.stringify({ transactionId, amount }),
  });
}

export async function getFundingMethods() {
  return req<{ methods: Array<{ id: string; name: string; description: string; processingTime: string; fees: string }> }>(
    '/wallet/funding-methods',
  );
}