import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useCart } from '../../hooks/useCart';
import { PriceDisplay } from '../common/PriceDisplay';
import { getImageUrl } from '../../utils/formatters';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addToCart } = useCart();

    const handleAddToCart = async () => {
        if (product.inStock === false) return;
        await addToCart(Number(product.id), 1);
    };

    return (
        <div className="product-card">
            <Link to={`/product/${product.id}`} className="product-image-wrap">
                <img src={getImageUrl(product.imageUrl)} alt={product.name} className="product-image" />
                {product.inStock === false && (
                    <span className="product-ribbon">Sold out</span>
                )}
            </Link>
            <div className="product-info">
                <h3 className="product-title">
                    <Link to={`/product/${product.id}`}>{product.name}</Link>
                </h3>
                <div className="product-bottom-row">
                    <span className="product-price">Regular price <PriceDisplay price={product.price} /></span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;