import { type SchemaTypeDefinition } from 'sanity'

const shoe = {
  name: "shoe",
  title: "Shoes",
  type: "document",
  fields: [
    {
      name: "orderNumber",
      title: "Order Number",
      type: "number",
      description: "Number to control the display order of products (lower numbers appear first)",
      validation: (Rule: any) => Rule.required().integer().min(0),
    },
    { name: "productName", title: "Shoe Name", type: "string" },
    { name: "shoeBrand", title: "Shoe Brand", type: "string" },
    {
      name: "category",
      title: "Shoe Category",
      type: "string",
      options: {
        list: [
          { title: "Sneakers", value: "sneakers" },
          { title: "Boots", value: "boots" },
          { title: "Sandals", value: "sandals" },
          { title: "Loafers", value: "loafers" },
          { title: "Sports Shoes", value: "sports-shoes" },
          { title: "Formal Shoes", value: "formal-shoes" },
        ],
      },
    },
    {
      name: "sizes",
      title: "Available Sizes",
      type: "array",
      of: [{ type: "number" }],
      options: { list: [6, 7, 8, 9, 10] },
      initialValue: [6, 7, 8, 9, 10],
    },
    {
      name: "disabledSizes",
      title: "Disabled Sizes",
      type: "array",
      of: [{ type: "number" }],
      options: { list: [6, 7, 8, 9, 10] },
      description: "Sizes shown but not selectable",
      initialValue: [],
    },
    { name: "colorVariants", title: "Color Variants", type: "array", of: [{ type: "string" }] },
    {
      name: "productLabel",
      title: "Product Label",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Trending", value: "trending" },
          { title: "New Arrival", value: "new-arrival" },
          { title: "Best Seller", value: "best-seller" },
          { title: "Limited Edition", value: "limited-edition" },
          { title: "Sale", value: "sale" },
        ],
        layout: "list",
      },
    },
    {
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    },
    {
      name: "images",
      title: "Upload Images",
      type: "array",
      of: [{ type: "image" }],
      options: { layout: "grid" },
    },
    { name: "description", title: "Description", type: "text" },
    { name: "madeIn", title: "Country of Origin", type: "string" },
    { name: "price", title: "Price", type: "number" },
    { name: "isOffer", title: "Is on Offer?", type: "boolean" },
    {
      name: "offerPrice",
      title: "Offer Price",
      type: "number",
      hidden: ({ document }: any) => !document?.isOffer,
    },
    {
      name: "offer1Pair",
      title: "Offer: 1 Pair (single)",
      type: "boolean",
      description: "Show in normal single-pair shopping",
      initialValue: true,
    },
    {
      name: "offer2Pair",
      title: "Offer: 2 Pair",
      type: "boolean",
      description: "Show on /offer (2 pairs, 1499, free shipping)",
      initialValue: false,
    },
    {
      name: "offer3Pair",
      title: "Offer: 3 Pair",
      type: "boolean",
      description: "Show on /offer?pairs=3 (3 pairs, 1800)",
      initialValue: false,
    },
    {
      name: "buyOneGetOne",
      title: "Buy 1 Get 1 Free? (old)",
      type: "boolean",
      description: "Old flag. Used only when none of the Offer toggles above have been set (counts as 2 pair). Prefer the Offer toggles.",
    },
    { name: "stock", title: "Stock Availability", type: "number" },
    {
      name: "isDisabled",
      title: "Disable Product",
      type: "boolean",
      description: "When enabled, this product will be hidden from the website",
      initialValue: false,
    },
    {
      name: "disableReason",
      title: "Reason for Disabling",
      type: "string",
      description: "Optional: Enter the reason why this product is disabled",
      hidden: ({ document }: any) => !document?.isDisabled,
      options: {
        list: [
          { title: "Out of Stock", value: "out-of-stock" },
          { title: "Seasonal", value: "seasonal" },
          { title: "Discontinued", value: "discontinued" },
          { title: "Quality Issues", value: "quality-issues" },
          { title: "Other", value: "other" },
        ],
      },
    },
  ],

  orderings: [
    { title: 'Order Number, Asc', name: 'orderNumberAsc', by: [{ field: 'orderNumber', direction: 'asc' }] },
    {
      title: 'Disabled Products First',
      name: 'disabledFirst',
      by: [
        { field: 'isDisabled', direction: 'desc' },
        { field: 'orderNumber', direction: 'asc' },
      ],
    },
  ],
}

