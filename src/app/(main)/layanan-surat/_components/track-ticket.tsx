'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LetterSubmission } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Info, Loader2, Search, XCircle } from 'lucide-react';
import { getSubmissionById } from '@/lib/submissions';
import { useFirebase } from '@/firebase';

export function TrackTicket() {
  const [ticketNumber, setTicketNumber] = useState('');
  const [searchResult, setSearchResult] = useState<LetterSubmission | 'not_found' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { firestore } = useFirebase();

  const handleSearch = async () => {
    if (!ticketNumber.trim()) {
      setSearchResult(null);
      return;
    }
    setIsLoading(true);
    setSearchResult(null);

    const foundSubmission = await getSubmissionById(firestore, ticketNumber.trim());

    if (foundSubmission) {
      setSearchResult(foundSubmission);
    } else {
      setSearchResult('not_found');
    }
    setIsLoading(false);
  };

  const getStatusInfo = (status: 'approved' | 'pending' | 'rejected' | 'processing') => {
    switch (status) {
      case 'approved':
        return {
          title: 'Telah Diproses',
          variant: 'default',
          icon: <CheckCircle className="h-4 w-4 text-emerald-500" />,
          description: 'Surat pengajuan Anda telah selesai diproses dan sudah bisa diambil ke Pelayanan Desa Karanggintung pada pukul 07.00 WIB s.d 16.00 WIB (Senin s.d Jumat). Terima Kasih.'
        };
      case 'pending':
      case 'processing':
        return {
          title: 'Sedang Diproses',
          variant: 'default',
          icon: <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />,
          description: 'Pengajuan Anda sedang dalam proses peninjauan oleh administrasi desa. Silakan cek kembali secara berkala.'
        };
      case 'rejected':
        return {
          title: 'Ditolak',
          variant: 'destructive',
          icon: <XCircle className="h-4 w-4" />,
          description: 'Maaf, pengajuan Anda ditolak. Silakan hubungi kantor desa untuk informasi lebih lanjut.'
        };
    }
  }

  return (
    <Card className="rounded-2xl sm:rounded-3xl border-none shadow-sm sm:shadow-md bg-white overflow-hidden">
      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
        <CardTitle className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 font-display">Cek Status Pengajuan</CardTitle>
        <CardDescription className="text-xs sm:text-sm text-slate-500 font-medium">Masukkan kode tiket Anda untuk melacak progres pengajuan surat.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-2 sm:pt-3">
        <div className="flex w-full max-w-md items-center space-x-2">
          <Input
            type="text"
            placeholder="Contoh: Abc123Xyz..."
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            disabled={isLoading}
            onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
            className="h-9 sm:h-11 rounded-xl text-xs sm:text-sm border-slate-200"
          />
          <Button onClick={handleSearch} disabled={isLoading || !firestore} className="h-9 sm:h-11 rounded-xl px-3 sm:px-5 font-bold text-xs sm:text-sm shrink-0">
            {isLoading ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            <span className="ml-1.5 sm:ml-2">Cek Tiket</span>
          </Button>
        </div>

        {searchResult && (
          <div className="mt-4 sm:mt-6">
            {searchResult === 'not_found' ? (
              <Alert variant="destructive" className="rounded-xl">
                <Info className="h-4 w-4" />
                <AlertTitle className="text-xs sm:text-sm font-bold">Tidak Ditemukan</AlertTitle>
                <AlertDescription className="text-[11px] sm:text-xs">
                  Kode tiket tidak ditemukan. Pastikan Anda memasukkan kode yang benar.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant={getStatusInfo(searchResult.status).variant as 'default' | 'destructive'} className="rounded-xl">
                {getStatusInfo(searchResult.status).icon}
                <AlertTitle className="text-xs sm:text-sm font-bold">{getStatusInfo(searchResult.status).title}</AlertTitle>
                <AlertDescription className="text-[11px] sm:text-xs leading-relaxed">
                  {getStatusInfo(searchResult.status).description}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
