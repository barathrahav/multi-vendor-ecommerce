import {
  CheckCircle2,
  Clock3,
  CreditCard,
  PackageCheck,
  Truck,
  XCircle,
} from "lucide-react";

type Status = {
  status: string;
  createdAt: string;
};

const steps = [
  {
    key: "PENDING_PAYMENT",
    label: "Placed",
    description: "Order created",
    Icon: PackageCheck,
  },
  {
    key: "PAID",
    label: "Paid",
    description: "Payment confirmed",
    Icon: CreditCard,
  },
  {
    key: "SHIPPED",
    label: "Shipped",
    description: "On the way",
    Icon: Truck,
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    description: "Completed",
    Icon: CheckCircle2,
  },
];

const getStatusMeta = (status: string) => {
  switch (status) {
    case "PENDING_PAYMENT":
      return {
        label: "Pending payment",
        className: "bg-amber-50 text-amber-700 ring-amber-200",
      };
    case "PAID":
      return {
        label: "Paid",
        className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      };
    case "SHIPPED":
      return {
        label: "Shipped",
        className: "bg-sky-50 text-sky-700 ring-sky-200",
      };
    case "DELIVERED":
      return {
        label: "Delivered",
        className: "bg-violet-50 text-violet-700 ring-violet-200",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        className: "bg-red-50 text-red-700 ring-red-200",
      };
    default:
      return {
        label: "Processing",
        className: "bg-gray-100 text-gray-700 ring-gray-200",
      };
  }
};

const formatDate = (date: string) =>
  new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const OrderTimeline = ({
  history,
  currentStatus,
}: {
  history: Status[];
  currentStatus: string;
}) => {
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const isCancelled = currentStatus === "CANCELLED";
  const currentStepIndex = steps.findIndex((step) => step.key === currentStatus);
  const safeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;
  const progressPercentage = isCancelled
    ? 100
    : (safeIndex / (steps.length - 1)) * 100;
  const statusMeta = getStatusMeta(currentStatus);

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Fulfillment timeline
          </p>
          <h3 className="mt-1 text-lg font-bold text-gray-900">
            {statusMeta.label}
          </h3>
        </div>

        <span
          className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusMeta.className}`}
        >
          {statusMeta.label}
        </span>
      </div>

      <div className="p-5">
        <div className="relative">
          <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-gray-200" />
          <div
            className={`absolute left-0 top-5 h-1 rounded-full transition-all duration-500 ${
              isCancelled ? "bg-red-500" : "bg-emerald-500"
            }`}
            style={{ width: `${progressPercentage}%` }}
          />

          <div className="relative grid grid-cols-4 gap-2">
            {steps.map((step, index) => {
              const Icon = step.Icon;
              const completed = !isCancelled && index <= safeIndex;
              const active = !isCancelled && index === safeIndex;
              const stepData = sortedHistory.find(
                (item) => item.status === step.key
              );

              return (
                <div key={step.key} className="flex flex-col items-center">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full border-4 border-white shadow-sm transition ${
                      completed
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    } ${active ? "ring-4 ring-emerald-100" : ""}`}
                  >
                    <Icon size={19} />
                  </div>
                  <p className="mt-3 text-center text-xs font-bold text-gray-900">
                    {step.label}
                  </p>
                  <p className="mt-1 text-center text-[11px] text-gray-500">
                    {step.description}
                  </p>
                  {stepData && (
                    <p className="mt-1 text-center text-[10px] text-gray-400">
                      {formatDate(stepData.createdAt)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {isCancelled && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-red-700">
            <XCircle className="mt-0.5 shrink-0" size={19} />
            <div>
              <p className="text-sm font-semibold">Order cancelled</p>
              <p className="mt-1 text-xs leading-5">
                This order is no longer moving through fulfillment. Refund
                updates will appear in notifications when applicable.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-xl border bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-900">Status history</p>
          <div className="mt-4 space-y-3">
            {sortedHistory.map((item) => (
              <div key={`${item.status}-${item.createdAt}`} className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-gray-600 ring-1 ring-gray-200">
                  <Clock3 size={15} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {getStatusMeta(item.status).label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTimeline;
