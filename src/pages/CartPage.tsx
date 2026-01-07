import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';
import { formatCurrency } from '../utils/formatters';
import './CartPage.css';

const CartPage: React.FC = () => {
    const { cartItems, totalAmount, updateQuantity, removeFromCart } = useCart();
    const { products } = useProducts();

    const cartProductIds = cartItems.map(item => item.id);
    const featuredProducts = products
        .filter(p => !cartProductIds.includes(p.id) && p.inStock !== false)
        .slice(0, 4);

    if (cartItems.length === 0) {
        return (
            <div className="cart-page">
                <div className="cart-empty">
                    <h1>Your cart</h1>
                    <p>Your cart is currently empty.</p>
                    <Link to="/shop" className="continue-shopping-link">
                        Continue shopping
                    </Link>
                </div>

                {featuredProducts.length > 0 && (
                    <div className="featured-collection">
                        <h2>Featured collection</h2>
                        <div className="featured-grid">
                            {featuredProducts.map(product => (
                                <Link to={`/product/${product.id}`} key={product.id} className="featured-item">
                                    <img src={product.imageUrl} alt={product.name} />
                                    <h3>{product.name}</h3>
                                    <p className="featured-price">{formatCurrency(product.price, 'KES')}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-header">
                <h1>Your cart</h1>
                <Link to="/shop" className="continue-shopping-link">
                    Continue shopping
                </Link>
            </div>

            <div className="cart-content">
                <div className="cart-table">
                    <div className="cart-table-header">
                        <div>PRODUCT</div>
                        <div>QUANTITY</div>
                        <div>TOTAL</div>
                    </div>

                    {cartItems.map(item => (
                        <div key={item.id} className="cart-item">
                            <div className="cart-item-product">
                                <img src={item.imageUrl} alt={item.name} />
                                <div className="cart-item-details">
                                    <h3>{item.name}</h3>
                                    <p className="cart-item-price">{formatCurrency(item.price, 'KES')}</p>
                                </div>
                            </div>

                            <div className="cart-item-quantity">
                                <button
                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                    className="quantity-btn"
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 1;
                                        updateQuantity(item.id, Math.max(1, val));
                                    }}
                                    className="quantity-input"
                                    min="1"
                                />
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="quantity-btn"
                                >
                                    +
                                </button>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="remove-btn"
                                    title="Remove item"
                                >
                                    🗑️
                                </button>
                            </div>

                            <div className="cart-item-total">
                                {formatCurrency(item.price * item.quantity, 'KES')}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cart-summary">
                    <h2>Estimated total</h2>
                    <p className="cart-summary-total">{formatCurrency(totalAmount, 'KES')}</p>
                    <p className="cart-summary-note">
                        Taxes, discounts and shipping calculated at checkout
                    </p>
                    <Link to="/checkout" className="checkout-btn">
                        Check out
                    </Link>
                    <div className="payment-badges">
                        <div className="badge shop-pay">Shop Pay</div>
                        <div className="badge google-pay">Google Pay</div>
                    </div>
                </div>
            </div>

            {featuredProducts.length > 0 && (
                <div className="featured-collection">
                    <h2>Featured collection</h2>
                    <div className="featured-grid">
                        {featuredProducts.map(product => (
                            <Link to={`/product/${product.id}`} key={product.id} className="featured-item">
                                <img src={product.imageUrl} alt={product.name} />
                                <h3>{product.name}</h3>
                                <p className="featured-price">{formatCurrency(product.price, 'KES')}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;