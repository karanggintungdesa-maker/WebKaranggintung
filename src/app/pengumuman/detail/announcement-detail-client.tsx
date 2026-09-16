'use client';

import React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Announcement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, User, Megaphone, Milestone, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { BackgroundPattern } from '@/components/landing/BackgroundPattern';

export function AnnouncementDetailClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawId = params?.id as string;
  const queryId = searchParams?.get('id');

  let id = '';
  if (queryId) {
    id = decodeURIComponent(queryId).trim();
  } else if (rawId && rawId !== 'preview') {
    id = decodeURIComponent(rawId).trim();
  } else if (typeof window !== 'undefined') {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && lastPart !== 'pengumuman' && lastPart !== 'detail' && lastPart !== 'preview') {
      id = decodeURIComponent(lastPart).trim();
    }
  }

  const router = useRouter();
  const firestore = useFirestore();

  const announcementRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'announcements', id);
  }, [firestore, id]);

  const { data: announcement, isLoading } = useDoc<Announcement>(announcementRef);

  const formatDate = (date: any) => {
    if (!date) return '-';
    return date.toDate().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900 overflow-x-hidden">
      <BackgroundPattern />
      <Header />

      <main className="relative flex-1 pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          {isLoading ? (
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
              <Skeleton className="h-8 w-36 rounded-lg" />
              <Skeleton className="h-[250px] sm:h-[400px] w-full rounded-2xl sm:rounded-3xl" />
              <div className="space-y-3">
                <Skeleton className="h-8 sm:h-10 w-3/4 rounded-lg" />
                <Skeleton className="h-24 sm:h-36 w-full rounded-lg" />
              </div>
            </div>
          ) : !announcement ? (
            <div className="flex flex-col items-center justify-center py-14 sm:py-20 text-center max-w-lg mx-auto bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                <Megaphone className="h-6 w-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 uppercase">Pengumuman Tidak Ditemukan</h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-6 mt-1">Maaf, informasi yang Anda cari mungkin telah dihapus atau dipindahkan.</p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <Button onClick={() => router.push('/pengumuman')} variant="outline" className="rounded-xl font-bold text-xs h-9 sm:h-10">
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Kembali ke Daftar
                </Button>
                <Link href="/">
                  <Button className="rounded-xl font-bold bg-primary text-white text-xs h-9 sm:h-10">
                    <Home className="mr-1.5 h-3.5 w-3.5" /> Beranda
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
              {/* BACK BUTTON */}
              <div>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/pengumuman')}
                  className="font-bold text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 hover:text-primary transition-all p-0 h-auto gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Pengumuman
                </Button>
              </div>

              {/* ARTICLE CARD */}
              <article className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                {/* IMAGE AREA */}
                {announcement.imageUrl && (
                  <div className="relative w-full bg-slate-50 overflow-hidden border-b border-slate-100">
                    <img
                      src={announcement.imageUrl}
                      alt={announcement.title}
                      className="w-full h-auto block max-h-[300px] sm:max-h-[500px] md:max-h-[700px] object-contain mx-auto"
                    />
                  </div>
                )}

                {/* CONTENT AREA */}
                <div className="p-4 sm:p-8 md:p-10 space-y-4 sm:space-y-6">
                  <div className="space-y-2 sm:space-y-3">
                    <Badge className="bg-secondary text-primary-foreground font-extrabold uppercase text-[8px] sm:text-[9px] tracking-wider px-2.5 py-0.5 border-none shadow-sm">
                      Informasi Resmi Desa
                    </Badge>
                    <h1 className="text-xl min-[380px]:text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-snug uppercase tracking-tight font-display italic">
                      {announcement.title}
                    </h1>
                  </div>

                  {/* METADATA ROW */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-b border-slate-100 pb-3 sm:pb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-secondary/10 rounded-md text-secondary">
                        <Calendar className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Tanggal Terbit</p>
                        <p className="text-[11px] sm:text-xs font-semibold text-slate-700">{formatDate(announcement.publishDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Diterbitkan Oleh</p>
                        <p className="text-[11px] sm:text-xs font-semibold text-slate-700">{announcement.authorName || 'Pemerintah Desa Karanggintung'}</p>
                      </div>
                    </div>
                  </div>

                  {/* BODY TEXT */}
                  <div className="prose prose-slate max-w-none">
                    <p className="text-xs sm:text-base leading-relaxed text-slate-700 font-medium whitespace-pre-wrap font-sans">
                      {announcement.content}
                    </p>
                  </div>

                  {/* FOOTER CALLOUT */}
                  <div className="pt-4 sm:pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
                        <Milestone className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider">Sekretariat Desa</p>
                        <p className="text-xs sm:text-sm font-bold text-slate-600 tracking-tight">Portal Resmi Desa Karanggintung</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        onClick={() => router.push('/pengumuman')}
                        variant="outline"
                        className="flex-1 sm:flex-none text-slate-700 font-bold px-4 h-8 sm:h-9 rounded-xl hover:bg-slate-100 transition-all uppercase tracking-wider text-[9px] sm:text-[10px]"
                      >
                        Daftar Lainnya
                      </Button>
                      <Link href="/" className="flex-1 sm:flex-none">
                        <Button className="w-full bg-primary text-white font-bold px-4 h-8 sm:h-9 rounded-xl hover:bg-slate-800 transition-all uppercase tracking-wider text-[9px] sm:text-[10px] shadow-sm">
                          Beranda
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
