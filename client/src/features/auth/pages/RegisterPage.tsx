import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApolloClient, useMutation } from "@apollo/client/react";

import Navbar from "../../../components/layout/Navbar";
import { ME_QUERY } from "../graphql/auth.queries";
import {
  REQUEST_OTP_REGISTER_MUTATION,
  VERIFY_OTP_REGISTER_MUTATION,
} from "../graphql/auth.mutations";
import type {
  RequestOtpRegisterResponse,
  RequestOtpRegisterVariables,
  VerifyOtpRegisterResponse,
  VerifyOtpRegisterVariables,
} from "../types/auth.types";
import { countryCodes, normalizePhone } from "../utils/phone";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

const RegisterPage = () => {
  const navigate = useNavigate();
  const apolloClient = useApolloClient();

  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [requestOtpRegister, { loading: otpLoading }] = useMutation<
    RequestOtpRegisterResponse,
    RequestOtpRegisterVariables
  >(REQUEST_OTP_REGISTER_MUTATION);

  const [verifyOtpRegister, { loading: verifyLoading }] = useMutation<
    VerifyOtpRegisterResponse,
    VerifyOtpRegisterVariables
  >(VERIFY_OTP_REGISTER_MUTATION, {
    onCompleted: async (data) => {
      localStorage.setItem("token", data.verifyOtpRegister.token);
      localStorage.setItem("refreshToken", data.verifyOtpRegister.refreshToken);

      await apolloClient.clearStore();
      apolloClient.writeQuery({
        query: ME_QUERY,
        data: {
          me: data.verifyOtpRegister.user,
        },
      });

      navigate("/");
    },
  });

  const handleSendOtp = async () => {
    // Basic validation
    if (!form.name || !form.email || !form.phoneNumber || !form.password || !form.confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const phone = normalizePhone(form.countryCode, form.phoneNumber);
    if (!phone) {
      alert("Please enter a valid phone number");
      return;
    }

    try {
      const result = await requestOtpRegister({
        variables: { phone },
      });
      alert(result.data?.requestOtpRegister || "OTP sent successfully");
      setStep("otp");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to send OTP. Please check your phone number and try again.");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      alert("Please enter OTP");
      return;
    }

    const phone = normalizePhone(form.countryCode, form.phoneNumber);
    if (!phone) {
      alert("Invalid phone number");
      return;
    }

    try {
      await verifyOtpRegister({
        variables: {
          name: form.name,
          email: form.email,
          phone,
          password: form.password,
          code: otp,
          role: "CUSTOMER",
        },
      });
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Registration failed");
    }
  };

  const handleBackToForm = () => {
    setStep("form");
    setOtp("");
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getPasswordStrength = (password: string) => {
    let score = 0;

    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: "Weak", color: "bg-red-500 dark:bg-rose-500" };
    if (score === 2) return { label: "Medium", color: "bg-yellow-500 dark:bg-amber-500" };
    return { label: "Strong", color: "bg-green-500 dark:bg-emerald-500" };
  };

  return (
    <div>
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10 md:py-16">
        <div className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/95 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="p-8 md:p-12">
            <div className="mx-auto max-w-md">
              {step === "form" ? (
                <>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    New Account
                  </p>
                  <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    Create your customer account
                  </h1>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    Register once and start shopping, saving orders, and checking
                    out with a smoother experience.
                  </p>

                  <form className="mt-8 space-y-5">
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium text-slate-700 dark:text-slate-200"
                        htmlFor="name"
                      >
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={form.name}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-950 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-white dark:focus:bg-slate-900"
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
                        htmlFor="phone"
                      >
                        Phone for SMS alerts
                      </label>
                      <div className="grid grid-cols-[8.5rem_1fr] gap-3">
                        <select
                          aria-label="Country code"
                          value={form.countryCode}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-slate-950 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-white dark:focus:bg-slate-900"
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
                          className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-950 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-white dark:focus:bg-slate-900"
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
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Password
                      </label>

                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          placeholder="Create a secure password"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 outline-none transition focus:border-slate-950 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-white dark:focus:bg-slate-900"
                          onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
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

                      {/* Strength Indicator */}
                      {form.password && (
                        <div className="mt-2">
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden dark:bg-slate-700">
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

                          <p className="text-xs mt-1 text-slate-600 dark:text-slate-400">
                            Strength:{" "}
                            <span className="font-medium">
                              {getPasswordStrength(form.password).label}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Confirm Password
                      </label>

                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={form.confirmPassword}
                          placeholder="Re-enter your password"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 outline-none transition focus:border-slate-950 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-white dark:focus:bg-slate-900"
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
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
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
                              ? "text-green-600 dark:text-emerald-400"
                              : "text-red-500 dark:text-rose-400"
                          }`}
                        >
                          {form.password === form.confirmPassword
                            ? "Passwords match"
                            : "Passwords do not match"}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading}
                      className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-200/10 transition duration-200 hover:bg-slate-900 disabled:opacity-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                    >
                      {otpLoading ? "Sending OTP..." : "Send OTP"}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <button
                    onClick={handleBackToForm}
                    className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                  >
                    <ArrowLeft size={16} />
                    Back to form
                  </button>

                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Verify Phone
                  </p>
                  <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    Enter verification code
                  </h1>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    We've sent a 6-digit code to{" "}
                    <span className="font-medium">
                      {normalizePhone(form.countryCode, form.phoneNumber)}
                    </span>
                  </p>

                  <form onSubmit={handleVerifyOtp} className="mt-8 space-y-5">
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium text-slate-700 dark:text-slate-200"
                        htmlFor="otp"
                      >
                        Verification Code
                      </label>
                      <input
                        id="otp"
                        type="text"
                        placeholder="000000"
                        value={otp}
                        maxLength={6}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-2xl font-mono tracking-widest outline-none transition focus:border-slate-950 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-white dark:focus:bg-slate-900"
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/[^\d]/g, ""))
                        }
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={verifyLoading || otp.length !== 6}
                      className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-200/10 transition duration-200 hover:bg-slate-900 disabled:opacity-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                    >
                      {verifyLoading ? "Verifying..." : "Verify & Register"}
                    </button>
                  </form>
                </>
              )}

              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-slate-900 underline dark:text-white"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </section>

          <section className="bg-[linear-gradient(145deg,#fff7ed,#ffffff_55%,#eff6ff)] p-8 md:p-12 dark:bg-slate-950/95 dark:bg-[linear-gradient(145deg,#020617,#0b1220_55%,#111827)]">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Start Shopping
            </p>
            <h2 className="mt-4 max-w-xl text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">
              Build your account in a few quick steps.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600 dark:text-slate-300">
              Once registered, you can browse products faster, save items to
              your cart, place orders, and track your purchase history from one
              place.
            </p>

            <div className="mt-10 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                <p className="text-sm text-slate-500 dark:text-slate-400">Fast Checkout</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                  Save time on future purchases
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                <p className="text-sm text-slate-500 dark:text-slate-400">Order History</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                  Track every order in one place
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                <p className="text-sm text-slate-500 dark:text-slate-400">Smarter Shopping</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
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
