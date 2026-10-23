/* ===== Library part C: DP, greedy, backtracking, math & bits ===== */
Object.assign(ALGOS,{

memo:{name:'Memoization & tabulation',cat:'dp',
 blurb:'Dynamic programming in its simplest form: solve each overlapping subproblem once, either top-down with a cache or bottom-up with a table.',
 cx:[['Naive recursion','O(2ⁿ)','fib(n) recomputes the same values exponentially often'],['Memoized (top-down)','O(n) time, O(n) space','Cache plus recursion stack'],['Tabulated (bottom-up)','O(n) time','Fill from the base cases upward'],['Rolling variables','O(1) space','Keep only the last two values']],
 pts:['DP applies when a problem has overlapping subproblems and optimal substructure.','Top-down: write the recursion, then cache results. Easiest to get right.','Bottom-up: order subproblems so dependencies come first. No recursion depth limit.','Steps for any DP: define the state, write the recurrence, set base cases, choose the evaluation order.'],
 pseudo:['procedure fibMemo(n)   // top-down','  if n < 2: return n','  if n in cache: return cache[n]','  cache[n] ← fibMemo(n − 1) + fibMemo(n − 2)','  return cache[n]','procedure fibTab(n)     // bottom-up, O(1) space','  a ← 0; b ← 1','  repeat n times: (a, b) ← (b, a + b)','  return a'],
 trace:[[0,'Naive fib(5) calls fib(3) twice and fib(2) three times; fib(40) makes over 300 million calls.'],[3,'With a cache, fib(5) computes fib(4), fib(3), fib(2), fib(1), fib(0) once each.'],[7,'Bottom-up: (0, 1) → (1, 1) → (1, 2) → (2, 3) → (3, 5) → (5, 8).'],[8,'After 5 steps a = 5 = fib(5). fib(40) = 102,334,155 in 40 steps.']],
 q:{q:'What two properties make a problem suitable for dynamic programming?',o:['Sorted input and small values','Overlapping subproblems and optimal substructure','Recursion and a hash map','Greedy choice and a heap'],a:1,why:'Subproblems repeat (so caching helps), and the best answer is built from best answers to subproblems.'},
 code:{
python:`from functools import lru_cache

@lru_cache(maxsize=None)
def fib_memo(n):                 # top-down
    return n if n < 2 else fib_memo(n - 1) + fib_memo(n - 2)

def fib_tab(n):                  # bottom-up, O(1) space
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

print(fib_memo(40), fib_tab(40))   # 102334155 102334155`,
javascript:`function fibMemo(n, cache = new Map()) {      // top-down
  if (n < 2) return n;
  if (!cache.has(n)) cache.set(n, fibMemo(n - 1, cache) + fibMemo(n - 2, cache));
  return cache.get(n);
}

function fibTab(n) {                            // bottom-up, O(1) space
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}

console.log(fibMemo(40), fibTab(40)); // 102334155 102334155`,
java:`import java.util.HashMap;
import java.util.Map;

public class Fibonacci {
    static final Map<Integer, Long> cache = new HashMap<>();

    static long fibMemo(int n) {                 // top-down
        if (n < 2) return n;
        Long hit = cache.get(n);
        if (hit != null) return hit;
        long v = fibMemo(n - 1) + fibMemo(n - 2);
        cache.put(n, v);
        return v;
    }

    static long fibTab(int n) {                  // bottom-up, O(1) space
        long a = 0, b = 1;
        for (int i = 0; i < n; i++) { long t = a + b; a = b; b = t; }
        return a;
    }

    public static void main(String[] args) {
        System.out.println(fibMemo(40) + " " + fibTab(40)); // 102334155 102334155
    }
}`,
cpp:`#include <iostream>
#include <unordered_map>

long long fibMemo(int n, std::unordered_map<int, long long>& cache) {   // top-down
    if (n < 2) return n;
    auto it = cache.find(n);
    if (it != cache.end()) return it->second;
    return cache[n] = fibMemo(n - 1, cache) + fibMemo(n - 2, cache);
}

long long fibTab(int n) {                                               // bottom-up
    long long a = 0, b = 1;
    for (int i = 0; i < n; i++) { long long t = a + b; a = b; b = t; }
    return a;
}

int main() {
    std::unordered_map<int, long long> cache;
    std::cout << fibMemo(40, cache) << ' ' << fibTab(40);   // 102334155 102334155
}`}},

knapsack:{name:'0/1 knapsack',cat:'dp',
 blurb:'Choose items with weights and values to maximize total value without exceeding a capacity, where each item is taken at most once.',
 cx:[['Time','O(n · W)','n items, capacity W'],['Extra space','O(W)','One row, filled right to left'],['Full table','O(n · W) space','Needed if you must reconstruct the chosen items'],['Note','Pseudo-polynomial','Polynomial in W’s value, not its number of bits']],
 pts:['State: dp[c] = best value achievable with capacity c using the items seen so far.','For each item, either skip it or take it: dp[c] = max(dp[c], dp[c − w] + v).','Loop capacity downward so each item is used at most once. Looping upward gives the unbounded version.','NeetCode relatives: Partition Equal Subset Sum, Target Sum, Coin Change II (unbounded).'],
 pseudo:['procedure knapsack(weights, values, W)','  dp[0..W] ← 0','  for each item (w, v)','    for c ← W down to w   // backwards: item used once','      dp[c] ← max(dp[c], dp[c − w] + v)','  return dp[W]'],
 trace:[[0,'Items (weight, value): (1, 1), (3, 4), (4, 5), (5, 7). Capacity 7.'],[4,'After item (1, 1): every capacity ≥ 1 is worth 1.'],[4,'After (3, 4): dp[3] = 4, dp[4..7] = 5 (both items).'],[4,'After (4, 5): dp[7] = dp[3] + 5 = 9 (items of weight 3 and 4).'],[4,'After (5, 7): dp[7] stays 9 because 7 + dp[2] = 8 < 9.'],[5,'Answer: 9.']],
 q:{q:'Why does the inner loop run from W down to w?',o:['It is faster','So dp[c − w] still refers to the previous item’s row, using each item at most once','To handle negative weights','It doesn’t matter'],a:1,why:'Going upward would let dp[c − w] already include the current item, allowing it to be taken repeatedly.'},
 code:{
python:`def knapsack(weights, values, capacity):
    dp = [0] * (capacity + 1)                 # dp[c] = best value with capacity c
    for w, v in zip(weights, values):
        for c in range(capacity, w - 1, -1):  # backwards: each item used once
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[capacity]

print(knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7))   # 9`,
javascript:`function knapsack(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0);
  weights.forEach((w, i) => {
    for (let c = capacity; c >= w; c--) dp[c] = Math.max(dp[c], dp[c - w] + values[i]);
  });
  return dp[capacity];
}

console.log(knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7)); // 9`,
java:`public class Knapsack {
    static int knapsack(int[] weights, int[] values, int capacity) {
        int[] dp = new int[capacity + 1];
        for (int i = 0; i < weights.length; i++)
            for (int c = capacity; c >= weights[i]; c--)
                dp[c] = Math.max(dp[c], dp[c - weights[i]] + values[i]);
        return dp[capacity];
    }

    public static void main(String[] args) {
        System.out.println(knapsack(new int[]{1, 3, 4, 5}, new int[]{1, 4, 5, 7}, 7)); // 9
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <algorithm>

int knapsack(const std::vector<int>& w, const std::vector<int>& v, int capacity) {
    std::vector<int> dp(capacity + 1, 0);
    for (size_t i = 0; i < w.size(); i++)
        for (int c = capacity; c >= w[i]; c--)
            dp[c] = std::max(dp[c], dp[c - w[i]] + v[i]);
    return dp[capacity];
}

int main() {
    std::cout << knapsack({1, 3, 4, 5}, {1, 4, 5, 7}, 7);   // 9
}`}},

lcs:{name:'Longest common subsequence',cat:'dp',
 blurb:'Find the length of the longest sequence of characters that appears in both strings in order, not necessarily contiguously.',
 cx:[['Time','O(m · n)','Fill an (m + 1) × (n + 1) table'],['Extra space','O(m · n)','O(min(m, n)) with two rows'],['Brute force','O(2ᵐ · n)','Every subsequence of one string'],['Used in','diff, git, DNA alignment','']],
 pts:['dp[i][j] = LCS length of the first i characters of a and the first j characters of b.','If the last characters match, extend the diagonal: dp[i−1][j−1] + 1.','Otherwise drop one character from either string: max(dp[i−1][j], dp[i][j−1]).','Walk back through the table from dp[m][n] to recover the actual subsequence.'],
 pseudo:['procedure lcs(a, b)','  dp[0..m][0..n] ← 0','  for i ← 1 to m','    for j ← 1 to n','      if a[i−1] = b[j−1]: dp[i][j] ← dp[i−1][j−1] + 1','      else: dp[i][j] ← max(dp[i−1][j], dp[i][j−1])','  return dp[m][n]'],
 trace:[[1,'a = “ABCBDAB”, b = “BDCABA”. Row 0 and column 0 are 0 (empty prefixes).'],[4,'a[1] = “B” matches b[0] = “B”: dp[2][1] = dp[1][0] + 1 = 1.'],[5,'Mismatches copy the better neighbor, so lengths never decrease along a row or column.'],[6,'dp[7][6] = 4. One LCS is “BCBA”; “BDAB” is another.']],
 q:{q:'If a[i−1] ≠ b[j−1], dp[i][j] equals…',o:['0','dp[i−1][j−1]','max(dp[i−1][j], dp[i][j−1])','dp[i−1][j−1] + 1'],a:2,why:'At least one of the two last characters isn’t in the LCS, so drop one and take the better result.'},
 code:{
python:`def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]

print(lcs("ABCBDAB", "BDCABA"))   # 4`,
javascript:`function lcs(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp[m][n];
}

console.log(lcs("ABCBDAB", "BDCABA")); // 4`,
java:`public class LCS {
    static int lcs(String a, String b) {
        int m = a.length(), n = b.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1)
                        ? dp[i - 1][j - 1] + 1
                        : Math.max(dp[i - 1][j], dp[i][j - 1]);
        return dp[m][n];
    }

    public static void main(String[] args) {
        System.out.println(lcs("ABCBDAB", "BDCABA")); // 4
    }
}`,
cpp:`#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

int lcs(const std::string& a, const std::string& b) {
    int m = a.size(), n = b.size();
    std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = a[i - 1] == b[j - 1] ? dp[i - 1][j - 1] + 1 : std::max(dp[i - 1][j], dp[i][j - 1]);
    return dp[m][n];
}

int main() {
    std::cout << lcs("ABCBDAB", "BDCABA");   // 4
}`}},

lis:{name:'Longest increasing subsequence',cat:'dp',
 blurb:'Find the length of the longest strictly increasing subsequence, using “patience sorting” with binary search for O(n log n).',
 cx:[['Patience method','O(n log n)','Binary search per element'],['Classic DP','O(n²)','dp[i] = 1 + max dp[j] for j < i with a[j] < a[i]'],['Extra space','O(n)','tails array'],['Note','tails is not the LIS itself','Only its length is guaranteed correct']],
 pts:['tails[k] = the smallest possible last value of an increasing subsequence of length k + 1.','tails stays sorted, so binary search finds where each new value belongs.','A bigger value than every tail extends the longest run; otherwise it replaces a tail, keeping options open.','For non-decreasing subsequences, use upper bound instead of lower bound.'],
 pseudo:['procedure lis(A)','  tails ← empty','  for each x in A','    i ← first index with tails[i] ≥ x   // binary search','    if i = |tails|: append x   // extends the longest run','    else: tails[i] ← x          // a smaller tail for length i + 1','  return |tails|'],
 trace:[[1,'A = [10, 9, 2, 5, 3, 7, 101, 18].'],[5,'10 → [10]. 9 replaces 10 → [9]. 2 replaces 9 → [2].'],[4,'5 extends → [2, 5]. 3 replaces 5 → [2, 3].'],[4,'7 extends → [2, 3, 7]. 101 extends → [2, 3, 7, 101].'],[6,'18 replaces 101 → [2, 3, 7, 18]. Length 4.']],
 q:{q:'Is the final tails array always a real increasing subsequence of A?',o:['Yes, always','No: only its length is guaranteed; its values may come from different subsequences','Only if A is sorted','Only if A has no duplicates'],a:1,why:'Replacements can mix values from different candidate runs; the length is still exactly right.'},
 code:{
python:`from bisect import bisect_left

def lis(a):
    tails = []          # tails[k] = smallest tail of an increasing run of length k + 1
    for x in a:
        i = bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)

print(lis([10, 9, 2, 5, 3, 7, 101, 18]))   # 4`,
javascript:`function lis(a) {
  const tails = [];
  for (const x of a) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {                     // first tail >= x
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1; else hi = mid;
    }
    tails[lo] = x;                        // appends when lo === tails.length
  }
  return tails.length;
}

console.log(lis([10, 9, 2, 5, 3, 7, 101, 18])); // 4`,
java:`public class LIS {
    static int lis(int[] a) {
        int[] tails = new int[a.length];
        int size = 0;
        for (int x : a) {
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

    public static void main(String[] args) {
        System.out.println(lis(new int[]{10, 9, 2, 5, 3, 7, 101, 18})); // 4
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <algorithm>

int lis(const std::vector<int>& a) {
    std::vector<int> tails;
    for (int x : a) {
        auto it = std::lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    return tails.size();
}

int main() {
    std::cout << lis({10, 9, 2, 5, 3, 7, 101, 18});   // 4
}`}},

coinchange:{name:'Coin change (fewest coins)',cat:'dp',
 blurb:'Find the fewest coins that add up to an amount, with unlimited coins of each denomination. A classic case where greedy fails and DP succeeds.',
 cx:[['Time','O(amount · k)','k = number of coin types'],['Extra space','O(amount)','dp array'],['Greedy','Not always optimal','Fails for coins like {1, 5, 6, 9}'],['Count the ways instead','Same complexity','Coin Change II: loop coins outside, amounts inside']],
 pts:['dp[a] = fewest coins to make amount a; dp[0] = 0.','dp[a] = 1 + min over coins c ≤ a of dp[a − c].','Use amount + 1 as “infinity” so the impossible case is easy to detect.','Greedy (largest coin first) only works for canonical systems such as real currencies.'],
 pseudo:['procedure coinChange(coins, amount)','  dp[0] ← 0; dp[1..amount] ← ∞','  for a ← 1 to amount','    for each coin c ≤ a','      dp[a] ← min(dp[a], dp[a − c] + 1)','  return dp[amount] if finite else −1'],
 trace:[[0,'Coins {1, 5, 6, 9}, amount 11. Greedy picks 9 + 1 + 1 = 3 coins.'],[4,'dp[1..4] = 1..4 (ones only). dp[5] = 1, dp[6] = 1, dp[9] = 1.'],[4,'dp[10] = min(dp[9] + 1, dp[5] + 1, dp[4] + 1) = 2 (5 + 5).'],[4,'dp[11] = min(dp[10] + 1, dp[6] + 1 (5 + 6), dp[5] + 1, dp[2] + 1) = 2.'],[5,'Answer: 2 coins (5 + 6), beating greedy.']],
 q:{q:'Coins {1, 3, 4}, amount 6. How many coins does the greedy method use, and what is optimal?',o:['Greedy 2, optimal 2','Greedy 3, optimal 2','Greedy 3, optimal 3','Greedy 4, optimal 2'],a:1,why:'Greedy takes 4 + 1 + 1 = 3 coins; the optimum is 3 + 3 = 2 coins.'},
 code:{
python:`def coin_change(coins, amount):
    INF = amount + 1
    dp = [0] + [INF] * amount          # dp[a] = fewest coins for amount a
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] <= amount else -1

print(coin_change([1, 5, 6, 9], 11))   # 2  (5 + 6; greedy would pick 9 + 1 + 1)`,
javascript:`function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(amount + 1);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++)
    for (const c of coins) if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
  return dp[amount] > amount ? -1 : dp[amount];
}

console.log(coinChange([1, 5, 6, 9], 11)); // 2`,
java:`import java.util.Arrays;

public class CoinChange {
    static int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++)
            for (int c : coins) if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
        return dp[amount] > amount ? -1 : dp[amount];
    }

    public static void main(String[] args) {
        System.out.println(coinChange(new int[]{1, 5, 6, 9}, 11)); // 2
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <algorithm>

int coinChange(const std::vector<int>& coins, int amount) {
    std::vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int a = 1; a <= amount; a++)
        for (int c : coins) if (c <= a) dp[a] = std::min(dp[a], dp[a - c] + 1);
    return dp[amount] > amount ? -1 : dp[amount];
}

int main() {
    std::cout << coinChange({1, 5, 6, 9}, 11);   // 2
}`}},

editdistance:{name:'Edit distance (Levenshtein)',cat:'dp',
 blurb:'The minimum number of single-character inserts, deletes and replacements needed to turn one string into another.',
 cx:[['Time','O(m · n)',''],['Extra space','O(n)','Two rows of the table'],['Full table','O(m · n)','Needed to recover the actual edits'],['Used in','Spell checkers, DNA, fuzzy search','']],
 pts:['dp[i][j] = edits to turn the first i characters of a into the first j characters of b.','Base cases: turning i characters into nothing takes i deletes; nothing into j characters takes j inserts.','Matching last characters cost nothing: copy the diagonal.','Otherwise 1 + the minimum of delete (up), insert (left) and replace (diagonal).'],
 pseudo:['procedure editDistance(a, b)','  dp[i][0] ← i; dp[0][j] ← j','  for i ← 1 to m, j ← 1 to n','    if a[i−1] = b[j−1]: dp[i][j] ← dp[i−1][j−1]','    else: dp[i][j] ← 1 + min(dp[i−1][j],    // delete','                             dp[i][j−1],    // insert','                             dp[i−1][j−1])  // replace','  return dp[m][n]'],
 trace:[[1,'“kitten” → “sitting”. First row 0..7, first column 0..6.'],[4,'k vs s: replace (1). The shared “itt” copies the diagonal for free.'],[4,'e vs i: replace (2). n matches n.'],[5,'Finally insert g (3).'],[7,'Distance 3: kitten → sitten → sittin → sitting.']],
 q:{q:'In the edit distance table, moving diagonally when characters differ means…',o:['Insert','Delete','Replace','Match'],a:2,why:'Both strings lose their last character, and one replacement makes them equal.'},
 code:{
python:`def edit_distance(a, b):
    m, n = len(a), len(b)
    prev = list(range(n + 1))
    for i in range(1, m + 1):
        cur = [i] + [0] * n
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]
            else:
                cur[j] = 1 + min(prev[j],      # delete
                                 cur[j - 1],   # insert
                                 prev[j - 1])  # replace
        prev = cur
    return prev[n]

print(edit_distance("kitten", "sitting"))   # 3`,
javascript:`function editDistance(a, b) {
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++)
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] : 1 + Math.min(prev[j], cur[j - 1], prev[j - 1]);
    prev = cur;
  }
  return prev[n];
}

console.log(editDistance("kitten", "sitting")); // 3`,
java:`public class EditDistance {
    static int editDistance(String a, String b) {
        int m = a.length(), n = b.length();
        int[] prev = new int[n + 1];
        for (int j = 0; j <= n; j++) prev[j] = j;
        for (int i = 1; i <= m; i++) {
            int[] cur = new int[n + 1];
            cur[0] = i;
            for (int j = 1; j <= n; j++)
                cur[j] = a.charAt(i - 1) == b.charAt(j - 1)
                        ? prev[j - 1]
                        : 1 + Math.min(prev[j], Math.min(cur[j - 1], prev[j - 1]));
            prev = cur;
        }
        return prev[n];
    }

    public static void main(String[] args) {
        System.out.println(editDistance("kitten", "sitting")); // 3
    }
}`,
cpp:`#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

int editDistance(const std::string& a, const std::string& b) {
    int m = a.size(), n = b.size();
    std::vector<int> prev(n + 1), cur(n + 1);
    for (int j = 0; j <= n; j++) prev[j] = j;
    for (int i = 1; i <= m; i++) {
        cur[0] = i;
        for (int j = 1; j <= n; j++)
            cur[j] = a[i - 1] == b[j - 1] ? prev[j - 1] : 1 + std::min({prev[j], cur[j - 1], prev[j - 1]});
        std::swap(prev, cur);
    }
    return prev[n];
}

int main() {
    std::cout << editDistance("kitten", "sitting");   // 3
}`}},

intervals:{name:'Interval scheduling (greedy)',cat:'greedy',
 blurb:'Pick the most non-overlapping intervals by always choosing the one that finishes first. A clean example of a provably correct greedy algorithm.',
 cx:[['Time','O(n log n)','Sorting dominates'],['Extra space','O(1)','Besides the sort'],['Correctness','Exchange argument','Earliest finish never blocks a better choice'],['Related','Minimum removals = n − max kept','Non-overlapping Intervals']],
 pts:['Sort by end time, then take every interval that starts after the last chosen one ends.','Sorting by start time or by length does not work; try counterexamples.','To merge overlapping intervals instead, sort by start and extend the current end.','To count rooms needed (Meeting Rooms II), sweep start and end times or use a min-heap of end times.'],
 pseudo:['procedure maxNonOverlapping(intervals)','  sort intervals by end time','  count ← 0; lastEnd ← −∞','  for each (s, e) in order','    if s ≥ lastEnd   // compatible with everything chosen','      count ← count + 1; lastEnd ← e','  return count'],
 trace:[[1,'Sorted by end: (1,4) (3,5) (0,6) (5,7) (3,9) (5,9) (6,10) (8,11) (8,12) (2,14) (12,16).'],[5,'Take (1,4). lastEnd = 4.'],[4,'(3,5) and (0,6) start before 4: skip. Take (5,7). lastEnd = 7.'],[5,'Skip until (8,11): take it. Then skip to (12,16): take it.'],[6,'4 intervals: (1,4), (5,7), (8,11), (12,16).']],
 q:{q:'Why sort by end time rather than start time?',o:['It is faster to sort','The interval that ends first leaves the most room for the rest','Start times can be negative','Ends are always unique'],a:1,why:'Choosing the earliest finish can be swapped into any optimal solution without making it worse.'},
 code:{
python:`def max_non_overlapping(intervals):
    count, end = 0, float("-inf")
    for s, e in sorted(intervals, key=lambda iv: iv[1]):   # earliest finish first
        if s >= end:
            count += 1
            end = e
    return count

jobs = [(1, 4), (3, 5), (0, 6), (5, 7), (3, 9), (5, 9), (6, 10), (8, 11), (8, 12), (2, 14), (12, 16)]
print(max_non_overlapping(jobs))   # 4`,
javascript:`function maxNonOverlapping(intervals) {
  let count = 0, end = -Infinity;
  for (const [s, e] of [...intervals].sort((a, b) => a[1] - b[1])) {
    if (s >= end) { count++; end = e; }
  }
  return count;
}

const jobs = [[1, 4], [3, 5], [0, 6], [5, 7], [3, 9], [5, 9], [6, 10], [8, 11], [8, 12], [2, 14], [12, 16]];
console.log(maxNonOverlapping(jobs)); // 4`,
java:`import java.util.Arrays;

public class IntervalScheduling {
    static int maxNonOverlapping(int[][] intervals) {
        int[][] sorted = intervals.clone();
        Arrays.sort(sorted, (a, b) -> Integer.compare(a[1], b[1]));
        int count = 0;
        long end = Long.MIN_VALUE;
        for (int[] iv : sorted) {
            if (iv[0] >= end) { count++; end = iv[1]; }
        }
        return count;
    }

    public static void main(String[] args) {
        int[][] jobs = {{1, 4}, {3, 5}, {0, 6}, {5, 7}, {3, 9}, {5, 9}, {6, 10}, {8, 11}, {8, 12}, {2, 14}, {12, 16}};
        System.out.println(maxNonOverlapping(jobs)); // 4
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <algorithm>
#include <climits>

int maxNonOverlapping(std::vector<std::pair<int, int>> iv) {
    std::sort(iv.begin(), iv.end(), [](auto& a, auto& b) { return a.second < b.second; });
    int count = 0;
    long long end = LLONG_MIN;
    for (auto [s, e] : iv) if (s >= end) { count++; end = e; }
    return count;
}

int main() {
    std::cout << maxNonOverlapping({{1, 4}, {3, 5}, {0, 6}, {5, 7}, {3, 9}, {5, 9},
                                    {6, 10}, {8, 11}, {8, 12}, {2, 14}, {12, 16}});   // 4
}`}},

subsets:{name:'Subsets (backtracking)',cat:'backtracking',
 blurb:'Generate every subset by making one include-or-skip decision per element, undoing each choice after exploring it.',
 cx:[['Time','O(n · 2ⁿ)','2ⁿ subsets, each copied in O(n)'],['Extra space','O(n)','Recursion depth and current path (output excluded)'],['Output size','2ⁿ','n = 20 already gives ~1 million'],['Alternative','Bitmasks','Subset i contains element j if bit j of i is set']],
 pts:['Backtracking template: choose, explore, un-choose.','The recursion forms a binary decision tree with 2ⁿ leaves.','Copy the current path when recording it; it keeps changing afterwards.','With duplicates (Subsets II), sort first and skip equal values at the same depth.'],
 pseudo:['procedure backtrack(i)','  if i = n: record a copy of path; return','  path.push(nums[i])   // choice 1: include','  backtrack(i + 1)','  path.pop()           // undo','  backtrack(i + 1)     // choice 2: skip'],
 trace:[[0,'nums = [1, 2, 3]. Each level decides one element.'],[2,'Include 1, include 2, include 3 → record [1, 2, 3].'],[4,'Undo 3, skip it → record [1, 2]. Undo 2, then include 3 → [1, 3]; skip → [1].'],[5,'Undo 1 and skip it: the same process records [2, 3], [2], [3], [].'],[1,'8 subsets in total, which is 2³.']],
 q:{q:'Why must you append a copy of path rather than path itself?',o:['Copies are faster','path keeps changing as the search continues, so every stored reference would end up identical','To sort it','Python requires it'],a:1,why:'All recorded entries would point to the same list, which ends up empty.'},
 code:{
python:`def subsets(nums):
    res, cur = [], []

    def backtrack(i):
        if i == len(nums):
            res.append(cur[:])        # record a copy
            return
        cur.append(nums[i])           # choice 1: include nums[i]
        backtrack(i + 1)
        cur.pop()                     # undo
        backtrack(i + 1)              # choice 2: skip nums[i]

    backtrack(0)
    return res

print(subsets([1, 2, 3]))   # [[1, 2, 3], [1, 2], [1, 3], [1], [2, 3], [2], [3], []]`,
javascript:`function subsets(nums) {
  const res = [], cur = [];
  const backtrack = i => {
    if (i === nums.length) { res.push([...cur]); return; }
    cur.push(nums[i]);       // include
    backtrack(i + 1);
    cur.pop();               // undo
    backtrack(i + 1);        // skip
  };
  backtrack(0);
  return res;
}

console.log(JSON.stringify(subsets([1, 2, 3])));
// [[1,2,3],[1,2],[1,3],[1],[2,3],[2],[3],[]]`,
java:`import java.util.*;

public class Subsets {
    static void backtrack(int[] nums, int i, Deque<Integer> cur, List<List<Integer>> res) {
        if (i == nums.length) { res.add(new ArrayList<>(cur)); return; }
        cur.addLast(nums[i]);            // include
        backtrack(nums, i + 1, cur, res);
        cur.removeLast();                // undo
        backtrack(nums, i + 1, cur, res); // skip
    }

    public static void main(String[] args) {
        List<List<Integer>> res = new ArrayList<>();
        backtrack(new int[]{1, 2, 3}, 0, new ArrayDeque<>(), res);
        System.out.println(res); // [[1, 2, 3], [1, 2], [1, 3], [1], [2, 3], [2], [3], []]
    }
}`,
cpp:`#include <iostream>
#include <vector>

void backtrack(const std::vector<int>& nums, size_t i, std::vector<int>& cur,
               std::vector<std::vector<int>>& res) {
    if (i == nums.size()) { res.push_back(cur); return; }
    cur.push_back(nums[i]);          // include
    backtrack(nums, i + 1, cur, res);
    cur.pop_back();                  // undo
    backtrack(nums, i + 1, cur, res); // skip
}

int main() {
    std::vector<std::vector<int>> res;
    std::vector<int> cur;
    backtrack({1, 2, 3}, 0, cur, res);
    for (auto& s : res) {
        std::cout << '{';
        for (size_t k = 0; k < s.size(); k++) std::cout << (k ? "," : "") << s[k];
        std::cout << "} ";
    }
    // {1,2,3} {1,2} {1,3} {1} {2,3} {2} {3} {}
}`}},

permutations:{name:'Permutations (backtracking)',cat:'backtracking',
 blurb:'Generate every ordering by fixing one position at a time: swap each remaining candidate into place, recurse, then swap back.',
 cx:[['Time','O(n · n!)','n! orderings, each copied in O(n)'],['Extra space','O(n)','Recursion depth (output excluded)'],['Output size','n!','10! = 3,628,800'],['Duplicates','Use a “used” array + sorting','Skip equal values at the same depth']],
 pts:['Position start is chosen from the elements in nums[start..n−1].','Swapping in place avoids a separate “used” array.','The swap back (undo) restores the array for the next choice.','Other versions build a path and mark used elements; that version handles duplicates more easily.'],
 pseudo:['procedure permute(start)','  if start = n: record a copy of nums; return','  for i ← start to n − 1','    swap(nums[start], nums[i])   // choose','    permute(start + 1)','    swap(nums[start], nums[i])   // undo'],
 trace:[[0,'nums = [1, 2, 3].'],[3,'Position 0 keeps 1. Position 1 keeps 2 → [1, 2, 3]; swaps in 3 → [1, 3, 2].'],[5,'Undo, then put 2 at position 0 → [2, 1, 3] and [2, 3, 1].'],[3,'Put 3 at position 0 → [3, 2, 1] and [3, 1, 2].'],[1,'6 permutations = 3!.']],
 q:{q:'How many permutations does [1, 2, 3, 4] have?',o:['16','24','12','4'],a:1,why:'4! = 4 × 3 × 2 × 1 = 24.'},
 code:{
python:`def permutations(nums):
    res = []

    def backtrack(start):
        if start == len(nums):
            res.append(nums[:])
            return
        for i in range(start, len(nums)):
            nums[start], nums[i] = nums[i], nums[start]   # choose
            backtrack(start + 1)
            nums[start], nums[i] = nums[i], nums[start]   # undo

    backtrack(0)
    return res

print(permutations([1, 2, 3]))
# [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 2, 1], [3, 1, 2]]`,
javascript:`function permutations(nums) {
  const res = [];
  const backtrack = start => {
    if (start === nums.length) { res.push([...nums]); return; }
    for (let i = start; i < nums.length; i++) {
      [nums[start], nums[i]] = [nums[i], nums[start]];   // choose
      backtrack(start + 1);
      [nums[start], nums[i]] = [nums[i], nums[start]];   // undo
    }
  };
  backtrack(0);
  return res;
}

console.log(JSON.stringify(permutations([1, 2, 3])));
// [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,2,1],[3,1,2]]`,
java:`import java.util.*;

public class Permutations {
    static void backtrack(int[] nums, int start, List<List<Integer>> res) {
        if (start == nums.length) {
            List<Integer> p = new ArrayList<>();
            for (int x : nums) p.add(x);
            res.add(p);
            return;
        }
        for (int i = start; i < nums.length; i++) {
            swap(nums, start, i);          // choose
            backtrack(nums, start + 1, res);
            swap(nums, start, i);          // undo
        }
    }

    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    public static void main(String[] args) {
        List<List<Integer>> res = new ArrayList<>();
        backtrack(new int[]{1, 2, 3}, 0, res);
        System.out.println(res); // [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 2, 1], [3, 1, 2]]
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <utility>

void backtrack(std::vector<int>& nums, size_t start, std::vector<std::vector<int>>& res) {
    if (start == nums.size()) { res.push_back(nums); return; }
    for (size_t i = start; i < nums.size(); i++) {
        std::swap(nums[start], nums[i]);   // choose
        backtrack(nums, start + 1, res);
        std::swap(nums[start], nums[i]);   // undo
    }
}

int main() {
    std::vector<int> nums = {1, 2, 3};
    std::vector<std::vector<int>> res;
    backtrack(nums, 0, res);
    for (auto& p : res) std::cout << p[0] << p[1] << p[2] << ' ';   // 123 132 213 231 321 312
}`}},

nqueens:{name:'N-Queens',cat:'backtracking',
 blurb:'Place n queens on an n × n board so none attack each other, one row at a time, pruning any square already under attack.',
 cx:[['Time','O(n!) worst case','Pruning makes it far faster in practice'],['Extra space','O(n)','Column and diagonal sets'],['Solutions for n = 8','92',''],['Check per square','O(1)','Sets for columns and both diagonals']],
 pts:['One queen per row, so only choose a column for each row.','Squares on the same “\\” diagonal share r − c; on the same “/” diagonal they share r + c.','Pruning (skipping attacked squares) is what makes backtracking practical.','The same skeleton solves Sudoku and other constraint puzzles.'],
 pseudo:['procedure place(r)','  if r = n: count a solution; return','  for c ← 0 to n − 1','    if column c or diagonal r − c or r + c is taken: skip','    mark c, r − c, r + c','    place(r + 1)','    unmark c, r − c, r + c   // backtrack'],
 trace:[[0,'n = 4. Row 0: try column 0.'],[3,'Row 1: columns 0 and 1 are attacked; try column 2. Row 2: every column is attacked, so backtrack.'],[6,'Row 1: try column 3. Row 2: column 1 works. Row 3: everything attacked; backtrack all the way to row 0.'],[5,'Row 0 column 1 → row 1 column 3 → row 2 column 0 → row 3 column 2. A solution.'],[1,'4 × 4 has 2 solutions; 8 × 8 has 92.']],
 q:{q:'Two queens at (r1, c1) and (r2, c2) are on the same “/” anti-diagonal when…',o:['r1 = r2','c1 = c2','r1 − c1 = r2 − c2','r1 + c1 = r2 + c2'],a:3,why:'Moving along an anti-diagonal increases r by 1 and decreases c by 1, keeping r + c constant.'},
 code:{
python:`def n_queens(n):
    cols, diag1, diag2 = set(), set(), set()
    count = 0

    def place(r):
        nonlocal count
        if r == n:
            count += 1
            return
        for c in range(n):
            if c in cols or r - c in diag1 or r + c in diag2:
                continue                              # attacked: prune
            cols.add(c); diag1.add(r - c); diag2.add(r + c)
            place(r + 1)
            cols.remove(c); diag1.remove(r - c); diag2.remove(r + c)

    place(0)
    return count

print(n_queens(8))   # 92`,
javascript:`function nQueens(n) {
  const cols = new Set(), d1 = new Set(), d2 = new Set();
  let count = 0;
  const place = r => {
    if (r === n) { count++; return; }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) continue;   // attacked
      cols.add(c); d1.add(r - c); d2.add(r + c);
      place(r + 1);
      cols.delete(c); d1.delete(r - c); d2.delete(r + c);
    }
  };
  place(0);
  return count;
}

console.log(nQueens(8)); // 92`,
java:`public class NQueens {
    static int n, count;
    static boolean[] cols, d1, d2;

    static void place(int r) {
        if (r == n) { count++; return; }
        for (int c = 0; c < n; c++) {
            if (cols[c] || d1[r - c + n - 1] || d2[r + c]) continue;   // attacked
            cols[c] = d1[r - c + n - 1] = d2[r + c] = true;
            place(r + 1);
            cols[c] = d1[r - c + n - 1] = d2[r + c] = false;
        }
    }

    static int solve(int size) {
        n = size; count = 0;
        cols = new boolean[n]; d1 = new boolean[2 * n - 1]; d2 = new boolean[2 * n - 1];
        place(0);
        return count;
    }

    public static void main(String[] args) {
        System.out.println(solve(8)); // 92
    }
}`,
cpp:`#include <iostream>
#include <vector>

int n, solutions;
std::vector<bool> cols, d1, d2;

void place(int r) {
    if (r == n) { solutions++; return; }
    for (int c = 0; c < n; c++) {
        if (cols[c] || d1[r - c + n - 1] || d2[r + c]) continue;   // attacked
        cols[c] = d1[r - c + n - 1] = d2[r + c] = true;
        place(r + 1);
        cols[c] = d1[r - c + n - 1] = d2[r + c] = false;
    }
}

int main() {
    n = 8;
    cols.assign(n, false); d1.assign(2 * n - 1, false); d2.assign(2 * n - 1, false);
    place(0);
    std::cout << solutions;   // 92
}`}},

gcd:{name:'Euclid’s GCD',cat:'math',
 blurb:'The greatest common divisor of two numbers, found by repeatedly replacing the larger number with the remainder.',
 cx:[['Time','O(log min(a, b))','Remainders shrink at least by half every two steps'],['Extra space','O(1)','Iterative'],['LCM','a / gcd(a, b) × b','Divide first to avoid overflow'],['Extended Euclid','Same time','Also finds x, y with ax + by = gcd']],
 pts:['gcd(a, b) = gcd(b, a mod b), and gcd(a, 0) = a.','One of the oldest algorithms still in daily use (around 300 BC).','The extended version computes modular inverses, which RSA needs.','Python, Java (BigInteger), and C++17 (std::gcd) all ship one.'],
 pseudo:['procedure gcd(a, b)','  while b ≠ 0','    (a, b) ← (b, a mod b)','  return a','procedure lcm(a, b)','  return a / gcd(a, b) × b'],
 trace:[[0,'gcd(252, 105).'],[2,'252 mod 105 = 42 → (105, 42).'],[2,'105 mod 42 = 21 → (42, 21).'],[2,'42 mod 21 = 0 → (21, 0).'],[3,'Answer 21. And lcm(4, 6) = 4 / 2 × 6 = 12.']],
 q:{q:'gcd(48, 18) = ?',o:['3','6','9','18'],a:1,why:'48 mod 18 = 12, 18 mod 12 = 6, 12 mod 6 = 0 → 6.'},
 code:{
python:`def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

def lcm(a, b):
    return a // gcd(a, b) * b

print(gcd(252, 105), lcm(4, 6))   # 21 12
# Built in: math.gcd, math.lcm`,
javascript:`function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

const lcm = (a, b) => a / gcd(a, b) * b;

console.log(gcd(252, 105), lcm(4, 6)); // 21 12`,
java:`public class GCD {
    static long gcd(long a, long b) {
        while (b != 0) { long t = a % b; a = b; b = t; }
        return a;
    }

    static long lcm(long a, long b) { return a / gcd(a, b) * b; }

    public static void main(String[] args) {
        System.out.println(gcd(252, 105) + " " + lcm(4, 6)); // 21 12
    }
}`,
cpp:`#include <iostream>

long long gcd(long long a, long long b) {
    while (b) { long long t = a % b; a = b; b = t; }
    return a;
}

long long lcm(long long a, long long b) { return a / gcd(a, b) * b; }

int main() {
    std::cout << gcd(252, 105) << ' ' << lcm(4, 6);   // 21 12
    // C++17 also has std::gcd and std::lcm in <numeric>
}`}},

sieve:{name:'Sieve of Eratosthenes',cat:'math',
 blurb:'List every prime up to n by crossing out the multiples of each prime, starting from its square.',
 cx:[['Time','O(n log log n)','Nearly linear'],['Extra space','O(n)','One flag per number'],['Single primality test','O(√n)','Trial division'],['Count of primes ≤ n','≈ n / ln n','Prime number theorem']],
 pts:['Start crossing out at i², because smaller multiples of i were already crossed out by smaller primes.','Only loop i up to √n: any composite ≤ n has a factor ≤ √n.','Great when you need many primes or many primality checks at once.','A segmented sieve handles ranges too large to fit in memory.'],
 pseudo:['procedure sieve(n)','  isPrime[0..n] ← true; isPrime[0], isPrime[1] ← false','  for i ← 2 while i · i ≤ n','    if isPrime[i]','      for j ← i · i to n step i: isPrime[j] ← false','  return all i with isPrime[i]'],
 trace:[[1,'n = 30. Assume every number from 2 to 30 is prime.'],[4,'i = 2: cross out 4, 6, 8, …, 30.'],[4,'i = 3: cross out 9, 15, 21, 27 (even multiples are already gone).'],[4,'i = 5: cross out 25 (the only multiple ≥ 25 not yet crossed). i = 6: 36 > 30, stop.'],[5,'Primes: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29.']],
 q:{q:'Why does the inner loop start at i · i instead of 2i?',o:['To avoid overflow','Smaller multiples k · i with k < i were already crossed out by the prime factors of k','Because i · i is prime','It’s a style choice'],a:1,why:'Every multiple below i² has a smaller prime factor, which already removed it.'},
 code:{
python:`def sieve(n):
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    i = 2
    while i * i <= n:
        if is_prime[i]:
            for j in range(i * i, n + 1, i):   # smaller multiples are already crossed out
                is_prime[j] = False
        i += 1
    return [i for i, p in enumerate(is_prime) if p]

print(sieve(30))   # [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]`,
javascript:`function sieve(n) {
  const isPrime = new Array(n + 1).fill(true);
  isPrime[0] = isPrime[1] = false;
  for (let i = 2; i * i <= n; i++)
    if (isPrime[i]) for (let j = i * i; j <= n; j += i) isPrime[j] = false;
  return isPrime.flatMap((p, i) => (p ? [i] : []));
}

console.log(sieve(30)); // [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]`,
java:`import java.util.ArrayList;
import java.util.List;

public class Sieve {
    static List<Integer> sieve(int n) {
        boolean[] composite = new boolean[n + 1];
        List<Integer> primes = new ArrayList<>();
        for (int i = 2; i <= n; i++) {
            if (composite[i]) continue;
            primes.add(i);
            for (long j = (long) i * i; j <= n; j += i) composite[(int) j] = true;
        }
        return primes;
    }

    public static void main(String[] args) {
        System.out.println(sieve(30)); // [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
    }
}`,
cpp:`#include <iostream>
#include <vector>

std::vector<int> sieve(int n) {
    std::vector<bool> isPrime(n + 1, true);
    std::vector<int> primes;
    for (int i = 2; i <= n; i++) {
        if (!isPrime[i]) continue;
        primes.push_back(i);
        for (long long j = 1LL * i * i; j <= n; j += i) isPrime[j] = false;
    }
    return primes;
}

int main() {
    for (int p : sieve(30)) std::cout << p << ' ';   // 2 3 5 7 11 13 17 19 23 29
}`}},

bits:{name:'Bit manipulation tricks',cat:'math',
 blurb:'A handful of constant-time tricks with AND, OR, XOR and shifts that show up constantly in interviews and low-level code.',
 cx:[['Count set bits','O(number of 1s)','Brian Kernighan: x & (x − 1) clears the lowest 1'],['Power of two','O(1)','x > 0 and x & (x − 1) = 0'],['XOR of a list','O(n)','Pairs cancel'],['Extra space','O(1)','']],
 pts:['x & (x − 1) removes the lowest set bit; x & −x isolates it.','a ^ a = 0 and a ^ 0 = a, so XOR-ing everything leaves the unpaired value.','x >> 1 halves, x << 1 doubles; (x >> i) & 1 reads bit i.','NeetCode examples: Single Number, Number of 1 Bits, Counting Bits, Missing Number, Sum of Two Integers.'],
 pseudo:['procedure countBits(x)','  count ← 0','  while x ≠ 0','    x ← x AND (x − 1)   // clear the lowest set bit','    count ← count + 1','  return count','isPowerOfTwo(x) = x > 0 and (x AND (x − 1)) = 0','singleNumber(A) = A[0] XOR A[1] XOR … XOR A[n−1]'],
 trace:[[0,'x = 0b101101 (45).'],[3,'101101 & 101100 = 101100 (1). & 101011 = 101000 (2).'],[4,'101000 & 100111 = 100000 (3). & 011111 = 0 (4). Four set bits.'],[6,'64 = 0b1000000; 64 & 63 = 0, so it is a power of two.'],[7,'4 ^ 1 ^ 2 ^ 1 ^ 2 = 4: the pairs cancel.']],
 q:{q:'What does x & (x − 1) do?',o:['Doubles x','Clears the lowest set bit of x','Sets every bit','Flips the highest bit'],a:1,why:'Subtracting 1 flips the lowest 1 and everything below it; AND-ing removes that lowest 1.'},
 code:{
python:`def count_bits(x):
    count = 0
    while x:
        x &= x - 1        # clears the lowest set bit
        count += 1
    return count

def is_power_of_two(x):
    return x > 0 and x & (x - 1) == 0

def single_number(nums):
    result = 0
    for x in nums:
        result ^= x       # pairs cancel: a ^ a = 0
    return result

print(count_bits(0b101101), is_power_of_two(64), single_number([4, 1, 2, 1, 2]))   # 4 True 4`,
javascript:`function countBits(x) {
  let count = 0;
  while (x) { x &= x - 1; count++; }   // clear the lowest set bit
  return count;
}

const isPowerOfTwo = x => x > 0 && (x & (x - 1)) === 0;
const singleNumber = nums => nums.reduce((acc, x) => acc ^ x, 0);

console.log(countBits(0b101101), isPowerOfTwo(64), singleNumber([4, 1, 2, 1, 2])); // 4 true 4`,
java:`public class BitTricks {
    static int countBits(int x) {
        int count = 0;
        while (x != 0) { x &= x - 1; count++; }   // Integer.bitCount(x) does the same
        return count;
    }

    static boolean isPowerOfTwo(int x) { return x > 0 && (x & (x - 1)) == 0; }

    static int singleNumber(int[] nums) {
        int r = 0;
        for (int x : nums) r ^= x;
        return r;
    }

    public static void main(String[] args) {
        System.out.println(countBits(0b101101) + " " + isPowerOfTwo(64) + " "
                + singleNumber(new int[]{4, 1, 2, 1, 2}));   // 4 true 4
    }
}`,
cpp:`#include <iostream>
#include <vector>

int countBits(unsigned x) {
    int count = 0;
    while (x) { x &= x - 1; count++; }   // __builtin_popcount(x) does the same
    return count;
}

bool isPowerOfTwo(int x) { return x > 0 && (x & (x - 1)) == 0; }

int singleNumber(const std::vector<int>& nums) {
    int r = 0;
    for (int x : nums) r ^= x;
    return r;
}

int main() {
    std::cout << countBits(0b101101) << ' ' << std::boolalpha << isPowerOfTwo(64) << ' '
              << singleNumber({4, 1, 2, 1, 2});   // 4 true 4
}`}},

floyd:{name:'Floyd’s cycle detection',cat:'math',
 blurb:'Detect a cycle in a linked structure with two pointers moving at different speeds, then find where the cycle begins, using O(1) memory.',
 cx:[['Time','O(n)','The fast pointer catches up within one loop'],['Extra space','O(1)','Just two pointers'],['Alternative','Hash set of visited nodes','O(n) memory'],['Also finds','Cycle start and length','Phase 2 and one more loop']],
 pts:['Phase 1: slow moves 1 step, fast moves 2. If there is a cycle, they meet inside it.','Phase 2: reset one pointer to the start; move both 1 step. They meet at the cycle entrance.','Works on any function x → f(x), including arrays used as linked lists.','NeetCode examples: Linked List Cycle, Find the Duplicate Number, Happy Number.'],
 pseudo:['procedure findCycleStart(f, x0)','  slow ← f(x0); fast ← f(f(x0))','  while slow ≠ fast   // phase 1: meet inside the cycle','    slow ← f(slow); fast ← f(f(fast))','  slow ← x0','  while slow ≠ fast   // phase 2: meet at the entrance','    slow ← f(slow); fast ← f(fast)','  return slow'],
 trace:[[0,'nums = [1, 3, 4, 2, 2]: treat i → nums[i] as a list starting at index 0. Path: 0 → 1 → 3 → 2 → 4 → 2 → 4 → …'],[3,'Both start at nums[0] = 1. slow: 1 → 3 → 2. fast, two steps at a time: 1 → 2 → 2. They meet at 2 inside the loop {2, 4}.'],[4,'Reset slow to nums[0] = 1; fast stays at 2.'],[6,'One step each: slow 1 → 3 → 2, fast 2 → 4 → 2. They meet at 2, the cycle entrance, which is the duplicate value.']],
 q:{q:'Why does the hare (fast pointer) always catch the tortoise inside a cycle?',o:['It skips the cycle','The gap between them shrinks by exactly 1 each step','Both pointers reset','It doesn’t always'],a:1,why:'Inside the loop, fast gains one node per step on slow, so it can’t jump over it.'},
 code:{
python:`def find_duplicate(nums):
    """nums holds n + 1 values in 1..n. Treat i -> nums[i] as a linked list with a cycle."""
    slow = fast = nums[0]
    while True:                  # phase 1: meet inside the cycle
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast:
            break
    slow = nums[0]
    while slow != fast:          # phase 2: meet at the cycle entrance
        slow = nums[slow]
        fast = nums[fast]
    return slow

print(find_duplicate([1, 3, 4, 2, 2]))   # 2`,
javascript:`function findDuplicate(nums) {
  let slow = nums[0], fast = nums[0];
  do {                                   // phase 1
    slow = nums[slow];
    fast = nums[nums[fast]];
  } while (slow !== fast);
  slow = nums[0];
  while (slow !== fast) {                // phase 2
    slow = nums[slow];
    fast = nums[fast];
  }
  return slow;
}

console.log(findDuplicate([1, 3, 4, 2, 2])); // 2`,
java:`public class FloydCycle {
    static int findDuplicate(int[] nums) {
        int slow = nums[0], fast = nums[0];
        do {                                   // phase 1
            slow = nums[slow];
            fast = nums[nums[fast]];
        } while (slow != fast);
        slow = nums[0];
        while (slow != fast) {                 // phase 2
            slow = nums[slow];
            fast = nums[fast];
        }
        return slow;
    }

    public static void main(String[] args) {
        System.out.println(findDuplicate(new int[]{1, 3, 4, 2, 2})); // 2
    }
}`,
cpp:`#include <iostream>
#include <vector>

int findDuplicate(const std::vector<int>& nums) {
    int slow = nums[0], fast = nums[0];
    do {                                   // phase 1
        slow = nums[slow];
        fast = nums[nums[fast]];
    } while (slow != fast);
    slow = nums[0];
    while (slow != fast) {                 // phase 2
        slow = nums[slow];
        fast = nums[fast];
    }
    return slow;
}

int main() {
    std::cout << findDuplicate({1, 3, 4, 2, 2});   // 2
}`}}
});
