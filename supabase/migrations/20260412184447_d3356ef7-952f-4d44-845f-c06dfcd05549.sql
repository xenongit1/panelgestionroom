-- Photo metadata table
CREATE TABLE public.reserva_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id uuid NOT NULL REFERENCES public.reservas(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL,
  file_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reserva_photos ENABLE ROW LEVEL SECURITY;

-- RLS: owner-scoped access only
CREATE POLICY "Owner select" ON public.reserva_photos FOR SELECT TO authenticated
  USING (profile_id = auth.uid());
CREATE POLICY "Owner insert" ON public.reserva_photos FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Owner delete" ON public.reserva_photos FOR DELETE TO authenticated
  USING (profile_id = auth.uid());

-- PRIVATE bucket (public = false)
INSERT INTO storage.buckets (id, name, public)
VALUES ('finish-photos', 'finish-photos', false);

-- Storage policies: scoped to profile_id path prefix
CREATE POLICY "Upload own finish photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'finish-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Read own finish photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'finish-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Delete own finish photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'finish-photos' AND (storage.foldername(name))[1] = auth.uid()::text);