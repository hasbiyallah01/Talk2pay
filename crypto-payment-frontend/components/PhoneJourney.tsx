import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import SplitText from './SplitText';
import PhoneMockup from './PhoneMockup';
import HeroSection from './HeroSection';
import FeatureStorytelling from './FeatureStorytelling';

/* ─── Feature list ─────────────────────────────────────── */
const features = [
  { id: 'voice' as const, tag: 'BUILT FOR EVERYONE', title: 'VOICE AUTOMATION', body: 'Speak naturally in any language. Trust2Pay understands your intent, confirms the transaction, and executes instantly — no forms, no friction, just conversation.' },
  { id: 'scan' as const, tag: 'SEAMLESS', title: 'SCAN ANYWHERE ANYTIME', body: 'Point your camera at any QR code — merchant, personal, or system-generated. Payment initiates in under a second. No app switching required.' },
  { id: 'whatsapp' as const, tag: 'FAMILIAR INTERFACE', title: 'WHATSAPP INTEGRATION', body: 'Your most-used app becomes your wallet. Type naturally in WhatsApp and Trust2Pay AI parses intent, verifies identity, and completes the transfer.' },
  { id: 'language' as const, tag: 'TRULY INCLUSIVE', title: 'ANY LANGUAGE', body: 'Hausa, Yoruba, Igbo, Pidgin, English — Trust2Pay speaks every tongue. Financial access should never be blocked by the language you were born into.' },
  { id: 'accessibility' as const, tag: 'EVERYONE BELONGS', title: 'ACCESSIBILITY FIRST', body: 'Full screen reader support, voice navigation, high contrast modes, and large text. Finance designed for every human, regardless of ability.' },
  { id: 'payment' as const, tag: 'REAL-TIME', title: 'INSTANT PAYMENTS', body: 'Transactions that close before the conversation ends. Sub-second settlement across banks, wallets, and payment rails — powered by AI orchestration.' },
  { id: 'ussd' as const, tag: 'NO SMARTPHONE NEEDED', title: 'FEATURE PHONE SUPPORT', body: 'Dial *347# from any phone. No internet. No app. Full banking power through USSD — reaching the 200M+ users still on 2G networks.' },
];

type FeatureId = typeof features[number]['id'] | 'none';

const TOTAL_FRAMES = 241;

// ─── Scroll zones ───────────────────────────────────────
const FRAME_ANIM_END = 0.18;
const FEATURE_START = 0.20;
const DASHBOARD_FRAME = 195;

const SCREEN = {
  leftPct: 0.515,
  rightPct: 0.765,
  topPct: 0.109,
  bottomPct: 0.897,
};

