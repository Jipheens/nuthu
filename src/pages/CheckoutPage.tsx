import React, { useEffect, useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { createPaymentIntent } from '../services/api';
import { formatCurrency, getImageUrl } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import './CheckoutPage.css';

const VERIFIED_EMAILS_KEY = 'verified_emails';

const getVerifiedEmails = (): string[] => {
    try {
        const raw = window.localStorage.getItem(VERIFIED_EMAILS_KEY);
        const parsed = raw ? (JSON.parse(raw) as unknown) : [];
        return Array.isArray(parsed)
            ? parsed.filter((x) => typeof x === 'string')
            : [];
    } catch {
        return [];
    }
};

const isEmailVerified = (value: string): boolean => {
    const normalized = value.trim().toLowerCase();
    return !!normalized && getVerifiedEmails().includes(normalized);
};

const CheckoutPage: React.FC = () => {
    const { cartItems, totalAmount, clearCart } = useCart();
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [email, setEmail] = useState<string>(user?.email ?? '');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [emailStepComplete, setEmailStepComplete] = useState<boolean>(
        !!(user?.email && isEmailVerified(user.email))
    );

    useEffect(() => {
        const currentEmail = (user?.email ?? email).trim();
        if (currentEmail && isEmailVerified(currentEmail)) {
            setEmailStepComplete(true);
            window.localStorage.setItem('customerEmail', currentEmail);
        }
    }, [user?.email, email]);

    const validateEmailFormat = (value: string) => {
        // Simple email pattern check; adjust as needed
        return /.+@.+\..+/.test(value.trim());
    };

    const handleEmailSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const trimmedEmail = email.trim();

        if (!validateEmailFormat(trimmedEmail)) {
            setEmailError('Please enter a valid email address.');
            return;
        }

        if (!isEmailVerified(trimmedEmail)) {
            setEmailError('Please verify this email (code) before continuing.');
            return;
        }

        setEmailError(null);
        window.localStorage.setItem('customerEmail', trimmedEmail);
        setEmailStepComplete(true);
    };

    const placeOrderWithoutPayment = () => {
        const customerEmail = user?.email ?? email.trim();

        const orderSnapshot = {
            totalAmount,
            currency: 'kes',
            items: cartItems.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price,
            })),
            email: customerEmail || undefined,
            paymentStatus: 'pending' as const,
        };

        window.localStorage.setItem('lastOrderSnapshot', JSON.stringify(orderSnapshot));
        clearCart();
        navigate('/checkout/success');
    };

    const handleCheckout = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!cartItems.length) return;

        if (!emailStepComplete) {
            setErrorMessage('Please verify your email before paying.');
            return;
        }

        // If Stripe isn't configured/loaded, fall back to placing the order as pending.
        if (!stripe || !elements) {
            placeOrderWithoutPayment();
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            // Persist a snapshot of the order so we can
            // record it in the database on the success page.
            const customerEmail = user?.email ?? email;

            const orderSnapshot = {
                totalAmount,
                currency: 'kes',
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                })),
                // Store the email alongside the order snapshot for later use
                email: customerEmail,
                paymentStatus: 'paid' as const,
            };
            window.localStorage.setItem('lastOrderSnapshot', JSON.stringify(orderSnapshot));

            // Create a PaymentIntent on the backend
            const clientSecret = await createPaymentIntent(totalAmount, 'kes');
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                setErrorMessage('Card input is not ready yet.');
                setIsProcessing(false);
                return;
            }

            const { error, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: cardElement,
                    },
                }
            );

            if (error) {
                setErrorMessage(error.message || 'Payment failed. Please try again.');
                setIsProcessing(false);
                return;
            }

            if (paymentIntent && paymentIntent.status === 'succeeded') {
                clearCart();
                navigate('/checkout/success');
            } else {
                setErrorMessage('Payment was not completed.');
            }
        } catch (error) {
            console.error('Checkout failed', error);
            setErrorMessage('Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="checkout-page">
                <div className="checkout-empty">
                    <h1>Your cart is empty</h1>
                    <p>Add some items to your cart before checking out.</p>
                    <a href="/shop" className="continue-shopping">Continue shopping</a>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <div className="checkout-left">
                    <h1>Checkout</h1>

                    <div className="checkout-order-summary">
                        <h2>Order Summary</h2>
                        {cartItems.map(item => (
                            <div key={item.id} className="checkout-item">
                                <img src={getImageUrl(item.imageUrl)} alt={item.name} />
                                <div className="checkout-item-details">
                                    <p className="checkout-item-name">{item.name}</p>
                                    <p className="checkout-item-qty">Qty: {item.quantity}</p>
                                </div>
                                <p className="checkout-item-price">
                                    {formatCurrency(item.price * item.quantity, 'KES')}
                                </p>
                            </div>
                        ))}
                        <div className="checkout-total-row">
                            <strong>Total:</strong>
                            <strong>{formatCurrency(totalAmount, 'KES')}</strong>
                        </div>
                    </div>
                </div>

                <div className="checkout-right">
                    {!emailStepComplete ? (
                        <div className="checkout-section">
                            <h2>Step 1: Verify your email</h2>
                            <form onSubmit={handleEmailSubmit} className="checkout-form">
                                <div className="form-group">
                                    <label className="form-label">Email address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="form-input"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="checkout-button"
                                    onClick={() => {
                                        const trimmed = email.trim();
                                        if (!trimmed) return;
                                        navigate(`/verify-email?email=${encodeURIComponent(trimmed)}`);
                                    }}
                                >
                                    Send code / Verify
                                </button>

                                {emailError && (
                                    <div className="error-message">{emailError}</div>
                                )}

                                <button type="submit" className="checkout-button">
                                    Continue to payment
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="checkout-section">
                            <div className="email-verified">
                                <h2>Step 2: Payment details</h2>
                                <div className="your-details">
                                    <p><strong>Email:</strong> {user?.email || email}</p>
                                    <button
                                        onClick={() => {
                                            setEmailStepComplete(false);
                                            setErrorMessage(null);
                                        }}
                                        className="change-email-btn"
                                        type="button"
                                    >
                                        Change
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleCheckout} className="checkout-form">
                                {!stripe && (
                                    <div className="error-message">
                                        Card payments aren’t configured yet. You can still place the order and pay later.
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">Card details</label>
                                    <div className="card-element-wrapper">
                                        <CardElement
                                            options={{
                                                style: {
                                                    base: {
                                                        fontSize: '16px',
                                                        color: '#fff',
                                                        '::placeholder': {
                                                            color: '#666',
                                                        },
                                                        backgroundColor: 'transparent',
                                                    },
                                                    invalid: {
                                                        color: '#fa755a',
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                    <p className="card-info-text">
                                        Test card: 4242 4242 4242 4242 | Any future date | Any 3-digit CVC
                                    </p>
                                </div>

                                {errorMessage && (
                                    <div className="error-message">{errorMessage}</div>
                                )}

                                <button
                                    type="submit"
                                    className="checkout-button"
                                    disabled={isProcessing || !stripe}
                                >
                                    {isProcessing ? 'Processing...' : `Pay ${formatCurrency(totalAmount, 'KES')}`}
                                </button>

                                {!stripe && (
                                    <button
                                        type="button"
                                        className="checkout-button"
                                        onClick={placeOrderWithoutPayment}
                                        disabled={isProcessing}
                                        style={{ marginTop: '0.75rem' }}
                                    >
                                        Place order (pay later)
                                    </button>
                                )}
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;