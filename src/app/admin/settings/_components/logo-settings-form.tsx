'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { VillageLogoInfo } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

const defaultLogoInfo: VillageLogoInfo = {
  logoImageUrl: "" // Start with no logo
};

export function LogoSettingsForm() {
  const [formState, setFormState] = useState<VillageLogoInfo>(defaultLogoInfo);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const firestore = useFirestore();

  const logoRef = useMemoFirebase(() => {
      if (!firestore) return null;
      return doc(firestore, 'villageLogo', 'default');
  }, [firestore]);
  const { data: logoData, isLoading: isDataLoading } = useDoc<VillageLogoInfo>(logoRef);

  useEffect(() => {
    if (logoData) {
      setFormState(logoData);
      setImagePreview(logoData.logoImageUrl);
    }
  }, [logoData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024) { 
        toast({
            title: "Ukuran File Terlalu Besar",
            description: "Ukuran gambar logo tidak boleh melebihi 100KB.",
            variant: "destructive",
        });
        return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormState({ logoImageUrl: base64String });
      setImagePreview(base64String);
      setIsUploading(false);
      toast({ title: "Logo Siap Disimpan", description: "Pratinjau telah diperbarui. Klik 'Simpan Perubahan' untuk menerapkan." });
    };

    reader.onerror = () => {
        console.error("Error reading file");
        toast({ title: "Gagal Membaca File", description: "Terjadi kesalahan saat memuat pratinjau gambar.", variant: "destructive" });
        setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !logoRef) return;
    setIsSaving(true);

    try {
      await setDoc(logoRef, formState, { merge: true });
      toast({
        title: "Logo Berhasil Diperbarui",
        description: "Logo desa telah berhasil disimpan.",
      });
    } catch (error) {
      console.error("Error saving logo:", error);
      toast({
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan saat menyimpan logo ke Firestore.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isDataLoading) {
      return (
          <Card>
              <CardHeader>
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                  <div className="space-y-8">
                       <Skeleton className="h-24 w-24" />
                       <Skeleton className="h-11 w-48" />
                  </div>
              </CardContent>
          </Card>
      )
  }

  return (
    <Card className="border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs">
      <CardHeader className="p-3.5 sm:p-6 pb-2.5 sm:pb-4 border-b border-slate-100">
        <CardTitle className="text-xs sm:text-base font-bold">Logo Desa</CardTitle>
        <CardDescription className="text-[11px] sm:text-xs">Unggah logo resmi desa. Logo ini akan tampil di sebelah judul utama aplikasi.</CardDescription>
      </CardHeader>
      <CardContent className="p-3.5 sm:p-6 pt-3.5 sm:pt-4">
        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs font-semibold">Pratinjau Logo</Label>
                <div className="w-16 h-16 sm:w-20 sm:h-20 p-2 border-2 border-dashed rounded-lg sm:rounded-xl flex items-center justify-center bg-muted/50">
                   {imagePreview ? (
                        <Image src={imagePreview} alt="Pratinjau Logo" width={64} height={64} className="object-contain max-w-full h-auto rounded-md"/>
                   ) : (
                        <p className="text-[10px] text-muted-foreground text-center">Belum ada logo</p>
                   )}
                </div>
            </div>
        
            <div className="space-y-1.5">
                <Label htmlFor="logo-upload" className="text-xs font-semibold">Unggah Gambar Logo Baru</Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <Input
                        id="logo-upload"
                        type="file"
                        accept="image/png, image/jpeg, image/svg+xml"
                        onChange={handleFileChange}
                        disabled={isSaving || isUploading}
                        className="w-full text-xs h-8 sm:h-9"
                    />
                    {isUploading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
                </div>
                <p className="text-[10px] text-muted-foreground">
                    Maks: 100KB. Format: PNG, JPG, atau SVG.
                </p>
            </div>
            
            <Button type="submit" disabled={isSaving || isUploading || !formState.logoImageUrl} className="w-full sm:w-auto h-8 sm:h-9 text-xs">
                {isSaving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
                Simpan Logo
            </Button>
        </form>
      </CardContent>
    </Card>
  );
}
