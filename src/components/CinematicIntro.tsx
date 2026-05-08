import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function CinematicIntro() {
  const [showIntro, setShowIntro] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const alreadyPlayed = sessionStorage.getItem('rnd_intro_played');
    if (alreadyPlayed) return;

    // Delay slightly to let browser paint the page beneath
    const timer = setTimeout(() => {
      setShowIntro(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showIntro) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(overlayRef.current, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
              setShowIntro(false);
              sessionStorage.setItem('rnd_intro_played', 'true');
            },
          });
        },
      });

      // Black fade in
      tl.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
      );

      // Dramatic reveal: scale up from 0.5 + fade
      tl.fromTo(
        logoRef.current,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(1.2)' },
        '-=0.1'
      );

      // Light sweep across
      tl.fromTo(
        sweepRef.current,
        { x: '-100%', opacity: 0.6 },
        { x: '200%', opacity: 0, duration: 1.2, ease: 'power2.inOut' },
        '-=0.5'
      );

      // Animated divider
      tl.fromTo(
        lineRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.6, ease: 'power3.out' },
        '-=0.7'
      );

      // Hold ~2.0s total from start, then fade out
      tl.to({}, { duration: 0.6 });
    });

    return () => ctx.revert();
  }, [showIntro]);

  const skip = () => {
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        setShowIntro(false);
        sessionStorage.setItem('rnd_intro_played', 'true');
      },
    });
  };

  if (!showIntro) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: '#000000', opacity: 0 }}
    >
      {/* Skip button */}
      <button
        onClick={skip}
        className="absolute top-6 right-6 font-label text-white/60 hover:text-white transition-colors"
        style={{ fontSize: 11, letterSpacing: '0.1em' }}
      >
        SKIP INTRO
      </button>

      {/* Center content */}
      <div ref={logoRef} className="relative flex flex-col items-center" style={{ opacity: 0 }}>
        {/* IEEE Diamond Mark */}
        <div
          className="mb-6"
          style={{
            width: 56,
            height: 56,
            border: '2px solid rgba(255,255,255,0.9)',
            transform: 'rotate(45deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            className="font-label"
            style={{
              transform: 'rotate(-45deg)',
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}
          >
            IEEE
          </span>
        </div>

        {/* Title */}
        <h1
          className="font-heading-section"
          style={{ color: '#FFFFFF', fontSize: 'clamp(32px, 5vw, 56px)', textAlign: 'center' }}
        >
          RND UPI SB
        </h1>

        {/* Divider */}
        <div
          ref={lineRef}
          style={{
            width: 120,
            height: 1,
            background: 'rgba(72, 202, 228, 0.8)',
            marginTop: 16,
            marginBottom: 16,
            transformOrigin: 'center',
            opacity: 0,
          }}
        />

        {/* Subtitle */}
        <p
          className="font-label"
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: '0.15em' }}
        >
          MEMORIES
        </p>

        {/* Light sweep */}
        <div
          ref={sweepRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(72, 202, 228, 0.25) 50%, transparent 100%)',
            width: '60%',
            height: '100%',
            left: '-30%',
            top: 0,
            opacity: 0,
          }}
        />
      </div>

      {/* Reduced motion fallback */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          [ref="overlayRef"] {
            transition: opacity 0.3s ease !important;
          }
        }
      `}</style>
    </div>
  );
}
