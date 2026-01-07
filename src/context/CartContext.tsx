import React, { createContext, useContext, useMemo, useReducer, ReactNode } from 'react';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
}

interface CartState {
    cartItems: CartItem[];
}

interface CartContextValue {
    cartItems: CartItem[];
    totalAmount: number;
    totalItems: number;
    addToCart: (item: CartItem) => void;
    updateQuantity: (id: string, quantity: number) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const initialState: CartState = {
    cartItems: [],
};

type CartAction =
    | { type: 'ADD_ITEM'; payload: CartItem }
    | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
    | { type: 'REMOVE_ITEM'; payload: { id: string } }
    | { type: 'CLEAR_CART' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existing = state.cartItems.find(item => item.id === action.payload.id);
            if (existing) {
                return {
                    cartItems: state.cartItems.map(item =>
                        item.id === action.payload.id
                            ? { ...item, quantity: item.quantity + action.payload.quantity }
                            : item
                    ),
                };
            }
            return {
                cartItems: [...state.cartItems, action.payload],
            };
        }
        case 'UPDATE_QUANTITY': {
            return {
                cartItems: state.cartItems.map(item =>
                    item.id === action.payload.id
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                ),
            };
        }
        case 'REMOVE_ITEM': {
            return {
                cartItems: state.cartItems.filter(item => item.id !== action.payload.id),
            };
        }
        case 'CLEAR_CART':
            return initialState;
        default:
            return state;
    }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    const addToCart = (item: CartItem) => {
        dispatch({ type: 'ADD_ITEM', payload: item });
    };

    const updateQuantity = (id: string, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    };

    const removeFromCart = (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const value: CartContextValue = useMemo(() => {
        const totalAmount = state.cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
        const totalItems = state.cartItems.reduce(
            (total, item) => total + item.quantity,
            0
        );

        return {
            cartItems: state.cartItems,
            totalAmount,
            totalItems,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
        };
    }, [state.cartItems]);

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