# Personal-Portfolio-Website

**A Room of One's Own** — a personal portfolio website built as an interactive 3D studio.

**Live website:** https://page-a-room-of-ones-own-0558pa97.anycap.cloud

The room contains original furniture, artwork, procedural materials, a work desk, CRT, turntable, books, plants and small personal details. Objects open real content routes with eased camera transitions. The website supports desktop, touch input, keyboard navigation, reduced motion and an HTML navigation fallback when WebGL is unavailable.

## Run locally

Requires Node.js 22 or 24 LTS and npm.

```sh
npm ci
npm run dev
```

Open the localhost URL printed by Next.js, usually http://127.0.0.1:3000.

On Windows, after installing dependencies, `Start-Website.ps1` can start the development server in the background, verify its HTTP response, and open Microsoft Edge. It selects an available port from 3000–3010 and stores local logs in the ignored `.local-server/` directory.

## Build and validate

```sh
npm run typecheck
npm run build
npm run start
```

For a portable static deployment:

```sh
npm run export
```

The static website is written to `out/`. Static builds use a separate `.next-export/` cache, preserving the normal development/build cache. Both caches and `out/` are ignored by Git.

## Deploy to Anycap

The existing site binding is in `anycap.toml`. It contains a public site ID, not credentials. Install the official `@anycap/cli` and sign in on your own machine, then run:

```sh
npm run export
anycap page deploy ./out --page-id pg_fIYryhYKFnDIdtOm --concurrency 1 --publish
```

Use the same site ID for updates. Single-threaded uploads avoid a parallel-upload crash observed with Anycap CLI 0.6.5. Never commit API keys or authentication state.

## Explore the room

- Drag to orbit, scroll/pinch to zoom, or choose **Step inside** for the interior view.
- Computer → Work; framed posters → individual case studies; CRT/console → Playground.
- Turntable → Music; record sleeve → Album Roulette; bookshelf → Notes.
- Notebook → Now; desk note → About; desk lamp → lighting toggle.
- Escape, the close button, outside click, or browser navigation returns to the room.
- Audio is opt-in and synthesized locally; no commercial recordings are included.
- Album Roulette generates listening prompts. Do You GEO? is a local checklist. Sticker Generator downloads an editable SVG.

## Editable content and source

- `src/content/content.ts`: work entries, experiment entries, note drafts and listening prompts.
- `src/components/RoomScene.tsx`: original geometry, materials, lighting, object selection and camera.
- `src/components/RoomApp.tsx`: persistent room shell, routes, accessibility and audio.
- `src/components/Content.tsx`: reading panels, About/Now copy and browser-local experiments.
- `public/fonts/`: local typography and SIL Open Font Licenses.

Case studies, editorial note drafts and And Kwi are labeled as incomplete where first-hand details were not supplied. No performance metrics are fabricated. Resume/contact links and the actual music collection still need personal content.

The initial implementation was checked with a production build, 23 desktop/mobile browser interaction checks, 17 route responses, and public-URL checks after deployment. Physical mobile devices and cross-browser coverage remain unverified. The room is an original stylized interpretation of the reference, not a pixel-identical or photorealistic replica.

See `REFERENCE_ANALYSIS.md` and `ASSET_CREDITS.md` for reference observations, refinement notes and asset provenance.
