import React, { Suspense } from 'react';
import { BeritaDetailClient } from './berita-detail-client';
import { Skeleton } from '@/components/ui/skeleton';

export default function BeritaDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-8">
          <Skeleton className="h-screen w-full rounded-3xl" />
        </div>
      }
    >
      <BeritaDetailClient />
    </Suspense>
  );
}
