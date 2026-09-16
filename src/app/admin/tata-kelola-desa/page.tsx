'use client';

import { useState, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, Plus, Trash2, Eye, Download } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useCollection } from '@/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as XLSX from 'xlsx';
import { ApbdesData, RealisasiApbdesData, ApbdesItem, ProdukHukumDesa } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const PRODUK_HUKUM_TYPES = [
  { value: 'perdes', label: 'Peraturan Desa (Perdes)' },
  { value: 'perkades', label: 'Peraturan Kepala Desa (Perkades)' },
  { value: 'rpjmdes', label: 'Rencana Pembangunan Jangka Menengah Desa (RPJMDes)' },
  { value: 'rkpdes', label: 'Rencana Kerja Pembangunan Desa (RKPDes)' },
  { value: 'sk_desa', label: 'Surat Keputusan Desa (SK Desa)' },
  { value: 'lppd', label: 'Laporan Pertanggungjawaban Kepala Desa (LPPD)' },
  { value: 'lkpd', label: 'Laporan Keuangan Pemerintah Desa (LKPD)' },
];

// Helper to robustly parse nominal values from Excel rows (numeric or string)
const parseNominal = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  
  let str = String(val).trim();
  str = str.replace(/Rp\s*/i, '');
  
  const hasComma = str.includes(',');
  const hasDot = str.includes('.');
  
  if (hasComma && hasDot) {
    if (str.indexOf(',') < str.indexOf('.')) {
      // US style: 1,500,000.50
      str = str.replace(/,/g, '');
    } else {
      // ID style: 1.500.000,50
      str = str.replace(/\./g, '').replace(',', '.');
    }
  } else if (hasComma) {
    // Only comma. Could be 1,500,000 (US thousand) or 12,5 (ID decimal).
    const parts = str.split(',');
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      str = str.replace(/,/g, '');
    } else {
      str = str.replace(',', '.');
    }
  } else if (hasDot) {
    // Only dot. Could be 1.500.000 (ID thousand) or 12.5 (US decimal).
    const parts = str.split('.');
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      str = str.replace(/\./g, '');
    }
  }
  
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
};

