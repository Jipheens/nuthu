import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    return (
        <header className="app-header">
            <div className="container app-header-inner">
                <div className="branding">OUTFIT STORE</div>
                <div className="header-search">
                    <input placeholder="Search for bags, shoes, clothes..." />
                    <button type="button">SEARCH</button>
                </div>
                <nav>
                    <ul className="nav-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/shop">Shop</Link></li>
                        <li><Link to="/cart">Cart</Link></li>
                        <li><Link to="/checkout">Checkout</Link></li>
                        <li><Link to="/manage">Manage</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;