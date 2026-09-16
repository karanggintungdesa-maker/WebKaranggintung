'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Receipt, CheckCircle2, AlertCircle, ExternalLink, HelpCircle } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { PbbSettings } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export function PbbSettingsForm() {
  const [scriptUrl, setScriptUrl] = useState('');
  const [sheetName, setSheetName] = useState('BNBA PBB 26');
  const [contactWhatsApp, setContactWhatsApp] = useState('0895-3211-09179');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const { toast } = useToast();
  const firestore = useFirestore();

  const pbbRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'pbbSettings');
  }, [firestore]);

  const { data: pbbSettings, isLoading } = useDoc<PbbSettings>(pbbRef);

  useEffect(() => {
    if (pbbSettings) {
      if (pbbSettings.scriptUrl) setScriptUrl(pbbSettings.scriptUrl);
      if (pbbSettings.sheetName) setSheetName(pbbSettings.sheetName);
      if (pbbSettings.contactWhatsApp) setContactWhatsApp(pbbSettings.contactWhatsApp);
    }
  }, [pbbSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;

    setIsSaving(true);
    try {
      await setDoc(doc(firestore, 'villageProfile', 'pbbSettings'), {
        scriptUrl: scriptUrl.trim(),
        sheetName: sheetName.trim() || 'BNBA PBB 26',
        contactWhatsApp: contactWhatsApp.trim(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      toast({
        title: 'Pengaturan Berhasil Disimpan',
        description: 'Konfigurasi Google Spreadsheet PBB-P2 berhasil diperbarui.',
      });
    } catch (error: any) {
      console.error('Error saving PBB settings:', error);
      toast({
        title: 'Gagal Menyimpan',
        description: error.message || 'Terjadi kesalahan saat menyimpan pengaturan.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!scriptUrl.trim()) {
      toast({
        title: 'URL Masih Kosong',
        description: 'Silakan masukkan URL Web App Google Apps Script terlebih dahulu.',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`${scriptUrl.trim()}?nop=TEST`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      const data = await res.json();

      if (data && (data.status === 'not_found' || data.status === 'success' || data.status === 'error')) {
        setTestResult({
          success: true,
          message: 'Koneksi Berhasil! Google Apps Script merespons dengan benar.',
        });
        toast({
          title: 'Koneksi Berhasil',
          description: 'Web App Google Apps Script terhubung dan aktif.',
        });
      } else {
        setTestResult({
          success: false,
          message: 'Respons tidak sesuai format JSON yang diharapkan.',
        });
      }
    } catch (err: any) {
      console.error('Test connection error:', err);
      setTestResult({
        success: false,
        message: 'Gagal menghubungi script: Pastikan deployment disetel ke "Anyone" (Siapa saja).',
      });
      toast({
        title: 'Koneksi Gagal',
        description: 'Periksa kembali URL dan perizinan deployment Google Apps Script.',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full rounded-2xl" />;
  }

  return (
    <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-border/40 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Integrasi Spreadsheet PBB-P2</CardTitle>
            <CardDescription>
              Hubungkan Google Spreadsheet data SPPT PBB (Sheet: BNBA PBB 26 mulai baris 5) ke mesin pencari di landing page.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="scriptUrl" className="font-semibold text-sm flex items-center gap-1.5">
                URL Google Apps Script Web App
              </Label>
              <a
                href="/docs/pbb-spreadsheet-setup.md"
                target="_blank"
                className="text-xs text-emerald-600 hover:underline inline-flex items-center gap-1 font-medium"
              >
                <HelpCircle className="h-3 w-3" />
                Panduan Script
              </a>
            </div>
            <Input
              id="scriptUrl"
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              value={scriptUrl}
              onChange={(e) => setScriptUrl(e.target.value.trim())}
              className="rounded-xl font-mono text-sm"
            />
            {scriptUrl.includes('docs.google.com/spreadsheets') && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Peringatan: Ini adalah link Spreadsheet, bukan link Web App!
                </p>
                <p>
                  URL yang dibutuhkan adalah URL Web App hasil <strong>Deploy &gt; Penerapan baru &gt; Aplikasi Web</strong> yang berakhiran <code>/exec</code>. Silakan ikuti panduan pada dokumen setup.
                </p>
              </div>
            )}
            {scriptUrl.includes('script.google.com') && scriptUrl.includes('/edit') && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Peringatan: Ini adalah link Editor Script (/edit)!
                </p>
                <p>
                  Buka editor Apps Script, lalu klik <strong>Terapkan (Deploy) &gt; Penerapan baru &gt; Aplikasi Web (Who has access: Anyone)</strong> untuk mendapatkan link yang berakhiran <code>/exec</code>.
                </p>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground">
              Didapatkan setelah melakukan <strong>Deploy (Penerapan baru) &gt; Web App</strong> dengan izin <strong>Who has access: Anyone</strong> di Apps Script (berakhiran <code>/exec</code>).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sheetName" className="font-semibold text-sm">
                Nama Sheet
              </Label>
              <Input
                id="sheetName"
                placeholder="BNBA PBB 26"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                className="rounded-xl"
              />
              <p className="text-[11px] text-muted-foreground">
                Default: <code>BNBA PBB 26</code> (data dimulai pada baris 5).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactWhatsApp" className="font-semibold text-sm">
                Nomor WhatsApp Konfirmasi PBB
              </Label>
              <Input
                id="contactWhatsApp"
                placeholder="0895-3211-09179"
                value={contactWhatsApp}
                onChange={(e) => setContactWhatsApp(e.target.value)}
                className="rounded-xl"
              />
              <p className="text-[11px] text-muted-foreground">
                Nomor kontak petugas/koordinator untuk tombol konfirmasi warga.
              </p>
            </div>
          </div>

          {testResult && (
            <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
              testResult.success
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {testResult.success ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTesting || !scriptUrl}
              className="rounded-xl font-semibold gap-2 text-xs"
            >
              {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              Uji Koneksi Script
            </Button>

            <Button
              type="submit"
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold gap-2"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Pengaturan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
