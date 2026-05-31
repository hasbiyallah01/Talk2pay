'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

type ScanState = 'scanning' | 'detected' | 'success' | 'error';

interface PaymentRequest {
  name: string;
  lightningAddress: string;
  amount: number | null;
  note?: string;
}

// Simulates parsing a scanned lightning QR payload
function parseLightningQR(raw: string): PaymentRequest | null {
  try {
    if (raw.startsWith('lnbc') || raw.includes('lightning') || raw.includes('trust2pay')) {
      return {
        name: 'Sarah Okafor',
        lightningAddress: 'lnbc1qptrust2pay9000abc123xyz456defghijk789lmnop012qrstuv345wxyz678abcdef901ghijkl234x8k9m2',
        amount: 5000,
        note: 'For groceries',
      };
    }
    return null;
  } catch {
    return null;
  }
}

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [cameraAllowed, setCameraAllowed] = useState<boolean | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [balance, setBalance] = useState(200000);
  const [paying, setPaying] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [scanLineY, setScanLineY] = useState(0);

  // Animate scan line
  useEffect(() => {
    let dir = 1;
    let pos = 0;
    const anim = setInterval(() => {
      pos += dir * 1.2;
      if (pos >= 100) dir = -1;
      if (pos <= 0) dir = 1;
      setScanLineY(pos);
    }, 16);
    return () => clearInterval(anim);
  }, []);

  // Start camera
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Load balance
  useEffect(() => {
    try {
      const stored = localStorage.getItem('trust2pay_user');
      if (stored) setBalance(JSON.parse(stored).balance ?? 200000);
    } catch (_) { }
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraAllowed(true);
      startScanning();
    } catch (err) {
      setCameraAllowed(false);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const startScanning = () => {
    scanIntervalRef.current = setTimeout(() => {
      const mockQR = 'lnbc1qptrust2pay_demo';
      const parsed = parseLightningQR(mockQR);
      if (parsed) {
        stopCamera();
        setPaymentRequest(parsed);
        setScanState('detected');
        if ('vibrate' in navigator) navigator.vibrate([80, 40, 80]);
      }
    }, 3000);
  };

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      await (track as any).applyConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn(t => !t);
    } catch (_) { }
  };

  // TODO: Replace with backend API call for payment completion when available
  const handleConfirmPayment = async () => {
    if (!paymentRequest || paying) return;
    const amt = paymentRequest.amount ?? 0;
    if (amt > balance) return;

    setPaying(true);
    await new Promise(r => setTimeout(r, 1400));

    try {
      // Fallback: localStorage
      const stored = localStorage.getItem('trust2pay_user');
      const user = stored ? JSON.parse(stored) : {};
      const newBal = balance - amt;
      localStorage.setItem('trust2pay_user', JSON.stringify({ ...user, balance: newBal }));

      const txStored = localStorage.getItem('trust2pay_transactions');
      const txList = txStored ? JSON.parse(txStored) : [];
      localStorage.setItem('trust2pay_transactions', JSON.stringify([
        {
          id: Date.now().toString(),
          name: paymentRequest.name,
          time: 'Just now',
          amount: amt,
          type: 'debit',
          avatar: paymentRequest.name[0],
        },
        ...txList,
      ]));
      setBalance(newBal);
    } catch (_) { }

    setPaying(false);
    setScanState('success');
  };

  const handleCancel = () => {
    setPaymentRequest(null);
    setScanState('scanning');
    startCamera();
  };

  // ── Camera denied ──
  if (cameraAllowed === false) return (
    <div className="min-h-screen bg-[#f5f7f5]">
      {/* Green header */}
      <div className="bg-[#2D7A4F] px-5 pt-10 pb-20">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <Link href="/dashboard"
            className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div>
            <h1 className="text-white font-bold text-base">Scan to Pay</h1>
            <p className="text-white/70 text-xs">QR Code Scanner</p>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 -mt-12 pb-8 max-w-lg mx-auto">
        <div className="bg-white rounded-3xl shadow-md p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="1" y1="1" x2="23" y2="23" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-slate-800 font-bold text-xl mb-2">Camera Access Needed</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            To scan QR codes, please allow camera access in your browser settings and reload the page.
          </p>
          <Link href="/dashboard"
            className="px-8 py-3.5 rounded-2xl font-bold text-sm text-white"
            style={{ background: '#2D7A4F' }}>
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );

  // ── Success screen ──
  if (scanState === 'success' && paymentRequest) return (
    <div className="min-h-screen bg-[#f5f7f5]">
      {/* Green header */}
      <div className="bg-[#2D7A4F] px-5 pt-10 pb-20">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <svg width="28" height="28" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-white font-bold text-2xl mb-1">Payment Sent!</h1>
          <p className="text-white/70 text-sm">Lightning fast ⚡</p>
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 -mt-12 pb-8 max-w-lg mx-auto space-y-4">
        <div className="bg-white rounded-3xl shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-slate-400 text-xs mb-1">Amount Paid</p>
            <p className="text-2xl font-bold" style={{ color: '#2D7A4F' }}>
              ₦{(paymentRequest.amount ?? 0).toLocaleString()}
            </p>
          </div>
          {[
            { label: 'To', value: paymentRequest.name },
            { label: 'Network', value: '⚡ Lightning' },
            { label: 'Fee', value: '₦ 0' },
            { label: 'Status', value: '✓ Confirmed' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center px-5 py-3.5 border-b border-slate-50 last:border-0">
              <span className="text-slate-400 text-xs">{label}</span>
              <span className="text-slate-800 text-sm font-semibold">{value}</span>
            </div>
          ))}
        </div>

        <Link href="/dashboard"
          className="block w-full py-4 rounded-2xl text-center font-bold text-white text-[15px] active:scale-95 transition-all"
          style={{ background: '#2D7A4F' }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );

  // ── Main scan view ──
  return (
    <div className="min-h-screen bg-[#f5f7f5] flex flex-col">

      {/* ── Green Header ── */}
      <div className="bg-[#2D7A4F] px-5 pt-10 pb-20 shrink-0">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/dashboard"
              className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            <div className="text-center">
              <h1 className="text-white font-bold text-base">Scan to Pay</h1>
              <p className="text-white/70 text-xs">Point camera at QR code</p>
            </div>

            {/* Torch toggle */}
            <button
              onClick={toggleTorch}
              className="w-9 h-9 rounded-full flex items-center justify-center border transition-all"
              style={{
                background: torchOn ? 'rgba(255,220,0,0.25)' : 'rgba(255,255,255,0.15)',
                borderColor: torchOn ? 'rgba(255,220,0,0.5)' : 'rgba(255,255,255,0.2)',
              }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 2v7l-2 3h10l-2-3V2" stroke={torchOn ? '#FFD700' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.3 15a6 6 0 1 0 11.4 0" stroke={torchOn ? '#FFD700' : 'white'} strokeWidth="2" strokeLinecap="round" />
                <line x1="9" y1="2" x2="15" y2="2" stroke={torchOn ? '#FFD700' : 'white'} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Camera Viewport Card ── */}
      <div className="px-4 mt-12 pb-6 max-w-lg mx-auto w-full">
        <div className="bg-white rounded-3xl shadow-md overflow-hidden">

          {/* Camera area */}
          <div className="relative" style={{ height: 320 }}>
            {/* Live video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Subtle dark vignette */}
            <div className="absolute inset-0" style={{
              background: `radial-gradient(ellipse 55% 50% at 50% 50%, transparent 0%, transparent 38%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.75) 100%)`,
            }} />

            {/* Scan frame */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative" style={{ width: 200, height: 200 }}>
                {/* Corner brackets */}
                {[
                  'top-0 left-0',
                  'top-0 right-0 rotate-90',
                  'bottom-0 right-0 rotate-180',
                  'bottom-0 left-0 -rotate-90',
                ].map((pos, i) => (
                  <div key={i} className={`absolute ${pos} w-9 h-9`}>
                    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                      <path d="M2 18V4a2 2 0 0 1 2-2h16" stroke="#2D7A4F" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>
                ))}

                {/* Animated scan line */}
                {scanState === 'scanning' && (
                  <div
                    className="absolute left-2 right-2 h-0.5 rounded-full"
                    style={{
                      top: `${scanLineY}%`,
                      background: 'linear-gradient(90deg, transparent, #2D7A4F, #4ade80, #2D7A4F, transparent)',
                      boxShadow: '0 0 8px 2px rgba(45,122,79,0.6)',
                    }}
                  />
                )}

                {/* Detected flash */}
                {scanState === 'detected' && (
                  <div className="absolute inset-0 rounded-xl animate-ping"
                    style={{ background: 'rgba(45,122,79,0.3)', animationDuration: '0.6s', animationIterationCount: '1' }} />
                )}
              </div>
            </div>

            {/* Status pill overlay */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)' }}>
                {scanState === 'scanning' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
                    <span className="text-white text-xs font-medium">Scanning for QR code…</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tip row */}
          <div className="flex items-center justify-center gap-2 px-5 py-4 border-t border-slate-100">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#2D7A4F" strokeWidth="2" />
              <path d="M12 8v4M12 16h.01" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="text-slate-400 text-xs">Hold the QR code steady within the frame</p>
          </div>
        </div>
      </div>

      {/* ── Payment Confirmation Bottom Sheet ── */}
      {scanState === 'detected' && paymentRequest && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div
            className="w-full rounded-t-3xl overflow-hidden bg-white shadow-2xl"
            style={{ maxHeight: '85vh', overflowY: 'auto' }}>

            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            {/* Green strip header */}
            <div className="bg-[#2D7A4F] mx-4 mt-2 mb-5 rounded-2xl px-4 py-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white/70 animate-pulse" />
              <p className="text-white/90 text-xs font-semibold uppercase tracking-wider">QR Code Detected</p>
            </div>

            <div className="px-5 pb-8">
              {/* Recipient info */}
              <div className="flex items-center gap-4 mb-5 p-4 rounded-2xl bg-slate-50">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shrink-0"
                  style={{ background: '#2D7A4F' }}>
                  {paymentRequest.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 font-bold text-base">{paymentRequest.name}</p>
                  <p className="text-slate-400 text-xs font-mono truncate mt-0.5">
                    {paymentRequest.lightningAddress.slice(0, 28)}…
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                  <span className="text-base">⚡</span>
                </div>
              </div>

              {/* Amount */}
              <div className="mb-2">
                <p className="text-slate-400 text-xs mb-1">Requested Amount</p>
                {paymentRequest.amount ? (
                  <p className="text-slate-800 font-bold" style={{ fontSize: 38, letterSpacing: '-0.02em', lineHeight: 1 }}>
                    ₦{paymentRequest.amount.toLocaleString()}
                  </p>
                ) : (
                  <p className="text-slate-400 text-base font-medium">No amount specified</p>
                )}
              </div>

              {paymentRequest.note && (
                <div className="flex items-center gap-2 mb-4 mt-3">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-slate-400 text-sm">"{paymentRequest.note}"</p>
                </div>
              )}

              {/* Balance check */}
              {paymentRequest.amount && paymentRequest.amount > balance && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 bg-red-50 border border-red-100">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2" />
                    <line x1="12" y1="8" x2="12" y2="12" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="16" r="1" fill="#EF4444" />
                  </svg>
                  <p className="text-red-500 text-xs">Insufficient balance (₦{balance.toLocaleString()} available)</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm transition-all bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-95">
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={paying || (!!paymentRequest.amount && paymentRequest.amount > balance)}
                  className="flex-2 py-4 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-40"
                  style={{ background: '#2D7A4F', flex: 2 }}>
                  {paying ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Sending…
                    </span>
                  ) : (
                    `Confirm Payment ⚡`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}