"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import ProductVideo from "./product-video";

export interface Product {
  _id: string;
  productName: string;
  price: number;
  isOffer?: boolean;
  offerPrice?: number;
  buyOneGetOne?: boolean;
  imageUrl?: string;
  productLabel?: string[];
  hasVideo?: boolean;
  videoUrl?: string | null;
  videoPoster?: string | null;
}

interface ProductCardProps {
  product: any;
  className?: string;
  variant?: "grid";
  noLink?: boolean;
  onClick?: () => void;
}

const LABEL_STYLES: Record<string, string> = {
  trending: "bg-orange-500 text-white",
  "new-arrival": "bg-blue-500 text-white",
  "best-seller": "bg-purple-500 text-white",
  "limited-edition": "bg-black text-white",
  sale: "bg-red-500 text-white",
};

const LABEL_TITLES: Record<string, string> = {
  trending: "Trending",
  "new-arrival": "New Arrival",
  "best-seller": "Best Seller",
  "limited-edition": "Limited Edition",
  sale: "Sale",
};

export default function ProductCard2({
  product,
  className = "",
  noLink = true,
  onClick,
}: ProductCardProps) {
  const {
    productName,
    imageUrl,
    productLabel,
    hasVideo,
    videoUrl,
    videoPoster,
  } = product;

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      onClick={onClick}
      className={`rounded-md cursor-pointer ${className}`}
    >
      {/* Image container — keeps overflow-hidden square */}
      <div className="aspect-square relative bg-gray-100 rounded-md overflow-hidden">
        {/* Product label badge(s) */}
        {productLabel && productLabel.length > 0 && (
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {productLabel.slice(0, 2).map((label: string) => (
              <span
                key={label}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  LABEL_STYLES[label] || "bg-gray-800 text-white"
                }`}
              >
                {LABEL_TITLES[label] || label}
              </span>
            ))}
          </div>
        )}

        {/* Video indicator badge */}
        {hasVideo && videoUrl && (
        <ProductVideo
          src={videoUrl}
          poster={videoPoster}
          className="mt-2 text-xs absolute bottom-2 right-2 z-10"
        />
      )}

        {!imageError ? (
          <>
            <Image
              src={imageUrl || "/placeholder-image.jpg"}
              alt={productName || "Product image"}
              width={280}
              height={280}
              quality={45}
              priority={false}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 23vw, 280px"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R"
            />

            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Image not available</span>
          </div>
        )}
      </div>

      {/* Video player — rendered OUTSIDE the overflow-hidden square so it isn't clipped */}
      
    </div>
  );
}