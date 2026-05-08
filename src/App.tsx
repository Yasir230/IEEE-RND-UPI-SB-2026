import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Navigation from './components/Navigation';
import AudioPlayer from './components/AudioPlayer';
import CinematicIntro from './components/CinematicIntro';
import Slideshow from './components/Slideshow';
import SlideshowAudio from './components/SlideshowAudio';
import HeroSection from './sections/HeroSection';
import IntroSection from './sections/IntroSection';
import PhotoGallerySection from './sections/PhotoGallerySection';
import FeaturedMemorySection from './sections/FeaturedMemorySection';
import FooterSection from './sections/FooterSection';
import useHumanizeDOM from './hooks/useHumanizeDOM';

import './App.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [slideshowMusic, setSlideshowMusic] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);

  // IntersectionObserver fade-in for sections below hero
  useEffect(() => {
    const sections = mainRef.current?.querySelectorAll('section');
    if (!sections) return;

    sections.forEach((sec, i) => {
      if (i === 0) return; // skip hero
      sec.classList.add('opacity-0', 'translate-y-6', 'transition-all', 'duration-700', 'ease-out');
    });

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('opacity-0', 'translate-y-6');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    sections.forEach((sec, i) => {
      if (i > 0) obs.observe(sec);
    });

    return () => obs.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const openSlideshow = () => {
    setSlideshowOpen(true);
    setSlideshowMusic(true);
  };

  const closeSlideshow = () => {
    setSlideshowOpen(false);
    setSlideshowMusic(false);
  };

  const requestMusic = () => {
    setSlideshowMusic(true);
  };

  // Programmatically humanize all text in the DOM
  useHumanizeDOM(true);

  return (
    <div className="relative">
      <CinematicIntro />
      <Navigation onScrollTo={scrollTo} />
      <main ref={mainRef}>
        <HeroSection onOpenSlideshow={openSlideshow} />
        <IntroSection />
        <PhotoGallerySection />
        <FeaturedMemorySection />
        <FooterSection />
      </main>
      <AudioPlayer slideshowActive={slideshowOpen} />
      <Slideshow open={slideshowOpen} onClose={closeSlideshow} onRequestMusic={requestMusic} />
      <SlideshowAudio active={slideshowMusic} />
    </div>
  );
}

export default App;
