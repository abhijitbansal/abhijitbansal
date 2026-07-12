// build.mjs — generates the profile README's SVG panels from data/telemetry.json.
// Every panel is a self-contained dark "forge console" card (baked background)
// so it renders identically on light- and dark-theme GitHub profiles. Static by
// design: GitHub freezes animation in the README <img> context (verified).
//   run: node scripts/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets');
mkdirSync(OUT, { recursive: true });
const T = JSON.parse(readFileSync(join(ROOT, 'data', 'telemetry.json'), 'utf8'));

// ---- forge palette (from foundry brands.css, Paperix dark = the site's theme) ----
const C = {
  bg0: '#0F0C08', bg1: '#17120C', bg2: '#1E1810', panel: '#171009',
  line: '#2C2419', lineSoft: '#241D14',
  ember: '#E36A5E', emberDeep: '#C0503F', emberSoft: 'rgba(227,106,94,0.14)',
  gold: '#E6BF5A', goldDeep: '#C8901F',
  text: '#F3EDE1', text2: '#C4B9A7', text3: '#8B8072', faint: '#5F564A',
};
const MONO = "ui-monospace,'SF Mono',SFMono-Regular,Menlo,Consolas,monospace";
const SERIF = "Georgia,'Times New Roman',serif";
const W = 880; // content width; GitHub scales down responsively (img max-width:100%)

// ---- helpers ----
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmtFull = (n) => n.toLocaleString('en-US');
const fmtC = (n) => {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e5 ? 0 : 1) + 'K';
  return String(n);
};
const fmtBytes = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + ' MB' : (n / 1e3).toFixed(0) + ' KB');
const pct = (part, whole) => (100 * part) / whole;

// A heat ramp: cool warm-black -> ember -> gold (mirrors the site's heatmap legend).
function heat(t) {
  // t in [0,1]. two-stop lerp through ember to gold.
  const lerp = (a, b, u) => a.map((x, i) => Math.round(x + (b[i] - x) * u));
  const cool = [36, 29, 20], mid = [227, 106, 94], hot = [230, 191, 90];
  const rgb = t < 0.6 ? lerp(cool, mid, t / 0.6) : lerp(mid, hot, (t - 0.6) / 0.4);
  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
}

// panel frame: bg, border, corner survey-ticks, kicker label, sheet tag
function frame(w, h, kicker, sheet) {
  const tick = (x, y, fx, fy) => `
    <line x1="${x}" y1="${y}" x2="${x + 11 * fx}" y2="${y}" stroke="${C.emberDeep}" stroke-width="1" opacity="0.7"/>
    <line x1="${x}" y1="${y}" x2="${x}" y2="${y + 11 * fy}" stroke="${C.emberDeep}" stroke-width="1" opacity="0.7"/>`;
  const m = 13;
  return `
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="14" fill="${C.bg1}" stroke="${C.line}"/>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="14" fill="url(#emberGlow)"/>
  ${tick(m, m, 1, 1)}${tick(w - m, m, -1, 1)}${tick(m, h - m, 1, -1)}${tick(w - m, h - m, -1, -1)}
  ${kicker ? `<text x="30" y="34" font-family="${MONO}" font-size="11" letter-spacing="2.2" fill="${C.gold}" font-weight="600">${esc(kicker)}</text>` : ''}
  ${sheet ? `<text x="${w - 30}" y="34" text-anchor="end" font-family="${MONO}" font-size="9.5" letter-spacing="1.6" fill="${C.faint}">${esc(sheet)}</text>` : ''}`;
}

const defs = `
  <defs>
    <radialGradient id="emberGlow" cx="82%" cy="118%" r="70%">
      <stop offset="0%" stop-color="${C.ember}" stop-opacity="0.16"/>
      <stop offset="55%" stop-color="${C.goldDeep}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="${C.ember}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${C.ember}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${C.ember}" stop-opacity="0.02"/>
    </linearGradient>
    <linearGradient id="barEmber" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C.emberDeep}"/>
      <stop offset="100%" stop-color="${C.ember}"/>
    </linearGradient>
  </defs>`;

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">${defs}${body}</svg>\n`;
const write = (name, s) => { writeFileSync(join(OUT, name), s); console.log('  ✓', name); };

