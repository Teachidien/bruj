import { Hand, Suit, Rank } from './bridge';

export type BiddingSystem = 'SAYC' | '2/1 GF' | 'Precision';

const HCPMap: Record<Rank, number> = {
  'A': 4, 'K': 3, 'Q': 2, 'J': 1,
  'T': 0, '9': 0, '8': 0, '7': 0, '6': 0, '5': 0, '4': 0, '3': 0, '2': 0
};

export function calculateHCP(hand: Hand): number {
  let hcp = 0;
  for (const suit in hand) {
    for (const rank of hand[suit as Suit]) {
      hcp += HCPMap[rank];
    }
  }
  return hcp;
}

export function isBalanced(hand: Hand): boolean {
  const lengths = [hand.S.length, hand.H.length, hand.D.length, hand.C.length].sort((a, b) => b - a);
  // Balanced shapes: 4-3-3-3, 4-4-3-2, 5-3-3-2
  const shape = lengths.join('-');
  return shape === '4-3-3-3' || shape === '4-4-3-2' || shape === '5-3-3-2';
}

function getLongestSuit(hand: Hand, allowedSuits: Suit[] = ['S', 'H', 'D', 'C']): Suit {
  let longest: Suit = allowedSuits[0];
  let maxLen = -1;
  // If lengths are equal, sort by Spades > Hearts > Diamonds > Clubs (standard bridge priority)
  for (const suit of allowedSuits) {
    if (hand[suit].length > maxLen) {
      maxLen = hand[suit].length;
      longest = suit;
    }
  }
  return longest;
}

function getOpeningBid(hand: Hand, system: BiddingSystem): string {
  const hcp = calculateHCP(hand);
  const balanced = isBalanced(hand);
  const sLen = hand.S.length;
  const hLen = hand.H.length;

  if (system === 'Precision') {
    if (hcp >= 16) {
      return '1C'; // Strong club
    }
    if (hcp >= 11 && hcp <= 15) {
      if (balanced && hcp >= 13 && hcp <= 15) { // Assuming 13-15 or 14-16 NT range for precision, we use 13-15 here
        return '1NT';
      }
      if (sLen >= 5 || hLen >= 5) {
        return sLen >= hLen ? '1S' : '1H';
      }
      return '1D'; // Catch-all non-balanced or <5 Major
    }
    return 'PASS';
  }

  // SAYC and 2/1 logic are mostly similar for standard opening bids
  if (hcp >= 12) {
    if (balanced && hcp >= 15 && hcp <= 17) {
      return '1NT';
    }
    if (balanced && hcp >= 20 && hcp <= 21) {
      return '2NT';
    }
    // 5-card Majors
    if (sLen >= 5 || hLen >= 5) {
      return sLen >= hLen ? '1S' : '1H';
    }
    // Minors
    const dLen = hand.D.length;
    const cLen = hand.C.length;
    // Better minor rule: if equal length (3-3 or 4-4), open 1D if 4-4, 1C if 3-3.
    if (dLen === cLen) {
      return dLen >= 4 ? '1D' : '1C';
    }
    return dLen > cLen ? '1D' : '1C';
  }

  return 'PASS';
}

export function getBotBid(
  hand: Hand,
  bidsHistory: { player: string, bid: string }[],
  system: BiddingSystem
): string {
  // Check if anyone has opened yet (a bid other than PASS)
  const isOpening = bidsHistory.every(b => b.bid === 'PASS');

  if (isOpening) {
    return getOpeningBid(hand, system);
  }

  // For now, in our "Lite" version, if the bidding has started, the bot just passes.
  // This prevents the bot from making illogical competitive bids or taking the contract off the rails 
  // when the user wants to practice uncontested or specific response scenarios.
  return 'PASS';
}
