-- Timebox 앱 Supabase 테이블 설정
-- Supabase 대시보드 > SQL Editor에서 실행하세요

-- 1. 사용자 코드 테이블
CREATE TABLE user_codes (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 타임박스 일별 데이터 테이블
CREATE TABLE timebox_days (
  user_code TEXT NOT NULL REFERENCES user_codes(code) ON DELETE CASCADE,
  date TEXT NOT NULL,
  day_data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_code, date)
);

CREATE INDEX idx_timebox_days_user ON timebox_days (user_code);

-- 3. RLS 활성화 + 정책
ALTER TABLE user_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE timebox_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on user_codes" ON user_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on timebox_days" ON timebox_days FOR ALL USING (true) WITH CHECK (true);
