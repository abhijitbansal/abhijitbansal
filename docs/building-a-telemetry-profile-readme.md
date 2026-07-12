# Building a telemetry-rich GitHub profile README — lessons

Notes from building [this profile](https://github.com/abhijitbansal) — a dark "forge console"
README whose centerpiece is a bespoke dashboard of real Claude Code usage telemetry
(lines, sessions, tokens, model mix, per-repo, languages) rendered as committed SVGs.

If you want a profile that looks unlike everyone else's `github-readme-stats` card, this
is the playbook — plus the sharp edges that cost the most time, so you can skip them.

---

## TL;DR

1. **Spike GitHub's render on a real branch before you build anything.** Recall (yours or an
   LLM's) about how GitHub renders SVGs is unreliable. Push one throwaway SVG and *look*.
2. **Design 100% static.** GitHub **freezes SVG animation** in the README `<img>` context.
3. **Use self-contained dark cards** (background baked into each SVG) — they render identically
   on light- and dark-theme profiles with zero theme plumbing.
4. **Make it unique with data no widget can show** — your own telemetry, and private-repo facts
   you pull with an authenticated `gh`.
5. **Privacy is a git-*history* problem, not a file problem.** Scrubbing the working tree is not
   enough; a normal merge carries the leak into your default branch forever.
6. **Verify adversarially** — numbers against the source of truth, privacy, links, and the real
   GitHub render.

---

## 1. The one decision that matters: static-first

The tempting idea is animated SVGs (pulsing glows, draw-on charts). **Don't build on it.**

Verified empirically by pushing an animated SVG to a branch and frame-comparing the GitHub
render 0.9 s apart (half a 1.8 s pulse): **the frames were pixel-identical.** Both CSS
`@keyframes` and SMIL are frozen inside the README `<img>`. The *same file* animates fine as a
top-level document — so it's the embedding context, not the file.

> Design everything static. If some viewer's renderer happens to animate it, that's a bonus, never
> a dependency. This also means the contribution "snake" and typing-SVG tricks aren't worth a
> GitHub Action dependency for repo-local assets — a well-composed static dashboard carries it.

## 2. How GitHub actually renders README images

| Thing | Reality |
|---|---|
| Relative SVG path (`assets/x.svg`) | **Renders.** Served from GitHub's own `/raw/` endpoint. |
| External image (shields.io, etc.) | Rendered through the **camo** proxy. Relative repo assets **bypass camo.** |
| SVG animation (CSS/SMIL) via `<img>` | **Frozen.** See §1. |
| Allowed HTML in README | `img`, `a`, `picture`, `table/tr/td` (with `width`), `div/p align`, `sub`/`sup`, `br`, `code`, `details`. |
| Stripped HTML | `<style>`, `<script>`, `class=`, `id=`, inline `style=`. **All styling must live inside the SVG** or in badge URLs. |
| Fonts inside an `<img>` SVG | Resolve to the **viewer's** system fonts. Don't drive layout off measured text width — position explicitly; use `text-anchor="middle"` for wordmarks (outline to paths only if exact glyphs matter). |
| Responsiveness | GitHub's `img { max-width: 100% }` shrinks wide images on mobile automatically. Design at a fixed width (~880 px) and let it scale down. |

## 3. Theme: don't fight it — sidestep it

There are three ways to make an image theme-aware; two are traps:

- **In-SVG `@media (prefers-color-scheme)`** — keys off the *OS* setting, not GitHub's UI theme
  toggle. Unreliable.
- **Markdown `<picture>` with `prefers-color-scheme`** — follows GitHub's UI theme (the documented
  method). Works, but doubles your asset count.
- **Self-contained dark cards** (chosen) — each SVG paints its own rounded-rect background. It looks
  **identical** on a light or dark profile, reads as an intentional "console" aesthetic, and needs
  no theme logic at all. Most robust; least work.

## 4. Make it unique: data no widget can show

Off-the-shelf cards only see *public* GitHub activity. Two data sources beat them:

- **Your own tooling telemetry.** If you can aggregate it to JSON (here: Claude Code session logs →
  totals, per-repo, model mix, daily series), you can render "306K lines across 3,089 sessions" —
  a story no public widget has.
- **`gh` with your token sees private repos.** Real language bytes across *all* repos
  (`gh api repos/OWNER/REPO/languages`, summed) — not just the public slice. Exclude generated
  markup (HTML/CSS coverage/build output) and label it honestly ("source bytes, generated markup
  excluded") so one dominant generated file doesn't misrepresent the mix.

Keep it reproducible: a small **generator script** reads a committed **data manifest** and emits the
SVGs (`node scripts/build.mjs` here). Numbers stay correct and regeneration is one command.

## 5. Spike before you build

The highest-leverage 10 minutes: **push a probe branch and look at the real GitHub render** before
investing hours in the design.

Probe one SVG that tests every mechanism at once — a CSS animation, a SMIL animation, an in-SVG
`@media` theme swap, and a `<picture>` pair — then, on the rendered branch README:

- Frame-compare (screenshot, wait, screenshot) to see if animation *plays*.
- Toggle GitHub light/dark to see which theme mechanism follows the UI.
- Confirm relative paths resolve at all.

Everything in §§1–3 came from this spike. Delete the probe before shipping.

## 6. Verify adversarially

Before go-live, check four independent things (parallel agents work well here):

- **Numbers** — every figure in the README/SVGs against the source-of-truth data. Pick one
  denominator for percentages and don't blend windows (e.g. all-time totals vs a trailing window).
- **Privacy** — see §7.
- **Links** — every URL resolves (note: LinkedIn returns HTTP `999` to non-browser user agents —
  that's anti-bot, not link rot).
- **Render** — view the actual profile page (`github.com/USER`, not the repo) on the real theme.

## 7. Privacy is a git-history problem

The subtle one. Your README is permanent public surface — it must expose **no more than you already
publish elsewhere**. Concretely:

- Use **product names, not internal repo names**; give **no repo link** for private repos.
- Don't even name undisclosed projects **in a comment** — a JSON `_note` shipped in the repo is
  public.
- Don't reveal an aggregate **repo count** larger than your disclosed set — it lets people infer
  hidden repos exist.

And the trap that a working-tree scrub misses: **the leak stays in git history.** A normal
merge/rebase carries the leaky commit into your default branch as an ancestor, one `git log -p`
away — forever. The profile README shows from the **default branch**, so:

```bash
# collapse everything into ONE clean commit on a fresh default branch
git checkout --orphan main
git add -A && git commit -m "feat: profile README"
git push -u origin main
gh repo edit OWNER/REPO --default-branch main
git push origin --delete old-branch          # remove the branch with leaky ancestors
git log -p origin/main | grep -niE 'leaked-name'   # must be empty
```

A squash also drops your throwaway spike commit. Bonus.

## 8. Gotcha checklist

- [ ] Animation? Assume frozen. Static only.
- [ ] Every panel is a self-contained dark card (baked background).
- [ ] No `<style>`/`class=`/inline `style=` in the README — GitHub strips them.
- [ ] Chart/wordmark text positioned explicitly, not width-measured.
- [ ] Percentages share one denominator; date windows labeled honestly.
- [ ] Product names, no private repo links, no hidden-repo *counts*, no codenames in comments.
- [ ] Default branch history is clean (squash), feature branch deleted.
- [ ] Verified on the real profile page, both themes, and mobile width.
- [ ] Panels regenerate from a data manifest with one command.

---

*Built for `github.com/abhijitbansal`. Generator: [`scripts/build.mjs`](../scripts/build.mjs) →
`assets/*.svg` from [`data/telemetry.json`](../data/telemetry.json).*
