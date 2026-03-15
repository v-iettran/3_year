# Our 3 Years Wrapped

A Spotify Wrapped–style storytelling site with **15 full-screen slides**: scroll, swipe, or use arrow keys to move through the story. Final slide has a vinyl player that plays your song.

## Quick start

1. **Add your assets**
   - Photos in `assets/photos/` (see `assets/README.md` for suggested filenames).
   - Your song as `assets/music/song.mp3`.

2. **Open the site**
   - Open `index.html` in a browser, or run a local server, e.g.:
   - `npx serve .` then visit the URL shown (e.g. http://localhost:3000).

## Tech

- **fullPage.js** – vertical slides, keyboard and touch
- **GSAP** – text and photo animations
- **Howler.js** – audio for the vinyl screen

## Deploy

Works on any static host: drag the project folder to **Netlify** or **Vercel**, or push to GitHub and enable **GitHub Pages** on the repo.

## Structure

- `index.html` – all 15 slides
- `css/styles.css` – layout, gradients, typography, vinyl player
- `js/main.js` – fullPage init, GSAP animations, counters, typewriter, vinyl + Howler

No build step required.
