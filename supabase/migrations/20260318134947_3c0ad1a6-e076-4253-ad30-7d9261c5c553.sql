
-- Create salas table
CREATE TABLE public.salas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  theme text,
  difficulty integer DEFAULT 3,
  capacity integer DEFAULT 6,
  active boolean DEFAULT true,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create game_masters table
CREATE TABLE public.game_masters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar text,
  available boolean DEFAULT true,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create reservas table
CREATE TABLE public.reservas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  sala_id uuid REFERENCES public.salas(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  game_master_id uuid REFERENCES public.game_masters(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pendiente',
  players integer DEFAULT 1,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- RLS: anon and authenticated can SELECT (access controlled by edge function)
CREATE POLICY "Allow anon select salas" ON public.salas FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon select game_masters" ON public.game_masters FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon select reservas" ON public.reservas FOR SELECT TO anon, authenticated USING (true);

-- Allow inserts for authenticated users who own the profile
CREATE POLICY "Owner can insert salas" ON public.salas FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Owner can insert game_masters" ON public.game_masters FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Owner can insert reservas" ON public.reservas FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());
