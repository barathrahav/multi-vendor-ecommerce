import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApolloClient, useMutation } from "@apollo/client/react";

import Navbar from "../../../components/layout/Navbar";
import { LOGIN_MUTATION } from "../graphql/auth.mutations";
import { ME_QUERY } from "../graphql/auth.queries";
import type { LoginResponse, LoginVariables } from "../types/auth.types";
import { Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const apolloClient = useApolloClient();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [login, { loading }] = useMutation<LoginResponse, LoginVariables>(
    LOGIN_MUTATION,
    {
      onCompleted: async (data) => {
        localStorage.setItem("token", data.login.token);

        await apolloClient.clearStore();
        apolloClient.writeQuery({
          query: ME_QUERY,
          data: {
            me: data.login.user,
          },
        });

        if (data.login.user.role === "VENDOR") {
          navigate("/vendor");
          return;
        }

        if (data.login.user.role === "ADMIN") {
          navigate("/admin");
          return;
        }

        navigate("/");
      },
    },
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await login({
      variables: form,
    });
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10 md:py-16">
        <div className="grid overflow-hidden rounded-[2rem] border bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
          <section className="bg-[linear-gradient(145deg,#111827,#1f2937_55%,#374151)] p-8 text-white md:p-12">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-gray-300">
              Welcome Back
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-black tracking-tight md:text-5xl">
              Sign in and continue where you left off.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-gray-300">
              Access your cart, orders, and dashboard tools with a cleaner login
              flow designed to get you back into the app quickly.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-gray-300">Customer Access</p>
                <p className="mt-2 text-lg font-semibold">
                  Cart and orders in sync
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-gray-300">Role-based Redirect</p>
                <p className="mt-2 text-lg font-semibold">
                  Admin and vendor ready
                </p>
              </div>
            </div>
          </section>

          <section className="p-8 md:p-12">
            <div className="mx-auto max-w-md">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
                Account Login
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-900">
                Sign in to your account
              </h2>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                Enter your email and password to access your shopping flow or
                dashboard.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    className="w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none transition focus:border-black focus:bg-white"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="password"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={form.password}
                      className="w-full rounded-2xl border bg-gray-50 px-4 py-3 pr-12 outline-none transition focus:border-black focus:bg-white"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          password: e.target.value,
                        })
                      }
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-black p-4 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <p className="mt-6 text-sm text-gray-500">
                New here?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-gray-900 underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
