// 'use client';
// import { useState, useEffect } from 'react';
// import Link from 'next/link';

// interface Contact {
//   id: string;
//   name: string;
//   phone: string;
//   emoji: string;
// }

// const DEFAULT_CONTACTS: Contact[] = [
//   { id: '1', name: 'Sarah Okafor', phone: '+234 8132 222 222', emoji: '👩🏽' },
//   { id: '2', name: 'Abdullahi Yara', phone: '+234 8122 333 221', emoji: '👨🏽' },
//   { id: '3', name: 'Grace Joy', phone: '+234 8032 222 211', emoji: '👩🏽' },
//   { id: '4', name: 'Ade Tobi', phone: '+234 8122 000 001', emoji: '👦🏽' },
//   { id: '5', name: 'Ngozi Eze', phone: '+234 803 456 789', emoji: '👩🏾' },
//   { id: '6', name: 'Emeka Obi', phone: '+234 804 567 890', emoji: '👨🏾' },
// ];

// const QUICK_AMOUNTS = [1000, 2000, 5000];
// const BTC_RATE = 0.0000019;

// export default function SendMoney() {
//   const [mounted, setMounted] = useState(false);
//   const [amount, setAmount] = useState('1000');
//   const [search, setSearch] = useState('');
//   const [selected, setSelected] = useState<Contact | null>(DEFAULT_CONTACTS[0]);
//   const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');
//   const [balance, setBalance] = useState(200000);
//   const [note, setNote] = useState('');

//   useEffect(() => {
//     setMounted(true);
//     try {
//       const stored = localStorage.getItem('trust2pay_user');
//       if (stored) setBalance(JSON.parse(stored).balance ?? 200000);
//     } catch (_) { }
//   }, []);

//   const filtered = DEFAULT_CONTACTS.filter(c =>
//     c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
//   );

//   const btcValue = amount
//     ? (Number(amount) * BTC_RATE).toFixed(11)
//     : '0.00000000000';

//   const txId = 'tx_8k9m...2w3e';

//   const handleSend = () => {
//     if (!selected || !amount || Number(amount) <= 0) return;
//     const amt = Number(amount);
//     if (amt > balance) { alert('Insufficient balance!'); return; }
//     try {
//       const newBalance = balance - amt;
//       const stored = localStorage.getItem('trust2pay_user');
//       const user = stored ? JSON.parse(stored) : {};
//       localStorage.setItem('trust2pay_user', JSON.stringify({ ...user, balance: newBalance }));
//       const txStored = localStorage.getItem('trust2pay_transactions');
//       const txList = txStored ? JSON.parse(txStored) : [];
//       localStorage.setItem('trust2pay_transactions', JSON.stringify([
//         { id: Date.now().toString(), name: selected.name, time: 'Just now', amount: amt, type: 'debit', avatar: selected.emoji[0] },
//         ...txList,
//       ]));
//       setBalance(newBalance);
//     } catch (_) { }
//     setStep('success');
//   };

//   if (!mounted) return (
//     <div className="min-h-screen bg-[#f5f7f5]">
//       <div className="h-[88px] bg-[#2D7A4F]" />
//       <div className="p-4 space-y-3">
//         {[80, 60, 44, 44, 44].map((h, i) => (
//           <div key={i} className="rounded-2xl bg-slate-200 animate-pulse" style={{ height: h }} />
//         ))}
//       </div>
//     </div>
//   );

//   /* ── SUCCESS ── */
//   if (step === 'success') return (
//     <div className="min-h-screen bg-[#f5f7f5] flex flex-col items-center justify-center px-6 py-10">

//       {/* Checkmark */}
//       <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
//         style={{ background: 'rgba(45,122,79,0.1)' }}>
//         <div className="w-11 h-11 rounded-full border-[3px] flex items-center justify-center"
//           style={{ borderColor: '#2D7A4F' }}>
//           <svg width="22" height="22" stroke="#2D7A4F" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
//             <polyline points="20 6 9 17 4 12" />
//           </svg>
//         </div>
//       </div>

