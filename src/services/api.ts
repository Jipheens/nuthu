import axios from 'axios';

const API_BASE_URL = 'https://api.example.com'; // Replace with your actual API base URL

export const fetchProducts = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/products`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching products: ' + error.message);
    }
};

export const fetchProductById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/products/${id}`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching product: ' + error.message);
    }
};

export const addToCart = async (productId, quantity) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/cart`, { productId, quantity });
        return response.data;
    } catch (error) {
        throw new Error('Error adding to cart: ' + error.message);
    }
};

export const fetchCart = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/cart`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching cart: ' + error.message);
    }
};