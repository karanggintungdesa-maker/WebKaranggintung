'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMemoFirebase, useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Building2,
  MapPin,
  Users,
  Compass,
  Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function SambutanSection() {
  const firestore = useFirestore();
  const profileRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'default');
  }, [firestore]);

  const { data: profileData } = useDoc<{
    kadesPhotoUrl?: string;
    description?: string;
    imageUrl?: string;
  }>(profileRef);

  const kadesPhoto = profileData?.kadesPhotoUrl || "https://picsum.photos/seed/kades/600/800";
  const balaiDesaPhoto = profileData?.imageUrl || "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200";

  return (
    <section className="relative mx-auto max-w-7xl px-3.5 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Container Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-white border border-slate-200/80 shadow-xl shadow-slate-200/50 p-4 sm:p-10 lg:p-14">
        
        {/* Top Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 pb-4 sm:pb-8 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] sm:tracking-[0.25em] text-emerald-800">
              Pemerintah Kabupaten Cilacap • Kecamatan Gandrungmangu
            </span>
          </div>
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 sm:px-3.5 sm:py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-full shadow-none">
            <ShieldCheck className="h-3 w-3 mr-1 inline text-emerald-600" />
            Portal Resmi Desa Karanggintung
          </Badge>
        </div>

        {/* Content Grid: Kades Photo + Official Welcome & Village Identity */}
        <div className="grid gap-6 sm:gap-10 pt-6 sm:pt-10 lg:grid-cols-12 lg:items-stretch">
          
          {/* Kolom Kiri: Foto Kades Proposional di Mobile & Megah di Desktop */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 flex flex-col h-full"
          >
            <div className="relative w-full h-full min-h-[360px] sm:min-h-[480px] lg:min-h-[700px] overflow-hidden rounded-xl sm:rounded-[2.5rem] bg-gradient-to-b from-slate-100 via-slate-50 to-slate-900 shadow-xl sm:shadow-2xl border-2 sm:border-4 border-white group flex flex-col justify-between">
              {/* Foto Kades - Full Body Object Top */}
              <Image
                src={kadesPhoto}
                alt="Foto Kepala Desa Karanggintung"
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                priority
              />

              {/* Top Badge: Balai Desa Glass Pill */}
              <div className="relative z-10 m-3 sm:m-5 self-start flex items-center gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl bg-slate-950/60 backdrop-blur-md border border-white/20 text-white shadow-lg">
                <div className="relative h-6 w-6 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl overflow-hidden shrink-0 border border-white/40">
                  <Image
                    src={balaiDesaPhoto}
                    alt="Kantor Desa Karanggintung"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="text-[8px] sm:text-[9px] font-bold text-emerald-300 uppercase tracking-wider leading-none">Balai Desa</p>
                  <p className="text-[10px] sm:text-[11px] font-black leading-tight text-white">Karanggintung</p>
                </div>
              </div>

              {/* Bottom Subtle Gradient & Name Tag */}
              <div className="relative z-10 w-full pt-12 pb-4 px-4 sm:pt-20 sm:pb-6 sm:px-6 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent text-white text-center">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 mb-1.5 sm:mb-2 rounded-full bg-emerald-500/80 backdrop-blur-md text-[8.5px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white shadow-md">
                  <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  Kepala Desa
                </div>
                <h3 className="text-xl sm:text-3xl font-black uppercase tracking-tight font-display drop-shadow-md">
                  TURMONO
                </h3>
                <p className="text-[11px] sm:text-xs font-medium text-emerald-200/90 mt-0.5 tracking-wide">
                  Pemerintah Desa Karanggintung
                </p>
              </div>
            </div>
          </motion.div>

          {/* Kolom Kanan: Narasi Sambutan & Fakta Integritas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-6"
          >
            <div className="space-y-2 sm:space-y-3">
              <span className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase tracking-[0.18em] sm:tracking-[0.2em] flex items-center gap-1.5 sm:gap-2">
                <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
                Sambutan & Visi Kepemimpinan
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight uppercase font-display tracking-tight">
                Melayani dengan <span className="text-emerald-700">Tulus</span>, Membangun dengan <span className="text-amber-500">Transparansi</span>.
              </h2>
            </div>

            {/* Blockquote Sambutan */}
            <div className="relative rounded-xl sm:rounded-2xl bg-slate-50 p-4 sm:p-6 border-l-4 border-emerald-600">
              <Quote className="absolute top-3 right-3 sm:top-4 sm:right-4 h-6 w-6 sm:h-8 sm:w-8 text-emerald-600/10 pointer-events-none" />
              <p className="text-xs sm:text-base text-slate-700 leading-relaxed font-medium italic">
                "Assalamu'alaikum Warahmatullahi Wabarakatuh. Selamat datang di portal resmi digital Desa Karanggintung. 
                Website ini kami hadirkan sebagai wujud nyata komitmen keterbukaan informasi publik, efisiensi pelayanan administrasi kependudukan, serta wadah akselerasi potensi perekonomian seluruh masyarakat."
              </p>
            </div>

            <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
              Desa Karanggintung terus bergerak maju menyongsong era transformasi digital. Warga kini dapat mengakses layanan pengurusan surat, transparansi pajak PBB-P2, hingga pengaduan aspirasi tanpa hambatan birokrasi, kapan saja dan dari mana saja.
            </p>

            {/* Village Key Demographics Pill Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-1 sm:pt-2">
              <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-emerald-50/70 border border-emerald-100/80 text-center">
                <div className="flex items-center justify-center text-emerald-700 mb-0.5 sm:mb-1">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <p className="text-lg sm:text-xl font-black text-emerald-950 font-mono">5</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Wilayah Dusun</p>
              </div>

              <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-amber-50/70 border border-amber-100/80 text-center">
                <div className="flex items-center justify-center text-amber-700 mb-0.5 sm:mb-1">
                  <Compass className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <p className="text-lg sm:text-xl font-black text-amber-950 font-mono">6</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-amber-800 uppercase tracking-wider">Rukun Warga (RW)</p>
              </div>

              <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-teal-50/70 border border-teal-100/80 text-center">
                <div className="flex items-center justify-center text-teal-700 mb-0.5 sm:mb-1">
                  <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <p className="text-lg sm:text-xl font-black text-teal-950 font-mono">51</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-teal-800 uppercase tracking-wider">Rukun Tetangga (RT)</p>
              </div>

              <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-100/80 border border-slate-200/80 text-center">
                <div className="flex items-center justify-center text-slate-700 mb-0.5 sm:mb-1">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <p className="text-lg sm:text-xl font-black text-slate-950 font-mono">9.700+</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-700 uppercase tracking-wider">Total Penduduk</p>
              </div>
            </div>

            {/* Core Values Tag List & Action CTA */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {["Transparansi Penuh", "Bebas Pungli (Rp 0)", "Digital & Cepat"].map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 bg-slate-100 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-700"
                  >
                    <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-600" />
                    {tag}
                  </div>
                ))}
              </div>

              <Link href="/profil-desa" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-10 sm:h-11 rounded-xl sm:rounded-full bg-emerald-700 hover:bg-emerald-600 px-5 sm:px-6 font-bold text-[11px] sm:text-xs uppercase tracking-wider text-white shadow-md sm:shadow-lg shadow-emerald-700/25 transition-all duration-300 hover:scale-[1.02]">
                  Jelajahi Profil & Sejarah Desa
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-2" />
                </Button>
              </Link>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}
