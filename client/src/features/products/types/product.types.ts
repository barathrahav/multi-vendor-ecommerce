export interface Product {
  id: string;
  name: string;
  price: number;
  stock?: number;
  imageUrl?: string | null;
  vendor?: {
    id: string;
    name: string;
  } | null;
  category?: {
    name: string;
  } | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface ProductsResponse {
  products: {
    items: Product[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface ProductsVariables {
  search?: string;
  vendorId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface ProductDetailsResponse {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl?: string | null;
    vendor?: {
      id: string;
      name: string;
    } | null;
    category?: {
      id: string;
      name: string;
    } | null;
  };
}

export interface CreateProductResponse {
  createProduct: Product;
}

export interface CreateProductVariables {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl?: string;
}

export interface UpdateProductResponse {
  updateProduct: ProductDetailsResponse["product"];
}

export interface UpdateProductVariables {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
  imageUrl?: string;
}

export interface DeleteProductResponse {
  deleteProduct: string;
}

export interface DeleteProductVariables {
  id: string;
}
