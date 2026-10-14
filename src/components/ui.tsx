"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Ornamen } from "./icons";

/* ── Singleton: pause semua looping saat tab hidden ── */
let visWired = false;
function usePauseOnHidden() {
  useEffect(() => {
    if (visWired || typeof document === "undefined") return;
    visWired = true;
    const sync = () => {
      document.documentElement.dataset.paused = document.hidden ? "1" : "0";
    };
    sync();
    document.addEventListener("visibilitychange", sync);
  }, []);
}

/* ── Kelopak: partikel bunga jatuh ── */
function pseudo(i: number, salt = 0): number {
  // deterministik 0..1, tanpa Math.random (hindari hydration mismatch)
  return ((i * 9301 + 49297 + salt * 233280) % 233280) / 233280;
}

export function Kelopak({
  jumlah = 12,
  area = "hero",
}: {
  jumlah?: number;
  area?: "hero" | "mempelai" | "penutup";
}) {
  usePauseOnHidden();
  const max = area === "hero" ? 16 : area === "mempelai" ? 6 : 12;
  const n = Math.min(jumlah, max);

  const petals = Array.from({ length: n }, (_, i) => {
    const r = pseudo(i, area === "hero" ? 11 : area === "mempelai" ? 22 : 33);
    const r2 = pseudo(i + 7, 5);
    const r3 = pseudo(i + 13, 9);
    return {
      left: `${((i + 0.5) / n) * 100}%`,
      drift: `${Math.round((r * 2 - 1) * (area === "hero" ? 80 : 60))}px`,
      size: area === "hero" ? 10 + Math.round(r2 * 8) : 10 + Math.round(r2 * 6),
      dur: area === "hero" ? 10 + r3 * 6 : 9 + r3 * 5,
      delay: -(r * (area === "hero" ? 12 : 6)),
      bg: i % 2 === 0 ? "var(--color-blush)" : "var(--color-accent-line)",
      opacity: i % 3 === 0 ? 0.55 : 0.7,
    };
  });

  return (
    <div className="petal-layer" aria-hidden>
      {petals.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={
            {
              left: p.left,
              "--petal-drift": p.drift,
              width: `${p.size}px`,
              height: `${p.size + 2}px`,
              background: p.bg,
              opacity: p.opacity as unknown as string,
              animationDuration: `${p.dur.toFixed(2)}s`,
              animationDelay: `${p.delay.toFixed(2)}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Reveal v2: rise-3d (perspective + rotateX kecil saat scroll masuk, bukan cuma translateY). */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "article" | "li" | "section" | "header" | "footer";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [isAnim, setIsAnim] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          setIsAnim(true);
          window.setTimeout(() => setIsAnim(false), 700);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Component = Tag as React.ElementType;

  return (
    <Component
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn("reveal3d", visible && "is-in", isAnim && "is-anim", className)}
    >
      <div className="reveal3d-inner">{children}</div>
    </Component>
  );
}

type Variant = "primary" | "secondary" | "ghost" | "quiet" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent-lite text-ink hover:bg-accent shadow-sm active:scale-[.98]",
  secondary:
    "bg-sage-700 text-white hover:bg-sage-600 shadow-sm active:scale-[.98]",
  ghost:
    "border border-accent-line text-accent-deep hover:bg-accent-soft active:scale-[.98]",
  quiet: "text-ink-soft underline-offset-4 hover:underline",
  danger: "bg-danger text-white hover:opacity-90 active:scale-[.98]",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 rounded-sm px-4 text-label",
  md: "min-h-11 rounded-md px-5 text-label",
  lg: "min-h-13 rounded-pill px-6 text-body-lg",
};

export function Tombol({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}) {
  const isLoading = loading || rest["aria-busy"] === true;
  return (
    <button
      {...rest}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={cn(
        "inline-flex min-w-0 items-center justify-center gap-2 font-semibold transition-[transform,background-color,color,border-color] duration-[160ms]",
        variants[variant],
        sizes[size],
        (disabled || isLoading) && "cursor-not-allowed opacity-50 shadow-none",
        className,
      )}
    >
      {isLoading && (
        <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      <span className="truncate">{children}</span>
    </button>
  );
}

/** Tombol yang berupa anchor (link eksternal) — gaya identik <Tombol>. */
export function TombolAnchor({
  children,
  href,
  variant = "primary",
  size = "md",
  className,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold no-underline transition-[transform,background-color,color,border-color] duration-[160ms] active:scale-[.98]",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {children}
    </a>
  );
}

export function Chip({
  children,
  tone = "gold",
  className,
}: {
  children: React.ReactNode;
  tone?: "gold" | "sage" | "netral" | "success" | "danger";
  className?: string;
}) {
  const tones = {
    gold: "bg-accent-soft text-accent-deep",
    sage: "bg-sage-100 text-sage-700",
    netral: "bg-surface-warm text-ink-soft",
    success: "bg-success-soft text-success",
    danger: "bg-danger-soft text-danger",
  };
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-1 rounded-pill px-3 text-micro font-semibold tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Field label + helper/error. Label selalu terikat ke kontrol lewat id. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 text-left", className)}>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-label font-semibold text-ink"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-2 text-caption text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="mt-2 text-caption text-ink-soft">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function OrnamenWrapper({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center", className)} aria-hidden>
      <Ornamen />
    </div>
  );
}

/** Tema warna input di seluruh form supaya fokus konsisten. */
export const inputClass = cn(
  "w-full rounded-md border border-line-strong bg-surface px-4 text-body text-ink shadow-sm transition",
  "placeholder:text-ink-muted focus:border-accent-600 focus:ring-[var(--ring-gold)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
);

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-line bg-danger-soft p-4 text-left text-danger" role="alert">
      <p className="text-body font-semibold">Koneksi bermasalah</p>
      <p className="mt-1 text-body-sm">Periksa internet lalu coba kirim ulang.</p>
      <Tombol variant="danger" size="sm" onClick={onRetry} className="mt-3">
        Coba lagi
      </Tombol>
    </div>
  );
}

/* ============================================================
   V3 — ORNAMEN SVG INLINE (currentColor, tanpa file external)
   ============================================================ */

/** Corner flourish: kembang barok di 1 sudut, di-rotate 0/90/180/270. */
export function CornerFlourish({
  pos = "tl",
  size = 40,
  className,
}: {
  pos?: "tl" | "tr" | "bl" | "br";
  size?: number;
  className?: string;
}) {
  const rot = { tl: 0, tr: 90, br: 180, bl: 270 }[pos];
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden
      focusable="false"
      className={cn("pointer-events-none absolute", className)}
      style={{
        transform: `rotate(${rot}deg)`,
        top: pos[0] === "t" ? -2 : undefined,
        bottom: pos[0] === "b" ? -2 : undefined,
        left: pos[1] === "l" ? -2 : undefined,
        right: pos[1] === "r" ? -2 : undefined,
      }}
    >
      {/* Kembang + daun roll, berpusat di sudut kiri-atas */}
      <path d="M2 2c0 8 4 14 12 16-5 1-9 4-11 9 6-3 12-3 18 0-3-6-3-12 0-18C16 6 9 4 2 2z" />
      <path d="M20 6c4 0 7 3 7 7 0-4-3-7-7-7z" />
      <path d="M6 20c0 4 3 7 7 7-4 0-7-3-7-7z" />
      <circle cx="24" cy="3" r="1.6" />
      <circle cx="3" cy="24" r="1.6" />
    </svg>
  );
}

/**
 * OrnateDivider — divider section 2 lapis:
 * depan (solid) + belakang (bronze, blur, translateZ di bawah).
 */
export function OrnateDivider({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const w = { sm: 100, md: 140, lg: 180 }[size];
  const paths = (
    <>
      <path d="M0 12h52M84 12h52" />
      <path d="M68 3c4.5 5 4.5 11 0 16-4.5-5-4.5-11 0-16z" />
      <path d="M68 8.5c2.5 1.8 2.5 5.2 0 7-2.5-1.8-2.5-5.2 0-7z" />
      <circle cx="44" cy="12" r="2.4" />
      <circle cx="92" cy="12" r="2.4" />
      <path d="M36 9l2 3-2 3-2-3 2-3z" />
      <path d="M100 9l2 3-2 3-2-3 2-3z" />
    </>
  );
  return (
    <span
      className={cn("relative inline-block shrink-0 align-middle", className)}
      style={{ width: w, height: 24 }}
      aria-hidden
    >
      {/* Lapis belakang: bronze, blur, sedikit turun — depth */}
      <svg
        viewBox="0 0 136 24"
        className="absolute inset-0 text-[var(--color-bronze)] opacity-45 blur-[0.6px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        style={{ transform: "translateY(2px)" }}
        aria-hidden
      >
        {paths}
      </svg>
      {/* Lapis depan: emas terang */}
      <svg
        viewBox="0 0 136 24"
        className="absolute inset-0 text-[var(--color-accent)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        aria-hidden
      >
        {paths}
      </svg>
    </span>
  );
}

/** Tape strip — selotip kecil dekoratif di sudut polaroid. */
export function TapeStrip({
  pos = "left",
  className,
}: {
  pos?: "left" | "right";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute -top-2 h-5 w-14 rounded-[1px] shadow-[0_1px_2px_rgba(46,31,20,.15)]",
        pos === "left" ? "-left-3 -rotate-[6deg]" : "-right-3 rotate-[6deg]",
        className,
      )}
      style={{
        background:
          "linear-gradient(180deg, rgba(247,236,200,.92), rgba(217,190,120,.85))",
        border: "1px dashed rgba(194,155,68,.55)",
      }}
    />
  );
}

/**
 * OrnamenLFramed — ornamen sudut L untuk kartu (2 sudut diagonal),
 * dipakai FramedCard. currentColor.
 */
export function OrnamenLFramed({
  pos = "tl",
  size = 28,
  className,
}: {
  pos?: "tl" | "tr" | "bl" | "br";
  size?: number;
  className?: string;
}) {
  const rot = { tl: 0, tr: 90, br: 180, bl: 270 }[pos];
  return (
    <svg
      viewBox="0 0 28 28"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden
      focusable="false"
      className={cn("pointer-events-none absolute", className)}
      style={{
        transform: `rotate(${rot}deg)`,
        top: pos[0] === "t" ? 4 : undefined,
        bottom: pos[0] === "b" ? 4 : undefined,
        left: pos[1] === "l" ? 4 : undefined,
        right: pos[1] === "r" ? 4 : undefined,
      }}
    >
      <path d="M3 25V9a6 6 0 0 1 6-6h16" />
      <path d="M7 25V11a4 4 0 0 1 4-4h14" opacity=".55" />
      <circle cx="3" cy="6.5" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="24.5" cy="3" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ============================================================
   V3 — WRAPPER BINGKAI FOTO (foto DI-CLIP ke shape, tdk stretch)
   ============================================================ */

export type BingkaiVariant = "deco-barok" | "arch" | "polaroid";
export type BingkaiRatio = "4:5" | "arch" | "square";

/**
 * FramedImage — foto di-clip ke shape:
 * deco-barok (hero 4:5, corner flourish 4 arah, 3 lapis 3D),
 * arch (border-radius elliptik Safari-safe), polaroid (4:5 + tape).
 * Selalu object-fit:cover + object-position:center → crop, bukan stretch.
 */
export function FramedImage({
  src,
  alt,
  ratio = "4:5",
  variant = "deco-barok",
  sizes,
  priority = false,
  className,
  caption,
  layer = true,
}: {
  src: string;
  alt: string;
  ratio?: BingkaiRatio;
  variant?: BingkaiVariant;
  sizes?: string;
  priority?: boolean;
  className?: string;
  caption?: string;
  /** false = hanya foto + clip (pakai untuk area yang sudah punya bingkai sendiri) */
  layer?: boolean;
}) {
  const shape =
    variant === "arch"
      ? "framed-arch"
      : variant === "polaroid"
        ? "framed-polaroid"
        : "framed-hero";

  const imgSizes = sizes ?? "(max-width: 640px) 90vw, 400px";

  const foto = (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={imgSizes}
      className="object-cover object-center"
    />
  );

  if (!layer) {
    return (
      <span className={cn(shape, "block overflow-hidden", className)}>{foto}</span>
    );
  }

  if (variant === "deco-barok") {
    // Hero: 3 lapis — (a) bronze-deep belakang, (b) gold-hi + flourish, (c) foto
    return (
      <span className={cn("relative block", className)}>
        <span aria-hidden className="framed-hero-back" />
        <span aria-hidden className="framed-hero-mid" />
        <span className={cn(shape, "relative overflow-hidden")}>
          {foto}
          <span aria-hidden className="framed-hero-ring" />
          <CornerFlourish pos="tl" size={34} className="text-[var(--color-gold-hi)] z-20" />
          <CornerFlourish pos="tr" size={34} className="text-[var(--color-gold-hi)] z-20" />
          <CornerFlourish pos="bl" size={34} className="text-[var(--color-gold-hi)] z-20" />
          <CornerFlourish pos="br" size={34} className="text-[var(--color-gold-hi)] z-20" />
        </span>
      </span>
    );
  }

  if (variant === "arch") {
    // Profil: bronze di belakang + ring ornamen di sekeliling
    return (
      <span className={cn("relative block", className)}>
        <span
          aria-hidden
          className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-[var(--color-bronze)] opacity-60"
          style={{ borderRadius: "50% 50% var(--arch-radius) var(--arch-radius) / 34% 34% var(--arch-radius) var(--arch-radius)" }}
        />
        <span className={cn(shape, "relative overflow-hidden")}>
          {foto}
          <span aria-hidden className="framed-arch-ring" />
          <CornerFlourish pos="bl" size={30} className="text-[var(--color-gold-hi)] z-20" />
          <CornerFlourish pos="br" size={30} className="text-[var(--color-gold-hi)] z-20" />
        </span>
      </span>
    );
  }

  // polaroid: ivory frame + tape + caption strip
  return (
    <span
      className={cn(
        "block bg-[var(--ivory)] p-2 pb-8 shadow-[var(--shadow-md)] ring-1 ring-[var(--color-line)]",
        className,
      )}
      style={{ borderRadius: "var(--polaroid-border)" }}
    >
      <span className="relative block">
        <span className={cn(shape, "relative overflow-hidden")}>{foto}</span>
        <TapeStrip pos="left" />
        <TapeStrip pos="right" />
      </span>
      {caption ? <span className="polaroid-caption">{caption}</span> : null}
    </span>
  );
}

/**
 * FramedCard — kartu dengan bingkai double-line + corner flourish 4 sudut.
 * Dipakai kartu acara / section berbingkai.
 */
export function FramedCard({
  children,
  className,
  corners = true,
}: {
  children: React.ReactNode;
  className?: string;
  corners?: boolean;
}) {
  return (
    <div className={cn("card-double-corner", className)}>
      {corners && (
        <>
          <CornerFlourish pos="tl" size={30} className="card-corner-flourish tl" />
          <CornerFlourish pos="tr" size={30} className="card-corner-flourish tr" />
          <CornerFlourish pos="bl" size={30} className="card-corner-flourish bl" />
          <CornerFlourish pos="br" size={30} className="card-corner-flourish br" />
        </>
      )}
      {children}
    </div>
  );
}
