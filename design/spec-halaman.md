# Spec Halaman — Undangan Raka & Gina

Route: `/` · one-page · sumber: PRD v1.1 (§0–§11) · design-system v1.0
Stack: Next.js 16 static export · Tailwind 4 · data `src/data/undangan.json` · musik `public/musik.mp3` · foto `public/foto/`

---

## Halaman: Undangan Raka & Gina (route: /)

Tujuan: tamu buka link WA di HP, dapat info lengkap + RSVP + ucapan dalam satu scroll tanpa zoom/pinch.

### Struktur (atas ke bawah)

1. Cover / Splash — hero + "Buka Undangan" (pemantik musik §0)
2. Salam Pembuka
3. Mempelai (Raka & Gina)
4. Countdown (WIB)
5. Rangkaian Acara (Akad + Resepsi)
6. Galeri (+ lightbox)
7. Love Story — opsional (render hanya jika `undangan.json.loveStory` ada)
8. RSVP (form)
9. Amplop Digital (rekening/e-wallet)
10. Buku Tamu (daftar ucapan)
11. Penutup + Share WA

Elemen global: `<audio>` tersembunyi (single), FAB mute (kanan-bawah, muncul setelah musik hidup), toast (sukses/gagal), `skip-link` ke konten.

### Layout mobile (base 320–479, prioritas utama)

Satu kolom, `max-w-[28rem]` center, gutter 20, section padding vertikal 56, gap antar kartu 16. Semua teks 15–17px, tombol 44px, foto lazy kecuali hero. Scroll vertikal murni — tanpa horizontal.

### Layout desktop (≥768)

Kontainer 672 (md) → 768 (lg) center. Hanya dua penyesuaian: Rangkaian Acara 2 kolom, Galeri 3 kolom. Sisanya tetap 1 kolom — one-page tidak melebar penuh. Section padding 80. Tidak ada sidebar.

### Komponen yang dipakai

Tombol (primary/secondary/ghost), KartuAcara, Countdown, Field, Chip, SalinField, Ornamen, Reveal, Lightbox, FAB mute. Token warna/tipografi/radius/shadow: `design-system.md`.

### Catatan interaksi

Reveal `IntersectionObserver` threshold 0.15, sekali (unobserve). Fallback `prefers-reduced-motion` & JS mati: konten visible tanpa opacity 0. Semua animasi hanya `transform`+`opacity`. Parallax hero max 12% dan mati di reduce-motion.

---

## SOLUSI MUSIK AUTO-PLAY — PRD §0 (WAJIB)

> Browser Chrome/Safari/Firefox + in-app WA **memblokir** audio bersuara tanpa user gesture. Jangan violate policy (no hack autoplay, no muted-autoplay trick yang lalu unmute diam-diam).

### Prinsip

Musik **hanya** mulai lewat gesture yang dihitung browser sebagai user activation: `click`, `pointerdown`, `touchstart`, `keydown`, `scroll`. Tidak ada `autoplay` attribute. Satu elemen `<audio src="/musik.mp3" loop preload="auto">` di-share.

### State & alur

```
[Load] ──try audio.play()──→ [Playing] ──visibility hidden──→ pause
  │  \                              ↑  (visible + main && !muted → play lagi)
  │   \catch NotAllowedError
  │    └──→ [Armed] pasang listener SEKALI di document:
  │         pointerdown | touchstart | keydown | scroll  (once:true, passive)
  │         + tombol "Buka Undangan" (pemantik utama, paling andal di in-app WA)
  │         gesture pertama di mana pun → play() → [Playing]
  │         kalau play() gagal lagi → [NeedsTap]
  └──→ [NeedsTap] = indikator kecil masih tampil, tunggu tap berikutnya
```

