/* ===== Problems batch 2: Binary Search, Linked List ===== */

P({n:704,s:'binary-search',t:'Binary Search',c:'bsearch',d:'Easy',rel:['binary'],
 sum:'Return the index of the target in a sorted array of distinct integers, or −1 if it is absent, in O(log n) time.',
 ex:'[−1, 0, 3, 5, 9, 12], target 9 → 4',
 h:['Compare the target with the middle element.','If the middle is too small, the target can only be to its right; otherwise to its left.','Keep the invariant: if the target exists, it lies inside [lo, hi].'],
 app:'Classic binary search. Maintain lo and hi, compute mid = lo + (hi − lo) / 2, and discard the half that cannot contain the target. Stop when found or when lo passes hi.',
 tc:'O(log n)',sc:'O(1)',
 py:`class Solution:
    def search(self, nums: list[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            mid = lo + (hi - lo) // 2
            if nums[mid] == target:
                return mid
            if nums[mid] < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return -1`,
 js:`function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
  }
  return -1;
}`,
 java:`class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
        }
        return -1;
    }
}`,
 cpp:`class Solution {
public:
    int search(vector<int>& nums, int target) {
        int lo = 0, hi = nums.size() - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
        }
        return -1;
    }
};`});

P({n:74,s:'search-a-2d-matrix',t:'Search a 2D Matrix',c:'bsearch',d:'Medium',rel:['binary'],
 sum:'Each row of the matrix is sorted, and each row starts after the previous row ends. Decide whether the target is in the matrix in O(log(m · n)).',
 ex:'[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target 3 → true',
 h:['Read row by row, the matrix is one long sorted list.','Index k of that list is row k / cols, column k % cols.','Run a single binary search over k from 0 to m · n − 1.'],
 app:'Treat the matrix as a flattened sorted array of length m · n and binary search it, converting each mid index back into (row, column) with division and modulo. Two binary searches (first the row, then the column) work equally well.',
 tc:'O(log(m · n))',sc:'O(1)',
 py:`class Solution:
    def searchMatrix(self, matrix: list[list[int]], target: int) -> bool:
        rows, cols = len(matrix), len(matrix[0])
        lo, hi = 0, rows * cols - 1
        while lo <= hi:                     # the matrix as one sorted list
            mid = (lo + hi) // 2
            v = matrix[mid // cols][mid % cols]
            if v == target:
                return True
            if v < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return False`,
 js:`function searchMatrix(matrix, target) {
  const rows = matrix.length, cols = matrix[0].length;
  let lo = 0, hi = rows * cols - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1, v = matrix[Math.floor(mid / cols)][mid % cols];
    if (v === target) return true;
    if (v < target) lo = mid + 1; else hi = mid - 1;
  }
  return false;
}`,
 java:`class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        int rows = matrix.length, cols = matrix[0].length;
        int lo = 0, hi = rows * cols - 1;
        while (lo <= hi) {
            int mid = (lo + hi) >>> 1, v = matrix[mid / cols][mid % cols];
            if (v == target) return true;
            if (v < target) lo = mid + 1; else hi = mid - 1;
        }
        return false;
    }
}`,
 cpp:`class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int rows = matrix.size(), cols = matrix[0].size();
        int lo = 0, hi = rows * cols - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2, v = matrix[mid / cols][mid % cols];
            if (v == target) return true;
            if (v < target) lo = mid + 1; else hi = mid - 1;
        }
        return false;
    }
};`});

P({n:875,s:'koko-eating-bananas',t:'Koko Eating Bananas',c:'bsearch',d:'Medium',rel:['lowerbound'],
 sum:'Koko eats from one pile per hour at k bananas per hour (finishing a smaller pile early wastes the rest of the hour). Find the smallest k that lets her finish all piles within h hours.',
 ex:'piles [3, 6, 7, 11], h = 8 → 4',
 h:['If speed k works, every faster speed also works.','That monotonic yes/no shape is a signal for binary search on the answer.','At speed k, pile p takes ⌈p / k⌉ hours. Search k between 1 and max(piles).'],
 app:'Binary search the speed in [1, max pile]. For a candidate k, total hours = Σ ⌈p / k⌉. If that fits in h, k is feasible and you try slower; otherwise go faster. The search converges on the smallest feasible speed.',
 tc:'O(n log max(p))',sc:'O(1)',
 py:`class Solution:
    def minEatingSpeed(self, piles: list[int], h: int) -> int:
        lo, hi = 1, max(piles)
        while lo < hi:
            k = (lo + hi) // 2
            hours = sum((p + k - 1) // k for p in piles)   # ceil(p / k) per pile
            if hours <= h:
                hi = k          # fast enough: try slower
            else:
                lo = k + 1
        return lo`,
 js:`function minEatingSpeed(piles, h) {
  let lo = 1, hi = Math.max(...piles);
  while (lo < hi) {
    const k = Math.floor((lo + hi) / 2);
    let hours = 0;
    for (const p of piles) hours += Math.ceil(p / k);
    if (hours <= h) hi = k; else lo = k + 1;
  }
  return lo;
}`,
 java:`class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        int lo = 1, hi = 0;
        for (int p : piles) hi = Math.max(hi, p);
        while (lo < hi) {
            int k = lo + (hi - lo) / 2;
            long hours = 0;
            for (int p : piles) hours += (p + k - 1) / k;
            if (hours <= h) hi = k; else lo = k + 1;
        }
        return lo;
    }
}`,
 cpp:`class Solution {
public:
    int minEatingSpeed(vector<int>& piles, int h) {
        int lo = 1, hi = *max_element(piles.begin(), piles.end());
        while (lo < hi) {
            int k = lo + (hi - lo) / 2;
            long long hours = 0;
            for (int p : piles) hours += (p + (long long)k - 1) / k;
            if (hours <= h) hi = k; else lo = k + 1;
        }
        return lo;
    }
};`});

