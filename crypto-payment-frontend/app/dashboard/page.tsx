'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// API imports removed. All data is now loaded from localStorage only.
import Link from 'next/link';
import { motion } from 'framer-motion';
import { T } from '@/components/onboarding/T';
import { QrCodeIcon } from 'lucide-react';

interface Transaction {
  id: string;
  name: string;
  time: string;
  amount: number;
  type: 'credit' | 'debit';
  avatar: string;
}



export default function Dashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [btcBalance, setBtcBalance] = useState<string>('');
  const [showBalance, setShowBalance] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [dotIndex, setDotIndex] = useState(0); // carousel dot
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function fetchData() {
      setLoading(true);
      setError(null);
      // Check for token
      const token = typeof window !== 'undefined' ? localStorage.getItem('trust2pay_token') : null;
      if (!token) {
        router.replace('/auth/login?error=unauthorized');
        return;
      }
      // Dashboard user info
      const dashStr = localStorage.getItem('trust2pay_user');
      const dash = dashStr ? JSON.parse(dashStr) : { name: '', balance: 0, btc: '' };
      setUserName(dash?.name || '');
      setBalance(dash?.balance ?? 0);
      setBtcBalance(dash?.btc ?? '');
      // Transactions
      const txStr = localStorage.getItem('trust2pay_transactions');
      const tx = txStr ? JSON.parse(txStr) : [];
      setTransactions(Array.isArray(tx) ? tx : []);
      setMounted(true);
      setLoading(false);
    }
    fetchData();
  }, [router]);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDotIndex(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleVoice = () => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Voice not supported. Please use Chrome.'); return; }
    const recognition = new SR();
    recognition.lang = 'en-NG';
    recognition.interimResults = false;
    setIsListening(true);
    setVoiceText('Listening...');
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript.toLowerCase();
      setVoiceText(text);
      setIsListening(false);
      if (text.includes('balance')) alert(`Your balance is ₦${balance.toLocaleString()}`);
      else if (text.includes('send')) window.location.href = '/dashboard/send';
      else if (text.includes('transaction') || text.includes('history')) window.location.href = '/dashboard/history';
      else alert(`I heard: "${text}". Try "check balance" or "send money".`);
    };
    recognition.onerror = () => { setIsListening(false); setVoiceText(''); };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  /* ── skeleton ── */
  if (!mounted || loading) return (
    <div className="min-h-screen bg-[#f5f7f5]">
      <div className="bg-[#2D7A4F] h-48 animate-pulse" />
      <div className="px-4 py-4 space-y-3">
        {[80, 120, 80, 60, 60, 60].map((h, i) => (
          <div key={i} className="rounded-2xl bg-slate-200 animate-pulse" style={{ height: h }} />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {error && <div className="text-center text-xs text-red-500 py-2">{error}</div>}
      <div className="min-h-screen bg-[#f5f7f5]">

        {/* ══════════════ GREEN HEADER ══════════════ */}
        <div className="bg-[#2D7A4F] px-5 pt-10 pb-20">
          <div className="max-w-lg mx-auto lg:max-w-2xl">

            {/* Top row: avatar + name + profile icon */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                {/* Avatar photo placeholder — round, warm-toned */}
                <Link href="/dashboard/settings" >
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-[#c47a4a] flex items-center justify-center shrink-0 border-2 border-white/30">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" fill="white" fillOpacity="0.9" />
                      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" fill="white" fillOpacity="0.6" />
                    </svg>
                  </div>
                </Link>
                <div>
                  <p className="text-white/70 text-xs font-medium leading-none mb-0.5"><T text="Welcome Back" /></p>
                  <p className="text-white font-bold text-base leading-tight">{userName}</p>
                </div>
              </div>

              {/* Profile icon button */}
              <Link href="/dashboard/scan"
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-white/20">
                <QrCodeIcon />
              </Link>
            </div>


            {/* Balance */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <p className="text-white/80 text-sm font-medium"><T text="Total Balance" /></p>
                <button onClick={() => setShowBalance(b => !b)} className="opacity-80 hover:opacity-100 transition-opacity">
                  {showBalance ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="white" strokeWidth="2" />
                      <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      <line x1="1" y1="1" x2="23" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              </div>

              <h2 className="text-white font-bold mb-2"
                style={{ fontSize: 'clamp(2.4rem, 8vw, 3.5rem)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {showBalance ? `₦${balance.toLocaleString()}` : '₦ ••••••'}
              </h2>

              <p className="text-white/75 text-sm flex items-center justify-center gap-1.5">
                <span style={{ color: '#FFD700' }}>⚡</span>
                {showBalance ? `≈ ${btcBalance} BTC` : '≈ •••••••••• BTC'}
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════ BODY (overlaps header) ══════════════ */}
        <div className="px-4 -mt-12 pb-8 max-w-lg mx-auto lg:max-w-2xl space-y-4">

          {/* Quick Actions card — floats over the green */}
          <div className="bg-white rounded-3xl shadow-md p-5">
            <div className="grid grid-cols-4 gap-2">
              {[
                {
                  label: 'Send', href: '/dashboard/send',
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                },
                {
                  label: 'Receive', href: '/dashboard/receive',
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="3" stroke="#2D7A4F" strokeWidth="2" />
                      <path d="M9 9h1.5M9 12h1.5M9 15h6M13.5 9H15M13.5 12H15" stroke="#2D7A4F" strokeWidth="1.8" strokeLinecap="round" />
                      <rect x="9" y="9" width="6" height="6" rx="0.5" stroke="#2D7A4F" strokeWidth="1.5" />
                    </svg>
                  ),
                },
                {
                  label: 'Saving', href: '/dashboard/cards',
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M19 11V9a7 7 0 1 0-14 0v2" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" />
                      <rect x="2" y="11" width="20" height="11" rx="3" stroke="#2D7A4F" strokeWidth="2" />
                      <circle cx="12" cy="16" r="1.5" fill="#2D7A4F" />
                    </svg>
                  ),
                },
                {
                  label: 'Voice', href: '/dashboard/voice',
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <rect x="9" y="2" width="6" height="12" rx="3" fill="#2D7A4F" />
                      <path d="M5 10a7 7 0 0 0 14 0" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" />
                      <line x1="12" y1="19" x2="12" y2="22" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ),
                },
              ].map(action => (
                <Link key={action.label} href={action.href}
                  className="flex flex-col items-center gap-2 py-2 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                    {action.icon}
                  </div>
                  <span className="text-slate-700 text-xs font-semibold"><T text={action.label} /></span>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Talk2Pay Voice Assistant card ── */}
          <div className="bg-white h-52 rounded-2xl shadow-sm p-5">
            <div className="flex items-start gap-4">
              {/* mic icon square */}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: '#2D7A4F' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="2" width="6" height="12" rx="3" fill="white" />
                  <path d="M5 10a7 7 0 0 0 14 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="19" x2="12" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1 ">
                {/* Carousel cards with animation */}
                <div className="relative h-25  mb-4 overflow-hidden">
                  {[
                    {
                      title: 'Talk2Pay Voice Assistant',
                      desc: 'Send money, check balance, or manage your savings using your voice.'
                    },
                    {
                      title: 'WhatsApp Integration',
                      desc: 'Manage your payments and transactions directly from WhatsApp messages.'
                    },
                    {
                      title: 'USSD Support',
                      desc: 'Access Talk2Pay on any phone using USSD codes. No internet needed.'
                    },
                  ].map((card, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 100 }}
                      animate={dotIndex === idx ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                      className="absolute inset-0">
                      <h3 className="text-slate-800 font-bold text-[15px] mb-2"><T text={card.title} /></h3>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        <T text={card.desc} />
                      </p>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={handleVoice}
                  disabled={isListening}
                  className="w-full -translate-y-10 md:translate-y-0 p-3.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-70"
                  style={{ background: '#2D7A4F' }}>
                  {isListening ? <T text="🎙️ Listening..." /> : <T text="Tap to Speak" />}
                </button>
                {voiceText && (
                  <p className="mt-2 text-center text-slate-400 text-xs"><T text={voiceText} /></p>
                )}
                {/* carousel dots */}
                <div className="flex justify-center gap-1.5 -translate-y-5  md:translate-y-0">
                  {[0, 1, 2].map(i => (
                    <motion.button key={i}
                      onClick={() => setDotIndex(i)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="rounded-full transition-all"
                      style={{
                        width: dotIndex === i ? 10 : 8,
                        height: dotIndex === i ? 10 : 8,
                        background: dotIndex === i ? '#2D7A4F' : '#cbd5e1',
                      }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Recent Transactions ── */}
          <div className="bg-white rounded-2xl shadow-sm px-5 py-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-800 font-bold text-[15px]"><T text="Recent Transactions" /></h3>
              <Link href="/dashboard/history"
                className="text-[#2D7A4F] text-sm font-semibold hover:opacity-80 transition-opacity">
                <T text="See All" />
              </Link>
            </div>

            <div className="space-y-1">
              {transactions.slice(0, 3).map(tx => (
                <div key={tx.id}
                  className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                  {/* Arrow icon box */}
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-slate-50">
                    {tx.type === 'credit' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M7 17L17 7M17 7H7M17 7v10" stroke="#2D7A4F" strokeWidth="2.2"
                          strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M17 7L7 17M7 17h10M7 17V7" stroke="#EF4444" strokeWidth="2.2"
                          strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-semibold text-sm truncate">{tx.name}</p>
                    <p className="text-slate-400 text-xs">{tx.time}</p>
                  </div>

                  <span className="font-bold text-sm shrink-0"
                    style={{ color: tx.type === 'credit' ? '#2D7A4F' : '#EF4444' }}>
                    {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* bottom breathing room for mobile */}
          <div className="h-4" />
        </div>
      </div>
    </>
  );
}