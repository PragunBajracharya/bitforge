/* ===== Problems batch 6: Greedy, Intervals, Math & Geometry, Bit Manipulation ===== */

P({n:53,s:'maximum-subarray',t:'Maximum Subarray',c:'greedy',d:'Medium',rel:['kadane'],
 sum:'Find the contiguous subarray with the largest sum and return that sum.',
 ex:'[−2, 1, −3, 4, −1, 2, 1, −5, 4] → 6 ([4, −1, 2, 1])',
 h:['Checking every subarray is O(n²).','A running sum that has gone negative can only drag down whatever follows.','Kadane’s algorithm: extend the current run, or restart at the current element if that is larger.'],
 app:'Track cur, the best sum of a subarray ending at the current index: cur = max(x, cur + x). Track best, the maximum cur seen. Starting both at nums[0] handles all-negative arrays. Divide and conquer gives an O(n log n) alternative.',
 tc:'O(n)',sc:'O(1)',
 py:`class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        best = cur = nums[0]
        for x in nums[1:]:
            cur = max(x, cur + x)       # extend the run or restart at x
            best = max(best, cur)
        return best`,
 js:`function maxSubArray(nums) {
  let best = nums[0], cur = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}`,
 java:`class Solution {
    public int maxSubArray(int[] nums) {
        int best = nums[0], cur = nums[0];
        for (int i = 1; i < nums.length; i++) {
            cur = Math.max(nums[i], cur + nums[i]);
            best = Math.max(best, cur);
        }
        return best;
    }
}`,
 cpp:`class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int best = nums[0], cur = nums[0];
        for (size_t i = 1; i < nums.size(); i++) {
            cur = max(nums[i], cur + nums[i]);
            best = max(best, cur);
        }
        return best;
    }
};`});

P({n:55,s:'jump-game',t:'Jump Game',c:'greedy',d:'Medium',rel:[],
 sum:'From index i you may jump up to nums[i] positions forward. Starting at index 0, decide whether you can reach the last index.',
 ex:'[2, 3, 1, 1, 4] → true · [3, 2, 1, 0, 4] → false',
 h:['Track the farthest index reachable so far.','If the current index is beyond that farthest point, you are stuck.','Otherwise extend the farthest point with i + nums[i].'],
 app:'Scan left to right maintaining reach = the farthest index reachable. If i > reach, return false. Update reach = max(reach, i + nums[i]). If the loop finishes (or reach covers the last index), return true. Scanning backward with a moving “goal” works too.',
 tc:'O(n)',sc:'O(1)',
 py:`class Solution:
    def canJump(self, nums: list[int]) -> bool:
        reach = 0
        for i, x in enumerate(nums):
            if i > reach:
                return False            # can't even get here
            reach = max(reach, i + x)
        return True`,
 js:`function canJump(nums) {
  let reach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) return false;
    reach = Math.max(reach, i + nums[i]);
  }
  return true;
}`,
 java:`class Solution {
    public boolean canJump(int[] nums) {
        int reach = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > reach) return false;
            reach = Math.max(reach, i + nums[i]);
        }
        return true;
    }
}`,
 cpp:`class Solution {
public:
    bool canJump(vector<int>& nums) {
        int reach = 0;
        for (int i = 0; i < (int)nums.size(); i++) {
            if (i > reach) return false;
            reach = max(reach, i + nums[i]);
        }
        return true;
    }
};`});

P({n:45,s:'jump-game-ii',t:'Jump Game II',c:'greedy',d:'Medium',rel:['bfs'],
 sum:'Same jumping rules as Jump Game, and the end is always reachable. Return the minimum number of jumps to reach the last index.',
 ex:'[2, 3, 1, 1, 4] → 2 (0 → 1 → 4)',
 h:['Think of it as BFS on indices: each jump count defines a range of reachable indices.','While scanning the current range, track the farthest index the next jump could reach.','When you pass the end of the current range, you must jump: the next range ends at that farthest point.'],
 app:'Keep curEnd (the end of the range reachable with the current number of jumps) and farthest. For i from 0 to n − 2, update farthest = max(farthest, i + nums[i]); when i reaches curEnd, count a jump and set curEnd = farthest. Stopping at n − 2 avoids an extra jump from the last index.',
 tc:'O(n)',sc:'O(1)',
 py:`class Solution:
    def jump(self, nums: list[int]) -> int:
        jumps = cur_end = farthest = 0
        for i in range(len(nums) - 1):
            farthest = max(farthest, i + nums[i])
            if i == cur_end:            # range for this jump count is used up
                jumps += 1
                cur_end = farthest
        return jumps`,
 js:`function jump(nums) {
  let jumps = 0, curEnd = 0, farthest = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === curEnd) { jumps++; curEnd = farthest; }
  }
  return jumps;
}`,
 java:`class Solution {
    public int jump(int[] nums) {
        int jumps = 0, curEnd = 0, farthest = 0;
        for (int i = 0; i < nums.length - 1; i++) {
            farthest = Math.max(farthest, i + nums[i]);
            if (i == curEnd) { jumps++; curEnd = farthest; }
        }
        return jumps;
    }
}`,
 cpp:`class Solution {
public:
    int jump(vector<int>& nums) {
        int jumps = 0, curEnd = 0, farthest = 0;
        for (int i = 0; i + 1 < (int)nums.size(); i++) {
            farthest = max(farthest, i + nums[i]);
            if (i == curEnd) { jumps++; curEnd = farthest; }
        }
        return jumps;
    }
};`});

P({n:134,s:'gas-station',t:'Gas Station',c:'greedy',d:'Medium',rel:[],
 sum:'Stations on a circular route have gas[i] fuel available, and driving to the next costs cost[i]. Starting with an empty tank, return the unique station from which you can complete the loop, or −1.',
 ex:'gas [1, 2, 3, 4, 5], cost [3, 4, 5, 1, 2] → 3',
 h:['If total gas < total cost, no start works.','If you start at s and run dry before reaching station j, then no station between s and j can work either.','So when the tank goes negative, restart from the next station.'],
 app:'One pass: accumulate total = Σ(gas − cost) and tank for the current candidate start. When tank drops below 0, set start = i + 1 and tank = 0. At the end, return start if total ≥ 0, else −1.',
 tc:'O(n)',sc:'O(1)',
 py:`class Solution:
    def canCompleteCircuit(self, gas: list[int], cost: list[int]) -> int:
        total = tank = start = 0
        for i in range(len(gas)):
            diff = gas[i] - cost[i]
            total += diff
            tank += diff
            if tank < 0:                # can't reach i + 1 from start: try starting there
                start, tank = i + 1, 0
        return start if total >= 0 else -1`,
 js:`function canCompleteCircuit(gas, cost) {
  let total = 0, tank = 0, start = 0;
  for (let i = 0; i < gas.length; i++) {
    const diff = gas[i] - cost[i];
    total += diff;
    tank += diff;
    if (tank < 0) { start = i + 1; tank = 0; }
  }
  return total >= 0 ? start : -1;
}`,
 java:`class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        int total = 0, tank = 0, start = 0;
        for (int i = 0; i < gas.length; i++) {
            int diff = gas[i] - cost[i];
            total += diff;
            tank += diff;
            if (tank < 0) { start = i + 1; tank = 0; }
        }
        return total >= 0 ? start : -1;
    }
}`,
 cpp:`class Solution {
public:
    int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {
        int total = 0, tank = 0, start = 0;
        for (int i = 0; i < (int)gas.size(); i++) {
            int diff = gas[i] - cost[i];
            total += diff;
            tank += diff;
            if (tank < 0) { start = i + 1; tank = 0; }
        }
        return total >= 0 ? start : -1;
    }
};`});

