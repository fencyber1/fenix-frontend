import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  const current = images[index];

  return (
    <div className="relative w-full">
      {/* Image stack with CSS crossfade */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
        {images.map((img, i) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === index ? 1 : 0 }}
          />
        ))}
      </div>

      {/* Dots indicator */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {images.map((img, i) => (
          <button
            key={img.src}
            onClick={() => setIndex(i)}
            className="group relative h-2 transition-all duration-300"
            style={{ width: i === index ? 24 : 8 }}
          >
            <span
              className="absolute inset-0 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i === index ? img.color : 'rgba(255,255,255,0.2)',
              }}
            />
          </button>
        ))}
      </div>

      {/* Label badge */}
      <div className="mt-3 text-center">
        <span
          key={current.label}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium animate-fadeIn"
          style={{
            backgroundColor: `${current.color}18`,
            color: current.color,
            border: `1px solid ${current.color}30`,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: current.color }}
          />
          {current.label}
        </span>
      </div>
    </div>
  );
}
