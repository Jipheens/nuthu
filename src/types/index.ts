export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    brand?: string;
    inStock?: boolean;
}

export interface CartItem {
    productId: string;
    quantity: number;
}

export interface Cart {
    items: CartItem[];
    totalAmount: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    isAuthenticated: boolean;
}