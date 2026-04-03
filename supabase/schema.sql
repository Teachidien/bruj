CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.practice_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer VARCHAR(1) NOT NULL, -- N, E, S, W
    vulnerability VARCHAR(4) NOT NULL, -- None, NS, EW, All
    cards JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
    player VARCHAR(1) NOT NULL, -- N, E, S, W
    bid VARCHAR(5) NOT NULL, -- 1C, 2NT, PASS, X, XX
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read and insert (since there's no auth required yet)
CREATE POLICY "Allow anonymous read sessions" ON public.practice_sessions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anonymous insert sessions" ON public.practice_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow anonymous read bids" ON public.bids FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anonymous insert bids" ON public.bids FOR INSERT TO anon, authenticated WITH CHECK (true);
