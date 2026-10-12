/**
 * Undangan Raka & Gina — RSVP + Buku Tamu
 * Backend: Google Apps Script (tanpa server Node, sesuai PRD §7 / §11).
 *
 * === PENTING: cara kerja CORS di Apps Script ===
 * Apps Script TIDAK bisa set header response custom (Access-Control-Allow-*)
 * dan selalu balik HTTP 200 — status error dikomunikasikan lewat field `ok`.
 *
 * Pola yang REAL dan sudah terbukti untuk static site:
 *
 * 1. POST (doPost) — kirim dari browser:
 *    Pakai Content-Type "text/plain;charset=utf-8" di fetch (SIMPAN JSON sebagai
 *    body). Header text/plain termasuk "simple request" → browser TIDAK kirim
 *    preflight OPTIONS, dan Apps Script tetap menerima JSON-nya di
 *    e.postData.contents. Inilah "text-plain trick" yang dipakai hampir semua
 *    form Google Forms klon.
 *
 *    Alternatif: fetch(..., { mode: 'no-cors' }) → response opaque, TIDAK bisa
 *    dibaca, tapi request tetap terkirim (fire-and-forget). Pakai ini kalau
 *    respons diblokir CORS — layak untuk RSVP karena client hanya perlu tahu
 *    "terkirim", bukan membaca body.
 *
 * 2. GET (doGet) — ambil daftar ucapan Buku Tamu:
 *    Bisa fetch JSON biasa; kalau browser memblokir baca response, gunakan
 *    JSONP: panggil URL /exec?callback=fnNama → response JavaScript yang
 *    mengeksekusi fnNama({ ... }) — JSONP tidak kena CORS sama sekali.
 *
 * Contoh fetch yang benar (frontend Raka):
 *
 *   // POST RSVP — text-plain trick (tanpa preflight)
 *   await fetch(NEXT_PUBLIC_RSVP_URL, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'text/plain;charset=utf-8' },
 *     body: JSON.stringify({ nama, hadir, jumlah, ucapan, website: '' })
 *   });
 *
 *   // GET Buku Tamu
 *   const res = await fetch(NEXT_PUBLIC_RSVP_URL); // atau JSONP ?callback=...
 *   const json = await res.json(); // { ok, count, data: [...] }
 */

// --- Konstanta ---
var SHEET_NAME = 'RSVP';
var HEADER = ['timestamp', 'nama', 'hadir', 'jumlah', 'ucapan', 'userAgent'];
var MAX_LIST = 200;          // maks ucapan yang dibalikin doGet
var RATE_LIMIT_MS = 5000;    // tolak nama sama yang submit < 5 detik
var ROWS_TO_CHECK = 50;      // cek rate-limit pada N baris terakhir
var LOCK_WAIT_MS = 5000;     // tunggu lock maksimal 5 detik

function doPost(e) {
  return json_(handlePost_(e));
}

function doGet(e) {
  var params = (e && e.parameter) || {};
  var payload = JSON.stringify({
    ok: true,
    count: 0, // diisi di listUcapan_
    data: []
  });
  var data = listUcapan_();
  payload = JSON.stringify({ ok: true, count: data.length, data: data });

  // JSONP fallback untuk baca buku tamu tanpa CORS
  var cb = params.callback ? String(params.callback).replace(/[^A-Za-z0-9_$.]/g, '') : '';
  if (cb) {
    return ContentService
      .createTextOutput(cb + '(' + payload + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(payload, true);
}

function handlePost_(e) {
  // Parse body (bisa JSON murni via text-plain trick)
  var body;
  try {
    var raw = (e && e.postData && e.postData.contents) || '';
    body = JSON.parse(raw);
  } catch (err) {
    return { ok: false, error: 'Body bukan JSON valid.' };
  }
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Body kosong.' };
  }

  // Honeypot anti-spam: field tersembunyi yang tidak diisi manusia.
  // Bot yang isi → pura-pura sukses, data tidak disimpan (bot tidak sadar).
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return { ok: true, silent: true };
  }

  var v = validate_(body);
  if (!v.ok) return v;
  var data = v.data;

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(LOCK_WAIT_MS)) {
    return { ok: false, error: 'Server sibuk, coba lagi sebentar.' };
  }
  try {
    var sheet = getSheet_();
    if (rateLimited_(sheet, data.nama)) {
      return { ok: false, error: 'Terlalu cepat — tunggu beberapa detik lalu kirim ulang.' };
    }
    sheet.appendRow([
      new Date(),
      sheetSafe_(data.nama),
      data.hadir,
      data.jumlah,          // 0 kalau tidak hadir
      sheetSafe_(data.ucapan),
      sheetSafe_(data.userAgent)
    ]);
    PropertiesService.getScriptProperties().setProperty('lastPostTs', String(Date.now()));
  } finally {
    lock.releaseLock();
  }
  return { ok: true };
}

