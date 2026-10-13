"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

type Sisa = { d: number; h: number; m: number; s: number };

function nol(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0");
}

function hitung(targetMs: number, now: number): Sisa {
  const diff = Math.max(0, targetMs - now);
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff % 86_400_000) / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1000),
  };
}

/** Kotak angka 3D: muka translateZ(10px) + alas bronze translateZ(-6px). */
function Kotak({
  nilai,
  label,
  berubah,
}: {
  nilai: string;
  label: string;
  berubah: boolean;
}) {
  return (
    <div
      className="relative flex flex-col items-center gap-1 rounded-md border border-accent-line bg-surface px-2 py-3 shadow-xs sm:px-4"
      style={{ perspective: "800px" }}
    >
      {/* Alas bronze di belakang */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-md bg-[var(--color-bronze)] opacity-50"
        style={{ transform: "translateZ(-6px) scale(1.02)" }}
      />
      {/* Muka (angka) */}
      <span
        className={cn(
          "relative font-display text-countdown font-semibold text-ink tabular-nums",
          berubah && "flip-num"
        )}
        style={{ transform: "translateZ(10px)" }}
      >
        {nilai}
      </span>
      <span
        className="relative text-eyebrow font-semibold text-ink-soft uppercase"
        style={{ transform: "translateZ(10px)" }}
      >
        {label}
      </span>
    </div>
  );
}

export function Countdown({
  target,
  judul = "Menuju Hari Bahagia",
  zona = "WIB (UTC+7)",
}: {
  target: string;
  judul?: string;
  zona?: string;
}) {
  const targetMs = new Date(target).getTime();
  const valid = !Number.isNaN(targetMs);

  const [sisa, setSisa] = useState<Sisa>({ d: 0, h: 0, m: 0, s: 0 });
  const [ucapan, setUcapan] = useState("");
  const menitLalu = useRef<number>(-1);
  const refSisa = useRef<Sisa>({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!valid) return;

    let timer: ReturnType<typeof setInterval> | undefined;

    const tick = () => {
      const next = hitung(targetMs, Date.now());
      refSisa.current = next;
      setSisa(next);
      if (next.m !== menitLalu.current) {
        menitLalu.current = next.m;
        setUcapan(
          `${next.d} hari ${next.h} jam ${next.m} menit menuju hari bahagia`,
        );
      }
      if (next.d === 0 && next.h === 0 && next.m === 0 && next.s === 0) {
        if (timer) clearInterval(timer);
        timer = undefined;
      }
    };

    const mulai = () => {
      if (timer) clearInterval(timer);
      tick();
      timer = setInterval(tick, 1000);
    };

    const onVis = () => {
      if (document.hidden) {
        if (timer) {
          clearInterval(timer);
          timer = undefined;
        }
      } else {
        mulai();
      }
    };

    if (!document.hidden) mulai();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [targetMs, valid]);

  // Kotak mana yang berubah nilai pada tick terakhir (mulai flip)
  const [flip, setFlip] = useState<{ d: boolean; h: boolean; m: boolean; s: boolean }>({
    d: false,
    h: false,
    m: false,
    s: false,
  });
  useEffect(() => {
    const p = refSisa.current;
    setFlip({
      d: p.d !== sisa.d,
      h: p.h !== sisa.h,
      m: p.m !== sisa.m,
      s: p.s !== sisa.s,
    });
  }, [sisa]);

  const siap = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!valid) return null;

  const selesai = siap && sisa.d === 0 && sisa.h === 0 && sisa.m === 0 && sisa.s === 0;

  if (selesai) {
    return (
      <section
        id="countdown"
        aria-labelledby="countdown-judul"
        className="px-5 py-14 text-center"
      >
        <h2 id="countdown-judul" className="font-display text-display-lg text-ink">
          {judul}
        </h2>
        <div className="mx-auto mt-8 flex max-w-sm flex-col items-center gap-3 rounded-lg bg-sage-100 px-6 py-8">
          <span aria-hidden className="font-display text-3xl text-sage-700">
            ❦
          </span>
          <p className="font-display text-display-sm text-ink">
            Acara telah dilaksanakan
          </p>
          <p className="text-body-sm text-sage-700">
            Terima kasih atas doa &amp; restunya
          </p>
          <p className="text-caption text-sage-700">{zona}</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="countdown"
      aria-labelledby="countdown-judul"
      className="px-5 py-14 text-center"
    >
      <h2 id="countdown-judul" className="font-display text-display-lg text-ink">
        {judul}
      </h2>

      {siap ? (
        <>
          <div
            className="mx-auto mt-8 grid max-w-md grid-cols-4 gap-2 sm:gap-3"
            aria-live="off"
          >
            <Kotak nilai={nol(sisa.d)} label="Hari" berubah={flip.d} />
            <Kotak nilai={nol(sisa.h)} label="Jam" berubah={flip.h} />
            <Kotak nilai={nol(sisa.m)} label="Menit" berubah={flip.m} />
            <Kotak nilai={nol(sisa.s)} label="Detik" berubah={flip.s} />
          </div>
          <p className="sr-only" aria-live="polite">
            {ucapan}
          </p>
          <p className="mt-4 text-caption text-ink-soft">{zona}</p>
        </>
      ) : (
        <div
          className="mx-auto mt-8 grid max-w-md grid-cols-4 gap-2 sm:gap-3"
          aria-hidden
        >
          {["Hari", "Jam", "Menit", "Detik"].map((l) => (
            <div
              key={l}
              className="flex flex-col items-center gap-1 rounded-md border border-accent-line bg-surface px-2 py-3 sm:px-4"
            >
              <span className="skeleton h-9 w-10 rounded-sm" />
              <span className="text-eyebrow font-semibold text-ink-soft uppercase">
                {l}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}