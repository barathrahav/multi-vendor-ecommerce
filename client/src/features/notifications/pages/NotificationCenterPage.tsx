import { useMutation, useQuery } from "@apollo/client/react";
import toast from "react-hot-toast";

import {
  GET_NOTIFICATIONS,
  GET_UNREAD_NOTIFICATION_COUNT,
} from "../graphql/notification.queries";
import {
  MARK_ALL_NOTIFICATIONS_READ,
  MARK_NOTIFICATION_READ,
} from "../graphql/notification.mutations";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const typeStyles: Record<string, string> = {
  ORDER: "bg-blue-50 text-blue-700",
  ORDER_STATUS: "bg-indigo-50 text-indigo-700",
  PAYMENT: "bg-emerald-50 text-emerald-700",
  REFUND: "bg-amber-50 text-amber-700",
  SECURITY: "bg-red-50 text-red-700",
  ACCOUNT: "bg-gray-100 text-gray-700",
};

const NotificationCenterPage = () => {
  const { data, loading, error } = useQuery<{
    myNotifications: Notification[];
  }>(GET_NOTIFICATIONS, {
    fetchPolicy: "cache-and-network",
  });

  const [markRead] = useMutation(MARK_NOTIFICATION_READ, {
    refetchQueries: [
      { query: GET_NOTIFICATIONS },
      { query: GET_UNREAD_NOTIFICATION_COUNT },
    ],
  });

  const [markAllRead, { loading: isMarkingAll }] = useMutation(
    MARK_ALL_NOTIFICATIONS_READ,
    {
      refetchQueries: [
        { query: GET_NOTIFICATIONS },
        { query: GET_UNREAD_NOTIFICATION_COUNT },
      ],
      onCompleted: () => toast.success("Notifications marked as read"),
    }
  );

  const notifications = data?.myNotifications ?? [];
  const unreadCount = notifications.filter((item) => !item.read).length;

  if (loading) {
    return <p className="text-sm text-gray-500">Loading notifications...</p>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        We could not load notifications right now.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Notification Center
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Account updates
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Order, payment, refund, account, and security updates in one
              place.
            </p>
          </div>

          <button
            type="button"
            disabled={isMarkingAll || unreadCount === 0}
            onClick={() => void markAllRead()}
            className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Mark All Read
          </button>
        </div>
      </section>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-gray-50 p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            No notifications yet
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Your account activity will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() =>
                !notification.read &&
                void markRead({ variables: { id: notification.id } })
              }
              className={`grid w-full gap-3 border-b px-5 py-4 text-left transition last:border-b-0 hover:bg-gray-50 ${
                notification.read ? "bg-white" : "bg-sky-50/50"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  {!notification.read && (
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                  )}
                  <h2 className="font-semibold text-gray-900">
                    {notification.title}
                  </h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      typeStyles[notification.type] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {notification.type.replace("_", " ")}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {dateFormatter.format(new Date(notification.createdAt))}
                </span>
              </div>
              <p className="text-sm leading-6 text-gray-600">
                {notification.message}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationCenterPage;