// --- Validasi server-side (jangan percaya data client) ---
function validate_(b) {
  var nama = clean_(typeof b.nama === 'string' ? b.nama : '');
  var ucapan = clean_(typeof b.ucapan === 'string' ? b.ucapan : '');

  if (nama.length < 2 || nama.length > 80) {
    return { ok: false, error: 'Nama harus 2-80 karakter.' };
  }
  if (typeof b.hadir !== 'boolean') {
    return { ok: false, error: 'Field hadir harus true/false.' };
  }
  var jumlah = 0;
  if (b.hadir) {
    if (typeof b.jumlah !== 'number' || !Number.isInteger(b.jumlah) || b.jumlah < 1 || b.jumlah > 5) {
      return { ok: false, error: 'Jumlah tamu harus bilangan bulat 1-5.' };
    }
    jumlah = b.jumlah;
  }
  if (ucapan.length > 280) {
    return { ok: false, error: 'Ucapan maksimal 280 karakter.' };
  }
  var ua = clean_(typeof b.userAgent === 'string' ? b.userAgent : '').slice(0, 200);

  return { ok: true, data: { nama: nama, hadir: b.hadir, jumlah: jumlah, ucapan: ucapan, userAgent: ua } };
}

// --- Sanitasi ---
// Buang control chars (kecuali \n \t), normalisasi CRLF, trim.
function clean_(s) {
  return String(s)
    .replace(/\r\n?/g, '\n')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

// Anti spreadsheet injection: sel yang diawali = + - @ dievaluasi Sheets
// sebagai formula. Awali apostrof supaya jadi teks biasa.
function sheetSafe_(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

// --- Rate limit: tolak nama sama < 5 detik sejak submit terakhir ---
function rateLimited_(sheet, nama) {
  // Global throttle: tolak jika 1 detik terakhir ada submit apa pun (global spam)
  var globalLast = PropertiesService.getScriptProperties().getProperty('lastPostTs');
  if (globalLast) {
    var gap = Date.now() - parseInt(globalLast, 10);
    if (gap >= 0 && gap < 1000) {
      return true;
    }
  }
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var start = Math.max(2, last - ROWS_TO_CHECK + 1);
  var vals = sheet.getRange(start, 1, last - start + 1, HEADER.length).getValues();
  var now = Date.now();
  for (var i = 0; i < vals.length; i++) {
    var ts = vals[i][0];
    if (vals[i][1] === nama && ts instanceof Date && now - ts.getTime() < RATE_LIMIT_MS) {
      return true;
    }
  }
  // Sukses: update global throttle tail on success happens in handlePost_ after lock
  return false;
}

// --- Sheet helper ---
function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, HEADER.length).setValues([HEADER]);
    sh.setFrozenRows(1);
  }
  return sh;
}

// --- Buku Tamu: 200 ucapan terbaru, terbaru di atas ---
function listUcapan_() {
  var sh = getSheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var vals = sh.getRange(2, 1, last - 1, HEADER.length).getValues();
  var items = [];
  for (var i = 0; i < vals.length; i++) {
    var ucapan = vals[i][4];
    if (!ucapan) continue; // RSVP tanpa ucapan tidak tampil di buku tamu
    var ts = vals[i][0];
    items.push({
      timestamp: ts instanceof Date ? ts.toISOString() : String(ts || ''),
      nama: String(vals[i][1] || ''),
      hadir: vals[i][2] === true,
      jumlah: vals[i][3] || 0,
      ucapan: String(ucapan)
    });
  }
  items.sort(function (a, b) {
    return a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0;
  });
  return items.slice(0, MAX_LIST);
}

// --- Response helper ---
// Apps Script TIDAK bisa set status HTTP — selalu 200. Client wajib cek `ok`.
function json_(payload, raw) {
  var text = raw === true ? payload : JSON.stringify(payload);
  return ContentService
    .createTextOutput(text)
    .setMimeType(ContentService.MimeType.JSON);
}
