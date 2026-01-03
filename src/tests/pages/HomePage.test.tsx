import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '../../pages/HomePage';

describe('HomePage', () => {
  test('renders the homepage title', () => {
    render(<HomePage />);
    const titleElement = screen.getByText(/Welcome to Our E-Commerce Store/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders featured products section', () => {
    render(<HomePage />);
    const featuredProductsElement = screen.getByText(/Featured Products/i);
    expect(featuredProductsElement).toBeInTheDocument();
  });

  test('renders the footer', () => {
    render(<HomePage />);
    const footerElement = screen.getByText(/© 2023 E-Commerce Store/i);
    expect(footerElement).toBeInTheDocument();
  });
});