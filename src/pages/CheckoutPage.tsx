import React from 'react';
import { useCart } from '../hooks/useCart';
import { useNavigate } from 'react-router-dom';

const CheckoutPage: React.FC = () => {
    const { cartItems, totalAmount } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        // Logic for handling checkout process
        // This could involve API calls to process payment, etc.
        navigate('/');
    };

    return (
        <div className="checkout-page">
            <h1>Checkout</h1>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div>
                    <h2>Your Items</h2>
                    <ul>
                        {cartItems.map(item => (
                            <li key={item.id}>
                                {item.name} - ${item.price}
                            </li>
                        ))}
                    </ul>
                    <h3>Total Amount: ${totalAmount}</h3>
                    <button onClick={handleCheckout}>Proceed to Payment</button>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;