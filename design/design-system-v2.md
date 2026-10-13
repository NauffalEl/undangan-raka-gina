# Design System v2 — Undangan Raka & Gina (Ramai + 3D CSS-only)

Versi 2.0 · Sinta (UI/UX) · delta dari v1.0 · PRD v1.1 §5 tetap berlaku
Prinsip: **ramai tapi anggun**. Semua efek = CSS 3D transform murni
(`perspective` + `translateZ`/`rotateX`/`rotateY`) + sedikit JS
(IntersectionObserver, pointer/scroll, deviceorientation opsional).
**Tanpa** Three.js / WebGL / canvas 3D / library berat. Mobile-first,
LCP < 2.5 dtk di Android menengah via WA in-app.

Token v1 tidak dihapus — v2 hanya menambah. Alias `--bg`, `--ink`,
`--accent-*`, `--sage-*` tetap.

---

## 1. Palet tambahan (tetap elegan-romantis)

v1 terasa sepi karena hampir semua emas dipakai flat satu lapis.
v2 menambah **lapisan depth** (terang→gelap) + satu aksen blush tipis
untuk kelopak. Pemakaian dibatasi: efek 3D sisi/belakang + shimmer.

| Token CSS | HEX | Kontras di `--bg` | Pakai untuk |
|---|---|---|---|
| `--gold-hi` | `#F7ECC8` | — (dekorasi besar saja) | highlight shimmer nama, sisi terang frame 3D |
| `--bronze` | `#8A6A2B` | putih di atasnya 5.9 AA | sisi gelap frame/kotak 3D (lapisan belakang) |
| `--bronze-deep` | `#5F4915` | putih di atasnya 8.4 AAA | bayangan depth paling belakang |
| `--blush` | `#E8C4B8` | — (dekorasi, bukan teks) | kelopak bunga jatuh (opacity .5–.8) |
| `--sage-deep` | `#364539` | putih di atasnya 10.2 AAA | teks di atas foto gelap / label polaroid |
| `--veil` | `rgba(46,31,20,.92)` | — | overlay lightbox (sama v1, ditegaskan) |

Aturan anti-norak:
- Maks 2 aksen per viewport (emas + sage; blush hanya sebagai partikel kecil).
- `--gold-hi` dan `--blush` **dilarang** untuk teks kecil (gagal kontras).
- Teks tetap di token v1 (`--ink`, `--ink-soft`, `--accent-deep`, `--sage-700`).
- Gradient emas hanya 2 stop (`--gold-hi → --accent-lite`), opacity shimmer ≤ .6.

```css
@theme {
  --color-gold-hi: #F7ECC8;
  --color-bronze: #8A6A2B;
  --color-bronze-deep: #5F4915;
  --color-blush: #E8C4B8;
  --color-sage-deep: #364539;
}
```

---

## 2. SISTEM EFEK 3D (CSS-only)

### 2.0 Fondasi (berlaku semua efek)

- `perspective` hanya di **parent** (`800–1200px`, hero 1000px). Anak pakai
  `transform-style: preserve-3d`. Sisi/belakang via `translateZ(-1px…-24px)`.
- Yang dianimasikan **hanya** `transform` + `opacity`.
- Maks **3 lapis 3D per viewport** (satu stack hero/galeri/countdown aktif,
  sisanya flat sampai masuk viewport via IO).
- `will-change: transform` hanya saat animasi berjalan (dipasang lewat
  class `.is-anim`, dilepas di `animationend`/`transitionend`).
- `overflow-x: hidden` di `body` tetap (rotate bisa melebar 2–4px).
- Fallback: tanpa `preserve-3d` (browser lama) → tampil flat rapi, tidak pecah.

### 2.1 Hero: photo frame 3D bertumpuk + parallax ringan

3 lapis: (a) bingkai belakang `--bronze-deep` `translateZ(-24px) scale(1.03)`,
(b) bingkai tengah `--accent-line` `translateZ(-12px)`,
(c) foto `translateZ(0)` + ring emas `--inset-hairline`.
Parent `.hero-stage { perspective: 1000px }`.
Float idle: `translateY ±6px`, 6 dtk, ease-in-out, infinite.
Parallax scroll: foto `translateY(scrollY * 0.06)` max 12% (token v1 kept);
bingkai belakang `* 0.03` → rasa depth.
Pointer/deviceorientation (opsional): `rotateX/Y` maks **±4°** di hero saja,
`lerp` 100ms; deviceorientation hanya setelah izin iOS + gesture; fallback
scroll bila tidak ada. Matikan di reduce-motion (flat).

