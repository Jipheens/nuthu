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
    
    // Normalize image URLs - extract just the /uploads/ path
    if (imageUrl.includes('/uploads/')) {
        // Get everything from /uploads/ onwards - use relative path
        return imageUrl.substring(imageUrl.indexOf('/uploads/'));
    }
    
    // If URL is relative (starts with /), return as-is
    if (imageUrl.startsWith('/')) {
        return imageUrl;
    }
    
    // Return as-is if it's already a full URL without /uploads/
    return imageUrl;
};