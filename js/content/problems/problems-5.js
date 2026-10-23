/* ===== Problems batch 5: Advanced Graphs, 1-D DP, 2-D DP ===== */

P({n:332,s:'reconstruct-itinerary',t:'Reconstruct Itinerary',c:'advgraphs',d:'Hard',rel:['dfs'],
 sum:'Given airline tickets [from, to], build the itinerary that starts at "JFK" and uses every ticket exactly once. If several exist, return the lexicographically smallest.',
 ex:'[["MUC","LHR"], ["JFK","MUC"], ["SFO","SJC"], ["LHR","SFO"]] → ["JFK", "MUC", "LHR", "SFO", "SJC"]',
 h:['Using every edge exactly once is an Eulerian path.','Greedily taking the smallest destination can strand you; you need a way to recover.','Hierholzer’s algorithm: DFS, always taking the smallest unused ticket, and add an airport to the route only when it has no tickets left. Reverse at the end.'],
 app:'Store each airport’s destinations sorted so the smallest is taken first. Use a stack starting at JFK: while the top airport has unused tickets, push the smallest destination; when it has none, pop it onto the route. Dead ends get appended first, so reversing the route gives a valid, smallest itinerary.',
 tc:'O(E log E)',sc:'O(E)',
 py:`from collections import defaultdict

class Solution:
    def findItinerary(self, tickets: list[list[str]]) -> list[str]:
        graph = defaultdict(list)
        for src, dst in sorted(tickets, reverse=True):
            graph[src].append(dst)          # reverse-sorted, so pop() gives the smallest
        route, stack = [], ["JFK"]
        while stack:
            while graph[stack[-1]]:
                stack.append(graph[stack[-1]].pop())
            route.append(stack.pop())       # no tickets left: add to route (reversed)
        return route[::-1]`,
 js:`function findItinerary(tickets) {
  const graph = new Map();
  for (const [src, dst] of [...tickets].sort().reverse()) {
    if (!graph.has(src)) graph.set(src, []);
    graph.get(src).push(dst);                  // pop() yields the smallest
  }
  const route = [], stack = ["JFK"];
  while (stack.length) {
    const top = stack[stack.length - 1], out = graph.get(top);
    if (out && out.length) stack.push(out.pop());
    else route.push(stack.pop());
  }
  return route.reverse();
}`,
 java:`class Solution {
    public List<String> findItinerary(List<List<String>> tickets) {
        Map<String, PriorityQueue<String>> graph = new HashMap<>();
        for (List<String> t : tickets)
            graph.computeIfAbsent(t.get(0), k -> new PriorityQueue<>()).add(t.get(1));
        LinkedList<String> route = new LinkedList<>();
        Deque<String> stack = new ArrayDeque<>(List.of("JFK"));
        while (!stack.isEmpty()) {
            PriorityQueue<String> out = graph.get(stack.peek());
            if (out != null && !out.isEmpty()) stack.push(out.poll());
            else route.addFirst(stack.pop());
        }
        return route;
    }
}`,
 cpp:`class Solution {
public:
    vector<string> findItinerary(vector<vector<string>>& tickets) {
        unordered_map<string, multiset<string>> graph;
        for (auto& t : tickets) graph[t[0]].insert(t[1]);
        vector<string> route;
        stack<string> st;
        st.push("JFK");
        while (!st.empty()) {
            auto& out = graph[st.top()];
            if (!out.empty()) {
                string next = *out.begin();          // smallest destination
                out.erase(out.begin());
                st.push(next);
            } else {
                route.push_back(st.top());
                st.pop();
            }
        }
        reverse(route.begin(), route.end());
        return route;
    }
};`});

P({n:1584,s:'min-cost-to-connect-all-points',t:'Min Cost to Connect All Points',c:'advgraphs',d:'Medium',rel:['prim','kruskal'],
 sum:'Connect all points in the plane with the minimum total Manhattan distance, where any two points can be joined directly.',
 ex:'[[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]] → 20',
 h:['This is a minimum spanning tree on a complete graph.','Listing all n² edges for Kruskal is heavy.','Prim’s algorithm with a plain array of best distances runs in O(n²) with no heap and no edge list.'],
 app:'Keep dist[i] = cheapest edge connecting point i to the tree so far, starting with point 0 in the tree. Repeat n times: pick the unvisited point with the smallest dist, add that cost, mark it visited, and update every other unvisited point’s dist using its distance to the new point.',
 tc:'O(n²)',sc:'O(n)',
 py:`class Solution:
    def minCostConnectPoints(self, points: list[list[int]]) -> int:
        n = len(points)
        dist = [float("inf")] * n               # cheapest edge into the tree
        dist[0] = 0
        in_tree = [False] * n
        total = 0
        for _ in range(n):
            u = min((i for i in range(n) if not in_tree[i]), key=lambda i: dist[i])
            in_tree[u] = True
            total += dist[u]
            ux, uy = points[u]
            for v in range(n):
                if not in_tree[v]:
                    d = abs(ux - points[v][0]) + abs(uy - points[v][1])
                    if d < dist[v]:
                        dist[v] = d
        return total`,
 js:`function minCostConnectPoints(points) {
  const n = points.length, dist = new Array(n).fill(Infinity), inTree = new Array(n).fill(false);
  dist[0] = 0;
  let total = 0;
  for (let k = 0; k < n; k++) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!inTree[i] && (u === -1 || dist[i] < dist[u])) u = i;
    inTree[u] = true;
    total += dist[u];
    for (let v = 0; v < n; v++) {
      if (!inTree[v]) {
        const d = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1]);
        if (d < dist[v]) dist[v] = d;
      }
    }
  }
  return total;
}`,
 java:`class Solution {
    public int minCostConnectPoints(int[][] points) {
        int n = points.length, total = 0;
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[0] = 0;
        boolean[] inTree = new boolean[n];
        for (int k = 0; k < n; k++) {
            int u = -1;
            for (int i = 0; i < n; i++) if (!inTree[i] && (u == -1 || dist[i] < dist[u])) u = i;
            inTree[u] = true;
            total += dist[u];
            for (int v = 0; v < n; v++) {
                if (inTree[v]) continue;
                int d = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1]);
                if (d < dist[v]) dist[v] = d;
            }
        }
        return total;
    }
}`,
 cpp:`class Solution {
public:
    int minCostConnectPoints(vector<vector<int>>& points) {
        int n = points.size(), total = 0;
        vector<int> dist(n, INT_MAX);
        vector<bool> inTree(n, false);
        dist[0] = 0;
        for (int k = 0; k < n; k++) {
            int u = -1;
            for (int i = 0; i < n; i++) if (!inTree[i] && (u == -1 || dist[i] < dist[u])) u = i;
            inTree[u] = true;
            total += dist[u];
            for (int v = 0; v < n; v++) {
                if (inTree[v]) continue;
                int d = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1]);
                dist[v] = min(dist[v], d);
            }
        }
        return total;
    }
};`});

P({n:743,s:'network-delay-time',t:'Network Delay Time',c:'advgraphs',d:'Medium',rel:['bellmanford','dijkstra'],
 sum:'A signal starts at node k and travels along directed edges with given delays. Return the time until every node has received it, or −1 if some never do.',
 ex:'times [[2, 1, 1], [2, 3, 1], [3, 4, 1]], n = 4, k = 2 → 2',
 h:['Every node receives the signal at its shortest-path distance from k.','Delays are non-negative, so this is Dijkstra’s algorithm.','The answer is the largest shortest distance; any unreachable node means −1.'],
 app:'Build adjacency lists, run Dijkstra from k with a min-heap, skipping stale heap entries. If some node’s distance is still infinite, return −1; otherwise return the maximum distance.',
 tc:'O(E log V)',sc:'O(V + E)',
 py:`import heapq
from collections import defaultdict

class Solution:
    def networkDelayTime(self, times: list[list[int]], n: int, k: int) -> int:
        graph = defaultdict(list)
        for u, v, w in times:
            graph[u].append((v, w))
        dist = {}
        pq = [(0, k)]
        while pq:
            d, u = heapq.heappop(pq)
            if u in dist:
                continue                    # already finalized with a shorter time
            dist[u] = d
            for v, w in graph[u]:
                if v not in dist:
                    heapq.heappush(pq, (d + w, v))
        return max(dist.values()) if len(dist) == n else -1`,
 js:JS_PQ+`function networkDelayTime(times, n, k) {
  const graph = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) graph[u].push([v, w]);
  const dist = new Array(n + 1).fill(Infinity);
  const pq = new Heap((a, b) => a[0] - b[0]);
  pq.push([0, k]);
  while (pq.size) {
    const [d, u] = pq.pop();
    if (dist[u] !== Infinity) continue;
    dist[u] = d;
    for (const [v, w] of graph[u]) if (dist[v] === Infinity) pq.push([d + w, v]);
  }
  const worst = Math.max(...dist.slice(1));
  return worst === Infinity ? -1 : worst;
}`,
 java:`class Solution {
    public int networkDelayTime(int[][] times, int n, int k) {
        List<List<int[]>> graph = new ArrayList<>();
        for (int i = 0; i <= n; i++) graph.add(new ArrayList<>());
        for (int[] t : times) graph.get(t[0]).add(new int[]{t[1], t[2]});
        int[] dist = new int[n + 1];
        Arrays.fill(dist, -1);
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
        pq.add(new int[]{0, k});
        int seen = 0, worst = 0;
        while (!pq.isEmpty()) {
            int[] top = pq.poll();
            int d = top[0], u = top[1];
            if (dist[u] != -1) continue;
            dist[u] = d;
            seen++;
            worst = d;                                   // popped in increasing order
            for (int[] e : graph.get(u)) if (dist[e[0]] == -1) pq.add(new int[]{d + e[1], e[0]});
        }
        return seen == n ? worst : -1;
    }
}`,
 cpp:`class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        vector<vector<pair<int, int>>> graph(n + 1);
        for (auto& t : times) graph[t[0]].push_back({t[1], t[2]});
        vector<int> dist(n + 1, -1);
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
        pq.push({0, k});
        int seen = 0, worst = 0;
        while (!pq.empty()) {
            auto [d, u] = pq.top(); pq.pop();
            if (dist[u] != -1) continue;
            dist[u] = d;
            seen++;
            worst = d;
            for (auto [v, w] : graph[u]) if (dist[v] == -1) pq.push({d + w, v});
        }
        return seen == n ? worst : -1;
    }
};`});

