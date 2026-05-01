import { gql } from "graphql-tag";
import { authTypeDefs } from "./auth.schema";
import { categoryTypeDefs } from "./category.schema";
import { productTypeDefs } from "./product.schema";
import { cartTypeDefs } from "./cart.schema";
import { orderTypeDefs } from "./order.schema";
import { paymentTypeDefs } from "./payment.schema";
import { userTypeDefs } from "./user.schema";
import { notificationTypeDefs } from "./notification.schema";
import { wishlistTypeDefs } from "./wishlist.schema";
import { analyticsTypeDefs } from "./analytics.schema";

const baseTypeDefs = gql`
  enum Role {
    ADMIN
    VENDOR
    CUSTOMER
  }

  type User {
    id: ID!
    name: String!
    email: String!
    phone: String
    role: Role!
  }

  type Query {
    hello: String!
  }

  extend type Query {
    me: User
  }

  type Mutation
`;

export const typeDefs = [
  baseTypeDefs,
  authTypeDefs,
  categoryTypeDefs,
  productTypeDefs,
  cartTypeDefs,
  orderTypeDefs,
  paymentTypeDefs,
  userTypeDefs,
  notificationTypeDefs,
  wishlistTypeDefs,
  analyticsTypeDefs,
];

