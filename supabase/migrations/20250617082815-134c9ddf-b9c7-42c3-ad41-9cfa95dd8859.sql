
-- Drop the trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the existing function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create updated function that handles name and username properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, name, theme, is_admin, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username',
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'username'),
    'light',
    false,
    null
  );
  RETURN new;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
