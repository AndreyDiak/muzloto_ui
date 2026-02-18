-- Бакет для обложек мероприятий (публичный доступ на чтение)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-photos',
  'event-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Политики доступа для event-photos
DROP POLICY IF EXISTS "event_photos_public_read" ON storage.objects;
CREATE POLICY "event_photos_public_read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'event-photos');

DROP POLICY IF EXISTS "event_photos_authenticated_upload" ON storage.objects;
CREATE POLICY "event_photos_authenticated_upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'event-photos');

DROP POLICY IF EXISTS "event_photos_authenticated_update" ON storage.objects;
CREATE POLICY "event_photos_authenticated_update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'event-photos');

DROP POLICY IF EXISTS "event_photos_authenticated_delete" ON storage.objects;
CREATE POLICY "event_photos_authenticated_delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'event-photos');
