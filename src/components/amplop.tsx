"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal, Chip, Kelopak } from "./ui";
import { Ornamen3D, Salin, Centang, Info } from "./icons";
import { salinTeks, cn } from "@/lib/utils";
import type { Rekening } from "@/lib/utils";

type SalinState = "idle" | "tersalin" | "gagal";

function SalinField({
  label,
  nilai,
  ariaLabel,
}: {
  label: string;
  nilai: string;
  ariaLabel: string;
}) {
  const [state, setState] = useState<SalinState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const salin = async () => {
    const ok = await salinTeks(nilai);
    if (ok) {
      setState("tersalin");
      timer.current = setTimeout(() => setState("idle"), 2000);
    } else {
      setState("gagal");
      timer.current = setTimeout(() => setState("idle"), 3000);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <p aria-label={ariaLabel} className="min-w-0 flex-1 truncate text-body font-semibold text-ink tabular-nums">
        {nilai}
      </p>
      <button
        type="button"
        onClick={salin}
        aria-live="polite"
        aria-label={`Salin ${label}`}
        className={cn(
          "inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-md px-3 text-label font-semibold transition",
          state === "tersalin"
            ? "bg-success-soft text-success"
            : state === "gagal"
              ? "bg-danger-soft text-danger"
              : "bg-accent-soft text-accent-deep hover:bg-accent-line",
        )}
      >
        {state === "tersalin" ? (
          <>
            <Centang className="h-4 w-4" /> Tersalin
          </>
        ) : state === "gagal" ? (
          "Gagal, salin manual"
        ) : (
          <>
            <Salin className="h-4 w-4" /> Salin
          </>
        )}
      </button>
    </div>
  );
}

export function AmplopDigital({ rekening }: { rekening: Rekening[] }) {
  return (
    <section id="amplop" aria-labelledby="amplop-judul" className="px-5 py-14">
      <Reveal className="mx-auto max-w-[28rem]">
        <div className="mb-8 flex justify-center" aria-hidden>
          <Ornamen3D />
        </div>
        <h2
          id="amplop-judul"
          className="text-center font-display text-display-lg text-ink"
        >
          Amplop Digital
        </h2>
        <p className="mx-auto mt-3 max-w-prose text-center text-body text-ink-soft">
          Tanpa amplop fisik, kirim doa dan hadiah lewat rekening berikut.
        </p>

        {rekening.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-lg bg-surface-warm px-6 py-8 text-center">
            <Info className="h-6 w-6 text-ink-soft" />
            <p className="text-body-sm text-ink-soft">
              Hubungi mempelai untuk detail amplop digital.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {rekening.map((r, i) => (
              <div key={`${r.bank}-${r.no}`}>
                <Reveal delay={i * 70}>
                  <article className="rounded-lg border border-line bg-surface p-5 shadow-[var(--inset-hairline),var(--shadow-sm)]">
                    <div className="mb-3 flex items-center gap-2">
                      <Chip tone="sage">{r.bank}</Chip>
                      <p className="text-caption text-ink-soft">a.n. {r.nama}</p>
                    </div>
                    <SalinField
                      label={`Nomor rekening ${r.bank}`}
                      nilai={r.no}
                      ariaLabel={`Nomor rekening ${r.bank} ${r.no}`}
                    />
                  </article>
                </Reveal>
                {i < rekening.length - 1 && (
                  <div className="my-4 flex justify-center" aria-hidden>
                    <Ornamen3D />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}