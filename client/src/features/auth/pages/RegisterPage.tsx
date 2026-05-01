import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApolloClient, useMutation } from "@apollo/client/react";

import Navbar from "../../../components/layout/Navbar";
import { ME_QUERY } from "../graphql/auth.queries";
import { REGISTER_MUTATION } from "../graphql/auth.mutations";
import type { RegisterResponse, RegisterVariables } from "../types/auth.types";
import { countryCodes, normalizePhone } from "../utils/phone";
import { Eye, EyeOff } from "lucide-react";

const RegisterPage = () => {
  const navigate = useNavigate();
  const apolloClient = useApolloClient();

  const [form, setForm] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [register, { loading }] = useMutation<
    RegisterResponse,
    RegisterVariables
  >(REGISTER_MUTATION, {
    onCompleted: async (data) => {
      localStorage.setItem("token", data.register.token);
      localStorage.setItem("refreshToken", data.register.refreshToken);

      await apolloClient.clearStore();
      apolloClient.writeQuery({
        query: ME_QUERY,
        data: {
          me: data.register.user,
        },
      });

      navigate("/");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Password match validation
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const phone = normalizePhone(form.countryCode, form.phoneNumber);

    try {
      await register({
        variables: {
          name: form.name,
          email: form.email,
          phone,
          password: form.password,
          role: "CUSTOMER",
        },
      });
    } catch (error) {
      console.error(error);
      alert("Registration failed");
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getPasswordStrength = (password: string) => {
    let score = 0;

    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: "Weak", color: "bg-red-500" };
    if (score === 2) return { label: "Medium", color: "bg-yellow-500" };
    return { label: "Strong", color: "bg-green-500" };
  };

  return (
    <div>
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10 md:py-16">
        <div className="grid overflow-hidden rounded-[2rem] border bg-white shadow-sm lg:grid-cols-[0.95fr_1.05fr]">
          <section className="p-8 md:p-12">
            <div className="mx-auto max-w-md">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
                New Account
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-900">
                Create your customer account
              </h1>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                Register once and start shopping, saving orders, and checking
                out with a smoother experience.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="name"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    className="w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none transition focus:border-black focus:bg-white"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

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
                    htmlFor="phone"
                  >
                    Phone for SMS alerts
                  </label>
                  <div className="grid grid-cols-[8.5rem_1fr] gap-3">
                    <select
                      aria-label="Country code"
                      value={form.countryCode}
                      className="rounded-2xl border bg-gray-50 px-3 py-3 text-sm outline-none transition focus:border-black focus:bg-white"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          countryCode: e.target.value,
                        })
                      }
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.code} {country.label}
                        </option>
                      ))}
                    </select>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="9876543210"
                      value={form.phoneNumber}
                      className="min-w-0 rounded-2xl border bg-gray-50 px-4 py-3 outline-none transition focus:border-black focus:bg-white"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          phoneNumber: e.target.value.replace(/[^\d\s-]/g, ""),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      placeholder="Create a secure password"
                      className="w-full rounded-2xl border bg-gray-50 px-4 py-3 pr-12 outline-none focus:border-black focus:bg-white"
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Strength Indicator */}
                  {form.password && (
                    <div className="mt-2">
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            getPasswordStrength(form.password).color
                          }`}
                          style={{
                            width:
                              getPasswordStrength(form.password).label ===
                              "Weak"
                                ? "33%"
                                : getPasswordStrength(form.password).label ===
                                    "Medium"
                                  ? "66%"
                                  : "100%",
                          }}
                        />
                      </div>

                      <p className="text-xs mt-1 text-gray-600">
                        Strength:{" "}
                        <span className="font-medium">
                          {getPasswordStrength(form.password).label}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      placeholder="Re-enter your password"
                      className="w-full rounded-2xl border bg-gray-50 px-4 py-3 pr-12 outline-none focus:border-black focus:bg-white"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          confirmPassword: e.target.value,
                        })
                      }
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>

                  {/* Match validation */}
                  {form.confirmPassword && (
                    <p
                      className={`text-xs ${
                        form.password === form.confirmPassword
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {form.password === form.confirmPassword
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-black p-4 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  {loading ? "Registering..." : "Register"}
                </button>
              </form>

              <p className="mt-6 text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-gray-900 underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </section>

          <section className="bg-[linear-gradient(145deg,#fff7ed,#ffffff_55%,#eff6ff)] p-8 md:p-12">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-gray-500">
              Start Shopping
            </p>
            <h2 className="mt-4 max-w-xl text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
              Build your account in a few quick steps.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-gray-600">
              Once registered, you can browse products faster, save items to
              your cart, place orders, and track your purchase history from one
              place.
            </p>

            <div className="mt-10 space-y-4">
              <div className="rounded-2xl border bg-white/80 p-5 shadow-sm">
                <p className="text-sm text-gray-500">Fast Checkout</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  Save time on future purchases
                </p>
              </div>
              <div className="rounded-2xl border bg-white/80 p-5 shadow-sm">
                <p className="text-sm text-gray-500">Order History</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  Track every order in one place
                </p>
              </div>
              <div className="rounded-2xl border bg-white/80 p-5 shadow-sm">
                <p className="text-sm text-gray-500">Smarter Shopping</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  Search, compare, and buy with a cleaner flow
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
