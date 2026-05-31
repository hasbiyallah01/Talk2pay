'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';


export default function Footer() {
  return (
    <footer className="relative py-20 px-6 md:px-16 overflow-hidden" style={{ background: '#fafafa' }}>
      
      
      {/* Footer links */}
      <div className="flex bg-[#2D7A4F] p-6 sm:p-12 md:p-20 rounded-[2.5rem] sm:rounded-[5rem] rounded-bl-none items-start justify-between flex-wrap gap-12">
        {/* Logo */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#2D7A4F' }}>
             <img src="/logo.svg" alt="Talk2Pay Logo" className="w-4 h-4" />
        
            </div>
            <span className="font-candal text-white text-base">Talk2Pay</span>
          </div>
          <p className="font-neue text-white/50 text-sm max-w-xs leading-relaxed">
            Talk to money naturally.<br />AI-powered financial platform for everyone.
          </p>
        </div>

        {/* Links */}
        {[
          { title: 'PRODUCT', links: ['About', 'Developers', 'Contact', 'Pricing'] },
          { title: 'LEGAL', links: ['Privacy', 'Terms', 'Security', 'Compliance'] },
          { title: 'CONNECT', links: ['Twitter', 'LinkedIn', 'GitHub', 'Discord'] },
        ].map(col => (
          <div key={col.title}>
            <p className="font-candal text-white/50 text-xs tracking-[0.25em] mb-5">{col.title}</p>
            <div className="flex flex-col gap-3">
              {col.links.map(link => (
                <Link key={link} href="#" className="font-neue text-white/50 text-sm hover:text-white transition-colors duration-200">
                  {link}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="mt-16 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <p className="font-neue text-black/25 text-xs">© 2025 Talk2Pay. All rights reserved.</p>
        <p className="font-neue text-black/25 text-xs">Talk to money naturally.</p>
      </div>
    </footer>
  );
}
