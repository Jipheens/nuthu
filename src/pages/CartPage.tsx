import React from 'react';
import { useCart } from '../hooks/useCart';
import './CartPage.css';

const CartPage: React.FC = () => {
    const { cartItems, totalAmount } = useCart();

    return (
        <div className="cart-page">
            <h1>Your Shopping Cart</h1>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div>
                    <ul>
                        {cartItems.map(item => (
                            <li key={item.id}>
                                <span>{item.name}</span> x <span>{item.quantity}</span> -
                                <span> ${item.price.toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                    <h2>Total Amount: ${totalAmount.toFixed(2)}</h2>
                </div>
            )}
        </div>
    );
};

export default CartPage;