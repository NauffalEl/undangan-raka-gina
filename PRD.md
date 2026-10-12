# PRD — Webapp Undangan Pernikahan Digital

**Pasangan:** Raka & Gina (nama contoh)
**Versi:** 1.1 — 12 Oktober 2026
**Status:** ACC (Gate 1 lolos) — menunggu konten & foto asli
**Revisi v1.1:** request mempelai — musik auto-play saat website dibuka

---

## 0. Revisi v1.1 (WAJIB dibaca desainer)

Mempelai minta **musik auto-play saat website dibuka**. Realitas teknis:
semua browser modern (Chrome/Safari/Firefox, termasuk in-app browser WhatsApp)
MEMBLOKIR audio autoplay bersuara tanpa user gesture. Jangan usulkan cara yang
melanggar kebijakan autoplay browser.

Solusi yang dipakai:

1. Coba `audio.play()` saat halaman load (berhasil di sebagian browser).
2. Kalau gagal / diblokir → pasang listener `pointerdown`, `touchstart`,
   `keydown`, dan `scroll` SEKALI di level `document`. Musik mulai otomatis
   pada interaksi pertama pengguna di mana pun di halaman.
3. Tombol **"Buka Undangan"** tetap pemicu utama + fallback kalau semua gesture
   gagal.
