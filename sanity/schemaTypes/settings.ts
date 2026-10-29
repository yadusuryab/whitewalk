export const settings = {
  name: "settings",
  title: "Site Settings",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Settings Label",
      type: "string",
      initialValue: "Global Settings",
      readOnly: true,
    },
    {
      name: "freeSocksOffer",
      title: "Free Socks Offer",
      type: "boolean",
      initialValue: false,
      description: "Enable/disable free socks offer site-wide",
    },
    {
      name: "shoeCleanerAddon",
      title: "Shoe Cleaner Addon",
      type: "boolean",
      initialValue: false,
      description: "Enable/disable shoe cleaner addon site-wide",
    },
    {
      name: "upiId",
      title: "UPI ID",
      type: "string",
      description: "Payee UPI ID shown at checkout (e.g. name@bank)",
      validation: (Rule: any) =>
        Rule.regex(/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/, { name: "upi" }).warning(
          "Format: name@bank",
        ),
    },
  ],
};