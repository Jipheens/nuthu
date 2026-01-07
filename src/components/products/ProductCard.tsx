import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addToCart } = useCart();
    const { showToast } = useToast();

    const handleAddToCart = () => {
        if (product.inStock === false) return;
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            imageUrl: product.imageUrl,
        });
        showToast(`${product.name} added to cart.`, 'success');
    };

    return (
        <div className="product-card">
            <Link to={`/product/${product.id}`} className="product-image-wrap">
                <img src={product.imageUrl} alt={product.name} className="product-image" />
                {product.inStock === false && (
                    <span className="product-ribbon">Sold out</span>
                )}
            </Link>
            <div className="product-meta">
                <span>{product.category}</span>
                <span>★ ★ ★ ★ ☆</span>
            </div>
            {product.brand && (
                <div className="product-brand">{product.brand}</div>
            )}
            <h3 className="product-title">
                <Link to={`/product/${product.id}`}>{product.name}</Link>
            </h3>
            <p className="product-description">{product.description}</p>
            <div className="product-bottom-row">
                <span className="product-price">{formatCurrency(product.price, 'KES')}</span>
                <button
                    className="add-to-cart-button"
                    onClick={handleAddToCart}
                    disabled={product.inStock === false}
                >
                    {product.inStock === false ? 'Unavailable' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;