4. Tombol mute/unmute melayang di pojok kanan bawah, muncul setelah musik hidup.
5. Indikator kecil kalau musik gagal start (ikon musik + teks "Ketuk untuk
   memutar" sebagai affordance fallback).
6. Pause otomatis saat tab tidak terlihat (`visibilitychange`).

---

## 1. Ringkasan

Undangan pernikahan digital satu halaman (one-page website) yang dibuka dari link —
pengganti/pelengkap undangan fisik. Berisi cover interaktif, profil & foto pasangan,
hitung mundur, detail acara, galeri, RSVP, amplop digital, dan buku tamu.
Dibuka mayoritas tamu dari HP via WhatsApp.

## 2. Tujuan

- Tamu dapat info acara yang lengkap & rapi dari satu link.
- Konfirmasi kehadiran (RSVP) tercatat otomatis, tanpa chat satu-satu.
- Terlihat personal dan elegan — bukan template pasaran.
- Hemat biaya cetak & distribusi undangan fisik.

## 3. Pengguna

| Pengguna | Kebutuhan |
|---|---|
| Tamu undangan | Buka link dari HP, baca info, RSVP, kirim ucapan |
| Mempelai (admin) | Update teks/foto tanpa coding, pantau RSVP |

Perangkat utama: HP Android/iPhone → **mobile-first**.

## 4. Struktur Halaman (Section)

1. **Cover / Splash** — foto hero, nama pasangan, tanggal; tombol "Buka Undangan".
   Musik mulai diputar sesuai §0 (auto + fallback gesture).
2. **Salam Pembuka** — Assalamu'alaikum / salam + kalimat pembuka singkat.
3. **Mempelai** — foto masing-masing, nama lengkap (+ gelar), "putra/putri dari
   Bapak X & Ibu Y". Tombol Instagram opsional.
4. **Countdown** — hitung mundur ke hari-H (hari : jam : menit : detik, zona WIB).
   Setelah lewat, otomatis berubah jadi "Acara telah dilaksanakan".
5. **Rangkaian Acara** — kartu Akad Nikah & Resepsi: hari/tanggal, jam, nama &
   alamat gedung, tombol "Simpan ke Kalender" dan "Lihat Lokasi" (Google Maps).
6. **Galeri** — grid foto prewedding/kebersamaan; klik → lightbox fullscreen.
   Lazy-load agar ringan.
7. **Love Story** *(opsional)* — timeline singkat: pertama kenal → lamaran → menikah.
8. **RSVP** — form: nama, hadir/tidak, jumlah tamu, ucapan. Data tersimpan otomatis.
9. **Amplop Digital** — nomor rekening / e-wallet (DANA, OVO, GoPay) + tombol
   "Salin nomor"; QRIS opsional.
10. **Buku Tamu** — daftar ucapan dari tamu, tampil setelah submit.
11. **Penutup** — terima kasih, nama pasangan, tombol share ke WhatsApp.

## 5. Desain & Interaksi

- **Gaya:** elegan-romantis. Palet: krem + emas + sage.
- **Font:** serif display untuk nama pasangan (Cormorant Garamond) + sans-serif
  untuk isi.
- **Animasi:** fade/slide saat scroll (IntersectionObserver), parallax ringan di
  hero, transisi halus antar section. Tidak berlebihan — tetap ringan di HP.
- **Ornamen:** motif bunga/batik halus, divider dekoratif antar section.
- **Musik latar:** 1 lagu (mp3), tombol mute/unmute melayang di pojok (lihat §0).
- **Mobile-first:** teks terbaca tanpa zoom, tombol besar, gambar teroptimasi.

## 6. Foto Pasangan

- **Kebutuhan:** 1 foto hero, 2 foto profil, 6–10 foto galeri, 1–3 love story.
- **Format:** JPG/WebP terkompresi — galeri maks ~200 KB/foto, hero ~400 KB.
  Lazy-load untuk semua foto di bawah fold.
- **Penempatan:** `public/foto/` dengan nama rapi (`hero.webp`, `raka.webp`,
  `gina.webp`, `galeri-1.webp`, dst).
- Placeholder SVG sudah tersedia sampai foto asli dikirim.

## 7. Fitur Teknis

- Countdown akurat zona WIB (WIB = UTC+7, konstan — tanpa DST).
- RSVP: MVP Google Sheets via Apps Script (tanpa backend).
- **Open Graph meta tags:** judul + foto hero untuk preview card WhatsApp.
- Target performa: tampil < 3 detik di HP (LCP < 2,5 dtk).
- Favicon + judul tab: "Raka & Gina".

## 8. Konten yang Harus Disiapkan (Checklist)

- [ ] Nama lengkap (+ gelar) kedua mempelai.
- [ ] Nama orang tua kedua belah pihak.
- [ ] Foto: hero (1), profil (2), galeri (6–10).
- [ ] Tanggal, jam, alamat akad & resepsi (+ link Google Maps).
- [ ] Nomor rekening / e-wallet + nama pemilik.
- [ ] Kalimat pembuka & penutup.
- [ ] Lagu latar (mp3 — perhatikan hak cipta).
- [ ] Love story singkat (kalau section ini dipakai).

## 9. Tech Stack

- **Next.js 16 static export** — pola sama seperti proyek Kopi Kita.
- **Data konten di satu file JSON** (`src/data/undangan.json`).
- **Tailwind CSS 4** + custom design tokens di `globals.css`.
- **Hosting gratis:** Cloudflare Pages / Vercel.

## 10. Acceptance Criteria

- Dibuka dari WhatsApp di HP: cover tampil < 3 detik.
- "Buka Undangan" membuka isi halaman + musik berjalan.
- Musik juga mulai otomatis pada sentuhan pertama (§0).
- Countdown benar sampai detik, sesuai WIB.
- RSVP terkirim & tercatat; ucapan muncul di buku tamu.
- Tombol salin rekening dan tombol Google Maps berfungsi.
- Link dishare ke WhatsApp: preview menampilkan foto + nama pasangan.

## 11. Out of Scope (v1)

- QR code check-in tamu di lokasi acara.
- Multi-bahasa.
- Ganti tema oleh tamu.
- Admin dashboard (cukup edit file JSON).

## 12. Fase Pengerjaan

1. Konten & foto terkumpul → 2. Desain + build → 3. Review & revisi →
4. Deploy + uji share WhatsApp → 5. Link dikirim ke tamu (H-30 s/d H-7).