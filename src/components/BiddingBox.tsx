import React from 'react';
import { BID_LEVELS, BID_STRAINS, getSuitIcon } from '@/lib/bridge';

interface BiddingBoxProps {
  onBid: (bid: string) => void;
  disabled?: boolean;
}

export default function BiddingBox({ onBid, disabled }: BiddingBoxProps) {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem', width: '100%', maxWidth: '450px' }}>
      <h3 style={{ marginBottom: '1.25rem', textAlign: 'center' }}>Bidding Box</h3>
      <div className="bidding-box-grid">
        {BID_LEVELS.map(level => (
          BID_STRAINS.map(strain => {
             const { symbol, colorClass } = getSuitIcon(strain as any);
             return (
               <button 
                 key={`${level}${strain}`} 
                 className="button" 
                 style={{ display: 'flex', gap: '0.15rem' }}
                 onClick={() => onBid(`${level}${strain}`)}
                 disabled={disabled}
               >
                 <span className="bid-btn-text">{level}</span>
                 <span className={`${colorClass} bid-btn-text`}>{symbol}</span>
               </button>
             );
          })
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button className="button" style={{ flex: '1 1 80px', backgroundColor: 'var(--green-btn)', color: 'var(--green-text)', borderColor: 'var(--green-border)' }} onClick={() => onBid('PASS')} disabled={disabled}>PASS</button>
        <button className="button" style={{ flex: '1 1 80px', backgroundColor: 'var(--red-btn)', color: 'var(--red-text)', borderColor: 'var(--red-border)' }} onClick={() => onBid('X')} disabled={disabled}>DOUBLE</button>
        <button className="button" style={{ flex: '1 1 80px', backgroundColor: 'var(--accent-glow)', color: 'var(--accent-color)', borderColor: 'var(--accent-hover)' }} onClick={() => onBid('XX')} disabled={disabled}>REDOUBLE</button>
      </div>
    </div>
  );
}
