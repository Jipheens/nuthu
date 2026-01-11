import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { PriceDisplay } from '../components/common/PriceDisplay';
import { useToast } from '../context/ToastContext';
import { getImageUrl } from '../utils/formatters';

const ProductDetailPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const { products } = useProducts();
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState<number>(1);
    const product = products.find((p) => p.id === productId);

    if (!product) {
        return <main className="app-shell">
            <section className="container page-content glass-panel">
                <p>Product not found.</p>
            </section>
        </main>;
    }

    const handleAddToCart = async () => {
        if (product.inStock === false) return;
        const safeQty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
        await addToCart(Number(product.id), safeQty);
    };

    const handleBuyNow = async () => {
        if (product.inStock === false) return;
        const safeQty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
        await addToCart(Number(product.id), safeQty);
        navigate('/checkout');
    };

    return (
        <main className="app-shell product-detail-shell">
            <section className="container page-content product-detail">
                <div className="product-detail-image-wrap">
                    <img src={getImageUrl(product.imageUrl)} alt={product.name} className="product-detail-image" />
                </div>
                <div className="product-detail-info">
                    <h1 className="product-detail-title">{product.name}</h1>
                    <p className="product-detail-price"><PriceDisplay priceInKES={product.price} /></p>
                    <p className="product-detail-description">{product.description}</p>
                    <div style={{ margin: '0.75rem 0' }}>
                        <label className="form-label" style={{ maxWidth: '140px' }}>
                            Quantity
                            <input
                                type="number"
                                min={1}
                                value={quantity}
                                onChange={e => setQuantity(Number(e.target.value) || 1)}
                                className="form-input"
                            />
                        </label>
                    </div>
                    <div className="product-detail-actions">
                        <button
                            className="add-to-cart-button"
                            onClick={handleAddToCart}
                            disabled={product.inStock === false}
                        >
                            {product.inStock === false ? 'Sold out' : 'Add to cart'}
                        </button>
                        {product.inStock !== false && (
                            <button
                                className="add-to-cart-button"
                                type="button"
                                style={{ marginLeft: '0.75rem', backgroundColor: '#4f46e5' }}
                                onClick={handleBuyNow}
                            >
                                Buy now
                            </button>
                        )}
                    </div>
                </div>
            </section>
    </main>
    );
};

export default ProductDetailPage;