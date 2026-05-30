'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Transaction {
  id: string;
  name: string;
  time: string;
  amount: number;
  type: 'credit' | 'debit';
  avatar: string;
}

const defaultTransactions: Transaction[] = [
  { id: '1', name: 'Sarah Okafor', time: '2 mins ago', amount: 2000, type: 'credit', avatar: 'S' },
  { id: '2', name: 'Abdullahi Yara', time: '1 hour ago', amount: 5500, type: 'debit', avatar: 'A' },
  { id: '3', name: 'Ade Tobi', time: '5 hours ago', amount: 1900, type: 'credit', avatar: 'A' },
  { id: '4', name: 'Ngozi Eze', time: 'Yesterday', amount: 3200, type: 'debit', avatar: 'N' },
  { id: '5', name: 'Emeka Obi', time: 'Yesterday', amount: 10000, type: 'credit', avatar: 'E' },
  { id: '6', name: 'Fatima Bello', time: '2 days ago', amount: 1500, type: 'debit', avatar: 'F' },
  { id: '7', name: 'Tunde Adeyemi', time: '2 days ago', amount: 7500, type: 'credit', avatar: 'T' },
  { id: '8', name: 'Amara Nwosu', time: '3 days ago', amount: 2800, type: 'debit', avatar: 'A' },
];

const avatarColors = ['#2D7A4F', '#4A90D9', '#E67E22', '#9B59B6', '#E74C3C', '#1ABC9C', '#F39C12', '#3498DB'];

export default function History() {
  const [transactions, setTransactions] = useState<Transaction[]>(defaultTransactions);
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('trust2pay_transactions');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTransactions(parsed);
        } else {
          setTransactions(defaultTransactions);
        }
      } else {
        setTransactions(defaultTransactions);
      }
    } catch (_) {
      setTransactions(defaultTransactions);
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = transactions.filter(tx => {
    if (filter !== 'all' && tx.type !== filter) return false;
    if (search && !tx.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalIn = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

  if (loading) return (
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
            <h1 className="text-white font-bold text-xl leading-tight">Transaction History</h1>
            <p className="text-white/70 text-sm">All your payments at a glance</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-5 max-w-lg mx-auto lg:max-w-2xl space-y-4">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-slate-500 text-xs font-medium mb-1">Total Received</p>
            <p className="font-bold text-lg" style={{ color: '#2D7A4F' }}>+₦{totalIn.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-slate-500 text-xs font-medium mb-1">Total Sent</p>
            <p className="font-bold text-lg text-red-500">-₦{totalOut.toLocaleString()}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="#94a3b8" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-700 text-sm outline-none bg-white shadow-sm border border-slate-100 placeholder-slate-300"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(['all', 'credit', 'debit'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
              style={{
                background: filter === f ? '#2D7A4F' : 'white',
                color: filter === f ? 'white' : '#64748b',
                boxShadow: filter === f ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
              }}>
              {f === 'all' ? 'All' : f === 'credit' ? '↓ Received' : '↑ Sent'}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        <div className="bg-white rounded-2xl shadow-sm px-5 py-2">
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm">No transactions found</p>
            </div>
          )}
          {filtered.map((tx, i) => (
            <div
              key={tx.id}
              className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm"
                  style={{ background: avatarColors[i % avatarColors.length] }}>
                  {tx.avatar}
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
                  style={{ background: tx.type === 'credit' ? '#2D7A4F' : '#EF4444' }}>
                  {tx.type === 'credit'
                    ? <svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 7L7 2M7 2H3M7 2V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : <svg width="8" height="8" viewBox="0 0 10 10"><path d="M8 3L3 8M3 8H7M3 8V4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  }
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 font-semibold text-sm truncate">{tx.name}</p>
                <p className="text-slate-400 text-xs">{tx.time}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-sm block" style={{ color: tx.type === 'credit' ? '#2D7A4F' : '#EF4444' }}>
                  {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                </span>
                <span className="text-slate-400 text-xs">
                  {tx.type === 'credit' ? 'Received' : 'Sent'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}