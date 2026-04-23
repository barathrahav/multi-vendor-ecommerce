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

const roleOptions: AdminUserRole[] = ["ADMIN", "VENDOR", "CUSTOMER"];

const AdminUsersPage = () => {
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER" as AdminUserRole,
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState({
    name: "",
    email: "",
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
        password,
        role: createForm.role,
      },
    });
  };

  const startEditing = (user: AdminUser) => {
    setEditingUserId(user.id);
    setEditingForm({
      name: user.name,
      email: user.email,
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
    return <p className="text-sm text-gray-500">Loading users...</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        We could not load users right now.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
          Admin Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Users</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create accounts, update profile details and roles, reset passwords,
          and remove users when their data is no longer linked to products or orders.
        </p>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Create User</h2>

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
            className="rounded-lg border px-4 py-3 outline-none transition focus:border-black"
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
            className="rounded-lg border px-4 py-3 outline-none transition focus:border-black"
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
            className="rounded-lg border px-4 py-3 outline-none transition focus:border-black"
          />
          <select
            value={createForm.role}
            onChange={(e) =>
              setCreateForm((current) => ({
                ...current,
                role: e.target.value as AdminUserRole,
              }))
            }
            className="rounded-lg border bg-white px-4 py-3 outline-none transition focus:border-black"
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
            className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 md:col-span-2 md:justify-self-start"
          >
            {isCreating ? "Creating..." : "Create User"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
          <span className="text-sm text-gray-500">
            {users.length} user{users.length === 1 ? "" : "s"}
          </span>
        </div>

        {users.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed bg-gray-50 p-8 text-center text-sm text-gray-500">
            No users found.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {users.map((user) => {
              const isEditing = editingUserId === user.id;

              return (
                <div key={user.id} className="rounded-xl border p-4">
                  <div className="grid gap-4 lg:grid-cols-[2fr_2fr_1fr_auto]">
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
                        <select
                          value={editingForm.role}
                          onChange={(e) =>
                            setEditingForm((current) => ({
                              ...current,
                              role: e.target.value as AdminUserRole,
                            }))
                          }
                          className="rounded-lg border bg-white px-4 py-2 outline-none transition focus:border-black"
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
                            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
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
                                role: "CUSTOMER",
                              });
                            }}
                            disabled={isBusy}
                            className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.id}</p>
                        </div>
                        <p className="text-sm text-gray-700">{user.email}</p>
                        <span className="inline-flex h-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                          {user.role}
                        </span>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => startEditing(user)}
                            disabled={isBusy}
                            className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(user.id)}
                            disabled={isBusy}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-3 rounded-xl bg-gray-50 p-4 md:flex-row">
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
                      className="flex-1 rounded-lg border bg-white px-4 py-2 outline-none transition focus:border-black"
                    />
                    <button
                      type="button"
                      onClick={() => void handlePasswordUpdate(user.id)}
                      disabled={isBusy}
                      className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
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
