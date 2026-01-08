-- Create storage bucket for article media (images and videos)

-- Insert the bucket (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'article-media',
    'article-media',
    true,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Allow public read access to article media
CREATE POLICY "Public read access for article media"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-media');

-- Allow service role to upload/delete media
CREATE POLICY "Service role can upload article media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'article-media' AND auth.role() = 'service_role');

CREATE POLICY "Service role can update article media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'article-media' AND auth.role() = 'service_role');

CREATE POLICY "Service role can delete article media"
ON storage.objects FOR DELETE
USING (bucket_id = 'article-media' AND auth.role() = 'service_role');
