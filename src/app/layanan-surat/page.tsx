'use client';

import Link from 'next/link';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { BackgroundPattern } from '@/components/landing/BackgroundPattern';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { LetterService } from '@/app/(main)/layanan-surat/_components/letter-service';
import { TrackTicket } from '@/app/(main)/layanan-surat/_components/track-ticket';

export default function LayananSuratPage() {
  return (
    <div className="relative flex flex-col min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden pt-20 sm:pt-24 font-sans">
      <BackgroundPattern />
      <Header />

      <main className="relative flex-1 container mx-auto px-3 sm:px-4 py-6 sm:py-10 md:py-12 max-w-7xl">
        {/* PAGE HEADER */}
        <div className="mb-6 sm:mb-10 space-y-2 sm:space-y-3">
          <Badge className="bg-emerald-50 text-emerald-700 font-black uppercase text-[9px] sm:text-[10px] tracking-widest px-3 sm:px-4 py-1 sm:py-1.5 border-none shadow-sm">
            Administrasi Digital Desa
          </Badge>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center text-white shadow-md sm:shadow-xl shadow-primary/20 shrink-0">
              <FileText className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>
            <div>
              <h1 className="text-2xl min-[380px]:text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900 font-display italic">
                Layanan <span className="text-primary not-italic">Surat</span>
              </h1>
              <p className="text-xs sm:text-base text-slate-500 font-medium mt-0.5 sm:mt-1 leading-relaxed">
                Ajukan berbagai jenis surat keterangan resmi desa secara mandiri dan lacak statusnya secara online.
              </p>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="space-y-6 sm:space-y-8">
          <TrackTicket />
          <LetterService />
        </div>
      </main>

      {/* OFFICIAL PORTAL FOOTER */}
      <Footer />
    </div>
  );
}
