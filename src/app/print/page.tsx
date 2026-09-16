import React, { Suspense } from 'react';
import { PrintClient } from './[id]/print-client';
import { Loader2 } from 'lucide-react';

export default function GeneralPrintPage() {
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
