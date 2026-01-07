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
            <section className="container page-content glass-panel">
                <div className="hero-banner hero-banner-large">
                    <div className="hero-banner-text">
                        <h2>Curated designer archive</h2>
                        <p>Rare pieces, bags and shoes sourced from around the world.</p>
                    </div>
                    <Link to="/shop" className="hero-banner-cta">Shop new arrivals</Link>
                </div>

                <h1 className="page-title">Shop New Arrivals</h1>
                <p className="page-subtitle">Discover the latest drops before they sell out.</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#777' }}>All styles in Kenyan Shilling (KES)</span>
                    <Link to="/shop" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>View all</Link>
                </div>

                {products.some(p => p.brand) && (
                    <div style={{ marginTop: '0.75rem', marginBottom: '0.25rem' }}>
                        <h3 style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}>Featured designers</h3>
                        <div className="filter-chips-row">
                            {Array.from(new Set(products.map(p => p.brand).filter(Boolean) as string[])).map(brand => (
                                <span key={brand} className="filter-chip">{brand}</span>
                            ))}
                        </div>
                    </div>
                )}

                <ProductFilter activeCategory={category} onChange={setCategory} />
                <ProductList products={visibleProducts} />
            </section>
        </main>
    );
};

export default HomePage;