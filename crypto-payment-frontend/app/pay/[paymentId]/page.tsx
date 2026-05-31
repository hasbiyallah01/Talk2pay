'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { sendCrypto, getTransactionHistory, getMerchantProfile } from '../../lib/api';

interface PaymentData {
  id: string;
  amount: number;
  description?: string;
  qrCodeData?: string;
  paymentLink?: string;
  externalPaymentLink?: string;
  receiver: {
    name: string;
    phone: string;
    walletAddress: string;
  };
  createdAt: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export default function PayPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params?.paymentId as string;

  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [senderBalance, setSenderBalance] = useState(0);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [step, setStep] = useState<'login-prompt' | 'confirm' | 'success' | 'cancelled'>('login-prompt');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check login
    const token = localStorage.getItem('trust2pay_token');
    const user = localStorage.getItem('trust2pay_user');
    if (token && user) {
      setIsLoggedIn(true);
      const u = JSON.parse(user);
      setSenderBalance(u.balance || 0);
    }

    // Load payment data from localStorage payments registry
    const registry = JSON.parse(localStorage.getItem('trust2pay_payments') || '{}');
    const found = registry[paymentId];

    if (found) {
      setPayment(found);
      setStep(token ? 'confirm' : 'login-prompt');
    } else {
      // Also check last_payment in case it's the most recent one
      const last = localStorage.getItem('trust2pay_last_payment');
      if (last) {
        const p = JSON.parse(last);
        if (p.id === paymentId) {
          setPayment(p);
          setStep(token ? 'confirm' : 'login-prompt');
        } else {
          setNotFound(true);
        }
      } else {
        setNotFound(true);
      }
    }