P({n:778,s:'swim-in-rising-water',t:'Swim in Rising Water',c:'advgraphs',d:'Hard',rel:['dijkstra','lowerbound'],
 sum:'Each cell of an n × n grid has an elevation. At time t you can swim between adjacent cells whose elevations are both ≤ t. Return the earliest time you can get from the top-left to the bottom-right.',
 ex:'[[0, 2], [1, 3]] → 3',
 h:['The cost of a path is the highest elevation on it.','You want the path that minimizes that maximum.','Dijkstra still works if the “distance” of a path is its max elevation instead of its sum.'],
 app:'Run Dijkstra where the priority is the maximum elevation seen along the path. Pop the cell with the smallest such value; when you pop the bottom-right cell, its value is the answer. Binary search on t with a BFS reachability check is an alternative.',
 tc:'O(n² log n)',sc:'O(n²)',
 py:`import heapq

class Solution:
    def swimInWater(self, grid: list[list[int]]) -> int:
        n = len(grid)
        seen = {(0, 0)}
        pq = [(grid[0][0], 0, 0)]                 # (highest elevation so far, r, c)
        while pq:
            t, r, c = heapq.heappop(pq)
            if r == c == n - 1:
                return t
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen:
                    seen.add((nr, nc))
                    heapq.heappush(pq, (max(t, grid[nr][nc]), nr, nc))
        return -1`,
 js:JS_PQ+`function swimInWater(grid) {
  const n = grid.length, seen = Array.from({ length: n }, () => new Array(n).fill(false));
  const pq = new Heap((a, b) => a[0] - b[0]);
  pq.push([grid[0][0], 0, 0]);
  seen[0][0] = true;
  while (pq.size) {
    const [t, r, c] = pq.pop();
    if (r === n - 1 && c === n - 1) return t;
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr >= 0 && nc >= 0 && nr < n && nc < n && !seen[nr][nc]) {
        seen[nr][nc] = true;
        pq.push([Math.max(t, grid[nr][nc]), nr, nc]);
      }
    }
  }
  return -1;
}`,
 java:`class Solution {
    public int swimInWater(int[][] grid) {
        int n = grid.length;
        boolean[][] seen = new boolean[n][n];
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
        pq.add(new int[]{grid[0][0], 0, 0});
        seen[0][0] = true;
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        while (!pq.isEmpty()) {
            int[] top = pq.poll();
            int t = top[0], r = top[1], c = top[2];
            if (r == n - 1 && c == n - 1) return t;
            for (int[] d : dirs) {
                int nr = r + d[0], nc = c + d[1];
                if (nr >= 0 && nc >= 0 && nr < n && nc < n && !seen[nr][nc]) {
                    seen[nr][nc] = true;
                    pq.add(new int[]{Math.max(t, grid[nr][nc]), nr, nc});
                }
            }
        }
        return -1;
    }
}`,
 cpp:`class Solution {
public:
    int swimInWater(vector<vector<int>>& grid) {
        int n = grid.size();
        vector<vector<bool>> seen(n, vector<bool>(n, false));
        priority_queue<array<int, 3>, vector<array<int, 3>>, greater<>> pq;
        pq.push({grid[0][0], 0, 0});
        seen[0][0] = true;
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        while (!pq.empty()) {
            auto [t, r, c] = pq.top(); pq.pop();
            if (r == n - 1 && c == n - 1) return t;
            for (int k = 0; k < 4; k++) {
                int nr = r + dr[k], nc = c + dc[k];
                if (nr >= 0 && nc >= 0 && nr < n && nc < n && !seen[nr][nc]) {
                    seen[nr][nc] = true;
                    pq.push({max(t, grid[nr][nc]), nr, nc});
                }
            }
        }
        return -1;
    }
};`});

P({n:269,s:'alien-dictionary',t:'Alien Dictionary',c:'advgraphs',d:'Hard',prem:1,rel:['topo'],
 sum:'Words from an alien language are given in sorted dictionary order. Derive an ordering of its letters consistent with that list, or return "" if the list is contradictory.',
 ex:'["wrt", "wrf", "er", "ett", "rftt"] → "wertf"',
 h:['Compare each pair of adjacent words.','The first position where they differ tells you one letter comes before another: an edge in a graph.','A topological sort of the letters gives the order; a cycle means no order exists. Also watch for a word followed by its own prefix, which is invalid.'],
 app:'Collect every letter as a node. For each adjacent pair, find the first differing character and add an edge (earlier → later); if no difference exists but the first word is longer, return "". Run Kahn’s algorithm; if not every letter is output, there is a cycle, so return "".',
 tc:'O(total characters)',sc:'O(alphabet²)',
 py:`from collections import deque

class Solution:
    def alienOrder(self, words: list[str]) -> str:
        graph = {c: set() for w in words for c in w}
        indeg = {c: 0 for c in graph}
        for a, b in zip(words, words[1:]):
            for x, y in zip(a, b):
                if x != y:                         # first difference: x comes before y
                    if y not in graph[x]:
                        graph[x].add(y)
                        indeg[y] += 1
                    break
            else:
                if len(a) > len(b):
                    return ""                      # "abc" before "ab" is impossible
        q = deque(c for c in indeg if indeg[c] == 0)
        order = []
        while q:
            c = q.popleft()
            order.append(c)
            for d in graph[c]:
                indeg[d] -= 1
                if indeg[d] == 0:
                    q.append(d)
        return "".join(order) if len(order) == len(indeg) else ""`,
 js:`function alienOrder(words) {
  const graph = new Map(), indeg = new Map();
  for (const w of words) for (const c of w) if (!graph.has(c)) { graph.set(c, new Set()); indeg.set(c, 0); }
  for (let i = 0; i + 1 < words.length; i++) {
    const a = words[i], b = words[i + 1];
    let j = 0;
    while (j < a.length && j < b.length && a[j] === b[j]) j++;
    if (j === Math.min(a.length, b.length)) {
      if (a.length > b.length) return "";
      continue;
    }
    if (!graph.get(a[j]).has(b[j])) { graph.get(a[j]).add(b[j]); indeg.set(b[j], indeg.get(b[j]) + 1); }
  }
  const order = [...indeg.keys()].filter(c => indeg.get(c) === 0);
  for (let h = 0; h < order.length; h++) {
    for (const d of graph.get(order[h])) {
      indeg.set(d, indeg.get(d) - 1);
      if (indeg.get(d) === 0) order.push(d);
    }
  }
  return order.length === graph.size ? order.join("") : "";
}`,
 java:`class Solution {
    public String alienOrder(String[] words) {
        Map<Character, Set<Character>> graph = new LinkedHashMap<>();
        Map<Character, Integer> indeg = new HashMap<>();
        for (String w : words)
            for (char c : w.toCharArray()) { graph.putIfAbsent(c, new HashSet<>()); indeg.putIfAbsent(c, 0); }
        for (int i = 0; i + 1 < words.length; i++) {
            String a = words[i], b = words[i + 1];
            int j = 0;
            while (j < a.length() && j < b.length() && a.charAt(j) == b.charAt(j)) j++;
            if (j == Math.min(a.length(), b.length())) {
                if (a.length() > b.length()) return "";
                continue;
            }
            if (graph.get(a.charAt(j)).add(b.charAt(j))) indeg.merge(b.charAt(j), 1, Integer::sum);
        }
        Deque<Character> q = new ArrayDeque<>();
        for (char c : graph.keySet()) if (indeg.get(c) == 0) q.add(c);
        StringBuilder sb = new StringBuilder();
        while (!q.isEmpty()) {
            char c = q.poll();
            sb.append(c);
            for (char d : graph.get(c)) if (indeg.merge(d, -1, Integer::sum) == 0) q.add(d);
        }
        return sb.length() == graph.size() ? sb.toString() : "";
    }
}`,
 cpp:`class Solution {
public:
    string alienOrder(vector<string>& words) {
        unordered_map<char, unordered_set<char>> graph;
        unordered_map<char, int> indeg;
        for (auto& w : words) for (char c : w) { graph[c]; indeg[c]; }
        for (size_t i = 0; i + 1 < words.size(); i++) {
            const string &a = words[i], &b = words[i + 1];
            size_t j = 0;
            while (j < a.size() && j < b.size() && a[j] == b[j]) j++;
            if (j == min(a.size(), b.size())) {
                if (a.size() > b.size()) return "";
                continue;
            }
            if (graph[a[j]].insert(b[j]).second) indeg[b[j]]++;
        }
        queue<char> q;
        for (auto& [c, d] : indeg) if (d == 0) q.push(c);
        string order;
        while (!q.empty()) {
            char c = q.front(); q.pop();
            order += c;
            for (char d : graph[c]) if (--indeg[d] == 0) q.push(d);
        }
        return order.size() == graph.size() ? order : "";
    }
};`});

