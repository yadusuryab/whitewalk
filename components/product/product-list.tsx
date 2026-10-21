"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useAddToCart } from "@/hooks/useAddToCart";
import SHeading from "../utils/section-heading";
import ProductCard2 from "./product-image-card";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { isInOffer, type PairCount } from "@/lib/checkout-constants";

interface ProductListProps {
  price?: string | null;
  pairCount?: PairCount;
}

const ProductCardSkeleton = () => (
  <div className="animate-pulse bg-muted rounded-lg aspect-square"></div>
);

function ProductList({ price, pairCount = 2 }: ProductListProps) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [offset, setOffset] = useState<number>(0);
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);

  const {
    handleProductClick,
    renderBogoPage,
    renderSizeModal,
    renderCheckoutLoading,
  } = useAddToCart(pairCount);

  const loadProducts = useCallback(
    async (loadOffset: number = 0, loadLimit: number = 12) => {
      try {
        setLoading(true);
        const { getAllShoes } = await import("@/lib/vehicleQueries");
        const data: any = await getAllShoes(
          price,
          loadLimit,
          loadOffset,
          false,
          pairCount,
        );

        if (data?.length) {
          setVehicles((prev) => (loadOffset === 0 ? data : [...prev, ...data]));
          setHasMore(data.length === loadLimit);
          setOffset(loadOffset + data.length);
          if (loadOffset === 0) setInitialLoadDone(true);
        } else {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Load error:", err);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    },
    [price, pairCount],
  );

  useEffect(() => {
    loadProducts(0, 12);
  }, [loadProducts]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadProducts(offset, 8);
    }
  }, [loading, hasMore, offset, loadProducts]);

  useEffect(() => {
    if (!hasMore || loading || !initialLoadDone) return;

    let throttleTimeout: ReturnType<typeof setTimeout> | null = null;
    const handleScroll = () => {
      if (throttleTimeout) return;

      throttleTimeout = setTimeout(() => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const pageHeight = document.documentElement.scrollHeight;

        if (scrollPosition >= pageHeight - 1500) {
          loadMore();
        }
        throttleTimeout = null;
      }, 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [loadMore, hasMore, loading, initialLoadDone]);

  // Safety net: only show shoes that belong to this offer,
  // even if the query returns extras.
  const visibleProducts = useMemo(
    () => vehicles.filter((item) => isInOffer(item, pairCount)),
    [vehicles, pairCount],
  );
  const bogoProducts = visibleProducts;

  // If a batch had few matches, keep fetching until there are enough.
  useEffect(() => {
    if (
      initialLoadDone &&
      !loading &&
      hasMore &&
      visibleProducts.length < 8
    ) {
      loadMore();
    }
  }, [initialLoadDone, loading, hasMore, visibleProducts.length, loadMore]);

  if (loading && visibleProducts.length === 0) {
    return (
      <div className="">
        <div className="md:mx-24">
          <SHeading title="Select 1st Pair" size="lg" nolink={true} />
        </div>
        <div className="md:mx-24">
          <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4">
            {Array.from({ length: 8 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (visibleProducts.length === 0 && !loading && !hasMore) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Filter className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
        <Button onClick={() => loadProducts(0, 12)}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="md:mx-24">
        <SHeading title="Select 1st Pair" size="lg" nolink={true} />
      </div>

      <div className="md:mx-24 mt-4">
        <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4">
          {visibleProducts.map((vehicle) => (
            <ProductCard2
              key={vehicle._id}
              product={vehicle}
              className="w-full"
              noLink={true}
              onClick={() => handleProductClick(vehicle)}
            />
          ))}
        </div>

        {loading && (
          <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4 mt-4">
            {Array.from({ length: 4 }, (_, i) => (
              <ProductCardSkeleton key={`load-${i}`} />
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <div className="text-center mt-8">
            <Button onClick={loadMore} variant="outline" size="sm">
              Load More Products ({visibleProducts.length} loaded)
            </Button>
          </div>
        )}

        {!hasMore && visibleProducts.length > 0 && (
          <div className="text-center py-6 border-t mt-6">
            <p className="text-muted-foreground text-sm">
              🎉 All {visibleProducts.length} products loaded!
            </p>
          </div>
        )}
      </div>

      {renderBogoPage(bogoProducts)}
      {renderSizeModal(bogoProducts)}
      {renderCheckoutLoading()}
    </div>
  );
}

export default React.memo(ProductList);