P({n:846,s:'hand-of-straights',t:'Hand of Straights',c:'greedy',d:'Medium',rel:[],
 sum:'Decide whether a hand of cards can be rearranged into groups of exactly groupSize consecutive values.',
 ex:'[1, 2, 3, 6, 2, 3, 4, 7, 8], groupSize 3 → true ([1,2,3], [2,3,4], [6,7,8])',
 h:['The total number of cards must be divisible by groupSize.','The smallest remaining card must start a group, since nothing smaller can precede it.','Count cards, then repeatedly start a group at the smallest card and consume the next groupSize − 1 values.'],
 app:'Count each value. Visit distinct values in increasing order. When a value v still has count c > 0, it must start c groups, so each of v + 1, …, v + groupSize − 1 needs at least c copies; subtract c from each, failing if any falls short.',
 tc:'O(n log n)',sc:'O(n)',
 py:`from collections import Counter

class Solution:
    def isNStraightHand(self, hand: list[int], groupSize: int) -> bool:
        if len(hand) % groupSize:
            return False
        count = Counter(hand)
        for v in sorted(count):
            c = count[v]
            if c == 0:
                continue
            for w in range(v, v + groupSize):   # v must start c groups
                if count[w] < c:
                    return False
                count[w] -= c
        return True`,
 js:`function isNStraightHand(hand, groupSize) {
  if (hand.length % groupSize) return false;
  const count = new Map();
  for (const x of hand) count.set(x, (count.get(x) || 0) + 1);
  for (const v of [...count.keys()].sort((a, b) => a - b)) {
    const c = count.get(v);
    if (!c) continue;
    for (let w = v; w < v + groupSize; w++) {
      if ((count.get(w) || 0) < c) return false;
      count.set(w, count.get(w) - c);
    }
  }
  return true;
}`,
 java:`class Solution {
    public boolean isNStraightHand(int[] hand, int groupSize) {
        if (hand.length % groupSize != 0) return false;
        TreeMap<Integer, Integer> count = new TreeMap<>();
        for (int x : hand) count.merge(x, 1, Integer::sum);
        for (int v : count.keySet()) {
            int c = count.get(v);
            if (c == 0) continue;
            for (int w = v; w < v + groupSize; w++) {
                int have = count.getOrDefault(w, 0);
                if (have < c) return false;
                count.put(w, have - c);
            }
        }
        return true;
    }
}`,
 cpp:`class Solution {
public:
    bool isNStraightHand(vector<int>& hand, int groupSize) {
        if (hand.size() % groupSize) return false;
        map<int, int> count;
        for (int x : hand) count[x]++;
        for (auto& [v, c0] : count) {
            int c = c0;
            if (c == 0) continue;
            for (int w = v; w < v + groupSize; w++) {
                auto it = count.find(w);
                if (it == count.end() || it->second < c) return false;
                it->second -= c;
            }
        }
        return true;
    }
};`});

P({n:1899,s:'merge-triplets-to-form-target-triplet',t:'Merge Triplets to Form Target Triplet',c:'greedy',d:'Medium',rel:[],
 sum:'Merging two triplets replaces each one with their element-wise maximum. Decide whether some sequence of merges can produce exactly the target triplet.',
 ex:'[[2, 5, 3], [1, 8, 4], [1, 7, 5]], target [2, 7, 5] → true',
 h:['Merging can only increase values.','Any triplet with some value larger than the target’s value at that position is poison: never use it.','Among the safe triplets, check that each target position is matched by at least one of them.'],
 app:'Ignore every triplet that exceeds the target in any coordinate. Merge all the remaining ones (their element-wise max never exceeds the target). The answer is true exactly when, for each of the three positions, some safe triplet equals the target there.',
 tc:'O(n)',sc:'O(1)',
 py:`class Solution:
    def mergeTriplets(self, triplets: list[list[int]], target: list[int]) -> bool:
        found = [False, False, False]
        for t in triplets:
            if all(t[i] <= target[i] for i in range(3)):    # safe to merge
                for i in range(3):
                    if t[i] == target[i]:
                        found[i] = True
        return all(found)`,
 js:`function mergeTriplets(triplets, target) {
  const found = [false, false, false];
  for (const t of triplets) {
    if (t.every((v, i) => v <= target[i])) t.forEach((v, i) => { if (v === target[i]) found[i] = true; });
  }
  return found.every(Boolean);
}`,
 java:`class Solution {
    public boolean mergeTriplets(int[][] triplets, int[] target) {
        boolean[] found = new boolean[3];
        for (int[] t : triplets) {
            if (t[0] > target[0] || t[1] > target[1] || t[2] > target[2]) continue;
            for (int i = 0; i < 3; i++) if (t[i] == target[i]) found[i] = true;
        }
        return found[0] && found[1] && found[2];
    }
}`,
 cpp:`class Solution {
public:
    bool mergeTriplets(vector<vector<int>>& triplets, vector<int>& target) {
        bool found[3] = {false, false, false};
        for (auto& t : triplets) {
            if (t[0] > target[0] || t[1] > target[1] || t[2] > target[2]) continue;
            for (int i = 0; i < 3; i++) if (t[i] == target[i]) found[i] = true;
        }
        return found[0] && found[1] && found[2];
    }
};`});

P({n:763,s:'partition-labels',t:'Partition Labels',c:'greedy',d:'Medium',rel:['intervals'],
 sum:'Split a string into as many parts as possible so that each letter appears in at most one part. Return the sizes of the parts.',
 ex:'"ababcbacadefegdehijhklij" → [9, 7, 8]',
 h:['A part containing letter c must extend at least to c’s last occurrence.','Record each letter’s last index.','Scan, stretching the current part’s end to the last index of each letter you see; when i reaches that end, close the part.'],
 app:'Precompute last[c]. Walk the string keeping end = max(end, last[s[i]]). When i equals end, every letter seen in the current part ends inside it, so cut here, record the size, and start a new part.',
 tc:'O(n)',sc:'O(26)',
 py:`class Solution:
    def partitionLabels(self, s: str) -> list[int]:
        last = {ch: i for i, ch in enumerate(s)}
        sizes, start, end = [], 0, 0
        for i, ch in enumerate(s):
            end = max(end, last[ch])        # this part must reach ch's last occurrence
            if i == end:
                sizes.append(end - start + 1)
                start = i + 1
        return sizes`,
 js:`function partitionLabels(s) {
  const last = {};
  for (let i = 0; i < s.length; i++) last[s[i]] = i;
  const sizes = [];
  let start = 0, end = 0;
  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, last[s[i]]);
    if (i === end) { sizes.push(end - start + 1); start = i + 1; }
  }
  return sizes;
}`,
 java:`class Solution {
    public List<Integer> partitionLabels(String s) {
        int[] last = new int[26];
        for (int i = 0; i < s.length(); i++) last[s.charAt(i) - 'a'] = i;
        List<Integer> sizes = new ArrayList<>();
        int start = 0, end = 0;
        for (int i = 0; i < s.length(); i++) {
            end = Math.max(end, last[s.charAt(i) - 'a']);
            if (i == end) { sizes.add(end - start + 1); start = i + 1; }
        }
        return sizes;
    }
}`,
 cpp:`class Solution {
public:
    vector<int> partitionLabels(string s) {
        int last[26] = {0};
        for (int i = 0; i < (int)s.size(); i++) last[s[i] - 'a'] = i;
        vector<int> sizes;
        int start = 0, end = 0;
        for (int i = 0; i < (int)s.size(); i++) {
            end = max(end, last[s[i] - 'a']);
            if (i == end) { sizes.push_back(end - start + 1); start = i + 1; }
        }
        return sizes;
    }
};`});

