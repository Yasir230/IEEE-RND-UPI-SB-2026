import { forwardRef } from 'react';

interface PolaroidCardProps {
  src: string;
  caption: string;
  rotation?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

const sizeMap = {
  sm: { width: 140, padding: 8, captionH: 28 },
  md: { width: 180, padding: 12, captionH: 36 },
  lg: { width: 220, padding: 16, captionH: 44 },
};

const PolaroidCard = forwardRef<HTMLDivElement, PolaroidCardProps>(
  ({ src, caption, rotation = 0, size = 'md', className = '', style }, ref) => {
    const s = sizeMap[size];
    const height = s.width * 1.22 + s.captionH;

    return (
      <div
        ref={ref}
        className={`relative flex-none preserve-3d cursor-pointer group ${className}`}
        style={{
          width: s.width,
          height,
          transform: `rotate(${rotation}deg)`,
          transformStyle: 'preserve-3d',
          ...style,
        }}
      >
        <div
          className="relative w-full h-full grid bg-white"
          style={{
            borderRadius: 4,
            boxShadow: '0 10px 30px rgba(3, 4, 94, 0.2)',
            gridTemplateRows: `1fr ${s.captionH}px`,
            transition: 'box-shadow 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div
            className="relative overflow-hidden"
            style={{
              margin: `${s.padding}px ${s.padding}px 0`,
              borderRadius: 2,
            }}
          >
            <img
              src={src}
               alt=""
              loading="lazy"
              className="w-full h-full object-cover block"
              style={{ transition: 'transform 0.4s ease' }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius: 2,
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
              }}
            />
          </div>
          <div
            className="flex items-center justify-center"
            style={{
              padding: `0 ${s.padding}px`,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: size === 'lg' ? 11 : size === 'md' ? 10 : 9,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'rgba(45, 45, 45, 0.5)',
            }}
          >
            {caption}
          </div>
        </div>

        <style>{`
          .group:hover > div:first-child {
            box-shadow: 0 25px 50px rgba(3, 4, 94, 0.3);
          }
          .group:hover img {
            transform: scale(1.05);
          }
        `}</style>
      </div>
    );
  }
);

PolaroidCard.displayName = 'PolaroidCard';

export default PolaroidCard;
