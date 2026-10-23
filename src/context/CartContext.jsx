import React, { createContext, useContext, useState, useEffect } from 'react';
import { trackFunnelEvent } from '../config/endpoints';

const CartContext = createContext();

const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', rate: 1.0, label: 'USD ($)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, label: 'EUR (€)' },
  BRL: { code: 'BRL', symbol: 'R$', rate: 5.50, label: 'BRL (R$)' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79, label: 'GBP (£)' },
};

const FREE_SHIPPING_THRESHOLD_USD = 75.00;

export function CartProvider({ children }) {
  // Cart items state stored in localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('alo_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('alo_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState(null);
  
  // Navigation / Funnel Views: 'store' | 'product' | 'checkout' | 'processing' | 'confirmation' | 'upsell'
  const [currentView, setCurrentView] = useState('store');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('alo_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Storage sync failed:', e);
    }
  }, [cart]);

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('alo_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Wishlist storage sync failed:', e);
    }
  }, [wishlist]);

  // Currency Formatter
  const formatPrice = (amountInUSD) => {
    const curr = CURRENCIES[currency] || CURRENCIES.USD;
    const converted = (Number(amountInUSD) || 0) * curr.rate;
    if (curr.code === 'BRL') {
      return `R$ ${converted.toFixed(2).replace('.', ',')}`;
    } else if (curr.code === 'EUR') {
      return `€${converted.toFixed(2)}`;
    } else if (curr.code === 'GBP') {
      return `£${converted.toFixed(2)}`;
    }
    return `$${converted.toFixed(2)}`;
  };

  // Cart calculations in USD base
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const rawSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const subtotal = Math.max(0, rawSubtotal - discountAmount);

  // Free shipping progress
  const freeShippingThreshold = FREE_SHIPPING_THRESHOLD_USD;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const hasFreeShipping = subtotal >= freeShippingThreshold;
  const shippingCost = cart.length === 0 ? 0 : (hasFreeShipping ? 0 : 9.99);
  const total = subtotal + shippingCost;

  // Add Item to Cart
  const addToCart = (product, { color, size, quantity = 1, thumbnail = null }) => {
    const selectedColor = color || product.selectedColor || (product.colors?.[0]?.name ?? 'Default');
    const selectedSize = size || (product.sizes?.[1]?.name || product.sizes?.[0]?.name || 'S');
    const itemThumbnail = thumbnail || product.thumbnailImage || product.images?.[0]?.url;

    // Unique ID based on handle + variant
    const cartItemId = `${product.handle || product.id}-${selectedColor}-${selectedSize}`;

    setCart(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prev,
          {
            cartItemId,
            id: product.id,
            handle: product.handle,
            name: product.name,
            price: Number(product.price),
            originalPrice: Number(product.originalPrice || product.price * 1.3),
            color: selectedColor,
            size: selectedSize,
            thumbnail: itemThumbnail,
            quantity: quantity,
            category: product.category
          }
        ];
      }
    });

    setIsCartOpen(true);
    trackFunnelEvent('AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price * quantity,
      currency: currency
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
    } else {
      setCart(prev => prev.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  // Coupons
  const applyCoupon = (code) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'ALOVIP' || clean === 'ALO20') {
      setDiscountPercent(20);
      setCouponCode(clean);
      setCouponMessage({ type: 'success', text: '20% VIP Discount Applied!' });
      return true;
    } else if (clean === 'FREESHIP') {
      setDiscountPercent(10);
      setCouponCode(clean);
      setCouponMessage({ type: 'success', text: '10% Extra Discount Applied!' });
      return true;
    } else {
      setCouponMessage({ type: 'error', text: 'Invalid promo code. Try "ALOVIP" for 20% off.' });
      return false;
    }
  };

  const removeCoupon = () => {
    setDiscountPercent(0);
    setCouponCode('');
    setCouponMessage(null);
  };

  // Wishlist
  const toggleWishlist = (productId) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  // View navigation
  const navigateToProduct = (product) => {
    setSelectedProduct(product);
    setCurrentView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackFunnelEvent('ViewContent', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price,
      currency: currency
    });
  };

  const navigateToCheckout = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackFunnelEvent('InitiateCheckout', {
      num_items: totalItemCount,
      value: total,
      currency: currency
    });
  };

  const navigateToStore = () => {
    setCurrentView('store');
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemCount,
        subtotal,
        rawSubtotal,
        discountAmount,
        discountPercent,
        shippingCost,
        total,
        freeShippingThreshold,
        amountToFreeShipping,
        freeShippingProgress,
        hasFreeShipping,
        isCartOpen,
        setIsCartOpen,
        currency,
        setCurrency,
        currencies: CURRENCIES,
        formatPrice,
        couponCode,
        couponMessage,
        applyCoupon,
        removeCoupon,
        wishlist,
        toggleWishlist,
        isInWishlist,
        currentView,
        setCurrentView,
        selectedProduct,
        setSelectedProduct,
        navigateToProduct,
        navigateToCheckout,
        navigateToStore,
        activeOrder,
        setActiveOrder,
        isSearchOpen,
        setIsSearchOpen,
        isSizeGuideOpen,
        setIsSizeGuideOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