export default function AdminTataKelolaDesa() {
  const [activeTab, setActiveTab] = useState('apbdes');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const apbdesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'apbdes'), orderBy('tahun', 'desc'));
  }, [firestore]);

  const realisasiQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'realisasiApbdes'), orderBy('tahun', 'desc'));
  }, [firestore]);

  const produkHukumQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'produkHukumDesa'), orderBy('tahun', 'desc'));
  }, [firestore]);

  const { data: allApbdes, isLoading: isLoadingApbdes } = useCollection<ApbdesData>(apbdesQuery);
  const { data: allRealisasi, isLoading: isLoadingRealisasi } = useCollection<RealisasiApbdesData>(realisasiQuery);
  const { data: allProdukHukum, isLoading: isLoadingProduk } = useCollection<ProdukHukumDesa>(produkHukumQuery);

  const currentApbdes = allApbdes?.find(d => d.tahun === selectedYear);
  const currentRealisasi = allRealisasi?.find(d => d.tahun === selectedYear);
  const currentProdukHukum = allProdukHukum?.filter(p => p.tahun === selectedYear) || [];

  // Handle Excel Import untuk APBDes
  const handleApbdesImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firestore) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet) as any[];

      const items: ApbdesItem[] = rows.map(row => ({
        bidang: row['Bidang'] || row['bidang'] || '',
        kodeRekening: row['Kode Rekening'] || row['kode rekening'] || row['KodeRekening'] || row['koderekening'] || '',
        kegiatan: row['Kegiatan'] || row['kegiatan'] || '',
        volume: row['Volume'] !== undefined ? row['Volume'] : (row['volume'] !== undefined ? row['volume'] : 0),
        nominal: parseNominal(row['Nominal'] !== undefined ? row['Nominal'] : row['nominal']),
        sumberAnggaran: row['Sumber'] || row['Sumber Anggaran'] || row['sumber'] || row['sumber anggaran'] || '',
      }));

      const totalAnggaran = items.reduce((sum, item) => sum + item.nominal, 0);

      // Hapus data lama jika ada
      if (currentApbdes) {
        await deleteDoc(doc(firestore, 'apbdes', currentApbdes.id));
      }

      // Simpan data baru
      await addDoc(collection(firestore, 'apbdes'), {
        tahun: selectedYear,
        totalAnggaran,
        items,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({ title: 'APBDes berhasil diimpor', description: `${items.length} item diimpor untuk tahun ${selectedYear}` });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      toast({ title: 'Gagal mengimpor APBDes', description: error.message, variant: 'destructive' });
    }
  };

  // Handle Excel Import untuk Realisasi
  const handleRealisasiImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firestore) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet) as any[];

      const items: ApbdesItem[] = rows.map(row => ({
        bidang: row['Bidang'] || row['bidang'] || '',
        kodeRekening: row['Kode Rekening'] || row['kode rekening'] || row['KodeRekening'] || row['koderekening'] || '',
        kegiatan: row['Kegiatan'] || row['kegiatan'] || '',
        volume: row['Volume'] !== undefined ? row['Volume'] : (row['volume'] !== undefined ? row['volume'] : 0),
        nominal: parseNominal(row['Nominal'] !== undefined ? row['Nominal'] : row['nominal']),
        sumberAnggaran: row['Sumber'] || row['Sumber Anggaran'] || row['sumber'] || row['sumber anggaran'] || '',
      }));

      const totalRealisasi = items.reduce((sum, item) => sum + item.nominal, 0);

      // Hapus data lama jika ada
      if (currentRealisasi) {
        await deleteDoc(doc(firestore, 'realisasiApbdes', currentRealisasi.id));
      }

      // Simpan data baru
      await addDoc(collection(firestore, 'realisasiApbdes'), {
        tahun: selectedYear,
        totalRealisasi,
        items,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({ title: 'Realisasi APBDes berhasil diimpor', description: `${items.length} item diimpor untuk tahun ${selectedYear}` });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      toast({ title: 'Gagal mengimpor Realisasi', description: error.message, variant: 'destructive' });
    }
  };

  // Handle Delete APBDes
  const handleDeleteApbdes = async () => {
    if (!currentApbdes || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'apbdes', currentApbdes.id));
      toast({ title: 'APBDes dihapus' });
    } catch (error: any) {
      toast({ title: 'Gagal menghapus', description: error.message, variant: 'destructive' });
    }
  };

  // Handle Delete Realisasi
  const handleDeleteRealisasi = async () => {
    if (!currentRealisasi || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'realisasiApbdes', currentRealisasi.id));
      toast({ title: 'Realisasi dihapus' });
    } catch (error: any) {
      toast({ title: 'Gagal menghapus', description: error.message, variant: 'destructive' });
    }
  };

  // Download Template Excel untuk APBDes
  const handleDownloadApbdesTemplate = () => {
    const headers = [['Bidang', 'Kode Rekening', 'Kegiatan', 'Volume', 'Nominal', 'Sumber Anggaran']];
    const contoh = [
      ['Penyelenggaraan Pemerintahan Desa', '1.1.01', 'Penyusunan Dokumen Perencanaan Desa', 1, 5000000, 'Dana Desa'],
      ['Pembangunan Desa', '2.1.01', 'Pembangunan Jalan Desa', 1, 150000000, 'Dana Desa'],
      ['Pembinaan Kemasyarakatan Desa', '3.1.01', 'Kegiatan Kepemudaan', 1, 10000000, 'ADD'],
    ];
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...contoh]);
    // Atur lebar kolom
    ws['!cols'] = [
      { wch: 40 }, { wch: 18 }, { wch: 45 }, { wch: 10 }, { wch: 18 }, { wch: 20 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `APBDes ${selectedYear}`);
    XLSX.writeFile(wb, `Template_APBDes_${selectedYear}.xlsx`);
    toast({ title: 'Template diunduh', description: `Template APBDes ${selectedYear} berhasil diunduh.` });
  };

  // Download Template Excel untuk Realisasi APBDes
  const handleDownloadRealisasiTemplate = () => {
    const headers = [['Bidang', 'Kode Rekening', 'Kegiatan', 'Volume', 'Nominal', 'Sumber Anggaran']];
    const contoh = [
      ['Penyelenggaraan Pemerintahan Desa', '1.1.01', 'Penyusunan Dokumen Perencanaan Desa', 1, 4800000, 'Dana Desa'],
      ['Pembangunan Desa', '2.1.01', 'Pembangunan Jalan Desa', 1, 148000000, 'Dana Desa'],
      ['Pembinaan Kemasyarakatan Desa', '3.1.01', 'Kegiatan Kepemudaan', 1, 9500000, 'ADD'],
    ];
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...contoh]);
    ws['!cols'] = [
      { wch: 40 }, { wch: 18 }, { wch: 45 }, { wch: 10 }, { wch: 18 }, { wch: 20 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Realisasi APBDes ${selectedYear}`);
    XLSX.writeFile(wb, `Template_Realisasi_APBDes_${selectedYear}.xlsx`);
    toast({ title: 'Template diunduh', description: `Template Realisasi APBDes ${selectedYear} berhasil diunduh.` });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Manajemen Tata Kelola Desa"
        description="Kelola data APBDes tahunan, Realisasi APBDes, dan Produk Hukum Desa Karanggintung."
      />

      {/* TABS */}
      <Tabs defaultValue="apbdes" className="space-y-4 sm:space-y-8" onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100/80 p-1 sm:p-1.5 rounded-2xl flex flex-wrap h-auto gap-1 shadow-inner">
          <TabsTrigger value="apbdes" className="rounded-xl font-black text-xs sm:text-sm py-2 px-3.5 sm:px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm">APBDes</TabsTrigger>
          <TabsTrigger value="realisasi" className="rounded-xl font-black text-xs sm:text-sm py-2 px-3.5 sm:px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm">Realisasi APBDes</TabsTrigger>
          <TabsTrigger value="produk" className="rounded-xl font-black text-xs sm:text-sm py-2 px-3.5 sm:px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm">Produk Hukum Desa</TabsTrigger>
        </TabsList>

          {/* APBDES TAB */}
          <TabsContent value="apbdes" className="space-y-4 sm:space-y-6 outline-none">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
              <div className="space-y-1.5 flex-1 sm:flex-none">
                <Label className="font-bold text-xs sm:text-sm">Pilih Tahun</Label>
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger className="w-full sm:w-48 rounded-xl border-slate-300 h-10 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        Tahun {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl gap-1.5 font-bold bg-primary hover:bg-slate-800 h-9 sm:h-10 text-xs sm:text-sm px-3.5"
                >
                  <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Impor Excel
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleApbdesImport}
                  className="hidden"
                />

                <Button
                  onClick={handleDownloadApbdesTemplate}
                  variant="outline"
                  className="rounded-xl gap-1.5 font-bold border-emerald-600 text-emerald-700 hover:bg-emerald-50 h-9 sm:h-10 text-xs sm:text-sm px-3.5"
                >
                  <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Download Format
                </Button>

                {currentApbdes && (
                  <Button 
                    onClick={handleDeleteApbdes}
                    variant="destructive"
                    className="rounded-xl gap-1.5 font-bold h-9 sm:h-10 text-xs sm:text-sm px-3.5"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Hapus Data
                  </Button>
                )}
              </div>
            </div>

            {currentApbdes ? (
              <Card className="rounded-2xl sm:rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
                <div className="p-3.5 sm:p-6 border-b bg-slate-50/50 flex items-center justify-between">
                  <h3 className="text-xs sm:text-base font-black text-slate-900 uppercase">Data APBDes Tahun {selectedYear}</h3>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                    {currentApbdes.items?.length || 0} Kegiatan
                  </span>
                </div>
                <CardContent className="p-0">
                  {/* Mobile Card List View (block sm:hidden) - Zero horizontal scroll */}
                  <div className="block sm:hidden divide-y divide-slate-100">
                    {currentApbdes.items?.map((item, i) => (
                      <div key={i} className="p-3.5 space-y-2 bg-white">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md">
                            {item.bidang || 'Umum'}
                          </span>
                          <span className="font-mono text-[9px] text-slate-400 font-bold">
                            {item.kodeRekening}
                          </span>
                        </div>
                        <p className="font-bold text-xs uppercase text-slate-800 leading-snug break-words">
                          {item.kegiatan}
                        </p>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-50">
                          <span className="text-[10px] text-slate-400 font-medium">
                            Vol: <strong className="text-slate-700">{item.volume}</strong> • Sumber: <strong className="text-slate-700">{item.sumberAnggaran || '-'}</strong>
                          </span>
                          <span className="font-black text-primary text-xs">
                            Rp {item.nominal.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    ))}
                    {/* Total Box Mobile */}
                    <div className="p-3.5 bg-primary/5 flex items-center justify-between border-t border-primary/10">
                      <span className="text-xs font-bold text-slate-700">Total Anggaran:</span>
                      <span className="text-sm font-black text-primary">Rp {currentApbdes.totalAnggaran.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Desktop Table View (hidden sm:block) */}
                  <div className="hidden sm:block overflow-x-auto w-full">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold">Bidang</th>
                          <th className="px-4 py-3 text-left font-bold">Kode Rekening</th>
                          <th className="px-4 py-3 text-left font-bold">Kegiatan</th>
                          <th className="px-4 py-3 text-right font-bold">Volume</th>
                          <th className="px-4 py-3 text-right font-bold">Nominal</th>
                          <th className="px-4 py-3 text-left font-bold">Sumber</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentApbdes.items?.map((item, i) => (
                          <tr key={i} className="border-b hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold">{item.bidang}</td>
                            <td className="px-4 py-3 text-slate-600 font-mono text-xs">{item.kodeRekening}</td>
                            <td className="px-4 py-3 text-slate-700">{item.kegiatan}</td>
                            <td className="px-4 py-3 text-right">{item.volume}</td>
                            <td className="px-4 py-3 text-right text-primary font-bold">Rp {item.nominal.toLocaleString('id-ID')}</td>
                            <td className="px-4 py-3 text-slate-600">{item.sumberAnggaran}</td>
                          </tr>
                        ))}
                        <tr className="bg-primary/5 font-bold">
                          <td colSpan={4} className="px-4 py-3 text-right">Total:</td>
                          <td className="px-4 py-3 text-right text-primary">Rp {currentApbdes.totalAnggaran.toLocaleString('id-ID')}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-2xl border-2 border-dashed border-slate-300 shadow-none">
                <CardContent className="p-8 sm:p-12 text-center">
                  <p className="text-slate-600 font-semibold text-xs sm:text-sm">Belum ada data APBDes untuk tahun {selectedYear}</p>
                  <p className="text-slate-400 text-[11px] sm:text-xs">Klik tombol "Impor Excel" untuk menambahkan data</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* REALISASI TAB */}
          <TabsContent value="realisasi" className="space-y-4 sm:space-y-6 outline-none">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
              <div className="space-y-1.5 flex-1 sm:flex-none">
                <Label className="font-bold text-xs sm:text-sm">Pilih Tahun</Label>
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger className="w-full sm:w-48 rounded-xl border-slate-300 h-10 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        Tahun {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl gap-1.5 font-bold bg-primary hover:bg-slate-800 h-9 sm:h-10 text-xs sm:text-sm px-3.5"
                >
                  <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Impor Excel
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleRealisasiImport}
                  className="hidden"
                />

                <Button
                  onClick={handleDownloadRealisasiTemplate}
                  variant="outline"
                  className="rounded-xl gap-1.5 font-bold border-teal-600 text-teal-700 hover:bg-teal-50 h-9 sm:h-10 text-xs sm:text-sm px-3.5"
                >
                  <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Download Format
                </Button>

                {currentRealisasi && (
                  <Button 
                    onClick={handleDeleteRealisasi}
                    variant="destructive"
                    className="rounded-xl gap-1.5 font-bold h-9 sm:h-10 text-xs sm:text-sm px-3.5"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Hapus Data
                  </Button>
                )}
              </div>
            </div>

            {currentRealisasi ? (
              <Card className="rounded-2xl sm:rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
                <div className="p-3.5 sm:p-6 border-b bg-slate-50/50 flex items-center justify-between">
                  <h3 className="text-xs sm:text-base font-black text-slate-900 uppercase">Data Realisasi APBDes Tahun {selectedYear}</h3>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                    {currentRealisasi.items?.length || 0} Kegiatan
                  </span>
                </div>
                <CardContent className="p-0">
                  {/* Mobile Card List View (block sm:hidden) - Zero horizontal scroll */}
                  <div className="block sm:hidden divide-y divide-slate-100">
                    {currentRealisasi.items?.map((item, i) => (
                      <div key={i} className="p-3.5 space-y-2 bg-white">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-teal-50 text-teal-800 rounded-md">
                            {item.bidang || 'Umum'}
                          </span>
                          <span className="font-mono text-[9px] text-slate-400 font-bold">
                            {item.kodeRekening}
                          </span>
                        </div>
                        <p className="font-bold text-xs uppercase text-slate-800 leading-snug break-words">
                          {item.kegiatan}
                        </p>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-50">
                          <span className="text-[10px] text-slate-400 font-medium">
                            Vol: <strong className="text-slate-700">{item.volume}</strong> • Sumber: <strong className="text-slate-700">{item.sumberAnggaran || '-'}</strong>
                          </span>
                          <span className="font-black text-teal-700 text-xs">
                            Rp {item.nominal.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    ))}
                    {/* Total Box Mobile */}
                    <div className="p-3.5 bg-emerald-50 flex items-center justify-between border-t border-emerald-100">
                      <span className="text-xs font-bold text-emerald-950">Total Realisasi:</span>
                      <span className="text-sm font-black text-emerald-700">Rp {currentRealisasi.totalRealisasi.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Desktop Table View (hidden sm:block) */}
                  <div className="hidden sm:block overflow-x-auto w-full">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold">Bidang</th>
                          <th className="px-4 py-3 text-left font-bold">Kode Rekening</th>
                          <th className="px-4 py-3 text-left font-bold">Kegiatan</th>
                          <th className="px-4 py-3 text-right font-bold">Volume</th>
                          <th className="px-4 py-3 text-right font-bold">Realisasi</th>
                          <th className="px-4 py-3 text-left font-bold">Sumber</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRealisasi.items?.map((item, i) => (
                          <tr key={i} className="border-b hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold">{item.bidang}</td>
                            <td className="px-4 py-3 text-slate-600 font-mono text-xs">{item.kodeRekening}</td>
                            <td className="px-4 py-3 text-slate-700">{item.kegiatan}</td>
                            <td className="px-4 py-3 text-right">{item.volume}</td>
                            <td className="px-4 py-3 text-right text-teal-700 font-bold">Rp {item.nominal.toLocaleString('id-ID')}</td>
                            <td className="px-4 py-3 text-slate-600">{item.sumberAnggaran}</td>
                          </tr>
                        ))}
                        <tr className="bg-emerald-50 font-bold">
                          <td colSpan={4} className="px-4 py-3 text-right text-emerald-950">Total Realisasi:</td>
                          <td className="px-4 py-3 text-right text-emerald-700">Rp {currentRealisasi.totalRealisasi.toLocaleString('id-ID')}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-2xl border-2 border-dashed border-slate-300 shadow-none">
                <CardContent className="p-8 sm:p-12 text-center">
                  <p className="text-slate-600 font-semibold text-xs sm:text-sm">Belum ada data Realisasi untuk tahun {selectedYear}</p>
                  <p className="text-slate-400 text-[11px] sm:text-xs">Klik tombol "Impor Excel" untuk menambahkan data</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* PRODUK HUKUM TAB */}
          <TabsContent value="produk" className="space-y-4 sm:space-y-6 outline-none">
            <AdminProdukHukumTab produkHukumList={allProdukHukum} isLoading={isLoadingProduk} firestore={firestore} />
          </TabsContent>
        </Tabs>
    </div>
  );
}

// Component untuk Produk Hukum Tab
function AdminProdukHukumTab({ produkHukumList, isLoading, firestore }: any) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    jenis: 'perdes',
    tahun: new Date().getFullYear(),
    nama: '',
    nomor: '',
    driveLink: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;

    if (!formData.nama || !formData.nomor) {
      toast({ title: 'Gagal', description: 'Nama dan Nomor harus diisi', variant: 'destructive' });
      return;
    }

    try {
      await addDoc(collection(firestore, 'produkHukumDesa'), {
        ...formData,
        jenis: formData.jenis as any,
        tahun: parseInt(formData.tahun.toString()),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({ title: 'Produk Hukum ditambahkan' });
      setFormData({ jenis: 'perdes', tahun: new Date().getFullYear(), nama: '', nomor: '', driveLink: '' });
    } catch (error: any) {
      toast({ title: 'Gagal menambahkan', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'produkHukumDesa', id));
      toast({ title: 'Produk Hukum dihapus' });
    } catch (error: any) {
      toast({ title: 'Gagal menghapus', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
      {/* Form */}
      <Card className="lg:col-span-1 rounded-2xl sm:rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase">Tambah Produk Hukum</h3>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <Label className="font-bold text-xs">Jenis Produk</Label>
              <Select value={formData.jenis} onValueChange={(v) => setFormData({...formData, jenis: v})}>
                <SelectTrigger className="rounded-xl border-slate-300 h-10 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUK_HUKUM_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-bold text-xs">Tahun</Label>
              <Select value={formData.tahun.toString()} onValueChange={(v) => setFormData({...formData, tahun: parseInt(v)})}>
                <SelectTrigger className="rounded-xl border-slate-300 h-10 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-bold text-xs">Nama Produk</Label>
              <Input
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
                placeholder="Nama lengkap produk hukum"
                className="rounded-xl border-slate-300 h-10 text-xs sm:text-sm"
                required
              />
            </div>

            <div>
              <Label className="font-bold text-xs">Nomor</Label>
              <Input
                value={formData.nomor}
                onChange={(e) => setFormData({...formData, nomor: e.target.value})}
                placeholder="e.g. 1/2026"
                className="rounded-xl border-slate-300 h-10 text-xs sm:text-sm"
                required
              />
            </div>

            <div>
              <Label className="font-bold text-xs">Link Google Drive (Optional)</Label>
              <Input
                value={formData.driveLink}
                onChange={(e) => setFormData({...formData, driveLink: e.target.value})}
                placeholder="https://drive.google.com/..."
                className="rounded-xl border-slate-300 h-10 text-xs sm:text-sm"
                type="url"
              />
            </div>

            <Button type="submit" className="w-full rounded-xl font-bold bg-primary hover:bg-slate-800 h-10 text-xs sm:text-sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Tambahkan
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <div className="lg:col-span-2 space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase">Daftar Produk Hukum</h3>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : produkHukumList?.length === 0 ? (
          <Card className="rounded-2xl border-2 border-dashed border-slate-300 shadow-none">
            <CardContent className="p-8 sm:p-12 text-center">
              <p className="text-slate-600 font-semibold text-xs sm:text-sm">Belum ada produk hukum</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2.5 sm:space-y-3">
            {produkHukumList?.map((produk: any) => (
              <Card key={produk.id} className="rounded-xl sm:rounded-2xl border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-3.5 sm:p-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded">{produk.jenis.toUpperCase()}</span>
                        <span className="text-[9px] text-slate-500 font-bold">{produk.tahun}</span>
                      </div>
                      <p className="font-bold text-xs sm:text-sm text-slate-900 leading-snug break-words">{produk.nama}</p>
                      <p className="text-[11px] text-slate-500">Nomor: <span className="font-semibold text-slate-700">{produk.nomor}</span></p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {produk.driveLink && (
                        <a href={produk.driveLink} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-primary hover:bg-primary/5">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(produk.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
