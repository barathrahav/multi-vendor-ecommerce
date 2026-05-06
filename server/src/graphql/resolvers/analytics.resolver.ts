import { getBusinessAnalyticsService, getAdvancedAnalyticsService } from "../../modules/analytics/analytics.service";
import { authorizeRoles } from "../../utils/authorize";

export const analyticsResolvers = {
  Query: {
    businessAnalytics: async (_: any, __: any, context: any) => {
      authorizeRoles(context.user?.role, ["ADMIN"]);

      return getBusinessAnalyticsService();
    },

    vendorAnalytics: async (_: any, __: any, context: any) => {
      authorizeRoles(context.user?.role, ["VENDOR"]);

      return getBusinessAnalyticsService(context.user.id);
    },

    advancedAnalytics: async (_: any, args: any, context: any) => {
      authorizeRoles(context.user?.role, ["ADMIN", "VENDOR"]);

      const { period, startDate, endDate } = args;
      const vendorId = context.user?.role === "VENDOR" ? context.user.id : undefined;

      return getAdvancedAnalyticsService(period, startDate, endDate, vendorId);
    },
  },
};
