-- Loan Products Table
CREATE TABLE IF NOT EXISTS loan_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL CHECK (interest_rate >= 0 AND interest_rate <= 100),
  min_amount DECIMAL(15, 2) NOT NULL CHECK (min_amount > 0),
  max_amount DECIMAL(15, 2) NOT NULL CHECK (max_amount > 0),
  min_term_months INTEGER NOT NULL CHECK (min_term_months > 0),
  max_term_months INTEGER NOT NULL CHECK (max_term_months > 0),
  eligibility_score INTEGER NOT NULL CHECK (eligibility_score >= 0 AND eligibility_score <= 100),
  category VARCHAR(50) NOT NULL CHECK (category IN ('personal', 'home', 'auto', 'business', 'student', 'credit-card')),
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_pre_approved BOOLEAN NOT NULL DEFAULT false,
  processing_time VARCHAR(100) NOT NULL,
  max_ltv DECIMAL(5, 2) CHECK (max_ltv IS NULL OR (max_ltv >= 0 AND max_ltv <= 100)),
  credit_score_min INTEGER CHECK (credit_score_min IS NULL OR (credit_score_min >= 300 AND credit_score_min <= 850)),
  income_min DECIMAL(15, 2) CHECK (income_min IS NULL OR income_min > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_loan_products_category ON loan_products(category);
CREATE INDEX IF NOT EXISTS idx_loan_products_eligibility_score ON loan_products(eligibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_loan_products_interest_rate ON loan_products(interest_rate);
CREATE INDEX IF NOT EXISTS idx_loan_products_is_pre_approved ON loan_products(is_pre_approved);

-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES loan_products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for chat sessions
CREATE INDEX IF NOT EXISTS idx_chat_sessions_product_id ON chat_sessions(product_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_loan_products_updated_at
  BEFORE UPDATE ON loan_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE loan_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to loan products
CREATE POLICY "Allow public read access to loan products"
  ON loan_products
  FOR SELECT
  USING (true);

-- Policy: Allow users to create their own chat sessions
CREATE POLICY "Allow users to create their own chat sessions"
  ON chat_sessions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow users to read their own chat sessions
CREATE POLICY "Allow users to read their own chat sessions"
  ON chat_sessions
  FOR SELECT
  USING (true);

-- Policy: Allow users to update their own chat sessions
CREATE POLICY "Allow users to update their own chat sessions"
  ON chat_sessions
  FOR UPDATE
  USING (true);

