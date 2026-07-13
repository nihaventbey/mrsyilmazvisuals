-- Enable Instagram Graph API settings

update public.site_settings
set value = value
  || jsonb_build_object(
    'source', coalesce(value->>'source', 'graph'),
    'postLimit', coalesce((value->>'postLimit')::int, 6)
  ),
  updated_at = now()
where key = 'instagram';
