'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <main style={{ background: '#fafafa' }} className= ''>
      <Navbar theme="light" />
      <section className="min-h-screen  items-center justify-center px-16 pb-44 pt-44">
        <div className="flex flex-col md:flex-row gap-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            <p className="font-candal text-[#2D7A4F] text-xs tracking-[0.3em] mb-6">REACH OUT</p>
            <h1 className="font-candal text-black leading-[0.9] mb-4" style={{ fontSize: 'clamp(48px, 6vw, 80px)' }}>
              LET'S TALK
            </h1>
            <p className="font-neue text-black/40 text-lg mb-12">
              Questions, partnerships, press. We respond within 24 hours.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex bg-[#2D7A4F] w-[60%] translate-y-20 p-12 rounded-4xl  flex-col gap-4"
          >
            {[
              { label: 'Full Name', placeholder: 'Your name', type: 'text' },
              { label: 'Email', placeholder: 'you@example.com', type: 'email' },
            ].map(field => (
              <div key={field.label}>
                <label className="font-candal text-white text-xs tracking-widest block pb-2">{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  className="w-full px-5 py-4 rounded-2xl font-neue text-white text-sm outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(45,122,79,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
            ))}

            <div>
              <label className="font-candal text-white text-xs tracking-widest block pb-2">MESSAGE</label>
              <textarea
                placeholder="Tell us what's on your mind..."
                rows={5}
                className="w-full px-5 py-4 rounded-2xl font-neue text-white text-sm outline-none resize-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(45,122,79,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 cursor-pointer rounded-2xl font-candal text-white text-sm tracking-widest"
              style={{
                background: '#2D7A4F',
                boxShadow: '0 8px 30px rgba(45,122,79,0.3)'
              }}
            >
              SEND MESSAGE
            </motion.button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
