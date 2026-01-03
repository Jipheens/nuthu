import React from 'react';
import { useParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/products/ProductCard';

const ProductDetailPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const { products } = useProducts();
    const product = products.find((p) => p.id === productId);

    if (!product) {
        return <div>Product not found</div>;
    }

    return (
        <div>
            <h1>{product.name}</h1>
            <ProductCard product={product} />
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            {/* Additional product details can be added here */}
        </div>
    );
};

export default ProductDetailPage;