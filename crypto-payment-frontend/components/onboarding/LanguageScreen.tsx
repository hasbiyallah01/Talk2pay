'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LANGUAGES } from './useTranslation';
import { useTranslation } from './useTranslation';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function LanguageScreen() {
  const router = useRouter();
  const { langCode, setLangCode } = useTranslation();
  const [selected, setSelected] = useState(langCode);

  const handleContinue = () => {
    setLangCode(selected);
    router.push('/onboarding/accessibility');
  };

  return (
    <div className="onboarding-shell">
      <div className="onboarding-card">

        <motion.h1
          className="screen-title"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Choose your language
        </motion.h1>

        <motion.p
          className="screen-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          Select your preferred language for the app
        </motion.p>

        <div className="lang-list">
          {LANGUAGES.map((lang, i) => (
            <motion.button
              key={lang.code}
              className={`lang-item ${selected === lang.code ? 'lang-item--active' : ''}`}
              onClick={() => setSelected(lang.code)}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              whileTap={{ scale: 0.98 }}
            >
             <div>
                <p className="lang-label">{lang.label}</p>
                <p className="lang-native">{lang.native}</p>
              </div>
              <span className="lang-radio">
                {selected === lang.code && (
                  <motion.span
                    className="lang-radio-dot"
                    layoutId="radio-dot"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </span>
            </motion.button>
          ))}
        </div>

        {selected === 'pcm' && (
          <motion.p
            className="lang-notice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Nigerian Pidgin translation coming soon — app will display in English for now.
          </motion.p>
        )}

        <motion.button
          className="btn-primary"
          onClick={handleContinue}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
}