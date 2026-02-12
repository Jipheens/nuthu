import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';

interface PriceDisplayProps {
    price: number;
    originalCurrency?: 'KES' | 'USD';
    disableSmartCheck?: boolean;
    className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({ price, originalCurrency = 'USD', disableSmartCheck = false, className }) => {
    const { formatPrice } = useCurrency();
    return <span className={className}>{formatPrice(price, originalCurrency, disableSmartCheck)}</span>;
};
