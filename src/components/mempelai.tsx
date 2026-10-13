import Image from "next/image";
import { Reveal, Chip, Kelopak, FramedImage, TapeStrip, CornerFlourish } from "./ui";
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
      {/* V3: arch/topeng — 4:5 border-radius elliptik (Safari-safe) + bronze di belakang
          + ornate ring + corner flourish. Foto di-clip (object-fit:cover), bukan stretch. */}
      <div className="hero-stage relative" style={{ perspective: "900px" }}>
        <FramedImage
          src={foto}
          alt={nama}
          variant="arch"
          ratio="arch"
          sizes="(max-width:640px) 176px, 208px"
          className="float-soft h-56 w-44 sm:h-64 sm:w-48"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 grid place-items-center font-display text-4xl text-ink-muted"
        >
          {inisial}
        </span>
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
          <div aria-hidden className="flex flex-col items-center justify-center gap-2 text-accent">
            <span className="relative block">
              <TapeStrip pos="left" className="-top-2 -left-5" />
              <TapeStrip pos="right" className="-top-2 -right-5" />
              <span className="relative block">
                <CornerFlourish pos="tl" size={18} className="text-[var(--color-gold-hi)]" />
                <CornerFlourish pos="br" size={18} className="text-[var(--color-gold-hi)]" />
                <span className="font-display text-display-md">&</span>
              </span>
            </span>
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