- Coba `play()` saat `DOMContentLoaded` (berhasil di sebagian desktop/Android lama).
- Kalau gagal → `Armed`. Listener di `document`, `once: true` per event type — sentuhan pertama di **mana pun** (scroll/ketuk) langsung start.
- Tombol **"Buka Undangan"** = fallback yang selalu ada. Kliknya juga `play()` + scroll ke `#salam` (`scrollIntoView smooth`). Di in-app WA yang paling strict, tombol ini yang menyelamatkan.
- Setelah `Playing`: FAB mute muncul (kanan-bawah, 48×48, `shadow-fab`, `aria-pressed`). Volume fade 0→0.4 selama 800ms (hindari hentakan).
- `visibilitychange`: `document.hidden → pause`, kembali visible `→ play()` kalau `main && !muted`. Hemat baterai.
- Gagal permanen (file 404/network): tampilkan state error kecil, jangan spam retry.

### Spesifikasi tombol "Buka Undangan"

- Varian `primary lg` (min-h 52, pill, `bg --accent-lite` + teks `--ink` — 8.76 AAA, lihat design-system §1.6), spinner saat `play()` pending.
- Label default: `Buka Undangan`. Saat pending: `Membuka…` + spinner. Setelah sukses: tombol hilang (diganti anchor "↓ Lihat undangan").
- Hint kecil di bawah 12px `--ink-soft`: `Ketuk untuk membuka undangan & memutar musik` — affordance fallback.
- `focus-visible` ring `--focus` 2px + offset. Tap target 52px.
- Scroll lock: sebelum dibuka, `body overflow hidden` + hero `min-h-[92svh]` (pakai `svh`/`dvh` bukan `vh`). Setelah klik, unlock + scroll.

### Fallback "musik mulai saat sentuhan pertama"

- Tidak ada popup "izinkan audio". Cukup indikator kecil (lihat di bawah) + listener document.
- Listener dipasang **sekali** di level document, bukan per-section — supaya sentuhan di mana pun (termasuk scroll) kehitung gesture.
- `once:true` → otomatis lepas setelah fire, tidak bocor.
- Scroll sebagai trigger: `scroll` event (passive) sudah cukup untuk sebagian browser; tapi jangan andalkan hanya scroll — `touchstart`/`pointerdown` tetap primary.
- iOS Safari perlu `audio.load()` sebelum `play()` kalau `preload` belum selesai — handle di hook `useMusik`.

### Tombol mute melayang (FAB)

- Muncul **hanya** setelah `main === true` (musik pernah berhasil play). Sebelum itu: tidak dirender (hindari tombol mati).
- Posisi: `fixed right-4 bottom-4 z-50` (≥480: right-6 bottom-6), 48×48, bulat, bg `white/90 backdrop-blur`, ikon 20px `Musik`/`Sunyi`, `shadow-fab`.
- `aria-label` toggle: `Matikan musik` ↔ `Nyalakan musik`, `aria-pressed` ikut `muted`.
- Tap target 48px, fokus ring `--focus`. Tidak overlap toast (toast bottom 88px).
- Animasi masuk: `scale .8 → 1`, 220ms `ease-soft-out`, tanpa layout shift.

### Indikator "musik gagal start"

- Tampil **hanya** di state `Armed`/`NeedsTap` (play belum sukses).
- Bentuk: chip kecil di bawah hint Cover — ikon `Musik` 14px + teks `Ketuk di mana pun untuk memutar musik` (`text-micro` 12px, `--ink-soft`, bg `--surface-warm`, pill, padding 6 12, `role="status"`).
- Hilang otomatis 600ms fade-out setelah `Playing`.
- Kalau error file (404): ganti teks jadi `Musik tidak tersedia` + ikon `Sunyi`, tone netral — jangan tampilkan error merah besar.
- Tidak pakai `autoplay` attribute, tidak pakai `muted autoplay` lalu unmute (tetap diblokir & terasa menipu).

### Aksesibilitas musik

- `prefers-reduced-motion` tidak mematikan musik — tapi jangan auto-fade keras; user tetap kontrol via FAB.
- Screen reader: `aria-live="polite"` umumkan `Musik diputar` / `Musik dimatikan` sekali via sr-only, bukan tiap detik.
- Keyboard: `Space/Enter` di tombol Buka & FAB harus sama dengan klik. FAB `tabIndex 0` setelah muncul.

### Implementasi rujukan