// ============================ HERO ============================
function hero() {
  const h = 250;
  const rings = [40, 92, 150, 210].map((r, i) =>
    `<circle cx="${W - 120}" cy="${h + 40}" r="${r}" fill="none" stroke="${i % 2 ? C.line : C.emberDeep}" stroke-width="1" opacity="${0.28 + i * 0.06}" ${i === 3 ? 'stroke-dasharray="2 13"' : ''}/>`
  ).join('');
  const body = `
    <rect width="${W}" height="${h}" rx="16" fill="${C.bg0}"/>
    <rect width="${W}" height="${h}" rx="16" fill="url(#emberGlow)"/>
    <g clip-path="inset(0 round 16px)">${rings}</g>
    <rect x="0.5" y="0.5" width="${W - 1}" height="${h - 1}" rx="16" fill="none" stroke="${C.line}"/>
    <!-- survey grid crosshairs -->
    <g opacity="0.8">
      <line x1="20" y1="20" x2="36" y2="20" stroke="${C.emberDeep}"/><line x1="20" y1="20" x2="20" y2="36" stroke="${C.emberDeep}"/>
      <line x1="${W - 20}" y1="20" x2="${W - 36}" y2="20" stroke="${C.emberDeep}"/><line x1="${W - 20}" y1="20" x2="${W - 20}" y2="36" stroke="${C.emberDeep}"/>
    </g>
    <text x="48" y="70" font-family="${MONO}" font-size="12" letter-spacing="4" fill="${C.gold}" font-weight="600">THE FOUNDRY · WORKING DRAWINGS</text>
    <text x="46" y="130" font-family="${SERIF}" font-size="52" fill="${C.text}" font-weight="700" letter-spacing="1">Abhijit Bansal</text>
    <text x="48" y="166" font-family="${SERIF}" font-size="21" font-style="italic" fill="${C.ember}">I build privacy-first apps &amp; AI agent tooling.</text>
    <text x="48" y="196" font-family="${MONO}" font-size="13" fill="${C.text2}">Designed, engineered &amp; shipped end to end — solo.</text>
    <line x1="48" y1="216" x2="${W - 48}" y2="216" stroke="${C.lineSoft}"/>
    <text x="48" y="234" font-family="${MONO}" font-size="10" letter-spacing="1.5" fill="${C.faint}">SHEET 1 OF 1 · NOT FOR CONSTRUCTION · LAST FORGED ${T.asOf.toUpperCase()}</text>
    <text x="${W - 48}" y="234" text-anchor="end" font-family="${MONO}" font-size="10" letter-spacing="1.5" fill="${C.faint}">iOS · SWIFT 6 · RUST · AI AGENTS</text>`;
  write('hero.svg', svg(W, h, body));
}

// ====================== STAT TILES ======================
function statTiles() {
  const h = 172;
  const tiles = [
    { big: fmtFull(T.totals.linesAdded), lab: 'Lines added', sub: `−${fmtFull(T.totals.linesRemoved)} removed · ${daySpan()} days` },
    { big: fmtFull(T.totals.sessions), lab: 'Claude Code sessions', sub: `${fmtC(T.totals.userMsgs)} prompts · ${fmtC(T.totals.assistantMsgs)} replies` },
    { big: fmtC(T.totals.outTokens), lab: 'Tokens written', sub: 'output, straight into the melt' },
    { big: fmtC(T.totals.cacheReadTokens), lab: 'Tokens cache-read', sub: 'the crucible remembers' },
  ];
  const colW = (W - 2 * 24) / 4;
  const cells = tiles.map((t, i) => {
    const x = 24 + i * colW;
    return `
      <line x1="${x}" y1="56" x2="${x + colW - 22}" y2="56" stroke="${C.ember}" stroke-width="2"/>
      <text x="${x}" y="104" font-family="${SERIF}" font-size="34" fill="${C.text}" font-weight="700">${esc(t.big)}</text>
      <text x="${x}" y="128" font-family="${MONO}" font-size="12" fill="${C.gold}" font-weight="600">${esc(t.lab)}</text>
      <text x="${x}" y="148" font-family="${MONO}" font-size="10.5" fill="${C.text3}">${esc(t.sub)}</text>`;
  }).join('');
  write('stats.svg', svg(W, h, frame(W, h, 'FORGE TELEMETRY · ALL-TIME', dateRange()) + cells));
}

