'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Image as ImageIcon, Megaphone, X } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { uploadToCloudinary } from '@/lib/upload-cloudinary';

export function AnnouncementForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Terlalu Besar",
        description: "Maksimal ukuran gambar adalah 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const secureUrl = await uploadToCloudinary(file, 'pengumuman-desa');
      setImageUrl(secureUrl);
      toast({ title: 'Gambar Terunggah' });

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
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Formulir tidak lengkap",
        description: "Judul dan isi pengumuman tidak boleh kosong.",
        variant: "destructive",
      });
      return;
    }

    if (!firestore) {
      toast({
        title: "Gagal Menerbitkan",
        description: "Koneksi ke database gagal. Silakan coba lagi.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const announcementsCollection = collection(firestore, 'announcements');
      await addDoc(announcementsCollection, {
        title,
        content,
        imageUrl,
        authorName: "Admin Desa",
        publishDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Pengumuman Diterbitkan",
        description: "Pengumuman baru telah berhasil ditambahkan dan akan tampil di halaman publik.",
      });
      setTitle('');
      setContent('');
      setImageUrl('');
    } catch (error) {
      console.error("Gagal menerbitkan pengumuman:", error);
      toast({
        title: "Gagal Menerbitkan",
        description: "Terjadi kesalahan saat menyimpan pengumuman. Coba lagi nanti.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
      <CardHeader className="p-3.5 sm:p-6 bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-sm sm:text-lg font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
          <Megaphone className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 shrink-0" />
          <span>Buat Pengumuman Baru</span>
        </CardTitle>
        <CardDescription className="text-[10px] sm:text-xs text-slate-500 font-medium">
          Isi formulir di bawah ini untuk menerbitkan pengumuman resmi bagi warga Desa Karanggintung.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3.5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="title" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-600">
              Judul Pengumuman *
            </Label>
            <Input
              id="title"
              placeholder="Contoh: Kerja Bakti Massal Lingkungan Dusun"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              className="rounded-xl border-slate-200 h-10 sm:h-12 text-xs sm:text-sm font-semibold text-slate-700 placeholder-slate-400 bg-slate-50/50 focus:bg-white transition-all"
              required
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="content" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-600">
              Isi Pengumuman *
            </Label>
            <Textarea
              id="content"
              placeholder="Tuliskan rincian informasi dan pengumuman lengkap di sini..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
              className="rounded-xl border-slate-200 min-h-[110px] sm:min-h-[140px] text-xs sm:text-sm font-semibold text-slate-700 placeholder-slate-400 bg-slate-50/50 focus:bg-white p-3 sm:p-4 leading-relaxed resize-none transition-all"
              required
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-600">
              Gambar Lampiran (Opsional)
            </Label>
            <div className="flex flex-col gap-2.5 sm:gap-3">
              {imageUrl && (
                <div className="relative aspect-video w-full max-w-xs sm:max-w-sm overflow-hidden rounded-xl border-2 border-slate-100 bg-slate-50 shadow-2xs">
                  <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white shadow-sm"
                    title="Hapus Gambar"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading || isLoading}
                  className="rounded-xl border-slate-200 text-xs text-slate-600 bg-slate-50/50 file:mr-2 sm:file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] sm:file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 max-w-full sm:max-w-xs"
                />
                {isUploading && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mengunggah...</span>
                  </div>
                )}
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Format JPG/PNG. Maks 2MB.</p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading || isUploading}
              className="w-full sm:w-auto rounded-xl sm:rounded-full h-10 sm:h-11 px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-700/10 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>Terbitkan Pengumuman</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
