'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Image as ImageIcon } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface HeroImageInfo {
  imageUrl: string;
}

export function HeroSettingsForm() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const firestore = useFirestore();

  const heroRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'heroImage', 'default');
  }, [firestore]);

  const { data: heroData, isLoading: isDataLoading } = useDoc<HeroImageInfo>(heroRef);

  useEffect(() => {
    if (heroData?.imageUrl) {
      setImageUrl(heroData.imageUrl);
      setImagePreview(heroData.imageUrl);
    }
  }, [heroData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 700 * 1024) { 
      toast({
        title: "Ukuran File Terlalu Besar",
        description: "Ukuran gambar hero tidak boleh melebihi 700KB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImageUrl(base64String);
      setImagePreview(base64String);
      setIsUploading(false);
      toast({ title: "Gambar Siap", description: "Klik simpan untuk menerapkan ke beranda." });
    };

    reader.onerror = () => {
      toast({ title: "Gagal Membaca File", variant: "destructive" });
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !heroRef) return;
    setIsSaving(true);

    try {
      await setDoc(heroRef, { imageUrl }, { merge: true });
      toast({
        title: "Berhasil",
        description: "Gambar utama beranda telah diperbarui.",
      });
    } catch (error) {
      console.error("Error saving hero image:", error);
      toast({
        title: "Gagal Menyimpan",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isDataLoading) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  return (
    <Card className="border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs">
      <CardHeader className="p-3.5 sm:p-6 pb-2.5 sm:pb-4 border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xs sm:text-base font-bold">
          <ImageIcon className="h-4 w-4 text-emerald-600 shrink-0" />
          Gambar Utama Beranda (Hero)
        </CardTitle>
        <CardDescription className="text-[11px] sm:text-xs">Ganti gambar besar yang tampil di bagian atas halaman depan website.</CardDescription>
      </CardHeader>
      <CardContent className="p-3.5 sm:p-6 pt-3.5 sm:pt-4">
        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs font-semibold">Pratinjau Gambar</Label>
            <div className="relative aspect-[16/9] max-h-48 sm:max-h-64 w-full overflow-hidden rounded-lg sm:rounded-xl border-2 border-dashed bg-muted flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Hero Preview" className="h-full w-full object-cover" />
              ) : (
                <p className="text-xs text-muted-foreground">Belum ada gambar kustom</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hero-upload" className="text-xs font-semibold">Pilih File Gambar (JPG/PNG)</Label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Input
                id="hero-upload"
                type="file"
                accept="image/jpeg, image/png"
                onChange={handleFileChange}
                disabled={isSaving || isUploading}
                className="w-full text-xs h-8 sm:h-9"
              />
              {isUploading && <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />}
            </div>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Maks 700KB. Gunakan orientasi lanskap (melebar).</p>
          </div>

          <Button type="submit" disabled={isSaving || isUploading || !imageUrl} className="w-full sm:w-auto h-8 sm:h-9 text-xs">
            {isSaving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
            Simpan Gambar Hero
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
