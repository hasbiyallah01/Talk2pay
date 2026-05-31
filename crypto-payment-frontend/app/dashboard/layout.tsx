'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { T } from '@/components/onboarding/T';
import { useTranslation } from '@/components/onboarding/useTranslation';

// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"
          stroke={active ? '#2D7A4F' : '#94a3b8'}
          strokeWidth="2"
          fill={active ? 'rgba(45,122,79,0.12)' : 'none'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M9 21V12h6v9" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard/send',
    label: 'Send',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard/receive',
    label: 'Receive',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" />
        <polyline points="7 10 12 15 17 10" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="15" x2="12" y2="3" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard/history',
    label: 'History',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" />
        <polyline points="12 7 12 12 15 15" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard/cards',
    label: 'Savings',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" />
        <path d="M12 6v6l4 2" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" />
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
          stroke={active ? '#2D7A4F' : '#94a3b8'}
          strokeWidth="2"
        />
      </svg>
    ),
  },
];

function QRScanIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 9V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 3h4a2 2 0 0 1 2 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 15v4a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 21H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="7" y="7" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="7" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="13" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="14" width="1.5" height="1.5" fill="currentColor" />
      <rect x="16" y="14" width="1.5" height="1.5" fill="currentColor" />
      <rect x="14" y="16" width="1.5" height="1.5" fill="currentColor" />
    </svg>
  );
}

// ─── Voice Status Type ────────────────────────────────────────────────────────
type VoiceStatus = 'idle' | 'listening' | 'processing' | 'done' | 'error';

// ─── Screen Reader TTS helper ─────────────────────────────────────────────────
function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-NG';
  utterance.rate = 1.05;
  window.speechSynthesis.speak(utterance);
}

// ─── Page label map for screen reader ────────────────────────────────────────
const PAGE_LABELS: Record<string, string> = {
  '/dashboard': 'Home Dashboard',
  '/dashboard/send': 'Send Money',
  '/dashboard/receive': 'Receive Money',
  '/dashboard/history': 'Transaction History',
  '/dashboard/cards': 'Savings',
  '/dashboard/settings': 'Settings',
  '/dashboard/voice': 'Voice Payment',
  '/dashboard/scan': 'QR Code Scanner',
};

