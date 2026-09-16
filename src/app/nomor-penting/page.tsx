'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { BackgroundPattern } from '@/components/landing/BackgroundPattern';
import { Button } from '@/components/ui/button';
import {
  Phone,
  Shield,
  Heart,
  Building2,
  Users,
  Siren,
  MapPin,
  Landmark,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ImportantNumbersData, ImportantNumberContact } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

type ProcessedContactItem = {
  id?: string;
  label: string;
  number: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  category: 'pemerintah' | 'keamanan' | 'kesehatan' | 'wilayah';
};

const defaultRawContacts: ImportantNumberContact[] = [
  { id: '1', label: 'Kepala Desa', number: '082324502378', category: 'pemerintah' },
  { id: '2', label: 'Babinsa', number: '081282148178', category: 'keamanan' },
  { id: '3', label: 'Bhabinkamtibmas', number: '085229658988', category: 'keamanan' },
  { id: '4', label: 'Bidan Desa', number: '081226370112', category: 'kesehatan' },
  { id: '5', label: 'Camat Gandrungmangu', number: '08122727683', category: 'pemerintah' },
  { id: '6', label: 'Koramil Gandrungmangu', number: '085229658988', category: 'keamanan' },
  { id: '7', label: 'Polsek Gandrungmangu', number: '083867770110', category: 'keamanan' },
  { id: '8', label: 'Puskesmas Karangpucung', number: '082234577980', category: 'kesehatan' },
  { id: '9', label: 'Kadus 1', number: '082138337494', category: 'wilayah' },
  { id: '10', label: 'Kadus 2', number: '085282256678', category: 'wilayah' },
  { id: '11', label: 'Kadus 3', number: '083113339132', category: 'wilayah' },
];

const formatPhoneDisplay = (number: string) => {
  const clean = number.replace(/\s+/g, '');
  if (clean.length === 12) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8)}`;
  }
  if (clean.length === 11) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
  }
  if (clean.length === 13) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8)}`;
  }
  return number;
};

const categoryLabels: Record<string, { label: string; icon: React.ElementType; color: string; border: string }> = {
  pemerintah: { label: 'Pemerintahan', icon: Landmark, color: 'text-emerald-700 bg-emerald-50', border: 'border-emerald-200' },
  keamanan: { label: 'Keamanan & Ketertiban', icon: Shield, color: 'text-teal-700 bg-teal-50', border: 'border-teal-200' },
  kesehatan: { label: 'Kesehatan & Medis', icon: Heart, color: 'text-rose-700 bg-rose-50', border: 'border-rose-200' },
  wilayah: { label: 'Kepala Dusun (Kadus)', icon: Users, color: 'text-violet-700 bg-violet-50', border: 'border-violet-200' },
};

const categoryStyles: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  pemerintah: { icon: Landmark, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  keamanan: { icon: Shield, color: 'text-teal-600', bgColor: 'bg-teal-50' },
  kesehatan: { icon: Heart, color: 'text-rose-600', bgColor: 'bg-rose-50' },
  wilayah: { icon: Users, color: 'text-violet-600', bgColor: 'bg-violet-50' },
};

