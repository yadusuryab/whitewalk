// checkout-form.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { AlertCircle, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerDetailsFormProps {
  customerDetails: {
    name: string;
    contact1: string;
    contact2: string;
    address: string;
    district: string;
    state: string;
    instagramId: string;
    pincode: string;
    landmark: string;
  };
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleInputBlur?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  getFieldError?: (field: string) => string | undefined;
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      className="mt-2 flex items-center gap-1 text-xs font-semibold text-red-600 duration-300 animate-in fade-in slide-in-from-top-1"
      role="alert"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

const labelClass = "text-sm font-semibold text-neutral-500";
const base =
  "mt-2 rounded-2xl border-transparent bg-neutral-100 px-4 text-sm font-medium shadow-none transition-all duration-300 placeholder:text-neutral-400 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-0";
const err = "bg-red-50 ring-2 ring-red-400 focus-visible:ring-red-400";
const inputClass = (hasError: boolean) => cn(base, "h-12", hasError && err);

function StateSelect({
  value,
  hasError,
  onSelect,
}: {
  value: string;
  hasError: boolean;
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id="state"
          role="combobox"
          aria-expanded={open}
          aria-invalid={hasError}
          className={cn(
            base,
            "flex h-12 w-full items-center justify-between text-left outline-none",
            !value && "text-neutral-400",
            hasError && err
          )}
        >
          <span className="truncate">{value || "Select your state"}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] rounded-2xl p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search state..." />
          <CommandList>
            <CommandEmpty>No state found.</CommandEmpty>
            <CommandGroup>
              {INDIAN_STATES.map((s) => (
                <CommandItem
                  key={s}
                  value={s}
                  onSelect={() => {
                    onSelect(s);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === s ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {s}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export const CustomerDetailsForm = ({
  customerDetails,
  handleInputChange,
  handleInputBlur,
  getFieldError,
}: CustomerDetailsFormProps) => {
  const errorFor = (field: string) => getFieldError?.(field);

  const handleStateSelect = (value: string) => {
    handleInputChange({
      target: { name: "state", value },
    } as React.ChangeEvent<HTMLInputElement>);
    handleInputBlur?.({
      target: { name: "state", value },
    } as React.FocusEvent<HTMLInputElement>);
  };

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="name" className={labelClass}>
          Full name *
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter your full name"
          value={customerDetails.name}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          aria-invalid={!!errorFor("name")}
          className={inputClass(!!errorFor("name"))}
        />
        <FieldError message={errorFor("name")} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact1" className={labelClass}>
            Primary phone *
          </Label>
          <Input
            id="contact1"
            name="contact1"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            value={customerDetails.contact1}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            aria-invalid={!!errorFor("contact1")}
            className={inputClass(!!errorFor("contact1"))}
          />
          <FieldError message={errorFor("contact1")} />
        </div>
        <div>
          <Label htmlFor="contact2" className={labelClass}>
            Secondary phone
          </Label>
          <Input
            id="contact2"
            name="contact2"
            inputMode="numeric"
            placeholder="Alternative number"
            value={customerDetails.contact2}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            aria-invalid={!!errorFor("contact2")}
            className={inputClass(!!errorFor("contact2"))}
          />
          <FieldError message={errorFor("contact2")} />
        </div>
      </div>

      <div>
        <Label htmlFor="instagramId" className={labelClass}>
          Instagram username
        </Label>
        <Input
          id="instagramId"
          name="instagramId"
          placeholder="@yourusername"
          value={customerDetails.instagramId}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className={inputClass(false)}
        />
      </div>

      <div>
        <Label htmlFor="address" className={labelClass}>
          Complete address *
        </Label>
        <Textarea
          id="address"
          name="address"
          placeholder="House no, building, street, area"
          value={customerDetails.address}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          aria-invalid={!!errorFor("address")}
          className={cn(
            base,
            "min-h-[96px] py-3",
            errorFor("address") && err
          )}
        />
        <FieldError message={errorFor("address")} />
      </div>

      <div>
        <Label htmlFor="landmark" className={labelClass}>
          Landmark
        </Label>
        <Input
          id="landmark"
          name="landmark"
          placeholder="Nearby famous place, shop, or building"
          value={customerDetails.landmark}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className={inputClass(false)}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="district" className={labelClass}>
            District *
          </Label>
          <Input
            id="district"
            name="district"
            placeholder="Your district"
            value={customerDetails.district}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            aria-invalid={!!errorFor("district")}
            className={inputClass(!!errorFor("district"))}
          />
          <FieldError message={errorFor("district")} />
        </div>
        <div>
          <Label htmlFor="state" className={labelClass}>
            State *
          </Label>
          <StateSelect
            value={customerDetails.state}
            hasError={!!errorFor("state")}
            onSelect={handleStateSelect}
          />
          <FieldError message={errorFor("state")} />
        </div>
      </div>

      <div>
        <Label htmlFor="pincode" className={labelClass}>
          Pincode *
        </Label>
        <Input
          id="pincode"
          name="pincode"
          inputMode="numeric"
          placeholder="6-digit pincode"
          value={customerDetails.pincode}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          aria-invalid={!!errorFor("pincode")}
          className={inputClass(!!errorFor("pincode"))}
        />
        <FieldError message={errorFor("pincode")} />
      </div>
    </div>
  );
};