import React, { Suspense } from 'react';
import { AdminEditBeritaClient } from './admin-edit-berita-client';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminEditBeritaPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <Skeleton className="h-[500px] w-full" />
        </div>
      }
    >
      <AdminEditBeritaClient />
    </Suspense>
  );
}
