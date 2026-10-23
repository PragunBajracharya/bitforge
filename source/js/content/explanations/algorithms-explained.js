/* ===== Detailed explanations: algorithms ===== */
const EXPLAIN = {};
const X = (k, o) => { EXPLAIN[k] = o; };

/* ---------- Sorting ---------- */
X('bubble', {
 idea: 'Bubble sort repeatedly walks through the array comparing neighbors and swapping any pair that is out of order. Large values “bubble” toward the end, the way air bubbles rise in water. After the first pass the largest value is guaranteed to be in the last slot; after the second pass the second largest is in place, and so on.',
 steps: ['Start at index 0 and compare A[0] with A[1]. If A[0] is larger, swap them.', 'Move one step right and compare A[1] with A[2], swapping if needed. Continue to the end of the unsorted part.', 'The largest unsorted value has now been carried to the end. Shrink the unsorted part by one.', 'Repeat passes until a whole pass makes no swaps; at that point the array is sorted and you can stop early.'],
 why: 'Each pass performs a chain of swaps that carries the maximum of the unsorted region to its final position, because whenever the maximum is compared it is swapped forward. So after k passes the last k positions hold the k largest values in order. A pass with no swaps means every adjacent pair is in order, which means the entire array is sorted.',
 cost: 'Pass i makes n − 1 − i comparisons, so the total is (n − 1) + (n − 2) + … + 1 = n(n − 1)/2, which is O(n²). On already-sorted input the first pass makes no swaps and the algorithm stops after n − 1 comparisons: O(n). It sorts in place with O(1) extra memory and is stable because it only swaps strictly greater neighbors.',
 use: 'Bubble sort is almost never the right choice in practice; insertion sort beats it on every input. Its value is educational: it is the simplest sort to reason about and a good first example of loop invariants. The early-exit flag is the one detail worth remembering.'
});
X('insertion', {
 idea: 'Insertion sort builds a sorted prefix one element at a time, exactly like sorting a hand of playing cards: pick up the next card and slide it left past every card bigger than it.',
 steps: ['Treat A[0] alone as a sorted prefix.', 'Take the next element A[i] (the “key”).', 'Compare it with the element to its left. While that element is larger, shift it one place right (or swap).', 'Drop the key into the gap. The prefix A[0..i] is now sorted. Repeat for every i.'],
 why: 'The invariant is that before step i, A[0..i−1] is sorted. Inserting A[i] into its correct position among those values keeps the prefix sorted with one more element. When i reaches n, the prefix is the whole array.',
 cost: 'Each element moves left once per larger element before it, so the total work equals the number of inversions (out-of-order pairs). That is 0 for sorted input (O(n)), about n²/4 for random input, and n(n − 1)/2 for reversed input (O(n²)). It uses O(1) extra memory and is stable.',
 use: 'Insertion sort is the best simple sort: excellent on small arrays (under about 16–32 elements) and on nearly sorted data. That is why Timsort (Python, Java) and introsort (C++) switch to it for small subarrays. It is also “online”: it can sort data as it arrives.'
});
X('selection', {
 idea: 'Selection sort repeatedly selects the smallest remaining element and swaps it into the next position of the sorted prefix.',
 steps: ['Scan the whole unsorted part A[i..n−1] to find the index of its minimum.', 'Swap that minimum with A[i].', 'Now A[0..i] holds the i + 1 smallest values in order. Increase i and repeat until one element remains.'],
 why: 'After step i, position i holds the smallest value of everything that was still unsorted, and everything before it is smaller still. By induction the prefix is always the sorted list of the smallest values, so when it covers the array the array is sorted.',
 cost: 'Finding each minimum scans the remaining elements: (n − 1) + (n − 2) + … = n(n − 1)/2 comparisons in every case, so O(n²) even on sorted input. It makes at most n − 1 swaps, which is its one advantage. The long-distance swap can jump over equal values, so it is not stable.',
 use: 'Use it only when writes are far more expensive than reads (for example some flash memory), or as a teaching example. Heap sort is selection sort with a heap that finds the minimum in O(log n) instead of O(n).'
});
X('merge', {
 idea: 'Merge sort is divide and conquer: split the array in half, sort each half recursively, then merge the two sorted halves into one sorted array. Merging two sorted lists is easy because the smallest remaining item is always at the front of one of them.',
 steps: ['If the range has 0 or 1 elements, it is already sorted.', 'Split it at the midpoint into a left half and a right half.', 'Recursively sort both halves.', 'Merge: repeatedly compare the front elements of the two halves and move the smaller into the output. When one half runs out, copy the rest of the other.'],
 why: 'By induction both halves come back sorted. During the merge, the next output element is the smaller of the two fronts, which must be the smallest of everything remaining, because each half is sorted. So the merged output is sorted. Taking from the left half on ties keeps equal elements in their original order (stability).',
 cost: 'Each level of recursion merges a total of n elements, costing O(n). Halving the size each time gives log₂ n levels, so the total is O(n log n) in the best, average and worst case. The merge step needs a buffer, so extra space is O(n). The recurrence T(n) = 2T(n/2) + n solves to n log₂ n.',
 use: 'Choose merge sort when you need a guaranteed O(n log n), a stable sort, or are sorting linked lists or data too large for memory (external sorting merges sorted runs from disk). Timsort, used by Python and Java for objects, is a merge sort hybrid.'
});
X('quick', {
 idea: 'Quicksort picks a pivot, partitions the array so that smaller elements come before it and larger ones after, and then recursively sorts the two sides. The pivot ends up exactly where it belongs and is never moved again.',
 steps: ['Choose a pivot (here the last element; in practice a random element or median of three).', 'Partition: walk through the range keeping a boundary i. Every element smaller than the pivot is swapped to position i and i advances.', 'Swap the pivot into position i. Now everything left of i is smaller and everything right is larger or equal.', 'Recursively quicksort the left part and the right part.'],
 why: 'After partitioning, no element ever needs to cross the pivot’s position, because all smaller elements are already on its left and all larger on its right. Sorting each side independently therefore sorts the whole range. The recursion ends on ranges of size 0 or 1.',
 cost: 'If pivots split the range roughly in half, there are about log n levels of O(n) partitioning work: O(n log n). If the pivot is always the smallest or largest element (for example sorted input with a last-element pivot), one side is empty and there are n levels: O(n²). Random pivots make the bad case vanishingly unlikely. Extra space is the recursion stack, O(log n) on average. It is not stable.',
 use: 'Quicksort is usually the fastest general-purpose comparison sort in practice because it works in place and accesses memory sequentially. Production versions (introsort in C++) pick pivots carefully, switch to insertion sort for small ranges, and fall back to heap sort if recursion gets too deep.'
});
X('heapsort', {
 idea: 'Heap sort first rearranges the array into a max-heap (every parent ≥ its children), so the largest element sits at index 0. It then repeatedly swaps that maximum to the end of the array and repairs the heap on the remaining elements.',
 steps: ['Build a max-heap: for every non-leaf index from the last one down to 0, sift its value down until it is larger than both children.', 'Swap the root (the maximum) with the last element of the heap. That position is now final.', 'Shrink the heap by one and sift the new root down to restore the heap property.', 'Repeat until the heap has one element.'],
 why: 'The heap property guarantees the maximum of the heap is at the root. Each extraction places the current maximum just before the previously placed values, so the end of the array fills from largest to smallest. Sift-down only swaps a parent with its larger child, which restores the heap property along one root-to-leaf path.',
 cost: 'Building the heap bottom-up is O(n), because most nodes are near the leaves and sift down only a level or two. Each of the n extractions costs O(log n) for the sift-down, so the total is O(n log n) in every case, with O(1) extra memory. It is not stable.',
 use: 'Heap sort gives a guaranteed O(n log n) without extra memory, which is why introsort uses it as a fallback. In everyday code it is slower than quicksort because it jumps around memory. The heap itself (a priority queue) is far more widely used than heap sort.'
});
X('counting', {
 idea: 'Counting sort doesn’t compare elements at all. When values are small integers in a known range, it simply counts how many times each value occurs and then writes the values back out in order.',
 steps: ['Find the minimum and maximum values to know the range k = max − min + 1.', 'Create k counters set to zero and count each value.', 'Optionally turn the counts into prefix sums to know where each value’s block starts (needed for a stable version that moves whole records).', 'Write each value out as many times as it was counted, in increasing order.'],
 why: 'The output contains every value exactly as many times as it appeared, and values are emitted in increasing order of the counter index, so the result is sorted. No comparison between elements is ever made.',
 cost: 'Counting is O(n) and walking the counters is O(k), so the total is O(n + k) time and O(k) extra space. The Ω(n log n) lower bound applies only to comparison sorts, which is why counting sort can beat it. If k is huge compared to n (for example 64-bit IDs), the counter array becomes impractical.',
 use: 'Use it for small integer ranges: ages, exam scores, bytes, digits. Radix sort applies a stable counting sort once per digit to sort large integers or fixed-length strings in O(d · (n + b)).'
});

