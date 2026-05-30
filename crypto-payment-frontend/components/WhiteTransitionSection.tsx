import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PhoneMockup from './PhoneMockup';
import SplitText from './SplitText';
import Link from 'next/link';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function WhiteTransitionSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const phoneWrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

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

  /* ── GSAP ScrollTrigger animation ── */
  useEffect(() => {
    if (!mounted || !isDesktop) return;
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const phoneEl = phoneWrapperRef.current;
      const stickyEl = stickyRef.current;
      if (!phoneEl || !stickyEl) return;

      /* ─── Phone 3D tilt timeline (phone only) ─── */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      });

      // Phase 1 (0% → 40%): Phone floats up into view
      tl.fromTo(
        phoneEl,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.25, ease: 'none' },
        0.05
      );

      // Phase 2 (40% → 85%): Phone tilts backward in 3D space
      tl.to(
        phoneEl,
        {
          rotateX: -80,
          scale: 0.85,
          y: 60,
          duration: 0.5,
          ease: 'none',
        },
        0.35
      );

      // Phase 3 (85% → 100%): Phone fades/scales out
      tl.to(
        phoneEl,
        {
          rotateX: -85,
          scale: 0.6,
          opacity: 0,
          y: 120,
          duration: 0.15,
          ease: 'none',
        },
        0.85
      );

      // Subtle section scale-down for collapse effect
      tl.to(
        stickyEl,
        {
          scale: 0.97,
          opacity: 0.8,
          duration: 0.15,
          ease: 'none',
        },
        0.85
      );

      /* ─── Phone glow shadow animates with tilt ─── */
      tl.fromTo(
        '.phone-glow-shadow',
        { scaleX: 0.7, scaleY: 1, opacity: 0.5 },
        { scaleX: 1.6, scaleY: 0.3, opacity: 0.15, duration: 0.5, ease: 'none' },
        0.35
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [mounted, isDesktop]);

  return (
    <div
      ref={sectionRef}
      className="relative"
      style={{ height: mounted && !isDesktop ? 'auto' : '400vh', background: '#fafafa' }}
    >
      {/* ── Content: headline + CTA (static, no animation) ── */}
        <div className="relative pt-24 md:pt-52 pb-8 z-10 flex flex-col items-center text-center px-6 md:px-8">
          <h2
            className="font-candal text-black leading-[0.9] mb-8"
            style={{ fontSize: 'clamp(32px, 4vw, 200px)' }}
          >
            <SplitText
              text="MONEY MOVES AT"
              tag="span"
              splitType="chars"
              className="block"
              textAlign="left"
              delay={20}
              duration={0.5}
              ease="power3.out"
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0}
              rootMargin="0px"
            />
            <br />
            <SplitText
              text="CONVERSATION "
              tag="span"
              splitType="chars"
              className="block text-[#2D7A4F]"
              textAlign="left"
              delay={40}
              duration={0.5}
              ease="power3.out"
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0}
              rootMargin="0px"
            />

            <SplitText
              text=" SPEED"
              tag="span"
              splitType="chars"
              className="block"
              textAlign="left"
              delay={60}
              duration={0.5}
              ease="power3.out"
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0}
              rootMargin="0px"
            />
          </h2>

          <p
            className="font-neue text-black/50 text-lg leading-relaxed py-2"
            style={{ maxWidth: '400px' }}
          >
            Just speak naturally.
            <br />
            Trust2Pay handles complexity.
          </p>

          <Link href="/auth/signup">
            <button
              className="px-8 py-4 rounded-full font-candal text-sm tracking-widest text-black transition-transform duration-200 hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.97]"
              style={{
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0,0,0,0.12)',
                boxShadow:
                  '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              TRY IT OUT
            </button>
          </Link>
        </div>
      {/* Sticky viewport container */}
      <div
        ref={stickyRef}
        className={mounted && !isDesktop ? "relative flex flex-col items-center justify-center pb-24 px-6" : "sticky top-0 h-[100vh] overflow-hidden flex flex-col items-center justify-center py-32"}
        style={{
          background: '#fafafa',
          willChange: isDesktop ? 'transform' : undefined,
        }}
      >
        

        {/* ── Perspective wrapper + Phone (3D motion only here) ── */}
        <div
          className="relative z-10 mt-12"
          style={{
            perspective: '1200px',
            perspectiveOrigin: 'center center',
          }}
        >
          <div
            ref={phoneWrapperRef}
            style={{
              transformStyle: 'preserve-3d',
              transformOrigin: 'center bottom',
              willChange: 'transform',
            }}
          >
            <PhoneMockup
              highlight="payment"
              style={{
                filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.12))',
              }}
            />

            {/* Dynamic ground shadow that expands as phone tilts */}
            <div
              className="phone-glow-shadow absolute -bottom-10 left-1/2"
              style={{
                width: '200px',
                height: '40px',
                marginLeft: '-100px',
                borderRadius: '50%',
                background:
                  'radial-gradient(ellipse, rgba(0,0,0,0.25) 0%, transparent 70%)',
                pointerEvents: 'none',
                willChange: 'transform, opacity',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
