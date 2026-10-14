"use client";

import { Reveal, Tombol, Kelopak } from "./ui";
import { Ornamen3D, WhatsApp } from "./icons";

export function Penutup({ kutipan, namaPasangan, tanggal }: { kutipan?: string; namaPasangan: string; tanggal?: string }) {
  const share = () => {
    const text = `Undangan Pernikahan ${namaPasangan} — ${tanggal || ""}\n\n${window.location.origin}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    if (navigator.share) {
      navigator.share({ title: `Undangan ${namaPasangan}`, text, url: window.location.href }).catch(() => {
        window.open(waUrl, "_blank", "noopener,noreferrer");
      });
    } else {
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section id="penutup" aria-labelledby="penutup-judul" className="relative overflow-hidden px-5 py-14">
      {/* Kelopak bunga jatuh penutup (max 12) */}
      <Kelopak jumlah={12} area="penutup" />
      <Reveal className="relative mx-auto max-w-[28rem] text-center">
        <div className="mb-8 flex justify-center" aria-hidden>
          <Ornamen3D />
        </div>

        {kutipan && (
          <blockquote className="blur-in mx-auto max-w-prose font-display text-display-sm italic text-ink-soft" style={{ animationDelay: "150ms" }}>
            {kutipan}
          </blockquote>
        )}

        <h2 id="penutup-judul" className="track-in mt-8 font-display text-display-md text-ink" style={{ animationDelay: "500ms" }}>
          <span className="gold-shimmer">{namaPasangan}</span>
        </h2>
        {tanggal && (
          <p className="mt-1 font-display text-body-lg text-ink-soft tabular-nums">
            {tanggal}
          </p>
        )}

        <Tombol
          variant="secondary"
          size="lg"
          onClick={share}
          className="mt-8 w-full max-w-[28rem]"
          aria-label="Bagikan undangan ke WhatsApp"
        >
          <WhatsApp className="h-5 w-5" />
          Bagikan ke WhatsApp
        </Tombol>

        <p className="mt-6 text-caption text-ink-soft">
          Sampai jumpa di hari bahagia kami.
        </p>
      </Reveal>
    </section>
  );
}