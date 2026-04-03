import React from 'react';
import { Hand, SUITS, Rank, Suit } from '@/lib/bridge';

const SUIT_SYMBOLS: Record<Suit, string> = {
  S: '♠',
  H: '♥',
  D: '♦',
  C: '♣',
};

const SUIT_COLORS: Record<Suit, string> = {
  S: '#1a1a2e',
  H: '#c0392b',
  D: '#c0392b',
  C: '#1a1a2e',
};

const SUIT_TEXT_COLORS: Record<Suit, string> = {
  S: '#1a1a2e',
  H: '#dc2626',
  D: '#dc2626',
  C: '#065f46',
};

function PlayingCard({ rank, suit }: { rank: Rank; suit: Suit }) {
  const symbol = SUIT_SYMBOLS[suit];
  const textColor = SUIT_TEXT_COLORS[suit];
  const displayRank = rank === 'T' ? '10' : rank;

  return (
    <div className="playing-card">
      <div className="card-inner" style={{ color: textColor }}>
        <div className="card-corner top-left">
          <span className="card-rank">{displayRank}</span>
          <span className="card-suit-small">{symbol}</span>
        </div>
        <div className="card-center-suit">{symbol}</div>
        <div className="card-corner bottom-right">
          <span className="card-rank">{displayRank}</span>
          <span className="card-suit-small">{symbol}</span>
        </div>
      </div>
    </div>
  );
}

export default function CardSpread({ hand, player }: { hand: Hand; player: string }) {
  // Flatten all cards in order: S, H, D, C
  const allCards: { rank: Rank; suit: Suit }[] = [];
  for (const suit of SUITS) {
    for (const rank of hand[suit]) {
      allCards.push({ rank, suit });
    }
  }

  return (
    <div className="card-spread-container">
      <div className="card-spread-label">{player}</div>
      <div className="card-spread-row">
        {allCards.map((c, i) => (
          <div
            key={i}
            className="card-spread-item"
            style={{ zIndex: i, marginLeft: i === 0 ? 0 : '-28px' }}
          >
            <PlayingCard rank={c.rank} suit={c.suit} />
          </div>
        ))}
      </div>
    </div>
  );
}
