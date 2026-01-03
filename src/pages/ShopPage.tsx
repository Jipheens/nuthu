import React from 'react';
import ProductList from '../components/products/ProductList';
import ProductFilter from '../components/products/ProductFilter';
import { useProducts } from '../hooks/useProducts';

const ShopPage: React.FC = () => {
    const { products, loading, error } = useProducts();

    if (loading) {
        return <div className="container page-content">Loading products...</div>;
    }

    if (error) {
        return <div className="container page-content">Failed to load products.</div>;
    }

    return (
        <main className="app-shell">
            <section className="container page-content glass-panel">
                <div className="hero-banner">
                    <div className="hero-banner-text">
                        <h2>Today&apos;s picks for you</h2>
                        <p>Browse outfits by category and price, just like your favourite marketplace.</p>
                    </div>
                    <button className="hero-banner-cta">View offers</button>
                </div>

                <h1 className="page-title">Shop Our Collection</h1>
                <ProductFilter />
                <ProductList products={products} />
            </section>
        </main>
    );
};

export default ShopPage;