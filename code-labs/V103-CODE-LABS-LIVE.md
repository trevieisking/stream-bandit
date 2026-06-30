# Code Labs V103 Live

Code Labs V103 is the promoted live repair-room version.

## Confirmed live

- Supabase Edge Function: `code-labs-mcp-stub`
- Server version: `Code Labs V103 write-request tools`
- OAuth app connection: working
- Code Labs context read: working through `@Code Labs`
- Safe write-request design: deployed on the app server

## Safety model

Code Labs is a read-first repair room.

Writes stay protected:

1. Read context or full source first.
2. Prepare one exact repair.
3. Queue or build a safe write request where available.
4. Use GitHub connector for the actual branch and pull request.
5. Preview/test.
6. Merge after approval.

## Protected rules

- No direct-main browser write.
- No broad random repo edits.
- No unapproved delete.
- No secret or hidden config paths.
- GitHub file writing remains branch and pull request only.

## Why this exists

V102 recorded the repair bridge status page. V103 records that the Code Labs ChatGPT app server was updated and reconnected successfully.
