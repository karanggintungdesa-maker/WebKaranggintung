import React, { Suspense } from 'react';
import { AnnouncementDetailClient } from './announcement-detail-client';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnnouncementDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-8">
          <Skeleton className="h-screen w-full rounded-3xl" />
        </div>
      }
    >
      <AnnouncementDetailClient />
    </Suspense>
  );
}
