import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';

const Footer: React.FC = () => {
    const [email, setEmail] = useState('');
    const { currency, setCurrency, currencies } = useCurrency();

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle email subscription
        console.log('Subscribing email:', email);
        setEmail('');
    };

    return (
        <footer className="app-footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Navigation */}
                    <div className="footer-nav-section">
                        <Link to="/" className="footer-link">Home</Link>
                        <Link to="/shop" className="footer-link">Shop</Link>
                        <Link to="/designers" className="footer-link">Designers</Link>
                        <Link to="/rental" className="footer-link">Rental</Link>
                        <Link to="/appointment" className="footer-link">Book By Appointment</Link>
                    </div>

                    {/* Center - Notice */}
                    <div className="footer-center">
                        <p className="footer-notice">All Sales are final</p>
                    </div>

                    {/* Right - Brand */}
                    <div className="footer-brand">
                        <h2 className="footer-brand-name">Archivesbybilly</h2>
                    </div>
                </div>

                {/* Email Subscription */}
                <div className="footer-subscribe">
                    <h3 className="footer-subtitle">Subscribe to our emails</h3>
                    <form onSubmit={handleSubscribe} className="footer-newsletter">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="footer-email-input"
                            required
                        />
                        <button type="submit" className="footer-submit-btn" aria-label="Subscribe">→</button>
                    </form>
                </div>

                {/* Bottom Row */}
                <div className="footer-bottom">
                    <div className="footer-country">
                        <h4>Country/region</h4>
                        <select 
                            value={currency.code} 
                            onChange={(e) => setCurrency(e.target.value)}
                            className="footer-currency-select"
                        >
                            {currencies.map(curr => (
                                <option key={curr.code} value={curr.code}>
                                    {curr.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="footer-payment">
                        <span className="payment-tile payment-amex" aria-label="American Express">
                            <svg viewBox="0 0 64 24" aria-hidden="true" focusable="false">
                                <text x="32" y="16" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="12" fill="#fff" letterSpacing="1">AMEX</text>
                            </svg>
                        </span>

                        <span className="payment-tile" aria-label="Apple Pay">
                            <svg viewBox="0 0 64 24" aria-hidden="true" focusable="false">
                                <text x="22" y="16" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="14" fill="#111"></text>
                                <text x="40" y="16" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="12" fill="#111">Pay</text>
                            </svg>
                        </span>

                        <span className="payment-tile" aria-label="Bancontact">
                            <svg viewBox="0 0 64 24" aria-hidden="true" focusable="false">
                                <rect x="8" y="6" width="48" height="12" rx="3" fill="#0B5FFF" />
                                <rect x="28" y="6" width="28" height="12" rx="3" fill="#FFCC00" opacity="0.95" />
                                <text x="32" y="16" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="10" fill="#0B5FFF">BC</text>
                            </svg>
                        </span>

                        <span className="payment-tile" aria-label="Diners Club">
                            <svg viewBox="0 0 64 24" aria-hidden="true" focusable="false">
                                <circle cx="32" cy="12" r="9" fill="#1E66D0" />
                                <circle cx="32" cy="12" r="6" fill="#fff" opacity="0.9" />
                                <text x="32" y="16" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="10" fill="#1E66D0">D</text>
                            </svg>
                        </span>

                        <span className="payment-tile" aria-label="Discover">
                            <svg viewBox="0 0 64 24" aria-hidden="true" focusable="false">
                                <path d="M10 17c9-8 35-8 44 0" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
                                <text x="32" y="14" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="9" fill="#111" letterSpacing="0.5">DISCOVER</text>
                            </svg>
                        </span>

                        <span className="payment-tile" aria-label="Google Pay">
                            <svg viewBox="0 0 64 24" aria-hidden="true" focusable="false">
                                <text x="20" y="16" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="12" fill="#4285F4">G</text>
                                <rect x="15" y="18" width="10" height="2" fill="#EA4335" />
                                <rect x="25" y="18" width="10" height="2" fill="#FBBC05" />
                                <rect x="35" y="18" width="10" height="2" fill="#34A853" />
                                <text x="42" y="16" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="10" fill="#111">Pay</text>
                            </svg>
                        </span>

                        <span className="payment-tile" aria-label="Mastercard">
                            <svg viewBox="0 0 64 24" aria-hidden="true" focusable="false">
                                <circle cx="28" cy="12" r="8" fill="#EB001B" />
                                <circle cx="36" cy="12" r="8" fill="#F79E1B" />
                                <circle cx="32" cy="12" r="8" fill="#FF5F00" opacity="0.75" />
                            </svg>
                        </span>

                        <span className="payment-tile" aria-label="PayPal">
                            <svg viewBox="0 0 64 24" aria-hidden="true" focusable="false">
                                <path d="M22 7h9c4 0 6 2 5 5-1 4-4 5-8 5h-4l-1 5h-4l3-15z" fill="#003087" />
                                <path d="M26 9h4c2 0 3 1 3 2 0 2-2 3-4 3h-3l0-5z" fill="#009CDE" opacity="0.95" />
                            </svg>
                        </span>

                        <span className="payment-tile payment-shop" aria-label="Shop Pay">
                            <svg viewBox="0 0 64 24" aria-hidden="true" focusable="false">
                                <text x="32" y="16" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="12" fill="#fff">shop</text>
                            </svg>
                        </span>

                        <span className="payment-tile" aria-label="Visa">
                            <svg viewBox="0 0 64 24" aria-hidden="true" focusable="false">
                                <text x="32" y="16" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="13" fill="#1A1F71" letterSpacing="1">VISA</text>
                            </svg>
                        </span>
                    </div>

                    <div className="footer-copyright">
                        <p>&copy; {new Date().getFullYear()}, Archivesbybilly</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;