P({n:153,s:'find-minimum-in-rotated-sorted-array',t:'Find Minimum in Rotated Sorted Array',c:'bsearch',d:'Medium',rel:['binary'],
 sum:'A sorted array of distinct values was rotated some number of times. Find its minimum in O(log n).',
 ex:'[4, 5, 6, 7, 0, 1, 2] → 0',
 h:['The minimum is where the order “drops”.','Compare the middle with the last element.','If nums[mid] > nums[hi], the drop is to the right of mid; otherwise mid itself could be the minimum.'],
 app:'Keep lo and hi. If nums[mid] > nums[hi], the rotation point is strictly right of mid, so lo = mid + 1. Otherwise the right half is sorted and the minimum is at mid or to its left, so hi = mid. When lo = hi, that index is the minimum.',
 tc:'O(log n)',sc:'O(1)',
 py:`class Solution:
    def findMin(self, nums: list[int]) -> int:
        lo, hi = 0, len(nums) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] > nums[hi]:
                lo = mid + 1        # the drop is right of mid
            else:
                hi = mid            # mid could be the minimum
        return nums[lo]`,
 js:`function findMin(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] > nums[hi]) lo = mid + 1; else hi = mid;
  }
  return nums[lo];
}`,
 java:`class Solution {
    public int findMin(int[] nums) {
        int lo = 0, hi = nums.length - 1;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (nums[mid] > nums[hi]) lo = mid + 1; else hi = mid;
        }
        return nums[lo];
    }
}`,
 cpp:`class Solution {
public:
    int findMin(vector<int>& nums) {
        int lo = 0, hi = nums.size() - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] > nums[hi]) lo = mid + 1; else hi = mid;
        }
        return nums[lo];
    }
};`});

P({n:33,s:'search-in-rotated-sorted-array',t:'Search in Rotated Sorted Array',c:'bsearch',d:'Medium',rel:['binary'],
 sum:'Find the index of the target in a rotated sorted array of distinct values (or −1), in O(log n).',
 ex:'[4, 5, 6, 7, 0, 1, 2], target 0 → 4',
 h:['At any mid, at least one of the two halves is fully sorted.','Check whether nums[lo] ≤ nums[mid] to see if the left half is the sorted one.','If the target falls inside the sorted half’s range, search there; otherwise search the other half.'],
 app:'Standard binary search with one extra decision. Identify the sorted half by comparing nums[lo] with nums[mid]. If the target lies within that half’s min and max, narrow to it; otherwise narrow to the other half, which contains the rotation.',
 tc:'O(log n)',sc:'O(1)',
 py:`class Solution:
    def search(self, nums: list[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid
            if nums[lo] <= nums[mid]:                 # left half is sorted
                if nums[lo] <= target < nums[mid]:
                    hi = mid - 1
                else:
                    lo = mid + 1
            else:                                     # right half is sorted
                if nums[mid] < target <= nums[hi]:
                    lo = mid + 1
                else:
                    hi = mid - 1
        return -1`,
 js:`function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {                     // left half sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1; else lo = mid + 1;
    } else {                                         // right half sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1; else hi = mid - 1;
    }
  }
  return -1;
}`,
 java:`class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = (lo + hi) >>> 1;
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid]) {
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1; else lo = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[hi]) lo = mid + 1; else hi = mid - 1;
            }
        }
        return -1;
    }
}`,
 cpp:`class Solution {
public:
    int search(vector<int>& nums, int target) {
        int lo = 0, hi = nums.size() - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid]) {
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1; else lo = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[hi]) lo = mid + 1; else hi = mid - 1;
            }
        }
        return -1;
    }
};`});

P({n:981,s:'time-based-key-value-store',t:'Time Based Key-Value Store',c:'bsearch',d:'Medium',rel:['lowerbound'],
 sum:'Design a store where set(key, value, timestamp) records a value, and get(key, timestamp) returns the value with the largest timestamp ≤ the given one (or "" if none). Timestamps for set arrive in increasing order.',
 ex:'set("foo", "bar", 1); get("foo", 3) → "bar"; set("foo", "bar2", 4); get("foo", 4) → "bar2"',
 h:['Store a list of (timestamp, value) per key.','Since timestamps arrive increasing, each list is already sorted.','For get, binary search for the last entry with time ≤ timestamp.'],
 app:'Use a hash map from key to a list of (timestamp, value) pairs. set appends in O(1). get binary searches for the first timestamp greater than the query; the entry just before it is the answer, or "" if there is none.',
 tc:'set O(1), get O(log n)',sc:'O(n)',
 py:`from collections import defaultdict

class TimeMap:
    def __init__(self):
        self.store = defaultdict(list)     # key -> [(timestamp, value)], increasing times

    def set(self, key: str, value: str, timestamp: int) -> None:
        self.store[key].append((timestamp, value))

    def get(self, key: str, timestamp: int) -> str:
        items = self.store.get(key, [])
        lo, hi = 0, len(items)
        while lo < hi:                     # first entry with time > timestamp
            mid = (lo + hi) // 2
            if items[mid][0] <= timestamp:
                lo = mid + 1
            else:
                hi = mid
        return items[lo - 1][1] if lo else ""`,
 js:`class TimeMap {
  constructor() { this.store = new Map(); }        // key -> [[timestamp, value]]
  set(key, value, timestamp) {
    if (!this.store.has(key)) this.store.set(key, []);
    this.store.get(key).push([timestamp, value]);
  }
  get(key, timestamp) {
    const items = this.store.get(key) || [];
    let lo = 0, hi = items.length;
    while (lo < hi) {                              // first entry with time > timestamp
      const mid = (lo + hi) >> 1;
      if (items[mid][0] <= timestamp) lo = mid + 1; else hi = mid;
    }
    return lo ? items[lo - 1][1] : "";
  }
}`,
 java:`class TimeMap {
    private final Map<String, TreeMap<Integer, String>> store = new HashMap<>();

    public void set(String key, String value, int timestamp) {
        store.computeIfAbsent(key, k -> new TreeMap<>()).put(timestamp, value);
    }

    public String get(String key, int timestamp) {
        TreeMap<Integer, String> m = store.get(key);
        if (m == null) return "";
        Map.Entry<Integer, String> e = m.floorEntry(timestamp);   // largest time <= timestamp
        return e == null ? "" : e.getValue();
    }
}`,
 cpp:`class TimeMap {
    unordered_map<string, vector<pair<int, string>>> store;
public:
    void set(string key, string value, int timestamp) {
        store[key].push_back({timestamp, value});
    }
    string get(string key, int timestamp) {
        auto it = store.find(key);
        if (it == store.end()) return "";
        auto& items = it->second;
        int lo = 0, hi = items.size();
        while (lo < hi) {                          // first entry with time > timestamp
            int mid = (lo + hi) / 2;
            if (items[mid].first <= timestamp) lo = mid + 1; else hi = mid;
        }
        return lo ? items[lo - 1].second : "";
    }
};`});

