// 'use client';
// import { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { getMerchantProfile, getDashboard, getWalletBalance } from '../lib/api';

// const SATS_PER_BTC = 100_000_000;
// const NGN_TO_BTC = 0.000000032; // approximate

// interface Transaction {
//   id: string;
//   amount: number;
//   description?: string;
//   status: string;
//   createdAt: string;
//   cryptoType?: string;
//   recipientAddress?: string;
// }

// export default function Dashboard() {
//   const router = useRouter();
//   const [mounted, setMounted] = useState(false);
//   const [balance, setBalance] = useState(0);
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [userName, setUserName] = useState('');
//   const [showBalance, setShowBalance] = useState(true);
//   const [dotIndex, setDotIndex] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [isListening, setIsListening] = useState(false);
//   const [voiceText, setVoiceText] = useState('');

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const token = localStorage.getItem('trust2pay_token');
//       if (!token) { router.replace('/auth/login'); return; }

//       // 1. Profile
//       const profile = await getMerchantProfile();
//       setUserName(profile.firstName || 'Merchant');

//       // 2. Use walletBalance from profile as primary balance source
//       // Also check localStorage for seeded balance on new accounts
//       const storedUser = JSON.parse(localStorage.getItem('trust2pay_user') || '{}');
//       const walletBal = Number(profile.walletBalance) || 0;
//       // For new accounts seeded with 200k, prefer the larger value
//       const displayBalance = Math.max(walletBal, storedUser.balance || 0);
//       setBalance(displayBalance);

//       // Save profile to localStorage for other pages
//       localStorage.setItem('trust2pay_user', JSON.stringify({
//         ...storedUser,
//         ...profile,
//         balance: displayBalance,
//       }));

//       // 3. Dashboard (recent transactions)
//       try {
//         const dash = await getDashboard();
//         setTransactions(dash.recentTransactions || []);
//       } catch { }

//       setMounted(true);
//     } catch (e: any) {
//       if (e.message?.includes('401') || e.message?.includes('Unauthorized')) {
//         localStorage.removeItem('trust2pay_token');
//         router.replace('/auth/login');
//         return;
//       }
//       setError(e.message || 'Failed to load dashboard');
//       setMounted(true);
//     } finally {
//       setLoading(false);
//     }
//   }, [router]);

//   useEffect(() => { fetchData(); }, [fetchData]);

//   // Carousel auto-rotate
//   useEffect(() => {
//     const t = setInterval(() => setDotIndex(p => (p + 1) % 3), 5000);
//     return () => clearInterval(t);
//   }, []);

//   const handleVoice = () => {
//     const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SR) { alert('Voice requires Chrome browser.'); return; }
//     const r = new SR();
//     r.lang = 'en-NG';
//     r.interimResults = false;
//     setIsListening(true);
//     setVoiceText('Listening...');
//     r.onresult = async (e: any) => {
//       const text = e.results[0][0].transcript.toLowerCase();
//       setVoiceText(text);
//       setIsListening(false);
//       if (text.includes('balance')) {
//         try {
//           const res = await getWalletBalance();
//           alert(`Your balance is ₦${Number(res.balance).toLocaleString()}`);
//         } catch (err: any) {
//           alert('Failed to fetch balance.');
//         }
//       } else if (text.includes('send')) router.push('/dashboard/send');
//       else if (text.includes('history') || text.includes('transaction')) router.push('/dashboard/history');
//       else if (text.includes('receive')) router.push('/dashboard/receive');
//       else alert(`I heard: "${text}". Try "check balance" or "send money".`);
//     };
//     r.onerror = () => { setIsListening(false); setVoiceText(''); };
//     r.onend = () => setIsListening(false);
//     r.start();
//   };

//   const btcDisplay = (balance * NGN_TO_BTC).toFixed(8);

