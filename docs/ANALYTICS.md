# First-party event contract

Measurement is disabled unless `NEXT_PUBLIC_ANALYTICS_ENABLED=true`. It uses the application's same-origin `/api/events` endpoint and Supabase, without third-party scripts, analytics cookies or persistent visitor IDs. Deployment flags are baked into the client at build time. Rebuild after changing them.

The endpoint accepts `{ "event_type": "...", "event_data": {} }`. Zod rejects unknown fields, unsupported event types and oversized values. Never send email, name, passport notes, coordinates, chat text, a recovery token or full trip preferences. Rate-limit identifiers are salted hashes stored separately.

| Event | Meaning |
| --- | --- |
| destination_search | A submitted place search, not every keystroke |
| destination_selected | A destination selected for its planning panel |
| globe_location_selected | A globe coordinate selected, before identification |
| trip_started | A generation request submitted |
| trip_step_completed | A validated wizard step advanced |
| trip_generated | A structured plan or labelled checklist returned successfully |
| trip_generation_failed | The request failed; no successful result shown |
| trip_saved | Server-confirmed durable trip insertion |
| lead_captured | Server-confirmed durable kit request |
| lead_capture_failed | A kit request failed |
| free_kit_requested | The general kit opened/requested; not an email subscription |
| affiliate_click | An outbound provider link clicked, including ordinary searches |
| contact_submitted | Email provider accepted a contact message |

Allowed metadata: `provider`, `category`, `destination`, `country`, `placement`, `trip_id`, `campaign`, `content`, `step`, `mode`. Placements: homepage, globe, destination, trip_result, blog, free_kit, plan, contact. The trip ID is a database UUID, never the recovery token. `mode` distinguishes AI suggestions from checklist results. Events can be lost or blocked and are not accounting records.

`affiliate_click` is a historical event name for outbound booking-category clicks. It never means a booking, payment, commission or partner conversion. UTMs label ordinary links `referral` and configured affiliate links `affiliate`. Partner conversions require actual partner reporting or a verified webhook; neither is fabricated here.

Retention targets 30 days through `purge_expired_data()`. Schedule the cleanup before enabling measurement. Review applicable privacy requirements before enabling events; introducing third-party trackers requires genuine consent controls and updated policy copy before loading them.
