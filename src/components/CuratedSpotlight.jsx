import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { FEATURE_SPOTLIGHTS } from '../data/storeData';

export default function CuratedSpotlight({ onSelectCategory }) {
  const spot1 = FEATURE_SPOTLIGHTS[0];
  const spot2 = FEATURE_SPOTLIGHTS[1];

  return (
    <section className="alo-spotlight-section">
      <div className="alo-spotlight-container">
        <div className="alo-spotlight-grid">
          {/* Spotlight Card 1: From Work to Weekend */}
          <div className="alo-spotlight-card">
            <div className="alo-spotlight-img-wrap">
              <img
                src={spot1.image}
                alt={spot1.title}
                className="alo-spotlight-img"
                loading="lazy"
              />
              <div className="alo-spotlight-overlay" />
            </div>
            <div className="alo-spotlight-content">
              <div className="alo-spotlight-badge">
                <Sparkles size={13} />
                <span>OFFICIAL CAMPAIGN · 70% OFF</span>
              </div>
              <h2 className="alo-spotlight-title">{spot1.title.toUpperCase()}</h2>
              <p className="alo-spotlight-desc">
                {spot1.subtitle} Engineered for high-compression support with buttery soft comfort.
              </p>
              <button
                onClick={() => onSelectCategory(spot1.category)}
                className="alo-btn alo-btn-primary alo-spotlight-btn"
              >
                <span>{spot1.cta}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Spotlight Card 2: As Seen on Jin */}
          <div className="alo-spotlight-card">
            <div className="alo-spotlight-img-wrap">
              <img
                src={spot2.image}
                alt={spot2.title}
                className="alo-spotlight-img"
                loading="lazy"
              />
              <div className="alo-spotlight-overlay" />
            </div>
            <div className="alo-spotlight-content">
              <div className="alo-spotlight-badge">
                <span>GLOBAL AMBASSADOR</span>
              </div>
              <h2 className="alo-spotlight-title">{spot2.title.toUpperCase()}</h2>
              <p className="alo-spotlight-desc">
                {spot2.subtitle} The viral oversized silhouettes taking over street style everywhere.
              </p>
              <button
                onClick={() => onSelectCategory(spot2.category)}
                className="alo-btn alo-btn-primary alo-spotlight-btn"
              >
                <span>{spot2.cta}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
