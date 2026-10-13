# Spec Halaman — Undangan Raka & Gina v2 (CSS 3D Ramai)

Route: `/` · one-page · sumber: PRD v1.1 §0–§11 · design-system v1 → v2
Stack: Next.js 16 static export · Tailwind 4 + design-system-v2 · musik `public/musik.mp3` · foto `public/foto/`

Prinsip v2: **RAMAI tapi anggun**. Semua efek = CSS 3D transform murni
(`perspective` + `translateZ`/`rotateX`/`rotateY`) + sedikit JS
(IntersectionObserver, pointer/scroll). **Tanpa** Three.js / WebGL / canvas
3D / library berat. Mobile-first, LCP < 2.5 dtk di Android menengah via WA
in-app.

Alias tetap: `--bg`, `--ink`, `--accent-*`, `--sage-*` tidak dihapus.

---

## Struktur halaman (atas ke bawah)

1. **Cover / Splash** — hero 3D, photo frame bertumpuk, petal jatuh, shimmer
   nama, tombol "Buka Undangan" (curtain reveal), indikator musik §0.
2. Salam Pembuka — ornamen 3D 2 lapis + float ringan.
3. Mempelai — foto arch float-soft + petal 4 + tilt-3D masuk.
4. **Countdown** — kotak angka 3D bertumpuk + flip detik, ringkasan menit.
5. Rangkaian Acara — rise-3D tilt kartu + ornamen divider 3D.
6. Galeri — polaroid 3D berserakan desktop, flip mobile, zoom-3D lightbox.
7. Love Story — timeline + node emas (shimmer) opsional.
8. RSVP — form tanpa tilt (jaga fokus), sukses card pop-in.
9. Amplop Digital — divider 3D antar kartu.
10. Buku Tamu — stagger-pop card + ornamen.
11. Penutup — petal 6 + shimmer nama + Share WA.

---

### 1) Cover / Splash (v2)

- Hero-stage: `perspective: 1000px`, 3 lapis frame (`--bronze-deep`,
  `--accent-line`, foto). Float idle `translateY ±6px`, 6 dtk infinite.
- Petal 10 partikel hero: keyframe `petal-fall` 9–14 dtk, acak driftX &
  rotate3d 720°; `pointer-events:none`; pause tab hidden; reduce-motion: mati
- Shimmer emas: `gold-shimmer` 3.2 dtk, background-pos, opacity ≤.6; max 2
  elemen; hanya nama pasangan + ornamen besar
- Tombol "Buka Undangan": varian `primary lg` (v1 kept, 8.76 AAA). Click:
  curtain reveal (2 lapis split-screen `translateY ±100% + translateZ 40px`,
  900ms `ease-curtain`), lalu scroll `#salam` + `play()` musik.
- Hint musik: tetap chip kecil Armed/NeedsTap (v1).
- Reduce-motion: curtain flat-instan, petal mati, shimmer stop, konten langsung.

**Layout mobile:** hero `min-h-[92svh]`, center, padding 20. Foto hero `priority`.
**Layout desktop:** center, tetap 1 kolom, hero 92svh tetap.

**Aksesibilitas:** `alt="Raka & Gina"` deskriptif; panah `aria-hidden`; chip
musik `role="status"`; tombol `focus-visible` ring; musik pause `visibilitychange`.

---

### 2) Salam Pembuka (v2)

- Ornamen 3D dividers: 2 lapis SVG bunga --accent + background blur --bronze
  `translateZ(-8px) rotate3d(1,0,0,12deg)`; IO: rotate3d(35deg)→0 + fade 500ms.
- Salam text: center, max 36em, eyebrow `Assalamu'alaikum`, paragraf 17/1.65.
- Reduce-motion: ornamen tidak bergerak, teks tetap.

---

### 3) Mempelai (v2)

- Foto arch: float-soft `translateY ±6px`, 6 dtk infinite; radius --radius-arch.
- Foto gagal → initial `--surface-warm` + initial inisial.
- Tilt-3D rise-3d pada kartu/info: dari `rotateX(7deg) translateY(20px)` → flat 420ms IO.
- Petal 4 partikel di bawah foto (reduced dari hero).
- IG chip opsional: tetap --accent-lite bg, --ink teks.

---

### 4) Countdown (v2)

- **Kotak angka 3D**: 2 lapis muka (`--surface`, angka tabular 34px) &
  alas (`--bronze`, translateZ(-6px) scale 1.02); parent perspective 800px.
