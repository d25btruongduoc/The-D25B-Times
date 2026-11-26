import { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface EditorialImageProps {
  src: string;
  alt: string;
  caption?: string;
  figureNumber?: string;
  className?: string;
  imgClassName?: string;
}

export function EditorialImage({
  src,
  alt,
  caption,
  figureNumber,
  className = '',
  imgClassName = 'w-full h-full object-cover',
}: EditorialImageProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <figure className={`flex flex-col ${className}`}>
      <div className="relative overflow-hidden rounded-xl bg-[#0E1525] border border-slate-800 flex-1 min-h-[220px]">
        {!hasError ? (
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className={imgClassName}
          />
        ) : (
          <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#0E1525] to-[#131C31] text-slate-300">
            <BookOpen className="w-8 h-8 mb-3 text-cyan-400" strokeWidth={1.5} />
            <p className="font-heading text-base font-bold text-slate-100">{alt}</p>
            {figureNumber && (
              <p className="mt-1 text-xs font-mono text-slate-400">{figureNumber}</p>
            )}
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2.5 text-xs text-slate-400 font-sans leading-relaxed">
          {figureNumber && (
            <span className="font-mono font-semibold text-cyan-400 mr-1.5">
              {figureNumber}
            </span>
          )}
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
