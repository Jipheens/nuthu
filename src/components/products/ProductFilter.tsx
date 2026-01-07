import React from 'react';

interface ProductFilterProps {
    activeCategory: string;
    onChange: (category: string) => void;
}

const CATEGORIES = ['All', 'Bags', 'Shoes', 'Clothes', 'Accessories'];

const ProductFilter: React.FC<ProductFilterProps> = ({ activeCategory, onChange }) => {
    return (
        <div className="filter-chips-row">
            {CATEGORIES.map((cat) => (
                <button
                    key={cat}
                    className={
                        'filter-chip' + (activeCategory === cat ? ' filter-chip-active' : '')
                    }
                    onClick={() => onChange(cat)}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
};

export default ProductFilter;