// ─── Main Layout ──────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { accessibility } = useTranslation();

  // Voice assistant state
  const recognitionRef = useRef<any>(null);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [popupVisible, setPopupVisible] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [voiceResponse, setVoiceResponse] = useState('');

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  // ── Screen reader: announce page changes ─────────────────────────────────
  useEffect(() => {
    if (!accessibility.screenReader) return;
    const label = PAGE_LABELS[pathname] || 'Dashboard';
    speak(`Opened ${label}`);
  }, [pathname, accessibility.screenReader]);

  // ── Haptic feedback: vibrate on every interactive click ──────────────────
  useEffect(() => {
    if (!accessibility.hapticFeedback) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest('button, a, [role="button"], [role="switch"]');
      if (interactive && 'vibrate' in navigator) {
        navigator.vibrate(30);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [accessibility.hapticFeedback]);

  // ── Voice command processor ───────────────────────────────────────────────
  const processVoiceCommand = useCallback((text: string): string => {
    const stored = JSON.parse(localStorage.getItem('trust2pay_user') || '{}');
    const bal = stored.balance ?? 0;

    if (text.includes('balance')) {
      const msg = `Your current balance is ₦${bal.toLocaleString()}.`;
      if (accessibility.screenReader) speak(msg);
      return msg;
    } else if (text.includes('send')) {
      setTimeout(() => router.push('/dashboard/send'), 1800);
      const msg = 'Taking you to Send Money now...';
      if (accessibility.screenReader) speak(msg);
      return msg;
    } else if (text.includes('receive') || text.includes('request')) {
      setTimeout(() => router.push('/dashboard/receive'), 1800);
      const msg = 'Opening Receive Money...';
      if (accessibility.screenReader) speak(msg);
      return msg;
    } else if (text.includes('history') || text.includes('transaction') || text.includes('spent')) {
      setTimeout(() => router.push('/dashboard/history'), 1800);
      const msg = 'Opening your transaction history...';
      if (accessibility.screenReader) speak(msg);
      return msg;
    } else if (text.includes('save') || text.includes('saving')) {
      setTimeout(() => router.push('/dashboard/cards'), 1800);
      const msg = 'Opening your Savings goals...';
      if (accessibility.screenReader) speak(msg);
      return msg;
    } else if (text.includes('scan') || text.includes('qr')) {
      setTimeout(() => router.push('/dashboard/scan'), 1800);
      const msg = 'Opening QR scanner...';
      if (accessibility.screenReader) speak(msg);
      return msg;
    } else if (text.includes('setting')) {
      setTimeout(() => router.push('/dashboard/settings'), 1800);
      const msg = 'Opening Settings...';
      if (accessibility.screenReader) speak(msg);
      return msg;
    } else if (text.includes('home') || text.includes('dashboard')) {
      setTimeout(() => router.push('/dashboard'), 1500);
      const msg = 'Taking you to the home dashboard...';
      if (accessibility.screenReader) speak(msg);
      return msg;
    } else {
      const msg = `I heard: "${text}". Try: "check balance", "send money", "transaction history", or "savings".`;
      if (accessibility.screenReader) speak(msg);
      return msg;
    }
  }, [router, accessibility.screenReader]);

  // ── Process final transcript ─────────────────────────────────────────────
  useEffect(() => {
    if (!finalTranscript) return;
    setVoiceStatus('processing');
    const t = setTimeout(() => {
      setVoiceResponse(processVoiceCommand(finalTranscript));
      setVoiceStatus('done');
    }, 900);
    return () => clearTimeout(t);
  }, [finalTranscript, processVoiceCommand]);

  // ── Start listening ──────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceStatus('error');
      setVoiceResponse('Voice recognition requires Chrome browser. Please try it there.');
      setPopupVisible(true);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = 'en-NG';
    recognition.interimResults = true;
    recognition.continuous = false;

    setVoiceStatus('listening');
    setLiveTranscript('');
    setFinalTranscript('');
    setVoiceResponse('');
    setPopupVisible(true);

    recognition.onresult = (e: any) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      setLiveTranscript(interim || final);
      if (final) {
        setFinalTranscript(final.toLowerCase());
        setLiveTranscript('');
      }
    };
    recognition.onerror = () => {
      setVoiceStatus('error');
      setVoiceResponse('Could not hear you. Please try again.');
      setLiveTranscript('');
    };
    recognition.onend = () => { recognitionRef.current = null; };
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setVoiceStatus('idle');
  }, []);

  const closeVoicePopup = useCallback(() => {
    stopListening();
    setPopupVisible(false);
    setLiveTranscript('');
    setFinalTranscript('');
    setVoiceResponse('');
    setVoiceStatus('idle');
  }, [stopListening]);

  const speakAgain = useCallback(() => {
    closeVoicePopup();
    setTimeout(startListening, 350);
  }, [closeVoicePopup, startListening]);

  // ── Listen for global 't2p-trigger-voice' custom event ──────────────────
  useEffect(() => {
    const handler = () => {
      if (voiceStatus === 'listening') stopListening();
      else startListening();
    };
    window.addEventListener('t2p-trigger-voice', handler);
    return () => window.removeEventListener('t2p-trigger-voice', handler);
  }, [voiceStatus, startListening, stopListening]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-slate-100 fixed top-0 left-0 z-30 shadow-sm">
        {/* Logo */}
        <div className="hidden md:flex items-center gap-3 px-6 py-6 border-b border-slate-100">
          <div>
            <img src="/logo.svg" alt="Trust2Pay Logo" className="w-12 h-12" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-tight">Talk2Pay</p>
            <p className="text-xs text-slate-400">Dashboard</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-green-50 text-green-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                {item.icon(active)}
                <T text={item.label} />
              </Link>
            );
          })}

          <div className="px- pb-3">
            <Link
              href="/dashboard/scan"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-slate-500 hover:bg-slate-50 hover:text-[#2D7A4F]"
            >
              <QRScanIcon />
              <span><T text="Scan QR Code" /></span>
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-red-600 hover:bg-red-50 cursor-pointer mt-4"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <T text="Logout" />
          </button>
        </nav>
      </aside>

      {/* ── Main content area ───────────────────────────── */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Page content */}
        <main className="flex-1 overflow-auto pb-24 lg:pb-8">
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        
      </div>

      {/* ── Global Floating Voice Button (when voiceMode is ON) ──────────── */}
      {accessibility.voiceMode && (
        <button
          onClick={() => voiceStatus === 'listening' ? stopListening() : startListening()}
          aria-label="Voice Assistant"
          className="fixed bottom-24 right-5 lg:bottom-8 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 active:scale-95"
          style={{
            background: voiceStatus === 'listening'
              ? 'rgba(45,122,79,0.15)'
              : '#2D7A4F',
            border: voiceStatus === 'listening' ? '2.5px solid #2D7A4F' : 'none',
            boxShadow: voiceStatus === 'listening'
              ? '0 0 0 8px rgba(45,122,79,0.12), 0 8px 24px rgba(45,122,79,0.3)'
              : '0 8px 24px rgba(45,122,79,0.4)',
          }}
        >
          {voiceStatus === 'listening' && (
            <span
              className="absolute inset-0 rounded-full animate-ping"
              style={{ background: 'rgba(45,122,79,0.25)' }}
            />
          )}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect
              x="9" y="2" width="6" height="12" rx="3"
              fill={voiceStatus === 'listening' ? '#2D7A4F' : 'white'}
            />
            <path
              d="M5 10a7 7 0 0 0 14 0"
              stroke={voiceStatus === 'listening' ? '#2D7A4F' : 'white'}
              strokeWidth="2" strokeLinecap="round"
            />
            <line
              x1="12" y1="19" x2="12" y2="22"
              stroke={voiceStatus === 'listening' ? '#2D7A4F' : 'white'}
              strokeWidth="2" strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      {/* ── Global Voice Popup (bottom sheet) ───────────────────────────────── */}
      {popupVisible && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={voiceStatus === 'done' || voiceStatus === 'error' ? closeVoicePopup : undefined}
        />
      )}

      <div
        className="fixed left-0 right-0 bottom-0 z-50 transition-transform duration-300 ease-out"
        style={{ transform: popupVisible ? 'translateY(0)' : 'translateY(110%)' }}
      >
        <div className="bg-white rounded-t-3xl shadow-2xl px-5 pt-4 pb-10 max-w-lg mx-auto lg:max-w-2xl">
          {/* Handle bar */}
          <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-4" />

          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${voiceStatus === 'listening' ? 'animate-pulse' : ''}`}
                style={{
                  background:
                    voiceStatus === 'listening' ? '#2D7A4F'
                    : voiceStatus === 'processing' ? '#F59E0B'
                    : voiceStatus === 'done' ? '#2D7A4F'
                    : '#EF4444',
                }}
              />
              <p className="text-slate-700 font-semibold text-sm">
                {voiceStatus === 'listening' ? 'Listening...'
                  : voiceStatus === 'processing' ? 'Processing...'
                  : voiceStatus === 'done' ? 'Voice Command'
                  : 'Voice Error'}
              </p>
            </div>
            {(voiceStatus === 'done' || voiceStatus === 'error') && (
              <button
                onClick={closeVoicePopup}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          {/* Live transcript */}
          {(liveTranscript || finalTranscript) && (
            <div className="mb-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1 font-semibold">You said</p>
              <p className="text-slate-700 text-base font-medium leading-relaxed min-h-[28px]">
                {liveTranscript && <span className="text-slate-400 italic">{liveTranscript}</span>}
                {finalTranscript && <span className="text-slate-800">{finalTranscript}</span>}
              </p>
            </div>
          )}

          {/* Processing spinner */}
          {voiceStatus === 'processing' && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl mb-3"
              style={{ background: 'rgba(45,122,79,0.05)' }}
            >
              <div className="w-5 h-5 border-2 border-[#2D7A4F] border-t-transparent rounded-full animate-spin shrink-0" />
              <p className="text-slate-500 text-sm">Understanding your request...</p>
            </div>
          )}

          {/* Animated bars while listening */}
          {voiceStatus === 'listening' && !liveTranscript && (
            <div className="flex items-center justify-center gap-2 py-4">
              {[0, 1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="w-1.5 rounded-full animate-bounce"
                  style={{
                    background: '#2D7A4F',
                    height: `${12 + Math.abs(Math.sin(i)) * 10}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.7s',
                  }}
                />
              ))}
            </div>
          )}

          {/* Response */}
          {voiceResponse && voiceStatus === 'done' && (
            <div
              className="px-4 py-3.5 rounded-xl"
              style={{ background: 'rgba(45,122,79,0.07)', border: '1.5px solid rgba(45,122,79,0.2)' }}
            >
              <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1 font-semibold">Talk2Pay</p>
              <p className="text-slate-700 text-sm leading-relaxed">{voiceResponse}</p>
            </div>
          )}

          {/* Error */}
          {voiceResponse && voiceStatus === 'error' && (
            <div className="px-4 py-3.5 rounded-xl bg-red-50 border border-red-100">
              <p className="text-red-600 text-sm leading-relaxed">{voiceResponse}</p>
            </div>
          )}

          {/* Speak Again */}
          {(voiceStatus === 'done' || voiceStatus === 'error') && (
            <button
              onClick={speakAgain}
              className="w-full mt-3 py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(45,122,79,0.1)', color: '#2D7A4F' }}
            >
              🎤 Speak Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}