# Space Bound

**Live at [space-bound.org](https://www.space-bound.org)**

An interactive rocket-launch landing page built by the Union Buddies — Rohan, Arnav, and Pranav — that links out to nine space-topic educational sites we each built.

## What it does

Click a topic, and a real NASA rocket photo blasts off the launch pad (shake → liftoff → smoke trail) before redirecting you to that topic's site:

- Black Holes
- The Solar System
- Asteroids & Comets
- Oort Clouds & the Kuiper Belt
- Jupiter's Great Red Spot
- Constellations
- Big Bang Theory
- Moons of Planets
- Rockets & Satellites

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
