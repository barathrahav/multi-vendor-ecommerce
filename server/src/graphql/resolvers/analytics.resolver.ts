import { getBusinessAnalyticsService } from "../../modules/analytics/analytics.service";
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
  },
};
