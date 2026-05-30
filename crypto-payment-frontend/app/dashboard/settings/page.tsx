'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Settings() {
  const [name, setName] = useState('David A.');
  const [phone, setPhone] = useState('+234 802 876 543');
  const [email, setEmail] = useState('david@example.com');
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [currency, setCurrency] = useState('NGN');
  const [saved, setSaved] = useState(false);
  const [plan] = useState('Premium');

  useEffect(() => {
    const stored = localStorage.getItem('trust2pay_user');
    if (stored) {
      const u = JSON.parse(stored);
      setName(u.name || 'David A.');
      setPhone(u.phone || '+234 802 876 543');
      setEmail(u.email || 'david@example.com');
      setNotifications(u.notifications ?? true);
      setBiometric(u.biometric ?? false);
    }
  }, []);

  const saveSettings = () => {
    const stored = localStorage.getItem('trust2pay_user');
    const user = stored ? JSON.parse(stored) : {};
    localStorage.setItem('trust2pay_user', JSON.stringify({ ...user, name, phone, email, notifications, biometric, currency }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className="relative w-12 h-6 rounded-full transition-all duration-300"
      style={{ background: value ? '#2D7A4F' : '#e2e8f0' }}>
      <span
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300"
        style={{ left: value ? '26px' : '4px' }}
      />
    </button>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-5">
      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 px-1">{title}</p>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  );

  const Row = ({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) => (
    <div
      className="flex items-center justify-between px-5 py-4"
      style={{ borderBottom: last ? 'none' : '1px solid #f1f5f9' }}>
      <span className="text-slate-700 text-sm">{label}</span>
      {children}
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
            <h1 className="text-white font-bold text-xl leading-tight">Settings</h1>
            <p className="text-white/70 text-sm">Manage your account</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-5 max-w-lg mx-auto lg:max-w-2xl">

        {/* Profile Card */}
        <div
          className="flex items-center gap-4 p-5 rounded-2xl mb-5 bg-white shadow-sm"
          style={{ border: '1.5px solid rgba(45,122,79,0.2)' }}>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white text-xl shrink-0"
            style={{ background: '#2D7A4F' }}>
            {name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-800 font-bold text-base">{name}</p>
            <p className="text-slate-400 text-sm">{phone}</p>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold shrink-0"
            style={{ background: 'rgba(45,122,79,0.1)', color: '#2D7A4F' }}>
            {plan}
          </span>
        </div>

        {/* Personal Info */}
        <Section title="Personal Information">
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <p className="text-slate-400 text-xs mb-1">Display Name</p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-transparent text-slate-800 font-medium text-sm outline-none w-full"
            />
          </div>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <p className="text-slate-400 text-xs mb-1">Phone Number</p>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="bg-transparent text-slate-800 font-medium text-sm outline-none w-full"
            />
          </div>
          <div className="px-5 py-4">
            <p className="text-slate-400 text-xs mb-1">Email</p>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-transparent text-slate-800 font-medium text-sm outline-none w-full"
            />
          </div>
        </Section>

        {/* Preferences */}
        <Section title="Preferences">
          <Row label="Push Notifications">
            <Toggle value={notifications} onChange={setNotifications} />
          </Row>
          <Row label="Biometric Login">
            <Toggle value={biometric} onChange={setBiometric} />
          </Row>
          <Row label="Default Currency" last>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="bg-transparent text-slate-700 text-sm outline-none font-medium">
              <option value="NGN">NGN (₦)</option>
              <option value="GHS">GHS (₵)</option>
              <option value="KES">KES (KSh)</option>
              <option value="USD">USD ($)</option>
            </select>
          </Row>
        </Section>

        {/* Support */}
        <Section title="Help & Support">
          <Row label="📞 Contact Support">
            <a href="tel:+2349000333000" className="text-sm font-semibold" style={{ color: '#2D7A4F' }}>Call Us</a>
          </Row>
          <Row label="💬 WhatsApp Support">
            <a href="https://wa.me/2349000333000" target="_blank" className="text-sm font-semibold" style={{ color: '#25D366' }}>Open</a>
          </Row>
          <Row label="📟 USSD Help" last>
            <a href="tel:*333%23" className="text-sm font-semibold" style={{ color: '#2D7A4F' }}>Dial *333#</a>
          </Row>
        </Section>

        {/* Account */}
        <Section title="Account">
          <Row label="🔒 Change PIN">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" /></svg>
          </Row>
          <Row label="📄 Privacy Policy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" /></svg>
          </Row>
          <Row label="🚪 Sign Out" last>
            <button
              onClick={() => { localStorage.clear(); window.location.href = '/'; }}
              className="text-sm font-semibold text-red-500">
              Sign Out
            </button>
          </Row>
        </Section>

        <button
          onClick={saveSettings}
          className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:opacity-90 active:scale-95"
          style={{ background: saved ? 'rgba(45,122,79,0.6)' : '#2D7A4F' }}>
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>

        <p className="text-center text-slate-400 text-xs mt-6 pb-6">
          Trust2Pay v1.0 · Built for Hackers 🛠️
        </p>
      </div>
    </div>
  );
}
