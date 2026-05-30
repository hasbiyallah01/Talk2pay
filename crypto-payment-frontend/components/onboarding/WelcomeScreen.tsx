'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { T } from './T';

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="22" />
      </svg>
    ),
    title: 'AI-Powered',
    body: 'Just speak naturally to send/receive money',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: 'Lightning Fast',
    body: 'Instant Bitcoin Lightning payments',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: 'Accessible',
    body: 'Works on any phone, even featured phones',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <div className="onboarding-shell">
      <div className="onboarding-card">

        {/* Logo */}
        <motion.div
          className="welcome-logo"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
        >
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <rect width="52" height="52" rx="16" fill="url(#logoGrad)" />
            <path
              d="M26 14c-1.2 0-2.2.9-2.2 2v7.5c0 1.1.9 2 2.2 2s2.2-.9 2.2-2V16c0-1.1-1-2-2.2-2zm-7.5 5.5c-1.1.6-1.5 2-.9 3.1l3.7 6.4c.6 1 2 1.5 3.1.9 1.1-.6 1.5-2 .9-3.1L21.6 20c-.6-1.1-2-1.5-3.1-.9zm15 0c-1.1-.6-2.5-.2-3.1.9l-3.7 6.4c-.6 1.1-.2 2.5.9 3.1 1.1.6 2.5.2 3.1-.9l3.7-6.4c.6-1.1.2-2.5-.9-3.1zM15 28c0-1.2 1-2.2 2.2-2.2h17.6c1.2 0 2.2 1 2.2 2.2s-1 2.2-2.2 2.2h-17.6C16 30.2 15 29.2 15 28zm4.3 5.5c-.6 1.1-.2 2.5.9 3.1 1.1.6 2.5.2 3.1-.9l1-1.7h-3.2l-1.8-.5zm9.4-.5 1 1.7c.6 1.1 2 1.5 3.1.9 1.1-.6 1.5-2 .9-3.1l-1.8.5h-3.2z"
              fill="white"
            />
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1DB954" />
                <stop offset="100%" stopColor="#0A8C3A" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="welcome-headline"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }}
        >
          <T text="Send money with your voice." />
        </motion.h1>

        <motion.p
          className="welcome-sub"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <T text="Simple Bitcoin payments for everyone." />
        </motion.p>

        {/* Feature pills */}
        <div className="feature-list">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="feature-item"
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <span className="feature-icon">{f.icon}</span>
              <div>
                <p className="feature-title"><T text={f.title} /></p>
                <p className="feature-body"><T text={f.body} /></p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          className="btn-primary"
          onClick={() => router.push('/onboarding/language')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <T text="Get Started" />
          <span className="btn-arrow">↗</span>
        </motion.button>
      </div>
    </div>
  );
}