P({n:4,s:'median-of-two-sorted-arrays',t:'Median of Two Sorted Arrays',c:'bsearch',d:'Hard',rel:['binary'],
 sum:'Return the median of the combined values of two sorted arrays in O(log(min(m, n))) time.',
 ex:'[1, 3] and [2] → 2.0 · [1, 2] and [3, 4] → 2.5',
 h:['Merging gives O(m + n). The required bound hints at binary search.','Split both arrays so the left parts together hold half of all values.','The split is correct when every left value ≤ every right value: aLeft ≤ bRight and bLeft ≤ aRight.'],
 app:'Binary search how many elements i to take from the shorter array a; then take j = half − i from b. If aLeft > bRight, take fewer from a; if bLeft > aRight, take more. When the partition is valid, the median comes from the max of the left sides and (for even totals) the min of the right sides. Use ±∞ for empty sides.',
 tc:'O(log(min(m, n)))',sc:'O(1)',
 py:`class Solution:
    def findMedianSortedArrays(self, nums1: list[int], nums2: list[int]) -> float:
        a, b = nums1, nums2
        if len(a) > len(b):
            a, b = b, a                         # binary search the shorter array
        total = len(a) + len(b)
        half = (total + 1) // 2
        lo, hi = 0, len(a)
        while True:
            i = (lo + hi) // 2                  # elements taken from a
            j = half - i                        # elements taken from b
            a_left = a[i - 1] if i > 0 else float("-inf")
            a_right = a[i] if i < len(a) else float("inf")
            b_left = b[j - 1] if j > 0 else float("-inf")
            b_right = b[j] if j < len(b) else float("inf")
            if a_left <= b_right and b_left <= a_right:
                if total % 2:
                    return float(max(a_left, b_left))
                return (max(a_left, b_left) + min(a_right, b_right)) / 2
            if a_left > b_right:
                hi = i - 1
            else:
                lo = i + 1`,
 js:`function findMedianSortedArrays(nums1, nums2) {
  let a = nums1, b = nums2;
  if (a.length > b.length) [a, b] = [b, a];
  const total = a.length + b.length, half = (total + 1) >> 1;
  let lo = 0, hi = a.length;
  for (;;) {
    const i = (lo + hi) >> 1, j = half - i;
    const aL = i > 0 ? a[i - 1] : -Infinity, aR = i < a.length ? a[i] : Infinity;
    const bL = j > 0 ? b[j - 1] : -Infinity, bR = j < b.length ? b[j] : Infinity;
    if (aL <= bR && bL <= aR) {
      return total % 2 ? Math.max(aL, bL) : (Math.max(aL, bL) + Math.min(aR, bR)) / 2;
    }
    if (aL > bR) hi = i - 1; else lo = i + 1;
  }
}`,
 java:`class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        int[] a = nums1, b = nums2;
        if (a.length > b.length) { a = nums2; b = nums1; }
        int total = a.length + b.length, half = (total + 1) / 2, lo = 0, hi = a.length;
        while (true) {
            int i = (lo + hi) / 2, j = half - i;
            long aL = i > 0 ? a[i - 1] : Long.MIN_VALUE, aR = i < a.length ? a[i] : Long.MAX_VALUE;
            long bL = j > 0 ? b[j - 1] : Long.MIN_VALUE, bR = j < b.length ? b[j] : Long.MAX_VALUE;
            if (aL <= bR && bL <= aR) {
                if (total % 2 == 1) return Math.max(aL, bL);
                return (Math.max(aL, bL) + Math.min(aR, bR)) / 2.0;
            }
            if (aL > bR) hi = i - 1; else lo = i + 1;
        }
    }
}`,
 cpp:`class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        vector<int>& a = nums1.size() <= nums2.size() ? nums1 : nums2;
        vector<int>& b = nums1.size() <= nums2.size() ? nums2 : nums1;
        int total = a.size() + b.size(), half = (total + 1) / 2, lo = 0, hi = a.size();
        while (true) {
            int i = (lo + hi) / 2, j = half - i;
            long long aL = i > 0 ? a[i - 1] : LLONG_MIN, aR = i < (int)a.size() ? a[i] : LLONG_MAX;
            long long bL = j > 0 ? b[j - 1] : LLONG_MIN, bR = j < (int)b.size() ? b[j] : LLONG_MAX;
            if (aL <= bR && bL <= aR) {
                if (total % 2) return max(aL, bL);
                return (max(aL, bL) + min(aR, bR)) / 2.0;
            }
            if (aL > bR) hi = i - 1; else lo = i + 1;
        }
    }
};`});

