/* ===== Library part A: sorting, searching, array patterns ===== */
Object.assign(ALGOS,{

selection:{name:'Selection sort',cat:'sorting',
 blurb:'Repeatedly find the smallest remaining value and swap it into the next position.',
 cx:[['Best time','O(n²)','Always scans the whole unsorted part'],['Average time','O(n²)','About n²/2 comparisons'],['Worst time','O(n²)',''],['Extra space','O(1)','In place'],['Swaps','O(n)','At most n − 1, useful when writes are expensive'],['Stable?','No','A long-distance swap can jump over an equal value']],
 pts:['The array is split into a sorted prefix and an unsorted suffix.','Each pass selects the minimum of the suffix and appends it to the prefix.','It does the same work on every input, so there is no best case advantage.','Its only strength is the small number of swaps.'],
 pseudo:['procedure selectionSort(A)','  for i ← 0 to n − 2','    min ← i','    for j ← i + 1 to n − 1','      if A[j] < A[min]: min ← j','    swap(A[i], A[min])'],
 trace:[[1,'Start with A = [64, 25, 12, 22, 11]. i = 0, so the whole array is unsorted.'],[4,'Scan for the minimum: 25 < 64, then 12 < 25, then 11 < 12. min ends at index 4 (value 11).'],[5,'Swap A[0] and A[4] → [11, 25, 12, 22, 64]. Index 0 is now final.'],[4,'i = 1: the smallest of [25, 12, 22, 64] is 12 at index 2.'],[5,'Swap → [11, 12, 25, 22, 64].'],[5,'i = 2: the smallest of [25, 22, 64] is 22 → swap → [11, 12, 22, 25, 64].'],[5,'i = 3: 25 is already the smaller of [25, 64]. Sorted.']],
 q:{q:'At most how many swaps does selection sort make on n elements?',o:['n − 1','n log n','n² / 2','n²'],a:0,why:'Exactly one swap per pass, and there are n − 1 passes.'},
 code:{
python:`def selection_sort(a):
    n = len(a)
    for i in range(n - 1):
        m = i
        for j in range(i + 1, n):
            if a[j] < a[m]:
                m = j
        a[i], a[m] = a[m], a[i]
    return a

print(selection_sort([64, 25, 12, 22, 11]))   # [11, 12, 22, 25, 64]`,
javascript:`function selectionSort(a) {
  for (let i = 0; i < a.length - 1; i++) {
    let m = i;
    for (let j = i + 1; j < a.length; j++) if (a[j] < a[m]) m = j;
    [a[i], a[m]] = [a[m], a[i]];
  }
  return a;
}

console.log(selectionSort([64, 25, 12, 22, 11])); // [11, 12, 22, 25, 64]`,
java:`import java.util.Arrays;

public class SelectionSort {
    static void selectionSort(int[] a) {
        for (int i = 0; i < a.length - 1; i++) {
            int m = i;
            for (int j = i + 1; j < a.length; j++) if (a[j] < a[m]) m = j;
            int t = a[i]; a[i] = a[m]; a[m] = t;
        }
    }

    public static void main(String[] args) {
        int[] a = {64, 25, 12, 22, 11};
        selectionSort(a);
        System.out.println(Arrays.toString(a)); // [11, 12, 22, 25, 64]
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <utility>

void selectionSort(std::vector<int>& a) {
    for (size_t i = 0; i + 1 < a.size(); i++) {
        size_t m = i;
        for (size_t j = i + 1; j < a.size(); j++) if (a[j] < a[m]) m = j;
        std::swap(a[i], a[m]);
    }
}

int main() {
    std::vector<int> a = {64, 25, 12, 22, 11};
    selectionSort(a);
    for (int x : a) std::cout << x << ' ';   // 11 12 22 25 64
}`}},

heapsort:{name:'Heap sort',cat:'sorting',
 blurb:'Build a max-heap, then repeatedly move the largest element to the end and repair the heap.',
 cx:[['Best time','O(n log n)',''],['Average time','O(n log n)',''],['Worst time','O(n log n)','Guaranteed, unlike quicksort'],['Extra space','O(1)','In place, iterative sift-down'],['Build heap','O(n)','Bottom-up construction is linear'],['Stable?','No','Heap operations reorder equal values']],
 pts:['A max-heap is an array where every parent is ≥ its children: children of i live at 2i + 1 and 2i + 2.','Phase 1 turns the array into a heap. Phase 2 swaps the root (the max) to the end and shrinks the heap by one.','Combines merge sort’s guaranteed O(n log n) with quicksort’s O(1) memory.','Slower than quicksort in practice because it jumps around memory (poor cache use). C++’s std::sort falls back to it to avoid quicksort’s worst case.'],
 pseudo:['procedure heapSort(A)','  for i ← ⌊n/2⌋ − 1 down to 0: siftDown(A, n, i)   // build max-heap','  for end ← n − 1 down to 1','    swap(A[0], A[end])   // largest moves to the back','    siftDown(A, end, 0)  // repair the smaller heap','procedure siftDown(A, size, i)','  largest ← index of the biggest of A[i], A[2i+1], A[2i+2] (within size)','  if largest ≠ i: swap(A[i], A[largest]); siftDown(A, size, largest)'],
 trace:[[1,'A = [4, 10, 3, 5, 1]. Build the heap starting at i = 1 (value 10): its children 5 and 1 are smaller, nothing to do.'],[7,'i = 0 (value 4): the bigger child is 10 → swap → [10, 4, 3, 5, 1]. Continue at index 1: child 5 > 4 → swap → [10, 5, 3, 4, 1]. Max-heap built.'],[3,'Swap the root 10 with the last element → [1, 5, 3, 4 | 10]. 10 is in its final place.'],[4,'Sift 1 down: swap with 5, then with 4 → [5, 4, 3, 1 | 10].'],[3,'Swap 5 to the back → [1, 4, 3 | 5, 10], sift down → [4, 1, 3 | 5, 10].'],[3,'Swap 4 back → [3, 1 | 4, 5, 10]; 3 ≥ 1, no sift needed. Swap 3 back → [1, 3, 4, 5, 10]. Sorted.']],
 q:{q:'Building the initial max-heap bottom-up takes how long?',o:['O(log n)','O(n)','O(n log n)','O(n²)'],a:1,why:'Most nodes are near the bottom and sift down only a level or two; the total sums to O(n).'},
 code:{
python:`def sift_down(a, size, i):
    while True:
        largest, l, r = i, 2 * i + 1, 2 * i + 2
        if l < size and a[l] > a[largest]:
            largest = l
        if r < size and a[r] > a[largest]:
            largest = r
        if largest == i:
            return
        a[i], a[largest] = a[largest], a[i]
        i = largest

def heap_sort(a):
    n = len(a)
    for i in range(n // 2 - 1, -1, -1):   # build a max-heap
        sift_down(a, n, i)
    for end in range(n - 1, 0, -1):
        a[0], a[end] = a[end], a[0]        # move the max to the back
        sift_down(a, end, 0)
    return a

print(heap_sort([4, 10, 3, 5, 1]))   # [1, 3, 4, 5, 10]`,
javascript:`function siftDown(a, size, i) {
  for (;;) {
    let largest = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < size && a[l] > a[largest]) largest = l;
    if (r < size && a[r] > a[largest]) largest = r;
    if (largest === i) return;
    [a[i], a[largest]] = [a[largest], a[i]];
    i = largest;
  }
}

function heapSort(a) {
  const n = a.length;
  for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(a, n, i);   // build max-heap
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];                           // max to the back
    siftDown(a, end, 0);
  }
  return a;
}

console.log(heapSort([4, 10, 3, 5, 1])); // [1, 3, 4, 5, 10]`,
java:`import java.util.Arrays;

public class HeapSort {
    static void siftDown(int[] a, int size, int i) {
        while (true) {
            int largest = i, l = 2 * i + 1, r = 2 * i + 2;
            if (l < size && a[l] > a[largest]) largest = l;
            if (r < size && a[r] > a[largest]) largest = r;
            if (largest == i) return;
            int t = a[i]; a[i] = a[largest]; a[largest] = t;
            i = largest;
        }
    }

    static void heapSort(int[] a) {
        int n = a.length;
        for (int i = n / 2 - 1; i >= 0; i--) siftDown(a, n, i);
        for (int end = n - 1; end > 0; end--) {
            int t = a[0]; a[0] = a[end]; a[end] = t;
            siftDown(a, end, 0);
        }
    }

    public static void main(String[] args) {
        int[] a = {4, 10, 3, 5, 1};
        heapSort(a);
        System.out.println(Arrays.toString(a)); // [1, 3, 4, 5, 10]
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <utility>

void siftDown(std::vector<int>& a, int size, int i) {
    while (true) {
        int largest = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < size && a[l] > a[largest]) largest = l;
        if (r < size && a[r] > a[largest]) largest = r;
        if (largest == i) return;
        std::swap(a[i], a[largest]);
        i = largest;
    }
}

void heapSort(std::vector<int>& a) {
    int n = a.size();
    for (int i = n / 2 - 1; i >= 0; i--) siftDown(a, n, i);
    for (int end = n - 1; end > 0; end--) {
        std::swap(a[0], a[end]);
        siftDown(a, end, 0);
    }
}

int main() {
    std::vector<int> a = {4, 10, 3, 5, 1};
    heapSort(a);
    for (int x : a) std::cout << x << ' ';   // 1 3 4 5 10
}`}},

counting:{name:'Counting sort',cat:'sorting',
 blurb:'Count how many times each value occurs, then write the values back out in order. No comparisons at all.',
 cx:[['Time','O(n + k)','k = max − min + 1, the range of values'],['Extra space','O(k)','One counter per possible value'],['Comparisons','None','So the O(n log n) lower bound does not apply'],['Best for','Small integer ranges','Ages, grades, bytes, digits'],['Stable?','Yes, with prefix sums','The simple version below rebuilds values instead']],
 pts:['Comparison sorts can’t beat O(n log n); counting sort sidesteps that by using values as array indices.','It is only practical when the range k is not much bigger than n.','Radix sort runs a stable counting sort once per digit to sort large integers in O(d · (n + b)).','Bucket sort generalizes the idea to real numbers spread evenly over a range.'],
 pseudo:['procedure countingSort(A)','  lo ← min(A); hi ← max(A)','  count[0 .. hi − lo] ← 0','  for each x in A: count[x − lo] += 1','  for v ← 0 to hi − lo','    output (v + lo), count[v] times'],
 trace:[[1,'A = [4, 2, 2, 8, 3, 3, 1]. lo = 1, hi = 8, so we need 8 counters.'],[3,'Tally: value 1 → 1, value 2 → 2, value 3 → 2, value 4 → 1, value 8 → 1. Values 5–7 stay 0.'],[5,'Walk the counters in order: 1, 2, 2, 3, 3, 4, 8.']],
 q:{q:'Why can counting sort beat O(n log n)?',o:['It uses a better pivot','It never compares two elements','It sorts in place','It only works on sorted input'],a:1,why:'The n log n lower bound applies only to comparison-based sorting.'},
 code:{
python:`def counting_sort(a):
    if not a:
        return a
    lo, hi = min(a), max(a)
    count = [0] * (hi - lo + 1)
    for x in a:
        count[x - lo] += 1
    out = []
    for v, c in enumerate(count):
        out.extend([v + lo] * c)
    return out

print(counting_sort([4, 2, 2, 8, 3, 3, 1]))   # [1, 2, 2, 3, 3, 4, 8]`,
javascript:`function countingSort(a) {
  if (!a.length) return a;
  const lo = Math.min(...a), hi = Math.max(...a);
  const count = new Array(hi - lo + 1).fill(0);
  for (const x of a) count[x - lo]++;
  const out = [];
  count.forEach((c, v) => { for (let k = 0; k < c; k++) out.push(v + lo); });
  return out;
}

console.log(countingSort([4, 2, 2, 8, 3, 3, 1])); // [1, 2, 2, 3, 3, 4, 8]`,
java:`import java.util.Arrays;

public class CountingSort {
    static int[] countingSort(int[] a) {
        if (a.length == 0) return a;
        int lo = Arrays.stream(a).min().getAsInt(), hi = Arrays.stream(a).max().getAsInt();
        int[] count = new int[hi - lo + 1];
        for (int x : a) count[x - lo]++;
        int[] out = new int[a.length];
        int k = 0;
        for (int v = 0; v < count.length; v++)
            for (int c = 0; c < count[v]; c++) out[k++] = v + lo;
        return out;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(countingSort(new int[]{4, 2, 2, 8, 3, 3, 1})));
        // [1, 2, 2, 3, 3, 4, 8]
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <algorithm>

std::vector<int> countingSort(const std::vector<int>& a) {
    if (a.empty()) return a;
    auto [mn, mx] = std::minmax_element(a.begin(), a.end());
    int lo = *mn, hi = *mx;
    std::vector<int> count(hi - lo + 1, 0), out;
    for (int x : a) count[x - lo]++;
    for (int v = 0; v < (int)count.size(); v++)
        out.insert(out.end(), count[v], v + lo);
    return out;
}

int main() {
    for (int x : countingSort({4, 2, 2, 8, 3, 3, 1})) std::cout << x << ' ';   // 1 2 2 3 3 4 8
}`}},

quickselect:{name:'Quickselect',cat:'searching',
 blurb:'Find the k-th smallest element without fully sorting: partition like quicksort, but only continue into the side that contains k.',
 cx:[['Average time','O(n)','n + n/2 + n/4 + … ≈ 2n'],['Worst time','O(n²)','Consistently bad pivots; random pivots make this very unlikely'],['Extra space','O(1)','Iterative version'],['Compare with','Sort then index','O(n log n)'],['Compare with','Heap of size k','O(n log k)']],
 pts:['After partitioning, the pivot sits at its final sorted index p.','If p = k we’re done; otherwise only one side can contain the answer.','Used for medians, percentiles and “k-th largest” problems.','The median-of-medians pivot rule guarantees O(n) worst case but is slower in practice.'],
 pseudo:['procedure quickselect(A, k)   // k is 0-based','  lo ← 0; hi ← n − 1','  loop','    p ← partition(A, lo, hi) around a random pivot','    if p = k: return A[p]','    if p < k: lo ← p + 1   // answer is to the right','    else: hi ← p − 1        // answer is to the left'],
 trace:[[1,'Find the k = 2 smallest (0-based) in [7, 10, 4, 3, 20, 15]. For this trace, use the last element as pivot.'],[3,'Pivot 15: partition → [7, 10, 4, 3, 15, 20], p = 4.'],[6,'p = 4 > k = 2, so search the left part: hi = 3.'],[3,'Pivot 3 over [7, 10, 4, 3] → [3, 10, 4, 7], p = 0.'],[5,'p = 0 < 2, so search right: lo = 1.'],[3,'Pivot 7 over [10, 4, 7] → [4, 7, 10], placing 7 at index 2.'],[4,'p = 2 = k. The answer is 7 (sorted order: 3, 4, 7, 10, 15, 20).']],
 q:{q:'Why is quickselect O(n) on average while quicksort is O(n log n)?',o:['It uses a better partition','It recurses into only one side','It skips the pivot','It sorts with counting'],a:1,why:'Each round discards one side, so the work shrinks geometrically: n + n/2 + n/4 + … ≈ 2n.'},
 code:{
python:`import random

def quickselect(a, k):
    """Return the k-th smallest element (k is 0-based)."""
    lo, hi = 0, len(a) - 1
    while True:
        p = random.randint(lo, hi)
        a[p], a[hi] = a[hi], a[p]          # random pivot to the end
        pivot, i = a[hi], lo
        for j in range(lo, hi):
            if a[j] < pivot:
                a[i], a[j] = a[j], a[i]
                i += 1
        a[i], a[hi] = a[hi], a[i]
        if i == k:
            return a[i]
        if i < k:
            lo = i + 1
        else:
            hi = i - 1

print(quickselect([7, 10, 4, 3, 20, 15], 2))   # 7`,
javascript:`function quickselect(a, k) {
  let lo = 0, hi = a.length - 1;
  for (;;) {
    const p = lo + Math.floor(Math.random() * (hi - lo + 1));
    [a[p], a[hi]] = [a[hi], a[p]];               // random pivot to the end
    const pivot = a[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) if (a[j] < pivot) { [a[i], a[j]] = [a[j], a[i]]; i++; }
    [a[i], a[hi]] = [a[hi], a[i]];
    if (i === k) return a[i];
    if (i < k) lo = i + 1; else hi = i - 1;
  }
}

console.log(quickselect([7, 10, 4, 3, 20, 15], 2)); // 7`,
java:`import java.util.Random;

public class Quickselect {
    static final Random RNG = new Random();

    static int quickselect(int[] a, int k) {
        int lo = 0, hi = a.length - 1;
        while (true) {
            int p = lo + RNG.nextInt(hi - lo + 1);
            int t = a[p]; a[p] = a[hi]; a[hi] = t;     // random pivot to the end
            int pivot = a[hi], i = lo;
            for (int j = lo; j < hi; j++)
                if (a[j] < pivot) { t = a[i]; a[i] = a[j]; a[j] = t; i++; }
            t = a[i]; a[i] = a[hi]; a[hi] = t;
            if (i == k) return a[i];
            if (i < k) lo = i + 1; else hi = i - 1;
        }
    }

    public static void main(String[] args) {
        System.out.println(quickselect(new int[]{7, 10, 4, 3, 20, 15}, 2)); // 7
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <random>
#include <utility>

int quickselect(std::vector<int> a, int k) {
    static std::mt19937 rng(std::random_device{}());
    int lo = 0, hi = a.size() - 1;
    while (true) {
        int p = std::uniform_int_distribution<int>(lo, hi)(rng);
        std::swap(a[p], a[hi]);                      // random pivot to the end
        int pivot = a[hi], i = lo;
        for (int j = lo; j < hi; j++) if (a[j] < pivot) std::swap(a[i++], a[j]);
        std::swap(a[i], a[hi]);
        if (i == k) return a[i];
        if (i < k) lo = i + 1; else hi = i - 1;
    }
}

int main() {
    std::cout << quickselect({7, 10, 4, 3, 20, 15}, 2);   // 7
}`}},

lowerbound:{name:'Binary search on the answer',cat:'searching',
 blurb:'When a yes/no condition flips from false to true exactly once, binary search for the flip point. Lower bound on a sorted array is the simplest case.',
 cx:[['Lower bound','O(log n)','First index with A[i] ≥ x'],['Search on answer','O(f · log R)','R = size of the answer range, f = cost of one feasibility check'],['Extra space','O(1)',''],['Requirement','Monotonic predicate','false … false, true … true']],
 pts:['Use the half-open form: lo is always a candidate, hi is one past the last candidate.','“Minimize the maximum” or “smallest capacity that works” problems are classic signals.','Check feasibility with a greedy pass, then binary search on the value instead of the index.','NeetCode examples: Koko Eating Bananas, Capacity to Ship Packages, Split Array Largest Sum.'],
 pseudo:['procedure searchAnswer(lo, hi)   // feasible: false … false, true … true','  while lo < hi','    mid ← ⌊(lo + hi) / 2⌋','    if feasible(mid): hi ← mid   // mid works; try smaller','    else: lo ← mid + 1           // mid fails; go bigger','  return lo   // smallest feasible value'],
 trace:[[0,'Ship weights [1..10] within 5 days. Capacity must be between max = 10 and sum = 55.'],[3,'mid = 32: feasible in 2 days → hi = 32.'],[3,'mid = 21: feasible (3 days) → hi = 21. mid = 15: feasible (5 days) → hi = 15.'],[4,'mid = 12: needs 6 days → lo = 13. mid = 14: needs 6 days → lo = 15.'],[5,'lo = hi = 15. The smallest capacity that works is 15.']],
 q:{q:'Binary search on the answer requires the feasibility check to be…',o:['Fast to compute','Monotonic: once true, true for all larger values','Exactly O(1)','Based on a sorted input array'],a:1,why:'The search assumes a single flip point; without monotonicity, discarding half the range could discard the answer.'},
 code:{
python:`def lower_bound(a, x):
    """First index i with a[i] >= x (len(a) if none)."""
    lo, hi = 0, len(a)
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] < x:
            lo = mid + 1
        else:
            hi = mid
    return lo

def min_capacity(weights, days):
    """Smallest ship capacity that ships the weights in order within the given days."""
    def feasible(cap):
        need, load = 1, 0
        for w in weights:
            if load + w > cap:
                need, load = need + 1, 0
            load += w
        return need <= days

    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        if feasible(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo

print(lower_bound([1, 3, 3, 5, 8], 3))                    # 1
print(min_capacity([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5))   # 15`,
javascript:`function lowerBound(a, x) {
  let lo = 0, hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] < x) lo = mid + 1; else hi = mid;
  }
  return lo;
}

function minCapacity(weights, days) {
  const feasible = cap => {
    let need = 1, load = 0;
    for (const w of weights) {
      if (load + w > cap) { need++; load = 0; }
      load += w;
    }
    return need <= days;
  };
  let lo = Math.max(...weights), hi = weights.reduce((s, w) => s + w, 0);
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (feasible(mid)) hi = mid; else lo = mid + 1;
  }
  return lo;
}

console.log(lowerBound([1, 3, 3, 5, 8], 3));                    // 1
console.log(minCapacity([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5));   // 15`,
java:`public class SearchOnAnswer {
    static int lowerBound(int[] a, int x) {
        int lo = 0, hi = a.length;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (a[mid] < x) lo = mid + 1; else hi = mid;
        }
        return lo;
    }

    static boolean feasible(int[] weights, int days, int cap) {
        int need = 1, load = 0;
        for (int w : weights) {
            if (load + w > cap) { need++; load = 0; }
            load += w;
        }
        return need <= days;
    }

    static int minCapacity(int[] weights, int days) {
        int lo = 0, hi = 0;
        for (int w : weights) { lo = Math.max(lo, w); hi += w; }
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (feasible(weights, days, mid)) hi = mid; else lo = mid + 1;
        }
        return lo;
    }

    public static void main(String[] args) {
        System.out.println(lowerBound(new int[]{1, 3, 3, 5, 8}, 3));                  // 1
        System.out.println(minCapacity(new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}, 5)); // 15
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>

int lowerBound(const std::vector<int>& a, int x) {
    int lo = 0, hi = a.size();
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (a[mid] < x) lo = mid + 1; else hi = mid;
    }
    return lo;   // same as std::lower_bound(a.begin(), a.end(), x) - a.begin()
}

int minCapacity(const std::vector<int>& weights, int days) {
    auto feasible = [&](int cap) {
        int need = 1, load = 0;
        for (int w : weights) {
            if (load + w > cap) { need++; load = 0; }
            load += w;
        }
        return need <= days;
    };
    int lo = *std::max_element(weights.begin(), weights.end());
    int hi = std::accumulate(weights.begin(), weights.end(), 0);
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (feasible(mid)) hi = mid; else lo = mid + 1;
    }
    return lo;
}

int main() {
    std::cout << lowerBound({1, 3, 3, 5, 8}, 3) << '\\n';                    // 1
    std::cout << minCapacity({1, 2, 3, 4, 5, 6, 7, 8, 9, 10}, 5) << '\\n';   // 15
}`}},

twopointers:{name:'Two pointers',cat:'arrays',
 blurb:'Walk two indices toward each other (or in the same direction) so each step rules out many candidates at once.',
 cx:[['Time','O(n)','Each pointer moves at most n times'],['Extra space','O(1)',''],['Requirement','Usually sorted input','Or a structure where moving a pointer has a predictable effect'],['Brute force','O(n²)','Checking every pair']],
 pts:['Opposite ends: pair sums in sorted arrays, palindromes, container with most water.','Same direction (fast/slow): removing duplicates in place, partitioning, linked-list cycles.','The key is an argument for why a whole row or column of pairs can be skipped.','3Sum is a loop around a two-pointer pair search: O(n²) instead of O(n³).'],
 pseudo:['procedure pairWithSum(A, target)   // A is sorted','  i ← 0; j ← n − 1','  while i < j','    s ← A[i] + A[j]','    if s = target: return (i, j)','    if s < target: i ← i + 1   // need a bigger sum','    else: j ← j − 1            // need a smaller sum','  return none'],
 trace:[[1,'A = [1, 3, 4, 6, 8, 11], target 10. Start at both ends.'],[6,'1 + 11 = 12 > 10. 11 is too big with even the smallest partner, so drop it: j moves left.'],[5,'1 + 8 = 9 < 10. 1 is too small with even the largest remaining partner: i moves right.'],[6,'3 + 8 = 11 > 10 → j left.'],[5,'3 + 6 = 9 < 10 → i right.'],[4,'4 + 6 = 10. Found indices (2, 3).']],
 q:{q:'Sum too small, so we move i right. Why can’t A[i] be part of the answer?',o:['Because A[i] is negative','Every remaining partner for A[i] is ≤ A[j], so every pair with A[i] is too small','Because i < j','It could be; this is a heuristic'],a:1,why:'A is sorted, so A[i] + A[j] is the largest sum A[i] can still make. If that is too small, A[i] is useless.'},
 code:{
python:`def pair_with_sum(a, target):
    """a is sorted. Return indices (i, j) with a[i] + a[j] == target, or None."""
    i, j = 0, len(a) - 1
    while i < j:
        s = a[i] + a[j]
        if s == target:
            return i, j
        if s < target:
            i += 1       # need a bigger sum
        else:
            j -= 1       # need a smaller sum
    return None

print(pair_with_sum([1, 3, 4, 6, 8, 11], 10))   # (2, 3)`,
javascript:`function pairWithSum(a, target) {
  let i = 0, j = a.length - 1;
  while (i < j) {
    const s = a[i] + a[j];
    if (s === target) return [i, j];
    if (s < target) i++;   // need a bigger sum
    else j--;              // need a smaller sum
  }
  return null;
}

console.log(pairWithSum([1, 3, 4, 6, 8, 11], 10)); // [2, 3]`,
java:`import java.util.Arrays;

public class TwoPointers {
    static int[] pairWithSum(int[] a, int target) {
        int i = 0, j = a.length - 1;
        while (i < j) {
            int s = a[i] + a[j];
            if (s == target) return new int[]{i, j};
            if (s < target) i++; else j--;
        }
        return null;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(pairWithSum(new int[]{1, 3, 4, 6, 8, 11}, 10))); // [2, 3]
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <utility>

std::pair<int, int> pairWithSum(const std::vector<int>& a, int target) {
    int i = 0, j = a.size() - 1;
    while (i < j) {
        int s = a[i] + a[j];
        if (s == target) return {i, j};
        if (s < target) i++; else j--;
    }
    return {-1, -1};
}

int main() {
    auto [i, j] = pairWithSum({1, 3, 4, 6, 8, 11}, 10);
    std::cout << i << ' ' << j;   // 2 3
}`}},

slidingwindow:{name:'Sliding window',cat:'arrays',
 blurb:'Keep a window [left, right] over the array. Grow it on the right; shrink it from the left whenever a condition is met or broken.',
 cx:[['Time','O(n)','Every element enters and leaves the window once'],['Extra space','O(1) – O(k)','A running sum, or a hash map of window contents'],['Brute force','O(n²)','Every subarray'],['Works when','Shrinking keeps validity monotonic','e.g. all values positive for sum windows']],
 pts:['Fixed-size windows: add the new element, remove the one that fell off.','Variable windows: expand right, then shrink left while the window is (or stops being) valid.','Track window contents with a counter or hash map for string problems.','NeetCode examples: Longest Substring Without Repeating Characters, Minimum Window Substring, Permutation in String.'],
 pseudo:['procedure shortestWindow(A, target)   // values > 0','  left ← 0; total ← 0; best ← ∞','  for right ← 0 to n − 1','    total ← total + A[right]           // expand','    while total ≥ target','      best ← min(best, right − left + 1)','      total ← total − A[left]; left ← left + 1   // shrink','  return best (0 if never reached)'],
 trace:[[1,'Shortest subarray of [2, 3, 1, 2, 4, 3] with sum ≥ 7.'],[3,'Expand to right = 3: window [2, 3, 1, 2], total 8 ≥ 7.'],[6,'Record length 4, drop 2 from the left → total 6.'],[3,'right = 4 adds 4 → total 10. Record 4, drop 3 → 7, record 3, drop 1 → 6.'],[3,'right = 5 adds 3 → total 9. Record 3, drop 2 → 7: window [4, 3] has length 2. Drop 4 → 3.'],[7,'Answer: 2.']],
 q:{q:'There’s a while loop inside the for loop. Why is it still O(n)?',o:['The while loop runs at most once','Each index is added once and removed once, so total work is 2n','The array is small','It isn’t; it’s O(n²)'],a:1,why:'left only moves forward and never past right, so across the whole run it advances at most n times.'},
 code:{
python:`def min_subarray_len(target, a):
    best = float("inf")
    left = total = 0
    for right, x in enumerate(a):
        total += x                       # grow the window
        while total >= target:           # shrink while still valid
            best = min(best, right - left + 1)
            total -= a[left]
            left += 1
    return 0 if best == float("inf") else best

print(min_subarray_len(7, [2, 3, 1, 2, 4, 3]))   # 2`,
javascript:`function minSubarrayLen(target, a) {
  let best = Infinity, left = 0, total = 0;
  for (let right = 0; right < a.length; right++) {
    total += a[right];                  // grow the window
    while (total >= target) {           // shrink while still valid
      best = Math.min(best, right - left + 1);
      total -= a[left++];
    }
  }
  return best === Infinity ? 0 : best;
}

console.log(minSubarrayLen(7, [2, 3, 1, 2, 4, 3])); // 2`,
java:`public class SlidingWindow {
    static int minSubarrayLen(int target, int[] a) {
        int best = Integer.MAX_VALUE, left = 0, total = 0;
        for (int right = 0; right < a.length; right++) {
            total += a[right];
            while (total >= target) {
                best = Math.min(best, right - left + 1);
                total -= a[left++];
            }
        }
        return best == Integer.MAX_VALUE ? 0 : best;
    }

    public static void main(String[] args) {
        System.out.println(minSubarrayLen(7, new int[]{2, 3, 1, 2, 4, 3})); // 2
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <climits>
#include <algorithm>

int minSubarrayLen(int target, const std::vector<int>& a) {
    int best = INT_MAX, left = 0, total = 0;
    for (int right = 0; right < (int)a.size(); right++) {
        total += a[right];
        while (total >= target) {
            best = std::min(best, right - left + 1);
            total -= a[left++];
        }
    }
    return best == INT_MAX ? 0 : best;
}

int main() {
    std::cout << minSubarrayLen(7, {2, 3, 1, 2, 4, 3});   // 2
}`}},

prefixsum:{name:'Prefix sums',cat:'arrays',
 blurb:'Precompute running totals once, then answer any range-sum question with a single subtraction.',
 cx:[['Build','O(n)','One pass'],['Range query','O(1)','P[r + 1] − P[l]'],['Extra space','O(n)','n + 1 totals'],['Updates','O(n) each','Use a Fenwick tree if values change often']],
 pts:['P[i] = sum of the first i elements, with P[0] = 0 to avoid special cases.','Sum of A[l..r] = P[r + 1] − P[l].','With a hash map of prefix sums seen so far, you can count subarrays with sum k in O(n).','Extends to 2D: a summed-area table answers rectangle sums in O(1).'],
 pseudo:['procedure buildPrefix(A)','  P[0] ← 0','  for i ← 0 to n − 1: P[i + 1] ← P[i] + A[i]','procedure rangeSum(l, r)   // inclusive','  return P[r + 1] − P[l]'],
 trace:[[1,'A = [3, 1, 4, 1, 5, 9].'],[2,'Running totals: P = [0, 3, 4, 8, 9, 14, 23].'],[4,'Sum of A[2..4] = P[5] − P[2] = 14 − 4 = 10 (that is 4 + 1 + 5).']],
 q:{q:'P has an extra leading 0. What does that buy you?',o:['Faster building','Range sums starting at index 0 need no special case','Less memory','Support for negative numbers'],a:1,why:'rangeSum(0, r) = P[r + 1] − P[0] works without an if-statement.'},
 code:{
python:`def build_prefix(a):
    prefix = [0] * (len(a) + 1)
    for i, x in enumerate(a):
        prefix[i + 1] = prefix[i] + x
    return prefix

def range_sum(prefix, l, r):
    """Sum of a[l..r] inclusive, in O(1)."""
    return prefix[r + 1] - prefix[l]

p = build_prefix([3, 1, 4, 1, 5, 9])
print(p)                    # [0, 3, 4, 8, 9, 14, 23]
print(range_sum(p, 2, 4))   # 10`,
javascript:`function buildPrefix(a) {
  const prefix = new Array(a.length + 1).fill(0);
  a.forEach((x, i) => { prefix[i + 1] = prefix[i] + x; });
  return prefix;
}

const rangeSum = (prefix, l, r) => prefix[r + 1] - prefix[l];

const p = buildPrefix([3, 1, 4, 1, 5, 9]);
console.log(p);                  // [0, 3, 4, 8, 9, 14, 23]
console.log(rangeSum(p, 2, 4));  // 10`,
java:`import java.util.Arrays;

public class PrefixSum {
    static long[] buildPrefix(int[] a) {
        long[] prefix = new long[a.length + 1];
        for (int i = 0; i < a.length; i++) prefix[i + 1] = prefix[i] + a[i];
        return prefix;
    }

    static long rangeSum(long[] prefix, int l, int r) {
        return prefix[r + 1] - prefix[l];
    }

    public static void main(String[] args) {
        long[] p = buildPrefix(new int[]{3, 1, 4, 1, 5, 9});
        System.out.println(Arrays.toString(p));   // [0, 3, 4, 8, 9, 14, 23]
        System.out.println(rangeSum(p, 2, 4));    // 10
    }
}`,
cpp:`#include <iostream>
#include <vector>

std::vector<long long> buildPrefix(const std::vector<int>& a) {
    std::vector<long long> prefix(a.size() + 1, 0);
    for (size_t i = 0; i < a.size(); i++) prefix[i + 1] = prefix[i] + a[i];
    return prefix;
}

long long rangeSum(const std::vector<long long>& prefix, int l, int r) {
    return prefix[r + 1] - prefix[l];
}

int main() {
    auto p = buildPrefix({3, 1, 4, 1, 5, 9});
    for (auto x : p) std::cout << x << ' ';      // 0 3 4 8 9 14 23
    std::cout << '\\n' << rangeSum(p, 2, 4);      // 10
}`}},

kadane:{name:'Kadane’s algorithm',cat:'arrays',
 blurb:'Find the maximum-sum contiguous subarray in one pass by deciding, at each element, whether to extend the current run or start over.',
 cx:[['Time','O(n)','One pass'],['Extra space','O(1)','Two running values'],['Brute force','O(n²)','Every subarray with a running sum'],['Technique','Dynamic programming','best ending here = max(x, previous + x)']],
 pts:['cur is the best sum of a subarray that ends exactly at the current index.','If cur has gone negative, it can only hurt what follows, so restart at the current element.','Initialize with A[0] (not 0) so all-negative arrays return the largest element.','Variants: maximum product subarray tracks both max and min, because a negative times a negative is positive.'],
 pseudo:['procedure kadane(A)','  best ← A[0]; cur ← A[0]','  for i ← 1 to n − 1','    cur ← max(A[i], cur + A[i])   // extend or restart','    best ← max(best, cur)','  return best'],
 trace:[[1,'A = [−2, 1, −3, 4, −1, 2, 1, −5, 4]. cur = best = −2.'],[3,'1: max(1, −2 + 1) = 1, restart. best = 1.'],[3,'−3: cur = −2. 4: max(4, −2 + 4) = 4, restart. best = 4.'],[4,'−1 → 3, 2 → 5 (best 5), 1 → 6 (best 6).'],[4,'−5 → 1, 4 → 5. best stays 6: the subarray [4, −1, 2, 1].']],
 q:{q:'When does Kadane’s algorithm restart the run at A[i]?',o:['When A[i] is negative','When the previous running sum cur is negative','Every other step','When best changes'],a:1,why:'max(A[i], cur + A[i]) picks A[i] alone exactly when cur < 0.'},
 code:{
python:`def max_subarray(a):
    best = cur = a[0]
    for x in a[1:]:
        cur = max(x, cur + x)     # extend the run or start fresh at x
        best = max(best, cur)
    return best

print(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))   # 6`,
javascript:`function maxSubarray(a) {
  let best = a[0], cur = a[0];
  for (let i = 1; i < a.length; i++) {
    cur = Math.max(a[i], cur + a[i]);   // extend or restart
    best = Math.max(best, cur);
  }
  return best;
}

console.log(maxSubarray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6`,
java:`public class Kadane {
    static int maxSubarray(int[] a) {
        int best = a[0], cur = a[0];
        for (int i = 1; i < a.length; i++) {
            cur = Math.max(a[i], cur + a[i]);
            best = Math.max(best, cur);
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println(maxSubarray(new int[]{-2, 1, -3, 4, -1, 2, 1, -5, 4})); // 6
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <algorithm>

int maxSubarray(const std::vector<int>& a) {
    int best = a[0], cur = a[0];
    for (size_t i = 1; i < a.size(); i++) {
        cur = std::max(a[i], cur + a[i]);
        best = std::max(best, cur);
    }
    return best;
}

int main() {
    std::cout << maxSubarray({-2, 1, -3, 4, -1, 2, 1, -5, 4});   // 6
}`}},

monostack:{name:'Monotonic stack',cat:'arrays',
 blurb:'Keep a stack whose values stay sorted. When a new element breaks the order, everything it pops has just found its “next greater” (or smaller) element.',
 cx:[['Time','O(n)','Each index is pushed and popped at most once'],['Extra space','O(n)','The stack'],['Brute force','O(n²)','Scan right from every index'],['Variants','Increasing or decreasing','Next greater, next smaller, previous greater…']],
 pts:['Store indices, not values, so you can compute distances and write answers back.','Decreasing stack → finds next greater elements. Increasing stack → next smaller.','Whatever remains on the stack at the end has no answer (−1).','NeetCode examples: Daily Temperatures, Car Fleet, Largest Rectangle in Histogram.'],
 pseudo:['procedure nextGreater(A)','  res[0..n−1] ← −1; stack ← empty   // holds indices','  for i ← 0 to n − 1','    while stack not empty and A[top] < A[i]','      res[pop()] ← A[i]   // A[i] is the next greater for that index','    push i','  return res'],
 trace:[[1,'A = [2, 1, 2, 4, 3].'],[5,'i = 0 (2): push. i = 1 (1): 1 < 2, nothing pops; push. Stack values: [2, 1].'],[4,'i = 2 (2): pops index 1 (1 < 2), so res[1] = 2. A[0] = 2 is not < 2; push.'],[4,'i = 3 (4): pops index 2 and index 0, both get 4.'],[6,'i = 4 (3): push. Indices 3 and 4 stay, so res = [4, 2, 4, −1, −1].']],
 q:{q:'For “next greater element”, values on the stack (bottom to top) are…',o:['Increasing','Decreasing (non-increasing)','Random','Always equal'],a:1,why:'Any value smaller than a newcomer gets popped, so the survivors decrease from bottom to top.'},
 code:{
python:`def next_greater(a):
    res = [-1] * len(a)
    stack = []                       # indices; their values are decreasing
    for i, x in enumerate(a):
        while stack and a[stack[-1]] < x:
            res[stack.pop()] = x     # x is the next greater for that index
        stack.append(i)
    return res

print(next_greater([2, 1, 2, 4, 3]))   # [4, 2, 4, -1, -1]`,
javascript:`function nextGreater(a) {
  const res = new Array(a.length).fill(-1), stack = [];
  a.forEach((x, i) => {
    while (stack.length && a[stack[stack.length - 1]] < x) res[stack.pop()] = x;
    stack.push(i);
  });
  return res;
}

console.log(nextGreater([2, 1, 2, 4, 3])); // [4, 2, 4, -1, -1]`,
java:`import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;

public class MonotonicStack {
    static int[] nextGreater(int[] a) {
        int[] res = new int[a.length];
        Arrays.fill(res, -1);
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i < a.length; i++) {
            while (!stack.isEmpty() && a[stack.peek()] < a[i]) res[stack.pop()] = a[i];
            stack.push(i);
        }
        return res;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(nextGreater(new int[]{2, 1, 2, 4, 3}))); // [4, 2, 4, -1, -1]
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <stack>

std::vector<int> nextGreater(const std::vector<int>& a) {
    std::vector<int> res(a.size(), -1);
    std::stack<int> st;
    for (int i = 0; i < (int)a.size(); i++) {
        while (!st.empty() && a[st.top()] < a[i]) { res[st.top()] = a[i]; st.pop(); }
        st.push(i);
    }
    return res;
}

int main() {
    for (int x : nextGreater({2, 1, 2, 4, 3})) std::cout << x << ' ';   // 4 2 4 -1 -1
}`}}
});
