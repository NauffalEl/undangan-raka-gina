# Security Audit — Undangan Raka & Gina

**Auditor:** Gilang (Security Reviewer)  
**Date:** 2026-10-12  
**Scope:** Frontend (Next.js 16 static export) + Backend (Google Apps Script RSVP)  
**Verdict:** SELESAI — semua temuan sudah diperbaiki (fix applied 2026-10-12)

**Catatan:**
- [TINGGI] CSP/security headers → SUDAH DITAMBAH (via `headers()` di `next.config.ts`, plus inline script yang aman di layout.tsx)
- [TINGGI] RSVP fetch broken → SUDAH DIFIX (Content-Type text/plain;charset=utf-8 + honeypot website)
- [SEDANG] Rate limit lemah → SUDAH DIPERBAIKI (global throttle 1 detik via PropertiesService + per nama 5 detik)
- [SEDANG] CSRF protection → OPSIONAL (form publik tanpa auth, dokumentasi di README-ARSITEKTUR.md)
- [RENDAH] ENDPOINT_UCAPAN dead code → SUDAH DIFIX (buku-tamu.tsx fetch dari backend)
- [RENDAH] userAgent missing → SUDAH DIFIX (navigator.userAgent dikirim di body fetch)
- [RENDAH] window.open noopener → SUDAH DIFIX (noopener,noreferrer)

---

## Temuan

### [TINGGI] Tidak ada Content-Security-Policy atau security headers

- **Lokasi:** `next.config.ts:1-16`, `src/app/layout.tsx:52-71`
- **Masalah:** `next.config.ts` tidak mendefinisikan fungsi `headers()`. Tidak ada CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, atau Permissions-Policy. Tidak ada meta tag CSP di layout. Jika XSS diperkenalkan di masa depan (mis. library pihak ketiga, perubahan render), tidak ada defense-in-depth.
- **Saran perbaikan:** Tambahkan `headers()` di `next.config.ts`:
  ```ts
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  }
  ```
  Catatan: `script-src 'unsafe-inline'` diperlukan karena `layout.tsx:61` memakai `dangerouslySetInnerHTML` untuk inline script. Idealnya refactor ke external file untuk menghindari `'unsafe-inline'`.

---

### [TINGGI] RSVP fetch ke Apps Script rusak — Content-Type tidak kompatibel dengan no-cors

- **Lokasi:** `src/components/rsvp.tsx:27-37`
- **Masalah:** Fetch menggunakan `mode: "no-cors"` dengan header `Content-Type: application/json`. `application/json` bukan CORS-safelisted Content-Type — browser modern akan throw error dan request tidak terkirim. Akibatnya RSVP gagal saat `ENDPOINT_RSVP` terisi. File Apps Script sendiri (`docs/backend/apps-script-rsvp.gs:30-35`) mendokumentasikan pendekatan yang benar: `Content-Type: text/plain;charset=utf-8`.
- **Saran perbaikan:** Ganti header fetch:
  ```ts
  await fetch(ENDPOINT_RSVP, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ nama: nama.trim(), hadir, jumlah: hadir ? jumlah : 0, pesan: ucapan.trim(), website: "" }),
  });
  ```
  Tambahkan field `website: ""` (honeypot) agar anti-spam di backend aktif.

---

### [SEDANG] Rate limit lemah — hanya per nama, 5 detik

- **Lokasi:** `docs/backend/apps-script-rsvp.gs:46-47, 163-176`
- **Masalah:** Rate limit hanya menolak nama yang sama dalam 5 detik terakhir. Attacker bisa submit ratusan nama berbeda tanpa batas. Tidak ada rate limit global atau per-IP. Apps Script punya keterbatasan untuk dapatkan IP, tapi bisa pakai `Session.getActiveUser().getEmail()` (jika di-deploy restricted) atau kombinasi timestamp + lock.
- **Saran perbaikan:** Tambahkan rate limit global sederhana — simpan timestamp terakhir di `PropertiesService` dan tolak jika < 1 detik sejak submit terakhir (global, bukan per nama). Atau naikkan `RATE_LIMIT_MS` ke 10-15 detik dan tambahkan validasi minimal interval global.

---

### [SEDANG] Tidak ada CSRF protection

- **Lokasi:** `docs/backend/apps-script-rsvp.gs:50-52` (doPost)
- **Masalah:** Tidak ada CSRF token atau Origin/Referer check. Risiko rendah karena tidak ada authenticated state (form publik), tapi jika Apps Script di-deploy dengan akses restricted, bisa jadi vector.
- **Saran perbaikan:** Jika ingin defense-in-depth, tambahkan header `X-Requested-With` check atau verifikasi `e.parameter` token sederhana. Untuk form publik tanpa auth, ini opsional — tapi dokumentasikan keputusan ini.

---

### [RENDAH] `ENDPOINT_UCAPAN` didefinisikan tapi tidak pernah dipakai

