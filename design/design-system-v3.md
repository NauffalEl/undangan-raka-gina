# Design System v3 — Undangan Raka & Gina (Ornate Frame + Clip Shape)

Versi 3.0 · Sinta · delta dari v2.0 · responsi user review: 'Desainnya masih kurang bingkai biar bagus dan komponen-komponen lainnya udahakan foto sesuai shapenya dan ada bingkai ramai.'

Prinsip: **RAMAI tapi anggun** dengan ornate frames + clip shape. Foto di-clip ke rasio, JANGAN stretch. Semua frame = CSS/SVG inline, max 4 layer, LCP < 2.5s.

---

## 1. Palet (ditambah ornamen)

| Token CSS | HEX | Kontras | Pakai untuk |
|---|---|---|---|
| `--gold-hi` | `#F7ECC8` | — (dekorasi besar) | highlight shimmer nama, sisi terang frame 3D |
| `--bronze` | `#8A6A2B` | putih di atasnya 5.9 AA | sisi gelap frame/kotak 3D (lapisan belakang) |
| `--bronze-deep` | `#5F4915` | putih di atasnya 8.4 AAA | bayangan depth paling belakang |
| `--blush` | `#E8C4B8` | — (dekorasi, bukan teks) | kelopak bunga jatuh (opacity .5–.8) |
| `--sage-deep` | `#364539` | putih di atasnya 10.2 AAA | teks di atas foto gelap / label polaroid |
| `--veil` | `rgba(46,31,20,.92)` | — | overlay lightbox (sama v1, ditegaskan) |
| `--ornate-silver` | `#C0C0C0` | — | ornamen silver (ring, tape, corner) |
| `--ivory` | `#FFFFF0` | — | latar frame putih manis |

Aturan anti-norak:
- Maks 2 aksen per viewport (emas + sage; blush hanya partikel kecil).
- `--gold-hi` dan `--blush` **dilarang** untuk teks kecil (gagal kontras).
- Teks tetap di token v1 (`--ink`, `--ink-soft`, `--accent-deep`, `--sage-700`).
- Gradient emas hanya 2 stop (`--gold-hi → --accent-lite`), opacity shimmer ≤ .6.
- Semua ornamen SVG di-inline di React, boleh diwarnai via `currentColor`.

---

## 2. Sistem Bingkai Foto (Clip Shape)

### 2.1 Prinsip Utama
- **Foto DI-CLIP ke shape (aspect-ratio)** — `object-fit:cover`, `object-position:center`.
- **JANGAN pakai `object-fit:fill`** yang nge-stretch gambar.
- Kalau rasio foto beda dari bingkai → crop otomatis (tidak distorsi).
- Max 4 layer per bingkai (CSS/SVG inline).
- LCP foto tetap < 2.5s — gunakan `fetchpriority=high` untuk hero, lazyload lainnya.

### 2.2 Shape per Foto

| Komponen | Rasio | Shape | CSS Clip/Radius |
|---|---|---|---|
| **Hero** | 4:5 portrait | Deco barok dengan corner flourish | `object-fit:cover` + `clip-path: inset(0 round var(--corner-radius))` + ornamen SVG 4 rotasi |
| **Profil mempelai** | 4:5 | Arch/topeng (rounded-top) | `overflow:hidden` + `border-radius: 50% 50% 16px 16px / 34% 34% 16px 16px` di wrapper — lengkung atas elips seperti lengkung gerbang; **bukan** `clip-path` (persentase arch patah di Safari lama) |
| **Galeri** | 4:5 portrait (bukan 1:1) | Polaroid dengan caption strip | `object-fit:cover` + `clip-path: inset(0)` dengan `border-radius: 4px` |
| **Lightbox** | — | Full-screen object-contain | `object-fit:contain`, `position: absolute`, 4 sudut utuh — TANPA crop, lihat foto utuh |

### 2.3 Komponen Bingkai per Foto