//       <h2 className="text-slate-800 font-bold text-2xl text-center mb-1">Payment Successful!</h2>
//       <p className="text-slate-400 text-sm text-center mb-6">Your money is on the way</p>

//       {/* Receipt card */}
//       <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm overflow-hidden mb-6"
//         style={{ border: '1.5px solid rgba(45,122,79,0.2)' }}>
//         <div className="flex justify-between items-center px-5 py-3"
//           style={{ background: 'rgba(45,122,79,0.07)' }}>
//           <span className="text-xs text-slate-500">Amount Sent</span>
//           <span className="text-xl font-bold" style={{ color: '#2D7A4F' }}>₦ {Number(amount).toLocaleString()}</span>
//         </div>
//         {[
//           { label: 'To', value: selected?.name ?? '' },
//           { label: 'Phone', value: selected?.phone ?? '' },
//           { label: 'Network', value: '⚡ Lightning' },
//           { label: 'Fee', value: '₦ 0' },
//           { label: 'Time', value: 'Instant' },
//           { label: 'Transaction ID', value: txId },
//         ].map(({ label, value }) => (
//           <div key={label} className="flex justify-between items-center px-5 py-3 border-t border-slate-50">
//             <span className="text-xs text-slate-400">{label}</span>
//             <span className="text-sm font-semibold text-slate-800">{value}</span>
//           </div>
//         ))}
//       </div>

//       {/* Action buttons */}
//       <div className="flex gap-3 w-full max-w-sm mb-3">
//         <button className="flex-1 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50">
//           Receipt
//         </button>
//         <button className="flex-1 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50">
//           Share
//         </button>
//       </div>
//       <Link
//         href="/dashboard"
//         className="w-full max-w-sm block text-center py-4 rounded-2xl text-[15px] font-bold text-white transition-all hover:opacity-90 active:scale-95"
//         style={{ background: '#2D7A4F' }}>
//         Back Home
//       </Link>
//     </div>
//   );

//   /* ── CONFIRM ── */
//   if (step === 'confirm' && selected) return (
//     <div className="min-h-screen bg-[#f5f7f5] flex flex-col items-center justify-center px-6 py-10">
//       <h1 className="text-slate-800 font-bold text-2xl text-center mb-1">Confirm Payment</h1>
//       <p className="text-slate-400 text-sm text-center mb-7">Please verify the details</p>

//       {/* Confirm card */}
//       <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6 mb-8"
//         style={{ border: '1.5px solid rgba(45,122,79,0.2)' }}>
//         <p className="text-xs text-slate-400 text-center mb-1">Amount</p>
//         <p className="text-[44px] font-bold text-center mb-5 leading-none" style={{ color: '#2D7A4F' }}>
//           ₦ {Number(amount).toLocaleString()}
//         </p>

//         <div className="h-px bg-slate-100 my-3" />
//         <p className="text-xs text-slate-400 mb-1">Recipient</p>
//         <p className="text-[15px] font-semibold text-slate-800">{selected.name}</p>

//         {note && (
//           <>
//             <div className="h-px bg-slate-100 my-3" />
//             <p className="text-xs text-slate-400 mb-1">Note</p>
//             <p className="text-sm text-slate-700">{note}</p>
//           </>
//         )}

//         <div className="h-px bg-slate-100 my-3" />
//         <p className="text-xs text-slate-400 mb-1">You want to</p>
//         <p className="text-sm text-slate-600 italic">
//           &ldquo;Send {amount === '1000' ? 'one thousand' : `₦${Number(amount).toLocaleString()}`} naira to {selected.name.split(' ')[0]}&rdquo;
//         </p>
//       </div>

//       {/* Buttons */}
//       <div className="flex gap-3 w-full max-w-sm">
//         <button
//           onClick={() => setStep('select')}
//           className="flex-1 py-4 rounded-2xl border border-slate-200 bg-white text-[15px] font-semibold text-slate-700 transition-all hover:bg-slate-50">
//           Cancel
//         </button>
//         <button
//           onClick={handleSend}
//           className="flex-1 py-4 rounded-2xl text-[15px] font-bold text-white transition-all hover:opacity-90 active:scale-95"
//           style={{ background: '#2D7A4F' }}>
//           Confirm
//         </button>
//       </div>
//     </div>
//   );

