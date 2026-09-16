# 🐾 Dot Safari — Connect & Color

A kids' dot-to-dot + coloring book, built as a single web page with plain HTML5 Canvas and JavaScript — no frameworks, no build step, no image assets (every animal is drawn from code).

## How it works

1. **Connect the dots** — each animal is made of a few shapes (head, ears, body, tail...). Tap the dots in order, 1‑2‑3, to draw each shape. Numbering restarts for every shape, just like a real dot-to-dot book.
2. **Reveal** — once every shape is connected, the full animal outline appears with a little celebration pop.
3. **Color it in** — a crayon tray appears with 14 colors and 3 pencil sizes. Strokes are clipped to the animal's outline, so kids can color freely without going outside the lines.
4. **Next animal** — move on to the next of **12 levels**: Cat, Dog, Rabbit, Bear, Fish, Bird, Owl, Turtle, Elephant, Butterfly, Frog, and Lion (the trickiest, with the most shapes). Difficulty (number of dots/shapes) increases gradually.

Completed levels get a ⭐ on the level track up top, saved in the browser (`localStorage`), and kids can jump to any level at any time.

## Files

```
index.html   — page structure, level track, tool tray
style.css    — crayon-box theme (bright colors, big rounded touch targets)
animals.js   — the 12 animal shapes, built from simple geometric primitives
script.js    — game engine: dot-connecting logic, reveal, clipped coloring, level nav
```

## Run locally

Just open `index.html` in a browser — no server or build tools needed.

## Deploy on GitHub Pages

1. Create a new GitHub repository (e.g. `dot-safari`).
2. Add all four files to the repo root.
3. Commit and push.
4. In the repo, go to **Settings → Pages**.
5. Under **Build and deployment → Source**, choose **Deploy from a branch**.
6. Pick the `main` branch and `/ (root)` folder, then Save.
7. Your game will be live at:
   `https://<your-username>.github.io/<repo-name>/`

## Customize / add more animals

Open `animals.js`. Each animal is an object with a `name`, an `emoji`, and a list of `parts`. Each part is one closed shape built with a helper:

- `ellipsePts(cx, cy, rx, ry, n)` — a circle/ellipse made of `n` dots
- `tri(p1, p2, p3)` — a 3-dot triangle (great for ears, beaks, fins)
- `rotatePts(points, cx, cy, degrees)` — tilt any shape
- `starPts(cx, cy, rOuter, rInner, spikes)` — a scalloped/mane shape

Add a new object to the `ANIMALS` array with your own parts, and it automatically gets a new level, a level-track stone, and a coloring page — no other code changes needed.

## Notes for parents/teachers

- Tapping the wrong dot never penalizes the child — it just gives a soft red flash as a hint to try again.
- "Redo Dots" lets a child replay the connect-the-dots part of the current animal from scratch at any time.
- All animal artwork is generated from simple shapes in code, so there are no external image files or licensing concerns.
