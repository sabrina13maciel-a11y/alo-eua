import React, { useState, useMemo } from 'react';
import { useCart } from './context/CartContext';
import Header from './components/Header';
import Hero from './components/Hero';
import StoryTopicsBar from './components/StoryTopicsBar';
import ValuePillars from './components/ValuePillars';
import CuratedSpotlight from './components/CuratedSpotlight';
import CategoryFilters from './components/CategoryFilters';
import ProductCard from './components/ProductCard';
import ProductDetailView from './components/ProductDetailView';
import CommunityGallery from './components/CommunityGallery';
import ReviewsSection from './components/ReviewsSection';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import SearchModal from './components/SearchModal';
import SizeGuideModal from './components/SizeGuideModal';
import CheckoutView from './components/CheckoutView';
import PaymentProcessingView from './components/PaymentProcessingView';
import PostPurchaseUpsellView from './components/PostPurchaseUpsellView';
import OrderConfirmationView from './components/OrderConfirmationView';

import productsData from './data/products.json';

export default function App() {
  const {
    currentView,
    setCurrentView,
    selectedProduct,
    navigateToStore,
    activeOrder,
    setActiveOrder,
    isSearchOpen,
    setIsSearchOpen,
    isSizeGuideOpen,
    setIsSizeGuideOpen,
    navigateToProduct
  } = useCart();

  // Store filters state
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return productsData
      .filter((p) => {
        // Category filtering
        if (activeCategory === 'bestsellers') {
          if (!p.isBestSeller && p.badge !== 'BEST SELLER') return false;
        } else if (activeCategory !== 'all') {
          if (p.category !== activeCategory) return false;
        }

        // Search filtering
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          const matchDesc = p.description && p.description.toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
        if (sortBy === 'bestselling') {
          const aScore = a.isBestSeller ? 1 : 0;
          const bScore = b.isBestSeller ? 1 : 0;
          return bScore - aScore;
        }
        return 0; // featured default order
      });
  }, [activeCategory, searchQuery, sortBy]);

  // Handlers for hero & spotlight clicks
  const handleShopBestsellers = () => {
    setActiveCategory('bestsellers');
    const el = document.getElementById('collection-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShopDresses = () => {
    setActiveCategory('Dresses & Rompers');
    const el = document.getElementById('collection-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShopSets = () => {
    setActiveCategory('Bras & Tops');
    const el = document.getElementById('collection-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Funnel Flow Handlers
  const handleOrderSuccess = (orderResult) => {
    setActiveOrder(orderResult);
    setCurrentView('processing');
  };

  const handleProcessingComplete = () => {
    // Show post-purchase upsell for maximum funnel conversion
    setCurrentView('upsell');
  };

  const handleAcceptUpsell = (upsellItem) => {
    if (activeOrder) {
      setActiveOrder((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            name: upsellItem.name,
            color: 'Heather Bone',
            size: 'M',
            price: upsellItem.discountPrice,
            quantity: 1,
            thumbnail: upsellItem.image
          }
        ],
        total: prev.total + upsellItem.discountPrice
      }));
    }
    setCurrentView('confirmation');
  };

  const handleDeclineUpsell = () => {
    setCurrentView('confirmation');
  };

  return (
    <div className="alo-app">
      {/* Universal Cart Drawer */}
      <CartDrawer />

      {/* Universal Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Universal Size & Fit Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      {/* Render Current View */}
      {currentView === 'store' && (
        <>
          <Header
            activeCategory={activeCategory}
            onSelectCategory={(cat) => {
              setActiveCategory(cat);
              const el = document.getElementById('collection-grid');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          <main>
            <Hero
              onShopBestsellers={handleShopBestsellers}
              onShopCategory={(cat) => {
                setActiveCategory(cat);
                const el = document.getElementById('collection-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Official Mobile / Desktop Topic Stories Bar (Drag & Swipe) */}
            <StoryTopicsBar
              activeCategory={activeCategory}
              onSelectCategory={(cat) => {
                setActiveCategory(cat);
                const el = document.getElementById('collection-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <ValuePillars />

            <CuratedSpotlight
              onSelectCategory={(cat) => {
                setActiveCategory(cat);
                const el = document.getElementById('collection-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <CategoryFilters
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalCount={filteredProducts.length}
            />

            {/* Product Grid */}
            <section className="alo-products-section" id="collection-grid">
              <div className="alo-products-container">
                {filteredProducts.length === 0 ? (
                  <div className="alo-no-products">
                    <h3>No products found in this category</h3>
                    <p>Try resetting filters or searching for another style name.</p>
                    <button
                      className="alo-btn alo-btn-primary mt-4"
                      onClick={() => {
                        setActiveCategory('all');
                        setSearchQuery('');
                      }}
                    >
                      VIEW ALL 200+ STYLES
                    </button>
                  </div>
                ) : (
                  <div className="alo-products-grid">
                    {filteredProducts.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            <CommunityGallery />

            <ReviewsSection />

            <FaqSection />
          </main>

          <Footer onSelectCategory={(cat) => {
            setActiveCategory(cat);
            const el = document.getElementById('collection-grid');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }} />
        </>
      )}

      {currentView === 'product' && selectedProduct && (
        <>
          <Header
            activeCategory={activeCategory}
            onSelectCategory={(cat) => {
              setActiveCategory(cat);
              navigateToStore();
            }}
          />

          <main>
            <ProductDetailView
              product={selectedProduct}
              onBackToStore={navigateToStore}
            />

            <ReviewsSection />

            <FaqSection />
          </main>

          <Footer onSelectCategory={(cat) => {
            setActiveCategory(cat);
            navigateToStore();
          }} />
        </>
      )}

      {currentView === 'checkout' && (
        <CheckoutView
          onBackToStore={navigateToStore}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {currentView === 'processing' && (
        <PaymentProcessingView onComplete={handleProcessingComplete} />
      )}

      {currentView === 'upsell' && (
        <PostPurchaseUpsellView
          onAcceptUpsell={handleAcceptUpsell}
          onDeclineUpsell={handleDeclineUpsell}
        />
      )}

      {currentView === 'confirmation' && (
        <OrderConfirmationView
          order={activeOrder}
          onContinueShopping={navigateToStore}
        />
      )}
    </div>
  );
}
