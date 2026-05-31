'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import SplitText from './SplitText';

export default function CTASection() {
  return (
    <div
      className="relative py-40 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#fafafa' }}
    >
      
     

      <div className="relative z-10 flex flex-col items-center text-center gap-2 px-6 max-w-4xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-neue text-[#2D7A4F] text-xs tracking-[0.35em] uppercase mb-6"
        >
          JOIN THE FUTURE OF FINANCE
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-candal text-black leading-[0.92] mb-8"
          style={{ fontSize: 'clamp(44px, 3vw, 90px)' }}
        >
          <SplitText
            text="Ready to talk to"
            tag="span"
            splitType="chars"
            className="block"
            delay={20}
            duration={0.5}
            ease="power3.out"
            from={{ opacity: 0, y: 20 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0}
            rootMargin="0px"
          />

          <SplitText
            text="your money?"
            tag="span"
            splitType="chars"
            className="block text-[#2D7A4F]"
            delay={40}
            duration={0.5}
            ease="power3.out"
            from={{ opacity: 0, y: 20 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0}
            rootMargin="0px"
          />
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4 justify-center  items-center"
        >
          <Link href="/auth/signup">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-full font-candal text-xs tracking-widest text-white shrink-0"
              style={{
                background: '#2D7A4F',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 12px 32px rgba(45, 122, 79, 0.35)',
                cursor: 'pointer'
              }}
            >
              Try Talk2Pay Now
            </motion.button>
          </Link>

         
        </motion.div>
      </div>
    </div>
  );
}
