import Image from "next/image";
import { Reveal, Chip, Kelopak } from "./ui";
import { Instagram, Ornamen3D } from "./icons";
import type { Undangan } from "@/lib/utils";

function KartuMempelai({
  nama,
  foto,
  orangTua,
  sosmed,
  label,
}: {
  nama: string;
  foto: string;
  orangTua: string;
  sosmed?: string;
  label: string;
}) {
  const inisial = nama
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <article className="tilt-in flex flex-col items-center gap-4 text-center">
      {/* Foto arch: float-soft + frame 3D ringan 2 lapis */}
      <div className="hero-stage relative" style={{ perspective: "900px" }}>
        {/* Lapis belakang (bronze) */}
        <div
          aria-hidden
          className="absolute inset-0 translate-x-1 translate-y-1 rounded-[var(--radius-arch)] bg-[var(--color-bronze)] opacity-50"
          style={{ transform: "translateZ(-12px) translate(6px, 6px)" }}
        />
        <div
          className="float-soft relative h-52 w-40 overflow-hidden border border-accent-line bg-surface-warm shadow-md sm:h-60 sm:w-48"
          style={{ borderRadius: "var(--radius-arch)", transform: "translateZ(0)" }}
        >
          <Image
            src={foto}
            alt={nama}
            fill
            sizes="(max-width:640px) 160px, 192px"
            loading="lazy"
            className="object-cover"
          />
          <span
            aria-hidden
            className="absolute inset-0 -z-10 grid place-items-center font-display text-4xl text-ink-muted"
          >
            {inisial}
          </span>
        </div>
      </div>
      <Reveal delay={80}>
        <div>
          <Chip tone="gold" className="mb-2">
            {label}
          </Chip>
          <h3 className="font-display text-display-xl text-ink">{nama}</h3>
          <p className="mt-1 text-body-sm text-ink-soft">{orangTua}</p>
          {sosmed && (
            <a
              href={sosmed}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${nama}`}
              className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-pill border border-accent-line px-4 text-label font-semibold text-accent-deep transition hover:bg-accent-soft"
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </a>
          )}
        </div>
      </Reveal>
    </article>
  );
}

/** Section mempelai — 2 kartu profil vertikal + kelopak 4. */
export function Mempelai({ data }: { data: Undangan }) {
  const { pria, wanita } = data.pasangan;
  const fotoPria = data.foto?.pria ?? "/foto/raka.svg";
  const fotoWanita = data.foto?.wanita ?? "/foto/gina.svg";

  return (
    <section id="mempelai" aria-labelledby="mempelai-judul" className="relative overflow-hidden px-5 py-14">
      <Kelopak jumlah={4} area="mempelai" />
      <Reveal className="relative mx-auto flex max-w-[28rem] flex-col items-center">
        <div className="mb-8 flex justify-center" aria-hidden>
          <Ornamen3D />
        </div>
        <h2 id="mempelai-judul" className="sr-only">
          Mempelai
        </h2>
        <div className="flex w-full flex-col items-stretch gap-6">
          <KartuMempelai
            nama={pria}
            foto={fotoPria}
            orangTua={data.orangTua.pria}
            sosmed={data.sosmed?.pria}
            label="Mempelai Pria"
          />
          <div aria-hidden className="flex justify-center font-display text-display-md text-accent">
            &
          </div>
          <KartuMempelai
            nama={wanita}
            foto={fotoWanita}
            orangTua={data.orangTua.wanita}
            sosmed={data.sosmed?.wanita}
            label="Mempelai Wanita"
          />
        </div>
      </Reveal>
    </section>
  );
}