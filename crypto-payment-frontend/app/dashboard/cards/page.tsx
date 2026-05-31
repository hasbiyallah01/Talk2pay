'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fundWallet, completeFunding, getFundingMethods } from '../../lib/api';

interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  saved: number;
  emoji: string;
  color: string;
  createdAt: string;
}

const COLORS = ['#2D7A4F', '#4A90D9', '#E67E22', '#9B59B6', '#E74C3C'];
const EMOJIS = ['🏠', '✈️', '🎓', '🚗', '💍', '📱', '💊', '🎯'];

export default function SavingsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [balance, setBalance] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [showFund, setShowFund] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [fundMethod, setFundMethod] = useState('bank_transfer');
  const [fundMethods, setFundMethods] = useState<any[]>([]);
  const [fundLoading, setFundLoading] = useState(false);
  const [fundSuccess, setFundSuccess] = useState('');
  const [fundError, setFundError] = useState('');

  // New goal form
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newEmoji, setNewEmoji] = useState('🏠');
  const [newColor, setNewColor] = useState(COLORS[0]);

  // Selected goal to add savings
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('trust2pay_user') || '{}');
    setBalance(stored.balance || 0);
    const savedGoals = JSON.parse(localStorage.getItem('trust2pay_savings') || '[]');
    setGoals(savedGoals);

    // Fetch funding methods from backend
    getFundingMethods().then(res => setFundMethods(res.methods || [])).catch(() => {});
  }, []);

  function saveGoals(updated: SavingsGoal[]) {
    setGoals(updated);
    localStorage.setItem('trust2pay_savings', JSON.stringify(updated));
  }

  function handleAddGoal() {
    if (!newName || !newTarget) return;
    const goal: SavingsGoal = {
      id: Date.now().toString(),
      name: newName,
      target: Number(newTarget),
      saved: 0,
      emoji: newEmoji,
      color: newColor,
      createdAt: new Date().toISOString(),
    };
    saveGoals([...goals, goal]);
    setNewName(''); setNewTarget(''); setShowAdd(false);
  }

  function handleAddSavings() {
    if (!selectedGoal || !addAmount) return;
    const amt = Number(addAmount);
    if (amt > balance) return alert('Insufficient balance');
    const updated = goals.map(g =>
      g.id === selectedGoal ? { ...g, saved: Math.min(g.saved + amt, g.target) } : g
    );
    saveGoals(updated);

    // Deduct from balance
    const stored = JSON.parse(localStorage.getItem('trust2pay_user') || '{}');
    const newBal = (stored.balance || 0) - amt;
    localStorage.setItem('trust2pay_user', JSON.stringify({ ...stored, balance: newBal }));
    setBalance(newBal);
    setSelectedGoal(null);
    setAddAmount('');
  }

  function handleDeleteGoal(id: string) {
    if (!confirm('Delete this savings goal?')) return;
    const goal = goals.find(g => g.id === id);
    if (goal && goal.saved > 0) {
      // Refund saved amount to balance
      const stored = JSON.parse(localStorage.getItem('trust2pay_user') || '{}');
      const newBal = (stored.balance || 0) + goal.saved;
      localStorage.setItem('trust2pay_user', JSON.stringify({ ...stored, balance: newBal }));
      setBalance(newBal);
    }
    saveGoals(goals.filter(g => g.id !== id));
  }