#### Hero — Deco Baroque Frame
- Double/deco barok dengan ornamen sudut (corner flourish).
- 3 layer CSS: (a) sisi belakang `--bronze-deep` `translateZ(-24px) scale(1.03)`, (b) sisi tengah ornamen `--gold-hi` dengan corner flourish 4 rotasi, (c) foto `translateZ(0)`.
- Parent `.hero-stage { perspective: 1000px }`.
- Foto di-clip ke 4:5 portrait, corner flourish melewat di sudut.

#### Profil Mempelai — Arch/Topeng Frame
- Bingkai arch (rounded-top seperti jendela masjid/gerbang).
- Lapisan belakang `--bronze` untuk depth.
- Foto di-clip ke shape arch: `clip-path` dengan sudut melengkung.
- Floating idle `translateY ±6px`, 6dtk infinite (sama hero).

#### Galeri — Polaroid Frame
- Bingkai polaroid dengan caption strip di bawah.
- Tape/sticker kecil dekoratif di sudut kiri/kanan atas.
- Foto di-clip ke 4:5 portrait (cover), caption di bawah foto.
- Hover: `translateZ(16px)` naik sedikit + rotate ke 0.

### 2.4 CSS Clip-Path Contoh

```css
/* Hero — 4:5 dengan corner flourish */
.hero-frame {
  width: 100%;
  aspect-ratio: 4/5;
  object-fit: cover;
  object-position: center;
  -webkit-clip-path: inset(0 round 24px); /* aturan sederhana */
          clip-path: inset(0 round 24px);
  /* Corner flourish SVG di-overlay, di-inline via currentColor */
}

/* Profil — Arch/Topeng */
.profile-frame {
  width: 100%;
  aspect-ratio: 4/5;
  object-fit: cover;
  object-position: center;
  clip-path: polygon(
    0 0,
    100% 0,
    100% calc(100% - 80px),
    0 100%,
    calc(50%) 0
  );
}

/* Galeri — Polaroid */
.gallery-frame {
  width: 100%;
  aspect-ratio: 4/5;
  object-fit: cover;
  object-position: center;
  clip-path: inset(0);
  border-radius: 4px;
  /* Caption strip di bawah */
}
```

### 2.5 Ornamen SVG Reusable (Inline, currentColor)

| Ornamen | Deskripsi | Rotasi |
|---|---|---|
| **Corner flourish** | Bunga/kembang ornamen di 4 sudut bingkai | 0°, 90°, 180°, 270° |
| **Corner divider** | Pemisah section di 2 lapis (depan + blur belakang) | 0° |
| **Ornate ring** | Ring bulat dengan ornamen untuk foto profil | 0° |
| **Tape strip** | Selotip kecil di sudut polaroid (kiri/kanan atas) | 0° |

Setiap ornamen SVG di-inline di React component, warnai via `currentColor` warna frame. Contoh:

```jsx
<!-- Corner flourish SVG inline -->
<svg class="ornament corner-flourish" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
  <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm0 2-5.656 5.656-1.414-1.414 5.656-5.656Z"/>
</svg>
```

---

## 3. Komponen Card Didekorasi (Bukan Border Polos)

Setiap section/card punya bingkai dekoratif:

| Komponen | Deskripsi Bingkai |
|---|---|
| **Kartu Acara** | Double-line border dengan ornamen di 4 sudut (corner flourish). |
| **Countdown Box** | Bingkai emas dengan sudut melengkung (rounded corner), 2 lapis (muka + alas). |
| **Amplop Digital** | Bingkai seperti amplop fisik — lipatan segitiga di atas, ornamen tape strip. |
| **Buku Tamu Card** | Bingkai halus dengan avatar bulat di pojok kiri atas. |
| **Love Story Node** | Bingkai diamond/bulat dengan ornamen di dalam, node timeline di dalam. |
| **RSVP Form** | Bingkai input emas + tombol bingkai deco (korner flourish). |

Contoh kartu acara:

```jsx
<article class="card acara">
  <div class="card-frame">
    <h3>Kartu Acara</h3>
    <p>...</p>
  </div>
  {/* 4 corner flourish SVG inline */}
  <svg class="ornament corner-flourish" ... />
</article>
```

---

## 4. Deskripsi Bingkai per Komponen

### 4.1 Kartu Acara — Double-Line dengan Corners
- Border double-line: `--gold-hi` di luar, `--bronze` di dalam.
- 4 sudut: corner flourish SVG inline, warna `--gold-hi`.
- Hover: `translateZ(4px)` naik sedikit + gold-shimmer 1x.

### 4.2 Countdown Box — Emas dengan Sudut Melengkung
- 2 lapis: muka `--surface` + angka tabular, alas `--bronze` `translateZ(-6px) scale(1.02)`.
- Sudut: `border-radius: 12px` atau `clip-path` arch sederhana.
- Float idle `translateY ±4px`, 4dtk infinite.

### 4.3 Amplop Digital — Lipatan Segitiga
- Forma amplop fisik: segitiga di bagian atas bingkai.
- Tape strip di sisi kanan/kiri (ornamen SVG).
- Caption/field di dalam lipatan.

### 4.4 Buku Tamu Card — Halus dengan Avatar Bulat
- Border halus 1px `--sage-deep` atau ornamen subtel.
- Avatar anggota di pojok kiri atas, `border-radius: 50%`.
- Stagger-pop animasi masuk.

### 4.5 Love Story Node — Diamond/Bulat dengan Ornamen
- Bingkai diamond: `clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%)`.
- Inside: ornamen ring bulat `--gold-hi`.
- Node timeline di tengah.

### 4.6 RSVP Form — Input Emas + Tombol Deco
- Input: `border: 2px solid --gold-hi`, `border-radius: 8px`, padding 12px.
- Label: `--sage-deep`, kontras OK.
- Tombol: bingkai deco dengan corner flourish, hover `translateZ(2px)`.

---

## 5. Aturan Performa

### 5.1 Bingkai & Ornamen
- **Semua bingkai = CSS/SVG inline**, tidak ada file gambar raster.
- Max 4 layer per bingkai (sisi depan, sisi belakang, ornamen, shadow).
- LCP foto: hero ≤ 400 KB (`fetchpriority=high`), galeri lazyload.
- Max 4 element animasi bersamaan per viewport (lihat §2.0 v2).

### 5.2 Looping & Reduce-Motion
- Looping infinite hanya: `petal-fall` (≤6 partikel hero), `float-soft` (1 foto hero/profil), `gold-shimmer` (≤2 elemen).
- `prefers-reduced-motion` → semua keyframes durasi → 0.01ms + `.ornament { display: none }` + bingkai tetap terlihat (tanpa animasi).
- `will-change: transform` hanya via `.is-anim`, dilepas setelah `animationend`.

### 5.3 Compositing Layer
- Max 3 layer 3D aktif per viewport (§2.0 v2).
- Ornamen SVG tidak menciptakan layer komposit baru kecuali ada `filter` atau `transform`.

---

## 6. Sketsa ASCII Bingkai

### 6.1 Hero — Deco Baroque Frame (samping)

```
      tamu →
   ┌────────────────────┐  ← (c) foto 4:5, object-fit:cover, clip-path
   │        ╱⌒╲        │
   │     ╱    ╲     │   corner flourish 4 rotasi
   │    ╱      ╲    │
   │   ╱        ╲   │
   │  │   R & G   │  │
   │  │   foto   │  │
   │  │        │  │
   │   ╲        ╱   │
   │    ╲      ╱    │   corner flourish (mirror)
   │     ╲    ╱     │
   │      ╲╱        │
   └────────────────────┘
  ┌─────────────────────────────┐  ← (b) sisi tengah ornamen --gold-hi
  │ ████████████████████████████ │
  │ █                       █ │
  │ █     --gold-hi line     █ │
  │ █                       █ │
  └─────────────────────────────┘
 ┌───────────────────────────────────────────────────┐ ← (a) bayangan/sisi belakang --bronze-deep
 │ ████████████████████████████ ████████████████████ │
 │ █                           █                   █ │
 │ █   --bronze-deep           █   --bronze-deep     █ │
 │ █                           █                   █ │
 └───────────────────────────────────────────────────┘
   perspective: 1000px · float ±6px · parallax 6%
```

