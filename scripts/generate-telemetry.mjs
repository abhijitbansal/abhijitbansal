// generate-telemetry.mjs — refreshes data/telemetry.json from foundry's
// data/stats.json (the Claude Code session-log parse, source of truth).
// Run by foundry's scripts/weekly/run_weekly.sh every Monday; safe to run
// by hand too: `node scripts/generate-telemetry.mjs --stats <path-to-stats.json>`
//
// Two fields aren't in stats.json and are pulled live via `gh`:
//   - languages: gh api repos/{owner}/{repo}/languages, summed across
//     DISCLOSED_REPOS, HTML/CSS excluded (generated markup, not hand-written
//     source — see docs/building-a-telemetry-profile-readme.md §4).
//   - contributions: gh api graphql, viewer.contributionsCollection —
//     GitHub's contribution calendar has no REST equivalent.
// Everything else is a straight rename/reshape of stats.json, so the two
// files never drift out of sync on the totals that matter.
//
// DISCLOSED_REPOS is deliberately its OWN list, NOT a mirror of foundry's
// private scripts/stats/parse_sessions.py PROJECTS_ALLOWLIST. foundry's
// allowlist exists to gate PROJECTS.md, which intentionally discloses every
// project the site owner has decided to publish (including paused/private
// ones, curated case by case). This repo is public forever the moment
// something lands on `main` (see docs/building-a-telemetry-profile-readme.md
// §7 — squashing later doesn't undo a leaked commit), so it draws its own,
// narrower disclosure line: exactly the repos already named in this repo's
// own README.md "The work" table, nothing pulled in automatically just
// because foundry's roster grows. Adding a repo here is a deliberate,
// reviewed edit — same bar as adding a row to that table.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const GH_OWNER = 'abhijitbansal';
const DISCLOSED_REPOS = [
  'cubby', 'doc-scan', 'floorprint', 'folix',
  'claude-skills', 'cartoon', 'memekit', 'sift',
  'foundry', 'design-system', 'cubby-site', 'paperix-site',
  'floorprint-site',
];
const EXCLUDED_LANGUAGES = new Set(['HTML', 'CSS']);

function parseArgs(argv) {
  const i = argv.indexOf('--stats');
  if (i === -1 || !argv[i + 1]) {
    throw new Error('usage: generate-telemetry.mjs --stats <path-to-stats.json>');
  }
  return { statsPath: argv[i + 1] };
}

// Ports foundry/src/lib/telemetry.ts's modelDisplayName() exactly — keep
// the two in sync by hand if that function's mapping ever changes.
function modelDisplayName(id) {
  const parts = id.replace(/^claude-/, '').split('-');
  const [family, ...rest] = parts;
  const version = rest.filter((p) => !/^\d{8}$/.test(p)).join('.');
  const label = family.charAt(0).toUpperCase() + family.slice(1);
  return version ? `${label} ${version}` : label;
}

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8', timeout: 30_000 });
}

function fetchLanguages() {
  const totals = new Map();
  for (const repo of DISCLOSED_REPOS) {
    let out;
    try {
      out = gh(['api', `repos/${GH_OWNER}/${repo}/languages`]);
    } catch {
      console.warn(`  ! languages: skipping ${repo} (gh api failed — repo may not exist or isn't accessible)`);
      continue;
    }
    const byLang = JSON.parse(out);
    for (const [lang, bytes] of Object.entries(byLang)) {
      if (EXCLUDED_LANGUAGES.has(lang)) continue;
      totals.set(lang, (totals.get(lang) || 0) + bytes);
    }
  }
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, bytes]) => ({ name, bytes }));
}

function fetchContributions() {
  const query = `query {
    viewer {
      contributionsCollection {
        contributionCalendar { totalContributions }
        restrictedContributionsCount
      }
    }
  }`;
  const out = gh(['api', 'graphql', '-f', `query=${query}`]);
  const data = JSON.parse(out).data.viewer.contributionsCollection;
  return {
    totalLastYear: data.contributionCalendar.totalContributions,
    privateShare: data.restrictedContributionsCount,
  };
}

function sumCounts(pairs) {
  return (pairs || []).reduce((s, [, c]) => s + c, 0);
}

function build(stats) {
  const t = stats.totals;
  const topToolsMap = new Map(stats.top_tools || []);

  const models = (stats.models || [])
    .filter(([id]) => id.startsWith('claude-'))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id, messages]) => ({ name: modelDisplayName(id), messages }));

  const disclosedSet = new Set(DISCLOSED_REPOS);
  for (const r of stats.repos || []) {
    if (r.lines_added > 0 && !disclosedSet.has(r.repo)) {
      console.warn(`  ! repo "${r.repo}" has ${r.lines_added} lines but isn't in DISCLOSED_REPOS — excluded from the public chart, review by hand if it should be added`);
    }
  }
  const repos = (stats.repos || [])
    .filter((r) => r.lines_added > 0 && disclosedSet.has(r.repo))
    .sort((a, b) => b.lines_added - a.lines_added)
    .map((r) => ({ name: r.repo, lines: r.lines_added, sessions: r.sessions }));

  const topTools = (stats.top_tools || [])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  console.log('fetching languages via gh api…');
  const languages = fetchLanguages();
  console.log('fetching contributions via gh graphql…');
  const contributions = fetchContributions();

  return {
    _note: 'Weekly-refreshed snapshot for the profile README, generated by scripts/generate-telemetry.mjs from foundry/data/stats.json (Claude Code session-log parse). Numbers are verbatim totals; the repo list mirrors the foundry site\'s public telemetry ledger, and repos with no authored lines are omitted from the per-repo chart. Regenerate: node scripts/generate-telemetry.mjs --stats <path> && node scripts/build.mjs',
    asOf: new Date().toLocaleDateString('en-CA'),
    dateMin: stats.meta.date_min,
    dateMax: stats.meta.date_max,
    totals: {
      linesAdded: t.lines_added,
      linesRemoved: t.lines_removed,
      sessions: t.sessions,
      filesWritten: t.files_written,
      filesEdited: t.files_edited,
      outTokens: t.out_tokens,
      inTokens: t.in_tokens,
      cacheReadTokens: t.cache_read_tokens,
      userMsgs: t.user_msgs,
      assistantMsgs: t.assistant_msgs,
      thinkingBlocks: t.thinking_blocks,
      logsParsed: stats.meta.files_found,
      subagentRuns: sumCounts(stats.top_agents),
      skillInvocations: sumCounts(stats.top_skills),
      webSearches: topToolsMap.get('WebSearch') || 0,
    },
    models,
    repos,
    topTools,
    dailyOutTokens: stats.daily_out_tokens || [],
    languages,
    contributions,
  };
}

function main() {
  const { statsPath } = parseArgs(process.argv.slice(2));
  const stats = JSON.parse(readFileSync(statsPath, 'utf8'));
  const telemetry = build(stats);
  const outPath = new URL('../data/telemetry.json', import.meta.url);
  writeFileSync(outPath, JSON.stringify(telemetry, null, 2) + '\n');
  console.log('wrote', outPath.pathname);
}

main();
