"use client";

import { Reveal, Tombol } from "./ui";
import { Ornamen, WhatsApp } from "./icons";

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
    <section id="penutup" aria-labelledby="penutup-judul" className="px-5 py-14">
      <Reveal className="mx-auto max-w-[28rem] text-center">
        <div className="mb-8 flex justify-center" aria-hidden>
          <Ornamen />
        </div>

        {kutipan && (
          <blockquote className="mx-auto max-w-prose font-display text-display-sm italic text-ink-soft">
            {kutipan}
          </blockquote>
        )}

        <h2 id="penutup-judul" className="mt-8 font-display text-display-md text-ink">
          {namaPasangan}
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