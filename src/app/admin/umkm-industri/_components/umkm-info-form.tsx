'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore } from '@/firebase';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Image as ImageIcon, X, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { PotensiDesa } from '@/lib/types';
import { uploadToCloudinary } from '@/lib/upload-cloudinary';

interface UmkmInfoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  infoData?: PotensiDesa | null;
}

export function UmkmInfoForm({ open, onOpenChange, infoData }: UmkmInfoFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    category: 'umkm-industri' as PotensiDesa['category'],
    narrative: '',
    imageUrls: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (infoData) {
      setFormData({
        title: infoData.title || '',
        subtitle: infoData.subtitle || '',
        category: 'umkm-industri',
        narrative: infoData.narrative || '',
        imageUrls: infoData.imageUrls || [],
      });
    } else if (open) {
      setFormData({
        title: '',
        subtitle: '',
        category: 'umkm-industri',
        narrative: '',
        imageUrls: [],
      });
    }
  }, [infoData, open]);

  // Quota-saving client-side compression
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (typeof dataUrl !== 'string') {
          reject(new Error('Gagal membaca file gambar.'));
          return;
        }

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDimension = 1200; // Efficient size for web & quota
          let { width, height } = img;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Tidak dapat memproses kompresi gambar.'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          const tryCompress = (quality: number, attempt: number) => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Gagal mengompresi gambar.'));
                  return;
                }

                const compressedFile = new File(
                  [blob],
                  file.name.replace(/\.[^.]+$/, '.jpg'),
                  {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  }
                );

                // If file is still large, compress further up to 3 attempts
                if (compressedFile.size > 350 * 1024 && attempt < 3) {
                  tryCompress(Math.max(0.6, quality - 0.15), attempt + 1);
                } else {
                  resolve(compressedFile);
                }
              },
              'image/jpeg',
              quality
            );
          };

          tryCompress(0.82, 1);
        };
        img.onerror = () => reject(new Error('Format gambar tidak valid.'));
        img.src = dataUrl;
      };
      reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
      reader.readAsDataURL(file);
    });
  };

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const urls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        toast({
          title: `Mengompres & Mengunggah Foto (${i + 1}/${files.length})...`,
          description: `${file.name} dioptimalkan untuk hemat kuota Cloudinary.`,
        });

        const processingFile = await compressImage(file);
        const secureUrl = await uploadToCloudinary(processingFile, 'umkm-karanggintung');
        urls.push(secureUrl);
      }

      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...urls],
      }));

      toast({
        title: 'Berhasil Unggah Foto',
        description: `${urls.length} foto berhasil diunggah dengan kompresi optimal.`,
      });
    } catch (error: any) {
      toast({
        title: 'Gagal Mengunggah',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove),
    }));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...formData.imageUrls];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newImages.length) {
      const temp = newImages[index];
      newImages[index] = newImages[targetIndex];
      newImages[targetIndex] = temp;

      setFormData((prev) => ({
        ...prev,
        imageUrls: newImages,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;

    if (!formData.title.trim()) {
      toast({ title: 'Input Tidak Valid', description: 'Judul informasi tidak boleh kosong.', variant: 'destructive' });
      return;
    }
    if (!formData.narrative.trim()) {
      toast({ title: 'Input Tidak Valid', description: 'Narasi/ulasan informasi tidak boleh kosong.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      if (infoData) {
        await setDoc(
          doc(firestore, 'potensiDesa', infoData.id),
          {
            ...formData,
            category: 'umkm-industri',
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        toast({ title: 'Sukses', description: 'Informasi UMKM berhasil diperbarui.' });
      } else {
        await addDoc(collection(firestore, 'potensiDesa'), {
          ...formData,
          category: 'umkm-industri',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: 'Sukses', description: 'Informasi UMKM baru berhasil ditambahkan.' });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Gagal Menyimpan',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase italic tracking-tight font-display text-slate-800">
            {infoData ? 'Edit Informasi UMKM & Industri' : 'Tambah Informasi UMKM Baru'}
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Formulir untuk memuat ulasan, potensi, pelatihan, atau profil sentra UMKM di Desa Karanggintung.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="info-title" className="text-xs font-black uppercase tracking-widest text-slate-600">
              Judul Informasi / Sentra Usaha
            </Label>
            <Input
              id="info-title"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Contoh: Sentra Olahan Gula Semut & Keripik Singkong"
              className="rounded-xl border-slate-200 h-12 font-semibold text-slate-700 bg-slate-50/50 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="info-subtitle" className="text-xs font-black uppercase tracking-widest text-slate-600">
              Sub Judul / Tagline Singkat
            </Label>
            <Input
              id="info-subtitle"
              value={formData.subtitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Contoh: Pemberdayaan Petani Penderes dan Ibu Rumah Tangga Mandiri"
              className="rounded-xl border-slate-200 h-12 font-semibold text-slate-700 bg-slate-50/50 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="info-narrative" className="text-xs font-black uppercase tracking-widest text-slate-600">
              Ulasan / Narasi Lengkap
            </Label>
            <Textarea
              id="info-narrative"
              value={formData.narrative}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData((prev) => ({ ...prev, narrative: e.target.value }))}
              placeholder="Tuliskan ulasan lengkap mengenai latar belakang, kelompok usaha, pendampingan desa, atau capaian UMKM di sini..."
              className="rounded-xl border-slate-200 min-h-[140px] font-semibold text-slate-700 bg-slate-50/50 focus:bg-white transition-all p-4 resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-600">
                Unggah Foto Kegiatan / Galeri
              </Label>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Auto-Kompres Hemat Kuota Cloudinary
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
              {formData.imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    {index > 0 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        onClick={() => moveImage(index, 'up')}
                        className="h-8 w-8 rounded-full bg-white/90 text-slate-700 hover:bg-white"
                        title="Geser Kiri"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    )}
                    {index < formData.imageUrls.length - 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        onClick={() => moveImage(index, 'down')}
                        className="h-8 w-8 rounded-full bg-white/90 text-slate-700 hover:bg-white"
                        title="Geser Kanan"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => removeImage(index)}
                      className="h-8 w-8 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md"
                      title="Hapus Foto"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                    Foto {index + 1}
                  </div>
                </div>
              ))}

              <label className="flex flex-col items-center justify-center aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer group">
                {isUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 text-slate-400 group-hover:scale-110 group-hover:text-amber-600 transition-all duration-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2 text-center px-2">
                      Unggah Foto
                    </span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFilesChange}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-50 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-12 font-bold px-6 border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="rounded-xl h-12 font-black px-8 bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>SIMPAN INFORMASI</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
