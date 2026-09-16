'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useMemoFirebase, useDoc, useCollection, useFirestore } from '@/firebase';
import { doc, collection, query, limit } from 'firebase/firestore';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  FileText,
  Home,
  Landmark,
  Leaf,
  MapPin,
  Megaphone,
  MessageSquareWarning,
  Newspaper,
  Sprout,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useEffect, useState } from 'react';

/* ────────────── Animated Counter ────────────── */

function AnimatedCounter({ target, suffix }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [val, setVal] = useState('0');

  useEffect(() => {
    if (!inView) return;
    const dur = 2000;
    const t0 = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setVal(Math.round(e * target).toLocaleString('id-ID'));
      if (p < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {val}
      {suffix && (
        <span className="text-sm font-semibold text-slate-400 ml-0.5">{suffix}</span>
      )}
    </span>
  );
}

/* ════════════════════════════════════════════════
   Hero Section
   ════════════════════════════════════════════════ */

export function HeroSection() {
  /* Firebase data */
  const firestore = useFirestore();
  const heroRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'heroImage', 'default');
  }, [firestore]);

  const { data: heroData } = useDoc<{ imageUrl?: string }>(heroRef);
  const heroImageUrl =
    heroData?.imageUrl ||
    'https://images.unsplash.com/photo-1602989106211-81de671c23a9?q=80&w=2000';

  /* Village statistics from Firestore / Karanggintung profile */
  const statsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'statistics');
  }, [firestore]);
  const { data: statsDoc } = useDoc<any>(statsRef);

  const potentialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'potensiDesa'), limit(100));
  }, [firestore]);
  const { data: potensiList } = useCollection(potentialsQuery);

  const statsItems = [
    {
      icon: Users,
      value: 9746,
      label: 'Penduduk',
    },
    {
      icon: Home,
      value: 5,
      label: 'Dusun',
    },
    {
      icon: MapPin,
      value: 988,
      label: 'Luas Wilayah',
      suffix: ' ha',
    },
    {
      icon: Sprout,
      value: (potensiList && potensiList.length >= 4) ? potensiList.length : 4,
      label: 'Potensi Desa',
    },
  ];

  /* Scroll-based parallax */
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-gradient-to-br from-green-50/80 via-white to-emerald-50/30"
    >
      {/* ═══ Background Image — parallax + camera push-in ═══ */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-[-4%] hero-camera-push">
          <Image
            src={heroImageUrl}
            alt="Pemandangan desa Karanggintung"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </motion.div>

      {/* ═══ Gradient Overlays — text-readability on left, vivid landscape on right ═══ */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/[0.95] via-white/[0.80] via-[50%] to-white/[0.08]" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/[0.85] via-transparent to-white/[0.15]" />
      <div className="absolute inset-0 bg-emerald-50/15" />

      {/* ═══ Decorative Clouds — gentle drift ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="hero-cloud-drift absolute top-[6%] left-[8%] w-72 h-16 bg-white/40 rounded-full blur-3xl" />
        <div className="hero-cloud-drift-reverse absolute top-[4%] right-[12%] w-96 h-12 bg-white/30 rounded-full blur-3xl" />
        <div className="hero-cloud-drift absolute top-[10%] left-[45%] w-56 h-10 bg-white/35 rounded-full blur-2xl" />
      </div>

      {/* ═══ Left Decorative Leaf Accent (daun.png) — Scaled & tucked to edge to never overlap text ═══ */}
      <motion.div
        initial={{ opacity: 0, x: -30, rotate: 0 }}
        animate={{ opacity: 1, x: 0, rotate: 16 }}
        transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -left-8 sm:-left-10 md:-left-12 lg:-left-14 xl:-left-16 top-[60%] sm:top-[58%] md:top-[56%] -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-36 lg:h-36 xl:w-40 xl:h-40 pointer-events-none select-none z-0 drop-shadow-md"
        aria-hidden="true"
      >
        <div className="relative w-full h-full">
          <Image
            src="/daun.png"
            alt=""
            fill
            sizes="(max-width: 768px) 100px, 160px"
            className="object-contain"
            priority
          />
        </div>
      </motion.div>

      {/* ═══════════════════ Main Content ═══════════════════ */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[92vh] sm:min-h-[88vh] lg:min-h-[90vh] flex-col justify-center pt-20 pb-16 sm:pt-20 sm:pb-24 lg:pt-16 lg:pb-24">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_1fr] xl:gap-12">

            {/* ═══════════ LEFT COLUMN — Text & CTA ═══════════ */}
            <div className="max-w-xl lg:max-w-2xl">
              {/* 1. Sub-judul Atas with animated expanding accent line */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="mb-3 sm:mb-3.5 flex items-center gap-2.5"
              >
                <motion.span
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 32, opacity: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-[2.5px] rounded-full bg-emerald-500 block shrink-0"
                />
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
                  className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-700"
                >
                  Selamat Datang di Portal Desa Digital
                </motion.span>
              </motion.div>

              {/* 2. Judul Utama: Desa Karanggintung (0.15s delay, slide up 20px, 0.8s duration) */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="font-display font-extrabold tracking-tight leading-[1.05]"
              >
                <span className="block text-4xl sm:text-5xl lg:text-6xl text-slate-900">
                  Desa
                </span>
                <span className="relative inline-flex items-center text-4xl sm:text-5xl lg:text-[3.8rem] xl:text-[4.3rem] bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  Karanggintung
                  <Leaf className="inline-block ml-2 sm:ml-3 h-7 w-7 sm:h-9 sm:w-9 lg:h-11 lg:w-11 text-emerald-600 fill-emerald-500/30 -rotate-12 transform" />
                </span>
              </motion.h1>

              {/* 3. Sub-judul Bawah (Soft fade in) */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
                className="mt-1.5 text-xs sm:text-sm font-bold uppercase tracking-[0.16em] text-emerald-700/80"
              >
                Kecamatan Gandrungmangu&ensp;•&ensp;Kabupaten Cilacap
              </motion.p>

              {/* 4. Description */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="mt-3.5 sm:mt-4 max-w-lg text-[14px] sm:text-[14.5px] leading-relaxed text-slate-600/95"
              >
                Melayani masyarakat dengan cepat, mudah, dan transparan
                melalui layanan digital, informasi desa, statistik, berita,
                dan potensi yang memperkuat pembangunan desa.
              </motion.p>

              {/* 5. CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5 sm:mt-6 flex flex-wrap items-center gap-3"
              >
                <Link href="/layanan-surat/" aria-label="Ajukan layanan desa">
                  <Button className="hero-btn-sweep group h-10 sm:h-12 rounded-full bg-emerald-700 hover:bg-emerald-600 px-5 sm:px-7 text-sm sm:text-[14.5px] font-semibold text-white shadow-[0_8px_24px_rgba(5,150,105,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(5,150,105,0.34)]">
                    Ajukan Layanan
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/profil-desa/" aria-label="Lihat profil desa">
                  <Button
                    variant="outline"
                    className="h-10 sm:h-12 rounded-full border-2 border-emerald-300/80 bg-white/80 px-5 sm:px-7 text-sm sm:text-[14.5px] font-semibold text-emerald-800 backdrop-blur-sm transition-all duration-300 hover:border-emerald-400 hover:bg-white hover:shadow-lg"
                  >
                    <Landmark className="mr-2 h-4 w-4 text-emerald-600" />
                    Profil Desa
                  </Button>
                </Link>
              </motion.div>

              {/* Mobile quick-links grid (hidden on lg+) */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5 grid grid-cols-2 gap-2.5 lg:hidden"
              >
                {[
                  { href: '/statistik/', icon: BarChart3, label: 'Statistik Desa', color: 'bg-emerald-50 text-emerald-700' },
                  { href: '/BeritaDesa/', icon: Newspaper, label: 'Berita Terkini', color: 'bg-teal-50 text-teal-700' },
                  { href: '/pengaduan/', icon: MessageSquareWarning, label: 'Layanan Pengaduan', color: 'bg-amber-50 text-amber-700' },
                  { href: '/pengumuman/', icon: CheckCircle2, label: 'Pengumuman', color: 'bg-violet-50 text-violet-700' },
                ].map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 leading-tight">{item.label}</span>
                    </div>
                  </Link>
                ))}
              </motion.div>

              {/* ── Statistics Row ── */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5 sm:mt-7 grid grid-cols-2 gap-y-3 gap-x-4 sm:grid-cols-4 sm:gap-x-5 pt-3.5 border-t border-emerald-100/60"
              >
                {statsItems.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100/70 text-emerald-700">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-lg font-extrabold tabular-nums leading-tight text-slate-800">
                          <AnimatedCounter target={s.value} suffix={s.suffix} />
                        </p>
                        <p className="text-[9px] sm:text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                          {s.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>

              {/* ── Bottom Tagline — hidden on mobile ── */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="hidden sm:flex mt-6 sm:mt-7 items-center gap-3 z-30"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center text-emerald-800">
                  <Leaf className="h-5 w-5 stroke-[2.2] text-emerald-800 fill-emerald-700/20" />
                </div>
                <div className="h-6 w-[1.5px] bg-emerald-800/40 rounded-full" />
                <p className="text-[12px] sm:text-[13px] font-semibold text-emerald-950/90 leading-snug">
                  Membangun Desa, Menguatkan Masyarakat
                  <br />
                  <span className="text-emerald-900/80 font-medium">Menuju Karanggintung yang Lebih Sejahtera</span>
                </p>
              </motion.div>
            </div>

            {/* ═══════════ RIGHT COLUMN — Mascot (desktop only) ═══════════ */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto hidden lg:flex w-full max-w-[580px] h-[640px] xl:h-[700px] items-end justify-end"
            >

              {/* ── Floating Card 1: Lihat Statistik Desa (Top Right) ── */}
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="hero-float-a absolute top-12 sm:top-10 right-2 sm:right-4 lg:right-6 z-30"
              >
                <Link
                  href="/statistik/"
                  className="group flex items-center gap-2.5 rounded-2xl bg-white/95 backdrop-blur-md px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-xl shadow-emerald-500/10 border border-white/90 transition-all duration-300 hover:shadow-2xl hover:bg-white"
                >
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                    <BarChart3 className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[11px] font-bold leading-tight text-slate-800">
                      Lihat
                    </span>
                    <span className="block text-[11px] font-bold leading-tight text-slate-800">
                      Statistik Desa
                    </span>
                  </div>
                  <ChevronRight className="ml-0.5 h-3.5 w-3.5 text-slate-400 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </motion.div>

              {/* ── Floating Card 2: Ajukan Layanan Online (Upper Left) ── */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="hero-float-b absolute top-[18%] sm:top-[16%] -left-2 sm:-left-4 lg:-left-10 z-30"
              >
                <Link
                  href="/layanan-surat/"
                  className="group flex items-center gap-2.5 rounded-2xl bg-white/95 backdrop-blur-md px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-xl shadow-emerald-500/10 border border-white/90 transition-all duration-300 hover:shadow-2xl hover:bg-white"
                >
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <FileText className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[11px] font-bold leading-tight text-slate-800">
                      Ajukan
                    </span>
                    <span className="block text-[11px] font-bold leading-tight text-slate-800">
                      Layanan Online
                    </span>
                  </div>
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white ml-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                </Link>
              </motion.div>

              {/* ── Floating Card 3: Berita Terkini (Middle Right) ── */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="hero-float-c absolute top-[32%] sm:top-[30%] -right-2 sm:right-0 lg:-right-6 z-30"
              >
                <Link
                  href="/BeritaDesa/"
                  className="group flex items-center gap-2.5 rounded-2xl bg-white/95 backdrop-blur-md px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-xl shadow-teal-500/10 border border-white/90 transition-all duration-300 hover:shadow-2xl hover:bg-white"
                >
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500 text-white shadow-sm">
                    <Newspaper className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[11px] font-bold leading-tight text-slate-800">
                      Berita
                    </span>
                    <span className="block text-[11px] font-bold leading-tight text-slate-800">
                      Terkini
                    </span>
                  </div>
                  <ChevronRight className="ml-0.5 h-3.5 w-3.5 text-slate-400 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </motion.div>

              {/* ── Floating Card 4: Layanan Pengaduan (Lower Left) ── */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="hero-float-d absolute top-[48%] sm:top-[46%] -left-2 sm:-left-4 lg:-left-8 z-30"
              >
                <Link
                  href="/pengaduan/"
                  className="group flex items-center gap-2.5 rounded-2xl bg-white/95 backdrop-blur-md px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-xl shadow-amber-500/10 border border-white/90 transition-all duration-300 hover:shadow-2xl hover:bg-white"
                >
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                    <MessageSquareWarning className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[11px] font-bold leading-tight text-slate-800">
                      Layanan
                    </span>
                    <span className="block text-[11px] font-bold leading-tight text-slate-800">
                      Pengaduan
                    </span>
                  </div>
                  <ChevronRight className="ml-0.5 h-3.5 w-3.5 text-slate-400 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </motion.div>

              {/* ── Floating Card 5: Pengumuman (Bottom Right) ── */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="hero-float-b absolute top-[62%] sm:top-[60%] -right-2 sm:right-0 lg:-right-6 z-30"
              >
                <Link
                  href="/pengumuman/"
                  className="group flex items-center gap-2.5 rounded-2xl bg-white/95 backdrop-blur-md px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-xl shadow-violet-500/10 border border-white/90 transition-all duration-300 hover:shadow-2xl hover:bg-white"
                >
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500 text-white shadow-sm">
                    <Megaphone className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[11px] font-bold leading-tight text-slate-800">
                      Pengumuman
                    </span>
                    <span className="block text-[11px] font-bold leading-tight text-slate-800">
                      Desa
                    </span>
                  </div>
                  <ChevronRight className="ml-0.5 h-3.5 w-3.5 text-slate-400 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </motion.div>

              {/* ── 3D Officer Mascot Character — Animated Floating & Glow ── */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-12 sm:-bottom-16 lg:-bottom-24 xl:-bottom-28 right-0 sm:right-2 lg:right-4 z-10 w-[340px] sm:w-[420px] md:w-[480px] lg:w-[540px] xl:w-[600px] h-[520px] sm:h-[620px] lg:h-[700px] xl:h-[780px] flex items-end justify-center pointer-events-none select-none"
              >
                <div className="relative w-full h-full hero-mascot-anim flex items-end justify-center">
                  <Image
                    src="https://res.cloudinary.com/dxta8rrlz/image/upload/v1789468618/webdesa/hero_character_animated.webp"
                    alt="Petugas Desa Digital Karanggintung"
                    width={540}
                    height={960}
                    priority
                    unoptimized
                    className="object-contain object-bottom w-full h-full relative z-0"
                  />
                  {/* Subtle tablet screen glow */}
                  <div className="hero-tablet-shine" aria-hidden="true" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══ Bottom Flowing Organic Wave Element (In Front of Mascot Legs) ═══ */}
      <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-44 lg:h-56 xl:h-64 w-full pointer-events-none overflow-hidden z-20 select-none">
        <div className="relative w-full h-full">
          <Image
            src="/hero-bottom-wave.svg"
            alt=""
            fill
            className="object-cover object-bottom"
            priority
          />
        </div>
      </div>
    </section>
  );
}
