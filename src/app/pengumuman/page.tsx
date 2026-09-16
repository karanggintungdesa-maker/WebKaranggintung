'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { BackgroundPattern } from '@/components/landing/BackgroundPattern';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Megaphone, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Announcement } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function PengumumanPage() {
  const firestore = useFirestore();
  const announcementsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'announcements'), orderBy('publishDate', 'desc'), limit(50));
  }, [firestore]);

  const { data: announcements, isLoading, error } = useCollection<Announcement>(announcementsQuery);

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
        {/* HERO / PAGE HEADER */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-4 sm:pb-8">
          <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
              <Megaphone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Papan Informasi & Agenda Resmi</span>
            </div>

            <h1 className="text-2xl min-[380px]:text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 uppercase tracking-tight font-display italic">
              Pengumuman <span className="text-primary not-italic">Desa</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
              Informasi, agenda, surat edaran, dan pengumuman penting dari administrasi Pemerintah Desa Karanggintung.
            </p>
          </div>
        </section>

        {/* CONTENT GRID */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          {error && (
            <div className="p-4 sm:p-6 bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl flex items-center gap-3 text-red-700 max-w-xl mx-auto">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-xs sm:text-sm font-medium">Gagal memuat pengumuman. Silakan coba beberapa saat lagi.</p>
            </div>
          )}

          {isLoading && (
            <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-[260px] sm:h-[360px] w-full rounded-2xl sm:rounded-3xl" />
              <Skeleton className="h-[260px] sm:h-[360px] w-full rounded-2xl sm:rounded-3xl" />
              <Skeleton className="h-[260px] sm:h-[360px] w-full rounded-2xl sm:rounded-3xl" />
            </div>
          )}

          {!isLoading && announcements && announcements.length === 0 && (
            <div className="py-14 sm:py-20 text-center bg-white rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 p-6 max-w-xl mx-auto shadow-sm">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Megaphone className="h-6 w-6" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-700">Belum Ada Pengumuman</h3>
              <p className="text-xs text-slate-400 mt-1">Saat ini belum ada pengumuman baru yang diterbitkan.</p>
            </div>
          )}

          {!isLoading && announcements && announcements.length > 0 && (
            <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {announcements.map((announcement) => (
                <Link key={announcement.id} href={`/pengumuman/detail?id=${announcement.id}`} className="flex">
                  <Card className="group cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col w-full">
                    {/* IMAGE THUMBNAIL */}
                    <div className="relative aspect-[16/9] sm:aspect-video w-full overflow-hidden bg-slate-100 shrink-0">
                      {announcement.imageUrl ? (
                        <img
                          src={announcement.imageUrl}
                          alt={announcement.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                          <Megaphone className="h-10 w-10 text-primary/20" />
                        </div>
                      )}
                      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3">
                        <Badge className="bg-secondary text-primary-foreground font-extrabold uppercase text-[8px] sm:text-[9px] tracking-wider px-2 sm:px-2.5 py-0.5 border-none shadow-sm">
                          Info Terbaru
                        </Badge>
                      </div>
                    </div>

                    {/* CARD HEADER */}
                    <CardHeader className="p-3.5 sm:p-5 pb-1 sm:pb-2 space-y-1 sm:space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Calendar className="h-3 w-3 text-primary/60 shrink-0" />
                        <span>{formatDate(announcement.publishDate)}</span>
                      </div>
                      <CardTitle className="text-xs sm:text-base md:text-lg font-bold uppercase tracking-tight text-slate-800 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {announcement.title}
                      </CardTitle>
                    </CardHeader>

                    {/* CARD CONTENT */}
                    <CardContent className="p-3.5 sm:p-5 pt-0 flex-1 flex flex-col justify-between">
                      <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed font-medium line-clamp-2 italic mb-3 sm:mb-4">
                        &quot;{announcement.content}&quot;
                      </p>

                      <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-primary font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">
                        <span>Baca Selengkapnya</span>
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