P({n:678,s:'valid-parenthesis-string',t:'Valid Parenthesis String',c:'greedy',d:'Medium',rel:[],
 sum:'A string has "(", ")" and "*", where "*" can stand for "(", ")" or nothing. Decide whether some choice makes the parentheses balanced.',
 ex:'"(*))" → true · ")(" → false',
 h:['Without stars, you’d track a single open-count.','With stars, the open-count could be any value in a range [lo, hi].','"(" raises both bounds; ")" lowers both; "*" lowers lo and raises hi. Clamp lo at 0, and fail if hi ever goes negative.'],
 app:'Maintain lo and hi, the minimum and maximum possible number of unmatched "(". Update them per character as described, clamping lo to 0 (you would never choose to go negative). If hi < 0 at any point, too many ")" exist. At the end the string is valid if lo = 0.',
 tc:'O(n)',sc:'O(1)',
 py:`class Solution:
    def checkValidString(self, s: str) -> bool:
        lo = hi = 0                     # range of possible open-paren counts
        for ch in s:
            if ch == "(":
                lo, hi = lo + 1, hi + 1
            elif ch == ")":
                lo, hi = lo - 1, hi - 1
            else:                       # "*" could be ")", "", or "("
                lo, hi = lo - 1, hi + 1
            if hi < 0:
                return False
            lo = max(lo, 0)
        return lo == 0`,
 js:`function checkValidString(s) {
  let lo = 0, hi = 0;
  for (const ch of s) {
    if (ch === "(") { lo++; hi++; }
    else if (ch === ")") { lo--; hi--; }
    else { lo--; hi++; }
    if (hi < 0) return false;
    lo = Math.max(lo, 0);
  }
  return lo === 0;
}`,
 java:`class Solution {
    public boolean checkValidString(String s) {
        int lo = 0, hi = 0;
        for (char ch : s.toCharArray()) {
            if (ch == '(') { lo++; hi++; }
            else if (ch == ')') { lo--; hi--; }
            else { lo--; hi++; }
            if (hi < 0) return false;
            lo = Math.max(lo, 0);
        }
        return lo == 0;
    }
}`,
 cpp:`class Solution {
public:
    bool checkValidString(string s) {
        int lo = 0, hi = 0;
        for (char ch : s) {
            if (ch == '(') { lo++; hi++; }
            else if (ch == ')') { lo--; hi--; }
            else { lo--; hi++; }
            if (hi < 0) return false;
            lo = max(lo, 0);
        }
        return lo == 0;
    }
};`});

/* ---------- Intervals ---------- */
P({n:57,s:'insert-interval',t:'Insert Interval',c:'intervals',d:'Medium',rel:['intervals'],
 sum:'Insert a new interval into a sorted list of non-overlapping intervals, merging wherever they overlap.',
 ex:'[[1, 3], [6, 9]] + [2, 5] → [[1, 5], [6, 9]]',
 h:['Intervals split into three groups: entirely before the new one, overlapping it, and entirely after.','Copy the “before” group unchanged.','Merge every overlapping interval into the new one by taking min of starts and max of ends, then copy the rest.'],
 app:'Walk the list once. Append intervals ending before newInterval starts. While intervals start at or before newInterval ends, widen newInterval to cover them. Append the merged interval, then the remaining intervals.',
 tc:'O(n)',sc:'O(n) for the output',
 py:`class Solution:
    def insert(self, intervals: list[list[int]], newInterval: list[int]) -> list[list[int]]:
        res, i, n = [], 0, len(intervals)
        start, end = newInterval
        while i < n and intervals[i][1] < start:          # entirely before
            res.append(intervals[i])
            i += 1
        while i < n and intervals[i][0] <= end:           # overlapping: absorb
            start = min(start, intervals[i][0])
            end = max(end, intervals[i][1])
            i += 1
        res.append([start, end])
        res.extend(intervals[i:])                         # entirely after
        return res`,
 js:`function insert(intervals, newInterval) {
  const res = [];
  let [start, end] = newInterval, i = 0;
  while (i < intervals.length && intervals[i][1] < start) res.push(intervals[i++]);
  while (i < intervals.length && intervals[i][0] <= end) {
    start = Math.min(start, intervals[i][0]);
    end = Math.max(end, intervals[i][1]);
    i++;
  }
  res.push([start, end]);
  return res.concat(intervals.slice(i));
}`,
 java:`class Solution {
    public int[][] insert(int[][] intervals, int[] newInterval) {
        List<int[]> res = new ArrayList<>();
        int i = 0, n = intervals.length, start = newInterval[0], end = newInterval[1];
        while (i < n && intervals[i][1] < start) res.add(intervals[i++]);
        while (i < n && intervals[i][0] <= end) {
            start = Math.min(start, intervals[i][0]);
            end = Math.max(end, intervals[i][1]);
            i++;
        }
        res.add(new int[]{start, end});
        while (i < n) res.add(intervals[i++]);
        return res.toArray(new int[0][]);
    }
}`,
 cpp:`class Solution {
public:
    vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {
        vector<vector<int>> res;
        int i = 0, n = intervals.size(), start = newInterval[0], end = newInterval[1];
        while (i < n && intervals[i][1] < start) res.push_back(intervals[i++]);
        while (i < n && intervals[i][0] <= end) {
            start = min(start, intervals[i][0]);
            end = max(end, intervals[i][1]);
            i++;
        }
        res.push_back({start, end});
        while (i < n) res.push_back(intervals[i++]);
        return res;
    }
};`});

P({n:56,s:'merge-intervals',t:'Merge Intervals',c:'intervals',d:'Medium',rel:['intervals'],
 sum:'Merge all overlapping intervals and return the resulting non-overlapping list.',
 ex:'[[1, 3], [2, 6], [8, 10], [15, 18]] → [[1, 6], [8, 10], [15, 18]]',
 h:['Sort by start time.','After sorting, an interval overlaps the previous merged one exactly when it starts before that one ends.','Either extend the last merged interval or start a new one.'],
 app:'Sort intervals by start. Keep a result list. For each interval, if it starts at or before the last result’s end, set that end to the max of both ends; otherwise append it as a new interval.',
 tc:'O(n log n)',sc:'O(n)',
 py:`class Solution:
    def merge(self, intervals: list[list[int]]) -> list[list[int]]:
        intervals.sort(key=lambda iv: iv[0])
        res = []
        for s, e in intervals:
            if res and s <= res[-1][1]:
                res[-1][1] = max(res[-1][1], e)     # overlaps: extend
            else:
                res.append([s, e])
        return res`,
 js:`function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const res = [];
  for (const [s, e] of intervals) {
    if (res.length && s <= res[res.length - 1][1]) res[res.length - 1][1] = Math.max(res[res.length - 1][1], e);
    else res.push([s, e]);
  }
  return res;
}`,
 java:`class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> res = new ArrayList<>();
        for (int[] iv : intervals) {
            if (!res.isEmpty() && iv[0] <= res.get(res.size() - 1)[1])
                res.get(res.size() - 1)[1] = Math.max(res.get(res.size() - 1)[1], iv[1]);
            else res.add(new int[]{iv[0], iv[1]});
        }
        return res.toArray(new int[0][]);
    }
}`,
 cpp:`class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> res;
        for (auto& iv : intervals) {
            if (!res.empty() && iv[0] <= res.back()[1]) res.back()[1] = max(res.back()[1], iv[1]);
            else res.push_back(iv);
        }
        return res;
    }
};`});

P({n:435,s:'non-overlapping-intervals',t:'Non-overlapping Intervals',c:'intervals',d:'Medium',rel:['intervals'],
 sum:'Return the minimum number of intervals to remove so that the rest don’t overlap (touching endpoints are fine).',
 ex:'[[1, 2], [2, 3], [3, 4], [1, 3]] → 1',
 h:['Removing the fewest is the same as keeping the most.','Keeping the most non-overlapping intervals is classic interval scheduling.','Sort by end time and greedily keep each interval that starts at or after the last kept one ends.'],
 app:'Sort by end. Walk through, keeping an interval when its start ≥ the end of the last kept interval; otherwise count it as removed. The count of removals is the answer.',
 tc:'O(n log n)',sc:'O(1) extra',
 py:`class Solution:
    def eraseOverlapIntervals(self, intervals: list[list[int]]) -> int:
        intervals.sort(key=lambda iv: iv[1])        # earliest end first
        removed, end = 0, float("-inf")
        for s, e in intervals:
            if s >= end:
                end = e                             # keep it
            else:
                removed += 1                        # overlaps the kept one: drop it
        return removed`,
 js:`function eraseOverlapIntervals(intervals) {
  intervals.sort((a, b) => a[1] - b[1]);
  let removed = 0, end = -Infinity;
  for (const [s, e] of intervals) {
    if (s >= end) end = e; else removed++;
  }
  return removed;
}`,
 java:`class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));
        int removed = 0;
        long end = Long.MIN_VALUE;
        for (int[] iv : intervals) {
            if (iv[0] >= end) end = iv[1]; else removed++;
        }
        return removed;
    }
}`,
 cpp:`class Solution {
public:
    int eraseOverlapIntervals(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end(), [](auto& a, auto& b) { return a[1] < b[1]; });
        int removed = 0;
        long long end = LLONG_MIN;
        for (auto& iv : intervals) {
            if (iv[0] >= end) end = iv[1]; else removed++;
        }
        return removed;
    }
};`});

