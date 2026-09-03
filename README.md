# Commonplace

> **Live Demo**: [https://commonplace-webmcp.vercel.app](https://commonplace-webmcp.vercel.app)  
> **GitHub Repository**: [https://github.com/arterialist/webmcp-openai-hackathon](https://github.com/arterialist/webmcp-openai-hackathon)  
> **Open Source License**: [MIT License](./LICENSE)

**Commonplace** is an agent-native, local-first social reading space and publishing desk designed for people and browser agents. Its feed, reading list, article composer, profile, and design system share a single, unified action contract: **every meaningful surface and capability is exposed as a WebMCP tool**.

---

## 🎯 Hackathon Submission Overview

### 1. Why this use case is a strong fit for WebMCP
The modern web is built exclusively for human vision and mouse clicks. When an AI agent tries to read a feed, save an article, compose text, or tune an interface, it currently has to take screenshots, run OCR, query brittle CSS selectors, simulate clicks through multi-step modal dialogs, and pray that an element hasn't shifted by 2 pixels.

Reading and publishing are fundamentally semantic tasks. By implementing WebMCP, Commonplace replaces brittle DOM automation with an explicit, high-level action contract. The agent doesn't crawl CSS classes or simulate clicks; it speaks directly to `document.modelContext` with typed schemas, receiving structured data and executing actions with deterministic certainty.

### 2. How it creates a better experience
- **For people**: Users can curate their reading, publish thoughts, or reshape the interface through natural conversation without hunting through multi-layered settings menus.
- **For browser agents**: Instead of executing an error-prone sequence of 6 UI clicks to open an editor, click a title field, paste content, find the tags input, and click submit, an agent executes `commonplace.create_article` in a single atomic turn.
- **Bi-directional clarity**: Every change made by an agent immediately renders in the DOM, and every action taken by the human updates the page state that agents inspect.

### 3. What people and agents can now do together
- **Agent-Assisted Curation & Reading**: An agent can query your reading list (`commonplace.get_reading_list`), search topic feeds (`commonplace.search_feed`), summarize unread articles, and organize your queue.
- **Collaborative Writing & Deep Editing**: Agents can inspect active drafts (`commonplace.get_article_draft`), update specific fields (`commonplace.set_article_title`, `commonplace.set_article_body`, `commonplace.set_article_tags`), or publish/discard drafts seamlessly.
- **Comprehensive Interface Personalization**: An agent can tune 13 exact semantic OKLCH color tokens, switch font stacks (Geist, Serif, Monospace), adjust line-height and reading measure (`ch`), modify layout density, or reorder entire homepage and navigation blocks (`commonplace.set_customization`, `commonplace.move_home_block`).
- **Hands-Free Realtime Voice Guide**: Through OpenAI Realtime WebRTC mapped to the exact same 44 WebMCP actions, users can speak naturally to have the page summarize articles, re-theme the UI, or draft thoughts live.

### 4. How WebMCP was implemented
- **Spec-Compliant Registration**: Tools are registered directly onto `document.modelContext.registerTool()` per the W3C WebMCP draft specification with strict JSON schemas, descriptions, and operational hints (`readOnlyHint`, `destructiveHint`, `idempotentHint`).
- **Comprehensive Tool Registry**: 44 distinct tools covering feed discovery, reading list management, search, article drafting/publishing, profile editing, spacing/typography/color customization, and overlay control.
- **Universal Browser Compatibility**: Built using `@mcp-b/webmcp-polyfill` with cross-property bridging (`document.modelContext`, `navigator.modelContext`, and `window.modelContext`).
- **Evaluation & Testing Ready**: Enabled with `installTestingShim: true`, allowing automated testing frameworks and headless browsers to invoke `navigator.modelContextTesting.executeTool()` and `document.modelContext.getTools()` directly in production.
- **Zero Login Friction**: Local-first architecture stores state in browser `localStorage`. Judges and agents can start interacting immediately with zero credentials or sign-up walls.

---

## 🛠 WebMCP Tool Registry (44 Tools)

### 📖 Reading & Feed Discovery (10 tools)
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

### ✍️ Authoring & Publication (12 tools)
| Tool Name | Description |
| :--- | :--- |
| `commonplace.create_post` | Publish a short post to the local feed. |
| `commonplace.create_article` | Publish a complete multi-paragraph article with tags. |
| `commonplace.update_article` | Update title, excerpt, body, or tags on an existing article. |
| `commonplace.delete_article` | Remove an article permanently from the local feed. |
| `commonplace.get_article_draft` | Read the currently open composer state, fields, and validity. |
| `commonplace.set_article_draft` | Bulk-populate draft title, summary, body, and topic tags. |
| `commonplace.set_article_title` | Update only the draft title in the open composer. |
| `commonplace.set_article_excerpt` | Update the draft summary/excerpt. |
| `commonplace.set_article_body` | Update the draft full body text. |
| `commonplace.set_article_tags` | Update the draft topic tags array. |
| `commonplace.publish_article_draft` | Validate and publish the current draft. |
| `commonplace.discard_article_draft` | Discard draft changes and close the editor. |

### 🎨 Personalization & CSS Tokens (15 tools)
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

### 🧭 Navigation & Overlays (7 tools)
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

## 🧪 Testing Instructions for Judges

You can test Commonplace via four independent methods:

### Option A: Testing in Chrome with WebMCP Enabled
1. Open Google Chrome (with WebMCP flag enabled) or any browser supporting WebMCP.
2. Navigate to [https://commonplace-webmcp.vercel.app](https://commonplace-webmcp.vercel.app).
3. Open Developer Tools (F12 or Cmd+Option+I) -> Console.
4. Verify tool registration:
   ```javascript
   const tools = await document.modelContext.getTools();
   console.log(`Discovered ${tools.length} WebMCP tools!`, tools);
   ```
5. Execute a tool via the model context:
   ```javascript
   // Change the reading theme to dark night mode with serif fonts
   const setCustomization = tools.find(t => t.name === 'commonplace.set_customization');
   await document.modelContext.executeTool(setCustomization, JSON.stringify({
     palette: 'night',
     fontFamily: 'serif',
     contentWidth: 72
   }));
   ```

### Option B: Testing in ChatGPT In-App Browser
1. In ChatGPT, provide the URL: `https://commonplace-webmcp.vercel.app`.
2. Ask ChatGPT to browse the site and interact using WebMCP tools (e.g., *"Read the page state and tell me the top saved articles"*, *"Draft a new post about agent design"*, or *"Change the reading theme to lichen"*).
3. The agent will discover the tools on `document.modelContext` / `navigator.modelContext` and execute them directly.

### Option C: Instant In-Page WebMCP Inspector
1. Visit [https://commonplace-webmcp.vercel.app](https://commonplace-webmcp.vercel.app).
2. Click the **Tools (44)** badge in the top-right header or in the right-side Agent Rail.
3. The interactive WebMCP Tool Inspector will open.
4. Click on any tool (e.g., `commonplace.get_reading_list`, `commonplace.set_theme`, or `commonplace.create_article`) to inspect its JSON Schema and test real-time execution directly in the UI.

### Option D: Realtime Voice Agent
1. Click **Talk to your space** in the top bar or Agent Rail.
2. Ensure your microphone is enabled.
3. Speak naturally: *"Switch the theme to night mode and read me what I have saved for later."*
4. The voice agent uses the identical WebMCP tool action contract via OpenAI Realtime WebRTC to execute the changes live.

---

## 💻 Local Development

```bash
# Clone repository
git clone https://github.com/arterialist/webmcp-openai-hackathon.git
cd webmcp-openai-hackathon

# Install dependencies (Bun recommended)
bun install

# Configure environment (optional, for OpenAI Realtime voice)
cp .env.example .env.local

# Start development server
bun run dev
```

### Running Test Suite & Linter

```bash
# Run Vitest test suite
bun run test

# Run Oxlint
bun run lint

# Build production bundle
bun run build
```

---

## 📅 Hackathon Eligibility Notice
All code for Commonplace was conceived, designed, and built starting **August 26, 2026** during the official WebMCP Hackathon submission window. Zero lines of code existed prior to August 25, 2026.