`src/components/musik.tsx` sudah ada hook `useMusik` + `MusikLatar` + `Cover`. Perlu tambah: (1) attempt `play()` on mount, (2) listener document sekali, (3) volume fade, (4) indikator chip, (5) warna tombol fix §1.6. `public/musik.mp3` target ≤2 MB (96–128 kbps mono).

---

## 1) Cover / Splash

Tujuan: kesan pertama elegan + pemantik musik §0.

**Struktur:** foto hero full-bleed → gradient `white/85 → --bg` → badge `Save the date` (eyebrow) → nama `Raka & Gina` (display-2xl 48) → tanggal `20 . 12 . 2026` (Cormorant) → tombol Buka Undangan lg + hint + indikator musik → panah ↓ (decorative).

**Layout mobile:** hero `min-h-[92svh]` (`svh`/`dvh`), konten center vertikal, padding 20, max-w 28rem. Foto `priority`, `sizes 100vw`, `object-cover`. Gradient di atas foto jamin kontras teks.

**Layout desktop:** sama (center), hero tetap 92svh — tidak jadi 2 kolom.

**State:** loading hero (skeleton krem), `Armed` (chip tampil), `Playing` (chip hilang, FAB muncul).

**Edge case:** hero gagal load → bg `--surface-warm` + ornamen, nama tetap terbaca. `musik.mp3` 404 → chip jadi netral, jangan blokir tombol. JS mati: tombol jadi anchor `#salam`, cover tetap tampil (no opacity 0).

**Aksesibilitas:** `alt="Raka & Gina"` deskriptif, panah `aria-hidden`, heading `h1` tunggal halaman.

## 2) Salam Pembuka

Tujuan: salam + kalimat pembuka (dari `undangan.json.salam` atau fallback).

**Struktur:** ornamen 112px → eyebrow `Assalamu'alaikum` → paragraf pembuka 17/1.65 center, max 36em.

**Mobile:** center, padding section 56, teks tidak melebihi 36em (readability).

**State:** tanpa state khusus. Kalau `salam` kosong → fallback generik singkat (desain kosong tidak blank).

**Aksesibilitas:** salam sebagai `h2`, paragraf `lang="id"`.

## 3) Mempelai

Tujuan: kenalkan Raka & Gina personal.

**Struktur:** 2 kartu profil vertikal (foto arch + nama display-xl + "Putra/Putri dari…" 14px + IG opsional chip).

**Mobile:** 1 kolom, kartu gap 24, foto arch `aspect 3/4`, radius `--radius-arch`, hairline emas, `loading lazy` (di bawah fold).

**Desktop:** tetap 1 kolom center (narrow) — jangan 2 kolom berdampingan sempit; biar foto besar.

**State:** foto gagal → placeholder inisial di bg `--surface-warm`. IG kosong → tombol tidak render (jangan disabled).

**Aksesibilitas:** foto `alt="Raka Pratama"` / `"Gina Amelia"`, nama `h3`, IG `aria-label="Instagram Raka"`, tap 44px.

## 4) Countdown

Tujuan: hitung mundur WIB akurat; setelah lewat jadi "Acara telah dilaksanakan".

**Struktur:** judul `Menuju Hari Bahagia` (display-lg) → 4 kotak hari:jam:menit:detik → label eyebrow → footnote `WIB (UTC+7)`.

**Mobile:** grid 4 kolom sama, gap 8, kotak bg surface + hairline emas + radius md, padding 12 8, angka tabular 34.

**Desktop:** gap 12, lebih lega.

**State:** `running` (angka hidup per detik, `tabular-nums` hindari jiggle), `selesai` (ganti jadi card sage-100 + teks "Acara telah dilaksanakan — Terima kasih" + ornamen), `target invalid` → sembunyikan section (jangan NaN).

**Edge:** zona WIB konstan tanpa DST (`2026-12-20T08:00:00+07:00`), `setInterval 1000` + koreksi drift; pause saat `hidden`. Hydration: render skeleton dulu, hitung di client (hindari mismatch SSR).