P({n:252,s:'meeting-rooms',t:'Meeting Rooms',c:'intervals',d:'Easy',prem:1,rel:['intervals'],
 sum:'Given meeting time intervals, decide whether one person could attend all of them (no two overlap).',
 ex:'[[0, 30], [5, 10], [15, 20]] → false · [[7, 10], [2, 4]] → true',
 h:['Sort meetings by start time.','After sorting, any overlap must occur between neighbors.','Check that each meeting starts no earlier than the previous one ends.'],
 app:'Sort by start time and compare each meeting with the one before it. If a meeting starts before the previous one ends, return false. Otherwise return true.',
 tc:'O(n log n)',sc:'O(1) extra',
 py:`class Solution:
    def canAttendMeetings(self, intervals: list[list[int]]) -> bool:
        intervals.sort(key=lambda iv: iv[0])
        for prev, cur in zip(intervals, intervals[1:]):
            if cur[0] < prev[1]:
                return False
        return True`,
 js:`function canAttendMeetings(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < intervals.length; i++) if (intervals[i][0] < intervals[i - 1][1]) return false;
  return true;
}`,
 java:`class Solution {
    public boolean canAttendMeetings(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        for (int i = 1; i < intervals.length; i++)
            if (intervals[i][0] < intervals[i - 1][1]) return false;
        return true;
    }
}`,
 cpp:`class Solution {
public:
    bool canAttendMeetings(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        for (size_t i = 1; i < intervals.size(); i++)
            if (intervals[i][0] < intervals[i - 1][1]) return false;
        return true;
    }
};`});

P({n:253,s:'meeting-rooms-ii',t:'Meeting Rooms II',c:'intervals',d:'Medium',prem:1,rel:['intervals','binheap'],
 sum:'Given meeting time intervals, return the minimum number of conference rooms needed so that no meetings in the same room overlap.',
 ex:'[[0, 30], [5, 10], [15, 20]] → 2',
 h:['The answer is the largest number of meetings happening at the same moment.','Sort the start times and the end times separately.','Sweep through starts; each start needs a room unless some meeting has already ended by then.'],
 app:'Sort starts and ends independently. Walk through starts with a pointer into ends: if the current start is before the earliest unprocessed end, a new room is needed; otherwise a room frees up, so advance the end pointer. A min-heap of end times gives the same count.',
 tc:'O(n log n)',sc:'O(n)',
 py:`class Solution:
    def minMeetingRooms(self, intervals: list[list[int]]) -> int:
        starts = sorted(s for s, _ in intervals)
        ends = sorted(e for _, e in intervals)
        rooms = e = 0
        for s in starts:
            if s < ends[e]:
                rooms += 1          # nothing has ended yet: need another room
            else:
                e += 1              # reuse the room freed by the earliest ending meeting
        return rooms`,
 js:`function minMeetingRooms(intervals) {
  const starts = intervals.map(iv => iv[0]).sort((a, b) => a - b);
  const ends = intervals.map(iv => iv[1]).sort((a, b) => a - b);
  let rooms = 0, e = 0;
  for (const s of starts) {
    if (s < ends[e]) rooms++; else e++;
  }
  return rooms;
}`,
 java:`class Solution {
    public int minMeetingRooms(int[][] intervals) {
        int n = intervals.length;
        int[] starts = new int[n], ends = new int[n];
        for (int i = 0; i < n; i++) { starts[i] = intervals[i][0]; ends[i] = intervals[i][1]; }
        Arrays.sort(starts);
        Arrays.sort(ends);
        int rooms = 0, e = 0;
        for (int s : starts) {
            if (s < ends[e]) rooms++; else e++;
        }
        return rooms;
    }
}`,
 cpp:`class Solution {
public:
    int minMeetingRooms(vector<vector<int>>& intervals) {
        vector<int> starts, ends;
        for (auto& iv : intervals) { starts.push_back(iv[0]); ends.push_back(iv[1]); }
        sort(starts.begin(), starts.end());
        sort(ends.begin(), ends.end());
        int rooms = 0, e = 0;
        for (int s : starts) {
            if (s < ends[e]) rooms++; else e++;
        }
        return rooms;
    }
};`});

P({n:1851,s:'minimum-interval-to-include-each-query',t:'Minimum Interval to Include Each Query',c:'intervals',d:'Hard',rel:['binheap','intervals'],
 sum:'For each query point, return the size (right − left + 1) of the smallest interval that contains it, or −1 if none does.',
 ex:'intervals [[1, 4], [2, 4], [3, 6], [4, 4]], queries [2, 3, 4, 5] → [3, 3, 1, 4]',
 h:['Answer the queries offline, in increasing order.','Sort intervals by start; as queries grow, more intervals become “started”.','Keep started intervals in a min-heap by size, lazily discarding those that ended before the current query.'],
 app:'Sort intervals by left end and process queries in sorted order (remembering their original indices). For each query q, push every interval with left ≤ q into a min-heap keyed by (size, right). Pop from the heap while its top’s right end is < q. The top, if any, is the smallest interval containing q.',
 tc:'O((n + q) log n)',sc:'O(n + q)',
 py:`import heapq

class Solution:
    def minInterval(self, intervals: list[list[int]], queries: list[int]) -> list[int]:
        intervals.sort()
        res = {}
        heap, i = [], 0                                  # heap of (size, right end)
        for q in sorted(set(queries)):
            while i < len(intervals) and intervals[i][0] <= q:
                l, r = intervals[i]
                heapq.heappush(heap, (r - l + 1, r))
                i += 1
            while heap and heap[0][1] < q:               # ended before q: discard
                heapq.heappop(heap)
            res[q] = heap[0][0] if heap else -1
        return [res[q] for q in queries]`,
 js:JS_PQ+`function minInterval(intervals, queries) {
  intervals.sort((a, b) => a[0] - b[0]);
  const order = queries.map((q, i) => [q, i]).sort((a, b) => a[0] - b[0]);
  const heap = new Heap((a, b) => a[0] - b[0]);       // [size, right end]
  const res = new Array(queries.length).fill(-1);
  let i = 0;
  for (const [q, idx] of order) {
    while (i < intervals.length && intervals[i][0] <= q) {
      const [l, r] = intervals[i++];
      heap.push([r - l + 1, r]);
    }
    while (heap.size && heap.peek()[1] < q) heap.pop();
    if (heap.size) res[idx] = heap.peek()[0];
  }
  return res;
}`,
 java:`class Solution {
    public int[] minInterval(int[][] intervals, int[] queries) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        Integer[] order = new Integer[queries.length];
        for (int k = 0; k < order.length; k++) order[k] = k;
        Arrays.sort(order, (a, b) -> Integer.compare(queries[a], queries[b]));
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[0] - b[0]);   // {size, right}
        int[] res = new int[queries.length];
        int i = 0;
        for (int idx : order) {
            int q = queries[idx];
            while (i < intervals.length && intervals[i][0] <= q) {
                heap.add(new int[]{intervals[i][1] - intervals[i][0] + 1, intervals[i][1]});
                i++;
            }
            while (!heap.isEmpty() && heap.peek()[1] < q) heap.poll();
            res[idx] = heap.isEmpty() ? -1 : heap.peek()[0];
        }
        return res;
    }
}`,
 cpp:`class Solution {
public:
    vector<int> minInterval(vector<vector<int>>& intervals, vector<int>& queries) {
        sort(intervals.begin(), intervals.end());
        vector<int> order(queries.size());
        iota(order.begin(), order.end(), 0);
        sort(order.begin(), order.end(), [&](int a, int b) { return queries[a] < queries[b]; });
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> heap;   // (size, right)
        vector<int> res(queries.size(), -1);
        size_t i = 0;
        for (int idx : order) {
            int q = queries[idx];
            while (i < intervals.size() && intervals[i][0] <= q) {
                heap.push({intervals[i][1] - intervals[i][0] + 1, intervals[i][1]});
                i++;
            }
            while (!heap.empty() && heap.top().second < q) heap.pop();
            if (!heap.empty()) res[idx] = heap.top().first;
        }
        return res;
    }
};`});

