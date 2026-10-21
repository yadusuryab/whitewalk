'use client';

import { useSearchParams } from 'next/navigation';
import ProductList from '@/components/product/product-list';
import { toPairCount } from '@/lib/checkout-constants';
import React from 'react';

// /offer          -> 2 pairs
// /offer?pairs=3  -> 3 pairs
export default function OfferClient() {
  const searchParams = useSearchParams();
  const price = searchParams.get('price');
  const pairCount = toPairCount(searchParams.get('pairs'));

  return <ProductList price={price} pairCount={pairCount} />;
}