P({n:787,s:'cheapest-flights-within-k-stops',t:'Cheapest Flights Within K Stops',c:'advgraphs',d:'Medium',rel:['dijkstra','bfs','bellmanford'],
 sum:'Given directed flights with prices, find the cheapest price from src to dst using at most k stops (k + 1 flights), or −1 if impossible.',
 ex:'n = 4, flights [[0,1,100], [1,2,100], [2,0,100], [1,3,600], [2,3,200]], src 0, dst 3, k = 1 → 700',
 h:['Plain Dijkstra ignores the stop limit and may return a cheaper path with too many stops.','Bounded Bellman–Ford: relax all edges once per allowed flight.','Copy the distance array each round so one round never chains two flights.'],
 app:'Start with dist[src] = 0 and everything else ∞. Repeat k + 1 times: make a copy of dist, and for every flight (u, v, price) with dist[u] finite, set copy[v] = min(copy[v], dist[u] + price). Using the old array on the right-hand side limits each round to one more flight. Return dist[dst] or −1.',
 tc:'O(k · E)',sc:'O(n)',
 py:`class Solution:
    def findCheapestPrice(self, n: int, flights: list[list[int]], src: int, dst: int, k: int) -> int:
        INF = float("inf")
        dist = [INF] * n
        dist[src] = 0
        for _ in range(k + 1):                    # at most k + 1 flights
            nxt = dist[:]                         # copy: one extra flight per round
            for u, v, price in flights:
                if dist[u] + price < nxt[v]:
                    nxt[v] = dist[u] + price
            dist = nxt
        return -1 if dist[dst] == INF else dist[dst]`,
 js:`function findCheapestPrice(n, flights, src, dst, k) {
  let dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  for (let round = 0; round <= k; round++) {
    const next = [...dist];
    for (const [u, v, price] of flights) if (dist[u] + price < next[v]) next[v] = dist[u] + price;
    dist = next;
  }
  return dist[dst] === Infinity ? -1 : dist[dst];
}`,
 java:`class Solution {
    public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[src] = 0;
        for (int round = 0; round <= k; round++) {
            int[] next = dist.clone();
            for (int[] f : flights)
                if (dist[f[0]] != Integer.MAX_VALUE && dist[f[0]] + f[2] < next[f[1]])
                    next[f[1]] = dist[f[0]] + f[2];
            dist = next;
        }
        return dist[dst] == Integer.MAX_VALUE ? -1 : dist[dst];
    }
}`,
 cpp:`class Solution {
public:
    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {
        vector<int> dist(n, INT_MAX);
        dist[src] = 0;
        for (int round = 0; round <= k; round++) {
            vector<int> next = dist;
            for (auto& f : flights)
                if (dist[f[0]] != INT_MAX && dist[f[0]] + f[2] < next[f[1]])
                    next[f[1]] = dist[f[0]] + f[2];
            dist = next;
        }
        return dist[dst] == INT_MAX ? -1 : dist[dst];
    }
};`});

/* ---------- 1-D Dynamic Programming ---------- */
P({n:70,s:'climbing-stairs',t:'Climbing Stairs',c:'dp1',d:'Easy',rel:['memo'],
 sum:'You climb a staircase of n steps, taking 1 or 2 steps at a time. Count the distinct ways to reach the top.',
 ex:'n = 3 → 3 (1+1+1, 1+2, 2+1)',
 h:['The last move onto step n came from step n − 1 or step n − 2.','So ways(n) = ways(n − 1) + ways(n − 2): the Fibonacci recurrence.','You only need the previous two values.'],
 app:'Iterate with two variables holding ways(i − 2) and ways(i − 1), starting from ways(0) = 1 and ways(1) = 1. Each step’s value is their sum. This is Fibonacci shifted by one.',
 tc:'O(n)',sc:'O(1)',
 py:`class Solution:
    def climbStairs(self, n: int) -> int:
        a, b = 1, 1                 # ways to reach step 0 and step 1
        for _ in range(n - 1):
            a, b = b, a + b
        return b`,
 js:`function climbStairs(n) {
  let a = 1, b = 1;
  for (let i = 1; i < n; i++) [a, b] = [b, a + b];
  return b;
}`,
 java:`class Solution {
    public int climbStairs(int n) {
        int a = 1, b = 1;
        for (int i = 1; i < n; i++) { int t = a + b; a = b; b = t; }
        return b;
    }
}`,
 cpp:`class Solution {
public:
    int climbStairs(int n) {
        int a = 1, b = 1;
        for (int i = 1; i < n; i++) { int t = a + b; a = b; b = t; }
        return b;
    }
};`});

P({n:746,s:'min-cost-climbing-stairs',t:'Min Cost Climbing Stairs',c:'dp1',d:'Easy',rel:['memo'],
 sum:'cost[i] is paid when you step on stair i; from there you may climb 1 or 2 stairs. Starting at stair 0 or 1, find the minimum cost to reach the top (just past the last stair).',
 ex:'[10, 15, 20] → 15 (start on stair 1, then jump to the top)',
 h:['Let dp[i] be the cheapest cost to stand on step i, before paying cost[i].','dp[i] = min(dp[i − 1] + cost[i − 1], dp[i − 2] + cost[i − 2]).','dp[0] = dp[1] = 0, and the answer is dp[n].'],
 app:'Roll two variables through the recurrence for i = 2 to n, where step n is the top. Starting on stair 0 or 1 for free is captured by both base cases being 0.',
 tc:'O(n)',sc:'O(1)',
 py:`class Solution:
    def minCostClimbingStairs(self, cost: list[int]) -> int:
        a = b = 0                       # cheapest cost to stand on steps i-2 and i-1
        for i in range(2, len(cost) + 1):
            a, b = b, min(b + cost[i - 1], a + cost[i - 2])
        return b`,
 js:`function minCostClimbingStairs(cost) {
  let a = 0, b = 0;
  for (let i = 2; i <= cost.length; i++) [a, b] = [b, Math.min(b + cost[i - 1], a + cost[i - 2])];
  return b;
}`,
 java:`class Solution {
    public int minCostClimbingStairs(int[] cost) {
        int a = 0, b = 0;
        for (int i = 2; i <= cost.length; i++) {
            int c = Math.min(b + cost[i - 1], a + cost[i - 2]);
            a = b;
            b = c;
        }
        return b;
    }
}`,
 cpp:`class Solution {
public:
    int minCostClimbingStairs(vector<int>& cost) {
        int a = 0, b = 0;
        for (int i = 2; i <= (int)cost.size(); i++) {
            int c = min(b + cost[i - 1], a + cost[i - 2]);
            a = b;
            b = c;
        }
        return b;
    }
};`});

P({n:198,s:'house-robber',t:'House Robber',c:'dp1',d:'Medium',rel:['memo'],
 sum:'Houses in a row hold given amounts of money. You can’t rob two adjacent houses. Return the most money you can take.',
 ex:'[2, 7, 9, 3, 1] → 12 (2 + 9 + 1)',
 h:['At each house, either rob it (and skip the previous one) or skip it.','best(i) = max(best(i − 1), best(i − 2) + nums[i]).','Only the last two best values are needed.'],
 app:'Keep prev2 (best up to house i − 2) and prev1 (best up to house i − 1). For each house, the new best is max(prev1, prev2 + money). Shift the pair forward. The final prev1 is the answer.',
 tc:'O(n)',sc:'O(1)',
 py:`class Solution:
    def rob(self, nums: list[int]) -> int:
        prev2 = prev1 = 0
        for x in nums:
            prev2, prev1 = prev1, max(prev1, prev2 + x)   # skip x, or rob it
        return prev1`,
 js:`function rob(nums) {
  let prev2 = 0, prev1 = 0;
  for (const x of nums) [prev2, prev1] = [prev1, Math.max(prev1, prev2 + x)];
  return prev1;
}`,
 java:`class Solution {
    public int rob(int[] nums) {
        int prev2 = 0, prev1 = 0;
        for (int x : nums) {
            int cur = Math.max(prev1, prev2 + x);
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
}`,
 cpp:`class Solution {
public:
    int rob(vector<int>& nums) {
        int prev2 = 0, prev1 = 0;
        for (int x : nums) {
            int cur = max(prev1, prev2 + x);
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
};`});

