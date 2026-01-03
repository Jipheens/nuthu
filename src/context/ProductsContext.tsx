import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { Product } from '../types';

interface ProductsContextValue {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
}

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);

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

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const id = Date.now().toString();
    setProducts(prev => [...prev, { ...product, id }]);
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const value = useMemo(
    () => ({ products, addProduct, deleteProduct }),
    [products]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};

export const useProductsContext = (): ProductsContextValue => {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error('useProductsContext must be used within a ProductsProvider');
  }
  return ctx;
};

export default ProductsContext;
