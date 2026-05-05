import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApolloClient, useMutation } from "@apollo/client/react";

import Navbar from "../../../components/layout/Navbar";
import {
  LOGIN_MUTATION,
  REQUEST_OTP_MUTATION,
  VERIFY_OTP_LOGIN_MUTATION,
} from "../graphql/auth.mutations";
import { ME_QUERY } from "../graphql/auth.queries";
import type { LoginResponse, LoginVariables } from "../types/auth.types";
import { Eye, EyeOff } from "lucide-react";
import { countryCodes, normalizePhone } from "../utils/phone";

const LoginPage = () => {
  const navigate = useNavigate();
  const apolloClient = useApolloClient();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  const [otpForm, setOtpForm] = useState({
    countryCode: "+91",
    phoneNumber: "",
    code: "",
  });
  const [otpSent, setOtpSent] = useState(false);

  const completeLogin = async (data: LoginResponse["login"]) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);

    await apolloClient.clearStore();
    apolloClient.writeQuery({
      query: ME_QUERY,
      data: {
        me: data.user,
      },
    });

    if (data.user.role === "VENDOR") {
      navigate("/vendor");
      return;
    }

    if (data.user.role === "ADMIN") {
      navigate("/admin");
      return;
    }

    navigate("/");
  };

  const [login, { loading }] = useMutation<LoginResponse, LoginVariables>(
    LOGIN_MUTATION,
    {
      onCompleted: async (data) => {
        await completeLogin(data.login);
      },
    },
  );
  const [requestOtp, { loading: isRequestingOtp }] = useMutation<{ requestOtp: string }>(
    REQUEST_OTP_MUTATION,
    {
      onCompleted: (data) => {
        setOtpSent(true);
        alert(data.requestOtp || "OTP sent successfully");
      },
      onError: (error) => {
        alert(error.message || "Failed to send OTP. Please check your phone number and try again.");
      },
    }
  );
  const [verifyOtpLogin, { loading: isVerifyingOtp }] =
    useMutation<{ verifyOtpLogin: LoginResponse["login"] }>(
      VERIFY_OTP_LOGIN_MUTATION,
      {
        onCompleted: async (data) => {
          await completeLogin(data.verifyOtpLogin);
        },
      }
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await login({
      variables: form,
    });
  };

  const handleOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    await requestOtp({
      variables: {
        phone: normalizePhone(otpForm.countryCode, otpForm.phoneNumber),
      },
    });
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    await verifyOtpLogin({
      variables: {
        phone: normalizePhone(otpForm.countryCode, otpForm.phoneNumber),
        code: otpForm.code,
      },
    });
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10 md:py-16">
        <div className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/95 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="bg-[linear-gradient(145deg,#111827,#1f2937_55%,#374151)] p-8 text-white md:p-12 dark:bg-[linear-gradient(145deg,#020617,#0b1220_55%,#111827)]">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-300">
              Welcome Back
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-black tracking-tight md:text-5xl">
              Sign in and continue where you left off.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">
              Access your cart, orders, and dashboard tools with a cleaner login
              flow designed to get you back into the app quickly.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 dark:border-white/20 dark:bg-white/10">
                <p className="text-sm text-slate-300">Customer Access</p>
                <p className="mt-2 text-lg font-semibold">
                  Cart and orders in sync
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 dark:border-white/20 dark:bg-white/10">
                <p className="text-sm text-slate-300">Role-based Redirect</p>
                <p className="mt-2 text-lg font-semibold">
                  Admin and vendor ready
                </p>
              </div>
            </div>
          </section>

          <section className="p-8 md:p-12">
            <div className="mx-auto max-w-md">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Account Login
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Sign in to your account
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Enter your email and password to access your shopping flow or
                dashboard.
              </p>

              <div className="mt-8 grid grid-cols-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-950">
                <button
                  type="button"
                  onClick={() => setLoginMode("password")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    loginMode === "password" ? "bg-white shadow-sm dark:bg-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode("otp")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    loginMode === "otp" ? "bg-white shadow-sm dark:bg-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  OTP
                </button>
              </div>

              {loginMode === "password" ? (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-slate-700 dark:text-slate-200"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-950 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-white dark:focus:bg-slate-900"
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
                    className="text-sm font-medium text-slate-700 dark:text-slate-200"
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
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 outline-none transition focus:border-slate-950 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-white dark:focus:bg-slate-900"
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-200/10 transition duration-200 hover:bg-slate-900 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
              ) : (
                <form
                  onSubmit={otpSent ? handleOtpVerify : handleOtpRequest}
                  className="mt-6 space-y-5"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Phone
                    </label>
                    <div className="grid grid-cols-[8.5rem_1fr] gap-3">
                      <select
                        value={otpForm.countryCode}
                        onChange={(e) =>
                          setOtpForm({ ...otpForm, countryCode: e.target.value })
                        }
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-slate-950 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-white dark:focus:bg-slate-900"
                      >
                        {countryCodes.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.code} {country.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={otpForm.phoneNumber}
                        onChange={(e) =>
                          setOtpForm({
                            ...otpForm,
                            phoneNumber: e.target.value.replace(/[^\d\s-]/g, ""),
                          })
                        }
                        className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-950 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-white dark:focus:bg-slate-900"
                        placeholder="9876543210"
                      />
                    </div>
                  </div>

                  {otpSent && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        OTP Code
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otpForm.code}
                        onChange={(e) =>
                          setOtpForm({
                            ...otpForm,
                            code: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-950 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-white dark:focus:bg-slate-900"
                        placeholder="6-digit code"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-200/10 transition duration-200 hover:bg-slate-900 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                  >
                    {otpSent
                      ? isVerifyingOtp
                        ? "Verifying..."
                        : "Verify OTP"
                      : isRequestingOtp
                        ? "Sending..."
                        : "Send OTP"}
                  </button>
                </form>
              )}

              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                New here?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-slate-900 underline dark:text-white"
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