P({n:213,s:'house-robber-ii',t:'House Robber II',c:'dp1',d:'Medium',rel:['memo'],
 sum:'Same as House Robber, but the houses form a circle, so the first and last houses are adjacent.',
 ex:'[2, 3, 2] → 3',
 h:['The first and last houses can’t both be robbed.','So either exclude the first house or exclude the last one.','Run the linear House Robber on both ranges and take the better result.'],
 app:'Answer = max(rob(nums[1..n−1]), rob(nums[0..n−2])), where rob is the linear solution. A single house is a special case: return its value.',
 tc:'O(n)',sc:'O(1)',
 py:`class Solution:
    def rob(self, nums: list[int]) -> int:
        def line(houses):
            prev2 = prev1 = 0
            for x in houses:
                prev2, prev1 = prev1, max(prev1, prev2 + x)
            return prev1

        if len(nums) == 1:
            return nums[0]
        return max(line(nums[1:]), line(nums[:-1]))   # skip the first or skip the last`,
 js:`function rob(nums) {
  const line = (lo, hi) => {
    let prev2 = 0, prev1 = 0;
    for (let i = lo; i <= hi; i++) [prev2, prev1] = [prev1, Math.max(prev1, prev2 + nums[i])];
    return prev1;
  };
  if (nums.length === 1) return nums[0];
  return Math.max(line(1, nums.length - 1), line(0, nums.length - 2));
}`,
 java:`class Solution {
    public int rob(int[] nums) {
        if (nums.length == 1) return nums[0];
        return Math.max(line(nums, 1, nums.length - 1), line(nums, 0, nums.length - 2));
    }

    private int line(int[] nums, int lo, int hi) {
        int prev2 = 0, prev1 = 0;
        for (int i = lo; i <= hi; i++) {
            int cur = Math.max(prev1, prev2 + nums[i]);
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
}`,
 cpp:`class Solution {
    int line(vector<int>& nums, int lo, int hi) {
        int prev2 = 0, prev1 = 0;
        for (int i = lo; i <= hi; i++) {
            int cur = max(prev1, prev2 + nums[i]);
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
public:
    int rob(vector<int>& nums) {
        if (nums.size() == 1) return nums[0];
        return max(line(nums, 1, nums.size() - 1), line(nums, 0, nums.size() - 2));
    }
};`});

P({n:5,s:'longest-palindromic-substring',t:'Longest Palindromic Substring',c:'dp1',d:'Medium',rel:['twopointers'],
 sum:'Return the longest contiguous substring that reads the same forwards and backwards.',
 ex:'"babad" → "bab" ("aba" is also valid) · "cbbd" → "bb"',
 h:['Every palindrome has a center: one character (odd length) or a gap between two (even length).','There are 2n − 1 centers.','Expand outward from each center while the characters match, and keep the longest.'],
 app:'For each index, expand around it as an odd-length center and around the gap after it as an even-length center. Expansion stops at the first mismatch. Track the start and length of the best palindrome. A DP table isPal[i][j] also works in O(n²) time but O(n²) space.',
 tc:'O(n²)',sc:'O(1)',
 py:`class Solution:
    def longestPalindrome(self, s: str) -> str:
        best_start, best_len = 0, 0

        def expand(l, r):
            nonlocal best_start, best_len
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1
                r += 1
            if r - l - 1 > best_len:                # palindrome is s[l+1 .. r-1]
                best_start, best_len = l + 1, r - l - 1

        for i in range(len(s)):
            expand(i, i)            # odd length
            expand(i, i + 1)        # even length
        return s[best_start:best_start + best_len]`,
 js:`function longestPalindrome(s) {
  let start = 0, len = 0;
  const expand = (l, r) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
    if (r - l - 1 > len) { start = l + 1; len = r - l - 1; }
  };
  for (let i = 0; i < s.length; i++) { expand(i, i); expand(i, i + 1); }
  return s.slice(start, start + len);
}`,
 java:`class Solution {
    private int start = 0, len = 0;

    public String longestPalindrome(String s) {
        for (int i = 0; i < s.length(); i++) { expand(s, i, i); expand(s, i, i + 1); }
        return s.substring(start, start + len);
    }

    private void expand(String s, int l, int r) {
        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) { l--; r++; }
        if (r - l - 1 > len) { start = l + 1; len = r - l - 1; }
    }
}`,
 cpp:`class Solution {
    int start = 0, len = 0;
    void expand(const string& s, int l, int r) {
        while (l >= 0 && r < (int)s.size() && s[l] == s[r]) { l--; r++; }
        if (r - l - 1 > len) { start = l + 1; len = r - l - 1; }
    }
public:
    string longestPalindrome(string s) {
        for (int i = 0; i < (int)s.size(); i++) { expand(s, i, i); expand(s, i, i + 1); }
        return s.substr(start, len);
    }
};`});

P({n:647,s:'palindromic-substrings',t:'Palindromic Substrings',c:'dp1',d:'Medium',rel:['twopointers'],
 sum:'Count the substrings of s that are palindromes. Substrings at different positions count separately even if equal.',
 ex:'"aaa" → 6 ("a" × 3, "aa" × 2, "aaa")',
 h:['Use the same center expansion as Longest Palindromic Substring.','Every successful expansion step is one more palindrome.','Sum the counts from all 2n − 1 centers.'],
 app:'For each odd and even center, expand while the ends match and add 1 for every step that succeeds. The total over all centers is the answer.',
 tc:'O(n²)',sc:'O(1)',
 py:`class Solution:
    def countSubstrings(self, s: str) -> int:
        count = 0
        for center in range(2 * len(s) - 1):
            l = center // 2
            r = l + center % 2                  # odd centers: l == r; even: r = l + 1
            while l >= 0 and r < len(s) and s[l] == s[r]:
                count += 1
                l -= 1
                r += 1
        return count`,
 js:`function countSubstrings(s) {
  let count = 0;
  for (let center = 0; center < 2 * s.length - 1; center++) {
    let l = center >> 1, r = l + (center % 2);
    while (l >= 0 && r < s.length && s[l] === s[r]) { count++; l--; r++; }
  }
  return count;
}`,
 java:`class Solution {
    public int countSubstrings(String s) {
        int count = 0;
        for (int center = 0; center < 2 * s.length() - 1; center++) {
            int l = center / 2, r = l + center % 2;
            while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) { count++; l--; r++; }
        }
        return count;
    }
}`,
 cpp:`class Solution {
public:
    int countSubstrings(string s) {
        int count = 0, n = s.size();
        for (int center = 0; center < 2 * n - 1; center++) {
            int l = center / 2, r = l + center % 2;
            while (l >= 0 && r < n && s[l] == s[r]) { count++; l--; r++; }
        }
        return count;
    }
};`});

P({n:91,s:'decode-ways',t:'Decode Ways',c:'dp1',d:'Medium',rel:['memo'],
 sum:'Letters are encoded as "1" to "26". Count the ways a digit string can be decoded back into letters.',
 ex:'"226" → 3 ("BZ", "VF", "BBF") · "06" → 0',
 h:['The last letter used either one digit or two digits.','A single digit is valid if it isn’t "0"; a pair is valid if it is between "10" and "26".','ways(i) = (one-digit ok ? ways(i − 1) : 0) + (two-digit ok ? ways(i − 2) : 0).'],
 app:'Iterate over prefixes with two rolling values: ways for the prefix ending one character back and two characters back. At each position add the contributions of a valid single digit and a valid two-digit number. A leading "0" makes everything 0.',
 tc:'O(n)',sc:'O(1)',
 py:`class Solution:
    def numDecodings(self, s: str) -> int:
        prev2, prev1 = 1, (1 if s[0] != "0" else 0)   # ways for prefixes of length 0 and 1
        for i in range(1, len(s)):
            cur = 0
            if s[i] != "0":
                cur += prev1                          # use s[i] alone
            if 10 <= int(s[i - 1:i + 1]) <= 26:
                cur += prev2                          # use s[i-1..i] together
            prev2, prev1 = prev1, cur
        return prev1`,
 js:`function numDecodings(s) {
  let prev2 = 1, prev1 = s[0] !== "0" ? 1 : 0;
  for (let i = 1; i < s.length; i++) {
    let cur = 0;
    if (s[i] !== "0") cur += prev1;
    const two = Number(s.slice(i - 1, i + 1));
    if (two >= 10 && two <= 26) cur += prev2;
    [prev2, prev1] = [prev1, cur];
  }
  return prev1;
}`,
 java:`class Solution {
    public int numDecodings(String s) {
        int prev2 = 1, prev1 = s.charAt(0) != '0' ? 1 : 0;
        for (int i = 1; i < s.length(); i++) {
            int cur = 0;
            if (s.charAt(i) != '0') cur += prev1;
            int two = (s.charAt(i - 1) - '0') * 10 + (s.charAt(i) - '0');
            if (two >= 10 && two <= 26) cur += prev2;
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
}`,
 cpp:`class Solution {
public:
    int numDecodings(string s) {
        int prev2 = 1, prev1 = s[0] != '0' ? 1 : 0;
        for (size_t i = 1; i < s.size(); i++) {
            int cur = 0;
            if (s[i] != '0') cur += prev1;
            int two = (s[i - 1] - '0') * 10 + (s[i] - '0');
            if (two >= 10 && two <= 26) cur += prev2;
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
};`});

