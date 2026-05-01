import { gql } from "@apollo/client";

export const GET_NOTIFICATIONS = gql`
  query MyNotifications {
    myNotifications {
      id
      title
      message
      type
      read
      createdAt
    }
  }
`;

export const GET_UNREAD_NOTIFICATION_COUNT = gql`
  query UnreadNotificationCount {
    unreadNotificationCount
  }
`;
