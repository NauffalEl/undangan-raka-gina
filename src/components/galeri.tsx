"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Ornamen } from "./icons";
import { Reveal } from "./ui";
import { cn } from "@/lib/utils";

export type Foto = { src: string; alt: string };

/** Fokus terperangkap di dalam lightbox (a11y dialog). */
function useFocusTrap(aktif: boolean, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!aktif) return;
    const node = ref.current;
    if (!node) return;
    const fokusSebelum = document.activeElement as HTMLElement | null;
    const fokusabel = node.querySelectorAll<HTMLElement>(
      'button, a[href], [tabindex]:not([tabindex="-1"])',
    );
    const pertama = fokusabel[0];
    const terakhir = fokusabel[fokusabel.length - 1];
    pertama?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (fokusabel.length === 0) return;
      if (e.shiftKey && document.activeElement === pertama) {
        e.preventDefault();
        terakhir.focus();
      } else if (!e.shiftKey && document.activeElement === terakhir) {
        e.preventDefault();
        pertama.focus();
      }
    };
    node.addEventListener("keydown", onKey);
    return () => {
      node.removeEventListener("keydown", onKey);
      fokusSebelum?.focus?.();
    };
  }, [aktif, ref]);
}

function deterministicRotate(i: number, seed: number): { x: number; y: number; z: number; zDepth: number } {
  const r = ((i * 9301 + 49297 + seed * 233280) % 233280) / 233280;
  const r2 = ((i * 9301 + 49297 + (seed + 7) * 233280) % 233280) / 233280;
  const r3 = ((i * 9301 + 49297 + (seed + 13) * 233280) % 233280) / 233280;
  const r4 = ((i * 9301 + 49297 + (seed + 19) * 233280) % 233280) / 233280;
  return {
    x: (r2 * 2 - 1) * 4,
    y: (r * 2 - 1) * 6,
    z: (r3 * 2 - 1) * 2,
    zDepth: r4 * 12,
  };
}

function PolaroidThumb({
  foto,
  index,
  onClick,
  isDesktop,
}: {
  foto: Foto;
  index: number;
  onClick: () => void;
  isDesktop: boolean;
}) {
  if (isDesktop) {
    // Desktop: polaroid 3D berserakan
    const rot = deterministicRotate(index, 111);
    const delay = index * 70; // stagger 70ms
    return (
      <button
        type="button"
        role="listitem"
        onClick={onClick}
        aria-label={`Foto ${index + 1}`}
        className={cn(
          "relative group aspect-[4/5] rounded-md border border-line bg-surface-warm",
          "transition-transform duration-[220ms] hover:translate-z-[16px] hover:rotate-0",
          "cursor-pointer",
        )}
        style={{
          "--delay": `${delay}ms`,
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg) rotateZ(${rot.z}deg) translateZ(${rot.zDepth}px)`,
          transitionDelay: `${delay}ms`,
          perspective: "1200px",
        } as React.CSSProperties}
      >
        <Image
          src={foto.src}
          alt={foto.alt}
          fill
          sizes="(max-width:1023px) 50vw, 33vw"
          loading="lazy"
          className="object-cover rounded-md"
        />
        <figcaption className="absolute bottom-0 left-0 right-0 bg-white px-3 py-2 text-center text-micro text-ink-soft">
          {foto.alt}
        </figcaption>
      </button>
    );
  }
  // Mobile: grid 2 kolom rapi, flip 3D saat diklik
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      role="listitem"
      onClick={() => {
        setFlipped(true);
        setTimeout(() => onClick(), 190); // 380ms flip total, open halfway
      }}
      aria-label={`Foto ${index + 1}`}
      className={cn(
        "relative group aspect-[4/5] rounded-md border border-line bg-surface-warm",
        "perspective-[1200px]",
        flipped && "flip-num", // flip-num keyframe 600ms, using for 380ms? adjust
      )}
    >
      <div
        className="relative aspect-[4/5] w-full overflow-hidden rounded-md"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 380ms var(--ease-soft-out)",
          transform: flipped ? "rotateY(-90deg)" : "rotateY(0deg)",
        }}
      >
        <Image
          src={foto.src}
          alt={foto.alt}
          fill
          sizes="(max-width:1023px) 50vw, 33vw"
          loading="lazy"
          className="object-cover"
        />
      </div>
    </button>
  );
}

export function Lightbox({
  foto,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  foto: Foto[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const sentuh = useRef<{ x: number; y: number } | null>(null);
  useFocusTrap(true, ref);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  const arus = foto[index];
  if (!arus) return null;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ${index + 1} dari ${foto.length}`}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[var(--color-veil)] p-4"
      onTouchStart={(e) => {
        const t = e.touches[0];
        sentuh.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        const t = e.changedTouches[0];
        const dx = t.clientX - (sentuh.current?.x ?? t.clientX);
        if (Math.abs(dx) > 40) {
          if (dx < 0) onNext();
          else onPrev();
        }
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup galeri"
        className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <span aria-hidden className="text-2xl leading-none">×</span>
      </button>

      <figure className="flex min-h-0 flex-col items-center gap-3">
        <div
          className="zoom-3d relative h-[82svh] w-full max-w-3xl overflow-hidden rounded-lg"
          style={{ perspective: "1200px" }}
        >
          <Image
            key={arus.src}
            src={arus.src}
            alt={arus.alt}
            fill
            sizes="(max-width:1023px) 92vw, 768px"
            className="object-contain"
            priority
          />
        </div>
        <figcaption className="flex items-center gap-4 text-caption text-white/90">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Foto sebelumnya"
            className="grid h-12 w-12 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
          >
            <span aria-hidden className="text-xl">‹</span>
          </button>
          <span className="tabular-nums">
            {index + 1} / {foto.length}
          </span>
          <button
            type="button"
            onClick={onNext}
            aria-label="Foto berikutnya"
            className="grid h-12 w-12 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
          >
            <span aria-hidden className="text-xl">›</span>
          </button>
        </figcaption>
      </figure>
    </div>
  );
}

export function Galeri({ foto }: { foto: Foto[] }) {
  const [buka, setBuka] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const tutup = useCallback(() => setBuka(null), []);
  const prev = useCallback(
    () => setBuka((i) => (i === null ? null : (i - 1 + foto.length) % foto.length)),
    [foto.length],
  );
  const next = useCallback(
    () => setBuka((i) => (i === null ? null : (i + 1) % foto.length)),
    [foto.length],
  );

  return (
    <section id="galeri" aria-labelledby="galeri-judul" className="px-5 py-14">
      <Reveal className="mx-auto max-w-[48rem]">
        <div className="mb-8 flex justify-center" aria-hidden>
          <Ornamen />
        </div>
        <h2
          id="galeri-judul"
          className="text-center font-display text-display-lg text-ink"
        >
          Galeri
        </h2>

        {foto.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-3 text-center">
            <Ornamen />
            <p className="font-display text-display-sm italic text-ink-soft">
              Galeri menyusul
            </p>
          </div>
        ) : (
          <>
            <div
              className="mt-8 grid gap-2"
              role="list"
              aria-label="Foto kenangan"
              style={{
                gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
              }}
            >
              {foto.slice(0, 9).map((f, i) => (
                <PolaroidThumb
                  key={f.src}
                  foto={f}
                  index={i}
                  onClick={() => setBuka(i)}
                  isDesktop={isDesktop}
                />
              ))}
            </div>
            {buka !== null && (
              <Lightbox
                foto={foto}
                index={buka}
                onClose={tutup}
                onPrev={prev}
                onNext={next}
              />
            )}
          </>
        )}
      </Reveal>
    </section>
  );
}