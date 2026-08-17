# Space Bound

**Live at [space-bound.org](https://www.space-bound.org)**

An interactive rocket-launch landing page built by the Union Buddies — Rohan, Arnav, and Pranav — that links out to nine space-topic educational sites we each built.

## What it does

Click a topic, and a real NASA rocket photo blasts off the launch pad (shake → liftoff → smoke trail) before redirecting you to that topic's site:

- **[Black Holes](https://blackholes.space-bound.org)** — an eleven-chapter interactive guide covering formation, event horizons, and Hawking radiation, with a light-bending simulation, a "falling into a black hole" experience, and an animated recreation of the 2015 gravitational-wave collision.
- **[The Solar System](https://solarsystem.space-bound.org)** — an interactive 3D visualization of the solar system.
- **[Asteroids & Comets](https://asteroidcomet.space-bound.org)** — a four-module curriculum on the "Rocks & Ice of Our Solar System": composition and size comparisons, a comet-behavior simulator, how NASA tracks near-Earth objects, and a virtual landing on an asteroid.
- **[Oort Clouds & the Kuiper Belt](https://oortkuiper.space-bound.org)** — a scroll-to-zoom, drag-to-rotate 3D map of the outer solar system beyond Neptune, with clickable objects and dust.
- **[Jupiter's Great Red Spot](https://jupgreatredspot.space-bound.org)** — a rotatable 3D model of Jupiter paired with the science of why its 190+ year-old storm has persisted (and why it's been shrinking for over a century).
- **[Constellations](https://www.rohankhushraj.com)** — links out to Rohan's personal site/portfolio rather than a dedicated project.
- **[Big Bang Theory](https://bigbang.space-bound.org)** — a nine-stage, arrow-key-navigable walkthrough of cosmic history starting at t = 0.
- **[Moons of Planets](https://moonsofplanets.space-bound.org)** — an interactive 3D guide to every planet's moons (Mercury and Venus excluded — they don't have any), covering orbital terms like prograde/retrograde motion and eccentricity.
- **[Rockets & Satellites](https://rocketsandsatellites.space-bound.org)** — a curated, expandable roster of history's major spacecraft and launch vehicles.

## How it's built

Plain HTML/CSS/JS, no framework or build step:

- `index.html` / `style.css` / `script.js` — the whole site
- Background and rocket are real, minimally-edited NASA public-domain photography (via images-api.nasa.gov), not illustrations
- Buttons are laid out on a semicircular arc around the rocket via trigonometry, with a shrink-to-fit algorithm so they never overlap regardless of screen size
- Launch sequence prefetches the destination page the instant you click, so the site you land on feels instant

## Infrastructure

- Hosted on **Cloudflare Pages**, auto-deploying from this repo on every push to `main`
- Custom domain **space-bound.org** (registered on IONOS, DNS on Cloudflare)
- Each topic routes through its own `*.space-bound.org` subdomain to the teammate's original project, spanning three separate Cloudflare accounts

## Team

Built by Rohan, Arnav, and Pranav for the Stardance Challenge.
