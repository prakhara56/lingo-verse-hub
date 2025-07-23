-- Create profile for existing authenticated user if it doesn't exist
INSERT INTO public.profiles (id, username, name, theme, is_admin, avatar_url)
SELECT 
  '40fff38d-0c31-4dcb-9502-d96ffd696092'::uuid,
  'prakhara56',
  'Prakhar Agarwal',
  'light',
  false,
  null
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = '40fff38d-0c31-4dcb-9502-d96ffd696092'::uuid
);