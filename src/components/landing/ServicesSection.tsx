'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Compass,
  FileCheck2,
  FileText,
  Landmark,
  MessageSquareQuote,
  PhoneCall,
  Receipt,
  ShieldCheck,
  Sparkles,
  Store,
} from 'lucide-react';

interface ServiceCardItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
  vector: React.ReactNode;
}

const serviceItemsRow1: ServiceCardItem[] = [
  {
    id: 'surat',
    title: 'SURAT MANDIRI',
    subtitle: 'Pengajuan surat & dokumen resmi warga mandiri online',
    href: '/layanan-surat/',
    icon: <FileCheck2 className="h-6 w-6 text-emerald-100" />,
    vector: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full">
        {/* Lembar Dokumen Resmi */}
        <path d="M24 14 H64 L80 30 V86 C80 88.2 78.2 90 76 90 H24 C21.8 90 20 88.2 20 86 V18 C20 15.8 21.8 14 24 14 Z" strokeWidth="2.5" strokeLinejoin="round" fill="white" fillOpacity="0.08" />
        <path d="M64 14 V30 H80" strokeWidth="2.5" strokeLinejoin="round" />
        {/* Garis isi surat */}
        <line x1="30" y1="36" x2="56" y2="36" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="30" y1="45" x2="68" y2="45" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 3" />
        <line x1="30" y1="53" x2="64" y2="53" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 3" />
        <line x1="30" y1="61" x2="50" y2="61" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 3" />
        {/* Stempel Segel Lilin & Pita Pengesahan */}
        <circle cx="66" cy="71" r="10" strokeWidth="2.5" fill="white" fillOpacity="0.2" />
        <path d="M62 79 L60 89 L66 86 L72 89 L70 79" strokeWidth="2" strokeLinejoin="round" fill="white" fillOpacity="0.15" />
        <path d="M63 71 L65 74 L70 69" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'pelayanan',
    title: 'PELAYANAN DESA',
    subtitle: 'Standar operasional & kepengurusan warga 100% gratis',
    href: '/pelayanan-desa/',
    icon: <FileText className="h-6 w-6 text-emerald-100" />,
    vector: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full">
        {/* Papan Klip SOP */}
        <rect x="36" y="8" width="28" height="12" rx="3" strokeWidth="2.5" fill="white" fillOpacity="0.18" />
        <circle cx="50" cy="14" r="2.5" fill="white" />
        <rect x="20" y="16" width="60" height="74" rx="6" strokeWidth="2.5" fill="white" fillOpacity="0.08" />
        {/* Baris Checklist 1 */}
        <rect x="28" y="32" width="11" height="11" rx="2" strokeWidth="2" fill="white" fillOpacity="0.15" />
        <path d="M30 38 L34 41 L39 34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="45" y1="38" x2="70" y2="38" strokeWidth="2.5" strokeLinecap="round" />
        {/* Baris Checklist 2 */}
        <rect x="28" y="48" width="11" height="11" rx="2" strokeWidth="2" fill="white" fillOpacity="0.15" />
        <path d="M30 54 L34 57 L39 50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="45" y1="54" x2="68" y2="54" strokeWidth="2.5" strokeLinecap="round" />
        {/* Baris Checklist 3 */}
        <rect x="28" y="64" width="11" height="11" rx="2" strokeWidth="2" fill="white" fillOpacity="0.15" />
        <path d="M30 70 L34 73 L39 66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="45" y1="70" x2="60" y2="70" strokeWidth="2.5" strokeLinecap="round" />
        {/* Bintang Mutu Pelayanan */}
        <circle cx="71" cy="74" r="9" strokeWidth="2" fill="white" fillOpacity="0.18" />
        <path d="M71 68 L72.5 72 L77 72 L73.5 74.5 L75 79 L71 76 L67 79 L68.5 74.5 L65 72 L69.5 72 Z" fill="white" fillOpacity="0.8" />
      </svg>
    ),
  },
  {
    id: 'pbb',
    title: 'CEK PBB-P2',
    subtitle: 'Cek tagihan & status lunas pajak PBB-P2 desa cepat',
    href: '/#pbb-section',
    icon: <Receipt className="h-6 w-6 text-emerald-100" />,
    vector: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full">
        {/* Siluet Bangunan Rumah Warga */}
        <path d="M14 46 L44 20 L74 46 V78 C74 80 72.5 82 70 82 H18 C15.5 82 14 80 14 78 Z" strokeWidth="2.5" strokeLinejoin="round" fill="white" fillOpacity="0.06" />
        <path d="M58 26 V18 H66 V33" strokeWidth="2" strokeLinejoin="round" />
        <rect x="24" y="50" width="16" height="16" rx="2" strokeWidth="2" fill="white" fillOpacity="0.12" />
        <line x1="32" y1="50" x2="32" y2="66" strokeWidth="1.5" />
        <line x1="24" y1="58" x2="40" y2="58" strokeWidth="1.5" />
        {/* Lembar Bukti Tagihan Pajak PBB */}
        <g transform="translate(46, 38)">
          <path d="M0 0 H36 V44 L30 40 L24 44 L18 40 L12 44 L6 40 L0 44 Z" strokeWidth="2" strokeLinejoin="round" fill="white" fillOpacity="0.2" />
          <text x="6" y="14" fill="white" fontSize="9" fontWeight="900" fontFamily="sans-serif">PBB</text>
          {/* Garis Barcode Pajak */}
          <line x1="6" y1="22" x2="6" y2="34" strokeWidth="1.5" />
          <line x1="10" y1="22" x2="10" y2="34" strokeWidth="2.5" />
          <line x1="15" y1="22" x2="15" y2="34" strokeWidth="1" />
          <line x1="18" y1="22" x2="18" y2="34" strokeWidth="2" />
          <line x1="23" y1="22" x2="23" y2="34" strokeWidth="1.5" />
          <line x1="28" y1="22" x2="28" y2="34" strokeWidth="2" />
        </g>
        {/* Tumpukan Koin Setoran */}
        <ellipse cx="44" cy="85" rx="14" ry="4" strokeWidth="1.5" fill="white" fillOpacity="0.2" />
        <ellipse cx="44" cy="81" rx="14" ry="4" strokeWidth="1.5" fill="white" fillOpacity="0.2" />
        <ellipse cx="44" cy="77" rx="14" ry="4" strokeWidth="1.5" fill="white" fillOpacity="0.2" />
      </svg>
    ),
  },
  {
    id: 'pengaduan',
    title: 'PENGADUAN',
    subtitle: 'Aspirasi & laporan warga langsung ke pemerintah desa',
    href: '/pengaduan/',
    icon: <MessageSquareQuote className="h-6 w-6 text-emerald-100" />,
    vector: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full">
        {/* Balon Dialog Aspirasi Utama */}
        <path d="M16 22 C16 16.5 20.5 12 26 12 H66 C71.5 12 76 16.5 76 22 V42 C76 47.5 71.5 52 66 52 H36 L22 62 V52 H26 C20.5 52 16 47.5 16 42 Z" strokeWidth="2.5" strokeLinejoin="round" fill="white" fillOpacity="0.08" />
        {/* Titik Suara Dialog */}
        <circle cx="34" cy="32" r="3" fill="white" fillOpacity="0.7" />
        <circle cx="46" cy="32" r="3" fill="white" fillOpacity="0.9" />
        <circle cx="58" cy="32" r="3" fill="white" fillOpacity="0.7" />
        {/* Megafon Suara Pengaduan Warga */}
        <g transform="translate(32, 44)">
          <path d="M8 20 L24 28 V8 L8 16 H2 C0.9 16 0 16.9 0 18 V22 C0 23.1 0.9 24 2 24 H8 Z" strokeWidth="2" strokeLinejoin="round" fill="white" fillOpacity="0.2" />
          <path d="M6 24 V34 C6 35.1 6.9 36 8 36 H12 C13.1 36 14 35.1 14 34 V25" strokeWidth="2" strokeLinejoin="round" />
          {/* Gelombang Suara / Broadcast */}
          <path d="M29 13 C32 16 32 20 29 23" strokeWidth="2" strokeLinecap="round" />
          <path d="M35 8 C40 14 40 22 35 28" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3" />
          <path d="M41 4 C48 12 48 24 41 32" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    ),
  },
  {
    id: 'statistik',
    title: 'STATISTIK DESA',
    subtitle: 'Transparansi data kependudukan & demografi realtime',
    href: '/statistik/',
    icon: <BarChart3 className="h-6 w-6 text-emerald-100" />,
    vector: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full">
        {/* Sumbu Grafik */}
        <path d="M16 16 V82 H86" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="16" y1="36" x2="86" y2="36" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        <line x1="16" y1="56" x2="86" y2="56" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        {/* Batang Statistik Bertumbuh */}
        <rect x="24" y="56" width="10" height="26" rx="2" strokeWidth="2" fill="white" fillOpacity="0.15" />
        <rect x="40" y="40" width="10" height="42" rx="2" strokeWidth="2" fill="white" fillOpacity="0.22" />
        <rect x="56" y="26" width="10" height="56" rx="2" strokeWidth="2" fill="white" fillOpacity="0.3" />
        <rect x="72" y="18" width="10" height="64" rx="2" strokeWidth="2" fill="white" fillOpacity="0.38" />
        {/* Garis Tren Pertumbuhan */}
        <path d="M22 62 L36 50 L52 42 L68 22 L82 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M72 12 H82 V22" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Diagram Lingkaran Mini */}
        <g transform="translate(60, 46)">
          <circle cx="15" cy="15" r="13" strokeWidth="2" fill="white" fillOpacity="0.1" />
          <path d="M15 15 L15 2 A13 13 0 0 1 28 15 Z" fill="white" fillOpacity="0.4" strokeWidth="1.5" />
        </g>
      </svg>
    ),
  },
];

