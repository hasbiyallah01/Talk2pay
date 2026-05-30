'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from './useTranslation';
import { T } from './T';

type AccessibilityState = {
  voiceMode: boolean;
  largeText: boolean;
  highContrast: boolean;
  hapticFeedback: boolean;
  screenReader: boolean;
};

const SETTINGS = [
  {
    key: 'voiceMode' as const,
    label: 'Voice Mode',
    description: 'Control Talk2Pay with your voice',
    feasible: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="22" />
      </svg>
    ),
  },
  {
    key: 'largeText' as const,
    label: 'Large Text',
    description: 'Easier to read text size',
    feasible: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
  },
  {
    key: 'highContrast' as const,
    label: 'High Contrast',
    description: 'Better visibility for texts and buttons',
    feasible: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2v20" />
        <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: 'hapticFeedback' as const,
    label: 'Haptic Feedback',
    description: 'Feel vibrations for actions',
    feasible: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
        <path d="M12 12v9" />
        <path d="m8 17 4 4 4-4" />
      </svg>
    ),
  },
  {
    key: 'screenReader' as const,
    label: 'Screen Reader & Support',
    description: 'Optimized for screen readers',
    feasible: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m4.93 4.93 14.14 14.14" />
      </svg>
    ),
  },
];

export default function AccessibilityScreen() {
  const router = useRouter();
  const { accessibility, setAccessibility } = useTranslation();
  const [settings, setSettings] = useState<AccessibilityState>(accessibility);

  useEffect(() => {
    setSettings(accessibility);
  }, [accessibility]);

  // Haptic via Vibration API if available
  const triggerHaptic = () => {
    if ('vibrate' in navigator) navigator.vibrate(30);
  };

  const toggle = (key: keyof AccessibilityState) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    if (key === 'hapticFeedback' && next.hapticFeedback) triggerHaptic();
    setAccessibility(next);
  };

  const handleContinue = () => {
    setAccessibility(settings);
    router.push('/onboarding/success');
  };

  const handleSkip = () => router.push('/onboarding/success');

  return (
    <div className={`onboarding-shell ${settings.highContrast ? 'high-contrast' : ''}`}>
      <div className="onboarding-card ">

        <motion.h1
          className="screen-title"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <T text="Accessibility Setup" />
        </motion.h1>

        <motion.p
          className="screen-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <T text="Customize your experience for better access" />
        </motion.p>

        <div className="toggle-list">
          {SETTINGS.map((s, i) => (
            <motion.div
              key={s.key}
              className="toggle-item"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.07, duration: 0.35 }}
            >
              <span className="toggle-icon">{s.icon}</span>
              <div className="toggle-text">
                <p className="toggle-label"><T text={s.label} /></p>
                <p className="toggle-desc">
                  <T text={s.description} />
                  {!s.feasible && <span className="toggle-badge"> · device only</span>}
                </p>
              </div>
              <button
                role="switch"
                aria-checked={settings[s.key]}
                aria-label={s.label}
                className={`toggle-switch ${settings[s.key] ? 'toggle-switch--on' : ''}`}
                onClick={() => toggle(s.key)}
              >
                <motion.span
                  className="toggle-thumb"
                  animate={{ x: settings[s.key] ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              </button>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="settings-note"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <T text="You can change these settings anytime in your profile" />
        </motion.p>

        <motion.button
          className="btn-primary"
          onClick={handleContinue}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <T text="Continue" />
        </motion.button>

        <motion.button
          className="btn-ghost"
          onClick={handleSkip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          <T text="Skip for now" />
        </motion.button>
      </div>
    </div>
  );
}