import { gql } from "@apollo/client";

export const CREATE_CAROUSEL_SLIDE = gql`
  mutation CreateCarouselSlide(
    $title: String!
    $description: String!
    $imageUrl: String!
    $order: Int
  ) {
    createCarouselSlide(
      title: $title
      description: $description
      imageUrl: $imageUrl
      order: $order
    ) {
      id
      title
      description
      imageUrl
      isActive
      order
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_CAROUSEL_SLIDE = gql`
  mutation UpdateCarouselSlide(
    $id: ID!
    $title: String
    $description: String
    $imageUrl: String
    $isActive: Boolean
    $order: Int
  ) {
    updateCarouselSlide(
      id: $id
      title: $title
      description: $description
      imageUrl: $imageUrl
      isActive: $isActive
      order: $order
    ) {
      id
      title
      description
      imageUrl
      isActive
      order
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_CAROUSEL_SLIDE = gql`
  mutation DeleteCarouselSlide($id: ID!) {
    deleteCarouselSlide(id: $id)
  }
`;

export const REORDER_CAROUSEL_SLIDES = gql`
  mutation ReorderCarouselSlides($slides: [CarouselSlideReorderInput!]!) {
    reorderCarouselSlides(slides: $slides) {
      id
      title
      description
      imageUrl
      isActive
      order
      createdAt
      updatedAt
    }
  }
`;
