'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendCrypto, getMerchantProfile } from '../../lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ResolvedUser {
  name: string;
  phone: string;
  walletAddress: string;
  avatar?: string;
}

// ── User lookup: tries backend first, falls back to localStorage registry ─────
// We maintain a "contacts registry" in localStorage under 'talk2pay_contacts'
// Format: { [phone]: { name, phone, walletAddress } }
// When a user registers/logs in, their own data is stored under trust2pay_user.
// This registry can be populated from any past successful sends.
async function lookupUser(query: string): Promise<ResolvedUser | null> {
  const q = query.trim();
  if (!q) return null;

  // Try backend lookup endpoint (optional — gracefully degrades)
  try {
    const token = localStorage.getItem('trust2pay_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/merchant/lookup?query=${encodeURIComponent(q)}`, { headers });
    if (res.ok) {
      const data = await res.json();
      const user = data.data || data; // unwrap nested response
      if (user && (user.name || user.firstName)) {
        // Use the phone number as walletAddress so backend can credit the recipient
        const phone = user.phoneNumber || user.phone || q;
        return {
          name: user.firstName || user.name,
          phone,
          // For registered users, walletAddress = their phone number (backend will look them up)
          walletAddress: phone,
        };
      }
    }
  } catch {
    // backend not available — fall through to localStorage
  }

  // LocalStorage contacts registry
  const contacts = JSON.parse(localStorage.getItem('talk2pay_contacts') || '{}');

  // Search by phone number (exact or partial)
  const phoneNorm = q.replace(/\s+/g, '').replace(/^\+234/, '0');
  for (const key of Object.keys(contacts)) {
    const contact = contacts[key];
    const contactPhone = (contact.phone || '').replace(/\s+/g, '').replace(/^\+234/, '0');
    if (contactPhone === phoneNorm || contactPhone.includes(phoneNorm)) {
      // Use phone as walletAddress for backend lookup
      return { ...contact, walletAddress: contact.phone || q };
    }
  }

  // Check if it looks like a bitcoin/lightning address
  const isBitcoin = q.startsWith('bc1') || q.startsWith('1') || q.startsWith('3') || q.length > 20;
  const isLightning = q.includes('@') || q.toLowerCase().startsWith('lnbc');

  if (isBitcoin || isLightning) {
    // Return the address itself — no name lookup possible
    return {
      name: 'External Wallet',
      phone: '—',
      walletAddress: q,
    };
  }

  return null;
}

// Save a successful send to contacts registry
function saveToContacts(user: ResolvedUser) {
  const contacts = JSON.parse(localStorage.getItem('talk2pay_contacts') || '{}');
  const key = user.phone || user.walletAddress;
  contacts[key] = user;
  localStorage.setItem('talk2pay_contacts', JSON.stringify(contacts));
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SendMoney() {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [amount, setAmount] = useState('');
  const [recipientQuery, setRecipientQuery] = useState('');
  const [resolvedUser, setResolvedUser] = useState<ResolvedUser | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [description, setDescription] = useState('');
  const [cryptoType, setCryptoType] = useState<'bitcoin' | 'lightning' | 'ecash'>('lightning');
  const [balance, setBalance] = useState(0);
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [txResult, setTxResult] = useState<any>(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('trust2pay_user') || '{}');
    setBalance(stored.balance || 0);
  }, []);

  // Debounced lookup as user types
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setResolvedUser(null);
    setLookupError('');

    if (recipientQuery.trim().length < 5) return;

    debounceRef.current = setTimeout(async () => {
      setLookupLoading(true);
      try {
        const user = await lookupUser(recipientQuery);
        if (user) {
          setResolvedUser(user);
        } else {
          setLookupError('User not found. Check the phone number or address.');
        }
      } catch {
        setLookupError('Lookup failed. You can still enter an address manually.');
      } finally {
        setLookupLoading(false);
      }
    }, 600);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [recipientQuery]);

  const numAmount = Number(amount) || 0;
  const recipientAddress = resolvedUser?.walletAddress || recipientQuery.trim();
  const canSend = numAmount > 0 && numAmount <= balance && recipientAddress.length > 0;

  async function handleSend() {
    setError('');
    setLoading(true);
    try {
      const res: any = await sendCrypto({
        amount: numAmount,
        recipientAddress,
        cryptoType,
        description: description.trim() || undefined,
      });

      // Refresh balance from backend (which performed the actual debit)
      try {
        const profile = await getMerchantProfile();
        const newBalance = Number(profile.walletBalance) || 0;
        const stored = JSON.parse(localStorage.getItem('trust2pay_user') || '{}');
        localStorage.setItem('trust2pay_user', JSON.stringify({ ...stored, ...profile, balance: newBalance }));
        setBalance(newBalance);
      } catch {
        // Fallback: deduct locally if profile fetch fails
        const stored = JSON.parse(localStorage.getItem('trust2pay_user') || '{}');
        const newBalance = (stored.balance || 0) - numAmount;
        localStorage.setItem('trust2pay_user', JSON.stringify({ ...stored, balance: newBalance }));
        setBalance(newBalance);
      }

      // Save recipient to contacts for future lookups
      if (resolvedUser) saveToContacts(resolvedUser);

      setTxResult(res);
      setStep('success');
    } catch (e: any) {
      setError(e.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  }

  const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (step === 'success' && txResult) {
    return (
      <div className="min-h-screen bg-[#f5f7f5] flex flex-col">
        <div className="bg-[#2D7A4F] px-4 pt-10 pb-6">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <Link href="/dashboard" className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <h1 className="text-white font-bold text-xl">Payment Sent</h1>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-5 py-10">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#2D7A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-slate-800 font-bold text-2xl mb-2">₦{numAmount.toLocaleString()} Sent!</h2>
          {resolvedUser && (
            <p className="text-slate-600 text-sm font-medium mb-1">To: {resolvedUser.name}</p>
          )}
          <p className="text-slate-500 text-sm mb-1 font-mono text-xs">{recipientAddress.slice(0, 24)}...</p>
          {txResult.transactionId && (
            <p className="text-slate-400 text-xs mb-8">Ref: {txResult.transactionId.slice(0, 16)}...</p>
          )}

          <div className="w-full max-w-sm space-y-3">
            <Link href="/dashboard"
              className="block w-full py-4 rounded-2xl text-white font-bold text-center transition-all hover:opacity-90"
              style={{ background: '#2D7A4F' }}>
              Back to Dashboard
            </Link>
            <Link href="/dashboard/history"
              className="block w-full py-4 rounded-2xl text-[#2D7A4F] font-bold text-center bg-green-50 transition-all hover:bg-green-100">
              View Transaction History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Form ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f7f5]">
      {/* Header */}
      <div className="bg-[#2D7A4F] px-4 pt-10 pb-6">
        <div className="flex items-center gap-3 max-w-lg mx-auto lg:max-w-2xl">
          <Link href="/dashboard"
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div>
            <h1 className="text-white font-bold text-xl">Send Money</h1>
            <p className="text-white/70 text-sm">Balance: ₦{balance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto lg:max-w-2xl space-y-4">

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
        )}

        {step === 'form' && (
          <>
            {/* Amount */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Amount (₦)</p>
              <div className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                <span className="text-slate-600 font-bold text-lg">₦</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="bg-transparent text-slate-800 text-2xl font-bold outline-none flex-1 placeholder-slate-200"
                />
              </div>

              {/* Quick amounts */}
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map(q => (
                  <button key={q} onClick={() => setAmount(String(q))}
                    className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: amount === String(q) ? '#2D7A4F' : 'rgba(45,122,79,0.08)',
                      color: amount === String(q) ? 'white' : '#2D7A4F',
                    }}>
                    ₦{q.toLocaleString()}
                  </button>
                ))}
              </div>

              {numAmount > balance && (
                <p className="text-red-500 text-xs mt-2">Insufficient balance. You have ₦{balance.toLocaleString()}</p>
              )}
            </div>
            {/* Recipient Search */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Send To</p>

              <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-100 mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="#94a3b8" strokeWidth="2" />
                  <path d="M21 21l-4.35-4.35" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  value={recipientQuery}
                  onChange={e => setRecipientQuery(e.target.value)}
                  placeholder="Phone number or Bitcoin/Lightning address"
                  className="bg-transparent text-slate-800 text-sm font-medium outline-none flex-1 placeholder-slate-300"
                />
                {lookupLoading && (
                  <div className="w-4 h-4 border-2 border-[#2D7A4F] border-t-transparent rounded-full animate-spin shrink-0" />
                )}
              </div>

              {/* Hint pills */}
              <div className="flex gap-2 mb-3">
                <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-400 font-medium">e.g. 08012345678</span>
                <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-400 font-medium">e.g. bc1q... or ln@...</span>
              </div>

              {/* Lookup error */}
              {lookupError && !resolvedUser && (
                <p className="text-amber-600 text-xs bg-amber-50 px-3 py-2 rounded-lg mb-2">{lookupError}</p>
              )}

              {/* Resolved user card */}
              {resolvedUser && (
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 mb-1"
                  style={{ background: 'rgba(45,122,79,0.04)', borderColor: 'rgba(45,122,79,0.25)' }}>
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-base shrink-0"
                    style={{ background: '#2D7A4F' }}>
                    {resolvedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-bold text-sm">{resolvedUser.name}</p>
                    <p className="text-slate-500 text-xs">{resolvedUser.phone}</p>
                    <p className="text-slate-400 text-[10px] font-mono truncate">{resolvedUser.walletAddress}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#2D7A4F] flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Note */}
              <div className="mt-4">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Note (Optional)</p>
                <input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Rent payment, groceries..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-sm outline-none placeholder-slate-300"
                />
              </div>
            </div>

            

          

            <button
              onClick={() => setStep('confirm')}
              disabled={!canSend}
              className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
              style={{ background: '#2D7A4F' }}>
              Review Payment →
            </button>
          </>
        )}

        {/* ── Confirm Step ───────────────────────────────────────────────────── */}
        {step === 'confirm' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-slate-800 font-bold text-lg">Confirm Payment</h2>

            {/* Recipient preview in confirm */}
            {resolvedUser && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                  style={{ background: '#2D7A4F' }}>
                  {resolvedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-slate-800 font-semibold text-sm">{resolvedUser.name}</p>
                  <p className="text-slate-400 text-xs">{resolvedUser.phone}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between py-3 border-b border-slate-50">
                <span className="text-slate-500 text-sm">Amount</span>
                <span className="text-slate-800 font-bold">₦{numAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-50">
                <span className="text-slate-500 text-sm">To Address</span>
                <span className="text-slate-700 text-xs font-mono text-right max-w-[180px] truncate">{recipientAddress}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-50">
                <span className="text-slate-500 text-sm">Network</span>
                <span className="text-slate-700 text-sm capitalize">{cryptoType}</span>
              </div>
              {description && (
                <div className="flex justify-between py-3 border-b border-slate-50">
                  <span className="text-slate-500 text-sm">Note</span>
                  <span className="text-slate-700 text-sm">{description}</span>
                </div>
              )}
              <div className="flex justify-between py-3">
                <span className="text-slate-500 text-sm">Balance after</span>
                <span className="text-[#2D7A4F] font-bold">₦{(balance - numAmount).toLocaleString()}</span>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => { setStep('form'); setError(''); }}
                className="flex-1 py-3.5 rounded-2xl text-slate-600 font-semibold bg-slate-50 hover:bg-slate-100 transition-all">
                ← Back
              </button>
              <button
                onClick={handleSend}
                disabled={loading}
                className="flex-1 py-3.5 rounded-2xl text-white font-bold transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: '#2D7A4F' }}>
                {loading ? 'Sending...' : 'Send Now'}
              </button>
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}