/* ---------- Linked List ---------- */
P({n:206,s:'reverse-linked-list',t:'Reverse Linked List',c:'linked',d:'Easy',rel:['recursion',],
 sum:'Reverse a singly linked list and return its new head.',
 ex:'1 → 2 → 3 → 4 → 5 → 5 → 4 → 3 → 2 → 1',
 h:['You need to flip every next pointer.','Before flipping a node’s pointer, save where it pointed so you don’t lose the rest of the list.','Walk with prev and cur; each step points cur.next at prev.'],
 app:'Iterate with prev = null and cur = head. Save cur.next, point cur.next at prev, then advance prev and cur. When cur is null, prev is the new head. A recursive version reverses the tail first, then hooks the current node on the end.',
 tc:'O(n)',sc:'O(1)',
 py:`class Solution:
    def reverseList(self, head):
        prev = None
        while head:
            nxt = head.next
            head.next = prev        # flip the pointer
            prev, head = head, nxt
        return prev`,
 js:`function reverseList(head) {
  let prev = null;
  while (head) {
    const nxt = head.next;
    head.next = prev;          // flip the pointer
    prev = head;
    head = nxt;
  }
  return prev;
}`,
 java:`class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        while (head != null) {
            ListNode nxt = head.next;
            head.next = prev;      // flip the pointer
            prev = head;
            head = nxt;
        }
        return prev;
    }
}`,
 cpp:`class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        while (head) {
            ListNode* nxt = head->next;
            head->next = prev;     // flip the pointer
            prev = head;
            head = nxt;
        }
        return prev;
    }
};`});

P({n:21,s:'merge-two-sorted-lists',t:'Merge Two Sorted Lists',c:'linked',d:'Easy',rel:['merge'],
 sum:'Splice two sorted linked lists into one sorted list and return its head.',
 ex:'1 → 2 → 4 and 1 → 3 → 4 → 1 → 1 → 2 → 3 → 4 → 4',
 h:['This is the merge step of merge sort.','A dummy head node avoids special-casing the first node.','Repeatedly attach the smaller front node, then attach whatever list remains.'],
 app:'Create a dummy node and a tail pointer. While both lists have nodes, link the smaller front node after tail and advance that list. Then link the non-empty remainder. Return dummy.next. No new nodes are created.',
 tc:'O(m + n)',sc:'O(1)',
 py:`class Solution:
    def mergeTwoLists(self, list1, list2):
        dummy = tail = ListNode()
        while list1 and list2:
            if list1.val <= list2.val:
                tail.next, list1 = list1, list1.next
            else:
                tail.next, list2 = list2, list2.next
            tail = tail.next
        tail.next = list1 or list2          # attach the leftover
        return dummy.next`,
 js:`function mergeTwoLists(list1, list2) {
  const dummy = new ListNode();
  let tail = dummy;
  while (list1 && list2) {
    if (list1.val <= list2.val) { tail.next = list1; list1 = list1.next; }
    else { tail.next = list2; list2 = list2.next; }
    tail = tail.next;
  }
  tail.next = list1 || list2;
  return dummy.next;
}`,
 java:`class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummy = new ListNode(), tail = dummy;
        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) { tail.next = list1; list1 = list1.next; }
            else { tail.next = list2; list2 = list2.next; }
            tail = tail.next;
        }
        tail.next = list1 != null ? list1 : list2;
        return dummy.next;
    }
}`,
 cpp:`class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        ListNode dummy, *tail = &dummy;
        while (list1 && list2) {
            if (list1->val <= list2->val) { tail->next = list1; list1 = list1->next; }
            else { tail->next = list2; list2 = list2->next; }
            tail = tail->next;
        }
        tail->next = list1 ? list1 : list2;
        return dummy.next;
    }
};`});

