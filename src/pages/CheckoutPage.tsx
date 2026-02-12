import React, { useEffect, useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { createCheckoutSession } from '../services/api';
import { formatCurrency, getImageUrl } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { PriceDisplay } from '../components/common/PriceDisplay';
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
    const { cartItems, clearCart } = useCart();
    const { convertPrice } = useCurrency();

    // Recalculate totals locally to handle mixed currency (legacy KES vs new USD)
    const subtotalUSD = cartItems.reduce((sum, item) => {
        let price = item.price;
        // Smart check: If price > 2000, assumes it's legacy KES and converts to USD
        if (price > 2000) {
            price = convertPrice(price, 'KES');
        }
        return sum + (price * item.quantity);
    }, 0);

    const shippingUSD = 45;
    const totalUSD = subtotalUSD + shippingUSD;

    const navigate = useNavigate();

    // Create normalized cart items for API calls (converting legacy KES prices to USD)
    const normalizedCartItems = cartItems.map(item => {
        let price = item.price;
        if (price > 2000) {
            price = convertPrice(price, 'KES');
        }
        return { ...item, price };
    });

    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [email, setEmail] = useState<string>(user?.email ?? '');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [emailStepComplete, setEmailStepComplete] = useState<boolean>(
        !!(user?.email && isEmailVerified(user.email))
    );

    const [shippingAddress, setShippingAddress] = useState('');
    const [shippingCity, setShippingCity] = useState('');
    const [shippingState, setShippingState] = useState('');
    const [shippingZip, setShippingZip] = useState('');
    const [shippingCountry, setShippingCountry] = useState('Kenya');
    const [phoneNumber, setPhoneNumber] = useState('');

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

        if (!shippingAddress || !shippingCity || !phoneNumber) {
            setErrorMessage('Please fill in all required shipping details.');
            return;
        }

        const orderSnapshot = {
            totalAmount: totalUSD,
            currency: 'USD',
            shipping_fee: shippingUSD,
            items: normalizedCartItems.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price,
            })),
            email: customerEmail || undefined,
            paymentStatus: 'pending' as const,
            shipping_address: shippingAddress,
            shipping_city: shippingCity,
            shipping_state: shippingState,
            shipping_zip: shippingZip,
            shipping_country: shippingCountry,
            phone_number: phoneNumber
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

        if (!shippingAddress || !shippingCity || !phoneNumber) {
            setErrorMessage('Please fill in all required shipping details.');
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            // Persist a snapshot of the order so we can record it on the success page.
            // We mark it as pending until we confirm Stripe session payment status.
            const customerEmail = (user?.email ?? email).trim();

            const orderSnapshot = {
                totalAmount: totalUSD,
                currency: 'USD',
                shipping_fee: shippingUSD,

                items: normalizedCartItems.map((item) => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                })),
                email: customerEmail,
                paymentStatus: 'pending' as const,
                shipping_address: shippingAddress,
                shipping_city: shippingCity,
                shipping_state: shippingState,
                shipping_zip: shippingZip,
                shipping_country: shippingCountry,
                phone_number: phoneNumber
            };
            window.localStorage.setItem('lastOrderSnapshot', JSON.stringify(orderSnapshot));

            const { url } = await createCheckoutSession(
                normalizedCartItems.map((item) => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                })),
                customerEmail,
                orderSnapshot
            );


            // Redirect to Stripe-hosted Checkout (shipping + billing UI)
            window.location.assign(url);
        } catch (error) {
            console.error('Checkout failed', error);
            setErrorMessage('Unable to start checkout. Please try again.');
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
                        {cartItems.map((item) => (
                            <div key={item.id} className="checkout-item">
                                <img src={getImageUrl(item.imageUrl)} alt={item.name} />
                                <div className="checkout-item-details">
                                    <p className="checkout-item-name">{item.name}</p>
                                    <p className="checkout-item-qty">Qty: {item.quantity}</p>
                                </div>
                                <p className="checkout-item-price">
                                    <PriceDisplay price={item.price * item.quantity} />
                                </p>
                            </div>
                        ))}
                        <div className="checkout-total-row">
                            <span>Subtotal:</span>
                            <span><PriceDisplay price={subtotalUSD} disableSmartCheck /></span>
                        </div>
                        <div className="checkout-total-row">
                            <span>Shipping:</span>
                            <span><PriceDisplay price={shippingUSD} disableSmartCheck /></span>
                        </div>
                        <div className="checkout-total-row">
                            <strong>Total:</strong>
                            <strong><PriceDisplay price={totalUSD} disableSmartCheck /></strong>
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
                                        navigate(
                                            `/verify-email?email=${encodeURIComponent(trimmed)}&next=/checkout`
                                        );
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
                                    <p>
                                        <strong>Email:</strong> {user?.email || email}
                                    </p>
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
                                <div className="shipping-details">
                                    <h3>Shipping Address</h3>
                                    <div className="form-group">
                                        <label className="form-label">Address</label>
                                        <input
                                            type="text"
                                            value={shippingAddress}
                                            onChange={(e) => setShippingAddress(e.target.value)}
                                            className="form-input"
                                            placeholder="House No, Street name"
                                            required
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">City</label>
                                            <input
                                                type="text"
                                                value={shippingCity}
                                                onChange={(e) => setShippingCity(e.target.value)}
                                                className="form-input"
                                                placeholder="Nairobi"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                className="form-input"
                                                placeholder="+254..."
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">State / Province</label>
                                            <input
                                                type="text"
                                                value={shippingState}
                                                onChange={(e) => setShippingState(e.target.value)}
                                                className="form-input"
                                                placeholder="Nairobi County"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">ZIP / Postal Code</label>
                                            <input
                                                type="text"
                                                value={shippingZip}
                                                onChange={(e) => setShippingZip(e.target.value)}
                                                className="form-input"
                                                placeholder="00100"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Country</label>
                                        <input
                                            type="text"
                                            value={shippingCountry}
                                            onChange={(e) => setShippingCountry(e.target.value)}
                                            className="form-input"
                                            placeholder="Kenya"
                                            required
                                        />
                                    </div>
                                </div>

                                <p className="test-card-info" style={{ marginTop: '1.5rem' }}>
                                    You’ll be redirected to a secure payment page to complete your payment.
                                </p>


                                {errorMessage && (
                                    <div className="error-message">{errorMessage}</div>
                                )}

                                <button
                                    type="submit"
                                    className={`checkout-button ${isProcessing ? 'processing' : ''}`}
                                    disabled={isProcessing}
                                >
                                    {isProcessing
                                        ? 'Redirecting...'
                                        : 'Continue to secure checkout'}
                                </button>

                                <div style={{ marginTop: '1rem' }}>
                                    <button
                                        type="button"
                                        className="checkout-secondary"
                                        onClick={placeOrderWithoutPayment}
                                        disabled={isProcessing}
                                    >
                                        Place order (pay later)
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;