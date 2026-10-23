/* ===== Problems: shared definitions ===== */
const PCATS=[['hashing','Arrays & Hashing'],['twoptr','Two Pointers'],['window','Sliding Window'],['stack','Stack'],['bsearch','Binary Search'],['linked','Linked List'],['trees','Trees'],['heap','Heap / Priority Queue'],['backtrack','Backtracking'],['tries','Tries'],['graphs','Graphs'],['advgraphs','Advanced Graphs'],['dp1','1-D Dynamic Programming'],['dp2','2-D Dynamic Programming'],['greedy','Greedy'],['intervals','Intervals'],['math','Math & Geometry'],['bits','Bit Manipulation']];
const PROBS=[];
const P=o=>PROBS.push(o);
const JS_PQ=`// Small binary heap (LeetCode's JS runtime also offers MinPriorityQueue).
class Heap {
  constructor(cmp = (a, b) => a - b) { this.a = []; this.cmp = cmp; }   // cmp < 0: a pops first
  get size() { return this.a.length; }
  peek() { return this.a[0]; }
  push(x) {
    const a = this.a; a.push(x);
    for (let i = a.length - 1; i > 0;) {
      const p = (i - 1) >> 1;
      if (this.cmp(a[i], a[p]) >= 0) break;
      [a[i], a[p]] = [a[p], a[i]]; i = p;
    }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      for (let i = 0;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;
        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]]; i = m;
      }
    }
    return top;
  }
}

`;
