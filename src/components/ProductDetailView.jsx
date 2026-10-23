import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Check,
  Heart,
  Ruler,
  Clock,
  ArrowLeft,
  Flame,
  Maximize2,
  X
} from 'lucide-react';
import productsData from '../data/products.json';

export default function ProductDetailView({ product, onBackToStore }) {
  const {
    formatPrice,
    addToCart,
    navigateToCheckout,
    wishlist,
    toggleWishlist,
    setIsSizeGuideOpen,
    navigateToProduct
  } = useCart();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    product.selectedColor || product.colors?.[0]?.name || 'Black'
  );
  const [selectedSize, setSelectedSize] = useState('S');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Gallery slider ref & drag tracking
  const sliderRef = useRef(null);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const isDragging = useRef(false);

  // Accordion open/close states
  const [openAccordions, setOpenAccordions] = useState({
    fit: true,
    fabric: false,
    shipping: false
  });

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const colors = product.colors || [];
  const activeColorObj = colors.find((c) => c.name === selectedColor) || colors[0];

  // Clean deduplication by filename
  const images = React.useMemo(() => {
    const rawList = (activeColorObj?.images && activeColorObj.images.length > 0)
      ? activeColorObj.images
      : (product.images && product.images.length > 0
          ? product.images
          : [{ url: product.thumbnailImage, alt: product.name }]);

    const seen = new Set();
    const result = [];
    for (const item of rawList) {
      if (!item || !item.url) continue;
      const fn = item.url.split('/').pop().split('?')[0];
      if (!seen.has(fn)) {
        seen.add(fn);
        result.push(item);
      }
    }
    return result.length > 0 ? result : [{ url: product.thumbnailImage, alt: product.name }];
  }, [activeColorObj, product]);

  const sizes = product.sizes && product.sizes.length > 0
    ? product.sizes
    : [
        { name: 'XXS', label: 'XXS (00-0)', available: true },
        { name: 'XS', label: 'XS (2-4)', available: true },
        { name: 'S', label: 'S (4-6)', available: true },
        { name: 'M', label: 'M (8-10)', available: true },
        { name: 'L', label: 'L (12-14)', available: true },
        { name: 'XL', label: 'XL (16-18)', available: true },
      ];

  const isLiked = wishlist.includes(product.id);

  // Reset scroll and state when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveImageIndex(0);
    setSelectedColor(product.selectedColor || product.colors?.[0]?.name || 'Black');
    setSelectedSize(product.sizes?.[1]?.name || 'S');
    setQuantity(1);
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = 0;
    }
  }, [product.id]);

  // Reset gallery to first photo whenever color changes
  useEffect(() => {
    setActiveImageIndex(0);
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = 0;
    }
  }, [selectedColor]);

  // Keyboard navigation when lightbox is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') scrollSlide('next');
      if (e.key === 'ArrowLeft') scrollSlide('prev');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, activeImageIndex, images.length]);

  const scrollToSlide = (idx) => {
    const clamped = Math.max(0, Math.min(idx, images.length - 1));
    setActiveImageIndex(clamped);
    if (sliderRef.current) {
      const slideWidth = sliderRef.current.clientWidth;
      sliderRef.current.scrollTo({
        left: clamped * slideWidth,
        behavior: 'smooth'
      });
    }
  };

  const scrollSlide = (direction) => {
    if (!sliderRef.current) return;
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (activeImageIndex + 1) % images.length;
    } else {
      nextIndex = (activeImageIndex - 1 + images.length) % images.length;
    }
    scrollToSlide(nextIndex);
  };

  // Scroll event tracking for native touch swiping and scroll-snap
  const handleSliderScroll = (e) => {
    const el = e.currentTarget;
    if (!el || el.clientWidth === 0) return;
    const newIdx = Math.round(el.scrollLeft / el.clientWidth);
    if (newIdx >= 0 && newIdx < images.length && newIdx !== activeImageIndex) {
      setActiveImageIndex(newIdx);
    }
  };

  // Mouse Drag support for testing on desktop without fighting scroll-snap
  const handleMouseDown = (e) => {
    if (!sliderRef.current) return;
    isMouseDown.current = true;
    isDragging.current = false;
    startX.current = e.clientX;
    scrollLeftStart.current = sliderRef.current.scrollLeft;
    sliderRef.current.style.scrollSnapType = 'none';
    sliderRef.current.style.scrollBehavior = 'auto';
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown.current || !sliderRef.current) return;
    const deltaX = e.clientX - startX.current;
    if (Math.abs(deltaX) > 4) {
      isDragging.current = true;
      sliderRef.current.scrollLeft = scrollLeftStart.current - deltaX;
    }
  };

  const handleMouseUpOrLeave = () => {
    if (!isMouseDown.current || !sliderRef.current) return;
    isMouseDown.current = false;
    if (sliderRef.current) {
      sliderRef.current.style.scrollSnapType = 'x mandatory';
      sliderRef.current.style.scrollBehavior = 'smooth';
      const slideWidth = sliderRef.current.clientWidth;
      if (slideWidth > 0) {
        const targetIdx = Math.round(sliderRef.current.scrollLeft / slideWidth);
        const clamped = Math.max(0, Math.min(targetIdx, images.length - 1));
        scrollToSlide(clamped);
      }
    }
    setTimeout(() => {
      isDragging.current = false;
    }, 100);
  };

  const handleColorChange = (colName) => {
    if (colName === selectedColor) return;
    setSelectedColor(colName);
    setActiveImageIndex(0);
  };

  const openLightbox = (idx = activeImageIndex) => {
    setActiveImageIndex(idx);
    setLightboxOpen(true);
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      addToCart(product, {
        color: selectedColor,
        size: selectedSize,
        quantity: quantity,
        thumbnail: images[activeImageIndex]?.url || product.thumbnailImage
      });
      setIsAdding(false);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }, 350);
  };

  const handleBuyNow = () => {
    addToCart(product, {
      color: selectedColor,
      size: selectedSize,
      quantity: quantity,
      thumbnail: images[activeImageIndex]?.url || product.thumbnailImage
    });
    navigateToCheckout();
  };

  // Find related products in the same category
  const relatedProducts = productsData
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const discountSavings = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice - product.price
    : null;

  return (
    <div className="alo-pdp-root">
      {/* Breadcrumbs Navigation */}
      <div className="alo-breadcrumbs-bar">
        <div className="alo-breadcrumbs-container">
          <button onClick={onBackToStore} className="alo-back-btn">
            <ArrowLeft size={16} />
            <span>BACK TO COLLECTION</span>
          </button>
          <div className="alo-breadcrumbs-trail hidden-mobile">
            <span>Home</span>
            <span className="sep">/</span>
            <span>{product.category}</span>
            <span className="sep">/</span>
            <span className="current">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="alo-pdp-main-container">
        <div className="alo-pdp-layout">
          {/* Left Column: Swipeable Image Gallery */}
          <div className="alo-pdp-gallery-col">
            <div className="alo-gallery-sticky">
              {/* Main Image Slider with Native 60fps Scroll-Snap Track */}
              <div className="alo-gallery-wrapper">
                <div
                  className="alo-gallery-slider"
                  key={selectedColor}
                  ref={sliderRef}
                  onScroll={handleSliderScroll}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                >
                  {images.map((img, idx) => (
                    <div
                      key={img.url || idx}
                      className="alo-gallery-slide"
                    >
                      <img
                        src={img.url}
                        alt={img.alt || `${product.name} - view ${idx + 1}`}
                        className="alo-gallery-slide-img"
                        loading={idx === 0 ? 'eager' : 'lazy'}
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>

                {/* 70% OFF & Status Badges */}
                <div className="alo-pdp-floating-badges">
                  <span className="alo-badge alo-badge-sale">70% OFF</span>
                  {product.isBestSeller && (
                    <span className="alo-badge alo-badge-dark">BEST SELLER</span>
                  )}
                </div>

                {/* Wishlist Button */}
                <button
                  className={`alo-pdp-wishlist-btn ${isLiked ? 'liked' : ''}`}
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Save to Wishlist"
                >
                  <Heart size={18} fill={isLiked ? '#000' : 'none'} color={isLiked ? '#000' : '#111'} />
                </button>

                {/* Tap to Zoom Button */}
                <button
                  className="alo-pdp-zoom-btn"
                  onClick={() => openLightbox(activeImageIndex)}
                  aria-label="Zoom photo"
                  title="Click to view full photo"
                >
                  <Maximize2 size={16} />
                </button>

                {/* Desktop / Tablet Nav Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      className="alo-gallery-arrow left"
                      onClick={(e) => {
                        e.stopPropagation();
                        scrollSlide('prev');
                      }}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      className="alo-gallery-arrow right"
                      onClick={(e) => {
                        e.stopPropagation();
                        scrollSlide('next');
                      }}
                      aria-label="Next image"
                    >
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}

                {/* Mobile Photo Counter Badge */}
                {images.length > 1 && (
                  <div className="alo-gallery-counter-pill">
                    <span>{activeImageIndex + 1} / {images.length}</span>
                  </div>
                )}

                {/* Pagination Dots */}
                {images.length > 1 && (
                  <div className="alo-gallery-dots-row">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        className={`alo-gallery-dot ${activeImageIndex === idx ? 'active' : ''}`}
                        onClick={() => scrollToSlide(idx)}
                        aria-label={`Go to photo ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="alo-gallery-thumbs-row">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      className={`alo-gallery-thumb-btn ${activeImageIndex === idx ? 'active' : ''}`}
                      onClick={() => scrollToSlide(idx)}
                    >
                      <img src={img.url} alt={`Angle ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="alo-pdp-info-col">
            <div className="alo-pdp-header">
              <div className="alo-pdp-meta-top">
                <span className="alo-pdp-category-tag">{product.category}</span>
                <span className="alo-pdp-flash-pill">
                  <Flame size={12} /> 70% OFF FLASH SALE
                </span>
              </div>
              <h1 className="alo-pdp-title">{product.name}</h1>

              {/* Rating & Social Proof */}
              <div className="alo-pdp-rating-row">
                <div className="alo-stars-row">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#111" color="#111" />
                  ))}
                </div>
                <span className="alo-rating-score">{product.rating || '4.9'}</span>
                <span className="alo-rating-link">({product.reviewCount || 248} Verified Reviews)</span>
                <span className="alo-fit-guarantee-tag">✓ 98% True to Size</span>
              </div>

              {/* Price Display with 70% OFF Highlight */}
              <div className="alo-pdp-price-row">
                <span className="alo-pdp-current-price">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="alo-pdp-original-price">
                    MSRP {formatPrice(product.originalPrice)}
                  </span>
                )}
                {discountSavings && (
                  <span className="alo-pdp-savings-badge">
                    SAVE {formatPrice(discountSavings)} (70% OFF)
                  </span>
                )}
              </div>

              {/* BNPL 4 Interest-Free Installments (US E-Commerce Standard) */}
              <div className="alo-pdp-bnpl-row">
                <span>or 4 interest-free payments of <strong>{formatPrice(product.price / 4)}</strong> with</span>
                <span className="alo-bnpl-badge klarna">Klarna.</span>
                <span>or</span>
                <span className="alo-bnpl-badge afterpay">afterpay ✳</span>
              </div>
            </div>

            {/* Urgency Stock Banner */}
            <div className="alo-stock-urgency-banner">
              <Clock size={15} className="text-amber-600 animate-pulse" />
              <span>
                <strong>70% OFF Flash Sale Active:</strong> Only <strong>4 items</strong> left in {selectedColor} ({selectedSize})
              </span>
            </div>

            {/* Color Swatch Selection */}
            {colors.length > 0 && (
              <div className="alo-pdp-variant-block">
                <div className="alo-variant-label-row">
                  <span className="alo-variant-label-title">COLOR:</span>
                  <span className="alo-variant-label-value">{selectedColor}</span>
                </div>
                <div className="alo-pdp-color-swatches">
                  {colors.map((col, idx) => (
                    <button
                      key={idx}
                      className={`alo-pdp-swatch-btn ${selectedColor === col.name ? 'active' : ''}`}
                      onClick={() => handleColorChange(col.name)}
                      title={col.name}
                    >
                      <span
                        className="alo-swatch-circle"
                        style={{ backgroundColor: col.value || '#000000' }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="alo-pdp-variant-block">
              <div className="alo-variant-label-row">
                <span className="alo-variant-label-title">SELECT SIZE:</span>
                <button
                  type="button"
                  className="alo-size-guide-trigger"
                  onClick={() => setIsSizeGuideOpen(true)}
                >
                  <Ruler size={14} />
                  <span>U.S. Size & Fit Guide</span>
                </button>
              </div>

              <div className="alo-pdp-sizes-grid">
                {sizes.map((s) => (
                  <button
                    key={s.name}
                    className={`alo-size-btn ${selectedSize === s.name ? 'active' : ''}`}
                    onClick={() => setSelectedSize(s.name)}
                  >
                    <span className="alo-size-text">{s.name}</span>
                    <span className="alo-size-sub">{s.label ? s.label.replace(s.name, '').trim() : ''}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper & CTA Buttons */}
            <div className="alo-pdp-action-group">
              <div className="alo-qty-row">
                <div className="alo-qty-stepper">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="alo-qty-btn"
                  >
                    -
                  </button>
                  <span className="alo-qty-val">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="alo-qty-btn"
                  >
                    +
                  </button>
                </div>

                {/* Primary Add to Bag Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className={`alo-btn alo-btn-primary alo-pdp-atc-btn ${justAdded ? 'added' : ''}`}
                >
                  {isAdding ? (
                    <span className="alo-btn-loader" />
                  ) : justAdded ? (
                    <>
                      <Check size={18} />
                      <span>ADDED TO BAG!</span>
                    </>
                  ) : (
                    <span>ADD TO BAG — {formatPrice(product.price * quantity)}</span>
                  )}
                </button>
              </div>

              {/* Express 1-Click Buy Now Button */}
              <button
                onClick={handleBuyNow}
                className="alo-btn alo-btn-accent alo-pdp-buynow-btn"
              >
                <span>⚡ BUY NOW WITH 70% DISCOUNT</span>
              </button>
            </div>

            {/* U.S. Trust Badges */}
            <div className="alo-pdp-guarantees">
              <div className="alo-guarantee-item">
                <Truck size={17} />
                <span><strong>Fast U.S. Shipping:</strong> In stock & ships tomorrow from Los Angeles, CA via USPS Priority (Free over $75)</span>
              </div>
              <div className="alo-guarantee-item">
                <RotateCcw size={17} />
                <span><strong>Risk-Free 30-Day At-Home Trial:</strong> Free prepaid U.S. return shipping label included in box</span>
              </div>
              <div className="alo-guarantee-item">
                <ShieldCheck size={17} />
                <span><strong>100% Authentic Alo Softsculpt™ Guarantee:</strong> BBB A+ Accredited · Secure 256-Bit SSL Checkout</span>
              </div>
            </div>

            {/* Description & Collapsible Accordions */}
            <div className="alo-pdp-accordions">
              <p className="alo-pdp-lead-desc">{product.description}</p>

              {/* Fit Details */}
              <div className="alo-accordion-item">
                <button
                  className="alo-accordion-trigger"
                  onClick={() => toggleAccordion('fit')}
                >
                  <span className="alo-accordion-title">FIT & SILHOUETTE</span>
                  {openAccordions.fit ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openAccordions.fit && (
                  <div className="alo-accordion-content">
                    <ul className="alo-bullet-list">
                      {Array.isArray(product.fit) ? (
                        product.fit.map((f, i) => <li key={i}>{f}</li>)
                      ) : (
                        <li>{product.fit || 'Engineered for a supportive, flattering silhouette.'}</li>
                      )}
                      <li>Built with 4-way stretch for zero pinch and maximum movement</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Fabrication Details */}
              <div className="alo-accordion-item">
                <button
                  className="alo-accordion-trigger"
                  onClick={() => toggleAccordion('fabric')}
                >
                  <span className="alo-accordion-title">FABRICATION & WEAVE</span>
                  {openAccordions.fabric ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openAccordions.fabric && (
                  <div className="alo-accordion-content">
                    <p>{product.fabrication || 'Signature Airlift / Softsculpt fabric. Ultra-soft matte finish, moisture-wicking and odor resistant.'}</p>
                    <p className="mt-2 text-xs text-neutral-500">Machine wash cold inside out with like colors. Tumble dry low or lay flat to preserve compression elasticity.</p>
                  </div>
                )}
              </div>

              {/* U.S. Shipping & Returns */}
              <div className="alo-accordion-item">
                <button
                  className="alo-accordion-trigger"
                  onClick={() => toggleAccordion('shipping')}
                >
                  <span className="alo-accordion-title">U.S. SHIPPING & PREPAID RETURNS</span>
                  {openAccordions.shipping ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openAccordions.shipping && (
                  <div className="alo-accordion-content">
                    <p>All orders are packed and dispatched directly from our climate-neutral fulfillment center in <strong>Los Angeles, California</strong>.</p>
                    <p className="mt-1">Standard <strong>USPS Priority Mail</strong> delivers within 2 to 4 business days nationwide (Free over $75). FedEx & UPS 2-Day Air available at checkout.</p>
                    <p className="mt-1">Every package includes a complimentary prepaid USPS return shipping label. Enjoy a 30-day risk-free at-home trial.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Recommendation Carousel */}
        {relatedProducts.length > 0 && (
          <div className="alo-pdp-related-section">
            <h3 className="alo-related-title">COMPLETE THE LOOK (70% OFF)</h3>
            <div className="alo-related-grid">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  className="alo-related-card"
                  onClick={() => navigateToProduct(rel)}
                >
                  <img
                    src={rel.thumbnailImage || rel.images?.[0]?.url}
                    alt={rel.name}
                    className="alo-related-img"
                  />
                  <div className="alo-related-info">
                    <h4 className="alo-related-name">{rel.name}</h4>
                    <span className="alo-related-price">{formatPrice(rel.price)}</span>
                    <span className="alo-card-original-price">{formatPrice(rel.originalPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Add to Bag Bar */}
      <div className="alo-sticky-mobile-bar">
        <div className="alo-sticky-mobile-info">
          <span className="alo-sticky-name">{product.name}</span>
          <div className="alo-sticky-price-row">
            <span className="alo-sticky-price">{formatPrice(product.price)}</span>
            <span className="alo-sticky-discount-pill">-70%</span>
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          className="alo-btn alo-btn-primary alo-sticky-atc-btn"
        >
          {justAdded ? '✓ ADDED' : 'ADD TO BAG'}
        </button>
      </div>

      {/* High-Resolution Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div className="alo-lightbox-backdrop" onClick={() => setLightboxOpen(false)}>
          <button
            className="alo-lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close zoom"
          >
            <X size={24} />
          </button>
          <div className="alo-lightbox-counter">
            {activeImageIndex + 1} / {images.length}
          </div>
          <div className="alo-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[activeImageIndex]?.url || product.thumbnailImage}
              alt={images[activeImageIndex]?.alt || product.name}
              className="alo-lightbox-img"
            />
            {images.length > 1 && (
              <>
                <button
                  className="alo-lightbox-arrow left"
                  onClick={() => scrollSlide('prev')}
                  aria-label="Previous"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  className="alo-lightbox-arrow right"
                  onClick={() => scrollSlide('next')}
                  aria-label="Next"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