P({n:322,s:'coin-change',t:'Coin Change',c:'dp1',d:'Medium',rel:['coinchange','bfs'],
 sum:'Given coin denominations (unlimited supply), return the fewest coins that make up the amount, or −1 if it can’t be made.',
 ex:'coins [1, 2, 5], amount 11 → 3 (5 + 5 + 1)',
 h:['Greedy largest-coin-first can fail for some coin sets.','dp[a] = fewest coins for amount a.','dp[a] = 1 + min(dp[a − c]) over coins c ≤ a, with dp[0] = 0.'],
 app:'Fill dp from 1 to amount, using amount + 1 as “impossible”. For each amount, try every coin and keep the best. If dp[amount] is still amount + 1, return −1. BFS over amounts, where each coin is an edge, gives the same answer.',
 tc:'O(amount · coins)',sc:'O(amount)',
 py:`class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        INF = amount + 1
        dp = [0] + [INF] * amount            # dp[a] = fewest coins for amount a
        for a in range(1, amount + 1):
            for c in coins:
                if c <= a and dp[a - c] + 1 < dp[a]:
                    dp[a] = dp[a - c] + 1
        return dp[amount] if dp[amount] != INF else -1`,
 js:`function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(amount + 1);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++)
    for (const c of coins) if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
  return dp[amount] > amount ? -1 : dp[amount];
}`,
 java:`class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++)
            for (int c : coins) if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,
 cpp:`class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        vector<int> dp(amount + 1, amount + 1);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++)
            for (int c : coins) if (c <= a) dp[a] = min(dp[a], dp[a - c] + 1);
        return dp[amount] > amount ? -1 : dp[amount];
    }
};`});

P({n:152,s:'maximum-product-subarray',t:'Maximum Product Subarray',c:'dp1',d:'Medium',rel:['kadane'],
 sum:'Find the largest product of any non-empty contiguous subarray.',
 ex:'[2, 3, −2, 4] → 6 · [−2, 3, −4] → 24',
 h:['Kadane’s idea works, but negatives complicate it.','A negative number turns the smallest product into the largest.','Track both the maximum and the minimum product ending at each index.'],
 app:'For each x, the best and worst products ending here are among x, x · prevMax and x · prevMin. Compute both new values from the old pair (before overwriting), then update the global answer with the new maximum. A zero resets both naturally.',
 tc:'O(n)',sc:'O(1)',
 py:`class Solution:
    def maxProduct(self, nums: list[int]) -> int:
        best = hi = lo = nums[0]
        for x in nums[1:]:
            candidates = (x, x * hi, x * lo)      # a negative x swaps the roles of hi and lo
            hi, lo = max(candidates), min(candidates)
            best = max(best, hi)
        return best`,
 js:`function maxProduct(nums) {
  let best = nums[0], hi = nums[0], lo = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i], a = x * hi, b = x * lo;
    hi = Math.max(x, a, b);
    lo = Math.min(x, a, b);
    best = Math.max(best, hi);
  }
  return best;
}`,
 java:`class Solution {
    public int maxProduct(int[] nums) {
        int best = nums[0], hi = nums[0], lo = nums[0];
        for (int i = 1; i < nums.length; i++) {
            int x = nums[i], a = x * hi, b = x * lo;
            hi = Math.max(x, Math.max(a, b));
            lo = Math.min(x, Math.min(a, b));
            best = Math.max(best, hi);
        }
        return best;
    }
}`,
 cpp:`class Solution {
public:
    int maxProduct(vector<int>& nums) {
        int best = nums[0], hi = nums[0], lo = nums[0];
        for (size_t i = 1; i < nums.size(); i++) {
            int x = nums[i], a = x * hi, b = x * lo;
            hi = max({x, a, b});
            lo = min({x, a, b});
            best = max(best, hi);
        }
        return best;
    }
};`});

P({n:139,s:'word-break',t:'Word Break',c:'dp1',d:'Medium',rel:['memo','trie'],
 sum:'Decide whether a string can be split into a sequence of words from a dictionary (words may be reused).',
 ex:'"applepenapple", ["apple", "pen"] → true',
 h:['dp[i] = can the first i characters be segmented?','dp[i] is true if some dictionary word ends at i and dp[i − len(word)] is true.','Put the dictionary in a hash set; you only need to check word lengths that actually occur.'],
 app:'Set dp[0] = true. For each end position i, check every word length L in the dictionary: if dp[i − L] is true and s[i − L..i] is a word, set dp[i] = true. Return dp[n].',
 tc:'O(n · W · L)',sc:'O(n)',
 py:`class Solution:
    def wordBreak(self, s: str, wordDict: list[str]) -> bool:
        words = set(wordDict)
        lengths = {len(w) for w in words}
        dp = [True] + [False] * len(s)         # dp[i]: s[:i] can be segmented
        for i in range(1, len(s) + 1):
            dp[i] = any(L <= i and dp[i - L] and s[i - L:i] in words for L in lengths)
        return dp[-1]`,
 js:`function wordBreak(s, wordDict) {
  const words = new Set(wordDict), lengths = [...new Set(wordDict.map(w => w.length))];
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= s.length; i++)
    dp[i] = lengths.some(L => L <= i && dp[i - L] && words.has(s.slice(i - L, i)));
  return dp[s.length];
}`,
 java:`class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> words = new HashSet<>(wordDict);
        Set<Integer> lengths = new HashSet<>();
        for (String w : wordDict) lengths.add(w.length());
        boolean[] dp = new boolean[s.length() + 1];
        dp[0] = true;
        for (int i = 1; i <= s.length(); i++)
            for (int L : lengths)
                if (L <= i && dp[i - L] && words.contains(s.substring(i - L, i))) { dp[i] = true; break; }
        return dp[s.length()];
    }
}`,
 cpp:`class Solution {
public:
    bool wordBreak(string s, vector<string>& wordDict) {
        unordered_set<string> words(wordDict.begin(), wordDict.end());
        set<int> lengths;
        for (auto& w : wordDict) lengths.insert(w.size());
        vector<bool> dp(s.size() + 1, false);
        dp[0] = true;
        for (int i = 1; i <= (int)s.size(); i++)
            for (int L : lengths)
                if (L <= i && dp[i - L] && words.count(s.substr(i - L, L))) { dp[i] = true; break; }
        return dp[s.size()];
    }
};`});

P({n:300,s:'longest-increasing-subsequence',t:'Longest Increasing Subsequence',c:'dp1',d:'Medium',rel:['lis','lowerbound'],
 sum:'Return the length of the longest strictly increasing subsequence (not necessarily contiguous).',
 ex:'[10, 9, 2, 5, 3, 7, 101, 18] → 4 (e.g. 2, 3, 7, 101)',
 h:['The O(n²) DP: dp[i] = 1 + max dp[j] over j < i with nums[j] < nums[i].','For O(n log n), keep tails[k] = the smallest possible tail of an increasing subsequence of length k + 1.','tails stays sorted, so binary search where each new value goes.'],
 app:'Scan the numbers. For each x, find the first tail ≥ x with binary search. If none, append x (a longer subsequence exists); otherwise replace that tail with x (a smaller tail for that length). The length of tails is the answer.',
 tc:'O(n log n)',sc:'O(n)',
 py:`from bisect import bisect_left