**Aksesibilitas:** angka `aria-live off` per detik; satu ringkasan `aria-live polite` update per menit. Label "hari/jam" asosiatif.

## 5) Rangkaian Acara

Tujuan: detail Akad & Resepsi siap navigasi.

**Struktur:** ornamen → judul → 2× KartuAcara (eyebrow jenis, tanggal Cormorant, jam tabular, tempat, alamat, tombol Lihat Lokasi + Simpan ke Kalender).

**Mobile:** kartu tumpuk, gap 16, padding 20, tombol ghost 44px full-width di kartu.

**Desktop (≥768):** 2 kolom grid, kartu sama tinggi (`align stretch`).

**State:** `maps` kosong → tombol disabled + tooltip. Kalender: generate `.ics` atau Google Calendar link `https://calendar.google.com/calendar/render?action=TEMPLATE&...` (diuji di WA in-app). Sukses copy/link: toast `Dibuka di Maps` / `Ditambahkan ke kalender`.

**Edge:** alamat panjang wrap, jangan truncate. Jam "11.00 - 14.00" tabular.

**Aksesibilitas:** kartu `article`, tombol `aria-label="Lihat lokasi Akad di Google Maps"`, ikon `aria-hidden`.

## 6) Galeri

Tujuan: foto prewedding/kebersamaan, ringan.

**Struktur:** judul + grid thumb (6–10 foto) + lightbox fullscreen.

**Mobile:** grid 2 kolom, gap 8, thumb rasio 4:5, radius md, `loading lazy`, `sizes 50vw`.

**Desktop (≥1024):** 3 kolom, `sizes 33vw`.

**State:** lightbox: overlay tinta 92%, foto `object-contain` max-h 82svh, close 48 kanan-atas, prev/next 48, counter `3 / 8`, swipe horizontal. Focus trap, `Esc` close, kembalikan fokus ke thumb asal. Thumb gagal → bg warm + ikon.

**Edge:** 0 foto → empty state ornamen + "Galeri menyusul" (jangan blank). Banyak foto (>10): paginasi tidak perlu — lazy saja, tapi batasi initial 8.

**Aksesibilitas:** thumb `button` dengan `aria-label="Foto 3 dari 8"`, lightbox `role="dialog" aria-modal`.

## 7) Love Story — opsional

Tujuan: narasi singkat, tampil hanya jika ada data.

**Struktur:** timeline vertikal: garis sage-300 di tengah/kiri → 3 node (bulat emas 12) → kartu per milestone (tanggal eyebrow + judul + deskripsi 15/1.65).

**Mobile:** garis di kiri (16px dari tepi), node + kartu di kanan, gap 20. Lebih hemat lebar daripada center.

**Desktop:** garis center, kartu selang-seling kiri/kanan (alternating) jika ≥3 item.

**State:** `undangan.json.loveStory` kosong/undefined → section tidak dirender sama sekali (nomor section lain bergeser, tidak ada placeholder). 1 item saja → tetap tampil tanpa garis panjang.

**Aksesibilitas:** `ol` semantik, tiap milestone `li`, garis `aria-hidden`.

## 8) RSVP

Tujuan: konfirmasi hadir tercatat (MVP Google Sheets via Apps Script, tanpa backend).

**Struktur:** judul + form: Nama (text) → Hadir/Tidak (segmented 2 opsi) → Jumlah tamu (stepper, muncul hanya jika Hadir) → Ucapan (textarea 4 baris) → tombol Kirim RSVP lg + note privasi 13px.

**Mobile:** form `max-w 28rem` center, field gap 12, input 48px, label di atas (bukan placeholder-only), helper kecil.

**State:** normal → fokus (ring gold) → error (border danger, bg danger-soft, pesan di bawah field, `aria-invalid`) → loading (tombol spinner, field disabled, `aria-busy`) → sukses (card success-soft + centang + "Terima kasih, RSVP tercatat" + reset form) → gagal jaringan (inline error + tombol Coba lagi, jangan hilangkan input).

**Edge:** nama 2–80 char, ucapan maks 280, jumlah 1–5 (cap). Submit cegah double (disable). Offline: pesan "Koneksi bermasalah". Data ke Sheets: `fetch POST` no-cors fallback siapkan.