P({n:141,s:'linked-list-cycle',t:'Linked List Cycle',c:'linked',d:'Easy',rel:['floyd'],
 sum:'Decide whether following next pointers from the head ever loops back to a node already visited.',
 ex:'3 → 2 → 0 → −4 → (back to 2) → true',
 h:['A hash set of visited nodes works with O(n) memory.','Can you do it with O(1) memory?','Move one pointer one step and another two steps. If there is a loop, the fast one laps the slow one.'],
 app:'Floyd’s tortoise and hare: advance slow by one and fast by two. If fast reaches the end, there is no cycle. If they ever point to the same node, there is a cycle, because inside a loop the gap shrinks by one each step.',
 tc:'O(n)',sc:'O(1)',
 py:`class Solution:
    def hasCycle(self, head) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow, fast = slow.next, fast.next.next
            if slow is fast:
                return True
        return False`,
 js:`function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
 java:`public class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }
}`,
 cpp:`class Solution {
public:
    bool hasCycle(ListNode* head) {
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) return true;
        }
        return false;
    }
};`});

P({n:143,s:'reorder-list',t:'Reorder List',c:'linked',d:'Medium',rel:['floyd'],
 sum:'Rearrange a list L0 → L1 → … → Ln into L0 → Ln → L1 → Ln−1 → L2 → …, in place.',
 ex:'1 → 2 → 3 → 4 → 5 → 1 → 5 → 2 → 4 → 3',
 h:['Copying into an array works but uses O(n) space.','The second half needs to be visited backwards.','Find the middle (slow/fast pointers), reverse the second half, then weave the two halves together.'],
 app:'Three steps, all in place: (1) slow/fast pointers find the middle; cut the list there. (2) Reverse the second half. (3) Alternate nodes from the first half and the reversed second half. Each step is linear and uses constant space.',
 tc:'O(n)',sc:'O(1)',
 py:`class Solution:
    def reorderList(self, head) -> None:
        slow, fast = head, head.next          # 1. find the middle
        while fast and fast.next:
            slow, fast = slow.next, fast.next.next
        second = slow.next
        slow.next = None                      # cut into two halves
        prev = None                           # 2. reverse the second half
        while second:
            nxt = second.next
            second.next = prev
            prev, second = second, nxt
        first, second = head, prev            # 3. weave them together
        while second:
            n1, n2 = first.next, second.next
            first.next = second
            second.next = n1
            first, second = n1, n2`,
 js:`function reorderList(head) {
  let slow = head, fast = head.next;          // 1. find the middle
  while (fast && fast.next) { slow = slow.next; fast = fast.next.next; }
  let second = slow.next, prev = null;
  slow.next = null;
  while (second) {                            // 2. reverse the second half
    const nxt = second.next;
    second.next = prev;
    prev = second;
    second = nxt;
  }
  let first = head;
  second = prev;
  while (second) {                            // 3. weave
    const n1 = first.next, n2 = second.next;
    first.next = second;
    second.next = n1;
    first = n1;
    second = n2;
  }
}`,
 java:`class Solution {
    public void reorderList(ListNode head) {
        ListNode slow = head, fast = head.next;
        while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }
        ListNode second = slow.next, prev = null;
        slow.next = null;
        while (second != null) {
            ListNode nxt = second.next;
            second.next = prev;
            prev = second;
            second = nxt;
        }
        ListNode first = head;
        second = prev;
        while (second != null) {
            ListNode n1 = first.next, n2 = second.next;
            first.next = second;
            second.next = n1;
            first = n1;
            second = n2;
        }
    }
}`,
 cpp:`class Solution {
public:
    void reorderList(ListNode* head) {
        ListNode *slow = head, *fast = head->next;
        while (fast && fast->next) { slow = slow->next; fast = fast->next->next; }
        ListNode *second = slow->next, *prev = nullptr;
        slow->next = nullptr;
        while (second) {
            ListNode* nxt = second->next;
            second->next = prev;
            prev = second;
            second = nxt;
        }
        ListNode* first = head;
        second = prev;
        while (second) {
            ListNode *n1 = first->next, *n2 = second->next;
            first->next = second;
            second->next = n1;
            first = n1;
            second = n2;
        }
    }
};`});

P({n:19,s:'remove-nth-node-from-end-of-list',t:'Remove Nth Node From End of List',c:'linked',d:'Medium',rel:['twopointers'],
 sum:'Delete the n-th node counting from the end of the list, in a single pass, and return the head.',
 ex:'1 → 2 → 3 → 4 → 5, n = 2 → 1 → 2 → 3 → 5',
 h:['Two passes (count the length, then walk) is easy. Can you do one?','If one pointer runs n steps ahead, it reaches the end exactly when the other is n from the end.','Start both at a dummy node so removing the head is not a special case.'],
 app:'Create a dummy node before head. Move fast n + 1 steps ahead, then move fast and slow together until fast is null. Now slow is right before the node to delete, so set slow.next = slow.next.next.',
 tc:'O(n)',sc:'O(1)',
 py:`class Solution:
    def removeNthFromEnd(self, head, n: int):
        dummy = ListNode(0, head)
        fast = slow = dummy
        for _ in range(n + 1):          # open a gap of n nodes
            fast = fast.next
        while fast:
            fast, slow = fast.next, slow.next
        slow.next = slow.next.next      # slow sits just before the target
        return dummy.next`,
 js:`function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let fast = dummy, slow = dummy;
  for (let i = 0; i <= n; i++) fast = fast.next;
  while (fast) { fast = fast.next; slow = slow.next; }
  slow.next = slow.next.next;
  return dummy.next;
}`,
 java:`class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(0, head), fast = dummy, slow = dummy;
        for (int i = 0; i <= n; i++) fast = fast.next;
        while (fast != null) { fast = fast.next; slow = slow.next; }
        slow.next = slow.next.next;
        return dummy.next;
    }
}`,
 cpp:`class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        ListNode dummy(0, head), *fast = &dummy, *slow = &dummy;
        for (int i = 0; i <= n; i++) fast = fast->next;
        while (fast) { fast = fast->next; slow = slow->next; }
        ListNode* gone = slow->next;
        slow->next = gone->next;
        delete gone;
        return dummy.next;
    }
};`});

P({n:138,s:'copy-list-with-random-pointer',t:'Copy List with Random Pointer',c:'linked',d:'Medium',rel:[],
 sum:'Each node has a next pointer and a random pointer (to any node or null). Build a deep copy where no pointer refers back into the original list.',
 ex:'[[7, null], [13, 0], [11, 4], [10, 2], [1, 0]] → an identical but separate list',
 h:['The hard part is that random may point to a node you haven’t copied yet.','Map each original node to its copy.','Pass 1 creates all copies; pass 2 wires next and random through the map.'],
 app:'First pass: create a copy of every node and store original → copy in a hash map. Second pass: for each original node, set copy.next = map[node.next] and copy.random = map[node.random]. An O(1)-space variant interleaves copies into the original list and then splits them apart.',
 tc:'O(n)',sc:'O(n)',
 py:`class Solution:
    def copyRandomList(self, head):
        clone = {None: None}
        node = head
        while node:                         # pass 1: create every copy
            clone[node] = Node(node.val)
            node = node.next
        node = head
        while node:                         # pass 2: wire the pointers
            clone[node].next = clone[node.next]
            clone[node].random = clone[node.random]
            node = node.next
        return clone[head]`,
 js:`function copyRandomList(head) {
  const clone = new Map([[null, null]]);
  for (let n = head; n; n = n.next) clone.set(n, new Node(n.val));   // pass 1
  for (let n = head; n; n = n.next) {                                 // pass 2
    clone.get(n).next = clone.get(n.next);
    clone.get(n).random = clone.get(n.random);
  }
  return clone.get(head);
}`,
 java:`class Solution {
    public Node copyRandomList(Node head) {
        Map<Node, Node> clone = new HashMap<>();
        for (Node n = head; n != null; n = n.next) clone.put(n, new Node(n.val));
        for (Node n = head; n != null; n = n.next) {
            clone.get(n).next = clone.get(n.next);       // get(null) returns null
            clone.get(n).random = clone.get(n.random);
        }
        return clone.get(head);
    }
}`,
 cpp:`class Solution {
public:
    Node* copyRandomList(Node* head) {
        unordered_map<Node*, Node*> clone{{nullptr, nullptr}};
        for (Node* n = head; n; n = n->next) clone[n] = new Node(n->val);
        for (Node* n = head; n; n = n->next) {
            clone[n]->next = clone[n->next];
            clone[n]->random = clone[n->random];
        }
        return clone[head];
    }
};`});

P({n:2,s:'add-two-numbers',t:'Add Two Numbers',c:'linked',d:'Medium',rel:[],
 sum:'Two non-negative numbers are stored as linked lists of digits in reverse order (ones digit first). Return their sum in the same format.',
 ex:'2 → 4 → 3 (342) + 5 → 6 → 4 (465) → 7 → 0 → 8 (807)',
 h:['Reverse order is convenient: it is the order you add digits by hand.','Carry 1 into the next position when a column sum is ≥ 10.','Keep going while either list has digits or a carry remains.'],
 app:'Walk both lists together, adding the two digits (0 for a missing node) plus the carry. Append sum % 10 as a new node and carry sum / 10. Continue until both lists end and the carry is zero.',
 tc:'O(max(m, n))',sc:'O(max(m, n)) for the output',
 py:`class Solution:
    def addTwoNumbers(self, l1, l2):
        dummy = tail = ListNode()
        carry = 0
        while l1 or l2 or carry:
            total = carry + (l1.val if l1 else 0) + (l2.val if l2 else 0)
            carry, digit = divmod(total, 10)
            tail.next = ListNode(digit)
            tail = tail.next
            l1 = l1.next if l1 else None
            l2 = l2.next if l2 else None
        return dummy.next`,
 js:`function addTwoNumbers(l1, l2) {
  const dummy = new ListNode();
  let tail = dummy, carry = 0;
  while (l1 || l2 || carry) {
    const total = carry + (l1 ? l1.val : 0) + (l2 ? l2.val : 0);
    carry = Math.floor(total / 10);
    tail.next = new ListNode(total % 10);
    tail = tail.next;
    l1 = l1 && l1.next;
    l2 = l2 && l2.next;
  }
  return dummy.next;
}`,
 java:`class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(), tail = dummy;
        int carry = 0;
        while (l1 != null || l2 != null || carry != 0) {
            int total = carry + (l1 != null ? l1.val : 0) + (l2 != null ? l2.val : 0);
            carry = total / 10;
            tail.next = new ListNode(total % 10);
            tail = tail.next;
            if (l1 != null) l1 = l1.next;
            if (l2 != null) l2 = l2.next;
        }
        return dummy.next;
    }
}`,
 cpp:`class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        ListNode dummy, *tail = &dummy;
        int carry = 0;
        while (l1 || l2 || carry) {
            int total = carry + (l1 ? l1->val : 0) + (l2 ? l2->val : 0);
            carry = total / 10;
            tail->next = new ListNode(total % 10);
            tail = tail->next;
            if (l1) l1 = l1->next;
            if (l2) l2 = l2->next;
        }
        return dummy.next;
    }
};`});

P({n:287,s:'find-the-duplicate-number',t:'Find the Duplicate Number',c:'linked',d:'Medium',rel:['floyd'],
 sum:'An array of n + 1 integers holds values in 1..n, so at least one value repeats. Find the repeated value without modifying the array and using O(1) extra space.',
 ex:'[1, 3, 4, 2, 2] → 2',
 h:['Sorting or a set would break the constraints.','Treat each index i as a node pointing to nums[i]. Values are in 1..n, so you never fall off the array.','A duplicate value means two nodes point to the same place: a cycle. Its entrance is the duplicate.'],
 app:'Apply Floyd’s cycle detection to the sequence 0 → nums[0] → nums[nums[0]] → …. Phase 1 moves slow by one and fast by two until they meet. Phase 2 resets one pointer to the start and moves both by one; where they meet is the cycle entrance, which is the duplicate value.',
 tc:'O(n)',sc:'O(1)',
 py:`class Solution:
    def findDuplicate(self, nums: list[int]) -> int:
        slow = fast = nums[0]
        while True:                     # phase 1: meet inside the cycle
            slow = nums[slow]
            fast = nums[nums[fast]]
            if slow == fast:
                break
        slow = nums[0]
        while slow != fast:             # phase 2: meet at the entrance
            slow = nums[slow]
            fast = nums[fast]
        return slow`,
 js:`function findDuplicate(nums) {
  let slow = nums[0], fast = nums[0];
  do { slow = nums[slow]; fast = nums[nums[fast]]; } while (slow !== fast);
  slow = nums[0];
  while (slow !== fast) { slow = nums[slow]; fast = nums[fast]; }
  return slow;
}`,
 java:`class Solution {
    public int findDuplicate(int[] nums) {
        int slow = nums[0], fast = nums[0];
        do { slow = nums[slow]; fast = nums[nums[fast]]; } while (slow != fast);
        slow = nums[0];
        while (slow != fast) { slow = nums[slow]; fast = nums[fast]; }
        return slow;
    }
}`,
 cpp:`class Solution {
public:
    int findDuplicate(vector<int>& nums) {
        int slow = nums[0], fast = nums[0];
        do { slow = nums[slow]; fast = nums[nums[fast]]; } while (slow != fast);
        slow = nums[0];
        while (slow != fast) { slow = nums[slow]; fast = nums[fast]; }
        return slow;
    }
};`});

P({n:146,s:'lru-cache',t:'LRU Cache',c:'linked',d:'Medium',rel:[],
 sum:'Design a fixed-capacity cache with O(1) get and put. When full, putting a new key evicts the least recently used one.',
 ex:'capacity 2: put(1,1), put(2,2), get(1) → 1, put(3,3) evicts 2, get(2) → −1',
 h:['A hash map gives O(1) lookup but no notion of “least recent”.','A doubly linked list can move any node to the front and drop the back in O(1).','Combine them: the map stores key → list node; the list stores recency order.'],
 app:'Keep a hash map from key to node in a doubly linked list ordered from most to least recently used, with sentinel head and tail nodes. get moves the node to the front. put updates or inserts at the front, and if over capacity removes the node before the tail and deletes its key from the map. Interviewers usually want this explicit version; Python’s OrderedDict and JavaScript’s Map (which keeps insertion order) are acceptable shortcuts to mention afterwards.',
 tc:'O(1) per operation',sc:'O(capacity)',
 py:`class Node:
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None