/* ─── Dashboard UI ──────────────────────────────────────── */
function Dashboard({ highlight }: { highlight: FeatureId }) {
  const isBlurred = (f: FeatureId) => highlight !== 'none' && highlight !== f;

  return (
    <div className="w-full px-2 h-full flex flex-col overflow-hidden" style={{ background: '#f5f5f7', fontFamily: 'Manrope, sans-serif' }}>
      <div className="flex items-center justify-between px-3 pt-6 pb-1 shrink-0">
        <span className="text-black/70 text-[9px] font-bold">9:41</span>
        <div className="flex items-center gap-0.5">
          <svg width="10" height="8" viewBox="0 0 12 9" fill="black">
            <rect x="0" y="3" width="2" height="6" rx="0.5" opacity="0.3" />
            <rect x="3" y="2" width="2" height="7" rx="0.5" opacity="0.5" />
            <rect x="6" y="1" width="2" height="8" rx="0.5" opacity="0.8" />
            <rect x="9" y="0" width="2" height="9" rx="0.5" />
          </svg>
          <svg width="9" height="8" viewBox="0 0 10 9" fill="black">
            <rect x="1" y="3" width="8" height="5" rx="1" stroke="black" strokeWidth="1" fill="none" opacity="0.4" />
            <rect x="2" y="4" width="5" height="3" rx="0.5" fill="black" opacity="0.8" />
          </svg>
        </div>
      </div>

      <div className="px-3 pb-1 flex items-center justify-between shrink-0">
        <div>
          <p className="text-black/35 text-[7px] font-medium tracking-wider">TRUST2PAY</p>
          <p className="text-black text-[11px] font-bold leading-tight">Good morning, David</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-[#2D7A4F] flex items-center justify-center shrink-0">
          <span className="text-white text-[9px] font-bold">D</span>
        </div>
      </div>

      <motion.div
        className="mx-3 mb-2 rounded-xl p-3 shrink-0"
        style={{ background: 'linear-gradient(135deg,#2D7A4F 0%,#1f5c3a 100%)', boxShadow: '0 4px 16px rgba(45,122,79,0.28)' }}
        animate={{ opacity: isBlurred('payment') ? 0.4 : 1, filter: isBlurred('payment') ? 'blur(2px)' : 'none' }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-white/60 text-[7px] tracking-wider mb-0.5">WALLET BALANCE</p>
        <p className="text-white text-sm font-bold">₦ 247,850.00</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-white/50 text-[7px]">**** **** 4821</span>
          <span className="text-green-300 text-[7px]">● Active</span>
        </div>
      </motion.div>

      <div className="px-3 mb-2 shrink-0">
        <div className="grid grid-cols-4 gap-1.5">
          {[{ icon: '↑', label: 'Send' }, { icon: '↓', label: 'Receive' }, { icon: '⊞', label: 'Scan' }, { icon: '⋯', label: 'More' }].map(a => (
            <motion.div key={a.label} className="flex flex-col items-center gap-1"
              animate={{
                opacity: highlight === 'scan' && a.label === 'Scan' ? 1 : highlight !== 'none' && !(highlight === 'scan' && a.label === 'Scan') ? 0.3 : 1,
                filter: highlight === 'scan' && a.label === 'Scan' ? 'none' : highlight !== 'none' ? 'blur(1px)' : 'none',
                scale: highlight === 'scan' && a.label === 'Scan' ? 1.1 : 1,
              }} transition={{ duration: 0.5 }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'white', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <span className="text-black/60 text-xs">{a.icon}</span>
              </div>
              <span className="text-black/35 text-[7px]">{a.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div className="mx-3 mb-1.5 rounded-xl p-2.5 shrink-0"
        style={{ background: 'white', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}
        animate={{
          opacity: isBlurred('voice') ? 0.3 : 1,
          filter: isBlurred('voice') ? 'blur(2px)' : 'none',
          scale: highlight === 'voice' ? 1.02 : 1,
          borderColor: highlight === 'voice' ? 'rgba(45,122,79,0.5)' : 'rgba(0,0,0,0.04)',
        }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: '#2D7A4F' }}>
            <span className="text-white text-[10px]">🎙</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-black text-[9px] font-semibold">Voice Command</p>
            <p className="text-black/35 text-[7px]">Tap to speak</p>
          </div>
          <div className="flex gap-px items-end h-3 shrink-0">
            {[3, 5, 4, 6, 3, 5, 4].map((ht, i) => (
              <motion.div key={i} className="w-0.5 rounded-full bg-[#2D7A4F]"
                animate={{ height: highlight === 'voice' ? [ht * 2, ht * 3, ht * 2] : ht * 2 }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }} />
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div className="mx-3 mb-1.5 rounded-xl p-2.5 shrink-0"
        style={{ background: 'white', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid rgba(37,211,102,0.12)' }}
        animate={{
          opacity: isBlurred('whatsapp') ? 0.3 : 1,
          filter: isBlurred('whatsapp') ? 'blur(2px)' : 'none',
          scale: highlight === 'whatsapp' ? 1.02 : 1,
          borderColor: highlight === 'whatsapp' ? 'rgba(37,211,102,0.5)' : 'rgba(37,211,102,0.12)',
        }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-[#25D366]">
            <span className="text-white text-[10px]">💬</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-black text-[9px] font-semibold">WhatsApp Pay</p>
            <p className="text-black/35 text-[7px]">Send ₦500 to David</p>
          </div>
          <span className="text-[#25D366] text-[7px] font-bold shrink-0">SENT</span>
        </div>
      </motion.div>

      <motion.div className="mx-3 mb-1.5 rounded-xl p-2.5 shrink-0"
        style={{ background: 'white', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}
        animate={{
          opacity: isBlurred('language') && isBlurred('accessibility') && isBlurred('ussd') ? 0.3 : 1,
          filter: isBlurred('language') && isBlurred('accessibility') && isBlurred('ussd') ? 'blur(2px)' : 'none',
          scale: (highlight === 'language' || highlight === 'accessibility' || highlight === 'ussd') ? 1.02 : 1,
          borderColor: (highlight === 'language' || highlight === 'accessibility' || highlight === 'ussd') ? 'rgba(45,122,79,0.4)' : 'rgba(0,0,0,0.04)',
        }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-2 w-full">
          {highlight === 'language' && (<>
            <span className="text-sm shrink-0">🌍</span>
            <div className="flex-1 min-w-0">
              <p className="text-black text-[9px] font-semibold">Any Language</p>
              <div className="flex gap-1 mt-0.5 flex-wrap">
                {['EN', 'HA', 'YO', 'IG'].map(l => (
                  <span key={l} className="text-[6px] px-1 py-0.5 rounded-full text-white" style={{ background: '#2D7A4F' }}>{l}</span>
                ))}
              </div>
            </div>
          </>)}
          {highlight === 'accessibility' && (<>
            <span className="text-sm shrink-0">♿</span>
            <div className="flex-1"><p className="text-black text-[9px] font-semibold">Accessibility</p><p className="text-black/35 text-[7px]">Screen reader • Voice nav</p></div>
          </>)}
          {highlight === 'ussd' && (<>
            <span className="text-sm shrink-0">📱</span>
            <div className="flex-1"><p className="text-black text-[9px] font-semibold">USSD *347#</p><p className="text-black/35 text-[7px]">Feature phones supported</p></div>
          </>)}
          {!['language', 'accessibility', 'ussd'].includes(highlight) && (
            <div className="flex items-center gap-2 w-full">
              <div className="flex gap-1.5"><span className="text-black/25 text-xs">🌍</span><span className="text-black/25 text-xs">♿</span><span className="text-black/25 text-xs">📱</span></div>
              <span className="text-black/20 text-[7px]">More features</span>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div className="mx-3 rounded-xl p-2.5 shrink-0"
        style={{ background: 'white', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid rgba(45,122,79,0.1)' }}
        animate={{
          opacity: isBlurred('payment') ? 0.3 : 1,
          filter: isBlurred('payment') ? 'blur(2px)' : 'none',
          scale: highlight === 'payment' ? 1.02 : 1,
          borderColor: highlight === 'payment' ? 'rgba(45,122,79,0.5)' : 'rgba(45,122,79,0.1)',
        }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#2D7A4F] flex items-center justify-center shrink-0">
              <span className="text-white text-[8px]">✓</span>
            </div>
            <div><p className="text-black text-[9px] font-semibold">Payment Sent</p><p className="text-black/35 text-[7px]">₦500 → David</p></div>
          </div>
          <span className="text-[#2D7A4F] text-[7px] font-bold">INSTANT</span>
        </div>
      </motion.div>

      <div className="mt-auto pb-1.5 flex justify-center shrink-0">
        <div className="w-16 h-0.5 bg-black/15 rounded-full" />
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */
interface PhoneJourneyProps {
  onProgress?: (pct: number) => void;
  onLoaded?: () => void;
}

export default function PhoneJourney({ onProgress, onLoaded }: PhoneJourneyProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedRef = useRef(0);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number>(0);

  const [activeFeature, setActiveFeature] = useState(0);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isFeaturePhase, setIsFeaturePhase] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 672, h: 448 });

  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  /* ── Preload all frames ─────────────────────────────── */
  useEffect(() => {
    if (!mounted) return;
    if (!isDesktop) {
      onProgress?.(100);
      onLoaded?.();
      setAllLoaded(true);
      return;
    }

    const total = TOTAL_FRAMES;
    imagesRef.current = new Array(total);
    loadedRef.current = 0;

    for (let i = 0; i < total; i++) {
      const img = new Image();
      const num = String(i + 1).padStart(3, '0');
      img.src = `/frames/f${num}.webp`;
      img.onload = () => {
        imagesRef.current[i] = img;
        loadedRef.current += 1;
        const pct = Math.round((loadedRef.current / total) * 100);
        onProgress?.(pct);
        if (loadedRef.current === total) {
          setAllLoaded(true);
          drawFrame(0);
          onLoaded?.();
        }
      };
    }
  }, [mounted, isDesktop]);

  /* ── Draw a frame to canvas ─────────────────────────── */
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[frameIndex];
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, []);

  /* ── Respond to scroll ──────────────────────────────── */
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!isDesktop) return;
    // Frame scrubbing
    const framePct = Math.min(v / FRAME_ANIM_END, 1);
    const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(framePct * (TOTAL_FRAMES - 1)));

    if (frameIndex !== currentFrameRef.current) {
      currentFrameRef.current = frameIndex;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => drawFrame(frameIndex));
    }

    setShowDashboard(frameIndex >= DASHBOARD_FRAME);

    const inFeaturePhase = v >= FEATURE_START;
    setIsFeaturePhase(inFeaturePhase);

    if (inFeaturePhase) {
      const progress = (v - FEATURE_START) / (1 - FEATURE_START);
      const idx = Math.min(features.length - 1, Math.floor(progress * features.length));
      setActiveFeature(idx);
    }
  });

  /* ── Canvas sizing ──────────────────────────────────── */
  useEffect(() => {
    if (!isDesktop) return;
    const updateSize = () => {
      const vh = window.innerHeight;
      const scale = vh / 448;
      setCanvasSize({ w: 672 * scale, h: 448 * scale });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isDesktop]);

  const feature = features[activeFeature];
  const featureHighlight: FeatureId = (showDashboard && isFeaturePhase) ? feature.id : 'none';

  const screenLeft = canvasSize.w * SCREEN.leftPct;
  const screenTop = canvasSize.h * SCREEN.topPct;
  const screenWidth = canvasSize.w * (SCREEN.rightPct - SCREEN.leftPct);
  const screenHeight = canvasSize.h * (SCREEN.bottomPct - SCREEN.topPct);

  const heroOpacity = useTransform(scrollYProgress, [0, 0.10], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], ["0vh", "-100vh"]);
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  if (mounted && !isDesktop) {
    return (
      <div className="w-full">
        <HeroSection />
        <FeatureStorytelling />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      // 5 scroll-sections per feature + 4 for intro/outro
      style={{ height: `${(features.length * 2 + 4) * 200}vh`, position: 'relative' }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0" style={{ background: '#2D7A4F' }} />

        {/* ── Hero headline ─────────────────────────── */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="absolute top-0 left-0 right-0 flex flex-col items-center pt-40 z-10 pointer-events-none"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-neue text-white/60 text-sm tracking-[0.3em] uppercase mb-6"
          >
            AI-Powered Financial Platform
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="font-candal text-white text-center leading-[0.92] tracking-tight"
            style={{ fontSize: 'clamp(56px, 9vw, 130px)' }}
          >
            TALK TO MONEY
            <br />
            <span style={{ WebkitTextStroke: '2px rgba(255,255,255,0.4)', color: 'transparent' }}>NATURALLY</span>
          </motion.h1>
        </motion.div>

        {/* ── Feature text (left side) ──────────────────────────────────────────
            OPACITY RULE: the outer wrapper is driven by a boolean (isFeaturePhase),
            NOT by scrollYProgress. This means once it appears it is locked at
            opacity:1 forever — scroll position cannot dim it.
            The inner AnimatePresence only animates content IN (no exit fade).
        ──────────────────────────────────────────────────────────────────────── */}
        <motion.div
          animate={{ opacity: isFeaturePhase ? 1 : 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute left-12 xl:left-20 top-1/2 -translate-y-1/2 w-80 xl:w-96 z-10"
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              // NO exit prop — content stays fully visible until the next one takes over
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col"
            >
              <SplitText
                text={feature.tag}
                tag="p"
                splitType="chars"
                className="font-candal text-green-300 text-xs tracking-[0.3em] mb-4"
                textAlign="left"
                delay={20}
                duration={0.5}
                ease="power3.out"
                from={{ opacity: 0, y: 16 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0}
                rootMargin="0px"
              />
              <SplitText
                text={feature.title}
                tag="h2"
                splitType="chars"
                className="font-candal text-white leading-[0.9] pt-5"
                textAlign="left"
                style={{ fontSize: 'clamp(32px, 3.5vw, 58px)' } as React.CSSProperties}
                delay={14}
                duration={0.8}
                ease="power3.out"
                from={{ opacity: 0, y: 30 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0}
                rootMargin="0px"
              />
              <SplitText
                text={feature.body}
                tag="p"
                splitType="words"
                className="font-neue text-white text-sm xl:text-base pt-2 leading-relaxed"
                textAlign="left"
                delay={25}
                duration={0.7}
                ease="power2.out"
                from={{ opacity: 0, y: 12 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0}
                rootMargin="0px"
              />
              <div className="flex gap-2 pt-8">
                {features.map((_, i) => (
                  <div
                    key={i}
                    className="h-0.5 rounded-full transition-all duration-500"
                    style={{
                      width: i === activeFeature ? 32 : 12,
                      background: i === activeFeature ? '#ffffff' : 'rgba(255,255,255,0.35)',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ── Canvas + dashboard overlay ─────────────── */}
        <div className="relative z-20" style={{ width: canvasSize.w, height: canvasSize.h }}>
          {/* Loading UI lives in <LoadingScreen> — nothing to render here */}

          <canvas
            ref={canvasRef}
            width={canvasSize.w}
            height={canvasSize.h}
            className="absolute inset-0"
            style={{ opacity: allLoaded ? 1 : 0, transition: 'opacity 0.4s ease' }}
          />

          <AnimatePresence>
            {showDashboard && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                className="absolute overflow-hidden"
                style={{
                  left: screenLeft,
                  top: screenTop,
                  width: screenWidth,
                  height: screenHeight,
                  transform: 'perspective(600px) rotateY(-12deg) rotateZ(1.5deg)',
                  transformOrigin: 'left center',
                  borderRadius: '28px',
                  overflow: 'hidden',
                  border: '8px solid #d4d4d8',
                  boxShadow: 'inset 0 0 0 2px #111, inset 0 0 10px rgba(0,0,0,0.2)',
                  boxSizing: 'border-box',
                }}
              >
                <Dashboard highlight={featureHighlight} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scroll indicator */}
        <motion.div
          style={{ opacity: indicatorOpacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 pointer-events-none"
        >
          <span className="font-neue text-white/40 text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-8 bg-linear-to-b from-white/40 to-transparent"
          />
        </motion.div>
      </div>
    </div>
  );
}