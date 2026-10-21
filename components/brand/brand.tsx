import { site } from "@/lib/site-config";
import React from "react";

interface BrandProps {
  small?: boolean;
  className?: string;
}

const Brand: React.FC<BrandProps> = ({ small = false, className = "" }) => {
  // ✅ OPTIMIZED: If SVG, use inline SVG or optimized file
  return (
    <div className={className}>
      {/* If SVG file is already optimized, keep using Image */}
      <img
        src="/logo-web.svg" // ✅ Direct path if SVG
        width={small ? 64 : 110}
        height={small ? 64 : 110}
        alt={site.name}
        className={`object-contain ${small ? "max-w-full" : "max-w-full"}`}
        loading="eager"
      />
    </div>
  );
};

export default Brand;