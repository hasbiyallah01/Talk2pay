// 'use client';
// import { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRouter } from 'next/navigation';

// const steps = [
//   {
//     icon: '🎙',
//     title: 'VOICE IS YOUR KEYBOARD',
//     body: 'Speak naturally to move money. We understand intent, not just commands.',
//     color: '#2D7A4F'
//   },
//   {
//     icon: '💬',
//     title: 'WHATSAPP PAYMENTS',
//     body: 'Your existing WhatsApp becomes a full banking terminal. No extra app needed.',
//     color: '#25D366'
//   },
//   {
//     icon: '⚡',
//     title: 'INSTANT ANYWHERE',
//     body: 'Send to any bank, wallet, or phone number in under a second.',
//     color: '#2D7A4F'
//   },
//   {
//     icon: '🔐',
//     title: 'BANK-GRADE SECURITY',
//     body: 'AI fraud detection, biometric auth, and zero-knowledge proofs protect you.',
//     color: '#2D7A4F'
//   },
// ];

// export default function Onboarding() {
//   const [current, setCurrent] = useState(0);
//   const router = useRouter();

//   const next = () => {
//     if (current < steps.length - 1) setCurrent(c => c + 1);
//     else router.push('/dashboard');
//   };

//   const step = steps[current];

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden"
//       style={{ background: '#0a0a0a' }}>
      
//       <div className="absolute inset-0 transition-all duration-1000" style={{
//         background: `radial-gradient(ellipse at 50% 40%, ${step.color}15 0%, transparent 60%)`
//       }} />

//       {/* Progress */}
//       <div className="flex gap-2 mb-16 z-10">
//         {steps.map((_, i) => (
//           <motion.div key={i}
//             animate={{ width: i === current ? 40 : 12, background: i <= current ? '#2D7A4F' : 'rgba(255,255,255,0.15)' }}
//             transition={{ duration: 0.4 }}
//             className="h-1 rounded-full"
//           />
//         ))}
//       </div>

//       <AnimatePresence mode="wait">
//         <motion.div
//           key={current}
//           initial={{ opacity: 0, y: 30, scale: 0.97 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           exit={{ opacity: 0, y: -20, scale: 0.97 }}
//           transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
//           className="text-center z-10 max-w-lg"
//         >
//           <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-10"
//             style={{
//               background: `${step.color}20`,
//               border: `1px solid ${step.color}30`,
//               fontSize: '48px'
//             }}
//           >
//             {step.icon}
//           </div>

//           <h2 className="font-candal text-white leading-[0.9] mb-6" style={{ fontSize: '48px' }}>
//             {step.title}
//           </h2>
//           <p className="font-neue text-white/50 text-lg leading-relaxed mb-12">{step.body}</p>
//         </motion.div>
//       </AnimatePresence>

//       <div className="flex items-center gap-4 z-10">
//         {current < steps.length - 1 && (
//           <button onClick={() => router.push('/dashboard')}
//             className="font-neue text-white/30 text-sm hover:text-white/50 transition-colors">
//             Skip
//           </button>
//         )}
//         <motion.button
//           onClick={next}
//           whileHover={{ scale: 1.04 }}
//           whileTap={{ scale: 0.97 }}
//           className="px-10 py-4 rounded-2xl font-candal text-white text-sm tracking-widest"
//           style={{ background: '#2D7A4F', boxShadow: '0 8px 30px rgba(45,122,79,0.3)' }}
//         >
//           {current < steps.length - 1 ? 'NEXT →' : 'ENTER TRUST2PAY'}
//         </motion.button>
//       </div>
//     </div>
//   );
// }\

// app/onboarding/page.tsx  (route: /onboarding)
import WelcomeScreen from '@/components/onboarding/WelcomeScreen';
export default function OnboardingPage() { return <WelcomeScreen />; }


// ─────────────────────────────────────────────────────────────────────────────
// app/onboarding/language/page.tsx  (route: /onboarding/language)
// ─────────────────────────────────────────────────────────────────────────────
// import LanguageScreen from '@/components/onboarding/LanguageScreen';
// export default function LanguagePage() { return <LanguageScreen />; }


// ─────────────────────────────────────────────────────────────────────────────
// app/onboarding/accessibility/page.tsx  (route: /onboarding/accessibility)
// ─────────────────────────────────────────────────────────────────────────────
// import AccessibilityScreen from '@/components/onboarding/AccessibilityScreen';
// export default function AccessibilityPage() { return <AccessibilityScreen />; }


// ─────────────────────────────────────────────────────────────────────────────
// app/onboarding/success/page.tsx  (route: /onboarding/success)
// ─────────────────────────────────────────────────────────────────────────────
// import SuccessScreen from '@/components/onboarding/SuccessScreen';
// export default function SuccessPage() { return <SuccessScreen />; }