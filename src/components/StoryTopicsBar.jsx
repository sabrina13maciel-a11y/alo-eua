import React, { useRef } from 'react';
import { STORE_TOPICS } from '../data/storeData';

export default function StoryTopicsBar({ activeCategory, onSelectCategory }) {
  const scrollRef = useRef(null);

  const handleTopicClick = (catVal) => {
    onSelectCategory(catVal);
    // Smoothly scroll down towards products
    const gridElem = document.getElementById('collection-grid');
    if (gridElem) {
      gridElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="alo-topics-section">
      <div className="alo-topics-container">
        <div className="alo-topics-header">
          <span className="alo-topics-sub">EXPLORE COLLECTIONS</span>
          <span className="alo-topics-hint hidden-desktop">Swipe to discover →</span>
        </div>

        {/* Horizontal Drag/Swipe Circular Topics Bar */}
        <div className="alo-topics-scroll-track" ref={scrollRef}>
          {STORE_TOPICS.map((topic) => {
            const isActive = activeCategory === topic.category || (topic.category === 'all' && activeCategory === 'all');
            return (
              <button
                key={topic.id}
                className={`alo-topic-bubble-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleTopicClick(topic.category)}
              >
                <div className="alo-topic-avatar-wrap">
                  <img
                    src={topic.image}
                    alt={topic.label}
                    className="alo-topic-avatar-img"
                    loading="lazy"
                  />
                  {topic.badge && (
                    <span className="alo-topic-badge">{topic.badge}</span>
                  )}
                </div>
                <span className="alo-topic-label">{topic.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
