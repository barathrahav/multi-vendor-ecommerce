import { prisma } from "../../config/prisma";

export const createProductService = async (
  data: any,
  vendorId: string
) => {
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    throw new Error("Invalid category selected");
  }

  return prisma.product.create({
    data: {
      ...data,
      vendorId,
    },
    include: {
      vendor: true,
      category: true,
    },
  });
};

export const getProductsService = async () => {
  return prisma.product.findMany({
    include: {
      vendor: true,
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getProductByIdService = async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      vendor: true,
      category: true,
    },
  });
};

export const updateProductService = async (
  id: string,
  data: any
) => {
  return prisma.product.update({
    where: { id },
    data,
    include: {
      vendor: true,
      category: true,
    },
  });
};

export const deleteProductService = async (
  id: string
) => {
  await prisma.product.delete({
    where: { id },
  });

  return "Product deleted successfully";
};