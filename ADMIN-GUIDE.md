# Administrator's Guide – Greyfriars Bridge School website

Everything students see is kept up to date from one password-protected page, so no GitHub or Cloudflare work is needed day to day. This guide says what to upload, in which format, and what to do when a file is refused. (The same guide is kept as a document in claude.ai; this copy travels with the code.)

## Getting started
1. Open https://greyfriars-bridge.org.uk/admin/
2. Type the maintenance password and press Enter. (It is held in Cloudflare as `ADMIN_PASSWORD`. Whoever has it can change the site, so share it only with the maintainer.)
3. Choose a tab: **Boards**, **Lessons**, **Infographics** or **Schedule**.
4. Changes reach students within about a minute. Press Ctrl+F5 on the student page to see the latest.

Once more than one season exists, a **Show** filter appears. Seasons run September to August, written like `2026/27`.

## Golden rules
- **Upload the format the box asks for.** Word, PowerPoint and Excel files are not accepted; export or save in the right format first.
- **Check before you press Upload.** The page reads the file name and fills in number, title and date, but it can guess wrong.
- **Uploading the same title twice makes a second copy.** To fix an item use **Edit** or **Replace file**.
- Every item has **Edit** and **Delete**, so a mistake is easy to undo.

## Formats at a glance
| Tab | What you upload | File type | Limits | Not accepted (convert first) |
| --- | --- | --- | --- | --- |
| Lessons | Lesson presentation | **PDF** (`.pdf`) | 20 MB each; many at once | PowerPoint: Save as / Export to PDF |
| Infographics | Infographic or cheat sheet | **PDF** (`.pdf`) | 20 MB each; many at once; page 1 becomes the picture | Images, PowerPoint: export to PDF |
| Boards | Practice hands for Play the Hand | **PBN** (`.pbn`; `.txt` also opens) | Under 500,000 characters; at least one `[Deal "..."]` line | Word or PDF hand records; Excel |
| Schedule | Course timetable | **CSV** (`.csv`; `.txt`/`.tsv` also open) or cells pasted from Excel | Up to 80 rows | **Excel files (`.xls`, `.xlsx`)**: File, Save as, CSV UTF-8 |

Every item needs a title of 1 to 100 characters and a season like `2026/27`.

Quick conversions: PowerPoint to PDF via File, Export, Create PDF (standard size). Excel to CSV via File, Save as, **CSV UTF-8 (Comma delimited)**. A PBN file comes from bridge hand software and cannot be made in Word or Excel.

## Lessons (PDF)
1. **Lessons** tab, **Choose PDF file(s)**; one file or many.
2. Each file appears with **No.**, **Title**, **Date (optional)** and **Season**, filled in from the file name. Correct anything wrong.
3. Press **Upload N file(s)**. A tick means done; a red message explains a failure.

File names the page understands:

| File name | Number | Date | Title |
| --- | --- | --- | --- |
| `BS 2026 Lesson 1 - 08Sep26 - Opening 1NT and responses weak.pdf` | 1 | 8 Sep 2026 | Opening 1NT and responses weak |
| `Lesson 11 Competitive Auction.pdf` | 11 | none | Competitive Auction |
| `11 - Slam bidding.pdf` | 11 | none | Slam bidding |

A trailing "(1)" or "copy" is ignored. Lesson numbers restart at 1 for the second half of the year. The date is optional, but the Lessons page lists lessons by earliest date first, so an undated lesson goes last. **Edit** changes number, title, date or season; **Replace file** swaps in a corrected PDF; **Delete** removes the lesson (its infographics and boards are kept, unlinked).

## Boards for Play the Hand (PBN)
A PBN (Portable Bridge Notation) file is plain text written by bridge software. Each board has a line such as `[Deal "N:AKQ.J2.T98.7654 ..."]`.
1. **Boards** tab, **Choose a .pbn file**.
2. The page reports, for example, "6 boards found". If it says "No boards found", it is not a PBN file; do not continue.
3. Type the **Name shown to students**, check the **Lesson date** (required) and **Season**.
4. Optionally choose a **Linked lesson**.
5. Press **Add to the pick list**.

