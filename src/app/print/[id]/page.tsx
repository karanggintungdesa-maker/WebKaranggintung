import React, { Suspense } from 'react';
import { PrintClient } from './print-client';
import { Loader2 } from 'lucide-react';

export function generateStaticParams() {
  return [{ id: 'preview' }];
}

export default function PrintPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <PrintClient />
    </Suspense>
  );
}

