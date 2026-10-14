"use client";

import { Reveal, TombolAnchor, OrnateDivider, FramedCard } from "./ui";
import { Pin, Kalender } from "./icons";
import { tautanKalender } from "@/lib/utils";
import type { Acara } from "@/lib/utils";

function KartuLokasi({ acara }: { acara: Acara }) {
  const mapsUrl = acara.maps?.trim();
  const kalUrl = tautanKalender({ ...acara, nama: acara.nama }, "");

  return (
    <FramedCard className="flex w-full flex-col gap-4 p-5 shadow-[var(--shadow-md)]">
      {/* Header: jenis + chip jam */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-eyebrow font-semibold text-accent-deep uppercase">
          {acara.jenis === "akad" ? "Akad Nikah" : "Resepsi"}
        </span>
        <span className="shrink-0 rounded-pill bg-sage-100 px-3 py-1 text-micro font-semibold tracking-wide text-sage-700">
          {acara.jam}
        </span>
      </div>

      {/* Peta iframe — masuk dengan zoom-3d */}
      <div className="zoom-3d relative rounded-xl overflow-hidden border border-line shadow-sm aspect-[16/10] sm:aspect-[16/9]" style={{ animationDelay: "120ms" }}>
        {mapsUrl ? (
          <>
            <iframe
              title={`Peta ${acara.tempat}`}
              src={`${mapsUrl}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
            <div
              aria-hidden
              className="absolute inset-2 pointer-events-none rounded-lg border border-gold-hi/50"
            />
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-surface p-6 text-center">
            <Pin className="h-8 w-8 text-accent-line" />
            <p className="text-body text-ink-soft">Peta belum tersedia</p>
            <TombolAnchor
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(acara.alamat)}`}
              variant="ghost"
              size="sm"
              aria-label={`Buka ${acara.tempat} di Google Maps`}
            >
              Buka di Google Maps
            </TombolAnchor>
          </div>
        )}
      </div>

      {/* Alamat — slide-up stagger */}
      <div className="slide-up flex items-start gap-2" style={{ animationDelay: "220ms" }}>
        <Pin className="mt-0.5 h-4 w-4 shrink-0 text-accent-deep" />
        <div className="min-w-0">
          <p className="text-body font-semibold text-ink">{acara.tempat}</p>
          <p className="text-body-sm text-ink-soft">{acara.alamat}</p>
        </div>
      </div>

      {/* Aksi */}
      <div className="flex flex-col gap-2 sm:flex-row">
        {mapsUrl ? (
          <TombolAnchor
            href={mapsUrl}
            variant="ghost"
            size="md"
            className="flex-1"
            aria-label={`Petunjuk arah ke ${acara.tempat}`}
          >
            <Pin className="h-4 w-4" aria-hidden />
            Petunjuk Arah
          </TombolAnchor>
        ) : (
          <TombolAnchor
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(acara.alamat)}`}
            variant="ghost"
            size="md"
            className="flex-1"
            aria-label={`Petunjuk arah ke ${acara.tempat}`}
          >
            <Pin className="h-4 w-4" aria-hidden />
            Petunjuk Arah
          </TombolAnchor>
        )}
        <TombolAnchor
          href={kalUrl}
          variant="quiet"
          size="md"
          className="flex-1"
          aria-label={`Simpan ${acara.nama} ke kalender Google`}
        >
          <Kalender className="h-4 w-4" aria-hidden />
          Simpan Kalender
        </TombolAnchor>
      </div>

      {/* Catatan akses */}
      <ul className="space-y-1.5 text-caption text-ink-soft" role="list" aria-label="Catatan akses">
        <li>Parkir motor/mobil di sisi timur</li>
        <li>Tempat wudhu lantai 1 — mohon jaga kekhusyukan</li>
      </ul>
    </FramedCard>
  );
}

export function Lokasi({ acara }: { acara: Acara[] }) {
  if (!acara?.length) return null;

  return (
    <section id="lokasi" aria-labelledby="lokasi-judul" className="px-5 py-14">
      <Reveal className="mx-auto max-w-[30rem]">
        <div className="mb-8 text-center">
          <h2
            id="lokasi-judul"
            className="font-display text-display-lg text-ink"
          >
            Lokasi Akad & Resepsi
          </h2>
          <p className="mt-2 text-body-sm text-ink-soft">
            Kedua acara satu kawasan — parkir & wudhu tersedia.
          </p>
        </div>

        <div className="space-y-6">
          {acara.map((a, i) => (
            <Reveal key={a.nama} delay={i * 80}>
              <KartuLokasi acara={a} />
            </Reveal>
          ))}
        </div>

        {/* Divider + doa kecil */}
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <OrnateDivider size="md" />
          <p className="font-display italic text-body-sm tracking-wide text-accent-deep">
            Barakallahu lakuma
          </p>
        </div>
      </Reveal>
    </section>
  );
}