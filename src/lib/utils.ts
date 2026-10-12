export type Acara = {
  nama: string;
  jenis?: string;
  hari?: string;
  tanggal: string;
  jam: string;
  tempat: string;
  alamat: string;
  maps?: string;
  mulai?: string;
  selesai?: string;
};

export type Rekening = { bank: string; no: string; nama: string };

export type Ucapan = {
  id: string;
  nama: string;
  hadir: boolean;
  jumlah: number;
  pesan: string;
  waktu: string;
};

export type Undangan = {
  pasangan: { pria: string; wanita: string; tagline: string };
  tanggalAkad: string;
  acara: Acara[];
  orangTua: { pria: string; wanita: string };
  sosmed?: { pria?: string; wanita?: string };
  rekening: Rekening[];
  salam?: string;
  loveStory?: { tanggal: string; judul: string; deskripsi: string }[];
  penutup?: string;
  foto?: { pria: string; wanita: string; galeri: { src: string; alt: string }[] };
};

/** Gabung class tanpa dependency tambahan. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/** Tanggal panjang Indonesia, mis. "20 Desember 2026". */
export function tanggalPanjang(iso: string, locale = "id-ID"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(d);
}

/** "20 . 12 . 2026" untuk cover. */
export function tanggalPisah(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const f = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(d);
  const [dd, mm, yyyy] = f.split("/");
  return `${dd} . ${mm} . ${yyyy}`;
}

/** ISO offset -> format UTC-needed Google Calendar (20261220T010000Z). */
function keUtcGcal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "") + "Z";
}

/** Link "Simpan ke Kalender" — Google Calendar render (dijamin jalan di WA in-app). */
export function tautanKalender(a: Acara, pasangan = ""): string {
  const mulai = keUtcGcal(a.mulai ?? "");
  const selesai = keUtcGcal(a.selesai ?? a.mulai ?? "");
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: pasangan ? `${a.nama} — ${pasangan}` : a.nama,
    dates: `${mulai}/${selesai}`,
    details: [a.hari, a.tanggal, a.jam, a.tempat, a.alamat].filter(Boolean).join(" · "),
    location: `${a.tempat}, ${a.alamat}`,
    ctz: "Asia/Jakarta",
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

/** Waktu relatif Bahasa Indonesia untuk buku tamu. */
export function waktuRelatif(iso: string, now = Date.now()): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const detik = Math.max(0, Math.round((now - t) / 1000));
  if (detik < 60) return "baru saja";
  const menit = Math.round(detik / 60);
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.round(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.round(jam / 24);
  if (hari < 30) return `${hari} hari lalu`;
  return tanggalPanjang(iso);
}

/** Salin teks: navigator.clipboard -> fallback execCommand. */
export async function salinTeks(teks: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(teks);
      return true;
    }
  } catch {
    /* lanjut ke fallback */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = teks;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** localStorage aman (private mode / storage diblokir tidak boleh crash). */
export const simpanLokal = {
  ambil<T>(kunci: string, bawaan: T): T {
    try {
      const v = window.localStorage.getItem(kunci);
      return v ? (JSON.parse(v) as T) : bawaan;
    } catch {
      return bawaan;
    }
  },
  simpan(kunci: string, nilai: unknown): void {
    try {
      window.localStorage.setItem(kunci, JSON.stringify(nilai));
    } catch {
      /* abaikan */
    }
  },
};

/** Teks Env publik untuk endpoint (diumumkan saat build Next.js). */
export const ENDPOINT_RSVP = process.env.NEXT_PUBLIC_RSVP_URL ?? "";
export const ENDPOINT_UCAPAN = process.env.NEXT_PUBLIC_UCAPAN_URL ?? "";

/** Nama section + id untuk navigasi/skip-link. */
export type miniaturFoto = { src: string; alt: string };
