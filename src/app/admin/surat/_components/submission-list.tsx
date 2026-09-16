'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, CheckCircle, XCircle, Printer, Trash2, Eye, Loader2, FileSignature, Download, Phone, Mail, FileDown, UserCheck, FileText, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LetterSubmission, UploadedFile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import {
  getLetterRequestsQuery,
  updateSubmissionStatus,
  deleteSubmission,
  setSubmissionDocumentNumber,
} from '@/lib/submissions';
import { query as firestoreQuery, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { generateDocumentNumber } from '@/lib/gemini-client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Helper to open Google Drive file download link
const openGoogleDriveDownloadLink = (fileId: string) => {
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};


export function SubmissionList() {
  const [selectedSubmission, setSelectedSubmission] = useState<LetterSubmission | null>(null);
  const [manualNumberSubmission, setManualNumberSubmission] = useState<LetterSubmission | null>(null);
  const [manualNumberInput, setManualNumberInput] = useState<string>('');
  const [isSubmittingManualNumber, setIsSubmittingManualNumber] = useState<boolean>(false);

  // State for Signatory Choice
  const [signatorySubmission, setSignatorySubmission] = useState<LetterSubmission | null>(null);
  const [selectedSigner, setSelectedSigner] = useState<'kades' | 'sekdes'>('kades');

  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const isAdminFromStorage = typeof window !== 'undefined' && localStorage.getItem('isAdmin') === 'true';
  const isAdmin = isAdminFromStorage || !!(user && !user.isAnonymous);

  const query = useMemoFirebase(() => {
    if (!firestore || !user) return null;

    if (!isAdmin) {
      if (user.isAnonymous) return null;
      return firestoreQuery(
        getLetterRequestsQuery(firestore),
        where('requestorAuthUid', '==', (user as any).uid)
      );
    }

    return getLetterRequestsQuery(firestore);
  }, [firestore, user, isAdmin]);

  const { data: submissionsData, isLoading } = useCollection<LetterSubmission>(query, { realtime: true });

  const submissions = useMemo(() => {
    if (!submissionsData) return [];
    return submissionsData.map(sub => {
      // Robust parsing for data that might be spread at top level or in submissionData string
      let formData = {};
      if (sub.submissionData && typeof sub.submissionData === 'string') {
        try {
          formData = JSON.parse(sub.submissionData);
        } catch (e) {
          console.warn("Failed to parse legacy submissionData", e);
        }
      } else {
        // New format: everything is already top level. We use the object itself as formData,
        // but we can clean it up for the "Detail" view later.
        formData = sub;
      }

      return {
        ...sub,
        formData,
        date: sub.createdAt?.toDate()?.toISOString() ?? new Date().toISOString(),
      };
    })
  }, [submissionsData]);

  const handleDownload = (file: UploadedFile) => {
    openGoogleDriveDownloadLink(file.fileId);
  };

  const handleManualNumberSubmit = async () => {
    if (!manualNumberSubmission || !manualNumberInput || !firestore) return;

    const manualNumber = parseInt(manualNumberInput, 10);
    if (isNaN(manualNumber) || manualNumber <= 0) {
      toast({
        title: "Nomor Tidak Valid",
        description: "Silakan masukkan nomor surat yang valid.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingManualNumber(true);
    try {
      const formattedNumber = await generateDocumentNumber({ manualNumber });
      await setSubmissionDocumentNumber(firestore, manualNumberSubmission.id, formattedNumber);

      toast({
        title: "Nomor Surat Dibuat",
        description: `Nomor baru ${formattedNumber} telah disimpan.`,
      });

    } catch (e: any) {
      toast({
        title: "Gagal Membuat Nomor",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingManualNumber(false);
      setManualNumberInput('');
      setManualNumberSubmission(null);
    }
  };

  const handleStatusChange = async (
    id: string,
    status: 'approved' | 'rejected'
  ) => {
    if (!firestore) return;
    try {
      await updateSubmissionStatus(firestore, id, status);

      toast({
        title: `Status Diperbarui`,
        description: `Pengajuan telah ${status === 'approved' ? 'Disetujui' : 'Ditolak'
          }.`,
      });

    } catch (e) {
      console.error(e);
    }
  };

  const confirmPrint = () => {
    if (!signatorySubmission) return;
    const submissionId = signatorySubmission.id;
    setSignatorySubmission(null);
    const printUrl = `/print/preview?id=${encodeURIComponent(submissionId)}&signer=${encodeURIComponent(selectedSigner)}`;
    window.open(printUrl, '_blank');
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteSubmission(firestore, id);
      toast({
        title: `Pengajuan Dihapus`,
        variant: 'destructive',
      });
    } catch (e) {
      console.error(e);
    }
  };

  const formatLabel = (key: string) => {
    const result = key.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  const formatValue = (value: any) => {
    if (value instanceof Date) {
      return value.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    }
    if (typeof value === 'object' && value !== null) {
      if ('toDate' in value && typeof value.toDate === 'function') {
        return value.toDate().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
      }
      if ('seconds' in value && typeof value.seconds === 'number') {
        return new Date(value.seconds * 1000).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
      }
      if ('name' in value) return value.name;
    }
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
  }

  const statusVariant = {
    pending: 'secondary',
    approved: 'default',
    rejected: 'destructive',
    processing: 'secondary',
  } as const;

  const statusText = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    processing: 'Memproses',
  };

  if (isLoading || !user) {
    return (
      <div className="p-4 sm:p-8 space-y-3 sm:space-y-4">
        <Skeleton className="h-10 sm:h-14 w-full rounded-xl sm:rounded-2xl" />
        <Skeleton className="h-10 sm:h-14 w-full rounded-xl sm:rounded-2xl" />
        <Skeleton className="h-10 sm:h-14 w-full rounded-xl sm:rounded-2xl" />
      </div>
    )
  }

  return (
    <>
      {/* Tampilan Mobile: Kartu Responsif Penuh 1 Layar (Tanpa Perlu Menggeser ke Samping) */}
      <div className="block sm:hidden divide-y divide-slate-100">
        {submissions.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-center text-slate-400 font-medium italic text-xs p-4">
            Belum ada pengajuan yang masuk.
          </div>
        ) : (
          submissions.map((submission) => (
            <div key={submission.id} className="p-3 space-y-2 bg-white hover:bg-slate-50/70 transition-colors">
              {/* Baris 1: Nama Pemohon & Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-xs uppercase text-slate-800 leading-tight truncate">
                    {submission.requesterName}
                  </h4>
                  <div className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">
                    NIK: {submission.nik}
                  </div>
                </div>
                <Badge
                  variant={statusVariant[submission.status]}
                  className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                >
                  {submission.status === 'processing' && <Loader2 className="mr-1 h-2 w-2 animate-spin" />}
                  {statusText[submission.status]}
                </Badge>
              </div>

              {/* Baris 2: Jenis Surat & Tanggal */}
              <div className="flex items-center justify-between gap-2 text-[10px]">
                <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded font-bold uppercase text-[9px] truncate max-w-[190px]">
                  <FileText className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{submission.letterType}</span>
                </div>
                <span className="text-slate-400 font-medium text-[10px] shrink-0">
                  {new Date(submission.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* Baris 3: Nomor Surat & Tombol Opsi */}
              <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100">
                <div className="min-w-0 flex-1">
                  {submission.documentNumber ? (
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase">No:</span>
                      <span className="font-mono text-[9px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 truncate inline-block max-w-[130px]">
                        {submission.documentNumber}
                      </span>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setManualNumberSubmission(submission)}
                      disabled={submission.status !== 'approved'}
                      className="h-6 px-2 text-[8px] font-black uppercase tracking-wider rounded-md border-slate-200 gap-1"
                    >
                      <FileSignature className="mr-1 h-2.5 w-2.5" />
                      <span>Buat Nomor</span>
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTimeout(() => setSelectedSubmission(submission), 100);
                    }}
                    className="h-7 px-2 text-[10px] font-bold text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Detail</span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg border-slate-200 hover:bg-slate-100">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl p-2 font-sans text-xs w-48">
                      <DropdownMenuLabel className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Opsi Pengelolaan</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => {
                        setTimeout(() => setSelectedSubmission(submission), 100);
                      }} className="rounded-lg font-bold cursor-pointer text-xs">
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        <span>Lihat Detail</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="opacity-50" />
                      <DropdownMenuItem onClick={() => handleStatusChange(submission.id, 'approved')} className="rounded-lg font-bold cursor-pointer text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 text-xs">
                        <CheckCircle className="mr-2 h-3.5 w-3.5" />
                        <span>Setujui</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(submission.id, 'rejected')} className="rounded-lg font-bold cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 text-xs">
                        <XCircle className="mr-2 h-3.5 w-3.5" />
                        <span>Tolak</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => {
                          setTimeout(() => setSignatorySubmission(submission), 100);
                        }}
                        disabled={submission.status !== 'approved' || !submission.documentNumber}
                        className="rounded-lg font-bold cursor-pointer text-xs"
                      >
                        <Printer className="mr-2 h-3.5 w-3.5" />
                        <span>Cetak Dokumen</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => {
                          setTimeout(() => setSignatorySubmission(submission), 100);
                        }}
                        disabled={submission.status !== 'approved' || !submission.documentNumber}
                        className="rounded-lg font-bold cursor-pointer text-xs"
                      >
                        <FileDown className="mr-2 h-3.5 w-3.5" />
                        <span>Unduh PDF</span>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="opacity-50" />
                      <DropdownMenuItem onClick={() => handleDelete(submission.id)} className="rounded-lg font-bold cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50 text-xs">
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        <span>Hapus Permanen</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tampilan Desktop / Tablet: Tabel Lengkap */}
      <div className="hidden sm:block overflow-x-auto w-full">
        <Table className="w-full min-w-[640px]">
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="pl-3.5 sm:pl-8 h-10 sm:h-14 font-black uppercase text-[9px] sm:text-[10px] tracking-wider text-slate-400">Pemohon</TableHead>
              <TableHead className="hidden sm:table-cell h-10 sm:h-14 font-black uppercase text-[9px] sm:text-[10px] tracking-wider text-slate-400">Jenis Surat</TableHead>
              <TableHead className="h-10 sm:h-14 font-black uppercase text-[9px] sm:text-[10px] tracking-wider text-slate-400">Nomor Surat</TableHead>
              <TableHead className="hidden md:table-cell h-10 sm:h-14 font-black uppercase text-[9px] sm:text-[10px] tracking-wider text-slate-400">Tanggal</TableHead>
              <TableHead className="text-center h-10 sm:h-14 font-black uppercase text-[9px] sm:text-[10px] tracking-wider text-slate-400">Status</TableHead>
              <TableHead className="text-right pr-3.5 sm:pr-8 h-10 sm:h-14 font-black uppercase text-[9px] sm:text-[10px] tracking-wider text-slate-400">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-48 text-center text-slate-400 font-medium italic text-xs sm:text-sm">Belum ada pengajuan yang masuk.</TableCell></TableRow>
            ) : (
              submissions.map((submission) => (
                <TableRow key={submission.id} className="hover:bg-slate-50/80 transition-colors group">
                  <TableCell className="pl-3.5 sm:pl-8 py-2.5 sm:py-5">
                    <div className="font-black text-xs sm:text-sm uppercase text-slate-700 leading-tight truncate max-w-[120px] sm:max-w-none">{submission.requesterName}</div>
                    <div className="flex flex-wrap items-center gap-1 mt-0.5">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold font-mono tracking-tighter">{submission.nik}</span>
                      <span className="sm:hidden text-[8px] font-black uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded leading-none">{submission.letterType}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{submission.letterType}</span>
                  </TableCell>
                  <TableCell className="py-2.5 sm:py-5">
                    {submission.documentNumber ? (
                      <span className="font-mono text-[9px] sm:text-[11px] font-black text-primary bg-primary/5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg border border-primary/10 truncate inline-block max-w-[95px] sm:max-w-none">{submission.documentNumber}</span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setManualNumberSubmission(submission)}
                        disabled={submission.status !== 'approved'}
                        className="h-7 sm:h-8 px-2 sm:px-3 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest border-slate-200 whitespace-nowrap"
                      >
                        <FileSignature className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                        <span>Buat Nomor</span>
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-[10px] font-bold text-slate-400 uppercase">
                    {new Date(submission.date).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell className="text-center py-2.5 sm:py-5">
                    <Badge variant={statusVariant[submission.status]} className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider sm:tracking-widest px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                      {submission.status === 'processing' && <Loader2 className="mr-1 sm:mr-1.5 h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin" />}
                      {statusText[submission.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-3.5 sm:pr-8 py-2.5 sm:py-5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl hover:bg-slate-200">
                          <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl p-2 font-sans text-xs">
                        <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Opsi Pengelolaan</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                          setTimeout(() => setSelectedSubmission(submission), 100);
                        }} className="rounded-xl font-bold cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Lihat Detail</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="opacity-50" />
                        <DropdownMenuItem onClick={() => handleStatusChange(submission.id, 'approved')} className="rounded-xl font-bold cursor-pointer text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"><CheckCircle className="mr-2 h-4 w-4" /><span>Setujui</span></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(submission.id, 'rejected')} className="rounded-xl font-bold cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"><XCircle className="mr-2 h-4 w-4" /><span>Tolak</span></DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            setTimeout(() => setSignatorySubmission(submission), 100);
                          }}
                          disabled={submission.status !== 'approved' || !submission.documentNumber}
                          className="rounded-xl font-bold cursor-pointer"
                        >
                          <Printer className="mr-2 h-4 w-4" /><span>Cetak Dokumen</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            setTimeout(() => setSignatorySubmission(submission), 100);
                          }}
                          disabled={submission.status !== 'approved' || !submission.documentNumber}
                          className="rounded-xl font-bold cursor-pointer"
                        >
                          <FileDown className="mr-2 h-4 w-4" /><span>Unduh PDF</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="opacity-50" />
                        <DropdownMenuItem onClick={() => handleDelete(submission.id)} className="rounded-xl font-bold cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50"><Trash2 className="mr-2 h-4 w-4" /><span>Hapus Permanen</span></DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedSubmission}
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen) {
            setSelectedSubmission(null);
            if (typeof document !== 'undefined') {
              document.body.style.pointerEvents = 'auto';
            }
          }
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-2xl rounded-2xl sm:rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="bg-primary p-4 sm:p-8 md:p-10 text-white shrink-0">
            <DialogTitle className="text-base sm:text-2xl font-black uppercase tracking-tight leading-tight italic">Detail Pengajuan: {selectedSubmission?.letterType}</DialogTitle>
            <DialogDescription className="text-white/50 text-[10px] sm:text-xs font-medium">ID: {selectedSubmission?.id}</DialogDescription>
          </DialogHeader>

          <div className="p-4 sm:p-8 space-y-5 sm:space-y-8 overflow-y-auto flex-1">
            {selectedSubmission && (
              <>
                <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 bg-white rounded-lg sm:rounded-xl shadow-sm"><Phone className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] sm:text-[10px] text-emerald-600/70 font-black uppercase tracking-widest">WhatsApp</p>
                      <p className="text-xs sm:text-sm font-black truncate">{selectedSubmission.phoneNumber || 'Tidak ada'}</p>
                    </div>
                  </div>
                  <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-teal-50 border border-teal-100 flex items-center gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 bg-white rounded-lg sm:rounded-xl shadow-sm"><Mail className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] sm:text-[10px] text-teal-600/70 font-black uppercase tracking-widest">Email</p>
                      <p className="text-xs sm:text-sm font-black truncate">{selectedSubmission.email || 'Tidak ada'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 border-l-4 border-primary pl-2.5 sm:pl-3">Data Formulir Warga</h4>
                  <div className="rounded-xl sm:rounded-3xl border border-slate-100 overflow-hidden">
                    <Table>
                      <TableBody>
                        {Object.entries(selectedSubmission.formData).map(([key, value]) => {
                          // Skip internal fields
                          if (['id', 'status', 'createdAt', 'updatedAt', 'formData', 'fileLinks', 'letterType', 'requestorAuthUid', 'ticketNumber', 'nik', 'requesterName', 'documentNumber'].includes(key)) return null;
                          return (
                            <TableRow key={key} className="hover:bg-transparent">
                              <TableCell className="font-black uppercase text-[8px] sm:text-[9px] tracking-widest text-slate-400 bg-slate-50/50 w-1/3 p-2.5 sm:p-4">{formatLabel(key)}</TableCell>
                              <TableCell className="text-xs font-bold text-slate-700 py-2.5 sm:py-4 px-3 sm:px-4">{formatValue(value)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {selectedSubmission.fileLinks && selectedSubmission.fileLinks.length > 0 && (
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 border-l-4 border-primary pl-2.5 sm:pl-3">Berkas Lampiran (Google Drive)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      {selectedSubmission.fileLinks.map((file) => (
                        <Button key={file.fileId} variant="outline" className="justify-between h-auto py-3 sm:py-4 px-3.5 sm:px-6 rounded-xl sm:rounded-2xl border-slate-100 bg-slate-50/30 hover:bg-primary hover:text-white transition-all group" onClick={() => handleDownload(file)}>
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 group-hover:text-white shrink-0" />
                            <span className="font-bold text-[9px] sm:text-[10px] uppercase tracking-widest truncate">{formatLabel(file.fieldName)}</span>
                          </div>
                          <FileSignature className="h-3 w-3 opacity-20 shrink-0" />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="p-3.5 sm:p-6 bg-slate-50 border-t shrink-0">
            <Button className="w-full h-10 sm:h-12 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm" onClick={() => { setSelectedSubmission(null); if (typeof document !== 'undefined') document.body.style.pointerEvents = 'auto'; }}>Tutup Jendela</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Number Dialog */}
      <Dialog open={!!manualNumberSubmission} onOpenChange={(isOpen: boolean) => { if (!isOpen) { setManualNumberSubmission(null); if (typeof document !== 'undefined') document.body.style.pointerEvents = 'auto'; } }}>
        <DialogContent className="w-[92vw] sm:max-w-[400px] rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-lg sm:text-2xl font-black uppercase tracking-tight italic">Buat Nomor Surat</DialogTitle>
            <DialogDescription className="font-medium text-xs sm:text-sm">Masukkan nomor urut surat resmi untuk pengajuan ini.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:gap-6 py-4 sm:py-6">
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="manual-number" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nomor Urut Surat</Label>
              <Input id="manual-number" type="number" value={manualNumberInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualNumberInput(e.target.value)} placeholder="Contoh: 152" disabled={isSubmittingManualNumber} className="h-12 sm:h-14 rounded-xl sm:rounded-2xl text-lg sm:text-xl font-black text-center" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleManualNumberSubmit} disabled={isSubmittingManualNumber || !manualNumberInput} className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm shadow-xl shadow-primary/20">
              {isSubmittingManualNumber ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSignature className="mr-2 h-4 w-4" />}
              Simpan & Format Nomor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Signatory Choice Dialog */}
      <Dialog open={!!signatorySubmission} onOpenChange={(isOpen: boolean) => { if (!isOpen) { setSignatorySubmission(null); if (typeof document !== 'undefined') document.body.style.pointerEvents = 'auto'; } }}>
        <DialogContent className="w-[92vw] sm:max-w-[450px] rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 border-none shadow-2xl">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl font-black uppercase tracking-tight italic">
              <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
              Pilih Penandatangan
            </DialogTitle>
            <DialogDescription className="font-medium text-xs sm:text-sm">
              Tentukan siapa yang akan menandatangani dokumen ini.
            </DialogDescription>
          </DialogHeader>

          <div className="py-5 sm:py-8">
            <RadioGroup value={selectedSigner} onValueChange={(v: string) => setSelectedSigner(v as 'kades' | 'sekdes')} className="grid gap-3 sm:gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-slate-100 cursor-pointer hover:bg-slate-50 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
                <RadioGroupItem value="kades" id="signer-kades" />
                <Label htmlFor="signer-kades" className="flex-1 cursor-pointer space-y-0.5 sm:space-y-1">
                  <p className="font-black uppercase tracking-tight text-slate-800 text-xs sm:text-sm">Kepala Desa</p>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">TURMONO</p>
                </Label>
              </div>

              <div className="flex items-center space-x-3 sm:space-x-4 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-slate-100 cursor-pointer hover:bg-slate-50 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
                <RadioGroupItem value="sekdes" id="signer-sekdes" />
                <Label htmlFor="signer-sekdes" className="flex-1 cursor-pointer space-y-0.5 sm:space-y-1">
                  <p className="font-black uppercase tracking-tight text-slate-800 text-xs sm:text-sm">Sekretaris Desa</p>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">ARIS YULIANTO</p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
            <Button variant="outline" className="flex-1 h-10 sm:h-12 rounded-xl font-bold text-xs sm:text-sm" onClick={() => { setSignatorySubmission(null); if (typeof document !== 'undefined') document.body.style.pointerEvents = 'auto'; }}>BATAL</Button>
            <Button onClick={confirmPrint} className="flex-1 h-10 sm:h-12 rounded-xl font-black uppercase tracking-widest text-xs sm:text-sm shadow-lg shadow-primary/20">LANJUTKAN CETAK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
