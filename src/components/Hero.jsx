import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { HERO_BANNERS } from '../data/storeData';

export default function Hero({ onShopBestsellers, onShopCategory }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_BANNERS[currentSlide] || HERO_BANNERS[0];

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_BANNERS.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_BANNERS.length) % HERO_BANNERS.length);
  };

  return (
    <section className="alo-hero-section">
      <div className="alo-hero-media-wrapper">
        {/* Responsive Desktop & Mobile Campaign Banner from Official Store */}
        <picture>
          <source media="(max-width: 768px)" srcSet={slide.mobileImage} />
          <img
            src={slide.desktopImage}
            alt={slide.title}
            className="alo-hero-bg-img"
            loading="eager"
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

          <h1 className="alo-hero-headline">
            {slide.title}
          </h1>

          <p className="alo-hero-subheadline">
            {slide.subtitle}. Engineered in Beverly Hills for studio performance and luxury street style. <strong>70% discount applied sitewide today.</strong>
          </p>

          <div className="alo-hero-cta-group">
            <button
              onClick={() => onShopCategory ? onShopCategory(slide.category || 'bestsellers') : onShopBestsellers()}
              className="alo-btn alo-btn-primary alo-hero-btn"
            >
              <span>{slide.ctaText || 'SHOP 70% OFF'}</span>
              <ArrowRight size={17} />
            </button>

            <button
              onClick={() => onShopCategory ? onShopCategory('Hoodies & Jackets') : onShopBestsellers()}
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

      {/* Slide Navigation Arrows */}
      {HERO_BANNERS.length > 1 && (
        <>
          <button
            className="alo-hero-nav-arrow left"
            onClick={handlePrev}
            aria-label="Previous Banner"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className="alo-hero-nav-arrow right"
            onClick={handleNext}
            aria-label="Next Banner"
          >
            <ChevronRight size={24} />
          </button>

          {/* Slide Indicator Dots */}
          <div className="alo-hero-dots">
            {HERO_BANNERS.map((_, idx) => (
              <button
                key={idx}
                className={`alo-hero-dot ${currentSlide === idx ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
