import { useEffect, useRef, useState, useCallback } from 'react';

const AUDIO_SRC = '/audio/she-and-him.mp3';

interface AudioPlayerProps {
  slideshowActive?: boolean;
}

export default function AudioPlayer({ slideshowActive = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volBarRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const wasPlayingRef = useRef(false);

  // Music handoff: pause when slideshow opens, resume when it closes
  useEffect(() => {
    if (!audioRef.current) return;

    if (slideshowActive) {
      // Entering slideshow — remember state and pause
      wasPlayingRef.current = isPlaying;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      // Leaving slideshow — resume if was playing before
      if (wasPlayingRef.current) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
        wasPlayingRef.current = false;
      }
    }
  }, [slideshowActive]);

  // Create audio element
  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });

    // Try autoplay
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setHasInteracted(true);
      })
      .catch(() => {
        // Autoplay blocked — wait for any user interaction
        const unlock = () => {
          audio
            .play()
            .then(() => {
              setIsPlaying(true);
              setHasInteracted(true);
            })
            .catch(() => {});
          window.removeEventListener('click', unlock);
          window.removeEventListener('touchstart', unlock);
        };
        window.addEventListener('click', unlock, { once: false });
        window.addEventListener('touchstart', unlock, { once: false });

        // Store for cleanup
        (audio as any).__unlockFn = unlock;
      });

    return () => {
      const unlockFn = (audio as any).__unlockFn;
      if (unlockFn) {
        window.removeEventListener('click', unlockFn);
        window.removeEventListener('touchstart', unlockFn);
      }
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Progress update loop
  useEffect(() => {
    const update = () => {
      if (audioRef.current && !isScrubbing) {
        setProgress(audioRef.current.currentTime);
      }
      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isScrubbing]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (!hasInteracted) {
      setHasInteracted(true);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Still blocked
      });
    }
  }, [isPlaying, hasInteracted]);

  // Scrubbing
  const handleProgressMouseDown = (e: React.MouseEvent) => {
    setIsScrubbing(true);
    handleProgressMove(e);
  };

  const handleProgressMove = (e: React.MouseEvent | MouseEvent) => {
    if (!isScrubbing || !progressBarRef.current || !audioRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = ratio * duration;
    setProgress(ratio * duration);
  };

  const handleProgressMouseUp = () => {
    setIsScrubbing(false);
  };

  useEffect(() => {
    if (isScrubbing) {
      const onMove = (e: MouseEvent) => handleProgressMove(e);
      const onUp = () => handleProgressMouseUp();
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
    }
  }, [isScrubbing]);

  // Volume
  const handleVolMouseDown = (e: React.MouseEvent) => {
    handleVolMove(e);
    const onMove = (ev: MouseEvent) => handleVolMove(ev);
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleVolMove = (e: React.MouseEvent | MouseEvent) => {
    if (!volBarRef.current || !audioRef.current) return;
    const rect = volBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.volume = ratio;
    setVolume(ratio);
  };

  const formatTime = (t: number) => {
    if (!isFinite(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed z-50"
      style={{
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(520px, 92vw)',
        opacity: slideshowActive ? 0 : 1,
        pointerEvents: slideshowActive ? 'none' : 'auto',
        transition: 'opacity 0.4s ease',
      }}
    >
      {/* Speaker pulse rings */}
      {isPlaying && (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: 4,
              border: '1px solid rgba(201, 169, 110, 0.3)',
              animation: 'speakerPulse 2.5s ease-out infinite',
              margin: -4,
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: 4,
              border: '1px solid rgba(201, 169, 110, 0.2)',
              animation: 'speakerPulse 2.5s ease-out 0.8s infinite',
              margin: -4,
            }}
          />
        </>
      )}

      <div
        className="relative flex items-center gap-4"
        style={{
          background: '#E8DCC8',
          border: '1px solid #C4B59E',
          borderRadius: 4,
          boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4)',
          padding: '10px 16px',
        }}
      >
        {/* Inner groove */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            margin: 4,
            borderRadius: 2,
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        />

        {/* Left — Track Info */}
        <div className="flex-shrink-0 min-w-0" style={{ maxWidth: 160 }}>
          <p
            className="font-player-display truncate"
            style={{ color: '#6B5D4D', opacity: 0.7, fontSize: 10 }}
          >
            IEEE UPI SB
          </p>
          <p
            className="font-player-display truncate"
            style={{ color: '#2D2D2D', fontSize: 11 }}
          >
            I Thought I Saw Your Face Today
          </p>
          <p
            className="font-body-sm truncate"
            style={{ color: '#6B5D4D', opacity: 0.6, fontSize: 10 }}
          >
            She & Him
          </p>
        </div>

        {/* Center — Cassette Window */}
        <div className="flex-shrink-0 relative hidden sm:block" style={{ width: 120 }}>
          <div
            style={{
              aspectRatio: '2/1',
              background: '#2A2A2A',
              borderRadius: 2,
              border: '1px solid rgba(0,0,0,0.15)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Label strip */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
              style={{
                width: '90%',
                height: 16,
                background: '#D4C5AD',
                borderRadius: 1,
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                zIndex: 3,
              }}
            >
              <span
                className="font-mono uppercase"
                style={{
                  fontSize: 7,
                  color: '#4A4A4A',
                  letterSpacing: '0.05em',
                }}
              >
                RND MEMORIES MIX
              </span>
            </div>

            {/* Left hub */}
            <div
              className="absolute"
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: '3px solid #1A1A1A',
                top: 2,
                left: 8,
                zIndex: 2,
              }}
            >
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#8B7D6B',
                }}
              />
              {/* VU meter overlay */}
              {isPlaying && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(200,80,60,0.3) 0%, transparent 70%)',
                    mixBlendMode: 'screen',
                    transform: `scale(${0.6 + Math.random() * 0.4})`,
                    transition: 'transform 0.05s ease-out',
                  }}
                />
              )}
            </div>

            {/* Right hub */}
            <div
              className="absolute"
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: '3px solid #1A1A1A',
                top: 2,
                right: 8,
                zIndex: 2,
              }}
            >
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#8B7D6B',
                }}
              />
              {isPlaying && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(200,80,60,0.25) 0%, transparent 70%)',
                    mixBlendMode: 'screen',
                    transform: `scale(${0.6 + Math.random() * 0.35})`,
                    transition: 'transform 0.05s ease-out',
                  }}
                />
              )}
            </div>

            {/* Idle overlay */}
            {!hasInteracted && (
              <div
                className="absolute inset-0 flex items-center justify-center z-10"
                style={{ background: 'rgba(42,42,42,0.7)' }}
              >
                <span
                  className="font-label text-center px-2"
                  style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: 9,
                    lineHeight: 1.4,
                  }}
                >
                  Click to begin the memory
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right — Controls */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="flex-shrink-0 flex items-center justify-center transition-transform active:scale-95"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#2D2D2D',
            }}
          >
            {isPlaying ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                <rect x="2" y="1" width="3" height="10" rx="1" />
                <rect x="7" y="1" width="3" height="10" rx="1" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                <path d="M3 2l7 4-7 4V2z" />
              </svg>
            )}
          </button>

          {/* Progress */}
          <div className="flex-1 min-w-0">
            <div
              ref={progressBarRef}
              className="relative cursor-pointer"
              style={{ height: 12, display: 'flex', alignItems: 'center' }}
              onMouseDown={handleProgressMouseDown}
            >
              <div
                className="w-full"
                style={{
                  height: 3,
                  background: '#C4B59E',
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${duration > 0 ? (progress / duration) * 100 : 0}%`,
                    background: '#8B7D6B',
                    borderRadius: 2,
                    transition: isScrubbing ? 'none' : 'width 0.1s',
                  }}
                />
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: `${duration > 0 ? (progress / duration) * 100 : 0}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#6B5D4D',
                  border: '1px solid #4A4A4A',
                  opacity: 0,
                  transition: 'opacity 0.2s, left 0.1s',
                }}
                className="progress-thumb"
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-mono" style={{ fontSize: 9, color: '#6B5D4D' }}>
                {formatTime(progress)}
              </span>
              <span className="font-mono" style={{ fontSize: 9, color: '#6B5D4D' }}>
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex-shrink-0 hidden sm:block">
            <div
              ref={volBarRef}
              className="relative cursor-pointer"
              style={{ width: 50, height: 12, display: 'flex', alignItems: 'center' }}
              onMouseDown={handleVolMouseDown}
            >
              <div
                className="w-full"
                style={{
                  height: 3,
                  background: '#C4B59E',
                  borderRadius: 2,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${volume * 100}%`,
                    background: '#8B7D6B',
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes speakerPulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.04); opacity: 0; }
        }
        .progress-thumb {
          opacity: 0 !important;
        }
        *:hover > .progress-thumb,
        *:active > .progress-thumb {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
