'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTransactionHistory } from '../../lib/api';

const AVATAR_COLORS = ['#2D7A4F', '#4A90D9', '#E67E22', '#9B59B6', '#E74C3C', '#1ABC9C', '#F39C12', '#3498DB'];

interface Tx {
  id: string;
  amount: number;
  description?: string;
  cryptoType?: string;
  status: string;
  createdAt: string;
  recipientAddress?: string;
  senderAddress?: string;
  paymentId?: string;
  type?: string; // 'debit' | 'credit' from backend
}

// ── Receipt Modal ─────────────────────────────────────────────────────────────
function ReceiptModal({ tx, onClose }: { tx: Tx; onClose: () => void }) {
  const isDebit = detectDebit(tx);
  const name = tx.description || (isDebit
    ? tx.recipientAddress ? `To ${tx.recipientAddress.slice(0, 20)}...` : 'Payment Sent'
    : tx.senderAddress ? `From ${tx.senderAddress.slice(0, 20)}...` : 'Payment Received');

  const ref = tx.id?.slice(0, 16) || 'N/A';
  const date = new Date(tx.createdAt).toLocaleString('en-NG', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(tx.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-slate-800 font-bold text-lg">Transaction Receipt</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Status Badge */}
        <div className="flex flex-col items-center py-6 border-b border-slate-100">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${isDebit ? 'bg-red-50' : 'bg-green-50'}`}>
            {isDebit ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="#2D7A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <p className={`text-2xl font-bold ${isDebit ? 'text-red-500' : 'text-[#2D7A4F]'}`}>
            {isDebit ? '-' : '+'}₦{Math.abs(tx.amount).toLocaleString()}
          </p>
          <p className="text-slate-400 text-sm mt-1">{isDebit ? 'Money Sent' : 'Money Received'}</p>
          <span className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
            tx.status === 'completed' ? 'bg-green-100 text-green-700'
            : tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
            : 'bg-red-100 text-red-700'
          }`}>
            {tx.status === 'completed' ? '✓ Completed' : tx.status === 'pending' ? '⏳ Pending' : '✗ Failed'}
          </span>
        </div>

        {/* Details */}
        <div className="px-5 py-4 space-y-3">
          <ReceiptRow label="Description" value={name} />
          <ReceiptRow label="Date & Time" value={date} />
          <ReceiptRow label="Network" value={tx.cryptoType ? tx.cryptoType.charAt(0).toUpperCase() + tx.cryptoType.slice(1) : 'Lightning'} />
          {isDebit && tx.recipientAddress && (
            <ReceiptRow label="Recipient" value={`${tx.recipientAddress.slice(0, 24)}...`} mono />
          )}
          {!isDebit && tx.senderAddress && (
            <ReceiptRow label="Sender" value={`${tx.senderAddress.slice(0, 24)}...`} mono />
          )}
          <div className="flex items-center justify-between py-2 border-t border-slate-100 mt-2">
            <span className="text-slate-400 text-xs">Transaction ID</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-700 text-xs font-mono">{ref}...</span>
              <button onClick={handleCopy}
                className="px-2 py-1 rounded-lg text-xs font-semibold bg-green-50 text-[#2D7A4F]">
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="px-5 pb-8">
          <button onClick={onClose}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-sm"
            style={{ background: '#2D7A4F' }}>
            Close Receipt
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
      `}</style>
    </div>
  );
}

function ReceiptRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50">
      <span className="text-slate-400 text-xs">{label}</span>
      <span className={`text-slate-700 text-xs font-medium text-right max-w-[200px] truncate ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}

// ── Core debit detection ──────────────────────────────────────────────────────
// A transaction is DEBIT (money sent OUT) if backend marks type = 'debit'.
// A transaction is CREDIT (money received IN) if type = 'credit'.
// Fallback heuristics when type is not present:
//   - Negative amount = debit
//   - Has recipientAddress but no senderAddress = debit
//   - Has senderAddress = credit (received from someone)
function detectDebit(tx: Tx): boolean {
  if (tx.type === 'debit') return true;
  if (tx.type === 'credit') return false;
  if (tx.amount < 0) return true;
  if (tx.senderAddress) return false; // has a sender = money came IN to us
  if (tx.recipientAddress) return true; // has a recipient = money went OUT from us
  return false;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function History() {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTx, setSelectedTx] = useState<Tx | null>(null);
  const LIMIT = 20;

  useEffect(() => {
    async function fetchTxs() {
      setLoading(true);
      setError('');
      try {
        const data = await getTransactionHistory({ page, limit: LIMIT });
        setTransactions(data.transactions || []);
        setTotalPages(Math.ceil((data.total || 0) / LIMIT) || 1);
      } catch (e: any) {
        setError(e.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    }
    fetchTxs();
  }, [page]);

  const filtered = transactions.filter(tx => {
    const debit = detectDebit(tx);
    if (filter === 'debit' && !debit) return false;
    if (filter === 'credit' && debit) return false;
    const name = tx.description || tx.recipientAddress || tx.senderAddress || 'Payment';
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalIn = transactions.filter(tx => !detectDebit(tx)).reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalOut = transactions.filter(tx => detectDebit(tx)).reduce((s, t) => s + Math.abs(t.amount), 0);

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
      {/* Receipt Modal */}
      {selectedTx && <ReceiptModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}

      <div className="bg-[#2D7A4F] px-4 pt-10 pb-6">
        <div className="flex items-center gap-3 max-w-lg mx-auto lg:max-w-2xl">
          <Link href="/dashboard"
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div>
            <h1 className="text-white font-bold text-xl">Transaction History</h1>
            <p className="text-white/70 text-sm">All your payments at a glance</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto lg:max-w-2xl space-y-4">

        {/* Summary */}
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
            <button key={f} onClick={() => setFilter(f)}
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

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm px-5 py-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm">No transactions found</p>
            </div>
          ) : (
            filtered.map((tx, i) => {
              const isDebit = detectDebit(tx);
              const name = tx.description
                || (isDebit
                    ? tx.recipientAddress ? `To ${tx.recipientAddress.slice(0, 16)}...` : 'Payment Sent'
                    : tx.senderAddress ? `From ${tx.senderAddress.slice(0, 16)}...` : 'Payment Received');
              const avatar = name[0]?.toUpperCase() || 'P';

              return (
                <button
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="w-full flex items-center gap-3 py-3 border-b border-slate-50 last:border-0 text-left hover:bg-slate-50 rounded-xl transition-colors px-1 -mx-1"
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm"
                      style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                      {avatar}
                    </div>
                    {/* Direction badge: arrow up = debit (sent), arrow down = credit (received) */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
                      style={{ background: isDebit ? '#EF4444' : '#2D7A4F' }}>
                      {isDebit
                        ? /* Arrow pointing away = sent */
                          <svg width="8" height="8" viewBox="0 0 10 10">
                            <path d="M2 8L8 2M8 2H4M8 2V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        : /* Arrow pointing toward = received */
                          <svg width="8" height="8" viewBox="0 0 10 10">
                            <path d="M8 2L2 8M2 8H6M2 8V4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                      }
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-semibold text-sm truncate">{name}</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-slate-400 text-xs">{new Date(tx.createdAt).toLocaleString()}</p>
                      {tx.status !== 'completed' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{
                            background: tx.status === 'pending' ? '#FEF3C7' : '#FEE2E2',
                            color: tx.status === 'pending' ? '#92400E' : '#991B1B',
                          }}>
                          {tx.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    {/* Debit = red minus, Credit = green plus */}
                    <span className="font-bold text-sm block" style={{ color: isDebit ? '#EF4444' : '#2D7A4F' }}>
                      {isDebit ? '-' : '+'}₦{Math.abs(tx.amount).toLocaleString()}
                    </span>
                    <span className="text-slate-400 text-xs">{isDebit ? 'Sent' : 'Received'}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white shadow-sm text-slate-600 text-sm font-medium disabled:opacity-40">
              ← Prev
            </button>
            <span className="text-slate-500 text-sm">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 rounded-xl bg-white shadow-sm text-slate-600 text-sm font-medium disabled:opacity-40">
              Next →
            </button>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}