    setLoading(false);
  }, [paymentId]);

  // After login redirect, re-check state
  useEffect(() => {
    if (!isLoggedIn) return;
    if (payment && step === 'login-prompt') {
      setStep('confirm');
    }
  }, [isLoggedIn, payment]);

  const handleConfirmPay = async () => {
    if (!payment) return;
    setError('');
    setConfirmLoading(true);

    try {
      const res = await sendCrypto({
        amount: payment.amount,
        recipientAddress: payment.receiver.walletAddress,
        cryptoType: 'lightning',
        description: payment.description || `Payment to ${payment.receiver.name}`,
      });

      // Refresh balance from backend (which performed the actual debit)
      try {
        const profile = await getMerchantProfile();
        const newBalance = Number(profile.walletBalance) || 0;
        const stored = JSON.parse(localStorage.getItem('trust2pay_user') || '{}');
        localStorage.setItem('trust2pay_user', JSON.stringify({ ...stored, ...profile, balance: newBalance }));
        setSenderBalance(newBalance);
      } catch {
        // Fallback: deduct locally if profile fetch fails
        const stored = JSON.parse(localStorage.getItem('trust2pay_user') || '{}');
        const newBalance = (stored.balance || 0) - payment.amount;
        localStorage.setItem('trust2pay_user', JSON.stringify({ ...stored, balance: newBalance }));
        setSenderBalance(newBalance);
      }

      // Mark payment as completed in registry
      const registry = JSON.parse(localStorage.getItem('trust2pay_payments') || '{}');
      if (registry[paymentId]) {
        registry[paymentId].status = 'completed';
        localStorage.setItem('trust2pay_payments', JSON.stringify(registry));
      }

      setStep('success');
    } catch (e: any) {
      setError(e.message || 'Payment failed. Please try again.');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    // Mark as cancelled
    const registry = JSON.parse(localStorage.getItem('trust2pay_payments') || '{}');
    if (registry[paymentId]) {
      registry[paymentId].status = 'cancelled';
      localStorage.setItem('trust2pay_payments', JSON.stringify(registry));
    }
    setStep('cancelled');
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#f5f7f5] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-[#2D7A4F] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ── Not Found ──────────────────────────────────────────────────────────────
  if (notFound) return (
    <div className="min-h-screen bg-[#f5f7f5] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#94a3b8" strokeWidth="2" />
          <path d="M12 8v4M12 16h.01" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="text-slate-800 font-bold text-xl mb-2">Payment Not Found</h1>
      <p className="text-slate-400 text-sm mb-6">This payment link may have expired or is invalid.</p>
      <Link href="/dashboard" className="px-6 py-3 rounded-2xl text-white font-bold text-sm" style={{ background: '#2D7A4F' }}>
        Go to Dashboard
      </Link>
    </div>
  );

  // ── Login Prompt ───────────────────────────────────────────────────────────
  if (step === 'login-prompt') return (
    <div className="min-h-screen bg-[#f5f7f5] flex flex-col">
      {/* Header */}
      <div className="bg-[#2D7A4F] px-4 pt-10 pb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <img src="/logo.svg" alt="Talk2Pay" className="w-8 h-8" onError={e => { (e.target as any).style.display = 'none'; }} />
            <span className="text-white font-bold text-lg">Talk2Pay</span>
          </div>
          <p className="text-white/70 text-sm">Payment Request</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 max-w-lg mx-auto w-full">
        {/* Preview of who's requesting */}
        <div className="w-full bg-white rounded-2xl shadow-sm p-6 mb-6">
          <p className="text-slate-400 text-xs text-center mb-4 uppercase tracking-wider font-semibold">Payment Request From</p>

          <div className="flex flex-col items-center mb-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-2xl mb-3"
              style={{ background: '#2D7A4F' }}>
              {payment?.receiver.name.charAt(0).toUpperCase() || '?'}
            </div>
            <p className="text-slate-800 font-bold text-lg">{payment?.receiver.name}</p>
            <p className="text-slate-400 text-sm">{payment?.receiver.phone}</p>
            <p className="text-slate-300 text-xs font-mono mt-1 truncate max-w-[200px]">{payment?.receiver.walletAddress}</p>
          </div>

          {payment?.amount ? (
            <div className="py-4 rounded-xl text-center mb-2" style={{ background: 'rgba(45,122,79,0.07)' }}>
              <p className="text-slate-500 text-xs mb-1">Requesting</p>
              <p className="text-3xl font-bold" style={{ color: '#2D7A4F' }}>₦{payment.amount.toLocaleString()}</p>
              {payment.description && <p className="text-slate-400 text-xs mt-1">{payment.description}</p>}
            </div>
          ) : null}
        </div>

        <p className="text-slate-500 text-sm text-center mb-6">
          Log in to your Talk2Pay account to complete this payment.
        </p>

        <div className="w-full space-y-3">
          <Link
            href={`/auth/login?redirect=/pay/${paymentId}`}
            className="block w-full py-4 rounded-2xl text-white font-bold text-center"
            style={{ background: '#2D7A4F' }}>
            Log In to Pay
          </Link>
          <Link
            href={`/auth/signup?redirect=/pay/${paymentId}`}
            className="block w-full py-4 rounded-2xl text-[#2D7A4F] font-bold text-center bg-green-50">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );

  // ── Success ────────────────────────────────────────────────────────────────
  if (step === 'success') return (
    <div className="min-h-screen bg-[#f5f7f5] flex flex-col items-center justify-center px-6">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17l-5-5" stroke="#2D7A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="text-slate-800 font-bold text-2xl mb-2">Payment Sent!</h2>
      <p className="text-slate-500 text-sm mb-1 text-center">
        You sent <span className="font-bold text-slate-700">₦{payment?.amount.toLocaleString()}</span> to <span className="font-bold text-slate-700">{payment?.receiver.name}</span>
      </p>
      <p className="text-slate-400 text-xs mb-8 text-center">The recipient will receive their payment shortly.</p>

      <div className="w-full max-w-sm space-y-3">
        <Link href="/dashboard"
          className="block w-full py-4 rounded-2xl text-white font-bold text-center"
          style={{ background: '#2D7A4F' }}>
          Back to Dashboard
        </Link>
        <Link href="/dashboard/history"
          className="block w-full py-4 rounded-2xl text-[#2D7A4F] font-bold text-center bg-green-50">
          View Transaction History
        </Link>
      </div>
    </div>
  );

  // ── Cancelled ──────────────────────────────────────────────────────────────
  if (step === 'cancelled') return (
    <div className="min-h-screen bg-[#f5f7f5] flex flex-col items-center justify-center px-6">
      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="text-slate-800 font-bold text-2xl mb-2">Payment Cancelled</h2>
      <p className="text-slate-400 text-sm mb-8 text-center">You cancelled this payment request.</p>
      <Link href="/dashboard"
        className="block w-full max-w-sm py-4 rounded-2xl text-white font-bold text-center"
        style={{ background: '#2D7A4F' }}>
        Back to Dashboard
      </Link>
    </div>
  );

  // ── Confirm Screen (main) ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f7f5] flex flex-col">
      {/* Header */}
      <div className="bg-[#2D7A4F] px-4 pt-10 pb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <img src="/logo.svg" alt="Talk2Pay" className="w-8 h-8" onError={e => { (e.target as any).style.display = 'none'; }} />
            <span className="text-white font-bold text-lg">Talk2Pay</span>
          </div>
          <p className="text-white/70 text-sm">Confirm Payment</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-4">

        {/* Receiver Info Card — the "pop-up" equivalent */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-slate-50">
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold text-center">Paying To</p>
          </div>

          <div className="flex flex-col items-center px-5 py-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-white text-3xl mb-3 shadow-md"
              style={{ background: '#2D7A4F' }}>
              {payment?.receiver.name.charAt(0).toUpperCase() || '?'}
            </div>
            <p className="text-slate-800 font-bold text-xl">{payment?.receiver.name}</p>
            <p className="text-slate-500 text-sm mt-0.5">{payment?.receiver.phone}</p>
            <p className="text-slate-300 text-xs font-mono mt-2 text-center px-4 break-all">
              {payment?.receiver.walletAddress}
            </p>
          </div>

          {/* Amount highlight */}
          {payment?.amount ? (
            <div className="mx-5 mb-5 py-4 rounded-xl text-center" style={{ background: 'rgba(45,122,79,0.07)', border: '1px solid rgba(45,122,79,0.15)' }}>
              <p className="text-slate-400 text-xs mb-1">Amount Requested</p>
              <p className="text-4xl font-bold" style={{ color: '#2D7A4F' }}>₦{payment.amount.toLocaleString()}</p>
              {payment.description && (
                <p className="text-slate-400 text-xs mt-1">{payment.description}</p>
              )}
            </div>
          ) : null}
        </div>

        {/* Sender balance info */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-sm">Your Balance</span>
            <span className="font-bold text-slate-800">₦{senderBalance.toLocaleString()}</span>
          </div>
          {payment?.amount && senderBalance < payment.amount && (
            <p className="text-red-500 text-xs mt-2">⚠ Insufficient balance to complete this payment.</p>
          )}
          {payment?.amount && senderBalance >= payment.amount && (
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
              <span className="text-slate-400 text-xs">Balance after payment</span>
              <span className="text-[#2D7A4F] font-bold text-sm">₦{(senderBalance - (payment?.amount || 0)).toLocaleString()}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={confirmLoading}
            className="flex-1 py-4 rounded-2xl font-bold text-slate-600 bg-white shadow-sm hover:bg-slate-50 transition-all disabled:opacity-40">
            Cancel
          </button>
          <button
            onClick={handleConfirmPay}
            disabled={confirmLoading || !payment?.amount || senderBalance < (payment?.amount || 0)}
            className="flex-1 py-4 rounded-2xl text-white font-bold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: '#2D7A4F' }}>
            {confirmLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </span>
            ) : `Confirm Pay ₦${payment?.amount?.toLocaleString() || ''}`}
          </button>
        </div>

        <p className="text-slate-400 text-xs text-center pb-4">
          By confirming, you authorize Talk2Pay to send this payment from your account.
        </p>
      </div>
    </div>
  );
}