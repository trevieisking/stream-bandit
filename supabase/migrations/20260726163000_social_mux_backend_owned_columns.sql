-- Stream Bandit social Mux least-privilege correction.
-- Authenticated gallery owners keep established media and presentation writes.
-- Mux identifiers, playback policy and lifecycle state remain backend-owned.

begin;

revoke insert, update
  on table public.sb_profile_gallery_items
  from authenticated;

grant select, delete
  on table public.sb_profile_gallery_items
  to authenticated;

grant insert (
  user_id,
  media_kind,
  storage_bucket,
  storage_path,
  external_url,
  thumbnail_url,
  caption,
  alt_text,
  visibility,
  sort_order,
  post_id,
  metadata_json,
  status
)
  on table public.sb_profile_gallery_items
  to authenticated;

grant update (
  thumbnail_url,
  caption,
  alt_text,
  visibility,
  sort_order,
  post_id,
  metadata_json,
  status
)
  on table public.sb_profile_gallery_items
  to authenticated;

comment on table public.sb_profile_gallery_items is
  'Account-owned social gallery. Authenticated clients may write established owner media and presentation fields only; Mux identifiers and lifecycle fields are backend-owned.';

commit;
