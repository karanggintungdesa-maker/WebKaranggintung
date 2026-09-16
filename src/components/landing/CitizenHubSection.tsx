'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquareWarning,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  PhoneCall,
  FileText,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function CitizenHubSection() {

  return (
    <section className="relative mx-auto max-w-7xl px-3.5 py-10 sm:px-6 lg:px-8 sm:py-20 lg:py-28">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3 mb-6 sm:mb-14">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-800">
          <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600" />
          Pusat Interaksi & Layanan Cepat
        </div>
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 font-display uppercase">
          Partisipasi & Bantuan Warga
        </h2>
        <p className="text-xs sm:text-lg text-slate-600 leading-relaxed">
          Pemerintah Desa Karanggintung siap melayani aspirasi dan kebutuhan administrasi Anda secara terbuka, responsif, dan bebas biaya pungutan.
        </p>
      </div>

      {/* Twin Portal Cards Grid (2 cards per row on mobile) */}
      <div className="grid grid-cols-2 gap-2 min-[380px]:gap-2.5 sm:gap-8 items-stretch">
        
        {/* CARD 1: Layanan Pengaduan & Aspirasi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="relative flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-[2.5rem] bg-white border border-slate-200/80 p-2.5 min-[380px]:p-3.5 sm:p-10 shadow-xs sm:shadow-xl hover:shadow-2xl transition-all duration-300 group h-full"
        >
          {/* Subtle Ambient Background Blob */}
          <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-rose-500/5 blur-2xl pointer-events-none" />

          <div className="space-y-2 sm:space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex h-7 w-7 min-[380px]:h-8 min-[380px]:w-8 sm:h-14 sm:w-14 items-center justify-center rounded-lg sm:rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shadow-xs group-hover:scale-105 transition-transform">
                <MessageSquareWarning className="h-3.5 w-3.5 sm:h-7 sm:w-7" />
              </div>
              <Badge className="bg-rose-50 text-rose-700 border border-rose-200/60 px-1.5 py-0.5 sm:px-3 sm:py-1 text-[7.5px] min-[380px]:text-[8.5px] sm:text-[10px] font-black uppercase tracking-widest rounded-full shadow-none">
                Saluran Aspirasi
              </Badge>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-xs min-[380px]:text-[13px] sm:text-2xl font-black text-slate-900 font-display leading-tight line-clamp-2">
                Pengaduan & Aspirasi
              </h3>
              <p className="text-[9.5px] min-[380px]:text-[10.5px] sm:text-sm text-slate-600 leading-relaxed line-clamp-2 sm:line-clamp-none">
                Sampaikan gagasan atau kendala fasilitas umum desa melalui sistem pengaduan terpadu.
              </p>
            </div>

            {/* Guarantees */}
            <div className="space-y-1 sm:space-y-2.5 pt-0.5 sm:pt-2">
              <div className="flex items-center gap-1.5 sm:gap-2.5 text-[8.5px] min-[380px]:text-[9.5px] sm:text-xs font-bold text-slate-700">
                <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 shrink-0" />
                <span className="truncate">Kerahasiaan Terjamin</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2.5 text-[8.5px] min-[380px]:text-[9.5px] sm:text-xs font-bold text-slate-700">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 shrink-0" />
                <span className="truncate">Respon Maks. 2x24 Jam</span>
              </div>
              <div className="hidden sm:flex items-center gap-2.5 text-xs font-bold text-slate-700">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Tindak Lanjut Transparan & Terdata Rapi</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 sm:pt-8">
            <Link href="/pengaduan/" className="block">
              <Button className="w-full h-8 min-[380px]:h-9 sm:h-12 rounded-lg sm:rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[9px] min-[380px]:text-[10px] sm:text-xs uppercase tracking-wider shadow-xs sm:shadow-lg transition-all duration-300">
                <MessageSquareWarning className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-rose-400" />
                Lapor Aduan
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* CARD 2: Layanan Surat Online & Kontak Darurat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-[2.5rem] bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white p-2.5 min-[380px]:p-3.5 sm:p-10 shadow-xs sm:shadow-xl hover:shadow-2xl transition-all duration-300 group h-full"
        >
          {/* Subtle Glow */}
          <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />

          <div className="space-y-2 sm:space-y-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex h-7 w-7 min-[380px]:h-8 min-[380px]:w-8 sm:h-14 sm:w-14 items-center justify-center rounded-lg sm:rounded-2xl bg-white/10 backdrop-blur-md text-emerald-200 border border-white/20 shadow-xs group-hover:scale-105 transition-transform">
                <FileText className="h-3.5 w-3.5 sm:h-7 sm:w-7" />
              </div>
              <Badge className="bg-white/10 text-emerald-100 border border-white/20 px-1.5 py-0.5 sm:px-3 sm:py-1 text-[7.5px] min-[380px]:text-[8.5px] sm:text-[10px] font-black uppercase tracking-widest rounded-full shadow-none">
                Layanan Kilat
              </Badge>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-xs min-[380px]:text-[13px] sm:text-2xl font-black font-display tracking-tight leading-tight line-clamp-2">
                Anjungan Surat Warga
              </h3>
              <p className="text-[9.5px] min-[380px]:text-[10.5px] sm:text-sm text-emerald-50/90 leading-relaxed line-clamp-2 sm:line-clamp-none">
                Permohonan surat pengantar & administrasi mandiri secara online tanpa perlu antre di balai desa.
              </p>
            </div>

            {/* Guarantees */}
            <div className="space-y-1 sm:space-y-2.5 pt-0.5 sm:pt-2">
              <div className="flex items-center gap-1.5 sm:gap-2.5 text-[8.5px] min-[380px]:text-[9.5px] sm:text-xs font-bold text-emerald-100">
                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-300 shrink-0" />
                <span className="truncate">Gratis Bebas Pungli (Rp 0)</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2.5 text-[8.5px] min-[380px]:text-[9.5px] sm:text-xs font-bold text-emerald-100">
                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-300 shrink-0" />
                <span className="truncate">Formulir Mandiri Cepat</span>
              </div>
              <div className="hidden sm:flex items-center gap-2.5 text-xs font-bold text-emerald-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
                <span>Notifikasi Status Surat Dikirim Langsung</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 sm:pt-8 flex flex-col sm:flex-row gap-1.5 sm:gap-3 relative z-10">
            <Link href="/layanan-surat/" className="flex-1">
              <Button className="w-full h-8 min-[380px]:h-9 sm:h-12 rounded-lg sm:rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[9px] min-[380px]:text-[10px] sm:text-xs uppercase tracking-wider shadow-xs sm:shadow-lg shadow-amber-400/20 transition-all duration-300">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Buat Surat
              </Button>
            </Link>

            <Link href="/nomor-penting/" className="hidden sm:block sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-8 min-[380px]:h-9 sm:h-12 rounded-lg sm:rounded-2xl border-white/30 text-emerald-950 bg-white hover:bg-white/90 font-bold text-[9px] min-[380px]:text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-300"
              >
                <PhoneCall className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-emerald-700" />
                Nomor Penting
              </Button>
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