**Aksesibilitas:** `form` dengan `aria-label="Konfirmasi kehadiran"`, error `aria-describedby`, segmented `radiogroup`, stepper tombol 44px, `autocomplete name`.

## 9) Amplop Digital

Tujuan: kirim hadiah tanpa amplop fisik.

**Struktur:** judul + deskripsi 15px → 2 kartu rekening (BCA/DANA dari `undangan.json.rekening`) → tiap kartu: bank chip sage + nomor tabular tebal + nama pemilik + tombol Salin 44px → QRIS opsional (gambar + caption).

**Mobile:** kartu tumpuk, gap 16, nomor 17 tabular, tombol salin kanan.

**Desktop:** sama (center narrow).

**State:** SalinField: idle (Salin) → sukses (Tersalin ✓, success, balik 2 dtk) → gagal (Gagal, salin manual, danger). Clipboard: `navigator.clipboard.writeText` → fallback `execCommand`. QRIS: jika tidak ada file `public/qris.webp` → kartu QRIS tidak render.

**Edge:** nomor panjang wrap tabular, tanpa spasi berlebih. Rekening kosong → empty note "Hubungi mempelai".

**Aksesibilitas:** nomor `aria-label="Nomor rekening BCA 1234567890"`, tombol `aria-live polite` konfirmasi.

## 10) Buku Tamu

Tujuan: daftar ucapan live setelah submit.

**Struktur:** judul + daftar kartu ucapan (nama + hadir chip + pesan + waktu relatif) → empty state.

**Mobile:** list vertikal, gap 12, kartu bg surface + hairline, padding 16, pesan 15/1.65.

**State:** `loading` (3 skeleton shimmer) → `empty` (ornamen + "Belum ada ucapan — jadi yang pertama") → `ada data` (sort terbaru di atas) → `baru submit` (optimistic card di atas + highlight sage-100 2 dtk).

**Edge:** pesan panjang clamp tidak perlu — biarkan wrap. Sanitasi: escape HTML, jangan `innerHTML` mentah. Pagination: tampil 12 terbaru + "Muat lagi" jika >12.

**Aksesibilitas:** list `ul`, tiap ucapan `article`, waktu `time datetime`, hadir chip `aria-label`.

## 11) Penutup

Tujuan: terima kasih + share.

**Struktur:** ornamen → kutipan/terima kasih 22 italic Cormorant → nama `Raka & Gina` display-md → tanggal 14 tabular → tombol Share ke WhatsApp (secondary, icon WA) → footnote kecil "Sampai jumpa di hari bahagia".

**Mobile:** center, padding 56, tombol Share full-width max 28rem, 52px.

**State:** share sukses (WA `https://wa.me/?text=...` encode, preview OG sudah disiapkan) → toast tidak perlu. Kalau `navigator.share` ada: pakai Web Share API, fallback ke WA link.

**Aksesibilitas:** tombol Share `aria-label="Bagikan undangan ke WhatsApp"`, footnote bukan heading.

---

## Catatan lintas-section

- **Data:** semua teks/nomor/maps dari `src/data/undangan.json` — desain tidak hardcode. Foto di `public/foto/` (`hero.svg` → `hero.webp` nanti).
- **OG/SEO:** `og:title` "Raka & Gina — 20.12.2026", `og:image` hero 1200×630, `theme-color` krem-50. Favicon & title tab "Raka & Gina".
- **Performa (LCP <2,5 dtk):** hero `priority`, lain `lazy`; musik `preload auto` tapi ≤2 MB; animasi hanya compositor; `next.config` static export + `images unoptimized`.
- **Error global:** JS gagal total → konten tetap tampil (progressive enhancement, no opacity 0 permanen), form fallback `mailto`/WA. Network font gagal → fallback Georgia/system-ui.
- **QA wajib:** 360×640, 390×844, 430×932, landscape 844×390, in-app WA Android & iOS, Safari iOS, Chrome Android. Uji musik di masing-masing (WA in-app paling ketat).