/* ---------- Searching ---------- */
X('binary', {
 idea: 'Binary search finds a value in a sorted array by comparing it with the middle element. One comparison tells you which half the target must be in, so you can discard the other half entirely.',
 steps: ['Set lo = 0 and hi = n − 1. The target, if present, is somewhere in A[lo..hi].', 'Compute mid = lo + (hi − lo) / 2.', 'If A[mid] equals the target, return mid.', 'If A[mid] is smaller, the target must be to the right: set lo = mid + 1. Otherwise set hi = mid − 1.', 'Repeat while lo ≤ hi. If the range becomes empty, the target is not present.'],
 why: 'The invariant is “if the target exists, it is in A[lo..hi]”. It starts true, and each update only removes elements that cannot be the target, because the array is sorted: everything left of a too-small mid is also too small. Since the range shrinks every step, the loop terminates.',
 cost: 'Each step halves the range, so after k steps at most n / 2ᵏ elements remain. The loop ends when that falls below 1, which is after about log₂ n + 1 steps: O(log n). A million elements need at most 20 comparisons. The iterative version uses O(1) memory.',
 use: 'Use it whenever data is sorted and you search repeatedly. Common bugs are off-by-one errors in the bounds and computing (lo + hi) / 2, which can overflow fixed-width integers. Many languages provide it: bisect in Python, Arrays.binarySearch in Java, std::lower_bound in C++.'
});
X('lowerbound', {
 idea: 'Binary search works on more than arrays. Whenever a yes/no question flips from “no” to “yes” exactly once as a number increases, you can binary search for the flip point. Lower bound (the first index with A[i] ≥ x) is the simplest case; “the smallest capacity that works” is the same pattern applied to answers instead of indices.',
 steps: ['Identify a predicate feasible(x) that is false for small x and true for all large x.', 'Find a range [lo, hi] that surely contains the smallest feasible value.', 'Check feasible(mid). If true, the answer is mid or smaller: hi = mid. If false, the answer is larger: lo = mid + 1.', 'Stop when lo = hi; that value is the smallest feasible one.'],
 why: 'Because the predicate is monotonic, a true result at mid means every value above mid is also true, so the first true can’t be above mid. A false result means everything at or below mid is false. Each step keeps the first true value inside [lo, hi] while shrinking the range.',
 cost: 'The search takes O(log R) steps where R is the size of the answer range, and each step costs one feasibility check, often O(n). Ship-capacity style problems therefore run in O(n log(sum of weights)).',
 use: 'Signals: “minimize the maximum”, “smallest speed / capacity / time such that…”, or any problem where checking a candidate answer is easier than computing it directly. Use the half-open form [lo, hi) consistently to avoid off-by-one bugs.'
});
X('quickselect', {
 idea: 'Quickselect finds the k-th smallest element without fully sorting. It partitions around a pivot like quicksort, but then continues only into the side that contains position k.',
 steps: ['Pick a random pivot and partition the current range so smaller elements are left of it.', 'The pivot lands at its final sorted index p.', 'If p = k, the pivot is the answer.', 'If p < k, search only the right part; if p > k, search only the left part. Repeat.'],
 why: 'After partitioning, the pivot is exactly where it would be in the sorted array, everything to its left is smaller and everything to its right is larger. So the k-th smallest is the pivot or lies entirely within one side, and the other side can be discarded.',
 cost: 'With good pivots the sizes shrink geometrically: n + n/2 + n/4 + … ≈ 2n, so O(n) on average. Consistently bad pivots give O(n²), which random pivots make extremely unlikely. The median-of-medians pivot rule guarantees O(n) worst case but is slower in practice. It uses O(1) extra memory when written iteratively.',
 use: 'Use it for medians, percentiles, and “k-th largest” questions when you don’t need the rest sorted. C++ provides std::nth_element. If the data is a stream or k is small, a heap of size k (O(n log k)) is often simpler.'
});