### 2.2 Kelopak/bunga jatuh (CSS only)

Partikel = `span.petal` (8–10 hero, 4–6 di Mempelai/Penutup saja).
Bentuk CSS: `border-radius: 62% 38% 60% 40%` + bg `--blush`/`--accent-line`
opacity .5–.8, ukuran 8–14px. Keyframe `petal-fall`:
`translate3d(driftX, -10vh → 110vh, 0) + rotate3d(1,1,0, 0→720deg)`.
Durasi acak 9–14 dtk, delay negatif acak (-2…-12 dtk) supaya langsung ramai.
`pointer-events: none`, `aria-hidden`. Pause saat tab hidden
(`visibilitychange` → `animation-play-state: paused`). Di reduce-motion:
tidak dirender sama sekali (JS cek `matchMedia`, CSS `display:none`).

### 2.3 Section cards: tilt 3D halus saat masuk

`.tilt-in` parent `perspective: 900px`. Masuk: dari
`rotateX(7deg) translateY(20px)` → `rotateX(0) translateY(0)`,
420ms `ease-soft-out`, opacity 0→1. Trigger IO sekali (threshold 0.15).
**Bukan** tilt ikut mouse di mobile (hindari mual + hemat baterai);
di desktop hover tilt maks ±3° via pointer, `transition 160ms`.
Kartu Acara & Amplop pakai ini; form RSVP tidak (jaga fokus input).

### 2.4 Countdown: kotak angka 3D + flip detik

Kotak = 2 lapis: muka (`--surface`, angka) `translateZ(10px)` + alas
(`--bronze`, `translateZ(-6px) scale(1.02)`) + `box-shadow` bertumpuk
(`--shadow-md` + `inset-hairline`). Parent `perspective: 800px`.
Detik berubah → class `.flip` 600ms: `rotateX(0→-90→0)` dengan swap angka
di tengah (JS ganti teks di 50%). Menit/jam/hari flip hanya saat nilainya
berubah (hemat). `tabular-nums` tetap. Screen reader: angka `aria-live off`,
ringkasan per menit `polite` (v1 kept).

### 2.5 Galeri: polaroid 3D berserakan

Desktop (≥1024): tiap thumb polaroid (foto + caption bar putih bawah)
rotasi acak kecil `rotateY(-6…6deg) rotateX(2…4deg) rotateZ(-2…2deg)`,
`translateZ(0…12px)` selang-seling; hover/focus menegak
(`rotate → 0`, `translateZ(16px)`, 220ms). Stagger masuk 70ms/item, maks 6.
Mobile: grid 2 kolom rapi (tidak berserakan — sempit); tap item → flip
`rotateY(0→90→0)` 380ms + buka lightbox. Caption `text-micro --ink-soft`.

### 2.6 Lightbox: zoom 3D masuk

Masuk: `scale(.86) translateZ(-80px) rotateX(3deg)` → `scale(1)` 320ms
`ease-soft-out`, overlay opacity 0→.92. Keluar kebalikan 220ms.
Parent `perspective: 1200px`. Swipe prev/next: `translateX ±40px +
rotateY ±6deg` 200ms. Focus trap + Esc + kembalikan fokus (v1 kept).

### 2.7 Divider ornamen antar section: dua lapis + rotate3d

`<Ornamen3D>`: lapis depan SVG bunga 120×24 (`--accent`) + lapis belakang
duplikat blur 1px `--bronze` `translateZ(-8px) rotate3d(1,0,0,12deg)`.
Masuk IO: `rotate3d(1,0,0,35deg)` → 0 + fade, 500ms. `aria-hidden`.
Lebar 136px (v1 112px → sedikit lebih ramai), margin vertikal 32 tetap.

### 2.8 Curtain reveal tombol "Buka Undangan"

Cover = 2 lapis split-screen (atas krem `--bg`, bawah `--surface-warm` +
motif bunga opacity .12). Klik: atas `translateY(-100%) translateZ(40px)`,
bawah `translateY(100%) translateZ(40px)` berlawanan, 900ms
`ease-curtain`, lalu `display:none` + scroll ke `#salam` + `play()` musik.
Tombol tetap varian `primary lg` (8.76 AAA). JS mati: tombol = anchor
`#salam` biasa, curtain tidak dipasang (progressive enhancement).
Reduce-motion: curtain langsung hilang tanpa gerak.

