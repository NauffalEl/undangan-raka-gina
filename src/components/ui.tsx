"use client";

import { useEffect, useRef, useState } from "react";
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
  jumlah = 8,
  area = "hero",
}: {
  jumlah?: number;
  area?: "hero" | "mempelai" | "penutup";
}) {
  usePauseOnHidden();
  const max = area === "hero" ? 8 : area === "mempelai" ? 4 : 6;
  const n = Math.min(jumlah, max);

  const petals = Array.from({ length: n }, (_, i) => {
    const r = pseudo(i, area === "hero" ? 11 : area === "mempelai" ? 22 : 33);
    const r2 = pseudo(i + 7, 5);
    const r3 = pseudo(i + 13, 9);
    return {
      left: `${((i + 0.5) / n) * 100}%`,
      drift: `${Math.round((r * 2 - 1) * (area === "hero" ? 60 : 36))}px`,
      size: area === "hero" ? 9 + Math.round(r2 * 5) : 8 + Math.round(r2 * 4),
      dur: area === "hero" ? 9 + r3 * 5 : 7 + r3 * 4,
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
