# Commonplace

> **Live demo**: [https://commonplace-webmcp.vercel.app](https://commonplace-webmcp.vercel.app)  
> **GitHub repository**: [https://github.com/arterialist/webmcp-openai-hackathon](https://github.com/arterialist/webmcp-openai-hackathon)  
> **Open source license**: [MIT License](./LICENSE)

Commonplace is a local-first reading desk and publishing space where every primary action is available to both readers and browser agents through WebMCP. The feed, reading list, article composer, profile, and design system connect to typed tools registered on the page.

---

## Table of contents

- [Hackathon submission overview](#hackathon-submission-overview)
  - [1. Why this use case is a strong fit for WebMCP](#1-why-this-use-case-is-a-strong-fit-for-webmcp)
  - [2. How it creates a better experience](#2-how-it-creates-a-better-experience)
  - [3. What people and agents can now do together](#3-what-people-and-agents-can-now-do-together)
  - [4. How WebMCP was implemented](#4-how-webmcp-was-implemented)
- [WebMCP tool registry (44 tools)](#webmcp-tool-registry-44-tools)
  - [Reading and feed discovery](#reading-and-feed-discovery-10-tools)
  - [Authoring and publishing](#authoring-and-publishing-12-tools)
  - [Personalization and tokens](#personalization-and-tokens-15-tools)
  - [Navigation and overlays](#navigation-and-overlays-7-tools)
- [Testing instructions for judges](#testing-instructions-for-judges)
  - [Option A: Chrome with WebMCP enabled](#option-a-chrome-with-webmcp-enabled)
  - [Option B: ChatGPT in-app browser](#option-b-chatgpt-in-app-browser)
  - [Option C: In-page WebMCP tool inspector](#option-c-in-page-webmcp-tool-inspector)
  - [Option D: Realtime voice agent](#option-d-realtime-voice-agent)
- [Local development](#local-development)
  - [Running tests and linting](#running-tests-and-linting)
- [Hackathon eligibility notice](#hackathon-eligibility-notice)

---

## Hackathon submission overview

### 1. Why this use case is a strong fit for WebMCP

Web apps are typically designed around mouse clicks and rendered pixels. When an agent tries to save an article, compose a post, or change layout settings, it usually has to take screenshots, inspect fragile CSS selectors, and simulate clicks through nested dialogs. A two-pixel layout shift can break the flow.

Reading and writing are structured actions. Instead of scraping DOM elements, Commonplace exposes functions directly on `document.modelContext`. The agent reads data in typed schemas, executes actions directly, and receives immediate structured returns. The interface responds without relying on screen coordinates or visual hacks.

### 2. How it creates a better experience

For readers, Commonplace turns interface settings into a quick request. You do not need to dig through nested menus to change line height, adjust column width, or switch to a dark palette. You can ask an agent or make the change directly.

For agents, Commonplace removes multi-step UI navigation. Instead of taking screenshots, finding buttons, waiting for a modal, pasting into a textarea, and clicking submit, the agent calls `commonplace.create_article` in one step.

State flows both ways without delay. When an agent updates a setting, the DOM updates immediately and an activity badge renders on the Agent Rail. When a reader saves an article or changes a filter, the agent reads the updated state on its next call.

### 3. What people and agents can now do together

Readers and agents share the same actions on the page:

- **Curate reading queues.** An agent queries your saved articles with `commonplace.get_reading_list`, searches topics with `commonplace.search_feed`, and toggles reading list items directly.
- **Write and edit articles.** Agents inspect active drafts through `commonplace.get_article_draft`, update individual fields like titles or tags, and publish or discard the draft in place.
- **Adjust page typography and layout.** Agents modify 13 semantic OKLCH color tokens, swap font families, tune line height, set column width in character measure (`ch`), and rearrange homepage blocks with `commonplace.move_home_block`.
- **Talk to the desk live.** An in-browser voice connection runs over OpenAI Realtime WebRTC, routing spoken requests to the same 44 WebMCP actions in real time.

### 4. How WebMCP was implemented

Commonplace implements WebMCP at both the imperative and declarative levels:

- **Imperative registration.** Every tool registers through `document.modelContext.registerTool()` with a JSON Schema, description, and execution callback. Tools include standard hints such as `readOnlyHint` and `idempotentHint`.
- **OpenAI naming compatibility.** OpenAI function calling requires names matching `^[a-zA-Z0-9_-]+$`. Commonplace registers each tool under its canonical dot name (such as `commonplace.set_customization`) and an underscore alias (`commonplace_set_customization`), so ChatGPT can call tools without name validation errors.
- **Declarative forms.** The search bar uses declarative HTML form attributes (`toolname="commonplace_search_feed"`, `tooldescription`, `toolautosubmit`) so browser agents can discover search capabilities directly from the DOM.
- **Cross-context bridging.** The implementation links `document.modelContext`, `window.modelContext`, and `navigator.modelContext` so host environments that attach to any of the three namespaces discover all tools.
- **Testing shim on production.** Enabled with `installTestingShim: true`, allowing judges to call `navigator.modelContextTesting.executeTool()` directly in the browser console.
- **Local storage.** App state lives in `localStorage`. Readers and judges do not need accounts, API keys, or sign-up steps to run the tools.

---

## WebMCP tool registry (44 tools)

### Reading and feed discovery (10 tools)

| Tool Name | Description |
| :--- | :--- |
| `commonplace.get_page_state` | Read active page, theme, user profile, and visible posts. |
| `commonplace.get_reading_list` | Return all saved posts in the reading list. |
| `commonplace.get_profile` | Read user profile, bio, location, and reading interests. |
| `commonplace.get_article` | Retrieve the full body, metadata, and tags of a specific post. |
| `commonplace.open_post` | Open a specific post into the reader view. |
| `commonplace.search_feed` | Perform a semantic search across titles, excerpts, and tags. |
| `commonplace.set_search_query` | Populate the visible search field and filter feed cards. |
| `commonplace.clear_search` | Reset the search field to display the unfiltered feed. |
| `commonplace.set_feed_filter` | Switch view between `for-you`, `saved`, and `following`. |
| `commonplace.toggle_save_post` | Save or unsave an article in the local reading queue. |

### Authoring and publishing (12 tools)

| Tool Name | Description |
| :--- | :--- |
| `commonplace.create_post` | Publish a short post to the local feed. |
| `commonplace.create_article` | Publish a complete multi-paragraph article with tags. |
| `commonplace.update_article` | Update title, excerpt, body, or tags on an existing article. |
| `commonplace.delete_article` | Remove an article permanently from the local feed. |
| `commonplace.get_article_draft` | Read the currently open composer state, fields, and validity. |
| `commonplace.set_article_draft` | Bulk-populate draft title, summary, body, and topic tags. |
| `commonplace.set_article_title` | Update only the draft title in the open composer. |
| `commonplace.set_article_excerpt` | Update the draft summary or excerpt. |
| `commonplace.set_article_body` | Update the draft full body text. |
| `commonplace.set_article_tags` | Update the draft topic tags array. |
| `commonplace.publish_article_draft` | Validate and publish the current draft. |
| `commonplace.discard_article_draft` | Discard draft changes and close the editor. |

### Personalization and tokens (15 tools)

| Tool Name | Description |
| :--- | :--- |
| `commonplace.get_customization` | Read current theme, typography, spacing, and CSS token overrides. |
| `commonplace.get_customization_schema` | Discover all editable schema properties and accepted values. |
| `commonplace.set_customization` | Apply complete layout, density, typography, and palette changes. |
| `commonplace.set_theme` | Compatibility wrapper for full theme updates. |
| `commonplace.set_typography` | Adjust font families (Geist, Serif, Mono), line-height, and measure. |
| `commonplace.set_spacing` | Tune page padding, section rhythm, card padding, and gaps. |
| `commonplace.set_shape` | Adjust corner radii, border widths, surface elevation, and shadows. |
| `commonplace.set_visual_grid` | Enable blueprint or ruled grid canvas with opacity controls. |
| `commonplace.set_copy` | Rewrite visible brand labels, hero headers, and quote text. |
| `commonplace.set_block_visibility` | Toggle individual UI blocks (sidebar, hero, quote, tags, rail). |
| `commonplace.move_home_block` | Reorder homepage sections (`hero`, `quote`, `feed`). |
| `commonplace.move_navigation_item` | Reorder sidebar navigation items (`home`, `saved`, `profile`). |
| `commonplace.reset_customization` | Restore default layout, tokens, and styling. |
| `commonplace.update_profile` | Update display name, bio, location, or website. |
| `commonplace.toggle_like_post` | Like or unlike an article locally. |

### Navigation and overlays (7 tools)

| Tool Name | Description |
| :--- | :--- |
| `commonplace.navigate` | Navigate between `home`, `saved`, and `profile` surfaces. |
| `commonplace.open_composer` | Open the article composer modal (optionally loading an article ID). |
| `commonplace.open_profile_editor` | Open the profile editor dialog. |
| `commonplace.open_studio` | Open the slide-out personalization studio sheet. |
| `commonplace.open_tool_inspector` | Open the interactive in-page WebMCP tool inspector. |
| `commonplace.start_voice_agent` | Open the OpenAI Realtime voice agent panel. |
| `commonplace.close_overlays` | Dismiss all open dialogs, sheets, and drawers. |

---

## Testing instructions for judges

You can test Commonplace with any of four methods:

### Option A: Chrome with WebMCP enabled

1. Open Google Chrome with the WebMCP flag enabled.
2. Navigate to [https://commonplace-webmcp.vercel.app](https://commonplace-webmcp.vercel.app).
3. Open Developer Tools, then click Console.
4. Verify tool registration:
   ```javascript
   const tools = await document.modelContext.getTools();
   console.log(`Discovered ${tools.length} WebMCP tools:`, tools);
   ```
5. Execute a tool through the model context:
   ```javascript
   // Change the reading theme to dark night mode with dense layout
   const setCustomization = tools.find(t => t.name === 'commonplace.set_customization');
   await document.modelContext.executeTool(setCustomization, JSON.stringify({
     palette: 'night',
     density: 'dense',
     contentWidth: 72
   }));
   ```

### Option B: ChatGPT in-app browser

1. In ChatGPT, open the site tools browser with: `https://commonplace-webmcp.vercel.app`.
2. Ask ChatGPT to inspect the page and run actions, such as:
   - "Read my reading list and tell me the saved articles."
   - "Switch the desk to night mode and compact density."
   - "Draft a new article about WebMCP browser contracts."
3. The agent discovers the tools on `document.modelContext` and executes them directly.

### Option C: In-page WebMCP tool inspector

1. Open [https://commonplace-webmcp.vercel.app](https://commonplace-webmcp.vercel.app).
2. Click the **Tools (44)** button in the top header or in the right-hand Agent Rail.
3. The interactive inspector displays every registered tool and its JSON Schema.
4. Click any tool to execute it live and observe the page state update in real time.

### Option D: Realtime voice agent

1. Click **Talk to your space** in the top bar or Agent Rail.
2. Allow microphone access when prompted.
3. Speak a request: *"Switch the theme to night mode and read me what I have saved."*
4. The voice agent connects over OpenAI Realtime WebRTC and dispatches the exact WebMCP actions live.

---

## Local development

```bash
# Clone repository
git clone https://github.com/arterialist/webmcp-openai-hackathon.git
cd webmcp-openai-hackathon

# Install dependencies
bun install

# Configure environment (optional, for OpenAI Realtime voice)
cp .env.example .env.local

# Start development server
bun run dev
```

### Running tests and linting

```bash
# Run test suite
bun run test

# Run Oxlint
bun run lint

# Build production bundle
bun run build
```

---

## Hackathon eligibility notice

All code for Commonplace was conceived, designed, and built starting August 26, 2026 during the official WebMCP Hackathon submission window. Zero lines of code existed prior to August 25, 2026.
