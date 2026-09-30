import Image from "next/image";
import clsx from "clsx";
import { ImageOff } from "lucide-react";

/**
 * Equipment photo for both the admin area and the public QR page. Signed
 * Supabase URLs are external to the Next.js origin, so they skip the image
 * optimizer (same approach as ForkliftMedia).
 */
export function EquipmentPhoto({
  src,
  alt,
  className,
  sizes = "(min-width: 768px) 640px, 100vw",
  priority,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div className={clsx("flex flex-col items-center justify-center gap-1 text-black/30", className)}>
        <ImageOff size={24} aria-hidden="true" />
        <span className="font-aux text-[10px] uppercase tracking-wide">Sem foto</span>
      </div>
    );
  }

  return (
    <div className={clsx("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        unoptimized={/^https?:\/\//.test(src)}
        sizes={sizes}
        className="object-contain"
      />
    </div>
  );
}
