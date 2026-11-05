/* ===== Beginner-first additions — Algorithms batch 4 (tree traversals + graphs). ===== */

XPATCH('traversals', {
  plain: `Tree traversal is visiting every node of a tree in a defined order. The main orders are <b>pre-order</b> (node before its children), <b>in-order</b> (left, node, right — which lists a BST in sorted order), <b>post-order</b> (children before node), and <b>level-order</b> (top to bottom, row by row). Each order suits different jobs.`,
  analogy: `Think of exploring every room in a house, but by a fixed rule. <b>Depth-first</b> orders (pre/in/post) are like walking all the way down one hallway before coming back for the next — the difference is just <i>when</i> you note the current room (on the way in, between its branches, or on the way out). <b>Level-order</b> is like checking every room on floor 1, then every room on floor 2 — a tidy floor-by-floor sweep.`,
  keyterms: [
    ['Pre-order', 'Visit the node, then its left subtree, then its right — good for copying/serializing a tree.'],
    ['In-order', 'Left, node, right — on a BST this yields values in sorted order.'],
    ['Post-order', 'Children first, then the node — good for deleting or computing sizes bottom-up.'],
    ['Level-order (BFS)', 'Row by row from the top, using a queue.'],
    ['Recursion vs stack', 'Depth-first traversals are natural recursively (or with an explicit stack).']],
  recap: [
    `Traversal visits every tree node in a defined order.`,
    `<b>Pre / in / post-order</b> are depth-first — they differ only in <i>when</i> the node is visited relative to its children.`,
    `<b>In-order</b> on a BST produces sorted output; <b>post-order</b> suits bottom-up work; <b>pre-order</b> suits copying.`,
    `<b>Level-order</b> sweeps row by row using a queue (it’s BFS on a tree).`,
    `Depth-first orders are naturally recursive; level-order needs a queue.`]
});

XPATCH('bfs', {
  plain: `Breadth-first search explores a graph in <b>rings of increasing distance</b>: all the nodes one step from the start, then all two steps away, and so on. It uses a <b>queue</b> and, in an unweighted graph, finds the <b>shortest path</b> (fewest edges) to every node.`,
  analogy: `Drop a stone in a pond and watch the ripples spread outward in rings. BFS is those ripples: it reaches everything at distance 1 before anything at distance 2. Because it always reaches closer nodes first, the first time it touches a node is guaranteed to be by a shortest route.`,
  keyterms: [
    ['Breadth-first', 'Explore nearest nodes first, in expanding rings.'],
    ['Queue (FIFO)', 'The frontier structure — first in, first out keeps nodes in distance order.'],
    ['Visited set', 'Marks nodes already seen so you don’t revisit or loop.'],
    ['Shortest path (unweighted)', 'BFS finds the fewest-edges path in graphs with no edge weights.'],
    ['O(V + E)', 'Visits every vertex and edge once.']],
  recap: [
    `BFS explores in <b>rings of increasing distance</b> using a <b>queue</b>.`,
    `In an <b>unweighted</b> graph it finds the <b>shortest path</b> (fewest edges) to every node.`,
    `A <b>visited set</b> prevents revisiting and infinite loops.`,
    `It runs in <b>O(V + E)</b> (every vertex and edge once).`,
    `Use BFS for shortest steps, level-by-level processing, and nearest-first exploration.`]
});

XPATCH('dfs', {
  plain: `Depth-first search explores a graph by going <b>as deep as possible</b> down one path before backtracking to try another. It uses recursion (or an explicit stack). It doesn’t find shortest paths, but it’s the natural tool for exploring, detecting cycles, and listing connected components.`,
  analogy: `It’s how you’d explore a maze with a ball of string: follow a corridor to its end, and only when you hit a dead end do you backtrack to the last junction and try a different corridor. You commit fully to one path before considering alternatives.`,
  keyterms: [
    ['Depth-first', 'Follow one branch to the end, then backtrack.'],
    ['Stack / recursion', 'DFS uses the call stack (or an explicit stack) to remember where to backtrack.'],
    ['Backtracking', 'Returning to the last junction when a path is exhausted.'],
    ['Cycle detection', 'A back-edge to a node on the current path reveals a cycle.'],
    ['Connected components', 'Each DFS from an unvisited node maps out one component.']],
  recap: [
    `DFS goes <b>deep first</b>, backtracking at dead ends, via recursion or a stack.`,
    `It does <b>not</b> guarantee shortest paths (use BFS for that).`,
    `It naturally tracks the current path, making it ideal for <b>cycle detection</b> and <b>connected components</b>.`,
    `It runs in <b>O(V + E)</b>.`,
    `Pre/post-order tree traversals are DFS; topological sort is built on it.`]
});

