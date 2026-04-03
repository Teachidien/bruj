import React from 'react';
import { Hand, SUITS, getSuitIcon } from '@/lib/bridge';

export default function HandView({ hand, player, isHidden }: { hand?: Hand, player: string, isHidden?: boolean }) {
  if (isHidden || !hand) {
    return (
      <div className="glass-panel" style={{ padding: '1rem', minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '180px' }}>
        <h3 style={{ color: 'var(--text-secondary)' }}>{player} - Hidden</h3>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '1rem', minWidth: '200px' }}>
      <h3 style={{ marginBottom: '1rem', textAlign: 'center', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>{player}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {SUITS.map(suit => {
          const { symbol, colorClass } = getSuitIcon(suit);
          const cards = hand[suit];
          return (
            <div key={suit} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem' }}>
              <span className={colorClass} style={{ width: '24px', textAlign: 'center' }}>{symbol}</span>
              <span style={{ letterSpacing: '2px', fontWeight: 500 }}>
                {cards.length > 0 ? cards.join(' ') : <span style={{ color: 'var(--text-secondary)' }}>-</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
