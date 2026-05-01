# Independent English Learning — Student Hub

A trilingual (English / Español / Français) science-backed English-learning hub for Spanish-speaking adult beginners.

**Material by Jonathan Michael Miljus**
*CURR 7003 — University of Louisiana Monroe*

---

## What this is

A single-page, self-contained website that delivers the entire course companion — module overviews, pronunciation drills, cognate lists, sentence frames, free resources, the 90-day plan, and habit anchors — in three languages with a one-click toggle.

No build step. No frameworks. No tracking. Pure HTML / CSS / vanilla JavaScript.

## Files in this repo

| Path | Purpose |
|------|---------|
| `index.html` | The complete site, open this in any browser. |
| `assets/` | Per-language infographic PNGs used by the site. |
| `audio/` | 30 ElevenLabs audio drills (mp3) referenced from the Listen section. |
| `docs/` | Downloadable bilingual handouts, module lessons, syllabus, and instructor materials. |
| `README.md` | This file. |

The site is a single HTML page; the asset folders are referenced by it.

## Hosting on GitHub Pages (3 minutes)

1. Create a new public repository on GitHub. Name it whatever you want — for a project page use any name; for your personal user-page use `<your-username>.github.io`.
2. Upload `index.html` to the root of the repo (drag-drop in the GitHub web UI is fine).
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose `main` (or `master`) and `/ (root)`. Save.
5. Wait ~30 seconds. GitHub gives you a URL like `https://<your-username>.github.io/<repo-name>/`.
6. Done. Share that URL with students and your professor.

## Hosting elsewhere

Any static host works: Netlify (drag-and-drop the file), Vercel, Cloudflare Pages, S3 + CloudFront, your university's web server. Just upload `index.html`.

## Running locally

Open `index.html` directly in any browser. No server required.

## How the language toggle works

Every translatable element carries `data-en` / `data-es` / `data-fr` attributes. A small inline script swaps `innerHTML` based on the active language and remembers your choice in `localStorage` for next time.

To add a fourth language (say, `pt`), do two things:
1. Add `data-pt="..."` attributes to the elements you want translated.
2. Add a `<button data-lang="pt">PT</button>` to the `.lang-toggle` div in the nav.

That's all.

## Editing content

All content is in `index.html`. Find the section you want to change, edit the text inside the relevant `data-en`, `data-es`, or `data-fr` attribute. Save. Refresh the browser.

## Browser support

Modern Chrome, Safari, Firefox, Edge. iOS and Android. No IE.

## License

Educational use freely permitted. Please retain the "Material by Jonathan Michael Miljus" attribution if you adapt this for your own course.

## Bibliography (sources cited on the site)

- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks. *Psychological Bulletin, 132*(3), 354–380.
- Krashen, S. D. (1985). *The input hypothesis: Issues and implications.* Longman.
- Mayer, R. E. (2009). *Multimedia learning* (2nd ed.). Cambridge University Press.
- Nation, I. S. P. (2013). *Learning vocabulary in another language* (2nd ed.). Cambridge University Press.
- Swain, M. (1985). Communicative competence. In Gass & Madden (Eds.), *Input in second language acquisition*.
- Zimmerman, B. J. (2002). Becoming a self-regulated learner. *Theory Into Practice, 41*(2), 64–70.

Full reference list lives inside the companion document `The_Method_Science_Backed_DIY_Guide.docx`.