class Solution:
    def lengthOfLIS(self, nums: list[int]) -> int:
        tails = []
        for x in nums:
            i = bisect_left(tails, x)
            if i == len(tails):
                tails.append(x)
            else:
                tails[i] = x
        return len(tails)`,
 js:`function lengthOfLIS(nums) {
  const tails = [];
  for (const x of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1; else hi = mid;
    }
    tails[lo] = x;
  }
  return tails.length;
}`,
 java:`class Solution {
    public int lengthOfLIS(int[] nums) {
        int[] tails = new int[nums.length];
        int size = 0;
        for (int x : nums) {
            int lo = 0, hi = size;
            while (lo < hi) {
                int mid = (lo + hi) >>> 1;
                if (tails[mid] < x) lo = mid + 1; else hi = mid;
            }
            tails[lo] = x;
            if (lo == size) size++;
        }
        return size;
    }
}`,
 cpp:`class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        vector<int> tails;
        for (int x : nums) {
            auto it = lower_bound(tails.begin(), tails.end(), x);
            if (it == tails.end()) tails.push_back(x); else *it = x;
        }
        return tails.size();
    }
};`});

P({n:416,s:'partition-equal-subset-sum',t:'Partition Equal Subset Sum',c:'dp1',d:'Medium',rel:['knapsack'],
 sum:'Decide whether an array of positive integers can be split into two subsets with equal sums.',
 ex:'[1, 5, 11, 5] → true ([1, 5, 5] and [11])',
 h:['If the total is odd, it is impossible.','Otherwise you need a subset that sums to total / 2.','That is a 0/1 knapsack: a boolean dp over achievable sums, updated right to left.'],
 app:'Let target = total / 2. dp[s] is true if some subset of the numbers seen so far sums to s; dp[0] = true. For each number x, loop s from target down to x and set dp[s] |= dp[s − x]. Going downward ensures each number is used once. Answer dp[target].',
 tc:'O(n · sum)',sc:'O(sum)',
 py:`class Solution:
    def canPartition(self, nums: list[int]) -> bool:
        total = sum(nums)
        if total % 2:
            return False
        target = total // 2
        dp = [True] + [False] * target       # dp[s]: some subset sums to s
        for x in nums:
            for s in range(target, x - 1, -1):   # backwards: each number used once
                dp[s] = dp[s] or dp[s - x]
        return dp[target]`,
 js:`function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2) return false;
  const target = total / 2, dp = new Array(target + 1).fill(false);
  dp[0] = true;
  for (const x of nums) for (let s = target; s >= x; s--) dp[s] = dp[s] || dp[s - x];
  return dp[target];
}`,
 java:`class Solution {
    public boolean canPartition(int[] nums) {
        int total = 0;
        for (int x : nums) total += x;
        if (total % 2 == 1) return false;
        int target = total / 2;
        boolean[] dp = new boolean[target + 1];
        dp[0] = true;
        for (int x : nums)
            for (int s = target; s >= x; s--) dp[s] = dp[s] || dp[s - x];
        return dp[target];
    }
}`,
 cpp:`class Solution {
public:
    bool canPartition(vector<int>& nums) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        if (total % 2) return false;
        bitset<10001> reachable;          // bit s set: some subset sums to s
        reachable[0] = 1;
        for (int x : nums) reachable |= reachable << x;
        return reachable[total / 2];
    }
};`});

/* ---------- 2-D Dynamic Programming ---------- */
P({n:62,s:'unique-paths',t:'Unique Paths',c:'dp2',d:'Medium',rel:['memo'],
 sum:'A robot at the top-left of an m × n grid moves only right or down. Count its distinct paths to the bottom-right.',
 ex:'m = 3, n = 7 → 28',
 h:['The number of ways to reach a cell = ways from above + ways from the left.','The top row and left column each have exactly one way.','One row of the table is enough, updated in place.'],
 app:'Keep a row array of 1s. For each subsequent row, update row[c] += row[c − 1] from left to right: row[c] (before the update) is the count from above, row[c − 1] the count from the left. Combinatorially, the answer is C(m + n − 2, m − 1).',
 tc:'O(m · n)',sc:'O(n)',
 py:`class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        row = [1] * n
        for _ in range(m - 1):
            for c in range(1, n):
                row[c] += row[c - 1]          # from above (old row[c]) + from the left
        return row[-1]`,
 js:`function uniquePaths(m, n) {
  const row = new Array(n).fill(1);
  for (let r = 1; r < m; r++) for (let c = 1; c < n; c++) row[c] += row[c - 1];
  return row[n - 1];
}`,
 java:`class Solution {
    public int uniquePaths(int m, int n) {
        int[] row = new int[n];
        Arrays.fill(row, 1);
        for (int r = 1; r < m; r++)
            for (int c = 1; c < n; c++) row[c] += row[c - 1];
        return row[n - 1];
    }
}`,
 cpp:`class Solution {
public:
    int uniquePaths(int m, int n) {
        vector<int> row(n, 1);
        for (int r = 1; r < m; r++)
            for (int c = 1; c < n; c++) row[c] += row[c - 1];
        return row[n - 1];
    }
};`});

P({n:1143,s:'longest-common-subsequence',t:'Longest Common Subsequence',c:'dp2',d:'Medium',rel:['lcs'],
 sum:'Return the length of the longest subsequence that two strings share.',
 ex:'"abcde", "ace" → 3 ("ace")',
 h:['dp[i][j] = LCS of the first i characters of text1 and the first j of text2.','If the current characters match, extend the diagonal by 1.','Otherwise take the better of dropping one character from either string.'],
 app:'Fill an (m + 1) × (n + 1) table: dp[i][j] = dp[i − 1][j − 1] + 1 on a match, else max(dp[i − 1][j], dp[i][j − 1]). Two rows are enough when only the length is needed.',
 tc:'O(m · n)',sc:'O(n)',
 py:`class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        n = len(text2)
        prev = [0] * (n + 1)
        for a in text1:
            cur = [0] * (n + 1)
            for j in range(1, n + 1):
                cur[j] = prev[j - 1] + 1 if a == text2[j - 1] else max(prev[j], cur[j - 1])
            prev = cur
        return prev[n]`,
 js:`function longestCommonSubsequence(text1, text2) {
  const n = text2.length;
  let prev = new Array(n + 1).fill(0);
  for (const a of text1) {
    const cur = new Array(n + 1).fill(0);
    for (let j = 1; j <= n; j++) cur[j] = a === text2[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    prev = cur;
  }
  return prev[n];
}`,
 java:`class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        int m = text1.length(), n = text2.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                dp[i][j] = text1.charAt(i - 1) == text2.charAt(j - 1)
                        ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
        return dp[m][n];
    }
}`,
 cpp:`class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        int m = text1.size(), n = text2.size();
        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                dp[i][j] = text1[i - 1] == text2[j - 1] ? dp[i - 1][j - 1] + 1 : max(dp[i - 1][j], dp[i][j - 1]);
        return dp[m][n];
    }
};`});

P({n:309,s:'best-time-to-buy-and-sell-stock-with-cooldown',t:'Best Time to Buy and Sell Stock with Cooldown',c:'dp2',d:'Medium',rel:['memo'],
 sum:'Trade as many times as you like, holding at most one share, but after selling you must wait one day before buying again. Return the maximum profit.',
 ex:'[1, 2, 3, 0, 2] → 3 (buy, sell, cooldown, buy, sell)',
 h:['Model each day with states: holding a share, just sold, or resting (free to buy).','Write transitions: hold ← hold or rest − price; sold ← hold + price; rest ← rest or sold.','Compute all three new states from the previous day’s values.'],
 app:'Track three running values. hold = max(hold, rest − price): keep holding or buy today (only allowed from rest). sold = hold + price: sell today. rest = max(rest, sold): stay idle, or yesterday’s sale finishes its cooldown. The answer is max(sold, rest) after the last day.',
 tc:'O(n)',sc:'O(1)',
 py:`class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        hold, sold, rest = float("-inf"), 0, 0
        for p in prices:
            hold, sold, rest = max(hold, rest - p), hold + p, max(rest, sold)
        return max(sold, rest)`,
 js:`function maxProfit(prices) {
  let hold = -Infinity, sold = 0, rest = 0;
  for (const p of prices) [hold, sold, rest] = [Math.max(hold, rest - p), hold + p, Math.max(rest, sold)];
  return Math.max(sold, rest);
}`,
 java:`class Solution {
    public int maxProfit(int[] prices) {
        int hold = Integer.MIN_VALUE / 2, sold = 0, rest = 0;
        for (int p : prices) {
            int newHold = Math.max(hold, rest - p), newSold = hold + p, newRest = Math.max(rest, sold);
            hold = newHold; sold = newSold; rest = newRest;
        }
        return Math.max(sold, rest);
    }
}`,
 cpp:`class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int hold = INT_MIN / 2, sold = 0, rest = 0;
        for (int p : prices) {
            int newHold = max(hold, rest - p), newSold = hold + p, newRest = max(rest, sold);
            hold = newHold; sold = newSold; rest = newRest;
        }
        return max(sold, rest);
    }
};`});

P({n:518,s:'coin-change-ii',t:'Coin Change II',c:'dp2',d:'Medium',rel:['knapsack','coinchange'],
 sum:'Count the number of combinations of coins (unlimited supply) that make up the amount. Order doesn’t matter.',
 ex:'amount 5, coins [1, 2, 5] → 4',
 h:['Counting orderings (permutations) and combinations differ by loop order.','Put the coin loop outside and the amount loop inside, so each combination is built in coin order once.','dp[a] += dp[a − coin], with dp[0] = 1.'],
 app:'dp[a] = number of ways to make a using the coins processed so far. For each coin, sweep a from coin to amount upward (upward allows reusing the coin) and add dp[a − coin]. Because coins are introduced one at a time, {1, 2} and {2, 1} are never counted separately.',
 tc:'O(amount · coins)',sc:'O(amount)',
 py:`class Solution:
    def change(self, amount: int, coins: list[int]) -> int:
        dp = [1] + [0] * amount               # one way to make 0: use no coins
        for c in coins:                       # coins outside: combinations, not orderings
            for a in range(c, amount + 1):
                dp[a] += dp[a - c]
        return dp[amount]`,
 js:`function change(amount, coins) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;
  for (const c of coins) for (let a = c; a <= amount; a++) dp[a] += dp[a - c];
  return dp[amount];
}`,
 java:`class Solution {
    public int change(int amount, int[] coins) {
        long[] dp = new long[amount + 1];
        dp[0] = 1;
        for (int c : coins)
            for (int a = c; a <= amount; a++) dp[a] += dp[a - c];
        return (int) dp[amount];
    }
}`,
 cpp:`class Solution {
public:
    int change(int amount, vector<int>& coins) {
        vector<unsigned long long> dp(amount + 1, 0);
        dp[0] = 1;
        for (int c : coins)
            for (int a = c; a <= amount; a++) dp[a] += dp[a - c];
        return (int)dp[amount];
    }
};`});

P({n:494,s:'target-sum',t:'Target Sum',c:'dp2',d:'Medium',rel:['knapsack'],
 sum:'Put a + or − in front of each number. Count the sign assignments whose total equals the target.',
 ex:'[1, 1, 1, 1, 1], target 3 → 5',
 h:['Brute force is 2ⁿ assignments.','Split the numbers into a positive set P and a negative set N: sum(P) − sum(N) = target and sum(P) + sum(N) = total.','So sum(P) = (total + target) / 2: count subsets with that sum, a 0/1 knapsack count.'],
 app:'If total + target is odd or |target| > total, the answer is 0. Otherwise count subsets summing to s = (total + target) / 2 with dp[0] = 1 and, for each number x, dp[t] += dp[t − x] for t from s down to x.',
 tc:'O(n · total)',sc:'O(total)',
 py:`class Solution:
    def findTargetSumWays(self, nums: list[int], target: int) -> int:
        total = sum(nums)
        if abs(target) > total or (total + target) % 2:
            return 0
        s = (total + target) // 2              # required sum of the "+" numbers
        dp = [1] + [0] * s
        for x in nums:
            for t in range(s, x - 1, -1):      # backwards: each number used once
                dp[t] += dp[t - x]
        return dp[s]`,
 js:`function findTargetSumWays(nums, target) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (Math.abs(target) > total || (total + target) % 2) return 0;
  const s = (total + target) / 2, dp = new Array(s + 1).fill(0);
  dp[0] = 1;
  for (const x of nums) for (let t = s; t >= x; t--) dp[t] += dp[t - x];
  return dp[s];
}`,
 java:`class Solution {
    public int findTargetSumWays(int[] nums, int target) {
        int total = 0;
        for (int x : nums) total += x;
        if (Math.abs(target) > total || (total + target) % 2 != 0) return 0;
        int s = (total + target) / 2;
        int[] dp = new int[s + 1];
        dp[0] = 1;
        for (int x : nums)
            for (int t = s; t >= x; t--) dp[t] += dp[t - x];
        return dp[s];
    }
}`,
 cpp:`class Solution {
public:
    int findTargetSumWays(vector<int>& nums, int target) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        if (abs(target) > total || (total + target) % 2) return 0;
        int s = (total + target) / 2;
        vector<int> dp(s + 1, 0);
        dp[0] = 1;
        for (int x : nums)
            for (int t = s; t >= x; t--) dp[t] += dp[t - x];
        return dp[s];
    }
};`});

P({n:97,s:'interleaving-string',t:'Interleaving String',c:'dp2',d:'Medium',rel:['lcs'],
 sum:'Decide whether s3 can be formed by interleaving the characters of s1 and s2 while keeping each string’s own order.',
 ex:'"aabcc", "dbbca", "aadbbcbcac" → true',
 h:['Lengths must add up: |s1| + |s2| = |s3|.','dp[i][j] = can the first i characters of s1 and the first j of s2 form the first i + j of s3?','dp[i][j] is true if (dp[i − 1][j] and s1[i − 1] = s3[i + j − 1]) or (dp[i][j − 1] and s2[j − 1] = s3[i + j − 1]).'],
 app:'Fill the table with dp[0][0] = true, extending from the left or from above whenever the corresponding character of s3 matches. Use a single row of length |s2| + 1 updated in place.',
 tc:'O(m · n)',sc:'O(n)',
 py:`class Solution:
    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:
        m, n = len(s1), len(s2)
        if m + n != len(s3):
            return False
        dp = [False] * (n + 1)                  # dp[j] for the current i
        for i in range(m + 1):
            for j in range(n + 1):
                if i == 0 and j == 0:
                    dp[j] = True
                    continue
                from_s1 = i > 0 and dp[j] and s1[i - 1] == s3[i + j - 1]
                from_s2 = j > 0 and dp[j - 1] and s2[j - 1] == s3[i + j - 1]
                dp[j] = from_s1 or from_s2
        return dp[n]`,
 js:`function isInterleave(s1, s2, s3) {
  const m = s1.length, n = s2.length;
  if (m + n !== s3.length) return false;
  const dp = new Array(n + 1).fill(false);
  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      if (i === 0 && j === 0) { dp[0] = true; continue; }
      const a = i > 0 && dp[j] && s1[i - 1] === s3[i + j - 1];
      const b = j > 0 && dp[j - 1] && s2[j - 1] === s3[i + j - 1];
      dp[j] = a || b;
    }
  }
  return dp[n];
}`,
 java:`class Solution {
    public boolean isInterleave(String s1, String s2, String s3) {
        int m = s1.length(), n = s2.length();
        if (m + n != s3.length()) return false;
        boolean[] dp = new boolean[n + 1];
        for (int i = 0; i <= m; i++) {
            for (int j = 0; j <= n; j++) {
                if (i == 0 && j == 0) { dp[0] = true; continue; }
                boolean a = i > 0 && dp[j] && s1.charAt(i - 1) == s3.charAt(i + j - 1);
                boolean b = j > 0 && dp[j - 1] && s2.charAt(j - 1) == s3.charAt(i + j - 1);
                dp[j] = a || b;
            }
        }
        return dp[n];
    }
}`,
 cpp:`class Solution {
public:
    bool isInterleave(string s1, string s2, string s3) {
        int m = s1.size(), n = s2.size();
        if (m + n != (int)s3.size()) return false;
        vector<bool> dp(n + 1, false);
        for (int i = 0; i <= m; i++) {
            for (int j = 0; j <= n; j++) {
                if (i == 0 && j == 0) { dp[0] = true; continue; }
                bool a = i > 0 && dp[j] && s1[i - 1] == s3[i + j - 1];
                bool b = j > 0 && dp[j - 1] && s2[j - 1] == s3[i + j - 1];
                dp[j] = a || b;
            }
        }
        return dp[n];
    }
};`});

P({n:329,s:'longest-increasing-path-in-a-matrix',t:'Longest Increasing Path in a Matrix',c:'dp2',d:'Hard',rel:['dfs','memo','topo'],
 sum:'Return the length of the longest path in a matrix where each step moves up, down, left or right to a strictly larger value.',
 ex:'[[9, 9, 4], [6, 6, 8], [2, 1, 1]] → 4 (1 → 2 → 6 → 9)',
 h:['Paths only go uphill, so they can never loop: the moves form a DAG.','The longest path starting at a cell doesn’t depend on how you got there.','DFS with memoization: best(r, c) = 1 + max best(neighbor) over larger neighbors.'],
 app:'For every cell, compute best(r, c) with a memoized DFS that tries the four neighbors with a strictly greater value. Each cell is computed once, and every computation looks at four neighbors. The answer is the maximum over all cells.',
 tc:'O(m · n)',sc:'O(m · n)',
 py:`from functools import lru_cache

