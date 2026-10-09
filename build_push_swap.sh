#!/bin/sh
# Compiles push_swap (C) to WebAssembly for the visualiser, then checks it sorts.
# Usage: ./build_push_swap.sh path/to/push_swap   (needs emcc: source ~/emsdk/emsdk_env.sh)
set -e
SRC=${1:?usage: $0 path/to/push_swap}
OUT=projects/push_swap

emcc -O2 -I"$SRC/libft/INCLUDES" \
  $(sed -n '/^SRCS =/,/^$/p' "$SRC/Makefile" | grep -o 'mandatory/[a-z_]*\.c' | sed "s|^|$SRC/|") \
  "$SRC"/libft/SRCS/*/*.c \
  -sMODULARIZE -sEXPORT_ES6 -sINVOKE_RUN=0 -sEXPORTED_RUNTIME_METHODS=callMain \
  -o "$OUT/push_swap.mjs"

node --input-type=module -e "
import createModule from './$OUT/push_swap.mjs';
import { apply, isSorted } from './$OUT/stacks.js';
for (const n of [3, 5, 100, 500]) {
  // Same path as visualiser.js: run with args, then build stack A from those same args.
  const args = [...Array(n * 10).keys()].map(k => String(k - n * 5)).sort(() => Math.random() - 0.5).slice(0, n);
  const out = [];
  const m = await createModule({ print: l => out.push(l) });
  try { m.callMain([...args]); } catch (e) { if (e?.name !== 'ExitStatus') throw e; }
  const sorted = args.map(Number).sort((x, y) => x - y);
  const a = args.map(v => sorted.indexOf(+v)), b = [];
  for (const op of out) if (!apply(op, a, b)) throw new Error('unknown op ' + op);
  if (!isSorted(a, b)) throw new Error('not sorted for n=' + n);
  console.log('n=' + n + ': ' + out.length + ' ops, sorted');
}"