/* ---------- Math & Geometry ---------- */
P({n:48,s:'rotate-image',t:'Rotate Image',c:'math',d:'Medium',rel:[],
 sum:'Rotate an n × n matrix 90 degrees clockwise, in place.',
 ex:'[[1, 2, 3], [4, 5, 6], [7, 8, 9]] → [[7, 4, 1], [8, 5, 2], [9, 6, 3]]',
 h:['A clockwise rotation equals a transpose followed by reversing each row.','Transpose: swap matrix[i][j] with matrix[j][i] for j > i.','Both steps are in place.'],
 app:'First transpose the matrix by swapping across the main diagonal. Then reverse every row. Rotating four cells at a time layer by layer also works and touches each cell once.',
 tc:'O(n²)',sc:'O(1)',
 py:`class Solution:
    def rotate(self, matrix: list[list[int]]) -> None:
        n = len(matrix)
        for i in range(n):                      # transpose
            for j in range(i + 1, n):
                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
        for row in matrix:                      # reverse each row
            row.reverse()`,
 js:`function rotate(matrix) {
  const n = matrix.length;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
  for (const row of matrix) row.reverse();
}`,
 java:`class Solution {
    public void rotate(int[][] matrix) {
        int n = matrix.length;
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++) {
                int t = matrix[i][j]; matrix[i][j] = matrix[j][i]; matrix[j][i] = t;
            }
        for (int[] row : matrix)
            for (int l = 0, r = n - 1; l < r; l++, r--) { int t = row[l]; row[l] = row[r]; row[r] = t; }
    }
}`,
 cpp:`class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int n = matrix.size();
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++) swap(matrix[i][j], matrix[j][i]);
        for (auto& row : matrix) reverse(row.begin(), row.end());
    }
};`});

P({n:54,s:'spiral-matrix',t:'Spiral Matrix',c:'math',d:'Medium',rel:[],
 sum:'Return all elements of an m × n matrix in clockwise spiral order, starting at the top-left.',
 ex:'[[1, 2, 3], [4, 5, 6], [7, 8, 9]] → [1, 2, 3, 6, 9, 8, 7, 4, 5]',
 h:['Track four boundaries: top, bottom, left, right.','Walk the top row, right column, bottom row and left column, shrinking the boundary after each.','Check the boundaries before the bottom and left walks so single rows or columns aren’t visited twice.'],
 app:'While top ≤ bottom and left ≤ right: traverse top row left→right (then top++), right column top→bottom (right−−), bottom row right→left if top ≤ bottom (bottom−−), and left column bottom→top if left ≤ right (left++).',
 tc:'O(m · n)',sc:'O(1) extra',
 py:`class Solution:
    def spiralOrder(self, matrix: list[list[int]]) -> list[int]:
        res = []
        top, bottom, left, right = 0, len(matrix) - 1, 0, len(matrix[0]) - 1
        while top <= bottom and left <= right:
            res += matrix[top][left:right + 1]
            top += 1
            res += [matrix[r][right] for r in range(top, bottom + 1)]
            right -= 1
            if top <= bottom:
                res += matrix[bottom][left:right + 1][::-1]
                bottom -= 1
            if left <= right:
                res += [matrix[r][left] for r in range(bottom, top - 1, -1)]
                left += 1
        return res`,
 js:`function spiralOrder(matrix) {
  const res = [];
  let top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) res.push(matrix[top][c]);
    top++;
    for (let r = top; r <= bottom; r++) res.push(matrix[r][right]);
    right--;
    if (top <= bottom) { for (let c = right; c >= left; c--) res.push(matrix[bottom][c]); bottom--; }
    if (left <= right) { for (let r = bottom; r >= top; r--) res.push(matrix[r][left]); left++; }
  }
  return res;
}`,
 java:`class Solution {
    public List<Integer> spiralOrder(int[][] matrix) {
        List<Integer> res = new ArrayList<>();
        int top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
        while (top <= bottom && left <= right) {
            for (int c = left; c <= right; c++) res.add(matrix[top][c]);
            top++;
            for (int r = top; r <= bottom; r++) res.add(matrix[r][right]);
            right--;
            if (top <= bottom) { for (int c = right; c >= left; c--) res.add(matrix[bottom][c]); bottom--; }
            if (left <= right) { for (int r = bottom; r >= top; r--) res.add(matrix[r][left]); left++; }
        }
        return res;
    }
}`,
 cpp:`class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        vector<int> res;
        int top = 0, bottom = matrix.size() - 1, left = 0, right = matrix[0].size() - 1;
        while (top <= bottom && left <= right) {
            for (int c = left; c <= right; c++) res.push_back(matrix[top][c]);
            top++;
            for (int r = top; r <= bottom; r++) res.push_back(matrix[r][right]);
            right--;
            if (top <= bottom) { for (int c = right; c >= left; c--) res.push_back(matrix[bottom][c]); bottom--; }
            if (left <= right) { for (int r = bottom; r >= top; r--) res.push_back(matrix[r][left]); left++; }
        }
        return res;
    }
};`});

P({n:73,s:'set-matrix-zeroes',t:'Set Matrix Zeroes',c:'math',d:'Medium',rel:[],
 sum:'If a cell is 0, set its entire row and column to 0, in place. Aim for O(1) extra space.',
 ex:'[[1, 1, 1], [1, 0, 1], [1, 1, 1]] → [[1, 0, 1], [0, 0, 0], [1, 0, 1]]',
 h:['Zeroing as you scan would spread zeros that weren’t in the original.','Separate row and column marker arrays give O(m + n) space.','Use the first row and first column themselves as the markers, with one extra flag for whether the first row itself must be zeroed.'],
 app:'Remember whether row 0 contains a zero. For every other zero at (r, c), mark matrix[r][0] = 0 and matrix[0][c] = 0. Then zero each cell (r, c) for r, c ≥ 1 whose row or column marker is 0. Zero column 0 if matrix[0][0] was marked, and finally zero row 0 if the flag says so.',
 tc:'O(m · n)',sc:'O(1)',
 py:`class Solution:
    def setZeroes(self, matrix: list[list[int]]) -> None:
        rows, cols = len(matrix), len(matrix[0])
        first_row_zero = any(v == 0 for v in matrix[0])
        for r in range(1, rows):                 # use row 0 / column 0 as markers
            for c in range(cols):
                if matrix[r][c] == 0:
                    matrix[r][0] = 0
                    matrix[0][c] = 0
        for r in range(1, rows):
            for c in range(1, cols):
                if matrix[r][0] == 0 or matrix[0][c] == 0:
                    matrix[r][c] = 0
        if matrix[0][0] == 0:                    # column 0 itself
            for r in range(rows):
                matrix[r][0] = 0
        if first_row_zero:
            for c in range(cols):
                matrix[0][c] = 0`,
 js:`function setZeroes(matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  const firstRowZero = matrix[0].includes(0);
  for (let r = 1; r < rows; r++)
    for (let c = 0; c < cols; c++) if (matrix[r][c] === 0) { matrix[r][0] = 0; matrix[0][c] = 0; }
  for (let r = 1; r < rows; r++)
    for (let c = 1; c < cols; c++) if (matrix[r][0] === 0 || matrix[0][c] === 0) matrix[r][c] = 0;
  if (matrix[0][0] === 0) for (let r = 0; r < rows; r++) matrix[r][0] = 0;
  if (firstRowZero) matrix[0].fill(0);
}`,
 java:`class Solution {
    public void setZeroes(int[][] matrix) {
        int rows = matrix.length, cols = matrix[0].length;
        boolean firstRowZero = false;
        for (int c = 0; c < cols; c++) if (matrix[0][c] == 0) firstRowZero = true;
        for (int r = 1; r < rows; r++)
            for (int c = 0; c < cols; c++)
                if (matrix[r][c] == 0) { matrix[r][0] = 0; matrix[0][c] = 0; }
        for (int r = 1; r < rows; r++)
            for (int c = 1; c < cols; c++)
                if (matrix[r][0] == 0 || matrix[0][c] == 0) matrix[r][c] = 0;
        if (matrix[0][0] == 0) for (int r = 0; r < rows; r++) matrix[r][0] = 0;
        if (firstRowZero) Arrays.fill(matrix[0], 0);
    }
}`,
 cpp:`class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int rows = matrix.size(), cols = matrix[0].size();
        bool firstRowZero = find(matrix[0].begin(), matrix[0].end(), 0) != matrix[0].end();
        for (int r = 1; r < rows; r++)
            for (int c = 0; c < cols; c++)
                if (matrix[r][c] == 0) { matrix[r][0] = 0; matrix[0][c] = 0; }
        for (int r = 1; r < rows; r++)
            for (int c = 1; c < cols; c++)
                if (matrix[r][0] == 0 || matrix[0][c] == 0) matrix[r][c] = 0;
        if (matrix[0][0] == 0) for (int r = 0; r < rows; r++) matrix[r][0] = 0;
        if (firstRowZero) fill(matrix[0].begin(), matrix[0].end(), 0);
    }
};`});

