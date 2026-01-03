import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useProductsContext } from '../context/ProductsContext';

const ManageProductsPage: React.FC = () => {
  const { products, addProduct, deleteProduct } = useProductsContext();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Bags');
  const [imageData, setImageData] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    const imageUrlToUse = imageData || 'https://via.placeholder.com/300x300?text=Item';

    addProduct({
      name,
      description,
      price: Number(price),
      category,
      imageUrl: imageUrlToUse,
    });

    setName('');
    setPrice('');
    setCategory('Bags');
    setImageData(null);
    setDescription('');
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageData(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="app-shell">
      <section className="container page-content glass-panel">
        <h1 className="page-title">Manage Products</h1>
        <p className="page-subtitle">Quickly add or remove items that appear on your shop pages.</p>

        <div className="manage-layout">
          <div className="manage-card">
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Add new item</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
              <div className="manage-form-field">
                <label>Product name</label>
                <input
                  placeholder="e.g. Leather Tote Bag"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="manage-form-field">
                <label>Price (KES)</label>
                <input
                  placeholder="e.g. 3500"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>
              <div className="manage-form-field">
                <label>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="Bags">Bags</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Clothes">Clothes</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
              <div className="manage-form-field">
                    <label>Image file (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
              </div>
              <div className="manage-form-field">
                <label>Short description (optional)</label>
                <textarea
                  placeholder="Describe this item in a sentence or two"
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              <button className="add-to-cart-button" type="submit">
                Add Product
              </button>
            </form>
          </div>

          <div>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Current items</h3>
            <div className="manage-products-grid">
          {products.map(p => (
            <div key={p.id} className="product-card">
              <img src={p.imageUrl} alt={p.name} className="product-image" />
              <div className="product-meta">
                <span className="pill-badge">{p.category}</span>
                <span>KES {p.price.toFixed(2)}</span>
              </div>
              <h3 className="product-title">{p.name}</h3>
              <button
                type="button"
                style={{ marginTop: '0.25rem', background: '#f44336' }}
                className="add-to-cart-button"
                onClick={() => deleteProduct(p.id)}
              >
                Delete
              </button>
            </div>
          ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ManageProductsPage;
