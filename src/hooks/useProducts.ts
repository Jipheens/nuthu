import { useProductsContext } from '../context/ProductsContext';

export const useProducts = () => {
    const { products } = useProductsContext();
    return { products, loading: false, error: null as string | null };
};

export default useProducts;