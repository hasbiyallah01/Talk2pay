'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function VoicePage() {
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'done'>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  const commands = [
    '"Send 2000 naira to Sarah"',
    '"Check my balance"',
    '"Show my transactions"',
    '"How much did I spend today?"',
  ];

  const handleListen = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition needs Chrome browser. Try it there!');
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const r = new SR();
    r.lang = 'en-NG';
    r.interimResults = false;
    setStatus('listening');
    setTranscript('');
    setResponse('');

    r.onresult = (e: any) => {
      const text = e.results[0][0].transcript.toLowerCase();
      setTranscript(text);
      setStatus('processing');

      setTimeout(() => {
        const stored = localStorage.getItem('trust2pay_user');
        const user = stored ? JSON.parse(stored) : { balance: 200000, btc: '0.00380000' };

        let resp = '';
        if (text.includes('balance')) {
          resp = `Your current balance is ₦${(user.balance ?? 200000).toLocaleString()}. You also have ${user.btc || '0.00380000'} BTC.`;
        } else if (text.includes('send')) {
          resp = 'Sure! Redirecting you to Send Money now...';
          setTimeout(() => { window.location.href = '/dashboard/send'; }, 1500);
        } else if (text.includes('transaction') || text.includes('history') || text.includes('spent')) {
          resp = 'Opening your transaction history...';
          setTimeout(() => { window.location.href = '/dashboard/history'; }, 1500);
        } else if (text.includes('receive')) {
          resp = 'Opening Receive Money...';
          setTimeout(() => { window.location.href = '/dashboard/receive'; }, 1500);
        } else if (text.includes('save') || text.includes('saving')) {
          resp = 'Opening your Savings goals...';
          setTimeout(() => { window.location.href = '/dashboard/cards'; }, 1500);
        } else {
          resp = `I heard: "${text}". Try commands like "Check balance", "Send money", or "Show history".`;
        }
        setResponse(resp);
        setStatus('done');
      }, 800);
    };

    r.onerror = () => { setStatus('idle'); setTranscript(''); };
    r.onend = () => { if (status === 'listening') setStatus('idle'); };
    r.start();
  };

  const statusLabel = {
    idle: 'Ready to listen',
    listening: 'Listening...',
    processing: 'Processing...',
    done: 'Got it!',
  }[status];

  const statusSub = {
    idle: 'Tap the microphone and speak your command',
    listening: 'Speak now...',
    processing: 'Understanding your request...',
    done: transcript,
  }[status];

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
      <div className="flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full lg:max-w-2xl">

        {/* Status card */}
        <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center text-center mb-4">

          <h2 className="text-slate-800 font-bold text-2xl mb-2">{statusLabel}</h2>
          <p className="text-slate-400 text-sm mb-10">{statusSub}</p>

          {/* Mic Button */}
          <button
            onClick={handleListen}
            disabled={status === 'listening' || status === 'processing'}
            className="relative w-24 h-24 rounded-full flex items-center justify-center mb-10 transition-all active:scale-95 disabled:cursor-not-allowed"
            style={{
              background: status === 'listening' ? 'rgba(45,122,79,0.15)' : '#2D7A4F',
              border: status === 'listening' ? '3px solid #2D7A4F' : 'none',
              boxShadow: status === 'listening'
                ? '0 0 0 16px rgba(45,122,79,0.08)'
                : '0 8px 32px rgba(45,122,79,0.35)',
            }}>
            {status === 'listening' && (
              <span className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(45,122,79,0.2)' }} />
            )}
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="12" rx="3" fill={status === 'listening' ? '#2D7A4F' : 'white'} />
              <path d="M5 10a7 7 0 0 0 14 0" stroke={status === 'listening' ? '#2D7A4F' : 'white'} strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="19" x2="12" y2="22" stroke={status === 'listening' ? '#2D7A4F' : 'white'} strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="22" x2="16" y2="22" stroke={status === 'listening' ? '#2D7A4F' : 'white'} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Response */}
          {response && (
            <div
              className="w-full p-4 rounded-2xl mb-2 text-left"
              style={{ background: 'rgba(45,122,79,0.07)', border: '1.5px solid rgba(45,122,79,0.2)' }}>
              <p className="text-slate-700 text-sm leading-relaxed">{response}</p>
            </div>
          )}
        </div>

        {/* Example Commands card */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-slate-700 font-bold text-sm mb-4">Example commands</p>
          <div className="flex flex-col gap-3">
            {commands.map(cmd => (
              <div key={cmd} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(45,122,79,0.1)' }}>
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
    </div>
  );
}
