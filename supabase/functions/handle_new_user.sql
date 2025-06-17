
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, name)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username',
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'username')
  );
  RETURN new;
END;
$function$;