P({n:202,s:'happy-number',t:'Happy Number',c:'math',d:'Easy',rel:['floyd'],
 sum:'Repeatedly replace a number with the sum of the squares of its digits. It is “happy” if this reaches 1. Decide whether n is happy.',
 ex:'19 → 1² + 9² = 82 → 68 → 100 → 1, so true',
 h:['Unhappy numbers fall into a cycle that never contains 1.','You need to detect a cycle in the sequence.','A hash set of seen values works; Floyd’s slow/fast pointers do it in O(1) memory.'],
 app:'Define next(n) as the digit-square sum. Advance slow by one step and fast by two until fast reaches 1 or they meet. If fast hits 1, n is happy; if they meet elsewhere, it cycles forever.',
 tc:'O(log n) per step, few steps',sc:'O(1)',
 py:`class Solution:
    def isHappy(self, n: int) -> bool:
        def step(x):
            return sum(int(d) ** 2 for d in str(x))

        slow, fast = n, step(n)
        while fast != 1 and slow != fast:       # Floyd's cycle detection
            slow = step(slow)
            fast = step(step(fast))
        return fast == 1`,
 js:`function isHappy(n) {
  const step = x => { let s = 0; while (x) { const d = x % 10; s += d * d; x = Math.floor(x / 10); } return s; };
  let slow = n, fast = step(n);
  while (fast !== 1 && slow !== fast) { slow = step(slow); fast = step(step(fast)); }
  return fast === 1;
}`,
 java:`class Solution {
    public boolean isHappy(int n) {
        int slow = n, fast = step(n);
        while (fast != 1 && slow != fast) { slow = step(slow); fast = step(step(fast)); }
        return fast == 1;
    }

    private int step(int x) {
        int s = 0;
        while (x > 0) { int d = x % 10; s += d * d; x /= 10; }
        return s;
    }
}`,
 cpp:`class Solution {
    int step(int x) {
        int s = 0;
        while (x > 0) { int d = x % 10; s += d * d; x /= 10; }
        return s;
    }
public:
    bool isHappy(int n) {
        int slow = n, fast = step(n);
        while (fast != 1 && slow != fast) { slow = step(slow); fast = step(step(fast)); }
        return fast == 1;
    }
};`});

P({n:66,s:'plus-one',t:'Plus One',c:'math',d:'Easy',rel:[],
 sum:'A large integer is stored as an array of digits (most significant first). Add one and return the resulting digits.',
 ex:'[1, 2, 9] → [1, 3, 0] · [9, 9] → [1, 0, 0]',
 h:['Work from the last digit backward.','A digit below 9 just increments, and you’re done.','A 9 becomes 0 and carries. If every digit was 9, prepend a 1.'],
 app:'Scan from the end: if the digit is less than 9, increment it and return. Otherwise set it to 0 and continue. If the loop finishes, all digits were 9, so return [1] followed by zeros.',
 tc:'O(n)',sc:'O(1) (O(n) only when all 9s)',
 py:`class Solution:
    def plusOne(self, digits: list[int]) -> list[int]:
        for i in range(len(digits) - 1, -1, -1):
            if digits[i] < 9:
                digits[i] += 1
                return digits
            digits[i] = 0                  # 9 + 1 carries
        return [1] + digits                # every digit was 9`,
 js:`function plusOne(digits) {
  for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] < 9) { digits[i]++; return digits; }
    digits[i] = 0;
  }
  return [1, ...digits];
}`,
 java:`class Solution {
    public int[] plusOne(int[] digits) {
        for (int i = digits.length - 1; i >= 0; i--) {
            if (digits[i] < 9) { digits[i]++; return digits; }
            digits[i] = 0;
        }
        int[] res = new int[digits.length + 1];
        res[0] = 1;
        return res;
    }
}`,
 cpp:`class Solution {
public:
    vector<int> plusOne(vector<int>& digits) {
        for (int i = digits.size() - 1; i >= 0; i--) {
            if (digits[i] < 9) { digits[i]++; return digits; }
            digits[i] = 0;
        }
        digits.insert(digits.begin(), 1);
        return digits;
    }
};`});

P({n:50,s:'powx-n',t:'Pow(x, n)',c:'math',d:'Medium',rel:['gcd'],
 sum:'Compute x raised to the integer power n, where n may be negative.',
 ex:'x = 2.0, n = 10 → 1024.0 · x = 2.0, n = −2 → 0.25',
 h:['Multiplying x n times is O(n), too slow for n near 2³¹.','xⁿ = (x²)^(n/2), with one extra x when n is odd.','For negative n, compute (1/x)^(−n). Watch out for −2³¹ overflowing when negated in fixed-width integers.'],
 app:'Fast exponentiation (square-and-multiply): while n > 0, if the low bit is set multiply the result by x; then square x and halve n. Convert negative exponents first by inverting x, using a 64-bit copy of n so −2³¹ can be negated safely.',
 tc:'O(log n)',sc:'O(1)',
 py:`class Solution:
    def myPow(self, x: float, n: int) -> float:
        if n < 0:
            x, n = 1 / x, -n
        result = 1.0
        while n:
            if n & 1:
                result *= x            # this bit of n contributes x^(2^k)
            x *= x
            n >>= 1
        return result`,
 js:`function myPow(x, n) {
  if (n < 0) { x = 1 / x; n = -n; }
  let result = 1;
  while (n > 0) {
    if (n % 2 === 1) result *= x;
    x *= x;
    n = Math.floor(n / 2);
  }
  return result;
}`,
 java:`class Solution {
    public double myPow(double x, int n) {
        long e = n;                    // long so that -2^31 can be negated
        if (e < 0) { x = 1 / x; e = -e; }
        double result = 1;
        while (e > 0) {
            if ((e & 1) == 1) result *= x;
            x *= x;
            e >>= 1;
        }
        return result;
    }
}`,
 cpp:`class Solution {
public:
    double myPow(double x, int n) {
        long long e = n;               // 64-bit so that -2^31 can be negated
        if (e < 0) { x = 1 / x; e = -e; }
        double result = 1;
        while (e > 0) {
            if (e & 1) result *= x;
            x *= x;
            e >>= 1;
        }
        return result;
    }
};`});

