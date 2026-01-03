import React from 'react';
import { useCart } from '../../hooks/useCart';
import './CartDrawer.css';

const CartDrawer: React.FC = () => {
    const { cartItems, totalAmount, clearCart } = useCart();

    return (
        <div className="cart-drawer">
            <h2>Your Cart</h2>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <>
                    <ul>
                        {cartItems.map(item => (
                            <li key={item.id}>
                                <span>{item.name}</span>
                                <span>${item.price.toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="cart-summary">
                        <h3>Total: ${totalAmount.toFixed(2)}</h3>
                        <button onClick={clearCart}>Clear Cart</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartDrawer;