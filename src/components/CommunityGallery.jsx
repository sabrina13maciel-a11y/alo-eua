import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import productsData from '../data/products.json';

const UGC_ITEMS = [
  {
    handle: "airbrush-splendor-dress-azure-blue",
    img: "https://wowdress.shop/images/airbrush-splendor-dress-azure-blue-1.webp",
    user: "@alicia_active",
    look: "Airbrush Splendor Dress"
  },
  {
    handle: "accolade-full-zip-hoodie-black",
    img: "https://wowdress.shop/images/accolade-full-zip-hoodie-1.webp",
    user: "@matthew_studio",
    look: "Accolade Zip Hoodie"
  },
  {
    handle: "airbrush-heart-throb-bra-white-black",
    img: "https://wowdress.shop/images/airbrush-1.webp",
    user: "@chloe_pilates",
    look: "Heart Throb Bra Set"
  },
  {
    handle: "high-waist-airlift-short-black",
    img: "https://wowdress.shop/images/airlift-short-1.webp",
    user: "@madi_runclub",
    look: "3\" Airlift Sculpt Short"
  }
];

export default function CommunityGallery() {
  const { navigateToProduct } = useCart();

  const handleShopLook = (handle) => {
    const found = productsData.find((p) => p.handle === handle);
    if (found) {
      navigateToProduct(found);
    }
  };

  return (
    <section className="alo-ugc-section">
      <div className="alo-ugc-container">
        <div className="alo-ugc-header">
          <div className="alo-ugc-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
            <span>#ALOCOMMUNITY</span>
          </div>
          <h2 className="alo-ugc-title">AS SEEN ON YOU</h2>
          <p className="alo-ugc-sub">Tag @aloyoga to be featured in our global community lookbook.</p>
        </div>

        <div className="alo-ugc-grid">
          {UGC_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="alo-ugc-card"
              onClick={() => handleShopLook(item.handle)}
            >
              <img src={item.img} alt={item.look} className="alo-ugc-img" loading="lazy" />
              <div className="alo-ugc-overlay">
                <span className="alo-ugc-handle">{item.user}</span>
                <span className="alo-ugc-lookname">{item.look}</span>
                <button className="alo-ugc-shop-btn">
                  <span>SHOP THIS LOOK</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
