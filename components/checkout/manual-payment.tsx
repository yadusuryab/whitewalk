"use client";

import { useEffect, useMemo, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, ImageUp, X, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { H2 } from "./ui";

export const MAX_SCREENSHOT_MB = 8;

const label = "mb-3 text-sm font-semibold text-neutral-500";

export function ManualPayment({
  amount,
  upiLink,
  upiId,
  isCod,
  remainingAmount,
  file,
  onFileChange,
  utr,
  onUtrChange,
}: {
  amount: number;
  upiLink: string;
  upiId: string;
  isCod: boolean;
  remainingAmount: number;
  file: File | null;
  onFileChange: (f: File | null) => void;
  utr: string;
  onUtrChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Please upload an image screenshot");
      return;
    }
    if (f.size > MAX_SCREENSHOT_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_SCREENSHOT_MB} MB`);
      return;
    }
    onFileChange(f);
  };

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      toast.success("UPI ID copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <H2>Pay ₹{amount}.</H2>
        <p className="mt-3 text-base font-medium text-neutral-500">
          {isCod
            ? `₹${amount} advance now. ₹${remainingAmount} on delivery.`
            : "Scan the QR with any UPI app, then upload the payment screenshot."}
        </p>
      </div>

      {/* QR */}
      <div className="flex flex-col items-center gap-5 rounded-[1.75rem] bg-neutral-100 p-6 duration-500 animate-in fade-in zoom-in-95">
        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <QRCodeSVG value={upiLink} size={200} level="M" />
        </div>
        <p className="text-5xl font-extrabold leading-none tracking-[-0.045em]">
          ₹{amount}
        </p>

        <div className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-4 pr-1.5 text-sm">
          <span className="break-all font-semibold">{upiId}</span>
          <button
            type="button"
            onClick={copyUpi}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-950 text-white transition-all duration-300 hover:bg-blue-600 active:scale-90"
            aria-label="Copy UPI ID"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* On phones, you can't scan your own screen */}
        <a
          href={upiLink}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-extrabold tracking-tight text-white transition-all duration-300 hover:bg-blue-600 active:scale-95 md:hidden"
        >
          <Smartphone className="h-4 w-4" /> Open UPI app
        </a>
      </div>

      {/* Upload */}
      <div>
        <p className={label}>
          Payment screenshot <span className="text-red-500">*</span>
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePick}
        />

        {file && previewUrl ? (
          <div className="flex items-center gap-3 rounded-3xl bg-neutral-100 p-3 duration-300 animate-in fade-in zoom-in-95">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Payment screenshot"
              className="h-20 w-20 rounded-2xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold tracking-tight">
                {file.name}
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-xs font-semibold text-blue-700 underline-offset-4 hover:underline"
              >
                Change
              </button>
            </div>
            <button
              type="button"
              onClick={() => onFileChange(null)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white transition-all duration-300 hover:bg-neutral-200 active:scale-90"
              aria-label="Remove screenshot"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-3xl border-2 border-dashed border-neutral-300 text-neutral-500 transition-all duration-300 hover:border-neutral-950 hover:text-neutral-950 active:scale-[0.99]"
          >
            <ImageUp className="h-6 w-6" />
            <span className="text-sm font-extrabold tracking-tight">
              Upload screenshot
            </span>
          </button>
        )}
      </div>

      {/* UTR */}
      <div>
        <p className={label}>UPI reference / UTR (optional, 12 digits)</p>
        <input
          value={utr}
          onChange={(e) =>
            onUtrChange(e.target.value.replace(/\D/g, "").slice(0, 12))
          }
          inputMode="numeric"
          placeholder="e.g. 412345678901"
          className="h-12 w-full rounded-2xl bg-neutral-100 px-4 text-sm font-medium outline-none transition-all placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-950"
        />
      </div>
    </div>
  );
}