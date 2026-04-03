'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Deal, Direction, dealCards, DIRECTIONS, VULNERABILITIES, Vulnerability, getSuitIcon } from '@/lib/bridge';
import HandView from '@/components/HandView';
import BiddingBox from '@/components/BiddingBox';

export default function Home() {
  const [session, setSession] = useState<{ id: string } | null>(null);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [dealer, setDealer] = useState<Direction>('N');
  const [vul, setVul] = useState<Vulnerability>('None');
  const [bids, setBids] = useState<{ player: Direction, bid: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Default to showing all hands. On mobile, we might want to just scroll down.
  const [mobileActiveTab, setMobileActiveTab] = useState<'auction' | 'hands'>('auction');

  const startNewBoard = async () => {
    setLoading(true);
    const newDeal = dealCards();
    const newDealer = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    const newVul = VULNERABILITIES[Math.floor(Math.random() * VULNERABILITIES.length)];
    
    setDeal(newDeal);
    setDealer(newDealer);
    setVul(newVul);
    setBids([]);

    try {
      const { data, error } = await supabase.from('practice_sessions').insert([
        { dealer: newDealer, vulnerability: newVul, cards: newDeal }
      ]).select().single();
      
      if (data) setSession({ id: data.id });
    } catch (e) {
      console.warn("Supabase not connected. Working locally.", e);
    }
    setLoading(false);
  };

  const handleBid = async (bidString: string) => {
    const turnIndex = (DIRECTIONS.indexOf(dealer) + bids.length) % 4;
    const playerToBid = DIRECTIONS[turnIndex];
    
    const newBid = { player: playerToBid, bid: bidString };
    const updatedBids = [...bids, newBid];
    setBids(updatedBids);

    if (session) {
      try {
        await supabase.from('bids').insert([{ 
          session_id: session.id, 
          player: playerToBid, 
          bid: bidString,
          order_index: updatedBids.length 
        }]);
      } catch (e) {
         console.warn("Could not save bid.", e);
      }
    }
  };

  if (!deal) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px' }}>
          <h1 style={{ marginBottom: '1.5rem', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>Bridge Mobile</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', lineHeight: 1.6 }}>
            Aplikasi latihan Bidding Bridge modern yang dirancang khusus untuk kemudahan akses via perangkat mobile (HP) Anda. Latih insting, dan simpan riwayat di Supabase.
          </p>
          <button className="button primary" style={{ margin: '0 auto', fontSize: '1.1rem', padding: '0.8rem 2rem' }} onClick={startNewBoard} disabled={loading}>
            {loading ? 'Menyiapkan Meja...' : 'Mulai Sesi Baru'}
          </button>
        </div>
      </div>
    );
  }

  const turnIndex = (DIRECTIONS.indexOf(dealer) + bids.length) % 4;
  const currentTurn = DIRECTIONS[turnIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <header className="page-header">
        <h2 style={{ fontSize: '1.5rem' }}>Practice</h2>
        <div className="header-actions">
          <span className="glass-panel" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Dlr: <strong style={{ color: 'white' }}>{dealer}</strong></span>
          <span className="glass-panel" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Vul: <strong style={{ color: vul === 'All' || vul === 'NS' || vul === 'EW' ? 'var(--red-text)' : 'white' }}>{vul}</strong></span>
          <button className="button primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={startNewBoard}>Refresh</button>
        </div>
      </header>

      {/* Tabs for mobile view toggle (only really visible/styled nicely on mobile behavior) */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }} className="mobile-tabs">
        <button 
          className="button" 
          style={{ flex: 1, borderColor: mobileActiveTab === 'auction' ? 'var(--accent-color)' : '', color: mobileActiveTab === 'auction' ? 'white' : 'var(--text-secondary)' }}
          onClick={() => setMobileActiveTab('auction')}
        >
          Meja & Lelang
        </button>
        <button 
          className="button" 
          style={{ flex: 1, borderColor: mobileActiveTab === 'hands' ? 'var(--accent-color)' : '', color: mobileActiveTab === 'hands' ? 'white' : 'var(--text-secondary)' }}
          onClick={() => setMobileActiveTab('hands')}
        >
          Lihat Kartu
        </button>
      </div>

      <div className="main-layout">
        {/* Table & Hands View */}
        <div style={{ display: mobileActiveTab === 'auction' ? 'block' : 'none' }}>
           {/* On mobile, standard table is too wide. We use the updated .table-grid */}
           <div className="table-grid">
               <div className="pos-n"><HandView player="N" hand={deal['N']} isHidden={true} /></div>
               <div className="pos-w"><HandView player="W" hand={deal['W']} isHidden={true} /></div>
               
               {/* Center Auction */}
               <div className="glass-panel pos-c" style={{ height: '300px', padding: '1rem', display: 'flex', flexDirection: 'column', width: '100%' }}>
                 <h3 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>
                   Auction <span style={{ color: 'var(--accent-color)' }}>(Turn: {currentTurn})</span>
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.25rem', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem', marginBottom: '0.5rem', color: 'white' }}>
                   <span>N</span><span>E</span><span>S</span><span>W</span>
                 </div>
                 
                 <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem' }}>
                   {Array.from({ length: Math.ceil((bids.length + DIRECTIONS.indexOf(dealer)) / 4) }).map((_, rIndex) => {
                     return (
                       <div key={rIndex} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.25rem', textAlign: 'center' }}>
                         {DIRECTIONS.map((dir, cIndex) => {
                           const bidIndex = rIndex * 4 + cIndex - DIRECTIONS.indexOf(dealer);
                           const bidObj = bids[bidIndex];
                           if (bidIndex < 0 || !bidObj) return <span key={cIndex}></span>;

                           let displayBid = bidObj.bid;
                           let colorClass = '';
                           if (displayBid.length === 2 && ['C', 'D', 'H', 'S'].includes(displayBid[1])) {
                             const icon = getSuitIcon(displayBid[1] as any);
                             displayBid = `${displayBid[0]} ${icon.symbol}`;
                             colorClass = icon.colorClass;
                           } else if (displayBid === 'PASS') {
                             colorClass = 'suit-icon';
                           } else if (displayBid === 'X') {
                             colorClass = 'suit-icon hearts';
                           }

                           return <span key={cIndex} className={colorClass} style={{ fontWeight: 600, fontSize: '0.95rem' }}>{displayBid}</span>;
                         })}
                       </div>
                     );
                   })}
                 </div>
               </div>

               <div className="pos-e"><HandView player="E" hand={deal['E']} isHidden={true} /></div>
               <div className="pos-s"><HandView player="S" hand={deal['S']} /></div>
           </div>
        </div>
        
        {/* Mobile secondary tab for seeing hands stacked (Alternative View) */}
        <div style={{ display: mobileActiveTab === 'hands' ? 'flex' : 'none', flexDirection: 'column', gap: '1rem' }} className="mobile-only-hands">
            <HandView player="N" hand={deal['N']} isHidden={true} />
            <HandView player="E" hand={deal['E']} isHidden={true} />
            <HandView player="S" hand={deal['S']} />
            <HandView player="W" hand={deal['W']} isHidden={true} />
        </div>

        {/* Bidding Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
           <BiddingBox onBid={handleBid} />
           
           <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1.25rem', width: '100%', maxWidth: '450px' }}>
             <h4 style={{ marginBottom: '1rem', color: 'white', fontSize: '1rem' }}>Info</h4>
             <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: 1.5 }}>
                <li>Dioptimalkan untuk mobile. Gunakan <em>tab toggle</em> di atas untuk beralih antara "Meja & Lelang" dengan mode fokus "Lihat Kartu".</li>
                <li>Riwayat sesi bidding terpusat dan dapat dibuka lintas perangkat.</li>
             </ul>
           </div>
        </div>
      </div>
      
      <style jsx>{`
        @media (min-width: 769px) {
          .mobile-tabs { display: none !important; }
          .mobile-only-hands { display: none !important; }
          .main-layout > div { display: block !important; } 
        }
      `}</style>
    </div>
  );
}
