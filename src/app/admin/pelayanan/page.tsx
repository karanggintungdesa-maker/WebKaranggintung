
'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { PelayananDoc, DriveSettingsInfo } from '@/lib/types';
import { PELAYANAN_CATEGORIES, getCategoryLabel } from '@/lib/pelayanan-categories';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Save, Trash2, Edit, FileUp, FileText, ExternalLink, Globe, Cloud, Image as ImageIcon, Link2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { uploadToCloudinary } from '@/lib/upload-cloudinary';

/** Extracts a Google Drive folder ID from a full URL or returns the raw ID. */
function extractFolderId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  const id = match ? match[1] : trimmed;
  // Strip query parameters like ?hl=ID or ?usp=sharing
  return id.split('?')[0].split('#')[0];
}

export default function AdminPelayananPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingDoc, setEditingDoc] = useState<PelayananDoc | null>(null);
  const [fileToUpload, setSelectedFile] = useState<File | null>(null);
  const [link, setLink] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const isImageCategory = category === 'visi-misi' || category === 'maklumat' || category === 'pojok-baca';

  useEffect(() => {
    if (!editingDoc) {
      setSelectedFile(null);
      setImagePreview('');
      setLink('');
    }
  }, [category, editingDoc]);

  const firestore = useFirestore();
  const { toast } = useToast();

  const docsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'pelayananDocs'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: documents, isLoading } = useCollection<PelayananDoc>(docsQuery);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (file: File, docTitle: string) => {
    if (!firestore) return null;
    
    setIsUploading(true);
    try {
      const driveRef = doc(firestore, 'driveSettings', 'default');
      const driveSnap = await getDoc(driveRef);
      if (!driveSnap.exists()) throw new Error("Konfigurasi Google Drive belum diatur di menu Pengaturan.");
      
      const driveData = driveSnap.data() as DriveSettingsInfo;
      const appsScriptUrl = (driveData.appsScriptUrl || '').trim();
      const rootFolderId = extractFolderId(driveData.rootFolderId || '');
      
      console.log('[Drive Upload] appsScriptUrl:', appsScriptUrl);
      console.log('[Drive Upload] rootFolderId (cleaned):', rootFolderId);
      console.log('[Drive Upload] raw rootFolderId from Firestore:', driveData.rootFolderId);
      
      if (!appsScriptUrl || !rootFolderId) throw new Error("URL Apps Script atau ID Folder Utama belum lengkap.");

      const base64Data = await convertFileToBase64(file);
      const payload = {
        rootFolderId,
        folderName: "PELAYANAN DESA",
        letterType: "Informasi Publik",
        requesterName: "ADMIN",
        files: [{
          base64Data,
          mimeType: file.type,
          targetFileName: docTitle.toUpperCase().replace(/\s+/g, '_'),
        }]
      };

      console.log('[Drive Upload] Sending payload with rootFolderId:', rootFolderId, 'file:', file.name, 'size:', file.size);

      const response = await fetch(appsScriptUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        redirect: 'follow',
      });

      const resultText = await response.text();
      console.log('[Drive Upload] Raw response:', resultText.substring(0, 500));
      
      let result;
      try {
        result = JSON.parse(resultText);
      } catch {
        throw new Error("Respons Apps Script bukan JSON valid: " + resultText.substring(0, 200));
      }
      
      if (result.status !== 'success') throw new Error(result.message || "Gagal unggah ke Drive.");
      
      return result.files[0].fileId;
    } catch (err: any) {
      console.error('[Drive Upload] Error:', err);
      toast({ title: "Gagal Unggah Berkas", description: err.message, variant: "destructive" });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'pelayanan-desa');
      return url;
    } catch (err: any) {
      toast({ title: "Gagal Mengunggah Gambar", description: err.message, variant: "destructive" });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);

    if (file && isImageCategory) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || isSubmitting) return;

    if (!category || !title.trim()) {
      toast({ title: "Data Belum Lengkap", variant: "destructive" });
      return;
    }

    if (!editingDoc && !fileToUpload) {
        toast({ 
          title: "Pilih Berkas", 
          description: isImageCategory ? "Mohon pilih berkas gambar yang akan diunggah." : "Mohon pilih file PDF yang akan diunggah.", 
          variant: "destructive" 
        });
        return;
    }

    setIsSubmitting(true);
    try {
      if (editingDoc) {
        const updateData: any = {
          title: title.toUpperCase(),
          category,
        };
        if (category === 'pojok-baca') {
          updateData.link = link;
        } else {
          updateData.link = null;
        }
        await updateDoc(doc(firestore, 'pelayananDocs', editingDoc.id), updateData);
        toast({ title: "Data Diperbarui" });
      } else {
        let fileId = '';
        let fileName = fileToUpload!.name;

        if (isImageCategory) {
          const uploadedUrl = await handleImageUpload(fileToUpload!);
          if (!uploadedUrl) {
            setIsSubmitting(false);
            return;
          }
          fileId = uploadedUrl;
        } else {
          const driveFileId = await handleFileUpload(fileToUpload!, title);
          if (!driveFileId) {
              setIsSubmitting(false);
              return;
          }
          fileId = driveFileId;
        }

        const docData: any = {
          title: title.toUpperCase(),
          category,
          fileId,
          fileName,
          createdAt: serverTimestamp(),
        };

        if (category === 'pojok-baca') {
          docData.link = link;
        }

        await addDoc(collection(firestore, 'pelayananDocs'), docData);
        toast({ title: "Dokumen Berhasil Disimpan" });
      }

      setTitle('');
      setCategory('');
      setSelectedFile(null);
      setEditingDoc(null);
      setLink('');
      setImagePreview('');
    } catch (error: any) {
      toast({ title: "Terjadi Kesalahan", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleEdit = (item: PelayananDoc) => {
    setEditingDoc(item);
    setTitle(item.title);
    setCategory(item.category);
    setLink(item.link || '');
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'pelayananDocs', id));
      toast({ title: "Dokumen Dihapus" });
    } catch (error: any) {
      toast({ title: "Gagal Menghapus", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      <PageHeader
        title="Manajemen Pelayanan Desa"
        description="Kelola dokumen PDF untuk setiap kategori informasi pelayanan publik."
      />

      <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8">
        <div className="lg:col-span-4">
          <Card className="rounded-2xl sm:rounded-[2rem] border-none shadow-sm lg:sticky lg:top-28 overflow-hidden">
            <CardHeader className="bg-primary text-white p-3.5 sm:p-5 md:p-8">
              <CardTitle className="text-base sm:text-lg md:text-xl font-black uppercase italic tracking-tight">
                {editingDoc ? 'Edit Dokumen' : 'Input Dokumen Baru'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-5 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pilih Kategori</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-10 sm:h-12 rounded-xl text-xs sm:text-sm">
                      <SelectValue placeholder="Pilih Menu" />
                    </SelectTrigger>
                    <SelectContent>
                      {PELAYANAN_CATEGORIES.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Judul Dokumen</Label>
                  <Input 
                    placeholder="Contoh: SK Standar Pelayanan KTP" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    className="h-10 sm:h-12 rounded-xl uppercase font-bold text-xs sm:text-sm"
                  />
                </div>

                {category === 'pojok-baca' && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Link Tautan</Label>
                    <Input 
                      placeholder="Contoh: https://e-book.desa.id/buku-a" 
                      value={link} 
                      onChange={e => setLink(e.target.value)}
                      className="h-10 sm:h-12 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                )}

                {!editingDoc && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {isImageCategory ? 'Berkas Gambar' : 'Berkas PDF'}
                    </Label>
                    <div className="relative group border-2 border-dashed rounded-2xl p-3 sm:p-4 transition-all hover:border-primary/50 bg-slate-50/50">
                        <Input 
                          type="file" 
                          accept={isImageCategory ? "image/*" : ".pdf"} 
                          onChange={handleFileChange}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2">
                           <FileUp className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400 group-hover:text-primary transition-all" />
                           <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest break-all">
                             {fileToUpload ? fileToUpload.name : (isImageCategory ? 'PILIH FILE GAMBAR' : 'PILIH FILE .PDF')}
                           </p>
                        </div>
                    </div>
                    {isImageCategory && imagePreview && (
                      <div className="mt-3 sm:mt-4 relative aspect-video w-full border rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                        <img src={imagePreview} alt="Pratinjau Unggahan" className="object-contain w-full h-full" />
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 sm:pt-4 flex gap-2">
                  {editingDoc && (
                    <Button type="button" variant="outline" className="flex-1 rounded-xl font-bold text-xs sm:text-sm h-10 sm:h-12" onClick={() => { setEditingDoc(null); setTitle(''); setCategory(''); setLink(''); }}>Batal</Button>
                  )}
                  <Button type="submit" disabled={isSubmitting} className="flex-1 h-10 sm:h-12 rounded-xl font-black uppercase tracking-wider text-xs sm:text-sm shadow-md shadow-primary/20">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {editingDoc ? 'Simpan Edit' : 'Simpan Dokumen'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card className="rounded-2xl sm:rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
             <CardHeader className="p-3.5 sm:p-5 md:p-8 border-b bg-slate-50/50 flex flex-row items-center justify-between">
               <CardTitle className="text-sm sm:text-lg font-black uppercase text-slate-800">Daftar Kontrol Dokumen</CardTitle>
               <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-200/50 px-2 py-0.5 rounded-full">
                 {documents?.length || 0} Dokumen
               </span>
             </CardHeader>
             <CardContent className="p-0">
               {/* Mobile Card List View (block sm:hidden) - Full screen, zero horizontal scroll */}
               <div className="block sm:hidden divide-y divide-slate-100">
                 {isLoading ? (
                   Array.from({ length: 3 }).map((_, i) => (
                     <div key={i} className="p-3.5 space-y-2">
                       <Skeleton className="h-4 w-3/4 rounded" />
                       <Skeleton className="h-3 w-1/2 rounded" />
                       <Skeleton className="h-7 w-full rounded-lg" />
                     </div>
                   ))
                 ) : documents?.length === 0 ? (
                   <div className="p-6 text-center text-slate-400 text-xs italic">
                     Belum ada dokumen pelayanan yang diinput.
                   </div>
                 ) : (
                   documents?.map((docItem) => (
                     <div key={docItem.id} className="p-3.5 space-y-2.5 bg-white">
                       <div className="space-y-1">
                         <p className="font-black text-xs uppercase text-slate-800 leading-snug break-words">
                           {docItem.title}
                         </p>
                         <div className="flex flex-wrap items-center gap-1.5">
                           <Badge variant="secondary" className="text-[9px] font-black uppercase px-2 py-0.5 h-auto">
                             {getCategoryLabel(docItem.category)}
                           </Badge>
                           <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase">
                             <div className={cn(
                               "p-0.5 rounded",
                               docItem.fileId.startsWith('http') ? "text-amber-600" : "text-emerald-600"
                             )}>
                               {docItem.fileId.startsWith('http') ? <Cloud className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                             </div>
                             <span className="truncate max-w-[130px]">{docItem.fileName}</span>
                           </div>
                         </div>
                       </div>

                       {docItem.link && (
                         <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/5 p-1.5 rounded-lg">
                           <Link2 className="h-3 w-3 shrink-0" />
                           <span className="truncate">{docItem.link}</span>
                         </div>
                       )}

                       <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100">
                         <Button variant="outline" size="sm" className="h-8 px-2.5 text-[10px] font-bold rounded-lg flex-1 gap-1" asChild>
                           <a href={docItem.fileId.startsWith('http') ? docItem.fileId : `https://drive.google.com/file/d/${docItem.fileId}/view`} target="_blank" rel="noopener noreferrer">
                             <ExternalLink className="h-3 w-3" />
                             <span>Buka File</span>
                           </a>
                         </Button>
                         <Button variant="outline" size="sm" className="h-8 px-2.5 text-[10px] font-bold rounded-lg text-emerald-700 hover:text-emerald-800 border-emerald-200 hover:bg-emerald-50 gap-1" onClick={() => handleEdit(docItem)}>
                           <Edit className="h-3 w-3" />
                           <span>Edit</span>
                         </Button>
                         <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px] font-bold rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 gap-1" onClick={() => handleDelete(docItem.id)}>
                           <Trash2 className="h-3 w-3" />
                           <span>Hapus</span>
                         </Button>
                       </div>
                     </div>
                   ))
                 )}
               </div>

               {/* Desktop Table View (hidden sm:block) */}
               <div className="hidden sm:block overflow-x-auto w-full">
                <Table className="min-w-[520px]">
                  <TableHeader className="bg-slate-100/50">
                    <TableRow>
                      <TableHead className="pl-4 sm:pl-8 font-black uppercase text-[9px] tracking-[0.2em] text-slate-400">Judul & Kategori</TableHead>
                      <TableHead className="font-black uppercase text-[9px] tracking-[0.2em] text-slate-400">Sumber File</TableHead>
                      <TableHead className="text-right pr-4 sm:pr-8 font-black uppercase text-[9px] tracking-[0.2em] text-slate-400">Kelola</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}><TableCell colSpan={3} className="p-8"><Skeleton className="h-10 w-full rounded-xl" /></TableCell></TableRow>
                      ))
                    ) : documents?.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="h-48 text-center text-slate-400 font-medium italic">Belum ada dokumen pelayanan yang diinput.</TableCell></TableRow>
                    ) : (
                      documents?.map((docItem) => (
                        <TableRow key={docItem.id} className="hover:bg-slate-50/80 group transition-all">
                          <TableCell className="pl-4 sm:pl-8 py-3.5 sm:py-5">
                            <div className="space-y-1">
                               <p className="font-black text-xs sm:text-sm uppercase text-slate-700 leading-tight">{docItem.title}</p>
                               <Badge variant="secondary" className="text-[8px] font-black uppercase px-2 py-0 h-4">{getCategoryLabel(docItem.category)}</Badge>
                               {docItem.link && (
                                 <div className="flex items-center gap-1 text-[8px] font-bold text-primary mt-1">
                                   <Link2 className="h-2 w-2" />
                                   <span className="truncate max-w-[180px]">{docItem.link}</span>
                                 </div>
                               )}
                            </div>
                          </TableCell>
                          <TableCell>
                             <div className="flex items-center gap-2">
                                <div className={cn(
                                  "p-1.5 sm:p-2 rounded-lg",
                                  docItem.fileId.startsWith('http') ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                                )}>
                                  {docItem.fileId.startsWith('http') ? <Cloud className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[120px] sm:max-w-[150px]">{docItem.fileName}</span>
                             </div>
                          </TableCell>
                          <TableCell className="text-right pr-4 sm:pr-8">
                             <div className="flex justify-end gap-1.5 sm:gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl" asChild>
                                  <a href={docItem.fileId.startsWith('http') ? docItem.fileId : `https://drive.google.com/file/d/${docItem.fileId}/view`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></a>
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl hover:text-emerald-700 hover:border-emerald-300" onClick={() => handleEdit(docItem)}>
                                  <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(docItem.id)}>
                                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                             </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
               </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
