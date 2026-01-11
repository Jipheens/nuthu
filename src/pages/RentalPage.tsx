import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const RentalPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        occasion: '',
        dates: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Rental inquiry submitted! We will contact you shortly.');
        setFormData({
            name: '',
            email: '',
            phone: '',
            occasion: '',
            dates: '',
            message: '',
        });
    };

    return (
        <main className="app-shell">
            <section className="container page-content">
                <h1 className="section-title">Designer Rental Service</h1>
                <p className="page-subtitle" style={{ textAlign: 'center', color: '#999', marginBottom: '3rem', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
                    Rent exclusive designer pieces for your special occasions. From red carpet events to editorial shoots, 
                    we provide curated archive fashion at accessible rates.
                </p>

                <div className="rental-container">
                    <div className="rental-info">
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#fff' }}>How It Works</h2>
                        
                        <div className="rental-step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h3>Browse & Inquire</h3>
                                <p>Submit a rental inquiry with your event details and preferred pieces</p>
                            </div>
                        </div>

                        <div className="rental-step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h3>Consultation</h3>
                                <p>We'll reach out to discuss availability, sizing, and rental terms</p>
                            </div>
                        </div>

                        <div className="rental-step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h3>Delivery & Return</h3>
                                <p>Pieces are delivered to you and picked up after your event</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#1a1a1a', borderLeft: '3px solid #fff' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: '#fff' }}>Rental Rates</h3>
                            <p style={{ color: '#999', fontSize: '0.875rem', margin: 0 }}>
                                Typically 20-30% of retail value for 3-day rentals. Contact us for custom quotes 
                                on specific pieces or extended rental periods.
                            </p>
                        </div>
                    </div>

                    <div className="rental-form-container">
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#fff' }}>Rental Inquiry</h2>
                        <form onSubmit={handleSubmit} className="rental-form">
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Occasion *</label>
                                <input
                                    type="text"
                                    value={formData.occasion}
                                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                                    className="form-input"
                                    placeholder="e.g., Wedding, Photoshoot, Gala"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Rental Dates *</label>
                                <input
                                    type="text"
                                    value={formData.dates}
                                    onChange={(e) => setFormData({ ...formData, dates: e.target.value })}
                                    className="form-input"
                                    placeholder="e.g., March 15-18, 2026"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Message *</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="form-input"
                                    rows={5}
                                    placeholder="Tell us about the pieces you're interested in, your sizing, and any special requirements..."
                                    required
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <button type="submit" className="add-to-cart-button" style={{ width: '100%', padding: '0.875rem' }}>
                                Submit Inquiry
                            </button>
                        </form>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <Link to="/shop" style={{ color: '#999', textDecoration: 'underline', fontSize: '0.875rem' }}>
                        Browse available pieces
                    </Link>
                </div>
            </section>
        </main>
    );
};

export default RentalPage;