const serviceItemsRow2: ServiceCardItem[] = [
  {
    id: 'umkm',
    title: 'UMKM DESA',
    subtitle: 'Katalog etalase produk kreatif & usaha warga desa',
    href: '/umkm-dan-industri-kreatif/',
    icon: <Store className="h-6 w-6 text-emerald-100" />,
    vector: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full">
        {/* Kanopi Toko UMKM */}
        <path d="M16 34 L22 18 H78 L84 34 Z" strokeWidth="2.5" strokeLinejoin="round" fill="white" fillOpacity="0.12" />
        <path d="M16 34 C16 38 20 41 24 41 C28 41 32 38 32 34 C32 38 36 41 40 41 C44 41 48 38 48 34 C48 38 52 41 56 41 C60 41 64 38 64 34 C64 38 68 41 72 41 C76 41 80 38 80 34 C80 38 84 41 84 34" strokeWidth="2" strokeLinejoin="round" />
        <line x1="32" y1="18" x2="32" y2="34" strokeWidth="1.5" />
        <line x1="48" y1="18" x2="48" y2="34" strokeWidth="1.5" />
        <line x1="64" y1="18" x2="64" y2="34" strokeWidth="1.5" />
        {/* Dinding Toko */}
        <rect x="22" y="41" width="56" height="42" strokeWidth="2.5" fill="white" fillOpacity="0.06" />
        <rect x="28" y="48" width="22" height="22" rx="2" strokeWidth="2" fill="white" fillOpacity="0.12" />
        {/* Tas Belanja Produk Kreatif */}
        <g transform="translate(54, 48)">
          <rect x="0" y="8" width="26" height="28" rx="3" strokeWidth="2" fill="white" fillOpacity="0.22" />
          <path d="M6 8 V5 C6 2.5 8.5 0 13 0 C17.5 0 20 2.5 20 5 V8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="13" cy="20" r="3" fill="white" fillOpacity="0.7" />
        </g>
        {/* Kilau Bintang Kreativitas */}
        <path d="M86 16 L88 22 L94 24 L88 26 L86 32 L84 26 L78 24 L84 22 Z" fill="white" fillOpacity="0.8" />
        <path d="M12 60 L13 63 L16 64 L13 65 L12 68 L11 65 L8 64 L11 63 Z" fill="white" fillOpacity="0.6" />
      </svg>
    ),
  },
  {
    id: 'anti-korupsi',
    title: 'ANTI KORUPSI',
    subtitle: 'Keterbukaan informasi & integritas tata kelola anggaran',
    href: '/desa-anti-korupsi/',
    icon: <ShieldCheck className="h-6 w-6 text-emerald-100" />,
    vector: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full">
        {/* Perisai Integritas Desa */}
        <path d="M50 12 L84 24 V52 C84 72 68 86 50 92 C32 86 16 72 16 52 V24 Z" strokeWidth="2.5" strokeLinejoin="round" fill="white" fillOpacity="0.08" />
        <path d="M50 20 L76 30 V52 C76 67 64 78 50 84 C36 78 24 67 24 52 V30 Z" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
        {/* Timbangan Keadilan & Kejujuran (Scales of Justice) */}
        <line x1="50" y1="32" x2="50" y2="70" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="50" cy="32" r="3.5" fill="white" />
        <line x1="42" y1="70" x2="58" y2="70" strokeWidth="3" strokeLinecap="round" />
        <line x1="30" y1="40" x2="70" y2="40" strokeWidth="2.5" strokeLinecap="round" />
        {/* Piring Timbangan Kiri */}
        <line x1="30" y1="40" x2="24" y2="54" strokeWidth="1.5" />
        <line x1="30" y1="40" x2="36" y2="54" strokeWidth="1.5" />
        <path d="M22 54 C22 60 38 60 38 54 Z" strokeWidth="2" fill="white" fillOpacity="0.22" />
        {/* Piring Timbangan Kanan */}
        <line x1="70" y1="40" x2="64" y2="54" strokeWidth="1.5" />
        <line x1="70" y1="40" x2="76" y2="54" strokeWidth="1.5" />
        <path d="M62 54 C62 60 78 60 78 54 Z" strokeWidth="2" fill="white" fillOpacity="0.22" />
        {/* Bintang Kejujuran */}
        <path d="M50 16 L51.5 20 L55 20.5 L52.5 22.5 L53.5 26 L50 24 L46.5 26 L47.5 22.5 L45 20.5 L48.5 20 Z" fill="white" fillOpacity="0.8" />
      </svg>
    ),
  },
  {
    id: 'tata-kelola',
    title: 'TATA KELOLA',
    subtitle: 'Struktur aparatur, BPD, dan kelembagaan desa resmi',
    href: '/tata-kelola-desa/',
    icon: <Landmark className="h-6 w-6 text-emerald-100" />,
    vector: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full">
        {/* Atap Balai Desa / Kantor Pemerintahan */}
        <path d="M16 32 L50 14 L84 32 Z" strokeWidth="2.5" strokeLinejoin="round" fill="white" fillOpacity="0.12" />
        <circle cx="50" cy="24" r="3" fill="white" fillOpacity="0.8" />
        <rect x="14" y="32" width="72" height="6" rx="1" strokeWidth="2" fill="white" fillOpacity="0.22" />
        {/* 4 Pilar Kokoh Lembaga Desa */}
        <rect x="22" y="38" width="8" height="34" rx="1" strokeWidth="2" fill="white" fillOpacity="0.1" />
        <rect x="37" y="38" width="8" height="34" rx="1" strokeWidth="2" fill="white" fillOpacity="0.1" />
        <rect x="55" y="38" width="8" height="34" rx="1" strokeWidth="2" fill="white" fillOpacity="0.1" />
        <rect x="70" y="38" width="8" height="34" rx="1" strokeWidth="2" fill="white" fillOpacity="0.1" />
        {/* Pondasi Lantai Balai */}
        <rect x="12" y="72" width="76" height="5" strokeWidth="2" fill="white" fillOpacity="0.2" />
        <rect x="8" y="77" width="84" height="6" strokeWidth="2" fill="white" fillOpacity="0.15" />
        {/* Bagan Hierarki Struktur Organisasi */}
        <g transform="translate(32, 52)">
          <rect x="12" y="0" width="12" height="7" rx="1.5" strokeWidth="1.5" fill="white" fillOpacity="0.45" />
          <line x1="18" y1="7" x2="18" y2="12" strokeWidth="1.5" />
          <line x1="6" y1="12" x2="30" y2="12" strokeWidth="1.5" />
          <rect x="0" y="12" width="12" height="7" rx="1.5" strokeWidth="1.5" fill="white" fillOpacity="0.35" />
          <rect x="24" y="12" width="12" height="7" rx="1.5" strokeWidth="1.5" fill="white" fillOpacity="0.35" />
        </g>
      </svg>
    ),
  },
  {
    id: 'potensi',
    title: 'POTENSI DESA',
    subtitle: 'Eksplorasi potensi pertanian, alam, dan keunggulan desa',
    href: '/potensi-desa/',
    icon: <Compass className="h-6 w-6 text-emerald-100" />,
    vector: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full">
        {/* Mentari & Panorama Alam Desa */}
        <circle cx="50" cy="36" r="14" strokeWidth="2" fill="white" fillOpacity="0.16" />
        <line x1="50" y1="14" x2="50" y2="19" strokeWidth="2" strokeLinecap="round" />
        <line x1="68" y1="21" x2="64" y2="25" strokeWidth="2" strokeLinecap="round" />
        <line x1="74" y1="36" x2="69" y2="36" strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="21" x2="36" y2="25" strokeWidth="2" strokeLinecap="round" />
        <line x1="26" y1="36" x2="31" y2="36" strokeWidth="2" strokeLinecap="round" />
        {/* Bukit & Lembah Sawah */}
        <path d="M12 74 L36 44 L60 74 Z" strokeWidth="2" strokeLinejoin="round" fill="white" fillOpacity="0.08" />
        <path d="M44 74 L66 48 L88 74 Z" strokeWidth="2" strokeLinejoin="round" fill="white" fillOpacity="0.08" />
        {/* Bulir Padi Subur */}
        <path d="M26 88 C32 68 45 42 70 30" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="68" cy="24" rx="4" ry="7" transform="rotate(35 68 24)" strokeWidth="1.5" fill="white" fillOpacity="0.3" />
        <ellipse cx="58" cy="32" rx="4" ry="7" transform="rotate(25 58 32)" strokeWidth="1.5" fill="white" fillOpacity="0.3" />
        <ellipse cx="50" cy="42" rx="4" ry="7" transform="rotate(40 50 42)" strokeWidth="1.5" fill="white" fillOpacity="0.3" />
        <ellipse cx="62" cy="40" rx="4" ry="7" transform="rotate(-15 62 40)" strokeWidth="1.5" fill="white" fillOpacity="0.3" />
        <ellipse cx="42" cy="54" rx="4" ry="7" transform="rotate(50 42 54)" strokeWidth="1.5" fill="white" fillOpacity="0.3" />
        <ellipse cx="53" cy="52" rx="4" ry="7" transform="rotate(-10 53 52)" strokeWidth="1.5" fill="white" fillOpacity="0.3" />
        <path d="M10 82 C30 76 50 86 90 78" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: 'nomor-penting',
    title: 'NOMOR PENTING',
    subtitle: 'Panggilan darurat ambulans, medis, dan kontak layanan',
    href: '/nomor-penting/',
    icon: <PhoneCall className="h-6 w-6 text-emerald-100" />,
    vector: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full">
        {/* Palang Medis Darurat */}
        <path d="M42 16 H58 V32 H74 V48 H58 V64 H42 V48 H26 V32 H42 Z" strokeWidth="2" strokeLinejoin="round" fill="white" fillOpacity="0.12" />
        {/* Lingkaran Frekuensi Sinyal Radar */}
        <circle cx="50" cy="40" r="32" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
        <circle cx="50" cy="40" r="42" strokeWidth="1" strokeDasharray="2 4" opacity="0.25" />
        {/* Denyut Jantung / Garis EKG */}
        <path d="M14 68 H34 L40 56 L46 78 L52 62 L58 72 L64 68 H86" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Gagang Telepon Siaga */}
        <g transform="translate(30, 22)">
          <path d="M28 20 C28 26 22 32 16 32 C10 32 4 26 4 20 L7 16 C8 15 9.5 15 10.5 16 L13 18.5 C14 19.5 14 21 13 22 L11.5 23.5 C12.5 25.5 14.5 27.5 16.5 28.5 L18 27 C19 26 20.5 26 21.5 27 L24 29.5 C25 30.5 25 32 24 33 Z" strokeWidth="2" strokeLinejoin="round" fill="white" fillOpacity="0.28" />
          <path d="M26 12 C30 15 32 19 32 24" strokeWidth="2" strokeLinecap="round" />
          <path d="M30 6 C36 11 40 18 40 25" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3" />
        </g>
      </svg>
    ),
  },
];

