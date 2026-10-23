import React from 'react';
import { Sparkles, Globe, RefreshCw, Star } from 'lucide-react';

export default function ValuePillars() {
  const pillars = [
    {
      icon: <Sparkles size={22} strokeWidth={1.5} />,
      title: "PROPRIETARY SOFTSCULPT™",
      desc: "Micro-compression knit engineered to contour, lift, and sculpt with zero sheer."
    },
    {
      icon: <Globe size={22} strokeWidth={1.5} />,
      title: "U.S. PRIORITY TRACKED SHIPPING",
      desc: "Dispatched from Los Angeles, CA with fast 2-4 business day USPS delivery nationwide."
    },
    {
      icon: <RefreshCw size={22} strokeWidth={1.5} />,
      title: "30-DAY RISK-FREE U.S. TRIAL",
      desc: "Prepaid USPS return label included in every box. Zero restocking fees on exchanges."
    },
    {
      icon: <Star size={22} strokeWidth={1.5} />,
      title: "15,000+ VERIFIED 5-STARS",
      desc: "Consistently rated #1 for luxury activewear by fitness enthusiasts and stylists globally."
    }
  ];

  return (
    <section className="alo-pillars-section">
      <div className="alo-pillars-container">
        <div className="alo-pillars-grid">
          {pillars.map((p, idx) => (
            <div key={idx} className="alo-pillar-card">
              <div className="alo-pillar-icon-box">{p.icon}</div>
              <h3 className="alo-pillar-title">{p.title}</h3>
              <p className="alo-pillar-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
