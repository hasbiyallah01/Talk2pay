'use client';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar({ theme = 'dark' }: { theme?: 'dark' | 'light' | 'green' }) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (theme === 'green') {
      if (typeof window !== 'undefined') {
        const threshold = 31.2 * window.innerHeight;
        if (latest >= threshold) {
          setCurrentTheme('light');
        } else {
          setCurrentTheme('green');
        }
      }
    }
  });

  const textColor = currentTheme === 'light' ? 'text-black' : 'text-white';
  const navBg = currentTheme === 'green' 
    ? 'rgba(255,255,255,0.12)' 
    : currentTheme === 'light' 
      ? 'rgba(0,0,0,0.08)' 
      : 'rgba(255,255,255,0.08)';

  return (
    <>
      <motion.nav
        style={{ opacity }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 md:px-8 md:py-5"
      >
        {/* Logo */}
        <Link href="/">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2"
          >
             <img src="/logo.svg" alt="Trust2Pay Logo" className="w-10 h-10 md:w-12 md:h-12" />
            
            <span className={`font-candal text-sm md:text-base tracking-wide ${textColor}`}>Trust2Pay</span>
          </motion.div>
        </Link>
        

        {/* Center Nav Pill */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="hidden md:flex items-center gap-1 px-2 py-2 rounded-full"
          style={{
            background: navBg,
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: `1px solid ${currentTheme === 'green' ? 'rgba(255,255,255,0.2)' : currentTheme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.14)'}`,
            boxShadow: currentTheme === 'light'
              ? '0 4px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)'
              : '0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.12)'
          }}
        >
          {['ABOUT', 'DEVELOPERS', 'CONTACT'].map((item, i) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className={`px-4 py-2 rounded-full text-xs font-candal tracking-widest transition-all duration-300 ${textColor} ${currentTheme === 'light' ? 'hover:bg-black/5' : 'hover:bg-white/10'}`}
            >
              {item}
            </Link>
          ))}
        </motion.div>

        {/* CTA Button & Hamburger */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3"
        >
          <Link href="/auth/signup" className="hidden sm:block">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2.5 rounded-full text-xs font-candal tracking-widest text-white transition-all duration-300"
              style={{
                background: 'rgba(45,122,79,0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(45,122,79,0.5)',
                boxShadow: '0 4px 20px rgba(45,122,79,0.3), inset 0 1px 0 rgba(255,255,255,0.15)'
              }}
            >
              TRY IT NOW
            </motion.button>
          </Link>

          {/* Hamburger button on mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-full focus:outline-none transition-colors"
            style={{
              background: currentTheme === 'green' ? 'rgba(255,255,255,0.15)' : currentTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${currentTheme === 'green' ? 'rgba(255,255,255,0.2)' : currentTheme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)'}`,
              color: currentTheme === 'light' ? '#000' : '#fff',
              cursor: 'pointer'
            }}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </motion.div>
      </motion.nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[64px] left-0 right-0 z-40 md:hidden overflow-hidden"
            style={{
              background: currentTheme === 'green' 
                ? 'rgba(45, 122, 79, 0.98)' 
                : currentTheme === 'light' 
                  ? 'rgba(255, 255, 255, 0.98)' 
                  : 'rgba(10, 10, 10, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: `1px solid ${currentTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
            }}
          >
            <div className="flex flex-col items-center gap-6 py-8 px-6">
              {['ABOUT', 'DEVELOPERS', 'CONTACT'].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  onClick={() => setIsOpen(false)}
                  className={`font-candal text-xs tracking-widest transition-all duration-300 ${textColor} hover:opacity-80`}
                >
                  {item}
                </Link>
              ))}
              
              <Link href="/auth/signup" onClick={() => setIsOpen(false)} className="w-full max-w-[200px] sm:hidden">
                <button
                  className="w-full py-3 rounded-full text-xs font-candal tracking-widest text-white transition-all duration-300"
                  style={{
                    background: '#2D7A4F',
                    border: '1px solid rgba(45,122,79,0.5)',
                    boxShadow: '0 4px 15px rgba(45,122,79,0.3)'
                  }}
                >
                  TRY IT NOW
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