export function ServicesSection() {
  const allServiceItems = [...serviceItemsRow1, ...serviceItemsRow2];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      {/* KONTINER UTAMA (Banner Hijau Hutan Elegan Sesuai Tema Desa) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#042f24] via-[#064e3b] to-[#022c22] p-6 sm:p-10 lg:p-12 shadow-2xl border border-emerald-700/40">
        {/* Background Network Mesh / Glow Lines Hijau */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <svg className="absolute -right-20 -top-20 w-[600px] h-[600px] opacity-15" viewBox="0 0 600 600" fill="none">
            <circle cx="300" cy="300" r="250" stroke="#34d399" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="300" cy="300" r="180" stroke="#34d399" strokeWidth="1.5" />
            <circle cx="300" cy="300" r="100" stroke="#34d399" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="100" y1="100" x2="500" y2="500" stroke="#34d399" strokeWidth="0.75" />
            <line x1="500" y1="100" x2="100" y2="500" stroke="#34d399" strokeWidth="0.75" />
          </svg>
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-600/15 blur-3xl" />
        </div>

        {/* HEADER LAYANAN */}
        <div className="relative z-10 mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[11px] font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            Layanan Utama Desa
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-display leading-tight">
            Layanan digital desa yang mudah dipahami dan diakses.
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-emerald-100/80 max-w-2xl font-medium leading-relaxed">
            Seluruh fitur administrasi dan informasi desa dapat dijangkau secara cepat melalui portal digital terpadu untuk kemudahan masyarakat.
          </p>
        </div>

        {/* 10 KARTU KOTAK PERSEGI DENGAN ELEMEN VEKTOR TEMATIK (5 Kartu Per Baris) */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
          {allServiceItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.35, delay: idx * 0.04 }}
            >
              <Link
                href={item.href}
                className="group relative flex flex-col justify-between rounded-2xl bg-gradient-to-b from-[#059669] via-[#047857] to-[#065f46] p-4 sm:p-5 text-white shadow-lg border border-emerald-400/20 transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-300/60 hover:shadow-2xl hover:shadow-emerald-950/70 overflow-hidden aspect-auto min-h-[220px] sm:aspect-square"
              >
                {/* Elemen Vektor Tematik Latar Belakang (Mencerminkan Judul Kartu) */}
                <div className="absolute right-0 top-8 sm:top-9 w-24 h-24 sm:w-28 sm:h-28 pointer-events-none select-none text-emerald-100 opacity-20 group-hover:opacity-40 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 ease-out">
                  {item.vector}
                </div>

                {/* Subtle Dot Particles Overlay */}
                <div className="absolute top-5 left-3 w-16 h-16 pointer-events-none select-none opacity-20 group-hover:opacity-35 transition-opacity">
                  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
                    <circle cx="10" cy="10" r="1.5" fill="white" />
                    <circle cx="28" cy="18" r="2" fill="white" />
                    <circle cx="16" cy="34" r="1.5" fill="white" />
                    <circle cx="36" cy="30" r="2" fill="white" />
                    <circle cx="24" cy="48" r="2" fill="white" />
                    <circle cx="44" cy="44" r="1.5" fill="white" />
                    <circle cx="20" cy="62" r="1.5" fill="white" />
                    <circle cx="40" cy="58" r="2" fill="white" />
                  </svg>
                </div>

                {/* Baris Atas: Ikon Glowing Badge & Tombol Panah */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/15 border border-white/20 backdrop-blur-md shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/25">
                    {item.icon}
                  </div>

                  {/* Tombol Panah Lingkaran Minimalis */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/50 text-white transition-all duration-300 group-hover:border-white group-hover:bg-white group-hover:text-[#047857] group-hover:scale-110 shadow-sm">
                    <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                </div>

                {/* Bagian Bawah: Judul & Deskripsi */}
                <div className="relative z-10 mt-3 sm:mt-4">
                  <h3 className="text-xs sm:text-[13px] font-black uppercase tracking-wider text-white leading-snug line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[11px] sm:text-xs leading-snug text-emerald-100/90 font-normal line-clamp-2">
                    {item.subtitle}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

