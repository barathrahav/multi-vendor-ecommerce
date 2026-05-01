import { gql } from "graphql-tag";

export const notificationTypeDefs = gql`
  type Notification {
    id: ID!
    title: String!
    message: String!
    type: String!
    read: Boolean!
    createdAt: String!
  }

  extend type Query {
    myNotifications: [Notification!]!
    unreadNotificationCount: Int!
  }

  extend type Mutation {
    markNotificationRead(id: ID!): Notification!
    markAllNotificationsRead: String!
  }
`;
