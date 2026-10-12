# Design System — Undangan Raka & Gina

Versi 1.0 · Sinta (UI/UX) · sumber: PRD v1.1 (§4, §5, §0)
Stack: Next.js 16 static export · Tailwind CSS 4 · token di `src/app/globals.css`

Gaya: **elegan-romantis**, palet krem + emas + sage. Mobile-first (mayoritas tamu
buka dari HP via WhatsApp, viewport 360–430 px). Semua warna di bawah **sudah
diuji kontras** (WCAG 2.2), rasio tertulis di komentar.

---

## 1. Palet warna

### 1.1 Netral / krem (base)

| Token CSS | Nama | HEX | Pakai untuk |
|---|---|---|---|
| `--bg` | krem-50 | `#FBF7F0` | latar halaman utama |
| `--surface` | putih | `#FFFFFF` | kartu, sheet, input |
| `--surface-warm` | krem-100 | `#F6F0E6` | kartu alternatif, zebra |
| `--line` | krem-300 | `#E7DCC9` | hairline, border 1px |
| `--line-strong` | krem-400 | `#D8C7AB` | border input fokus-idle |

### 1.2 Tinta (teks)

| Token CSS | Nama | HEX | Kontras di `--bg` | Pakai |
|---|---|---|---|---|
| `--ink` | tinta-900 | `#2E1F14` | **14.87 AAA** | judul, teks utama |
| `--ink-soft` | tinta-600 | `#6B5A4C` | **6.16 AA** | body sekunder, caption |
| `--ink-muted` | tinta-400 | `#8A7867` | 3.96 (AA-large) | **hanya** teks ≥24px / disabled |

> `--ink-muted` **jangan** dipakai untuk body text (gagal AA di ukuran kecil).
> Ganti ke `--ink-soft` kalau ragu.

### 1.3 Emas (accent)

| Token CSS | Nama | HEX | Catatan |
|---|---|---|---|
| `--accent-lite` | emas-400 | `#D9BE78` | **bg tombol primer** — tinta `--ink` di atasnya = **8.76 AAA** |
| `--accent` | emas-500 | `#C29B44` | ornamen, ikon besar, border dekoratif. **Bukan** bg teks kecil |
| `--accent-600` | emas-600 | `#A8812F` | ikon, gradient stop |
| `--accent-deep` | emas-800 | `#7E611F` | **teks emas & bg tombol gelap** — di krem **5.44 AA**, putih di atasnya **5.81 AA** |
| `--accent-soft` | emas-50 | `#FBF6E9` | latar blok emas (amplop, sorotan) |
| `--accent-line` | emas-300 | `#DFC383` | hairline emas, ring halus |

Ramp penuh: `#FBF6E9 · #F5EACF · #EBD9A8 · #DFC383 · #D9BE78 · #C29B44 · #A8812F · #7E611F · #5F4915`

> ⚠️ **Jangan** `putih` di atas `--accent` (2.60 — **GAGAL**). Baca §1.6 soal bug scaffold.

### 1.4 Sage (aksen kedua)

| Token CSS | Nama | HEX | Kontras di `--bg` |
|---|---|---|---|
| `--sage-50` | sage-50 | `#F4F7F4` | latar blok lembut |
| `--sage-100` | sage-100 | `#E8EFE9` | bg chip/badge, kartu sukses |
| `--sage-300` | sage-300 | `#B3C7B8` | garis, ornamen daun |
| `--sage-500` | sage-500 | `#7D9483` | ikon, aksen dekoratif |
| `--sage-600` | sage-600 | `#6E8575` | border kuat, bg sekunder besar |
| `--sage-700` | sage-700 | `#4F6355` | **teks & bg tombol sekunder** — di krem **6.05 AA**, putih di atasnya **6.46 AA** |

Ramp penuh: `#F4F7F4 · #E8EFE9 · #D3E0D6 · #B3C7B8 · #8FA898 · #7D9483 · #6E8575 · #4F6355 · #364539`

### 1.5 Semantik (state)

| Token CSS | HEX | Kontras di `--bg` | Pakai |
|---|---|---|---|
| `--danger` | `#9B2C2C` | **7.05 AAA** | pesan error form |
| `--danger-soft` | `#FBEDED` | — | latar field error |
| `--success` | `#3F6B4A` | **5.76 AA** | sukses RSVP, toast |
| `--success-soft` | `#E9F3EC` | — | latar sukses |
| `--warning` | `#9A6B12` | 4.83 AA | indikator musik gagal |
| `--focus` | `#7E611F` | — | ring fokus 2px + offset 2px |

