# Handover notes for Claude (and any other maintainer)

Student website for the Greyfriars Bridge School, run by Nigel (bridge teacher, committee member of Greyfriars Bridge Club). Live at https://greyfriars-bridge.org.uk (also www. and bridge-play-picklist.pages.dev). This file is for whoever takes over the technical side. It holds no secrets: the repo is public.

Read `README.md` (setup, folders, API) and `ADMIN-GUIDE.md` (what the maintainer uploads and the accepted formats) first. This file covers what the code cannot tell you.

## How it is built and hosted
- Plain static HTML/CSS/JS, no build step, no framework. Server side is Cloudflare Pages Functions in `functions/` (ES modules).
- Cloudflare Pages project: `bridge-play-picklist`. GitHub repo: `Greyfriars-bridgemaster/bridge-play-picklist` (public). **Every commit to `main` deploys automatically.** There is no staging site.
- Do not touch the older live site: Pages project `greyfriars-bridge` (greyfriars-bridge.pages.dev), repo `bridge-play`. It is separate and must stay as it is.
- Storage is Cloudflare KV, bound to the project under these exact variable names: `BOARDS`, `LESSONS`, `INFOGRAPHICS`, `SCHEDULES`. The secret `ADMIN_PASSWORD` is set in Cloudflare (Settings, Variables and secrets). Bindings and variables only take effect after a new deployment.
- Admin calls use `Authorization: Bearer <password>`, checked in `functions/api/admin/_middleware.js`.

## KV layout (each store)
- Key `index`: JSON list of items, each with `id`, `season`, `title`, and (lessons) `number`, `date`, (sets) `date`, `boards`, `lessonId`, (infographics) `lessonId`, `size`, `thumb`.
- Per item: `file:<id>` (PDF bytes) for lessons and infographics, `pbn:<id>` (text) for boards, `sched:<id>` for schedules, `thumb:<id>` (JPEG, at most 400 KB) for infographic pictures.
- `item.thumb` is a timestamp used only to bust the cache (`/files/infographics/<id>.jpg?v=<thumb>`).
- Ids are slugs of the title; duplicates get `-2`, `-3`.
- Writes read the whole `index`, change it and write it back. That is fine for one maintainer at a time; it is not safe for concurrent edits.

## Design decisions to keep
- Seasons run September to August, written `2026/27`. Lesson numbers restart at 1 in January, so Autumn and Spring both have lessons 1 to 15 in the same season. Lists therefore sort by **date**, then number.
- Teachers appear by **first name only**. The pages load nothing from another company's servers (fonts are self-hosted in `fonts/`, pdf.js is self-hosted in `admin/vendor/`). Cloudflare Web Analytics is deliberately off; check that the page source contains no `cloudflareinsights` after deployments. Footer and privacy page rely on that.
- Shared top bar and footer: `assets/site.js`. Club name, address, map link, cue bidding game and BridgeWebs addresses: `assets/site-config.js`. One place each.
- Infographic pictures are made **in the maintainer's browser** (pdf.js on page 1, 864 x 576 JPEG), not on the server, because Workers cannot render PDFs. They are for recognition, not reading.
- Failure of the picture step must never block a PDF upload.

## Testing locally
Run from the repo root (needs Node; install wrangler with npm):

    wrangler pages dev . --port 8799 --kv BOARDS --kv LESSONS --kv INFOGRAPHICS --kv SCHEDULES --binding ADMIN_PASSWORD=testpw

Then open http://localhost:8799/admin/ and sign in with `testpw`. Browser tests used Playwright with Chrome (`--no-sandbox`). Test with a landscape and a portrait PDF, an infographic uploaded without a picture then "Make the pictures", and the page at desktop and phone widths.

## Pitfalls we have already hit
- **GitHub's web uploader** fails on large or mixed batches and sometimes on whole folders. Upload in small batches, folder by folder; files with square brackets in the name (`[id].js`, `[name].js`) are the ones that most often land in the wrong place or fail. A file with the same name in the same folder is overwritten. "Create new file" with a typed path (for example `vendor/README.txt`) creates a folder.
- Copying code from a chat code block can bring the language label (`js`) in as line 1. Use unlabelled code blocks.
- A missing function file makes Cloudflare Pages answer with `index.html` (SPA fallback), so a page can silently jump to Play the Hand. If an `/api/...` address shows a web page, a function file is missing from the repo.
- A stale `functions/_lib/common.js` breaks the build, because other files import helpers from it (`checkRows`, `pickDefault`, `londonToday`, `readThumb`).
- Do not redeclare names in `admin/index.html`: a second `var MONTHS` once shadowed the display-date array (the parser's table is `MON3`/`MON`).
- A field whose change handler re-renders the row loses focus while typing; the date field only updates the season select.
- Browser may show the old pdf.js worker: hard refresh after changing `admin/vendor/`.

## Open items (as of 25 November 2026)
- Load `schedule-spring-2027.csv` in Admin, Schedule as "Spring 2027" before 16 December 2026 (Spring lessons restart at 1; 8 and 15 April are Thursdays).
- Practical details for the General information page (time, venue, fees).
- Registration form: download link after committee approval.
- Committee decisions: club contact address, retention period, where completed forms are stored, copyright minute, mailbox and renewal.
- Tidy the stray duplicate top-level folders in the repo (`_lib`, `api`, `files`, `boards` copies at the wrong level).
- Possible later work: filters or search on the Infographics page if the collection grows past a few dozen; teacher-facing notes.

## Working with Nigel
He is not a developer. Give one change at a time, with the exact repo folder for each file, small upload batches, and a way to confirm it worked (what to look for on the site). Say plainly when something is untested. Show a small mock-up before changing a layout.
