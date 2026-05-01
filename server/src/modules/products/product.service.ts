import { prisma } from "../../config/prisma";
import { cache } from "../../config/cache";

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

export const getProductsService = async (
  filters: any
) => {
  const cacheKey = `products:${JSON.stringify(filters)}`;
  const cached = await cache.get<any>(cacheKey);

  if (cached) {
    return cached;
  }

  const {
    search,
    vendorId,
    categoryId,
    minPrice,
    maxPrice,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = filters;

  const where: any = {};

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (vendorId) {
    where.vendorId = vendorId;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (minPrice || maxPrice) {
    where.price = {};

    if (minPrice) where.price.gte = minPrice;
    if (maxPrice) where.price.lte = maxPrice;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        vendor: true,
        category: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    }),

    prisma.product.count({ where }),
  ]);

  const response = {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };

  await cache.set(cacheKey, response, 60);

  return response;
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
