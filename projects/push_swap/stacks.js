// Applies one push_swap op to stacks a and b (index 0 = top). Returns false on unknown op.
export function apply(op, a, b) {
  const swap = s => s.length > 1 && ([s[0], s[1]] = [s[1], s[0]]);
  const rot = s => s.length > 1 && s.push(s.shift());
  const rrot = s => s.length > 1 && s.unshift(s.pop());
  switch (op) {
    case 'sa': swap(a); break;
    case 'sb': swap(b); break;
    case 'ss': swap(a); swap(b); break;
    case 'pa': b.length && a.unshift(b.shift()); break;
    case 'pb': a.length && b.unshift(a.shift()); break;
    case 'ra': rot(a); break;
    case 'rb': rot(b); break;
    case 'rr': rot(a); rot(b); break;
    case 'rra': rrot(a); break;
    case 'rrb': rrot(b); break;
    case 'rrr': rrot(a); rrot(b); break;
    default: return false;
  }
  return true;
}

export const isSorted = (a, b) => b.length === 0 && a.every((v, i) => i === 0 || a[i - 1] < v);
