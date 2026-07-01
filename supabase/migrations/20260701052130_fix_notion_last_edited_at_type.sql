ALTER TABLE posts
  ALTER COLUMN notion_last_edited_at TYPE text USING notion_last_edited_at::text;
