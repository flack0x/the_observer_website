-- Create metrics table for storing pre-computed analytics
CREATE TABLE IF NOT EXISTS metrics (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL,  -- 'daily_snapshot', 'country_mentions', etc.
    data JSONB NOT NULL,               -- The computed metrics
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by type
CREATE INDEX idx_metrics_type ON metrics(metric_type);
CREATE INDEX idx_metrics_computed_at ON metrics(computed_at DESC);

-- Enable RLS
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- Allow public read access to metrics
CREATE POLICY "Allow public read access to metrics"
    ON metrics FOR SELECT
    USING (true);

-- Allow service role to insert/update metrics
CREATE POLICY "Allow service role to manage metrics"
    ON metrics FOR ALL
    USING (true)
    WITH CHECK (true);
