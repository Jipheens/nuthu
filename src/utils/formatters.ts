export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

export const formatDate = (date: string | Date): string => {
    return new Intl.DateTimeFormat('en-US').format(new Date(date));
};

export const truncateString = (str: string, maxLength: number): string => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
};

export const getImageUrl = (imageUrl: string | null | undefined): string => {
    if (!imageUrl) return '/placeholder.jpg';
    
    // Get API base URL from environment or use production default
    const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL?.replace('/api', '') || 'http://173.212.221.125:4000';
    
    // If URL contains localhost, replace it with production server
    if (imageUrl.includes('localhost')) {
        return imageUrl.replace(/http:\/\/localhost:\d+/, API_BASE);
    }
    
    // If URL is relative (starts with /), prepend API base
    if (imageUrl.startsWith('/')) {
        return `${API_BASE}${imageUrl}`;
    }
    
    // Return as-is if it's already a full URL
    return imageUrl;
};