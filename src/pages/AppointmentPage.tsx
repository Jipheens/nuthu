import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AppointmentPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        purpose: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Appointment request submitted! We will confirm your booking via email.');
        setFormData({
            name: '',
            email: '',
            phone: '',
            date: '',
            time: '',
            purpose: '',
            message: '',
        });
    };

    return (
        <main className="app-shell">
            <section className="container page-content">
                <h1 className="section-title">Book By Appointment</h1>
                <p className="page-subtitle" style={{ textAlign: 'center', color: '#999', marginBottom: '3rem', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
                    Experience personalized styling and exclusive access to our archive collection. 
                    Book a private appointment at our showroom or arrange a virtual consultation.
                </p>

                <div className="appointment-container">
                    <div className="appointment-info">
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#fff' }}>What to Expect</h2>
                        
                        <div className="appointment-feature">
                            <div className="feature-icon">👔</div>
                            <div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#fff' }}>Personal Styling</h3>
                                <p style={{ color: '#999', fontSize: '0.875rem', margin: 0 }}>
                                    One-on-one consultation with our styling experts
                                </p>
                            </div>
                        </div>

                        <div className="appointment-feature">
                            <div className="feature-icon">🏛️</div>
                            <div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#fff' }}>Private Viewing</h3>
                                <p style={{ color: '#999', fontSize: '0.875rem', margin: 0 }}>
                                    Exclusive access to pieces not available online
                                </p>
                            </div>
                        </div>

                        <div className="appointment-feature">
                            <div className="feature-icon">✨</div>
                            <div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#fff' }}>Expert Guidance</h3>
                                <p style={{ color: '#999', fontSize: '0.875rem', margin: 0 }}>
                                    Learn about the history and authenticity of archive pieces
                                </p>
                            </div>
                        </div>

                        <div className="appointment-feature">
                            <div className="feature-icon">📦</div>
                            <div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#fff' }}>Custom Sourcing</h3>
                                <p style={{ color: '#999', fontSize: '0.875rem', margin: 0 }}>
                                    Request specific pieces or collections you're looking for
                                </p>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#1a1a1a', borderLeft: '3px solid #fff' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: '#fff' }}>Visit Us</h3>
                            <p style={{ color: '#999', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>
                                <strong style={{ color: '#fff' }}>Nuthu Archive Showroom</strong><br />
                                By appointment only<br />
                                Tuesday - Saturday, 11AM - 7PM<br />
                                Location details provided upon confirmation
                            </p>
                        </div>
                    </div>

                    <div className="appointment-form-container">
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#fff' }}>Request an Appointment</h2>
                        <form onSubmit={handleSubmit} className="appointment-form">
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
                                <label className="form-label">Phone Number *</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Preferred Date *</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Preferred Time *</label>
                                <select
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="form-input"
                                    required
                                >
                                    <option value="">Select a time</option>
                                    <option value="11:00 AM">11:00 AM</option>
                                    <option value="12:00 PM">12:00 PM</option>
                                    <option value="1:00 PM">1:00 PM</option>
                                    <option value="2:00 PM">2:00 PM</option>
                                    <option value="3:00 PM">3:00 PM</option>
                                    <option value="4:00 PM">4:00 PM</option>
                                    <option value="5:00 PM">5:00 PM</option>
                                    <option value="6:00 PM">6:00 PM</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Purpose of Visit *</label>
                                <select
                                    value={formData.purpose}
                                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                    className="form-input"
                                    required
                                >
                                    <option value="">Select purpose</option>
                                    <option value="browsing">General Browsing</option>
                                    <option value="styling">Personal Styling</option>
                                    <option value="specific">Looking for Specific Pieces</option>
                                    <option value="sourcing">Custom Sourcing Request</option>
                                    <option value="rental">Rental Inquiry</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Additional Information</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="form-input"
                                    rows={4}
                                    placeholder="Let us know about your style preferences, sizing, or specific designers you're interested in..."
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <button type="submit" className="add-to-cart-button" style={{ width: '100%', padding: '0.875rem' }}>
                                Request Appointment
                            </button>

                            <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#666', textAlign: 'center' }}>
                                We'll confirm your appointment within 24 hours
                            </p>
                        </form>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <Link to="/shop" style={{ color: '#999', textDecoration: 'underline', fontSize: '0.875rem' }}>
                        Browse our collection
                    </Link>
                </div>
            </section>
        </main>
    );
};

export default AppointmentPage;