---

## 3. ANIMASI — keyframes baru + token

Keyframes v1 (`fabIn`, `shimmer`, `popIn`) tetap. Tambahan:

| Keyframe | Gerakan | Durasi / pakai |
|---|---|---|
| `petal-fall` | `translate3d` atas→bawah + `rotate3d` 720° | 9–14 dtk infinite (hero) |
| `gold-shimmer` | gradient `background-position` −20%→120%, opacity ≤.6 | 3.2 dtk, nama pasangan + ornamen, max 2 elemen/viewport |
| `float-soft` | `translateY ±6px` (+ `translateZ(0)` lock compositor) | 6 dtk infinite, foto mempelai/hero |
| `rise-3d` | `rotateX(7deg)+translateY(20px)` → flat + fade | 420ms sekali, kartu section (IO) |
| `flip-num` | `rotateX(0→-90→0)` | 600ms saat angka countdown berubah |
| `stagger-pop` | `scale(.92)+translateY(10px)` → 1 + fade | 300ms, stagger 70ms/item galeri (maks 6) |
| `curtain-up/down` | `translateY(∓100%) + translateZ(40px)` | 900ms sekali, cover reveal |
| `zoom-3d` | `scale(.86)+translateZ(-80px)+rotateX(3deg)` → 1 | 320ms lightbox masuk |

Token baru:

```css
@theme {
  --dur-float: 6s;
  --dur-petal: 12s;          /* acak 9–14s per partikel via inline style */
  --dur-shimmer: 3.2s;
  --dur-flip: 600ms;
  --dur-curtain: 900ms;
  --dur-zoom3d: 320ms;
  --dur-stagger: 70ms;       /* pengganti --stagger 60ms v1 untuk galeri */
  --ease-curtain: cubic-bezier(.7,0,.2,1);
  --ease-float: cubic-bezier(.4,0,.2,1);
  --perspective-hero: 1000px;
  --perspective-card: 900px;
}
```

Aturan performa (wajib):
1. Hanya `transform` + `opacity` yang dianimasikan.
2. Looping infinite hanya: `petal-fall` (≤10 partikel), `float-soft` (1 foto
   per viewport), `gold-shimmer` (≤2 elemen). Sisanya sekali (`both`).
3. `visibilitychange` hidden → semua looping `paused`; visible → `running`.
4. `prefers-reduced-motion: reduce` → **semua** keyframes mati (durasi
   0.01ms v1 kept) + `.petal { display:none }` + curtain/reveal instan +
   konten langsung terlihat.
5. `will-change` hanya via `.is-anim`, dilepas setelah selesai.

Perkiraan ukuran CSS: seluruh keyframes + class 3D ≈ **6–9 KB mentah,
≈2–3 KB gzip** — tidak mengancam LCP.

---

## 4. Batas performa — LCP < 2.5 dtk (Android menengah, WA in-app)

Budget realistis (Moto G级 / Redmi 9, 4G ~8 Mbps efektif):

| Item | Anggaran |
|---|---|
| HTML + CSS kritis (inline/utama) | ≤ 60 KB (gzip ≤ 18 KB) |
| Font display (Cormorant 600 latin + swap) | ≤ 40 KB woff2, `preload` 1 weight saja |
| Foto hero (`hero.webp`  lite  + `priority`) | ≤ 400 KB, `fetchpriority=high` |
| JS total (Next static + IO + musik + tilt) | ≤ 120 KB gzip; JS 3D tambahan ≤ 4 KB |
| CSS animasi/3D (butir §3) | ≤ 9 KB mentah / ≤ 3 KB gzip |
| Musik mp3 | `preload="auto"` tapi **tidak** blokir render; ≤ 2 MB (96–128 kbps mono) |

Maks elemen animasi bersamaan per viewport:
**10 petal + 1 float + 2 shimmer + 1 rise/flip = ≤ 14**.
Compositing layer 3D aktif ≤ 3 per viewport (§2.0). Partikel di luar hero
tidak dirender sampai section-nya terlihat (IO pasang/musnahkan node).
Test wajib: throttling Moto G4 ×4 CPU di DevTools, LCP hero < 2.5 dtk;
kalau lewat, potong petal 10→6 dulu (bukan potong foto/font).

---

## 5. Sketsa ASCII per efek 3D

### 5a. Hero frame 3D bertumpuk (tampak samping)

