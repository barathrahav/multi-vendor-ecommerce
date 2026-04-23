import { Link } from "react-router-dom";

const SuccessPage = () => {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-[2rem] border bg-[linear-gradient(135deg,#ecfdf5,#ffffff_45%,#eff6ff)] p-10 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-3xl">
          OK
        </div>

        <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900">
          Payment Successful
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-600">
          Your order has been placed successfully. You can continue shopping or
          head to your orders page to track the status of your purchase.
        </p>

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

export default SuccessPage;
