import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import WaterCanvas from '../components/WaterCanvas';
import PolaroidCard from '../components/PolaroidCard';
import BumperLogo from '../components/BumperLogo';
import { heroPhotos } from '../data/photos';

interface HeroSectionProps {
  onOpenSlideshow: () => void;
}

// Scatter configuration — expanded radius to avoid covering hero text
const finalRotations = [-12, 15, -8, 10, -18, 12, -15];

const cardPositions = [
  { left: '4%', top: '8%' },    // Top Left
  { left: '84%', top: '12%' },   // Top Right
  { left: '88%', top: '50%' },   // Mid Right
  { left: '5%', top: '58%' },    // Mid Left
  { left: '16%', top: '32%' },   // Upper Mid Left
  { left: '76%', top: '35%' },   // Upper Mid Right
  { left: '3%', top: '78%' },    // Bottom Left
];

const finalOffsets = [
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 },
];

const zIndexes = [3, 5, 2, 4, 1, 6, 2];

export default function HeroSection({ onOpenSlideshow }: HeroSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Text entrance animation
      const tl = gsap.timeline({ delay: 0.3 });

      tl.to(labelRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      })
        .to(
          titleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
          },
          '-=0.3'
        )
        .to(
          subtitleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.5'
        )
        .to(
          scrollIndicatorRef.current,
          {
            opacity: 1,
            duration: 0.6,
          },
          '-=0.2'
        );

      // 3D Card entrance animation
      const cards = cardRefs.current.filter(Boolean);
      if (cards.length > 0) {
        const cardTl = gsap.timeline({
          delay: 0.5,
          onComplete: () => {
            // Start idle floating animations
            cards.forEach((card, i) => {
              gsap.to(card, {
                rotateX: 5,
                y: `-=${8 + (i % 3)}`,
                duration: 2 + i * 0.1,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
                delay: i * 0.2,
              });
            });
          },
        });

        // Set initial state — larger random scatter for dramatic entry
        cardTl.set(cards, {
          scale: 0.2,
          rotationZ: () => gsap.utils.random(-35, 35),
          rotationY: -270,
          rotationX: () => gsap.utils.random(-50, 50),
          x: () => gsap.utils.random(-400, 400),
          y: () => gsap.utils.random(-200, 200),
          z: -3000,
          opacity: 0,
        });

        // Rise from deep Z
        cardTl.to(cards, {
          duration: 0.8,
          opacity: 1,
          z: -500,
          ease: 'expo.out',
          stagger: { each: 0.05, from: 'center' },
        });

        // Approach and unfold
        cardTl.to(
          cards,
          {
            duration: 1.2,
            rotationY: 0,
            rotationX: 0,
            z: 0,
            ease: 'back.out(0.8)',
            stagger: { each: 0.06, from: 'center' },
          },
          '-=0.4'
        );

        // Scale to normal
        cardTl.to(
          cards,
          {
            duration: 0.6,
            scale: 1,
            ease: 'expo.out',
            stagger: { each: 0.05, from: 'center' },
          },
          '-=0.7'
        );

        // XY to final scattered offsets
        cardTl.to(
          cards,
          {
            duration: 1.0,
            x: (i: number) => finalOffsets[i]?.x || 0,
            y: (i: number) => finalOffsets[i]?.y || 0,
            ease: 'expo.out',
            stagger: { each: 0.04, from: 'center' },
          },
          '-=0.5'
        );

        // Rotate to final angles
        cardTl.to(
          cards,
          {
            duration: 0.8,
            rotationZ: (i: number) => finalRotations[i] || 0,
            ease: 'power2.out',
            stagger: { each: 0.04, from: 'center' },
          },
          '-=0.6'
        );
      }

      // Scroll indicator loop
      gsap.to('.scroll-circle', {
        y: 30,
        opacity: 0,
        duration: 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 1.5,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: '100vh' }}
    >
      {/* WebGL Water Background */}
      <WaterCanvas />

      {/* Grain Overlay */}
      <div className="grain-overlay" />

      {/* Vignette */}
      <div className="vignette-overlay" />

      {/* Text Content */}
      <div
        className="absolute inset-0 flex flex-col items-center z-10"
        style={{ paddingTop: '28vh' }}
      >
        <span
          ref={labelRef}
          className="font-label opacity-0"
          style={{
            color: '#48CAE4',
            opacity: 0,
            transform: 'translateY(20px)',
          }}
        >
          RND DIVISION
        </span>

        <BumperLogo />

        <h1
          ref={titleRef}
          className="font-heading-hero mt-4 opacity-0"
          style={{
            color: '#FFFFFF',
            opacity: 0,
            transform: 'translateY(40px)',
          }}
        >
          Memories
        </h1>

        <p
          ref={subtitleRef}
          className="font-heading-sub mt-4 italic opacity-0"
          style={{
            color: 'rgba(255,255,255,0.85)',
            maxWidth: 500,
            textAlign: 'center',
            padding: '0 24px',
            opacity: 0,
            transform: 'translateY(20px)',
          }}
        >
          I thought I saw your face today.
        </p>

        {/* Slideshow trigger */}
        <button
          onClick={onOpenSlideshow}
          className="mt-8 font-label px-5 py-2.5 rounded border transition-all duration-300 hover:bg-white/10 hover:scale-105 active:scale-95"
          style={{
            color: '#FFFFFF',
            borderColor: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.08em',
            fontSize: 11,
          }}
        >
          ▶ Mulai Cerita
        </button>

        {/* Scroll Indicator */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-12 flex flex-col items-center opacity-0"
        >
          <div className="relative" style={{ width: 1, height: 40 }}>
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(255,255,255,0.3)', width: 1 }}
            />
            <div
              className="scroll-circle absolute top-0"
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.6)',
                left: -2,
              }}
            />
          </div>
          <span
            className="font-label mt-3"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Scroll
          </span>
        </div>
      </div>

      {/* 3D Memory Card Cluster — full-bleed container for free scatter */}
      <div
        ref={cardsRef}
        className="absolute inset-0 z-10 perspective-1000 hidden md:block pointer-events-none"
      >
        <div className="relative w-full h-full preserve-3d">
          {heroPhotos.map((photo, i) => (
            <div
              key={photo.id}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="absolute preserve-3d pointer-events-auto hero-polaroid"
              style={{
                left: cardPositions[i]?.left || `${i * 20}%`,
                top: cardPositions[i]?.top || '20%',
                zIndex: zIndexes[i] || 1,
                transformStyle: 'preserve-3d',
                willChange: 'transform',
              }}
            >
              <PolaroidCard
                src={photo.src}
                caption={photo.caption}
                rotation={0}
                size="sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile card row — reduced scatter, no overflow */}
      <div
        className="absolute z-10 flex md:hidden items-end justify-center gap-3 pointer-events-none"
        style={{ bottom: '10%', left: 0, right: 0, padding: '0 16px' }}
      >
        {heroPhotos.slice(0, 3).map((photo, i) => (
          <div
            key={photo.id}
            className="pointer-events-auto hero-polaroid-mobile"
            style={{
              transform: `rotate(${finalRotations[i] * 0.4}deg) translateY(${i % 2 === 0 ? 0 : -10}px)`,
              maxWidth: '30vw',
            }}
          >
            <PolaroidCard
              src={photo.src}
              caption={photo.caption}
              rotation={0}
              size="sm"
            />
          </div>
        ))}
      </div>

      <style>{`
        .hero-polaroid {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease;
        }
        .hero-polaroid:hover {
          transform: translateY(-12px) scale(1.06) !important;
          z-index: 20 !important;
        }
        .hero-polaroid:hover > div > div:first-child {
          box-shadow: 0 30px 60px rgba(3, 4, 94, 0.35), 0 10px 20px rgba(0,0,0,0.15);
        }
        .hero-polaroid-mobile {
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease;
        }
        .hero-polaroid-mobile:active {
          transform: translateY(-8px) scale(1.04) !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-polaroid,
          .hero-polaroid-mobile {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
