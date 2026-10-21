'use client';

import { useSearchParams } from 'next/navigation';
import ProductList from '@/components/product/product-list';
import React from 'react';

export default function OfferClient() {
  const searchParams = useSearchParams();
  const price = searchParams.get('price');

  return <ProductList price={price} />;
}
