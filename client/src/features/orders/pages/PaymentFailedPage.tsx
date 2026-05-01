import { Link, useSearchParams } from "react-router-dom";

const PaymentFailedPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-[2rem] border border-red-100 bg-[linear-gradient(135deg,#fef2f2,#ffffff_48%,#fff7ed)] p-10 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-2xl font-black text-red-700">
          !
        </div>

        <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900">
          Payment Failed
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-600">
          We could not confirm your payment. Your order is still available in
          your orders page with pending payment status.
        </p>

        {orderId && (
          <p className="mt-4 text-sm font-medium text-gray-700">
            Order #{orderId.slice(0, 8)}
          </p>
        )}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/orders"
            className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            View Orders
          </Link>
          <Link
            to="/"
            className="rounded-2xl border px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
