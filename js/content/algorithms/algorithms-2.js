/* ===== Library part B: graphs and trees ===== */
const JS_HEAP=`class MinHeap {                 // minimal binary heap of [priority, value] pairs
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(x) {
    const a = this.a; a.push(x);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p][0] <= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]]; i = p;
    }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      for (let i = 0;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]]; i = m;
      }
    }
    return top;
  }
}`;
Object.assign(ALGOS,{

dijkstra:{name:'Dijkstra’s shortest paths',cat:'graphs',
 blurb:'Find the shortest distance from one source to every vertex when edge weights are non-negative, always expanding the closest unfinished vertex next.',
 cx:[['Time','O((V + E) log V)','With a binary heap'],['Extra space','O(V + E)','Distances plus heap entries'],['Edge weights','Must be ≥ 0','Use Bellman–Ford if negatives exist'],['Unweighted graph','Use BFS','O(V + E), no heap needed']],
 pts:['Greedy: the vertex popped with the smallest tentative distance can never get shorter later (all weights ≥ 0).','“Relax” an edge u → v: if dist[u] + w beats dist[v], update it and push the new value.','Instead of decrease-key, push duplicates and skip stale entries when popped.','NeetCode examples: Network Delay Time, Swim in Rising Water, Path with Minimum Effort.'],
 pseudo:['procedure dijkstra(G, src)','  dist[·] ← ∞; dist[src] ← 0; pq ← {(0, src)}','  while pq not empty','    (d, u) ← pq.popMin()','    if d > dist[u]: continue   // outdated entry','    for each edge u → v with weight w','      if d + w < dist[v]','        dist[v] ← d + w; pq.push((dist[v], v))','  return dist'],
 trace:[[1,'Edges: 0→1 (4), 0→2 (1), 1→3 (1), 2→1 (2), 2→3 (5). Source 0.'],[7,'Pop 0 (d = 0). Relax: dist[1] = 4, dist[2] = 1.'],[7,'Pop 2 (d = 1, the closest). Relax 2→1: 1 + 2 = 3 < 4, so dist[1] = 3. 2→3: dist[3] = 6.'],[7,'Pop 1 (d = 3). Relax 1→3: 3 + 1 = 4 < 6, so dist[3] = 4.'],[4,'Pop the stale (4, 1) entry: 4 > dist[1] = 3, skip it.'],[8,'Pop 3 (d = 4). Final distances: [0, 3, 1, 4].']],
 q:{q:'Why does Dijkstra fail with negative edge weights?',o:['The heap overflows','A vertex already finalized could later be reached more cheaply','It runs forever','It only works on trees'],a:1,why:'The greedy step assumes no later path can be shorter, which a negative edge breaks.'},
 code:{
python:`import heapq

def dijkstra(graph, src):
    """graph[u] = list of (v, weight) pairs; weights must be >= 0."""
    dist = [float("inf")] * len(graph)
    dist[src] = 0
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue                       # stale entry
        for v, w in graph[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(pq, (dist[v], v))
    return dist

graph = [[(1, 4), (2, 1)], [(3, 1)], [(1, 2), (3, 5)], []]
print(dijkstra(graph, 0))   # [0, 3, 1, 4]`,
javascript:JS_HEAP+`

function dijkstra(graph, src) {
  const dist = new Array(graph.length).fill(Infinity);
  dist[src] = 0;
  const pq = new MinHeap();
  pq.push([0, src]);
  while (pq.size) {
    const [d, u] = pq.pop();
    if (d > dist[u]) continue;                     // stale entry
    for (const [v, w] of graph[u]) {
      if (d + w < dist[v]) { dist[v] = d + w; pq.push([dist[v], v]); }
    }
  }
  return dist;
}

const graph = [[[1, 4], [2, 1]], [[3, 1]], [[1, 2], [3, 5]], []];
console.log(dijkstra(graph, 0)); // [0, 3, 1, 4]`,
java:`import java.util.*;

public class Dijkstra {
    static long[] dijkstra(List<List<int[]>> graph, int src) {
        long[] dist = new long[graph.size()];
        Arrays.fill(dist, Long.MAX_VALUE);
        dist[src] = 0;
        PriorityQueue<long[]> pq = new PriorityQueue<>(Comparator.comparingLong(x -> x[0]));
        pq.add(new long[]{0, src});
        while (!pq.isEmpty()) {
            long[] top = pq.poll();
            long d = top[0];
            int u = (int) top[1];
            if (d > dist[u]) continue;                 // stale entry
            for (int[] e : graph.get(u)) {
                int v = e[0], w = e[1];
                if (d + w < dist[v]) { dist[v] = d + w; pq.add(new long[]{dist[v], v}); }
            }
        }
        return dist;
    }

    public static void main(String[] args) {
        List<List<int[]>> g = List.of(
            List.of(new int[]{1, 4}, new int[]{2, 1}), List.of(new int[]{3, 1}),
            List.of(new int[]{1, 2}, new int[]{3, 5}), List.of());
        System.out.println(Arrays.toString(dijkstra(g, 0))); // [0, 3, 1, 4]
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <queue>
#include <climits>

using Graph = std::vector<std::vector<std::pair<int, int>>>;   // (neighbor, weight)

std::vector<long long> dijkstra(const Graph& g, int src) {
    std::vector<long long> dist(g.size(), LLONG_MAX);
    using Item = std::pair<long long, int>;
    std::priority_queue<Item, std::vector<Item>, std::greater<Item>> pq;
    dist[src] = 0;
    pq.push({0, src});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;                 // stale entry
        for (auto [v, w] : g[u])
            if (d + w < dist[v]) { dist[v] = d + w; pq.push({dist[v], v}); }
    }
    return dist;
}

int main() {
    Graph g = {{{1, 4}, {2, 1}}, {{3, 1}}, {{1, 2}, {3, 5}}, {}};
    for (auto d : dijkstra(g, 0)) std::cout << d << ' ';   // 0 3 1 4
}`}},

topo:{name:'Topological sort (Kahn)',cat:'graphs',
 blurb:'Order the vertices of a directed acyclic graph so every edge points forward, by repeatedly taking a vertex with no remaining prerequisites.',
 cx:[['Time','O(V + E)','Each vertex and edge handled once'],['Extra space','O(V + E)','Adjacency list and in-degrees'],['Cycle detection','Free','If fewer than V vertices come out, there is a cycle'],['Alternative','DFS post-order','Reverse of finishing order']],
 pts:['In-degree = number of unmet prerequisites. Start with every vertex whose in-degree is 0.','Removing a vertex decrements its neighbors; any that hit 0 become available.','Many valid orders can exist; a min-heap instead of a queue gives the lexicographically smallest.','NeetCode examples: Course Schedule I and II, Alien Dictionary.'],
 pseudo:['procedure topoSort(V, edges)','  indeg[v] ← number of edges into v','  queue ← all v with indeg[v] = 0','  while queue not empty','    u ← queue.popFront(); append u to order','    for each edge u → v','      indeg[v] ← indeg[v] − 1','      if indeg[v] = 0: queue.push(v)','  return order if |order| = V else "cycle"'],
 trace:[[1,'Edges 5→2, 5→0, 4→0, 4→1, 2→3, 3→1. In-degrees: 0:2, 1:2, 2:1, 3:1, 4:0, 5:0.'],[2,'Queue starts as [4, 5].'],[7,'Take 4: 0 and 1 drop to 1. Take 5: 2 drops to 0 (enqueue), 0 drops to 0 (enqueue).'],[7,'Take 2: 3 drops to 0. Take 0: no outgoing edges. Take 3: 1 drops to 0.'],[8,'Take 1. Order: [4, 5, 2, 0, 3, 1], all 6 vertices, so no cycle.']],
 q:{q:'Kahn’s algorithm outputs only 4 of 6 vertices. What does that mean?',o:['Two vertices are isolated','The graph contains a cycle','The queue was too small','The graph is undirected'],a:1,why:'Vertices on a cycle always keep in-degree ≥ 1, so they never enter the queue.'},
 code:{
python:`from collections import deque

def topo_sort(n, edges):
    """edges: (u, v) means u must come before v. Returns an order, or [] on a cycle."""
    graph = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v in edges:
        graph[u].append(v)
        indeg[v] += 1
    queue = deque(i for i in range(n) if indeg[i] == 0)
    order = []
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in graph[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                queue.append(v)
    return order if len(order) == n else []

print(topo_sort(6, [(5, 2), (5, 0), (4, 0), (4, 1), (2, 3), (3, 1)]))   # [4, 5, 2, 0, 3, 1]`,
javascript:`function topoSort(n, edges) {
  const graph = Array.from({ length: n }, () => []), indeg = new Array(n).fill(0);
  for (const [u, v] of edges) { graph[u].push(v); indeg[v]++; }
  const queue = [], order = [];
  for (let i = 0; i < n; i++) if (indeg[i] === 0) queue.push(i);
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head];
    order.push(u);
    for (const v of graph[u]) if (--indeg[v] === 0) queue.push(v);
  }
  return order.length === n ? order : [];
}

console.log(topoSort(6, [[5, 2], [5, 0], [4, 0], [4, 1], [2, 3], [3, 1]])); // [4, 5, 2, 0, 3, 1]`,
java:`import java.util.*;

public class TopoSort {
    static List<Integer> topoSort(int n, int[][] edges) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
        int[] indeg = new int[n];
        for (int[] e : edges) { graph.get(e[0]).add(e[1]); indeg[e[1]]++; }
        Deque<Integer> queue = new ArrayDeque<>();
        for (int i = 0; i < n; i++) if (indeg[i] == 0) queue.add(i);
        List<Integer> order = new ArrayList<>();
        while (!queue.isEmpty()) {
            int u = queue.poll();
            order.add(u);
            for (int v : graph.get(u)) if (--indeg[v] == 0) queue.add(v);
        }
        return order.size() == n ? order : List.of();
    }

    public static void main(String[] args) {
        int[][] edges = {{5, 2}, {5, 0}, {4, 0}, {4, 1}, {2, 3}, {3, 1}};
        System.out.println(topoSort(6, edges)); // [4, 5, 2, 0, 3, 1]
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <queue>

std::vector<int> topoSort(int n, const std::vector<std::pair<int, int>>& edges) {
    std::vector<std::vector<int>> graph(n);
    std::vector<int> indeg(n, 0), order;
    for (auto [u, v] : edges) { graph[u].push_back(v); indeg[v]++; }
    std::queue<int> q;
    for (int i = 0; i < n; i++) if (indeg[i] == 0) q.push(i);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : graph[u]) if (--indeg[v] == 0) q.push(v);
    }
    if ((int)order.size() != n) order.clear();   // cycle
    return order;
}

int main() {
    for (int v : topoSort(6, {{5, 2}, {5, 0}, {4, 0}, {4, 1}, {2, 3}, {3, 1}}))
        std::cout << v << ' ';   // 4 5 2 0 3 1
}`}},

unionfind:{name:'Union–Find (disjoint set)',cat:'graphs',
 blurb:'Track which elements belong to the same group, merging groups and answering “are these connected?” in nearly constant time.',
 cx:[['find / union','O(α(n)) amortized','α is the inverse Ackermann function: ≤ 4 for any practical n'],['Extra space','O(n)','parent and rank arrays'],['Without optimizations','O(n) per op','Chains can get long'],['Optimizations','Path compression + union by rank','Use both']],
 pts:['Each set is a tree; its root is the set’s representative.','find walks to the root; path compression points nodes directly (or closer) to the root on the way.','union attaches the shorter tree under the taller one so trees stay flat.','NeetCode examples: Redundant Connection, Number of Connected Components, Graph Valid Tree. Also powers Kruskal’s MST.'],
 pseudo:['procedure find(x)','  while parent[x] ≠ x','    parent[x] ← parent[parent[x]]   // path halving','    x ← parent[x]','  return x','procedure union(a, b)','  ra ← find(a); rb ← find(b)','  if ra = rb: return false   // already in the same set','  attach the lower-rank root under the higher-rank root','  return true'],
 trace:[[0,'Five singletons: {0} {1} {2} {3} {4}.'],[8,'union(0, 1) → {0, 1}. union(3, 4) → {3, 4}.'],[8,'union(1, 3): find(1) = 0, find(3) = 3; ranks tie, so 3’s root goes under 0 → {0, 1, 3, 4}.'],[4,'find(4) walks 4 → 3 → 0 and compresses the path. find(0) = find(4): connected. find(2) = 2: not connected.']],
 q:{q:'union(a, b) returns false. In a graph problem, what does that tell you?',o:['a or b doesn’t exist','The edge a–b closes a cycle','The graph is disconnected','The ranks are equal'],a:1,why:'a and b were already connected, so adding the edge creates a second path between them.'},
 code:{
python:`class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]   # path halving
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                       # already connected
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra                   # shorter tree under taller
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        return True

uf = UnionFind(5)
uf.union(0, 1); uf.union(3, 4); uf.union(1, 3)
print(uf.find(0) == uf.find(4), uf.find(2) == uf.find(0))   # True False`,
javascript:`class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }
  find(x) {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]];   // path halving
      x = this.parent[x];
    }
    return x;
  }
  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;
    if (this.rank[ra] < this.rank[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    if (this.rank[ra] === this.rank[rb]) this.rank[ra]++;
    return true;
  }
}

const uf = new UnionFind(5);
uf.union(0, 1); uf.union(3, 4); uf.union(1, 3);
console.log(uf.find(0) === uf.find(4), uf.find(2) === uf.find(0)); // true false`,
java:`public class UnionFind {
    private final int[] parent, rank;

    UnionFind(int n) {
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];   // path halving
            x = parent[x];
        }
        return x;
    }

    boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        if (rank[ra] < rank[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra;
        if (rank[ra] == rank[rb]) rank[ra]++;
        return true;
    }

    public static void main(String[] args) {
        UnionFind uf = new UnionFind(5);
        uf.union(0, 1); uf.union(3, 4); uf.union(1, 3);
        System.out.println((uf.find(0) == uf.find(4)) + " " + (uf.find(2) == uf.find(0))); // true false
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <numeric>
#include <utility>

struct UnionFind {
    std::vector<int> parent, rank;
    explicit UnionFind(int n) : parent(n), rank(n, 0) { std::iota(parent.begin(), parent.end(), 0); }

    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];   // path halving
            x = parent[x];
        }
        return x;
    }

    bool unite(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        if (rank[ra] < rank[rb]) std::swap(ra, rb);
        parent[rb] = ra;
        if (rank[ra] == rank[rb]) rank[ra]++;
        return true;
    }
};

int main() {
    UnionFind uf(5);
    uf.unite(0, 1); uf.unite(3, 4); uf.unite(1, 3);
    std::cout << std::boolalpha << (uf.find(0) == uf.find(4)) << ' ' << (uf.find(2) == uf.find(0));
    // true false
}`}},

kruskal:{name:'Kruskal’s minimum spanning tree',cat:'graphs',
 blurb:'Build the cheapest set of edges that connects every vertex: take edges from lightest to heaviest, skipping any that would form a cycle.',
 cx:[['Time','O(E log E)','Dominated by sorting the edges'],['Extra space','O(V)','Union–find structure'],['Output','V − 1 edges','For a connected graph'],['Best for','Sparse graphs, edge lists','Prim is often better on dense graphs']],
 pts:['Greedy and provably optimal (cut property): the lightest edge across any cut belongs to some MST.','Union–find answers “would this edge make a cycle?” almost instantly.','Stop once you have V − 1 edges.','NeetCode example: Min Cost to Connect All Points.'],
 pseudo:['procedure kruskal(V, edges)','  sort edges by weight','  make each vertex its own set','  for each edge (u, v, w) in order','    if find(u) ≠ find(v)   // joins two different trees','      union(u, v); total ← total + w','      if V − 1 edges taken: stop','  return total'],
 trace:[[1,'Edges by weight: 0–1 (1), 1–3 (2), 1–2 (3), 0–2 (4), 2–3 (5).'],[5,'Take 0–1 (1). Take 1–3 (2): 3 joins {0, 1}.'],[5,'Take 1–2 (3): 2 joins too. That’s 3 = V − 1 edges.'],[6,'Stop early. Edges 0–2 and 2–3 would only form cycles. Total weight: 6.']],
 q:{q:'An edge is skipped in Kruskal’s algorithm when…',o:['It is heavier than the previous edge','Both endpoints are already in the same tree','One endpoint has degree 3','It was added to the queue twice'],a:1,why:'Adding it would create a cycle, and a spanning tree has no cycles.'},
 code:{
python:`def kruskal(n, edges):
    """edges: (weight, u, v). Returns the total weight of a minimum spanning tree."""
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    total = used = 0
    for w, u, v in sorted(edges):
        ru, rv = find(u), find(v)
        if ru != rv:                 # joins two components: keep it
            parent[ru] = rv
            total += w
            used += 1
            if used == n - 1:
                break
    return total

edges = [(1, 0, 1), (4, 0, 2), (3, 1, 2), (2, 1, 3), (5, 2, 3)]
print(kruskal(4, edges))   # 6`,
javascript:`function kruskal(n, edges) {          // edges: [weight, u, v]
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = x => {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  };
  let total = 0, used = 0;
  for (const [w, u, v] of [...edges].sort((a, b) => a[0] - b[0])) {
    const ru = find(u), rv = find(v);
    if (ru !== rv) {
      parent[ru] = rv;
      total += w;
      if (++used === n - 1) break;
    }
  }
  return total;
}

console.log(kruskal(4, [[1, 0, 1], [4, 0, 2], [3, 1, 2], [2, 1, 3], [5, 2, 3]])); // 6`,
java:`import java.util.Arrays;

public class Kruskal {
    static int[] parent;

    static int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }

    static int kruskal(int n, int[][] edges) {          // edges: {weight, u, v}
        parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        int[][] sorted = edges.clone();
        Arrays.sort(sorted, (a, b) -> Integer.compare(a[0], b[0]));
        int total = 0, used = 0;
        for (int[] e : sorted) {
            int ru = find(e[1]), rv = find(e[2]);
            if (ru != rv) {
                parent[ru] = rv;
                total += e[0];
                if (++used == n - 1) break;
            }
        }
        return total;
    }

    public static void main(String[] args) {
        int[][] edges = {{1, 0, 1}, {4, 0, 2}, {3, 1, 2}, {2, 1, 3}, {5, 2, 3}};
        System.out.println(kruskal(4, edges)); // 6
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <array>
#include <numeric>
#include <algorithm>

int kruskal(int n, std::vector<std::array<int, 3>> edges) {   // {weight, u, v}
    std::vector<int> parent(n);
    std::iota(parent.begin(), parent.end(), 0);
    auto find = [&](int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    };
    std::sort(edges.begin(), edges.end());
    int total = 0, used = 0;
    for (auto [w, u, v] : edges) {
        int ru = find(u), rv = find(v);
        if (ru != rv) {
            parent[ru] = rv;
            total += w;
            if (++used == n - 1) break;
        }
    }
    return total;
}

int main() {
    std::cout << kruskal(4, {{1, 0, 1}, {4, 0, 2}, {3, 1, 2}, {2, 1, 3}, {5, 2, 3}});   // 6
}`}},

prim:{name:'Prim’s minimum spanning tree',cat:'graphs',
 blurb:'Grow one tree from a starting vertex, always adding the cheapest edge that reaches a vertex not yet in the tree.',
 cx:[['Time (heap)','O(E log V)','Good for sparse graphs'],['Time (array)','O(V²)','Better for dense graphs such as all-pairs point distances'],['Extra space','O(V + E)','Heap entries'],['Output','Same total as Kruskal','MST weight is unique even if edges differ']],
 pts:['Looks like Dijkstra, but the heap key is the single edge weight, not the path length.','Skip heap entries for vertices already in the tree.','For complete graphs (every pair connected), the O(V²) array version avoids building E = V² edges.','NeetCode example: Min Cost to Connect All Points.'],
 pseudo:['procedure prim(G)','  pq ← {(0, start)}; total ← 0','  while pq not empty','    (w, u) ← pq.popMin()','    if u already in tree: continue','    add u to tree; total ← total + w','    for each edge u → v with weight wt','      if v not in tree: pq.push((wt, v))','  return total'],
 trace:[[1,'Same graph as the Kruskal example. Start at vertex 0.'],[5,'Pop 0 (cost 0). Push 0–1 (1) and 0–2 (4).'],[5,'Pop 1 via weight 1. Push 1–2 (3) and 1–3 (2).'],[5,'Pop 3 via weight 2. Push 3–2 (5).'],[5,'Pop 2 via weight 3. All vertices in. Remaining entries are skipped.'],[8,'Total = 0 + 1 + 2 + 3 = 6.']],
 q:{q:'How does Prim differ from Dijkstra?',o:['It uses a stack','The heap key is the edge weight, not the total distance from the start','It only works on trees','It requires sorted edges'],a:1,why:'Prim cares about the cheapest single edge into the tree; Dijkstra cares about cumulative path length.'},
 code:{
python:`import heapq

def prim(graph):
    """graph[u] = list of (v, weight). Returns the MST weight (graph must be connected)."""
    seen = [False] * len(graph)
    pq = [(0, 0)]                  # (edge weight, vertex)
    total = 0
    while pq:
        w, u = heapq.heappop(pq)
        if seen[u]:
            continue
        seen[u] = True
        total += w
        for v, wt in graph[u]:
            if not seen[v]:
                heapq.heappush(pq, (wt, v))
    return total

graph = [[(1, 1), (2, 4)], [(0, 1), (2, 3), (3, 2)], [(0, 4), (1, 3), (3, 5)], [(1, 2), (2, 5)]]
print(prim(graph))   # 6`,
javascript:JS_HEAP+`

function prim(graph) {
  const seen = new Array(graph.length).fill(false), pq = new MinHeap();
  pq.push([0, 0]);
  let total = 0;
  while (pq.size) {
    const [w, u] = pq.pop();
    if (seen[u]) continue;
    seen[u] = true;
    total += w;
    for (const [v, wt] of graph[u]) if (!seen[v]) pq.push([wt, v]);
  }
  return total;
}

const graph = [[[1, 1], [2, 4]], [[0, 1], [2, 3], [3, 2]], [[0, 4], [1, 3], [3, 5]], [[1, 2], [2, 5]]];
console.log(prim(graph)); // 6`,
java:`import java.util.*;

public class Prim {
    static int prim(List<List<int[]>> graph) {
        boolean[] seen = new boolean[graph.size()];
        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(x -> x[0]));
        pq.add(new int[]{0, 0});
        int total = 0;
        while (!pq.isEmpty()) {
            int[] top = pq.poll();
            int w = top[0], u = top[1];
            if (seen[u]) continue;
            seen[u] = true;
            total += w;
            for (int[] e : graph.get(u)) if (!seen[e[0]]) pq.add(new int[]{e[1], e[0]});
        }
        return total;
    }

    public static void main(String[] args) {
        List<List<int[]>> g = List.of(
            List.of(new int[]{1, 1}, new int[]{2, 4}),
            List.of(new int[]{0, 1}, new int[]{2, 3}, new int[]{3, 2}),
            List.of(new int[]{0, 4}, new int[]{1, 3}, new int[]{3, 5}),
            List.of(new int[]{1, 2}, new int[]{2, 5}));
        System.out.println(prim(g)); // 6
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <queue>

using Graph = std::vector<std::vector<std::pair<int, int>>>;   // (neighbor, weight)

int prim(const Graph& g) {
    std::vector<bool> seen(g.size(), false);
    using Item = std::pair<int, int>;                           // (weight, vertex)
    std::priority_queue<Item, std::vector<Item>, std::greater<Item>> pq;
    pq.push({0, 0});
    int total = 0;
    while (!pq.empty()) {
        auto [w, u] = pq.top(); pq.pop();
        if (seen[u]) continue;
        seen[u] = true;
        total += w;
        for (auto [v, wt] : g[u]) if (!seen[v]) pq.push({wt, v});
    }
    return total;
}

int main() {
    Graph g = {{{1, 1}, {2, 4}}, {{0, 1}, {2, 3}, {3, 2}}, {{0, 4}, {1, 3}, {3, 5}}, {{1, 2}, {2, 5}}};
    std::cout << prim(g);   // 6
}`}},

traversals:{name:'Tree traversals',cat:'trees',
 blurb:'Visit every node of a binary tree in a fixed order: inorder, preorder and postorder go depth-first; level order goes breadth-first.',
 cx:[['Time','O(n)','Each node visited once'],['Extra space (DFS)','O(h)','Recursion depth = tree height'],['Extra space (BFS)','O(w)','Queue holds up to one level (width w)'],['Worst-case h','O(n)','A tree that is really a linked list']],
 pts:['Preorder (node, left, right): copy or serialize a tree.','Inorder (left, node, right): gives sorted order for a binary search tree.','Postorder (left, right, node): compute things that depend on children, like heights or deleting a tree.','Level order uses a queue; process one level at a time by reading the queue size first.'],
 pseudo:['procedure inorder(node)','  if node is null: return','  inorder(node.left)','  visit(node)','  inorder(node.right)','// preorder: visit, left, right','// postorder: left, right, visit','// level order: BFS with a queue'],
 trace:[[0,'Tree: 4 at the root, 2 and 6 below it, then 1, 3, 5, 7 as leaves.'],[3,'Inorder: 1, 2, 3, 4, 5, 6, 7. Sorted, because this is a BST.'],[5,'Preorder: 4, 2, 1, 3, 6, 5, 7. The root always comes first.'],[6,'Postorder: 1, 3, 2, 5, 7, 6, 4. The root always comes last.'],[7,'Level order: 4, 2, 6, 1, 3, 5, 7.']],
 q:{q:'Which traversal of a binary search tree outputs the keys in sorted order?',o:['Preorder','Inorder','Postorder','Level order'],a:1,why:'Everything in the left subtree is smaller and everything in the right is larger, so left → node → right is ascending.'},
 code:{
python:`from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def inorder(node, out):
    if node:
        inorder(node.left, out)
        out.append(node.val)
        inorder(node.right, out)
    return out

def preorder(node, out):
    if node:
        out.append(node.val)
        preorder(node.left, out)
        preorder(node.right, out)
    return out

def postorder(node, out):
    if node:
        postorder(node.left, out)
        postorder(node.right, out)
        out.append(node.val)
    return out

def level_order(root):
    out, q = [], deque([root] if root else [])
    while q:
        node = q.popleft()
        out.append(node.val)
        if node.left:
            q.append(node.left)
        if node.right:
            q.append(node.right)
    return out

#        4
#      /   \\
#     2     6
#    / \\   / \\
#   1   3 5   7
root = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(6, TreeNode(5), TreeNode(7)))
print(inorder(root, []))     # [1, 2, 3, 4, 5, 6, 7]
print(preorder(root, []))    # [4, 2, 1, 3, 6, 5, 7]
print(postorder(root, []))   # [1, 3, 2, 5, 7, 6, 4]
print(level_order(root))     # [4, 2, 6, 1, 3, 5, 7]`,
javascript:`class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}

const inorder = (n, out = []) => { if (n) { inorder(n.left, out); out.push(n.val); inorder(n.right, out); } return out; };
const preorder = (n, out = []) => { if (n) { out.push(n.val); preorder(n.left, out); preorder(n.right, out); } return out; };
const postorder = (n, out = []) => { if (n) { postorder(n.left, out); postorder(n.right, out); out.push(n.val); } return out; };

function levelOrder(root) {
  const out = [], q = root ? [root] : [];
  for (let head = 0; head < q.length; head++) {
    const n = q[head];
    out.push(n.val);
    if (n.left) q.push(n.left);
    if (n.right) q.push(n.right);
  }
  return out;
}

const T = (v, l, r) => new TreeNode(v, l, r);
const root = T(4, T(2, T(1), T(3)), T(6, T(5), T(7)));
console.log(inorder(root));    // [1, 2, 3, 4, 5, 6, 7]
console.log(preorder(root));   // [4, 2, 1, 3, 6, 5, 7]
console.log(postorder(root));  // [1, 3, 2, 5, 7, 6, 4]
console.log(levelOrder(root)); // [4, 2, 6, 1, 3, 5, 7]`,
java:`import java.util.*;

public class Traversals {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v, TreeNode l, TreeNode r) { val = v; left = l; right = r; }
        TreeNode(int v) { this(v, null, null); }
    }

    static void inorder(TreeNode n, List<Integer> out) {
        if (n == null) return;
        inorder(n.left, out); out.add(n.val); inorder(n.right, out);
    }

    static void preorder(TreeNode n, List<Integer> out) {
        if (n == null) return;
        out.add(n.val); preorder(n.left, out); preorder(n.right, out);
    }

    static void postorder(TreeNode n, List<Integer> out) {
        if (n == null) return;
        postorder(n.left, out); postorder(n.right, out); out.add(n.val);
    }

    static List<Integer> levelOrder(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        Deque<TreeNode> q = new ArrayDeque<>();
        if (root != null) q.add(root);
        while (!q.isEmpty()) {
            TreeNode n = q.poll();
            out.add(n.val);
            if (n.left != null) q.add(n.left);
            if (n.right != null) q.add(n.right);
        }
        return out;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(4, new TreeNode(2, new TreeNode(1), new TreeNode(3)),
                                        new TreeNode(6, new TreeNode(5), new TreeNode(7)));
        List<Integer> a = new ArrayList<>(), b = new ArrayList<>(), c = new ArrayList<>();
        inorder(root, a); preorder(root, b); postorder(root, c);
        System.out.println(a);                 // [1, 2, 3, 4, 5, 6, 7]
        System.out.println(b);                 // [4, 2, 1, 3, 6, 5, 7]
        System.out.println(c);                 // [1, 3, 2, 5, 7, 6, 4]
        System.out.println(levelOrder(root));  // [4, 2, 6, 1, 3, 5, 7]
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <queue>

struct TreeNode {
    int val; TreeNode *left, *right;
    TreeNode(int v, TreeNode* l = nullptr, TreeNode* r = nullptr) : val(v), left(l), right(r) {}
};

void inorder(TreeNode* n, std::vector<int>& out) {
    if (!n) return;
    inorder(n->left, out); out.push_back(n->val); inorder(n->right, out);
}
void preorder(TreeNode* n, std::vector<int>& out) {
    if (!n) return;
    out.push_back(n->val); preorder(n->left, out); preorder(n->right, out);
}
void postorder(TreeNode* n, std::vector<int>& out) {
    if (!n) return;
    postorder(n->left, out); postorder(n->right, out); out.push_back(n->val);
}
std::vector<int> levelOrder(TreeNode* root) {
    std::vector<int> out;
    std::queue<TreeNode*> q;
    if (root) q.push(root);
    while (!q.empty()) {
        TreeNode* n = q.front(); q.pop();
        out.push_back(n->val);
        if (n->left) q.push(n->left);
        if (n->right) q.push(n->right);
    }
    return out;
}

void print(const std::vector<int>& v) { for (int x : v) std::cout << x << ' '; std::cout << '\\n'; }

int main() {
    TreeNode* root = new TreeNode(4, new TreeNode(2, new TreeNode(1), new TreeNode(3)),
                                     new TreeNode(6, new TreeNode(5), new TreeNode(7)));
    std::vector<int> a, b, c;
    inorder(root, a); preorder(root, b); postorder(root, c);
    print(a);                // 1 2 3 4 5 6 7
    print(b);                // 4 2 1 3 6 5 7
    print(c);                // 1 3 2 5 7 6 4
    print(levelOrder(root)); // 4 2 6 1 3 5 7
}`}},

bst:{name:'Binary search tree',cat:'trees',
 blurb:'A binary tree where every left descendant is smaller and every right descendant is larger, so search, insert and delete follow one root-to-leaf path.',
 cx:[['Search / insert / delete','O(h)','h = height'],['Balanced tree','O(log n)','AVL, red–black trees keep h ≈ log n'],['Degenerate tree','O(n)','Inserting sorted keys builds a linked list'],['Extra space','O(n)','Plus O(h) recursion'],['Inorder traversal','Sorted output','O(n)']],
 pts:['At each node, compare and go left or right: binary search on a linked structure.','Deleting a node with two children: copy its inorder successor (smallest in the right subtree), then delete that successor.','Self-balancing variants (red–black, AVL) power TreeMap, std::map and database indexes.','NeetCode examples: Validate BST, Kth Smallest Element in a BST, Lowest Common Ancestor of a BST.'],
 pseudo:['procedure search(node, key)','  while node ≠ null and node.key ≠ key','    node ← key < node.key ? node.left : node.right','  return node ≠ null','procedure delete(node, key)','  find the node; if it has 0 or 1 child, replace it by that child','  else: succ ← min of node.right','        node.key ← succ.key; delete succ from node.right'],
 trace:[[0,'Insert 50, 30, 70, 20, 40, 60, 80: 50 is the root; 30 and 70 its children; 20, 40, 60, 80 the leaves.'],[2,'search(60): 60 > 50 go right to 70; 60 < 70 go left to 60. Found in 3 steps.'],[3,'search(65): 50 → 70 → 60 → right child is null. Not found.'],[6,'delete(50): it has two children. Its successor is 60, the smallest key in the right subtree.'],[7,'Copy 60 into the root and delete the old 60 leaf. The root is now 60 and the tree is still a valid BST.']],
 q:{q:'You insert 1, 2, 3, 4, 5 in that order into an empty BST. What is the height?',o:['3 (balanced)','5 (a chain)','2','log₂ 5'],a:1,why:'Each key is larger than all before it, so every insert goes right: the tree degrades into a linked list.'},
 code:{
python:`class Node:
    def __init__(self, key):
        self.key, self.left, self.right = key, None, None

def insert(root, key):
    if root is None:
        return Node(key)
    if key < root.key:
        root.left = insert(root.left, key)
    elif key > root.key:
        root.right = insert(root.right, key)
    return root

def search(root, key):
    while root and root.key != key:
        root = root.left if key < root.key else root.right
    return root is not None

def delete(root, key):
    if root is None:
        return None
    if key < root.key:
        root.left = delete(root.left, key)
    elif key > root.key:
        root.right = delete(root.right, key)
    else:
        if root.left is None:
            return root.right
        if root.right is None:
            return root.left
        succ = root.right                 # smallest key in the right subtree
        while succ.left:
            succ = succ.left
        root.key = succ.key
        root.right = delete(root.right, succ.key)
    return root

root = None
for k in [50, 30, 70, 20, 40, 60, 80]:
    root = insert(root, k)
print(search(root, 60), search(root, 65))   # True False
root = delete(root, 50)
print(root.key)                             # 60`,
javascript:`class Node {
  constructor(key) { this.key = key; this.left = null; this.right = null; }
}

function insert(root, key) {
  if (!root) return new Node(key);
  if (key < root.key) root.left = insert(root.left, key);
  else if (key > root.key) root.right = insert(root.right, key);
  return root;
}

function search(root, key) {
  while (root && root.key !== key) root = key < root.key ? root.left : root.right;
  return root !== null;
}

function remove(root, key) {
  if (!root) return null;
  if (key < root.key) root.left = remove(root.left, key);
  else if (key > root.key) root.right = remove(root.right, key);
  else {
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    let succ = root.right;                 // smallest key in the right subtree
    while (succ.left) succ = succ.left;
    root.key = succ.key;
    root.right = remove(root.right, succ.key);
  }
  return root;
}

let root = null;
for (const k of [50, 30, 70, 20, 40, 60, 80]) root = insert(root, k);
console.log(search(root, 60), search(root, 65)); // true false
root = remove(root, 50);
console.log(root.key);                           // 60`,
java:`public class BST {
    static class Node {
        int key; Node left, right;
        Node(int k) { key = k; }
    }

    static Node insert(Node root, int key) {
        if (root == null) return new Node(key);
        if (key < root.key) root.left = insert(root.left, key);
        else if (key > root.key) root.right = insert(root.right, key);
        return root;
    }

    static boolean search(Node root, int key) {
        while (root != null && root.key != key) root = key < root.key ? root.left : root.right;
        return root != null;
    }

    static Node delete(Node root, int key) {
        if (root == null) return null;
        if (key < root.key) root.left = delete(root.left, key);
        else if (key > root.key) root.right = delete(root.right, key);
        else {
            if (root.left == null) return root.right;
            if (root.right == null) return root.left;
            Node succ = root.right;
            while (succ.left != null) succ = succ.left;
            root.key = succ.key;
            root.right = delete(root.right, succ.key);
        }
        return root;
    }

    public static void main(String[] args) {
        Node root = null;
        for (int k : new int[]{50, 30, 70, 20, 40, 60, 80}) root = insert(root, k);
        System.out.println(search(root, 60) + " " + search(root, 65)); // true false
        root = delete(root, 50);
        System.out.println(root.key);                                    // 60
    }
}`,
cpp:`#include <iostream>

struct Node {
    int key; Node *left = nullptr, *right = nullptr;
    explicit Node(int k) : key(k) {}
};

Node* insert(Node* root, int key) {
    if (!root) return new Node(key);
    if (key < root->key) root->left = insert(root->left, key);
    else if (key > root->key) root->right = insert(root->right, key);
    return root;
}

bool search(Node* root, int key) {
    while (root && root->key != key) root = key < root->key ? root->left : root->right;
    return root != nullptr;
}

Node* remove(Node* root, int key) {
    if (!root) return nullptr;
    if (key < root->key) root->left = remove(root->left, key);
    else if (key > root->key) root->right = remove(root->right, key);
    else {
        if (!root->left) { Node* r = root->right; delete root; return r; }
        if (!root->right) { Node* l = root->left; delete root; return l; }
        Node* succ = root->right;
        while (succ->left) succ = succ->left;
        root->key = succ->key;
        root->right = remove(root->right, succ->key);
    }
    return root;
}

int main() {
    Node* root = nullptr;
    for (int k : {50, 30, 70, 20, 40, 60, 80}) root = insert(root, k);
    std::cout << std::boolalpha << search(root, 60) << ' ' << search(root, 65) << '\\n';   // true false
    root = remove(root, 50);
    std::cout << root->key << '\\n';   // 60
}`}},

binheap:{name:'Binary heap (priority queue)',cat:'trees',
 blurb:'A complete binary tree stored in an array where each parent is ≤ its children, giving O(1) access to the minimum and O(log n) insert and remove.',
 cx:[['peek min','O(1)','The root, index 0'],['push / pop','O(log n)','Sift up or down one path'],['Build from n items','O(n)','Bottom-up heapify'],['Extra space','O(n)','Just the array'],['Search arbitrary item','O(n)','A heap is not a search tree']],
 pts:['Parent of i is (i − 1) / 2; children are 2i + 1 and 2i + 2. No pointers needed.','push: append at the end, then swap upward while smaller than the parent.','pop: move the last element to the root, then swap downward with the smaller child.','“Top k” problems: keep a heap of size k for O(n log k). Two heaps solve running medians.'],
 pseudo:['procedure push(x)','  append x; i ← last index','  while i > 0 and A[parent(i)] > A[i]','    swap(A[i], A[parent(i)]); i ← parent(i)   // sift up','procedure pop()','  top ← A[0]; A[0] ← remove last element','  sift A[0] down: swap with the smaller child while it is smaller','  return top'],
 trace:[[1,'Push 5 → [5]. Push 3: append, 3 < parent 5, swap → [3, 5].'],[3,'Push 8 → [3, 5, 8]. Push 1: append at index 3; swap with 5, then with 3 → [1, 3, 8, 5].'],[3,'Push 9 → [1, 3, 8, 5, 9]. Push 2: append at index 5; swap with 8 → [1, 3, 2, 5, 9, 8].'],[5,'pop() returns 1. Move 8 to the root → [8, 3, 2, 5, 9].'],[6,'Sift 8 down: smaller child is 2 → [2, 3, 8, 5, 9]. Popping repeatedly yields 1, 2, 3, 5, 8, 9.']],
 q:{q:'In an array heap, where are the children of index 4?',o:['5 and 6','8 and 9','9 and 10','2 and 3'],a:2,why:'Children of i are 2i + 1 = 9 and 2i + 2 = 10.'},
 code:{
python:`class MinHeap:
    def __init__(self):
        self.a = []

    def push(self, x):
        a = self.a
        a.append(x)
        i = len(a) - 1
        while i > 0 and a[(i - 1) // 2] > a[i]:          # sift up
            a[i], a[(i - 1) // 2] = a[(i - 1) // 2], a[i]
            i = (i - 1) // 2

    def pop(self):
        a = self.a
        top = a[0]
        last = a.pop()
        if a:
            a[0] = last
            i = 0
            while True:                                   # sift down
                l, r, m = 2 * i + 1, 2 * i + 2, i
                if l < len(a) and a[l] < a[m]:
                    m = l
                if r < len(a) and a[r] < a[m]:
                    m = r
                if m == i:
                    break
                a[i], a[m] = a[m], a[i]
                i = m
        return top

h = MinHeap()
for x in [5, 3, 8, 1, 9, 2]:
    h.push(x)
print([h.pop() for _ in range(6)])   # [1, 2, 3, 5, 8, 9]
# In real code use heapq.heappush / heapq.heappop`,
javascript:`class MinHeap {
  constructor() { this.a = []; }
  push(x) {
    const a = this.a; a.push(x);
    let i = a.length - 1;
    while (i > 0 && a[(i - 1) >> 1] > a[i]) {            // sift up
      [a[i], a[(i - 1) >> 1]] = [a[(i - 1) >> 1], a[i]];
      i = (i - 1) >> 1;
    }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      for (let i = 0;;) {                                // sift down
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && a[l] < a[m]) m = l;
        if (r < a.length && a[r] < a[m]) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]]; i = m;
      }
    }
    return top;
  }
}

const h = new MinHeap();
for (const x of [5, 3, 8, 1, 9, 2]) h.push(x);
console.log(Array.from({ length: 6 }, () => h.pop())); // [1, 2, 3, 5, 8, 9]`,
java:`import java.util.ArrayList;
import java.util.List;

public class MinHeap {
    private final List<Integer> a = new ArrayList<>();

    void push(int x) {
        a.add(x);
        int i = a.size() - 1;
        while (i > 0 && a.get((i - 1) / 2) > a.get(i)) {     // sift up
            swap(i, (i - 1) / 2);
            i = (i - 1) / 2;
        }
    }

    int pop() {
        int top = a.get(0), last = a.remove(a.size() - 1);
        if (!a.isEmpty()) {
            a.set(0, last);
            int i = 0;
            while (true) {                                    // sift down
                int l = 2 * i + 1, r = l + 1, m = i;
                if (l < a.size() && a.get(l) < a.get(m)) m = l;
                if (r < a.size() && a.get(r) < a.get(m)) m = r;
                if (m == i) break;
                swap(i, m);
                i = m;
            }
        }
        return top;
    }

    private void swap(int i, int j) { int t = a.get(i); a.set(i, a.get(j)); a.set(j, t); }

    public static void main(String[] args) {
        MinHeap h = new MinHeap();
        for (int x : new int[]{5, 3, 8, 1, 9, 2}) h.push(x);
        StringBuilder sb = new StringBuilder();
        for (int k = 0; k < 6; k++) sb.append(h.pop()).append(' ');
        System.out.println(sb.toString().trim());   // 1 2 3 5 8 9
        // In real code use java.util.PriorityQueue
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <utility>

class MinHeap {
    std::vector<int> a;
public:
    void push(int x) {
        a.push_back(x);
        size_t i = a.size() - 1;
        while (i > 0 && a[(i - 1) / 2] > a[i]) {             // sift up
            std::swap(a[i], a[(i - 1) / 2]);
            i = (i - 1) / 2;
        }
    }
    int pop() {
        int top = a[0];
        a[0] = a.back();
        a.pop_back();
        size_t i = 0;
        while (true) {                                        // sift down
            size_t l = 2 * i + 1, r = l + 1, m = i;
            if (l < a.size() && a[l] < a[m]) m = l;
            if (r < a.size() && a[r] < a[m]) m = r;
            if (m == i) break;
            std::swap(a[i], a[m]);
            i = m;
        }
        return top;
    }
};

int main() {
    MinHeap h;
    for (int x : {5, 3, 8, 1, 9, 2}) h.push(x);
    for (int k = 0; k < 6; k++) std::cout << h.pop() << ' ';   // 1 2 3 5 8 9
    // In real code use std::priority_queue
}`}},

trie:{name:'Trie (prefix tree)',cat:'trees',
 blurb:'Store strings character by character in a tree, so all words sharing a prefix share a path. Prefix queries take time proportional to the prefix length.',
 cx:[['insert / search','O(L)','L = word length, independent of how many words are stored'],['startsWith','O(P)','P = prefix length'],['Extra space','O(total characters)','Times the per-node map overhead'],['Compare with','Hash set','O(L) lookup but no prefix queries']],
 pts:['Each node has up to one child per letter, plus a flag marking “a word ends here”.','“ca” being a prefix of “car” doesn’t make “ca” a word: that’s what the end flag is for.','Use an array of 26 children for lowercase letters or a hash map for general alphabets.','NeetCode examples: Implement Trie, Design Add and Search Words, Word Search II.'],
 pseudo:['procedure insert(word)','  node ← root','  for each character c in word','    if c not in node.children: create it','    node ← node.children[c]','  node.isEnd ← true','procedure search(word)   // startsWith skips the isEnd check','  walk the characters; fail if a child is missing','  return node.isEnd'],
 trace:[[0,'Insert “car”, “cart”, “cat”, “dog”.'],[4,'“car” creates c → a → r and marks r as an end.'],[3,'“cart” reuses c → a → r and adds t. “cat” reuses c → a and adds t.'],[8,'search(“car”): the path exists and r is marked → true.'],[8,'search(“ca”): the path exists but a is not marked → false. startsWith(“ca”) → true.']],
 q:{q:'Why does a trie need an “end of word” flag?',o:['To save memory','A word can be a prefix of another word, so reaching a node doesn’t mean a word ends there','To sort the words','To handle uppercase letters'],a:1,why:'With “cart” stored, the node for “car” exists; only the flag says whether “car” itself was inserted.'},
 code:{
python:`class Trie:
    def __init__(self):
        self.children = {}
        self.end = False

    def insert(self, word):
        node = self
        for ch in word:
            node = node.children.setdefault(ch, Trie())
        node.end = True

    def _walk(self, s):
        node = self
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.end

    def starts_with(self, prefix):
        return self._walk(prefix) is not None

t = Trie()
for w in ["car", "cart", "cat", "dog"]:
    t.insert(w)
print(t.search("car"), t.search("ca"), t.starts_with("ca"))   # True False True`,
javascript:`class Trie {
  constructor() { this.children = new Map(); this.end = false; }
  insert(word) {
    let node = this;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new Trie());
      node = node.children.get(ch);
    }
    node.end = true;
  }
  walk(s) {
    let node = this;
    for (const ch of s) {
      node = node.children.get(ch);
      if (!node) return null;
    }
    return node;
  }
  search(word) { const n = this.walk(word); return !!n && n.end; }
  startsWith(prefix) { return this.walk(prefix) !== null; }
}

const t = new Trie();
for (const w of ["car", "cart", "cat", "dog"]) t.insert(w);
console.log(t.search("car"), t.search("ca"), t.startsWith("ca")); // true false true`,
java:`public class Trie {
    private final Trie[] children = new Trie[26];
    private boolean end;

    void insert(String word) {
        Trie node = this;
        for (char ch : word.toCharArray()) {
            int i = ch - 'a';
            if (node.children[i] == null) node.children[i] = new Trie();
            node = node.children[i];
        }
        node.end = true;
    }

    private Trie walk(String s) {
        Trie node = this;
        for (char ch : s.toCharArray()) {
            node = node.children[ch - 'a'];
            if (node == null) return null;
        }
        return node;
    }

    boolean search(String word) { Trie n = walk(word); return n != null && n.end; }
    boolean startsWith(String prefix) { return walk(prefix) != null; }

    public static void main(String[] args) {
        Trie t = new Trie();
        for (String w : new String[]{"car", "cart", "cat", "dog"}) t.insert(w);
        System.out.println(t.search("car") + " " + t.search("ca") + " " + t.startsWith("ca")); // true false true
    }
}`,
cpp:`#include <iostream>
#include <string>
#include <memory>
#include <array>

struct Trie {
    std::array<std::unique_ptr<Trie>, 26> children;
    bool end = false;

    void insert(const std::string& word) {
        Trie* node = this;
        for (char ch : word) {
            auto& next = node->children[ch - 'a'];
            if (!next) next = std::make_unique<Trie>();
            node = next.get();
        }
        node->end = true;
    }

    const Trie* walk(const std::string& s) const {
        const Trie* node = this;
        for (char ch : s) {
            node = node->children[ch - 'a'].get();
            if (!node) return nullptr;
        }
        return node;
    }

    bool search(const std::string& w) const { auto n = walk(w); return n && n->end; }
    bool startsWith(const std::string& p) const { return walk(p) != nullptr; }
};

int main() {
    Trie t;
    for (std::string w : {"car", "cart", "cat", "dog"}) t.insert(w);
    std::cout << std::boolalpha << t.search("car") << ' ' << t.search("ca") << ' ' << t.startsWith("ca");
    // true false true
}`}}
});
