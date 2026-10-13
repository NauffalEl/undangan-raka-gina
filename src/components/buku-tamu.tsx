"use client";

import { useEffect, useState } from "react";
import { Reveal, Chip, Tombol } from "./ui";
import { Ornamen3D, Hati, Orang } from "./icons";
import { simpanLokal, waktuRelatif, ENDPOINT_UCAPAN } from "@/lib/utils";
import type { Ucapan } from "@/lib/utils";

const KUNCI_UCAPAN = "buku-tamu-ucapan";

function muatDemo(): Ucapan[] {
  return simpanLokal.ambil<Ucapan[]>(KUNCI_UCAPAN, []);
}

async function muatBackend(): Promise<Ucapan[]> {
  if (!ENDPOINT_UCAPAN) return [];
  try {
    const res = await fetch(ENDPOINT_UCAPAN, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    if (!json.ok || !Array.isArray(json.data)) return [];
    return json.data.map((d: Record<string, unknown>) => ({
      id: String(d.timestamp),
      nama: String(d.nama || ""),
      hadir: Boolean(d.hadir),
      jumlah: Number(d.jumlah || 0),
      pesan: String(d.ucapan || ""),
      waktu: String(d.timestamp || new Date().toISOString()),
    }));
  } catch {
    return [];
  }
}

export function BukuTamu() {
  const [ucapan, setUcapan] = useState<Ucapan[]>([]);
  const [muat, setMuat] = useState(true);

  useEffect(() => {
    requestAnimationFrame(async () => {
      const demo = muatDemo();
      const backend = await muatBackend();
      const gabung = [...backend, ...demo.filter((d) => !backend.some((b) => b.id === d.id))];
      setUcapan(gabung);
      setMuat(false);
    });
    const onStorage = () => setUcapan(muatDemo());
    const onLocal = () => setUcapan(muatDemo());
    window.addEventListener("storage", onStorage);
    window.addEventListener("buku-tamu-update", onLocal);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("buku-tamu-update", onLocal);
    };
  }, []);

  if (muat) {
    return (
      <section id="buku-tamu" aria-labelledby="buku-judul" className="px-5 py-14">
        <Reveal className="mx-auto max-w-[28rem]">
          <div className="mb-8 flex justify-center" aria-hidden>
            <Ornamen3D />
          </div>
          <h2 id="buku-judul" className="text-center font-display text-display-lg text-ink">
            Buku Tamu
          </h2>
          <div className="mt-8 space-y-3" aria-hidden>
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-line bg-surface p-5 skeleton" />
            ))}
          </div>
        </Reveal>
      </section>
    );
  }

  const Kartucapan = ({ item, delay }: { item: Ucapan; delay: number }) => (
    <article
      className="stagger-pop relative rounded-lg border border-line bg-surface p-5 shadow-[var(--inset-hairline),var(--shadow-sm)]"
      style={{ animationDelay: `${delay}ms` } as React.CSSProperties}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden className="grid h-10 w-10 place-items-center rounded-full bg-accent-soft text-accent-deep">
          <Orang className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className="font-semibold text-ink truncate">{item.nama}</p>
            <Chip tone={item.hadir ? "sage" : "netral"} className="shrink-0">
              {item.hadir ? "Hadir" : "Tidak hadir"}
            </Chip>
          </div>
          <time
            dateTime={item.waktu}
            className="block mt-1 text-caption text-ink-soft"
          >
            {waktuRelatif(item.waktu)}
          </time>
          <p className="mt-3 text-body text-ink-soft whitespace-pre-wrap">
            {item.pesan}
          </p>
          {item.hadir && item.jumlah > 0 && (
            <p className="mt-1 text-body-sm text-ink-soft">
              + {item.jumlah} tamu
            </p>
          )}
        </div>
      </div>
    </article>
  );

  return (
    <section id="buku-tamu" aria-labelledby="buku-judul" className="px-5 py-14">
      <Reveal className="mx-auto max-w-[28rem]">
        <div className="mb-8 flex justify-center" aria-hidden>
          <Ornamen3D />
        </div>
        <h2
          id="buku-judul"
          className="text-center font-display text-display-lg text-ink"
        >
          Buku Tamu
        </h2>

        {ucapan.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <Ornamen3D />
            <p className="font-display text-display-sm italic text-ink-soft">
              Belum ada ucapan
            </p>
            <p className="text-body-sm text-ink-soft">
              Jadilah yang pertama mengirim doa & ucapan
            </p>
            <Hati className="h-6 w-6 text-accent-deep" />
          </div>
        ) : (
          <ul className="mt-8 space-y-3" role="list" aria-label="Daftar ucapan tamu">
            {ucapan.slice(0, 12).map((u, i) => (
              <li key={u.id}>
                <Kartucapan item={u} delay={i * 70} />
              </li>
            ))}
            {ucapan.length > 12 && (
              <li>
                <Tombol variant="quiet" size="sm" className="w-full">
                  Muat {ucapan.length - 12} ucapan lagi…
                </Tombol>
              </li>
            )}
          </ul>
        )}
      </Reveal>
    </section>
  );
}