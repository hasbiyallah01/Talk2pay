'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  saved: number;
  color: string;
  emoji: string;
}

const defaultGoals: SavingsGoal[] = [
  { id: '1', name: 'Emergency Fund', target: 50000, saved: 32000, color: '#2D7A4F', emoji: '🏥' },
  { id: '2', name: 'New Phone', target: 150000, saved: 45000, color: '#4A90D9', emoji: '📱' },
  { id: '3', name: 'School Fees', target: 80000, saved: 80000, color: '#E67E22', emoji: '🎓' },
];

const PALETTE = ['#2D7A4F', '#4A90D9', '#E67E22', '#9B59B6', '#E74C3C', '#1ABC9C'];

function radialProgress(pct: number, size = 64, stroke = 6, color = '#2D7A4F') {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return { r, circ, offset, size, stroke, color };
}

export default function Savings() {
  const [goals, setGoals] = useState<SavingsGoal[]>(defaultGoals);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newEmoji, setNewEmoji] = useState('🎯');
  const [newColor, setNewColor] = useState(PALETTE[0]);
  const [topUpGoal, setTopUpGoal] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [balance, setBalance] = useState(200000);
  const [deleteGoal, setDeleteGoal] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('trust2pay_goals');
    if (stored) setGoals(JSON.parse(stored));
    else localStorage.setItem('trust2pay_goals', JSON.stringify(defaultGoals));
    const userStored = localStorage.getItem('trust2pay_user');
    if (userStored) setBalance(JSON.parse(userStored).balance ?? 200000);
  }, []);

  const saveGoals = (g: SavingsGoal[]) => {
    setGoals(g);
    localStorage.setItem('trust2pay_goals', JSON.stringify(g));
  };

  const addGoal = () => {
    if (!newName || !newTarget) return;
    const g: SavingsGoal = {
      id: Date.now().toString(),
      name: newName,
      target: Number(newTarget),
      saved: 0,
      color: newColor,
      emoji: newEmoji,
    };
    saveGoals([...goals, g]);
    setNewName(''); setNewTarget(''); setNewEmoji('🎯'); setNewColor(PALETTE[0]); setShowAdd(false);
  };

  const handleTopUp = (goalId: string) => {
    if (!topUpAmount || Number(topUpAmount) <= 0) return;
    const amt = Number(topUpAmount);
    if (amt > balance) { alert('Insufficient balance!'); return; }
    const updated = goals.map(g => g.id === goalId ? { ...g, saved: Math.min(g.saved + amt, g.target) } : g);
    saveGoals(updated);
    const userStored = localStorage.getItem('trust2pay_user');
    const user = userStored ? JSON.parse(userStored) : {};
    const newBal = balance - amt;
    localStorage.setItem('trust2pay_user', JSON.stringify({ ...user, balance: newBal }));
    setBalance(newBal);
    setTopUpGoal(null); setTopUpAmount('');
  };

  const handleDelete = (goalId: string) => {
    saveGoals(goals.filter(g => g.id !== goalId));
    setDeleteGoal(null);
  };

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const completedCount = goals.filter(g => g.saved >= g.target).length;
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f0f4f1]">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a5c38 0%, #2D7A4F 60%, #3a9460 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10" style={{ background: 'white' }} />
        <div className="absolute top-16 -right-6 w-28 h-28 rounded-full opacity-10" style={{ background: 'white' }} />

        <div className="relative px-4 pt-10 pb-7 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M12 5l-7 7 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <div>
                <h1 className="text-white font-bold text-xl leading-tight">My Savings</h1>
                <p className="text-white/60 text-xs">{goals.length} active goals</p>
              </div>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm transition-all hover:bg-white/90 active:scale-95"
              style={{ background: 'white', color: '#2D7A4F' }}>
              <span className="text-base leading-none">+</span>
              New Goal
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
              <p className="text-white font-bold text-lg leading-tight">₦{(totalSaved / 1000).toFixed(0)}k</p>
              <p className="text-white/60 text-xs mt-0.5">Saved</p>
            </div>
            <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
              <p className="text-white font-bold text-lg leading-tight">{overallPct}%</p>
              <p className="text-white/60 text-xs mt-0.5">Overall</p>
            </div>
            <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
              <p className="text-white font-bold text-lg leading-tight">{completedCount}/{goals.length}</p>
              <p className="text-white/60 text-xs mt-0.5">Complete</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-4 py-5 max-w-2xl mx-auto space-y-3 pb-10">

        {goals.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-slate-600 font-semibold text-base mb-1">No savings goals yet</p>
            <p className="text-slate-400 text-sm mb-5">Start saving towards something meaningful</p>
            <button
              onClick={() => setShowAdd(true)}
              className="px-6 py-3 rounded-2xl text-white font-semibold text-sm"
              style={{ background: '#2D7A4F' }}>
              Create Your First Goal
            </button>
          </div>
        )}

        {goals.map(goal => {
          const pct = totalTarget > 0 ? Math.min((goal.saved / goal.target) * 100, 100) : 0;
          const done = goal.saved >= goal.target;
          const remaining = goal.target - goal.saved;
          const rp = radialProgress(pct, 64, 5, goal.color);

          return (
            <div
              key={goal.id}
              className="bg-white rounded-3xl shadow-sm overflow-hidden"
              style={{ border: done ? `2px solid ${goal.color}30` : '2px solid transparent' }}>

              {/* Top section */}
              <div className="p-5">
                <div className="flex items-start gap-4">

                  {/* Radial progress */}
                  <div className="relative shrink-0">
                    <svg width={rp.size} height={rp.size} viewBox={`0 0 ${rp.size} ${rp.size}`}>
                      <circle
                        cx={rp.size / 2} cy={rp.size / 2} r={rp.r}
                        fill="none" stroke="#f1f5f9" strokeWidth={rp.stroke}
                      />
                      <circle
                        cx={rp.size / 2} cy={rp.size / 2} r={rp.r}
                        fill="none" stroke={goal.color} strokeWidth={rp.stroke}
                        strokeDasharray={rp.circ}
                        strokeDashoffset={rp.offset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${rp.size / 2} ${rp.size / 2})`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl leading-none">{goal.emoji}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-slate-800 font-bold text-base truncate">{goal.name}</p>
                        {done ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold mt-0.5"
                            style={{ background: `${goal.color}15`, color: goal.color }}>
                            ✓ Goal Reached!
                          </span>
                        ) : (
                          <p className="text-slate-400 text-xs mt-0.5">
                            ₦{remaining.toLocaleString()} to go
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="font-bold text-base" style={{ color: goal.color }}>
                          {Math.round(pct)}%
                        </span>
                        <button
                          onClick={() => setDeleteGoal(goal.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all ml-1">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Amounts */}
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="font-bold text-slate-800" style={{ fontSize: 18 }}>
                        ₦{goal.saved.toLocaleString()}
                      </span>
                      <span className="text-slate-300 text-sm">/</span>
                      <span className="text-slate-400 text-sm">₦{goal.target.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${goal.color}80, ${goal.color})` }}
                  />
                </div>
              </div>

              {/* Add money section */}
              {!done && (
                <div className="px-5 pb-4">
                  {topUpGoal === goal.id ? (
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 text-sm font-bold">₦</span>
                        <input
                          type="number"
                          value={topUpAmount}
                          onChange={e => setTopUpAmount(e.target.value)}
                          placeholder="Enter amount"
                          autoFocus
                          className="flex-1 bg-transparent text-slate-700 text-sm outline-none"
                        />
                      </div>
                      <button
                        onClick={() => handleTopUp(goal.id)}
                        className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90"
                        style={{ background: goal.color }}>
                        Add
                      </button>
                      <button
                        onClick={() => { setTopUpGoal(null); setTopUpAmount(''); }}
                        className="w-10 h-10 rounded-xl text-slate-400 text-sm bg-slate-100 flex items-center justify-center">
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setTopUpGoal(goal.id)}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                      style={{ background: `${goal.color}10`, color: goal.color }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Add Money
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Add Goal Modal ── */}
      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="px-6 pt-5 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-800 font-bold text-lg">New Savings Goal</h3>
                <button
                  onClick={() => setShowAdd(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
              {/* Emoji + Name row */}
              <div className="flex gap-3">
                <div>
                  <p className="text-slate-400 text-xs font-medium mb-2">Icon</p>
                  <div className="flex gap-1.5 flex-wrap w-[140px]">
                    {['🎯', '🏠', '📱', '🚗', '🎓', '💊', '✈️', '💍', '💻', '🏖️'].map(e => (
                      <button
                        key={e}
                        onClick={() => setNewEmoji(e)}
                        className="w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all"
                        style={{
                          background: newEmoji === e ? 'rgba(45,122,79,0.12)' : '#f8fafc',
                          border: newEmoji === e ? '2px solid #2D7A4F' : '2px solid #e2e8f0',
                        }}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-slate-400 text-xs font-medium mb-2">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {PALETTE.map(c => (
                      <button
                        key={c}
                        onClick={() => setNewColor(c)}
                        className="w-7 h-7 rounded-full transition-all"
                        style={{
                          background: c,
                          outline: newColor === c ? `3px solid ${c}` : 'none',
                          outlineOffset: 2,
                          transform: newColor === c ? 'scale(1.15)' : 'scale(1)',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Goal Name */}
              <div>
                <label className="text-slate-400 text-xs font-medium mb-2 block">Goal Name</label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. New Laptop"
                  className="w-full px-4 py-3 rounded-xl text-slate-700 text-sm outline-none bg-slate-50 border border-slate-100 focus:border-[#2D7A4F] transition-colors"
                />
              </div>

              {/* Target Amount */}
              <div>
                <label className="text-slate-400 text-xs font-medium mb-2 block">Target Amount (₦)</label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus-within:border-[#2D7A4F] transition-colors">
                  <span className="text-slate-400 font-bold">₦</span>
                  <input
                    type="number"
                    value={newTarget}
                    onChange={e => setNewTarget(e.target.value)}
                    placeholder="0"
                    className="flex-1 bg-transparent text-slate-700 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Preview */}
              {newName && newTarget && (
                <div
                  className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: `${newColor}10`, border: `1.5px solid ${newColor}30` }}>
                  <span className="text-2xl">{newEmoji}</span>
                  <div>
                    <p className="text-slate-800 font-semibold text-sm">{newName}</p>
                    <p className="text-slate-500 text-xs">Target: ₦{Number(newTarget).toLocaleString()}</p>
                  </div>
                  <div className="ml-auto">
                    <div className="w-10 h-10">
                      <svg width="40" height="40" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                        <circle cx="20" cy="20" r="16" fill="none" stroke={newColor} strokeWidth="4"
                          strokeDasharray="0 100.5" strokeLinecap="round" transform="rotate(-90 20 20)" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-1">
                <button
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-3 rounded-xl text-slate-600 font-semibold text-sm bg-slate-100">
                  Cancel
                </button>
                <button
                  onClick={addGoal}
                  disabled={!newName || !newTarget}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ background: newColor }}>
                  Create Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteGoal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) setDeleteGoal(null); }}>
          <div className="w-full max-w-xs bg-white rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <polyline points="3 6 5 6 21 6" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                <path d="M19 6l-1 14H6L5 6" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-slate-800 font-bold text-base mb-1">Delete Goal?</p>
            <p className="text-slate-400 text-sm mb-5">This will remove the goal and all saved progress.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteGoal(null)}
                className="flex-1 py-3 rounded-xl text-slate-600 font-semibold text-sm bg-slate-100">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteGoal)}
                className="flex-1 py-3 rounded-xl text-white font-semibold text-sm bg-red-500">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}