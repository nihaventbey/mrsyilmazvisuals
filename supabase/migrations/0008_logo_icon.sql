-- Separate horizontal header logo from round icon logo

update public.site_settings
set value = value
  || jsonb_build_object(
    'logoIcon', coalesce(value->>'logoIcon', value->>'logoImage', '/images/logo.svg')
  ),
  updated_at = now()
where key = 'general';
