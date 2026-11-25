# Ai Handy Helper: landing page rebuild

A faster, SEO-ready rebuild of [aihandyhelper.co.uk](https://aihandyhelper.co.uk/), using the same brand, copy and style.
Plain HTML, CSS and JS. No build step and no dependencies.

## What changed vs the live site

| Area | Live site | This rebuild |
|---|---|---|
| First load | Whole site hidden behind a "click me" power button, every visit | Site shows straight away. The power-on animation plays by itself (~1.3 s), once per visit |
| Image weight | ~6.4 MB of PNGs, all preloaded | ~110 KB of WebP, only the logo preloaded |
| JS | ~414 KB (React) | ~20 KB, no framework |
| Headings | 2× `<h1>` | 1× `<h1>` with the keyword "AI tools for UK tradespeople" |
| SEO | No sitemap, canonical or structured data; `favicon.ico` 404 | `sitemap.xml`, canonical, Organization + Product list + FAQPage JSON-LD, favicon set, manifest |
| Share image | Picture of the "click me" gate | Proper 1200×630 card with headline and tools |
| Accessibility | Content `inert` + `aria-hidden` until click | Skip link, focus styles, keyboard tabs, full `prefers-reduced-motion` support |

## New animations (same electric style)
- Power-on intro: a bolt runs across the screen, then the logo and tools light up from grey.
- Live current flowing along the network wires; sparks orbiting the hub. Click the toolbox to replay.
- Scroll reveals with stagger; tool cards tilt and glow under the cursor.
- Card previews play when they scroll into view: chat bubbles type in, JobDesk ticks each step, Echo's waveform runs.
- Tool finder: lightning meter charges per answer, questions slide in, results pop in.
- "A day on the tools" auto-plays through the 3 steps with a progress bar; a Before/With toggle that changes the story.
- Click sparks on buttons, a light sweep on the bundle, and a smooth FAQ open/close.

## Run locally
```bash
python -m http.server 8000
# open http://localhost:8000
```

## Deploy to the real domain
- Upload the files to any static host (Cloudflare Pages, Netlify, Vercel, GitHub Pages).
- Live URLs are `/privacy` and `/terms`; here they are `privacy.html` and `terms.html`. Most hosts serve both. If not, add redirects.
- Submit `https://aihandyhelper.co.uk/sitemap.xml` in Google Search Console.

Credit: original design and brand by AR Web Studios.
