import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function SizeGuideModal({ isOpen, onClose }) {
  const [unit, setUnit] = useState('inches'); // 'inches' | 'cm'

  if (!isOpen) return null;

  const sizeData = [
    { size: 'XXS (00-0)', bustIn: '30-31', bustCm: '76-79', waistIn: '23-24', waistCm: '58-61', hipIn: '33-34', hipCm: '84-86', us: '00-0', uk: '4', eu: '30-32' },
    { size: 'XS (2-4)', bustIn: '32-33', bustCm: '81-84', waistIn: '25-26', waistCm: '63-66', hipIn: '35-36', hipCm: '89-91', us: '2-4', uk: '6-8', eu: '34-36' },
    { size: 'S (4-6)', bustIn: '34-35', bustCm: '86-89', waistIn: '27-28', waistCm: '68-71', hipIn: '37-38', hipCm: '94-97', us: '4-6', uk: '8-10', eu: '36-38' },
    { size: 'M (8-10)', bustIn: '36-37', bustCm: '91-94', waistIn: '29-30', waistCm: '74-76', hipIn: '39-40', hipCm: '99-102', us: '8-10', uk: '12-14', eu: '40-42' },
    { size: 'L (12-14)', bustIn: '38-40', bustCm: '96-101', waistIn: '31-33', waistCm: '79-84', hipIn: '41-43', hipCm: '104-109', us: '12-14', uk: '16', eu: '44-46' },
    { size: 'XL (16-18)', bustIn: '41-43', bustCm: '104-109', waistIn: '34-36', waistCm: '86-91', hipIn: '44-46', hipCm: '112-117', us: '16-18', uk: '18-20', eu: '48-50' },
  ];

  return (
    <div className="alo-modal-backdrop" onClick={onClose}>
      <div className="alo-modal-container alo-size-modal" onClick={(e) => e.stopPropagation()}>
        <div className="alo-modal-header">
          <div>
            <h3 className="alo-modal-title">OFFICIAL SIZE & FIT GUIDE</h3>
            <p className="alo-modal-sub">Engineered for a contoured, true-to-size fit</p>
          </div>
          <button className="alo-icon-btn" onClick={onClose} aria-label="Close size guide">
            <X size={20} />
          </button>
        </div>

        {/* Unit Selector */}
        <div className="alo-unit-toggle">
          <button
            className={`alo-unit-btn ${unit === 'inches' ? 'active' : ''}`}
            onClick={() => setUnit('inches')}
          >
            Inches (in)
          </button>
          <button
            className={`alo-unit-btn ${unit === 'cm' ? 'active' : ''}`}
            onClick={() => setUnit('cm')}
          >
            Centimeters (cm)
          </button>
        </div>

        {/* Size Chart Table */}
        <div className="alo-table-responsive">
          <table className="alo-size-table">
            <thead>
              <tr>
                <th>SIZE</th>
                <th>BUST</th>
                <th>WAIST</th>
                <th>HIPS</th>
                <th>US</th>
                <th>UK</th>
                <th>EU</th>
              </tr>
            </thead>
            <tbody>
              {sizeData.map((row, idx) => (
                <tr key={idx}>
                  <td className="font-semibold">{row.size}</td>
                  <td>{unit === 'inches' ? `${row.bustIn}"` : `${row.bustCm} cm`}</td>
                  <td>{unit === 'inches' ? `${row.waistIn}"` : `${row.waistCm} cm`}</td>
                  <td>{unit === 'inches' ? `${row.hipIn}"` : `${row.hipCm} cm`}</td>
                  <td>{row.us}</td>
                  <td>{row.uk}</td>
                  <td>{row.eu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="alo-size-tips">
          <div className="alo-tip-item">
            <Check size={16} className="text-green-600" />
            <span><strong>Between sizes?</strong> If you prefer high compression, size down. For relaxed studio lounge, choose your regular size.</span>
          </div>
          <div className="alo-tip-item">
            <Check size={16} className="text-green-600" />
            <span><strong>Free Exchanges:</strong> If your size doesn't fit like a glove, exchange it free of charge within 30 days.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
