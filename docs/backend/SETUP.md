# Setup Backend RSVP — Google Apps Script + Sheets

Langkah untuk mempelai / siapa pun tanpa latar belakang teknis.
Ikuti urutannya, ± 15 menit.

**Endpoint yang dihasilkan:**
- `POST <URL_EXEC>` — simpan RSVP (JSON `{nama, hadir, jumlah, ucapan, website}`)
- `GET <URL_EXEC>` — daftar ucapan buku tamu (JSON, maks 200 terbaru)
- `GET <URL_EXEC>?callback=namaFn` — versi JSONP (tanpa CORS)

---

## 1. Buat Google Sheet

1. Buka https://sheets.google.com → **Blank** spreadsheet baru.
2. Rename file: `RSVP — Raka & Gina`.
3. Rename tab pertama (`Sheet1`) jadi tepat `RSVP`:
   klik kanan tab → Rename → ketik `RSVP` → Enter.
4. Di sel A1:F1 isi header (boleh dikosongkan — script akan bikin sendiri
   saat pertama jalan, tapi lebih aman isi manual):

   | A | B | C | D | E | F |
   |---|---|---|---|---|---|
   | timestamp | nama | hadir | jumlah | ucapan | userAgent |

## 2. Buka Apps Script

1. Dari spreadsheet: menu **Extensions → Apps Script**.
2. Editor terbuka dengan file `Code.gs` berisi kode contoh.
3. **Hapus semua isi** `Code.gs`.
4. Buka file `docs/backend/apps-script-rsvp.gs` di project ini, salin
   **semua** isinya, paste ke `Code.gs`.
5. Simpan: ikon 💾 atau Ctrl+S. Beri nama project: `RSVP Raka & Gina`.

> Catatan: file `.gs` dan `Code.gs` sama saja — Apps Script cuma butuh
> isinya.

## 3. Deploy sebagai Web App

1. Di editor Apps Script klik **Deploy → New deployment**.
2. Klik ikon ⚙️ (roda gigi) → pilih tipe **Web app**.
3. Isi:
   - **Description:** `RSVP v1`
   - **Execute as:** **Me** (email pemilik akun Google kamu)
   - **Who has access:** **Anyone**
4. Klik **Deploy** → muncul dialog **Authorize access**:
   - Pilih akun Google kamu.
   - Kalau muncul "Google hasn't verified this app" → klik
     **Advanced → Go to RSVP Raka & Gina (unsafe)**. Ini normal untuk
     script buatan sendiri, bukan app publik.
   - Beri izin: **Allow** (akses Spreadsheet + jalankan sebagai kamu).
5. Setelah selesai, muncul **Web app URL**:

   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

   **Salin URL ini** — itu `NEXT_PUBLIC_RSVP_URL`.
   Jangan tutup dialog sebelum disalin (bisa dilihat lagi via
   Deploy → Manage deployments).

### Migrasi kalau nanti kode diubah

Buka **Deploy → Manage deployments** → ikon ✏️ → **Version: New version**
(wajib ganti, kalau tetap "Existing" URL tidak berubah dan kode lama yang
jalan) → Deploy.

## 4. Isi `.env.local`

Di root project Next.js, buat/buka `.env.local`:

```
NEXT_PUBLIC_RSVP_URL=https://script.google.com/macros/s/AKfycb.../exec
```

(Full file contoh: `.env.example` di root project.)
Karena pakai prefix `NEXT_PUBLIC_`, nilai ini ter-bake ke bundle statis
saat `next build` — sesuai desain static export.

## 5. Test pakai curl

### POST RSVP

```bash
export NEXT_PUBLIC_RSVP_URL='https://script.google.com/macros/s/AKfycb.../exec'

curl -X POST "$NEXT_PUBLIC_RSVP_URL" \
  -H 'Content-Type: text/plain;charset=utf-8' \
  -d '{"nama":"Andi","hadir":true,"jumlah":2,"ucapan":"Selamat menikah!","website":""}'
```

Balasan sukses:

```json
{"ok":true}
```

Cek sheet: baris baru muncul dengan timestamp.

Contoh gagal validasi:

```bash
curl -X POST "$NEXT_PUBLIC_RSVP_URL" \
  -H 'Content-Type: text/plain;charset=utf-8' \
  -d '{"nama":"A","hadir":true,"jumlah":2,"ucapan":"","website":""}'
```

```json
{"ok":false,"error":"Nama harus 2-80 karakter."}
```

> Kenapa `Content-Type: text/plain` untuk JSON? Trik no-CORS: browser
> tidak kirim preflight OPTIONS ke Apps Script yang tidak bisa menjawab
> preflight. Apps Script tetap menerima JSON-nya. Jangan ganti jadi
> `application/json` — fetch dari browser akan gagal CORS.

### GET Buku Tamu

```bash
curl "$NEXT_PUBLIC_RSVP_URL"
```

```json
{"ok":true,"count":1,"data":[{"timestamp":"2026-10-12T16:30:00.000Z","nama":"Andi","hadir":true,"jumlah":2,"ucapan":"Selamat menikah!"}]}
```

### GET JSONP (opsional, untuk browser yang blokir baca response)

```bash
curl "$NEXT_PUBLIC_RSVP_URL?callback=tampilkanUcapan"
```

```
tampilkanUcapan({"ok":true,"count":1,"data":[...]})
```

## Catatan

- Apps Script **selalu** membalas HTTP 200 — frontend wajib baca field
  `ok`, jangan cek `res.status`.
- Ucapan kosong tetap tersimpan di sheet (data RSVP), tapi tidak tampil
  di buku tamu (hanya baris ber-`ucapan` yang dibalikkan GET).
- Rate limit: nama sama di-reject kalau < 5 detik sejak submit terakhir
  (anti double-tap). Honeypot field `website` — manusia tidak pernah
  isi, bot yang isi datanya dibuang diam-diam.
