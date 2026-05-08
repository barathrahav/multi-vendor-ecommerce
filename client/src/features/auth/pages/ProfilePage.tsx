import { useState } from "react";
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
    role: string | null;
  };
};

type ProfileUser = UpdateProfileResponse["updateProfile"];

interface ProfileFormProps {
  user: ProfileUser;
}

const ProfileForm = ({ user }: ProfileFormProps) => {
  const apolloClient = useApolloClient();
  const initialPhone = splitPhone(user.phone);
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
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

  return (
    <div
      className="relative mx-auto max-w-3xl space-y-8 p-2
    text-gray-900 dark:text-white
    bg-gradient-to-br from-orange-50 via-white to-blue-50
    dark:from-gray-900 dark:via-black dark:to-gray-900 rounded-[2rem]"
    >
      {/* BACKGROUND GLOW */}
      <div
        className="absolute inset-0 -z-10 blur-3xl opacity-30
      bg-gradient-to-tr from-orange-200 via-blue-200 to-purple-200
      dark:from-blue-900 dark:via-purple-900 dark:to-black"
      />

      {/* HEADER */}
      <section
        className="rounded-[2rem] border p-6 shadow-lg
      backdrop-blur bg-white/70 dark:bg-white/5
      bg-gradient-to-br from-white/80 to-white/40
      dark:from-white/5 dark:to-transparent"
      >
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Account
        </p>

        <h1 className="mt-2 text-3xl font-black text-gray-900 dark:text-white">
          Profile
        </h1>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Update your contact details for account, order, payment, and refund
          notifications.
        </p>
      </section>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="rounded-[2rem] border p-6 shadow-sm
      backdrop-blur bg-white/70 dark:bg-white/5
      bg-gradient-to-br from-white/80 to-white/40
      dark:from-white/5 dark:to-transparent"
      >
        <div className="grid gap-5">
          {/* NAME */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input w-full"
            />
          </div>

          {/* EMAIL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>

            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input w-full"
            />
          </div>

          {/* PHONE */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone
            </label>

            <div className="grid grid-cols-[8.5rem_1fr] gap-3">
              <select
                value={form.countryCode}
                onChange={(e) =>
                  setForm({ ...form, countryCode: e.target.value })
                }
                className="input"
              >
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.code} {country.label}
                  </option>
                ))}
              </select>

              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phoneNumber: e.target.value.replace(/[^\d\s-]/g, ""),
                  })
                }
                className="input"
              />
            </div>
          </div>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={isSaving}
          className="mt-6 w-full rounded-xl px-5 py-3 text-sm font-semibold
        bg-gradient-to-r from-black to-gray-800
        dark:from-white dark:to-gray-300
        text-white dark:text-black
        hover:scale-[1.02] transition
        disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
};

const ProfilePage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-sm text-gray-500">Loading profile...</p>;
  }

  if (!user) {
    return <p className="text-sm text-gray-500">Profile unavailable.</p>;
  }

  return <ProfileForm key={user.id} user={user} />;
};

export default ProfilePage;
