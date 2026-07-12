<!--
  github.com/abhijitbansal — profile README.
  Panels in assets/*.svg are generated: `node scripts/build.mjs` from data/telemetry.json.
  Static by design (GitHub freezes SVG animation in README <img>); self-contained dark
  cards so they read the same on light- and dark-theme profiles.
-->

<div align="center">

<img src="assets/hero.svg" alt="Abhijit Bansal — The Foundry. I build privacy-first apps and AI agent tooling. Designed, engineered and shipped end to end, solo." width="100%">

<br>

[![Website](https://img.shields.io/badge/abhijitbansal.com-E36A5E?style=flat-square&logo=safari&logoColor=white)](https://abhijitbansal.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/abhijit-bansal/)
[![Email](https://img.shields.io/badge/contact@abhijitbansal.com-C8901F?style=flat-square&logo=maildotru&logoColor=white)](mailto:contact@abhijitbansal.com)
[![Swift](https://img.shields.io/badge/Swift_6-E36A5E?style=flat-square&logo=swift&logoColor=white)](#)
[![Rust](https://img.shields.io/badge/Rust-C0503F?style=flat-square&logo=rust&logoColor=white)](#)
[![Python](https://img.shields.io/badge/Python-C8901F?style=flat-square&logo=python&logoColor=white)](#)
[![Claude Code](https://img.shields.io/badge/Claude_Code-D97757?style=flat-square&logo=anthropic&logoColor=white)](#)

</div>

<img src="assets/expertise.svg" alt="Three disciplines: iOS & Apple platforms; AI agent tooling; full-stack product craft." width="100%">

## The work

Products first — public apps and open-source tools. Private repos show curated info, not code.

**Apps · iOS / macOS**

| Project | What it is | Stack |
| :-- | :-- | :-- |
| **[Cubby](https://gotcubby.com)** | Inventory for garage & basement storage. NFC + QR on bins, on-device Vision names items, 3D rack view. Zero backend, zero third-party deps. | `Swift 6` · `SwiftUI` · `SwiftData` · `Vision` |
| **[Paperix](https://abhijitbansal.github.io/paperix-site/)** | Document scanner that makes searchable PDFs with on-device OCR. No cloud, no accounts, no subscription. | `Swift` · `SwiftUI` · `Vision OCR` |
| **[Floorprint](https://abhijitbansal.github.io/floorprint-site/)** | Scan rooms with LiDAR & RoomPlan into editable 2D floor plans. Export PDF / DXF / USDZ / GLB / STEP. | `iOS + macOS` · `RoomPlan` · `SceneKit` |
| **Folix** · _private_ | Privacy-first wealth dashboard — local Plaid pulls, on-device storage, AI-augmented insights. | `macOS` · `Swift` · `GRDB` · `Plaid` |

**AI & agent tooling · open source**

| Project | What it is | Stack |
| :-- | :-- | :-- |
| **[cartoon](https://github.com/abhijitbansal/cartoon)** · [site ↗](https://abhijitbansal.github.io/cartoon/) | Token-optimized CLI output for AI agents — read 12 lines instead of 800, raw logs archived. ~70% fewer tokens. | `Rust` |
| **[claude-skills](https://github.com/abhijitbansal/claude-skills)** · [site ↗](https://abhijitbansal.github.io/claude-skills/) | Skills, plugins & agent tooling for Claude Code: iOS build loops, PM automation, prompt refinement. | `Python` · `Shell` |
| **[sift](https://github.com/abhijitbansal/sift)** · [digest ↗](https://abhijitbansal.github.io/sift/) | Weekly AI-news pipeline: RSS in, one Claude call, HTML digest + Pages archive out. | `Python` · `Claude API` |
| **memekit** · _private_ | Deterministic ASCII meme reactions for CLIs, bots & agents. 45 formats, zero deps — library, CLI & MCP server. | `TypeScript` · `MCP` |
| **design-system** · _private_ | Cross-product design tokens → CSS custom properties, SwiftUI tokens & Tailwind presets for the whole fleet. | `JSON tokens` · `CSS` · `Swift` |

## The forge runs hot

Everything above is built with Claude Code — and the workshop keeps its own books. Parsed locally from **3,141 session logs**, on-device like everything else. Snapshot as of Jul 12, 2026.

<img src="assets/stats.svg" alt="All-time forge telemetry: 305,776 lines added, 3,089 Claude Code sessions, 90.4M tokens written, 12.9B tokens cache-read." width="100%">

<img src="assets/activity.svg" alt="Daily output tokens from May 22 to Jul 11, 2026, peaking at 11.5M in a single day." width="100%">

<table>
<tr>
<td width="50%"><img src="assets/models.svg" alt="Model mix across 103K assistant messages: Opus 4.8 37.8%, Sonnet 5 26.3%, Fable 5 16.1%, Haiku 4.5 8.9%, Opus 4.7 6.0%, Sonnet 4.6 4.9%." width="100%"></td>
<td width="50%"><img src="assets/tools.svg" alt="Top tools by call count: Bash 22.2K, Read 15.0K, Edit 5.3K, Write 2.2K, StructuredOutput 2.0K, WebFetch 724." width="100%"></td>
</tr>
</table>

<img src="assets/repos.svg" alt="Lines added per repo: cubby 117K, claude-skills 49.6K, floorprint 32.1K, cartoon 15.6K, sift 12.2K, memekit 9.9K, foundry 7.3K, doc-scan 6.0K, design-system 3.1K." width="100%">

<img src="assets/languages.svg" alt="Source languages by bytes, public and private: Swift 76.4%, Python 7.6%, Shell 6.1%, Rust 4.3%, TypeScript 2.2%, JavaScript 2.2%, Astro 1.1%." width="100%">

<div align="center">

<sub>Counted from 3,141 local Claude Code session logs by a <a href="https://github.com/abhijitbansal/claude-skills">claude-skills</a> script — on-device, like everything else here. Panels regenerated with <code>node scripts/build.mjs</code>. &nbsp;·&nbsp; <a href="https://github.com/abhijitbansal/abhijitbansal/blob/main/docs/building-a-telemetry-profile-readme.md">how this was built ↗</a> &nbsp;·&nbsp; <a href="https://abhijitbansal.com">abhijitbansal.com</a></sub>

</div>
