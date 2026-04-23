export interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string | null;
  };
}

export interface CartResponse {
  cart: {
    id: string;
    items: CartItem[];
  };
}