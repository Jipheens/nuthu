import { useEffect, useState } from 'react';
import { Product } from '../types';
import { useEffect, useState } from 'react';
import { Product } from '../types';

const INITIAL_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Classic Handbag',
        description: 'Elegant handbag perfect for everyday use.',
        price: 59.99,
        category: 'Bags',
        imageUrl: 'https://via.placeholder.com/300x300?text=Handbag',
    },
    {
        id: '2',
        name: 'Stylish Heels',
        description: 'Comfortable yet stylish heels for any occasion.',
        price: 79.99,
        category: 'Shoes',
        imageUrl: 'https://via.placeholder.com/300x300?text=Heels',
    },
    {
        id: '3',
        name: 'Summer Dress',
        description: 'Lightweight dress ideal for warm days.',
        price: 49.99,
        category: 'Clothes',
        imageUrl: 'https://via.placeholder.com/300x300?text=Dress',
    },
];

import { useProductsContext } from '../context/ProductsContext';

export const useProducts = () => {
    const { products } = useProductsContext();
    return { products, loading: false, error: null as string | null };
};

export default useProducts;