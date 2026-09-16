'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Receipt,
  CheckCircle2,
  AlertCircle,
  MapPin,
  User,
  Calendar,
  MessageCircle,
  X,
  Loader2,
  ShieldCheck,
  HelpCircle,
  FileSpreadsheet,
  Building,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { PbbRecord, PbbSettings } from '@/lib/types';

// Mock data untuk demo jika URL Google Apps Script belum dipasang
const DEMO_PBB_RECORDS: Record<string, PbbRecord> = {
  '330107000100100010': {
    noUrut: 1,
    dhkp: '001/01',
    namaPemilikTanah: 'SUWARNO HADI',
    alamatPemilikTanah: 'RT 02 / RW 01 DUSUN KARANGGINTUNG',
    nop: '33.01.070.001.001-0001.0',
    tahun: 2026,
    namaWp: 'SUWARNO HADI',
    alamatObjek: 'DUSUN KARANGGINTUNG RT 02 RW 01',
    alamatWp: 'DUSUN KARANGGINTUNG RT 02 RW 01',
    luasBumi: 420,
    luasBangunan: 96,
    njopBumi: 84000000,
    njopBangunan: 57600000,
    njopSppt: 141600000,
    pbbYangDibayar: 78500,
    denda: 0,
    keterangan: 'LUNAS',
    petugasPemungut: 'Bpk. Ahmad (Kadus I)',
    tanggalBayar: '12/03/2026',
    tunggakanTahunLalu: 0,
  },
  '330107000100200020': {
    noUrut: 2,
    dhkp: '001/02',
    namaPemilikTanah: 'SITI AMINAH',
    alamatPemilikTanah: 'RT 04 / RW 02 DUSUN CIWANGI',
    nop: '33.01.070.001.002-0002.0',
    tahun: 2026,
    namaWp: 'SITI AMINAH',
    alamatObjek: 'DUSUN CIWANGI RT 04 RW 02',
    alamatWp: 'DUSUN CIWANGI RT 04 RW 02',
    luasBumi: 350,
    luasBangunan: 0,
    njopBumi: 52500000,
    njopBangunan: 0,
    njopSppt: 52500000,
    pbbYangDibayar: 42000,
    denda: 0,
    keterangan: 'BELUM BAYAR',
    petugasPemungut: 'Bpk. Slamet (Kadus II)',
    tanggalBayar: '',
    tunggakanTahunLalu: 0,
  },
  '330107000800100090': {
    noUrut: 9,
    dhkp: '001/09',
    namaPemilikTanah: 'KARSEM',
    alamatPemilikTanah: 'RT 2 RW 1',
    nop: '33.01.070.008.001.0009.0',
    tahun: 2026,
    namaWp: 'RUSLAN BIN ARSAME',
    alamatObjek: 'KP BLOK 001, RT: 000, RW: 00',
    alamatWp: 'RW 01 RT 002 -- CILACAP',
    luasBumi: 2177,
    luasBangunan: 0,
    njopBumi: 139328000,
    njopBangunan: 0,
    njopSppt: 139328000,
    pbbYangDibayar: 62698,
    denda: 0,
    keterangan: 'BELUM BAYAR',
    petugasPemungut: 'RASIWAN',
    tanggalBayar: '',
    tunggakanTahunLalu: 0,
  }
};