### 6.2 Profil Mempelai — Arch/Topeng Frame (samping)

```
      tamu →
   ┌────────────────────┐
   │     ╱   ╲          │
   │    ╲     ╱         │   arch shape: rounded top
   │     ╲   ╱          │
   │      ╲ ╱           │
   │   ┌────────────┐   │   foto di-clip ke arch
   │   │   R & G      │   │
   │   │   (arch)     │   │
   │   └────────────┘   │
   │                   │
   └────────────────────┘
  ┌───────────────────────────────────────┐
  │  --bronze (sisi belakang)             │
  │  --bronze-deep (bayangan)             │
  └───────────────────────────────────────┘
   perspective: 800px · float ±6px
```

### 6.3 Galeri — Polaroid Frame (desktop, 3 thumb)

```
  ┌────────────┐  ┌────────────┐  ┌────────────┐
  │ ╲______╱   │  │ ______╱   │  │  ______╱   │
  │ caption    │  │ caption  │  │ caption  │
  │  tape strip│  │ tape strip│  │ tape strip│
  └────────────┘  └────────────┘  └────────────┘
   rotateY/X/Z acak ±6° · translateZ ±12px · gap 8px
   hover: menegak + naik 16px + caption strip terlihat
```

---

## 7. Checklist Desain v3

- [ ] **Foto cover crop** — Semua foto pakai `object-fit:cover` + `object-position:center`, JANGAN `fill`. Crop otomatis kalau rasio beda.
- [ ] **Shape konsisten** — Hero 4:5 portrait, Profil arch 4:5, Galeri 4:5 portrait (bukan 1:1), Lightbox object-contain tanpa crop.
- [ ] **Bingkai ornate** — Setiap foto punya bingkai ramai: hero deco barok, profil arch, polaroid galeri. Ornamen SVG inline, currentColor.
- [ ] **Ornamen tidak mengganggu keterbacaan** — Corner flourish melewat di sudut, tidak menutupi teks utama. Kontras AA tetap (token v1 untuk teks).
- [ ] **Kontras tetap AA** --gold-hi dan --blush hanya dekorasi besar/partikel, teks tetap --ink / --sage-700.
- [ ] **Performa LCP** — Foto hero ≤ 400 KB, max 4 layer bingkai, CSS/SVG inline total ≤ 9 KB mentah.
- [ ] **Reduce-motion** — Semua keyframes ornamen mati, bingkai tetap (border/clip-path), petal `display:none`.
- [ ] **4 layer max per bingkai** — Telaah: (1) sisi depan, (2) sisi belakang/depth, (3) ornamen, (4) shadow.
- [ ] **Semua komponen card** sudah punya bingkai dekoratif (kartu acara, countdown, amplop, buku tamu, love story, RSVP).
- [ ] **Lightbox** — full-screen object-contain, TANPA crop, Esc untuk tutup, focus trap.

---

## 8. Token Animasi Tambahan v3

```css
@theme {
  --dur-float: 6s;
  --dur-petal: 12s;     /* acak 9–14s per partikel via inline style */
  --dur-shimmer: 3.2s;
  --dur-flip: 600ms;
  --dur-curtain: 900ms;
  --dur-zoom3d: 320ms;
  --dur-stagger: 70ms;
  --ease-curtain: cubic-bezier(.7,0,.2,1);
  --ease-float: cubic-bezier(.4,0,.2,1);
  --perspective-hero: 1000px;
  --perspective-card: 900px;
  --corner-radius: 24px;         /* hero corner flourish radius */
  --arch-radius: 16px;          /* arch top radius */
  --polaroid-border: 4px;        /* galeri border-radius */
}
```

---