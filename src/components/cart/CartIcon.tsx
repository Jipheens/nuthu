import React from 'react';
import { useCart } from '../../hooks/useCart';

const CartIcon: React.FC = () => {
    const { totalItems } = useCart();

    return (
        <div className="cart-icon">
            <span className="cart-icon__count">{totalItems}</span>
            <i className="fas fa-shopping-cart"></i>
        </div>
    );
};

export default CartIcon;