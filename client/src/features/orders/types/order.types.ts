export interface PlaceOrderResponse {
  placeOrder: {
    id: string;
    totalAmount: number;
    status: string;
  };
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  product?: {
    id: string;
    vendor?: {
      id: string;
      name?: string;
    } | null;
  } | null;
}

export interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  statusHistory: OrderStatusHistory[];
}

export interface OrdersResponse {
  myOrders: Order[];
}

export interface VendorOrdersResponse {
  vendorOrders: Order[];
}

export interface OrderStatusHistory {
  id: string;
  status: string;
  createdAt: string;
}
