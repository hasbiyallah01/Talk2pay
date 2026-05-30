import './globals.css';
import type { Metadata } from 'next';
import { TranslationProvider } from '@/components/onboarding/TranslationProvider';

export const metadata: Metadata = {
  title: 'Talk2Pay - Instant Voice Payments & Cross-border Remittance',
  description: 'Send money, check balances, and manage savings using your voice or messaging platforms with Talk2Pay, powered by Trust2Pay.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <TranslationProvider>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}
