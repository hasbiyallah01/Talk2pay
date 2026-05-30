'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface LoadingScreenProps {
  progress: number;
  isComplete: boolean;
  onExitDone?: () => void;
}

function CounterDigit({ value }: { value: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontVariantNumeric: 'tabular-nums',
        minWidth: '0.62em',
        transition: 'none',
      }}
    >
      {value}
    </span>
  );
}

export default function LoadingScreen({ progress, isComplete, onExitDone }: LoadingScreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);
  const logoRef    = useRef<HTMLDivElement>(null);
  const lineRef    = useRef<HTMLDivElement>(null);
  const fillRef    = useRef<HTMLDivElement>(null);
  const pctRef     = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const hasExited  = useRef(false);

  const [displayPct, setDisplayPct] = useState(0);
  const [digits, setDigits]         = useState({ h: 0, t: 0, u: 0 });

  const { contextSafe } = useGSAP({ scope: overlayRef });

  const runEntrance = contextSafe(() => {
    const tl = gsap.timeline();

    tl.fromTo(logoRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' },
      0.1
    );
    tl.fromTo(taglineRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.7, ease: 'power2.out' },
      0.4
    );
    tl.fromTo(pctRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: 'power2.out' },
      0.5
    );
    tl.fromTo(lineRef.current,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.8, ease: 'expo.out', transformOrigin: 'left' },
      0.55
    );
  });

  useEffect(() => { runEntrance(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (fillRef.current) {
      gsap.to(fillRef.current, { width: `${progress}%`, duration: 0.5, ease: 'power2.out' });
    }
    gsap.to({ val: displayPct }, {
      val: progress,
      duration: 0.5,
      ease: 'power2.out',
      onUpdate: function () {
        const v = Math.round(this.targets()[0].val);
        setDisplayPct(v);
        setDigits({ h: Math.floor(v / 100), t: Math.floor((v % 100) / 10), u: v % 10 });
      },
    });
  }, [progress]); // eslint-disable-line react-hooks/exhaustive-deps

  const runExit = contextSafe(() => {
    if (hasExited.current) return;
    hasExited.current = true;

    const tl = gsap.timeline({ onComplete: () => onExitDone?.() });

    tl.to(fillRef.current, { width: '100%', duration: 0.2, ease: 'power4.in' });

    tl.to(
      [logoRef.current, taglineRef.current, pctRef.current, lineRef.current],
      { opacity: 0, y: -12, stagger: 0.04, duration: 0.4, ease: 'power3.in' },
      '+=0.15'
    );

    tl.to(panelRef.current, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '-=0.1');
    tl.set(overlayRef.current, { display: 'none' });
  });

  useEffect(() => {
    if (isComplete) {
      const t = setTimeout(runExit, 400);
      return () => clearTimeout(t);
    }
  }, [isComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  const h = digits.h || null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[9999] pointer-events-none" aria-hidden="true">
      <div
        ref={panelRef}
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ background: '#ffffff', pointerEvents: 'auto' }}
      >

        {/* Core content */}
        <div className="flex flex-col items-center" style={{ gap: '10px' }}>

          {/* Logo */}
          <div ref={logoRef} style={{ opacity: 0, textAlign: 'center' }}>
            

            {/* Wordmark */}
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{
                fontFamily: "'PPNeueMontreal', sans-serif",
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontWeight: 700,
                color: '#111',
                letterSpacing: '-0.03em',
              }}>Trust</span>
              <span style={{
                fontFamily: "'PPNeueMontreal', sans-serif",
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontWeight: 700,
                color: '#2D7A4F',
                letterSpacing: '-0.03em',
              }}>2Pay</span>
            </div>

          </div>

          {/* Progress */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: 220 }}>

            
            {/* Bar */}
            <div
              ref={lineRef}
              style={{
                opacity: 0,
                width: '100%',
                height: 1,
                background: 'rgba(0,0,0,0.08)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                ref={fillRef}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: '0%',
                  background: '#2D7A4F',
                }}
              />
            </div>

            {/* Status */}
            <p style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '10px',
              color: 'rgba(0,0,0,0.25)',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              margin: 0,
            }}>
              {progress < 30 ? 'Initialising' : progress < 70 ? 'Loading assets' : progress < 99 ? 'Almost ready' : 'Launching'}
            </p>
          </div>
        </div>

      
      </div>
    </div>
  );
}