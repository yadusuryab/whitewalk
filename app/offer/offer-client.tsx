'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductList from '@/components/product/product-list';
import { toPairCount } from '@/lib/checkout-constants';

function OfferContent() {
  const searchParams = useSearchParams();
  const price = searchParams.get('price');
  const pairCount = toPairCount(searchParams.get('pairs'));

  return <ProductList price={price} pairCount={pairCount} />;
}

// /offer          -> 2 pairs
// /offer?pairs=3  -> 3 pairs
export default function OfferClient() {
  return (
    <Suspense fallback={<div className="py-12 text-center">Loading…</div>}>
      <OfferContent />
    </Suspense>
  );
}