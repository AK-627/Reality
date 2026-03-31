"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mainError, setMainError] = useState(false);
  const [thumbErrors, setThumbErrors] = useState<Record<number, boolean>>({});

  const hasImages = images.length > 0;
  const activeImage = hasImages && !mainError ? images[activeIndex] : null;

  function handleThumbError(idx: number) {
    setThumbErrors((prev) => ({ ...prev, [idx]: true }));
  }

  return (
    <div className="space-y-2">
      {/* Main image */}
      <div className="relative w-full aspect-[16/9] bg-grey-100 rounded-lg overflow-hidden">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={`${title} — image ${activeIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 80vw"
            className="object-cover"
            priority
            onError={() => setMainError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-grey-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              className="w-16 h-16 mb-2"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-sm">No image available</span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActiveIndex(idx);
                setMainError(false);
              }}
              aria-label={`View image ${idx + 1}`}
              aria-pressed={idx === activeIndex}
              className={`relative flex-shrink-0 w-20 h-14 rounded overflow-hidden border-2 transition-colors ${
                idx === activeIndex
                  ? "border-black"
                  : "border-grey-200 hover:border-grey-400"
              }`}
            >
              {!thumbErrors[idx] ? (
                <Image
                  src={src}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                  onError={() => handleThumbError(idx)}
                />
              ) : (
                <div className="absolute inset-0 bg-grey-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="w-6 h-6 text-grey-300"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
