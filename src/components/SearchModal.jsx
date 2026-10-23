import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { Search, X, Star, ArrowRight } from 'lucide-react';
import productsData from '../data/products.json';

const POPULAR_SEARCHES = ['Splendor Dress', 'Airlift Legging', 'Accolade Hoodie', 'Heart Throb Bra', 'Real Deal Short', 'Sunset Sneaker'];

export default function SearchModal({ isOpen, onClose }) {
  const { navigateToProduct, formatPrice } = useCart();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? productsData.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8)
    : [];

  const handleSelectProduct = (p) => {
    onClose();
    navigateToProduct(p);
  };

  return (
    <div className="alo-modal-backdrop" onClick={onClose}>
      <div className="alo-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="alo-search-input-row">
          <Search size={22} className="alo-search-icon" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product name, fabric, or style..."
            className="alo-search-main-input"
          />
          <button className="alo-icon-btn" onClick={onClose} aria-label="Close search">
            <X size={22} />
          </button>
        </div>

        {/* Popular Searches */}
        {!query.trim() && (
          <div className="alo-search-suggestions">
            <span className="alo-search-suggest-title">POPULAR SEARCHES</span>
            <div className="alo-search-tags-row">
              {POPULAR_SEARCHES.map((tag) => (
                <button
                  key={tag}
                  className="alo-search-tag"
                  onClick={() => setQuery(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {query.trim() && (
          <div className="alo-search-results">
            <div className="alo-search-results-header">
              <span>{filtered.length} styles found for "{query}"</span>
            </div>

            {filtered.length === 0 ? (
              <div className="alo-search-empty">
                <p>No styles found matching "{query}".</p>
                <span className="alo-search-empty-sub">Try searching for "Dress", "Hoodie", "Bra", or "Legging".</span>
              </div>
            ) : (
              <div className="alo-search-results-grid">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    className="alo-search-item"
                    onClick={() => handleSelectProduct(item)}
                  >
                    <img
                      src={item.thumbnailImage || item.images?.[0]?.url}
                      alt={item.name}
                      className="alo-search-item-img"
                    />
                    <div className="alo-search-item-details">
                      <span className="alo-search-item-cat">{item.category}</span>
                      <h4 className="alo-search-item-name">{item.name}</h4>
                      <div className="alo-search-item-price-row">
                        <span className="alo-search-item-price">{formatPrice(item.price)}</span>
                        {item.originalPrice && (
                          <span className="alo-search-item-old-price">{formatPrice(item.originalPrice)}</span>
                        )}
                      </div>
                    </div>
                    <ArrowRight size={16} className="alo-search-item-arrow" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