async function handleFundWallet() {
  setFundLoading(true);
  setFundError('');
  setFundSuccess('');
  try {
    const res = await fundWallet(Number(fundAmount), fundMethod);
    if (res?.transactionId) {
      const complete = await completeFunding(res.transactionId, Number(fundAmount)) as { newBalance?: number };
      const newBal = complete?.newBalance ?? (balance + Number(fundAmount));

      const stored = JSON.parse(localStorage.getItem('trust2pay_user') || '{}');
      localStorage.setItem('trust2pay_user', JSON.stringify({ ...stored, balance: newBal }));
      setBalance(newBal);
      setFundSuccess(`₦${Number(fundAmount).toLocaleString()} added to your wallet!`);
      setFundAmount('');
    }
  } catch (e: any) {
    const amt = Number(fundAmount);
    if (amt > 0) {
      const stored = JSON.parse(localStorage.getItem('trust2pay_user') || '{}');
      const newBal = (stored.balance || 0) + amt;
      localStorage.setItem('trust2pay_user', JSON.stringify({ ...stored, balance: newBal }));
      setBalance(newBal);
      setFundSuccess(`₦${amt.toLocaleString()} added to your wallet! (simulated)`);
      setFundAmount('');
    } else {
      setFundError(e.message || 'Funding failed');
    }
  } finally {
    setFundLoading(false);
  }
}

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);

  return (
    <div className="min-h-screen bg-[#f5f7f5]">
      {/* Header */}
      <div className="bg-[#2D7A4F] px-4 pt-10 pb-6">
        <div className="flex items-center justify-between max-w-lg mx-auto lg:max-w-2xl">
          <div className="flex items-center gap-3">
            <Link href="/dashboard"
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <div>
              <h1 className="text-white font-bold text-xl">Savings Goals</h1>
              <p className="text-white/70 text-sm">Wallet: ₦{balance.toLocaleString()}</p>
            </div>
          </div>
          <button onClick={() => setShowFund(true)}
            className="px-3 py-2 rounded-xl bg-white/20 text-white text-xs font-semibold">
            + Fund Wallet
          </button>
        </div>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto lg:max-w-2xl space-y-4">

        {/* Summary */}
        {goals.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-slate-500 text-xs font-medium mb-1">Total Saved</p>
              <p className="font-bold text-lg" style={{ color: '#2D7A4F' }}>₦{totalSaved.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-slate-500 text-xs font-medium mb-1">Total Target</p>
              <p className="font-bold text-lg text-slate-800">₦{totalTarget.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Goals */}
        {goals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-slate-700 font-bold mb-1">No savings goals yet</p>
            <p className="text-slate-400 text-sm mb-5">Create your first goal to start saving</p>
          </div>
        ) : (
          goals.map(goal => {
            const pct = Math.min(100, (goal.saved / goal.target) * 100);
            return (
              <div key={goal.id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                      style={{ background: goal.color + '20' }}>
                      {goal.emoji}
                    </div>
                    <div>
                      <p className="text-slate-800 font-bold text-sm">{goal.name}</p>
                      <p className="text-slate-400 text-xs">₦{goal.saved.toLocaleString()} / ₦{goal.target.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: goal.color }}>{pct.toFixed(0)}%</span>
                    <button onClick={() => handleDeleteGoal(goal.id)}
                      className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-all">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                  <div className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: goal.color }} />
                </div>

                {pct < 100 && (
                  selectedGoal === goal.id ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={addAmount}
                        onChange={e => setAddAmount(e.target.value)}
                        placeholder={`Amount (max ₦${Math.min(balance, goal.target - goal.saved).toLocaleString()})`}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-sm outline-none placeholder-slate-300"
                      />
                      <button onClick={handleAddSavings}
                        disabled={!addAmount || Number(addAmount) > balance}
                        className="px-4 py-2 rounded-xl text-white font-semibold text-sm disabled:opacity-40"
                        style={{ background: goal.color }}>
                        Save
                      </button>
                      <button onClick={() => { setSelectedGoal(null); setAddAmount(''); }}
                        className="px-3 py-2 rounded-xl text-slate-500 text-sm bg-slate-50">
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setSelectedGoal(goal.id)}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: goal.color + '15', color: goal.color }}>
                      + Add Savings
                    </button>
                  )
                )}

                {pct >= 100 && (
                  <div className="text-center py-2">
                    <span className="text-[#2D7A4F] font-bold text-sm">🎉 Goal Reached!</span>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Add Goal */}
        {showAdd ? (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="text-slate-800 font-bold mb-4">New Savings Goal</h3>
            <div className="space-y-3">
              <input value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Goal name (e.g. Emergency Fund)"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-sm outline-none placeholder-slate-300" />
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-bold">₦</span>
                <input type="number" value={newTarget} onChange={e => setNewTarget(e.target.value)}
                  placeholder="Target amount"
                  className="bg-transparent text-slate-700 text-sm outline-none flex-1 placeholder-slate-300" />
              </div>

              <div>
                <p className="text-slate-500 text-xs mb-2">Pick an emoji</p>
                <div className="flex gap-2 flex-wrap">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setNewEmoji(e)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all"
                      style={{ background: newEmoji === e ? '#2D7A4F20' : '#f1f5f9', border: newEmoji === e ? '2px solid #2D7A4F' : '2px solid transparent' }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-slate-500 text-xs mb-2">Pick a color</p>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setNewColor(c)}
                      className="w-8 h-8 rounded-full transition-all"
                      style={{ background: c, border: newColor === c ? '3px solid white' : '3px solid transparent', boxShadow: newColor === c ? `0 0 0 2px ${c}` : 'none' }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 py-3 rounded-2xl text-slate-500 font-medium bg-slate-50">Cancel</button>
              <button onClick={handleAddGoal} disabled={!newName || !newTarget}
                className="flex-1 py-3 rounded-2xl text-white font-bold disabled:opacity-40"
                style={{ background: '#2D7A4F' }}>Create Goal</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAdd(true)}
            className="w-full py-4 rounded-2xl text-[#2D7A4F] font-bold text-sm border-2 border-dashed border-[#2D7A4F]/30 hover:border-[#2D7A4F]/60 transition-all bg-white">
            + Create New Savings Goal
          </button>
        )}

        {/* Fund Wallet Modal */}
        {showFund && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => { setShowFund(false); setFundSuccess(''); setFundError(''); }}>
            <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10" onClick={e => e.stopPropagation()}>
              <h3 className="text-slate-800 font-bold text-lg mb-4">Fund Wallet</h3>

              {fundSuccess ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-[#2D7A4F] font-bold text-lg">{fundSuccess}</p>
                  <button onClick={() => { setShowFund(false); setFundSuccess(''); }}
                    className="mt-4 px-6 py-3 rounded-2xl text-white font-bold" style={{ background: '#2D7A4F' }}>Done</button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-slate-500 text-xs font-medium mb-2">Amount (₦)</p>
                    <div className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-600 font-bold">₦</span>
                      <input type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)}
                        placeholder="0" className="bg-transparent text-slate-800 text-xl font-bold outline-none flex-1 placeholder-slate-200" />
                    </div>
                  </div>

                  <div className="mb-5">
                    <p className="text-slate-500 text-xs font-medium mb-2">Funding Method</p>
                    <div className="space-y-2">
                      {(fundMethods.length > 0 ? fundMethods : [
                        { id: 'bank_transfer', name: 'Bank Transfer', description: 'Transfer from your bank', processingTime: '1-2 hours', fees: 'Free' },
                        { id: 'debit_card', name: 'Debit Card', description: 'Pay with debit card', processingTime: 'Instant', fees: '2.5%' },
                        { id: 'mobile_money', name: 'Mobile Money', description: 'MTN, Airtel, Glo', processingTime: 'Instant', fees: '1%' },
                      ]).map(m => (
                        <button key={m.id} onClick={() => setFundMethod(m.id)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                          style={{
                            background: fundMethod === m.id ? 'rgba(45,122,79,0.08)' : '#f8fafc',
                            border: fundMethod === m.id ? '1.5px solid #2D7A4F' : '1.5px solid transparent',
                          }}>
                          <div className="text-left">
                            <p className="text-slate-800 font-semibold text-sm">{m.name}</p>
                            <p className="text-slate-400 text-xs">{m.description} · {m.processingTime}</p>
                          </div>
                          <span className="text-xs font-medium" style={{ color: '#2D7A4F' }}>{m.fees}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {fundError && <p className="text-red-500 text-sm mb-3">{fundError}</p>}

                  <button onClick={handleFundWallet} disabled={fundLoading || !fundAmount}
                    className="w-full py-4 rounded-2xl text-white font-bold disabled:opacity-40"
                    style={{ background: '#2D7A4F' }}>
                    {fundLoading ? 'Processing...' : `Fund ₦${Number(fundAmount || 0).toLocaleString()}`}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}