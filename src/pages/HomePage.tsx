import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductList from '../components/products/ProductList';
import ProductFilter from '../components/products/ProductFilter';
import { useProducts } from '../hooks/useProducts';
import { HeroSlider } from '../components/home/HeroSlider';

const HomePage: React.FC = () => {
    const { products, loading, error } = useProducts();
    const [category, setCategory] = useState<string>('All');

    console.log('HomePage rendering:', { productsCount: products.length, loading, error });

    if (loading) {
        return <div className="container page-content" style={{ color: 'white' }}>Loading products...</div>;
    }

    if (error) {
        return <div className="container page-content" style={{ color: 'white' }}>Failed to load products.</div>;
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
            <HeroSlider />

            <section className="container page-content">
                <h2 className="section-title">Shop New Arrivals</h2>
                
                <ProductFilter activeCategory={category} onChange={setCategory} />
                <ProductList products={visibleProducts} />
            </section>
        </main>
    );
};

export default HomePage;