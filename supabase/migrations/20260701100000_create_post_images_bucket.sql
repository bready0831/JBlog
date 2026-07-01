INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "post_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');

CREATE POLICY "post_images_service_write" ON storage.objects
  FOR ALL USING (bucket_id = 'post-images' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'service_role');
