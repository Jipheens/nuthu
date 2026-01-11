import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Currency {
    code: string;
    symbol: string;
    name: string;
    rate: number; // Exchange rate relative to KES
}

const currencies: Currency[] = [
    { code: 'KES', symbol: 'KSh', name: 'Kenya | KES KSh', rate: 1 },
    { code: 'USD', symbol: '$', name: 'United States | USD $', rate: 0.0077 }, // 1 KES ≈ 0.0077 USD
    { code: 'EUR', symbol: '€', name: 'Eurozone | EUR €', rate: 0.0071 }, // 1 KES ≈ 0.0071 EUR
    { code: 'GBP', symbol: '£', name: 'United Kingdom | GBP £', rate: 0.0061 }, // 1 KES ≈ 0.0061 GBP
];

interface CurrencyContextValue {
    currency: Currency;
    setCurrency: (code: string) => void;
    convertPrice: (priceInKES: number) => number;
    formatPrice: (priceInKES: number) => string;
    currencies: Currency[];
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const CURRENCY_STORAGE_KEY = 'nuthu_selected_currency';

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currency, setCurrencyState] = useState<Currency>(() => {
        // Load saved currency from localStorage
        const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
        if (saved) {
            const found = currencies.find(c => c.code === saved);
            if (found) return found;
        }
        return currencies[0]; // Default to KES
    });

    // Save currency preference
    useEffect(() => {
        localStorage.setItem(CURRENCY_STORAGE_KEY, currency.code);
    }, [currency]);

    const setCurrency = (code: string) => {
        const found = currencies.find(c => c.code === code);
        if (found) {
            setCurrencyState(found);
        }
    };

    const convertPrice = (priceInKES: number): number => {
        return priceInKES * currency.rate;
    };

    const formatPrice = (priceInKES: number): string => {
        const converted = convertPrice(priceInKES);
        return `${currency.symbol}${converted.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const value: CurrencyContextValue = {
        currency,
        setCurrency,
        convertPrice,
        formatPrice,
        currencies,
    };

    return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = (): CurrencyContextValue => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