// ====================== ACTIVITY AREA ======================
function activity() {
  const h = 250;
  const days = fillDays(T.dailyOutTokens);
  const max = Math.max(...days.map((d) => d.v));
  const padL = 30, padR = 30, padT = 66, padB = 42;
  const plotW = W - padL - padR, plotH = h - padT - padB;
  const x = (i) => padL + (i / (days.length - 1)) * plotW;
  const y = (v) => padT + plotH - (v / max) * plotH;
  let line = '', area = `M ${x(0)} ${padT + plotH}`;
  days.forEach((d, i) => { line += `${i ? 'L' : 'M'} ${x(i).toFixed(1)} ${y(d.v).toFixed(1)} `; area += ` L ${x(i).toFixed(1)} ${y(d.v).toFixed(1)}`; });
  area += ` L ${x(days.length - 1)} ${padT + plotH} Z`;
  // gridlines
  let grid = '';
  for (let g = 1; g <= 3; g++) { const gy = padT + (plotH / 3) * g; grid += `<line x1="${padL}" y1="${gy}" x2="${W - padR}" y2="${gy}" stroke="${C.lineSoft}"/>`; }
  // month ticks
  const months = {}; days.forEach((d, i) => { const m = d.date.slice(0, 7); if (!(m in months)) months[m] = i; });
  const mlabels = Object.entries(months).map(([m, i]) =>
    `<text x="${x(i)}" y="${h - 20}" font-family="${MONO}" font-size="10" fill="${C.text3}">${monthLbl(m)}</text>`).join('');
  const peak = days.reduce((a, d, i) => (d.v > a.v ? { v: d.v, i } : a), { v: 0, i: 0 });
  const px = x(peak.i), nearR = px > W - 130, nearL = px < 130;
  const anchor = nearR ? 'end' : nearL ? 'start' : 'middle';
  const lx = nearR ? W - padR : nearL ? padL : px;
  const body = frame(W, h, 'DAILY OUTPUT TOKENS · THE FORGE RUNS HOT', dateRange()) +
    grid +
    `<path d="${area}" fill="url(#areaFill)"/>` +
    `<path d="${line}" fill="none" stroke="${C.ember}" stroke-width="2" stroke-linejoin="round"/>` +
    `<circle cx="${px.toFixed(1)}" cy="${y(peak.v).toFixed(1)}" r="4" fill="${C.gold}"/>` +
    `<text x="${lx.toFixed(1)}" y="${(y(peak.v) - 12).toFixed(1)}" text-anchor="${anchor}" font-family="${MONO}" font-size="10.5" fill="${C.gold}" font-weight="600">${fmtC(peak.v)} peak</text>` +
    mlabels;
  write('activity.svg', svg(W, h, body));
}

// ====================== MODEL MIX ======================
function models() {
  const h = 200;
  const total = T.models.reduce((s, m) => s + m.messages, 0);
  const barX = 30, barW = W - 60, barY = 58, barH = 16;
  let acc = 0, segs = '';
  T.models.forEach((m, i) => {
    const w = (m.messages / total) * barW; const t = i / (T.models.length - 1);
    segs += `<rect x="${(barX + acc).toFixed(1)}" y="${barY}" width="${w.toFixed(1)}" height="${barH}" fill="${heat(1 - t)}"/>`;
    acc += w;
  });
  const legend = T.models.map((m, i) => {
    const col = i % 3, row = (i / 3) | 0;
    const lx = 30 + col * ((W - 60) / 3), ly = 108 + row * 34; const t = i / (T.models.length - 1);
    return `<rect x="${lx}" y="${ly - 9}" width="9" height="9" rx="2" fill="${heat(1 - t)}"/>
      <text x="${lx + 16}" y="${ly}" font-family="${MONO}" font-size="12" fill="${C.text2}">${esc(m.name)}</text>
      <text x="${lx + 16}" y="${ly + 15}" font-family="${MONO}" font-size="10.5" fill="${C.text3}">${pct(m.messages, total).toFixed(1)}% · ${fmtC(m.messages)} msgs</text>`;
  }).join('');
  const body = frame(W, h, 'MODEL MIX', `${fmtC(T.totals.assistantMsgs)} ASSISTANT MESSAGES`) +
    `<rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="4" fill="${C.bg2}"/>` +
    `<g clip-path="inset(0 round 4px)"><g>` +
    `<clipPath id="mm"><rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="4"/></clipPath>` +
    `<g clip-path="url(#mm)">${segs}</g></g></g>` + legend;
  write('models.svg', svg(W, h, body));
}

