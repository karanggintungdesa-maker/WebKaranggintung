import React from 'react';
import { PELAYANAN_CATEGORIES } from '@/lib/pelayanan-categories';
import { PelayananCategoryClient } from './pelayanan-category-client';

export function generateStaticParams() {
  return PELAYANAN_CATEGORIES.map((c) => ({ category: c.id }));
}

export default function PelayananCategoryPage() {
  return <PelayananCategoryClient />;
}
