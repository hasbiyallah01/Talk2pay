'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMerchantProfile } from '../../lib/api';
import { useTranslation } from '@/components/onboarding/useTranslation';
import { LANGUAGES } from '@/components/onboarding/useTranslation';
import { T } from '@/components/onboarding/T';

export default function Settings() {
  const router = useRouter();
  const { langCode, setLangCode, accessibility, setAccessibility } = useTranslation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [currency, setCurrency] = useState('NGN');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [plan] = useState('Premium');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const stored = JSON.parse(localStorage.getItem('trust2pay_user') || '{}');
      setName(stored.firstName || stored.name || '');
      setPhone(stored.phoneNumber || stored.phone || '');
      setEmail(stored.email || '');
      setNotifications(stored.notifications ?? true);
      setBiometric(stored.biometric ?? false);
      setCurrency(stored.currency || 'NGN');

      try {
        const profile = await getMerchantProfile();
        setName(profile.firstName || stored.firstName || '');
        setPhone(profile.phoneNumber || stored.phone || '');
        localStorage.setItem('trust2pay_user', JSON.stringify({
          ...stored,
          ...profile,
          balance: stored.balance,
          firstName: profile.firstName,
          phoneNumber: profile.phoneNumber,
        }));
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const saveSettings = () => {
    const stored = JSON.parse(localStorage.getItem('trust2pay_user') || '{}');
    localStorage.setItem('trust2pay_user', JSON.stringify({
      ...stored,
      firstName: name,
      name,
      phone,
      email,
      notifications,
      biometric,
      currency,
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('trust2pay_token');
    localStorage.removeItem('trust2pay_user');
    router.replace('/auth/login');
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="relative w-12 h-6 rounded-full transition-all duration-300"
      style={{ background: value ? '#2D7A4F' : '#e2e8f0' }}
    >
      <span
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300"
        style={{ left: value ? '26px' : '4px' }}
      />
    </button>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-5">
      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 px-1">{title}</p>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">{children}</div>
    </div>
  );

  const Row = ({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) => (
    <div
      className="flex items-center justify-between px-5 py-4"
      style={{ borderBottom: last ? 'none' : '1px solid #f1f5f9' }}
    >
      <span className="text-slate-700 text-sm">{label}</span>
      {children}
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-[#f5f7f5]">
      <div className="bg-[#2D7A4F] h-36 animate-pulse" />
      <div className="px-4 py-4 space-y-3">
        {[80, 120, 80].map((h, i) => (
          <div key={i} className="rounded-2xl bg-slate-200 animate-pulse" style={{ height: h }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f7f5]">
      {/* Header */}
      <div className="bg-[#2D7A4F] px-4 pt-10 pb-6">
        <div className="flex items-center gap-3 max-w-lg mx-auto lg:max-w-2xl">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div>
            <h1 className="text-white font-bold text-xl"><T text="Settings" /></h1>
            <p className="text-white/70 text-sm"><T text="Manage your account" /></p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto lg:max-w-2xl">
        {/* Profile Card */}
        <div
          className="flex items-center gap-4 p-5 rounded-2xl mb-5 bg-white shadow-sm"
          style={{ border: '1.5px solid rgba(45,122,79,0.2)' }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white text-xl shrink-0"
            style={{ background: '#2D7A4F' }}
          >
            {name.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-800 font-bold text-base">{name || 'Merchant'}</p>
            <p className="text-slate-400 text-sm">{phone}</p>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold shrink-0"
            style={{ background: 'rgba(45,122,79,0.1)', color: '#2D7A4F' }}
          >
            {plan}
          </span>
        </div>

        {/* Personal Info */}
        <Section title="Personal Information">
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <p className="text-slate-400 text-xs mb-1"><T text="Display Name" /></p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-transparent text-slate-800 font-medium text-sm outline-none w-full"
            />
          </div>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <p className="text-slate-400 text-xs mb-1"><T text="Phone Number" /></p>
            <input
              value={phone}
              readOnly
              className="bg-transparent text-slate-500 font-medium text-sm outline-none w-full cursor-not-allowed"
            />
            <p className="text-slate-300 text-xs mt-0.5"><T text="Phone cannot be changed" /></p>
          </div>
          <div className="px-5 py-4">
            <p className="text-slate-400 text-xs mb-1"><T text="Email (Optional)" /></p>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-transparent text-slate-800 font-medium text-sm outline-none w-full placeholder-slate-300"
            />
          </div>
        </Section>

        {/* ── Language Preferences ── */}
        <Section title="Language">
          <div className="px-5 py-4">
            <p className="text-slate-400 text-xs mb-3"><T text="Select your preferred app language" /></p>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLangCode(lang.code)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all"
                  style={{
                    background: langCode === lang.code ? 'rgba(45,122,79,0.08)' : '#f8fafc',
                    borderColor: langCode === lang.code ? '#2D7A4F' : '#e2e8f0',
                    color: langCode === lang.code ? '#2D7A4F' : '#475569',
                  }}
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0 border-2 flex items-center justify-center"
                    style={{ borderColor: langCode === lang.code ? '#2D7A4F' : '#cbd5e1' }}
                  >
                    {langCode === lang.code && (
                      <span className="w-2 h-2 rounded-full bg-[#2D7A4F]" />
                    )}
                  </span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
            {langCode === 'pcm' && (
              <p className="text-slate-400 text-xs mt-3 px-1">
                Nigerian Pidgin translation coming soon — app will display in English for now.
              </p>
            )}
          </div>
        </Section>

        {/* ── Accessibility Preferences ── */}
        <Section title="Accessibility">
          <Row label="🎙️ Voice Mode">
            <Toggle
              value={accessibility.voiceMode}
              onChange={v => setAccessibility({ ...accessibility, voiceMode: v })}
            />
          </Row>
          <Row label="🔡 Large Text">
            <Toggle
              value={accessibility.largeText}
              onChange={v => setAccessibility({ ...accessibility, largeText: v })}
            />
          </Row>
          <Row label="◑ High Contrast">
            <Toggle
              value={accessibility.highContrast}
              onChange={v => setAccessibility({ ...accessibility, highContrast: v })}
            />
          </Row>
          <Row label="📳 Haptic Feedback">
            <Toggle
              value={accessibility.hapticFeedback}
              onChange={v => {
                setAccessibility({ ...accessibility, hapticFeedback: v });
                if (v && 'vibrate' in navigator) navigator.vibrate(60);
              }}
            />
          </Row>
          <Row label="🔊 Screen Reader" last>
            <Toggle
              value={accessibility.screenReader}
              onChange={v => setAccessibility({ ...accessibility, screenReader: v })}
            />
          </Row>
        </Section>

        {/* App Preferences */}
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
              className="bg-transparent text-slate-700 text-sm outline-none font-medium"
            >
              <option value="NGN">NGN (₦)</option>
              <option value="GHS">GHS (₵)</option>
              <option value="KES">KES (KSh)</option>
              <option value="USD">USD ($)</option>
            </select>
          </Row>
        </Section>

        {/* Support */}
        <Section title="Help &amp; Support">
          <Row label="📞 Contact Support">
            <a href="tel:+2349000333000" className="text-sm font-semibold" style={{ color: '#2D7A4F' }}>Call Us</a>
          </Row>
          <Row label="💬 WhatsApp Support">
            <a href="https://wa.me/2349000333000" target="_blank" rel="noreferrer" className="text-sm font-semibold" style={{ color: '#25D366' }}>Open</a>
          </Row>
          <Row label="📟 USSD Help" last>
            <a href="tel:*333%23" className="text-sm font-semibold" style={{ color: '#2D7A4F' }}>Dial *333#</a>
          </Row>
        </Section>

        {/* Account */}
        <Section title="Account">
          <Row label="📄 Privacy Policy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" /></svg>
          </Row>
          <Row label="🚪 Sign Out" last>
            <button onClick={handleLogout} className="text-sm font-semibold text-red-500">Sign Out</button>
          </Row>
        </Section>

        <button
          onClick={saveSettings}
          className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:opacity-90 active:scale-95"
          style={{ background: saved ? 'rgba(45,122,79,0.6)' : '#2D7A4F' }}
        >
          {saved ? '✓ Saved!' : <T text="Save Changes" />}
        </button>

        <p className="text-center text-slate-400 text-xs mt-6 pb-6">
          Talk2Pay v1.0 · Built for Africa 🌍
        </p>
      </div>
    </div>
  );
}