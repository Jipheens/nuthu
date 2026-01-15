import React, { createContext, useContext, useMemo, useState, ReactNode, useEffect } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { getImageUrl } from '../utils/formatters';

export interface CartItem {
    cartItemId: number;
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    size?: string | null;
}

interface CartContextValue {
    cartItems: CartItem[];
    totalAmount: number;
    totalItems: number;
    loading: boolean;
    addToCart: (productId: number, quantity?: number, size?: string) => Promise<void>;
    updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
    removeFromCart: (cartItemId: number) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Load cart when user logs in
    useEffect(() => {
        if (user) {
            refreshCart();
        } else {
            setCartItems([]);
        }
    }, [user]);

    const refreshCart = async () => {
        if (!user) return;
        
        try {
            setLoading(true);
            const items = await api.getCart();
            setCartItems(
                items.map(item => ({
                    cartItemId: item.cartItemId,
                    id: String(item.id),
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    imageUrl: getImageUrl(item.image_url || ''),
                    size: item.size,
                }))
            );
        } catch (error) {
            console.error('Failed to load cart:', error);
            showToast('Failed to load cart', 'error');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId: number, quantity: number = 1, size?: string) => {
        if (!user) {
            showToast('Please login to add items to cart', 'error');
            return;
        }

        try {
            await api.addToCart(productId, quantity, size);
            await refreshCart();
            showToast('Item added to cart', 'success');
        } catch (error: any) {
            console.error('Failed to add to cart:', error);
            showToast(error.response?.data?.error || 'Failed to add to cart', 'error');
        }
    };

    const updateQuantity = async (cartItemId: number, quantity: number) => {
        if (!user) return;

        try {
            await api.updateCartItem(cartItemId, quantity);
            await refreshCart();
        } catch (error) {
            console.error('Failed to update quantity:', error);
            showToast('Failed to update quantity', 'error');
        }
    };

    const removeFromCart = async (cartItemId: number) => {
        if (!user) return;

        try {
            await api.removeFromCart(cartItemId);
            await refreshCart();
            showToast('Item removed from cart', 'success');
        } catch (error) {
            console.error('Failed to remove item:', error);
            showToast('Failed to remove item', 'error');
        }
    };

    const clearCart = async () => {
        if (!user) return;

        try {
            await api.clearCart();
            setCartItems([]);
        } catch (error) {
            console.error('Failed to clear cart:', error);
            showToast('Failed to clear cart', 'error');
        }
    };

    const value: CartContextValue = useMemo(() => {
        const totalAmount = cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
        const totalItems = cartItems.reduce(
            (total, item) => total + item.quantity,
            0
        );

        return {
            cartItems,
            totalAmount,
            totalItems,
            loading,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            refreshCart,
        };
    }, [cartItems, loading, user]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default CartContext;