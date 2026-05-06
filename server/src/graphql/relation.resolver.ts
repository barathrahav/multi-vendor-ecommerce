export const relationResolvers = {
  Product: {
    vendor: (parent: any, _: any, context: any) => {
      return parent.vendor || context.loaders.user.load(parent.vendorId);
    },
    category: (parent: any, _: any, context: any) => {
      return parent.category || context.loaders.category.load(parent.categoryId);
    },
  },

  Order: {
    user: (parent: any, _: any, context: any) => {
      return parent.user || context.loaders.user.load(parent.userId);
    },
  },

  OrderItem: {
    product: (parent: any, _: any, context: any) => {
      return parent.product || context.loaders.product.load(parent.productId);
    },
  },

  CartItem: {
    product: (parent: any, _: any, context: any) => {
      return parent.product || context.loaders.product.load(parent.productId);
    },
  },

  WishlistItem: {
    product: (parent: any, _: any, context: any) => {
      return parent.product || context.loaders.product.load(parent.productId);
    },
  },
};
