import React, { useMemo, useState } from 'react';
import ProductList from '../components/products/ProductList';
import ProductFilter from '../components/products/ProductFilter';
import { useProducts } from '../hooks/useProducts';

const ShopPage: React.FC = () => {
    const { products, loading, error } = useProducts();
    const [category, setCategory] = useState<string>('All');

    if (loading) {
        return <div className="container page-content">Loading products...</div>;
    }

    if (error) {
        return <div className="container page-content">Failed to load products.</div>;
    }

    const visibleProducts = useMemo(
        () =>
            category === 'All'
                ? products
                : products.filter((p) => p.category === category),
        [products, category]
    );

    return (
        <main className="app-shell">
            <section className="container page-content">
                <h1 className="section-title">All Products</h1>
                <ProductFilter activeCategory={category} onChange={setCategory} />
                <ProductList products={visibleProducts} />
            </section>
        </main>
    );
};

export default ShopPage;