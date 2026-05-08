import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { featuredPhoto } from '../data/photos';

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedMemorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const polaroidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Polaroid entrance
      if (polaroidRef.current) {
        gsap.fromTo(
          polaroidRef.current,
          { opacity: 0, x: -60, rotation: -5 },
          {
            opacity: 1,
            x: 0,
            rotation: -1.5,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Text entrance
      const textEls = sectionRef.current?.querySelectorAll('.text-reveal');
      if (textEls) {
        gsap.fromTo(
          textEls,
          { opacity: 0, x: 30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power2.out',
            stagger: 0.15,
            delay: 0.3,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        background: '#03045E',
        padding: '120px clamp(20px, 4vw, 64px)',
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16">
        {/* Left — Large Polaroid */}
        <div className="w-full md:w-[55%] flex justify-center">
          <div
            ref={polaroidRef}
            className="cursor-pointer transition-all duration-500"
            style={{
              maxWidth: 420,
              width: '100%',
              transform: `rotate(${featuredPhoto.rotation}deg)`,
              boxShadow: '0 0 40px rgba(72, 202, 228, 0.3), 0 20px 60px rgba(3, 4, 94, 0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'rotate(0deg) scale(1.03)';
              e.currentTarget.style.boxShadow = '0 0 60px rgba(72, 202, 228, 0.5), 0 30px 80px rgba(3, 4, 94, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = `rotate(${featuredPhoto.rotation}deg)`;
              e.currentTarget.style.boxShadow = '0 0 40px rgba(72, 202, 228, 0.3), 0 20px 60px rgba(3, 4, 94, 0.25)';
            }}
          >
            <div
              className="bg-white"
              style={{
                padding: '20px 20px 0',
                borderRadius: 4,
              }}
            >
              <div className="relative overflow-hidden" style={{ borderRadius: 2 }}>
                <img
                  src={featuredPhoto.src}
                  alt={featuredPhoto.caption}
                  loading="lazy"
                  className="w-full block"
                  style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                />
              </div>
              <div
                className="flex items-center justify-center"
                style={{
                  height: 60,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'rgba(45, 45, 45, 0.5)',
                }}
              >
                {featuredPhoto.caption}
              </div>
            </div>
          </div>
        </div>

        {/* Right — Text */}
        <div className="w-full md:w-[45%]">
          <span
            className="text-reveal font-label block"
            style={{ color: '#48CAE4', marginBottom: 20 }}
          >
            FEATURED MEMORY
          </span>

          <blockquote
            className="text-reveal"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 'clamp(24px, 3vw, 40px)',
              lineHeight: 1.2,
              color: '#FFFFFF',
              fontStyle: 'italic',
              marginBottom: 24,
            }}
          >
            "In the end, RND bukan hanya tentang project , lomba atau riset. RND tempat sebagai rumah ke dua kita. i wont forget your memories"
          </blockquote>

          <p
            className="text-reveal font-body-sm"
            style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}
          >
            — RND Division, IEEE UPI SB
          </p>

          <div className="text-reveal flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            <span
              className="font-label"
              style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}
            >
              Soundtrack: She & Him — I Thought I Saw Your Face Today
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