export function PbbSearchSection() {
  const [nopInput, setNopInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<PbbRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const firestore = useFirestore();

  // Ambil pengaturan URL Apps Script dari Firestore
  const pbbSettingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'pbbSettings');
  }, [firestore]);

  const { data: pbbSettings } = useDoc<PbbSettings>(pbbSettingsRef);

  // Script URL: prioritas dari Firestore settings, lalu fallback env, lalu string kosong
  const scriptUrl = pbbSettings?.scriptUrl || process.env.NEXT_PUBLIC_PBB_SCRIPT_URL || '';
  const waContact = pbbSettings?.contactWhatsApp || '62895321109179';

  // Normalisasi NOP: hilangkan spasi, titik, strip
  const cleanNop = (val: string) => val.replace(/[^0-9a-zA-Z]/g, '').trim().toUpperCase();

  // Format angka ke format Rupiah
  const formatRupiah = (val: number | string | undefined | null) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleSearch = async (e?: React.FormEvent, customNop?: string) => {
    if (e) e.preventDefault();
    const query = customNop || nopInput;
    const cleanTarget = cleanNop(query);

    if (!cleanTarget) {
      setErrorMessage('Silakan masukkan Nomor Objek Pajak (NOP) Anda.');
      setSearchResult(null);
      setHasSearched(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSearchResult(null);
    setHasSearched(true);
    setIsDemoMode(false);

    // Jika belum ada Script URL terkonfigurasi, cek di data demo lokal
    if (!scriptUrl) {
      setTimeout(() => {
        // Cek data demo
        const match = DEMO_PBB_RECORDS[cleanTarget] || Object.values(DEMO_PBB_RECORDS).find(
          item => cleanNop(item.nop) === cleanTarget
        );

        if (match) {
          setSearchResult(match);
          setIsDemoMode(true);
        } else {
          setErrorMessage(
            `Data NOP "${query}" tidak ditemukan di sistem demo. Harap hubungkan Google Spreadsheet Anda di menu Pengaturan Admin (/admin/settings).`
          );
        }
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      const response = await fetch(`${scriptUrl}?nop=${encodeURIComponent(cleanTarget)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('URL Web App Google Apps Script tidak ditemukan (Status 404). Pastikan URL di menu /admin/settings adalah URL hasil Deploy berakhiran /exec dan izin disetel ke "Anyone".');
        }
        throw new Error(`Gagal menghubungi server Google Sheets (Status ${response.status})`);
      }

      const json = await response.json();

      if (json.status === 'success' && json.data) {
        setSearchResult(json.data);
      } else {
        setErrorMessage(json.message || 'Nomor Objek Pajak (NOP) tidak ditemukan dalam data PBB Desa Karanggintung.');
      }
    } catch (err: any) {
      console.error('PBB Search Error:', err);
      // Fallback cek demo jika jaringan/CORS terkendala
      const demoMatch = DEMO_PBB_RECORDS[cleanTarget] || Object.values(DEMO_PBB_RECORDS).find(
        item => cleanNop(item.nop) === cleanTarget
      );
      if (demoMatch) {
        setSearchResult(demoMatch);
        setIsDemoMode(true);
      } else {
        setErrorMessage(
          err.message || 'Tidak dapat memuat data dari Spreadsheet. Pastikan URL Web App Google Apps Script telah disetel ke "Anyone" dan valid.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsApp = (record: PbbRecord) => {
    const isPaid = Boolean(
      (record.tanggalBayar && record.tanggalBayar.trim() !== '' && record.tanggalBayar.trim() !== '-') ||
      record.keterangan?.toUpperCase().includes('LUNAS')
    );
    const statusText = isPaid
      ? `LUNAS (Tanggal Bayar: ${record.tanggalBayar || '-'})`
      : 'BELUM LUNAS';
    const message = `Halo Petugas PBB Desa Karanggintung,%0A%0ASaya ingin konfirmasi data SPPT PBB-P2:%0A- NOP: ${record.nop}%0A- Nama WP: ${record.namaWp}%0A- Alamat Objek: ${record.alamatObjek}%0A- PBB Dibayar: ${formatRupiah(record.pbbYangDibayar)}%0A- Status Terdata: ${statusText}%0A%0AMohon informasi lebih lanjut. Terima kasih.`;
    window.open(`https://wa.me/${waContact.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  const handleUseDemo = (nop: string) => {
    setNopInput(nop);
    handleSearch(undefined, nop);
  };

  // Status lunas jika tercantum tanggal bayar atau keterangan memuat kata 'LUNAS'
  const hasTanggalBayar = Boolean(
    searchResult?.tanggalBayar &&
    searchResult.tanggalBayar.trim() !== '' &&
    searchResult.tanggalBayar.trim() !== '-' &&
    searchResult.tanggalBayar.trim() !== '0'
  );
  const hasKeteranganLunas = Boolean(
    searchResult?.keterangan &&
    searchResult.keterangan.toUpperCase().includes('LUNAS')
  );
  const isLunas = hasTanggalBayar || hasKeteranganLunas;

  const totalWajibBayar = searchResult
    ? (Number(searchResult.pbbYangDibayar) || 0) + (Number(searchResult.denda) || 0) + (Number(searchResult.tunggakanTahunLalu) || 0)
    : 0;

  return (
    <section id="cek-pbb" className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="relative rounded-[3rem] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-6 sm:p-12 lg:p-16 shadow-2xl border border-emerald-900/40 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/30 via-slate-900 to-slate-950 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400">
            <Receipt className="h-4 w-4" />
            Layanan Perpajakan Desa
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight font-display uppercase leading-tight">
            Cek Pajak <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">PBB-P2</span> Online
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Pengecekan tagihan, rincian objek pajak, dan status pelunasan Pajak Bumi & Bangunan (PBB-P2) warga Desa Karanggintung secara transparan dan real-time langsung dari data SPPT desa.
          </p>
        </div>

        {/* Search Box Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 p-4 md:p-8 rounded-[2.5rem] shadow-2xl mb-12">
          <form onSubmit={(e) => handleSearch(e)} className="space-y-4">
            <div className="relative flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  value={nopInput}
                  onChange={(e) => setNopInput(e.target.value)}
                  placeholder="Masukkan Nomor Objek Pajak (NOP) Anda..."
                  className="w-full h-14 pl-12 pr-10 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 font-semibold border-none focus-visible:ring-2 focus-visible:ring-emerald-400 text-base shadow-inner"
                />
                {nopInput && (
                  <button
                    type="button"
                    onClick={() => { setNopInput(''); setSearchResult(null); setHasSearched(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Mencari...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Cek Tagihan
                  </>
                )}
              </Button>
            </div>

            {/* Contoh Cara Input NOP */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 pt-2 px-1">
              <HelpCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Contoh format NOP:</strong>{' '}
                <code className="bg-white/10 px-2 py-0.5 rounded text-emerald-300 font-mono">33.01.070.008.001.0016.0</code>{' '}
                <span className="text-slate-400">(dapat diketik langsung dengan angka atau tanda titik sesuai SPPT Anda)</span>
              </span>
            </div>
          </form>
        </div>

        {/* Search Results Display Area */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center space-y-4"
            >
              <div className="relative mx-auto w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                <Receipt className="absolute inset-0 m-auto h-6 w-6 text-emerald-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white uppercase tracking-wider">Menghubungkan ke Data PBB Desa...</h4>
                <p className="text-xs text-slate-400">Mencari baris NOP pada basis data Desa Karanggintung</p>
              </div>
            </motion.div>
          )}

          {!isLoading && hasSearched && errorMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 rounded-[2rem] bg-rose-500/10 border border-rose-500/30 text-center space-y-4 max-w-2xl mx-auto"
            >
              <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white uppercase">Data Tidak Ditemukan</h4>
                <p className="text-sm text-slate-300">{errorMessage}</p>
              </div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => { setNopInput(''); setHasSearched(false); }}
                  className="rounded-xl border-white/20 text-white hover:bg-white/10 gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Ulangi Pencarian
                </Button>
              </div>
            </motion.div>
          )}

          {!isLoading && searchResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* SPPT Digital Result Card */}
              <Card className="rounded-[2.5rem] bg-white text-slate-900 border-none shadow-2xl overflow-hidden print:shadow-none print:m-0">
                {/* Header Kartu SPPT */}
                <div className="p-6 md:p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">
                      <ShieldCheck className="h-4 w-4" />
                      Pemerintah Kabupaten Cilacap • Kecamatan Gandrungmangu
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black font-display uppercase tracking-tight">
                      SPPT PBB-P2 DESA KARANGGINTUNG
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                      <span className="font-semibold">Tahun Pajak: <strong className="text-white font-bold">{searchResult.tahun || '2026'}</strong></span>
                      <span>•</span>
                      <span>DHKP: <strong className="text-white font-mono">{searchResult.dhkp || '-'}</strong></span>
                      <span>•</span>
                      <span>No. Urut: <strong className="text-white font-mono">{searchResult.noUrut || '-'}</strong></span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Pembayaran</span>
                    {isLunas ? (
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/30">
                        <CheckCircle2 className="h-5 w-5" />
                        LUNAS
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-600/30 animate-pulse">
                        <AlertCircle className="h-5 w-5" />
                        BELUM LUNAS / TERHUTANG
                      </div>
                    )}
                  </div>
                </div>

                <CardContent className="p-6 md:p-10 space-y-8 font-sans">
                  {/* Grid 2 Kolom: Data Wajib Pajak vs Rincian Pembayaran */}
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Kolom 1: Data Objek & Subjek Pajak */}
                    <div className="space-y-6">
                      <div className="border-b border-slate-200 pb-3">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                          <User className="h-4 w-4 text-emerald-600" />
                          Data Wajib Pajak & Objek
                        </h4>
                      </div>

                      <div className="space-y-4 text-sm">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nama Wajib Pajak (SPPT)</p>
                          <p className="text-lg font-black text-slate-900 uppercase font-display">{searchResult.namaWp || '-'}</p>
                          {searchResult.namaPemilikTanah && searchResult.namaPemilikTanah !== searchResult.namaWp && (
                            <p className="text-xs text-slate-500 font-medium">
                              Pemilik Tanah: <span className="font-bold text-slate-700">{searchResult.namaPemilikTanah}</span>
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nomor Objek Pajak (NOP)</span>
                            <span className="font-mono text-base font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl self-start border border-slate-200/80">
                              {searchResult.nop}
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-slate-400" /> Letak Objek Pajak
                            </span>
                            <span className="font-semibold text-slate-800 leading-snug">{searchResult.alamatObjek || '-'}</span>
                          </div>

                          {searchResult.alamatWp && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alamat Wajib Pajak</span>
                              <span className="text-slate-600">{searchResult.alamatWp}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Luas Bumi (Tanah)</p>
                              <p className="text-base font-black text-emerald-950">{searchResult.luasBumi || 0} m²</p>
                            </div>
                            <div className="bg-teal-50/60 p-3 rounded-xl border border-teal-100">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Luas Bangunan</p>
                              <p className="text-base font-black text-teal-950">{searchResult.luasBangunan || 0} m²</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Kolom 2: Rincian Nilai & Tagihan PBB */}
                    <div className="space-y-6">
                      <div className="border-b border-slate-200 pb-3">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-emerald-600" />
                          Rincian Ketetapan & Pembayaran
                        </h4>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-500">NJOP Bumi:</span>
                          <span className="font-semibold text-slate-800">{formatRupiah(searchResult.njopBumi)}</span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-500">NJOP Bangunan:</span>
                          <span className="font-semibold text-slate-800">{formatRupiah(searchResult.njopBangunan)}</span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-500">NJOP Total SPPT:</span>
                          <span className="font-bold text-slate-900">{formatRupiah(searchResult.njopSppt)}</span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-500">Pokok PBB Yang Dibayar:</span>
                          <span className="font-bold text-slate-900">{formatRupiah(searchResult.pbbYangDibayar)}</span>
                        </div>

                        {Boolean(Number(searchResult.denda)) && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-100 text-rose-600">
                            <span>Denda Keterlambatan:</span>
                            <span className="font-bold">+ {formatRupiah(searchResult.denda)}</span>
                          </div>
                        )}

                        {Boolean(Number(searchResult.tunggakanTahunLalu)) && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-100 text-amber-600">
                            <span>Tunggakan Tahun Lalu:</span>
                            <span className="font-bold">+ {formatRupiah(searchResult.tunggakanTahunLalu)}</span>
                          </div>
                        )}

                        {/* Kotak Total Tagihan */}
                        <div className={`mt-6 p-5 rounded-2xl border-2 flex items-center justify-between ${isLunas
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                            : 'bg-rose-50 border-rose-300 text-rose-950'
                          }`}>
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-75">
                              {isLunas ? 'Total Pajak Telah Dibayar' : 'Total Wajib Dibayar'}
                            </p>
                            <p className="text-xs font-semibold">
                              {isLunas
                                ? `Lunas terbayarkan${searchResult.tanggalBayar ? ` pada ${searchResult.tanggalBayar}` : ''}`
                                : 'Segera lakukan pelunasan'}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl md:text-3xl font-black font-display tracking-tight">
                              {formatRupiah(totalWajibBayar || searchResult.pbbYangDibayar)}
                            </span>
                          </div>
                        </div>

                        {/* Informasi Pelunasan / Petugas */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                          {searchResult.petugasPemungut && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Petugas Pemungut (Kadus):</span>
                              <span className="font-bold text-slate-700">{searchResult.petugasPemungut}</span>
                            </div>
                          )}
                          {searchResult.tanggalBayar && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Tanggal Pelunasan:</span>
                              <span className="font-bold text-emerald-700">{searchResult.tanggalBayar}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Bar */}
                  <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 print:hidden">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="h-4 w-4 text-emerald-600" />
                      <span>Data diperbarui secara berkala oleh Tim Pemungut PBB Desa Karanggintung</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        onClick={() => handleWhatsApp(searchResult)}
                        className="rounded-xl gap-2 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Konfirmasi Petugas
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
