import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma";

export const getUsersService = async () => {
  return prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const createUserService = async (
  name: string,
  email: string,
  password: string,
  phone: string | undefined,
  role: "ADMIN" | "VENDOR" | "CUSTOMER"
) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      password: hashedPassword,
      role,
    },
  });
};

export const updateUserService = async (
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    role?: "ADMIN" | "VENDOR" | "CUSTOMER";
  }
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  if (data.email && data.email !== existingUser.email) {
    const emailOwner = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (emailOwner) {
      throw new Error("Email already in use");
    }
  }

  return prisma.user.update({
    where: { id },
    data,
  });
};

export const updateProfileService = async (
  id: string,
  data: {
    name: string;
    email: string;
    phone?: string | null;
  }
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  if (data.email !== existingUser.email) {
    const emailOwner = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (emailOwner) {
      throw new Error("Email already in use");
    }
  }

  return prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
    },
  });
};

export const updateUserPasswordService = async (
  id: string,
  newPassword: string
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  return prisma.user.update({
    where: { id },
    data: {
      password: hashedPassword,
    },
  });
};

export const deleteUserService = async (id: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
    include: {
      products: true,
      orders: true,
      cart: true,
    },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  if (existingUser.products.length > 0) {
    throw new Error("Cannot delete a user who still owns products");
  }

  if (existingUser.orders.length > 0) {
    throw new Error("Cannot delete a user who still has orders");
  }

  if (existingUser.cart) {
    await prisma.cartItem.deleteMany({
      where: {
        cartId: existingUser.cart.id,
      },
    });

    await prisma.cart.delete({
      where: {
        id: existingUser.cart.id,
      },
    });
  }

  await prisma.user.delete({
    where: { id },
  });

  return "User deleted successfully";
};
