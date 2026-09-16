'use client';

import Link from 'next/link';
import { Facebook, Instagram, Youtube, Mail, MapPin, Phone, Clock3, ChevronLeft, ChevronRight } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { FooterLogosInfo } from '@/lib/types';
import Image from 'next/image';
import { useMemo, useRef } from 'react';

import { VisitorCounter } from './VisitorCounter';

export function Footer() {
  const firestore = useFirestore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const footerLogosRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'footerLogos', 'default');
  }, [firestore]);

  const { data: footerLogosData } = useDoc<FooterLogosInfo>(footerLogosRef, { suppressGlobalError: true });

  const activeLogo = useMemo(() => {
    if (!footerLogosData) return [];
    if (Array.isArray(footerLogosData.items) && footerLogosData.items.length > 0) {
      return footerLogosData.items.filter(item => item && item.url);
    }
    return [
      {
        url: footerLogosData.logo1Url,
        link: footerLogosData.logo1Link,
      },
      {
        url: footerLogosData.logo2Url,
        link: footerLogosData.logo2Link,
      },
      {
        url: footerLogosData.logo3Url,
        link: footerLogosData.logo3Link,
      },
      {
        url: footerLogosData.logo4Url,
        link: footerLogosData.logo4Link,
      },
    ].filter(logo => logo.url);
  }, [footerLogosData]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* 1. Banner Logo Mitra / Layanan Terkait di Atas Footer (Sesuai Referensi) */}
      {activeLogo.length > 0 && (
        <section className="relative z-10 w-full border-t border-b border-slate-200/90 bg-white py-6 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              {/* Tombol Panah Kiri */}
              <button
                type="button"
                onClick={() => scroll('left')}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-sky-500 shadow-sm transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/50 hover:scale-105 active:scale-95"
                aria-label="Gulir ke logo sebelumnya"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Wadah Deretan Logo */}
              <div
                ref={scrollContainerRef}
                className="flex flex-1 items-center justify-center gap-8 sm:gap-12 md:gap-16 overflow-x-auto no-scrollbar scroll-smooth py-2 px-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {activeLogo.map((logo, idx) => (
                  <div
                    key={idx}
                    className="flex h-16 sm:h-20 shrink-0 items-center justify-center transition-all duration-300 hover:scale-105"
                  >
                    {logo.link ? (
                      <a
                        href={logo.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-full items-center justify-center transition-opacity hover:opacity-85"
                      >
                        <Image
                          src={logo.url!}
                          alt={`Logo Mitra ${idx + 1}`}
                          width={240}
                          height={120}
                          className="h-12 sm:h-16 w-auto max-w-[180px] object-contain"
                        />
                      </a>
                    ) : (
                      <Image
                        src={logo.url!}
                        alt={`Logo Mitra ${idx + 1}`}
                        width={240}
                        height={120}
                        className="h-12 sm:h-16 w-auto max-w-[180px] object-contain"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Tombol Panah Kanan */}
              <button
                type="button"
                onClick={() => scroll('right')}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-sky-500 shadow-sm transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/50 hover:scale-105 active:scale-95"
                aria-label="Gulir ke logo berikutnya"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. Footer Utama */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#081325] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Kolom 1: Identitas Desa */}
          <div className="space-y-5 lg:col-span-4">
            <Logo />
            <p className="max-w-sm text-sm leading-7 text-slate-400">
              Portal resmi layanan masyarakat Desa Karanggintung yang menghubungkan warga dengan informasi, administrasi, dan pelayanan publik secara digital.
            </p>
          </div>

          {/* Kolom 2: Tentang */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-white">Tentang</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              <li><Link href="/profil-desa/" className="transition-colors hover:text-white">Profil Desa</Link></li>
              <li><Link href="/pelayanan-desa/" className="transition-colors hover:text-white">Pelayanan Desa</Link></li>
              <li><Link href="/statistik/" className="transition-colors hover:text-white">Statistik</Link></li>
              <li><Link href="/desa-anti-korupsi/" className="transition-colors hover:text-white">Desa Anti Korupsi</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Kontak */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-white">Kontak</h3>
            <ul className="mt-5 space-y-4 text-sm text-slate-400">
              <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /><span>Jl. Pelita Km 02, Desa Karanggintung, Kec. Gandrungmangu, Cilacap</span></li>
              <li className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /><span>0895-3211-09179</span></li>
              <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /><span>karanggintungdesa@gmail.com</span></li>
              <li className="flex gap-3"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /><span>Senin - Jumat, 08.00 - 16.00 WIB</span></li>
            </ul>
          </div>

          {/* Kolom 4: Media Sosial */}
          <div className="flex flex-col items-start gap-6 lg:col-span-3 lg:items-end lg:text-right">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-white">Media Sosial</h3>
              <div className="flex gap-3 justify-start lg:justify-end">
                <a
                  href="https://www.facebook.com/Desa Karanggintung,Gandrungmangu,Cilacap/?locale=id_ID"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 hover:border-blue-500 hover:bg-blue-600 hover:text-white hover:scale-110 shadow-sm"
                  aria-label="Facebook Desa Karanggintung"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="https://www.instagram.com/desa_karanggintung/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 hover:border-pink-500 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white hover:scale-110 shadow-sm"
                  aria-label="Instagram Desa Karanggintung"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="https://www.tiktok.com/@mascamat.gandrungmangu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 hover:border-slate-300 hover:bg-slate-800 hover:text-white hover:scale-110 shadow-sm"
                  aria-label="TikTok Desa Karanggintung"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.82.94 1.93 1.63 3.16 2.01v3.74c-1.39-.02-2.77-.42-3.95-1.16-.72-.45-1.36-1.02-1.87-1.7v7.66c0 1.25-.26 2.47-.79 3.6-1.06 2.22-3.15 3.8-5.6 4.21-1.35.23-2.74.15-4.05-.24-2.26-.67-4.14-2.31-5.11-4.47-.6-1.34-.84-2.82-.7-4.29.28-2.9 2.06-5.46 4.81-6.42 1.27-.45 2.64-.5 3.94-.16v3.83c-.8-.28-1.68-.28-2.47.01-1.33.49-2.28 1.77-2.39 3.18-.12 1.63.89 3.16 2.46 3.51.68.15 1.39.11 2.05-.12.98-.35 1.72-1.19 1.92-2.2.06-.31.08-.63.08-.94V0h.02z" />
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@Mascamat.Gandrungmangu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 hover:border-red-500 hover:bg-red-600 hover:text-white hover:scale-110 shadow-sm"
                  aria-label="YouTube Desa Karanggintung"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Horizontal Visitor Counter */}
        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-center text-sm text-slate-400 md:text-left">
            © 2026 Pemerintah Desa Karanggintung. Semua hak cipta dilindungi.
          </div>

          <div className="flex justify-center md:justify-end">
            <VisitorCounter />
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
