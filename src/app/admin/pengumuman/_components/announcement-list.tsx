'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, Megaphone, FileText, ImageIcon } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { Announcement } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
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
import { Badge } from '@/components/ui/badge';

export function AnnouncementList() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const announcementsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'announcements'), orderBy('publishDate', 'desc'));
  }, [firestore]);

  const { data: announcements, isLoading } = useCollection<Announcement>(announcementsQuery);

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'announcements', id);
    try {
      await deleteDoc(docRef);
      toast({
        title: "Pengumuman Dihapus",
        description: "Pengumuman telah berhasil dihapus.",
      });
    } catch (error) {
      console.error("Error deleting announcement: ", error);
      toast({
        title: "Gagal Menghapus",
        description: "Terjadi kesalahan saat menghapus pengumuman.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
        <CardHeader className="p-3.5 sm:p-6 bg-slate-50/50 border-b border-slate-100">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3.5 w-64 mt-1" />
        </CardHeader>
        <CardContent className="p-3.5 sm:p-6 space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
      <CardHeader className="p-3.5 sm:p-6 bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm sm:text-lg font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
              <Megaphone className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 shrink-0" />
              <span>Daftar Pengumuman Terbit</span>
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">
              Daftar seluruh pengumuman resmi yang sedang aktif ditampilkan di portal desa.
            </CardDescription>
          </div>
          <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1">
            {announcements?.length || 0} Pengumuman
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3.5 sm:p-6">
        {!announcements || announcements.length === 0 ? (
          <div className="text-center py-10 sm:py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
            <Megaphone className="h-8 w-8 sm:h-10 sm:w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-bold text-slate-600">Belum Ada Pengumuman Terbit</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Gunakan formulir di atas untuk menerbitkan pengumuman baru.</p>
          </div>
        ) : (
          <>
            {/* Tampilan Mobile Penuh 1 Layar (Card List View) */}
            <div className="block sm:hidden space-y-3">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200/80 bg-white p-3 space-y-2.5 shadow-2xs hover:border-emerald-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs text-slate-800 leading-snug line-clamp-2 flex-1">
                      {item.title}
                    </h4>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />
                      {item.publishDate?.toDate ? item.publishDate.toDate().toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : '-'}
                    </span>
                  </div>

                  {item.imageUrl && (
                    <div className="relative aspect-video max-h-32 w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-100">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[9px] font-semibold text-slate-400">
                      Oleh: {item.authorName || 'Admin Desa'}
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7 px-2.5 text-[10px] font-bold rounded-lg shadow-2xs flex items-center gap-1 bg-rose-600 hover:bg-rose-700"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Hapus</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-[92vw] sm:max-w-md rounded-2xl p-4 sm:p-6">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-sm sm:text-base font-bold text-slate-800">
                            Hapus Pengumuman?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-xs text-slate-500">
                            Pengumuman "{item.title}" akan dihapus permanen dari sistem dan portal warga.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2 sm:gap-0 mt-3">
                          <AlertDialogCancel className="rounded-xl text-xs font-bold h-9">Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                            className="rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 h-9"
                          >
                            Ya, Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>

            {/* Tampilan Desktop / Tablet (Table View) */}
            <div className="hidden sm:block rounded-xl border border-slate-200/80 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Judul Pengumuman</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Tanggal Terbit</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((announcement) => (
                    <TableRow key={announcement.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-semibold text-slate-800 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          {announcement.imageUrl && (
                            <ImageIcon className="h-4 w-4 text-emerald-600 shrink-0" />
                          )}
                          <span className="line-clamp-1">{announcement.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>
                            {announcement.publishDate?.toDate ? announcement.publishDate.toDate().toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }) : '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 px-2.5 rounded-lg text-xs font-bold shadow-2xs hover:bg-rose-700"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              <span>Hapus</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="w-[95vw] sm:max-w-md rounded-2xl p-6">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-base font-bold text-slate-800">
                                Anda yakin ingin menghapus?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-xs text-slate-500">
                                Aksi ini tidak dapat dibatalkan. Pengumuman "{announcement.title}" akan dihapus secara permanen dari server.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
                              <AlertDialogCancel className="rounded-xl text-xs font-bold">Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(announcement.id)}
                                className="rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700"
                              >
                                Ya, Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
