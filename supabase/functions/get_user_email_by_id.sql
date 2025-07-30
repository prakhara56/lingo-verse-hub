create or replace function public.get_user_email_by_id(p_user_id uuid)
returns text
language sql
security definer
as $$
  select u.email
    from auth.users u
   where u.id = p_user_id
$$;
