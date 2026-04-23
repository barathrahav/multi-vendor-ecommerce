import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { GET_CATEGORIES, GET_PRODUCT, GET_PRODUCTS } from "../../products/graphql/product.queries";
import { UPDATE_PRODUCT } from "../../products/graphql/product.mutations";
import { useAuth } from "../../auth/hooks/useAuth";
import type {
  CategoriesResponse,
  ProductDetailsResponse,
  ProductsVariables,
  UpdateProductResponse,
  UpdateProductVariables,
} from "../../products/types/product.types";

const EditVendorProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const vendorId = user?.id;

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    imageUrl: "",
  });

  const vendorProductsVariables: ProductsVariables = {
    vendorId,
    page: 1,
    limit: 50,
    sortBy: "createdAt",
    sortOrder: "desc",
  };

  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } =
    useQuery<CategoriesResponse>(GET_CATEGORIES);

  const { data: productData, loading: productLoading, error: productError } =
    useQuery<ProductDetailsResponse>(GET_PRODUCT, {
      skip: !id,
      variables: { id },
      fetchPolicy: "network-only",
    });

  useEffect(() => {
    const product = productData?.product;

    if (!product) {
      return;
    }

    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      categoryId: product.category?.id ?? "",
      imageUrl: product.imageUrl ?? "",
    });
  }, [productData]);

  const [updateProduct, { loading: isSubmitting }] = useMutation<
    UpdateProductResponse,
    UpdateProductVariables
  >(UPDATE_PRODUCT, {
    refetchQueries: [
      { query: GET_PRODUCTS, variables: vendorProductsVariables },
      ...(id ? [{ query: GET_PRODUCT, variables: { id } }] : []),
    ],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast.success("Product updated successfully");
      navigate("/vendor/products");
    },
    onError: (mutationError) => {
      toast.error(mutationError.message || "Could not update product");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast.error("Product not found");
      return;
    }

    if (!form.categoryId) {
      toast.error("Please select a category");
      return;
    }

    await updateProduct({
      variables: {
        id,
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: form.categoryId,
        imageUrl: form.imageUrl.trim() || undefined,
      },
    });
  };

  if (productLoading) {
    return <p className="text-sm text-gray-500">Loading product details...</p>;
  }

  if (productError || !productData?.product) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        We could not load this product right now.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
          Vendor Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update your product details, pricing, stock, and category.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                name: e.target.value,
              }))
            }
            className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
            placeholder="Enter product name"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="description"
            className="text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            required
            value={form.description}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                description: e.target.value,
              }))
            }
            rows={5}
            className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
            placeholder="Describe the product"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.price}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  price: e.target.value,
                }))
              }
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
              placeholder="Enter product price"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="stock" className="text-sm font-medium text-gray-700">
              Stock
            </label>
            <input
              id="stock"
              type="number"
              min="0"
              step="1"
              required
              value={form.stock}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  stock: e.target.value,
                }))
              }
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
              placeholder="Enter available stock"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="categoryId"
            className="text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            id="categoryId"
            required
            value={form.categoryId}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                categoryId: e.target.value,
              }))
            }
            className="w-full rounded-lg border bg-white px-4 py-3 outline-none transition focus:border-black"
            disabled={categoriesLoading || !!categoriesError}
          >
            <option value="">
              {categoriesLoading
                ? "Loading categories..."
                : categoriesError
                  ? "Unable to load categories"
                  : "Select a category"}
            </option>
            {categoriesData?.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="imageUrl"
            className="text-sm font-medium text-gray-700"
          >
            Image URL
          </label>
          <input
            id="imageUrl"
            type="url"
            value={form.imageUrl}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                imageUrl: e.target.value,
              }))
            }
            className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
            placeholder="https://example.com/product-image.jpg"
          />
        </div>

        <div className="flex flex-col gap-3 pt-2 md:flex-row">
          <button
            type="submit"
            disabled={isSubmitting || categoriesLoading || !!categoriesError}
            className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/vendor/products")}
            className="rounded-lg border px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVendorProductPage;
