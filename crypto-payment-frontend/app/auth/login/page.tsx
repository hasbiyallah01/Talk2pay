'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
// API import removed. Login is now localStorage only (mock).

export default function Login() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate login: store mock token and user
      if (typeof window !== 'undefined') {
        localStorage.setItem('trust2pay_token', 'mock-token');
        localStorage.setItem('trust2pay_user', JSON.stringify({ phone: phoneNumber, balance: 200000, btc: '0.00380000' }));
      }
      router.push('/dashboard');
    } catch (e: any) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#fafafa' }}>
      <div className="w-full max-w-md px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="flex items-center pb-12">
            <img src="/logo.svg" alt="Trust2Pay Logo" className="w-12 h-12" />
            <span className="font-candal text-black text-base">Trust2Pay</span>
          </div>

          <p className="font-candal text-[#2D7A4F] text-xs tracking-[0.3em] pb-2">WELCOME BACK</p>
          <h1 className="font-candal text-black text-4xl pb-2">SIGN IN</h1>
          <p className="font-neue text-black/40 text-sm pb-4">Your AI wallet is waiting.</p>

          <motion.div className="flex flex-col gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.3,
                },
              },
            }}
          >
            <motion.div
              variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
              transition={{ duration: 0.5 }}
            >
              <label className="font-candal text-black/40 text-[10px] tracking-widest block pb-2">PHONE NUMBER</label>
              <motion.input
                type="tel"
                placeholder="+2348012345678"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl font-neue text-black text-sm outline-none transition-all duration-300"
                style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.08)' }}
                whileFocus={{
                  scale: 1.02,
                  boxShadow: '0 0 20px rgba(45,122,79,0.3)',
                  borderColor: 'rgba(45,122,79,0.5)',
                }}
              />
            </motion.div>
            <motion.div
              variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
              transition={{ duration: 0.5 }}
            >
              <label className="font-candal text-black/40 text-[10px] tracking-widest block pb-2">PASSWORD</label>
              <motion.input
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl font-neue text-black text-sm outline-none transition-all duration-300"
                style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.08)' }}
                whileFocus={{
                  scale: 1.02,
                  boxShadow: '0 0 20px rgba(45,122,79,0.3)',
                  borderColor: 'rgba(45,122,79,0.5)',
                }}
              />
            </motion.div>

            {error && <div className="text-red-500 text-xs pt-2">{error}</div>}

            <motion.button
              onClick={handleLogin}
              disabled={loading}
              whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(45,122,79,0.35)' }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-4 rounded-2xl font-candal text-white text-sm tracking-widest mt-2"
              style={{ background: '#2D7A4F', boxShadow: '0 8px 30px rgba(45,122,79,0.25)' }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ delay: 0.5 }}
            >
              {loading ? 'Signing in...' : 'SIGN IN'}
            </motion.button>
          </motion.div>

          <motion.p className="font-neue text-black/30 text-sm text-center pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            No account?{' '}
            <motion.span
              whileHover={{ color: '#4fa076' }}
            >
              <Link href="/auth/signup" className="text-[#2D7A4F] hover:underline">Create one</Link>
            </motion.span>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
