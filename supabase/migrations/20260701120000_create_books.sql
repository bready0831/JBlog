CREATE TABLE IF NOT EXISTS books (
  id                    uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  notion_id             text        UNIQUE NOT NULL,
  title                 text        NOT NULL,
  slug                  text,
  status                text,
  category              text,
  tags                  text[]      DEFAULT '{}',
  date                  text,
  thumbnail_url         text,
  notion_last_edited_at text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "books_public_read" ON books
  FOR SELECT USING (true);

CREATE POLICY "books_service_write" ON books
  FOR ALL USING (auth.role() = 'service_role');
