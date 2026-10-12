# Arsitektur Backend RSVP + Buku Tamu

Proyek: Undangan Raka & Gina · Versi: v1 (MVP) · Sumber: PRD §7, §11.

## Alur Data

```
┌─────────────────────────┐
│  Browser tamu (static)  │   Next.js 16 static export
│  HP via WhatsApp link    │   React 19 + Tailwind 4
│                         │
│  Form RSVP ──POST───────┼──► text/plain trick (no preflight)
│  Buku Tamu ──GET───────┼──► JSON / JSONP
└───────────┬─────────────┘
            │
            │  fetch ke NEXT_PUBLIC_RSVP_URL
            ▼
┌─────────────────────────┐
│  Google Apps Script      │   Web App /exec
│  doPost(e) ──validasi──   │   - validasi server-side
│  doGet(e)  ──daftar──     │   - sanitasi spreadsheet-injection
│  LockService + rate limit │   - rate-limit 5 dtk / nama sama
└───────────┬─────────────┘
            │  appendRow() / getValues()
            ▼
┌─────────────────────────┐
│  Google Sheet "RSVP"     │   kolom: timestamp | nama | hadir |
│  (sumber kebenaran)      │          jumlah | ucapan | userAgent
└─────────────────────────┘
            │
            ▼
   balik: JSON { ok, count, data:[...] }
   → buku tamu render ucapan terbaru (maks 200)
```

## Kenapa Tanpa Server Node?

PRD §7: *"RSVP: MVP Google Sheets via Apps Script (tanpa backend)."*
PRD §11: admin dashboard out of scope — cukup edit file JSON.

Alasan:
- **Nol biaya & nol maintenance.** Tidak ada server yang bisa mati, tidak perlu deploy, tidak perlu CI/CD untuk backend.
- **Data langsung terlihat di Google Sheet.** Mempelai (non-teknis) buka sheet, lihat daftar RSVP tanpa dashboard.
- **Static export tetap mungkin.** Next.js `output: export` tidak punya Node runtime — semua request RSVP diarahkan ke Apps Script, bukan ke API route.
- **Cocok skala undangan.** ~100–500 tamu, trafik tumpah hanya di hari-H. Apps Script sanggup.

## Batasan (baca sebelum menyesal)

| Batasan | Angka / realita | Dampak |
|---|---|---|
| Quota Apps Script | ~30 req/hari akun gratis; script.google.com consumer ~20k/hari | Aman untuk ratusan tamu; jebol kalau viral |
| Latency | 200–800 ms per request (cold start lebih lama) | Form RSVP terasa sedikit lambat, bukan masalah |
| CORS | Apps Script tidak bisa set header custom; selalu HTTP 200 | Client wajib cek field `ok`, bukan `res.status` |
| Ukuran sheet | Google Sheet ~10 juta sel | Jutaan RSVP tidak realistis; ratusan aman |
| Race condition | Ditangani `LockService.getScriptLock()` | Tulis paralel aman |
| Konkurensi baca | `getValues()` baca 200 baris sekali jalan | Cukup untuk buku tamu |

## Kapan Upgrade ke Backend Sendiri

Upgrade kalau salah satu ini terjadi:
- Trafik > ~100 req/jam berkelanjutan (event type, bukan undangan).
- Butuh autentikasi admin, moderasi ucapan, atau hapus/approve.
- Butuh fitur realtime (ucapan muncul live tanpa refresh).
- Butuh data analitik / ekspor otomatis / integrasi WhatsApp API.
- Butuh SLA di atas apa yang Google kasih gratis.

Upgrade path paling mulus: Cloudflare Workers + D1 (gratis, dekat dengan static site Cloudflare Pages), atau Supabase (Postgres + REST gratis). Kontrak API (JSON `{ ok, count, data }`) tetap sama — ganti hanya URL di `NEXT_PUBLIC_RSVP_URL`, frontend tidak berubah.

## Kontrak API

### `POST /exec`
- Content-Type: `text/plain;charset=utf-8`, body JSON `{ nama, hadir, jumlah, ucapan, website }`.
- `website` = honeypot (kosong untuk manusia; bot yang isi → dianggap sukses tapi tidak disimpan).
- Sukses: `{"ok":true}` · Gagal: `{"ok":false,"error":"..."}`.
- HTTP selalu 200 → client cek `ok`.

### `GET /exec` (opsional `?callback=fn`)
- Sukses: `{"ok":true,"count":N,"data":[{"timestamp","nama","hadir","jumlah","ucapan"}]}` — terbaru di atas, maks 200.
- Dengan `?callback=fn` → `fn({...})` (JSONP, bebas CORS).
