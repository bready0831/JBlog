CREATE TABLE posts (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  notion_id     text        UNIQUE NOT NULL,
  title         text        NOT NULL,
  description   text,
  content       text,
  date          date,
  status        text        CHECK (status IN ('시작 전', '진행 중', '완료', '메인')),
  slug          text        UNIQUE,
  category      text,
  tags          text[]      DEFAULT '{}',
  related_slugs text[]      DEFAULT '{}',
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE INDEX posts_slug_idx     ON posts (slug);
CREATE INDEX posts_status_idx   ON posts (status);
CREATE INDEX posts_date_idx     ON posts (date DESC);
CREATE INDEX posts_category_idx ON posts (category);