```
      mata tamu ──►
   ┌─────────────┐  ← (c) foto  translateZ(0)
   │  R & G foto │
   └─────────────┘
  ┌───────────────┐  ← (b) bingkai emas  translateZ(-12px)
  │ ░░░░░░░░░░░░░ │
  └───────────────┘
 ┌─────────────────┐ ← (a) bayangan bronze translateZ(-24px) scale 1.03
 └─────────────────┘
   perspective: 1000px · float ±6px · parallax scroll 6% vs 3%
```

### 5b. Countdown kotak 3D + flip

```
        ┌───────┐
        │  12   │  ← muka (surface) translateZ(+10px), angka tabular
        │ hari  │
        └───────┘
       ┌───────┐    ← alas (bronze) translateZ(-6px) scale 1.02
       │▓▓▓▓▓▓▓│    + shadow-md bertumpuk = rasa tebal
       └───────┘
   detik berubah: rotateX(0 → -90 → 0) / 600ms, swap angka di tengah
```

### 5c. Galeri polaroid berserakan (desktop)

```
  ┌────────┐    ┌────────┐    ┌────────┐
  │ foto 1 │    │ foto 2 │    │ foto 3 │
  │╲______╱│    │______  │    │  ______╱│  rotateY/X/Z acak ±6°
  │ caption│    │ caption│    │ caption│  hover: menegak + naik 16px
  └────────┘    └────────┘    └────────┘
  mobile: grid 2 kolom rapi · tap = flip rotateY(0→90→0) 380ms
```

### 5d. Curtain reveal "Buka Undangan"

```
  SEBELUM KLIK:              SAAT KLIK (900ms):
  ┌──────────────┐           ╲  lapis atas ▲ naik + translateZ  ╱
  │kotak atas    │  ──klik──► ──  ──  ──  ──  ──  ──  ──  ──
  │[Buka Undangan│           ──  ──  ──  ──  ──  ──  ──  ──
  │kotak bawah   │           ╱ lapis bawah ▼ turun + translateZ ╲
  └──────────────┘           → isi undangan (#salam) muncul + musik play
```

---

## 6. Checklist aksesibilitas v2

- [ ] `prefers-reduced-motion`: semua keyframes mati, petal hilang, tilt/
      flip/curtain/parallax flat-instan, konten tetap muncul (extends v1).
- [ ] Kontras teks tetap AA: teks hanya token v1; `--gold-hi`/`--blush`
      dekorasi besar/partikel, bukan teks.
- [ ] Anti-mual: rotasi maks ±4° (hero), ±3° (hover kartu); parallax ≤12%;
      tidak ada gerakan viewport-penuh >1 dtk kecuali curtain 900ms sekali;
      tidak ada auto-rotate galeri; flip countdown hanya detik.
- [ ] Petal `aria-hidden` + `pointer-events:none`; tidak menutup tombol.
- [ ] Countdown: angka `aria-live off`, ringkasan `polite`/menit (v1 kept).
- [ ] Lightbox: `role=dialog aria-modal`, focus trap, Esc, fokus kembali.
- [ ] Keyboard: polaroid flip via Enter/Space sama dengan tap; curtain via
      tombol native `<button>`.
- [ ] Uji: keyboard-only penuh, VoiceOver/TalkBack spot-check countdown +
      lightbox, cek 360×640 & landscape 844×390 (frame 3D tidak overflow).

---

## 7. Delta per section (ringkas; detail di `spec-halaman.md` §v2)

Cover: hero-stage 3D + petal 10 + shimmer nama + curtain. Salam: ornamen 3D
2 lapis. Mempelai: foto arch float-soft + petal 4 + rise-3d kartu. Countdown:
kotak 3D + flip. Acara/Amplop: rise-3d tilt. Galeri: polaroid + flip mobile +
zoom-3d lightbox. Love Story: rise-3d + node emas shimmer. RSVP: tanpa tilt
(jaga fokus), sukses card pop. Buku Tamu: stagger-pop. Penutup: petal 6 +
shimmer nama + Share tetap.

## 8. Pertanyaan buat Bima (tidak diubah sendiri)

1. Petal 10 di hero OK di HP kentang, atau turun 6 default? (rekomendasi: 8).
2. Deviceorientation perlu izin iOS — tetap sertakan opsional atau scroll-only?
3. Shimmer pada nama: permanen atau hanya 2× lalu berhenti (hemat baterai)?
