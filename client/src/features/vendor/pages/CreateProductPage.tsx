import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../auth/hooks/useAuth";
import { GET_CATEGORIES, GET_PRODUCTS } from "../../products/graphql/product.queries";
import { CREATE_PRODUCT } from "../../products/graphql/product.mutations";
import type {
  CategoriesResponse,
  CreateProductResponse,
  CreateProductVariables,
  ProductsResponse,
  ProductsVariables,
} from "../../products/types/product.types";

const CreateVendorProductPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const vendorId = user?.id;
  const vendorProductsVariables: ProductsVariables = {
    vendorId,
    page: 1,
    limit: 50,
    sortBy: "createdAt",
    sortOrder: "desc",
  };

  const [form, setForm] = useState({
    name: "",
    price: "",
    categoryId: "",
    stock: "",
    imageUrl: "",
  });

  const { data, loading: categoriesLoading, error: categoriesError } =
    useQuery<CategoriesResponse>(GET_CATEGORIES);

  const [createProduct, { loading: isSubmitting }] = useMutation<
    CreateProductResponse,
    CreateProductVariables
  >(CREATE_PRODUCT, {
    refetchQueries: vendorId
      ? [
          {
            query: GET_PRODUCTS,
            variables: vendorProductsVariables,
          },
        ]
      : [],
    awaitRefetchQueries: true,
    update(cache, { data }) {
      const createdProduct = data?.createProduct;

      if (!createdProduct || !vendorId) {
        return;
      }

      const existingProducts = cache.readQuery<
        ProductsResponse,
        ProductsVariables
      >({
        query: GET_PRODUCTS,
        variables: vendorProductsVariables,
      });

      if (!existingProducts) {
        return;
      }

      const alreadyExists = existingProducts.products.items.some(
        (product) => product.id === createdProduct.id
      );

      if (alreadyExists) {
        return;
      }

      cache.writeQuery<ProductsResponse, ProductsVariables>({
        query: GET_PRODUCTS,
        variables: vendorProductsVariables,
        data: {
          products: {
            ...existingProducts.products,
            items: [createdProduct, ...existingProducts.products.items],
            total: existingProducts.products.total + 1,
          },
        },
      });
    },
    onCompleted: () => {
      toast.success("Product created successfully");
      navigate("/vendor/products");
    },
    onError: () => {
      toast.error("Could not create product");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.categoryId) {
      toast.error("Please select a category");
      return;
    }

    await createProduct({
      variables: {
        name: form.name.trim(),
        description: `${form.name.trim()} product`,
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: form.categoryId,
        imageUrl: form.imageUrl.trim() || undefined,
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
          Vendor Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Create Product
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Add a new product to your storefront with the core details.
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
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
            placeholder="Enter product name"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="price"
              className="text-sm font-medium text-gray-700"
            >
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
                setForm({
                  ...form,
                  price: e.target.value,
                })
              }
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
              placeholder="Enter product price"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="stock"
              className="text-sm font-medium text-gray-700"
            >
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
                setForm({
                  ...form,
                  stock: e.target.value,
                })
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
              setForm({
                ...form,
                categoryId: e.target.value,
              })
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
            {data?.categories.map((category) => (
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
              setForm({
                ...form,
                imageUrl: e.target.value,
              })
            }
            className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
            placeholder="https://example.com/product-image.jpg"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || categoriesLoading || !!categoriesError}
          className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting ? "Creating Product..." : "Create Product"}
        </button>
      </form>
    </div>
  );
};

export default CreateVendorProductPage;
