import React from 'react';
import ProductList from '../components/products/ProductList';
import ProductFilter from '../components/products/ProductFilter';
import { useProducts } from '../hooks/useProducts';

const HomePage: React.FC = () => {
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
                        <h2>New arrivals every week</h2>
                        <p>Shop curated outfits, bags and shoes with same-day delivery in town.</p>
                    </div>
                    <button className="hero-banner-cta">Shop deals</button>
                </div>

                <h1 className="page-title">Welcome to Our E-Commerce Store</h1>
                <p className="page-subtitle">Discover bags, shoes and outfits curated for everyday elegance.</p>

                <div className="home-layout">
                    <aside className="home-sidebar">
                        <h3>Shop by category</h3>
                        <ul className="category-list">
                            <li>Bags &amp; Handbags</li>
                            <li>Shoes &amp; Heels</li>
                            <li>Dresses &amp; Clothing</li>
                            <li>Accessories</li>
                        </ul>
                    </aside>

                    <div>
                        <ProductFilter />
                        <ProductList products={products} />
                    </div>
                </div>
            </section>
        </main>
    );
};

export default HomePage;