class Solution:
    def longestIncreasingPath(self, matrix: list[list[int]]) -> int:
        rows, cols = len(matrix), len(matrix[0])

        @lru_cache(maxsize=None)
        def best(r, c):                         # longest uphill path starting at (r, c)
            result = 1
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] > matrix[r][c]:
                    result = max(result, 1 + best(nr, nc))
            return result

        return max(best(r, c) for r in range(rows) for c in range(cols))`,
 js:`function longestIncreasingPath(matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  const memo = Array.from({ length: rows }, () => new Array(cols).fill(0));
  const best = (r, c) => {
    if (memo[r][c]) return memo[r][c];
    let result = 1;
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && matrix[nr][nc] > matrix[r][c])
        result = Math.max(result, 1 + best(nr, nc));
    }
    return (memo[r][c] = result);
  };
  let ans = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) ans = Math.max(ans, best(r, c));
  return ans;
}`,
 java:`class Solution {
    private int[][] memo, m;
    private int rows, cols;

    public int longestIncreasingPath(int[][] matrix) {
        m = matrix; rows = m.length; cols = m[0].length;
        memo = new int[rows][cols];
        int ans = 0;
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++) ans = Math.max(ans, best(r, c));
        return ans;
    }

    private int best(int r, int c) {
        if (memo[r][c] != 0) return memo[r][c];
        int result = 1;
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        for (int[] d : dirs) {
            int nr = r + d[0], nc = c + d[1];
            if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && m[nr][nc] > m[r][c])
                result = Math.max(result, 1 + best(nr, nc));
        }
        return memo[r][c] = result;
    }
}`,
 cpp:`class Solution {
    vector<vector<int>> memo;
    int best(vector<vector<int>>& m, int r, int c) {
        if (memo[r][c]) return memo[r][c];
        int result = 1, dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr >= 0 && nc >= 0 && nr < (int)m.size() && nc < (int)m[0].size() && m[nr][nc] > m[r][c])
                result = max(result, 1 + best(m, nr, nc));
        }
        return memo[r][c] = result;
    }
