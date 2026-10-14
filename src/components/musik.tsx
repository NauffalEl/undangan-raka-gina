"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Musik, Sunyi, PanahBawah } from "./icons";
import { Tombol, Chip, Kelopak } from "./ui";
import { FramedImage } from "./ui";

type MusikState = "idle" | "armed" | "playing" | "needs-tap" | "error";

const VOL_AWAL = 0.4;
const DUR_FADE = 800;

function useMusik(src: string) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<MusikState>("idle");
  const [senyap, setSenyap] = useState(false);
  const [pending, setPending] = useState(false);
  const fadeRef = useRef<number | null>(null);

  const fadeIn = useCallback((el: HTMLAudioElement) => {
    el.volume = 0;
    if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
    const mulai = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - mulai) / DUR_FADE);
      el.volume = VOL_AWAL * p;
      if (p < 1) {
        fadeRef.current = requestAnimationFrame(tick);
      } else {
        el.volume = VOL_AWAL;
        fadeRef.current = null;
      }
    };
    fadeRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const el = new Audio(src);
    el.loop = true;
    el.preload = "auto";
    el.volume = 0;
    el.muted = false;
    ref.current = el;
    const onErr = () => setState("error");
    el.addEventListener("error", onErr);
    return () => {
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
      el.removeEventListener("error", onErr);
      el.pause();
      ref.current = null;
    };
  }, [src]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    void (async () => {
      try {
        await el.play();
        if (cancelled) {
          el.pause();
          return;
        }
        fadeIn(el);
        setState("playing");
      } catch {
        if (!cancelled) setState("armed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fadeIn]);

  useEffect(() => {
    if (state !== "armed") return;
    const el = ref.current;
    if (!el) return;
    const onGesture = () => {
      void (async () => {
        try {
          fadeIn(el);
          await el.play();
          setState("playing");
        } catch {
          setState("needs-tap");
        }
      })();
    };
    const opts = { once: true, passive: true } as const;
    document.addEventListener("pointerdown", onGesture, opts);
    document.addEventListener("touchstart", onGesture, opts);
    document.addEventListener("keydown", onGesture, opts);
    document.addEventListener("scroll", onGesture, { once: true, passive: true });
    return () => {
      document.removeEventListener("pointerdown", onGesture);
      document.removeEventListener("touchstart", onGesture);
      document.removeEventListener("keydown", onGesture);
      document.removeEventListener("scroll", onGesture);
    };
  }, [state, fadeIn]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onVis = () => {
      if (document.hidden) {
        el.pause();
      } else if (state === "playing" && !senyap) {
        void el.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [state, senyap]);

  const mulai = useCallback(async () => {
    const el = ref.current;
    if (!el) return false;
    setPending(true);
    try {
      if (el.readyState === 0) el.load();
      fadeIn(el);
      await el.play();
      setState("playing");
      return true;
    } catch {
      setState((s) => (s === "error" ? "error" : "needs-tap"));
      return false;
    } finally {
      setPending(false);
    }
  }, [fadeIn]);

  const toggleSenyap = useCallback(async () => {
    const el = ref.current;
    if (!el) return;
    const next = !senyap;
    el.muted = next;
    setSenyap(next);
    if (!next) {
      try {
        if (el.readyState === 0) el.load();
        await el.play();
      } catch {
        setState((s) => (s === "error" ? "error" : "needs-tap"));
      }
    }
  }, [senyap]);

  return { state, senyap, pending, mulai, toggleSenyap };
}

export function Cover({
  nama = "Raka & Gina",
  tanggal = "20 . 12 . 2026",
  hero = "/foto/hero.svg",
}: {
  nama?: string;
  tanggal?: string;
  hero?: string;
}) {
  const [pria, , wanita] = nama.split(" ");
  const { state, senyap, pending, mulai, toggleSenyap } = useMusik("/musik.mp3");
  const sudahBuka = state === "playing";

  // Curtain reveal state
  const [opening, setOpening] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Parallax + tilt refs
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [tiltEnabled, setTiltEnabled] = useState(false);

  // Detect pointer:fine for tilt (desktop only)
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setTiltEnabled(mq.matches);
  }, []);

  // Parallax scroll: foto translateY(scrollY * 0.06), bingkai * 0.03
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        frame.style.setProperty("--py", `${y * 0.06}px`);
        frame.style.setProperty("--py-bg", `${y * 0.03}px`);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Tilt pointer (±4° hero saja, desktop only)
  useEffect(() => {
    if (!tiltEnabled) return;
    const frame = frameRef.current;
    if (!frame) return;
    const onMove = (e: PointerEvent) => {
      const rect = frame.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      frame.style.setProperty("--tilt-x", `${Math.max(-4, Math.min(4, dy * 4))}deg`);
      frame.style.setProperty("--tilt-y", `${Math.max(-4, Math.min(4, -dx * 4))}deg`);
    };
    const onLeave = () => {
      frame.style.setProperty("--tilt-x", "0deg");
      frame.style.setProperty("--tilt-y", "0deg");
    };
    frame.addEventListener("pointermove", onMove);
    frame.addEventListener("pointerleave", onLeave);
    return () => {
      frame.removeEventListener("pointermove", onMove);
      frame.removeEventListener("pointerleave", onLeave);
    };
  }, [tiltEnabled]);

  const bukaUndangan = async () => {
    if (opening) return;
    setOpening(true);
    void mulai();
    // Curtain 900ms lalu scroll ke #salam
    setTimeout(() => {
      setRevealed(true);
      document.querySelector("#salam")?.scrollIntoView({ behavior: "smooth" });
    }, 880);
  };

  return (
    <section
      id="cover"
      aria-labelledby="cover-title"
      className="relative isolate min-h-[92svh] overflow-hidden"
    >
      {/* Curtain panels — 2 panel kiri/kanan terangkat + fade */}
      {!revealed && (
        <div className="absolute inset-0 z-0 flex" aria-hidden>
          <div
            className={cn(
              "h-full w-1/2 bg-[var(--bg)]",
              opening && "curtain-up"
            )}
          />
          <div
            className={cn(
              "h-full w-1/2 bg-[var(--surface-warm)]",
              opening && "curtain-down"
            )}
          />
        </div>
      )}

      {/* Hero-stage: 3 lapis frame + float + parallax + tilt */}
      <div
        ref={frameRef}
        className="hero-stage relative z-10 mx-auto flex min-h-[92svh] max-w-[28rem] flex-col items-center justify-center gap-5 px-5 py-10"
        style={{
          perspective: "1000px",
          transform: "rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) translateY(var(--py, 0px))",
          transformStyle: "preserve-3d",
        }}
      >
        {/* V3: FramedImage deco-barok — hero 4:5 portrait, corner flourish 4 arah, 3 lapis 3D */}
        {/* float-soft di pembungkus, hero-zoom (slow 8s) di frame — beda elemen biar tidak tabrakan */}
        <div className="float-soft">
          <FramedImage
            src={hero}
            alt={`${nama} — foto sampul undangan`}
            variant="deco-barok"
            priority
            sizes="(max-width: 640px) 224px, 224px"
            className="hero-zoom h-72 w-56"
          />
        </div>

        {/* Kelopak bunga jatuh hero (max 16) */}
        <Kelopak jumlah={16} area="hero" />
      </div>

      {/* Overlay gradien bawah */}
      <div
        aria-hidden
        className="absolute inset-0 z-20 bg-gradient-to-b from-white/85 via-white/70 to-[var(--bg)]"
      />

      {/* Konten: nama, tanggal, tombol */}
      <div className="relative z-30 mx-auto flex min-h-[92svh] max-w-[28rem] flex-col items-center justify-center gap-5 px-5 py-10 text-center">
        <p className="text-eyebrow font-semibold text-accent-deep uppercase">
          Save the date
        </p>
        <h1
          id="cover-title"
          className="gold-shimmer font-display text-display-2xl font-semibold sm:text-display-2xl-up"
        >
          {pria} <span className="text-accent">&</span> {wanita}
        </h1>
        <p className="font-display text-display-sm text-ink-soft tabular-nums">
          {tanggal}
        </p>
        <div className="mt-2 flex flex-col items-center gap-3">
          {!sudahBuka && (
            <Tombol
              variant="primary"
              size="lg"
              loading={pending}
              onClick={bukaUndangan}
              className="w-full max-w-xs shadow-[var(--ring-gold)]"
              aria-label="Buka undangan dan putar musik"
            >
              {pending ? "Membuka…" : "Buka Undangan"}
            </Tombol>
          )}

          {!sudahBuka && state !== "error" && (
            <Chip tone="netral" className="pop-in">
              <Musik className="h-3.5 w-3.5" /> Ketuk di mana pun untuk memutar musik
            </Chip>
          )}

          {state === "error" && (
            <Chip tone="netral" className="pop-in">
              <Sunyi className="h-3.5 w-3.5" /> Musik tidak tersedia
            </Chip>
          )}

          <p className="sr-only" aria-live="polite">
            {sudahBuka
              ? senyap
                ? "Musik dimatikan"
                : "Musik diputar"
              : ""}
          </p>

          {sudahBuka && (
            <button
              type="button"
              onClick={toggleSenyap}
              aria-label={senyap ? "Nyalakan musik" : "Matikan musik"}
              aria-pressed={senyap}
              className="fab-in fixed right-4 bottom-4 z-50 grid h-12 w-12 place-items-center rounded-full bg-white/90 text-accent-deep shadow-[var(--shadow-fab)] backdrop-blur transition-[transform,background-color] duration-[220ms] hover:bg-white active:scale-95"
            >
              {senyap ? <Sunyi /> : <Musik />}
            </button>
          )}

          <span aria-hidden className="mt-4 text-accent-deep">
            <PanahBawah className="h-6 w-6 animate-bounce" />
          </span>
        </div>
      </div>
    </section>
  );
}