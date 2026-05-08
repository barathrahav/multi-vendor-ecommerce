import { gql } from "graphql-tag";

export const carouselTypeDefs = gql`
  type CarouselSlide {
    id: ID!
    title: String!
    description: String!
    imageUrl: String!
    isActive: Boolean!
    order: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    carouselSlides: [CarouselSlide!]!
  }

  type Mutation {
    createCarouselSlide(
      title: String!
      description: String!
      imageUrl: String!
      order: Int
    ): CarouselSlide!

    updateCarouselSlide(
      id: ID!
      title: String
      description: String
      imageUrl: String
      isActive: Boolean
      order: Int
    ): CarouselSlide!

    deleteCarouselSlide(id: ID!): Boolean!

    reorderCarouselSlides(slides: [CarouselSlideReorderInput!]!): [CarouselSlide!]!
  }

  input CarouselSlideReorderInput {
    id: ID!
    order: Int!
  }
`;
