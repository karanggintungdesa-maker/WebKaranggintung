'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { BackgroundPattern } from '@/components/landing/BackgroundPattern';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Landmark,
  MapPin,
  Compass,
  Leaf,
  ChevronRight,
  ImageIcon,
  Loader2,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { PotensiDesa } from '@/lib/types';

const POTENSI_CATEGORIES = [
  { id: 'pariwisata-kebudayaan', label: 'Pariwisata & Kebudayaan', icon: Compass, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
  { id: 'bumdes', label: 'BUMDes Karanggintung', icon: Landmark, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { id: 'pertanian-perkebunan', label: 'Pertanian & Perkebunan', icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { id: 'sda-lingkungan', label: 'Sumber Daya Alam & Lingkungan', icon: MapPin, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' }
] as const;

type CategoryId = typeof POTENSI_CATEGORIES[number]['id'];

function PotensiGalleryModal({ item }: { item: PotensiDesa }) {
  const images = item.imageUrls || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);

  const hasMultiple = images.length > 1;
  const currentImage = images[activeIndex] || images[0];

  if (images.length === 0) return null;

  return (
    <div className="space-y-4 w-full">
      {/* Main Showcase Image (Above Narrative) */}
      <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-950 border border-slate-200/80 shadow-md group flex items-center justify-center min-h-[190px] sm:min-h-[380px] md:min-h-[460px] max-h-[560px]">
        {/* Ambient Blur Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110 pointer-events-none transition-all duration-700"
          style={{ backgroundImage: `url(${currentImage})` }}
        />

        {/* Main Photo */}
        <img
          src={currentImage}
          alt={`${item.title} - Foto ${activeIndex + 1}`}
          onClick={() => setFullscreenUrl(currentImage)}
          className="relative z-10 max-h-[540px] w-auto max-w-full object-contain cursor-zoom-in transition-transform duration-500 group-hover:scale-[1.01] p-1 md:p-2"
        />

        {/* Zoom Indicator Icon */}
        <div
          onClick={() => setFullscreenUrl(currentImage)}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-slate-900/80 hover:bg-slate-900 text-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl backdrop-blur-md transition-all cursor-pointer z-20 border border-white/10 opacity-0 group-hover:opacity-100"
          title="Perbesar Foto"
        >
          <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>

        {/* Counter Badge */}
        {hasMultiple && (
          <div className="absolute bottom-4 right-4 bg-slate-900/85 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-lg z-20 border border-white/10">
            Foto {activeIndex + 1} dari {images.length}
          </div>
        )}

        {/* Navigation Arrows */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
              }}
              className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-xl flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-110 z-20"
              aria-label="Foto Sebelumnya"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6 rotate-180" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-xl flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-110 z-20"
              aria-label="Foto Selanjutnya"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row for Multiple Photos (Small photos below main photo) */}
      {hasMultiple && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pilih Galeri Foto ({images.length})</p>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none pt-1 items-center">
            {images.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "relative h-16 w-20 sm:h-20 sm:w-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-slate-900 shadow-sm cursor-pointer focus:outline-none",
                  activeIndex === idx
                    ? "border-primary ring-4 ring-primary/25 scale-105 shadow-md opacity-100"
                    : "border-slate-200 opacity-60 hover:opacity-100"
                )}
              >
                <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <Dialog open={!!fullscreenUrl} onOpenChange={(open) => !open && setFullscreenUrl(null)}>
        {fullscreenUrl && (
          <DialogContent className="max-w-5xl p-2 bg-black/95 border-none text-white rounded-3xl overflow-hidden">
            <DialogHeader className="sr-only">
              <DialogTitle>Pratinjau Foto {item.title}</DialogTitle>
            </DialogHeader>
            <div className="relative w-full h-[80vh] flex items-center justify-center">
              <img src={fullscreenUrl} alt="Fullscreen View" className="max-h-full max-w-full object-contain rounded-2xl" />
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

function PotensiDesaContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as CategoryId | null;

  const [activeTab, setActiveTab] = useState<CategoryId>('pariwisata-kebudayaan');
  const [selectedPotensi, setSelectedPotensi] = useState<PotensiDesa | null>(null);
  const firestore = useFirestore();

  // Sync state with query parameter
  useEffect(() => {
    if (tabParam && POTENSI_CATEGORIES.some(cat => cat.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Load all potentials
  const potentialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'potensiDesa'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: allPotentials, isLoading } = useCollection<PotensiDesa>(potentialsQuery);

  // Filter items in memory by category
  const filteredPotentials = useMemo(() => {
    if (!allPotentials) return [];
    return allPotentials.filter(item => item.category === activeTab);
  }, [allPotentials, activeTab]);

  const activeCategoryDetails = useMemo(() => {
    return POTENSI_CATEGORIES.find(cat => cat.id === activeTab)!;
  }, [activeTab]);

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900 overflow-x-hidden pt-24 font-sans">
      <BackgroundPattern />
      <Header />

      <main className="relative flex-1 container mx-auto px-3 sm:px-4 py-6 sm:py-12 md:py-16 max-w-7xl">
        {/* Banner Title */}
        <div className="text-center space-y-2 sm:space-y-4 max-w-3xl mx-auto mb-6 sm:mb-12 md:mb-16 animate-in fade-in slide-in-from-top-4 duration-500">
          <Badge className="bg-emerald-50 text-emerald-700 font-black uppercase text-[9px] sm:text-[10px] tracking-widest px-3 sm:px-4 py-1 sm:py-1.5 border-none shadow-sm mb-1 sm:mb-2">
            Potensi & Keunggulan Desa
          </Badge>
          <h1 className="text-2xl min-[380px]:text-3xl md:text-6xl font-black text-slate-900 leading-tight uppercase font-display italic tracking-tighter">
            Kekayaan <span className="text-primary not-italic">Desa</span> Karanggintung
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Menelusuri keanekaragaman pariwisata, produk kreatif lokal, pertanian subur, serta tata kelola lingkungan hidup di Desa Karanggintung.
          </p>
        </div>

        {/* Categories Tab Navigation - 2x2 Grid on Mobile for One-Screen Fit */}
        <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-1.5 sm:p-3 border shadow-sm grid grid-cols-2 lg:flex lg:flex-nowrap justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-12 md:mb-16 max-w-5xl mx-auto">
          {POTENSI_CATEGORIES.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  const url = new URL(window.location.href);
                  url.searchParams.set('tab', tab.id);
                  window.history.pushState({}, '', url.toString());
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 sm:gap-3 px-2.5 sm:px-6 py-2 sm:py-3.5 rounded-xl sm:rounded-2xl lg:rounded-[2rem] transition-all duration-300 group text-center",
                  isActive
                    ? "bg-primary text-white shadow-md sm:shadow-xl shadow-primary/20 scale-[1.01]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                )}
              >
                <TabIcon className={cn("h-3.5 w-3.5 sm:h-5 sm:w-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400")} />
                <span className="font-black uppercase text-[8px] min-[380px]:text-[9px] sm:text-[10px] tracking-tight sm:tracking-widest line-clamp-1">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area - Card Grid */}
        <div className="space-y-6 sm:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {isLoading ? (
            // Skeleton Loader Grid - 2 Cols Mobile
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 md:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-slate-100 shadow-sm space-y-3">
                  <Skeleton className="aspect-[16/10] w-full rounded-xl" />
                  <Skeleton className="h-4 sm:h-6 w-3/4 rounded-md" />
                  <Skeleton className="h-3 sm:h-4 w-1/2 rounded-md" />
                  <Skeleton className="h-10 sm:h-16 w-full rounded-md" />
                </div>
              ))}
            </div>
          ) : filteredPotentials.length === 0 ? (
            // Empty State
            <Card className="border border-dashed border-slate-300 rounded-3xl sm:rounded-[3rem] bg-white p-8 sm:p-16 text-center max-w-xl mx-auto">
              <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
                <div className={cn("h-12 w-12 sm:h-16 sm:w-16 rounded-2xl sm:rounded-[2rem] flex items-center justify-center border", activeCategoryDetails.bg, activeCategoryDetails.color, activeCategoryDetails.border)}>
                  <activeCategoryDetails.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <h3 className="text-slate-800 font-black text-base sm:text-lg uppercase tracking-wider italic font-display">Belum Ada Informasi</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  Informasi untuk kategori <strong>{activeCategoryDetails.label}</strong> sedang dalam proses penyusunan oleh Pemerintah Desa. Silakan periksa kembali beberapa waktu mendatang.
                </p>
              </div>
            </Card>
          ) : (
            // Potentials Card Grid View - 2 Columns on Mobile
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 md:gap-8">
              {filteredPotentials.map((item) => {
                const images = item.imageUrls || [];
                const primaryImage = images[0];
                const imageCount = images.length;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPotensi(item)}
                    className="group bg-white rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-xs sm:shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
                  >
                    {/* Card Photo Container */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                          <ImageIcon className="h-8 w-8 sm:h-12 sm:w-12 text-slate-300" />
                        </div>
                      )}

                      {/* Photo Count Badge if multiple */}
                      {imageCount > 1 && (
                        <div className="absolute bottom-1.5 right-1.5 sm:bottom-3 sm:right-3 bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-md">
                          📸 {imageCount}
                        </div>
                      )}

                      {/* Category Badge on Image */}
                      <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3">
                        <span className={cn(
                          "px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[7.5px] sm:text-[9px] font-black uppercase tracking-wider shadow-xs sm:shadow-sm backdrop-blur-md bg-white/95 line-clamp-1 max-w-[120px] sm:max-w-none",
                          activeCategoryDetails.color
                        )}>
                          {activeCategoryDetails.label}
                        </span>
                      </div>
                    </div>

                    {/* Card Content (Title, Subtitle, Excerpt) */}
                    <div className="p-2.5 min-[380px]:p-3 sm:p-6 md:p-8 flex-1 flex flex-col justify-between space-y-2 sm:space-y-4">
                      <div className="space-y-1 sm:space-y-2">
                        <h3 className="text-xs min-[380px]:text-sm sm:text-xl font-black text-slate-900 uppercase font-display italic tracking-tight group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h3>

                        {item.subtitle && (
                          <p className="text-[9px] min-[380px]:text-[10px] sm:text-xs md:text-sm font-bold text-primary uppercase tracking-wider line-clamp-1 border-l sm:border-l-2 border-secondary pl-1.5 sm:pl-2.5 py-0.5">
                            {item.subtitle}
                          </p>
                        )}

                        <p className="text-[9.5px] min-[380px]:text-[10.5px] sm:text-xs md:text-sm text-slate-600 line-clamp-2 sm:line-clamp-3 leading-relaxed font-medium pt-0.5">
                          {item.narrative}
                        </p>
                      </div>

                      {/* Read More Trigger Link */}
                      <div className="pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-primary group-hover:text-primary font-black text-[8.5px] sm:text-xs uppercase tracking-wider">
                        <span>Lihat Detail</span>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-50 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all duration-300">
                          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* FULL DETAIL MODAL (Isian Penuh & Galeri Foto) */}
      <Dialog open={!!selectedPotensi} onOpenChange={(open) => !open && setSelectedPotensi(null)}>
        {selectedPotensi && (
          <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 md:p-10 rounded-2xl sm:rounded-3xl md:rounded-[3rem] bg-white border border-slate-100 shadow-2xl focus:outline-none">
            <DialogHeader className="sr-only">
              <DialogTitle>{selectedPotensi.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-8">
              {/* Top Photo Gallery Section (Foto Utama di Atas + Foto Kecil di Bawahnya) */}
              {selectedPotensi.imageUrls && selectedPotensi.imageUrls.length > 0 && (
                <PotensiGalleryModal item={selectedPotensi} />
              )}

              {/* Narrative & Full Details Below Photos */}
              <div className="space-y-4 sm:space-y-6 pt-1 sm:pt-2">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className={cn("p-1.5 sm:p-2 rounded-lg sm:rounded-xl shrink-0", activeCategoryDetails.bg, activeCategoryDetails.color)}>
                      <activeCategoryDetails.icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-black tracking-widest text-slate-400 uppercase">
                      {activeCategoryDetails.label}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-slate-900 uppercase font-display italic tracking-tight leading-tight">
                    {selectedPotensi.title}
                  </h2>

                  {selectedPotensi.subtitle && (
                    <p className="text-xs sm:text-sm md:text-base font-bold text-primary uppercase tracking-wider border-l-2 sm:border-l-4 border-secondary pl-2.5 sm:pl-4 py-0.5 sm:py-1">
                      {selectedPotensi.subtitle}
                    </p>
                  )}
                </div>

                <div className="prose prose-slate max-w-none border-t border-slate-100 pt-4 sm:pt-6">
                  <p className="text-slate-700 leading-relaxed font-medium text-xs sm:text-sm md:text-base whitespace-pre-line">
                    {selectedPotensi.narrative}
                  </p>
                </div>
              </div>

              {/* Modal Footer Close Action */}
              <div className="pt-3 sm:pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPotensi(null)}
                  className="rounded-xl px-4 sm:px-6 h-8 sm:h-10 font-bold text-[10px] sm:text-xs uppercase tracking-wider"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Footer />
    </div>
  );
}

export default function PotensiDesaPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase">Menyiapkan Konten Potensi...</p>
        </div>
      </div>
    }>
      <PotensiDesaContent />
    </Suspense>
  );
}
