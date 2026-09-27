# Supabase setup (one time)

1. supabase.com -> New project (free tier is fine). Pick any region near you.
2. SQL Editor -> New query -> paste all of `supabase/schema.sql` -> Run.
3. Authentication -> Sign In / Providers -> Email: leave enabled. Decide on
   "Confirm email": ON is safer (verifies addresses); OFF lets people in
   instantly. The app handles both.
4. Authentication -> URL Configuration -> Site URL: `https://dombelli22.github.io/Iron-Log/`
5. Project Settings -> API Keys: copy the Project URL and the **publishable**
   key (`sb_publishable_...`, or the legacy `anon` key) into `src/supabaseConfig.js`.
   Never copy the `secret` / `service_role` key anywhere in this repo.

## Social features (after the steps above)

6. SQL Editor -> New query -> paste all of `supabase/social.sql` -> Run.
   (Adds usernames, follows and the feed. Safe to re-run.)
