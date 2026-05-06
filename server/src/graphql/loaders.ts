import DataLoader from "dataloader";
import { prisma } from "../config/prisma";

const normalizeResults = <T extends { id: string }>(items: T[], keys: readonly string[]) => {
  const itemsById = new Map(items.map((item) => [item.id, item]));
  return keys.map((key) => itemsById.get(key) || null);
};

export const createLoaders = () => ({
  user: new DataLoader<string, any>(async (ids) => {
    const users = await prisma.user.findMany({
      where: { id: { in: ids as string[] } },
    });
    return normalizeResults(users, ids);
  }),

  product: new DataLoader<string, any>(async (ids) => {
    const products = await prisma.product.findMany({
      where: { id: { in: ids as string[] } },
    });
    return normalizeResults(products, ids);
  }),

  category: new DataLoader<string, any>(async (ids) => {
    const categories = await prisma.category.findMany({
      where: { id: { in: ids as string[] } },
    });
    return normalizeResults(categories, ids);
  }),

  order: new DataLoader<string, any>(async (ids) => {
    const orders = await prisma.order.findMany({
      where: { id: { in: ids as string[] } },
    });
    return normalizeResults(orders, ids);
  }),
});

export type Loaders = ReturnType<typeof createLoaders>;
