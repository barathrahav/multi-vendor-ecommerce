import { prisma } from "../../config/prisma";

export const createCategoryService = async (name: string) => {
  return prisma.category.create({
    data: { name },
  });
};

export const getCategoriesService = async () => {
  return prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const updateCategoryService = async (
  id: string,
  name: string
) => {
  return prisma.category.update({
    where: { id },
    data: { name },
  });
};

export const deleteCategoryService = async (id: string) => {
  await prisma.category.delete({
    where: { id },
  });

  return "Category deleted successfully";
};