//   /* ── MAIN SELECT SCREEN ── */
//   return (
//     <div className="min-h-screen bg-[#f5f7f5]">

//       {/* Green Header */}
//       <div className="bg-[#2D7A4F] px-4 pt-10 pb-6">
//         <div className="flex items-center gap-3 max-w-lg mx-auto lg:max-w-2xl">
//           <Link href="/dashboard"
//             className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//               <path d="M19 12H5M12 5l-7 7 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//             </svg>
//           </Link>
//           <div>
//             <h1 className="text-white font-bold text-xl leading-tight">Send Money</h1>
//             <p className="text-white/70 text-sm">Choose recipient and amount</p>
//           </div>
//         </div>
//       </div>

//       {/* Body */}
//       <div className="px-4 py-5 max-w-lg mx-auto lg:max-w-2xl space-y-4">

//         {/* Amount card */}
//         <div className="bg-white rounded-2xl shadow-sm p-5">
//           <p className="text-slate-500 text-sm font-medium mb-1">Amount</p>
//           <div className="flex items-baseline gap-1 mb-1">
//             <span className="text-slate-700 text-3xl font-bold">₦</span>
//             <input
//               type="number"
//               value={amount}
//               onChange={e => setAmount(e.target.value)}
//               placeholder="0"
//               className="bg-transparent text-slate-800 text-4xl font-bold outline-none flex-1 min-w-0 placeholder-slate-200"
//             />
//           </div>
//           <div className="flex items-center gap-1 mb-4">
//             <span className="text-yellow-400 text-xs">⚡</span>
//             <span className="text-slate-400 text-xs">≈ {btcValue} BTC</span>
//           </div>
//           <div className="flex gap-2">
//             {QUICK_AMOUNTS.map(q => (
//               <button
//                 key={q}
//                 onClick={() => setAmount(String(q))}
//                 className="flex-1 py-2 rounded-full text-sm font-semibold border transition-all"
//                 style={
//                   amount === String(q)
//                     ? { background: '#2D7A4F', color: 'white', border: '1.5px solid #2D7A4F' }
//                     : { background: 'white', color: '#475569', border: '1.5px solid #e2e8f0' }
//                 }>
//                 ₦{q.toLocaleString()}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Optional note */}
//         <div className="bg-white rounded-2xl shadow-sm px-4 py-3">
//           <input
//             type="text"
//             value={note}
//             onChange={e => setNote(e.target.value)}
//             placeholder="Add a note (optional)"
//             className="bg-transparent text-slate-600 text-sm outline-none w-full placeholder-slate-300"
//           />
//         </div>

//         {/* Search */}
//         <div className="relative">
//           <svg className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none">
//             <circle cx="11" cy="11" r="8" stroke="#94a3b8" strokeWidth="2" />
//             <path d="M21 21l-4.35-4.35" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
//           </svg>
//           <input
//             type="text"
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//             placeholder="Search contacts..."
//             className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-700 text-sm outline-none bg-white shadow-sm border border-slate-100 placeholder-slate-300"
//           />
//         </div>

