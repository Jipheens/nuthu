import React from 'react';
import { Link } from 'react-router-dom';

const DesignersPage: React.FC = () => {
    const designers = [
        { name: 'Balenciaga', description: 'Modern luxury fashion house' },
        { name: 'Rick Owens', description: 'Dark aesthetic and avant-garde designs' },
        { name: 'Chrome Hearts', description: 'Luxury accessories and jewelry' },
        { name: 'Saint Laurent', description: 'Timeless French elegance' },
        { name: 'Maison Margiela', description: 'Deconstructionist fashion' },
        { name: 'Gucci', description: 'Italian luxury and craftsmanship' },
        { name: 'Helmut Lang', description: 'Minimalist and architectural' },
        { name: 'Raf Simons', description: 'Youth culture and tailoring' },
        { name: 'Yohji Yamamoto', description: 'Japanese avant-garde' },
        { name: 'Comme des Garçons', description: 'Experimental and conceptual' },
        { name: 'Junya Watanabe', description: 'Technical innovation' },
        { name: 'Undercover', description: 'Japanese streetwear culture' },
    ];

    return (
        <main className="app-shell">
            <section className="container page-content">
                <h1 className="section-title">Featured Designers</h1>
                <p className="page-subtitle" style={{ textAlign: 'center', color: '#999', marginBottom: '3rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
                    Explore our curated selection of archive pieces from the world's most influential designers
                </p>

                <div className="designers-grid">
                    {designers.map((designer) => (
                        <Link 
                            to={`/shop?designer=${encodeURIComponent(designer.name)}`} 
                            key={designer.name}
                            className="designer-card"
                        >
                            <div className="designer-initial">{designer.name.charAt(0)}</div>
                            <h3 className="designer-name">{designer.name}</h3>
                            <p className="designer-description">{designer.description}</p>
                            <span className="designer-cta">Browse Collection →</span>
                        </Link>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <Link to="/shop" className="add-to-cart-button" style={{ padding: '0.875rem 2rem' }}>
                        View All Products
                    </Link>
                </div>
            </section>
        </main>
    );
};

export default DesignersPage;
