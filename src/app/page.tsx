import { Cover } from "@/components/musik";
import { Salam } from "@/components/salam";
import { Mempelai } from "@/components/mempelai";
import { Countdown } from "@/components/countdown";
import { RangkaianAcara } from "@/components/kartu-acara";
import { Galeri } from "@/components/galeri";
import { LoveStory } from "@/components/love-story";
import { Rsvp } from "@/components/rsvp";
import { AmplopDigital } from "@/components/amplop";
import { BukuTamu } from "@/components/buku-tamu";
import { Lokasi } from "@/components/lokasi";
import { Penutup } from "@/components/penutup";
import data from "@/data/undangan.json";
import type { Undangan } from "@/lib/utils";
import { tanggalPisah, tanggalPanjang } from "@/lib/utils";

const undangan = data as Undangan;
const kutipan = undangan.penutup?.split(/\n{2,}/)[0]?.trim();
const tanggalCover = tanggalPisah(undangan.tanggalAkad);

export default function Home() {
  const foto = undangan.foto ?? {
    pria: "/foto/pria.jpg",
    wanita: "/foto/wanita.jpg",
    galeri: [1, 2, 3, 4, 5, 6].map((n) => ({
      src: `/foto/galeri-${n}.jpg`,
      alt: `Foto kenangan ${n}`,
    })),
  } as { pria: string; wanita: string; galeri: { src: string; alt: string }[] };

  return (
    <>

      <a
        href="#salam"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[80] focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-label focus:font-semibold focus:text-ink"
      >
        Lompat ke konten
      </a>

      <main className="mx-auto w-full max-w-[48rem]">
        <Cover
          nama={undangan.pasangan.tagline}
          tanggal={tanggalCover}
          hero="/foto/hero.jpg"
        />

        <Salam teks={undangan.salam} />

        <Mempelai data={undangan} />

        <Countdown target={undangan.tanggalAkad} />

        <RangkaianAcara acara={undangan.acara} pasangan={undangan.pasangan.tagline} />

        <Galeri foto={foto.galeri} />

        <LoveStory item={undangan.loveStory} />

        <Rsvp />

        <AmplopDigital rekening={undangan.rekening} />

        <BukuTamu />

        <Lokasi acara={undangan.acara} />

        <Penutup
          namaPasangan={undangan.pasangan.tagline}
          tanggal={tanggalPanjang(undangan.tanggalAkad)}
          kutipan={kutipan}
        />
      </main>
    </>
  );
}