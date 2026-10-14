# DESIGN v5 — Raka & Gina | Mewah Islami-Elegan (Mobile-first 480px)

> Token acuan: `src/app/globals.css`. Jangan ubah token. Pakai class Tailwind + var. Max-width konten: 480px centered (`max-w-[30rem]` / 480px). Section default `px-5 py-14`. Density tinggi, whitespace hemat.

## 0. Prinsip & Token Kunci
- Palet: `bg #FBF7F0`, `surface #FFFFFF`, `accent #C29B44`, `accent-lite #D9BE78`, `accent-deep #7E611F`, `sage-700 #4F6355`, `ink #2E1F14`, `ink-soft #6B5A4C`, `blush #E8C4B8`, `line #E7DCC9`, `gold-hi #F7ECC8`, `bronze #8A6A2B`, `bronze-deep #5F4915`.
- Radius: `xs 4 / sm 8 / md 12 / lg 16 / xl 24 / 2xl 32 / pill 999 / arch 50% 50% 12 12 / corner 24 / arch-r 16 / polaroid 4`.
- Shadow: `xs 0 1 2 .06 / sm 0 2 6 .08 / md 0 6 16 .10 / lg 0 12 28 .14 / fab 0 4 12 .18`, `ring-gold 0 0 0 6 rgba(217,190,120,.28)`, `inset-hairline`.
- Font: `display Cormorant Garamond` (judul/nama), `body Plus Jakarta Sans` (isi). Display italic untuk ayat/salam.
- Batas mewah: tidak neon, tidak glitter tebal. Emas = garis tipis + shimmer 0.45–0.6 opacity, bukan fill solid.

## 1. Layout Global
- Container: `mx-auto w-full max-w-[30rem] sm:max-w-[48rem]` — mobile 480px ketat, desktop tetap centered tidak melebar.
- Section gap `py-10 sm:py-14`, `px-5`. Divider antar section: `OrnateDivider size sm(100px) md(140px)`.
- Background: gradient porcelain `body::before` + floral tile `bg-fx 168px 0.5 opacity` + vignette `body::after`. Jangan tambah layer baru.
- Reveal: pakai `Reveal` (rise-3d). Stagger `70ms`. Threshold IO 0.15.

## 2. Cover (`musik.tsx` — Cover + Hero)
- Tinggi: `min-h-[100dvh] flex flex-col justify-end`, hero image `FramedImage variant deco-barok ratio 4:5` width `280px (mobile) / 360px (desktop)` centered.
- Frame 3 lapis: `framed-hero-back` bronze-deep 0.55 + `framed-hero-mid` gold-hi 0.35 padding 8px + foto + `framed-hero-ring` inset 10px 1px accent-line + `CornerFlourish 34px` 4 sudut gold-hi.
- Nama: `font-display text-[36px] sm:text-[44px] leading-none tracking-[0.04em] text-ink` + `gold-shimmer` pada nama (opsional, bisa dimatikan prefers-reduced-motion). Tanggal `tanggalPisah` `text-eyebrow 12px tracking-[0.18em] uppercase text-accent-deep`.
- Tombol "Buka Undangan": `Tombol primary lg min-h-13 px-6 rounded-pill bg-accent-lite text-ink shadow-sm`, width `w-full max-w-[22rem] mx-auto`.
- FAB musik: `fixed bottom-4 right-4 h-11 w-11 rounded-full bg-surface border border-line shadow-fab`, ikon `Musik/Sunyi 20px`. State fabIn 220ms ease-soft-out.
- Kelopak hero: `Kelopak jumlah 8 area hero` — size 9–14px, dur 9–14s, drift ±60px.

## 3. Salam (`salam.tsx`)
- Ornamen atas: `Ornamen3D` 48px center.
- Judul salam (arab): `font-display italic text-[22px] leading-snug text-accent-deep` (max 2 baris).
- Body: `text-[15px] leading-7 text-ink text-center max-w-[26rem] mx-auto`, paragraf split `\n\n` gap 12px.
- Divider bawah tidak perlu; jarak ke mempelai 40px.

## 4. Mempelai (`mempelai.tsx`)
- Layout mobile: stack vertikal 2 kartu gap 32px. Divider tengah: `&` `font-display text-2xl text-accent` + garis 40px accent-line.
- Kartu: `tilt-in` + foto `FramedImage variant arch 176x224 (mobile) / 192x256 sm`, float-soft 6s ease-float infinite. Bronze shadow belakang `translate 6px 6px opacity .6`.
- Inisial fallback di belakang foto `text-4xl text-ink-muted opacity .15`.
- Chip: `Chip gold bg-accent-soft text-accent-deep text-micro 10px tracking-wide` label "Mempelai Pria/Wanita".
- Nama: `font-display text-2xl sm:text-3xl text-ink`, orangTua `text-sm text-ink-soft`, IG button `ghost min-h-11 px-4 rounded-pill border-accent-line text-accent-deep hover:bg-accent-soft`.