P({n:43,s:'multiply-strings',t:'Multiply Strings',c:'math',d:'Medium',rel:[],
 sum:'Multiply two non-negative integers given as decimal strings and return the product as a string, without converting the whole numbers to built-in integers.',
 ex:'"123" × "456" → "56088"',
 h:['Use the grade-school method.','Digit i of num1 times digit j of num2 contributes to positions i + j and i + j + 1 of a result array of length m + n.','Add each product into position i + j + 1, carry into i + j, then strip leading zeros.'],
 app:'Create an array of m + n zeros. For i from the end of num1 and j from the end of num2, add digit product to res[i + j + 1], move the carry into res[i + j], and keep res[i + j + 1] as a single digit. Convert to a string, skipping leading zeros (returning "0" if nothing is left).',
 tc:'O(m · n)',sc:'O(m + n)',
 py:`class Solution:
    def multiply(self, num1: str, num2: str) -> str:
        m, n = len(num1), len(num2)
        res = [0] * (m + n)
        for i in range(m - 1, -1, -1):
            for j in range(n - 1, -1, -1):
                total = int(num1[i]) * int(num2[j]) + res[i + j + 1]
                res[i + j + 1] = total % 10
                res[i + j] += total // 10            # carry
        s = "".join(map(str, res)).lstrip("0")
        return s or "0"`,
 js:`function multiply(num1, num2) {
  const m = num1.length, n = num2.length, res = new Array(m + n).fill(0);
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--) {
      const total = Number(num1[i]) * Number(num2[j]) + res[i + j + 1];
      res[i + j + 1] = total % 10;
      res[i + j] += Math.floor(total / 10);
    }
  const s = res.join("").replace(/^0+/, "");
  return s || "0";
}`,
 java:`class Solution {
    public String multiply(String num1, String num2) {
        int m = num1.length(), n = num2.length();
        int[] res = new int[m + n];
        for (int i = m - 1; i >= 0; i--)
            for (int j = n - 1; j >= 0; j--) {
                int total = (num1.charAt(i) - '0') * (num2.charAt(j) - '0') + res[i + j + 1];
                res[i + j + 1] = total % 10;
                res[i + j] += total / 10;
            }
        StringBuilder sb = new StringBuilder();
        for (int d : res) if (sb.length() > 0 || d != 0) sb.append(d);
        return sb.length() == 0 ? "0" : sb.toString();
    }
}`,
 cpp:`class Solution {
public:
    string multiply(string num1, string num2) {
        int m = num1.size(), n = num2.size();
        vector<int> res(m + n, 0);
        for (int i = m - 1; i >= 0; i--)
            for (int j = n - 1; j >= 0; j--) {
                int total = (num1[i] - '0') * (num2[j] - '0') + res[i + j + 1];
                res[i + j + 1] = total % 10;
                res[i + j] += total / 10;
            }
        string s;
        for (int d : res) if (!s.empty() || d != 0) s += char('0' + d);
        return s.empty() ? "0" : s;
    }
};`});

P({n:2013,s:'detect-squares',t:'Detect Squares',c:'math',d:'Medium',rel:[],
 sum:'Design a structure that stores points (duplicates allowed) and, given a query point, counts the axis-aligned squares with positive area that use the query point plus three stored points.',
 ex:'add (3,10), (11,2), (3,2); count(11,10) → 1',
 h:['Store how many times each point was added.','A square’s corner diagonal from the query determines the other two corners.','For each stored point (x, y) with |x − qx| = |y − qy| > 0, multiply the counts of the other two corners.'],
 app:'Keep a hash map of point counts plus a list of distinct points. For count(qx, qy), loop over distinct points (x, y) that form a diagonal with the query: |x − qx| = |y − qy| ≠ 0. The square’s other corners are (qx, y) and (x, qy). Add count(x, y) × count(qx, y) × count(x, qy).',
 tc:'add O(1), count O(distinct points)',sc:'O(points)',
 py:`from collections import Counter

class DetectSquares:
    def __init__(self):
        self.points = Counter()             # (x, y) -> how many times it was added

    def add(self, point: list[int]) -> None:
        self.points[tuple(point)] += 1

    def count(self, point: list[int]) -> int:
        qx, qy = point
        total = 0
        for (x, y), c in list(self.points.items()):
            if abs(x - qx) == abs(y - qy) and x != qx:     # (x, y) is diagonal to the query
                total += c * self.points[(qx, y)] * self.points[(x, qy)]
        return total`,
 js:`class DetectSquares {
  constructor() { this.counts = new Map(); }
  key(x, y) { return x + "," + y; }
  add([x, y]) { const k = this.key(x, y); this.counts.set(k, (this.counts.get(k) || 0) + 1); }
  count([qx, qy]) {
    let total = 0;
    for (const [k, c] of this.counts) {
      const [x, y] = k.split(",").map(Number);
      if (Math.abs(x - qx) === Math.abs(y - qy) && x !== qx)
        total += c * (this.counts.get(this.key(qx, y)) || 0) * (this.counts.get(this.key(x, qy)) || 0);
    }
    return total;
  }
}`,
 java:`class DetectSquares {
    private final Map<Long, Integer> counts = new HashMap<>();
    private final List<int[]> points = new ArrayList<>();

    private long key(int x, int y) { return ((long) x << 32) | (y & 0xffffffffL); }

    public void add(int[] point) {
        long k = key(point[0], point[1]);
        if (counts.merge(k, 1, Integer::sum) == 1) points.add(point);
    }

    public int count(int[] point) {
        int qx = point[0], qy = point[1], total = 0;
        for (int[] p : points) {
            int x = p[0], y = p[1];
            if (Math.abs(x - qx) == Math.abs(y - qy) && x != qx)
                total += counts.get(key(x, y))
                       * counts.getOrDefault(key(qx, y), 0)
                       * counts.getOrDefault(key(x, qy), 0);
        }
        return total;
    }
}`,
 cpp:`class DetectSquares {
    map<pair<int, int>, int> counts;
public:
    void add(vector<int> point) { counts[{point[0], point[1]}]++; }

    int count(vector<int> point) {
        int qx = point[0], qy = point[1], total = 0;
        for (auto& [p, c] : counts) {
            auto [x, y] = p;
            if (abs(x - qx) == abs(y - qy) && x != qx) {
                auto a = counts.find({qx, y}), b = counts.find({x, qy});
                if (a != counts.end() && b != counts.end()) total += c * a->second * b->second;
            }
        }
        return total;
    }
};`});

/* ---------- Bit Manipulation ---------- */
P({n:136,s:'single-number',t:'Single Number',c:'bits',d:'Easy',rel:['bits'],
 sum:'Every value in the array appears twice except one. Find that one in linear time and constant space.',
 ex:'[4, 1, 2, 1, 2] → 4',
 h:['A hash set works but uses O(n) space.','x ^ x = 0 and x ^ 0 = x, and XOR is commutative.','XOR everything: the pairs cancel, leaving the single value.'],
 app:'Fold the array with XOR starting from 0. Every duplicated value cancels with its twin regardless of order, so the result is the unpaired value.',
 tc:'O(n)',sc:'O(1)',
 py:`class Solution:
    def singleNumber(self, nums: list[int]) -> int:
        result = 0
        for x in nums:
            result ^= x            # pairs cancel out
        return result`,
 js:`function singleNumber(nums) {
  return nums.reduce((acc, x) => acc ^ x, 0);
}`,
 java:`class Solution {
    public int singleNumber(int[] nums) {
        int result = 0;
        for (int x : nums) result ^= x;
        return result;
    }
}`,
 cpp:`class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int result = 0;
        for (int x : nums) result ^= x;
        return result;
    }
};`});

P({n:191,s:'number-of-1-bits',t:'Number of 1 Bits',c:'bits',d:'Easy',rel:['bits'],
 sum:'Return the number of set bits (1s) in the binary representation of a positive integer.',
 ex:'11 (binary 1011) → 3',
 h:['You could test each of the 32 bits.','n & (n − 1) clears the lowest set bit.','Count how many times you can do that before n becomes 0.'],
 app:'Brian Kernighan’s trick: repeatedly set n = n & (n − 1), counting iterations. Each iteration removes exactly one set bit, so the loop runs once per 1-bit.',
 tc:'O(number of set bits)',sc:'O(1)',
 py:`class Solution:
    def hammingWeight(self, n: int) -> int:
        count = 0
        while n:
            n &= n - 1          # clear the lowest set bit
            count += 1
        return count`,
 js:`function hammingWeight(n) {
  let count = 0;
  while (n !== 0) {
    n &= n - 1;
    count++;
  }
  return count;
}`,
 java:`public class Solution {
    public int hammingWeight(int n) {
        int count = 0;
        while (n != 0) {
            n &= n - 1;          // works for negative ints too (treated as unsigned bits)
            count++;
        }
        return count;
    }
}`,
 cpp:`class Solution {
public:
    int hammingWeight(uint32_t n) {
        int count = 0;
        while (n) {
            n &= n - 1;
            count++;
        }
        return count;
    }
};`});

