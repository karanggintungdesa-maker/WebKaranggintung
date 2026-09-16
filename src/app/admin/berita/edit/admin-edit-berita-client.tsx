'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { NewsForm } from '../_components/news-form';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { News } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminEditBeritaClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawId = params?.id as string;
  const queryId = searchParams?.get('id');

  let id = '';
  if (queryId) {
    id = decodeURIComponent(queryId).trim();
  } else if (rawId && rawId !== 'preview') {
    id = decodeURIComponent(rawId).trim();
  } else if (typeof window !== 'undefined') {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && lastPart !== 'edit') {
      id = decodeURIComponent(lastPart).trim();
    }
  }

  const firestore = useFirestore();

  const newsRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'news', id);
  }, [firestore, id]);

  const { data: news, isLoading } = useDoc<News>(newsRef);

  if (isLoading) return <div className="p-8"><Skeleton className="h-[500px] w-full" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Berita Desa"
        description="Perbarui konten informasi atau berita seputar Desa Karanggintung."
      />
      <NewsForm initialData={news || undefined} />
    </div>
  );
}
