export const order = {
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
      options: {
        list: [
          { title: "Online (Prepaid)", value: "online" },
          { title: "Cash on Delivery", value: "cod" },
        ],
      },
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
      options: {
        list: [
          { title: "Manual UPI", value: "manual_upi" },
          { title: "Razorpay (old)", value: "razorpay" },
        ],
      },
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