//         {/* Contacts list */}
//         <div>
//           <div className="flex items-center gap-2 mb-3">
//             <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
//               <circle cx="12" cy="8" r="4" stroke="#1e293b" strokeWidth="2" />
//               <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
//             </svg>
//             <p className="text-slate-800 text-sm font-bold">Recent Contacts</p>
//           </div>
//           <div className="flex flex-col gap-2">
//             {filtered.map(c => {
//               const isSel = selected?.id === c.id;
//               return (
//                 <button
//                   key={c.id}
//                   onClick={() => setSelected(c)}
//                   className="flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all w-full"
//                   style={{
//                     background: isSel ? 'rgba(45,122,79,0.07)' : 'white',
//                     border: isSel ? '1.5px solid rgba(45,122,79,0.45)' : '1.5px solid transparent',
//                     boxShadow: isSel ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
//                   }}>
//                   <div className="w-11 h-11 rounded-full bg-[#2D7A4F]/10 flex items-center justify-center text-2xl shrink-0">
//                     {c.emoji}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-slate-800 font-semibold text-sm truncate">{c.name}</p>
//                     <p className="text-slate-400 text-xs">{c.phone}</p>
//                   </div>
//                   {isSel && (
//                     <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: '#2D7A4F' }}>
//                       <svg width="10" height="10" viewBox="0 0 12 12">
//                         <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
//                       </svg>
//                     </div>
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Continue button */}
//         <button
//           onClick={() => { if (selected && amount && Number(amount) > 0) setStep('confirm'); }}
//           disabled={!selected || !amount || Number(amount) <= 0}
//           className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
//           style={{ background: '#2D7A4F' }}>
//           Continue
//         </button>

//         <div className="h-4" />
//       </div>
//     </div>
//   );
// }

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Contact {
  id: string;
  name: string;
  phone: string;
  emoji: string;
}

const DEFAULT_CONTACTS: Contact[] = [
  { id: '1', name: 'Sarah Okafor', phone: '+234 8132 222 222', emoji: '👩🏽' },
  { id: '2', name: 'Abdullahi Yara', phone: '+234 8122 333 221', emoji: '👨🏽' },
  { id: '3', name: 'Grace Joy', phone: '+234 8032 222 211', emoji: '👩🏽' },
  { id: '4', name: 'Ade Tobi', phone: '+234 8122 000 001', emoji: '👦🏽' },
  { id: '5', name: 'Ngozi Eze', phone: '+234 803 456 789', emoji: '👩🏾' },
  { id: '6', name: 'Emeka Obi', phone: '+234 804 567 890', emoji: '👨🏾' },
];

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000];
const BTC_RATE = 0.0000019;