/* ---------- Array patterns ---------- */
X('twopointers', {
 idea: 'Two pointers keeps two indices into the data and moves them according to a rule, so that each move rules out a whole group of candidates. On sorted data, pointers at both ends can find pairs in one pass instead of checking every pair.',
 steps: ['Place i at the start and j at the end of a sorted array.', 'Look at A[i] + A[j]. If it equals the target, you’re done.', 'If the sum is too small, A[i] can’t pair with anything remaining (A[j] is its largest possible partner), so move i right.', 'If the sum is too large, A[j] is useless for the same reason, so move j left. Repeat while i < j.'],
 why: 'Every move discards one element together with all the pairs it could still form, and the argument above shows none of those pairs can be the answer. Since the answer pair is never discarded, the pointers will meet it before they cross.',
 cost: 'Each pointer moves at most n times in one direction, so the scan is O(n) time and O(1) space, compared with O(n²) for checking every pair. If the input isn’t sorted, sorting first adds O(n log n).',
 use: 'Use opposite-end pointers for pair sums, palindromes, container-with-most-water and 3Sum (a loop around a two-pointer scan). Use same-direction (fast/slow) pointers to remove duplicates in place, partition arrays, or detect cycles in linked lists.'
});
X('slidingwindow', {
 idea: 'A sliding window is a contiguous range [left, right] that moves across the array. You grow it by moving right and shrink it by moving left, keeping a running summary (a sum, a count of characters) instead of recomputing it from scratch.',
 steps: ['Move right forward one element at a time and add that element to the window’s summary.', 'While the window satisfies (or violates) the condition, record the answer if it’s better and remove A[left] from the summary, moving left forward.', 'Continue until right reaches the end.'],
 why: 'For problems where shrinking a valid window can only make it “less valid” (all values positive, or a count limit), the best window ending at each right index can be found by moving left monotonically. No window that the algorithm skips could have been better, because left never needs to move backwards.',
 cost: 'Each element is added once when right passes it and removed at most once when left passes it, so the total work is O(n) even though there is a loop inside a loop. Extra space is O(1) for sums or O(alphabet) for character counts.',
 use: 'Signals: “longest/shortest substring or subarray such that…”, “at most k distinct”, “contains all characters of”. Fixed-size windows add the new element and drop the one that slid out. With negative numbers, sum-based windows break; use prefix sums with a hash map instead.'
});
X('prefixsum', {
 idea: 'A prefix sum array stores running totals: P[i] is the sum of the first i elements. Any contiguous range sum is then the difference of two prefix sums, so range queries cost O(1) after one O(n) pass.',
 steps: ['Set P[0] = 0.', 'For each i, set P[i + 1] = P[i] + A[i].', 'To get the sum of A[l..r], compute P[r + 1] − P[l].'],
 why: 'P[r + 1] is the sum of A[0..r] and P[l] is the sum of A[0..l − 1]. Subtracting removes exactly the elements before l, leaving A[l..r]. The leading zero makes the formula work for l = 0 without a special case.',
 cost: 'Building takes O(n) time and O(n) space; each query is O(1). If values change frequently, each update would cost O(n) to rebuild, so a Fenwick tree or segment tree (O(log n) per update and query) is better.',
 use: 'Use prefix sums for many range-sum queries, for counting subarrays with sum k (store prefix sums seen so far in a hash map and look up P − k), and in 2D as a summed-area table for rectangle sums in images and grids.'
});
X('kadane', {
 idea: 'Kadane’s algorithm finds the maximum-sum contiguous subarray in one pass. At each position it asks: is it better to extend the best run that ends just before me, or to start a new run here?',
 steps: ['Set cur = best = A[0].', 'For each next element x, set cur = max(x, cur + x). This is the best sum of a subarray ending exactly at x.', 'Set best = max(best, cur).', 'After the loop, best is the answer.'],
 why: 'Any subarray ending at index i either is just A[i] or extends a subarray ending at i − 1, and the best extension uses the best such subarray. That makes cur exactly the optimal value for subarrays ending at i (a tiny dynamic program). The overall answer must end somewhere, so the maximum over all cur values is correct.',
 cost: 'One pass with two variables: O(n) time and O(1) space, compared with O(n²) for trying every start with a running sum.',
 use: 'Use it for maximum subarray and its variants: best time to buy and sell stock is Kadane on daily price differences, and maximum product subarray tracks both a maximum and a minimum because a negative flips them. Initialize with A[0], not 0, so all-negative arrays work.'
});
X('monostack', {
 idea: 'A monotonic stack keeps its elements in sorted order. When a new element would break the order, the elements it pops have just found their answer: the new element is their next greater (or smaller) value.',
 steps: ['Scan the array left to right, keeping a stack of indices whose values decrease from bottom to top.', 'For the current value, pop every index whose value is smaller; the current value is that index’s next greater element.', 'Push the current index.', 'Indices left on the stack at the end have no greater element to their right.'],
 why: 'An index stays on the stack exactly until the first larger value appears, which is precisely its next greater element. Values on the stack are decreasing, so a new value pops a contiguous group from the top and never needs to look deeper.',
 cost: 'Every index is pushed once and popped at most once, so the total work is O(n) despite the inner while loop. The stack uses O(n) space.',
 use: 'Signals: next/previous greater or smaller element, days until a warmer temperature, stock span, largest rectangle in a histogram, trapping rain water. Store indices rather than values so you can compute distances and write answers back.'
});