**Rename** changes the name or date. To correct the hands, add the corrected PBN as a new set and **Delete** the old one.

## Teaching schedules (CSV)
Load as a **CSV file** or paste cells from Excel. **Excel workbooks cannot be uploaded**: save as CSV UTF-8 first.

| Column | What goes in it | Limit |
| --- | --- | --- |
| Lesson | Lesson number; leave empty for a note such as "Christmas break" | 6 characters |
| Date | Day/month/year, e.g. `05/01/2027`; required when there is a lesson number | a real date |
| Module | The topic (or the note text); required on every row | 100 characters |
| Description | What the lesson covers (optional) | 120 characters |
| Teacher | **First name only** | 60 characters |

Up to 80 rows. The first row may be the headings `Lesson,Date,Module,Description,Teacher`. Dates the page reads: `05/01/2027`, `5/1/27`, `5.1.2027`, `2027-01-05`, `5 Jan 2027`, `Tue 5th January 2027`. Check day and month are not swapped.

1. **Schedule** tab: paste the Excel cells and press **Read the pasted table**, or **Choose a CSV file**.
2. In **Check the schedule**, correct any cell (a red-bordered date could not be read; ✕ removes a row).
3. Type the **Course name shown to students**, e.g. `Spring 2027`.
4. Press **Save schedule**.

Students see the course whose last lesson has not yet passed (UK date); the next appears automatically when it ends. With two or more courses a drop-down lets them choose. Load Autumn and Spring as separate courses.

## Infographics (PDF)
1. **Infographics** tab, **Choose PDF file(s)**.
2. The page makes a small picture from page 1 and takes the title from the file name; correct it if needed.
3. Optionally pick the **Lesson**; leave it unlinked for a general cheat sheet.
4. Check the **Season**, press **Upload N file(s)**.

PDF only, up to 20 MB. Landscape pages work best (the picture is 3:2; a tall page shows only its top). Put the title and bold colour blocks at the top of page 1; fine print will not be readable in the picture. If "No picture could be made" appears, the PDF still uploads and students see a plain tile. If infographics were uploaded without a picture, a bar says "N of M infographics have no picture yet": press **Make the pictures**. If every picture fails, check the three files in `admin/vendor/` are in GitHub; if pictures are made but never appear, check the latest deployment is green.

## Each term: a checklist
- [ ] Load the new teaching schedule as a CSV, named for the term.
- [ ] After each lesson, upload its PDF and check number, title, date and season.
- [ ] Upload any infographics and link them to the lesson.
- [ ] Upload the practice boards as a PBN file and link them.
- [ ] Open the student pages, press Ctrl+F5 and check the new items appear.

## When a file is refused
| Message or symptom | Cause | Fix |
| --- | --- | --- |
| "That does not look like a PDF file" | Not really a PDF (e.g. a renamed PowerPoint) | Re-export as PDF |
| "That file is too large (20 MB at most)" | PDF over the limit | Export again at a smaller size |
| "No boards were found in that file" | Not a PBN file, or no `[Deal "..."]` lines | Use the PBN from your bridge software |
| "That file is too large for a set of boards" | PBN over 500,000 characters | Split into two sets |
| "The season should look like 2026/27" | Season typed another way | Choose it from the drop-down |
| "Please give it a title" / title too long | Empty, or over 100 characters | Type a title up to 100 characters |
| Red date in the schedule table | Date could not be read | Type dd/mm/yyyy |
| "The schedule has no rows" / "Row N: please give the module" | Empty file, or a row without module text | Fill in the module (or note text) on every row |
| "A lesson needs a date" | Numbered row without a date | Add the date, or clear the number for a note |
| Schedule file will not open | An `.xlsx`/`.xls` file was chosen | Save as CSV UTF-8 and choose that |
| "Wrong password" | Mistyped | Try again; a forgotten password is changed in Cloudflare |
| "... not switched on yet" | A storage area is not attached to the site | Ask Nigel (one-time Cloudflare setting) |
| New upload not showing | Browser cache | Press Ctrl+F5; allow up to a minute |

Anything needing GitHub or Cloudflare (password, storage areas, site files) is for Nigel; everything above is done from the admin page.
