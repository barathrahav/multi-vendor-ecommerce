import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import toast from "react-hot-toast";

import {
  ADMIN_CREATE_USER,
  ADMIN_DELETE_USER,
  ADMIN_UPDATE_USER,
  ADMIN_UPDATE_USER_PASSWORD,
  GET_USERS,
} from "../graphql/admin.user";
import type {
  AdminCreateUserResponse,
  AdminCreateUserVariables,
  AdminDeleteUserResponse,
  AdminDeleteUserVariables,
  AdminUpdateUserPasswordResponse,
  AdminUpdateUserPasswordVariables,
  AdminUpdateUserResponse,
  AdminUpdateUserVariables,
  AdminUser,
  AdminUserRole,
  UsersResponse,
} from "../types/admin.user.types";
import { countryCodes, normalizePhone, splitPhone } from "../../auth/utils/phone";

const roleOptions: AdminUserRole[] = ["ADMIN", "VENDOR", "CUSTOMER"];

const AdminUsersPage = () => {
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    phoneNumber: "",
    password: "",
    role: "CUSTOMER" as AdminUserRole,
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    phoneNumber: "",
    role: "CUSTOMER" as AdminUserRole,
  });
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});

  const { data, loading, error } = useQuery<UsersResponse>(GET_USERS, {
    fetchPolicy: "cache-and-network",
  });

  const [createUser, { loading: isCreating }] = useMutation<
    AdminCreateUserResponse,
    AdminCreateUserVariables
  >(ADMIN_CREATE_USER, {
    refetchQueries: [{ query: GET_USERS }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setCreateForm({
        name: "",
        email: "",
        countryCode: "+91",
        phoneNumber: "",
        password: "",
        role: "CUSTOMER",
      });
      toast.success("User created");
    },
    onError: (mutationError) => {
      toast.error(mutationError.message || "Could not create user");
    },
  });

  const [updateUser, { loading: isUpdating }] = useMutation<
    AdminUpdateUserResponse,
    AdminUpdateUserVariables
  >(ADMIN_UPDATE_USER, {
    refetchQueries: [{ query: GET_USERS }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setEditingUserId(null);
      setEditingForm({
        name: "",
        email: "",
        countryCode: "+91",
        phoneNumber: "",
        role: "CUSTOMER",
      });
      toast.success("User updated");
    },
    onError: (mutationError) => {
      toast.error(mutationError.message || "Could not update user");
    },
  });

  const [updateUserPassword, { loading: isUpdatingPassword }] = useMutation<
    AdminUpdateUserPasswordResponse,
    AdminUpdateUserPasswordVariables
  >(ADMIN_UPDATE_USER_PASSWORD, {
    onCompleted: () => {
      toast.success("Password updated");
    },
    onError: (mutationError) => {
      toast.error(mutationError.message || "Could not update password");
    },
  });

  const [deleteUser, { loading: isDeleting }] = useMutation<
    AdminDeleteUserResponse,
    AdminDeleteUserVariables
  >(ADMIN_DELETE_USER, {
    refetchQueries: [{ query: GET_USERS }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast.success("User deleted");
    },
    onError: (mutationError) => {
      toast.error(mutationError.message || "Could not delete user");
    },
  });

  const users = data?.users ?? [];
  const isBusy = isCreating || isUpdating || isUpdatingPassword || isDeleting;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = createForm.name.trim();
    const email = createForm.email.trim();
    const password = createForm.password.trim();

    if (!name || !email || !password) {
      toast.error("Name, email, and password are required");
      return;
    }

    await createUser({
      variables: {
        name,
        email,
        phone: normalizePhone(createForm.countryCode, createForm.phoneNumber),
        password,
        role: createForm.role,
      },
    });
  };

  const startEditing = (user: AdminUser) => {
    const phone = splitPhone(user.phone);

    setEditingUserId(user.id);
    setEditingForm({
      name: user.name,
      email: user.email,
      countryCode: phone.countryCode,
      phoneNumber: phone.phoneNumber,
      role: user.role,
    });
  };

  const handleUpdate = async (id: string) => {
    const name = editingForm.name.trim();
    const email = editingForm.email.trim();

    if (!name || !email) {
      toast.error("Name and email are required");
      return;
    }

    await updateUser({
      variables: {
        id,
        name,
        email,
        phone: normalizePhone(editingForm.countryCode, editingForm.phoneNumber),
        role: editingForm.role,
      },
    });
  };

  const handlePasswordUpdate = async (id: string) => {
    const password = (passwordDrafts[id] ?? "").trim();

    if (!password) {
      toast.error("Password is required");
      return;
    }

    await updateUserPassword({
      variables: {
        id,
        password,
      },
    });

    setPasswordDrafts((current) => ({
      ...current,
      [id]: "",
    }));
  };

  const handleDelete = async (id: string) => {
    await deleteUser({
      variables: { id },
    });
  };

  if (loading) {
    return <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">Loading users...</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200/50 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-400 backdrop-blur-sm">
        We could not load users right now.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white/50 to-slate-50/50 dark:from-slate-900/50 dark:to-slate-800/50 backdrop-blur-sm p-6 shadow-sm dark:shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Admin Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Users</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Create accounts, update profile details and roles, reset passwords,
          and remove users when their data is no longer linked to products or orders.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white/50 to-slate-50/50 dark:from-slate-900/50 dark:to-slate-800/50 backdrop-blur-sm p-6 shadow-sm dark:shadow-lg">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create User</h2>

        <form onSubmit={handleCreate} className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            type="text"
            value={createForm.name}
            onChange={(e) =>
              setCreateForm((current) => ({
                ...current,
                name: e.target.value,
              }))
            }
            placeholder="Name"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 outline-none text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 transition focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
          />
          <input
            type="email"
            value={createForm.email}
            onChange={(e) =>
              setCreateForm((current) => ({
                ...current,
                email: e.target.value,
              }))
            }
            placeholder="Email"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 outline-none text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 transition focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
          />
          <input
            type="password"
            value={createForm.password}
            onChange={(e) =>
              setCreateForm((current) => ({
                ...current,
                password: e.target.value,
              }))
            }
            placeholder="Password"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 outline-none text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 transition focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
          />
          <div className="grid grid-cols-[8rem_1fr] gap-3">
            <select
              aria-label="Country code"
              value={createForm.countryCode}
              onChange={(e) =>
                setCreateForm((current) => ({
                  ...current,
                  countryCode: e.target.value,
                }))
              }
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3 text-sm outline-none text-slate-900 dark:text-white transition focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
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
              value={createForm.phoneNumber}
              onChange={(e) =>
                setCreateForm((current) => ({
                  ...current,
                  phoneNumber: e.target.value.replace(/[^\d\s-]/g, ""),
                }))
              }
              placeholder="Phone"
              className="min-w-0 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 outline-none text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 transition focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
            />
          </div>
          <select
            value={createForm.role}
            onChange={(e) =>
              setCreateForm((current) => ({
                ...current,
                role: e.target.value as AdminUserRole,
              }))
            }
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 outline-none text-slate-900 dark:text-white transition focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={isBusy}
            className="rounded-lg bg-blue-600 dark:bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 dark:hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-400 dark:disabled:bg-slate-600 md:col-span-2 md:justify-self-start shadow-sm hover:shadow-md"
          >
            {isCreating ? "Creating..." : "Create User"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white/50 to-slate-50/50 dark:from-slate-900/50 dark:to-slate-800/50 backdrop-blur-sm p-6 shadow-sm dark:shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">All Users</h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {users.length} user{users.length === 1 ? "" : "s"}
          </span>
        </div>

        {users.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/50 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            No users found.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {users.map((user) => {
              const isEditing = editingUserId === user.id;

              return (
                <div key={user.id} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 hover:shadow-md dark:hover:shadow-lg transition-shadow">
                  <div className="grid gap-4 lg:grid-cols-[1.4fr_1.6fr_1.8fr_1fr_auto]">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={editingForm.name}
                          onChange={(e) =>
                            setEditingForm((current) => ({
                              ...current,
                              name: e.target.value,
                            }))
                          }
                          className="rounded-lg border px-4 py-2 outline-none transition focus:border-black"
                        />
                        <input
                          type="email"
                          value={editingForm.email}
                          onChange={(e) =>
                            setEditingForm((current) => ({
                              ...current,
                              email: e.target.value,
                            }))
                          }
                          className="rounded-lg border px-4 py-2 outline-none transition focus:border-black"
                        />
                        <div className="grid grid-cols-[7rem_1fr] gap-2">
                          <select
                            aria-label="Country code"
                            value={editingForm.countryCode}
                            onChange={(e) =>
                              setEditingForm((current) => ({
                                ...current,
                                countryCode: e.target.value,
                              }))
                            }
                            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none text-slate-900 dark:text-white transition focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
                          >
                            {countryCodes.map((country) => (
                              <option key={country.code} value={country.code}>
                                {country.code}
                              </option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            inputMode="numeric"
                            value={editingForm.phoneNumber}
                            onChange={(e) =>
                              setEditingForm((current) => ({
                                ...current,
                                phoneNumber: e.target.value.replace(/[^\d\s-]/g, ""),
                              }))
                            }
                            className="min-w-0 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 outline-none text-slate-900 dark:text-white transition focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
                          />
                        </div>
                        <select
                          value={editingForm.role}
                          onChange={(e) =>
                            setEditingForm((current) => ({
                              ...current,
                              role: e.target.value as AdminUserRole,
                            }))
                          }
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 outline-none text-slate-900 dark:text-white transition focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => void handleUpdate(user.id)}
                            disabled={isBusy}
                            className="rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 dark:hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-400 dark:disabled:bg-slate-600 shadow-sm hover:shadow-md"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUserId(null);
                              setEditingForm({
                                name: "",
                                email: "",
                                countryCode: "+91",
                                phoneNumber: "",
                                role: "CUSTOMER",
                              });
                            }}
                            disabled={isBusy}
                            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{user.id}</p>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{user.email}</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {user.phone || "No phone"}
                        </p>
                        <span className="inline-flex h-fit rounded-full bg-slate-200 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {user.role}
                        </span>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => startEditing(user)}
                            disabled={isBusy}
                            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(user.id)}
                            disabled={isBusy}
                            className="rounded-lg bg-red-600 dark:bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 dark:hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-red-400 dark:disabled:bg-red-400 shadow-sm hover:shadow-md"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-4 md:flex-row">
                    <input
                      type="password"
                      value={passwordDrafts[user.id] ?? ""}
                      onChange={(e) =>
                        setPasswordDrafts((current) => ({
                          ...current,
                          [user.id]: e.target.value,
                        }))
                      }
                      placeholder="Set new password"
                      className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 outline-none text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 transition focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
                    />
                    <button
                      type="button"
                      onClick={() => void handlePasswordUpdate(user.id)}
                      disabled={isBusy}
                      className="rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 dark:hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-400 dark:disabled:bg-slate-600 shadow-sm hover:shadow-md"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminUsersPage;