/* ---------- Graphs ---------- */
X('bfs', {
 idea: 'Breadth-first search explores a graph in rings: first the start, then all its neighbors, then all their unvisited neighbors, and so on. A queue keeps nodes in the order they were discovered.',
 steps: ['Put the start node in a queue and mark it seen.', 'Remove the node at the front of the queue.', 'If it is the goal, follow parent links back to build the path.', 'Otherwise, for each neighbor not yet seen, mark it seen, record its parent, and add it to the back of the queue.', 'Repeat until the queue is empty.'],
 why: 'Nodes leave the queue in order of their distance from the start: all distance-1 nodes are enqueued before any distance-2 node, and so on. So the first time BFS reaches a node, it has used the fewest possible edges, which makes BFS paths shortest in unweighted graphs.',
 cost: 'Each node is enqueued once and each edge is examined once (twice in undirected graphs), so the time is O(V + E). The queue and parent map use O(V) space. On a grid, V is the number of cells and each has at most 4 edges.',
 use: 'Use BFS for shortest paths with equal edge costs, level-by-level tree traversal, multi-source spreading (rotting oranges, distance to nearest gate), and word ladders. Mark nodes seen when you enqueue them, not when you dequeue them, to avoid adding duplicates.'
});
X('dfs', {
 idea: 'Depth-first search follows one path as far as it can, then backtracks to the most recent node with unexplored neighbors. It uses a stack, either explicitly or through recursion.',
 steps: ['Push the start node onto a stack and mark it seen.', 'Pop the top node.', 'If it is the goal, stop.', 'Push each unseen neighbor (marking it seen and recording its parent).', 'Repeat until the stack is empty. The recursive version simply calls itself on each unseen neighbor.'],
 why: 'Every node reachable from the start is eventually pushed, because each visited node pushes all its unseen neighbors and nothing is ever discarded unvisited. The “seen” set prevents infinite loops in graphs with cycles.',
 cost: 'Like BFS, each node and edge is handled once: O(V + E) time and O(V) space. The path DFS finds is a valid path but not necessarily the shortest.',
 use: 'Use DFS for reachability, counting connected components (islands), cycle detection, topological sorting by finishing time, and backtracking searches. On very deep graphs, recursive DFS can overflow the call stack; switch to an explicit stack.'
});
X('topo', {
 idea: 'A topological order lists the nodes of a directed acyclic graph so that every edge points forward, like scheduling courses so prerequisites come first. Kahn’s algorithm repeatedly takes a node that no remaining node depends on.',
 steps: ['Compute each node’s in-degree: the number of edges pointing into it.', 'Put every node with in-degree 0 into a queue; they have no prerequisites.', 'Remove a node from the queue and append it to the order.', 'For each edge from that node, decrement the target’s in-degree; if it reaches 0, enqueue the target.', 'When the queue empties, if every node was output you have a valid order; otherwise the graph has a cycle.'],
 why: 'A node is output only after all nodes pointing to it have been output (its in-degree must have dropped to 0), so every edge goes from earlier to later. Nodes on a cycle always keep at least one incoming edge from another cycle node, so they never reach in-degree 0, which is why a short output reveals a cycle.',
 cost: 'Computing in-degrees, processing each node and each edge once gives O(V + E) time and O(V + E) space for the adjacency list.',
 use: 'Use it for build systems, course schedules, spreadsheet recalculation, package installation order, and deriving letter order in Alien Dictionary. A DFS that outputs nodes in reverse finishing order is the main alternative.'
});
X('unionfind', {
 idea: 'Union–find (disjoint set union) tracks which items belong to the same group. Each group is a tree whose root is its representative; find walks to the root, and union links two roots.',
 steps: ['Start with every item as its own root: parent[i] = i.', 'find(x): follow parent pointers until reaching a root. Along the way, point nodes closer to the root (path compression).', 'union(a, b): find both roots. If they are the same, a and b are already connected. Otherwise attach the shorter tree under the taller one (union by rank).', 'Two items are connected exactly when find returns the same root for both.'],
 why: 'Each group is exactly one tree, so “same root” means “same group”. Union merges two trees into one, which is what joining two groups means. Path compression and union by rank only change tree shapes, never which root a node belongs to.',
 cost: 'With both optimizations, any sequence of m operations runs in O(m · α(n)), where α is the inverse Ackermann function, at most 4 for any realistic n, so effectively constant time per operation. Memory is O(n).',
 use: 'Use it for connected components that are added over time, cycle detection when adding undirected edges (Redundant Connection), Kruskal’s minimum spanning tree, and grouping problems such as accounts merge or percolation.'
});
X('dijkstra', {
 idea: 'Dijkstra’s algorithm finds the shortest distance from one source to every node when edge weights are non-negative. It always finalizes the closest node it hasn’t finalized yet, using a priority queue.',
 steps: ['Set dist[source] = 0 and all others to ∞. Push (0, source) into a min-heap.', 'Pop the node u with the smallest distance. If that entry is outdated (bigger than dist[u]), skip it.', 'For each edge u → v with weight w, if dist[u] + w < dist[v], update dist[v] and push (dist[v], v).', 'Repeat until the heap is empty.'],
 why: 'When a node is popped with the smallest tentative distance, no other route can reach it more cheaply: any other route would have to pass through a node that is at least as far away, and with non-negative weights it can only get longer from there. So popped distances are final. This greedy argument fails with negative edges.',
 cost: 'With a binary heap, each edge can cause one push (O(log V)) and each node is finalized once, giving O((V + E) log V). Using lazy deletion (skipping stale entries) keeps the code simple at the cost of up to E heap entries. A Fibonacci heap improves this to O(E + V log V) in theory.',
 use: 'Use it for road networks, network latency (Network Delay Time), and minimax-path variants like Swim in Rising Water where the “distance” is the largest edge seen. For unweighted graphs BFS is simpler; with negative weights use Bellman–Ford.'
});
X('prim', {
 idea: 'Prim’s algorithm grows a minimum spanning tree from one starting node. At each step it adds the cheapest edge that connects a node inside the tree to a node outside it.',
 steps: ['Start with any node in the tree. Push its edges into a min-heap keyed by weight.', 'Pop the cheapest edge. If its endpoint is already in the tree, skip it.', 'Otherwise add that node to the tree, add the edge’s weight to the total, and push the new node’s edges to outside nodes.', 'Repeat until every node is in the tree.'],
 why: 'The cut property says the lightest edge crossing any cut between two groups of nodes belongs to some minimum spanning tree. Prim’s choice is exactly the lightest edge crossing the cut between “in the tree” and “not yet in the tree”, so every edge it adds is safe.',
 cost: 'With a binary heap, O(E log V). For dense graphs, such as all-pairs distances between points, an array-based version that scans for the minimum is O(V²) and avoids storing E = V² edges.',
 use: 'Use Prim on dense graphs or when the graph is given implicitly (Min Cost to Connect All Points). Use Kruskal when you already have an edge list and the graph is sparse. Both give the same total weight.'
});
X('kruskal', {
 idea: 'Kruskal’s algorithm builds a minimum spanning tree by considering edges from cheapest to most expensive, keeping each edge unless it would form a cycle.',
 steps: ['Sort all edges by weight.', 'Make every node its own union–find set.', 'For each edge (u, v), if u and v are in different sets, keep the edge and union the sets. Otherwise skip it; it would close a cycle.', 'Stop after keeping V − 1 edges.'],
 why: 'Each kept edge is the lightest edge connecting two different components, so by the cut property it belongs to some minimum spanning tree. Skipped edges connect nodes already joined by cheaper edges and are never needed.',
 cost: 'Sorting costs O(E log E). The union–find operations are nearly constant each, so the total is O(E log E), with O(V) extra space for union–find.',
 use: 'Use it for network design, clustering (stop early to leave k components), and any problem with an explicit edge list. It is a classic demonstration that a greedy algorithm can be provably optimal.'
});