XPATCH('topo', {
  plain: `Topological sort orders the nodes of a <b>directed acyclic graph</b> so that every dependency comes before the thing that depends on it. It answers “in what order can I do these tasks given their prerequisites?” — and it only exists if there are no cycles.`,
  analogy: `It’s working out the order to get dressed: socks before shoes, shirt before jacket. Some things have no relative order (socks vs shirt), but no valid order exists if the rules contradict themselves (A needs B, B needs A). Course prerequisites are the same idea — you need a valid sequence that respects every “must come first”.`,
  keyterms: [
    ['DAG', 'Directed Acyclic Graph — directed edges, no cycles (a cycle makes ordering impossible).'],
    ['Dependency / prerequisite', 'An edge A → B means A must come before B.'],
    ['Kahn’s algorithm', 'Repeatedly take a node with no remaining prerequisites (in-degree 0).'],
    ['DFS method', 'Do DFS and output nodes in reverse post-order.'],
    ['Cycle = no order', 'If a cycle exists, no valid topological order is possible.']],
  recap: [
    `Topological sort orders a <b>DAG</b> so every dependency comes before what needs it.`,
    `It answers task/prerequisite ordering questions (build order, course planning).`,
    `Two standard methods: <b>Kahn’s</b> (peel off in-degree-0 nodes) or <b>DFS reverse post-order</b>.`,
    `It <b>only exists if there are no cycles</b> — a cycle means contradictory requirements.`,
    `It runs in <b>O(V + E)</b>.`]
});

XPATCH('unionfind', {
  plain: `Union–Find (a “disjoint-set” structure) tracks a collection of items split into groups, and answers two questions almost instantly: “are these two in the same group?” (find) and “merge these two groups” (union). It’s the go-to for connectivity problems.`,
  analogy: `Think of merging friend groups. Each person points to a “group leader”; to check if two people are in the same group, follow each up to its leader and compare. To merge two groups, point one leader at the other. Over time you flatten these chains (so everyone points near the leader), making the checks effectively instant.`,
  keyterms: [
    ['Disjoint sets', 'Items partitioned into non-overlapping groups.'],
    ['Find', 'Which group an item belongs to (its representative/leader).'],
    ['Union', 'Merge the two groups containing two items.'],
    ['Path compression', 'Flattening the chain so items point directly at the leader — speeds up future finds.'],
    ['Union by rank/size', 'Attach the smaller tree under the larger to keep things shallow.'],
    ['Near O(1)', 'With both optimizations, operations are almost constant time (inverse-Ackermann).']],
  recap: [
    `Union–Find tracks items partitioned into groups, supporting fast <b>find</b> (which group?) and <b>union</b> (merge groups).`,
    `With <b>path compression</b> and <b>union by rank/size</b>, operations are effectively <b>O(1)</b>.`,
    `It’s the natural tool for connectivity: connected components, cycle detection in undirected graphs.`,
    `It’s the engine inside <b>Kruskal’s</b> minimum-spanning-tree algorithm.`,
    `Think “group leaders you keep flattening toward”.`]
});

XPATCH('dijkstra', {
  plain: `Dijkstra’s algorithm finds the <b>shortest path</b> in a graph whose edges have (non-negative) weights — like driving distances or times. It repeatedly settles the closest not-yet-finalized node, using a <b>priority queue</b> to always expand the cheapest frontier node next.`,
  analogy: `It’s how a sat-nav finds the quickest route. Starting from home, it always explores outward from whichever place it can currently reach most cheaply, locking in each place’s best-known travel time as it goes. Because it always finalizes the nearest unfinished place first, each one’s time is correct once settled.`,
  keyterms: [
    ['Weighted graph', 'Edges carry costs (distance, time, price).'],
    ['Priority queue', 'A min-heap that always yields the closest unsettled node — the engine of the search.'],
    ['Relaxation', 'Updating a neighbour’s best-known distance when a cheaper route is found.'],
    ['Non-negative weights', 'Required — negative edges break Dijkstra (use Bellman–Ford instead).'],
    ['O((V+E) log V)', 'With a binary-heap priority queue.']],
  recap: [
    `Dijkstra finds shortest paths in a graph with <b>non-negative weighted</b> edges.`,
    `It uses a <b>priority queue</b> to always expand the <b>cheapest-so-far</b> node, finalizing distances one at a time.`,
    `<b>Relaxation</b> updates a neighbour’s distance whenever a cheaper route appears.`,
    `It needs <b>non-negative</b> weights (negative edges require Bellman–Ford).`,
    `With a heap it runs in <b>O((V+E) log V)</b> — the standard weighted-shortest-path tool (and the core of map routing).`]
});

