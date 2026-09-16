'use client';

import React from 'react';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { SambutanSection } from '@/components/landing/SambutanSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { PbbSearchSection } from '@/components/landing/PbbSearchSection';
import { StatisticsSection } from '@/components/landing/StatisticsSection';
import { NewsSection } from '@/components/landing/NewsSection';
import { AnnouncementSection } from '@/components/landing/AnnouncementSection';
import { UmkmSection } from '@/components/landing/UmkmSection';
import { CitizenHubSection } from '@/components/landing/CitizenHubSection';
import { Footer } from '@/components/landing/Footer';
import { BackgroundPattern } from '@/components/landing/BackgroundPattern';

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900 overflow-x-hidden">
      <BackgroundPattern />
      <Header />
      <main className="relative">
        {/* 1. Hero Sambutan Utama */}
        <HeroSection />

        {/* 2. Profil Kepemimpinan & Identitas Desa */}
        <SambutanSection />

        {/* 3. Anjungan Layanan Mandiri Warga */}
        <ServicesSection />

        {/* 4. Layanan Unggulan: Cek Pajak PBB-P2 Online */}
        <PbbSearchSection />

        {/* 5. Transparansi & Data Kependudukan */}
        <StatisticsSection />

        {/* 6. Pusat Kabar & Video Sinematik Profil Desa */}
        <NewsSection />

        {/* 7. Pengumuman Resmi & Agenda Desa */}
        <AnnouncementSection />

        {/* 8. Etalase Produk UMKM & Ekonomi Kreatif Warga */}
        <UmkmSection />

        {/* 9. Pusat Partisipasi, Aspirasi & Layanan Cepat Warga */}
        <CitizenHubSection />
      </main>
      <Footer />
    </div>
  );
}
