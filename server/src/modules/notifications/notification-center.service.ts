import { prisma } from "../../config/prisma";

const formatNotification = (notification: any) => ({
  ...notification,
  createdAt: notification.createdAt.toISOString(),
});

export const getMyNotificationsService = async (userId: string) => {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return notifications.map(formatNotification);
};

export const getUnreadNotificationCountService = async (userId: string) => {
  return prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });
};

export const markNotificationReadService = async (
  userId: string,
  id: string
) => {
  const notification = await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  if (notification.userId !== userId) {
    throw new Error("Notification not found");
  }

  return formatNotification(notification);
};

export const markAllNotificationsReadService = async (userId: string) => {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  return "Notifications marked as read";
};
