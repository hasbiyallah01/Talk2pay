'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type VoiceStatus = 'idle' | 'listening' | 'processing' | 'done' | 'error';

export default function VoicePage() {
  const router = useRouter();
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [liveTranscript, setLiveTranscript] = useState('');   // shown while speaking
  const [finalTranscript, setFinalTranscript] = useState(''); // shown after done
  const [response, setResponse] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const recognitionRef = useRef<any>(null);

  const commands = [
    '"Send 2000 naira to Sarah"',
    '"Check my balance"',
    '"Show my transactions"',
    '"How much did I spend today?"',
  ];

  // Process what the user said
  function processCommand(text: string): string {
    const stored = localStorage.getItem('trust2pay_user');
    const user = stored ? JSON.parse(stored) : { balance: 200000, btc: '0.00380000' };

    if (text.includes('balance')) {
      return `Your current balance is ₦${(user.balance ?? 200000).toLocaleString()}. You also have ${user.btc || '0.00380000'} BTC.`;
    } else if (text.includes('send')) {
      setTimeout(() => router.push('/dashboard/send'), 2000);
      return 'Sure! Taking you to Send Money now...';
    } else if (text.includes('transaction') || text.includes('history') || text.includes('spent')) {
      setTimeout(() => router.push('/dashboard/history'), 2000);
      return 'Opening your transaction history...';
    } else if (text.includes('receive') || text.includes('request')) {
      setTimeout(() => router.push('/dashboard/receive'), 2000);
      return 'Opening Receive Money...';
    } else if (text.includes('save') || text.includes('saving')) {
      setTimeout(() => router.push('/dashboard/cards'), 2000);
      return 'Opening your Savings goals...';
    } else if (text.includes('home') || text.includes('dashboard')) {
      setTimeout(() => router.push('/dashboard'), 1500);
      return 'Taking you to the dashboard...';
    } else {
      return `I heard: "${text}". Try commands like "Check balance", "Send money", or "Show history".`;
    }
  }

  const handleListen = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setStatus('error');
      setResponse('Voice recognition requires Chrome browser. Please try it there.');
      setPopupVisible(true);
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognitionRef.current = recognition;

    recognition.lang = 'en-NG';
    recognition.interimResults = true;  // show words as user speaks
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    setStatus('listening');
    setLiveTranscript('');
    setFinalTranscript('');
    setResponse('');
    setPopupVisible(true);

    recognition.onresult = (e: any) => {
      let interim = '';
      let final = '';

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }

      // Show live transcription as user speaks
      setLiveTranscript(interim || final);

      if (final) {
        setFinalTranscript(final.toLowerCase());
        setLiveTranscript('');
      }
    };

    recognition.onerror = (e: any) => {
      setStatus('error');
      setResponse('Could not hear you. Please try again.');
      setLiveTranscript('');
    };

    recognition.onend = () => {
      if (recognitionRef.current) {
        recognitionRef.current = null;
      }
      setStatus(prev => {
        if (prev === 'listening') {
          return 'idle';
        }
        return prev;
      });
    };

    recognition.start();
  };

  // When final transcript arrives, process it
  useEffect(() => {
    if (!finalTranscript) return;
    setStatus('processing');
    const timer = setTimeout(() => {
      const resp = processCommand(finalTranscript);
      setResponse(resp);
      setStatus('done');
    }, 900);
    return () => clearTimeout(timer);
  }, [finalTranscript]);

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setStatus('idle');
  };

  const closePopup = () => {
    stopListening();
    setPopupVisible(false);
    setLiveTranscript('');
    setFinalTranscript('');
    setResponse('');
    setStatus('idle');
  };

  const statusLabel: Record<VoiceStatus, string> = {
    idle: 'Ready to listen',
    listening: 'Listening...',
    processing: 'Processing...',
    done: 'Got it!',
    error: 'Error',
  };

  const statusSub: Record<VoiceStatus, string> = {
    idle: 'Tap the microphone and speak your command',
    listening: 'Speak now — I\'m listening',
    processing: 'Understanding your request...',
    done: 'Done!',
    error: 'Tap to try again',
  };

  return (
    <div className="min-h-screen bg-[#f5f7f5] flex flex-col">

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
            <h1 className="text-white font-bold text-xl leading-tight">Voice Payment</h1>
            <p className="text-white/70 text-sm">Speak to send money</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full lg:max-w-2xl pb-32">

        {/* Status card */}
        <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center text-center mb-4">
          <h2 className="text-slate-800 font-bold text-2xl mb-2">{statusLabel[status]}</h2>
          <p className="text-slate-400 text-sm mb-10">{statusSub[status]}</p>

          {/* Mic Button */}
          <button
            onClick={status === 'listening' ? stopListening : handleListen}
            disabled={status === 'processing'}
            className="relative w-24 h-24 rounded-full flex items-center justify-center mb-10 transition-all active:scale-95 disabled:cursor-not-allowed"
            style={{
              background: status === 'listening' ? 'rgba(45,122,79,0.15)' : status === 'error' ? '#FEE2E2' : '#2D7A4F',
              border: status === 'listening' ? '3px solid #2D7A4F' : 'none',
              boxShadow: status === 'listening'
                ? '0 0 0 16px rgba(45,122,79,0.08)'
                : '0 8px 32px rgba(45,122,79,0.35)',
            }}>
            {status === 'listening' && (
              <span className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(45,122,79,0.2)' }} />
            )}
            {status === 'processing' ? (
              <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"
                style={{ borderWidth: 3, borderColor: 'white', borderTopColor: 'transparent' }} />
            ) : status === 'listening' ? (
              /* Stop icon when listening */
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#2D7A4F">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="2" width="6" height="12" rx="3"
                  fill={status === 'error' ? '#EF4444' : 'white'} />
                <path d="M5 10a7 7 0 0 0 14 0"
                  stroke={status === 'error' ? '#EF4444' : 'white'} strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="19" x2="12" y2="22"
                  stroke={status === 'error' ? '#EF4444' : 'white'} strokeWidth="2" strokeLinecap="round" />
                <line x1="8" y1="22" x2="16" y2="22"
                  stroke={status === 'error' ? '#EF4444' : 'white'} strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>

          {status === 'listening' && (
            <p className="text-[#2D7A4F] text-xs font-medium">Tap to stop</p>
          )}
        </div>

        {/* Example Commands card */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-slate-700 font-bold text-sm mb-4">Example commands</p>
          <div className="flex flex-col gap-3">
            {commands.map(cmd => (
              <div key={cmd} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(45,122,79,0.1)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="9" y="2" width="6" height="12" rx="3" fill="#2D7A4F" />
                    <path d="M5 10a7 7 0 0 0 14 0" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-slate-600 text-sm">{cmd}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="h-4" />
      </div>

      {/* ── Bottom Popup Panel ─────────────────────────────────────────────── */}
      {/* Backdrop */}
      {popupVisible && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={status === 'done' || status === 'error' ? closePopup : undefined}
        />
      )}

      {/* Sliding panel from bottom */}
      <div
        className="fixed left-0 right-0 bottom-0 z-50 transition-transform duration-300 ease-out"
        style={{
          transform: popupVisible ? 'translateY(0)' : 'translateY(110%)',
          maxWidth: '100%',
        }}
      >
        <div className="bg-white rounded-t-3xl shadow-2xl px-5 pt-5 pb-10 max-w-lg mx-auto">

          {/* Handle bar */}
          <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-4" />

          {/* Panel Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {/* Animated mic indicator */}
              <div className={`w-2.5 h-2.5 rounded-full ${status === 'listening' ? 'animate-pulse' : ''}`}
                style={{
                  background: status === 'listening' ? '#2D7A4F'
                    : status === 'processing' ? '#F59E0B'
                    : status === 'done' ? '#2D7A4F'
                    : '#EF4444',
                }} />
              <p className="text-slate-600 font-semibold text-sm">
                {status === 'listening' ? 'Listening...'
                  : status === 'processing' ? 'Processing...'
                  : status === 'done' ? 'Voice Command'
                  : 'Voice Error'}
              </p>
            </div>
            {(status === 'done' || status === 'error') && (
              <button onClick={closePopup}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          {/* Live transcript — shows words as user speaks */}
          {(liveTranscript || finalTranscript) && (
            <div className="mb-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1 font-semibold">You said</p>
              <p className="text-slate-700 text-base font-medium leading-relaxed min-h-[28px]">
                {liveTranscript && (
                  <span className="text-slate-400 italic">{liveTranscript}</span>
                )}
                {finalTranscript && (
                  <span className="text-slate-800">{finalTranscript}</span>
                )}
              </p>
            </div>
          )}

          {/* Processing spinner */}
          {status === 'processing' && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-3"
              style={{ background: 'rgba(45,122,79,0.05)' }}>
              <div className="w-5 h-5 border-2 border-[#2D7A4F] border-t-transparent rounded-full animate-spin shrink-0" />
              <p className="text-slate-500 text-sm">Understanding your request...</p>
            </div>
          )}

          {/* Response */}
          {response && status === 'done' && (
            <div className="px-4 py-3.5 rounded-xl"
              style={{ background: 'rgba(45,122,79,0.07)', border: '1.5px solid rgba(45,122,79,0.2)' }}>
              <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1 font-semibold">Talk2Pay</p>
              <p className="text-slate-700 text-sm leading-relaxed">{response}</p>
            </div>
          )}

          {/* Error response */}
          {response && status === 'error' && (
            <div className="px-4 py-3.5 rounded-xl bg-red-50 border border-red-100">
              <p className="text-red-600 text-sm leading-relaxed">{response}</p>
            </div>
          )}

          {/* Idle listening state hint */}
          {status === 'listening' && !liveTranscript && (
            <div className="flex items-center justify-center gap-3 py-4">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i}
                  className="w-1.5 rounded-full animate-bounce"
                  style={{
                    background: '#2D7A4F',
                    height: `${12 + Math.sin(i) * 8}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.8s',
                  }} />
              ))}
            </div>
          )}

          {/* Try again button */}
          {(status === 'done' || status === 'error') && (
            <button
              onClick={() => {
                setStatus('idle');
                setPopupVisible(false);
                setLiveTranscript('');
                setFinalTranscript('');
                setResponse('');
                setTimeout(handleListen, 200);
              }}
              className="w-full mt-3 py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(45,122,79,0.1)', color: '#2D7A4F' }}>
              🎤 Speak Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}