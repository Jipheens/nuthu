import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useProductsContext } from '../context/ProductsContext';
import { formatCurrency } from '../utils/formatters';
import { uploadProductImage } from '../services/api';
import { useToast } from '../context/ToastContext';

const ManageProductsPage: React.FC = () => {
  const { products, addProduct, deleteProduct } = useProductsContext();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Bags');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    let imageUrlToUse = 'https://via.placeholder.com/300x300?text=Item';

    if (imageFile) {
      try {
        imageUrlToUse = await uploadProductImage(imageFile);
      } catch (uploadErr) {
        console.error('Failed to upload image', uploadErr);
        showToast('Failed to upload image. Please try again.', 'error');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await addProduct({
        name,
        brand: brand || undefined,
        description,
        price: Number(price),
        category,
        imageUrl: imageUrlToUse,
      });

      showToast('Product created successfully.', 'success');

      setName('');
      setBrand('');
      setPrice('');
      setCategory('Bags');
      setImageFile(null);
      setDescription('');
    } catch (err: unknown) {
      let message = 'Failed to create product.';

      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as any;
        message =
          axiosErr.response?.data?.message ||
          axiosErr.response?.data?.error ||
          message;
      }

      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
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
                <label>Brand / designer (optional)</label>
                <input
                  placeholder="e.g. Your Label Name"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
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
              <button className="add-to-cart-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Add Product'}
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
                    <span>{formatCurrency(p.price, 'KES')}</span>
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