class LRUCache:
    """Hash map (key -> node) + doubly linked list (most recent next to head)."""

    def __init__(self, capacity: int):
        self.cap = capacity
        self.map = {}
        self.head, self.tail = Node(), Node()       # sentinels: no edge cases at the ends
        self.head.next, self.tail.prev = self.tail, self.head

    def _unlink(self, n):
        n.prev.next, n.next.prev = n.next, n.prev

    def _add_front(self, n):
        n.prev, n.next = self.head, self.head.next
        self.head.next.prev = n
        self.head.next = n

    def get(self, key: int) -> int:
        n = self.map.get(key)
        if n is None:
            return -1
        self._unlink(n)
        self._add_front(n)                          # mark as most recently used
        return n.val

    def put(self, key: int, value: int) -> None:
        if key in self.map:
            n = self.map[key]
            n.val = value
            self._unlink(n)
            self._add_front(n)
            return
        if len(self.map) == self.cap:
            lru = self.tail.prev                    # least recently used
            self._unlink(lru)
            del self.map[lru.key]
        n = Node(key, value)
        self.map[key] = n
        self._add_front(n)


# Shortcut (fine to mention, but interviewers usually want the version above):
# from collections import OrderedDict
# get: move_to_end(key); put: self.cache[key] = value; move_to_end(key);
#      if len(self.cache) > cap: self.cache.popitem(last=False)`,
 js:`class LRUNode {
  constructor(key = 0, val = 0) { this.key = key; this.val = val; this.prev = this.next = null; }
}

// Hash map (key -> node) + doubly linked list (most recent next to head).
class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map();
    this.head = new LRUNode(); this.tail = new LRUNode();   // sentinels
    this.head.next = this.tail; this.tail.prev = this.head;
  }
  unlink(n) { n.prev.next = n.next; n.next.prev = n.prev; }
  addFront(n) {
    n.prev = this.head; n.next = this.head.next;
    this.head.next.prev = n; this.head.next = n;
  }
  get(key) {
    const n = this.map.get(key);
    if (!n) return -1;
    this.unlink(n); this.addFront(n);              // mark as most recently used
    return n.val;
  }
  put(key, value) {
    let n = this.map.get(key);
    if (n) { n.val = value; this.unlink(n); this.addFront(n); return; }
    if (this.map.size === this.cap) {
      const lru = this.tail.prev;                  // least recently used
      this.unlink(lru); this.map.delete(lru.key);
    }
    n = new LRUNode(key, value);
    this.map.set(key, n); this.addFront(n);
  }
}

// Shortcut: a Map keeps insertion order, so delete + set moves a key to the end
// and map.keys().next().value is the least recent. Mention it as an alternative.`,
 java:`class LRUCache {
    private static class Node {
        int key, val; Node prev, next;
        Node(int k, int v) { key = k; val = v; }
    }

    private final int cap;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0), tail = new Node(0, 0);   // head.next = most recent

    public LRUCache(int capacity) {
        cap = capacity;
        head.next = tail;
        tail.prev = head;
    }

    private void unlink(Node n) { n.prev.next = n.next; n.next.prev = n.prev; }

    private void addFront(Node n) {
        n.next = head.next; n.prev = head;
        head.next.prev = n; head.next = n;
    }

    public int get(int key) {
        Node n = map.get(key);
        if (n == null) return -1;
        unlink(n); addFront(n);
        return n.val;
    }

    public void put(int key, int value) {
        Node n = map.get(key);
        if (n != null) { n.val = value; unlink(n); addFront(n); return; }
        if (map.size() == cap) {
            Node lru = tail.prev;
            unlink(lru);
            map.remove(lru.key);
        }
        n = new Node(key, value);
        map.put(key, n);
        addFront(n);
    }
}`,
 cpp:`class LRUCache {
    int cap;
    list<pair<int, int>> order;                                   // front = most recent
    unordered_map<int, list<pair<int, int>>::iterator> pos;
public:
    LRUCache(int capacity) : cap(capacity) {}

    int get(int key) {
        auto it = pos.find(key);
        if (it == pos.end()) return -1;
        order.splice(order.begin(), order, it->second);            // move to front
        return it->second->second;
    }

    void put(int key, int value) {
        auto it = pos.find(key);
        if (it != pos.end()) {
            it->second->second = value;
            order.splice(order.begin(), order, it->second);
            return;
        }
        if ((int)order.size() == cap) {
            pos.erase(order.back().first);                        // evict least recent
            order.pop_back();
        }
        order.push_front({key, value});
        pos[key] = order.begin();
    }
};`});

