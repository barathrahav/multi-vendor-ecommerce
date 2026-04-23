import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Loader from "../../../components/common/Loader";
import { CREATE_PAYMENT_ORDER, VERIFY_PAYMENT } from "../graphql/payment.mutations";
import { PLACE_ORDER } from "../graphql/order.mutations";
import type {
  CreatePaymentOrderResponse,
  CreatePaymentOrderVariables,
} from "../types/payment.types";
import type { PlaceOrderResponse } from "../types/order.types";

const CheckoutPage = () => {
  const navigate = useNavigate();

  const [createPaymentOrder, { loading }] = useMutation<
    CreatePaymentOrderResponse,
    CreatePaymentOrderVariables
  >(CREATE_PAYMENT_ORDER);

  const [placeOrder] = useMutation<PlaceOrderResponse>(PLACE_ORDER);
  const [verifyPayment] = useMutation(VERIFY_PAYMENT);

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

      const { data } = await createPaymentOrder({
        variables: { orderId },
      });

      if (!data) {
        toast.error("Failed to create payment order", { id: toastId });
        return;
      }

      const { razorpayOrderId, amount } = data.createPaymentOrder;

      toast.success("Payment gateway ready", { id: toastId });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: "INR",
        name: "E-Commerce",
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          const verifyToastId = toast.loading("Verifying payment...");

          try {
            const latestOrderId = localStorage.getItem("latestOrderId");

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
            console.error(verifyError);
            toast.error("Payment verification failed", { id: verifyToastId });
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (checkoutError) {
      console.error(checkoutError);
      toast.error("Checkout could not be completed", { id: toastId });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section className="rounded-[2rem] border bg-[linear-gradient(135deg,#faf5ff,#ffffff_45%,#f0fdf4)] p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
          Checkout
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900">
          Complete your order with a secure payment flow.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
          We will create your order first, open the payment gateway, and verify
          everything before confirming your purchase.
        </p>
      </section>

      <section className="rounded-[1.5rem] border bg-white p-8 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Step 1</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">Create Order</p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Step 2</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">Open Payment</p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Step 3</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">Verify & Confirm</p>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          className="mt-8 w-full rounded-2xl bg-black px-5 py-4 text-sm font-semibold text-white transition hover:bg-gray-800"
          disabled={loading}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </section>
    </div>
  );
};

export default CheckoutPage;
