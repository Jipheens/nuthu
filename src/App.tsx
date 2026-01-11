import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ManageProductsPage from './pages/ManageProductsPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import DesignersPage from './pages/DesignersPage';
import RentalPage from './pages/RentalPage';
import AppointmentPage from './pages/AppointmentPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const stripePromise = loadStripe(
  (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY as string
);

const App: React.FC = () => {
  console.log('App component rendering');
  
  return (
  <Router>
    <Header />
    <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/shop" element={<ShopPage />} />
    <Route path="/product/:productId" element={<ProductDetailPage />} />
    <Route path="/cart" element={<CartPage />} />
    <Route
      path="/checkout"
      element={
      <Elements stripe={stripePromise}>
        <CheckoutPage />
      </Elements>
      }
    />
    <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
    <Route path="/manage" element={<ManageProductsPage />} />
    <Route path="/designers" element={<DesignersPage />} />
    <Route path="/rental" element={<RentalPage />} />
    <Route path="/appointment" element={<AppointmentPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    </Routes>
    <Footer />
  </Router>
  );
};

export default App;