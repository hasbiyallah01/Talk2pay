'use client';
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import PhoneMockup from './PhoneMockup';

const features = [
  {
    id: 'voice' as const,
    tag: 'BUILT FOR EVERYONE',
    title: 'VOICE AUTOMATION',
    body: 'Speak naturally in any language. Talk2Pay understands your intent, confirms the transaction, and executes instantly — no forms, no friction, just conversation.',
  },
  {
    id: 'scan' as const,
    tag: 'SEAMLESS',
    title: 'SCAN ANYWHERE ANYTIME',
    body: 'Point your camera at any QR code — merchant, personal, or system-generated. Payment initiates in under a second. No app switching required.',
  },
  {
    id: 'whatsapp' as const,
    tag: 'FAMILIAR INTERFACE',
    title: 'WHATSAPP INTEGRATION',
    body: 'Your most-used app becomes your wallet. Type naturally in WhatsApp and Talk2Pay AI parses intent, verifies identity, and completes the transfer.',
  },
  {
    id: 'language' as const,
    tag: 'TRULY INCLUSIVE',
    title: 'ANY LANGUAGE',
    body: 'Hausa, Yoruba, Igbo, Pidgin, English — Talk2Pay speaks every tongue. Financial access should never be blocked by the language you were born into.',
  },
  {
    id: 'accessibility' as const,
    tag: 'EVERYONE BELONGS',
    title: 'ACCESSIBILITY FIRST',
    body: 'Full screen reader support, voice navigation, high contrast modes, and large text. Finance designed for every human, regardless of ability.',
  },
  {
    id: 'payment' as const,
    tag: 'REAL-TIME',
    title: 'INSTANT PAYMENTS',
    body: 'Transactions that close before the conversation ends. Sub-second settlement across banks, wallets, and payment rails — powered by AI orchestration.',
  },
  {
    id: 'ussd' as const,
    tag: 'NO SMARTPHONE NEEDED',
    title: 'FEATURE PHONE SUPPORT',
    body: 'Dial *347# from any phone. No internet. No app. Full banking power through USSD — reaching the 200M+ users still on 2G networks.',
  },
];

export default function FeatureStorytelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isMobile, setIsMobile] = useState(true); // Default true or false doesn't matter much with useEffect

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({ 
    target: containerRef, 
    offset: ['start start', 'end end'] 
  });

  // Phone drifts smoothly from center to right as user enters section
  const phoneX = useTransform(
    scrollYProgress,
    [0, 0.18],
    ['0px', '280px'],
    { clamp: true }
  );

  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => {
      // Features begin cycling after phone has settled to the right (0.18+)
      const featureProgress = Math.max(0, (v - 0.18) / 0.78);
      const idx = Math.min(features.length - 1, Math.floor(featureProgress * features.length));
      setActiveFeature(idx);
    });
    return unsub;
  }, [scrollYProgress]);

  const feature = features[activeFeature];

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${(features.length + 2) * 100}vh`, background: '#fafafa' }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        
        {/* Background gradient based on active */}
        <div className="absolute inset-0 transition-all duration-1000" style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(45,122,79,0.06) 0%, transparent 60%)'
        }} />

        {/* Left: Feature text */}
        <div className="absolute z-50 top-24 md:top-auto left-6 right-6 md:left-16 md:right-auto md:w-[420px] z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-candal text-[#2D7A4F] text-xs tracking-[0.3em] mb-4  ">
                {feature.tag}
              </p>
              <h2 className="font-candal text-black leading-[0.92] mb-6"
                style={{ fontSize: 'clamp(32px, 8vw, 64px)' }}>
                {feature.title}
              </h2>
              <p className="font-neue text-black/50 text-base leading-relaxed md:max-w-[340px]">
                {feature.body}
              </p>

             
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Phone — starts centered, drifts right as user scrolls */}
        <motion.div
          style={{ x: isMobile ? 0 : phoneX }}
          className="absolute bottom-0 md:bottom-auto left-1/2 -translate-x-1/2 flex items-center justify-center scale-[0.65] sm:scale-75 md:scale-100 origin-bottom md:origin-center"
          transition={{ type: 'spring', stiffness: 60, damping: 20 }}
        >
          <div className="">
            <PhoneMockup highlight={feature.id} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
