"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchLatestOtp } from './otpDevUtil';

function OtpVerificationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const phone = searchParams.get('phone') || '';
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [devOtp, setDevOtp] = useState<string | null>(null);
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(120);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (phone) {
            fetchLatestOtp(phone).then(setDevOtp);
        }
    }, [phone]);

    // Sync digits array → otp string (logic untouched)
    useEffect(() => {
        setOtp(digits.join(''));
    }, [digits]);

    // Countdown timer (UI only)
    useEffect(() => {
        if (timer <= 0) return;
        const id = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(id);
    }, [timer]);

    const formatTimer = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const handleDigitChange = (index: number, val: string) => {
        const char = val.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[index] = char;
        setDigits(next);
        if (char && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setDigits(pasted.split(''));
            inputRefs.current[5]?.focus();
        }
    };

    const handleVerify = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('trust2pay_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ phoneNumber: phone, otp }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data?.message || 'Invalid OTP. Please try again.');
                setLoading(false);
                return;
            }
            if (typeof window !== 'undefined' && data?.data?.token) {
                localStorage.setItem('trust2pay_token', data.data.token);
                localStorage.setItem('trust2pay_user', JSON.stringify(data.data.merchant));
            }
            setSuccess(true);
            setTimeout(() => {
                router.push('/dashboard');
            }, 1200);
        } catch (e: any) {
            setError('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f4f8] flex flex-col items-center justify-center px-5 py-12">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
                .otp-root { font-family: 'DM Sans', sans-serif; }
                .digit-box {
                    width: 48px;
                    height: 56px;
                    border-radius: 14px;
                    background: #ffffff;
                    border: 1.5px solid #e4e9f0;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #0f1f17;
                    text-align: center;
                    outline: none;
                    transition: border-color 0.18s, box-shadow 0.18s;
                    caret-color: #2d9e6b;
                }
                .digit-box:focus {
                    border-color: #2d9e6b;
                    box-shadow: 0 0 0 3px rgba(45,158,107,0.12);
                }
                .digit-box.filled {
                    border-color: #2d9e6b;
                    background: #f0faf5;
                }
                .verify-btn {
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
                }
                .verify-btn:hover:not(:disabled) { background: #259060; }
                .verify-btn:active:not(:disabled) { transform: scale(0.98); }
                .verify-btn:disabled { opacity: 0.45; cursor: not-allowed; }
                .resend-btn {
                    background: #fff;
                    border-radius: 14px;
                    color: #0f1f17;
                    font-weight: 600;
                    font-size: 1rem;
                    width: 100%;
                    padding: 14px 0;
                    border: 1.5px solid #e4e9f0;
                    cursor: pointer;
                    transition: background 0.15s, border-color 0.15s;
                }
                .resend-btn:hover:not(:disabled) { background: #f7faf8; border-color: #c5d9ce; }
                .resend-btn:disabled { opacity: 0.45; cursor: not-allowed; }
            `}</style>

            <div className="otp-root w-full max-w-[360px]">
                {/* Title */}
                <div className="mb-8 px-1">
                    <h1 className="text-[1.75rem] font-bold text-[#0f1f17] leading-tight mb-1">
                        Verify Your Number
                    </h1>
                    <p className="text-[#7a8a99] text-sm font-medium">
                        Enter the six digits code sent to you
                        {phone && <span className="text-[#2d9e6b]"> {phone}</span>}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-[24px] shadow-sm border border-[#e8edf4] p-6">
                    {error && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium text-center">
                            Verified! Redirecting…
                        </div>
                    )}

                    {/* Dev OTP hint */}
                    {devOtp && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center">
                            <span className="font-semibold">DEV ONLY:</span> Your OTP is{' '}
                            <span
                                className="font-mono tracking-widest font-bold cursor-pointer underline"
                                onClick={() => setDigits(devOtp.split(''))}
                            >
                                {devOtp}
                            </span>
                        </div>
                    )}

                    {/* 6 digit boxes */}
                    <div className="flex justify-between gap-2 mb-6" onPaste={handlePaste}>
                        {digits.map((d, i) => (
                            <input
                                key={i}
                                ref={el => { inputRefs.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={d}
                                onChange={e => handleDigitChange(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                className={`digit-box${d ? ' filled' : ''}`}
                                disabled={loading || success}
                            />
                        ))}
                    </div>

                    {/* Verify button */}
                    <button
                        className="verify-btn mb-3"
                        onClick={handleVerify}
                        disabled={loading || otp.length !== 6 || success}
                    >
                        {loading ? 'Verifying…' : 'Verify & Create Wallet'}
                    </button>

                    {/* Resend button */}
                    <button
                        className="resend-btn"
                        disabled={timer > 0}
                        onClick={() => setTimer(120)}
                    >
                        Resend Code
                    </button>

                    {/* Timer */}
                    <p className="mt-4 text-center text-[#9baab8] text-xs">
                        Code expires in{' '}
                        <span className="font-semibold text-[#0f1f17]">{formatTimer(timer)}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function OtpVerificationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#2d9e6b] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <OtpVerificationContent />
        </Suspense>
    );
}