/* ---------- Trees ---------- */
X('traversals', {
 idea: 'A traversal visits every node of a tree in a fixed order. Depth-first traversals (preorder, inorder, postorder) differ only in when they visit the node relative to its children; level order goes breadth-first, one level at a time.',
 steps: ['Preorder: visit the node, then traverse the left subtree, then the right.', 'Inorder: traverse the left subtree, visit the node, then traverse the right.', 'Postorder: traverse left, traverse right, then visit the node.', 'Level order: use a queue; pop a node, visit it, push its children. Read the queue size first to process exactly one level at a time.'],
 why: 'Each recursive traversal visits the node once and recurses once into each child, so every node is visited exactly once. For a binary search tree, inorder visits everything smaller than a node before it and everything larger after it, which produces sorted order.',
 cost: 'All traversals are O(n) time. Recursive DFS uses O(h) stack space, where h is the height (O(log n) when balanced, O(n) for a chain). Level order holds up to one level in the queue, O(w) for the widest level.',
 use: 'Preorder copies or serializes a tree; inorder lists a BST in order or validates it; postorder computes values that depend on children (heights, diameters, path sums) and deletes trees; level order answers per-level questions such as right side view.'
});
X('bst', {
 idea: 'A binary search tree keeps every key in the left subtree smaller than the node and every key in the right subtree larger. That ordering lets search, insert and delete follow a single path from the root, like binary search on a linked structure.',
 steps: ['Search: compare the key with the node; go left if smaller, right if larger, stop if equal or null.', 'Insert: search for the key and attach a new node where the search fell off the tree.', 'Delete a leaf or a node with one child: replace it with its child (or nothing).', 'Delete a node with two children: copy its inorder successor (the smallest key in its right subtree) into it, then delete that successor, which has at most one child.'],
 why: 'The ordering property means that at each node only one subtree can contain the key, so a single path is enough. The successor is larger than everything on the left and smaller than everything else on the right, so moving it into the deleted node’s place keeps the ordering valid.',
 cost: 'Every operation is O(h). A balanced tree has h ≈ log₂ n, but inserting keys in sorted order produces a chain with h = n, making operations O(n). Self-balancing trees (AVL, red–black) rotate nodes to keep h = O(log n).',
 use: 'Ordered maps and sets (std::map, Java TreeMap) are balanced BSTs; use them when you need sorted iteration, floor/ceiling queries or range queries. For pure lookups, a hash table is usually faster.'
});
X('binheap', {
 idea: 'A binary heap is a complete binary tree stored in an array where every parent is no larger than its children (a min-heap). The minimum is always at index 0, and both insertion and removal need only fix one root-to-leaf path.',
 steps: ['The children of index i are 2i + 1 and 2i + 2; its parent is (i − 1) / 2.', 'Push: append the value at the end, then swap it upward while it is smaller than its parent (sift up).', 'Pop: save the root, move the last element to the root, then swap it downward with its smaller child while it is larger (sift down).', 'Peek: read index 0.'],
 why: 'Sift-up and sift-down each restore the heap property along the only path that could have been disturbed. Because the tree is complete, the array has no gaps and the height is ⌊log₂ n⌋.',
 cost: 'Push and pop are O(log n); peek is O(1). Building a heap from n items bottom-up is O(n). Searching for an arbitrary value is O(n), because a heap is only partially ordered. Memory is just the array.',
 use: 'Use a heap for priority queues: scheduling, Dijkstra and Prim, merging k sorted lists, the k largest elements (keep a min-heap of size k), and running medians (two heaps). Python’s heapq, Java’s PriorityQueue and C++’s priority_queue are binary heaps.'
});
X('trie', {
 idea: 'A trie stores strings character by character in a tree. Words that share a prefix share a path, so asking “does any word start with this prefix?” costs time proportional to the prefix, not to the number of words.',
 steps: ['The root represents the empty string. Each node maps a character to a child node.', 'Insert: walk down from the root, creating missing children, and mark the final node as “end of word”.', 'Search: walk the characters; fail if a child is missing; succeed only if the final node is marked.', 'Prefix check: the same walk, but succeed whenever the path exists.'],
 why: 'The path from the root to a node spells exactly one string, so each stored word corresponds to one marked node. A prefix exists in the set exactly when its path exists, because inserting any word creates every node along its prefix.',
 cost: 'Insert and search are O(L) for a word of length L, independent of how many words are stored. Memory is O(total characters) nodes, each holding either a 26-slot array (fast, larger) or a hash map (compact, slower).',
 use: 'Use tries for autocomplete, spell checkers, IP routing tables (longest prefix match), wildcard word search, and searching a grid for many words at once (Word Search II), where one DFS checks every word simultaneously.'
});

