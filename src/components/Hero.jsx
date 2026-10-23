import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { HERO_BANNERS } from '../data/storeData';

export default function Hero({ onShopBestsellers, onShopCategory }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const currentDeltaXRef = useRef(0);
  const isHorizontalSwipe = useRef(null);
  const hasMovedRef = useRef(false);
  const autoSlideTimerRef = useRef(null);

  const slideCount = HERO_BANNERS.length;

  const startAutoSlide = () => {
    stopAutoSlide();
    autoSlideTimerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 6000);
  };

  const stopAutoSlide = () => {
    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
      autoSlideTimerRef.current = null;
    }
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [slideCount]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slideCount);
    startAutoSlide();
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
    startAutoSlide();
  };

  // Touch Gesture Handlers (Finger drag on mobile)
  const handleTouchStart = (e) => {
    stopAutoSlide();
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    currentDeltaXRef.current = 0;
    isHorizontalSwipe.current = null;
    hasMovedRef.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!startXRef.current) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - startXRef.current;
    const diffY = touch.clientY - startYRef.current;

    // Detect direction on first significant movement
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
        if (Math.abs(diffX) >= Math.abs(diffY)) {
          isHorizontalSwipe.current = true;
        } else {
          isHorizontalSwipe.current = false;
        }
      }
    }

    if (isHorizontalSwipe.current) {
      // Prevent browser vertical scrolling while horizontally swiping the hero banner
      if (e.cancelable) {
        e.preventDefault();
      }
      currentDeltaXRef.current = diffX;
      hasMovedRef.current = Math.abs(diffX) > 10;
      setDragOffset(diffX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const diffX = currentDeltaXRef.current;
    const threshold = 40; // minimum px movement to switch slide

    if (isHorizontalSwipe.current) {
      if (diffX < -threshold) {
        handleNext();
      } else if (diffX > threshold) {
        handlePrev();
      } else {
        startAutoSlide();
      }
    } else {
      startAutoSlide();
    }

    setDragOffset(0);
    startXRef.current = 0;
    startYRef.current = 0;
    currentDeltaXRef.current = 0;
    isHorizontalSwipe.current = null;
  };

  // Mouse Drag Handlers (Desktop click & drag)
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    stopAutoSlide();
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    currentDeltaXRef.current = 0;
    isHorizontalSwipe.current = true;
    hasMovedRef.current = false;
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const diffX = e.clientX - startXRef.current;
    currentDeltaXRef.current = diffX;
    if (Math.abs(diffX) > 8) {
      hasMovedRef.current = true;
    }
    setDragOffset(diffX);
  };

  const handleMouseUpOrLeave = () => {
    if (!isDragging) return;
    handleTouchEnd();
  };

  // Prevent accidental clicks on buttons if user was dragging
  const handleCtaClick = (e, callback) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    callback();
  };

  return (
    <section
      className="alo-hero-section"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      style={{ touchAction: 'pan-y' }}
    >
      <div
        className="alo-hero-track"
        style={{
          transform: `translateX(calc(-${currentSlide * 100}% + ${dragOffset}px))`,
          transition: isDragging ? 'none' : 'transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {HERO_BANNERS.map((banner, idx) => (
          <div key={banner.id || idx} className="alo-hero-slide-pane">
            <div className="alo-hero-media-wrapper">
              <picture>
                <source media="(max-width: 768px)" srcSet={banner.mobileImage} />
                <img
                  src={banner.desktopImage}
                  alt={banner.title}
                  className="alo-hero-bg-img"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              </picture>
              <div className="alo-hero-gradient-overlay" />
            </div>

            <div className="alo-hero-container">
              <div className="alo-hero-content">
                <div className="alo-hero-tagline">
                  <span className="alo-hero-sale-highlight">🔥 70% OFF FLASH SALE</span>
                  <span className="sep">·</span>
                  <span>OFFICIAL STORE OUTLET</span>
                </div>

                <h1 className="alo-hero-headline">{banner.title}</h1>

                <p className="alo-hero-subheadline">
                  {banner.subtitle}. Engineered in Beverly Hills for studio performance and luxury street style. <strong>70% discount applied sitewide today.</strong>
                </p>

                <div className="alo-hero-cta-group">
                  <button
                    onClick={(e) =>
                      handleCtaClick(e, () =>
                        onShopCategory ? onShopCategory(banner.category || 'bestsellers') : onShopBestsellers()
                      )
                    }
                    className="alo-btn alo-btn-primary alo-hero-btn"
                  >
                    <span>{banner.ctaText || 'SHOP 70% OFF'}</span>
                    <ArrowRight size={17} />
                  </button>

                  <button
                    onClick={(e) =>
                      handleCtaClick(e, () =>
                        onShopCategory ? onShopCategory('Hoodies & Jackets') : onShopBestsellers()
                      )
                    }
                    className="alo-btn alo-btn-outline-light alo-hero-btn"
                  >
                    <span>DISCOVER NEW ARRIVALS</span>
                  </button>
                </div>

                {/* Luxury Feature Pillars */}
                <div className="alo-hero-trust-row">
                  <div className="alo-trust-chip">
                    <CheckCircle2 size={14} />
                    <span>100% Squat-Proof Compression</span>
                  </div>
                  <div className="alo-trust-chip">
                    <CheckCircle2 size={14} />
                    <span>Ships from California</span>
                  </div>
                  <div className="alo-trust-chip">
                    <CheckCircle2 size={14} />
                    <span>Free U.S. Priority Shipping</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slide Navigation Arrows */}
      {HERO_BANNERS.length > 1 && (
        <>
          <button
            className="alo-hero-nav-arrow left"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous Banner"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            className="alo-hero-nav-arrow right"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next Banner"
          >
            <ChevronRight size={22} />
          </button>

          {/* Slide Indicator Dots */}
          <div className="alo-hero-dots">
            {HERO_BANNERS.map((_, idx) => (
              <button
                key={idx}
                className={`alo-hero-dot ${currentSlide === idx ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(idx);
                  startAutoSlide();
                }}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
