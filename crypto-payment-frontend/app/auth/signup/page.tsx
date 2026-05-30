"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// API import removed. Registration is now localStorage only (mock).

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (step < 2) {
      setStep(s => s + 1);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Simulate registration: store mock token and user
      if (typeof window !== 'undefined') {
        localStorage.setItem('trust2pay_token', 'mock-token');
        localStorage.setItem('trust2pay_user', JSON.stringify({ name: form.name, phone: form.phone, email: '', balance: 200000, btc: '0.00380000' }));
      }
      router.push('/onboarding');
    } catch (e: any) {
      const status = (e as any)?.status ?? (e as any)?.response?.status;
      const message = (e as any)?.message ?? String(e);
      if (status === 409 || (message === 'Registration failed' && status === 409)) {
        setError('An account already exists with this phone number or business name.');
      } else {
        setError('Registration failed. Please check your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0a0a0a' }}>
      {/* Left — branding */}
      <motion.div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative overflow-hidden"
        style={{ background: '#2D7A4F' }}
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-1">
          <img src="/logo.svg" alt="Trust2Pay Logo" className="w-12 h-12" />

          <span className="font-candal text-white text-base">Trust2Pay</span>
        </div>

        <div>
          <h2 className="font-candal text-white leading-[0.9] pb-4" style={{ fontSize: '72px' }}>
            TALK TO<br />MONEY.
          </h2>
          <p className="font-neue text-white/60 text-lg">Your AI-powered financial companion.</p>
        </div>

      </motion.div>

      {/* Right — form */}
      <motion.div className="flex-1 flex flex-col bg-[#fafafa] items-center justify-center p-8"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="font-candal text-[#2D7A4F] text-xs tracking-[0.3em] pb-2">STEP {step} OF 2</p>
            <h1 className="font-candal text-black text-4xl pb-2">
              {step === 1 ? 'CREATE ACCOUNT' : 'SECURE IT'}
            </h1>
            <p className="font-neue text-black/40 text-sm pb-5">
              {step === 1 ? 'Join the financial future.' : 'Set your password.'}
            </p>

            {/* Progress */}
            <div className="flex gap-2 pb-5">
              {[1, 2].map(s => (
                <div key={s} className="h-0.5 flex-1 rounded-full transition-all duration-500"
                  style={{ background: s <= step ? '#2D7A4F' : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm text-center">
                {error}
              </div>
            )}

            <motion.div className="flex flex-col gap-4"
              initial="hidden"
              animate="visible"
              key={step}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.2,
                  },
                },
              }}
            >
              {step === 1 ? (
                <>
                  {[
                    { key: 'name', label: 'FULL NAME', placeholder: 'Omilabu Elizabeth', type: 'text' },
                    { key: 'phone', label: 'PHONE NUMBER', placeholder: '+234 800 000 0000', type: 'tel' },
                  ].map(f => (
                    <motion.div key={f.key}
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <label className="font-candal text-black/40 text-[10px] tracking-widest block pb-2">{f.label}</label>
                      <motion.input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={(form as any)[f.key]}
                        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="w-full px-5 py-4 rounded-2xl font-neue text-black text-sm outline-none transition-all duration-300"
                        style={{
                          background: 'rgba(0,0,0,0.05)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                        whileFocus={{
                          scale: 1.02,
                          boxShadow: '0 0 20px rgba(45,122,79,0.3)',
                          borderColor: 'rgba(45,122,79,0.5)',
                        }}
                      />
                    </motion.div>
                  ))}
                </>
              ) : (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <label className="font-candal text-black/40 text-[10px] tracking-widest block pb-2">PASSWORD</label>
                  <motion.input
                    type="password"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-5 py-4 rounded-2xl font-neue text-black text-sm outline-none transition-all duration-300"
                    style={{
                      background: 'rgba(0,0,0,0.25)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: '0 0 20px rgba(45,122,79,0.3)',
                      borderColor: 'rgba(45,122,79,0.5)',
                    }}
                  />
                </motion.div>
              )}

              <motion.button
                onClick={handleSubmit}
                whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(45,122,79,0.35)' }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-4 rounded-2xl font-candal text-white text-sm tracking-widest mt-2"
                style={{ background: '#2D7A4F', boxShadow: '0 8px 30px rgba(45,122,79,0.25)' }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                {step === 1 ? 'CONTINUE →' : 'CREATE ACCOUNT'}
              </motion.button>
            </motion.div>

            <motion.p className="font-neue text-black/30 text-sm text-center pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Already have an account?{' '}
              <motion.span
                whileHover={{ color: '#2D7A4F' }}
              >
                <Link href="/auth/login" className="text-[#2D7A4F] hover:underline">Sign in</Link>
              </motion.span>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