/* ---------- Dynamic programming ---------- */
X('memo', {
 idea: 'Dynamic programming solves problems whose subproblems repeat. Instead of recomputing the same subproblem many times, you store each answer the first time and reuse it. Fibonacci is the classic example: naive recursion recomputes fib(3) over and over.',
 steps: ['Write the recurrence: fib(n) = fib(n − 1) + fib(n − 2), with fib(0) = 0 and fib(1) = 1.', 'Top-down (memoization): keep the recursion but check a cache first and store each result before returning.', 'Bottom-up (tabulation): fill answers from the base cases upward in a loop, so every dependency is ready before it is needed.', 'If each answer depends only on the previous few, keep just those few variables.'],
 why: 'Overlapping subproblems means the same inputs recur; optimal substructure means the answer is built from answers to smaller inputs. Under those conditions caching changes nothing about correctness, only how often work is repeated.',
 cost: 'Naive recursion makes about φⁿ ≈ 1.6ⁿ calls: exponential. With memoization each of the n subproblems is solved once in O(1), so O(n) time and O(n) space. Bottom-up with two variables needs O(1) space.',
 use: 'Every DP problem follows the same four steps: define the state (what the subproblem is), write the recurrence, fix the base cases, and choose an evaluation order. Start top-down because it is easiest to get right, then convert to bottom-up if recursion depth or memory matters.'
});
X('knapsack', {
 idea: 'In 0/1 knapsack you choose items, each with a weight and a value, to maximize total value without exceeding a capacity. Each item can be taken at most once. DP tracks the best value achievable for every capacity.',
 steps: ['Let dp[c] be the best value using the items processed so far with capacity c. Start with all zeros.', 'For each item (w, v), loop c from the capacity down to w.', 'Set dp[c] = max(dp[c], dp[c − w] + v): either skip the item or take it and use the best solution for the remaining capacity.', 'After all items, dp[capacity] is the answer.'],
 why: 'For each item there are only two choices, and the best solution with the item taken is v plus the best solution for capacity c − w without it. Looping capacity downward guarantees dp[c − w] still refers to the state before this item was considered, so it can’t be used twice.',
 cost: 'There are n items and W capacities, each updated in O(1): O(n · W) time and O(W) space with the one-row trick. This is pseudo-polynomial: fast when W is small, but W can be exponential in the number of input bits.',
 use: 'The same pattern solves Partition Equal Subset Sum (can we reach exactly half the total?), Target Sum (count subsets with a given sum), and resource allocation. Looping capacity upward instead gives the unbounded knapsack, where items can be reused, as in Coin Change.'
});
X('lcs', {
 idea: 'The longest common subsequence of two strings is the longest sequence of characters that appears in both in the same order, though not necessarily contiguously. A 2D table compares every prefix of one string with every prefix of the other.',
 steps: ['Let dp[i][j] be the LCS length of the first i characters of a and the first j characters of b. Row 0 and column 0 are 0.', 'If a[i − 1] = b[j − 1], the last characters can be matched: dp[i][j] = dp[i − 1][j − 1] + 1.', 'Otherwise one of them isn’t in the LCS: dp[i][j] = max(dp[i − 1][j], dp[i][j − 1]).', 'The answer is dp[m][n]. Walking back through the table recovers the subsequence itself.'],
 why: 'If the last characters match, some optimal LCS uses that match, leaving the LCS of the shorter prefixes. If they don’t match, at least one of the two characters is unused, so dropping it loses nothing. These two cases cover every possibility.',
 cost: 'Filling an (m + 1) × (n + 1) table with O(1) per cell takes O(m · n) time. Length-only answers need just two rows: O(min(m, n)) space.',
 use: 'LCS underlies diff tools, version control merges and DNA sequence comparison. The same table shape solves edit distance, interleaving strings, distinct subsequences and many other two-string DP problems.'
});
X('lis', {
 idea: 'The longest increasing subsequence picks the longest strictly increasing sequence of elements in order. The O(n log n) method keeps, for each possible length, the smallest value that can end an increasing subsequence of that length.',
 steps: ['Keep an array tails, initially empty.', 'For each value x, binary search for the first tail ≥ x.', 'If none exists, append x: you have extended the longest subsequence by one.', 'Otherwise replace that tail with x: you have found a smaller ending for subsequences of that length, which leaves more room for future values.', 'The length of tails is the answer.'],
 why: 'tails is always sorted, because a longer increasing subsequence must end with a larger value than the smallest ending of a shorter one. Keeping the smallest possible tail for each length can only help future extensions. Note that tails is not necessarily an actual subsequence; only its length is guaranteed.',
 cost: 'Each element costs one binary search, so O(n log n) time and O(n) space. The simpler DP (dp[i] = 1 + max dp[j] over j < i with smaller values) is O(n²).',
 use: 'LIS appears in scheduling, box stacking, Russian-doll envelopes, and patience sorting. For non-decreasing subsequences use upper bound instead of lower bound. To reconstruct the sequence, also store predecessor indices.'
});
X('coinchange', {
 idea: 'Given coin denominations with unlimited supply, find the fewest coins that sum to an amount. Picking the largest coin first works for real currencies but fails in general, so DP considers every last-coin choice.',
 steps: ['Let dp[a] be the fewest coins needed for amount a. Set dp[0] = 0 and every other entry to “infinity” (amount + 1).', 'For each amount a from 1 upward, try every coin c ≤ a.', 'dp[a] = min(dp[a], dp[a − c] + 1): use coin c last, plus the best way to make the rest.', 'If dp[amount] is still infinity, the amount can’t be made: return −1.'],
 why: 'Any optimal combination for amount a ends with some coin c, and the remaining a − c must itself be made optimally (otherwise you could improve the whole). Trying every possible last coin therefore finds the optimum.',
 cost: 'There are amount + 1 states and each tries every coin: O(amount · k) time and O(amount) space for k coin types.',
 use: 'Greedy fails for coins like {1, 3, 4} with amount 6 (greedy 4 + 1 + 1 vs optimal 3 + 3). Counting the number of ways (Coin Change II) uses the same table with the coin loop outside, so each combination is counted once instead of once per ordering.'
});
X('editdistance', {
 idea: 'Edit (Levenshtein) distance is the minimum number of single-character inserts, deletes and replacements to turn one string into another. A 2D table computes it for every pair of prefixes.',
 steps: ['dp[i][j] is the distance between the first i characters of a and the first j characters of b.', 'Base cases: dp[i][0] = i (delete everything) and dp[0][j] = j (insert everything).', 'If a[i − 1] = b[j − 1], no edit is needed: dp[i][j] = dp[i − 1][j − 1].', 'Otherwise take 1 + the minimum of delete (dp[i − 1][j]), insert (dp[i][j − 1]) and replace (dp[i − 1][j − 1]).'],
 why: 'Consider the last characters. Either they match and can be kept, or the last operation of an optimal script is one of the three edits, each of which reduces the problem to one of the three neighboring cells. Taking the minimum covers every possible final operation.',
 cost: 'O(m · n) time; O(n) space using two rows. Recovering the actual edit script needs the full table or Hirschberg’s divide-and-conquer trick.',
 use: 'Used in spell checkers (“did you mean?”), fuzzy search, DNA alignment (with custom costs), and plagiarism detection. If only replacements are allowed between equal-length strings, the answer is the simpler Hamming distance.'
});