export default function NomorPentingPage() {
  const firestore = useFirestore();

  const numbersRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'importantNumbers');
  }, [firestore]);

  const { data: numbersData, isLoading } = useDoc<ImportantNumbersData>(numbersRef);

  const contactsList: ImportantNumberContact[] = useMemo(() => {
    if (numbersData?.contacts && numbersData.contacts.length > 0) {
      return numbersData.contacts;
    }
    return defaultRawContacts;
  }, [numbersData]);

  const servicePhoneNumber = numbersData?.servicePhoneNumber || '085111318412';

  const processedContacts: ProcessedContactItem[] = useMemo(() => {
    return contactsList.map(item => {
      const style = categoryStyles[item.category] || categoryStyles.pemerintah;
      let icon = style.icon;
      if (item.label.toLowerCase().includes('polsek')) icon = Siren;
      if (item.label.toLowerCase().includes('camat')) icon = Building2;

      return {
        id: item.id,
        label: item.label,
        number: item.number,
        icon,
        color: style.color,
        bgColor: style.bgColor,
        category: item.category || 'pemerintah',
      };
    });
  }, [contactsList]);

  const groupedContacts = useMemo(() => {
    return processedContacts.reduce((acc, contact) => {
      if (!acc[contact.category]) acc[contact.category] = [];
      acc[contact.category].push(contact);
      return acc;
    }, {} as Record<string, ProcessedContactItem[]>);
  }, [processedContacts]);

  const categoryOrder = ['pemerintah', 'keamanan', 'kesehatan', 'wilayah'];

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900 overflow-x-hidden">
      <BackgroundPattern />
      <Header />

      <main className="relative flex-1 pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          {/* KOP SURAT / OFFICIAL HEADER CARD */}
          <div className="mb-6 sm:mb-10">
            <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden bg-white">
              <div className="h-1.5 sm:h-2 w-full bg-gradient-to-r from-primary via-emerald-600 to-secondary" />
              <CardContent className="p-4 sm:p-8 md:p-10">
                <div className="text-center space-y-1.5 sm:space-y-2.5">
                  <div className="flex items-center justify-center mb-2 sm:mb-3">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
                      <Landmark className="h-5 w-5 sm:h-7 sm:w-7" />
                    </div>
                  </div>
                  <h2 className="text-base sm:text-xl md:text-2xl font-extrabold uppercase tracking-tight text-slate-900 font-display">
                    Pemerintah Desa Karanggintung
                  </h2>
                  <p className="text-[11px] sm:text-sm font-bold uppercase tracking-wider text-slate-500">
                    Kecamatan Gandrungmangu &bull; Kabupaten Cilacap
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[10px] sm:text-xs font-medium pt-1">
                    <MapPin className="h-3 w-3 text-primary/60 shrink-0" />
                    <span>Jl. Desa Karanggintung No. 1 Kode Pos 53255</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="my-4 sm:my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </div>

                {/* Title */}
                <div className="text-center space-y-2 sm:space-y-3">
                  <h1 className="text-2xl min-[380px]:text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-slate-900 font-display italic">
                    Daftar Nomor <span className="text-primary not-italic">Penting</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
                    Kontak darurat dan layanan cepat pemerintah desa, keamanan, serta fasilitas kesehatan di Karanggintung.
                  </p>
                  <div className="pt-1">
                    <Badge className="bg-red-50 text-red-600 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider px-3 sm:px-4 py-1 border border-red-200/60 shadow-xs">
                      <Siren className="h-3 w-3 mr-1.5 animate-pulse" />
                      Layanan Siaga Cepat
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CONTACT LIST BY CATEGORY */}
          {isLoading ? (
            <div className="space-y-6 sm:space-y-8">
              <Skeleton className="h-9 w-48 rounded-xl" />
              <div className="grid gap-2.5 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 sm:h-24 rounded-2xl" />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-10">
              {categoryOrder.map((catKey) => {
                const catInfo = categoryLabels[catKey];
                const catContacts = groupedContacts[catKey];
                if (!catContacts || catContacts.length === 0) return null;

                return (
                  <section key={catKey} className="space-y-3 sm:space-y-4">
                    {/* Category Header */}
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className={cn('p-2 sm:p-2.5 rounded-xl shadow-xs', catInfo.color)}>
                        <catInfo.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-extrabold uppercase tracking-tight text-slate-800">
                        {catInfo.label}
                      </h3>
                      <div className="h-px flex-1 bg-slate-200/80" />
                    </div>

                    {/* Contact Cards */}
                    <div className="grid gap-2.5 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {catContacts.map((contact, i) => (
                        <Card
                          key={contact.id || i}
                          className="rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-white group overflow-hidden"
                        >
                          <CardContent className="p-0">
                            <div className="flex items-stretch">
                              {/* Icon side */}
                              <div
                                className={cn(
                                  'flex items-center justify-center w-14 min-[380px]:w-16 sm:w-20 shrink-0 transition-colors',
                                  contact.bgColor,
                                  contact.color
                                )}
                              >
                                <contact.icon className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-300 group-hover:scale-110" />
                              </div>
                              {/* Info side */}
                              <div className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-1.5 min-w-0">
                                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                  {contact.label}
                                </p>
                                <p className="text-sm sm:text-base md:text-lg font-extrabold text-slate-900 tracking-tight font-mono truncate">
                                  {formatPhoneDisplay(contact.number)}
                                </p>
                                <a
                                  href={`tel:${contact.number}`}
                                  className={cn(
                                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all duration-200',
                                    contact.bgColor,
                                    contact.color,
                                    'hover:shadow-xs hover:scale-105 active:scale-95'
                                  )}
                                >
                                  <Phone className="h-3 w-3" />
                                  Hubungi
                                </a>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {/* LAYANAN DESA PHONE NUMBER - BOTTOM CTA */}
          <div className="mt-8 sm:mt-12 mb-4 sm:mb-6">
            <Card className="rounded-2xl sm:rounded-3xl border-none shadow-xl overflow-hidden bg-primary text-white relative">
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white -translate-x-1/3 translate-y-1/3" />
              </div>

              <CardContent className="relative z-10 p-5 sm:p-10 md:p-12 text-center space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Badge className="bg-secondary text-primary-foreground font-extrabold uppercase text-[9px] sm:text-[10px] tracking-wider px-3 sm:px-4 py-1 border-none shadow-sm">
                    <Phone className="h-3 w-3 mr-1.5" />
                    Pusat Informasi & Pelayanan
                  </Badge>
                  <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight font-display italic">
                    Nomor Pelayanan Desa Karanggintung
                  </h3>
                </div>

                <a
                  href={`tel:${servicePhoneNumber.replace(/\s+/g, '')}`}
                  className="group inline-block w-full max-w-md mx-auto"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/10 rounded-xl sm:rounded-2xl blur-lg group-hover:bg-white/20 transition-all duration-300" />
                    <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl px-4 sm:px-8 py-3.5 sm:py-5 group-hover:bg-white/15 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg">
                      <p className="text-xl min-[380px]:text-2xl sm:text-4xl md:text-5xl font-black tracking-wider font-mono text-white">
                        {formatPhoneDisplay(servicePhoneNumber)}
                      </p>
                    </div>
                  </div>
                </a>

                <p className="text-[11px] sm:text-xs text-white/70 font-medium max-w-sm mx-auto leading-relaxed">
                  Hubungi nomor di atas untuk informasi bantuan dan konsultasi administrasi Desa Karanggintung.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
