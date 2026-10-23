export const banner = {
  name: "banner",
  title: "Banner",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string" },
    { name: "subtitle", title: "Subtitle", type: "string" },
    { name: "image", title: "Banner Image", type: "image" },
    { name: "mobileImage", title: "Mobile Banner Image", type: "image" },
    { name: "link", title: "Redirect Link", type: "string" },
    {
      name: "orderNumber",
      title: "Display Order",
      type: "number",
      validation: (Rule: any) => Rule.required().integer().min(0),
    },
    { name: "isActive", title: "Active?", type: "boolean", initialValue: true },
  ],
  orderings: [
    { title: "Order Number, Asc", name: "orderNumberAsc", by: [{ field: "orderNumber", direction: "asc" }] },
  ],
}