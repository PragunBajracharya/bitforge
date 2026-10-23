/* ================= Reference data: complexity, pseudocode, key ideas, code ================= */
const LANGS=[['python','Python'],['javascript','JavaScript'],['java','Java'],['cpp','C++']];
const ALGOS={

bubble:{name:'Bubble sort',
 cx:[['Best time','O(n)','Already sorted: one pass, no swaps, early exit'],['Average time','O(n²)','About n²/4 swaps on random data'],['Worst time','O(n²)','Reversed input: every comparison swaps'],['Extra space','O(1)','Sorts in place'],['Stable?','Yes','Equal values keep their order']],
 pts:['Each pass pushes the largest unsorted value to the end, like a bubble rising.','After pass i, the last i elements are final, so the inner loop shrinks.','The “swapped” flag lets it stop early on sorted data. Without it, best case is also O(n²).','Rarely used in practice; it teaches loops and invariants.'],
 pseudo:['procedure bubbleSort(A)','  for i ← 0 to n − 2','    swapped ← false','    for j ← 0 to n − 2 − i','      if A[j] > A[j+1]','        swap(A[j], A[j+1]); swapped ← true','    if not swapped: return   // early exit'],
 code:{
python:`def bubble_sort(a):
    n = len(a)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:          # no swaps: already sorted
            break
    return a

print(bubble_sort([5, 1, 4, 2, 8]))   # [1, 2, 4, 5, 8]`,
javascript:`function bubbleSort(a) {
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }
    }
    if (!swapped) break;      // no swaps: already sorted
  }
  return a;
}

console.log(bubbleSort([5, 1, 4, 2, 8])); // [1, 2, 4, 5, 8]`,
java:`import java.util.Arrays;

public class BubbleSort {
    static void bubbleSort(int[] a) {
        int n = a.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < n - 1 - i; j++) {
                if (a[j] > a[j + 1]) {
                    int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
                    swapped = true;
                }
            }
            if (!swapped) break;   // no swaps: already sorted
        }
    }

    public static void main(String[] args) {
        int[] a = {5, 1, 4, 2, 8};
        bubbleSort(a);
        System.out.println(Arrays.toString(a)); // [1, 2, 4, 5, 8]
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <utility>

void bubbleSort(std::vector<int>& a) {
    int n = a.size();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - 1 - i; j++) {
            if (a[j] > a[j + 1]) {
                std::swap(a[j], a[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;   // no swaps: already sorted
    }
}

int main() {
    std::vector<int> a = {5, 1, 4, 2, 8};
    bubbleSort(a);
    for (int x : a) std::cout << x << ' ';   // 1 2 4 5 8
}`}},

insertion:{name:'Insertion sort',
 cx:[['Best time','O(n)','Already sorted: each new value is compared once'],['Average time','O(n²)','Each value moves about halfway back'],['Worst time','O(n²)','Reversed input: each value moves all the way back'],['Extra space','O(1)','Sorts in place'],['Stable?','Yes','Uses a strict “>” so equal values never pass each other']],
 pts:['Keeps a sorted prefix and inserts the next value into it, like sorting a hand of cards.','Excellent on small or nearly sorted arrays, which is why real libraries (Timsort, introsort) switch to it for small chunks.','The visualizer swaps step by step; the code below shifts values right instead, which does the same comparisons with fewer writes.','Online: it can sort data as it arrives.'],
 pseudo:['procedure insertionSort(A)','  for i ← 1 to n − 1','    j ← i','    while j > 0 and A[j−1] > A[j]','      swap(A[j−1], A[j])','      j ← j − 1'],
 code:{
python:`def insertion_sort(a):
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]      # shift larger value right
            j -= 1
        a[j + 1] = key           # drop key into the gap
    return a

print(insertion_sort([5, 1, 4, 2, 8]))   # [1, 2, 4, 5, 8]`,
javascript:`function insertionSort(a) {
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];          // shift larger value right
      j--;
    }
    a[j + 1] = key;             // drop key into the gap
  }
  return a;
}

console.log(insertionSort([5, 1, 4, 2, 8])); // [1, 2, 4, 5, 8]`,
java:`import java.util.Arrays;

public class InsertionSort {
    static void insertionSort(int[] a) {
        for (int i = 1; i < a.length; i++) {
            int key = a[i];
            int j = i - 1;
            while (j >= 0 && a[j] > key) {
                a[j + 1] = a[j];   // shift larger value right
                j--;
            }
            a[j + 1] = key;        // drop key into the gap
        }
    }

    public static void main(String[] args) {
        int[] a = {5, 1, 4, 2, 8};
        insertionSort(a);
        System.out.println(Arrays.toString(a)); // [1, 2, 4, 5, 8]
    }
}`,
cpp:`#include <iostream>
#include <vector>

void insertionSort(std::vector<int>& a) {
    for (int i = 1; i < (int)a.size(); i++) {
        int key = a[i];
        int j = i - 1;
        while (j >= 0 && a[j] > key) {
            a[j + 1] = a[j];   // shift larger value right
            j--;
        }
        a[j + 1] = key;        // drop key into the gap
    }
}

int main() {
    std::vector<int> a = {5, 1, 4, 2, 8};
    insertionSort(a);
    for (int x : a) std::cout << x << ' ';   // 1 2 4 5 8
}`}},

quick:{name:'Quicksort (Lomuto partition)',
 cx:[['Best time','O(n log n)','Pivot splits the range evenly every time'],['Average time','O(n log n)','Random data gives balanced-enough splits'],['Worst time','O(n²)','Sorted or reversed input with last-element pivot'],['Extra space','O(log n)','Recursion stack on average; O(n) in the worst case'],['Stable?','No','Long-distance swaps can reorder equal values']],
 pts:['Divide and conquer: pick a pivot, move smaller values left and larger right, then sort each side.','After partitioning, the pivot is in its final position and is never touched again.','Picking a random pivot (or median of three) makes the O(n²) case extremely unlikely.','Usually the fastest comparison sort in practice thanks to cache-friendly, in-place work.'],
 pseudo:['procedure quickSort(A, lo, hi)','  if lo ≥ hi: return','  pivot ← A[hi]; i ← lo','  for j ← lo to hi − 1','    if A[j] < pivot','      swap(A[i], A[j]); i ← i + 1','  swap(A[i], A[hi])   // pivot to final spot','  quickSort(A, lo, i − 1); quickSort(A, i + 1, hi)'],
 code:{
python:`def quick_sort(a, lo=0, hi=None):
    if hi is None:
        hi = len(a) - 1
    if lo >= hi:
        return a
    pivot, i = a[hi], lo
    for j in range(lo, hi):
        if a[j] < pivot:
            a[i], a[j] = a[j], a[i]
            i += 1
    a[i], a[hi] = a[hi], a[i]    # pivot to its final spot
    quick_sort(a, lo, i - 1)
    quick_sort(a, i + 1, hi)
    return a

print(quick_sort([5, 1, 4, 2, 8]))   # [1, 2, 4, 5, 8]`,
javascript:`function quickSort(a, lo = 0, hi = a.length - 1) {
  if (lo >= hi) return a;
  const pivot = a[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (a[j] < pivot) {
      [a[i], a[j]] = [a[j], a[i]];
      i++;
    }
  }
  [a[i], a[hi]] = [a[hi], a[i]];  // pivot to its final spot
  quickSort(a, lo, i - 1);
  quickSort(a, i + 1, hi);
  return a;
}

console.log(quickSort([5, 1, 4, 2, 8])); // [1, 2, 4, 5, 8]`,
java:`import java.util.Arrays;

public class QuickSort {
    static void quickSort(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int pivot = a[hi], i = lo;
        for (int j = lo; j < hi; j++) {
            if (a[j] < pivot) {
                int t = a[i]; a[i] = a[j]; a[j] = t;
                i++;
            }
        }
        int t = a[i]; a[i] = a[hi]; a[hi] = t;   // pivot to its final spot
        quickSort(a, lo, i - 1);
        quickSort(a, i + 1, hi);
    }

    public static void main(String[] args) {
        int[] a = {5, 1, 4, 2, 8};
        quickSort(a, 0, a.length - 1);
        System.out.println(Arrays.toString(a)); // [1, 2, 4, 5, 8]
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <utility>

void quickSort(std::vector<int>& a, int lo, int hi) {
    if (lo >= hi) return;
    int pivot = a[hi], i = lo;
    for (int j = lo; j < hi; j++) {
        if (a[j] < pivot) std::swap(a[i++], a[j]);
    }
    std::swap(a[i], a[hi]);   // pivot to its final spot
    quickSort(a, lo, i - 1);
    quickSort(a, i + 1, hi);
}

int main() {
    std::vector<int> a = {5, 1, 4, 2, 8};
    quickSort(a, 0, a.size() - 1);
    for (int x : a) std::cout << x << ' ';   // 1 2 4 5 8
}`}},

merge:{name:'Merge sort',
 cx:[['Best time','O(n log n)','Always splits in half: log₂ n levels'],['Average time','O(n log n)','Each level does O(n) merging work'],['Worst time','O(n log n)','Guaranteed, whatever the input'],['Extra space','O(n)','Needs a buffer to merge into'],['Stable?','Yes','Takes from the left half on ties (“≤”)']],
 pts:['Split the array in half, sort each half recursively, then merge two sorted lists.','Merging two sorted lists is linear: always take the smaller front element.','Predictable O(n log n) makes it the standard choice for linked lists and external sorting (data on disk).','Python’s and Java’s object sorts use Timsort, a merge sort hybrid.'],
 pseudo:['procedure mergeSort(A, lo, hi)','  if lo ≥ hi: return','  mid ← ⌊(lo + hi) / 2⌋','  mergeSort(A, lo, mid); mergeSort(A, mid + 1, hi)','  L ← A[lo..mid]; R ← A[mid+1..hi]; k ← lo','  while L and R are both non-empty','    A[k++] ← pop smaller front of L or R','  copy whatever is left of L or R into A'],
 code:{
python:`def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:          # "<=" keeps the sort stable
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    out.extend(left[i:])
    out.extend(right[j:])
    return out

print(merge_sort([5, 1, 4, 2, 8]))   # [1, 2, 4, 5, 8]`,
javascript:`function mergeSort(a) {
  if (a.length <= 1) return a;
  const mid = a.length >> 1;
  const left = mergeSort(a.slice(0, mid));
  const right = mergeSort(a.slice(mid));
  const out = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    out.push(left[i] <= right[j] ? left[i++] : right[j++]);  // "<=" keeps it stable
  }
  return out.concat(left.slice(i), right.slice(j));
}

console.log(mergeSort([5, 1, 4, 2, 8])); // [1, 2, 4, 5, 8]`,
java:`import java.util.Arrays;

public class MergeSort {
    static void mergeSort(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int mid = lo + (hi - lo) / 2;
        mergeSort(a, lo, mid);
        mergeSort(a, mid + 1, hi);
        int[] L = Arrays.copyOfRange(a, lo, mid + 1);
        int[] R = Arrays.copyOfRange(a, mid + 1, hi + 1);
        int i = 0, j = 0, k = lo;
        while (i < L.length && j < R.length)
            a[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];   // "<=" keeps it stable
        while (i < L.length) a[k++] = L[i++];
        while (j < R.length) a[k++] = R[j++];
    }

    public static void main(String[] args) {
        int[] a = {5, 1, 4, 2, 8};
        mergeSort(a, 0, a.length - 1);
        System.out.println(Arrays.toString(a)); // [1, 2, 4, 5, 8]
    }
}`,
cpp:`#include <iostream>
#include <vector>

void mergeSort(std::vector<int>& a, int lo, int hi) {
    if (lo >= hi) return;
    int mid = lo + (hi - lo) / 2;
    mergeSort(a, lo, mid);
    mergeSort(a, mid + 1, hi);
    std::vector<int> L(a.begin() + lo, a.begin() + mid + 1);
    std::vector<int> R(a.begin() + mid + 1, a.begin() + hi + 1);
    size_t i = 0, j = 0;
    int k = lo;
    while (i < L.size() && j < R.size())
        a[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];   // "<=" keeps it stable
    while (i < L.size()) a[k++] = L[i++];
    while (j < R.size()) a[k++] = R[j++];
}

int main() {
    std::vector<int> a = {5, 1, 4, 2, 8};
    mergeSort(a, 0, a.size() - 1);
    for (int x : a) std::cout << x << ' ';   // 1 2 4 5 8
}`}},

binary:{name:'Binary search',
 cx:[['Best time','O(1)','Target is the first middle element'],['Average time','O(log n)','About log₂ n − 1 comparisons'],['Worst time','O(log n)','⌊log₂ n⌋ + 1 comparisons, e.g. 20 for a million items'],['Extra space','O(1)','Iterative version; recursive uses O(log n) stack'],['Requires','Sorted input','Sorting first costs O(n log n)']],
 pts:['Invariant: if the target exists, it is inside A[lo..hi].','Each comparison discards half of the remaining range.','Write mid as lo + (hi − lo) / 2 to avoid integer overflow in Java and C++.','The same idea finds boundaries: first value ≥ x (lower bound), square roots, or the smallest valid answer to a yes/no question.'],
 pseudo:['procedure binarySearch(A, target)','  lo ← 0; hi ← n − 1','  while lo ≤ hi','    mid ← lo + ⌊(hi − lo) / 2⌋','    if A[mid] = target: return mid','    else if A[mid] < target: lo ← mid + 1','    else: hi ← mid − 1','  return −1   // not found'],
 code:{
python:`def binary_search(a, target):
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if a[mid] == target:
            return mid
        if a[mid] < target:
            lo = mid + 1      # target is in the right half
        else:
            hi = mid - 1      # target is in the left half
    return -1

print(binary_search([2, 5, 8, 12, 16, 23, 38, 56], 23))   # 5`,
javascript:`function binarySearch(a, target) {
  let lo = 0, hi = a.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (a[mid] === target) return mid;
    if (a[mid] < target) lo = mid + 1;   // right half
    else hi = mid - 1;                   // left half
  }
  return -1;
}

console.log(binarySearch([2, 5, 8, 12, 16, 23, 38, 56], 23)); // 5`,
java:`public class BinarySearch {
    static int binarySearch(int[] a, int target) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;   // avoids int overflow
            if (a[mid] == target) return mid;
            if (a[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] a = {2, 5, 8, 12, 16, 23, 38, 56};
        System.out.println(binarySearch(a, 23)); // 5
    }
}`,
cpp:`#include <iostream>
#include <vector>

int binarySearch(const std::vector<int>& a, int target) {
    int lo = 0, hi = (int)a.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;   // avoids int overflow
        if (a[mid] == target) return mid;
        if (a[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}

int main() {
    std::vector<int> a = {2, 5, 8, 12, 16, 23, 38, 56};
    std::cout << binarySearch(a, 23);   // 5
}`}},

bfs:{name:'Breadth-first search',
 cx:[['Time','O(V + E)','Every vertex and edge is processed once'],['Extra space','O(V)','Queue plus the parent map'],['On a grid','O(rows × cols)','Each cell has at most 4 edges'],['Shortest path?','Yes','In unweighted graphs, by number of edges'],['Data structure','Queue (FIFO)','First in, first out']],
 pts:['Explores in rings: all cells at distance 1, then distance 2, and so on.','The first time it reaches the goal, it has used the fewest possible steps.','Mark a node as seen when you add it to the queue, not when you remove it, or it can be added many times.','Uses: shortest routes in mazes, social-network “degrees of separation”, web crawlers.'],
 pseudo:['procedure BFS(start, goal)','  queue ← [start]; parent[start] ← none','  while queue is not empty','    cur ← queue.popFront()','    if cur = goal: return path via parent[]','    for each open neighbor nb of cur','      if nb has no parent yet','        parent[nb] ← cur; queue.pushBack(nb)','  return "no path"'],
 code:{
python:`from collections import deque

def bfs(graph, start, goal):
    parent = {start: None}
    queue = deque([start])
    while queue:
        cur = queue.popleft()                 # FIFO
        if cur == goal:
            path = []
            while cur is not None:
                path.append(cur)
                cur = parent[cur]
            return path[::-1]
        for nb in graph[cur]:
            if nb not in parent:              # mark when enqueued
                parent[nb] = cur
                queue.append(nb)
    return None

graph = {"A": ["B", "C"], "B": ["D"], "C": ["D", "E"], "D": ["F"], "E": ["F"], "F": []}
print(bfs(graph, "A", "F"))   # ['A', 'B', 'D', 'F']`,
javascript:`function bfs(graph, start, goal) {
  const parent = new Map([[start, null]]);
  const queue = [start];
  let head = 0;                        // index pointer: O(1) dequeue
  while (head < queue.length) {
    let cur = queue[head++];
    if (cur === goal) {
      const path = [];
      for (; cur !== null; cur = parent.get(cur)) path.push(cur);
      return path.reverse();
    }
    for (const nb of graph[cur] ?? []) {
      if (!parent.has(nb)) { parent.set(nb, cur); queue.push(nb); }
    }
  }
  return null;
}

const graph = { A: ["B", "C"], B: ["D"], C: ["D", "E"], D: ["F"], E: ["F"], F: [] };
console.log(bfs(graph, "A", "F")); // ["A", "B", "D", "F"]`,
java:`import java.util.*;

public class BFS {
    static List<String> bfs(Map<String, List<String>> graph, String start, String goal) {
        Map<String, String> parent = new HashMap<>();
        parent.put(start, null);
        Deque<String> queue = new ArrayDeque<>(List.of(start));
        while (!queue.isEmpty()) {
            String cur = queue.pollFirst();          // FIFO
            if (cur.equals(goal)) {
                LinkedList<String> path = new LinkedList<>();
                for (String c = cur; c != null; c = parent.get(c)) path.addFirst(c);
                return path;
            }
            for (String nb : graph.getOrDefault(cur, List.of())) {
                if (!parent.containsKey(nb)) { parent.put(nb, cur); queue.addLast(nb); }
            }
        }
        return null;
    }

    public static void main(String[] args) {
        Map<String, List<String>> g = Map.of(
            "A", List.of("B", "C"), "B", List.of("D"), "C", List.of("D", "E"),
            "D", List.of("F"), "E", List.of("F"), "F", List.of());
        System.out.println(bfs(g, "A", "F")); // [A, B, D, F]
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>

// graph[v] lists the neighbors of vertex v (0..V-1)
std::vector<int> bfs(const std::vector<std::vector<int>>& graph, int start, int goal) {
    std::vector<int> parent(graph.size(), -2);   // -2 = not seen yet
    std::queue<int> q;
    parent[start] = -1;
    q.push(start);
    while (!q.empty()) {
        int cur = q.front(); q.pop();           // FIFO
        if (cur == goal) {
            std::vector<int> path;
            for (int c = cur; c != -1; c = parent[c]) path.push_back(c);
            std::reverse(path.begin(), path.end());
            return path;
        }
        for (int nb : graph[cur])
            if (parent[nb] == -2) { parent[nb] = cur; q.push(nb); }
    }
    return {};
}

int main() {
    // A=0 B=1 C=2 D=3 E=4 F=5
    std::vector<std::vector<int>> g = {{1, 2}, {3}, {3, 4}, {5}, {5}, {}};
    for (int v : bfs(g, 0, 5)) std::cout << v << ' ';   // 0 1 3 5
}`}},

dfs:{name:'Depth-first search',
 cx:[['Time','O(V + E)','Every vertex and edge is processed once'],['Extra space','O(V)','Stack plus the parent map'],['On a grid','O(rows × cols)','Each cell has at most 4 edges'],['Shortest path?','No','Finds a path, often a long winding one'],['Data structure','Stack (LIFO)','Last in, first out (or recursion)']],
 pts:['Dives as deep as possible along one branch before backtracking.','Swap BFS’s queue for a stack and you get DFS: the code is otherwise identical.','Uses: detecting cycles, topological sorting, maze generation, finding connected components.','Recursive DFS can overflow the call stack on big graphs; the iterative version below avoids that.'],
 pseudo:['procedure DFS(start, goal)','  stack ← [start]; parent[start] ← none','  while stack is not empty','    cur ← stack.pop()','    if cur = goal: return path via parent[]','    for each open neighbor nb of cur','      if nb has no parent yet','        parent[nb] ← cur; stack.push(nb)','  return "no path"'],
 code:{
python:`def dfs(graph, start, goal):
    parent = {start: None}
    stack = [start]
    while stack:
        cur = stack.pop()                     # LIFO
        if cur == goal:
            path = []
            while cur is not None:
                path.append(cur)
                cur = parent[cur]
            return path[::-1]
        for nb in graph[cur]:
            if nb not in parent:
                parent[nb] = cur
                stack.append(nb)
    return None

graph = {"A": ["B", "C"], "B": ["D"], "C": ["D", "E"], "D": ["F"], "E": ["F"], "F": []}
print(dfs(graph, "A", "F"))   # ['A', 'C', 'E', 'F']`,
javascript:`function dfs(graph, start, goal) {
  const parent = new Map([[start, null]]);
  const stack = [start];
  while (stack.length) {
    let cur = stack.pop();             // LIFO
    if (cur === goal) {
      const path = [];
      for (; cur !== null; cur = parent.get(cur)) path.push(cur);
      return path.reverse();
    }
    for (const nb of graph[cur] ?? []) {
      if (!parent.has(nb)) { parent.set(nb, cur); stack.push(nb); }
    }
  }
  return null;
}

const graph = { A: ["B", "C"], B: ["D"], C: ["D", "E"], D: ["F"], E: ["F"], F: [] };
console.log(dfs(graph, "A", "F")); // ["A", "C", "E", "F"]`,
java:`import java.util.*;

public class DFS {
    static List<String> dfs(Map<String, List<String>> graph, String start, String goal) {
        Map<String, String> parent = new HashMap<>();
        parent.put(start, null);
        Deque<String> stack = new ArrayDeque<>(List.of(start));
        while (!stack.isEmpty()) {
            String cur = stack.pop();                 // LIFO
            if (cur.equals(goal)) {
                LinkedList<String> path = new LinkedList<>();
                for (String c = cur; c != null; c = parent.get(c)) path.addFirst(c);
                return path;
            }
            for (String nb : graph.getOrDefault(cur, List.of())) {
                if (!parent.containsKey(nb)) { parent.put(nb, cur); stack.push(nb); }
            }
        }
        return null;
    }

    public static void main(String[] args) {
        Map<String, List<String>> g = Map.of(
            "A", List.of("B", "C"), "B", List.of("D"), "C", List.of("D", "E"),
            "D", List.of("F"), "E", List.of("F"), "F", List.of());
        System.out.println(dfs(g, "A", "F")); // [A, C, E, F]
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <stack>
#include <algorithm>

std::vector<int> dfs(const std::vector<std::vector<int>>& graph, int start, int goal) {
    std::vector<int> parent(graph.size(), -2);   // -2 = not seen yet
    std::stack<int> st;
    parent[start] = -1;
    st.push(start);
    while (!st.empty()) {
        int cur = st.top(); st.pop();           // LIFO
        if (cur == goal) {
            std::vector<int> path;
            for (int c = cur; c != -1; c = parent[c]) path.push_back(c);
            std::reverse(path.begin(), path.end());
            return path;
        }
        for (int nb : graph[cur])
            if (parent[nb] == -2) { parent[nb] = cur; st.push(nb); }
    }
    return {};
}

int main() {
    // A=0 B=1 C=2 D=3 E=4 F=5
    std::vector<std::vector<int>> g = {{1, 2}, {3}, {3, 4}, {5}, {5}, {}};
    for (int v : dfs(g, 0, 5)) std::cout << v << ' ';   // 0 2 4 5
}`}},

caesar:{name:'Caesar cipher & χ² cracker',
 cx:[['Encrypt / decrypt','O(n)','One shift per character'],['Crack (try all keys)','O(26 · n) = O(n)','26 decryptions, each scored'],['Extra space','O(n)','The output string'],['Key space','25 keys','About 4.6 bits of security'],['Security','None','Broken by brute force or frequency analysis']],
 pts:['Encryption: replace each letter x with (x + k) mod 26. Decryption uses −k.','Letter frequencies survive the shift, so the ciphertext’s histogram is just English’s histogram slid sideways.','χ² = Σ (observed − expected)² / expected measures how un-English a guess looks. Lowest wins.','Lesson for modern design: a cipher must hide statistical patterns, not only scramble symbols.'],
 pseudo:['procedure Encrypt(text, k)','  for each letter x in text','    output (x + k) mod 26','procedure Crack(ciphertext)','  for k ← 0 to 25','    guess ← Encrypt(ciphertext, −k)','    score[k] ← χ²(letter counts of guess, English)','  return k with the lowest score'],
 code:{
python:`from collections import Counter

ENGLISH = [8.17, 1.49, 2.78, 4.25, 12.70, 2.23, 2.02, 6.09, 6.97, 0.15, 0.77, 4.03, 2.41,
           6.75, 7.51, 1.93, 0.10, 5.99, 6.33, 9.06, 2.76, 0.98, 2.36, 0.15, 1.97, 0.07]

def caesar(text, shift):
    out = []
    for ch in text:
        if "A" <= ch <= "Z" or "a" <= ch <= "z":
            base = ord("A") if ch.isupper() else ord("a")
            out.append(chr((ord(ch) - base + shift) % 26 + base))
        else:
            out.append(ch)
    return "".join(out)

def chi_squared(text):
    letters = [c for c in text.upper() if "A" <= c <= "Z"]
    n = len(letters) or 1
    counts = Counter(letters)
    return sum((counts[chr(65 + i)] - n * p / 100) ** 2 / (n * p / 100)
               for i, p in enumerate(ENGLISH))

def crack(ciphertext):
    best = min(range(26), key=lambda k: chi_squared(caesar(ciphertext, -k)))
    return best, caesar(ciphertext, -best)

secret = caesar("Meet me at the old library after the lecture", 11)
print(secret)          # Xppe xp le esp zwo wtmclcj lqepc esp wpnefcp
print(crack(secret))   # (11, 'Meet me at the old library after the lecture')`,
javascript:`const ENGLISH = [8.17, 1.49, 2.78, 4.25, 12.70, 2.23, 2.02, 6.09, 6.97, 0.15, 0.77, 4.03, 2.41,
                 6.75, 7.51, 1.93, 0.10, 5.99, 6.33, 9.06, 2.76, 0.98, 2.36, 0.15, 1.97, 0.07];

function caesar(text, shift) {
  return text.replace(/[a-z]/gi, ch => {
    const base = ch <= "Z" ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + shift) % 26 + 26) % 26 + base);
  });
}

function chiSquared(text) {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, "");
  const counts = new Array(26).fill(0);
  for (const c of letters) counts[c.charCodeAt(0) - 65]++;
  return ENGLISH.reduce((sum, p, i) => {
    const expected = letters.length * p / 100;
    return sum + (counts[i] - expected) ** 2 / expected;
  }, 0);
}

function crack(ciphertext) {
  let best = 0;
  for (let k = 1; k < 26; k++)
    if (chiSquared(caesar(ciphertext, -k)) < chiSquared(caesar(ciphertext, -best))) best = k;
  return { shift: best, plaintext: caesar(ciphertext, -best) };
}

const secret = caesar("Meet me at the old library after the lecture", 11);
console.log(crack(secret)); // { shift: 11, plaintext: "Meet me at the old library ..." }`,
java:`public class Caesar {
    static final double[] ENGLISH = {8.17, 1.49, 2.78, 4.25, 12.70, 2.23, 2.02, 6.09, 6.97, 0.15,
        0.77, 4.03, 2.41, 6.75, 7.51, 1.93, 0.10, 5.99, 6.33, 9.06, 2.76, 0.98, 2.36, 0.15, 1.97, 0.07};

    static String caesar(String text, int shift) {
        StringBuilder sb = new StringBuilder();
        for (char ch : text.toCharArray()) {
            if (ch >= 'A' && ch <= 'Z') sb.append((char) ('A' + Math.floorMod(ch - 'A' + shift, 26)));
            else if (ch >= 'a' && ch <= 'z') sb.append((char) ('a' + Math.floorMod(ch - 'a' + shift, 26)));
            else sb.append(ch);
        }
        return sb.toString();
    }

    static double chiSquared(String text) {
        int[] counts = new int[26];
        int n = 0;
        for (char ch : text.toUpperCase().toCharArray())
            if (ch >= 'A' && ch <= 'Z') { counts[ch - 'A']++; n++; }
        double score = 0;
        for (int i = 0; i < 26; i++) {
            double expected = n * ENGLISH[i] / 100;
            score += (counts[i] - expected) * (counts[i] - expected) / expected;
        }
        return score;
    }

    static int crack(String ciphertext) {
        int best = 0;
        for (int k = 1; k < 26; k++)
            if (chiSquared(caesar(ciphertext, -k)) < chiSquared(caesar(ciphertext, -best))) best = k;
        return best;
    }

    public static void main(String[] args) {
        String secret = caesar("Meet me at the old library after the lecture", 11);
        int k = crack(secret);
        System.out.println(k + ": " + caesar(secret, -k));   // 11: Meet me at ...
    }
}`,
cpp:`#include <iostream>
#include <string>
#include <cctype>

const double ENGLISH[26] = {8.17, 1.49, 2.78, 4.25, 12.70, 2.23, 2.02, 6.09, 6.97, 0.15, 0.77, 4.03,
    2.41, 6.75, 7.51, 1.93, 0.10, 5.99, 6.33, 9.06, 2.76, 0.98, 2.36, 0.15, 1.97, 0.07};

std::string caesar(const std::string& text, int shift) {
    std::string out = text;
    for (char& ch : out) {
        if (ch >= 'A' && ch <= 'Z') ch = 'A' + ((ch - 'A' + shift) % 26 + 26) % 26;
        else if (ch >= 'a' && ch <= 'z') ch = 'a' + ((ch - 'a' + shift) % 26 + 26) % 26;
    }
    return out;
}

double chiSquared(const std::string& text) {
    int counts[26] = {0}, n = 0;
    for (char ch : text) {
        ch = std::toupper(static_cast<unsigned char>(ch));
        if (ch >= 'A' && ch <= 'Z') { counts[ch - 'A']++; n++; }
    }
    double score = 0;
    for (int i = 0; i < 26; i++) {
        double expected = n * ENGLISH[i] / 100;
        score += (counts[i] - expected) * (counts[i] - expected) / expected;
    }
    return score;
}

int crack(const std::string& ciphertext) {
    int best = 0;
    for (int k = 1; k < 26; k++)
        if (chiSquared(caesar(ciphertext, -k)) < chiSquared(caesar(ciphertext, -best))) best = k;
    return best;
}

int main() {
    std::string secret = caesar("Meet me at the old library after the lecture", 11);
    int k = crack(secret);
    std::cout << k << ": " << caesar(secret, -k) << '\\n';   // 11: Meet me at ...
}`}},

xor:{name:'XOR cipher / one-time pad',
 cx:[['Encrypt / decrypt','O(n)','One XOR per byte'],['Extra space','O(n)','The output bytes'],['Key length (OTP)','≥ n bytes','Must be as long as the message'],['Security (OTP)','Perfect','Only if the key is truly random and never reused'],['Security (reused key)','Broken','c1 ⊕ c2 = m1 ⊕ m2']],
 pts:['XOR is its own inverse: (m ⊕ k) ⊕ k = m. The same function encrypts and decrypts.','Each ciphertext bit is the message bit flipped where the key bit is 1.','A one-time pad is provably unbreakable but impractical: you need as much secret key as data.','Stream ciphers (AES-CTR, ChaCha20) generate a pseudo-random keystream from a short key and a nonce. Reusing the nonce recreates this exact attack.'],
 pseudo:['procedure XorCipher(m, key)','  for i ← 0 to len(m) − 1','    c[i] ← m[i] ⊕ key[i mod len(key)]','  return c','// decrypt: run the same procedure on c','// one-time pad: key random, len(key) ≥ len(m),','//               and never used twice'],
 code:{
python:`import secrets

def xor_bytes(data: bytes, key: bytes) -> bytes:
    return bytes(b ^ key[i % len(key)] for i, b in enumerate(data))

m1 = b"TRANSFER 500 TO ALICE"
key = secrets.token_bytes(len(m1))     # one-time pad: random, full length, used once
c1 = xor_bytes(m1, key)
print(c1.hex())
print(xor_bytes(c1, key))              # b'TRANSFER 500 TO ALICE'

# The reused-key attack:
m2 = b"MEET AT NOON TOMORROW"
c2 = xor_bytes(m2, key)
leak = xor_bytes(c1, c2)               # equals m1 XOR m2, the key cancels
print(xor_bytes(leak, m1))             # b'MEET AT NOON TOMORROW'`,
javascript:`function xorBytes(data, key) {
  return data.map((b, i) => b ^ key[i % key.length]);
}

const enc = new TextEncoder(), dec = new TextDecoder();
const m1 = enc.encode("TRANSFER 500 TO ALICE");
const key = crypto.getRandomValues(new Uint8Array(m1.length));  // one-time pad
const c1 = xorBytes(m1, key);
console.log(dec.decode(xorBytes(c1, key)));   // "TRANSFER 500 TO ALICE"

// The reused-key attack:
const m2 = enc.encode("MEET AT NOON TOMORROW");
const c2 = xorBytes(m2, key);
const leak = xorBytes(c1, c2);                // m1 XOR m2
console.log(dec.decode(xorBytes(leak, m1)));  // "MEET AT NOON TOMORROW"`,
java:`import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;

public class XorCipher {
    static byte[] xorBytes(byte[] data, byte[] key) {
        byte[] out = new byte[data.length];
        for (int i = 0; i < data.length; i++) out[i] = (byte) (data[i] ^ key[i % key.length]);
        return out;
    }

    public static void main(String[] args) {
        byte[] m1 = "TRANSFER 500 TO ALICE".getBytes(StandardCharsets.UTF_8);
        byte[] key = new byte[m1.length];
        new SecureRandom().nextBytes(key);                  // one-time pad
        byte[] c1 = xorBytes(m1, key);
        System.out.println(new String(xorBytes(c1, key), StandardCharsets.UTF_8));

        byte[] m2 = "MEET AT NOON TOMORROW".getBytes(StandardCharsets.UTF_8);
        byte[] c2 = xorBytes(m2, key);                       // key reused: bad
        byte[] leak = xorBytes(c1, c2);                      // m1 XOR m2
        System.out.println(new String(xorBytes(leak, m1), StandardCharsets.UTF_8));
    }
}`,
cpp:`#include <iostream>
#include <random>
#include <string>
#include <vector>
#include <cstdint>

std::vector<uint8_t> xorBytes(const std::vector<uint8_t>& data, const std::vector<uint8_t>& key) {
    std::vector<uint8_t> out(data.size());
    for (size_t i = 0; i < data.size(); i++) out[i] = data[i] ^ key[i % key.size()];
    return out;
}

int main() {
    std::string s1 = "TRANSFER 500 TO ALICE", s2 = "MEET AT NOON TOMORROW";
    std::vector<uint8_t> m1(s1.begin(), s1.end()), m2(s2.begin(), s2.end());
    std::random_device rd;                     // use a CSPRNG (e.g. OpenSSL RAND_bytes) for real keys
    std::vector<uint8_t> key(m1.size());
    for (auto& b : key) b = static_cast<uint8_t>(rd());

    auto c1 = xorBytes(m1, key), c2 = xorBytes(m2, key);   // key reused: bad
    auto leak = xorBytes(c1, c2);                           // m1 XOR m2
    auto recovered = xorBytes(leak, m1);
    std::cout << std::string(recovered.begin(), recovered.end()) << '\\n';  // MEET AT NOON TOMORROW
}`}},

sha256:{name:'SHA-256',
 cx:[['Time','O(n)','64 rounds per 512-bit block'],['Extra space','O(1)','256-bit state plus a 64-word schedule'],['Output','256 bits','Always, whatever the input size'],['Preimage resistance','~2²⁵⁶ work','Find any input for a given hash'],['Collision resistance','~2¹²⁸ work','Birthday bound: find two inputs with the same hash']],
 pts:['Deterministic: the same input always gives the same hash.','Avalanche: changing one input bit flips about half of the output bits.','One-way: you can’t run it backwards; the only general attack is guessing.','Proof of work (Bitcoin) asks miners to find an input whose hash starts with many zeros. Each extra zero hex digit means 16× more guessing.'],
 pseudo:['procedure SHA256(message)','  pad: append bit 1, zeros, then 64-bit length','  H[0..7] ← eight fixed 32-bit constants','  for each 512-bit block of the padded message','    expand the block into 64 words W[0..63]','    (a, b, …, h) ← H','    repeat 64 rounds: mix W[t] and K[t] using','      rotations, Ch, Maj and modular addition','    H ← H + (a, b, …, h)   // word-wise mod 2³²','  return H as a 256-bit digest'],
 code:{
python:`import hashlib

def sha256_hex(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()

print(sha256_hex("attack at dawn"))
print(sha256_hex("attack at dawm"))    # one letter changed: completely different

# Proof of work: find a nonce so the hash starts with "0000"
nonce = 0
while not sha256_hex(f"block-data:{nonce}").startswith("0000"):
    nonce += 1
print(nonce, sha256_hex(f"block-data:{nonce}"))`,
javascript:`async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

// In Node.js you can also use:
// require("node:crypto").createHash("sha256").update(text).digest("hex")

(async () => {
  console.log(await sha256Hex("attack at dawn"));
  let nonce = 0;
  while (!(await sha256Hex("block-data:" + nonce)).startsWith("0000")) nonce++;
  console.log("nonce:", nonce);
})();`,
java:`import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

public class Sha256 {
    static String sha256Hex(String text) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] hash = md.digest(text.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);   // Java 17+
    }

    public static void main(String[] args) throws Exception {
        System.out.println(sha256Hex("attack at dawn"));
        int nonce = 0;
        while (!sha256Hex("block-data:" + nonce).startsWith("0000")) nonce++;
        System.out.println("nonce: " + nonce);
    }
}`,
cpp:`// Uses OpenSSL. Compile with: g++ sha.cpp -o sha -lcrypto
#include <openssl/evp.h>
#include <cstdio>
#include <iostream>
#include <string>

std::string sha256Hex(const std::string& text) {
    unsigned char hash[EVP_MAX_MD_SIZE];
    unsigned int len = 0;
    EVP_Digest(text.data(), text.size(), hash, &len, EVP_sha256(), nullptr);
    std::string hex;
    char buf[3];
    for (unsigned int i = 0; i < len; i++) {
        std::snprintf(buf, sizeof buf, "%02x", hash[i]);
        hex += buf;
    }
    return hex;
}

int main() {
    std::cout << sha256Hex("attack at dawn") << '\\n';
    int nonce = 0;
    while (sha256Hex("block-data:" + std::to_string(nonce)).rfind("0000", 0) != 0) nonce++;
    std::cout << "nonce: " << nonce << '\\n';
}`}},

rsa:{name:'RSA',
 cx:[['Encrypt (mᵉ mod n)','O(log e) multiplications','Square-and-multiply; e = 65537 needs only 17'],['Decrypt (cᵈ mod n)','O(k³) bit operations','k = key size in bits; d is about k bits long'],['Key generation','≈ O(k⁴)','Dominated by searching for large primes'],['Extra space','O(k)','A few k-bit numbers'],['Best known attack','Factor n','General number field sieve: sub-exponential in k']],
 pts:['Public key (n, e) encrypts; private key d decrypts. Only someone who can factor n can compute d.','Correctness comes from Euler’s theorem: (mᵉ)ᵈ ≡ m (mod n) because e·d ≡ 1 (mod φ(n)).','Fast modular exponentiation squares and multiplies, so a 2048-bit exponent takes ~2048 steps, not 2²⁰⁴⁸.','Never use textbook RSA directly: add OAEP padding for encryption and PSS for signatures.'],
 pseudo:['procedure RSA-KeyGen()','  choose two large random primes p ≠ q','  n ← p · q','  φ ← (p − 1)(q − 1)','  choose e with gcd(e, φ) = 1   // usually 65537','  d ← e⁻¹ mod φ   // extended Euclid','  public key (n, e); private key (n, d)','Encrypt(m) = mᵉ mod n','Decrypt(c) = cᵈ mod n'],
 code:{
python:`def egcd(a, b):
    if b == 0:
        return a, 1, 0
    g, x, y = egcd(b, a % b)
    return g, y, x - (a // b) * y

def mod_inverse(e, phi):
    g, x, _ = egcd(e, phi)
    if g != 1:
        raise ValueError("e must be coprime to phi")
    return x % phi              # Python 3.8+: pow(e, -1, phi)

p, q, e = 61, 53, 17
n, phi = p * q, (p - 1) * (q - 1)
d = mod_inverse(e, phi)
print(n, phi, d)                # 3233 3120 2753

m = 65
c = pow(m, e, n)                # encrypt: m^e mod n
print(c, pow(c, d, n))          # 2790 65`,
javascript:`function modPow(base, exp, mod) {      // square-and-multiply
  let result = 1n;
  base %= mod;
  while (exp > 0n) {
    if (exp & 1n) result = result * base % mod;
    base = base * base % mod;
    exp >>= 1n;
  }
  return result;
}

function modInverse(a, m) {            // extended Euclid
  let [oldR, r] = [a, m], [oldS, s] = [1n, 0n];
  while (r !== 0n) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  if (oldR !== 1n) throw new Error("e must be coprime to phi");
  return ((oldS % m) + m) % m;
}

const p = 61n, q = 53n, e = 17n;
const n = p * q, phi = (p - 1n) * (q - 1n);
const d = modInverse(e, phi);          // 2753n
const c = modPow(65n, e, n);           // 2790n
console.log(d, c, modPow(c, d, n));    // 2753n 2790n 65n`,
java:`import java.math.BigInteger;
import java.security.SecureRandom;

public class RSA {
    public static void main(String[] args) {
        BigInteger p = BigInteger.valueOf(61), q = BigInteger.valueOf(53);
        BigInteger e = BigInteger.valueOf(17);
        BigInteger n = p.multiply(q);
        BigInteger phi = p.subtract(BigInteger.ONE).multiply(q.subtract(BigInteger.ONE));
        BigInteger d = e.modInverse(phi);                       // 2753

        BigInteger m = BigInteger.valueOf(65);
        BigInteger c = m.modPow(e, n);                          // 2790
        System.out.println(c + " -> " + c.modPow(d, n));        // 2790 -> 65

        // Real-size primes:
        BigInteger bigP = BigInteger.probablePrime(1024, new SecureRandom());
        System.out.println(bigP.bitLength() + "-bit prime generated");
    }
}`,
cpp:`#include <iostream>
#include <stdexcept>
#include <cstdint>

using u64 = std::uint64_t;
using i64 = std::int64_t;

// Works while mod < 2^32 (so the products fit in 64 bits).
// Real RSA needs a big-integer library such as GMP or OpenSSL BIGNUM.
u64 modPow(u64 base, u64 exp, u64 mod) {
    u64 result = 1;
    base %= mod;
    while (exp > 0) {
        if (exp & 1) result = result * base % mod;
        base = base * base % mod;
        exp >>= 1;
    }
    return result;
}

i64 modInverse(i64 a, i64 m) {          // extended Euclid
    i64 oldR = a, r = m, oldS = 1, s = 0;
    while (r != 0) {
        i64 q = oldR / r, t;
        t = oldR - q * r; oldR = r; r = t;
        t = oldS - q * s; oldS = s; s = t;
    }
    if (oldR != 1) throw std::runtime_error("e must be coprime to phi");
    return ((oldS % m) + m) % m;
}

int main() {
    u64 p = 61, q = 53, e = 17;
    u64 n = p * q, phi = (p - 1) * (q - 1);
    u64 d = modInverse(e, phi);              // 2753
    u64 c = modPow(65, e, n);                // 2790
    std::cout << d << ' ' << c << ' ' << modPow(c, d, n) << '\\n';   // 2753 2790 65
}`}},

dh:{name:'Diffie–Hellman',
 cx:[['Each party’s work','O(log a) multiplications','Two modular exponentiations each'],['Bit operations','O(k³)','k = size of p in bits'],['Messages exchanged','2','One public value each way'],['Extra space','O(k)','A few k-bit numbers'],['Best known attack','Discrete log','Brute force is O(p); number field sieve is sub-exponential']],
 pts:['Both sides compute the same value: (gᵇ)ᵃ = (gᵃ)ᵇ = gᵃᵇ mod p.','Eve sees g, p, gᵃ and gᵇ, but getting a from gᵃ is the discrete logarithm problem.','Unauthenticated DH falls to a man-in-the-middle; TLS signs the exchange with a certificate key.','Modern TLS uses elliptic-curve DH (X25519): 256-bit keys with security comparable to 3072-bit classic DH.'],
 pseudo:['public: prime p, generator g','Alice: pick secret a;  send A ← gᵃ mod p','Bob:   pick secret b;  send B ← gᵇ mod p','Alice: s ← Bᵃ mod p','Bob:   s ← Aᵇ mod p','// both now hold s = gᵃᵇ mod p','// Eve knows p, g, A, B but not a or b'],
 code:{
python:`import secrets

p = 2**31 - 1                         # demo prime; real DH uses 2048-bit groups or X25519
g = 7

a = secrets.randbelow(p - 2) + 1      # Alice's secret
b = secrets.randbelow(p - 2) + 1      # Bob's secret
A = pow(g, a, p)                      # Alice sends A
B = pow(g, b, p)                      # Bob sends B

alice_secret = pow(B, a, p)
bob_secret = pow(A, b, p)
print(alice_secret == bob_secret)     # True`,
javascript:`function modPow(base, exp, mod) {
  let result = 1n;
  base %= mod;
  while (exp > 0n) {
    if (exp & 1n) result = result * base % mod;
    base = base * base % mod;
    exp >>= 1n;
  }
  return result;
}

function randomSecret(p) {            // demo only: 31-bit secret from crypto RNG
  const x = crypto.getRandomValues(new Uint32Array(1))[0];
  return BigInt(x) % (p - 2n) + 1n;
}

const p = 2147483647n, g = 7n;       // real DH: 2048-bit p, or X25519
const a = randomSecret(p), b = randomSecret(p);
const A = modPow(g, a, p), B = modPow(g, b, p);
console.log(modPow(B, a, p) === modPow(A, b, p)); // true`,
java:`import java.math.BigInteger;
import java.security.SecureRandom;

public class DiffieHellman {
    public static void main(String[] args) {
        SecureRandom rng = new SecureRandom();
        BigInteger p = BigInteger.valueOf(2147483647L);   // real DH: 2048-bit p
        BigInteger g = BigInteger.valueOf(7);

        BigInteger a = new BigInteger(30, rng).add(BigInteger.ONE);   // Alice's secret
        BigInteger b = new BigInteger(30, rng).add(BigInteger.ONE);   // Bob's secret
        BigInteger A = g.modPow(a, p);                    // sent to Bob
        BigInteger B = g.modPow(b, p);                    // sent to Alice

        BigInteger sAlice = B.modPow(a, p);
        BigInteger sBob = A.modPow(b, p);
        System.out.println(sAlice.equals(sBob));          // true
    }
}`,
cpp:`#include <iostream>
#include <random>
#include <cstdint>

using u64 = std::uint64_t;

u64 modPow(u64 base, u64 exp, u64 mod) {     // safe here because p < 2^32
    u64 result = 1;
    base %= mod;
    while (exp > 0) {
        if (exp & 1) result = result * base % mod;
        base = base * base % mod;
        exp >>= 1;
    }
    return result;
}

int main() {
    const u64 p = 2147483647, g = 7;         // real DH: 2048-bit p, or X25519
    std::random_device rd;                   // demo RNG; use a CSPRNG in real code
    std::uniform_int_distribution<u64> dist(1, p - 2);
    u64 a = dist(rd), b = dist(rd);

    u64 A = modPow(g, a, p), B = modPow(g, b, p);
    std::cout << (modPow(B, a, p) == modPow(A, b, p) ? "match" : "mismatch") << '\\n';
}`}}
};