export default function SendMoney() {
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState('1000');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Contact | null>(DEFAULT_CONTACTS[0]);
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');
  const [balance, setBalance] = useState(200000);
  const [note, setNote] = useState('');

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('trust2pay_user');
      if (stored) setBalance(JSON.parse(stored).balance ?? 200000);
    } catch (_) {}
  }, []);

  const filtered = DEFAULT_CONTACTS.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const btcValue = amount ? (Number(amount) * BTC_RATE).toFixed(11) : '0.00000000000';
  const txId = 'tx_8k9m...2w3e';

  const handleSend = () => {
    if (!selected || !amount || Number(amount) <= 0) return;
    const amt = Number(amount);
    if (amt > balance) { alert('Insufficient balance!'); return; }
    try {
      const newBalance = balance - amt;
      const stored = localStorage.getItem('trust2pay_user');
      const user = stored ? JSON.parse(stored) : {};
      localStorage.setItem('trust2pay_user', JSON.stringify({ ...user, balance: newBalance }));
      const txStored = localStorage.getItem('trust2pay_transactions');
      const txList = txStored ? JSON.parse(txStored) : [];
      localStorage.setItem('trust2pay_transactions', JSON.stringify([
        { id: Date.now().toString(), name: selected.name, time: 'Just now', amount: amt, type: 'debit', avatar: selected.emoji[0] },
        ...txList,
      ]));
      setBalance(newBalance);
    } catch (_) {}
    setStep('success');
  };

  if (!mounted) return (
    <div className="min-h-screen bg-[#f5f7f5]">
      <div className="h-[88px] bg-[#2D7A4F]" />
      <div className="p-4 space-y-3">
        {[80, 60, 44, 44, 44].map((h, i) => (
          <div key={i} className="rounded-2xl bg-slate-200 animate-pulse" style={{ height: h }} />
        ))}
      </div>
    </div>
  );

  /* ── SUCCESS ── */
  if (step === 'success') return (
    <div className="min-h-screen bg-[#f5f7f5] flex flex-col items-center justify-center px-4 py-10">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
        style={{ background: 'rgba(45,122,79,0.1)' }}>
        <div
          className="w-11 h-11 rounded-full border-[3px] flex items-center justify-center"
          style={{ borderColor: '#2D7A4F' }}>
          <svg width="22" height="22" stroke="#2D7A4F" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      <h2 className="text-slate-800 font-bold text-2xl text-center mb-1">Payment Successful!</h2>
      <p className="text-slate-400 text-sm text-center mb-6">Your money is on the way</p>

      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-sm overflow-hidden mb-6"
        style={{ border: '1.5px solid rgba(45,122,79,0.2)' }}>
        <div
          className="flex justify-between items-center px-5 py-3"
          style={{ background: 'rgba(45,122,79,0.07)' }}>
          <span className="text-xs text-slate-500">Amount Sent</span>
          <span className="text-xl font-bold" style={{ color: '#2D7A4F' }}>₦ {Number(amount).toLocaleString()}</span>
        </div>
        {[
          { label: 'To', value: selected?.name ?? '' },
          { label: 'Phone', value: selected?.phone ?? '' },
          { label: 'Network', value: '⚡ Lightning' },
          { label: 'Fee', value: '₦ 0' },
          { label: 'Time', value: 'Instant' },
          { label: 'Transaction ID', value: txId },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center px-5 py-3 border-t border-slate-50">
            <span className="text-xs text-slate-400">{label}</span>
            <span className="text-sm font-semibold text-slate-800">{value}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3 w-full max-w-sm mb-3">
        <button className="flex-1 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700">Receipt</button>
        <button className="flex-1 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700">Share</button>
      </div>
      <Link
        href="/dashboard"
        className="w-full max-w-sm block text-center py-4 rounded-2xl text-[15px] font-bold text-white"
        style={{ background: '#2D7A4F' }}>
        Back Home
      </Link>
    </div>
  );

  /* ── CONFIRM ── */
  if (step === 'confirm' && selected) return (
    <div className="min-h-screen bg-[#f5f7f5] flex flex-col items-center justify-center px-4 py-10">
      <h1 className="text-slate-800 font-bold text-2xl text-center mb-1">Confirm Payment</h1>
      <p className="text-slate-400 text-sm text-center mb-7">Please verify the details</p>

      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6 mb-8"
        style={{ border: '1.5px solid rgba(45,122,79,0.2)' }}>
        <p className="text-xs text-slate-400 text-center mb-1">Amount</p>
        <p className="text-[44px] font-bold text-center mb-5 leading-none" style={{ color: '#2D7A4F' }}>
          ₦ {Number(amount).toLocaleString()}
        </p>
        <div className="h-px bg-slate-100 my-3" />
        <p className="text-xs text-slate-400 mb-1">Recipient</p>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#2D7A4F]/10 flex items-center justify-center text-xl shrink-0">
            {selected.emoji}
          </div>
          <div>
            <p className="text-[15px] font-semibold text-slate-800">{selected.name}</p>
            <p className="text-xs text-slate-400">{selected.phone}</p>
          </div>
        </div>
        {note && (
          <>
            <div className="h-px bg-slate-100 my-3" />
            <p className="text-xs text-slate-400 mb-1">Note</p>
            <p className="text-sm text-slate-700">{note}</p>
          </>
        )}
        <div className="h-px bg-slate-100 my-3" />
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-xs">⚡</span>
          <p className="text-xs text-slate-400">Lightning Network · Instant · Zero fees</p>
        </div>
      </div>

      <div className="flex gap-3 w-full max-w-sm">
        <button
          onClick={() => setStep('select')}
          className="flex-1 py-4 rounded-2xl border border-slate-200 bg-white text-[15px] font-semibold text-slate-700">
          Cancel
        </button>
        <button
          onClick={handleSend}
          className="flex-1 py-4 rounded-2xl text-[15px] font-bold text-white"
          style={{ background: '#2D7A4F' }}>
          Confirm
        </button>
      </div>
    </div>
  );

  /* ── MAIN SELECT SCREEN ── */
  return (
    <div className="min-h-screen bg-[#f5f7f5]">
      {/* Green Header */}
      <div className="bg-[#2D7A4F] px-4 pt-10 pb-6">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-xl leading-tight">Send Money</h1>
            <p className="text-white/70 text-sm">Balance: ₦{balance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Body — two-column on desktop, stacked on mobile */}
      <div className="px-4 py-5 max-w-2xl mx-auto">
        <div className="lg:grid lg:grid-cols-2 lg:gap-5 space-y-4 lg:space-y-0">

          {/* LEFT column */}
          <div className="space-y-4">
            {/* Amount card */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3">Amount</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-slate-400 text-2xl font-bold">₦</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  className="bg-transparent text-slate-800 text-4xl font-bold outline-none flex-1 min-w-0 placeholder-slate-200 w-full"
                />
              </div>
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400 text-xs">⚡</span>
                <span className="text-slate-400 text-xs">≈ {btcValue} BTC</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {QUICK_AMOUNTS.map(q => (
                  <button
                    key={q}
                    onClick={() => setAmount(String(q))}
                    className="py-2 rounded-full text-xs font-semibold border transition-all"
                    style={
                      amount === String(q)
                        ? { background: '#2D7A4F', color: 'white', border: '1.5px solid #2D7A4F' }
                        : { background: 'white', color: '#475569', border: '1.5px solid #e2e8f0' }
                    }>
                    ₦{(q / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add a note (optional)"
                className="bg-transparent text-slate-600 text-sm outline-none flex-1 placeholder-slate-300"
              />
            </div>

            {/* Selected recipient preview (desktop) */}
            {selected && (
              <div
                className="hidden lg:flex items-center gap-3 bg-white rounded-2xl shadow-sm p-4"
                style={{ border: '1.5px solid rgba(45,122,79,0.3)' }}>
                <div className="w-11 h-11 rounded-full bg-[#2D7A4F]/10 flex items-center justify-center text-2xl shrink-0">
                  {selected.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 font-semibold text-sm">{selected.name}</p>
                  <p className="text-slate-400 text-xs">{selected.phone}</p>
                </div>
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#2D7A4F' }}>
                  <svg width="10" height="10" viewBox="0 0 12 12">
                    <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            )}

            {/* Continue button (desktop) */}
            <button
              onClick={() => { if (selected && amount && Number(amount) > 0) setStep('confirm'); }}
              disabled={!selected || !amount || Number(amount) <= 0}
              className="hidden lg:block w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
              style={{ background: '#2D7A4F' }}>
              Continue →
            </button>
          </div>

          {/* RIGHT column — contacts */}
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="#94a3b8" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search contacts..."
                className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-700 text-sm outline-none bg-white shadow-sm border border-slate-100 placeholder-slate-300"
              />
            </div>

            <div className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="#1e293b" strokeWidth="2" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-slate-800 text-sm font-bold">Recent Contacts</p>
            </div>

            <div className="flex flex-col gap-2">
              {filtered.map(c => {
                const isSel = selected?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all w-full"
                    style={{
                      background: isSel ? 'rgba(45,122,79,0.07)' : 'white',
                      border: isSel ? '1.5px solid rgba(45,122,79,0.45)' : '1.5px solid transparent',
                      boxShadow: isSel ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                    }}>
                    <div className="w-11 h-11 rounded-full bg-[#2D7A4F]/10 flex items-center justify-center text-2xl shrink-0">
                      {c.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 font-semibold text-sm truncate">{c.name}</p>
                      <p className="text-slate-400 text-xs">{c.phone}</p>
                    </div>
                    {isSel && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: '#2D7A4F' }}>
                        <svg width="10" height="10" viewBox="0 0 12 12">
                          <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Continue button (mobile only) */}
        <button
          onClick={() => { if (selected && amount && Number(amount) > 0) setStep('confirm'); }}
          disabled={!selected || !amount || Number(amount) <= 0}
          className="lg:hidden w-full mt-5 py-4 rounded-2xl text-white font-bold text-base transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
          style={{ background: '#2D7A4F' }}>
          Continue →
        </button>

        <div className="h-6" />
      </div>
    </div>
  );
}