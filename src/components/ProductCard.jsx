import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Star, Heart, Plus, Check } from 'lucide-react';

export default function ProductCard({ product }) {
  const { formatPrice, addToCart, navigateToProduct, wishlist, toggleWishlist } = useCart();
  
  const colors = product.colors || [];
  
  // Interactive color selection inside the card
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [isSwatchesHovered, setIsSwatchesHovered] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const activeColorObj = colors[selectedColorIndex] || colors[0];
  const currentColor = activeColorObj?.name || product.selectedColor || 'Black';
  
  // Dynamically choose preview images based on the active selected color
  const colorImages = activeColorObj?.images && activeColorObj.images.length > 0
    ? activeColorObj.images
    : product.images || [];

  const primaryImg = colorImages[0]?.url || activeColorObj?.thumbnail || product.thumbnailImage;
  const secondaryImg = colorImages[1]?.url || primaryImg;

  const [imgError, setImgError] = useState(false);

  const safeUrl = (u) => (u ? u.replace(/ /g, '%20') : '');
  const verifiedPrimary = safeUrl(primaryImg) || safeUrl(product.thumbnailImage);
  const verifiedSecondary = safeUrl(secondaryImg) || verifiedPrimary;
  const safeFallback = 'https://aloyogabr.vtexassets.com/arquivos/ids/199032/A0685U_05284_b1_a1_750x.jpg';

  const showSecondary = isImageHovered && !isSwatchesHovered && secondaryImg && secondaryImg !== primaryImg;

  const displayedImg = imgError
    ? (safeUrl(product.thumbnailImage) || safeFallback)
    : (showSecondary ? verifiedSecondary : verifiedPrimary);

  const isLiked = wishlist.includes(product.id);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart({
      ...product,
      selectedColor: currentColor,
      thumbnailImage: verifiedPrimary,
      images: colorImages
    }, {
      color: currentColor,
      size: product.sizes?.[1]?.name || product.sizes?.[0]?.name || 'S',
      quantity: 1,
      thumbnail: verifiedPrimary
    });
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleCardClick = () => {
    navigateToProduct({
      ...product,
      selectedColor: currentColor,
      thumbnailImage: verifiedPrimary,
      images: colorImages
    });
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleColorSelect = (e, idx) => {
    e.stopPropagation();
    setSelectedColorIndex(idx);
    setImgError(false);
  };

  return (
    <div
      className="alo-product-card"
      onClick={handleCardClick}
    >
      {/* Image Container with Badges */}
      <div
        className="alo-card-media-wrapper"
        onMouseEnter={() => setIsImageHovered(true)}
        onMouseLeave={() => setIsImageHovered(false)}
      >
        <img
          src={displayedImg}
          alt={`${product.name} - ${currentColor}`}
          className="alo-card-img"
          loading="lazy"
          onError={() => {
            if (!imgError) setImgError(true);
          }}
        />

        {/* 70% OFF & Status Badges */}
        <div className="alo-card-badges">
          <span className="alo-badge alo-badge-sale">
            70% OFF
          </span>
          {product.isBestSeller && (
            <span className="alo-badge alo-badge-gold hidden-small-mobile">
              BEST SELLER
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          className={`alo-card-wishlist-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleWishlistClick}
          aria-label="Save to Wishlist"
        >
          <Heart size={15} fill={isLiked ? '#000' : 'none'} color={isLiked ? '#000' : '#111'} />
        </button>

        {/* Quick Add Overlay Button */}
        <button
          className={`alo-card-quick-add-btn ${addedAnimation ? 'added' : ''}`}
          onClick={handleQuickAdd}
          aria-label="Quick Add to Bag"
        >
          {addedAnimation ? (
            <>
              <Check size={14} />
              <span className="alo-quick-add-text">ADDED</span>
            </>
          ) : (
            <>
              <Plus size={14} />
              <span className="alo-quick-add-text">QUICK ADD</span>
            </>
          )}
        </button>
      </div>

      {/* Product Information */}
      <div className="alo-card-info">
        {/* Color Swatch Dots with Instant Photo Preview Changing */}
        {colors.length > 0 && (
          <div
            className="alo-card-swatches"
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setIsSwatchesHovered(true)}
            onMouseLeave={() => setIsSwatchesHovered(false)}
          >
            <div className="alo-swatches-row">
              {colors.slice(0, 5).map((col, idx) => (
                <button
                  key={idx}
                  className={`alo-swatch-dot ${selectedColorIndex === idx ? 'alo-swatch-active' : ''}`}
                  style={{ backgroundColor: col.value || '#000000' }}
                  title={col.name}
                  onClick={(e) => handleColorSelect(e, idx)}
                  onMouseEnter={() => setSelectedColorIndex(idx)}
                  aria-label={`Select color ${col.name}`}
                />
              ))}
              {colors.length > 5 && (
                <span className="alo-swatches-extra">+{colors.length - 5}</span>
              )}
            </div>
            <span className="alo-swatch-name-label hidden-small-mobile">{currentColor}</span>
          </div>
        )}

        <h3 className="alo-card-title">{product.name}</h3>

        {/* Rating and Social Proof */}
        <div className="alo-card-rating">
          <div className="alo-stars-row">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={11} fill="#111" color="#111" />
            ))}
          </div>
          <span className="alo-rating-val">{product.rating || '4.9'}</span>
          <span className="alo-review-count">({product.reviewCount || 248})</span>
        </div>

        {/* Price Row */}
        <div className="alo-card-price-row">
          <span className="alo-card-price">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="alo-card-original-price">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