//   if (!mounted || loading) return (
//     <div className="min-h-screen bg-[#f5f7f5]">
//       <div className="bg-[#2D7A4F] h-56 animate-pulse" />
//       <div className="px-4 py-4 space-y-3">
//         {[80, 140, 80, 60, 60].map((h, i) => (
//           <div key={i} className="rounded-2xl bg-slate-200 animate-pulse" style={{ height: h }} />
//         ))}
//       </div>
//     </div>
//   );

//   const slides = [
//     {
//       title: 'Talk2Pay Voice Assistant',
//       desc: 'Send money, check balance, or manage your savings using your voice.',
//       button: 'Tap to Speak',
//       onClick: handleVoice,
//       disabled: isListening,
//     },
//     {
//       title: 'WhatsApp Integration',
//       desc: 'Manage your payments and transactions directly from WhatsApp messages.',
//       button: 'Tap to Open WhatsApp',
//       onClick: () => {
//         // Replace with your WhatsApp business link or chat link
//         window.open('https://wa.me/', '_blank');
//       },
//       disabled: false,
//     },
//     {
//       title: 'USSD Support',
//       desc: 'Access Talk2Pay on any phone using USSD codes. No internet needed.',
//       button: 'Tap to try USSD',
//       onClick: () => {
//         // Replace with your actual USSD code or info modal
//         alert('Dial *123# on your phone to access Talk2Pay via USSD.');
//       },
//       disabled: false,
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-[#f5f7f5]">
//       {error && <div className="bg-red-50 text-red-600 text-xs text-center py-2 px-4">{error}</div>}

//       {/* ── Green Header ── */}
//       <div className="bg-[#2D7A4F] px-5 pt-10 pb-20">
//         <div className="max-w-lg mx-auto lg:max-w-2xl">
//           <div className="flex items-center justify-between mb-8">
//             <div className="flex items-center gap-3">
//               <Link href="/dashboard/settings">
//                 <div className="w-11 h-11 rounded-full bg-[#c47a4a] flex items-center justify-center border-2 border-white/30 overflow-hidden">
//                   <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
//                     <circle cx="12" cy="8" r="4" fill="white" fillOpacity="0.9" />
//                     <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" fill="white" fillOpacity="0.6" />
//                   </svg>
//                 </div>
//               </Link>
//               <div>
//                 <p className="text-white/70 text-xs font-medium leading-none mb-0.5">Welcome Back</p>
//                 <p className="text-white font-bold text-base leading-tight">{userName}</p>
//               </div>
//             </div>
//             <Link href="/dashboard/scan"
//               className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
//               <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                 <path d="M3 9V5a2 2 0 0 1 2-2h4" stroke="white" strokeWidth="2" strokeLinecap="round" />
//                 <path d="M15 3h4a2 2 0 0 1 2 2v4" stroke="white" strokeWidth="2" strokeLinecap="round" />
//                 <path d="M21 15v4a2 2 0 0 1-2 2h-4" stroke="white" strokeWidth="2" strokeLinecap="round" />
//                 <path d="M9 21H5a2 2 0 0 1-2-2v-4" stroke="white" strokeWidth="2" strokeLinecap="round" />
//               </svg>
//             </Link>
//           </div>

//           {/* Balance */}
//           <div className="text-center">
//             <div className="flex items-center justify-center gap-2 mb-2">
//               <p className="text-white/80 text-sm font-medium">Total Balance</p>
//               <button onClick={() => setShowBalance(b => !b)} className="opacity-80 hover:opacity-100">
//                 {showBalance
//                   ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="white" strokeWidth="2" /><circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2" /></svg>
//                   : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="white" strokeWidth="2" strokeLinecap="round" /><line x1="1" y1="1" x2="23" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
//                 }
//               </button>
//             </div>
//             <h2 className="text-white font-bold mb-2"
//               style={{ fontSize: 'clamp(2.4rem, 8vw, 3.5rem)', letterSpacing: '-0.02em', lineHeight: 1 }}>
//               {showBalance ? `₦${balance.toLocaleString()}` : '₦ ••••••'}
//             </h2>
//             <p className="text-white/75 text-sm flex items-center justify-center gap-1.5">
//               <span style={{ color: '#FFD700' }}>⚡</span>
//               {showBalance ? `≈ ${btcDisplay} BTC` : '≈ •••••••••• BTC'}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* ── Body ── */}
//       <div className="px-4 -mt-12 pb-8 max-w-lg mx-auto lg:max-w-2xl space-y-4">

//         {/* Quick Actions */}
//         <div className="bg-white rounded-3xl shadow-md p-5">
//           <div className="grid grid-cols-4 gap-2">
//             {[
//               { label: 'Send', href: '/dashboard/send', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> },
//               { label: 'Receive', href: '/dashboard/receive', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" /><polyline points="7 10 12 15 17 10" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="12" y1="15" x2="12" y2="3" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" /></svg> },
//               { label: 'Saving', href: '/dashboard/cards', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M19 11V9a7 7 0 1 0-14 0v2" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" /><rect x="2" y="11" width="20" height="11" rx="3" stroke="#2D7A4F" strokeWidth="2" /><circle cx="12" cy="16" r="1.5" fill="#2D7A4F" /></svg> },
//               { label: 'Voice', href: '/dashboard/voice', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="12" rx="3" fill="#2D7A4F" /><path d="M5 10a7 7 0 0 0 14 0" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" /><line x1="12" y1="19" x2="12" y2="22" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" /></svg> },
//             ].map(a => (
//               <Link key={a.label} href={a.href}
//                 className="flex flex-col items-center gap-2 py-2 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all">
//                 <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">{a.icon}</div>
//                 <span className="text-slate-700 text-xs font-semibold">{a.label}</span>
//               </Link>
//             ))}
//           </div>
//         </div>

//         {/* Voice Assistant carousel */}
//         <div className="bg-white rounded-2xl shadow-sm p-5 h-52 overflow-hidden">
//           <div className="flex items-start gap-4">
//             <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#2D7A4F' }}>
//               <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
//                 <rect x="9" y="2" width="6" height="12" rx="3" fill="white" />
//                 <path d="M5 10a7 7 0 0 0 14 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
//                 <line x1="12" y1="19" x2="12" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
//               </svg>
//             </div>
//             <div className="flex-1 min-w-0">
//               <div className="relative h-16 mb-4 overflow-hidden">
//                 {slides.map((s, idx) => (
//                   <div key={idx}
//                     className="absolute inset-0 transition-all duration-700"
//                     style={{ opacity: dotIndex === idx ? 1 : 0, transform: dotIndex === idx ? 'translateX(0)' : 'translateX(40px)' }}>
//                     <h3 className="text-slate-800 font-bold text-[15px] mb-1">{s.title}</h3>
//                     <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
//                   </div>
//                 ))}
//               </div>
//               <button
//                 onClick={slides[dotIndex].onClick}
//                 disabled={slides[dotIndex].disabled}
//                 className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-70 mb-3"
//                 style={{ background: '#2D7A4F' }}>
//                 {dotIndex === 0 && isListening ? '🎙️ Listening...' : slides[dotIndex].button}
//               </button>
//               {voiceText && <p className="text-center text-slate-400 text-xs mb-2">{voiceText}</p>}
//               <div className="flex justify-center gap-1.5">
//                 {[0, 1, 2].map(i => (
//                   <button key={i} onClick={() => setDotIndex(i)}
//                     className="rounded-full transition-all"
//                     style={{ width: dotIndex === i ? 10 : 8, height: dotIndex === i ? 10 : 8, background: dotIndex === i ? '#2D7A4F' : '#cbd5e1' }} />
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Recent Transactions */}
//         <div className="bg-white rounded-2xl shadow-sm px-5 py-5">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-slate-800 font-bold text-[15px]">Recent Transactions</h3>
//             <Link href="/dashboard/history" className="text-[#2D7A4F] text-sm font-semibold hover:opacity-80">See All</Link>
//           </div>