## 5. Countdown (`countdown.tsx`)
- Judul `Menuju Hari Bahagia` `font-display text-xl text-ink center`, zona `WIB (UTC+7)` `text-caption 11px text-ink-soft uppercase`.
- Grid 4 kotak: `grid-cols-4 gap-2 sm:gap-3`. Kotak `countdown-gold-frame rounded-md border-accent-line bg-surface px-2 py-3` + alas bronze `absolute inset-0 bg-bronze opacity .5 translateZ(-6px)`.
- Angka: `font-display text-[28px] sm:text-[32px] font-semibold tabular-nums text-ink translateZ(10px)`, label `text-[10px] tracking-[0.14em] uppercase text-ink-soft`.
- Anim flip saat detik berubah: `flip-num 600ms ease-soft-out`. Pause interval saat `document.hidden`.
- Lewat H: ganti grid jadi banner `rounded-lg bg-success-soft border-success text-success p-4 text-center "Acara telah dilaksanakan — Jazakumullah khairan"`.

## 6. Rangkaian Acara (`kartu-acara.tsx`)
- Grid: `grid-cols-1 md:grid-cols-2 gap-4`. Tiap kartu `FramedCard card-double-corner p-5 shadow-md` — double-line: `border gold-hi + outline bronze offset 4px` + inner `::before 1px accent-line inset 3px` + 4x `CornerFlourish 30px`.
- Eyebrow jenis: `text-[11px] tracking-[0.16em] uppercase text-accent-deep`, judul `font-display text-xl text-ink`, tanggal `font-display text-base text-ink`, jam `text-sm tabular-nums text-ink-soft`.
- Alamat: ikon `Pin 16px text-accent-deep` + tempat `text-sm font-semibold` + alamat `text-sm text-ink-soft`.
- Tombol: row `flex-col sm:flex-row gap-2 mt-3` — "Lihat Lokasi" `ghost md ghost border-accent-line` flex-1, "Simpan ke Kalender" `quiet` flex-1. Disabled tanpa maps → `quiet disabled opacity-50`.

## 7. Galeri (`galeri.tsx`)
- Grid mobile: `grid-cols-2 gap-3`, desktop: `grid-cols-3 gap-4` dengan scatter 3D deterministik (rotateX ±4°, rotateY ±6°, rotateZ ±2°, translateZ 0–12px) + `perspective 1200px`.
- Thumb: `FramedImage variant polaroid ratio 4:5 bg-ivory p-2 pb-8 shadow-md ring-1 ring-line rounded-[4px]` + 2x `TapeStrip 56x20 -top-2 -left-3/-right-3 rotate ±6° bg linear gold-hi→accent-lite dashed`. Caption `polaroid-caption 11px 600 text-ink-soft center`.
- Hover desktop: reset rotasi `rotate 0 translateZ 16px` transisi 220ms ease-soft-out. Mobile tap: flip 320ms lalu lightbox.
- Lightbox: `fixed inset-0 z-50 bg-veil 92% backdrop-blur-sm`, image `max-h-[80dvh] max-w-[92vw] object-contain rounded-lg`, nav `Tombol ghost sm 40px circle`, close `Silang 20px top-4 right-4`. Fokus trap + ESC + swipe. Zoom `zoom-3d 320ms`.

## 8. Love Story (`love-story.tsx`)
- Timeline vertikal mobile: `border-l border-sage-300 pl-8 space-y-10 mt-10`. Node `h-3 w-3 rounded-full bg-gold-hi border-2 border-bg gold-shimmer-bar` posisi `-left-[calc(2rem+6px)] top-1.5`.
- Desktop: center line `md:border-l-0 md:pl-0` + garis tengah `absolute left-1/2 w-px h-full bg-sage-300`, kartu zig-zag `md:w-[calc(50%-1.5rem)]` kiri/kanan selang `i%2`.
- Kartu: `rounded-lg border-line bg-surface p-5 shadow-sm inset-hairline`, tanggal `eyebrow 11px accent-deep`, judul `font-display text-lg`, deskripsi `text-sm text-ink-soft leading-6`.

## 9. RSVP (`rsvp.tsx`)
- Form `max-w-[28rem] mx-auto space-y-4 mt-8`. Input: `inputClass w-full rounded-md border-line-strong bg-surface px-4 py-3 text-sm shadow-sm focus:border-accent-600 focus:ring-gold`. Error → `border-danger bg-danger-soft`.
- Field `Label 13px 600 text-ink mb-2`. Radio hadir: `grid grid-cols-2 gap-3` — opsi card `rounded-md border p-3 text-center text-sm font-semibold` selected `border-accent-600 bg-accent-soft text-accent-deep`.
- Jumlah tamu: stepper `- 1 +` `h-10 w-10 rounded-md border bg-surface`, nilai `tabular-nums text-sm`. Hadir=false → stepper disabled opacity .4.
- Tombol kirim: `primary md w-full min-h-11` loading spinner 16px. Sukses → banner `bg-success-soft p-8 rounded-lg center` ikon Centang 56px + text "Terima kasih, RSVP tercatat" `font-display text-lg`. Gagal → `ErrorState` + retry.