P({n:23,s:'merge-k-sorted-lists',t:'Merge k Sorted Lists',c:'linked',d:'Hard',rel:['binheap','merge'],
 sum:'Merge k sorted linked lists into one sorted list.',
 ex:'[1 → 4 → 5, 1 → 3 → 4, 2 → 6] → 1 → 1 → 2 → 3 → 4 → 4 → 5 → 6',
 h:['Merging the lists one by one costs O(N · k).','At each step you only need the smallest of the k current heads.','A min-heap of the k heads gives that in O(log k). Alternatively, merge lists in pairs like merge sort.'],
 app:'Push the head of every non-empty list into a min-heap keyed by value. Repeatedly pop the smallest node, append it to the result, and push its successor. Each of the N nodes passes through a heap of size ≤ k. The JavaScript version merges pairs of lists in rounds instead, which has the same O(N log k) cost without a heap.',
 tc:'O(N log k)',sc:'O(k)',
 py:`import heapq

class Solution:
    def mergeKLists(self, lists):
        heap = [(node.val, i, node) for i, node in enumerate(lists) if node]
        heapq.heapify(heap)                 # i breaks ties so nodes are never compared
        dummy = tail = ListNode()
        while heap:
            _, i, node = heapq.heappop(heap)
            tail.next = node
            tail = node
            if node.next:
                heapq.heappush(heap, (node.next.val, i, node.next))
        return dummy.next`,
 js:`function mergeKLists(lists) {
  const merge2 = (a, b) => {
    const dummy = new ListNode();
    let t = dummy;
    while (a && b) {
      if (a.val <= b.val) { t.next = a; a = a.next; } else { t.next = b; b = b.next; }
      t = t.next;
    }
    t.next = a || b;
    return dummy.next;
  };
  if (!lists.length) return null;
  while (lists.length > 1) {                 // merge in pairs: log k rounds
    const next = [];
    for (let i = 0; i < lists.length; i += 2) next.push(merge2(lists[i], lists[i + 1] || null));
    lists = next;
  }
  return lists[0];
}`,
 java:`class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> Integer.compare(a.val, b.val));
        for (ListNode n : lists) if (n != null) pq.add(n);
        ListNode dummy = new ListNode(), tail = dummy;
        while (!pq.isEmpty()) {
            ListNode n = pq.poll();
            tail.next = n;
            tail = n;
            if (n.next != null) pq.add(n.next);
        }
        return dummy.next;
    }
}`,
 cpp:`class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        auto cmp = [](ListNode* a, ListNode* b) { return a->val > b->val; };
        priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp);
        for (auto n : lists) if (n) pq.push(n);
        ListNode dummy, *tail = &dummy;
        while (!pq.empty()) {
            ListNode* n = pq.top(); pq.pop();
            tail->next = n;
            tail = n;
            if (n->next) pq.push(n->next);
        }
        return dummy.next;
    }
};`});