//           {transactions.length === 0 ? (
//             <div className="text-center py-8">
//               <p className="text-slate-400 text-sm">No transactions yet</p>
//               <Link href="/dashboard/send"
//                 className="mt-3 inline-block text-[#2D7A4F] text-sm font-semibold">Make your first payment →</Link>
//             </div>
//           ) : (
//             <div className="space-y-1">
//               {transactions.slice(0, 5).map((tx) => {
//                 const isCredit = tx.amount >= 0;
//                 const name = tx.description || (tx.recipientAddress ? `To ${tx.recipientAddress.slice(0, 12)}...` : 'Payment');
//                 return (
//                   <div key={tx.id} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
//                     <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-slate-50">
//                       {isCredit
//                         ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7v10" stroke="#2D7A4F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
//                         : <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 7L7 17M7 17h10M7 17V7" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
//                       }
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-slate-800 font-semibold text-sm truncate">{name}</p>
//                       <p className="text-slate-400 text-xs">{new Date(tx.createdAt).toLocaleString()}</p>
//                     </div>
//                     <span className="font-bold text-sm shrink-0" style={{ color: isCredit ? '#2D7A4F' : '#EF4444' }}>
//                       {isCredit ? '+' : '-'}₦{Math.abs(tx.amount).toLocaleString()}
//                     </span>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         <div className="h-4" />
//       </div>
//     </div>
//   );
// }

