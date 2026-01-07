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
            <section className="container page-content glass-panel">
                <div className="hero-banner">
                    <div className="hero-banner-text">
                        <h2>All outfits &amp; accessories</h2>
                        <p>Scroll through every look, mix and match across categories.</p>
                    </div>
                    <button className="hero-banner-cta">View full collection</button>
                </div>

                <h1 className="page-title">All products</h1>
                <ProductFilter activeCategory={category} onChange={setCategory} />
                <ProductList products={visibleProducts} />
            </section>
        </main>
    );
};

export default ShopPage;