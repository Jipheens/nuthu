import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { Product } from '../types';
import {
  getProducts,
  createProduct as apiCreateProduct,
  deleteProduct as apiDeleteProduct,
} from '../services/api';

interface ProductsContextValue {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  deleteProduct: (id: string) => void;
}

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const loaded = await getProducts();
        if (!cancelled) {
          setProducts(loaded);
        }
      } catch (err) {
        console.error('Failed to load products from API', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    try {
      const created = await apiCreateProduct({ ...product, inStock: true });
      setProducts(prev => [...prev, created]);
      return created;
    } catch (err) {
      console.error('Failed to add product', err);
      throw err;
    }
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));

    (async () => {
      try {
        await apiDeleteProduct(id);
      } catch (err) {
        console.error('Failed to delete product', err);
      }
    })();
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