/* ---------- Greedy ---------- */
X('intervals', {
 idea: 'Interval scheduling picks the largest set of non-overlapping intervals. The greedy rule is to always choose the interval that finishes earliest, because it leaves the most room for everything else.',
 steps: ['Sort the intervals by end time.', 'Keep lastEnd = −∞.', 'For each interval in order, if it starts at or after lastEnd, take it and set lastEnd to its end. Otherwise skip it.', 'The number taken is the maximum.'],
 why: 'Exchange argument: take any optimal solution and replace its first interval with the one that ends earliest overall. That interval ends no later, so it can’t conflict with the rest of the solution, and the count is unchanged. Repeating this argument shows the greedy choice is always part of some optimal solution.',
 cost: 'Sorting dominates: O(n log n) time, then one O(n) scan with O(1) extra space.',
 use: 'Variants: minimum removals to make intervals non-overlapping (n − maximum kept), merging overlapping intervals (sort by start and extend the current end), counting rooms needed (sweep sorted starts and ends, or a min-heap of end times). Sorting by start time or by length does not work for scheduling; try a counterexample to see why.'
});

/* ---------- Backtracking ---------- */
X('subsets', {
 idea: 'Backtracking builds candidates one decision at a time and undoes each decision after exploring it. For subsets, each element has two choices, include it or skip it, giving a binary decision tree with 2ⁿ leaves.',
 steps: ['At depth i, decide about nums[i].', 'Choose: append nums[i] to the current path and recurse to depth i + 1.', 'Un-choose: remove it from the path.', 'Recurse to depth i + 1 without it.', 'At depth n, record a copy of the path.'],
 why: 'Every combination of include/skip decisions corresponds to exactly one root-to-leaf path in the decision tree, and the recursion visits every path once. Undoing each choice restores the path so the sibling branch starts from the same state.',
 cost: 'There are 2ⁿ subsets and copying each costs O(n): O(n · 2ⁿ) time. The recursion depth and path are O(n) extra space, not counting the output.',
 use: 'The choose–explore–undo template also generates combinations, combination sums, palindrome partitions and phone-letter combinations. With duplicate values, sort first and skip equal values at the same depth. An alternative for subsets is iterating over bitmasks 0 … 2ⁿ − 1.'
});
X('permutations', {
 idea: 'To generate every ordering, fix positions one at a time. For position start, try each remaining element there, recurse on the rest of the positions, then undo the choice.',
 steps: ['At position start, loop i from start to n − 1.', 'Swap nums[i] into position start (choose).', 'Recurse on position start + 1.', 'Swap back to restore the array (undo).', 'When start reaches n, record a copy of the array.'],
 why: 'Position start receives each remaining element exactly once, and for each choice the recursion generates every arrangement of the remaining elements. By induction this produces all n! orderings with no repeats (for distinct values).',
 cost: 'There are n! permutations, each copied in O(n): O(n · n!) time and O(n) recursion depth. Ten elements already give 3.6 million permutations, so this is only feasible for small n.',
 use: 'Swapping in place avoids a “used” array. When the input has duplicates, a “used” array plus sorting and skipping equal values at the same depth is easier. Many puzzles are permutations with pruning, such as N-Queens (a permutation of columns).'
});
X('nqueens', {
 idea: 'N-Queens places n queens on an n × n board so none attack each other. Backtracking places one queen per row and skips any column or diagonal that is already attacked, which prunes most of the search.',
 steps: ['Process rows from top to bottom.', 'In row r, try each column c.', 'Skip c if its column, its “\\” diagonal (r − c) or its “/” diagonal (r + c) is already taken.', 'Otherwise mark the three, recurse to row r + 1, then unmark them.', 'Reaching row n means all queens are placed: count or record the board.'],
 why: 'Placing exactly one queen per row handles row attacks automatically. Squares on the same diagonal share r − c, and on the same anti-diagonal share r + c, so the three sets detect every possible attack in O(1). Backtracking explores every non-attacking placement and nothing else.',
 cost: 'The worst case is bounded by n! (one column per row), but pruning cuts it drastically: n = 8 explores only a few thousand nodes. Space is O(n) for the sets and recursion. There are 92 solutions for n = 8.',
 use: 'The same skeleton solves Sudoku, crosswords, graph coloring and other constraint satisfaction problems. The key ideas are representing constraints so checks are O(1) and pruning as early as possible.'
});

