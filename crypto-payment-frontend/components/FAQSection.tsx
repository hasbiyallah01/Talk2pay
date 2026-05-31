'use client';
import SplitText from './SplitText';
import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const faqs = [
  {
    q: 'How does voice payment work?',
    a: 'Simply speak your intent — "Send ₦500 to David" — and Talk2Pay AI parses, confirms, and executes. No typing, no menus, just conversation.'
  },
  {
    q: 'Is it available on WhatsApp?',
    a: 'Yes. Connect your account once and send money directly from WhatsApp conversations. No app switch required.'
  },
  {
    q: 'Which languages are supported?',
    a: 'English, Hausa, Yoruba, Igbo, Pidgin, French, and more. We add languages continuously based on user demand.'
  },
  {
    q: 'Does it work on feature phones?',
    a: 'Absolutely. Dial *347# on any phone, even 2G. Full payment capability without internet or a smartphone.'
  },
  {
    q: 'How secure are transactions?',
    a: 'Bank-grade encryption, biometric confirmation, AI fraud detection, and zero-knowledge proofs. Every transaction is verified in multiple layers.'
  },
];

export default function FAQSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

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

  if (mounted && !isDesktop) {
    return (
      <div className="relative py-24 px-6 bg-[#fafafa]">
        {/* Title */}
        <div className="mb-12 max-w-md mx-auto">
          <h2 className="font-candal text-black text-5xl mb-4 leading-none">FAQ</h2>
          <p className="font-neue text-black/50 text-base">
            Have any question?<br />Check it out.
          </p>
          <div className="mt-6 h-px w-12 bg-[#2D7A4F]" />
        </div>

        {/* Cards stack vertical */}
        <div className="flex flex-col gap-6 max-w-md mx-auto">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="p-6 rounded-3xl w-full"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex items-start gap-4">
                <span className="font-candal text-[#2D7A4F] text-xs tracking-widest pt-1">
                  0{i + 1}
                </span>
                <div>
                  <h4 className="font-candal text-black text-lg mb-2">{faq.q}</h4>
                  <p className="font-neue text-black/50 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${(faqs.length + 1) * 80}vh`, background: '#fafafa' }}
    >
      <div className="sticky top-0 h-screen flex items-center px-26 gap-20 overflow-hidden">
        {/* Left label */}
        <div className="w-80 shrink-0">
          <span className="font-candal text-black mb-6" style={{ fontSize: '80px', lineHeight: 0.9 }}>
            <SplitText
              text="FAQ "
              tag="span"
              splitType="chars"
              className="block text-[#000000]"
              textAlign="left"
              delay={40}
              duration={0.5}
              ease="power3.out"
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0}
              rootMargin="0px"
            />
          </span>
          <p className="font-neue text-black/50 text-lg leading-relaxed">
            Have any question?<br />Check it out.
          </p>
          <div className="mt-10 h-px w-16 bg-[#2D7A4F]" />
        </div>

        {/* Right cards stack */}
        <div className="relative flex-1 h-full flex items-center">
          {faqs.map((faq, i) => {
            const start = i / faqs.length;
            const end = (i + 1) / faqs.length;

            return (
              <FAQCard
                key={i}
                faq={faq}
                index={i}
                scrollYProgress={scrollYProgress}
                start={start}
                end={end}
                total={faqs.length}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FAQCard({ faq, index, scrollYProgress, start, end, total }: {
  faq: { q: string; a: string };
  index: number;
  scrollYProgress: any;
  start: number;
  end: number;
  total: number;
}) {
  // Slide-up entrance window
  const yStart = Math.max(0, start - 0.1);
  const yEnd = Math.min(1, start + 0.1);

  const y = useTransform(scrollYProgress, [yStart, yEnd], ['60vh', '0vh']);
  const rotate = useTransform(scrollYProgress, [start, end], [0, (index - 2) * 2.5]);
  const scale = useTransform(scrollYProgress, [start, end], [1, 1 - index * 0.015]);

  // Opacity:
  //   - Before card arrives  → 0 (not yet visible, below the fold)
  //   - Arrival window       → 0 → 1 (quick fade-in as it slides up)
  //   - Once arrived         → stays exactly 1, forever
  //
  // Key: three-point clamp — [0, arriveAt, 1.0] → [0, 1, 1]
  // The third keypoint at progress=1 with value=1 ensures Framer never
  // interpolates backward toward 0 once the card is on screen.
  const arriveAt = Math.min(start + 0.05, 1);
  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, start - 0.06), arriveAt, 1],
    [0, 1, 1]
  );

  return (
    <motion.div
      className="absolute w-full"
      style={{ y, rotate, scale, opacity, zIndex: index }}
    >
      {/*
        The card div itself has NO opacity/background-opacity styling.
        background: '#ffffff' is fully solid — nothing bleeds through.
      */}
      <div
        className="p-8 w-120 rounded-3xl"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.1)',
          transformOrigin: 'top center',
        }}
      >
        <div className="flex items-start gap-4">
          <span className="font-candal text-[#2D7A4F] text-xs tracking-widest pt-1">
            0{index + 1}
          </span>
          <div>
            <h4 className="font-candal text-black text-xl mb-3">{faq.q}</h4>
            <p className="font-neue text-black/50 text-base leading-relaxed">{faq.a}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}