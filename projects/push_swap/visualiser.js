import createModule from './push_swap.mjs';
import { apply, isSorted } from './stacks.js';

const $ = id => document.getElementById(id);
const canvas = $('canvas');
const ctx = canvas.getContext('2d');

let ops = [], a = [], b = [], n = 0, i = 0, playing = false, acc = 0;

// Runs the real push_swap (C → WASM). A fresh instance per run resets C globals and heap.
async function pushSwap(args) {
  const out = [], err = [];
  const m = await createModule({ print: l => out.push(l), printErr: l => err.push(l) });
  // callMain unshifts argv[0] into the array it's given, so pass a copy.
  try { m.callMain([...args]); } catch (e) { if (e?.name !== 'ExitStatus') throw e; }
  return { out, err };
}

function draw() {
  const dpr = devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  const half = w / 2, row = h / Math.max(n, 1);
  for (const [stack, x0] of [[a, 0], [b, half]]) {
    stack.forEach((v, y) => {
      ctx.fillStyle = `hsl(${(v / n) * 300}, 70%, 55%)`;
      ctx.fillRect(x0, y * row, ((v + 1) / n) * (half - 4), Math.max(row - (row > 3 ? 1 : 0), 1));
    });
  }
  ctx.fillStyle = getComputedStyle(document.body).color;
  ctx.fillRect(half - 1, 0, 1, h);
  $('count').textContent = `${i} / ${ops.length} ops`;
  $('status').textContent = i < ops.length ? '' : isSorted(a, b) ? '✓ sorted' : '✗ not sorted';
}

function tick() {
  if (!playing) return;
  acc += 2 ** $('speed').value / 8;
  while (acc >= 1 && i < ops.length) { apply(ops[i++], a, b); acc--; }
  draw();
  if (i < ops.length) requestAnimationFrame(tick);
  else setPlaying(false);
}

function setPlaying(p) {
  playing = p;
  $('play').textContent = p ? 'Pause' : 'Play';
  if (p) { acc = 0; requestAnimationFrame(tick); }
}

async function run() {
  setPlaying(false);
  const args = $('input').value.trim().split(/\s+/).filter(Boolean);
  const { out, err } = await pushSwap(args);
  if (err.some(l => l.includes('Error'))) {
    ops = []; a = []; b = []; n = 0; i = 0;
    draw();
    $('status').textContent = 'Error (invalid input)';
    return;
  }
  // Rank-normalise so bar widths and colours don't depend on the raw values.
  const nums = args.map(Number);
  const sorted = [...nums].sort((x, y) => x - y);
  a = nums.map(v => sorted.indexOf(v));
  b = []; n = a.length; i = 0;
  ops = out.filter(Boolean);
  draw();
  setPlaying(true);
}

function random(count) {
  const pool = Array.from({ length: count * 10 }, (_, k) => k - count * 5);
  for (let k = pool.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [pool[k], pool[j]] = [pool[j], pool[k]];
  }
  $('input').value = pool.slice(0, count).join(' ');
  run();
}

$('run').onclick = run;
$('input').onkeydown = e => e.key === 'Enter' && run();
$('play').onclick = () => setPlaying(!playing && i < ops.length);
$('step').onclick = () => { setPlaying(false); if (i < ops.length) apply(ops[i++], a, b); draw(); };
document.querySelectorAll('[data-n]').forEach(btn => btn.onclick = () => random(+btn.dataset.n));
addEventListener('resize', draw);
random(100);
