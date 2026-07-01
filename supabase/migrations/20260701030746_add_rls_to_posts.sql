ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "posts_public_read"
  ON posts FOR SELECT
  USING (status IN ('완료', '메인'));

-- Only service role can write
CREATE POLICY "posts_service_write"
  ON posts FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
