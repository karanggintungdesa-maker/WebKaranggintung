'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, deleteDoc, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { News } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Star, Circle, CheckCircle2, PlusCircle } from 'lucide-react';
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
import Link from 'next/link';

export function NewsList() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const newsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return firestore ? query(collection(firestore, 'news'), orderBy('updatedAt', 'desc')) : null;
  }, [firestore]);

  const { data: news, isLoading } = useCollection<News>(newsQuery);

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'news', id));
      toast({ title: "Berita Dihapus" });
    } catch (e: any) {
      toast({ title: "Gagal Menghapus", variant: "destructive" });
    }
  };

  const handleSetHeadline = async (id: string) => {
    if (!firestore || !news) return;
    try {
      const batch = writeBatch(firestore);
      news.forEach((item) => {
        const itemRef = doc(firestore, 'news', item.id);
        const shouldBeHeadline = item.id === id;
        if (item.isHeadline !== shouldBeHeadline) {
          batch.update(itemRef, { isHeadline: shouldBeHeadline, updatedAt: serverTimestamp() });
        }
      });
      await batch.commit();
      toast({ title: 'Headline berhasil diperbarui' });
    } catch (e: any) {
      toast({ title: 'Gagal memperbarui headline', description: e?.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 bg-white p-4 rounded-2xl border shadow-sm">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl sm:rounded-[2rem] border bg-white overflow-hidden shadow-sm">
      {/* Header Bar Berita */}
      <div className="p-3 sm:p-5 border-b bg-slate-50/50 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs sm:text-base font-black uppercase tracking-tight text-slate-800">Daftar Publikasi Berita</h3>
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Kelola status headline, edit, atau hapus artikel berita desa.</p>
        </div>
        <Button asChild size="sm" className="h-8 px-2.5 sm:px-3 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl shadow-xs shrink-0">
          <Link href="/admin/berita/buat">
            <PlusCircle className="mr-1 h-3.5 w-3.5" />
            <span>Tulis Berita</span>
          </Link>
        </Button>
      </div>

      {/* Tampilan Mobile: Kartu Penuh 1 Layar (Tanpa Perlu Menggeser ke Samping) */}
      <div className="block sm:hidden divide-y divide-slate-100">
        {news?.length === 0 ? (
          <div className="text-center h-28 flex items-center justify-center text-muted-foreground text-xs italic">
            Belum ada berita.
          </div>
        ) : (
          (news || []).map((item) => {
            const photoCount = item.imageUrls?.length || (item.imageUrl ? 1 : 0);
            const thumbUrl = item.imageUrls?.[0] || item.imageUrl;

            return (
              <div key={item.id} className="p-3 space-y-2 bg-white hover:bg-slate-50/60 transition-colors">
                {/* Baris Atas: Thumbnail + Judul + Penulis */}
                <div className="flex items-start gap-2.5">
                  <div className="relative shrink-0">
                    <img
                      src={thumbUrl?.replace('/image/upload/', '/image/upload/w_200,q_auto,f_auto/') || '/placeholder.jpg'}
                      className="h-14 w-20 object-cover rounded-lg border border-slate-200"
                      loading="lazy"
                      alt={item.title}
                    />
                    {photoCount > 1 && (
                      <Badge className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[8px] font-bold px-1 py-0 h-4 min-w-4 flex items-center justify-center rounded-full shadow">
                        {photoCount}
                      </Badge>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <h4 className="font-bold text-xs leading-snug line-clamp-2 text-slate-850">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      Oleh: {item.author || 'Admin'}
                    </p>
                    <div className="flex items-center gap-1.5 pt-0.5 text-[9px] text-slate-400 font-mono">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span className="uppercase font-sans font-bold text-slate-500">
                        {item.mediaType === 'video' || item.videoUrl ? 'Video' : `Foto (${photoCount})`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Baris Bawah: Headline Button & Tombol Aksi */}
                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleSetHeadline(item.id)}
                    className="flex items-center gap-1 text-[10px] font-bold py-0.5 px-1.5 rounded-md transition-colors"
                  >
                    {item.isHeadline ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full text-[8px] font-black tracking-wider">
                        <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                        HEADLINE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 text-[9px] font-semibold hover:text-slate-600">
                        <Circle className="h-2.5 w-2.5" />
                        Jadikan Headline
                      </span>
                    )}
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] rounded-lg gap-1 border-slate-200 hover:bg-slate-50" asChild>
                      <Link href={`/BeritaDesa/detail?id=${item.id}`} target="_blank">
                        <Eye className="h-3 w-3 text-slate-600" />
                        <span>Lihat</span>
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] rounded-lg gap-1 border-slate-200 hover:bg-slate-50" asChild>
                      <Link href={`/admin/berita/edit?id=${item.id}`}>
                        <Edit className="h-3 w-3 text-slate-600" />
                        <span>Edit</span>
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" className="h-7 w-7 rounded-lg">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-[92vw] sm:max-w-md rounded-2xl p-5 sm:p-6">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-base sm:text-lg font-black uppercase">Hapus Berita?</AlertDialogTitle>
                          <AlertDialogDescription className="text-xs sm:text-sm">Tindakan ini permanen. Berita tidak dapat dikembalikan.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-2">
                          <AlertDialogCancel className="h-9 rounded-xl text-xs font-bold">Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item.id)} className="h-9 rounded-xl bg-red-600 text-xs font-bold">Ya, Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tampilan Desktop / Tablet: Tabel Lengkap */}
      <div className="hidden sm:block overflow-x-auto w-full">
        <Table className="min-w-[640px]">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px] sm:w-[100px]">Gambar</TableHead>
              <TableHead>Judul Berita</TableHead>
              <TableHead>Media</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Headline</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Belum ada berita.</TableCell></TableRow>
            ) : (
              (news || []).map((item) => {
                const photoCount = item.imageUrls?.length || (item.imageUrl ? 1 : 0);
                const thumbUrl = item.imageUrls?.[0] || item.imageUrl;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="relative inline-block">
                        <img
                          src={thumbUrl?.replace('/image/upload/','/image/upload/w_300,q_auto,f_auto/') || '/placeholder.jpg'}
                          className="h-10 w-16 object-cover rounded border"
                          loading="lazy"
                          alt={item.title}
                        />
                        {photoCount > 1 && (
                          <Badge className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[8px] font-bold px-1 py-0 h-4 min-w-4 flex items-center justify-center rounded-full shadow">
                            {photoCount}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-bold text-sm line-clamp-1">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground">{item.author}</p>
                    </TableCell>
                    <TableCell className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">
                      {item.mediaType === 'video' || item.videoUrl ? 'Video' : `Foto (${photoCount})`}
                    </TableCell>
                    <TableCell className="text-[10px] whitespace-nowrap">{item.date}</TableCell>
                    <TableCell className="space-y-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-emerald-700"
                        onClick={() => handleSetHeadline(item.id)}
                        aria-label={item.isHeadline ? 'Headline saat ini' : 'Jadikan headline'}
                      >
                        {item.isHeadline ? <CheckCircle2 className="h-5 w-5 text-amber-500" /> : <Circle className="h-5 w-5" />}
                      </Button>
                      {item.isHeadline && (
                        <Badge variant="default" className="bg-amber-100 text-amber-700 border-amber-200 text-[9px] gap-1 px-2 py-0">
                          <Star className="h-2.5 w-2.5 fill-amber-500" /> HEADLINE
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/BeritaDesa/detail?id=${item.id}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/admin/berita/edit?id=${item.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Berita?</AlertDialogTitle>
                              <AlertDialogDescription>Tindakan ini permanen. Berita tidak dapat dikembalikan.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-600">Ya, Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
