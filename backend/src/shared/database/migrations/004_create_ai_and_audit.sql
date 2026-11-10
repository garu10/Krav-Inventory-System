-- 004_create_ai_and_audit.sql
-- AI demand forecasts, actionable prescriptions/recommendations, and full audit trail

-- 16. Forecasts Table (AI Demand Predictions)
CREATE TABLE IF NOT EXISTS forecasts (
  forecast_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(item_id) ON DELETE CASCADE,
  forecast_date DATE NOT NULL,
  predicted_qty NUMERIC(12, 3) NOT NULL CHECK (predicted_qty >= 0),
  lower_bound NUMERIC(12, 3) CHECK (lower_bound >= 0),
  upper_bound NUMERIC(12, 3) CHECK (upper_bound >= 0),
  model_name VARCHAR(100) NOT NULL DEFAULT 'MovingAverage',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forecasts_item_date ON forecasts(item_id, forecast_date);

-- 17. Recommendations Table (AI Prescriptions & Human-in-the-loop Feedback)
CREATE TABLE IF NOT EXISTS recommendations (
  rec_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(item_id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(event_id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL CHECK (
    type IN (
      'Dynamic Reorder',
      'Suggested Order',
      'Event Preparation',
      'Anomaly Alert',
      'Overstock Warning',
      'Waste Reduction'
    )
  ),
  message TEXT NOT NULL,
  suggested_qty NUMERIC(12, 2),
  status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (
    status IN ('Pending', 'Accepted', 'Edited', 'Dismissed')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. Audit Logs Table (Immutable change history)
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id UUID,
  action VARCHAR(100) NOT NULL,
  before_data JSONB,
  after_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

