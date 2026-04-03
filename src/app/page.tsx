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
          <h1 style={{ marginBottom: '1.5rem', fontSize: '3.5rem' }}>Bidding Practice</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Aplikasi latihan Bidding Bridge modern. Dapatkan distribusi acak, latih insting penawaran Anda, dan otomatis simpan progres sesi ke Supabase.
          </p>
          <button className="button primary" style={{ margin: '0 auto', fontSize: '1.2rem', padding: '1rem 2rem' }} onClick={startNewBoard} disabled={loading}>
            {loading ? 'Membuat Meja...' : 'Mulai Sesi Baru'}
          </button>
        </div>
      </div>
    );
  }

  const turnIndex = (DIRECTIONS.indexOf(dealer) + bids.length) % 4;
  const currentTurn = DIRECTIONS[turnIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--panel-border)' }}>
        <h2>Bridge Practice</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className="glass-panel" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Dealer: <strong style={{ color: 'white' }}>{dealer}</strong></span>
          <span className="glass-panel" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Vul: <strong style={{ color: vul === 'All' || vul === 'NS' || vul === 'EW' ? 'var(--red-text)' : 'white' }}>{vul}</strong></span>
          <button className="button" style={{ padding: '0.5rem 1rem' }} onClick={startNewBoard}>Papan Baru</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', flex: 1, minHeight: '600px' }}>
        {/* Table View */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ alignSelf: 'center' }}><HandView player="N" hand={deal['N']} /></div>
          
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', padding: '0 2rem' }}>
             <HandView player="W" hand={deal['W']} />
             
             {/* Center Auction Table */}
             <div className="glass-panel" style={{ width: '300px', height: '280px', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
               <h3 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>
                 Auction <span style={{ color: 'var(--accent-color)' }}>(Turn: {currentTurn})</span>
               </h3>
               
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem', marginBottom: '0.5rem', color: 'white' }}>
                 <span>N</span><span>E</span><span>S</span><span>W</span>
               </div>
               
               <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem' }}>
                 {Array.from({ length: Math.ceil((bids.length + DIRECTIONS.indexOf(dealer)) / 4) }).map((_, rIndex) => {
                   return (
                     <div key={rIndex} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
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
                           colorClass = 'suit-icon hearts'; // red for double
                         }

                         return <span key={cIndex} className={colorClass} style={{ fontWeight: 600 }}>{displayBid}</span>;
                       })}
                     </div>
                   );
                 })}
               </div>
             </div>
             
             <HandView player="E" hand={deal['E']} />
          </div>
          
          <div style={{ alignSelf: 'center' }}><HandView player="S" hand={deal['S']} /></div>
        </div>

        {/* Bidding Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <BiddingBox onBid={handleBid} />
           
           <div className="glass-panel" style={{ marginTop: '2rem', padding: '1.5rem', width: '100%', maxWidth: '450px' }}>
             <h4 style={{ marginBottom: '1rem', color: 'white' }}>Instruksi / Info</h4>
             <ul style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', lineHeight: 1.5 }}>
                <li>Meja secara otomatis membagikan kartu acak layaknya sistem kompetisi (Dealer & Vuln acak).</li>
                <li>Lakukan penawaran Bidding bergiliran. Tentukan <strong>Pass x3</strong> untuk menyelesaikan board.</li>
                <li>Sesi ini akan tersimpan permanen di Supabase yang dapat dilanjutkan dari perangkat apa pun.</li>
                <li>Deploy ke <strong style={{ color: 'white' }}>Vercel</strong> dapat dilakukan langsung lewat repositori Git.</li>
             </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
