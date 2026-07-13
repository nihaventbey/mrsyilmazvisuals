-- WhatsApp phone + clean contact form note

update public.site_settings
set value = value
  || jsonb_build_object(
    'whatsappPhone', coalesce(
      nullif(value->>'whatsappPhone', ''),
      '+90 544 975 83 38'
    ),
    'formNote',
      replace(
        coalesce(
          value->>'formNote',
          'Formu doldurun; mesajınız bana ulaşsın. Daha hızlı iletişim için Instagram veya WhatsApp''tan da yazabilirsiniz.'
        ),
        'Whatsup',
        'WhatsApp'
      )
  ),
  updated_at = now()
where key = 'contact';

update public.site_settings
set value = jsonb_set(
  value,
  '{formNote}',
  to_jsonb(
    'Formu doldurun; mesajınız bana ulaşsın. Daha hızlı iletişim için Instagram veya WhatsApp''tan da yazabilirsiniz.'::text
  ),
  true
),
updated_at = now()
where key = 'contact'
  and (
    coalesce(value->>'formNote', '') ilike '%whatsup%'
    or coalesce(value->>'formNote', '') ilike '%instagram üzerinden de yazabilirsiniz%'
  );