- **Lokasi:** `src/lib/utils.ts:154`, `src/components/buku-tamu.tsx:11-13`
- **Masalah:** `ENDPOINT_UCAPAN` diekspor tapi tidak ada komponen yang fetch dari endpoint ini. Buku tamu hanya baca `localStorage`, tidak pernah ambil data dari Apps Script `doGet`. Backend endpoint `doGet` ada tapi dead code dari sisi frontend. Data RSVP yang disimpan di Sheet tidak pernah tampil di buku tamu (kecuali user buka tab lain yang pernah submit di browser yang sama).
- **Saran perbaikan:** Implementasi fetch buku tamu dari `ENDPOINT_UCAPAN` (atau `ENDPOINT_RSVP` dengan `doGet`), atau hapus `ENDPOINT_UCAPAN` jika tidak dipakai. Jika buku tamu memang hanya localStorage, dokumentasikan sebagai known limitation.

---

### [RENDAH] Field `userAgent` tidak pernah dikirim frontend

- **Lokasi:** `src/components/rsvp.tsx:31-36` vs `docs/backend/apps-script-rsvp.gs:141`
- **Masalah:** Backend mengharapkan `body.userAgent` untuk disimpan di Sheet, tapi frontend tidak mengirim field ini. Selalu kosong. Minor data quality issue.
- **Saran perbaikan:** Tambahkan `userAgent: navigator.userAgent` di body fetch, atau hapus dari backend jika tidak dipakai.

---

### [RENDAH] `window.open` tanpa `noopener noreferrer`

- **Lokasi:** `src/components/penutup.tsx:12, 15`
- **Masalah:** `window.open(waUrl, "_blank")` tanpa `noopener noreferrer`. Risiko rendah karena `waUrl` adalah URL statis `https://wa.me/` (bukan user input), tapi best practice adalah selalu tambahkan `noopener`.
- **Saran perbaikan:** Ganti ke `window.open(waUrl, "_blank", "noopener,noreferrer")` atau gunakan `<a target="_blank" rel="noopener noreferrer">`.

---

## Area Aman (Tidak Ada Temuan)

### XSS — Buku Tamu render user input
- **Lokasi:** `src/components/buku-tamu.tsx:57-87`
- **Status:** AMAN. Semua user input (`item.nama`, `item.pesan`, `item.jumlah`) dirender via JSX `{...}` — React auto-escape. Tidak ada `dangerouslySetInnerHTML` dengan user data. Satu-satunya `dangerouslySetInnerHTML` di `layout.tsx:61` adalah hardcoded string `"document.documentElement.classList.add('js')"` — bukan user input.

### Clipboard API
- **Lokasi:** `src/lib/utils.ts:107-131`
- **Status:** AMAN. Mengecek `window.isSecureContext` sebelum pakai Clipboard API. Fallback pakai `textarea.value = teks` (bukan `innerHTML`). Element dibersihkan setelah pakai.

### URL Encoding — Google Calendar & Maps
- **Lokasi:** `src/lib/utils.ts:77-89`, `src/components/penutup.tsx:9`, `src/components/kartu-acara.tsx:41,56`
- **Status:** AMAN. `tautanKalender` pakai `URLSearchParams` (auto-encode). WhatsApp share pakai `encodeURIComponent`. Maps URL datang dari static `undangan.json`, bukan user input.

### OG Meta
- **Lokasi:** `src/app/layout.tsx:20-44`
- **Status:** AMAN. Hanya info publik (nama pasangan, tanggal, deskripsi generik). Tidak ada data sensitif (no alamat lengkap, no no HP, no rekening).

### .env Hygiene
- **Lokasi:** `.env.example`, `.gitignore`, `src/lib/utils.ts:153-154`
- **Status:** AMAN. `.env.example` hanya berisi `NEXT_PUBLIC_RSVP_URL` (bukan secret). `.gitignore` benar mengecualikan `.env*` dengan exception `!.env.example`. `NEXT_PUBLIC_*` vars adalah public by design (di-bundle ke client). Tidak ada hardcoded secret di source code.

### Spreadsheet Formula Injection
- **Lokasi:** `docs/backend/apps-script-rsvp.gs:158-160`
- **Status:** AMAN. Fungsi `sheetSafe_` mencegah formula injection dengan prefix apostrof untuk string yang diawali `= + - @`.

### JSONP Callback Sanitization
- **Lokasi:** `docs/backend/apps-script-rsvp.gs:65`
- **Status:** AMAN. Callback parameter di-sanitasi dengan regex `replace(/[^A-Za-z0-9_$.]/g, '')` sebelum di-output.

### Server-side Validation
- **Lokasi:** `docs/backend/apps-script-rsvp.gs:121-144`
- **Status:** AMAN. Validasi independen di server: nama 2-80 char, hadir boolean, jumlah integer 1-5, ucapan max 280 char. Tidak percaya client.

---

## Ringkasan

| Severity | Jumlah | Item |
|----------|--------|------|
| TINGGI | 2 | No CSP header, RSVP fetch broken |
| SEDANG | 2 | Rate limit lemah, no CSRF protection |
| RENDAH | 3 | ENDPOINT_UCAPAN unused, userAgent missing, window.open no noopener |
| AMAN | 8 | XSS, clipboard, URL encoding, OG meta, .env, spreadsheet injection, JSONP, server validation |

**Prioritas fix:**
1. Ganti `Content-Type` di fetch RSVP ke `text/plain;charset=utf-8` (fix bug + aktifkan honeypot)
2. Tambahkan security headers di `next.config.ts` (CSP minimal)
3. Naikkan rate limit global di Apps Script
