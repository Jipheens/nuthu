import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductList from '../components/products/ProductList';
import ProductFilter from '../components/products/ProductFilter';
import { useProducts } from '../hooks/useProducts';

const HomePage: React.FC = () => {
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
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Chrome Hearts</h1>
                    <Link to="/shop" className="hero-cta">Shop Now</Link>
                </div>
            </section>

            <section className="container page-content">
                <h2 className="section-title">Shop New Arrivals</h2>
                
                <ProductFilter activeCategory={category} onChange={setCategory} />
                <ProductList products={visibleProducts} />
            </section>
        </main>
    );
};

export default HomePage;