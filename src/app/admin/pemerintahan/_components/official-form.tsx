'use client';

import { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore } from '@/firebase';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Image as ImageIcon } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/upload-cloudinary';

export type OfficialCategory = 'perangkat' | 'bpd' | 'rtrw' | 'linmas' | 'posyandu';

export type Official = {
  id?: string;
  name: string;
  position: string;
  imageUrl?: string;
  category: OfficialCategory;
};

interface OfficialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  official?: Official | null;
  defaultCategory?: OfficialCategory;
}

export function OfficialForm({ open, onOpenChange, official, defaultCategory = 'perangkat' }: OfficialFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    imageUrl: '',
    category: defaultCategory,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (official) {
      setFormData({
        name: official.name,
        position: official.position,
        imageUrl: official.imageUrl || '',
        category: official.category,
      });
    } else if (open) {
      setFormData({ name: '', position: '', imageUrl: '', category: defaultCategory });
    }
  }, [official, open, defaultCategory]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Terlalu Besar",
        description: "Maksimal ukuran foto adalah 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const secureUrl = await uploadToCloudinary(file, 'pemerintahan-desa');
      setFormData(prev => ({ ...prev, imageUrl: secureUrl }));
      toast({ title: 'Foto Terunggah' });

    } catch (error: any) {
      toast({
        title: 'Gagal Mengunggah',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;
    setIsSubmitting(true);

    try {
      if (official && official.id) {
        await setDoc(doc(firestore, 'officials', official.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        toast({ title: "Data Berhasil Diperbarui" });
      } else {
        await addDoc(collection(firestore, 'officials'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: "Data Berhasil Ditambahkan" });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Gagal Menyimpan", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPositionPlaceholder = () => {
    switch (formData.category) {
      case 'linmas':
        return 'Contoh: Komandan Pleton (Danton) / Anggota Linmas Dusun ...';
      case 'posyandu':
        return 'Contoh: Ketua Kader Posyandu / Kader Posyandu Melati Dusun ...';
      case 'bpd':
        return 'Contoh: Ketua BPD / Anggota BPD Keterwakilan Perempuan';
      case 'rtrw':
        return 'Contoh: Ketua RW 01 / Ketua RT 02 RW 01';
      default:
        return 'Contoh: Kepala Desa / Sekretaris Desa / Kasi Pelayanan';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold">{official ? 'Edit Pengurus' : 'Tambah Pengurus Baru'}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">Isi detail pengurus atau kelembagaan desa di bawah ini.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-semibold">Foto Profil</Label>
            <div className="flex flex-col gap-3">
              {formData.imageUrl && (
                <div className="relative aspect-[3/4] w-28 sm:w-32 overflow-hidden rounded-2xl border-2 border-primary/10 bg-muted">
                  <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex items-center gap-3">
                <Input type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading || isSubmitting} className="h-9 sm:h-10 text-xs sm:text-sm max-w-xs rounded-xl" />
                {isUploading && <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />}
              </div>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold">Maks 2MB. Rekomendasi rasio 3:4.</p>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="category" className="text-xs sm:text-sm font-semibold">Kategori Jabatan / Lembaga</Label>
            <Select
              value={formData.category}
              onValueChange={(v: any) => setFormData(p => ({ ...p, category: v }))}
            >
              <SelectTrigger className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="perangkat">Perangkat Desa</SelectItem>
                <SelectItem value="bpd">BPD Desa</SelectItem>
                <SelectItem value="rtrw">RT / RW</SelectItem>
                <SelectItem value="linmas">Satuan Linmas (Satlinmas)</SelectItem>
                <SelectItem value="posyandu">Kader Posyandu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="name" className="text-xs sm:text-sm font-semibold">Nama Lengkap</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(p => ({ ...p, name: e.target.value.toUpperCase() }))}
              placeholder="Contoh: BUDI SANTOSO"
              className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm"
              required
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="position" className="text-xs sm:text-sm font-semibold">Jabatan / Peran</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(p => ({ ...p, position: e.target.value }))}
              placeholder={getPositionPlaceholder()}
              className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm"
              required
            />
          </div>

          <DialogFooter className="flex-row gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1 h-9 sm:h-10 rounded-xl text-xs sm:text-sm" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" className="flex-1 h-9 sm:h-10 rounded-xl text-xs sm:text-sm bg-emerald-700 hover:bg-emerald-800 text-white" disabled={isSubmitting || isUploading}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
