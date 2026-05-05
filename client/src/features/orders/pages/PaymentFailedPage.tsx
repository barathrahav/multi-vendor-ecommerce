import { Link, useSearchParams } from "react-router-dom";

const PaymentFailedPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-[2rem] border border-red-100 bg-[linear-gradient(135deg,#fef2f2,#ffffff_48%,#fff7ed)] p-10 text-center shadow-sm dark:border-rose-700 dark:bg-slate-950/95 dark:bg-[linear-gradient(135deg,#111827,#0a1220_48%,#111827)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-2xl font-black text-red-700 shadow-inner dark:bg-rose-900/20 dark:text-rose-200">
          !
        </div>

        <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900 dark:text-white">
          Payment Failed
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-600 dark:text-slate-300">
          We could not confirm your payment. Your order is still available in
          your orders page with pending payment status.
        </p>

        {orderId && (
          <p className="mt-4 text-sm font-medium text-gray-700 dark:text-slate-200">
            Order #{orderId.slice(0, 8)}
          </p>
        )}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/orders"
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200/10 transition duration-200 hover:bg-slate-900 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          >
            View Orders
          </Link>
          <Link
            to="/"
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