### 1.6 ⚠️ Temuan a11y di scaffold (buat Bima/Raka)

`src/components/musik.tsx` baris 81 pakai `bg-[var(--accent)]` + `text-white`
→ **2.60, GAGAL AA**. `--accent-deep` (#7E611F) saat ini juga tidak aman dipakai
`text-white` di ukuran kecil? Aman: 5.81 ✓.

**Perbaikan (pilih satu, tidak mengubah layout):**

```diff
- className="... bg-[var(--accent)] ... text-white ..."
+ className="... bg-[var(--accent-lite)] text-[var(--ink)] ..."
```

Atau kalau tetap mau tombol gelap: `bg-[var(--accent-deep)] text-white` (5.81 AA).
**Rekomendasi: opsi pertama** — emas terang + tinta, lebih elegan dan 8.76 AAA.

---

## 2. Tipografi

**Display:** Cormorant Garamond — 300/400/500/600, + italic 400/600. Nama pasangan, angka tanggal, judul section.
**Body:** Plus Jakarta Sans — 400/500/600/700. Semua teks isi, tombol, label, form.
(`next/font/google`, `display: swap`, subset `latin`.)

### 2.1 Skala mobile (base 16px, root tidak di-zoom)

| Token | Font | Size / Line-height | Weight | Pakai |
|---|---|---|---|---|
| `text-display-2xl` | Cormorant | 48 / 1.05, ls −0.02em | 600 | nama pasangan di Cover |
| `text-display-xl` | Cormorant | 40 / 1.10 | 600 | nama mempelai (Mempelai §3) |
| `text-display-lg` | Cormorant | 32 / 1.15 | 600 | judul section "Rangkaian Acara" |
| `text-display-md` | Cormorant | 28 / 1.20 | 500 | sub-judul, nama pasangan di Penutup |
| `text-display-sm` | Cormorant italic | 22 / 1.30 | 400 | kutipan, salam, love story |
| `text-eyebrow` | Jakarta | 11 / 1.2, ls 0.18em, UPPERCASE | 600 | label kecil ("SAVE THE DATE") |
| `text-body-lg` | Jakarta | 17 / 1.65 | 400 | paragraf pembuka, ucapan |
| `text-body` | Jakarta | 15 / 1.65 | 400 | **default isi** |
| `text-body-sm` | Jakarta | 14 / 1.55 | 400 | detail kartu acara, daftar tamu |
| `text-label` | Jakarta | 14 / 1.2 | 600 | label form, tombol |
| `text-caption` | Jakarta | 13 / 1.45 | 400 | catatan, meta |
| `text-micro` | Jakarta | 12 / 1.4 | 500 | chip, badge, indikator |
| `text-countdown` | Cormorant | 34 / 1.0, `font-variant-numeric: tabular-nums` | 600 | angka countdown |

Naik ≥`sm`(480): display-2xl → 56, display-lg → 36, body → 16.
Angka countdown & nomor rekening **wajib** `tabular-nums` (tidak goyang saat detik berubah).

Aturan: **body minimum 15px** (skill standar: padat tapi terbaca tanpa zoom, target tap ≥44px).

---

## 3. Spacing

Basis 4px. Skala: `4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96`

| Token | Nilai | Pakai |
|---|---|---|
| `--space-inline` | 8 | gap ikon–teks |
| `--space-field` | 12 | gap antar field form |
| `--space-card` | 20 | padding dalam kartu (mobile) |
| `--space-gutter` | 20 | padding kiri/kanan halaman (mobile) |
| `--space-block` | 32 | jarak antar sub-blok dalam section |
| `--space-section` | 56 | **padding vertikal section (mobile)** |
| `--space-section-lg` | 80 | ≥`md` |

Lebar kontainer (mobile-first, satu kolom):

| Breakpoint | Kontainer | Catatan |
|---|---|---|
| base (≤479) | `max-w-[28rem]` = 448 | dominan; gutter 20px |
| `sm` ≥480 | `max-w-[34rem]` = 544 | |
| `md` ≥768 | `max-w-[42rem]` = 672 | kartu acara jadi 2 kolom |
| `lg` ≥1024 | `max-w-[48rem]` = 768 | galeri 3 kolom, konten tetap center |

---

## 4. Radius

| Token | Nilai | Pakai |
|---|---|---|
| `--radius-xs` | 4 | chip kecil, badge |
| `--radius-sm` | 8 | input, tombol kecil |
| `--radius-md` | 12 | kartu, field |
| `--radius-lg` | 16 | kartu acara, sheet |
| `--radius-xl` | 24 | kartu besar, panel RSVP |
| `--radius-2xl` | 32 | foto profil, kartu hero |
| `--radius-pill` | 999 | tombol pill, chip, FAB |
| `--radius-arch` | `50% 50% 12px 12px / 28% 28% 12px 12px` | **lengkung arch** foto mempelai |

---

## 5. Shadow

Nada hangat (tinta `#2E1F14`, bukan hitam netral), opacity rendah supaya tidak kotor di krem.

| Token | Nilai | Pakai |
|---|---|---|
| `--shadow-xs` | `0 1px 2px rgba(46,31,20,.06)` | chip, hairline kartu |
| `--shadow-sm` | `0 2px 6px rgba(46,31,20,.08)` | kartu kecil, input |
| `--shadow-md` | `0 6px 16px rgba(46,31,20,.10)` | kartu acara |
| `--shadow-lg` | `0 12px 28px rgba(46,31,20,.14)` | lightbox, sheet, toast |
| `--shadow-fab` | `0 4px 12px rgba(46,31,20,.18)` | tombol mute melayang |
| `--ring-gold` | `0 0 0 6px rgba(217,190,120,.28)` | halo fokus / halo tombol Buka Undangan |
| `--inset-hairline` | `inset 0 0 0 1px rgba(194,155,68,.35)` | bingkai emas tipis di kartu |

Kombinasikan `--inset-hairline` + `--shadow-sm` untuk kartu di atas `--bg`.

---

## 6. Komponen

Nama file target: `src/components/ui/*.tsx`. Semua **client component** hanya kalau butuh state.

### 6.1 Tombol — `<Tombol variant size />`

| Variant | Style | Kontras |
|---|---|---|
| `primary` | bg `--accent-lite`, teks `--ink`, 600 | **8.76 AAA** |
| `secondary` | bg `--sage-700`, teks putih | **6.46 AA** |
| `ghost` | transparan, border 1px `--accent-line`, teks `--accent-deep` | **5.44 AA** |
| `quiet` | transparan, teks `--ink-soft`, underline saat hover | 6.16 AA |
| `danger` | bg `--danger`, teks putih | AA |

- Ukuran: `md` min-h **44px** (target tap), padding-x 20–24; `lg` min-h 52 (tombol "Buka Undangan", "Kirim RSVP"); `sm` min-h 36 (chip aksi).
- Radius: `--radius-pill` untuk CTA, `--radius-md` untuk aksi dalam form.
- Radius 44px tap target: **wajib** semua elemen interaktif, termasuk ikon salin & FAB (48px).
- Hover: `primary` → `--accent` (emas-500, tinta masih 5.4 AA); `secondary` → `--sage-600`; `ghost` → bg `--accent-soft`.
- Active: `transform: scale(.98)` + transisi `--dur-fast`.
- Disabled: opacity `.5`, `cursor: not-allowed`, tanpa shadow. `aria-disabled`.
- Loading: spinner 16px + teks tetap (jangan ganti lebar tombol → pakai `min-w`).
- Focus: `outline: 2px solid var(--focus); outline-offset: 2px` (`:focus-visible` saja).

### 6.2 Kartu Acara — `<KartuAcara acara />`

Struktur: eyebrow jenis acara → hari+tanggal (Cormorant md) → jam (tabular) → nama tempat → alamat → 2 tombol (ghost "Lihat Lokasi" + quiet "Simpan ke Kalender").
- bg `--surface`, radius `--radius-lg`, padding 20, `--inset-hairline` + `--shadow-md`.
- Ikon kecil 16px (`Pin`, `Kalender`) warna `--accent-deep`.
- Mobile: 1 kolom, kartu bertumpuk, gap 16. `md`: 2 kolom sejajar.
- Tinggi tombol di kartu tetap 44px meski terlihat kecil.

### 6.3 Field RSVP — `<Field label hint error />`

- Input/select: min-h **48px**, bg `--surface`, border 1px `--line-strong`, radius `--radius-md`, padding-x 14, teks `text-body`.
- Fokus: border `--accent-600` + `--ring-gold` halus.
- Label selalu di atas (jangan placeholder-only — a11y & autofill). `font-size: 14-16px` supaya iOS tidak auto-zoom.
- Error: border `--danger`, bg `--danger-soft`, ikon 16px + teks `--danger` (`text-caption`), `aria-invalid` + `aria-describedby`.
- Sukses: border `--success`, ikon centang.
- Number stepper (jumlah tamu): dua tombol bulat 44px − / +, nilai tabular di tengah.
- Segmented hadir/tidak: dua pilihan radio `role=radiogroup`, tiap opsi 48px, terpilih = bg `--sage-100` + border `--sage-600` + tinta `--ink`.

### 6.4 Chip / Badge — `<Chip tone />`

tone: `gold` (bg `--accent-soft`, teks `--accent-deep`), `sage` (bg `--sage-100`, teks `--sage-700`), `netral` (bg `--surface-warm`, teks `--ink-soft`).
Radius pill, tinggi 28, padding-x 12, `text-micro`. Non-interaktif kecuali diberi `role=button` (maka min-h 36).

### 6.5 Divider Ornamen — `<Ornamen />`

Sudah ada di `src/components/icons.tsx` (SVG 120×24, stroke `--accent`). Pakai 1 komponen antar section, lebar 112px, margin vertikal 32. `aria-hidden`.

### 6.6 Countdown — `<Countdown target />`

4 kotak (hari/jam/menit/detik): angka `text-countdown` di atas, label `text-eyebrow` di bawah.
- Mobile: grid 4 kolom sama lebar, gap 8; kotak bg `--surface` + hairline emas + radius `--radius-md`, padding 12 8.
- ≥480: 4 kolom lebih lega. **Jangan** pecah 2×2.
- Angka `tabular-nums`, `aria-live="off"` per detik; sediakan satu ringkasan `aria-live="polite"` yang diupdate **per menit** saja (hindari screen reader spam).

### 6.7 Galeri & lightbox

- Thumb: rasio 4:5 atau 1:1 konsisten, radius `--radius-md`, `loading="lazy"`, `sizes="50vw"`. Gap 8, 2 kolom di mobile, 3 di `lg`.
- Lightbox: overlay `rgba(46,31,20,.92)`, foto `object-contain` max-h 82svh, radius `--radius-lg`.
- Kontrol: close 48px kanan atas, panah prev/next 48px, counter `3 / 8`. Swipe kiri/kanan untuk ganti.
- Fokus terperangkap (focus trap), `Esc` menutup, kembalikan fokus ke thumb asal.

### 6.8 Field Salin — `<SalinField label nilai />`

Baris: teks tabular (nomor rekening, `text-body` 600) + tombol ikon `Salin` 44px.
- State: idle (ikon salin + "Salin") → sukses (ikon centang + "Tersalin", `--success`, kembali ke idle setelah 2 dtk) → gagal (teks "Gagal, salin manual", `--danger`).
- `aria-live="polite"` untuk konfirmasi.
- Fallback clipboard: `navigator.clipboard` → gagal = `document.execCommand('copy')` pada `<textarea>` tersembunyi.

### 6.9 Toast / Empty state

- Toast: fixed bawah-tengah (di atas FAB: `bottom: 88px`), bg `--ink`, teks putih, radius `--radius-lg`, `--shadow-lg`, durasi 3 dtk, `role="status"`.
- Empty state buku tamu: ornamen kecil + Cormorant italic "Belum ada ucapan" + arahkan ke form. Jangan blank.

### 6.10 Section Reveal (wrapper animasi)

`<Reveal>` = `IntersectionObserver` threshold 0.15, sekali saja (`unobserve` setelah terlihat).
- Terapkan ke anak, bukan ke section besar (hindari jank saat scroll cepat).
- Fallback: kalau JS mati / `prefers-reduced-motion`, konten **langsung terlihat** (CSS default tanpa opacity 0). ⚠️ jangan pernah `opacity: 0` permanen di HTML statis — tamu dengan JS gagal tidak boleh lihat halaman kosong.

---

## 7. Token animasi

| Token | Nilai | Pakai |
|---|---|---|
| `--dur-instant` | 100ms | umpan balik tap |
| `--dur-fast` | 160ms | hover, active, chip |
| `--dur-base` | 220ms | tombol, field, toggle |
| `--dur-slow` | 360ms | kartu, sheet, lightbox |
| `--dur-reveal` | 600ms | fade/slide masuk section |
| `--ease-standard` | `cubic-bezier(.2,.7,.3,1)` | default |
| `--ease-soft-out` | `cubic-bezier(.16,1,.3,1)` | reveal |
| `--ease-inout` | `cubic-bezier(.4,0,.2,1)` | toggle, accordion |
| `--reveal-shift` | `16px` | `translateY` awal reveal |
| `--stagger` | `60ms` | jeda antar item (maks 4 item) |
| `--parallax-max` | `12%` | parallax hero, ringan saja |
| `--vol-fade` | `800ms` | fade-in volume musik 0 → 0.4 |

Aturan:
- Animasi **hanya** `transform` + `opacity` (compositor). Jangan animasi `height`, `top`, `box-shadow`.
- `@media (prefers-reduced-motion: reduce)`: semua `--dur-*` → `0.01ms`, parallax & stagger dimatikan, konten tetap muncul (fade instan).
- Maks 1 animasi per elemen pada satu waktu. Tidak ada looping selain indikator musik & shimmer skeleton.

---

## 8. Breakpoint (mobile-first)

| Nama | Lebar | Perubahan utama |
|---|---|---|
| base | 320–479 | **target utama**; 1 kolom; gutter 20; section 56 |
| `sm` | ≥480 | display naik; countdown lega; body 16 |
| `md` | ≥768 | kartu acara 2 kolom; kontainer 672; section 80 |
| `lg` | ≥1024 | galeri 3 kolom; timeline lebih lega; kontainer 768 |
| `xl` | ≥1280 | tidak ada perubahan layout (one-page, tetap center) |

Uji wajib: **360×640** (Android kecil), **390×844** (iPhone), **430×932** (iPhone Pro Max), plus landscape 844×390 (cover tidak boleh terpotong).
Gunakan `svh`/`dvh` (bukan `vh`) untuk tinggi cover — hindari lompatan akibat address bar mobile.

---

## 9. Implementasi token (Tailwind 4, `globals.css`)

```css
@import "tailwindcss";

@theme {
  --color-bg: #FBF7F0;
  --color-surface: #FFFFFF;
  --color-surface-warm: #F6F0E6;
  --color-line: #E7DCC9;
  --color-line-strong: #D8C7AB;

  --color-ink: #2E1F14;        /* 14.87 AAA di bg */
  --color-ink-soft: #6B5A4C;   /* 6.16  AA  */
  --color-ink-muted: #8A7867;  /* 3.96  — besar/disabled saja */

  --color-accent-lite: #D9BE78; /* bg tombol primer */
  --color-accent: #C29B44;      /* ornamen */
  --color-accent-600: #A8812F;
  --color-accent-deep: #7E611F; /* teks emas: 5.44 AA */
  --color-accent-soft: #FBF6E9;
  --color-accent-line: #DFC383;

  --color-sage-100: #E8EFE9;
  --color-sage-300: #B3C7B8;
  --color-sage-500: #7D9483;
  --color-sage-600: #6E8575;
  --color-sage-700: #4F6355;    /* 6.05 AA / putih 6.46 AA */

  --color-danger: #9B2C2C;
  --color-danger-soft: #FBEDED;
  --color-success: #3F6B4A;
  --color-success-soft: #E9F3EC;
  --color-warning: #9A6B12;

  --font-display: var(--font-cormorant), Georgia, serif;
  --font-body: var(--font-jakarta), system-ui, sans-serif;

  --radius-xs: 4px;  --radius-sm: 8px;  --radius-md: 12px;
  --radius-lg: 16px; --radius-xl: 24px; --radius-2xl: 32px;

  --shadow-xs: 0 1px 2px rgba(46,31,20,.06);
  --shadow-sm: 0 2px 6px rgba(46,31,20,.08);
  --shadow-md: 0 6px 16px rgba(46,31,20,.10);
  --shadow-lg: 0 12px 28px rgba(46,31,20,.14);
  --shadow-fab: 0 4px 12px rgba(46,31,20,.18);

  --ease-standard: cubic-bezier(.2,.7,.3,1);
  --ease-soft-out: cubic-bezier(.16,1,.3,1);
}
```

Alias lama **wajib** dipertahankan supaya `src/components/musik.tsx` tidak pecah:
`--bg`, `--ink`, `--ink-soft`, `--accent`, `--accent-deep` tetap ada (dipakai kode scaffold).

---

## 10. Pertanyaan buat Bima (tidak diubah sendiri)

1. **Warna tombol scaffold** salah kontras (§1.6) — perbaiki sekarang atau tunggu Gate 2?
2. **QRIS** (PRD §4.9 "opsional") — ada gambar QRIS? Kalau tidak, section Amplop tampil 2 rekening saja + empty note.
3. **Love Story** (PRD §4.7 & §8 "kalau dipakai") — dipakai atau dilewati? Desain menyediakan slot; kalau dilewati, nomor section bergeser.
4. **Lagu latar** — hak cipta + ukuran file: target ≤ 2 MB supaya LCP < 2,5 dtk tetap tercapai. Musik 4 menit 320 kbps bisa 9 MB → minta turunkan ke ~96–128 kbps mono.
