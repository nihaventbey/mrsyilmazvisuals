-- Add Google Maps URL to contact settings

update public.site_settings
set value = value
  || jsonb_build_object('mapsUrl', coalesce(value->>'mapsUrl', '')),
  updated_at = now()
where key = 'contact';
