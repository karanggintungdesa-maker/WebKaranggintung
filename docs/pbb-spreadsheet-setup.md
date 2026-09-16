# Panduan Integrasi Google Spreadsheet PBB-P2 Desa Karanggintung

Dokumen ini berisi kode **Google Apps Script** dan langkah-langkah untuk menghubungkan data PBB-P2 dari sheet **`BNBA PBB 26`** ke website resmi Desa Karanggintung.

Berdasarkan struktur lembar kerja Anda:
- **Baris 5:** Judul Kolom (`NO URUT DHKP`, `NAMA PEMILIK TANAH`, `ALAMAT PEMILIK TANAH`, `NOP`, `TAHUN`, `NAMA WP`, `ALAMAT OBJEK`, dst.)
- **Baris 6 ke bawah:** Data Wajib Pajak & SPPT PBB-P2.

---

## 1. Salin Kode Google Apps Script

Buka file Google Spreadsheet PBB Anda, lalu klik menu **Ekstensi (Extensions)** > **Apps Script**. Hapus seluruh kode yang ada di editor, lalu ganti dengan kode di bawah ini:

```javascript
/**
 * API Pencarian PBB-P2 Desa Karanggintung
 * Sheet: "BNBA PBB 26"
 * Header: Baris 5 | Mulai Data: Baris 6
 */

function doGet(e) {
  try {
    var params = e ? e.parameter : {};
    var nopQuery = params.nop || '';

    var output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    if (!nopQuery) {
      return output.setContent(JSON.stringify({
        status: 'error',
        message: 'Parameter NOP diperlukan. Contoh: ?nop=3301...'
      }));
    }

    // Normalisasi NOP: hapus titik, strip, spasi
    function cleanNop(val) {
      if (!val) return '';
      return String(val).replace(/[^0-9a-zA-Z]/g, '').trim().toUpperCase();
    }

    var cleanTarget = cleanNop(nopQuery);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Cari sheet target
    var sheet = ss.getSheetByName('BNBA PBB 26');
    if (!sheet) {
      var allSheets = ss.getSheets();
      for (var s = 0; s < allSheets.length; s++) {
        if (allSheets[s].getName().indexOf('BNBA') !== -1) {
          sheet = allSheets[s];
          break;
        }
      }
      if (!sheet) sheet = allSheets[0];
    }

    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    if (lastRow < 6) {
      return output.setContent(JSON.stringify({
        status: 'not_found',
        message: 'Belum ada baris data pada spreadsheet (data dimulai baris 6).'
      }));
    }

    // Baca Header pada Baris 5
    var headers = sheet.getRange(5, 1, 1, lastCol).getValues()[0];

    // Pemetaan indeks kolom otomatis berdasarkan teks header
    var colMap = {
      noUrut: 0,
      namaPemilikTanah: 1,
      alamatPemilikTanah: 2,
      nop: 3, // Kolom D
      tahun: 4, // Kolom E
      namaWp: 5, // Kolom F
      alamatObjek: 6, // Kolom G
      alamatWp: 7, // Kolom H
      luasBumi: 8, // Kolom I
      luasBangunan: 9, // Kolom J
      njopBumi: 10, // Kolom K
      njopBangunan: 11, // Kolom L
      njopSppt: 12, // Kolom M
      pbbYangDibayar: 13, // Kolom N
      denda: 14, // Kolom O
      keterangan: 15, // Kolom P
      petugasPemungut: 16, // Kolom Q
      tanggalBayar: 17, // Kolom R
      tunggakanTahunLalu: 18 // Kolom S
    };

    for (var h = 0; h < headers.length; h++) {
      var hText = String(headers[h]).toUpperCase().trim();
      if (hText === 'NOP' || (hText.indexOf('NOP') !== -1 && hText.indexOf('NJOP') === -1)) colMap.nop = h;
      else if (hText.indexOf('NO URUT') !== -1 || hText.indexOf('DHKP') !== -1) colMap.noUrut = h;
      else if (hText.indexOf('PEMILIK TANAH') !== -1 && hText.indexOf('ALAMAT') === -1) colMap.namaPemilikTanah = h;
      else if (hText.indexOf('ALAMAT PEMILIK') !== -1) colMap.alamatPemilikTanah = h;
      else if (hText === 'TAHUN') colMap.tahun = h;
      else if (hText.indexOf('NAMA WP') !== -1) colMap.namaWp = h;
      else if (hText.indexOf('ALAMAT OBJEK') !== -1) colMap.alamatObjek = h;
      else if (hText.indexOf('ALAMAT WP') !== -1) colMap.alamatWp = h;
      else if (hText.indexOf('LUAS BUMI') !== -1) colMap.luasBumi = h;
      else if (hText.indexOf('LUAS BANG') !== -1) colMap.luasBangunan = h;
      else if (hText.indexOf('NJOP BUMI') !== -1) colMap.njopBumi = h;
      else if (hText.indexOf('NJOP BANG') !== -1) colMap.njopBangunan = h;
      else if (hText.indexOf('NJOP SPPT') !== -1) colMap.njopSppt = h;
      else if (hText.indexOf('PBB YANG DIBAYAR') !== -1 || (hText.indexOf('PBB') !== -1 && hText.indexOf('DIBAYAR') !== -1)) colMap.pbbYangDibayar = h;
      else if (hText.indexOf('DENDA') !== -1) colMap.denda = h;
      else if (hText.indexOf('KETRANGAN') !== -1 || hText.indexOf('KETERANGAN') !== -1) colMap.keterangan = h;
      else if (hText.indexOf('PETUGAS') !== -1) colMap.petugasPemungut = h;
      else if (hText.indexOf('TANGGAL') !== -1 || hText.indexOf('TGL') !== -1) colMap.tanggalBayar = h;
      else if (hText.indexOf('TUNGGAKAN') !== -1) colMap.tunggakanTahunLalu = h;
    }

    // Ambil data mulai dari baris 6 sampai baris terakhir
    var startRow = 6;
    var numRows = lastRow - startRow + 1;
    var values = sheet.getRange(startRow, 1, numRows, lastCol).getValues();

    var result = null;

    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      var rowNop = cleanNop(row[colMap.nop]);

      if (rowNop === cleanTarget) {
        var tglBayarStr = '';
        var rawTgl = row[colMap.tanggalBayar];
        if (rawTgl) {
          if (rawTgl instanceof Date) {
            tglBayarStr = Utilities.formatDate(rawTgl, "GMT+7", "dd/MM/yyyy");
          } else {
            tglBayarStr = String(rawTgl);
          }
        }

        result = {
          noUrut: row[colMap.noUrut] != null ? row[colMap.noUrut] : (i + 1),
          dhkp: row[colMap.noUrut] != null ? String(row[colMap.noUrut]) : '',
          namaPemilikTanah: row[colMap.namaPemilikTanah] != null ? String(row[colMap.namaPemilikTanah]) : '',
          alamatPemilikTanah: row[colMap.alamatPemilikTanah] != null ? String(row[colMap.alamatPemilikTanah]) : '',
          nop: row[colMap.nop] != null ? String(row[colMap.nop]) : nopQuery,
          tahun: row[colMap.tahun] != null ? String(row[colMap.tahun]) : '2026',
          namaWp: row[colMap.namaWp] != null ? String(row[colMap.namaWp]) : '',
          alamatObjek: row[colMap.alamatObjek] != null ? String(row[colMap.alamatObjek]) : '',
          alamatWp: row[colMap.alamatWp] != null ? String(row[colMap.alamatWp]) : '',
          luasBumi: Number(row[colMap.luasBumi]) || 0,
          luasBangunan: Number(row[colMap.luasBangunan]) || 0,
          njopBumi: Number(row[colMap.njopBumi]) || 0,
          njopBangunan: Number(row[colMap.njopBangunan]) || 0,
          njopSppt: Number(row[colMap.njopSppt]) || 0,
          pbbYangDibayar: Number(row[colMap.pbbYangDibayar]) || 0,
          denda: Number(row[colMap.denda]) || 0,
          keterangan: row[colMap.keterangan] != null ? String(row[colMap.keterangan]) : '',
          petugasPemungut: row[colMap.petugasPemungut] != null ? String(row[colMap.petugasPemungut]) : '',
          tanggalBayar: tglBayarStr,
          tunggakanTahunLalu: Number(row[colMap.tunggakanTahunLalu]) || 0
        };
        break;
      }
    }

    if (result) {
      return output.setContent(JSON.stringify({ status: 'success', data: result }));
    } else {
      return output.setContent(JSON.stringify({
        status: 'not_found',
        message: 'Nomor Objek Pajak (NOP) ' + nopQuery + ' tidak ditemukan dalam data PBB Desa Karanggintung.'
      }));
    }

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## 2. Cara Menerapkan (Deploy Web App yang Benar)

Agar tidak muncul error 404:
1. Di halaman Google Apps Script, klik tombol **Terapkan (Deploy)** warna biru di pojok kanan atas > pilih **Kelola Deployment (Manage deployments)** atau **Penerapan baru (New deployment)**.
2. Jika memilih **Penerapan baru (New deployment)**:
   - Klik ikon gerigi (⚙️) di sebelah kiri > pilih **Aplikasi Web (Web App)**.
   - **Deskripsi:** `API PBB Karanggintung v2`
   - **Jalankan sebagai (Execute as):** `Saya (email Anda)`
   - **Yang memiliki akses (Who has access):** **`Siapa saja (Anyone)`** *(Wajib)*.
   - Klik **Terapkan (Deploy)**.
3. Berikan izin akun Google (*Review permissions > Advanced > Go to ... unsafe > Allow*).
4. Salin **URL Aplikasi Web (Web App URL)**.
   - **PENTING:** URL yang benar adalah yang berakhiran **`/exec`**, contohnya:
     ```
     https://script.google.com/macros/s/AKfycbwXYZ123456789/exec
     ```
   - ❌ **JANGAN** salin URL dari bilah alamat browser (URL editor yang berakhiran `/edit`).
   - ❌ **JANGAN** salin URL Google Spreadsheet (`docs.google.com/spreadsheets/...`).

---

## 3. Masukkan ke Dashboard Admin Website

1. Buka website Desa Karanggintung di browser Anda: **`/admin/settings`**.
2. Cari bagian **Integrasi Spreadsheet PBB-P2**.
3. Tempel URL yang berakhiran `/exec` tersebut ke kolom input.
4. Klik tombol **Uji Koneksi Script** untuk memastikan statusnya hijau (*Koneksi Berhasil*).
5. Klik **Simpan Pengaturan**.
