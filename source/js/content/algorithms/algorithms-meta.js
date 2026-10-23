/* ===== Library metadata for the original lessons' algorithms ===== */
const META={
 bubble:{cat:'sorting',blurb:'Repeatedly swap adjacent out-of-order pairs; each pass bubbles the largest remaining value to the end.',
  trace:[[1,'A = [5, 1, 4, 2, 8]. Pass 1 starts.'],[5,'5 > 1 → swap → [1, 5, 4, 2, 8]. 5 > 4 → swap → [1, 4, 5, 2, 8]. 5 > 2 → swap → [1, 4, 2, 5, 8].'],[4,'5 < 8: no swap. 8 is now in its final place.'],[5,'Pass 2: 4 > 2 → swap → [1, 2, 4, 5, 8].'],[6,'Pass 3 makes no swaps, so stop early.']],
  q:{q:'Bubble sort runs on an already-sorted array (with the early-exit flag). How many passes?',o:['0','1','n / 2','n − 1'],a:1,why:'One pass with zero swaps proves the array is sorted.'}},
 insertion:{cat:'sorting',blurb:'Grow a sorted prefix by inserting each new element into its correct place, like sorting a hand of cards.',
  trace:[[1,'A = [5, 1, 4, 2, 8]. The prefix [5] is trivially sorted.'],[4,'Insert 1: 5 > 1 → swap → [1, 5, 4, 2, 8].'],[4,'Insert 4: 5 > 4 → swap → [1, 4, 5, 2, 8]; 1 < 4, stop.'],[4,'Insert 2: moves past 5 and 4 → [1, 2, 4, 5, 8].'],[3,'Insert 8: 5 < 8, already in place. Done.']],
  q:{q:'Insertion sort is especially fast on…',o:['Reversed input','Nearly sorted input','Random input','Input with many duplicates'],a:1,why:'Each element moves only a short distance, so the total work is close to O(n).'}},
 quick:{cat:'sorting',blurb:'Pick a pivot, partition smaller values to its left and larger to its right, then sort each side recursively.',
  trace:[[2,'A = [5, 1, 4, 2, 8]. Pivot = 8 (last element).'],[5,'Every value is < 8, so each stays on the left. i ends at 4.'],[6,'8 is already at index 4. Recurse on [5, 1, 4, 2].'],[2,'Pivot 2: only 1 is smaller → [1, 2, 4, 5]. 2 lands at index 1.'],[7,'Recurse on [4, 5]: pivot 5 keeps 4 left. Sorted: [1, 2, 4, 5, 8].']],
  q:{q:'What is quicksort’s worst-case time, and when does it happen?',o:['O(n log n), on random input','O(n²), when pivots are always the smallest or largest value','O(n), on sorted input','O(log n), never'],a:1,why:'Lopsided partitions shrink the problem by one element per level, giving n levels of O(n) work.'}},
 merge:{cat:'sorting',blurb:'Split in half, sort each half recursively, then merge the two sorted halves in linear time.',
  trace:[[2,'A = [5, 1, 4, 2, 8]. mid = ⌊(0 + 4) / 2⌋ = 2, so the halves are A[0..2] = [5, 1, 4] and A[3..4] = [2, 8].'],[3,'Recursively sort each half: [5, 1, 4] becomes [1, 4, 5]; [2, 8] is already sorted.'],[6,'Merge [1, 4, 5] with [2, 8]: take 1, then 2, then 4, then 5.'],[7,'Copy the leftover 8 → [1, 2, 4, 5, 8].']],
  q:{q:'How many levels of splitting does merge sort need for n = 1,024?',o:['10','32','512','1,024'],a:0,why:'Each level halves the size: log₂ 1024 = 10.'}},
 binary:{cat:'searching',blurb:'Find a value in a sorted array by comparing with the middle element and discarding half the range each step.',
  trace:[[1,'A = [2, 5, 8, 12, 16, 23, 38, 56], target 23. lo = 0, hi = 7.'],[3,'mid = 3, A[3] = 12 < 23.'],[5,'Go right: lo = 4.'],[3,'mid = 5, A[5] = 23.'],[4,'Found at index 5 after 2 comparisons.']],
  q:{q:'Binary search needs the input to be…',o:['Unique','Sorted','Small','Numeric'],a:1,why:'Discarding half the range is only safe if order tells you which half the target can be in.'}},
 bfs:{cat:'graphs',blurb:'Explore a graph in rings of increasing distance using a queue; finds shortest paths in unweighted graphs.',
  trace:[[1,'Graph: A → B, C; B → D; C → D, E; D → F; E → F. Start A.'],[7,'Pop A, enqueue B and C.'],[7,'Pop B, enqueue D. Pop C: D is already seen, enqueue E.'],[7,'Pop D, enqueue F. Pop E: F already seen.'],[4,'Pop F: goal. Path A → B → D → F (3 edges, the minimum).']],
  q:{q:'BFS uses which data structure for its frontier?',o:['Stack','Queue','Heap','Set'],a:1,why:'First in, first out keeps nodes in order of distance.'}},
 dfs:{cat:'graphs',blurb:'Explore as deep as possible along each branch before backtracking, using a stack or recursion.',
  trace:[[1,'Same graph as BFS. Start A.'],[7,'Pop A, push B then C. C is on top.'],[7,'Pop C, push D and E. E is on top.'],[7,'Pop E, push F.'],[4,'Pop F: goal. Path A → C → E → F. Also 3 edges here, but DFS gives no guarantee.']],
  q:{q:'Which problem is DFS a natural fit for?',o:['Shortest path in an unweighted grid','Detecting a cycle or listing connected components','Finding the closest node','Level-by-level printing'],a:1,why:'DFS naturally tracks the current path, so a back edge to it reveals a cycle.'}}
};
for(const k in META)Object.assign(ALGOS[k],META[k]);
const CATS=[['sorting','Sorting'],['searching','Searching'],['arrays','Array patterns'],['graphs','Graphs'],['trees','Trees & heaps'],['dp','Dynamic programming'],['greedy','Greedy'],['backtracking','Backtracking'],['math','Math & bits'],['recursion','Recursion'],['strings','Strings'],['advds','Advanced data structures']];
const LIB_KEYS=Object.keys(ALGOS).filter(k=>ALGOS[k].cat);
