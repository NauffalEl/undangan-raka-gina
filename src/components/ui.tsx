"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Ornamen } from "./icons";

/** Animasi masuk ringan: transform + opacity, sekali terlihat, tanpa layout shift. */
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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reduced-motion / tanpa IO: biarkan tampil (CSS media query yang
    // menetralkan .reveal-hidden — tanpa setState di effect).
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
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
      className={cn("reveal", !visible && "reveal-hidden", className)}
    >
      {children}
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