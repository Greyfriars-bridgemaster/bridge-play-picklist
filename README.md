# Play the Hand – pick-list version, with a maintenance page

## What is in this folder
- `index.html` – the student page (pick list of lessons).
- `admin/index.html` – the maintenance page, at `<your address>/admin/`. Password protected. Add, rename and delete lessons.
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

## Day to day (maintainer, no GitHub or Cloudflare)
Open `<address>/admin/`, sign in, choose the .pbn file, type the name students will see, check the lesson date, press **Add to the pick list**. **Rename** changes the name or date; **Delete** removes a set. Changes can take up to a minute to reach every student.

## Notes
- Anyone with the password can change the lessons, so share it only with the maintainer. To change it: Cloudflare → the project → Settings → Variables and secrets → edit `ADMIN_PASSWORD`, then redeploy.
- Lesson links: `<address>/#strong-2-bids` opens that lesson directly (the name in lower case with dashes).
- Reviewing on your own computer: extract the whole zip, then double-click `index.html`. The admin page needs the website and does not work from a double-click.
