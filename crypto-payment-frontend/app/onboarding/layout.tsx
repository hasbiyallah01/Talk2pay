import type { Metadata } from 'next';
import { TranslationProvider } from '@/components/onboarding/TranslationProvider';
import '@/components/onboarding/onboarding.css';

export const metadata: Metadata = {
  title: 'Talk2Pay — Get Started',
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <TranslationProvider>
      {children}
    </TranslationProvider>
  );
}