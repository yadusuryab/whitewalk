export const review = {
  name: "review",
  title: "Reviews",
  type: "document",
  fields: [
    { name: "customerName", title: "Customer Name", type: "string", validation: (Rule: any) => Rule.required() },
    { name: "shoe", title: "Shoe", type: "reference", to: [{ type: "shoe" }] },
    {
      name: "rating",
      title: "Rating",
      type: "number",
      options: { list: [1, 2, 3, 4, 5] },
      validation: (Rule: any) => Rule.required().min(1).max(5),
    },
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