const review = {
  name: "review",
  title: "Reviews",
  type: "document",
  fields: [
    { name: "customerName", title: "Customer Name", type: "string", validation: (Rule: any) => Rule.required() },
    { name: "shoe", title: "Shoe", type: "reference", to: [{ type: "shoe" }] },
    { name: "rating", title: "Rating", type: "number", options: { list: [1, 2, 3, 4, 5] }, validation: (Rule: any) => Rule.required().min(1).max(5) },
    { name: "reviewText", title: "Review Text", type: "text" },
    { name: "reviewImages", title: "Review Images", type: "array", of: [{ type: "image" }] },
    { name: "isVerifiedPurchase", title: "Verified Purchase?", type: "boolean", initialValue: false },
    { name: "isApproved", title: "Approved for Display?", type: "boolean", initialValue: false },
    { name: "createdAt", title: "Date", type: "datetime", initialValue: () => new Date().toISOString() },
  ],
  orderings: [
    { title: "Newest First", name: "createdAtDesc", by: [{ field: "createdAt", direction: "desc" }] },
  ],
}

const banner = {
  name: "banner",
  title: "Banner",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string" },
    { name: "subtitle", title: "Subtitle", type: "string" },
    { name: "image", title: "Banner Image", type: "image" },
    { name: "mobileImage", title: "Mobile Banner Image", type: "image" },
    { name: "link", title: "Redirect Link", type: "string" },
    { name: "orderNumber", title: "Display Order", type: "number", validation: (Rule: any) => Rule.required().integer().min(0) },
    { name: "isActive", title: "Active?", type: "boolean", initialValue: true },
  ],
  orderings: [
    { title: "Order Number, Asc", name: "orderNumberAsc", by: [{ field: "orderNumber", direction: "asc" }] },
  ],
}

const settings = {
  name: "settings",
  title: "Site Settings",
  type: "document",
  fields: [
    { name: "title", title: "Settings Label", type: "string", initialValue: "Global Settings", readOnly: true },
    { name: "freeSocksOffer", title: "Free Socks Offer", type: "boolean", initialValue: false, description: "Enable/disable free socks offer site-wide" },
    { name: "shoeCleanerAddon", title: "Shoe Cleaner Addon", type: "boolean", initialValue: false, description: "Enable/disable shoe cleaner addon site-wide" },
  ],
}

const orderItem = {
  name: "orderItem",
  title: "Order Item",
  type: "object",
  fields: [
    { name: "product", title: "Product", type: "reference", to: [{ type: "shoe" }] },
    { name: "productName", title: "Product Name", type: "string" },
    { name: "imageUrl", title: "Product Image", type: "image" },

    { name: "size", title: "Size", type: "number" },
    { name: "price", title: "Price", type: "number" },
    { name: "isFreeItem", title: "Free Item (BOGO)?", type: "boolean", initialValue: false },
  ],
  preview: {
    select: { title: "productName", size: "size", media: "imageUrl" },
    prepare({ title, size, media }: any) {
      return { title, subtitle: `UK ${size}`, media }
    },
  },
}

