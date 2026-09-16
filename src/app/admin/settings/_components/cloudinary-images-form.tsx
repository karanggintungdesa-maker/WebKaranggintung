'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Upload, User, Image as ImageIcon } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { VillageProfileInfo } from '@/lib/types';
import { uploadToCloudinary } from '@/lib/upload-cloudinary';

export function AccompanyingImageSettingsForm() {
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const firestore = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'default');
  }, [firestore]);

  const { data: profileData, isLoading: isDataLoading } = useDoc<VillageProfileInfo>(profileRef);

  useEffect(() => {
    if (profileData?.imageUrl) {
      setImageUrl(profileData.imageUrl);
      setImagePreview(profileData.imageUrl);
    }
  }, [profileData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast({
        title: 'Ukuran File Terlalu Besar',
        description: 'Ukuran gambar pendamping tidak boleh melebihi 3MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'profil-desa');
      setImageUrl(url);
      setImagePreview(url);

      toast({
        title: 'Gambar Terunggah ke Cloudinary',
        description: 'Pratinjau telah diperbarui. Klik "Simpan" untuk menerapkan.',
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Gagal Mengunggah',
        description: error.message || 'Terjadi kesalahan saat mengunggah gambar ke Cloudinary.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !profileRef) return;
    setIsSaving(true);

    try {
      await setDoc(profileRef, { imageUrl }, { merge: true });
      toast({
        title: 'Gambar Pendamping Berhasil Disimpan',
        description: 'Gambar pendamping desa telah berhasil diperbarui.',
      });
    } catch (error) {
      console.error('Error saving accompanying image:', error);
      toast({
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan pengaturan ke Firestore.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isDataLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs">
      <CardHeader className="p-3.5 sm:p-6 pb-2.5 sm:pb-4 border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xs sm:text-base font-bold">
          <ImageIcon className="h-4 w-4 text-emerald-600 shrink-0" />
          Upload Gambar Pendamping
        </CardTitle>
        <CardDescription className="text-[11px] sm:text-xs">
          Unggah gambar untuk bagian "Tentang Desa" di halaman utama. Disimpan di Cloudinary.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3.5 sm:p-6 pt-3.5 sm:pt-4">
        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs font-semibold">Pratinjau</Label>
            <div className="relative aspect-video max-h-48 w-full border-2 border-dashed rounded-lg sm:rounded-xl overflow-hidden flex items-center justify-center bg-muted/30">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Pratinjau Gambar Pendamping"
                  fill
                  className="object-cover"
                />
              ) : (
                <p className="text-xs text-muted-foreground text-center px-2">Belum ada gambar pendamping</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="accompanying-upload" className="text-xs font-semibold">Pilih Gambar Baru</Label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Input
                id="accompanying-upload"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                disabled={isSaving || isUploading}
                className="w-full cursor-pointer text-xs h-8 sm:h-9"
              />
              {isUploading && <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />}
            </div>
            <p className="text-[10px] text-muted-foreground">Maks: 3MB. Format: PNG, JPG, WEBP.</p>
          </div>

          <Button type="submit" disabled={isSaving || isUploading || !imageUrl} className="w-full sm:w-auto h-8 sm:h-9 text-xs">
            {isSaving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
            Simpan Gambar Pendamping
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function PengaduanImageSettingsForm() {
  const [pengaduanImageUrl, setPengaduanImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const firestore = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'default');
  }, [firestore]);

  const { data: profileData, isLoading: isDataLoading } = useDoc<VillageProfileInfo>(profileRef);

  useEffect(() => {
    if (profileData?.pengaduanImageUrl) {
      setPengaduanImageUrl(profileData.pengaduanImageUrl);
      setImagePreview(profileData.pengaduanImageUrl);
    }
  }, [profileData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast({
        title: 'Ukuran File Terlalu Besar',
        description: 'Ukuran gambar pengaduan tidak boleh melebihi 3MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'pengaduan-desa');
      setPengaduanImageUrl(url);
      setImagePreview(url);

      toast({
        title: 'Gambar Terunggah ke Cloudinary',
        description: 'Pratinjau telah diperbarui. Klik "Simpan" untuk menerapkan.',
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Gagal Mengunggah',
        description: error.message || 'Terjadi kesalahan saat mengunggah gambar ke Cloudinary.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !profileRef) return;
    setIsSaving(true);

    try {
      await setDoc(profileRef, { pengaduanImageUrl }, { merge: true });
      toast({
        title: 'Gambar Pengaduan Berhasil Disimpan',
        description: 'Gambar Pengaduan Masyarakat telah berhasil diperbarui.',
      });
    } catch (error) {
      console.error('Error saving pengaduan image:', error);
      toast({
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan pengaturan ke Firestore.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isDataLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-40 w-32" />
            <Skeleton className="h-9 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs">
      <CardHeader className="p-3.5 sm:p-6 pb-2.5 sm:pb-4 border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xs sm:text-base font-bold">
          <Upload className="h-4 w-4 text-rose-500 shrink-0" />
          Upload Gambar Pengaduan
        </CardTitle>
        <CardDescription className="text-[11px] sm:text-xs">
          Unggah gambar untuk kartu "Layanan Pengaduan" di Landing Page. Rasio 3:4.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3.5 sm:p-6 pt-3.5 sm:pt-4">
        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs font-semibold">Pratinjau (rasio 3:4)</Label>
            <div className="relative aspect-[3/4] w-28 sm:w-36 border-2 border-dashed rounded-lg sm:rounded-xl overflow-hidden flex items-center justify-center bg-muted/30">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Pratinjau Gambar Pengaduan Masyarakat"
                  fill
                  className="object-cover"
                />
              ) : (
                <p className="text-[10px] text-muted-foreground text-center px-2">Belum ada gambar</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pengaduan-upload" className="text-xs font-semibold">Pilih Gambar Baru</Label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Input
                id="pengaduan-upload"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                disabled={isSaving || isUploading}
                className="w-full cursor-pointer text-xs h-8 sm:h-9"
              />
              {isUploading && <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />}
            </div>
            <p className="text-[10px] text-muted-foreground">Maks: 3MB. Format: PNG, JPG, WEBP.</p>
          </div>

          <Button type="submit" disabled={isSaving || isUploading || !pengaduanImageUrl} className="w-full sm:w-auto h-8 sm:h-9 text-xs">
            {isSaving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
            Simpan Gambar Pengaduan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function KadesPhotoSettingsForm() {
  const [kadesPhotoUrl, setKadesPhotoUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const firestore = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'default');
  }, [firestore]);

  const { data: profileData, isLoading: isDataLoading } = useDoc<VillageProfileInfo>(profileRef);

  useEffect(() => {
    if (profileData?.kadesPhotoUrl) {
      setKadesPhotoUrl(profileData.kadesPhotoUrl);
      setImagePreview(profileData.kadesPhotoUrl);
    }
  }, [profileData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast({
        title: 'Ukuran File Terlalu Besar',
        description: 'Ukuran foto Kepala Desa tidak boleh melebihi 3MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'pemerintahan-desa');
      setKadesPhotoUrl(url);
      setImagePreview(url);

      toast({
        title: 'Foto Terunggah ke Cloudinary',
        description: 'Pratinjau telah diperbarui. Klik "Simpan" untuk menerapkan.',
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Gagal Mengunggah',
        description: error.message || 'Terjadi kesalahan saat mengunggah foto ke Cloudinary.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !profileRef) return;
    setIsSaving(true);

    try {
      await setDoc(profileRef, { kadesPhotoUrl }, { merge: true });
      toast({
        title: 'Foto Kades Berhasil Disimpan',
        description: 'Foto Kepala Desa telah berhasil diperbarui.',
      });
    } catch (error) {
      console.error('Error saving kades photo:', error);
      toast({
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan pengaturan ke Firestore.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isDataLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-40 w-32" />
            <Skeleton className="h-9 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs">
      <CardHeader className="p-3.5 sm:p-6 pb-2.5 sm:pb-4 border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xs sm:text-base font-bold">
          <User className="h-4 w-4 text-amber-500 shrink-0" />
          Upload Foto Kades
        </CardTitle>
        <CardDescription className="text-[11px] sm:text-xs">
          Unggah foto resmi Kepala Desa untuk bagian "Profil & Sambutan" halaman Profil Desa.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3.5 sm:p-6 pt-3.5 sm:pt-4">
        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs font-semibold">Pratinjau Foto Kades (rasio 3:4)</Label>
            <div className="relative aspect-[3/4] w-28 sm:w-36 border-2 border-dashed rounded-lg sm:rounded-xl overflow-hidden flex items-center justify-center bg-muted/30">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Pratinjau Foto Kades"
                  fill
                  className="object-cover"
                />
              ) : (
                <p className="text-[10px] text-muted-foreground text-center px-2">Belum ada foto Kepala Desa</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kades-upload" className="text-xs font-semibold">Pilih Foto Baru</Label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Input
                id="kades-upload"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                disabled={isSaving || isUploading}
                className="w-full cursor-pointer text-xs h-8 sm:h-9"
              />
              {isUploading && <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />}
            </div>
            <p className="text-[10px] text-muted-foreground">Maks: 3MB. Format: PNG, JPG, WEBP.</p>
          </div>

          <Button type="submit" disabled={isSaving || isUploading || !kadesPhotoUrl} className="w-full sm:w-auto h-8 sm:h-9 text-xs">
            {isSaving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
            Simpan Foto Kades
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
