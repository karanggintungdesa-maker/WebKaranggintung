'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMemoFirebase, useCollection, useFirestore, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import { ArrowRight, Video, Newspaper, CheckCircle2, Sparkles, Play } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { News } from '@/lib/types';
import { formatDisplayDate } from './landing-utils';

export function NewsSection() {
  const firestore = useFirestore();

  const newsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'news'), orderBy('updatedAt', 'desc'), limit(8));
  }, [firestore]);

  const { data: news, isLoading, error } = useCollection<News>(newsQuery);

  const profileRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'default');
  }, [firestore]);

  const { data: profileData } = useDoc<{ youtubeVideoUrl?: string }>(profileRef);

  const getYoutubeEmbedUrl = (url: string | undefined) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
    const videoId = match ? match[1] : url;
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const youtubeEmbedUrl = getYoutubeEmbedUrl(profileData?.youtubeVideoUrl);

  const duplicatedNews = useMemo(() => {
    if (!news || news.length === 0) return [];
    let items = [...news];
    while (items.length < 8) {
      items = [...items, ...news];
    }
    return [...items, ...items];
  }, [news]);

  return (
    <section className="relative mx-auto max-w-7xl px-3.5 py-10 sm:px-6 lg:px-8 sm:py-20 lg:py-28 overflow-hidden">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
        className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div className="max-w-2xl space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-700">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600" />
            Pusat Informasi & Kabar Terkini
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 font-display">
            Kabar & Berita Desa
          </h2>
          <p className="text-xs sm:text-lg text-slate-600 leading-relaxed">
            Ikuti perkembangan pembangunan infrastruktur, kegiatan sosial kemasyarakatan, dan transparansi kebijakan Pemerintah Desa Karanggintung.
          </p>
        </div>
        <Link
          href="/BeritaDesa/"
          className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors shrink-0 self-start sm:self-auto"
        >
          Lihat Semua Berita
          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Link>
      </motion.div>

      {/* News Stream / Cards */}
      {isLoading ? (
        <div className="mt-6 sm:mt-12 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl sm:rounded-[2rem] border border-slate-100 bg-white p-3.5 sm:p-4 shadow-xs sm:shadow-sm">
              <Skeleton className="h-36 sm:h-48 w-full rounded-xl sm:rounded-2xl" />
              <Skeleton className="mt-3 sm:mt-4 h-3.5 w-24" />
              <Skeleton className="mt-2.5 sm:mt-3 h-5 sm:h-6 w-full" />
              <Skeleton className="mt-2 h-3.5 w-3/4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 sm:mt-12 rounded-2xl sm:rounded-[2rem] bg-amber-50 p-4 sm:p-6 text-xs sm:text-sm text-amber-700 border border-amber-200">
          Berita sedang tidak dapat dimuat saat ini. Silakan kunjungi halaman Berita Desa secara langsung.
        </div>
      ) : !news || news.length === 0 ? (
        <div className="mt-6 sm:mt-12 rounded-2xl sm:rounded-[2rem] bg-slate-50 p-6 sm:p-8 text-center text-xs sm:text-sm text-slate-600 border border-slate-100">
          Belum ada berita terbaru yang dipublikasikan.
        </div>
      ) : (
        <div className="mt-5 sm:mt-12 relative w-full overflow-hidden marquee-gradient-mask">
          <div className="animate-marquee-slow flex gap-2.5 min-[380px]:gap-3.5 sm:gap-6 py-1.5 sm:py-4">
            {duplicatedNews.map((item, idx) => (
              <motion.article
                key={`${item.id}-${idx}`}
                className="w-[210px] min-[380px]:w-[230px] sm:w-[380px] shrink-0 group overflow-hidden rounded-xl sm:rounded-[2.25rem] border border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-xs sm:shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                whileHover={{ y: -6 }}
              >
                <div>
                  <div className="relative h-28 min-[380px]:h-32 sm:h-48 overflow-hidden bg-slate-100">
                    <Image
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200'}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 230px, 380px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-2.5 min-[380px]:p-3 sm:p-6">
                    <div className="flex items-center gap-1 sm:gap-2 text-[8.5px] min-[380px]:text-[9px] sm:text-xs font-semibold text-slate-400">
                      <Newspaper className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-emerald-600" />
                      <span className="truncate max-w-[80px] sm:max-w-[120px]">{item.author || 'Pemdes'}</span>
                      <span>•</span>
                      <span>{formatDisplayDate(item.updatedAt || item.createdAt || item.date)}</span>
                    </div>

                    <h3 className="mt-1.5 sm:mt-3 text-xs min-[380px]:text-[13px] sm:text-lg font-bold sm:font-black text-slate-900 line-clamp-2 h-8 min-[380px]:h-9 sm:h-14 leading-tight group-hover:text-emerald-800 transition-colors font-display">
                      {item.title}
                    </h3>

                    <p className="mt-1 sm:mt-2 text-[9.5px] min-[380px]:text-[10.5px] sm:text-xs leading-snug sm:leading-relaxed text-slate-600 line-clamp-2">
                      {item.subtitle}
                    </p>

                    <ul className="mt-2 sm:mt-4 space-y-1 sm:space-y-1.5 pt-1.5 sm:pt-2 text-[9px] min-[380px]:text-[10px] sm:text-xs font-semibold text-slate-600 border-t border-slate-100">
                      <li className="flex items-center gap-1 sm:gap-2">
                        <CheckCircle2 className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Kabar Resmi Pemdes</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="px-2.5 pb-2.5 min-[380px]:px-3 min-[380px]:pb-3 sm:px-6 sm:pb-6 pt-0">
                  <Link
                    href={`/BeritaDesa/detail?id=${item.id}`}
                    className="inline-flex items-center gap-1 sm:gap-2 text-[9.5px] min-[380px]:text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    Baca Selengkapnya
                    <ArrowRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      )}

      {/* Video Profil Sinematik Desa */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-10 sm:mt-20 overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-4 sm:p-10 lg:p-12 shadow-xl sm:shadow-2xl border border-emerald-900/30"
      >
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between mb-4 sm:mb-8">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-400">
              <Video className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Dokumentasi Sinematik
            </div>
            <h3 className="text-xl sm:text-3xl font-black font-display tracking-tight">
              Video Profil Resmi Desa Karanggintung
            </h3>
            <p className="text-[11px] sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Menyaksikan keindahan alam, keramahan warga, potensi agraris, serta kemajuan fasilitas pelayanan desa secara audiovisual.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl sm:rounded-[2rem] aspect-video w-full bg-slate-900 shadow-xl border border-white/10">
          {youtubeEmbedUrl ? (
            <iframe
              src={youtubeEmbedUrl}
              title="Video Profil Desa Karanggintung"
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full min-h-[220px] sm:min-h-[320px] items-center justify-center bg-slate-950 text-center text-slate-200">
              <div className="space-y-2 sm:space-y-3 px-4 sm:px-6">
                <div className="mx-auto flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400">
                  <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
                </div>
                <p className="text-xs sm:text-base font-bold">Video profil desa dapat dikonfigurasi melalui Admin</p>
                <p className="text-[10px] sm:text-xs text-slate-400">
                  Tautan video YouTube dapat diperbarui kapan saja di menu Pengaturan Website.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
