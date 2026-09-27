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

## Safety features (blocking, reports, delete account)

7. SQL Editor -> New query -> paste all of `supabase/safety.sql` -> Run.
   (Run after `social.sql`. Safe to re-run.)
   Reports people file land in **Table Editor -> reports** (reason, details,
   who was reported, and the workout if it was a post). Nobody but the person
   who filed one can read it in the app; you read them here.

## Real email sending (needed before other people sign up)

Supabase's built-in email sender is limited to a few messages per hour and
may only deliver to your own team's addresses, so sign-up confirmations and
password resets won't reach other people. Use your own sender:

1. Make a free account at resend.com and create an API key.
   (To send from your own domain, add and verify it there. Without a domain
   you can only send test emails to yourself.)
2. Supabase -> Project Settings -> Authentication -> SMTP Settings ->
   Enable custom SMTP: host `smtp.resend.com`, port `465`, username `resend`,
   password = the API key, sender email = an address on your verified domain.
3. Send yourself a password reset to confirm delivery.

## Likes, comments, notifications, PR badges

8. SQL Editor -> New query -> paste all of `supabase/engagement.sql` -> Run.
   Run it **before** deploying the app version that uses it: the app starts
   uploading a `prs` column with each workout, and syncing errors until that
   column exists. If you ever re-run `social.sql`, re-run `engagement.sql`
   after it (it redefines the feed function to include PR badges).