/* ---------- Math & bits ---------- */
X('gcd', {
 idea: 'Euclid’s algorithm finds the greatest common divisor of two integers by repeatedly replacing the larger number with the remainder of dividing it by the smaller one, until the remainder is zero.',
 steps: ['If b = 0, the answer is a.', 'Otherwise replace (a, b) with (b, a mod b).', 'Repeat.', 'For the least common multiple, compute a / gcd(a, b) × b (dividing first avoids overflow).'],
 why: 'Any number dividing both a and b also divides a − qb = a mod b, and vice versa, so gcd(a, b) = gcd(b, a mod b). The numbers shrink every step and reach zero, at which point gcd(a, 0) = a.',
 cost: 'The remainder at least halves every two steps, so the number of steps is O(log min(a, b)), proportional to the number of digits. The worst case is consecutive Fibonacci numbers. Space is O(1).',
 use: 'Used for simplifying fractions, LCMs, and modular arithmetic. The extended Euclidean algorithm also finds x and y with ax + by = gcd(a, b), which computes modular inverses: exactly what RSA key generation needs.'
});
X('sieve', {
 idea: 'The Sieve of Eratosthenes lists all primes up to n by starting with every number marked as possibly prime and crossing out the multiples of each prime it finds.',
 steps: ['Mark 0 and 1 as not prime and everything else as prime.', 'For each i from 2 while i × i ≤ n: if i is still marked prime, cross out i², i² + i, i² + 2i, … up to n.', 'Every number still marked is prime.'],
 why: 'A composite number m has a prime factor p ≤ √m, and it gets crossed out when the sieve processes p. Starting at p² is enough, because smaller multiples k × p with k < p have a smaller prime factor that already crossed them out. Primes are never crossed out because they have no smaller factors.',
 cost: 'The total crossing-out work is n/2 + n/3 + n/5 + … over primes, which is O(n log log n), almost linear. It needs O(n) memory, one flag per number.',
 use: 'Use it when you need many primes or many primality checks in a range. For a single large number, trial division up to √n or probabilistic tests (Miller–Rabin, used to generate RSA primes) are better. A segmented sieve handles ranges too large for memory.'
});
X('bits', {
 idea: 'Integers are stored as bits, and a few bitwise identities let you answer questions in constant time that would otherwise need loops or extra memory.',
 steps: ['x & (x − 1) clears the lowest set bit. Repeating it until x = 0 counts the set bits.', 'x > 0 and x & (x − 1) = 0 means x is a power of two (exactly one bit set).', 'a ^ a = 0 and a ^ 0 = a, so XOR-ing a list cancels every value that appears twice.', '(x >> i) & 1 reads bit i; x | (1 << i) sets it; x & ~(1 << i) clears it.'],
 why: 'Subtracting 1 flips the lowest set bit to 0 and every bit below it to 1, so AND-ing with the original keeps the higher bits and removes exactly that lowest 1. XOR is associative and commutative, so pairs cancel regardless of order.',
 cost: 'Each trick is O(1) or O(number of set bits). XOR over a list is O(n) time with O(1) space, versus O(n) space for a hash set.',
 use: 'Bit tricks power Single Number, Missing Number, Counting Bits, subset enumeration with bitmasks, Bloom filters, permission flags, and much of cryptography’s low-level code. In languages with fixed-width signed integers, watch for sign extension and use unsigned shifts where needed.'
});
X('floyd', {
 idea: 'Floyd’s “tortoise and hare” detects a cycle in any sequence where each value determines the next, such as a linked list, using only two pointers. A second phase finds where the cycle begins.',
 steps: ['Phase 1: move slow one step and fast two steps at a time. If fast reaches the end, there is no cycle. If they meet, there is one.', 'Phase 2: reset one pointer to the start and leave the other at the meeting point.', 'Move both one step at a time; the node where they meet is the start of the cycle.'],
 why: 'Inside the cycle, fast gains exactly one step on slow each move, so it cannot jump over it and must land on it. For phase 2: if the cycle starts μ steps from the start and the meeting point is k steps into the cycle, the algebra shows μ ≡ (cycle length − k) modulo the cycle length, so both pointers arrive at the entrance together.',
 cost: 'Both phases take O(μ + λ) steps, where λ is the cycle length, so O(n). Space is O(1), compared with O(n) for a hash set of visited nodes.',
 use: 'Use it for Linked List Cycle, Find the Duplicate Number (treat i → nums[i] as a list), Happy Number, and detecting cycles in pseudo-random number generators (Pollard’s rho factoring builds on the same idea).'
});
