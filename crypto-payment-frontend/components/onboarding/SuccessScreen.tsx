'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { T } from './T';

const checks = [
  'Voice payments enabled',
  'Lightning Network ready',
  'AI assistant activated',
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.6 } },
};

const item = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function SuccessScreen() {
  const router = useRouter();

  return (
    <div className="onboarding-shell">
      <div className="onboarding-card onboarding-card--center">

        {/* Illustration */}
        <motion.div
          className="success-illustration"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
        >
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="54" fill="#E8F8EF" />
            <circle cx="60" cy="60" r="38" fill="#C6EED6" />
            <path
              d="M42 62l12 12 24-26"
              stroke="#16A34A"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* decorative coin */}
            <circle cx="96" cy="28" r="10" fill="#D1FAE5" />
            <text x="96" y="32" textAnchor="middle" fontSize="10" fill="#16A34A" fontWeight="700">$</text>
            {/* decorative small dot */}
            <circle cx="22" cy="90" r="6" fill="#BBF7D0" />
          </svg>
        </motion.div>

        <motion.h1
          className="success-title"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <T text="Wallet Created!" />
        </motion.h1>

        <motion.p
          className="success-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.35 }}
        >
          <T text="Your Talk2Pay wallet is ready. Start sending money with your voice." />
        </motion.p>

        {/* Checklist */}
        <motion.ul
          className="success-list"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {checks.map((c, i) => (
            <motion.li key={c} className="success-item" variants={item}>
              <span className="success-number">{i + 1}</span>
              <T text={c} />
            </motion.li>
          ))}
        </motion.ul>

        <motion.button
          className="btn-primary"
          onClick={() => {
            localStorage.setItem('t2p_onboarding_completed', 'true');
            router.push('/dashboard');
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <T text="Start Using Talk2Pay" />
        </motion.button>
      </div>
    </div>
  );
}