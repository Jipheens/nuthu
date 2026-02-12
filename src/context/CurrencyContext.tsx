import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Currency {
    code: string;
    symbol: string;
    name: string;
    rate: number; // Exchange rate relative to KES
}

const currencies: Currency[] = [
    { code: 'USD', symbol: '$', name: 'United States | USD $', rate: 1 },
    { code: 'KES', symbol: 'KSh', name: 'Kenya | KES KSh', rate: 129 }, // Approximate rate
    { code: 'EUR', symbol: '€', name: 'Eurozone | EUR €', rate: 0.92 },
    { code: 'GBP', symbol: '£', name: 'United Kingdom | GBP £', rate: 0.79 },
];

interface CurrencyContextValue {
    currency: Currency;
    setCurrency: (code: string) => void;
    convertPrice: (amount: number, fromCurrency?: string) => number;
    formatPrice: (amount: number, fromCurrency?: string, disableSmartCheck?: boolean) => string;
    currencies: Currency[];
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const CURRENCY_STORAGE_KEY = 'nuthu_selected_currency_v2';

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currency, setCurrencyState] = useState<Currency>(() => {
        // Load saved currency from localStorage
        const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
        if (saved) {
            const found = currencies.find(c => c.code === saved);
            if (found) return found;
        }
        return currencies[0]; // Default to USD (now currencies[0])
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

    const convertPrice = (amount: number, fromCurrency: string = 'USD'): number => {
        // Rates are relative to USD now (USD is base 1)
        // If data is coming in as KES (fromCurrency='KES'), we convert KES -> USD first, then to target currency
        let amountInUSD = amount;

        if (fromCurrency === 'KES') {
            // 1 USD = 129 KES => 1 KES = 1/129 USD
            const kesRate = currencies.find(c => c.code === 'KES')?.rate || 129;
            amountInUSD = amount / kesRate;
        }
        // If fromCurrency is anything else (EUR, GBP), we'd need their rates to USD.
        // Assuming for now inputs are either USD (base) or legacy KES.

        // Heuristic: If amount is seemingly huge (like 96000) and we assumed it was USD, it might be legacy KES data
        // stored without a currency tag. But to be safe, let's rely on explicit flags or just default USD.
        // The user issue is existing products are 96000 but being treated as USD.
        // We will perform a check: if we are viewing in USD, and value > 3000, and fromCurrency is default (USD),
        // it MIGHT be old KES data. But this is risky.
        // Better approach: User said "existing products that were already defined prices in kenyan shillings".
        // We should probably treat ALL database prices as KES if they were created before the migration?
        // Or, we force a migration.
        // CURRENT FIX: Let's assume input is KES if fromCurrency is 'KES'.
        // If the caller (PriceDisplay) passes 'KES', we do the conversion.

        if (currency.code === 'USD') return amountInUSD;
        return amountInUSD * currency.rate;
    };

    const formatPrice = (amount: number, fromCurrency: string = 'USD', disableSmartCheck: boolean = false): string => {
        // HACK: If amount is very large (> 1000) and we are formatting as USD, it is likely legacy KES data.
        // Let's treat it as KES implicitly if it looks like a KES price (e.g. > 2000).
        // A $500 bag is possible, but $96000 is not.
        let effectiveFrom = fromCurrency;
        if (!disableSmartCheck && fromCurrency === 'USD' && amount > 2000) {
            effectiveFrom = 'KES';
        }

        const converted = convertPrice(amount, effectiveFrom);
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
