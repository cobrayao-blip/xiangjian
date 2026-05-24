import React, { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({ src, alt, className }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-stone-200/40 text-[10px] text-stone-500 font-serif ${className ?? ''}`}
        role="img"
        aria-label={alt}
      >
        香笺图
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
