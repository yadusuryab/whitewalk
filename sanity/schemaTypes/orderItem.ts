export const orderItem = {
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