import React, { useEffect, useState } from 'react';
import { useCart } from '../hooks/useCart';
import { Link } from 'react-router-dom';
import { createOrder } from '../services/api';

const CheckoutSuccessPage: React.FC = () => {
  const { clearCart } = useCart();
  const [hasSaved, setHasSaved] = useState(false);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('paid');

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
          paymentStatus?: 'paid' | 'pending';
        };

        if (snapshot.paymentStatus) setPaymentStatus(snapshot.paymentStatus);

        if (snapshot.email) {
          setCustomerEmail(snapshot.email);
          window.localStorage.setItem('customerEmail', snapshot.email);
        }

        await createOrder({
          totalAmount: snapshot.totalAmount,
          currency: snapshot.currency,
          items: snapshot.items,
          email: snapshot.email,
          paymentStatus: snapshot.paymentStatus,
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
      <section className="container page-content" style={{ textAlign: 'center', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✓</div>
          <h1 className="section-title">
            {paymentStatus === 'pending' ? 'Order placed' : 'Payment successful'}
          </h1>
          <p className="page-subtitle" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            {hasSaved
              ? customerEmail
                ? paymentStatus === 'pending'
                  ? `Your order has been recorded. We’ll contact you at ${customerEmail} to arrange payment.`
                  : `Thank you for your purchase. A confirmation will be sent to ${customerEmail}.`
                : paymentStatus === 'pending'
                ? 'Your order has been recorded. We’ll contact you to arrange payment.'
                : 'Thank you for your purchase. Your order has been recorded.'
              : paymentStatus === 'pending'
              ? 'Your order has been recorded. We’ll contact you to arrange payment.'
              : 'Thank you for your purchase. A confirmation will be sent to your email.'}
          </p>
          <Link to="/shop" className="add-to-cart-button" style={{ display: 'inline-block', padding: '0.875rem 2rem' }}>
            Continue shopping
          </Link>
        </div>
      </section>
    </main>
  );
};

export default CheckoutSuccessPage;
