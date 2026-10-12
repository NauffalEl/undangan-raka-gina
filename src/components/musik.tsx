"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Musik, Sunyi, PanahBawah } from "./icons";
import { Tombol, Chip } from "./ui";

type MusikState = "idle" | "armed" | "playing" | "needs-tap" | "error";

const VOL_AWAL = 0.4;
const DUR_FADE = 800;

/**
 * Musik latar — GESTURE-ONLY. Nol atribut autoplay, nol trik muted-lalu-unmute
 * (spec-halaman §0 / PRD §0).
 *
 * Alur: coba play() saat mount → sukses = playing; NotAllowedError = armed
 * (listener document sekali: pointerdown/touchstart/keydown/scroll) → gesture
 * pertama = playing; gagal lagi = needs-tap. Tombol "Buka Undangan" +
 * scroll ke #salam = fallback yang selalu ada, terutama di in-app WA.
 */
function useMusik(src: string) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<MusikState>("idle");
  const [senyap, setSenyap] = useState(false);
  const [pending, setPending] = useState(false);
  const fadeRef = useRef<number | null>(null);

  // Fade volume 0 → 0.4 selama 800ms (kompositor-friendly; hindari hentakan).
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

  // 1. Satu elemen <audio> di-share, dibuat sekali di client.
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

  // 2. Coba play() saat mount — berhasil di sebagian desktop/Android lama.
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

  // 3. Armed → pasang listener document SEKALI; gesture pertama = play.
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

  // 4. Visibility — pause saat hidden, resume kalau playing & tidak senyap.
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

  // 5. Pemicu manual (tombol "Buka Undangan" / unmute FAB).
  const mulai = useCallback(async () => {
    const el = ref.current;
    if (!el) return false;
    setPending(true);
    try {
      // iOS Safari: pastikan metadata siap sebelum play().
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
      // Unmute = user gesture → boleh play.
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

export function MusikLatar({
  src = "/musik.mp3",
  targetScroll = "#salam",
}: {
  src?: string;
  targetScroll?: string;
}) {
  const { state, senyap, pending, mulai, toggleSenyap } = useMusik(src);
  const sudahBuka = state === "playing";

  const bukaUndangan = async () => {
    const ok = await mulai();
    if (ok) {
      document.querySelector(targetScroll)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Tombol Buka Undangan — primary lg (52px, pill), accent-lite + tinta = 8.76 AAA */}
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

      {/* Indikator "musik belum start" — hanya di armed/needs-tap/error */}
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

      {/* Screen reader: umumkan sekali saat status berubah besar */}
      <p className="sr-only" aria-live="polite">
        {sudahBuka
          ? senyap
            ? "Musik dimatikan"
            : "Musik diputar"
          : ""}
      </p>

      {/* FAB mute — HANYA setelah musik pernah main */}
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
    </>
  );
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
  return (
    <section
      id="cover"
      aria-labelledby="cover-title"
      className="relative isolate min-h-[92svh] overflow-hidden"
    >
      <Image
        src={hero}
        alt={`${nama} — foto sampul undangan`}
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-white/85 via-white/70 to-[var(--bg)]"
      />
      <div className="mx-auto flex min-h-[92svh] max-w-[28rem] flex-col items-center justify-center gap-5 px-5 py-10 text-center">
        <p className="text-eyebrow font-semibold text-accent-deep uppercase">
          Save the date
        </p>
        <h1
          id="cover-title"
          className="font-display text-display-2xl font-semibold sm:text-display-2xl-up"
        >
          {pria} <span className="text-accent">&amp;</span> {wanita}
        </h1>
        <p className="font-display text-display-sm text-ink-soft tabular-nums">
          {tanggal}
        </p>
        <div className="mt-2 flex flex-col items-center gap-3">
          <MusikLatar />
          <p className="max-w-xs text-caption text-ink-soft">
            Ketuk tombol di atas untuk membuka undangan &amp; memutar musik
          </p>
        </div>
        <span aria-hidden className="mt-4 text-accent-deep">
          <PanahBawah className="h-6 w-6 animate-bounce" />
        </span>
      </div>
    </section>
  );
}