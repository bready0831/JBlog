SELECT cron.schedule(
  'sync-notion-posts',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://ipoapbobbdqkrbjswbsd.supabase.co/functions/v1/sync-notion-posts',
    headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwb2FwYm9iYmRxa3JianN3YnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MDUyODcsImV4cCI6MjA5ODM4MTI4N30.UFgBaYJhzpwedZzb4QFbEmGA0Ggj0bUbBqkdXBUQQGA", "Content-Type": "application/json"}'::jsonb,
    body    := '{}'::jsonb
  );
  $$
);
