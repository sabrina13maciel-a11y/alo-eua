import React, { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { CartProvider } from './context/CartContext.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL: React ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem('alo_cart');
      localStorage.removeItem('alo_wishlist');
    } catch (e) {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          color: '#ffffff',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '460px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '40px 24px',
            backdropFilter: 'blur(12px)'
          }}>
            <h1 style={{ fontSize: '20px', letterSpacing: '3px', fontWeight: '800', marginBottom: '12px', textTransform: 'uppercase' }}>
              ALO YOGA OUTLET
            </h1>
            <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              We encountered a temporary session error while preparing your luxury catalog experience.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                backgroundColor: '#ffffff',
                color: '#000000',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13px',
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'opacity 0.2s ease'
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
            >
              RELOAD STORE
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <CartProvider>
        <App />
      </CartProvider>
    </ErrorBoundary>
  </StrictMode>
);
