import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';

interface PriceDisplayProps {
    priceInKES: number;
    className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({ priceInKES, className }) => {
    const { formatPrice } = useCurrency();
    return <span className={className}>{formatPrice(priceInKES)}</span>;
};
