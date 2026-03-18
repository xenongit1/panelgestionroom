
CREATE TABLE public.panel_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'owner',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_panel_users_profile ON public.panel_users(profile_id);
CREATE INDEX idx_panel_users_username ON public.panel_users(username);

ALTER TABLE public.panel_users ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles DROP COLUMN IF EXISTS panel_username;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS panel_password;
