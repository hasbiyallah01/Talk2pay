'use client';
import { useCallback, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import PhoneJourney from '@/components/PhoneJourney';
import WhiteTransitionSection from '@/components/WhiteTransitionSection';
import LaptopSection from '@/components/LaptopSection';
import MarqueeSection from '@/components/MarqueeSection';
import FAQSection from '@/components/FAQSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';

export default function Home() {
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded]         = useState(false);
  const [screenGone, setScreenGone]     = useState(false);

  /* Lock scroll while loading, release on exit */
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, []);

  const handleExitDone = useCallback(() => {
    document.documentElement.style.overflow = '';
    setScreenGone(true);
  }, []);

  return (
    <main>
      {/* Loading screen sits above everything; slides up on complete */}
      {!screenGone && (
        <LoadingScreen
          progress={loadProgress}
          isComplete={isLoaded}
          onExitDone={handleExitDone}
        />
      )}

      <Navbar theme="green" />
      <PhoneJourney
        onProgress={setLoadProgress}
        onLoaded={() => setIsLoaded(true)}
      />
      <WhiteTransitionSection />
      <MarqueeSection />
      <LaptopSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
