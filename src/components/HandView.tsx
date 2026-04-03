import React from 'react';
import { Hand, SUITS, getSuitIcon } from '@/lib/bridge';

export default function HandView({ hand, player, isHidden }: { hand?: Hand, player: string, isHidden?: boolean }) {
  if (isHidden || !hand) {
    return (
      <div className="glass-panel" style={{ padding: '0.75rem', minWidth: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '140px', width: '100%' }}>
        <h3 style={{ color: 'var(--text-secondary)' }}>{player} - Hidden</h3>
      </div>
    );
  }

  return (
    <div className="glass-panel hand-view-card" style={{ padding: '0.75rem 1rem', minWidth: '130px', width: '100%' }}>
      <h3 style={{ marginBottom: '0.6rem', textAlign: 'center', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.35rem', fontSize: '1rem', letterSpacing: '0.1em' }}>{player}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {SUITS.map(suit => {
          const { symbol, colorClass } = getSuitIcon(suit);
          const cards = hand[suit];
          return (
            <div key={suit} className="hand-card-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={colorClass} style={{ width: '20px', textAlign: 'center', fontSize: '1.1rem' }}>{symbol}</span>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {cards.length > 0 ? cards.map((rank, i) => {
                  const display = rank === 'T' ? '10' : rank;
                  const isRed = suit === 'H' || suit === 'D';
                  return (
                    <span
                      key={i}
                      className="inline-card"
                      style={{ color: isRed ? 'var(--suit-hearts)' : 'var(--suit-spades)' }}
                    >
                      {display}
                    </span>
                  );
                }) : <span style={{ color: 'var(--text-secondary)' }}>-</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