public:
    int longestIncreasingPath(vector<vector<int>>& matrix) {
        memo.assign(matrix.size(), vector<int>(matrix[0].size(), 0));
        int ans = 0;
        for (int r = 0; r < (int)matrix.size(); r++)
            for (int c = 0; c < (int)matrix[0].size(); c++) ans = max(ans, best(matrix, r, c));
        return ans;
    }
};`});

P({n:115,s:'distinct-subsequences',t:'Distinct Subsequences',c:'dp2',d:'Hard',rel:['lcs'],
 sum:'Count the number of distinct ways to delete characters from s so that what remains equals t.',
 ex:'s = "rabbbit", t = "rabbit" → 3',
 h:['dp[i][j] = ways to form the first j characters of t from the first i characters of s.','You can always skip s[i − 1]: dp[i − 1][j] ways.','If s[i − 1] = t[j − 1], you may also use it: add dp[i − 1][j − 1].'],
 app:'Base cases: an empty t can be formed one way (dp[i][0] = 1). Fill the table with dp[i][j] = dp[i − 1][j] + (match ? dp[i − 1][j − 1] : 0). In one dimension, iterate j downward so dp[j − 1] still refers to the previous row. Intermediate values can be large, so use 64-bit integers.',
 tc:'O(m · n)',sc:'O(n)',
 py:`class Solution:
    def numDistinct(self, s: str, t: str) -> int:
        n = len(t)
        dp = [1] + [0] * n                  # dp[j]: ways to form t[:j]
        for ch in s:
            for j in range(n, 0, -1):       # backwards so dp[j-1] is from the previous row
                if ch == t[j - 1]:
                    dp[j] += dp[j - 1]
        return dp[n]`,
 js:`function numDistinct(s, t) {
  const n = t.length, dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  for (const ch of s)
    for (let j = n; j > 0; j--) if (ch === t[j - 1]) dp[j] += dp[j - 1];
  return dp[n];
}`,
 java:`class Solution {
    public int numDistinct(String s, String t) {
        int n = t.length();
        long[] dp = new long[n + 1];
        dp[0] = 1;
        for (char ch : s.toCharArray())
            for (int j = n; j > 0; j--) if (ch == t.charAt(j - 1)) dp[j] += dp[j - 1];
        return (int) dp[n];
    }
}`,
 cpp:`class Solution {
public:
    int numDistinct(string s, string t) {
        int n = t.size();
        vector<unsigned long long> dp(n + 1, 0);
        dp[0] = 1;
        for (char ch : s)
            for (int j = n; j > 0; j--) if (ch == t[j - 1]) dp[j] += dp[j - 1];
        return (int)dp[n];
    }
};`});

P({n:72,s:'edit-distance',t:'Edit Distance',c:'dp2',d:'Medium',rel:['editdistance'],
 sum:'Return the minimum number of single-character inserts, deletes and replacements needed to turn word1 into word2.',
 ex:'"horse" → "ros" → 3',
 h:['dp[i][j] = edits to turn the first i characters of word1 into the first j of word2.','Base cases: dp[i][0] = i (delete everything), dp[0][j] = j (insert everything).','On a match copy the diagonal; otherwise 1 + min(delete, insert, replace).'],
 app:'Fill the table row by row, keeping only the previous row. When word1[i − 1] = word2[j − 1], dp[i][j] = dp[i − 1][j − 1]; otherwise dp[i][j] = 1 + min(dp[i − 1][j], dp[i][j − 1], dp[i − 1][j − 1]).',
 tc:'O(m · n)',sc:'O(n)',
 py:`class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        n = len(word2)
        prev = list(range(n + 1))
        for i, a in enumerate(word1, 1):
            cur = [i] + [0] * n
            for j in range(1, n + 1):
                if a == word2[j - 1]:
                    cur[j] = prev[j - 1]
                else:
                    cur[j] = 1 + min(prev[j], cur[j - 1], prev[j - 1])   # delete, insert, replace
            prev = cur
        return prev[n]`,
 js:`function minDistance(word1, word2) {
  const n = word2.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= word1.length; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++)
      cur[j] = word1[i - 1] === word2[j - 1] ? prev[j - 1] : 1 + Math.min(prev[j], cur[j - 1], prev[j - 1]);
    prev = cur;
  }
  return prev[n];
}`,
 java:`class Solution {
    public int minDistance(String word1, String word2) {
        int m = word1.length(), n = word2.length();
        int[] prev = new int[n + 1];
        for (int j = 0; j <= n; j++) prev[j] = j;
        for (int i = 1; i <= m; i++) {
            int[] cur = new int[n + 1];
            cur[0] = i;
            for (int j = 1; j <= n; j++)
                cur[j] = word1.charAt(i - 1) == word2.charAt(j - 1)
                        ? prev[j - 1] : 1 + Math.min(prev[j], Math.min(cur[j - 1], prev[j - 1]));
            prev = cur;
        }
        return prev[n];
    }
}`,
 cpp:`class Solution {
public:
    int minDistance(string word1, string word2) {
        int m = word1.size(), n = word2.size();
        vector<int> prev(n + 1), cur(n + 1);
        iota(prev.begin(), prev.end(), 0);
        for (int i = 1; i <= m; i++) {
            cur[0] = i;
            for (int j = 1; j <= n; j++)
                cur[j] = word1[i - 1] == word2[j - 1] ? prev[j - 1] : 1 + min({prev[j], cur[j - 1], prev[j - 1]});
            swap(prev, cur);
        }
        return prev[n];
    }
};`});

P({n:312,s:'burst-balloons',t:'Burst Balloons',c:'dp2',d:'Hard',rel:['memo'],
 sum:'Bursting balloon i earns nums[left] × nums[i] × nums[right], where left and right are its current neighbors (missing neighbors count as 1). Find the maximum total coins.',
 ex:'[3, 1, 5, 8] → 167',
 h:['Thinking about which balloon to burst first makes subproblems depend on each other.','Instead, choose which balloon in a range bursts last.','If k is last in the open interval (l, r), its neighbors at that moment are exactly l and r.'],
 app:'Pad the array with 1 at both ends. dp[l][r] = best coins from bursting every balloon strictly between l and r. For each k in between as the last one: dp[l][r] = max(dp[l][k] + nums[l] · nums[k] · nums[r] + dp[k][r]). Fill by increasing interval length; the answer is dp[0][n + 1].',
 tc:'O(n³)',sc:'O(n²)',
 py:`class Solution:
    def maxCoins(self, nums: list[int]) -> int:
        a = [1] + nums + [1]
        n = len(a)
        dp = [[0] * n for _ in range(n)]       # dp[l][r]: best for balloons strictly between l and r
        for length in range(2, n):
            for l in range(n - length):
                r = l + length
                for k in range(l + 1, r):      # k is the LAST balloon burst in (l, r)
                    dp[l][r] = max(dp[l][r], dp[l][k] + a[l] * a[k] * a[r] + dp[k][r])
        return dp[0][n - 1]`,
 js:`function maxCoins(nums) {
  const a = [1, ...nums, 1], n = a.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let len = 2; len < n; len++)
    for (let l = 0; l + len < n; l++) {
      const r = l + len;
      for (let k = l + 1; k < r; k++) dp[l][r] = Math.max(dp[l][r], dp[l][k] + a[l] * a[k] * a[r] + dp[k][r]);
    }
  return dp[0][n - 1];
}`,
 java:`class Solution {
    public int maxCoins(int[] nums) {
        int n = nums.length + 2;
        int[] a = new int[n];
        a[0] = a[n - 1] = 1;
        for (int i = 0; i < nums.length; i++) a[i + 1] = nums[i];
        int[][] dp = new int[n][n];
        for (int len = 2; len < n; len++)
            for (int l = 0; l + len < n; l++) {
                int r = l + len;
                for (int k = l + 1; k < r; k++)
                    dp[l][r] = Math.max(dp[l][r], dp[l][k] + a[l] * a[k] * a[r] + dp[k][r]);
            }
        return dp[0][n - 1];
    }
}`,
 cpp:`class Solution {
public:
    int maxCoins(vector<int>& nums) {
        vector<int> a = {1};
        a.insert(a.end(), nums.begin(), nums.end());
        a.push_back(1);
        int n = a.size();
        vector<vector<int>> dp(n, vector<int>(n, 0));
        for (int len = 2; len < n; len++)
            for (int l = 0; l + len < n; l++) {
                int r = l + len;
                for (int k = l + 1; k < r; k++)
                    dp[l][r] = max(dp[l][r], dp[l][k] + a[l] * a[k] * a[r] + dp[k][r]);
            }
        return dp[0][n - 1];
    }
};`});

P({n:10,s:'regular-expression-matching',t:'Regular Expression Matching',c:'dp2',d:'Hard',rel:['memo'],
 sum:'Implement full-string matching for patterns with "." (any single character) and "*" (zero or more of the preceding element).',
 ex:'"aa" vs "a*" → true · "ab" vs ".*" → true · "aa" vs "a" → false',
 h:['Work on suffixes: does s[i:] match p[j:]?','Check whether the first characters match (allowing ".").','If the next pattern character is "*", either skip “x*” entirely, or consume one matching character of s and stay on the same pattern position.'],
 app:'Define dp(i, j) = s[i:] matches p[j:]. If j reaches the end, the answer is i at the end. Let first = i < len(s) and p[j] in {s[i], "."}. If p[j + 1] is "*": dp(i, j + 2) or (first and dp(i + 1, j)). Otherwise: first and dp(i + 1, j + 1). Memoize over (i, j), or fill a bottom-up table.',
 tc:'O(m · n)',sc:'O(m · n)',
 py:`from functools import lru_cache

class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        @lru_cache(maxsize=None)
        def dp(i, j):                           # does s[i:] match p[j:]?
            if j == len(p):
                return i == len(s)
            first = i < len(s) and p[j] in (s[i], ".")
            if j + 1 < len(p) and p[j + 1] == "*":
                return dp(i, j + 2) or (first and dp(i + 1, j))   # skip "x*", or use it once more
            return first and dp(i + 1, j + 1)

        return dp(0, 0)`,
 js:`function isMatch(s, p) {
  const memo = new Map();
  const dp = (i, j) => {
    const key = i * (p.length + 1) + j;
    if (memo.has(key)) return memo.get(key);
    let res;
    if (j === p.length) res = i === s.length;
    else {
      const first = i < s.length && (p[j] === s[i] || p[j] === ".");
      if (j + 1 < p.length && p[j + 1] === "*") res = dp(i, j + 2) || (first && dp(i + 1, j));
      else res = first && dp(i + 1, j + 1);
    }
    memo.set(key, res);
    return res;
  };
  return dp(0, 0);
}`,
 java:`class Solution {
    public boolean isMatch(String s, String p) {
        int m = s.length(), n = p.length();
        boolean[][] dp = new boolean[m + 1][n + 1];      // dp[i][j]: s[i:] matches p[j:]
        dp[m][n] = true;
        for (int i = m; i >= 0; i--) {
            for (int j = n - 1; j >= 0; j--) {
                boolean first = i < m && (p.charAt(j) == s.charAt(i) || p.charAt(j) == '.');
                if (j + 1 < n && p.charAt(j + 1) == '*') dp[i][j] = dp[i][j + 2] || (first && dp[i + 1][j]);
                else dp[i][j] = first && dp[i + 1][j + 1];
            }
        }
        return dp[0][0];
    }
}`,
 cpp:`class Solution {
public:
    bool isMatch(string s, string p) {
        int m = s.size(), n = p.size();
        vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));   // dp[i][j]: s[i:] matches p[j:]
        dp[m][n] = true;
        for (int i = m; i >= 0; i--) {
            for (int j = n - 1; j >= 0; j--) {
                bool first = i < m && (p[j] == s[i] || p[j] == '.');
                if (j + 1 < n && p[j + 1] == '*') dp[i][j] = dp[i][j + 2] || (first && dp[i + 1][j]);
                else dp[i][j] = first && dp[i + 1][j + 1];
            }
        }
        return dp[0][0];
    }
};`});
