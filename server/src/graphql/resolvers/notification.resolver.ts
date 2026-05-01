import {
  getMyNotificationsService,
  getUnreadNotificationCountService,
  markAllNotificationsReadService,
  markNotificationReadService,
} from "../../modules/notifications/notification-center.service";
import { authorizeRoles } from "../../utils/authorize";

export const notificationResolvers = {
  Query: {
    myNotifications: async (_: any, __: any, context: any) => {
      authorizeRoles(context.user?.role, ["CUSTOMER", "VENDOR", "ADMIN"]);

      return getMyNotificationsService(context.user.id);
    },

    unreadNotificationCount: async (_: any, __: any, context: any) => {
      authorizeRoles(context.user?.role, ["CUSTOMER", "VENDOR", "ADMIN"]);

      return getUnreadNotificationCountService(context.user.id);
    },
  },

  Mutation: {
    markNotificationRead: async (_: any, args: any, context: any) => {
      authorizeRoles(context.user?.role, ["CUSTOMER", "VENDOR", "ADMIN"]);

      return markNotificationReadService(context.user.id, args.id);
    },

    markAllNotificationsRead: async (_: any, __: any, context: any) => {
      authorizeRoles(context.user?.role, ["CUSTOMER", "VENDOR", "ADMIN"]);

      return markAllNotificationsReadService(context.user.id);
    },
  },
};
