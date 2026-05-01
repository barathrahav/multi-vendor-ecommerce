import { useEffect, useState } from "react";
import { useApolloClient, useMutation } from "@apollo/client/react";
import toast from "react-hot-toast";

import { ME_QUERY } from "../graphql/auth.queries";
import { UPDATE_PROFILE } from "../graphql/profile.mutations";
import { useAuth } from "../hooks/useAuth";
import { countryCodes, normalizePhone, splitPhone } from "../utils/phone";
import { reportError } from "../../../lib/errors";

type UpdateProfileResponse = {
  updateProfile: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
  };
};

const ProfilePage = () => {
  const apolloClient = useApolloClient();
  const { user, loading } = useAuth();
  const initialPhone = splitPhone(user?.phone);
  const [form, setForm] = useState({
    name: "",
    email: "",
    countryCode: initialPhone.countryCode,
    phoneNumber: initialPhone.phoneNumber,
  });

  const [updateProfile, { loading: isSaving }] =
    useMutation<UpdateProfileResponse>(UPDATE_PROFILE, {
      onCompleted: async (data) => {
      apolloClient.writeQuery({
        query: ME_QUERY,
        data: {
          me: data.updateProfile,
        },
      });
      toast.success("Profile updated");
    },
    onError: (error) => {
      toast.error(reportError(error, "Could not update profile"));
    },
    });

  useEffect(() => {
    if (!user) return;

    const phone = splitPhone(user.phone);
    setForm({
      name: user.name,
      email: user.email,
      countryCode: phone.countryCode,
      phoneNumber: phone.phoneNumber,
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();

    if (!name || !email) {
      toast.error("Name and email are required");
      return;
    }

    await updateProfile({
      variables: {
        name,
        email,
        phone: normalizePhone(form.countryCode, form.phoneNumber),
      },
    });
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading profile...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update your contact details for account, order, payment, and refund
          notifications.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="phone">
              Phone
            </label>
            <div className="grid grid-cols-[8.5rem_1fr] gap-3">
              <select
                aria-label="Country code"
                value={form.countryCode}
                onChange={(e) =>
                  setForm({ ...form, countryCode: e.target.value })
                }
                className="rounded-lg border bg-white px-3 py-3 text-sm outline-none transition focus:border-black"
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
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phoneNumber: e.target.value.replace(/[^\d\s-]/g, ""),
                  })
                }
                className="min-w-0 rounded-lg border px-4 py-3 outline-none transition focus:border-black"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="mt-6 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSaving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