XPATCH('prim', {
  plain: `Prim’s algorithm builds a <b>minimum spanning tree</b> — the cheapest set of edges that connects every node with no cycles. It grows one connected blob outward from a starting node, each step adding the <b>cheapest edge</b> that reaches a node not yet in the tree.`,
  analogy: `You’re laying cable to connect a cluster of towns for the least total cost. Start at one town, and repeatedly lay the single cheapest cable that hooks up a new, not-yet-connected town. The blob of connected towns grows until all are joined, using the least cable overall.`,
  keyterms: [
    ['Minimum spanning tree (MST)', 'The cheapest set of edges connecting all nodes, cycle-free.'],
    ['Grow from a node', 'Prim expands one connected component outward.'],
    ['Cheapest crossing edge', 'Each step adds the least-cost edge from the tree to a new node.'],
    ['Priority queue', 'Tracks the cheapest edges leaving the growing tree.'],
    ['vs Kruskal', 'Prim grows one blob; Kruskal picks cheapest edges globally.']],
  recap: [
    `Prim builds a <b>minimum spanning tree</b>: cheapest edges connecting all nodes, no cycles.`,
    `It <b>grows one blob</b> from a start node, each step adding the cheapest edge to a new node.`,
    `A <b>priority queue</b> supplies the cheapest crossing edge quickly.`,
    `It’s a cousin of Dijkstra (same frontier idea, different quantity minimized).`,
    `Use it for “connect everything for the least total cost” — Prim grows outward, Kruskal (next) picks globally.`]
});

XPATCH('kruskal', {
  plain: `Kruskal’s algorithm also builds a <b>minimum spanning tree</b>, but with a different strategy: sort <i>all</i> the edges cheapest-first, and add each one unless it would create a cycle. It uses <b>Union–Find</b> to detect those cycles efficiently.`,
  analogy: `Same goal as Prim — connect all the towns for the least cable — but instead of growing one blob, you lay cables in order of price across the whole map: cheapest cable first, next cheapest, and so on, skipping any cable whose two towns are <i>already</i> connected (that would just make a wasteful loop).`,
  keyterms: [
    ['Minimum spanning tree (MST)', 'Same target as Prim: cheapest cycle-free connection of all nodes.'],
    ['Sort edges', 'Consider edges globally, cheapest first.'],
    ['Skip cycle-forming edges', 'Add an edge only if its endpoints aren’t already connected.'],
    ['Union–Find', 'The structure that checks “already connected?” in near-O(1).'],
    ['O(E log E)', 'Dominated by sorting the edges.']],
  recap: [
    `Kruskal builds an <b>MST</b> by taking edges <b>cheapest-first</b>, skipping any that would form a cycle.`,
    `It uses <b>Union–Find</b> to test “would this edge create a cycle?” efficiently.`,
    `Cost is <b>O(E log E)</b>, dominated by sorting the edges.`,
    `vs Prim: Kruskal picks edges <b>globally</b> by price; Prim <b>grows one blob</b> — both give a minimum spanning tree.`,
    `Great when edges are easy to sort and the graph is sparse.`]
});

XPATCH('floyd', {
  plain: `The Floyd–Warshall algorithm computes the shortest path between <b>every pair</b> of nodes at once. It’s a short, elegant dynamic program: for each possible “layover” node, it checks whether routing through it shortens any pair’s path, improving the whole distance table.`,
  analogy: `Imagine a full table of travel times between every pair of cities. Floyd–Warshall improves it one allowed layover at a time: “if I’m now allowed to change planes in city K, does any A→K→B trip beat the current A→B time?” After considering every city as a possible layover, every entry holds the true shortest time.`,
  keyterms: [
    ['All-pairs shortest paths', 'Shortest distance between every pair of nodes, not just from one source.'],
    ['Dynamic programming', 'Build the answer by allowing one more intermediate node at a time.'],
    ['Intermediate (layover) node', 'The node k you’re currently allowed to route through.'],
    ['Distance matrix', 'An n×n table of best-known distances, improved in place.'],
    ['O(n³)', 'Three nested loops over nodes — fine for small, dense graphs.']],
  recap: [
    `Floyd–Warshall finds shortest paths between <b>all pairs</b> of nodes in one go.`,
    `It’s a <b>dynamic program</b>: for each node k, test whether routing through k improves any A→B path.`,
    `It updates an n×n <b>distance matrix</b> in place over three nested loops.`,
    `Cost is <b>O(n³)</b> — best for small or dense graphs; it also handles negative edges (but not negative cycles).`,
    `Use it when you need every pairwise distance, not just from a single source (Dijkstra’s job).`]
});
