import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: '7', label: 'Members' },
  { value: '8', label: 'Projects' },
  { value: '100', label: 'Makan-Makan' },
];

export default function IntroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const elements = sectionRef.current?.querySelectorAll('.reveal-item');
      if (!elements) return;

      gsap.fromTo(
        elements,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="intro"
      ref={sectionRef}
      style={{
        background: '#FDFBF7',
        padding: '120px clamp(20px, 4vw, 64px)',
      }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <span
          className="reveal-item font-label block"
          style={{ color: '#0077B6', marginBottom: 16 }}
        >
          ABOUT RND
        </span>

        <h2
          className="reveal-item font-heading-section"
          style={{ color: '#1A1A1A', marginBottom: 24 }}
        >
          Where ideas become impact.
        </h2>

        <p
          className="reveal-item font-body"
          style={{ color: '#2D2D2D', marginBottom: 48, maxWidth: 640, margin: '0 auto 48px' }}
        >
          IEEE RnD UPI SB — a place where joy thrives, where division supremacy is claimed, where knowledge is pursued, where the greatest manager GHERRY leads, and where memories are made that will never fade. Thank you all. .
        </p>

        {/* Stats Row */}
        <div className="reveal-item flex items-center justify-center gap-0">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center">
              <div className="flex flex-col items-center" style={{ padding: '0 32px' }}>
                <span
                  className="font-heading-sub"
                  style={{ fontWeight: 600, color: '#1A1A1A', fontSize: 28 }}
                >
                  {stat.value}
                </span>
                <span
                  className="font-body-sm"
                  style={{ color: 'rgba(45, 45, 45, 0.6)' }}
                >
                  {stat.label}
                </span>
              </div>
              {i < stats.length - 1 && (
                <div
                  style={{
                    width: 1,
                    height: 40,
                    background: 'rgba(0,0,0,0.1)',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