- Detik berubah: `class="flip"` → `rotateX(0→-90→0)` 600ms, swap angka tengah.
- Menit/jam/hari hanya flip saat nilainya berubah (hemat).
- Footer: label `WIB (UTC+7)` eyebrow --sage-600.
- Ringkasan `aria-live="polite"` per menit saja (hindari spam screen reader).
- `tabular-nums` wajib di semua angka.
- Reduce-motion: flip flat-instant (durasi 0.01ms), kotak tetap terlihat,
  ringkasan tetap update per menit (tanpa animasi per detik).

---

### 5) Rangkaian Acara (v2)

- Kartu: `rise-3d` tilt masuk `rotateX(7deg) translateY(20px)→0` 420ms IO.
- Tilt hover desktop: ±3° via pointer, 160ms; mobile tidak (jaga fokus).
- Ornamen divider antar section: `<Ornamen3D>` 2 lapis, IO rotate3d 35deg→0.
- Layout mobile: kartu tumpuk gap 16, padding 20.
- Layout desktop ≥768: 2 kolom grid `align stretch`.

---

### 6) Galeri (v2)

- Desktop ≥1024: thumb polaroid rotasi acak `rotateY(-6…6deg) rotateX(2…4deg)
  rotateZ(-2…2deg)`, `translateZ(0…12px)` selang-seling; gap 8; 3 kolom.
- Hover/focus: `rotate → 0`, `translateZ(16px)` 220ms; caption `text-micro --ink-soft`.
- Mobile: grid 2 kolom rapi (tidak berserakan); tap item → flip `rotateY(0→90→0)`
  380ms, lalu buka lightbox.
- Lightbox: `perspective: 1200px`, zoom-3d masuk 320ms; overlay opacity .92.
  Swipe: `translateX ±40px + rotateY ±6deg` 200ms. Focus trap, Esc.
- Reduce-motion: polaroid tidak rotasi (flat), flip & lightbox zoom flat-instan.
- 0 foto → empty state ornamen + "Galeri menyusul" (jangan blank).

---

### 7) Love Story — opsional (v2)

- Timeline: garis sage-300, node emas 12px, shimmer ringan 1× per milestone.
- Mobile: garis kiri (16px dari tepi), node + kartu kanan, gap 20.
- Desktop: garis center, kartu selang-seling.
- Love story tidak ada data → section tidak render.

---

### 8) RSVP (v2)

- Form tanpa tilt 3D (jaga fokus input); rise-3d hanya pada tombol sukses card.
- Field tetap token v1; tombol "Kirim RSVP" primary lg.
- Sukses card: `pop-in` (scale .92→1, fade) 300ms; lalu fade 3 detik.
- Reduce-motion: all animasi → 0.01ms; sukses muncul instan tanpa animasi.

---

### 9) Amplop Digital (v2)

- Divider ornamen 3D antar kartu rekening (kadang `--bronze` `translateZ`).
- Field Salin tetap v1; QRIS: jika `public/qris.webp` ada → render, kalau tidak →
  kartu rekening 2 tetap.

---

### 10) Buku Tamu (v2)

- Card entry: `stagger-pop` (scale .92+translateY 10px → 1 + fade) 300ms.
- Optimistic card baru submit: highlight sage-100 2 dtk lalu normal.
- Empty state: ornamen kecil + "Belum ada ucapan" italic Cormorant.
- Reduce-motion: stagger pop mati, konten langsung.

---

### 11) Penutup (v2)

- Petal 6 partikel + shimmer nama pasangan + Share WA tetap.
- Footer kecil "Sampai jumpa di hari bahagia" --sage-500.

---

## 5. Batas performa — LCP < 2.5 dtk

Budget realistis (Moto G4 ×4 CPU, WA in-app throttling):

| Item | Anggaran |
|---|---|
| HTML + CSS inline (kritis) | ≤ 60 KB (gzip ≤ 18 KB) |
| Font Cormorant 1 weight (latin) | ≤ 40 KB woff2, `preload` |
| Foto hero | ≤ 400 KB, `priority` |
| JS total (Next + IO + musik handler + 3D) | ≤ 120 KB gzip; tambahan 3D ≤ 4 KB |
| CSS animasi/3D keyframes | ≤ 9 KB mentah / ≤ 3 KB gzip |
| Musik mp3 | ≤ 2 MB (96–128 kbps mono, preload auto tapi tidak blokir render) |

