import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

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
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [next, interval]);

  const variants = {
    enter: (d: number) => ({
      x: d > 0 ? 60 : -60,
      opacity: 0,
      scale: 0.96,
    }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({
      x: d > 0 ? -60 : 60,
      opacity: 0,
      scale: 0.96,
    }),
  };

  const current = images[index];

  return (
    <div className="relative w-full">
      {/* Image stack */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
        <AnimatePresence custom={direction} mode="wait">
          <motion.img
            key={current.src}
            src={current.src}
            alt={current.alt}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
      </div>

      {/* Dots indicator */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {images.map((img, i) => (
          <button
            key={img.src}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
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
      <AnimatePresence mode="wait">
        <motion.div
          key={current.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="mt-3 text-center"
        >
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