## 10. Amplop Digital (`amplop.tsx`)
- Intro `text-sm text-ink-soft center max-w-prose`.
- Kartu rekening: `envelope-frame rounded-md border-line bg-surface p-[18px 16px 16px] pt-14 relative overflow-hidden` — lipatan `::before h-44 clip-path polygon 0 0 50% 100% 100% 0 dashed`, tape `envelope-tape 52x22 -top-2 right-3.5 rotate -4° bg-accent-line .7`.
- Isi: bank `Chip netral text-micro`, nomor `text-base font-semibold tabular-nums text-ink truncate`, nama `text-sm text-ink-soft`. Tombol salin `h-11 min-w-11 px-3 rounded-md text-xs 600` idle `bg-accent-soft text-accent-deep`, tersalin `bg-success-soft text-success`, gagal `bg-danger-soft`.
- Empty state: `bg-surface-warm border-line p-6 rounded-lg center` ikon Info + "Hubungi mempelai".

## 11. Buku Tamu (`buku-tamu.tsx`)
- Loading skeleton: 3x `rounded-lg border-line bg-surface p-5 skeleton shimmer 1.4s`.
- List: `space-y-3 mt-8` max 24 item, scroll `max-h-[420px] overflow-y-auto pr-1`.
- Kartu: `stagger-pop 300ms ease-soft-out` delay `i*70` + `rounded-lg border-line bg-surface p-5 shadow-sm`. Avatar `h-10 w-10 rounded-full bg-accent-soft text-accent-deep` ikon Orang. Nama `text-sm 600 truncate`, hadir `Chip sage/gold/netral micro`, waktu `waktuRelatif` `text-caption 11px text-ink-soft`. Pesan `text-sm text-ink leading-6 mt-2 whitespace-pre-wrap`.
- Empty: `border-dashed p-8 center text-sm text-ink-soft "Belum ada ucapan — jadi yang pertama?"`.

## 12. SECTION BARU — Lokasi (`lokasi.tsx`) — sebelum Penutup
- Tujuan: ringkas alamat + peta + akses tamu. Urutan page: ... Buku Tamu → **Lokasi** → Penutup.
- Layout: `section#lokasi px-5 py-14` → `Reveal max-w-[30rem]` center. Judul `font-display text-2xl text-ink "Lokasi Akad & Resepsi"`, subtitle `text-sm text-ink-soft "Kedua acara satu kawasan — parkir & wudhu tersedia."`.
- Kartu lokasi (2 stack gap 16px, desktop tetap stack — peta butuh lebar penuh):
  - Header: eyebrow jenis + `Chip sage "08.00 WIB" / "11.00–14.00"` di kanan.
  - Peta: wrapper `rounded-xl overflow-hidden border border-line shadow-sm aspect-[16/10] sm:aspect-[16/9] relative` — embed Google Maps iframe `loading lazy referrerPolicy no-referrer-when-downgrade`, fallback link "Buka di Google Maps" jika maps kosong. Overlay gold ring `inset-2 border border-gold-hi/50 rounded-lg pointer-events-none`.
  - Alamat baris: `Pin 16 accent-deep + tempat 14 600 + alamat 13 ink-soft`.
  - Aksi: `TombolAnchor ghost md w-full "Petunjuk Arah" (Pin) + TombolAnchor quiet md w-full "Simpan Kalender"` — samakan gaya kartu-acara.
  - Catatan akses: list 2 baris `text-caption 12px text-ink-soft` — "Parkir motor/mobil di sisi timur" + "Tempat wudhu lantai 1 — mohon jaga kekhusyukan" (nuansa Islami tanpa ikon berlebihan).
- Divider bawah sebelum Penutup: `OrnateDivider md 140px` + doa kecil `font-display italic text-sm text-accent-deep "Barakallahu lakuma" 12px tracking wide` center.

## 13. Penutup (`penutup.tsx`)
- Kelopak 6 penutup, `Ornamen3D` di atas.
- Kutipan ayat QS Ar-Rum 21: `blockquote font-display italic text-base sm:text-lg text-ink-soft leading-7 max-w-prose mx-auto` — jangan uppercase.
- Nama pasangan `gold-shimmer font-display text-2xl sm:text-3xl text-ink mt-8`, tanggal `font-display text-sm text-ink-soft tabular-nums`.
- Tombol share: `secondary lg w-full max-w-[28rem] bg-sage-700 text-white rounded-pill min-h-13` ikon WhatsApp 20px.
- Footer note `text-caption 11px text-ink-soft mt-6 "Sampai jumpa — mohon doa restu."`.

