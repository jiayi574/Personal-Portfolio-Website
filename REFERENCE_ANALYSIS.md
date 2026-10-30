# Reference analysis — davesocozy.com

Inspected live in headless Microsoft Edge on 29 October 2026 at 1440 × 1000 and 390 × 844. Captured opening, studio entry/promotion, shop interaction, and mobile states under screenshots/reference. No source assets are reused.

## Scene composition and layout
The opening uses warm paper, a green cutting mat, collage imagery and monospaced typography. Enter Studio transitions into an enclosed, densely furnished, dark wood studio. The back wall is a gallery of framed artwork; low work surfaces and a cutting table occupy the foreground. A bookshelf, printer, clock, toys and practical lamps make it feel inhabited. The room is the navigation, with small corner controls.

## Camera behavior
Studio entry changes from the flat introduction to a perspective room. Object interaction leads to content; the shop opens as a large surface over the scene. Exact camera curves and all object destinations have not been exhaustively verified. Reproduce restrained, bounded perspective navigation and reversible focus transitions rather than claiming identical curves.

## Lighting and materials
Very warm brown wood, cream paper, olive green accents, orange highlights, practical light sources, strong corner darkness, screen glow. The live promotional backdrop is deliberately dimmed. Keep the original implementation's room legible rather than copying that overlay's darkness.

## Objects and interaction
Observed gallery art, paper-cutting table, shelving, printer, toys, clock and sound toggle. Live accessibility text lists record player, game consoles, vinyl crate, window, lamps and other detailed props. Enter Studio works; promotion opens after entry; clicking its shop action opens a full shop panel. Interactive gallery works have accessible descriptions.

## Post-processing
Visible textured/noisy shading, vignette and retro-screen character. Exact shader pipeline is unverified. Use modest grain, corner vignette and local CRT scanlines without affecting reading surfaces.

## Mobile
390px shop view becomes a full-screen scrollable interface with a two-column catalog, compact header and wrapping filters. Capture unobstructed mobile room separately. Implementation should preserve touch exploration, provide larger selection targets, fit the room on narrow screens, and provide complete HTML navigation.

## Implementation priorities
1. Dense original furnished room with coherent warm materials and real geometry.
2. Predictable camera orbit, limits, focus and return.
3. Discoverable, purposeful objects and accessible route-based content.
4. Original artwork and procedural textures; no copied proprietary models or imagery.
5. Desktop and mobile QA with screenshots, WebGL fallback and reduced motion.

## Evidence limitations
The reference was genuinely opened and interacted with. Observations above distinguish visible behavior from implementation choices. This is a reference-inspired original environment, not a claim of pixel-identical reproduction or complete inspection of every reference interaction.

## Unobstructed studio follow-up

Dismissed the live promotional dialog and captured `reference-room.png`, hover, wheel navigation, and a 390px studio view. The exposed back wall centers on a television and framed gallery; a printer/work bench sits to the left, and book/toy shelving with a lava lamp and luminous calendar sits to the right. A green cutting mat and blue tray occupy the foreground. The mobile studio crops this spatial view closely, while the shop switches to a dedicated responsive interface. The reference rendered unusually dark with conspicuous grain in this software-rendered Edge session; that may reflect the rendering environment as well as the intended shader treatment.

## Implementation comparison and refinement

Compared both the overview and interior implementation screenshots to the live reference. Five principal gaps were addressed: room framing (closer overview plus a separate interior view), hard shadows (soft shadow sampling), oversaturated wood (more neutral material multipliers), sparse corners (noticeboard, computer tower, record crate, floor lamp and desk ephemera), and intrusive interaction markers (smaller desktop dots with hover labels). A second inspection corrected headline wrapping, mobile camera fit and interior caption contrast. The finished environment remains brighter, more stylized and less photorealistic than the reference; this distinction is intentional to disclose, not a claim of full fidelity.
