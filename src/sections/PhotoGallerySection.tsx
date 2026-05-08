import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { galleryPhotos } from '../data/photos';

gsap.registerPlugin(ScrollTrigger);

export default function PhotoGallerySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<{ src: string; caption: string } | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const headerEls = sectionRef.current?.querySelectorAll('.header-reveal');
      if (headerEls) {
        gsap.fromTo(
          headerEls,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.12,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      const polaroids = gridRef.current?.querySelectorAll('.gallery-polaroid');
      if (polaroids) {
        gsap.fromTo(
          polaroids,
          {
            opacity: 0,
            y: 60,
            scale: 0.9,
            rotation: (i: number) => (i % 2 === 0 ? -5 : 5),
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotation: (i: number) => galleryPhotos[i]?.rotation || 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.06,
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightbox({ src: galleryPhotos[index].src, caption: galleryPhotos[index].caption });
  };

  const navigateLightbox = (dir: number) => {
    const newIndex = (currentIndex + dir + galleryPhotos.length) % galleryPhotos.length;
    setCurrentIndex(newIndex);
    setLightbox({ src: galleryPhotos[newIndex].src, caption: galleryPhotos[newIndex].caption });
  };

  return (
    <section
      id="gallery"
      ref={sectionRef}
      style={{
        background: '#F5F0E8',
        padding: '120px clamp(20px, 4vw, 64px) 80px',
      }}
    >
      {/* Section Header */}
      <div className="text-center mb-12">
        <span
          className="header-reveal font-label block"
          style={{ color: '#0077B6', marginBottom: 16 }}
        >
          GALLERY
        </span>
        <h2
          className="header-reveal font-heading-section"
          style={{ color: '#1A1A1A', marginBottom: 12 }}
        >
          Captured Moments
        </h2>
        <p
          className="header-reveal font-body"
          style={{ color: 'rgba(45, 45, 45, 0.7)' }}
        >
          Setiap Photo Mengandung Konten Bawang.
        </p>
      </div>

      {/* Masonry Grid */}
      <div
        ref={gridRef}
        className="gallery-grid"
        style={{
          columns: 3,
          columnGap: 24,
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        {galleryPhotos.map((photo, i) => (
          <div
            key={photo.id}
            className="gallery-polaroid cursor-pointer"
            style={{
              breakInside: 'avoid',
              marginBottom: 24,
              transformOrigin: 'center center',
            }}
            onClick={() => openLightbox(i)}
          >
            <div
              className="bg-white transition-all duration-400 group"
              style={{
                padding: '12px 12px 0',
                borderRadius: 4,
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
                transform: `rotate(${photo.rotation}deg)`,
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = 'rotate(0deg) translateY(-8px) scale(1.02)';
                el.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = `rotate(${photo.rotation}deg)`;
                el.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)';
              }}
            >
              <div className="relative overflow-hidden" style={{ borderRadius: 2 }}>
                <img
                  src={photo.src}
                   alt=""
                  loading="lazy"
                  className="w-full block"
                  style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                />
              </div>
              <div
                className="flex items-center justify-center"
                style={{
                  height: 40,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'rgba(45, 45, 45, 0.5)',
                }}
              >
                {photo.caption}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(3, 4, 94, 0.92)', backdropFilter: 'blur(8px)' }}
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 text-white hover:opacity-70 transition-opacity"
            onClick={() => setLightbox(null)}
            style={{ fontSize: 32, zIndex: 101 }}
          >
            ✕
          </button>
          <button
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:opacity-70 transition-opacity"
            onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
            style={{ fontSize: 36, zIndex: 101 }}
          >
            ‹
          </button>
          <button
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:opacity-70 transition-opacity"
            onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
            style={{ fontSize: 36, zIndex: 101 }}
          >
            ›
          </button>
          <div
            className="relative max-w-4xl max-h-[85vh] mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.src}
              alt={lightbox.caption}
              className="max-w-full max-h-[75vh] object-contain"
              style={{ borderRadius: 8 }}
            />
            <p
              className="font-label text-center mt-4"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              {lightbox.caption}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .gallery-grid { columns: 2 !important; }
        }
        @media (max-width: 480px) {
          .gallery-grid { columns: 1 !important; }
        }
      `}</style>
    </section>
  );
}
