# Stream Bandit Checkpoint — User Management Dashboard V7.11.2 Passed + Promoted

Date: 2026-05-21

Passed page:

- `user-management-dashboard-v7-11-2-test.html`

Route promoted:

- `user-dashboard-concept-v6-68-test.html`

Now opens:

- `user-management-dashboard-v7-11-2-test.html`

Promotion commit:

- `2bf06e44e01e047728247427015a5be06681c216`

## Result

User Dashboard is no longer only a concept page. It now opens the real current-schema User Management dashboard.

Trevor confirmed:

- Page loads: PASS
- Theme matches global theme: PASS
- Account/avatar appears correctly: PASS
- Helper status loads: PASS
- Load Users works: PASS
- User profile can be selected: PASS
- Current Controls works: PASS
- Remove Submit Privilege works: PASS
- Give Submit Privilege works: PASS
- Future Plans layout polish fixed: PASS

## Current real controls

The current `sb_profiles` schema supports:

- `role`
- `can_submit`

Working privilege toggle:

- remove submit privilege = `can_submit: false`
- give submit privilege back = `can_submit: true`

## Current table fields seen

- `id`
- `username`
- `display_name`
- `channel_name`
- `channel_about`
- `avatar_url`
- `banner_url`
- `role`
- `can_submit`
- `created_at`
- `updated_at`

## Important database note

The earlier V7.11.0 test showed this error:

- `new row for relation "sb_profiles" violates check constraint "sb_profiles_role_check"`

That means the existing role column does not accept future role names yet. V7.11.1/V7.11.2 corrected this by leaving role unchanged by default and using `can_submit` as the first real privilege control.

## Future schema needed

Full user management still needs deliberate Supabase schema work later for:

- plan key / subscription plan
- account status
- feature JSON / permissions JSON
- admin/management notes
- owner/admin policies that can see/manage more than one profile safely

## Safety

No private service keys are used in frontend.

Auth Admin user creation/removal remains backend-later.

Plans/pricing are not billing yet.