// ====================== TOP TOOLS ======================
function tools() {
  const h = 200;
  const max = Math.max(...T.topTools.map((t) => t.count));
  const rowY = 58, rowH = 22, barX = 150, barMaxW = W - barX - 90;
  const rows = T.topTools.map((t, i) => {
    const y = rowY + i * rowH; const w = (t.count / max) * barMaxW;
    return `<text x="30" y="${y + 11}" font-family="${MONO}" font-size="12" fill="${C.text2}">${esc(t.name)}</text>
      <rect x="${barX}" y="${y + 3}" width="${barMaxW}" height="8" rx="4" fill="${C.bg2}"/>
      <rect x="${barX}" y="${y + 3}" width="${w.toFixed(1)}" height="8" rx="4" fill="url(#barEmber)"/>
      <text x="${W - 30}" y="${y + 11}" text-anchor="end" font-family="${MONO}" font-size="11" fill="${C.gold}">${fmtC(t.count)}</text>`;
  }).join('');
  write('tools.svg', svg(W, h, frame(W, h, 'TOP TOOLS', 'BY CALL COUNT') + rows));
}

// ====================== PER-REPO ======================
function repos() {
  const h = 66 + T.repos.length * 30 + 20;
  const max = Math.max(...T.repos.map((r) => r.lines));
  const rowY = 60, rowH = 30, barX = 150, barMaxW = W - barX - 150;
  const rows = T.repos.map((r, i) => {
    const y = rowY + i * rowH; const w = (r.lines / max) * barMaxW;
    return `<text x="30" y="${y + 13}" font-family="${MONO}" font-size="12" fill="${C.text}" font-weight="600">${esc(r.name)}</text>
      <rect x="${barX}" y="${y + 4}" width="${barMaxW}" height="10" rx="5" fill="${C.bg2}"/>
      <rect x="${barX}" y="${y + 4}" width="${w.toFixed(1)}" height="10" rx="5" fill="url(#barEmber)"/>
      <text x="${barX + w + 10}" y="${y + 13}" font-family="${MONO}" font-size="11" fill="${C.gold}">${fmtC(r.lines)}</text>
      <text x="${W - 30}" y="${y + 13}" text-anchor="end" font-family="${MONO}" font-size="10.5" fill="${C.text3}">${fmtC(r.sessions)} sess</text>`;
  }).join('');
  const body = frame(W, h, 'THE WORKS · LINES ADDED PER REPO', `${T.repos.length} REPOS`) + rows +
    `<text x="30" y="${h - 16}" font-family="${MONO}" font-size="10" fill="${C.faint}">bar = lines added · public + private · matches the foundry site ledger</text>`;
  write('repos.svg', svg(W, h, body));
}