## 14. Ornamen & Dekorasi — Treatment Mewah Hemat
- CornerFlourish: SVG 28–34px currentColor, drop-shadow 0 1 2 rgba(95,73,21,.25). Posisi `tl -8 -8 / tr scaleX -1` dsb. Di kartu kecil pakai 30px.
- OrnateDivider: 2 lapis — belakang bronze blur 0.6px translateY 2px opacity .45 + depan accent solid. Size sm/md/lg 100/140/180.
- TapeStrip: `w-14 h-5 rounded 1px` gradient gold-hi→accent-lite dashed border — hanya galeri polaroid.
- Bingkai foto: jangan stretch. Selalu `object-cover object-center fill + clip-path/border-radius`. Shape: deco-barok `inset 0 round 24`, arch `50% 50% 16 16 / 34% 34% 16 16`, polaroid `inset 0 + 4px`.
- Garis emas double: `border gold-hi + outline bronze offset 4px + inner 1px accent-line inset 3px`.

## 15. Animasi — Keyframes, Durasi, Easing
- `reveal/rise-3d`: `opacity 0→1 + rotateX 7°→0 translateY 20→0` dur `reveal 600ms ease-soft-out`. IO threshold 0.15 rootMargin -8% bottom.
- `float-soft`: `translateY 0→6→0` dur `float 6s ease-float infinite` — hanya foto mempelai.
- `gold-shimmer`: `background-position 0→120% opacity .45→.6` dur `shimmer 3.2s ease-inout infinite` — teks nama + divider bar.
- `petal-fall`: `translate 0 -10vh → drift 110vh rotate 0→720deg opacity 1→.2` dur `petal 12s linear infinite` — drift var `--petal-drift`.
- `flip-num`: `rotateX 0→-90→0` dur `flip 600ms ease-soft-out` — hanya angka berubah.
- `stagger-pop`: `scale .92 translateY 10 → 1 0 opacity 0→1` dur `300ms ease-soft-out` delay `i*70ms` — buku tamu, galeri.
- `zoom-3d`: `scale .86 translateZ -80 rotateX 3 → 1 0 0` dur `zoom3d 320ms` — lightbox masuk.
- `curtain-up/down`: `translateY 0→±100% translateZ 0→40` dur `curtain 900ms ease-curtain` — cover buka.
- `fabIn`: `scale .8→1 opacity 0→1` dur `base 220ms` — FAB musik.
- `shimmer skeleton`: `opacity .45→.9` dur `1.4s ease-inout infinite` — buku tamu loading.
- Semua durasi pakai var `--dur-*` dan `--ease-*` dari globals.css.

## 16. Reduced Motion & A11y
- `@media (prefers-reduced-motion: reduce)`: matikan semua `animation-duration 0.01ms iter 1`, `transition 0.01ms`, `scroll-behavior auto`, `perspective none`, `transform-style flat`. Sembunyikan `petal`, `float-soft`, `gold-shimmer`, `flourish`, `tape`, `ring`. Reveal langsung `opacity 1 transform none`.
- `html[data-paused="1"]` → `animation-play-state paused` untuk petal/float/shimmer/skeleton saat tab hidden.
- Fokus: `*:focus-visible outline 2px solid focus #7E611F offset 2px`. Skip link `#salam` sr-only → focus visible.
- Lightbox: `role dialog aria-modal true`, trap Tab, ESC tutup, background inert.
- Kontras: ink #2E1F14 di bg #FBF7F0 = 15:1 OK. Accent-deep #7E611F di surface = 7:1 OK. Jangan pakai accent-lite #D9BE78 untuk teks body (hanya dekorasi/button bg).

## 17. Catatan Implementasi Raka (tanpa tanya)
- Urutan section final: Cover → Salam → Mempelai → Countdown → RangkaianAcara → Galeri → LoveStory → RSVP → Amplop → BukuTamu → **Lokasi** → Penutup.
- Lokasi pakai data `undangan.json acara[]` yang sama — jangan duplikat alamat. Jika `maps` kosong → sembunyikan iframe, tampilkan fallback link + catatan.
- Iframe maps: `src maps + "&output=embed"` atau embed URL, `title "Peta {tempat}"`, `allow fullscreen`, `loading lazy`.
- Semua img Next `next/image` dengan `sizes` sesuai spec, `fill + object-cover`. Remote image dilarang (static export).
- Jangan tambah dependency baru. Satu file baru `src/components/lokasi.tsx` + 1 import di `page.tsx`.
- Verifikasi: `npm run build` harus static export `out/` tanpa error.

