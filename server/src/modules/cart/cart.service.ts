import { prisma } from "../../config/prisma";

export const getOrCreateCart = async (
    userId: string
) => {
    let cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }

    return cart;
};

export const addToCartService = async (
    userId: string,
    productId: string,
    quantity: number
) => {

    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        throw new Error("Product not found");
    }

    if (product.stock < quantity) {
        throw new Error("Insufficient stock");
    }
    const cart = await getOrCreateCart(userId);

    const existingItem = await prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            productId,
        },
    });

    if (existingItem) {
        await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
                quantity: existingItem.quantity + quantity,
            },
        });
    } else {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity,
            },
        });
    }

    return getOrCreateCart(userId);
};

export const updateCartItemService = async (
    userId: string,
    productId: string,
    quantity: number
) => {
    const cart = await getOrCreateCart(userId);

    const cartItem = await prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            productId,
        },
    });

    if (!cartItem) {
        throw new Error("Cart item not found");
    }

    await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity },
    });

    return getOrCreateCart(userId);
};

export const removeFromCartService = async (
    userId: string,
    productId: string
) => {
    const cart = await getOrCreateCart(userId);

    const cartItem = await prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            productId,
        },
    });

    if (!cartItem) {
        throw new Error("Cart item not found");
    }

    await prisma.cartItem.delete({
        where: { id: cartItem.id },
    });

    return getOrCreateCart(userId);
};

export const clearCartService = async (
    userId: string
) => {
    const cart = await getOrCreateCart(userId);

    await prisma.cartItem.deleteMany({
        where: {
            cartId: cart.id,
        },
    });

    return "Cart cleared successfully";
};