// ====================== LANGUAGES ======================
function languages() {
  const h = 66 + T.languages.length * 26 + 22;
  const total = T.languages.reduce((s, l) => s + l.bytes, 0);
  const rowY = 58, rowH = 26, barX = 130, barMaxW = W - barX - 120;
  const rows = T.languages.map((l, i) => {
    const y = rowY + i * rowH; const p = pct(l.bytes, total); const w = (l.bytes / T.languages[0].bytes) * barMaxW;
    return `<text x="30" y="${y + 12}" font-family="${MONO}" font-size="12" fill="${C.text2}">${esc(l.name)}</text>
      <rect x="${barX}" y="${y + 3}" width="${barMaxW}" height="9" rx="4.5" fill="${C.bg2}"/>
      <rect x="${barX}" y="${y + 3}" width="${w.toFixed(1)}" height="9" rx="4.5" fill="${heat(1 - i / T.languages.length)}"/>
      <text x="${W - 30}" y="${y + 12}" text-anchor="end" font-family="${MONO}" font-size="11" fill="${C.gold}">${p.toFixed(1)}%</text>`;
  }).join('');
  const body = frame(W, h, 'SOURCE LANGUAGES · PUBLIC + PRIVATE', 'BY BYTES') + rows +
    `<text x="30" y="${h - 16}" font-family="${MONO}" font-size="10" fill="${C.faint}">hand-written source · generated markup (HTML/CSS) excluded · via gh api</text>`;
  write('languages.svg', svg(W, h, body));
}

// ====================== EXPERTISE TRIPTYCH ======================
function expertise() {
  const h = 210;
  const cols = [
    { n: '01', t: 'iOS & Apple platforms', b: ['Swift 6, SwiftUI, SwiftData,', 'Vision, RoomPlan, on-device ML.', 'Privacy-first, zero-backend —', 'apps that never phone home.'], tech: 'Swift 6 · SwiftUI · Vision · RoomPlan' },
    { n: '02', t: 'AI agent tooling', b: ['Claude Code skills & plugins,', 'MCP servers, token optimization,', 'multi-agent orchestration.', 'Agents cheaper, sharper, faster.'], tech: 'Claude Code · MCP · Rust · Python' },
    { n: '03', t: 'Full-stack product craft', b: ['Rust CLIs, design systems,', 'App Store releases — shipped solo.', 'The whole stack,', 'one pair of hands.'], tech: 'Rust · TypeScript · Design tokens' },
  ];
  const colW = (W - 60) / 3;
  const cells = cols.map((c, i) => {
    const x = 30 + i * colW;
    const div = i > 0 ? `<line x1="${x - 1}" y1="56" x2="${x - 1}" y2="${h - 24}" stroke="${C.lineSoft}"/>` : '';
    const lines = c.b.map((ln, j) => `<text x="${x}" y="${118 + j * 17}" font-family="${MONO}" font-size="11" fill="${C.text2}">${esc(ln)}</text>`).join('');
    return `${div}
      <text x="${x}" y="70" font-family="${MONO}" font-size="11" fill="${C.faint}">/ ${c.n}</text>
      <line x1="${x}" y1="80" x2="${x + 34}" y2="80" stroke="${C.ember}" stroke-width="2"/>
      <text x="${x}" y="102" font-family="${SERIF}" font-size="17" fill="${C.text}" font-weight="700">${esc(c.t)}</text>
      ${lines}
      <text x="${x}" y="${h - 30}" font-family="${MONO}" font-size="9.5" letter-spacing="0.4" fill="${C.gold}">${esc(c.tech)}</text>`;
  }).join('');
  write('expertise.svg', svg(W, h, frame(W, h, 'THREE DISCIPLINES, ONE BENCH', null) + cells));
}

// ---- date utils ----
function daySpan() { return Math.round((Date.parse(T.dateMax) - Date.parse(T.dateMin)) / 864e5) + 1; }
function dateRange() { return `${monthLbl(T.dateMin.slice(0, 7))} ${+T.dateMin.slice(8)} – ${monthLbl(T.dateMax.slice(0, 7))} ${+T.dateMax.slice(8)}`.toUpperCase(); }
function monthLbl(ym) { const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return M[+ym.slice(5) - 1]; }
function fillDays(pairs) {
  const map = new Map(pairs); const out = []; const start = Date.parse(T.dateMin), end = Date.parse(T.dateMax);
  for (let t = start; t <= end; t += 864e5) { const d = new Date(t).toISOString().slice(0, 10); out.push({ date: d, v: map.get(d) || 0 }); }
  return out;
}

// ---- run ----
console.log('forging panels…');
hero(); statTiles(); activity(); models(); tools(); repos(); languages(); expertise();
console.log('done →', OUT);
