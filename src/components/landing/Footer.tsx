'use client';

import Link from 'next/link';
import { Facebook, Instagram, Youtube, Mail, MapPin, Phone, Clock3, ChevronLeft, ChevronRight } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { FooterLogosInfo } from '@/lib/types';
import Image from 'next/image';
import { useMemo, useRef, useEffect } from 'react';

import { VisitorCounter } from './VisitorCounter';

const REPETITIONS = 8;

export function Footer() {
  const firestore = useFirestore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(false);

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

  const getPitch = () => {
    if (!scrollContainerRef.current) return 0;
    const children = scrollContainerRef.current.children;
    if (children.length >= 2) {
      const el0 = children[0] as HTMLElement;
      const el1 = children[1] as HTMLElement;
      const diff = el1.offsetLeft - el0.offsetLeft;
      if (diff > 0) return diff;
    }
    return scrollContainerRef.current.scrollWidth / REPETITIONS;
  };

  // Posisi awal di tengah (Set 3) agar bisa digulir ke kiri maupun kanan tanpa batas
  useEffect(() => {
    if (activeLogo.length === 0) return;
    const el = scrollContainerRef.current;
    if (!el) return;

    const initPos = () => {
      if (hasInitializedRef.current && el.scrollLeft > 0) return;
      const pitch = getPitch();
      if (pitch > 0) {
        el.scrollLeft = pitch * 3;
        hasInitializedRef.current = true;
      }
    };

    const t1 = setTimeout(initPos, 50);
    const t2 = setTimeout(initPos, 300);

    const handleResize = () => {
      const pitch = getPitch();
      if (pitch > 0) {
        if (el.scrollLeft < pitch * 1.5 || el.scrollLeft > pitch * 5.5) {
          el.scrollLeft = pitch * 3;
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeLogo]);

  // Normalisasi pasif saat pengguna selesai swipe atau scroll manual
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || activeLogo.length === 0) return;

    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const pitch = getPitch();
        if (pitch <= 0) return;

        if (el.scrollLeft >= pitch * 5) {
          el.scrollLeft -= pitch * 2;
        } else if (el.scrollLeft <= pitch * 1.5) {
          el.scrollLeft += pitch * 2;
        }
      }, 150);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      el.removeEventListener('scroll', handleScroll);
    };
  }, [activeLogo]);

  // Gulir tanpa henti (infinite continuous loop)
  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const pitch = getPitch();
    if (pitch <= 0) {
      el.scrollBy({ left: direction === 'left' ? -250 : 250, behavior: 'smooth' });
      return;
    }

    const step = typeof window !== 'undefined' && window.innerWidth < 640 ? 180 : 300;

    if (direction === 'right') {
      if (el.scrollLeft >= pitch * 4.5) {
        el.scrollLeft -= pitch * 2;
      }
      el.scrollBy({ left: step, behavior: 'smooth' });
    } else {
      if (el.scrollLeft <= pitch * 2) {
        el.scrollLeft += pitch * 2;
      }
      el.scrollBy({ left: -step, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* 1. Banner Logo Mitra / Layanan Terkait di Atas Footer (Sesuai Referensi) */}
      {activeLogo.length > 0 && (
        <section className="relative z-10 w-full border-t border-b border-slate-200/90 bg-white py-3.5 sm:py-6 shadow-sm">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              {/* Tombol Panah Kiri */}
              <button
                type="button"
                onClick={() => scroll('left')}
                className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-sky-500 shadow-xs sm:shadow-sm transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/50 hover:scale-105 active:scale-95"
                aria-label="Gulir ke logo sebelumnya"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              {/* Wadah Deretan Logo Berulang Tanpa Batas */}
              <div
                ref={scrollContainerRef}
                className="flex flex-1 items-center justify-start gap-6 sm:gap-12 md:gap-16 overflow-x-auto no-scrollbar py-1 px-1 sm:py-2 sm:px-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {Array.from({ length: REPETITIONS }).map((_, setIdx) => (
                  <div
                    key={setIdx}
                    className="flex shrink-0 items-center gap-6 sm:gap-12 md:gap-16"
                  >
                    {activeLogo.map((logo, idx) => (
                      <div
                        key={`${setIdx}-${idx}`}
                        className="flex h-12 sm:h-20 shrink-0 items-center justify-center transition-all duration-300 hover:scale-105"
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
                              className="h-9 sm:h-16 w-auto max-w-[110px] sm:max-w-[180px] object-contain"
                            />
                          </a>
                        ) : (
                          <Image
                            src={logo.url!}
                            alt={`Logo Mitra ${idx + 1}`}
                            width={240}
                            height={120}
                            className="h-9 sm:h-16 w-auto max-w-[110px] sm:max-w-[180px] object-contain"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Tombol Panah Kanan */}
              <button
                type="button"
                onClick={() => scroll('right')}
                className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-sky-500 shadow-xs sm:shadow-sm transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/50 hover:scale-105 active:scale-95"
                aria-label="Gulir ke logo berikutnya"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. Footer Utama */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#081325] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-4 gap-y-5 sm:gap-8 lg:gap-10">
          {/* Kolom 1: Identitas Desa (Lebar Penuh di Mobile) */}
          <div className="order-1 col-span-2 lg:order-1 lg:col-span-4 space-y-2 sm:space-y-4">
            <Logo />
            <p className="max-w-sm text-[11px] sm:text-sm leading-relaxed sm:leading-7 text-slate-400">
              Portal resmi layanan masyarakat Desa Karanggintung yang menghubungkan warga dengan informasi, administrasi, dan pelayanan publik secara digital.
            </p>
          </div>

          {/* Kolom 2: Tentang (Kolom Kiri di Baris ke-2 Mobile) */}
          <div className="order-2 col-span-1 lg:order-2 lg:col-span-2">
            <h3 className="text-[11px] sm:text-sm font-semibold uppercase tracking-[0.18em] sm:tracking-[0.25em] text-white">Tentang</h3>
            <ul className="mt-2 sm:mt-5 space-y-1.5 sm:space-y-3 text-[11px] sm:text-sm text-slate-400">
              <li><Link href="/profil-desa/" className="transition-colors hover:text-white">Profil Desa</Link></li>
              <li><Link href="/pelayanan-desa/" className="transition-colors hover:text-white">Pelayanan Desa</Link></li>
              <li><Link href="/statistik/" className="transition-colors hover:text-white">Statistik</Link></li>
              <li><Link href="/desa-anti-korupsi/" className="transition-colors hover:text-white">Desa Anti Korupsi</Link></li>
            </ul>
          </div>

          {/* Kolom 4: Media Sosial (Kolom Kanan di Baris ke-2 Mobile) */}
          <div className="order-3 col-span-1 lg:order-4 lg:col-span-3 flex flex-col items-start gap-2 sm:gap-6 lg:items-end lg:text-right">
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-[11px] sm:text-sm font-semibold uppercase tracking-[0.18em] sm:tracking-[0.25em] text-white">Media Sosial</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-start lg:justify-end">
                <a
                  href="https://www.facebook.com/Desa Karanggintung,Gandrungmangu,Cilacap/?locale=id_ID"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 hover:border-blue-500 hover:bg-blue-600 hover:text-white hover:scale-110 shadow-sm"
                  aria-label="Facebook Desa Karanggintung"
                >
                  <Facebook className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
                <a
                  href="https://www.instagram.com/desa_karanggintung/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 hover:border-pink-500 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white hover:scale-110 shadow-sm"
                  aria-label="Instagram Desa Karanggintung"
                >
                  <Instagram className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
                <a
                  href="https://www.tiktok.com/@mascamat.gandrungmangu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 hover:border-slate-300 hover:bg-slate-800 hover:text-white hover:scale-110 shadow-sm"
                  aria-label="TikTok Desa Karanggintung"
                >
                  <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.82.94 1.93 1.63 3.16 2.01v3.74c-1.39-.02-2.77-.42-3.95-1.16-.72-.45-1.36-1.02-1.87-1.7v7.66c0 1.25-.26 2.47-.79 3.6-1.06 2.22-3.15 3.8-5.6 4.21-1.35.23-2.74.15-4.05-.24-2.26-.67-4.14-2.31-5.11-4.47-.6-1.34-.84-2.82-.7-4.29.28-2.9 2.06-5.46 4.81-6.42 1.27-.45 2.64-.5 3.94-.16v3.83c-.8-.28-1.68-.28-2.47.01-1.33.49-2.28 1.77-2.39 3.18-.12 1.63.89 3.16 2.46 3.51.68.15 1.39.11 2.05-.12.98-.35 1.72-1.19 1.92-2.2.06-.31.08-.63.08-.94V0h.02z" />
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@Mascamat.Gandrungmangu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 hover:border-red-500 hover:bg-red-600 hover:text-white hover:scale-110 shadow-sm"
                  aria-label="YouTube Desa Karanggintung"
                >
                  <Youtube className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Kolom 3: Kontak (Baris ke-3 di Mobile, Full Width tapi Padat) */}
          <div className="order-4 col-span-2 lg:order-3 lg:col-span-3">
            <h3 className="text-[11px] sm:text-sm font-semibold uppercase tracking-[0.18em] sm:tracking-[0.25em] text-white">Kontak</h3>
            <ul className="mt-2 sm:mt-5 space-y-1.5 sm:space-y-4 text-[11px] sm:text-sm text-slate-400">
              <li className="flex gap-2 sm:gap-3">
                <MapPin className="mt-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-emerald-400" />
                <span>Jl. Pelita Km 02, Desa Karanggintung, Kec. Gandrungmangu, Cilacap</span>
              </li>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5 sm:gap-3">
                <li className="flex gap-2 sm:gap-3">
                  <Phone className="mt-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-emerald-400" />
                  <span>0895-3211-09179</span>
                </li>
                <li className="flex gap-2 sm:gap-3">
                  <Mail className="mt-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-emerald-400" />
                  <span className="truncate">karanggintungdesa@gmail.com</span>
                </li>
              </div>
              <li className="flex gap-2 sm:gap-3">
                <Clock3 className="mt-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-emerald-400" />
                <span>Senin - Jumat, 08.00 - 16.00 WIB</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Horizontal Visitor Counter */}
        <div className="mt-6 sm:mt-12 border-t border-white/10 pt-3.5 sm:pt-6 flex flex-col gap-2.5 sm:gap-4 md:flex-row md:items-center md:justify-between text-center md:text-left">
          <div className="text-[10.5px] sm:text-sm text-slate-400">
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
