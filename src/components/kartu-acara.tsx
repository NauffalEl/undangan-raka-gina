"use client";

import { Pin, Kalender, Ornamen } from "./icons";
import { Reveal, Tombol, TombolAnchor } from "./ui";
import { tautanKalender } from "@/lib/utils";
import type { Acara } from "@/lib/utils";

function KartuAcara({
  acara,
  pasangan,
}: {
  acara: Acara;
  pasangan: string;
}) {
  const mapsUrl = acara.maps?.trim();
  const kalUrl = tautanKalender({ ...acara, nama: acara.nama }, pasangan);

  return (
    <article className="flex w-full flex-col gap-3 rounded-lg border border-line bg-surface p-5 shadow-[var(--inset-hairline),var(--shadow-md)]">
      <span className="text-eyebrow font-semibold text-accent-deep uppercase">
        {acara.jenis ?? acara.nama}
      </span>
      <h3 className="font-display text-display-md text-ink">{acara.nama}</h3>
      <p className="font-display text-body-lg text-ink">
        {acara.hari ? `${acara.hari}, ` : ""}
        {acara.tanggal}
      </p>
      <p className="font-body text-body tabular-nums text-ink-soft">
        {acara.jam}
      </p>
      <div className="mt-1 flex items-start gap-2">
        <Pin className="mt-0.5 h-4 w-4 shrink-0 text-accent-deep" />
        <div className="min-w-0">
          <p className="text-body font-semibold text-ink">{acara.tempat}</p>
          <p className="text-body-sm text-ink-soft">{acara.alamat}</p>
        </div>
      </div>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        {mapsUrl ? (
          <TombolAnchor
            href={mapsUrl}
            variant="ghost"
            size="md"
            className="flex-1"
            aria-label={`Lihat lokasi ${acara.nama} di Google Maps`}
          >
            <Pin className="h-4 w-4" aria-hidden />
            Lihat Lokasi
          </TombolAnchor>
        ) : (
          <Tombol variant="ghost" size="md" className="flex-1" disabled title="Peta belum tersedia">
            Lihat Lokasi
          </Tombol>
        )}
        <TombolAnchor
          href={kalUrl}
          variant="quiet"
          size="md"
          className="flex-1"
          aria-label={`Simpan ${acara.nama} ke kalender Google`}
        >
          <Kalender className="h-4 w-4" aria-hidden />
          Simpan ke Kalender
        </TombolAnchor>
      </div>
    </article>
  );
}

/** Rangkaian Acara — kartu Akad + Resepsi. */
export function RangkaianAcara({
  acara,
  pasangan,
}: {
  acara: Acara[];
  pasangan: string;
}) {
  if (!acara?.length) return null;
  return (
    <section id="acara" aria-labelledby="acara-judul" className="px-5 py-14">
      <Reveal className="mx-auto max-w-[48rem]">
        <div className="mb-8 flex justify-center" aria-hidden>
          <Ornamen />
        </div>
        <h2
          id="acara-judul"
          className="text-center font-display text-display-lg text-ink"
        >
          Rangkaian Acara
        </h2>
        <div className="mt-8 grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
          {acara.map((a) => (
            <Reveal key={a.nama} as="div">
              <KartuAcara acara={a} pasangan={pasangan} />
            </Reveal>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
