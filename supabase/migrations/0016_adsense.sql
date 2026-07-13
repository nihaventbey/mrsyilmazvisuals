-- Google AdSense site settings (publisher ca-pub-3156607388655691)

insert into public.site_settings (key, value)
values (
  'adsense',
  jsonb_build_object(
    'enabled', true,
    'publisherId', 'ca-pub-3156607388655691',
    'testMode', false,
    'slots', jsonb_build_object(
      'homeAfterBlog', jsonb_build_object('enabled', false, 'slotId', ''),
      'homeAfterCta', jsonb_build_object('enabled', false, 'slotId', ''),
      'blogIndex', jsonb_build_object('enabled', false, 'slotId', ''),
      'blogAfterPost', jsonb_build_object('enabled', false, 'slotId', ''),
      'portfolioAfterGallery', jsonb_build_object('enabled', false, 'slotId', '')
    )
  )
)
on conflict (key) do update
set value = jsonb_set(
      jsonb_set(
        jsonb_set(
          coalesce(public.site_settings.value, '{}'::jsonb),
          '{enabled}',
          'true'::jsonb,
          true
        ),
        '{publisherId}',
        to_jsonb('ca-pub-3156607388655691'::text),
        true
      ),
      '{testMode}',
      coalesce(public.site_settings.value->'testMode', 'false'::jsonb),
      true
    )
    || case
      when public.site_settings.value ? 'slots' then '{}'::jsonb
      else jsonb_build_object(
        'slots', jsonb_build_object(
          'homeAfterBlog', jsonb_build_object('enabled', false, 'slotId', ''),
          'homeAfterCta', jsonb_build_object('enabled', false, 'slotId', ''),
          'blogIndex', jsonb_build_object('enabled', false, 'slotId', ''),
          'blogAfterPost', jsonb_build_object('enabled', false, 'slotId', ''),
          'portfolioAfterGallery', jsonb_build_object('enabled', false, 'slotId', '')
        )
      )
    end,
    updated_at = now();
