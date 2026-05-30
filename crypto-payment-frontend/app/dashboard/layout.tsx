'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { T } from '@/components/onboarding/T';

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"
          stroke={active ? '#2D7A4F' : '#94a3b8'}
          strokeWidth="2"
          fill={active ? 'rgba(45,122,79,0.12)' : 'none'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M9 21V12h6v9" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard/send',
    label: 'Send',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard/receive',
    label: 'Receive',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" />
        <polyline points="7 10 12 15 17 10" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="15" x2="12" y2="3" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard/history',
    label: 'History',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" />
        <polyline points="12 7 12 12 15 15" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard/cards',
    label: 'Savings',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" />
        <path d="M12 6v6l4 2" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke={active ? '#2D7A4F' : '#94a3b8'} strokeWidth="2" />
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
          stroke={active ? '#2D7A4F' : '#94a3b8'}
          strokeWidth="2"
        />
      </svg>
    ),
  },
];

// QR Scanner icon component
function QRScanIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {/* Top-left corner */}
      <path d="M3 9V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Top-right corner */}
      <path d="M15 3h4a2 2 0 0 1 2 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Bottom-right corner */}
      <path d="M21 15v4a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Bottom-left corner */}
      <path d="M9 21H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Inner QR squares */}
      <rect x="7" y="7" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="7" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="13" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="14" width="1.5" height="1.5" fill="currentColor" />
      <rect x="16" y="14" width="1.5" height="1.5" fill="currentColor" />
      <rect x="14" y="16" width="1.5" height="1.5" fill="currentColor" />
    </svg>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  // Only show the mobile top bar on the main dashboard home
  const isHome = pathname === '/dashboard';

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-slate-100 fixed top-0 left-0 z-30 shadow-sm">
        {/* Logo */}
        <div className="hidden md:flex items-center gap-3 px-6 py-6 border-b border-slate-100">
          <div>
            <img src="/logo.svg" alt="Trust2Pay Logo" className="w-12 h-12" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-tight">Talk2Pay</p>
            <p className="text-xs text-slate-400">Dashboard</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-green-50 text-green-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                {item.icon(active)}
                <T text={item.label} />
              </Link>
            );
          })}

          <div className="px- pb-3">
          <Link
            href="/dashboard/scan"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-slate-500 hover:bg-slate-50 hover:text-[#2D7A4F]"
          >
            <QRScanIcon />
            <span>Scan QR Code</span>
          </Link>
        </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-red-600 hover:bg-red-50 cursor-pointer mt-4"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <T text="Logout" />
          </button>
        </nav>

        {/* Desktop: QR Scan button */}
        

       
      </aside>

      {/* ── Main content area ───────────────────────────── */}
      <div className="flex-1 flex flex-col lg:ml-64">

      

        {/* Page content */}
        <main className="flex-1 overflow-auto pb-24 lg:pb-8">
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* ── Bottom Nav (mobile only) ─────────────────── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-100 shadow-lg">
          <div className="flex items-center justify-around px-1 py-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all"
                >
                  {item.icon(active)}
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: active ? '#2D7A4F' : '#94a3b8' }}
                  >
                    <T text={item.label} />
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}