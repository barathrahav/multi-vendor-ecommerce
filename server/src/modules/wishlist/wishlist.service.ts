import { prisma } from "../../config/prisma";

const wishlistInclude = {
  product: {
    include: {
      vendor: true,
      category: true,
    },
  },
};

const formatWishlistItem = (item: any) => ({
  ...item,
  createdAt: item.createdAt.toISOString(),
});

export const getMyWishlistService = async (userId: string) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: wishlistInclude,
    orderBy: { createdAt: "desc" },
  });

  return items.map(formatWishlistItem);
};

export const addToWishlistService = async (
  userId: string,
  productId: string
) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const item = await prisma.wishlistItem.upsert({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    update: {},
    create: {
      userId,
      productId,
    },
    include: wishlistInclude,
  });

  return formatWishlistItem(item);
};

export const removeFromWishlistService = async (
  userId: string,
  productId: string
) => {
  await prisma.wishlistItem.deleteMany({
    where: {
      userId,
      productId,
    },
  });

  return "Removed from wishlist";
};