Maks elemen animasi bersamaan per viewport: **10 petal + 1 float + 2 shimmer +
1 rise/flip = ≤ 14**. Compositing layer 3D aktif ≤ 3 (§2.0). Partikel hero
dimulai sudah-awal, tapi dihentikan (unmount) saat section turun berikutnya
via IO observer → hanya 1 viewport aktif sekaligus.

Test wajib: throttling Moto G4 ×4, LCP hero < 2.5 dtk; kalau lewat, potong
petal 10→6, lalu potong shimmer non-hero saja.

---

## 6. Checklist aksesibilitas v2 (extends v1)

- [ ] `prefers-reduced-motion`: semua looping mati, petal `display:none`, tilt/
      flip/curtain/parallax flat-instan; konten tetap muncul (extends v1).
- [ ] Kontras teks tetap AA: hanya token v1; `--gold-hi`/`--blush` dekorasi
      partikel besar/opacity ≤.6, bukan teks kecil.
- [ ] Anti-mual: rotasi maks ±4° (hero ±°), ±3° (hover kartu); parallax ≤12%;
      tidak ada viewport-penuh otomatis >1 dtk (curtain 900ms sekali); tidak ada
      auto-rotate galeri; flip countdown hanya detik berubah.
- [ ] Petal `aria-hidden` + `pointer-events:none`; tidak menutup tombol.
- [ ] Countdown: angka `aria-live off`, ringkasan `polite`/menit (v1 kept).
- [ ] Lightbox: `role=dialog aria-modal`, focus trap, Esc, fokus kembali.
- [ ] Keyboard: polaroid flip via Enter/Space sama tap; curtain via tombol native.
- [ ] Uji: keyboard-only, VoiceOver/TalkBack spot-check countdown + lightbox,
      cek 360×640 & landscape 844×390 (frame 3D overflow handled).

---

## 7. Token animasi baru (v2)

```css
@theme {
  --dur-float: 6s;
  --dur-petal: 12s;          /* acak 9–14s per partikel */
  --dur-shimmer: 3.2s;
  --dur-flip: 600ms;
  --dur-curtain: 900ms;
  --dur-zoom3d: 320ms;
  --dur-stagger: 70ms;       /* pengganti --stagger 60ms v1 galeri */
  --ease-curtain: cubic-bezier(.7,0,.2,1);
  --ease-float: cubic-bezier(.4,0,.2,1);
  --perspective-hero: 1000px;
  --perspective-card: 900px;
}
```

Aturan performa wajib:
1. Hanya `transform` + `opacity` dianimasikan.
2. Looping: `petal-fall`, `float-soft`, `gold-shimmer` (≤2 elemen).
3. `will-change` via `.is-anim`, dilepas setelah `animationend`/`transitionend`.
4. `visibilitychange` hidden → semua looping paused; visible → running.
5. `prefers-reduced-motion` → durasi → 0.01ms + `.petal { display:none }`
   + curtain/reveal instan + konten langsung terlihat.
6. Maks 1 animasi per elemen per waktu.

---

## 8. Delta per section v1 → v2 (ringkas)

| Section | Delta v1 → v2 |
|---|---|
| Cover | + hero-stage 3D (3 lapis), + petal 10, + shimmer nama, + curtain reveal |
| Salam | + ornamen 3D divider 2 lapis |
| Mempelai | + foto float-soft, + petal 4, + rise-3D tilt |
| Countdown | + kotak angka 3D bertumpuk, + flip detik, ringkasan menit |
| Rangkaian Acara | + rise-3D tilt kartu, + divider ornamen 3D |
| Galeri | + polaroid rotasi acak, + flip mobile, + zoom-3D lightbox |
| Love Story | + node emas shimmer opsional |
| RSVP | + sukses card pop-in |
| Buku Tamu | + stagger-pop card |
| Penutup | + petal 6, + shimmer nama |

---

## 9. Pertanyaan buat Bima (tidak diubah sendiri)

1. Petal 10 di hero OK di HP kentang, atau turun 6 default? (rekomendasi: 8).
2. Deviceorientation perlu izin iOS — tetap opsional atau scroll-only?
3. Shimmer pada nama: permanen 1× lalu berhenti, atau loop 3.2dtk (hemat baterai)?