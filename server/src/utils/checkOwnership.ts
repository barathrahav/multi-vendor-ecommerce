import { prisma } from "../config/prisma";

export const verifyProductOwnership = async (
  productId: string,
  userId: string,
  role: string
) => {
  if (role === "ADMIN") return;

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.vendorId !== userId) {
    throw new Error(
      "You can only manage your own products"
    );
  }
};