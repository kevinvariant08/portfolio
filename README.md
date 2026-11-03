# Kaiyang (Kevin) Hu

Source of my academic portfolio: research, the olympiad geometry book *Beyond the Incenter*, writing, projects, honours and piano.

It is a single static page (`index.html`) with no build step. `css/site.css` and `js/site.js` handle the layout, smooth scrolling (Lenis), torn-paper edges, menu, music player, cursor and the interactive figures; `js/scenes.js` draws the hero objects and the honours cabinet with three.js. Libraries are self-hosted in `vendor/` (three.js MIT, Lenis MIT, GSAP under its standard licence). Media lives in `media/` and papers in `papers/`. To preview locally:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

Composition audio is rendered from my scores with the Salamander Grand Piano samples by Alexander Holm (CC BY 3.0).

© 2026 Kaiyang (Kevin) Hu. All rights reserved.
