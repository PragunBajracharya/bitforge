/* ===== Problem runner: test cases for JavaScript (Web Worker) and Python (Pyodide) ===== */
/* Shared JS harness. It is serialized into a worker, and also used by the build-time test generator. */
function RUNNER_CORE() {
  class ListNode { constructor(val = 0, next = null) { this.val = val; this.next = next; } }
  class TreeNode { constructor(val = 0, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
  class Node { constructor(val = 0, a = null, b = null) { this.val = val; if (Array.isArray(a)) { this.neighbors = a; this.next = null; } else { this.neighbors = []; this.next = a; } this.random = b; } }
  self.ListNode = ListNode; self.TreeNode = TreeNode; self.Node = Node;
  const mkList = a => { const d = new ListNode(); let t = d; for (const v of a) { t.next = new ListNode(v); t = t.next; } return d.next; };
  const unList = h => { const o = []; while (h && o.length < 10000) { o.push(h.val); h = h.next; } return o; };
  const mkTree = a => {
    if (!a.length || a[0] === null) return null;
    const root = new TreeNode(a[0]), q = [root]; let i = 1;
    while (q.length && i < a.length) { const n = q.shift(); if (i < a.length && a[i] !== null) { n.left = new TreeNode(a[i]); q.push(n.left); } i++; if (i < a.length && a[i] !== null) { n.right = new TreeNode(a[i]); q.push(n.right); } i++; }
    return root;
  };
  const unTree = r => { const o = [], q = [r]; while (q.length) { const n = q.shift(); if (n) { o.push(n.val); q.push(n.left, n.right); } else o.push(null); } while (o.length && o[o.length - 1] === null) o.pop(); return o; };
  const find = (r, v) => { if (!r) return null; if (r.val === v) return r; return find(r.left, v) || find(r.right, v); };
  const mkCycle = ([vals, pos]) => { const h = mkList(vals); if (pos >= 0) { let t = h, k = null, i = 0; while (t.next) { if (i === pos) k = t; t = t.next; i++; } if (i === pos) k = t; t.next = k; } return h; };
  const mkRand = a => { const ns = a.map(([v]) => new Node(v)); ns.forEach((n, i) => { n.next = ns[i + 1] || null; n.random = a[i][1] === null ? null : ns[a[i][1]]; }); return ns[0] || null; };
  const unRand = h => { const ns = []; for (let n = h; n && ns.length < 10000; n = n.next) ns.push(n); return ns.map(n => [n.val, n.random ? ns.indexOf(n.random) : null]); };
  const mkGraph = adj => { if (!adj.length) return null; const ns = adj.map((_, i) => new Node(i + 1)); adj.forEach((nb, i) => { ns[i].neighbors = nb.map(j => ns[j - 1]); }); return ns[0]; };
  const unGraph = n => { if (!n) return []; const seen = new Map(), q = [n]; seen.set(n.val, n); while (q.length) { const x = q.shift(); for (const y of x.neighbors) if (!seen.has(y.val)) { seen.set(y.val, y); q.push(y); } } const vals = [...seen.keys()].sort((a, b) => a - b); return vals.map(v => seen.get(v).neighbors.map(y => y.val)); };
  const conv = (v, t, args) => t === 'list' ? mkList(v) : t === 'tree' ? mkTree(v) : t === 'lists' ? v.map(mkList) : t === 'cycle' ? mkCycle(v) : t === 'randlist' ? mkRand(v) : t === 'graph' ? mkGraph(v) : t === 'treenode' ? find(args[0], v) : v;
  const back = (v, t) => t === 'list' ? unList(v) : t === 'tree' ? unTree(v) : t === 'treeval' ? (v ? v.val : null) : t === 'randlist' ? unRand(v) : t === 'graph' ? unGraph(v) : v;
  const clone = x => JSON.parse(JSON.stringify(x));
  self.bfRunJS = function (code, spec) {
    let get;
    try { get = new Function(code + '\n;return (n) => { try { return eval(n); } catch (e) { return undefined; } };')(); }
    catch (e) { return { compile: String(e) }; }
    const out = [];
    if (spec.design) {
      for (const [ops, args] of spec.design) {
        try {
          const K = get(ops[0]); if (typeof K !== 'function') throw new Error('class ' + ops[0] + ' not found');
          const obj = new K(...clone(args[0])), res = [null];
          for (let i = 1; i < ops.length; i++) { const r = obj[ops[i]](...clone(args[i])); res.push(r === undefined ? null : r); }
          out.push({ ok: true, v: res });
        } catch (e) { out.push({ ok: false, err: String(e && e.message || e) }); }
      }
      return { results: out };
    }
    if (spec.custom) {
      const C = get('Codec');
      const inst = typeof C === 'function' ? new C() : null;
      const f = n => inst && inst[n] ? inst[n].bind(inst) : get(n);
      for (const input of spec.cases) {
        try {
          let r;
          if (spec.custom === 'codec') r = f('decode')(f('encode')(clone(input)));
          else r = unTree(f('deserialize')(f('serialize')(mkTree(input))));
          out.push({ ok: true, v: r });
        } catch (e) { out.push({ ok: false, err: String(e && e.message || e) }); }
      }
      return { results: out };
    }
    const fn = get(spec.fn);
    if (typeof fn !== 'function') return { compile: 'function ' + spec.fn + ' not found' };
    for (const c of spec.cases) {
      try {
        const raw = clone(c), args = [];
        raw.forEach((v, i) => args.push(conv(v, (spec.at || [])[i], args)));
        let r = fn(...args);
        if (spec.inplace !== undefined) r = args[spec.inplace];
        out.push({ ok: true, v: back(r === undefined ? null : r, spec.rt) });
      } catch (e) { out.push({ ok: false, err: String(e && e.message || e) }); }
    }
    return { results: out };
  };
}

const PY_PRELUDE = String.raw`
import json, math, heapq, bisect, collections, itertools, functools, string, re, sys
from typing import *
from collections import *
from heapq import *
sys.setrecursionlimit(10000)
class ListNode:
    def __init__(self, val=0, next=None): self.val, self.next = val, next
class TreeNode:
    def __init__(self, val=0, left=None, right=None): self.val, self.left, self.right = val, left, right
class Node:
    def __init__(self, val=0, a=None, b=None):
        self.val = val
        if isinstance(a, list): self.neighbors, self.next = a, None
        else: self.neighbors, self.next = [], a
        self.random = b
def _mklist(a):
    d = t = ListNode()
    for v in a: t.next = ListNode(v); t = t.next
    return d.next
def _unlist(h):
    o = []
    while h and len(o) < 10000: o.append(h.val); h = h.next
    return o
def _mktree(a):
    if not a or a[0] is None: return None
    root = TreeNode(a[0]); q = deque([root]); i = 1
    while q and i < len(a):
        n = q.popleft()
        if i < len(a) and a[i] is not None: n.left = TreeNode(a[i]); q.append(n.left)
        i += 1
        if i < len(a) and a[i] is not None: n.right = TreeNode(a[i]); q.append(n.right)
        i += 1
    return root
def _untree(r):
    o, q = [], deque([r])
    while q:
        n = q.popleft()
        if n: o.append(n.val); q.append(n.left); q.append(n.right)
        else: o.append(None)
    while o and o[-1] is None: o.pop()
    return o
def _find(r, v):
    if not r: return None
    if r.val == v: return r
    return _find(r.left, v) or _find(r.right, v)
def _mkcycle(x):
    vals, pos = x; h = _mklist(vals)
    if pos >= 0:
        t, k, i = h, None, 0
        while t.next:
            if i == pos: k = t
            t = t.next; i += 1
        if i == pos: k = t
        t.next = k
    return h
def _mkrand(a):
    ns = [Node(v) for v, _ in a]
    for i, n in enumerate(ns):
        n.next = ns[i + 1] if i + 1 < len(ns) else None
        n.random = None if a[i][1] is None else ns[a[i][1]]
    return ns[0] if ns else None
def _unrand(h):
    ns = []
    while h and len(ns) < 10000: ns.append(h); h = h.next
    idx = {id(n): i for i, n in enumerate(ns)}
    return [[n.val, idx[id(n.random)] if n.random else None] for n in ns]
def _mkgraph(adj):
    if not adj: return None
    ns = [Node(i + 1) for i in range(len(adj))]
    for i, nb in enumerate(adj): ns[i].neighbors = [ns[j - 1] for j in nb]
    return ns[0]
def _ungraph(n):
    if not n: return []
    seen = {n.val: n}; q = deque([n])
    while q:
        x = q.popleft()
        for y in x.neighbors:
            if y.val not in seen: seen[y.val] = y; q.append(y)
    return [[y.val for y in seen[v].neighbors] for v in sorted(seen)]
def _conv(v, t, args):
    return {'list': _mklist, 'tree': _mktree, 'lists': lambda x: [_mklist(y) for y in x], 'cycle': _mkcycle, 'randlist': _mkrand, 'graph': _mkgraph}.get(t, lambda x: x)(v) if t != 'treenode' else _find(args[0], v)
def _back(v, t):
    if t == 'list': return _unlist(v)
    if t == 'tree': return _untree(v)
    if t == 'treeval': return v.val if v else None
    if t == 'randlist': return _unrand(v)
    if t == 'graph': return _ungraph(v)
    return v
def _bf_run(code, spec_json):
    import copy
    spec = json.loads(spec_json)
    ns = {k: v for k, v in globals().items() if not k.startswith('_bf')}
    try: exec(code, ns)
    except Exception as e: return json.dumps({'compile': repr(e)})
    out = []
    def call_method(name):
        if 'Solution' in ns:
            s = ns['Solution']()
            if hasattr(s, name): return getattr(s, name)
        if name in ns: return ns[name]
        raise NameError('method ' + name + ' not found')
    if spec.get('design'):
        for ops, args in spec['design']:
            try:
                obj = ns[ops[0]](*copy.deepcopy(args[0])); res = [None]
                for op, a in zip(ops[1:], args[1:]): res.append(getattr(obj, op)(*copy.deepcopy(a)))
                out.append({'ok': True, 'v': res})
            except Exception as e: out.append({'ok': False, 'err': repr(e)})
        return json.dumps({'results': out})
    if spec.get('custom'):
        for inp in spec['cases']:
            try:
                c = ns['Codec']()
                if spec['custom'] == 'codec': r = c.decode(c.encode(copy.deepcopy(inp)))
                else: r = _untree(c.deserialize(c.serialize(_mktree(inp))))
                out.append({'ok': True, 'v': r})
            except Exception as e: out.append({'ok': False, 'err': repr(e)})
        return json.dumps({'results': out})
    for case in spec['cases']:
        try:
            raw = copy.deepcopy(case); args = []
            for i, v in enumerate(raw): args.append(_conv(v, (spec.get('at') or [None] * 99)[i], args))
            r = call_method(spec['fn'])(*args)
            if spec.get('inplace') is not None: r = args[spec['inplace']]
            out.append({'ok': True, 'v': _back(r, spec.get('rt'))})
        except Exception as e: out.append({'ok': False, 'err': repr(e)})
    return json.dumps({'results': out})
`;

/* compare a result with the expected value using the test's comparison mode */
function bfNorm(v, cmp) {
  if (!Array.isArray(v)) return v;
  if (cmp === 'sortinner') v = v.map(x => Array.isArray(x) ? [...x].sort((a, b) => JSON.stringify(a) < JSON.stringify(b) ? -1 : JSON.stringify(a) > JSON.stringify(b) ? 1 : 0) : x);
  if (cmp === 'sorted' || cmp === 'sortinner') v = [...v].sort((a, b) => { const x = JSON.stringify(a), y = JSON.stringify(b); return x < y ? -1 : x > y ? 1 : 0; });
  return v;
}
function bfSame(got, exp, cmp) {
  if (cmp === 'float') return typeof got === 'number' && Math.abs(got - exp) < 1e-5;
  const fl = x => Array.isArray(x) ? x.map(fl) : (typeof x === 'number' && !Number.isInteger(x) ? Math.round(x * 1e6) / 1e6 : x);
  return JSON.stringify(fl(bfNorm(got, cmp))) === JSON.stringify(fl(bfNorm(exp, cmp)));
}
/* turn a problem's test into [spec sent to the runner, expected values, labels] */
function bfSpec(t) {
  if (t.design) return [{ design: t.seqs.map(s => [s[0], s[1]]) }, t.seqs.map(s => s[2]), t.seqs.map(s => s[0].slice(1).map((op, i) => op + '(' + s[1][i + 1].map(a => JSON.stringify(a)).join(', ') + ')').join(' · '))];
  if (t.custom) return [{ custom: t.custom, cases: t.cases }, t.cases, t.cases.map(c => (t.custom === 'codec' ? 'decode(encode(' : 'deserialize(serialize(') + JSON.stringify(c) + '))')];
  return [{ fn: t.fn, at: t.at, rt: t.rt, inplace: t.inplace, cases: t.cases.map(c => c[0]) }, t.cases.map(c => c[1]), t.cases.map(c => t.fn + '(' + c[0].map(a => JSON.stringify(a)).join(', ') + ')')];
}
