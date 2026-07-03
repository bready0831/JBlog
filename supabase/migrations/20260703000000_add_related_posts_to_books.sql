ALTER TABLE books ADD COLUMN IF NOT EXISTS related_post_slugs text[] DEFAULT '{}';
