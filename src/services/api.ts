import axios from 'axios';
import { Product } from '../types';

// Backend API base URL
// You can override this with Vite env: VITE_API_BASE_URL
const API_BASE_URL =
    (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Shape returned by the backend (MariaDB rows)
interface ProductDTO {
    id: number;
    name: string;
    description: string | null;
    price: number;
    category: string | null;
    image_url: string | null;
    brand?: string | null;
    in_stock?: number | boolean;
}

const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

const mapProduct = (dto: ProductDTO): Product => {
    let imageUrl = dto.image_url || '';

    if (imageUrl.startsWith('/uploads/')) {
        imageUrl = `${API_ORIGIN}${imageUrl}`;
    }

    return {
        id: String(dto.id),
        name: dto.name,
        description: dto.description || '',
        // MariaDB DECIMAL may come back as a string; coerce to number
        price: Number(dto.price),
        category: dto.category || 'Other',
        imageUrl: imageUrl || 'https://via.placeholder.com/300x300?text=Item',
        brand: dto.brand || undefined,
        inStock:
            typeof dto.in_stock === 'boolean'
                ? dto.in_stock
                : dto.in_stock == null
                ? true
                : dto.in_stock === 1,
    };
};

export const uploadProductImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post<{ url: string }>(
        `${API_BASE_URL.replace('/api', '')}/api/upload/image`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data.url;
};

export const getProducts = async (): Promise<Product[]> => {
    const response = await axios.get<ProductDTO[]>(`${API_BASE_URL}/products`);
    return response.data.map(mapProduct);
};

export const createProduct = async (
    product: Omit<Product, 'id'> & { brand?: string; inStock?: boolean }
): Promise<Product> => {
    const response = await axios.post<ProductDTO>(
        `${API_BASE_URL}/products`,
        product
    );
    return mapProduct(response.data);
};

export const deleteProduct = async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/products/${id}`);
};

export const createCheckoutSession = async (
    items: { name: string; price: number; quantity: number }[]
): Promise<string> => {
    const response = await axios.post<{ url: string }>(
        `${API_BASE_URL}/checkout/create-session`,
        {
            items,
            currency: 'kes',
        }
    );

    return response.data.url;
};

// Stripe Elements: create a PaymentIntent for on-site card payments
export const createPaymentIntent = async (
    amount: number,
    currency: string = 'kes'
): Promise<string> => {
    const response = await axios.post<{ clientSecret: string }>(
        `${API_BASE_URL}/checkout/create-payment-intent`,
        {
            // Stripe expects the amount in the smallest currency unit
            amount: Math.round(amount * 100),
            currency,
        }
    );

    return response.data.clientSecret;
};

// Orders
export const createOrder = async (
    payload: {
        totalAmount: number;
        currency: string;
        items: { productId: string; quantity: number; price: number }[];
        email?: string;
    }
): Promise<number> => {
    const response = await axios.post<{ id: number }>(
        `${API_BASE_URL}/orders`,
        payload
    );
    return response.data.id;
};