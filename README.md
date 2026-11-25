# Play the Hand – pick-list version, with a maintenance page

## What is in this folder
- `index.html` – the landing page (four boxes). `play/index.html` – Play the Hand (pick list of lessons). `lessons/`, `infographics/` and `info/` – the other pages the boxes link to.
- `admin/index.html` – the maintenance page, at `<your address>/admin/`. Password protected. Four tabs: **Boards**, **Lessons**, **Infographics** and **Schedule** (add, edit, replace, delete).
- `functions/` – the small server-side part (Cloudflare Pages Functions). Do not edit.
- `boards/` – a plain-file backup list (`index.js` + `.pbn` files). Used only when the maintenance service is not switched on (see below), or when `index.html` is opened by double-click for review. `boards/preview-data.js` is just for that double-click review.

## One-time setup in Cloudflare (Nigel)
The maintenance page stores the boards in a Cloudflare "KV" store. This needs doing once, on the new Pages project. (Menu names in Cloudflare change from time to time; the ideas below stay the same.)
1. **Create the store.** Cloudflare dashboard → Storage & databases → KV → Create a namespace, e.g. `greyfriars-boards`.
2. **Attach it to the Pages project.** Pages project → Settings → Bindings (or Functions → KV namespace bindings) → Add → KV namespace. Variable name must be exactly `BOARDS`; choose the namespace you created. Add it for Production (and Preview if shown).
3. **Set the password.** Same project → Settings → Variables and secrets → Add → name `ADMIN_PASSWORD`, type Secret, value = a long password (a few random words is fine). This is the password the maintainer types on the admin page.
4. **Redeploy.** Settings take effect on the next deployment: Deployments → the latest → Retry deployment (or commit any small change).
5. **Add the lessons.** Open `<address>/admin/`, sign in, and add the lessons (choose the .pbn, type the name, set the date).

Until steps 1–4 are done the student page simply uses `boards/index.js`, so nothing breaks. Once the maintenance service is on, it takes over completely: the `boards/` list is then ignored.

## Second one-time setup: lessons and infographics (PDFs)
Repeat steps 1, 2 and 4 above twice more, for two further stores:
- KV namespace `greyfriars-lessons`, bound with the variable name exactly `LESSONS`.
- KV namespace `greyfriars-infographics`, bound with the variable name exactly `INFOGRAPHICS`.
Then Retry deployment. The password (step 3) is shared by all three tabs. Until a store is attached, its tab on the admin page says it is not switched on; the rest keeps working.

## Third one-time setup: the schedule
Same steps once more: KV namespace `greyfriars-schedules`, bound with the variable name exactly `SCHEDULES`, then Retry deployment. Until then the Schedule tab and the General information page say the schedule is not available; everything else keeps working.

## Day to day (maintainer, no GitHub or Cloudflare)
Open `<address>/admin/`, sign in, choose the .pbn file, type the name students will see, check the lesson date, press **Add to the pick list**. **Rename** changes the name or date; **Delete** removes a set. Changes can take up to a minute to reach every student.

## Notes
- Anyone with the password can change the lessons, so share it only with the maintainer. To change it: Cloudflare → the project → Settings → Variables and secrets → edit `ADMIN_PASSWORD`, then redeploy.
- Lesson links: `<address>/#strong-2-bids` opens that lesson directly (the name in lower case with dashes).
- Reviewing on your own computer: extract the whole zip, then double-click `play/index.html` (Play the Hand). The admin page needs the website and does not work from a double-click.


## Lessons, infographics and seasons
- **Seasons** run September to August and are written `2026/27`. New items default to the current season (it rolls over by itself on 1 September, UK time). The season drop-down on each form lists the seasons in use, plus "Add another season…". The "Show" filter at the top of the admin page appears once more than one season exists.
- **Lesson PDFs**: choose one or many files; the page guesses the number and title from the file name (e.g. `Lesson 11 Competitive Auction.pdf`) and lets you correct them before uploading. Date is optional.
- **Infographic PDFs**: same, and each can be linked to a lesson (a lesson can have several). An infographic with no lesson is a general one.
- **Board sets** can also be linked to a lesson.
- Deleting a lesson keeps its infographics and board sets but unlinks them.
- PDF only; up to 20 MB each (the store allows 1 GB in all).

## For whoever designs the other pages (public, read-only)
| Address | Gives |
|---|---|
| `/api/catalogue` | Everything at once: `currentSeason`, `seasons`, `ready`, `lessons`, `infographics`, `sets` |
| `/api/lessons[?season=2026/27]` | `{lessons:[{id,season,number,title,date,size,fileUrl}]}` |
| `/api/infographics[?lesson=<id>][&season=…]` | `{infographics:[{id,season,title,lessonId,size,fileUrl}]}` |
| `/api/sets` | `{sets:[{id,title,date,boards,season,lessonId}]}` |
| `/files/lessons/<id>.pdf`, `/files/infographics/<id>.pdf` | The PDF, shown in the browser. Add `?download=1` to force a download. |
Pages link items by `lessonId`. A lesson's own page = lesson + infographics with that `lessonId` + sets with that `lessonId`.


## Pages
- `/` Landing page. `/interactive/` Interactive features (links to Play the Hand and the cue bidding game; the game address is `cueGame` in `assets/site-config.js`). `/play/` Play the Hand. `/lessons/` Teaching materials by lesson (the lesson PDFs, with any linked infographics). `/infographics/` The infographic PDFs. `/info/` General information (course schedule, link to the club's BridgeWebs site). `/privacy/` Privacy, cookies and accessibility. The shared top bar and footer come from `assets/site.js`; the club name, centre address, map link and BridgeWebs address are set once in `assets/site-config.js`.
- Fonts are served from `fonts/` (no requests to Google). Nothing on the student pages loads from another company's server.

## The course schedule
- Admin → **Schedule**. Fill in the pro forma (`admin/schedule-proforma.xlsx`, also offered as a download on that tab), copy the cells, paste them into the box and press **Read the pasted table**; or choose a saved CSV. Check and correct the table, name the course (e.g. "Spring 2027") and **Save schedule**. **Edit** on a saved course reopens the same table.
- Columns: Lesson, Date (day/month/year), Module, Description, Teacher (first names only). A row with no lesson number and no date is a note such as "Christmas break".
- Students see the course whose last lesson has not yet passed (UK date). When the last lesson of one course has passed, the next course is shown automatically. A drop-down appears once more than one course exists, so they can look at any course.
- `GET /api/schedules` gives `{ today, defaultId, schedules:[{ id, title, season, first, last, count, rows:[{n,date,module,description,teacher}] }] }`.

## Infographic pictures
Each infographic can have a small picture (864x576 JPEG, stored in KV as `thumb:<id>`, served at `/files/infographics/<id>.jpg`). The admin page makes it in the browser from page 1 of the PDF using the self-hosted pdf.js in `admin/vendor/` (Apache-2.0, licence included). For infographics uploaded before pictures existed, use Admin > Infographics > "Make the pictures".
