import { gql } from "@apollo/client";

export const GET_CAROUSEL_SLIDES = gql`
  query CarouselSlides {
    carouselSlides {
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
