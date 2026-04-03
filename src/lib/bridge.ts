export type Suit = 'S' | 'H' | 'D' | 'C';
export type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';
export type Card = `${Rank}${Suit}`;
export type Direction = 'N' | 'E' | 'S' | 'W';
export type Vulnerability = 'None' | 'NS' | 'EW' | 'All';
export type Hand = Record<Suit, Rank[]>;
export type Deal = Record<Direction, Hand>;

export const SUITS: Suit[] = ['S', 'H', 'D', 'C'];
export const RANKS: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
export const DIRECTIONS: Direction[] = ['N', 'E', 'S', 'W'];
export const VULNERABILITIES: Vulnerability[] = ['None', 'NS', 'EW', 'All'];

export function generateDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push(`${rank}${suit}` as Card);
        }
    }
    return deck;
}

export function shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

export function dealCards(): Deal {
    const deck = shuffle(generateDeck());
    
    // Initialize empty deal
    const deal: any = {};
    for (const dir of DIRECTIONS) {
        deal[dir] = { S: [], H: [], D: [], C: [] };
    }

    DIRECTIONS.forEach((dir, i) => {
        const handCards = deck.slice(i * 13, (i + 1) * 13);
        // assign to suits
        handCards.forEach(card => {
            const rank = card[0] as Rank;
            const suit = card[1] as Suit;
            deal[dir][suit].push(rank);
        });
        
        // Sort ranks within each suit based on standard order (A high to 2 low)
        for (const suit of SUITS) {
            deal[dir][suit].sort((a: Rank, b: Rank) => RANKS.indexOf(a) - RANKS.indexOf(b));
        }
    });

    return deal as Deal;
}

export const BID_LEVELS = [1, 2, 3, 4, 5, 6, 7];
export const BID_STRAINS = ['C', 'D', 'H', 'S', 'NT'];

export function getSuitIcon(suit: Suit | 'NT'): { symbol: string, colorClass: string } {
    switch (suit) {
        case 'S': return { symbol: '♠', colorClass: 'suit-icon spades' };
        case 'H': return { symbol: '♥', colorClass: 'suit-icon hearts' };
        case 'D': return { symbol: '♦', colorClass: 'suit-icon diamonds' };
        case 'C': return { symbol: '♣', colorClass: 'suit-icon clubs' };
        case 'NT': return { symbol: 'NT', colorClass: 'suit-icon' };
        default: return { symbol: '', colorClass: '' };
    }
}
