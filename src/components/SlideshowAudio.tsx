import { useEffect, useRef, useState, useCallback } from 'react';

const AUDIO_SRC = '/audio/she-and-him.mp3';

interface SlideshowAudioProps {
  active: boolean;
}

export default function SlideshowAudio({ active }: SlideshowAudioProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [muted, setMuted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [playing, setPlaying] = useState(false);
  const toastTimerRef = useRef<number | null>(null);
  const fadeTimerRef = useRef<number | null>(null);

  const clearFade = () => {
    if (fadeTimerRef.current) {
      window.clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  };

  const fadeVolume = useCallback((target: number, durationMs: number) => {
    const gain = gainRef.current;
    if (!gain) return;
    const start = gain.gain.value;
    const delta = target - start;
    const steps = 30;
    const stepTime = durationMs / steps;
    let i = 0;
    clearFade();
    fadeTimerRef.current = window.setInterval(() => {
      i++;
      const ratio = i / steps;
      gain.gain.value = start + delta * ratio;
      if (i >= steps) clearFade();
    }, stepTime);
  }, []);

  useEffect(() => {
    if (!active) {
      // Fade out then stop
      if (gainRef.current && audioRef.current) {
        fadeVolume(0, 1500);
        window.setTimeout(() => {
          audioRef.current?.pause();
          setPlaying(false);
        }, 1500);
      }
      return;
    }

    // Initialize Web Audio on first active trigger
    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio(AUDIO_SRC);
      audio.loop = true;
      audio.crossOrigin = 'anonymous';
      audioRef.current = audio;

      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);
      gainRef.current = gain;

      const source = ctx.createMediaElementSource(audio);
      source.connect(gain);
      sourceRef.current = source;
    }

    // Resume context if suspended
    if (ctxRef.current?.state === 'suspended') {
      ctxRef.current.resume();
    }

    audio
      .play()
      .then(() => {
        setPlaying(true);
        setShowToast(false);
        // Fade in to 0.8 over 2s
        fadeVolume(muted ? 0 : 0.8, 2000);
      })
      .catch(() => {
        setShowToast(true);
        if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = window.setTimeout(() => setShowToast(false), 4000);
      });

    return () => {
      clearFade();
    };
  }, [active, fadeVolume, muted]);

  // Handle user interaction to unlock audio if blocked
  useEffect(() => {
    if (!showToast) return;
    const unlock = () => {
      if (ctxRef.current?.state === 'suspended') {
        ctxRef.current.resume();
      }
      audioRef.current
        ?.play()
        .then(() => {
          setPlaying(true);
          setShowToast(false);
          fadeVolume(muted ? 0 : 0.8, 2000);
        })
        .catch(() => {});
    };
    window.addEventListener('click', unlock, { once: true });
    return () => window.removeEventListener('click', unlock);
  }, [showToast, fadeVolume, muted]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      if (gainRef.current) {
        fadeVolume(next ? 0 : 0.8, 400);
      }
      return next;
    });
  }, [fadeVolume]);

  return (
    <>
      {/* Bottom-left music widget */}
      {active && (
        <div
          className="fixed z-[160] flex items-center gap-3"
          style={{ bottom: 20, left: 20 }}
        >
          <div className="flex items-end gap-[3px] h-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-white/70 rounded-sm"
                style={{
                  height: '100%',
                  animation: playing && !muted ? `equalizer 0.5s ease infinite alternate` : 'none',
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </div>
          <div className="flex flex-col">
            <span className="font-label text-white/80" style={{ fontSize: 9 }}>
              She & Him
            </span>
            <span className="font-label text-white/50" style={{ fontSize: 8 }}>
              I Thought I Saw Your Face Today
            </span>
          </div>
          <button
            onClick={toggleMute}
            className="text-white/70 hover:text-white transition-colors"
            style={{ fontSize: 14 }}
            aria-label="Toggle mute"
          >
            {muted ? '🔇' : '🔊'}
          </button>

          <style>{`
            @keyframes equalizer {
              0% { transform: scaleY(0.2); }
              100% { transform: scaleY(1); }
            }
          `}</style>
        </div>
      )}

      {/* Autoplay blocked toast */}
      {showToast && (
        <div
          className="fixed z-[170] px-4 py-2 rounded font-label text-white"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(3,4,94,0.85)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(72,202,228,0.3)',
            fontSize: 12,
          }}
        >
          Tap di mana aja buat nyalain musik 🎵
        </div>
      )}
    </>
  );
}
