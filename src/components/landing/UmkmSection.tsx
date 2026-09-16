'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMemoFirebase, useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { ArrowRight, Store, Sparkles, ShoppingBag, CheckCircle2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductUmkm } from '@/lib/types';

export function UmkmSection() {
  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'katalogProduk'), orderBy('createdAt', 'desc'), limit(8));
  }, [firestore]);

  const { data: firestoreProducts, isLoading } = useCollection<ProductUmkm>(productsQuery, {
    suppressGlobalError: true,
  });

  const products = useMemo(() => {
    return firestoreProducts || [];
  }, [firestoreProducts]);

  return (
    <section className="relative mx-auto max-w-7xl px-3.5 py-10 sm:px-6 lg:px-8 sm:py-20 lg:py-28">
      {/* Soft Decorative Ambient */}
      <div className="absolute top-1/3 right-10 h-72 w-72 rounded-full bg-amber-400/5 blur-3xl pointer-events-none -z-10" />

      {/* Section Header */}
      <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl space-y-2 sm:space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-700">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500" />
            Pemberdayaan Ekonomi Warga
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 font-display">
            Produk Unggulan & UMKM Desa
          </h2>
          <p className="text-xs sm:text-lg text-slate-600 leading-relaxed">
            Dukung pertumbuhan ekonomi mandiri warga Karanggintung dengan berbelanja aneka produk olahan, kerajinan tangan, dan hasil tani berkualitas.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="shrink-0 self-start sm:self-auto"
        >
          <Link href="/umkm-dan-industri-kreatif?tab=katalog">
            <Button className="rounded-xl sm:rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider px-4 sm:px-6 h-10 sm:h-12 shadow-sm sm:shadow-md shadow-amber-500/20 transition-all duration-300 hover:scale-[1.02]">
              <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Katalog Lengkap
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Products Grid */}
      <div className="mt-6 sm:mt-12">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-xl sm:rounded-[2rem] bg-white p-2.5 sm:p-4 shadow-xs sm:shadow-sm border border-slate-100">
                <Skeleton className="h-32 sm:h-48 w-full rounded-lg sm:rounded-2xl" />
                <Skeleton className="mt-3 sm:mt-4 h-3 sm:h-4 w-20 sm:w-28" />
                <Skeleton className="mt-1.5 sm:mt-2 h-4 sm:h-6 w-full" />
                <Skeleton className="mt-1.5 sm:mt-2 h-3 sm:h-4 w-16 sm:w-20" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl sm:rounded-[2.5rem] bg-amber-50/50 border border-amber-200/60 p-6 sm:p-12 text-center max-w-2xl mx-auto space-y-2 sm:space-y-3">
            <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Store className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-amber-950">Belum Ada Produk yang Ditampilkan</h4>
            <p className="text-xs text-amber-800">
              Produk UMKM desa dapat didaftarkan melalui tim admin desa Karanggintung untuk ditampilkan di katalog digital.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {products.slice(0, 4).map((item, index) => (
              <motion.article
                key={item.id || index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                whileHover={{ y: -6 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-[2rem] bg-white border border-slate-200/80 p-2.5 sm:p-4 shadow-xs sm:shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div>
                  {/* Product Image */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg sm:rounded-2xl bg-slate-100">
                    <Image
                      src={
                        item.imageUrl ||
                        'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 180px, 280px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {item.badge && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 rounded-full bg-amber-500/90 backdrop-blur-sm px-2 py-0.5 sm:px-3 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-950 shadow-xs">
                        {item.badge}
                      </div>
                    )}
                  </div>

                  {/* Business & Category */}
                  <div className="mt-2.5 sm:mt-4 flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-slate-400">
                    <Store className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-600 shrink-0" />
                    <span className="truncate max-w-[90px] sm:max-w-[140px]">{item.businessName || 'UMKM Karanggintung'}</span>
                  </div>

                  {/* Title & Price */}
                  <h3 className="mt-1 sm:mt-2 text-xs sm:text-base font-black text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1 font-display">
                    {item.name}
                  </h3>

                  <div className="mt-1 sm:mt-2 flex items-baseline gap-1">
                    <span className="text-xs sm:text-lg font-black text-amber-600 font-mono">
                      Rp {item.price ? Number(item.price).toLocaleString('id-ID') : '0'}
                    </span>
                    <span className="text-[9px] sm:text-xs text-slate-400 font-medium">
                      /{item.priceUnit || 'pcs'}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed hidden sm:block">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Action */}
                <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/umkm-dan-industri-kreatif?tab=katalog`}
                    className="text-[11px] sm:text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-0.5 sm:gap-1 transition-colors"
                  >
                    <span>Rincian</span>
                    <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  {item.contactPhone && (
                    <a
                      href={`https://wa.me/${item.contactPhone.replace(/[^0-9]/g, '')}?text=Halo,%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(item.name)}%20di%20Website%20Desa%20Karanggintung`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] sm:text-xs font-bold transition-colors"
                    >
                      <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600" />
                      <span>Pesan</span>
                    </a>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
