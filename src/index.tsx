import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ProductsProvider } from './context/ProductsContext';
import { ToastProvider } from './context/ToastContext';
import { CurrencyProvider } from './context/CurrencyContext';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

console.log('React app starting...');

root.render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <CurrencyProvider>
          <ProductsProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </ProductsProvider>
        </CurrencyProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);