const order = {
  name: "order",
  title: "Orders",
  type: "document",
  fields: [
    {
      name: "orderId",
      title: "Order ID",
      type: "string",
      description: "Internal receipt / order reference",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "pairCount",
      title: "Pairs in Offer",
      type: "number",
      options: { list: [2, 3] },
      initialValue: 2,
    },
    { name: "items", title: "Items", type: "array", of: [{ type: "orderItem" }] },

    { name: "customerName", title: "Customer Name", type: "string" },
    { name: "instagramId", title: "Instagram ID", type: "string" },
    { name: "contact1", title: "Contact No. 1", type: "string" },
    { name: "contact2", title: "Contact No. 2", type: "string" },
    { name: "address", title: "Address", type: "text" },
    { name: "district", title: "District", type: "string" },
    { name: "state", title: "State", type: "string" },
    { name: "pincode", title: "Pincode", type: "string" },
    { name: "landmark", title: "Landmark", type: "string" },

    {
      name: "shippingMethod",
      title: "Shipping Method",
      type: "string",
      options: { list: [{ title: "Online (Prepaid)", value: "online" }, { title: "Cash on Delivery", value: "cod" }] },
    },
    { name: "shoeCleanerAddon", title: "Shoe Cleaner Addon", type: "boolean", initialValue: false },
    { name: "freeSocksOffer", title: "Free Socks Offer Applied", type: "boolean", initialValue: false },

    { name: "subtotal", title: "Subtotal", type: "number" },
    { name: "shippingCharge", title: "Shipping Charge", type: "number" },
    { name: "totalAmount", title: "Total Amount", type: "number" },
    { name: "advancePaid", title: "Amount Paid Now", type: "number", description: "Prepaid: full total. COD: advance." },
    { name: "remainingAmount", title: "Collect on Delivery", type: "number" },
    { name: "expectedDeliveryLabel", title: "Expected Delivery", type: "string" },

    // ---- Manual UPI payment ----
    {
      name: "paymentMethod",
      title: "Payment Method",
      type: "string",
      options: { list: [{ title: "Manual UPI", value: "manual_upi" }, { title: "Razorpay (old)", value: "razorpay" }] },
    },
    {
      name: "paymentScreenshot",
      title: "Payment Screenshot",
      type: "image",
      description: "Uploaded by customer. Check against your bank app.",
    },
    { name: "utr", title: "UPI Reference / UTR", type: "string" },

    // ---- Legacy Razorpay (kept for old orders) ----
    { name: "razorpayOrderId", title: "Razorpay Order ID", type: "string", readOnly: true },
    { name: "razorpayPaymentId", title: "Razorpay Payment ID", type: "string", readOnly: true },

    {
      name: "paymentStatus",
      title: "Payment Status",
      type: "string",
      options: {
        list: [
          { title: "Awaiting Verification", value: "verifying" },
          { title: "Paid", value: "paid" },
          { title: "Pending", value: "pending" },
          { title: "Rejected", value: "rejected" },
          { title: "Failed", value: "failed" },
          { title: "Refunded", value: "refunded" },
        ],
      },
      initialValue: "verifying",
    },

    {
      name: "fulfillmentStatus",
      title: "Fulfillment Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Processing", value: "processing" },
          { title: "Shipped", value: "shipped" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "pending",
    },

    { name: "createdAt", title: "Order Date", type: "datetime", initialValue: () => new Date().toISOString() },
  ],
  orderings: [
    { title: "Newest First", name: "createdAtDesc", by: [{ field: "createdAt", direction: "desc" }] },
    {
      title: "Awaiting Verification First",
      name: "verifyingFirst",
      by: [
        { field: "paymentStatus", direction: "asc" },
        { field: "createdAt", direction: "desc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "orderId",
      subtitle: "customerName",
      amount: "advancePaid",
      status: "paymentStatus",
      media: "paymentScreenshot",
    },
    prepare({ title, subtitle, amount, status, media }: any) {
      return {
        title: `Order ${title}`,
        subtitle: `${subtitle} • ₹${amount ?? "-"} • ${status ?? ""}`,
        media,
      }
    },
  },
}

export const schemaTypes: SchemaTypeDefinition[] = [shoe, review, banner, settings, orderItem, order]

export const schema: { types: SchemaTypeDefinition[] } = {
  types: schemaTypes,
}