P({n:338,s:'counting-bits',t:'Counting Bits',c:'bits',d:'Easy',rel:['bits','memo'],
 sum:'For every i from 0 to n, return the number of 1s in the binary representation of i.',
 ex:'n = 5 → [0, 1, 1, 2, 1, 2]',
 h:['Counting each number separately costs O(n log n).','i >> 1 is i without its last bit, and you have already computed it.','bits[i] = bits[i >> 1] + (i & 1).'],
 app:'Fill an array from 1 to n using the recurrence bits[i] = bits[i >> 1] + (i & 1). Each entry reuses an earlier one, so the whole table takes linear time. bits[i] = bits[i & (i − 1)] + 1 works equally well.',
 tc:'O(n)',sc:'O(n) for the output',
 py:`class Solution:
    def countBits(self, n: int) -> list[int]:
        bits = [0] * (n + 1)
        for i in range(1, n + 1):
            bits[i] = bits[i >> 1] + (i & 1)    # drop the last bit, then add it back
        return bits`,
 js:`function countBits(n) {
  const bits = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) bits[i] = bits[i >> 1] + (i & 1);
  return bits;
}`,
 java:`class Solution {
    public int[] countBits(int n) {
        int[] bits = new int[n + 1];
        for (int i = 1; i <= n; i++) bits[i] = bits[i >> 1] + (i & 1);
        return bits;
    }
}`,
 cpp:`class Solution {
public:
    vector<int> countBits(int n) {
        vector<int> bits(n + 1, 0);
        for (int i = 1; i <= n; i++) bits[i] = bits[i >> 1] + (i & 1);
        return bits;
    }
};`});

P({n:190,s:'reverse-bits',t:'Reverse Bits',c:'bits',d:'Easy',rel:['bits'],
 sum:'Reverse the order of the 32 bits of an unsigned integer.',
 ex:'00000010100101000001111010011100 → 00111001011110000010100101000000',
 h:['Build the answer one bit at a time.','Shift the result left, then append n’s lowest bit.','Shift n right and repeat exactly 32 times. In JavaScript and Java, use unsigned shifts.'],
 app:'Loop 32 times: result = (result << 1) | (n & 1), then n >>= 1. In languages without unsigned 32-bit integers, force an unsigned result (>>> 0 in JavaScript); Java returns the same bits in a signed int.',
 tc:'O(32) = O(1)',sc:'O(1)',
 py:`class Solution:
    def reverseBits(self, n: int) -> int:
        result = 0
        for _ in range(32):
            result = (result << 1) | (n & 1)    # move n's lowest bit onto result
            n >>= 1
        return result`,
 js:`function reverseBits(n) {
  let result = 0;
  for (let i = 0; i < 32; i++) {
    result = ((result << 1) | (n & 1)) >>> 0;   // >>> 0 keeps it unsigned
    n >>>= 1;
  }
  return result;
}`,
 java:`public class Solution {
    public int reverseBits(int n) {
        int result = 0;
        for (int i = 0; i < 32; i++) {
            result = (result << 1) | (n & 1);
            n >>>= 1;                            // unsigned shift
        }
        return result;
    }
}`,
 cpp:`class Solution {
public:
    uint32_t reverseBits(uint32_t n) {
        uint32_t result = 0;
        for (int i = 0; i < 32; i++) {
            result = (result << 1) | (n & 1);
            n >>= 1;
        }
        return result;
    }
};`});

P({n:268,s:'missing-number',t:'Missing Number',c:'bits',d:'Easy',rel:['bits'],
 sum:'An array contains n distinct numbers from the range 0..n, so exactly one is missing. Find it.',
 ex:'[3, 0, 1] → 2',
 h:['The full range sums to n(n + 1) / 2; subtract the array’s sum.','XOR avoids any overflow concern.','XOR all indices 0..n with all values: every present number cancels, leaving the missing one.'],
 app:'Start with result = n, then XOR in each index i and each value nums[i]. Every number that is present appears twice (once as an index or n, once as a value) and cancels; the missing number appears only once.',
 tc:'O(n)',sc:'O(1)',
 py:`class Solution:
    def missingNumber(self, nums: list[int]) -> int:
        result = len(nums)
        for i, x in enumerate(nums):
            result ^= i ^ x            # present numbers cancel in pairs
        return result`,
 js:`function missingNumber(nums) {
  let result = nums.length;
  nums.forEach((x, i) => { result ^= i ^ x; });
  return result;
}`,
 java:`class Solution {
    public int missingNumber(int[] nums) {
        int result = nums.length;
        for (int i = 0; i < nums.length; i++) result ^= i ^ nums[i];
        return result;
    }
}`,
 cpp:`class Solution {
public:
    int missingNumber(vector<int>& nums) {
        int result = nums.size();
        for (int i = 0; i < (int)nums.size(); i++) result ^= i ^ nums[i];
        return result;
    }
};`});

P({n:371,s:'sum-of-two-integers',t:'Sum of Two Integers',c:'bits',d:'Medium',rel:['bits'],
 sum:'Return a + b without using the + or − operators.',
 ex:'a = 2, b = 3 → 5',
 h:['XOR adds bits without carrying.','AND finds the positions that produce a carry; shift it left by one.','Repeat “sum without carry” plus “carry” until the carry is zero.'],
 app:'Loop: carry = (a & b) << 1; a = a ^ b; b = carry; stop when b = 0. Languages with fixed 32-bit integers handle negatives automatically. Python’s integers are unbounded, so mask to 32 bits during the loop and convert the final result back to a signed value.',
 tc:'O(32)',sc:'O(1)',
 py:`class Solution:
    def getSum(self, a: int, b: int) -> int:
        MASK = 0xFFFFFFFF                      # emulate 32-bit integers
        a, b = a & MASK, b & MASK
        while b:
            a, b = (a ^ b) & MASK, ((a & b) << 1) & MASK   # sum without carry, then the carry
        return a if a <= 0x7FFFFFFF else ~(a ^ MASK)        # back to a signed value`,
 js:`function getSum(a, b) {
  while (b !== 0) {
    const carry = (a & b) << 1;     // JS bitwise ops work on 32-bit ints
    a ^= b;
    b = carry;
  }
  return a;
}`,
 java:`class Solution {
    public int getSum(int a, int b) {
        while (b != 0) {
            int carry = (a & b) << 1;
            a ^= b;
            b = carry;
        }
        return a;
    }
}`,
 cpp:`class Solution {
public:
    int getSum(int a, int b) {
        while (b != 0) {
            unsigned carry = (unsigned)(a & b) << 1;   // unsigned shift avoids UB on negatives
            a ^= b;
            b = (int)carry;
        }
        return a;
    }
};`});

P({n:7,s:'reverse-integer',t:'Reverse Integer',c:'bits',d:'Medium',rel:[],
 sum:'Reverse the digits of a signed 32-bit integer. If the result overflows the 32-bit range, return 0. Assume 64-bit integers aren’t available.',
 ex:'123 → 321 · −123 → −321 · 120 → 21',
 h:['Pop digits with % 10 and push them onto the result with × 10 + digit.','The danger is overflow on the push step.','Before pushing, check whether result is already beyond (2³¹ − 1) / 10 (or below −2³¹ / 10).'],
 app:'Repeatedly take the last digit (with sign, using truncating division) and append it to the result. Before each append, verify the result won’t exceed the 32-bit bounds; if it would, return 0. Python and JavaScript can simply build the number and compare against the bounds at the end.',
 tc:'O(log |x|)',sc:'O(1)',
 py:`class Solution:
    def reverse(self, x: int) -> int:
        sign = -1 if x < 0 else 1
        result = int(str(abs(x))[::-1]) * sign
        return result if -2**31 <= result <= 2**31 - 1 else 0`,
 js:`function reverse(x) {
  const sign = x < 0 ? -1 : 1;
  const result = sign * Number(String(Math.abs(x)).split("").reverse().join(""));
  return result < -(2 ** 31) || result > 2 ** 31 - 1 ? 0 : result;
}`,
 java:`class Solution {
    public int reverse(int x) {
        int result = 0;
        while (x != 0) {
            int digit = x % 10;                 // keeps the sign
            x /= 10;
            if (result > Integer.MAX_VALUE / 10 || result < Integer.MIN_VALUE / 10) return 0;
            result = result * 10 + digit;
        }
        return result;
    }
}`,
 cpp:`class Solution {
public:
    int reverse(int x) {
        int result = 0;
        while (x != 0) {
            int digit = x % 10;                 // keeps the sign
            x /= 10;
            if (result > INT_MAX / 10 || result < INT_MIN / 10) return 0;
            result = result * 10 + digit;
        }
        return result;
    }
};`});
