"use client";

import { useState } from "react";
import { Reveal, Tombol, Field, inputClass } from "./ui";
import { Centang } from "./icons";
import { ENDPOINT_RSVP, cn } from "@/lib/utils";

type Status = "idle" | "loading" | "sukses" | "gagal";

export function Rsvp() {
  const [nama, setNama] = useState("");
  const [hadir, setHadir] = useState<boolean | null>(null);
  const [jumlah, setJumlah] = useState(1);
  const [ucapan, setUcapan] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const kirim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || hadir === null || status === "loading") return;
    setError("");
    setStatus("loading");
    try {
      if (ENDPOINT_RSVP) {
        // FIX: Content-Type text/plain;charset=utf-8 (text-plain trick, termasuk simple CORS
        // request → browser TIDAK kirim preflight OPTIONS). Body mengirim JSON string sebagai body.
        // Tambahkan field website="" (honeypot anti-spam di Apps Script backend).
        await fetch(ENDPOINT_RSVP, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            nama: nama.trim(),
            hadir,
            jumlah: hadir ? jumlah : 0,
            pesan: ucapan.trim(),
            website: "",
            userAgent: navigator.userAgent,
          }),
        });
      } else {
        // Mode demo — simpan ke localStorage (buku tamu)
        const pesan = ucapan.trim();
        const daftar = JSON.parse(localStorage.getItem("buku-tamu-ucapan") ?? "[]");
        daftar.unshift({
          id: String(Date.now()),
          nama: nama.trim(),
          hadir: hadir === true,
          jumlah: hadir === true ? jumlah : 0,
          pesan,
          waktu: new Date().toISOString(),
        });
        localStorage.setItem("buku-tamu-ucapan", JSON.stringify(daftar));
        window.dispatchEvent(new CustomEvent("buku-tamu-update"));
      }
      setStatus("sukses");
    } catch {
      setStatus("gagal");
      setError("Koneksi bermasalah. Coba lagi.");
    }
  };

  const reset = () => {
    setNama("");
    setHadir(null);
    setJumlah(1);
    setUcapan("");
    setStatus("idle");
  };

  const fieldClass = (err?: string) =>
    cn(inputClass, err && "border-danger bg-danger-soft");

  return (
    <section id="rsvp" aria-labelledby="rsvp-judul" className="px-5 py-14">
      <Reveal className="mx-auto max-w-[28rem]">
        <h2
          id="rsvp-judul"
          className="text-center font-display text-display-lg text-ink"
        >
          Konfirmasi Kehadiran
        </h2>

        {status === "sukses" ? (
          <div className="mt-8 flex flex-col items-center gap-4 rounded-lg bg-success-soft px-6 py-10 text-center" role="status">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-success/10 text-success">
              <Centang className="h-7 w-7" />
            </span>
            <p className="font-display text-display-sm text-ink">
              Terima kasih, RSVP tercatat
            </p>
            <p className="text-body-sm text-ink-soft">
              Sampai jumpa di hari bahagia kami.
            </p>
            <Tombol variant="ghost" size="sm" onClick={reset}>
              Kirim RSVP lain
            </Tombol>
          </div>
        ) : (
          <form
            onSubmit={kirim}
            aria-label="Konfirmasi kehadiran"
            aria-busy={status === "loading"}
            className="mt-8 space-y-5"
          >
            <Field label="Nama" htmlFor="rsvp-nama" error={error}>
              <input
                id="rsvp-nama"
                type="text"
                autoComplete="name"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                minLength={2}
                maxLength={80}
                required
                className={fieldClass(error)}
                placeholder="Nama lengkap"
                disabled={status === "loading"}
              />
            </Field>

            <div role="radiogroup" aria-label="Apakah Anda hadir?" className="space-y-2">
              <span className="block text-label font-semibold text-ink">
                Apakah Anda hadir?
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                                  { label: "Hadir", value: true },
                                  { label: "Tidak", value: false },
                                ].map((opt) => (
                                  <button
                                    key={opt.label}
                                    type="button"
                                    role="radio"
                                    aria-checked={hadir === opt.value}
                                    onClick={() => setHadir(opt.value)}
                                    disabled={status === "loading"}
                                    className={cn(
                                      "flex min-h-12 items-center justify-center rounded-md border text-label font-semibold transition",
                                      hadir === opt.value
                                        ? "border-sage-600 bg-sage-100 text-ink"
                                        : "border-line-strong bg-surface text-ink-soft hover:border-sage-300",
                                    )}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
              </div>
            </div>

            {hadir === true && (
              <div className="space-y-2 pop-in">
                <span className="block text-label font-semibold text-ink">
                  Jumlah tamu
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setJumlah((j) => Math.max(1, j - 1))}
                    aria-label="Kurangi jumlah tamu"
                    disabled={status === "loading"}
                    className="grid h-11 w-11 place-items-center rounded-full border border-line-strong bg-surface text-ink shadow-sm transition hover:bg-surface-warm"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-body font-semibold text-ink tabular-nums">
                    {jumlah}
                  </span>
                  <button
                    type="button"
                    onClick={() => setJumlah((j) => Math.min(5, j + 1))}
                    aria-label="Tambah jumlah tamu"
                    disabled={status === "loading"}
                    className="grid h-11 w-11 place-items-center rounded-full border border-line-strong bg-surface text-ink shadow-sm transition hover:bg-surface-warm"
                  >
                    +
                  </button>
                  <span className="text-caption text-ink-soft">maks 5 orang</span>
                </div>
              </div>
            )}

            <Field label="Ucapan & doa" htmlFor="rsvp-ucapan">
              <textarea
                id="rsvp-ucapan"
                value={ucapan}
                onChange={(e) => setUcapan(e.target.value)}
                maxLength={280}
                rows={4}
                className={cn(fieldClass(), "resize-none")}
                placeholder="Tulis ucapan atau doa…"
                disabled={status === "loading"}
              />
              <p className="mt-1 text-right text-caption text-ink-soft tabular-nums">
                {ucapan.length}/280
              </p>
            </Field>

            {error && (
              <p role="alert" className="text-caption text-danger">
                {error}
              </p>
            )}

            <div className="pt-2">
              <Tombol
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={status === "loading"}
                disabled={!nama.trim() || hadir === null}
              >
                {status === "loading" ? "Mengirim…" : "Kirim RSVP"}
              </Tombol>
              <p className="mt-3 text-center text-caption text-ink-soft">
                Data Anda aman dan hanya digunakan untuk keperluan acara.
              </p>
            </div>
          </form>
        )}
      </Reveal>
    </section>
  );
}