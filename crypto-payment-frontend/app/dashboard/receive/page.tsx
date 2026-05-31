'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createPayment, getPaymentQr } from '../../lib/api';

export default function ReceiveMoney() {
  const [requestAmount, setRequestAmount] = useState('');
  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);

  // Load any existing payment from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('trust2pay_last_payment');
    if (stored) {
      try {
        const p = JSON.parse(stored);
        setPaymentId(p.id || '');
        setQrCodeData(p.qrCodeData || '');
        setPaymentLink(p.paymentLink || '');
        if (p.amount) setRequestAmount(String(p.amount));
        setGenerated(true);
      } catch {}
    }
  }, []);

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const amt = Number(requestAmount) || 0;
      const payment = await createPayment(amt, description.trim() || undefined);

      // Fetch QR
      const qr = await getPaymentQr(payment.id);

      setPaymentId(payment.id);
      setQrCodeData(qr.qrCodeData);
      setPaymentLink(qr.paymentLink);
      setGenerated(true);

      // Get receiver profile from localStorage
      const user = JSON.parse(localStorage.getItem('trust2pay_user') || '{}');

      // Build an internal payment link pointing to our /pay/[id] page
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const internalLink = `${origin}/pay/${payment.id}`;

      // Persist to localStorage — including receiver info so /pay page can read it
      const paymentData = {
        id: payment.id,
        amount: amt,
        description: description.trim() || '',
        qrCodeData: qr.qrCodeData,
        paymentLink: internalLink,
        externalPaymentLink: qr.paymentLink,
        receiver: {
          name: user.firstName || user.name || 'User',
          phone: user.phoneNumber || user.phone || '',
          walletAddress: user.walletAddress || user.bitcoinAddress || user.lightningAddress || payment.id,
        },
        createdAt: new Date().toISOString(),
        status: 'pending',
      };

      localStorage.setItem('trust2pay_last_payment', JSON.stringify(paymentData));

      // Also store in a payments registry keyed by payment ID
      const registry = JSON.parse(localStorage.getItem('trust2pay_payments') || '{}');
      registry[payment.id] = paymentData;
      localStorage.setItem('trust2pay_payments', JSON.stringify(registry));

      setPaymentLink(internalLink);
    } catch (e: any) {
      setError(e.message || 'Failed to create payment request');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(paymentLink || paymentId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareLink = () => {
    const text = requestAmount
      ? `Please send me ₦${Number(requestAmount).toLocaleString()} via Talk2Pay.\nPayment link: ${paymentLink}`
      : `Send money to me via Talk2Pay.\nPayment link: ${paymentLink}`;
    if (navigator.share) {
      navigator.share({ title: 'Talk2Pay Payment Request', text, url: paymentLink });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

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
            <h1 className="text-white font-bold text-xl">Receive Money</h1>
            <p className="text-white/70 text-sm">Share your payment details</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto lg:max-w-2xl space-y-4">

        {/* Request setup */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#2D7A4F' }}>
              <span style={{ fontSize: 14 }}>⚡</span>
            </div>
            <span className="text-slate-800 font-bold text-sm">Lightning Network</span>
          </div>

          <div className="mb-4">
            <p className="text-slate-500 text-sm font-medium mb-2">Request Amount (Optional)</p>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-700 font-bold">₦</span>
              <input
                type="number"
                value={requestAmount}
                onChange={e => setRequestAmount(e.target.value)}
                placeholder="0"
                className="bg-transparent text-slate-800 outline-none flex-1 text-base font-bold placeholder-slate-300"
              />
            </div>
          </div>

          <div className="mb-5">
            <p className="text-slate-500 text-sm font-medium mb-2">Note (Optional)</p>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Invoice #001, Service payment..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-sm outline-none placeholder-slate-300"
            />
          </div>

          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
            style={{ background: '#2D7A4F' }}>
            {loading ? 'Generating...' : generated ? '↻ Regenerate QR Code' : 'Generate QR Code'}
          </button>
        </div>

        {/* QR Code */}
        {generated && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-slate-800 font-bold text-base mb-1 text-center">
              {requestAmount ? `Request ₦${Number(requestAmount).toLocaleString()}` : 'Scan to Pay'}
            </h2>
            <p className="text-slate-400 text-xs text-center mb-5">Share the link below — sender opens it to pay you</p>

            {/* QR image from backend */}
            <div className="flex justify-center mb-5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                {qrCodeData ? (
                  <img src={qrCodeData} alt="Payment QR Code" className="w-48 h-48 rounded-xl" />
                ) : (
                  <div className="w-48 h-48 bg-slate-200 rounded-xl animate-pulse" />
                )}
              </div>
            </div>

            {/* Payment Link */}
            <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 mb-4">
              <p className="text-slate-400 text-xs mb-1">Payment Link</p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-700 text-xs font-mono truncate">{paymentLink || paymentId}</span>
                <button onClick={copyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all"
                  style={{ background: copied ? '#2D7A4F' : 'rgba(45,122,79,0.1)', color: copied ? 'white' : '#2D7A4F' }}>
                  {copied ? '✓ Copied' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Info banner */}
            <div className="px-4 py-3 rounded-xl mb-4"
              style={{ background: 'rgba(45,122,79,0.06)', border: '1px solid rgba(45,122,79,0.15)' }}>
              <p className="text-[#2D7A4F] text-xs leading-relaxed">
                <span className="font-bold">How it works:</span> When the sender opens this link, they'll see your name,
                phone number, wallet address, and the amount you requested. They can then confirm and pay you directly.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={shareLink}
                className="flex-1 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: '#2D7A4F' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="18" cy="5" r="3" stroke="white" strokeWidth="2" />
                  <circle cx="6" cy="12" r="3" stroke="white" strokeWidth="2" />
                  <circle cx="18" cy="19" r="3" stroke="white" strokeWidth="2" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="white" strokeWidth="2" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="white" strokeWidth="2" />
                </svg>
                Share Payment Link
              </button>
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}