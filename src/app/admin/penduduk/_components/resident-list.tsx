'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Search,
  UserPlus,
  Edit,
  Trash2,
  Users,
  FileUp,
  Loader2,
  AlertCircle,
  ShieldAlert,
  Database,
  BarChart3,
  FileSpreadsheet,
  FileText,
  Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Resident } from '@/lib/types';
import { useFirestore } from '@/firebase';
import {
  collection,
  query,
  deleteDoc,
  doc,
  getDocs,
  where,
  limit,
  getCountFromServer,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ResidentForm } from './resident-form';
import { ImportResidentDialog } from './import-resident-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { seedResidents, recalculateStatistics } from '@/lib/residents';

export function ResidentList() {
  console.log('ResidentList render');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const [residents, setResidents] = useState<Resident[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const firestore = useFirestore();
  const { toast } = useToast();

  const handleDownloadExcel = async () => {
    if (!firestore) return;
    setIsExportingExcel(true);
    try {
      let dataToExport = residents;
      if (dataToExport.length === 0) {
        const snap = await getDocs(query(collection(firestore, 'residents'), limit(5000)));
        dataToExport = snap.docs.map(d => ({ id: d.id, ...d.data() } as Resident));
      }

      if (dataToExport.length === 0) {
        toast({ title: "Data Kosong", description: "Tidak ada data penduduk untuk diunduh." });
        return;
      }

      const excelData = dataToExport.map((r, index) => ({
        'No': index + 1,
        'NIK': r.nik || '',
        'No. KK': r.noKk || '',
        'Nama Lengkap': r.fullName || '',
        'Jenis Kelamin': r.gender || '',
        'Tempat Lahir': r.placeOfBirth || '',
        'Tanggal Lahir': r.dateOfBirth || '',
        'Agama': r.religion || '',
        'Status Perkawinan': r.maritalStatus || '',
        'Pendidikan': r.educationLevel || '',
        'Pekerjaan': r.occupation || '',
        'Hubungan Keluarga': r.relationshipToHeadOfFamily || '',
        'Golongan Darah': r.bloodType || '',
        'Alamat': r.address || '',
        'RT': r.rt || '',
        'RW': r.rw || '',
        'Kelurahan/Desa': r.kelurahan || 'Karanggintung',
        'Nama Ayah': r.fatherName || '',
        'Nama Ibu': r.motherName || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Penduduk');

      const fileName = `Data_Penduduk_Desa_Karanggintung_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Excel Berhasil Diunduh",
        description: `${dataToExport.length} data penduduk telah diekspor ke file Excel.`,
      });
    } catch (error: any) {
      console.error("Error exporting Excel:", error);
      toast({ variant: "destructive", title: "Gagal Ekspor Excel", description: error.message });
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!firestore) return;
    setIsExportingPDF(true);
    try {
      let dataToExport = residents;
      if (dataToExport.length === 0) {
        const snap = await getDocs(query(collection(firestore, 'residents'), limit(5000)));
        dataToExport = snap.docs.map(d => ({ id: d.id, ...d.data() } as Resident));
      }

      if (dataToExport.length === 0) {
        toast({ title: "Data Kosong", description: "Tidak ada data penduduk untuk diunduh." });
        return;
      }

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PEMERINTAH KABUPATEN CILACAP', 148, 14, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text('KECAMATAN GANDRUNGMANGU - DESA KARANGGINTUNG', 148, 20, { align: 'center' });
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('LAPORAN DATA KEPENDUDUKAN DESA KARANGGINTUNG', 148, 26, { align: 'center' });
      pdf.setLineWidth(0.5);
      pdf.line(14, 29, 283, 29);

      const tableColumn = [
        'No', 'NIK', 'No. KK', 'Nama Lengkap', 'JK', 'Tgl Lahir', 'Agama', 'SHDK', 'Pekerjaan', 'RT/RW'
      ];

      const tableRows = dataToExport.map((r, index) => [
        index + 1,
        r.nik || '-',
        r.noKk || '-',
        r.fullName || '-',
        r.gender || '-',
        r.dateOfBirth || '-',
        r.religion || '-',
        r.relationshipToHeadOfFamily || '-',
        r.occupation || '-',
        `RT ${r.rt || '-'}/RW ${r.rw || '-'}`
      ]);

      autoTable(pdf, {
        head: [tableColumn],
        body: tableRows,
        startY: 33,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      const fileName = `Data_Penduduk_Desa_Karanggintung_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF Berhasil Diunduh",
        description: `${dataToExport.length} data penduduk telah diekspor ke file PDF.`,
      });
    } catch (error: any) {
      console.error("Error exporting PDF:", error);
      toast({ variant: "destructive", title: "Gagal Ekspor PDF", description: error.message });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const fetchTotalCount = async () => {
    if (!firestore) return;
    try {
      const coll = collection(firestore, 'residents');
      const snapshot = await getCountFromServer(coll);
      setTotalCount(snapshot.data().count);
    } catch (error) {
      console.error("Error fetching count:", error);
    }
  };

  useEffect(() => { if (firestore) fetchTotalCount(); }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!firestore) return;

    const term = searchTerm.trim();
    if (!term) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const residentsCol = collection(firestore, 'residents');

      if (/^\d{16}$/.test(term)) {
        const docRef = doc(firestore, 'residents', term);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setResidents([{ id: docSnap.id, ...docSnap.data() } as Resident]);
          setIsSearching(false);
          return;
        }

        const qNik = query(residentsCol, where('nik', '==', term), limit(1));
        const snapNik = await getDocs(qNik);
        if (!snapNik.empty) {
          const results: Resident[] = [];
          snapNik.forEach(d => results.push({ id: d.id, ...d.data() } as Resident));
          setResidents(results);
          setIsSearching(false);
          return;
        }
      }

      const nameTerm = term.toUpperCase();
      const qName = query(
        residentsCol,
        where('fullName', '>=', nameTerm),
        where('fullName', '<=', nameTerm + '\uf8ff'),
        limit(20)
      );

      const querySnapshot = await getDocs(qName);
      const results: Resident[] = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as Resident);
      });

      setResidents(results);

      if (results.length === 0) {
        toast({
          title: "Tidak Ditemukan",
          description: `Data "${term}" tidak ada di database.`,
        });
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        variant: "destructive",
        title: "Gagal Mencari",
        description: "Terjadi kesalahan kuota atau jaringan."
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'residents', id));
      setResidents(residents.filter(r => r.id !== id));
      if (totalCount !== null) setTotalCount(totalCount - 1);

      // Update demographic cache
      await recalculateStatistics(firestore);

      toast({ title: "Data Dihapus", description: "Data warga telah dihapus." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Gagal Menghapus", description: error.message });
    }
  };

  const handleDeleteAll = async () => {
    if (!firestore) return;
    setIsDeletingAll(true);

    try {
      const residentsCol = collection(firestore, 'residents');
      const snapshot = await getDocs(residentsCol);

      if (snapshot.empty) {
        toast({ title: "Database Kosong", description: "Tidak ada data yang bisa dihapus." });
        setIsDeletingAll(false);
        return;
      }

      let count = 0;
      const chunks = [];
      const allDocs = snapshot.docs;
      for (let i = 0; i < allDocs.length; i += 500) chunks.push(allDocs.slice(i, i + 500));

      for (const chunk of chunks) {
        const batch = writeBatch(firestore);
        chunk.forEach((d) => {
          batch.delete(d.ref);
          count++;
        });
        await batch.commit();
      }

      // Update demographic cache
      await recalculateStatistics(firestore);

      setResidents([]);
      setTotalCount(0);
      toast({ title: "Berhasil", description: `${count} data penduduk telah dihapus permanen.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Gagal Menghapus Semua", description: error.message });
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleSeedData = async () => {
    if (!firestore) return;
    setIsSeeding(true);
    try {
      await seedResidents(firestore);
      await recalculateStatistics(firestore);
      await fetchTotalCount();
      toast({
        title: "Data Testing Berhasil",
        description: "Beberapa data contoh telah ditambahkan ke database.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal Menambah Data",
        description: error.message,
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleRecalculate = async () => {
    if (!firestore) return;
    setIsRecalculating(true);
    try {
      await recalculateStatistics(firestore);
      await fetchTotalCount();
      toast({
        title: "Statistik Diperbarui",
        description: "Statistik kependudukan berhasil dihitung ulang dan disimpan.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal Memperbarui Statistik",
        description: error.message,
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleEdit = (resident: Resident) => {
    setEditingResident(resident);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingResident(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-primary/5 border-primary/20 rounded-2xl sm:rounded-3xl shadow-none">
          <CardHeader className="p-3.5 sm:p-5 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-bold flex items-center gap-2 text-slate-700">
              <Users className="h-4 w-4 text-primary shrink-0" />
              Statistik Database
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3.5 sm:p-5 pt-0">
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {totalCount === null ? <Skeleton className="h-7 w-20" /> : totalCount.toLocaleString('id-ID')}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground italic">Total dokumen penduduk</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-amber-800 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-0.5" />
          <p className="leading-snug">Sistem dioptimalkan untuk mencari berdasarkan <strong>NIK 16 digit</strong> atau <strong>Nama Depan</strong>. Database tidak dimuat semua sekaligus demi kecepatan dan penghematan kuota.</p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Masukkan NIK atau Nama..."
              className="pl-10 h-10 sm:h-11 rounded-xl text-xs sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isSearching}
            />
          </div>
          <Button type="submit" size="default" className="h-10 sm:h-11 px-6 sm:px-8 rounded-xl text-xs sm:text-sm font-bold" disabled={isSearching}>
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
            Cari
          </Button>
        </form>

        <div className="flex flex-col gap-2.5 sm:gap-3">
          {/* Tindakan Database */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="h-8 sm:h-9 text-[11px] sm:text-xs rounded-xl px-2.5 sm:px-3 font-semibold" disabled={isDeletingAll || totalCount === 0}>
                  {isDeletingAll ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-1.5 h-3.5 w-3.5" />}
                  Hapus Semua Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-[92vw] max-w-md rounded-2xl border-red-200 p-4 sm:p-6">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-red-600 text-sm sm:text-base font-bold">
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                    PERINGATAN KERAS!
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-3 text-xs sm:text-sm">
                      <p className="font-bold text-red-900">Tindakan ini akan menghapus SELURUH ({totalCount ?? 0}) data penduduk dari server secara permanen.</p>
                      <p>Pastikan Anda sudah memiliki cadangan data (backup) sebelum melanjutkan. Tindakan ini tidak dapat dibatalkan.</p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row gap-2 mt-4">
                  <AlertDialogCancel className="flex-1 mt-0 text-xs sm:text-sm">Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAll} className="flex-1 bg-red-600 text-white hover:bg-red-700 text-xs sm:text-sm">Ya, Hapus Semua</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="outline" size="sm" onClick={handleSeedData} disabled={isSeeding} className="h-8 sm:h-9 text-[11px] sm:text-xs rounded-xl px-2.5 sm:px-3 font-semibold">
              {isSeeding ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Database className="mr-1.5 h-3.5 w-3.5" />}
              Data Testing
            </Button>

            <Button variant="outline" size="sm" onClick={handleRecalculate} disabled={isRecalculating} className="h-8 sm:h-9 text-[11px] sm:text-xs rounded-xl px-2.5 sm:px-3 font-semibold border-emerald-600 text-emerald-700 hover:bg-emerald-50">
              {isRecalculating ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <BarChart3 className="mr-1.5 h-3.5 w-3.5" />}
              Update Statistik
            </Button>
          </div>

          {/* Ekspor & Tambah */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadExcel}
              disabled={isExportingExcel}
              className="h-8 sm:h-9 text-[11px] sm:text-xs rounded-xl px-2.5 sm:px-3 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold"
            >
              {isExportingExcel ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />}
              Unduh Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="h-8 sm:h-9 text-[11px] sm:text-xs rounded-xl px-2.5 sm:px-3 border-rose-600 text-rose-700 hover:bg-rose-50 font-semibold"
            >
              {isExportingPDF ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <FileText className="mr-1.5 h-3.5 w-3.5 text-rose-600" />}
              Unduh PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsImportOpen(true)} className="h-8 sm:h-9 text-[11px] sm:text-xs rounded-xl px-2.5 sm:px-3 font-semibold">
              <FileUp className="mr-1.5 h-3.5 w-3.5" />
              Impor Excel
            </Button>
            <Button variant="secondary" size="sm" onClick={handleAdd} className="h-8 sm:h-9 text-[11px] sm:text-xs rounded-xl px-2.5 sm:px-3 font-semibold">
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Tambah Manual
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl sm:rounded-[2rem] border bg-white overflow-hidden shadow-sm">
        {/* Mobile Card List View (block sm:hidden) - Full screen width, zero horizontal scrolling */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {isSearching ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3.5 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            ))
          ) : residents.length > 0 ? (
            residents.map((resident) => (
              <div key={resident.id} className="p-3.5 space-y-2.5 bg-white">
                {/* Header Kartu: Nama & Hubungan */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="font-black text-xs uppercase text-slate-800 leading-snug break-words">
                      {resident.fullName}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase">
                      <span>{resident.gender === 'L' || resident.gender === 'LAKI-LAKI' ? 'Laki-laki' : resident.gender === 'P' || resident.gender === 'PEREMPUAN' ? 'Perempuan' : resident.gender || '-'}</span>
                      {resident.dateOfBirth && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>{resident.dateOfBirth}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {resident.relationshipToHeadOfFamily && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md shrink-0">
                      {resident.relationshipToHeadOfFamily}
                    </span>
                  )}
                </div>

                {/* Identitas Kependudukan (NIK & No. KK) */}
                <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50/80 rounded-xl text-[10px]">
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block">NIK</span>
                    <span className="font-mono font-bold text-slate-700 tracking-tight">{resident.nik}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block">NO. KK</span>
                    <span className="font-mono font-bold text-slate-700 tracking-tight">{resident.noKk || '-'}</span>
                  </div>
                </div>

                {/* Alamat & Informasi Tambahan */}
                <div className="text-[10px] text-slate-600 space-y-1">
                  <p className="leading-tight">
                    <span className="font-bold text-slate-400">Alamat: </span>
                    {`${resident.address || ''}, RT ${resident.rt || '-'} RW ${resident.rw || '-'}, ${resident.kelurahan || 'Karanggintung'}`}
                  </p>
                  {(resident.religion || resident.occupation) && (
                    <p className="text-[9px] text-slate-400 font-medium">
                      {resident.religion ? <>Agama: <span className="text-slate-600 font-bold">{resident.religion}</span></> : null}
                      {resident.religion && resident.occupation ? ' • ' : null}
                      {resident.occupation ? <>Pekerjaan: <span className="text-slate-600 font-bold">{resident.occupation}</span></> : null}
                    </p>
                  )}
                </div>

                {/* Baris Tombol Aksi Sentuh */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(resident)}
                    className="h-8 text-[11px] font-bold rounded-lg flex-1 text-emerald-700 hover:text-emerald-800 border-emerald-200 hover:bg-emerald-50 gap-1.5"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit Data</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-2.5 text-[11px] font-bold rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 gap-1">
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Hapus</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="w-[92vw] max-w-md rounded-2xl p-4 sm:p-6">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm sm:text-base font-bold">Hapus Data Penduduk?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs sm:text-sm">
                          Data <strong>{resident.fullName}</strong> (NIK: {resident.nik}) akan dihapus permanen dari database.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-row gap-2 mt-4">
                        <AlertDialogCancel className="flex-1 mt-0 text-xs sm:text-sm">Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(resident.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm">
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs italic">
              {hasSearched ? "Data tidak ditemukan." : "Gunakan pencarian di atas untuk menampilkan data penduduk."}
            </div>
          )}
        </div>

        {/* Desktop Table View (hidden sm:block) */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>NIK</TableHead>
                <TableHead>KK</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Tgl Lahir</TableHead>
                <TableHead>JK</TableHead>
                <TableHead>Agama</TableHead>
                <TableHead>SHDK</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isSearching ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={9}><Skeleton className="h-12 w-full" /></TableCell></TableRow>
                ))
              ) : residents.length > 0 ? (
                residents.map((resident) => (
                  <TableRow key={resident.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-[10px]">{resident.nik}</TableCell>
                    <TableCell className="font-mono text-[10px]">{resident.noKk}</TableCell>
                    <TableCell className="font-medium uppercase text-[10px]">{resident.fullName}</TableCell>
                    <TableCell className="text-[10px] whitespace-nowrap">{resident.dateOfBirth}</TableCell>
                    <TableCell className="text-[10px]">{resident.gender || '-'}</TableCell>
                    <TableCell className="text-[10px]">{resident.religion || '-'}</TableCell>
                    <TableCell className="text-[10px] font-semibold">{resident.relationshipToHeadOfFamily || '-'}</TableCell>
                    <TableCell className="text-[10px] min-w-[300px]">
                      <p className="leading-tight truncate">
                        {`${resident.address}, RT ${resident.rt} RW ${resident.rw}, ${resident.kelurahan}Kec. Gandrungmangu, Kab. Cilacap`}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(resident)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <div className="flex w-full items-center px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 cursor-default">
                                <Trash2 className="mr-2 h-4 w-4" /> Hapus
                              </div>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Data?</AlertDialogTitle>
                                <AlertDialogDescription>Data {resident.fullName} akan dihapus permanen.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(resident.id)} className="bg-red-600 text-white">Ya, Hapus</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-48 text-center text-muted-foreground">
                    {hasSearched ? "Data tidak ditemukan." : "Gunakan pencarian untuk menampilkan data."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ResidentForm open={isFormOpen} onOpenChange={setIsFormOpen} resident={editingResident} />
      <ImportResidentDialog open={isImportOpen} onOpenChange={setIsImportOpen} />
    </div>
  );
}
