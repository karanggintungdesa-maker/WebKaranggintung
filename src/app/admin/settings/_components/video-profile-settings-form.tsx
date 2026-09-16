'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Video } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { VillageProfileInfo } from '@/lib/types';

export function VideoProfileSettingsForm() {
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'default');
  }, [firestore]);

  const { data: profileData, isLoading: isDataLoading } = useDoc<VillageProfileInfo>(profileRef);

  useEffect(() => {
    if (profileData?.youtubeVideoUrl) {
      setYoutubeVideoUrl(profileData.youtubeVideoUrl);
    }
  }, [profileData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !profileRef) return;
    setIsSaving(true);

    try {
      await setDoc(profileRef, { youtubeVideoUrl }, { merge: true });
      toast({ title: 'Tautan Video Disimpan', description: 'Link video profil desa telah diperbarui.' });
    } catch (error) {
      console.error('Error saving village profile video URL:', error);
      toast({ title: 'Gagal Menyimpan', description: 'Terjadi kesalahan saat menyimpan tautan video.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isDataLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  return (
    <Card className="border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs">
      <CardHeader className="p-3.5 sm:p-6 pb-2.5 sm:pb-4 border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xs sm:text-base font-bold">
          <Video className="h-4 w-4 text-emerald-600 shrink-0" />
          Video Profil Desa
        </CardTitle>
        <CardDescription className="text-[11px] sm:text-xs">Masukkan tautan YouTube untuk menampilkan video profil desa di halaman depan.</CardDescription>
      </CardHeader>
      <CardContent className="p-3.5 sm:p-6 pt-3.5 sm:pt-4">
        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="youtube-video-url" className="text-xs font-semibold">Tautan YouTube</Label>
            <Input
              id="youtube-video-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeVideoUrl}
              onChange={(e) => setYoutubeVideoUrl(e.target.value)}
              disabled={isSaving}
              className="text-xs h-8 sm:h-9"
            />
            <p className="text-[10px] text-muted-foreground">
              Tautan akan ditampilkan di bagian video profil desa pada halaman utama.
            </p>
          </div>
          <Button type="submit" disabled={isSaving} className="w-full sm:w-auto h-8 sm:h-9 text-xs">
            {isSaving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
            Simpan Video Profil
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
