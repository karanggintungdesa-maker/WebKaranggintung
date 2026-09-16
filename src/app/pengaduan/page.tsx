'use client';

import React from 'react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { BackgroundPattern } from '@/components/landing/BackgroundPattern';
import { MessageSquareWarning } from 'lucide-react';
import { ComplaintSystem } from '@/app/(main)/pengaduan/_components/complaint-system';

export default function PengaduanPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900 overflow-x-hidden">
      <BackgroundPattern />
      <Header />

      <main className="relative flex-1 pt-20 sm:pt-24 pb-12 sm:pb-16">
        {/* PAGE HERO */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-4 sm:pb-8">
          <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
              <MessageSquareWarning className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Layanan Aspirasi & Pengaduan Warga</span>
            </div>

            <h1 className="text-2xl min-[380px]:text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 uppercase tracking-tight font-display italic">
              Pengaduan <span className="text-primary not-italic">Warga</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
              Sampaikan aspirasi, keluhan, dan masukan Anda secara langsung untuk transparansi dan kemajuan Desa Karanggintung.
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <ComplaintSystem />
        </section>
      </main>

      <Footer />
    </div>
  );
}
