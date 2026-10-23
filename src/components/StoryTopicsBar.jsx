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
                    src={(topic.image || '').replace(/ /g, '%20')}
                    alt={topic.label}
                    className="alo-topic-avatar-img"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://aloyogabr.vtexassets.com/assets/vtex.file-manager-graphql/images/b79fe3ed-b753-42a7-8df7-19ffc18ef90b___087470f6fd7f501eb6beca78c5dc1de4.jpg';
                    }}
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
