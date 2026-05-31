'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register, devGetOtp, verifyOtp } from '../../lib/api';

type Step = 'form' | 'otp';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Format phone to international format
  function formatPhone(raw: string) {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 11) return '+234' + digits.slice(1);
    if (digits.startsWith('234')) return '+' + digits;
    if (digits.startsWith('+')) return raw;
    return raw;
  }

  async function handleRegister() {
    setError('');
    setLoading(true);
    try {
      const formatted = formatPhone(phone);
      await register(formatted, firstName.trim());
      // Fetch OTP automatically (dev endpoint)
      try {
        const { otp: fetched } = await devGetOtp(formatted);
        if (fetched) setDevOtp(fetched);
      } catch {}
      setPhone(formatted);
      setStep('otp');
    } catch (e: any) {
      setError(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setError('');
    setLoading(true);
    try {
      const res = await verifyOtp(phone, otp.trim());
      if (res.success && res.data?.token) {
        localStorage.setItem('trust2pay_token', res.data.token);
        localStorage.setItem('trust2pay_user', JSON.stringify({
          ...res.data.merchant,
          balance: 200000,
        }));
        // New users go through onboarding first, not directly to dashboard
        localStorage.removeItem('t2p_onboarding_completed');
        router.replace('/onboarding');
      }
    } catch (e: any) {
      setError(e.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col items-center justify-center px-5 py-5">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .signup-root { font-family: 'DM Sans', sans-serif; }
        .field-box {
          background: #ffffff;
          border: 1.5px solid #e4e9f0;
          border-radius: 14px;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .field-box:focus-within {
          border-color: #2d9e6b;
          box-shadow: 0 0 0 3px rgba(45,158,107,0.10);
        }
        .continue-btn {
          background: #2d9e6b;
          border-radius: 14px;
          color: #fff;
          font-weight: 700;
          font-size: 1rem;
          width: 100%;
          padding: 15px 0;
          border: none;
          cursor: pointer;
          transition: background 0.15s, opacity 0.15s, transform 0.1s;
          letter-spacing: 0.01em;
        }
        .continue-btn:hover:not(:disabled) { background: #259060; }
        .continue-btn:active:not(:disabled) { transform: scale(0.98); }
        .continue-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .otp-input {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: 0.5em;
          text-align: center;
          font-family: monospace;
          background: transparent;
          border: none;
          outline: none;
          width: 100%;
          color: #1a2e23;
          padding: 14px 0;
        }
        .back-btn {
          background: none;
          border: none;
          color: #7a8a99;
          font-size: 0.9rem;
          cursor: pointer;
          margin-top: 10px;
          width: 100%;
          padding: 10px 0;
          border-radius: 10px;
          transition: background 0.12s;
        }
        .back-btn:hover { background: #f0f4f8; }
      `}</style>

      <div className="signup-root w-full max-w-[360px]">
        {/* Title */}
        <div className="mb-8 px-1">
          <h1 className="text-[1.75rem] font-bold text-[#0f1f17] leading-tight mb-1">
            {step === 'form' ? 'Create Your Wallet' : 'Verify Your Phone'}
          </h1>
          <p className="text-[#7a8a99] text-sm font-medium">
            {step === 'form'
              ? 'Enter your details to get started'
              : `We sent a 6-digit code to ${phone}`}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[24px] shadow-sm border border-[#e8edf4] p-6">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          {step === 'form' ? (
            <>
              {/* First Name Field */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#7a8a99] uppercase tracking-widest mb-2">
                  First Name
                </label>
                <div className="field-box flex items-center gap-3 px-4 py-0">
                 
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="e.g. Chidi"
                    className="flex-1 bg-transparent border-none outline-none text-[#1a2e23] text-sm font-medium placeholder-[#c5cdd8] py-3.5"
                  />
                </div>
              </div>

              {/* Phone Number Field */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-[#7a8a99] uppercase tracking-widest mb-2">
                  Phone Number
                </label>
                <div className="field-box flex items-center gap-3 px-4 py-0">
                 
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+234 000 000 0000"
                    className="flex-1 bg-transparent border-none outline-none text-[#1a2e23] text-sm font-medium placeholder-[#c5cdd8] py-3.5"
                  />
                </div>
              </div>

              <button
                className="continue-btn"
                onClick={handleRegister}
                disabled={loading || !firstName.trim() || !phone.trim()}
              >
                {loading ? 'Creating account…' : 'Continue'}
              </button>

              <p className="mt-4 text-center text-[#9baab8] text-xs leading-relaxed">
                By continuing, you agree to our{' '}
                <Link href="#" className="text-[#2d9e6b] font-semibold hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="#" className="text-[#2d9e6b] font-semibold hover:underline">Privacy Policy</Link>
              </p>
            </>
          ) : (
            <>
              {/* Dev OTP helper */}
              {devOtp && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                  <span className="font-semibold">Dev OTP:</span>{' '}
                  <span
                    className="font-mono text-base cursor-pointer underline"
                    onClick={() => setOtp(devOtp)}
                  >
                    {devOtp}
                  </span>{' '}
                  <span className="text-emerald-600">(tap to fill)</span>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-xs font-semibold text-[#7a8a99] uppercase tracking-widest mb-2">
                  6-Digit OTP Code
                </label>
                <div className="field-box">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="otp-input"
                  />
                </div>
              </div>

              <button
                className="continue-btn"
                onClick={handleVerify}
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Verifying…' : 'Verify & Continue →'}
              </button>

              <button className="back-btn" onClick={() => setStep('form')}>
                ← Change phone number
              </button>
            </>
          )}
        </div>

        {/* Sign in link */}
        {step === 'form' && (
          <p className="mt-5 text-center text-[#9baab8] text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#2d9e6b] font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}