'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Landmark,
  Megaphone,
  Newspaper,
  PieChart,
  ShieldCheck,
  Sparkles,
  Users,
  Send,
  Mail,
  MapPin,
  FileCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/* ═══════════════════════════════════════════════════════════
   VECTOR ILLUSTRATIONS (Clean, High-DPI SVGs for Cards)
   ═══════════════════════════════════════════════════════════ */

/* Card 1 Vector: Stacked Official Documents with Green Check Circle */
function DocumentVector() {
  return (
    <div className="absolute right-0 bottom-14 w-44 h-44 pointer-events-none select-none opacity-85 transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-1">
      <svg viewBox="0 0 160 160" fill="none" className="w-full h-full">
        {/* Back document */}
        <rect
          x="35"
          y="15"
          width="75"
          height="100"
          rx="12"
          transform="rotate(8 35 15)"
          fill="#E6F4EA"
          stroke="#CEEAD6"
          strokeWidth="2"
        />
        {/* Front document */}
        <rect
          x="20"
          y="25"
          width="85"
          height="105"
          rx="14"
          fill="url(#docGrad)"
          stroke="#E2E8F0"
          strokeWidth="2.5"
          className="drop-shadow-md"
        />
        {/* Document lines */}
        <rect x="36" y="45" width="52" height="5" rx="2.5" fill="#CBD5E1" />
        <rect x="36" y="58" width="44" height="4" rx="2" fill="#E2E8F0" />
        <rect x="36" y="69" width="48" height="4" rx="2" fill="#E2E8F0" />
        <rect x="36" y="80" width="38" height="4" rx="2" fill="#E2E8F0" />
        <rect x="36" y="91" width="46" height="4" rx="2" fill="#E2E8F0" />
        {/* Green Checkmark Circle Badge */}
        <g transform="translate(82, 90)">
          <circle cx="24" cy="24" r="22" fill="#10B981" className="drop-shadow-lg" />
          <path
            d="M16 24L21 29L32 18"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <linearGradient id="docGrad" x1="20" y1="25" x2="105" y2="130" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop stopColor="#F8FAFC" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/* Card 4 Vector: Folded 3D Newspaper */
function NewspaperVector() {
  return (
    <div className="absolute -right-2 bottom-6 w-36 h-36 pointer-events-none select-none opacity-85 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
      <svg viewBox="0 0 140 140" fill="none" className="w-full h-full">
        <rect
          x="20"
          y="20"
          width="85"
          height="100"
          rx="10"
          transform="rotate(10 20 20)"
          fill="#E2E8F0"
          stroke="#CBD5E1"
          strokeWidth="2"
        />
        <rect
          x="10"
          y="25"
          width="90"
          height="95"
          rx="10"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="2.5"
          className="drop-shadow-md"
        />
        {/* NEWS Header */}
        <rect x="22" y="38" width="66" height="12" rx="3" fill="#F1F5F9" />
        <text x="36" y="47" fill="#94A3B8" fontSize="8" fontWeight="bold" letterSpacing="2">
          NEWS
        </text>
        {/* Photo Box */}
        <rect x="22" y="56" width="30" height="26" rx="4" fill="#E2E8F0" />
        {/* Article text lines */}
        <rect x="58" y="57" width="30" height="3" rx="1.5" fill="#CBD5E1" />
        <rect x="58" y="64" width="26" height="3" rx="1.5" fill="#E2E8F0" />
        <rect x="58" y="71" width="28" height="3" rx="1.5" fill="#E2E8F0" />
        <rect x="58" y="78" width="20" height="3" rx="1.5" fill="#E2E8F0" />
        <rect x="22" y="88" width="66" height="3" rx="1.5" fill="#E2E8F0" />
        <rect x="22" y="95" width="58" height="3" rx="1.5" fill="#E2E8F0" />
        <rect x="22" y="102" width="62" height="3" rx="1.5" fill="#CBD5E1" />
      </svg>
    </div>
  );
}

/* Card 5 Vector: 3D Laptop with Paper Airplane Flying */
function LaptopVector() {
  return (
    <div className="absolute right-0 bottom-4 w-44 h-40 pointer-events-none select-none opacity-85 transition-transform duration-500 group-hover:scale-105 group-hover:translate-x-1">
      <svg viewBox="0 0 160 140" fill="none" className="w-full h-full">
        {/* Laptop Screen */}
        <rect
          x="30"
          y="25"
          width="90"
          height="62"
          rx="8"
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth="3"
          className="drop-shadow-sm"
        />
        {/* Screen inner content */}
        <rect x="38" y="34" width="74" height="44" rx="4" fill="#F8FAFC" />
        <rect x="44" y="44" width="40" height="3" rx="1.5" fill="#CBD5E1" />
        <rect x="44" y="52" width="34" height="3" rx="1.5" fill="#E2E8F0" />
        <rect x="44" y="60" width="48" height="3" rx="1.5" fill="#E2E8F0" />
        {/* Laptop Base */}
        <path
          d="M18 90C18 88.3431 19.3431 87 21 87H129C130.657 87 132 88.3431 132 90L136 98C136 100.209 134.209 102 132 102H18C15.7909 102 14 100.209 14 98L18 90Z"
          fill="#E2E8F0"
          stroke="#CBD5E1"
          strokeWidth="2"
        />
        <rect x="68" y="89" width="14" height="2" rx="1" fill="#94A3B8" />
        {/* Paper Plane Flying */}
        <g transform="translate(100, 22) rotate(-15)">
          <path
            d="M0 16L32 0L20 28L14 18L0 16Z"
            fill="#34D399"
            className="drop-shadow-md"
          />
          <path d="M32 0L14 18V26L18 21" fill="#059669" />
          <path d="M14 18L32 0" stroke="#047857" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
}

/* Card 6 Vector: 3D Loudspeaker / Megaphone with Audio Waves */
function MegaphoneVector() {
  return (
    <div className="absolute right-0 bottom-4 w-40 h-40 pointer-events-none select-none opacity-85 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
      <svg viewBox="0 0 150 150" fill="none" className="w-full h-full">
        {/* Megaphone Body */}
        <g transform="translate(30, 30) rotate(-15)">
          {/* Cone */}
          <path
            d="M20 30L65 10V60L20 40V30Z"
            fill="url(#megaGrad)"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="drop-shadow-md"
          />
          {/* Rear Cap */}
          <rect
            x="8"
            y="26"
            width="12"
            height="18"
            rx="4"
            fill="#34D399"
            stroke="#059669"
            strokeWidth="2"
          />
          {/* Handle */}
          <path
            d="M28 40L24 64C24 66.2091 25.7909 68 28 68C30.2091 68 32 66.2091 32 64L34 40"
            fill="#10B981"
            stroke="#047857"
            strokeWidth="2"
          />
          {/* Front Rim */}
          <ellipse
            cx="65"
            cy="35"
            rx="5"
            ry="25"
            fill="#6EE7B7"
            stroke="#059669"
            strokeWidth="2"
          />
        </g>
        {/* Sound Waves */}
        <path
          d="M102 42C108 52 108 68 102 78"
          stroke="#34D399"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M112 34C122 48 122 72 112 86"
          stroke="#6EE7B7"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="megaGrad" x1="20" y1="10" x2="65" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6EE7B7" />
            <stop stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT: ServicesSection
   ═══════════════════════════════════════════════════════════ */

export function ServicesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      {/* SECTION HEADER */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-700 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            Layanan Utama Desa
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl font-display">
            Layanan digital desa yang mudah dipahami dan diakses.
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600 font-medium">
            Seluruh pelayanan desa dapat dijangkau secara cepat melalui portal digital yang dirancang khusus untuk kemudahan masyarakat.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full lg:max-w-md shrink-0"
        >
          <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 rounded-2xl flex items-center gap-3 shadow-sm border border-amber-200/50">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-md shadow-amber-500/25 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-amber-900">Transparansi Biaya</h3>
              <p className="text-[11px] leading-relaxed font-bold text-amber-800">
                Seluruh layanan administrasi adalah <strong className="text-amber-950 font-black underline decoration-amber-400">GRATIS</strong> (Rp. 0,-) tanpa biaya apapun.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* SERVICES CARDS GRID */}
      <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">

        {/* ── CARD 1: Pelayanan Desa ── */}
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          whileHover={{ y: -6 }}
          className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-white border border-slate-100/90 p-5 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          {/* Faint Background Vector */}
          <DocumentVector />

          {/* Top Row: Icon + Badge */}
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md shadow-emerald-700/20 transition-transform duration-300 group-hover:scale-105">
                <FileText className="h-6 w-6" />
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-none">
                Layanan Utama
              </Badge>
            </div>

            {/* Title & Description */}
            <h3 className="mt-6 text-2xl font-black tracking-tight text-slate-900 font-display">
              Pelayanan Desa
            </h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 font-medium">
              Akses layanan administrasi dan dokumen resmi dengan langkah yang sederhana.
            </p>

            {/* Highlights List */}
            <div className="mt-6 space-y-2.5">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/70 border border-slate-100/60">
                <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700">Surat Keterangan & Dokumen Resmi</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/70 border border-slate-100/60">
                <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700">Proses Cepat & Terintegrasi</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/70 border border-slate-100/60">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700">100% Gratis Tanpa Biaya Pungutan</span>
              </div>
            </div>
          </div>

          {/* Bottom Button (Solid Dark Emerald) */}
          <div className="mt-8 relative z-10">
            <Link href="/pelayanan-desa/">
              <div className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all duration-300 group-hover:bg-emerald-800">
                <span>Akses Layanan</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </motion.article>

        {/* ── CARD 2: Profil Desa ── */}
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -6 }}
          className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-white border border-slate-100/90 p-5 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          {/* Right Arched Landscape Image + Script Text */}
          <div className="absolute right-3 top-6 w-32 sm:w-36 h-48 pointer-events-none select-none z-0 flex flex-col items-center">
            <div className="relative w-28 sm:w-32 h-36 rounded-t-full overflow-hidden border-2 border-white shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1602989106211-81de671c23a9?q=80&w=400"
                alt="Desa Karanggintung"
                fill
                sizes="140px"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <div className="mt-2 text-center">
              <p className="text-[11px] font-bold italic text-emerald-850 tracking-tight leading-none font-serif">
                Mengenal Desa
              </p>
              <p className="text-[11px] font-bold italic text-emerald-850 tracking-tight leading-none font-serif mt-0.5">
                Lebih Dekat
              </p>
              <div className="w-12 h-1 bg-emerald-500 rounded-full mx-auto mt-1 opacity-70" />
            </div>
          </div>

          {/* Top Row: Icon + Badge */}
          <div className="relative z-10 max-w-[62%] sm:max-w-[65%]">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md shadow-emerald-700/20 transition-transform duration-300 group-hover:scale-105">
                <Landmark className="h-6 w-6" />
              </div>
            </div>

            {/* Title & Description */}
            <h3 className="mt-6 text-2xl font-black tracking-tight text-slate-900 font-display">
              Profil Desa
            </h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 font-medium">
              Kenali sejarah, struktur, dan identitas pemerintahan desa secara lengkap.
            </p>
          </div>

          {/* Top Right Badge absolute position */}
          <div className="absolute top-7 right-7 z-10">
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-none">
              Informasi
            </Badge>
          </div>

          {/* Highlights List */}
          <div className="mt-6 space-y-2.5 relative z-10 max-w-[70%] sm:max-w-[72%]">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/70 border border-slate-100/60">
              <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-slate-700">Sejarah & Visi Misi Desa</span>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/70 border border-slate-100/60">
              <Users className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-slate-700">Struktur Organisasi Pemdes</span>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/70 border border-slate-100/60">
              <Compass className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-slate-700">Peta Wilayah & Potensi Utama</span>
            </div>
          </div>

          {/* Bottom Button */}
          <div className="mt-8 relative z-10">
            <Link href="/profil-desa/">
              <div className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 font-bold text-sm border border-emerald-100/80 transition-all duration-300">
                <span>Lihat Profil Desa</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </motion.article>

        {/* ── CARD 3: Statistik Desa ── */}
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          whileHover={{ y: -6 }}
          className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-white border border-slate-100/90 p-5 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          {/* Top Row: Icon + Badge */}
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md shadow-emerald-700/20 transition-transform duration-300 group-hover:scale-105">
                <BarChart3 className="h-6 w-6" />
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-none">
                Data
              </Badge>
            </div>

            {/* Title & Description */}
            <h3 className="mt-6 text-2xl font-black tracking-tight text-slate-900 font-display">
              Statistik Desa
            </h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 font-medium">
              Lihat data kependudukan dan informasi desa secara realtime dan transparan.
            </p>

            {/* Highlights List */}
            <div className="mt-6 space-y-2.5">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/70 border border-slate-100/60">
                <Users className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700">Data Kependudukan Realtime</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/70 border border-slate-100/60">
                <PieChart className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700">Statistik Demografi & Pekerjaan</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/70 border border-slate-100/60">
                <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700">Transparansi Informasi Publik</span>
              </div>
            </div>
          </div>

          {/* Bottom Button */}
          <div className="mt-8 relative z-10">
            <Link href="/statistik/">
              <div className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 font-bold text-sm border border-emerald-100/80 transition-all duration-300">
                <span>Lihat Statistik</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </motion.article>

        {/* ── CARD 4: Berita Desa ── */}
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -6 }}
          className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-white border border-slate-100/90 p-5 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          {/* Newspaper Vector Illustration */}
          <NewspaperVector />

          {/* Top Row: Icon + Badge */}
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20 transition-transform duration-300 group-hover:scale-105">
                <Newspaper className="h-6 w-6" />
              </div>
              <Badge className="bg-amber-50 text-amber-700 border border-amber-200/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-none">
                Informasi
              </Badge>
            </div>

            {/* Title & Description */}
            <h3 className="mt-6 text-2xl font-black tracking-tight text-slate-900 font-display">
              Berita Desa
            </h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 font-medium max-w-[70%]">
              Ikuti informasi dan kegiatan terbaru dari Pemerintah Desa Karanggintung.
            </p>
          </div>

          {/* Bottom Button */}
          <div className="mt-14 relative z-10">
            <Link href="/BeritaDesa/">
              <div className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 font-bold text-sm border border-emerald-100/80 transition-all duration-300">
                <span>Lihat Berita</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </motion.article>

        {/* ── CARD 5: Layanan Surat ── */}
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          whileHover={{ y: -6 }}
          className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-white border border-slate-100/90 p-5 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          {/* Laptop + Paper Airplane Vector */}
          <LaptopVector />

          {/* Top Row: Icon + Badge */}
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 transition-transform duration-300 group-hover:scale-105">
                <Users className="h-6 w-6" />
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-none">
                Online 24/7
              </Badge>
            </div>

            {/* Title & Description */}
            <h3 className="mt-6 text-2xl font-black tracking-tight text-slate-900 font-display">
              Layanan Surat
            </h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 font-medium max-w-[68%]">
              Ajukan berbagai surat keterangan dan kebutuhan administrasi secara online.
            </p>
          </div>

          {/* Bottom Button */}
          <div className="mt-14 relative z-10">
            <Link href="/layanan-surat/">
              <div className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 font-bold text-sm border border-emerald-100/80 transition-all duration-300">
                <span>Ajukan Surat</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </motion.article>

        {/* ── CARD 6: Pengumuman ── */}
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ y: -6 }}
          className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-white border border-slate-100/90 p-5 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          {/* Megaphone Vector */}
          <MegaphoneVector />

          {/* Top Row: Icon + Badge */}
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-md shadow-emerald-800/20 transition-transform duration-300 group-hover:scale-105">
                <Megaphone className="h-6 w-6" />
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-none">
                Pengumuman
              </Badge>
            </div>

            {/* Title & Description */}
            <h3 className="mt-6 text-2xl font-black tracking-tight text-slate-900 font-display">
              Pengumuman
            </h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 font-medium max-w-[68%]">
              Temukan pengumuman penting serta agenda desa yang harus diketahui.
            </p>
          </div>

          {/* Bottom Button */}
          <div className="mt-14 relative z-10">
            <Link href="/pengumuman/">
              <div className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 font-bold text-sm border border-emerald-100/80 transition-all duration-300">
                <span>Lihat Pengumuman</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </motion.article>

      </div>
    </section>
  );
}

