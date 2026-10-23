import React from 'react';
import { Star, ShieldCheck, ThumbsUp, Check, Truck, Award } from 'lucide-react';
import { CUSTOMER_REVIEWS, REVIEWS_SUMMARY } from '../data/reviews';

export default function ReviewsSection() {
  return (
    <section className="alo-reviews-section" id="reviews">
      <div className="alo-reviews-container">
        {/* Section Title */}
        <div className="alo-reviews-header">
          <span className="alo-reviews-sub">AMERICAN VERIFIED PURCHASES</span>
          <h2 className="alo-reviews-title">LOVED BY OVER 18,000+ U.S. CUSTOMERS</h2>
          <p className="alo-reviews-lead">
            Read verified reviews from fitness enthusiasts, yogis, and activewear connoisseurs across the United States.
          </p>
        </div>

        {/* Aggregate Ratings Overview */}
        <div className="alo-reviews-overview-card">
          <div className="alo-overview-col-score">
            <span className="alo-score-number">{REVIEWS_SUMMARY.averageRating}</span>
            <div className="alo-stars-row">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="#111" color="#111" />
              ))}
            </div>
            <span className="alo-score-sub">Based on {REVIEWS_SUMMARY.totalReviews.toLocaleString()} verified U.S. buyers</span>
          </div>

          <div className="alo-overview-col-bars">
            {REVIEWS_SUMMARY.ratingBreakdown.map((b) => (
              <div key={b.stars} className="alo-breakdown-bar-row">
                <span className="alo-bar-star-label">{b.stars} ★</span>
                <div className="alo-bar-track">
                  <div className="alo-bar-fill" style={{ width: `${b.percentage}%` }} />
                </div>
                <span className="alo-bar-pct">{b.percentage}%</span>
              </div>
            ))}
          </div>

          <div className="alo-overview-col-badges">
            <div className="alo-overview-pill">
              <Check size={16} className="text-green-600" />
              <div>
                <strong>{REVIEWS_SUMMARY.fitScore}</strong>
                <span>Customers report perfect alignment with U.S. sizing standards</span>
              </div>
            </div>
            <div className="alo-overview-pill">
              <Check size={16} className="text-green-600" />
              <div>
                <strong>{REVIEWS_SUMMARY.comfortScore}</strong>
                <span>Praised for ultra-soft, zero-chafing Softsculpt fabric</span>
              </div>
            </div>
            <div className="alo-overview-pill">
              <Award size={16} className="text-blue-600" />
              <div>
                <strong>BBB A+ Accredited Quality</strong>
                <span>Direct dispatch from Los Angeles, CA warehouse</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Review Cards Grid */}
        <div className="alo-reviews-grid">
          {CUSTOMER_REVIEWS.map((rev) => (
            <div key={rev.id} className="alo-review-card">
              <div className="alo-review-card-top">
                <img src={rev.avatar} alt={rev.author} className="alo-review-avatar" />
                <div className="alo-review-author-info">
                  <div className="alo-review-author-name-row">
                    <h4 className="alo-review-name">{rev.author}</h4>
                    {rev.verified && (
                      <span className="alo-verified-pill">
                        <ShieldCheck size={12} /> Verified U.S. Buyer
                      </span>
                    )}
                  </div>
                  <span className="alo-review-location">{rev.location} · {rev.date}</span>
                </div>
              </div>

              <div className="alo-review-stars-row">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} size={14} fill="#111" color="#111" />
                ))}
                <span className="alo-review-fit-badge">{rev.fit}</span>
              </div>

              <div className="alo-review-prod-meta">
                <span>Purchased: <strong>{rev.product}</strong> ({rev.size})</span>
              </div>

              <h5 className="alo-review-card-title">"{rev.title}"</h5>
              <p className="alo-review-card-text">{rev.content}</p>

              {rev.reviewImg && (
                <div className="alo-review-img-wrap">
                  <img src={rev.reviewImg} alt="Customer item" className="alo-review-customer-img" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
