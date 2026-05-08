import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function BumperLogo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ieeeRef = useRef<HTMLSpanElement>(null);
  const rndRef = useRef<HTMLSpanElement>(null);
  const plusRef = useRef<HTMLSpanElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.6 });

      // IEEE slides from left
      tl.fromTo(
        ieeeRef.current,
        { x: -120, opacity: 0, scale: 0.8 },
        { x: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.4)' }
      );

      // RND slides from right
      tl.fromTo(
        rndRef.current,
        { x: 120, opacity: 0, scale: 0.8 },
        { x: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.4)' },
        '<'
      );

      // Plus sign fades in
      tl.fromTo(
        plusRef.current,
        { scale: 0, opacity: 0, rotate: -90 },
        { scale: 1, opacity: 1, rotate: 0, duration: 0.5, ease: 'back.out(2)' },
        '-=0.4'
      );

      // Glow burst when they meet
      tl.fromTo(
        haloRef.current,
        { scale: 0.2, opacity: 0 },
        { scale: 1.5, opacity: 0.6, duration: 0.5, ease: 'power2.out' },
        '-=0.3'
      );
      tl.to(haloRef.current, { scale: 2, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.2');

      // Idle floating loop after merge
      tl.add(() => {
        gsap.to(containerRef.current, {
          y: -6,
          duration: 2.5,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });

        // Rotating glow ring
        gsap.to(ringRef.current, {
          rotate: 360,
          duration: 12,
          ease: 'none',
          repeat: -1,
        });

        // Gentle pulse on the plus
        gsap.to(plusRef.current, {
          scale: 1.2,
          opacity: 0.8,
          duration: 1.5,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative flex items-center justify-center gap-3 my-3 select-none">
      {/* Rotating glow ring (subtle) */}
      <div
        ref={ringRef}
        className="absolute pointer-events-none"
        style={{
          width: 180,
          height: 180,
          borderRadius: '50%',
          border: '1px solid rgba(72, 202, 228, 0.15)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Burst halo */}
      <div
        ref={haloRef}
        className="absolute pointer-events-none"
        style={{
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(72, 202, 228, 0.4) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0,
        }}
      />

      {/* IEEE badge */}
      <span
        ref={ieeeRef}
        className="font-label"
        style={{
          color: '#FFFFFF',
          fontSize: 14,
          letterSpacing: '0.12em',
          fontWeight: 600,
          padding: '6px 10px',
          border: '1px solid rgba(255,255,255,0.35)',
          borderRadius: 2,
          opacity: 0,
        }}
      >
        IEEE
      </span>

      {/* Plus connector */}
      <span
        ref={plusRef}
        className="font-label"
        style={{
          color: '#48CAE4',
          fontSize: 16,
          fontWeight: 300,
          opacity: 0,
        }}
      >
        +
      </span>

      {/* RND badge */}
      <span
        ref={rndRef}
        className="font-label"
        style={{
          color: '#48CAE4',
          fontSize: 14,
          letterSpacing: '0.12em',
          fontWeight: 600,
          padding: '6px 10px',
          border: '1px solid rgba(72, 202, 228, 0.4)',
          borderRadius: 2,
          opacity: 0,
        }}
      >
        RND
      </span>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          [ref="containerRef"] * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