'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMerchantProfile, getDashboard } from '../lib/api';
import { T } from '@/components/onboarding/T';
import { useTranslation } from '@/components/onboarding/useTranslation';

const NGN_TO_BTC = 0.000000032; // approximate

interface Transaction {
  id: string;
  amount: number;
  description?: string;
  status: string;
  createdAt: string;
  cryptoType?: string;
  recipientAddress?: string;
  senderAddress?: string;
  type?: string; // 'debit' | 'credit'
}

// Mirrors the history page detectDebit: uses type field authoritatively
function detectDebit(tx: Transaction): boolean {
  if (tx.type === 'debit') return true;
  if (tx.type === 'credit') return false;
  if (tx.amount < 0) return true;
  if (tx.senderAddress) return false; // has a sender = money came IN
  if (tx.recipientAddress) return true; // has a recipient = money went OUT
  return false;
}

export default function Dashboard() {
  const router = useRouter();
  const { accessibility } = useTranslation();

  const [mounted, setMounted] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userName, setUserName] = useState('');
  const [showBalance, setShowBalance] = useState(true);
  const [dotIndex, setDotIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('trust2pay_token');
      if (!token) { router.replace('/auth/login'); return; }

      // 1. Profile
      const profile = await getMerchantProfile();
      setUserName(profile.firstName || 'Merchant');

      // 2. Use walletBalance from profile as the authoritative balance source
      const storedUser = JSON.parse(localStorage.getItem('trust2pay_user') || '{}');
      const walletBal = Number(profile.walletBalance) || 0;
      setBalance(walletBal);

      // Save profile to localStorage for other pages
      localStorage.setItem('trust2pay_user', JSON.stringify({
        ...storedUser,
        ...profile,
        balance: walletBal,
      }));

      // 3. Dashboard (recent transactions)
      try {
        const dash = await getDashboard();
        setTransactions(dash.recentTransactions || []);
      } catch { }

      setMounted(true);
    } catch (e: any) {
      if (e.message?.includes('401') || e.message?.includes('Unauthorized')) {
        localStorage.removeItem('trust2pay_token');
        router.replace('/auth/login');
        return;
      }
      setError(e.message || 'Failed to load dashboard');
      setMounted(true);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Carousel auto-rotate
  useEffect(() => {
    const t = setInterval(() => setDotIndex(p => (p + 1) % 3), 5000);
    return () => clearInterval(t);
  }, []);

  // Dispatch global voice trigger to layout
  const triggerVoice = useCallback(() => {
    window.dispatchEvent(new CustomEvent('t2p-trigger-voice'));
  }, []);

  const btcDisplay = (balance * NGN_TO_BTC).toFixed(8);

  if (!mounted || loading) return (
    <div className="min-h-screen bg-[#f5f7f5]">
      <div className="bg-[#2D7A4F] h-56 animate-pulse" />
      <div className="px-4 py-4 space-y-3">
        {[80, 140, 80, 60, 60].map((h, i) => (
          <div key={i} className="rounded-2xl bg-slate-200 animate-pulse" style={{ height: h }} />
        ))}
      </div>
    </div>
  );

  const slides = [
    {
      title: 'Talk2Pay Voice Assistant',
      desc: 'Send money, check balance, or manage your savings using your voice.',
      button: '🎙️ Tap to Speak',
      onClick: triggerVoice,
      disabled: false,
    },
    {
      title: 'WhatsApp Integration',
      desc: 'Manage your payments and transactions directly from WhatsApp messages.',
      button: 'Tap to Open WhatsApp',
      onClick: () => window.open('https://wa.me/', '_blank'),
      disabled: false,
    },
    {
      title: 'USSD Support',
      desc: 'Access Talk2Pay on any phone using USSD codes. No internet needed.',
      button: 'Tap to try USSD',
      onClick: () => alert('Dial *123# on your phone to access Talk2Pay via USSD.'),
      disabled: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7f5]  ">
      {error && <div className="bg-red-50 text-red-600 text-xs text-center py-2 px-4">{error}</div>}

      {/* ── Green Header ── */}
      <div className="bg-[#2D7A4F]  rounded-b-[24px] px-5 pt-10 pb-20">
        <div className="max-w-lg mx-auto lg:max-w-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/settings">
               <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-black/70 overflow-hidden">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" fill="currentColor" />
                  <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" fill="currentColor" />
                </svg>
              </div>
              </Link>
              <div>
                <p className="text-white/70 text-xs font-medium leading-none mb-0.5">Welcome Back</p>
                <p className="text-white font-bold text-base leading-tight">{userName}</p>
              </div>
            </div>
            <Link href="/dashboard/scan"
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 9V5a2 2 0 0 1 2-2h4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M15 3h4a2 2 0 0 1 2 2v4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M21 15v4a2 2 0 0 1-2 2h-4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M9 21H5a2 2 0 0 1-2-2v-4" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </Link>
          </div>

          {/* Balance */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className="text-white/80 text-sm font-medium">Total Balance</p>
              <button onClick={() => setShowBalance(b => !b)} className="opacity-80 hover:opacity-100">
                {showBalance
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="white" strokeWidth="2" /><circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2" /></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="white" strokeWidth="2" strokeLinecap="round" /><line x1="1" y1="1" x2="23" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
                }
              </button>
            </div>
            <h2 className="text-white font-bold mb-2"
              style={{ fontSize: 'clamp(2.4rem, 8vw, 3.5rem)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {showBalance ? `₦${balance.toLocaleString()}` : '₦ ••••••'}
            </h2>
            <p className="text-white/75 text-sm flex items-center justify-center gap-1.5">
              <span style={{ color: '#FFD700' }}>⚡</span>
              {showBalance ? `≈ ${btcDisplay} BTC` : '≈ •••••••••• BTC'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-4 -mt-12 pb-8 max-w-lg mx-auto lg:max-w-2xl space-y-4">

        {/* Quick Actions */}
        <div className="bg-white rounded-[8px] shadow-md p-5">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3"><T text="Quick Actions" /></p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Send', href: '/dashboard/send', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> },
              { label: 'Receive', href: '/dashboard/receive', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" /><polyline points="7 10 12 15 17 10" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="12" y1="15" x2="12" y2="3" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" /></svg> },
              { label: 'Saving', href: '/dashboard/cards', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M19 11V9a7 7 0 1 0-14 0v2" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" /><rect x="2" y="11" width="20" height="11" rx="3" stroke="#2D7A4F" strokeWidth="2" /><circle cx="12" cy="16" r="1.5" fill="#2D7A4F" /></svg> },
              { label: 'Voice', href: '/dashboard/voice', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="12" rx="3" fill="#2D7A4F" /><path d="M5 10a7 7 0 0 0 14 0" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" /><line x1="12" y1="19" x2="12" y2="22" stroke="#2D7A4F" strokeWidth="2" strokeLinecap="round" /></svg> },
            ].map(a => (
              <Link key={a.label} href={a.href}
                className="flex flex-col items-center gap-2 py-2 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">{a.icon}</div>
                <span className="text-slate-700 text-xs font-semibold"><T text={a.label} /></span>
              </Link>
            ))}
          </div>
        </div>

        {/* Voice Assistant carousel */}
        <div className="bg-white rounded-2xl shadow-sm p-5 h-52 overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#2D7A4F' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="2" width="6" height="12" rx="3" fill="white" />
                <path d="M5 10a7 7 0 0 0 14 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="19" x2="12" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="relative h-16 mb-4 overflow-hidden">
                {slides.map((s, idx) => (
                  <div key={idx}
                    className="absolute inset-0 transition-all duration-700"
                    style={{ opacity: dotIndex === idx ? 1 : 0, transform: dotIndex === idx ? 'translateX(0)' : 'translateX(40px)' }}>
                    <h3 className="text-slate-800 font-bold text-[15px] mb-1"><T text={s.title} /></h3>
                    <p className="text-slate-400 text-xs leading-relaxed"><T text={s.desc} /></p>
                  </div>
                ))}
              </div>
              <button
                onClick={slides[dotIndex].onClick}
                disabled={slides[dotIndex].disabled}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-70 mb-3"
                style={{ background: '#2D7A4F' }}>
                <T text={slides[dotIndex].button} />
              </button>
              <div className="flex justify-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <button key={i} onClick={() => setDotIndex(i)}
                    className="rounded-full transition-all"
                    style={{ width: dotIndex === i ? 10 : 8, height: dotIndex === i ? 10 : 8, background: dotIndex === i ? '#2D7A4F' : '#cbd5e1' }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm px-5 py-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-800 font-bold text-[15px]"><T text="Recent Transactions" /></h3>
            <Link href="/dashboard/history" className="text-[#2D7A4F] text-sm font-semibold hover:opacity-80"><T text="See All" /></Link>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm"><T text="No transactions yet" /></p>
              <Link href="/dashboard/send"
                className="mt-3 inline-block text-[#2D7A4F] text-sm font-semibold"><T text="Make your first payment →" /></Link>
            </div>
          ) : (
            <div className="space-y-1">
              {transactions.slice(0, 5).map((tx) => {
                const isDebit = detectDebit(tx);
                const name = tx.description || (isDebit
                  ? tx.recipientAddress ? `To ${tx.recipientAddress.slice(0, 12)}...` : 'Payment Sent'
                  : tx.senderAddress ? `From ${tx.senderAddress.slice(0, 12)}...` : 'Payment Received');
                return (
                  <div key={tx.id} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-slate-50">
                      {!isDebit
                        ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7v10" stroke="#2D7A4F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        : <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 7L7 17M7 17h10M7 17V7" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 font-semibold text-sm truncate">{name}</p>
                      <p className="text-slate-400 text-xs">{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="font-bold text-sm shrink-0" style={{ color: isDebit ? '#EF4444' : '#2D7A4F' }}>
                      {isDebit ? '-' : '+'}₦{Math.abs(tx.amount).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}