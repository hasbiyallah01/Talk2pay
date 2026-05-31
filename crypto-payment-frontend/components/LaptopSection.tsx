'use client';
import { useRef } from 'react';
import SplitText from './SplitText';
import { motion, useScroll, useTransform } from 'framer-motion';

const messages = [
  { role: 'user', text: 'Send ₦500 to David' },
  { role: 'ai', text: 'Got it. Confirm payment of ₦500.00 to David Adeyemi?' },
  { role: 'user', text: 'Yes' },
  { role: 'ai', text: '✓ Payment successful. ₦500 sent to David instantly.' },
];

export default function LaptopSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const laptopScale = useTransform(scrollYProgress, [0.1, 0.5], [0.85, 1]);
  const laptopY = useTransform(scrollYProgress, [0.1, 0.5], [40, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.35], [0, 1]);

  return (
    <div ref={ref} className="relative min-h-screen flex items-center py-32" style={{ background: '#fafafa' }}>
      <div className="px-6 md:px-16 w-full">
        <div className="flex flex-col gap-4">
          {/* Left text */}
          <motion.div style={{ opacity: textOpacity }} className="w-full max-w-xl md:w-96 md:shrink-0">
            <p className="font-candal text-[#2D7A4F] text-xs tracking-[0.3em] mb-4">NO APP NEEDED</p>
            <span className="font-candal text-black leading-[0.92] mb-6 block" style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: '1.1' }}>
            
              <SplitText
                text="SEND MONEY"
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
              <SplitText
                text="VIA WHATSAPP"
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
            <p className="font-neue w-full max-w-lg text-black/50 text-base leading-relaxed">
              Send money directly from WhatsApp using AI-powered conversations. No app download required.
            </p>
          </motion.div>

          {/* Laptop mockup */}
          <motion.div style={{ scale: laptopScale, y: laptopY }} className="flex-1   justify-center items-center">
            <div className="relative mx-auto " style={{ maxWidth: '800px' }}>
              {/* Laptop lid */}
              <div className="relative rounded-t-2xl overflow-hidden" style={{
                background: 'linear-gradient(145deg, #1c1c1e 0%, #141414 100%)',
                padding: '16px',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderBottom: 'none'
              }}>
                {/* Screen */}
                <div className="rounded-xl overflow-hidden" style={{ 
                  background: '#075E54',
                  aspectRatio: '16/10',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3)'
                }}>
                  {/* WhatsApp header */}
                  <div className="flex items-center gap-3 px-4 py-3" style={{ background: '#128C7E' }}>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">T2</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Talk2Pay AI</p>
                      <p className="text-white/60 text-xs">● Online</p>
                    </div>
                  </div>

                  {/* Chat messages */}
                  <div className="p-4 flex flex-col gap-3 overflow-hidden" style={{ background: '#ECE5DD', minHeight: '280px' }}>
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className="px-4 py-2 rounded-2xl max-w-[70%]"
                          style={{
                            background: msg.role === 'user' ? '#DCF8C6' : '#FFFFFF',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                            borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px'
                          }}
                        >
                          <p className="text-[#1a1a1a] text-sm">{msg.text}</p>
                          <p className="text-[10px] text-right mt-1" style={{ color: '#92A8A6' }}>
                            {['9:41', '9:41', '9:42', '9:42'][i]} ✓✓
                          </p>
                        </div>
                      </motion.div>
                    ))}

                    {/* Typing indicator */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 2 }}
                      className="flex items-center gap-1 px-4 py-3 rounded-2xl w-fit"
                      style={{ background: '#FFFFFF', borderRadius: '16px 16px 16px 4px' }}
                    >
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#92A8A6] typing-dot" />
                      ))}
                    </motion.div>
                  </div>

                  {/* Input bar */}
                  <div className="flex items-center gap-2 px-3 py-2" style={{ background: '#F0F0F0' }}>
                    <div className="flex-1 rounded-full px-4 py-2 text-[13px]" style={{ background: '#FFFFFF', color: '#666' }}>
                      Type a message
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#128C7E' }}>
                      <span className="text-white text-xs">→</span>
                    </div>
                  </div>
                </div>

                {/* Camera notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#0a0a0a]" />
              </div>

              {/* Laptop base */}
              <div className="h-5 rounded-b-lg relative" style={{
                background: 'linear-gradient(to bottom, #2a2a2c, #1a1a1c)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.25)'
              }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-1.5 rounded-full" 
                  style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
              <div className="h-3 rounded-b-2xl mx-4" style={{
                background: 'linear-gradient(to bottom, #1a1a1c, #141416)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.3)'
              }} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
