import { Link } from "react-router-dom";

const SuccessPage = () => {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-[2rem] border border-green-100 bg-[linear-gradient(135deg,#ecfdf5,#ffffff_45%,#eff6ff)] p-10 text-center shadow-sm dark:border-emerald-700 dark:bg-slate-950/95 dark:bg-[linear-gradient(135deg,#111827,#0a1220_45%,#111827)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-3xl shadow-inner dark:bg-emerald-900/20 dark:text-emerald-200">
          OK
        </div>

        <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900 dark:text-white">
          Payment Successful
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-600 dark:text-slate-300">
          Your order has been placed successfully. You can continue shopping or
          head to your orders page to track the status of your purchase.
        </p>

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

export default SuccessPage;
