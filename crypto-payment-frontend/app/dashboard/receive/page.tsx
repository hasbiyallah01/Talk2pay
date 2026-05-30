'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Receive() {
  const [requestAmount, setRequestAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const lightningAddress = 'lnbc1qp...x8k9m2';
  const fullAddress = 'lnbc1qptrust2pay9000abc123xyz456defghijk789lmnop012qrstuv345wxyz678abcdef901ghijkl234x8k9m2';

  const copyAddress = () => {
    navigator.clipboard.writeText(fullAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareLink = () => {
    const text = requestAmount
      ? `Please send me ₦${Number(requestAmount).toLocaleString()} via Trust2Pay. My lightning address: ${fullAddress}`
      : `Send money to me via Trust2Pay. My lightning address: ${fullAddress}`;
    if (navigator.share) {
      navigator.share({ title: 'Trust2Pay Payment Request', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Payment link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f5]">

      {/* Green Header */}
      <div className="bg-[#2D7A4F] px-4 pt-10 pb-6">
        <div className="flex items-center gap-3 max-w-lg mx-auto lg:max-w-2xl">
          <Link href="/dashboard"
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div>
            <h1 className="text-white font-bold text-xl leading-tight">Receive Money</h1>
            <p className="text-white/70 text-sm">Share your payment details</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-5 max-w-lg mx-auto lg:max-w-2xl space-y-4">

        {/* QR Card */}
        <div className="bg-white rounded-2xl shadow-sm p-5">

          {/* Lightning badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#2D7A4F' }}>
              <span style={{ fontSize: 14 }}>⚡</span>
            </div>
            <span className="text-slate-800 font-bold text-sm">Lightning Network</span>
          </div>

          <h2 className="text-slate-800 font-bold text-base mb-1 text-center">Scan QR Code</h2>
          <p className="text-slate-400 text-xs text-center mb-5">Or share your payment link</p>

          {/* QR Code */}
          <div className="flex justify-center mb-5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <svg width="160" height="160" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="50" height="50" rx="6" fill="none" stroke="#2D7A4F" strokeWidth="6" />
                <rect x="22" y="22" width="26" height="26" rx="3" fill="#2D7A4F" />
                <rect x="140" y="10" width="50" height="50" rx="6" fill="none" stroke="#2D7A4F" strokeWidth="6" />
                <rect x="152" y="22" width="26" height="26" rx="3" fill="#2D7A4F" />
                <rect x="10" y="140" width="50" height="50" rx="6" fill="none" stroke="#2D7A4F" strokeWidth="6" />
                <rect x="22" y="152" width="26" height="26" rx="3" fill="#2D7A4F" />
                {[
                  [80, 14], [90, 14], [100, 14], [110, 14], [125, 14], [135, 14],
                  [80, 24], [100, 24], [125, 24],
                  [80, 34], [90, 34], [110, 34], [125, 34], [135, 34],
                  [80, 44], [110, 44],
                  [80, 54], [90, 54], [100, 54], [110, 54],
                  [14, 80], [24, 80], [44, 80], [54, 80], [80, 80], [100, 80], [110, 80], [125, 80], [135, 80], [145, 80], [165, 80], [185, 80],
                  [14, 90], [54, 90], [80, 90], [110, 90], [145, 90], [175, 90], [185, 90],
                  [14, 100], [24, 100], [44, 100], [54, 100], [80, 100], [100, 100], [125, 100], [145, 100], [155, 100], [165, 100],
                  [24, 110], [54, 110], [90, 110], [110, 110], [135, 110], [155, 110], [185, 110],
                  [14, 120], [34, 120], [54, 120], [80, 120], [100, 120], [115, 120], [135, 120], [165, 120],
                  [14, 130], [44, 130], [80, 130], [110, 130], [145, 130], [175, 130],
                  [80, 145], [100, 145], [125, 145], [155, 145], [165, 145], [185, 145],
                  [80, 155], [90, 155], [100, 155], [115, 155], [145, 155], [165, 155],
                  [80, 165], [100, 165], [125, 165], [135, 165], [155, 165],
                  [80, 175], [90, 175], [100, 175], [115, 175], [135, 175], [145, 175], [185, 175],
                  [80, 185], [100, 185], [110, 185], [135, 185], [165, 185], [185, 185],
                ].map(([x, y], i) => (
                  <rect key={i} x={x} y={y} width="8" height="8" rx="2" fill="#2D7A4F" />
                ))}
                <circle cx="100" cy="100" r="16" fill="#2D7A4F" />
                <polyline points="92,100 98,106 108,94" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Request Amount */}
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

          {/* Lightning Address */}
          <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 mb-5">
            <p className="text-slate-400 text-xs mb-1">Lightning Address</p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-700 text-sm font-mono truncate">{lightningAddress}</span>
              <button
                onClick={copyAddress}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all"
                style={{ background: copied ? '#2D7A4F' : 'rgba(45,122,79,0.1)', color: copied ? 'white' : '#2D7A4F' }}>
                {copied ? '✓ Copied' : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={shareLink}
              className="flex-1 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
              style={{ background: '#2D7A4F' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="18" cy="5" r="3" stroke="white" strokeWidth="2" />
                <circle cx="6" cy="12" r="3" stroke="white" strokeWidth="2" />
                <circle cx="18" cy="19" r="3" stroke="white" strokeWidth="2" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="white" strokeWidth="2" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="white" strokeWidth="2" />
              </svg>
              Share Link
            </button>
            <button className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100 transition-all hover:bg-slate-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                <polyline points="7 10 12 15 17 10" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="15" x2="12" y2="3" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
