create or replace function public.get_email_by_username(p_username text)
returns text
language sql
security definer
as $$
  select u.email
    from auth.users u
    join public.profiles p on p.id = u.id
   where p.username = p_username;
$$;
