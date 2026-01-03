import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductCard from '../../components/products/ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: 1,
    name: 'Stylish Outfit',
    price: 49.99,
    imageUrl: 'http://example.com/image.jpg',
  };

  test('renders product name', () => {
    render(<ProductCard product={mockProduct} />);
    const productName = screen.getByText(mockProduct.name);
    expect(productName).toBeInTheDocument();
  });

  test('renders product price', () => {
    render(<ProductCard product={mockProduct} />);
    const productPrice = screen.getByText(`$${mockProduct.price.toFixed(2)}`);
    expect(productPrice).toBeInTheDocument();
  });

  test('renders product image', () => {
    render(<ProductCard product={mockProduct} />);
    const productImage = screen.getByAltText(mockProduct.name);
    expect(productImage).toHaveAttribute('src', mockProduct.imageUrl);
  });
});