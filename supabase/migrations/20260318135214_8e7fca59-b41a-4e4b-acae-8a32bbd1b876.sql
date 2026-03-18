
-- Update profile to have an access key and active plan for testing
UPDATE public.profiles 
SET access_key = 'GR-7X9K2-MN4P8-QW3R5',
    plan_status = 'active',
    company_name = 'Escape Room Madrid Centro',
    subscription_end = '2027-12-31T00:00:00Z'
WHERE id = '1cd7a385-098d-40a8-b7b8-6bd940d6ad52';

-- Insert seed salas
INSERT INTO public.salas (name, theme, difficulty, capacity, active, profile_id) VALUES
  ('La Cripta del Faraón', 'Egipto', 4, 6, true, '1cd7a385-098d-40a8-b7b8-6bd940d6ad52'),
  ('Laboratorio Zombie', 'Terror', 5, 5, true, '1cd7a385-098d-40a8-b7b8-6bd940d6ad52'),
  ('El Tren de Medianoche', 'Misterio', 3, 8, true, '1cd7a385-098d-40a8-b7b8-6bd940d6ad52'),
  ('La Máquina del Tiempo', 'Ciencia Ficción', 4, 4, true, '1cd7a385-098d-40a8-b7b8-6bd940d6ad52'),
  ('Piratas del Caribe', 'Aventura', 2, 6, false, '1cd7a385-098d-40a8-b7b8-6bd940d6ad52');

-- Insert seed game masters
INSERT INTO public.game_masters (name, avatar, available, profile_id) VALUES
  ('Carlos Ruiz', 'CR', true, '1cd7a385-098d-40a8-b7b8-6bd940d6ad52'),
  ('Ana Martínez', 'AM', true, '1cd7a385-098d-40a8-b7b8-6bd940d6ad52'),
  ('David López', 'DL', false, '1cd7a385-098d-40a8-b7b8-6bd940d6ad52'),
  ('Lucía Fernández', 'LF', true, '1cd7a385-098d-40a8-b7b8-6bd940d6ad52');
