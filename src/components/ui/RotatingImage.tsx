import { useState, useEffect, useRef } from 'react';

interface ImageItem {
  src: string;
  alt: string;
  label: string;
  color: string;
}

export default function RotatingImage({
  images,
  interval = 4500,
}: {
  images: ImageItem[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      timeoutRef.current = setTimeout(() => {
        setIndex((i) => (i + 1) % images.length);
        setIsAnimating(false);
      }, 350);
    }, interval);
    return () => {
      clearInterval(timer);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [images.length, interval]);

  const goTo = (i: number) => {
    if (i === index) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIndex(i);
      setIsAnimating(false);
    }, 350);
  };

  const current = images[index];

  return (
    <div className="relative w-full select-none">
      {/* Image container */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-navy-900">
        {images.map((img, i) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              opacity: isAnimating ? 0 : (i === index ? 1 : 0),
              transform: i === index
                ? 'scale(1)'
                : isAnimating
                  ? 'scale(1.04)'
                  : 'scale(1)',
              transition: 'opacity 400ms ease, transform 400ms ease',
            }}
          />
        ))}

        {/* Slide indicator bar at top */}
        <div className="absolute left-0 right-0 top-0 h-1 bg-white/10">
          <div
            key={`bar-${index}`}
            className="h-full rounded-r-full"
            style={{
              backgroundColor: current.color,
              animation: `slideBar ${interval}ms linear`,
            }}
          />
        </div>
      </div>

      {/* Dots indicator */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {images.map((img, i) => (
          <button
            key={img.src}
            onClick={() => goTo(i)}
            className="relative h-2 rounded-full transition-all duration-300"
            style={{
              width: i === index ? 28 : 8,
              backgroundColor: i === index ? img.color : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </div>

      {/* Label badge */}
      <div className="mt-3 text-center">
        <span
          key={current.label}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
          style={{
            backgroundColor: `${current.color}18`,
            color: current.color,
            border: `1px solid ${current.color}30`,
            animation: 'fadeIn 300ms ease forwards',
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: current.color }}
          />
          {current.label}
        </span>
      </div>

      <style>{`
        @keyframes slideBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
