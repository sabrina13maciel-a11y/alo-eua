import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Search, Heart, ShoppingBag, Menu, X, ChevronDown, ShieldCheck, Truck } from 'lucide-react';

const ANNOUNCEMENTS = [
  "⚡ U.S. FLASH SALE: 70% OFF SITEWIDE TODAY ONLY",
  "📦 FREE U.S. PRIORITY SHIPPING ON ORDERS OVER $75",
  "🇺🇸 30-DAY RISK-FREE AT-HOME TRIAL · FREE U.S. RETURNS",
  "⭐️ 4.9/5 RATED BY 15,000+ VERIFIED AMERICAN BUYERS"
];

export default function Header({ onSelectCategory, activeCategory }) {
  const {
    totalItemCount,
    setIsCartOpen,
    currency,
    setCurrency,
    currencies,
    wishlist,
    navigateToStore,
    setIsSearchOpen
  } = useCart();

  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBagBouncing, setIsBagBouncing] = useState(false);

  // Rotate announcement ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Listen to scroll for sticky shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trigger bounce animation on item count change
  useEffect(() => {
    if (totalItemCount > 0) {
      setIsBagBouncing(true);
      const timer = setTimeout(() => setIsBagBouncing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [totalItemCount]);

  const categories = [
    { label: 'ALL STYLES', value: 'all' },
    { label: '★ BEST SELLERS', value: 'bestsellers' },
    { label: 'DRESSES', value: 'Dresses & Rompers' },
    { label: 'BRAS & CROPS', value: 'Bras & Tops' },
    { label: 'LEGGINGS & SHORTS', value: 'Leggings & Bottoms' },
    { label: 'HOODIES & SWEATS', value: 'Hoodies & Jackets' },
    { label: 'ACCESSORIES', value: 'Accessories' },
  ];

  const handleCategoryClick = (catVal) => {
    navigateToStore();
    if (onSelectCategory) {
      onSelectCategory(catVal);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className={`alo-header-root ${isScrolled ? 'alo-header-scrolled' : ''}`}>
      {/* Top Luxury Announcement Bar */}
      <div className="alo-announcement-bar">
        <div className="alo-announcement-container">
          <div className="alo-announcement-left hidden-mobile">
            <span className="alo-announcement-badge">🇺🇸 U.S. OUTLET</span>
            <span className="alo-announcement-sub">
              <Truck size={12} /> Ships from Los Angeles, CA
            </span>
          </div>

          <div className="alo-announcement-center">
            <span key={announcementIndex} className="alo-announcement-text fade-in-text">
              {ANNOUNCEMENTS[announcementIndex]}
            </span>
          </div>

          <div className="alo-announcement-right">
            {/* U.S. Currency Badge */}
            <div className="alo-us-currency-tag">
              <span>🇺🇸 USD ($)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="alo-nav-bar">
        <div className="alo-nav-container">
          {/* Mobile Menu Button */}
          <button
            className="alo-icon-btn hidden-desktop"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Desktop Categories Navigation */}
          <nav className="alo-desktop-nav hidden-mobile">
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryClick(cat.value)}
                className={`alo-nav-link ${activeCategory === cat.value ? 'alo-nav-link-active' : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </nav>

          {/* Official Alo Brand Logo */}
          <div className="alo-logo-container" onClick={navigateToStore} role="button" tabIndex={0}>
            <svg
              className="alo-svg-logo"
              viewBox="0 0 71 48"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Alo Yoga"
            >
              <path
                fill="currentColor"
                d="M22.826 19.591h5.771v27.43h-5.77v-1.928A13.973 13.973 0 0114.298 48C6.414 48 0 41.409 0 33.306c0-8.103 6.414-14.694 14.299-14.694 3.193 0 6.145 1.082 8.527 2.907zm-.145 13.715c0-4.861-3.76-8.816-8.382-8.816-4.623 0-8.382 3.955-8.382 8.816 0 4.862 3.76 8.816 8.382 8.816s8.382-3.954 8.382-8.816zM39.434 47.02h-5.906V0h5.906zm2.969-13.714c0-8.103 6.414-14.694 14.298-14.694C64.586 18.612 71 25.203 71 33.306 71 41.41 64.586 48 56.701 48c-7.884 0-14.298-6.59-14.298-14.694zm22.451 0c0-4.861-3.76-8.816-8.153-8.816-4.623 0-8.382 3.955-8.382 8.816 0 4.862 3.759 8.816 8.382 8.816 4.393 0 8.153-3.954 8.153-8.816z"
              />
            </svg>
          </div>

          {/* Right Action Icons: Search, Wishlist, Bag */}
          <div className="alo-nav-actions">
            <button
              className="alo-icon-btn"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search collection"
            >
              <Search size={20} strokeWidth={1.75} />
            </button>

            <button
              className="alo-icon-btn hidden-mobile"
              onClick={navigateToStore}
              aria-label="Wishlist"
            >
              <div className="alo-icon-relative">
                <Heart size={20} strokeWidth={1.75} />
                {wishlist.length > 0 && (
                  <span className="alo-badge-counter">{wishlist.length}</span>
                )}
              </div>
            </button>

            {/* Bag Button with bounce */}
            <button
              className={`alo-bag-btn ${isBagBouncing ? 'alo-bag-bounce' : ''}`}
              onClick={() => setIsCartOpen(true)}
              aria-label="Open Shopping Bag"
            >
              <div className="alo-icon-relative">
                <ShoppingBag size={21} strokeWidth={1.75} />
                {totalItemCount > 0 && (
                  <span className="alo-badge-counter alo-badge-bag">{totalItemCount}</span>
                )}
              </div>
              <span className="alo-bag-label hidden-mobile">BAG</span>
            </button>
          </div>
        </div>

        {/* Desktop Secondary Category Bar */}
        <div className="alo-secondary-nav hidden-mobile">
          <div className="alo-secondary-nav-container">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryClick(cat.value)}
                className={`alo-subnav-pill ${activeCategory === cat.value ? 'alo-subnav-pill-active' : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="alo-mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="alo-mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="alo-mobile-drawer-header">
              <span className="alo-mobile-drawer-title">CATEGORIES</span>
              <button className="alo-icon-btn" onClick={() => setMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="alo-mobile-drawer-content">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryClick(cat.value)}
                  className={`alo-mobile-drawer-item ${activeCategory === cat.value ? 'active' : ''}`}
                >
                  <span>{cat.label}</span>
                  <span className="alo-mobile-drawer-arrow">→</span>
                </button>
              ))}

              <div className="alo-mobile-drawer-footer">
                <p className="alo-mobile-footer-headline">🇺🇸 SHIPS FROM LOS ANGELES, CA</p>
                <p className="alo-mobile-footer-sub">Priority 2-4 Day Delivery via USPS Priority & UPS. Free prepaid returns.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
