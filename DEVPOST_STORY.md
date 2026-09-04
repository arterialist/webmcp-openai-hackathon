# Commonplace: Devpost Submission Story & Details

## Elevator Pitch (under 200 chars)

A blog and reading platform that adapts to you. Using WebMCP, browser agents reshape layout, colors, and drafts around how you write and read.

---

## Inspiration

For as long as I can remember, the very first thing I do when opening any new piece of software is dive straight into settings. I inspect every toggle, theme picker, and slider to bend the tool to how I think. Google built Material Expressive for a reason. I spend hours tuning browser extensions and user scripts because default interfaces never quite fit.

The web has spent thirty years treating consumers as passive recipients of frozen pixels. A product team in another time zone decides your column width, font scale, and color scheme, and you are expected to conform to it. In the AI era, that model makes no sense. We now have the capability to make software listen and adapt. I wanted to build a corner of the web that I could reshape in real time to what matters to me right now.

## What it does

Commonplace is a personal blog and reading platform where the interface adapts to how you read and write.

Instead of hiding controls inside nested preference menus, Commonplace turns its entire runtime into an action contract for browser agents via WebMCP:

- **Living customization.** You can tell the agent you feel tired, and it instantly softens contrast, drops into night mode, and narrows the reading measure to 68 characters.
- **Surface layout shifts.** You can ask the agent to hide sidebars, rearrange homepage blocks, or surface your saved queue without touching settings.
- **Context-aware curation and writing.** The agent searches topics, queries your reading list, and edits active drafts beside you in the composer without taking over your screen.
- **Spoken dialogue.** Through OpenAI Realtime WebRTC mapped to the exact same WebMCP tools, you can talk to the desk to dictate thoughts or re-theme the workspace hands-free.

## How we built it

Commonplace is built as a local-first application using React 19, TypeScript, Bun, and Vite, with styling powered by Tailwind CSS v4 and dynamic CSS custom properties.

- **WebMCP implementation.** We registered 44 distinct tools on `document.modelContext` using `@mcp-b/webmcp-polyfill`. Every tool includes strict JSON schemas, descriptions, and operational hints like `readOnlyHint` and `idempotentHint`.
- **OpenAI function calling compliance.** OpenAI enforces tool name regex validation matching `^[a-zA-Z0-9_-]+$`. We registered tools under their canonical dot names (like `commonplace.set_customization`) and parallel underscore aliases (like `commonplace_set_customization`) so ChatGPT browser agents can call them without validation failures.
- **OKLCH token engine.** The styling system maps 13 semantic OKLCH tokens directly to CSS variables, allowing runtime palette and typography adjustments with zero layout jank.
- **Cross-context namespace bridging.** The app links `document.modelContext`, `window.modelContext`, and `navigator.modelContext` so host environments that attach to any of the three discover all capabilities.
- **Local-first persistence.** All post data, drafts, and theme overrides live in browser `localStorage`, removing all sign-up friction for judges.

## Challenges we ran into

The hardest part was making the UI look coherent and intentional given the sheer amount of live customization built into it.

When you allow an agent to adjust corner radii, swap between sans-serif and editorial serifs, alter line measure in character widths (`ch`), reorder major grid blocks, and manipulate color scales dynamically, visual bugs happen easily. A layout can quickly become messy. Engineering a design system that holds its balance and typography rhythm while every dial remains turnable was technically demanding.

We also ran into browser environment edge cases. Ensuring that React lifecycle re-renders did not prematurely abort registered WebMCP tools, and bridging read-only getters across window namespaces without throwing strict-mode errors, took several iterations to get right.

## Accomplishments that we're proud of

The real breakthrough came the moment the working prototype matched the picture in my head. I opened the browser, spoke to the space, and watched the page translate my intent and mood into the exact visual setup I needed, right there, with no delay. Seeing an agent run `commonplace.set_customization`, watching the palette shift to lichen, and seeing the live telemetry card log the tool call in the Agent Rail proved that the idea works.

## What we learned

Rigid rules will soon be a thing of the past in consumer software. Building Commonplace proved that WebMCP is not just a convenience for automating repetitive clicks; it fundamentally changes the relationship between people and software. When websites expose typed tool contracts instead of forcing agents to scrape fragile CSS selectors, software stops being a static picture and becomes living clay.

## What's next for Commonplace

Commonplace represents a design philosophy I intend to carry into every product I build. Beyond this hackathon, I want to explore multi-device agent synchronization, peer-to-peer reading networks, and richer declarative forms so that adaptive, malleable software becomes the standard way people experience the web.
