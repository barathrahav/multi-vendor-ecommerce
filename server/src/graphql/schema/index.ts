import { gql } from "graphql-tag";
import { authTypeDefs } from "./auth.schema";
import { categoryTypeDefs } from "./category.schema";
import { productTypeDefs } from "./product.schema";
import { cartTypeDefs } from "./cart.schema";
import { orderTypeDefs } from "./order.schema";
import { paymentTypeDefs } from "./payment.schema";

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
];

