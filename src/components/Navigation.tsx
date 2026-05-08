import { useEffect, useRef, useState } from 'react';

interface NavigationProps {
  onScrollTo: (id: string) => void;
}

export default function Navigation({ onScrollTo }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { label: 'Memories', target: 'hero' },
    { label: 'Gallery', target: 'gallery' },
    { label: 'About', target: 'intro' },
  ];

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        padding: '0 clamp(20px, 4vw, 64px)',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        background: scrolled ? 'rgba(253, 251, 247, 0.85)' : 'transparent',
        borderBottom: scrolled
          ? '1px solid rgba(0, 0, 0, 0.06)'
          : '1px solid transparent',
      }}
    >
      <div className="flex items-center justify-between h-16">
        <button
          onClick={() => onScrollTo('hero')}
          className="font-nav flex items-center gap-1 transition-colors duration-400"
          style={{ color: scrolled ? '#1A1A1A' : '#FFFFFF' }}
        >
          <span>IEEE UPI SB</span>
          <span style={{ color: '#48CAE4' }}>— RND</span>
        </button>

        <div className="flex items-center gap-8">
          {links.map((link) => (
            <button
              key={link.target}
              onClick={() => onScrollTo(link.target)}
              className="font-nav relative transition-colors duration-400 hover:opacity-70"
              style={{ color: scrolled ? '#1A1A1A' : '#FFFFFF' }}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
