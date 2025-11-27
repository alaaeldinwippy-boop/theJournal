/*
  # Create Trading Journal Database Schema

  1. New Tables
    - `users` - User profiles and authentication data
    - `trades` - Main trade journal entries
    - `trade_platforms` - Junction table for trades to platforms (many-to-many)
    - `trade_setups` - Junction table for trades to setups (many-to-many)
    - `trade_confluences` - Junction table for trades to confluences (many-to-many)
    - `checklist_responses` - Checklist item responses for each trade
    - `statistics` - Aggregated statistics for users

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - All tables linked to user via user_id foreign key

  3. Key Features
    - Full trade details with all required fields
    - Support for multiple platforms and setups per trade
    - Checklist score tracking
    - Trade statistics and performance metrics
    - Timestamps for audit trail
*/

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  session text NOT NULL CHECK (session IN ('Tokyo', 'London', 'New York')),
  timeframe text NOT NULL CHECK (timeframe IN ('M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D', 'W')),
  instrument text NOT NULL CHECK (instrument IN ('XAUUSD', 'NASDAQ 100', 'S&P 500', 'EURUSD', 'GBPJPY')),
  direction text NOT NULL CHECK (direction IN ('Long', 'Short')),
  entry_price decimal(20, 8) NOT NULL,
  take_profit_price decimal(20, 8) NOT NULL,
  stop_level_price decimal(20, 8) NOT NULL,
  points decimal(20, 8) DEFAULT 0,
  outcome text NOT NULL DEFAULT 'Pending' CHECK (outcome IN ('Win', 'Loss', 'Breakeven', 'Pending')),
  risk_reward decimal(10, 2) DEFAULT 0,
  realized_pnl decimal(20, 8),
  mindset text NOT NULL CHECK (mindset IN ('Frustrated', 'FOMO', 'Overconfident', 'Overtrading', 'Revenge Trading', 'Hesitant', 'Nervous', 'Mindful', 'Confident', 'Calm')),
  followed_plan boolean DEFAULT true,
  notes text DEFAULT '',
  image_url text,
  checklist_score decimal(5, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_prices CHECK (entry_price > 0 AND take_profit_price > 0 AND stop_level_price >= 0)
);

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trades"
  ON trades FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON trades FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON trades FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON trades FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_date ON trades(user_id, date DESC);
CREATE INDEX idx_trades_instrument ON trades(user_id, instrument);

-- Create trade_platforms junction table
CREATE TABLE IF NOT EXISTS trade_platforms (
  trade_id uuid NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('FTMO Account', 'FTMO Challenge', 'FTMO Verification', 'Topstep Combine', 'Topstep XFA', 'Topstep Live')),
  PRIMARY KEY (trade_id, platform)
);

ALTER TABLE trade_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trade platforms"
  ON trade_platforms FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = trade_platforms.trade_id
      AND trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own trade platforms"
  ON trade_platforms FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = trade_platforms.trade_id
      AND trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own trade platforms"
  ON trade_platforms FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = trade_platforms.trade_id
      AND trades.user_id = auth.uid()
    )
  );

-- Create trade_setups junction table
CREATE TABLE IF NOT EXISTS trade_setups (
  trade_id uuid NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  setup text NOT NULL CHECK (setup IN ('MSS', 'Reversal', 'Trend', 'ORB')),
  PRIMARY KEY (trade_id, setup)
);

ALTER TABLE trade_setups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trade setups"
  ON trade_setups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = trade_setups.trade_id
      AND trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own trade setups"
  ON trade_setups FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = trade_setups.trade_id
      AND trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own trade setups"
  ON trade_setups FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = trade_setups.trade_id
      AND trades.user_id = auth.uid()
    )
  );

-- Create trade_confluences junction table
CREATE TABLE IF NOT EXISTS trade_confluences (
  trade_id uuid NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  confluence text NOT NULL CHECK (confluence IN ('EMA', 'Fibonacci', 'MACD', 'Candlestick')),
  PRIMARY KEY (trade_id, confluence)
);

ALTER TABLE trade_confluences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trade confluences"
  ON trade_confluences FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = trade_confluences.trade_id
      AND trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own trade confluences"
  ON trade_confluences FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = trade_confluences.trade_id
      AND trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own trade confluences"
  ON trade_confluences FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = trade_confluences.trade_id
      AND trades.user_id = auth.uid()
    )
  );

-- Create checklist_responses table
CREATE TABLE IF NOT EXISTS checklist_responses (
  trade_id uuid NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  checklist_item_id text NOT NULL,
  response boolean NOT NULL,
  PRIMARY KEY (trade_id, checklist_item_id)
);

ALTER TABLE checklist_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklist responses"
  ON checklist_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = checklist_responses.trade_id
      AND trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own checklist responses"
  ON checklist_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = checklist_responses.trade_id
      AND trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own checklist responses"
  ON checklist_responses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = checklist_responses.trade_id
      AND trades.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = checklist_responses.trade_id
      AND trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own checklist responses"
  ON checklist_responses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = checklist_responses.trade_id
      AND trades.user_id = auth.uid()
    )
  );

-- Create statistics table for performance tracking
CREATE TABLE IF NOT EXISTS statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_trades integer DEFAULT 0,
  winning_trades integer DEFAULT 0,
  losing_trades integer DEFAULT 0,
  breakeven_trades integer DEFAULT 0,
  pending_trades integer DEFAULT 0,
  win_rate decimal(5, 2) DEFAULT 0,
  total_pnl decimal(20, 8) DEFAULT 0,
  average_rr decimal(10, 2) DEFAULT 0,
  average_checklist_score decimal(5, 2) DEFAULT 0,
  best_trade_pnl decimal(20, 8),
  worst_trade_pnl decimal(20, 8),
  consecutive_wins integer DEFAULT 0,
  consecutive_losses integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_stats UNIQUE (user_id)
);

ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own statistics"
  ON statistics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own statistics"
  ON statistics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_statistics_user_id ON statistics(user_id);