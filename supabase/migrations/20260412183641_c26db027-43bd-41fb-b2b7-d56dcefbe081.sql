ALTER TABLE public.reservas
  ADD COLUMN IF NOT EXISTS client_email text,
  ADD COLUMN IF NOT EXISTS client_phone text;