import React, { useEffect, useState } from 'react';
import { useCart } from '../hooks/useCart';
import { Link } from 'react-router-dom';
import { createOrder } from '../services/api';

const CheckoutSuccessPage: React.FC = () => {
  const { clearCart } = useCart();
  const [hasSaved, setHasSaved] = useState(false);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const raw = window.localStorage.getItem('lastOrderSnapshot');
      if (!raw) {
        clearCart();
        return;
      }

      try {
        const snapshot = JSON.parse(raw) as {
          totalAmount: number;
          currency: string;
          items: { productId: string; quantity: number; price: number }[];
          email?: string;
        };

        if (snapshot.email) {
          setCustomerEmail(snapshot.email);
          window.localStorage.setItem('customerEmail', snapshot.email);
        }

        await createOrder({
          totalAmount: snapshot.totalAmount,
          currency: snapshot.currency,
          items: snapshot.items,
          email: snapshot.email,
        });
        window.localStorage.removeItem('lastOrderSnapshot');
        clearCart();
        setHasSaved(true);
      } catch (err) {
        console.error('Failed to record order', err);
        clearCart();
      }
    };

    run();
  }, [clearCart]);

  return (
    <main className="app-shell">
      <section className="container page-content glass-panel">
        <h1 className="page-title">Payment successful</h1>
        <p className="page-subtitle">
          {hasSaved
            ? customerEmail
              ? `Thank you for your purchase. A confirmation will be sent to ${customerEmail}.`
              : 'Thank you for your purchase. Your order has been recorded.'
            : 'Thank you for your purchase. A confirmation will be sent to your email.'}
        </p>
        <p style={{ marginTop: '1rem' }}>
          <Link to="/shop" className="add-to-cart-button">
            Continue shopping
          </Link>
        </p>
      </section>
    </main>
  );
};

export default CheckoutSuccessPage;
