-- Stream Bandit V7.12.27 Published Accessibility Policy Seed
-- Publishes one safe row for the public reader proof.

insert into public.sb_policy_documents (
  slug,
  title,
  body,
  status,
  contact_email,
  version_label,
  legal_review_required
)
values (
  'accessibility',
  'Accessibility Statement',
  'STREAM BANDIT ACCESSIBILITY STATEMENT

Contact: info@chatterfriendsstreambandit.co.uk

Stream Bandit is being built with accessibility and player comfort as protected features. The platform aims to provide readable pages, strong contrast, clear controls and comfortable video playback across the main viewing pages.

Important accessibility features include louder audio support where available, player comfort controls, readable layouts, keyboard-friendly navigation goals and clear policy/contact routes for support.

Accessibility is an ongoing promise. If something is hard to hear, hard to read, hard to operate or not working as expected, please contact Stream Bandit at info@chatterfriendsstreambandit.co.uk so it can be reviewed and improved.

This statement may be updated as Stream Bandit grows.',
  'published',
  'info@chatterfriendsstreambandit.co.uk',
  'V7.12.27',
  true
)
on conflict (slug) do update
set
  title = excluded.title,
  body = excluded.body,
  status = 'published',
  contact_email = excluded.contact_email,
  version_label = excluded.version_label,
  legal_review_required = excluded.legal_review_required,
  updated_at = now();

-- Proof query:
-- select slug, title, status, contact_email, version_label from public.sb_policy_documents where slug = 'accessibility';
