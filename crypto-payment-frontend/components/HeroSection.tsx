'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import PhoneMockup from './PhoneMockup';

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const phoneY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const phoneScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.85]);

  return (
    <div
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#2D7A4F' }}
    >

      {/* Heading */}
      <motion.div
        style={{ y: textY, opacity }}
        className="text-center z-10 mb-37"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-neue text-white/60 text-[10px] tracking-[0.3em] uppercase mb-6"
        >
          AI-Powered Financial Platform
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-candal text-white leading-[0.92] tracking-tight"
          style={{ fontSize: 'clamp(40px, 10vw, 140px)' }}
        >
          TALK TO MONEY
          <br />
          <span style={{ 
            WebkitTextStroke: '2px rgba(255,255,255,0.4)',
            color: 'transparent'
          }}>NATURALLY</span>
        </motion.h1>
      </motion.div>

      {/* Phone */}
      <motion.div
        style={{ y: phoneY, scale: phoneScale }}
        className="z-10 absolute top-[40%] "
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="float-animation h-[400px] w-[700px]"
        >
          <div className="">
             <img src="/frames/f001.webp" alt="Glow"  className="w-full  h-full object-contain" />     
             </div>
        </motion.div>
      </motion.div>

      
    </div>
  );
}