P({n:25,s:'reverse-nodes-in-k-group',t:'Reverse Nodes in k-Group',c:'linked',d:'Hard',rel:[],
 sum:'Reverse the list’s nodes k at a time. A final group with fewer than k nodes stays as it is.',
 ex:'1 → 2 → 3 → 4 → 5, k = 2 → 2 → 1 → 4 → 3 → 5',
 h:['Handle one group at a time: check there are k nodes ahead, then reverse them.','Track the node just before the group and the node just after it.','After reversing, the group’s old first node becomes its last; it is the “before” node for the next group.'],
 app:'Use a dummy node as groupPrev. Find the k-th node after groupPrev; if it doesn’t exist, stop. Reverse the k nodes in place, starting the reversal with prev = the node after the group so the tail reconnects automatically. Point groupPrev.next at the old k-th node and advance groupPrev to the group’s new tail.',
 tc:'O(n)',sc:'O(1)',
 py:`class Solution:
    def reverseKGroup(self, head, k: int):
        dummy = ListNode(0, head)
        group_prev = dummy
        while True:
            kth = group_prev                    # find the k-th node of this group
            for _ in range(k):
                kth = kth.next
                if not kth:
                    return dummy.next           # fewer than k left
            group_next = kth.next
            prev, cur = group_next, group_prev.next
            while cur is not group_next:        # reverse the group
                nxt = cur.next
                cur.next = prev
                prev, cur = cur, nxt
            first = group_prev.next             # now the group's last node
            group_prev.next = kth
            group_prev = first`,
 js:`function reverseKGroup(head, k) {
  const dummy = new ListNode(0, head);
  let groupPrev = dummy;
  for (;;) {
    let kth = groupPrev;
    for (let i = 0; i < k; i++) {
      kth = kth.next;
      if (!kth) return dummy.next;
    }
    const groupNext = kth.next;
    let prev = groupNext, cur = groupPrev.next;
    while (cur !== groupNext) {
      const nxt = cur.next;
      cur.next = prev;
      prev = cur;
      cur = nxt;
    }
    const first = groupPrev.next;
    groupPrev.next = kth;
    groupPrev = first;
  }
}`,
 java:`class Solution {
    public ListNode reverseKGroup(ListNode head, int k) {
        ListNode dummy = new ListNode(0, head), groupPrev = dummy;
        while (true) {
            ListNode kth = groupPrev;
            for (int i = 0; i < k; i++) {
                kth = kth.next;
                if (kth == null) return dummy.next;
            }
            ListNode groupNext = kth.next, prev = groupNext, cur = groupPrev.next;
            while (cur != groupNext) {
                ListNode nxt = cur.next;
                cur.next = prev;
                prev = cur;
                cur = nxt;
            }
            ListNode first = groupPrev.next;
            groupPrev.next = kth;
            groupPrev = first;
        }
    }
}`,
 cpp:`class Solution {
public:
    ListNode* reverseKGroup(ListNode* head, int k) {
        ListNode dummy(0, head), *groupPrev = &dummy;
        while (true) {
            ListNode* kth = groupPrev;
            for (int i = 0; i < k; i++) {
                kth = kth->next;
                if (!kth) return dummy.next;
            }
            ListNode *groupNext = kth->next, *prev = groupNext, *cur = groupPrev->next;
            while (cur != groupNext) {
                ListNode* nxt = cur->next;
                cur->next = prev;
                prev = cur;
                cur = nxt;
            }
            ListNode* first = groupPrev->next;
            groupPrev->next = kth;
            groupPrev = first;
        }
    }
};`});
