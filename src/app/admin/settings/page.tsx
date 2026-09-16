
'use client';

import { PageHeader } from '@/components/page-header';
import { SettingsForm } from './_components/settings-form';
import { LogoSettingsForm } from './_components/logo-settings-form';
import { HeroSettingsForm } from './_components/hero-settings-form';
import { DriveSettingsForm } from './_components/drive-settings-form';
import { VideoProfileSettingsForm } from './_components/video-profile-settings-form';
import { FooterLogosSettingsForm } from './_components/footer-logos-settings-form';
import { AccompanyingImageSettingsForm, KadesPhotoSettingsForm, PengaduanImageSettingsForm } from './_components/cloudinary-images-form';
import { DesaAntiKorupsiDriveForm } from './_components/desa-anti-korupsi-drive-form';
import { ImportantNumbersSettingsForm } from './_components/important-numbers-settings-form';
import { PbbSettingsForm } from './_components/pbb-settings-form';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-4 sm:space-y-8 pb-10 sm:pb-20 w-full max-w-full overflow-x-hidden">
      <PageHeader
        title="Pengaturan Sistem"
        description="Kelola identitas visual desa, templat dokumen, nomor penting, dan konfigurasi penyimpanan sistem."
      />

      <div className="grid gap-3.5 sm:gap-6">
        <HeroSettingsForm />
        <VideoProfileSettingsForm />
        <ImportantNumbersSettingsForm />
        <PbbSettingsForm />

        {/* Baris 1: Upload Gambar Pendamping + Upload Foto Kades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6 items-start">
          <AccompanyingImageSettingsForm />
          <KadesPhotoSettingsForm />
        </div>

        {/* Baris 2: Upload Pengaduan Masyarakat + Logo Desa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6 items-start">
          <PengaduanImageSettingsForm />
          <LogoSettingsForm />
        </div>

        {/* Baris 3: Templat Kop Surat + Konfigurasi Google Drive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6 items-start">
          <SettingsForm />
          <DriveSettingsForm />
        </div>

        <DesaAntiKorupsiDriveForm />
        <FooterLogosSettingsForm />
      </div>
    </div>
  );
}
