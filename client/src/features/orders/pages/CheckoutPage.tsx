import { useApolloClient, useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Skeleton from "../../../components/common/Skeleton";
import {
  CREATE_PAYMENT_ORDER,
  MARK_PAYMENT_FAILED,
  VERIFY_PAYMENT,
} from "../graphql/payment.mutations";
import { PLACE_ORDER } from "../graphql/order.mutations";
import type {
  CreatePaymentOrderResponse,
  CreatePaymentOrderVariables,
} from "../types/payment.types";
import type { PlaceOrderResponse } from "../types/order.types";
import { reportError } from "../../../lib/errors";
import { clearCartCache } from "../../cart/utils/cartCache";

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayFailureResponse {
  error?: {
    description?: string;
    reason?: string;
  };
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => Promise<void>;
  modal: {
    ondismiss: () => Promise<void>;
  };
}

interface RazorpayInstance {
  on: (
    event: "payment.failed",
    handler: (response: RazorpayFailureResponse) => Promise<void>
  ) => void;
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const apolloClient = useApolloClient();

  const [createPaymentOrder, { loading }] = useMutation<
    CreatePaymentOrderResponse,
    CreatePaymentOrderVariables
  >(CREATE_PAYMENT_ORDER);

  const [placeOrder] = useMutation<PlaceOrderResponse>(PLACE_ORDER);
  const [verifyPayment] = useMutation(VERIFY_PAYMENT);
  const [markPaymentFailed] = useMutation(MARK_PAYMENT_FAILED);

  const goToPaymentFailed = async (orderId: string, reason?: string) => {
    try {
      await markPaymentFailed({
        variables: {
          orderId,
          reason,
        },
      });
    } catch (error) {
      console.error(error);
    }

    localStorage.removeItem("latestOrderId");
    navigate(`/payment-failed?orderId=${orderId}`);
  };

  const handleCheckout = async () => {
    const toastId = toast.loading("Preparing your checkout...");

    try {
      const orderRes = await placeOrder();
      const orderId = orderRes.data?.placeOrder.id;

      if (!orderId) {
        toast.error("Failed to create order", { id: toastId });
        return;
      }

      localStorage.setItem("latestOrderId", orderId);
      clearCartCache(apolloClient.cache);

      const { data } = await createPaymentOrder({
        variables: { orderId },
      });

      if (!data) {
        toast.error("Failed to create payment order", { id: toastId });
        return;
      }

      const { razorpayOrderId, amount } = data.createPaymentOrder;

      toast.success("Payment gateway ready", { id: toastId });

      const options: RazorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: "INR",
        name: "E-Commerce",
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: async function (response) {
          const verifyToastId = toast.loading("Verifying payment...");
          const latestOrderId = localStorage.getItem("latestOrderId");

          try {
            if (!latestOrderId) {
              toast.error("Order not found", { id: verifyToastId });
              return;
            }

            await verifyPayment({
              variables: {
                orderId: latestOrderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            });

            localStorage.removeItem("latestOrderId");
            toast.success("Payment verified successfully", { id: verifyToastId });
            navigate("/success");
          } catch (verifyError) {
            toast.error(reportError(verifyError, "Payment verification failed"), {
              id: verifyToastId,
            });
            await goToPaymentFailed(latestOrderId || orderId, "Verification failed");
          }
        },
        modal: {
          ondismiss: async function () {
            const latestOrderId = localStorage.getItem("latestOrderId");

            if (latestOrderId) {
              await goToPaymentFailed(latestOrderId, "Payment window closed");
            }
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async function (response) {
        const latestOrderId = localStorage.getItem("latestOrderId") || orderId;
        const reason =
          response?.error?.description ||
          response?.error?.reason ||
          "Payment failed";

        await goToPaymentFailed(latestOrderId, reason);
      });
      rzp.open();
    } catch (checkoutError) {
      toast.error(reportError(checkoutError, "Checkout could not be completed"), {
        id: toastId,
      });
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <Skeleton className="h-52 w-full rounded-[2rem]" />
        <Skeleton className="h-80 w-full rounded-[1.5rem]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#faf5ff,#ffffff_45%,#f0fdf4)] p-8 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:bg-[linear-gradient(135deg,#020617,#0b1220_45%,#111827)]">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Checkout
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Complete your order with a secure payment flow.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
          We will create your order first, open the payment gateway, and verify
          everything before confirming your purchase.
        </p>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/95">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-sm text-slate-500 dark:text-slate-400">Step 1</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Create Order</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-sm text-slate-500 dark:text-slate-400">Step 2</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Open Payment</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-sm text-slate-500 dark:text-slate-400">Step 3</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Verify & Confirm</p>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          className="mt-8 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-200/10 transition duration-200 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          disabled={loading}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </section>
    </div>
  );
};

export default CheckoutPage;
