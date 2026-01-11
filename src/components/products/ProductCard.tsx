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
            <div className="product-info">
                <h3 className="product-title">
                    <Link to={`/product/${product.id}`}>{product.name}</Link>
                </h3>
                <div className="product-bottom-row">
                    <span className="product-price">Regular price {formatCurrency(product.price, 'KES')}</span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;