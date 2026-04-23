import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import toast from "react-hot-toast";

import { GET_CATEGORIES } from "../../products/graphql/product.queries";
import {
  CREATE_CATEGORY,
  DELETE_CATEGORY,
  UPDATE_CATEGORY,
} from "../graphql/admin.category";
import type { CategoriesResponse, Category } from "../../products/types/product.types";

type CategoryMutationResponse = {
  createCategory?: Category;
  updateCategory?: Category;
  deleteCategory?: string;
};

type CreateCategoryVariables = {
  name: string;
};

type UpdateCategoryVariables = {
  id: string;
  name: string;
};

type DeleteCategoryVariables = {
  id: string;
};

const AdminCategoriesPage = () => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const { data, loading, error } = useQuery<CategoriesResponse>(GET_CATEGORIES);

  const [createCategory, { loading: isCreating }] = useMutation<
    CategoryMutationResponse,
    CreateCategoryVariables
  >(CREATE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORIES }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setNewCategoryName("");
      toast.success("Category created");
    },
    onError: () => {
      toast.error("Could not create category");
    },
  });

  const [updateCategory, { loading: isUpdating }] = useMutation<
    CategoryMutationResponse,
    UpdateCategoryVariables
  >(UPDATE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORIES }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setEditingCategoryId(null);
      setEditingName("");
      toast.success("Category updated");
    },
    onError: () => {
      toast.error("Could not update category");
    },
  });

  const [deleteCategory, { loading: isDeleting }] = useMutation<
    CategoryMutationResponse,
    DeleteCategoryVariables
  >(DELETE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORIES }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast.success("Category deleted");
    },
    onError: () => {
      toast.error("Could not delete category");
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = newCategoryName.trim();

    if (!name) {
      toast.error("Category name is required");
      return;
    }

    await createCategory({
      variables: { name },
    });
  };

  const handleUpdate = async (categoryId: string) => {
    const name = editingName.trim();

    if (!name) {
      toast.error("Category name is required");
      return;
    }

    await updateCategory({
      variables: {
        id: categoryId,
        name,
      },
    });
  };

  const handleDelete = async (categoryId: string) => {
    await deleteCategory({
      variables: { id: categoryId },
    });
  };

  const categories = data?.categories ?? [];
  const isBusy = isCreating || isUpdating || isDeleting;

  if (loading) {
    return <p className="text-sm text-gray-500">Loading categories...</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        We could not load categories right now.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
          Admin Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Categories</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create, rename, and remove product categories used across the store.
        </p>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Create Category</h2>

        <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-4 md:flex-row">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Enter category name"
            className="flex-1 rounded-lg border px-4 py-3 outline-none transition focus:border-black"
          />

          <button
            type="submit"
            disabled={isBusy}
            className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isCreating ? "Creating..." : "Add Category"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">All Categories</h2>
          <span className="text-sm text-gray-500">
            {categories.length} categor{categories.length === 1 ? "y" : "ies"}
          </span>
        </div>

        {categories.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed bg-gray-50 p-8 text-center text-sm text-gray-500">
            No categories yet.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {categories.map((category) => {
              const isEditing = editingCategoryId === category.id;

              return (
                <div
                  key={category.id}
                  className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full rounded-lg border px-4 py-2 outline-none transition focus:border-black"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{category.name}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => void handleUpdate(category.id)}
                          disabled={isBusy}
                          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategoryId(null);
                            setEditingName("");
                          }}
                          disabled={isBusy}
                          className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategoryId(category.id);
                            setEditingName(category.name);
                          }}
                          disabled={isBusy}
                          className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(category.id)}
                          disabled={isBusy}
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                        >
                          Delete
                        </button>
                      </>
                    )}
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

export default AdminCategoriesPage;
