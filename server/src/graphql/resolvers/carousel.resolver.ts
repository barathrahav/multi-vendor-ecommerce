import { GraphQLError } from "graphql";
import { prisma } from "../../config/prisma";
import type { AppContext } from "../../context";

export const carouselResolvers = {
  Query: {
    carouselSlides: async () => {
      try {
        const slides = await prisma.carouselSlide.findMany({
          where: { isActive: true },
          orderBy: { order: "asc" },
        });
        return slides;
      } catch (error) {
        throw new GraphQLError("Failed to fetch carousel slides");
      }
    },
  },

  Mutation: {
    createCarouselSlide: async (
      _parent: unknown,
      {
        title,
        description,
        imageUrl,
        order,
      }: {
        title: string;
        description: string;
        imageUrl: string;
        order?: number;
      },
      context: AppContext
    ) => {
      // Check admin authorization
      if (!context.user || context.user.role !== "ADMIN") {
        throw new GraphQLError("Only admins can create carousel slides", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      try {
        // Get the max order if not provided
        let slideOrder = order;
        if (slideOrder === undefined) {
          const lastSlide = await prisma.carouselSlide.findFirst({
            orderBy: { order: "desc" },
          });
          slideOrder = (lastSlide?.order ?? 0) + 1;
        }

        const slide = await prisma.carouselSlide.create({
          data: {
            title,
            description,
            imageUrl,
            order: slideOrder,
          },
        });
        return slide;
      } catch (error) {
        throw new GraphQLError("Failed to create carousel slide");
      }
    },

    updateCarouselSlide: async (
      _parent: unknown,
      {
        id,
        title,
        description,
        imageUrl,
        isActive,
        order,
      }: {
        id: string;
        title?: string;
        description?: string;
        imageUrl?: string;
        isActive?: boolean;
        order?: number;
      },
      context: AppContext
    ) => {
      // Check admin authorization
      if (!context.user || context.user.role !== "ADMIN") {
        throw new GraphQLError("Only admins can update carousel slides", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      try {
        const slide = await prisma.carouselSlide.update({
          where: { id },
          data: {
            ...(title && { title }),
            ...(description && { description }),
            ...(imageUrl && { imageUrl }),
            ...(isActive !== undefined && { isActive }),
            ...(order !== undefined && { order }),
          },
        });
        return slide;
      } catch (error) {
        throw new GraphQLError("Failed to update carousel slide");
      }
    },

    deleteCarouselSlide: async (
      _parent: unknown,
      { id }: { id: string },
      context: AppContext
    ) => {
      // Check admin authorization
      if (!context.user || context.user.role !== "ADMIN") {
        throw new GraphQLError("Only admins can delete carousel slides", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      try {
        await prisma.carouselSlide.delete({
          where: { id },
        });
        return true;
      } catch (error) {
        throw new GraphQLError("Failed to delete carousel slide");
      }
    },

    reorderCarouselSlides: async (
      _parent: unknown,
      {
        slides,
      }: {
        slides: Array<{ id: string; order: number }>;
      },
      context: AppContext
    ) => {
      // Check admin authorization
      if (!context.user || context.user.role !== "ADMIN") {
        throw new GraphQLError("Only admins can reorder carousel slides", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      try {
        const updatedSlides = await Promise.all(
          slides.map((slide) =>
            prisma.carouselSlide.update({
              where: { id: slide.id },
              data: { order: slide.order },
            })
          )
        );
        return updatedSlides;
      } catch (error) {
        throw new GraphQLError("Failed to reorder carousel slides");
      }
    },
  },
};
