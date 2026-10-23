import React from 'react';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export default function CategoryFilters({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalCount
}) {
  const filterOptions = [
    { label: 'ALL STYLES', value: 'all' },
    { label: '★ BEST SELLERS', value: 'bestsellers' },
    { label: 'DRESSES', value: 'Dresses & Rompers' },
    { label: 'BRAS & CROPS', value: 'Bras & Tops' },
    { label: 'LEGGINGS & SHORTS', value: 'Leggings & Bottoms' },
    { label: 'HOODIES & JACKETS', value: 'Hoodies & Jackets' },
    { label: 'ACCESSORIES', value: 'Accessories' },
  ];

  return (
    <div className="alo-filter-section" id="collection-grid">
      <div className="alo-filter-container">
        {/* Horizontal Category Chips */}
        <div className="alo-filter-pills-row">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSelectCategory(opt.value)}
              className={`alo-filter-pill ${activeCategory === opt.value ? 'active' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search, Count & Sort Controls */}
        <div className="alo-filter-controls-row">
          <div className="alo-filter-count">
            <span>Showing <strong>{totalCount}</strong> luxury styles</span>
          </div>

          <div className="alo-filter-actions">
            {/* Live Filter Search */}
            <div className="alo-filter-search-box">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search styles (e.g. Splendor, Airlift, Accolade)..."
                className="alo-filter-input"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="alo-sort-select-wrapper">
              <ArrowUpDown size={14} className="alo-sort-icon" />
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="alo-sort-select"
                aria-label="Sort products"
              >
                <option value="featured">Featured / Recommended</option>
                <option value="bestselling">Best Sellers First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated (5.0 ★)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
