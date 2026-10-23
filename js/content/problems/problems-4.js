/* ===== Problems batch 4: Backtracking, Tries, Graphs ===== */

P({n:78,s:'subsets',t:'Subsets',c:'backtrack',d:'Medium',rel:['recursion','subsets','bits'],
 sum:'Return every possible subset (the power set) of an array of distinct integers.',
 ex:'[1, 2, 3] → [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]',
 h:['Each element is either in or out: 2ⁿ subsets.','Make one include/skip decision per element recursively.','Record a copy of the current path when every element has been decided.'],
 app:'Backtrack over indices: at index i, include nums[i] and recurse, undo, then recurse without it. When i reaches n, save a copy of the path. Iterating over bitmasks 0..2ⁿ − 1 is an equivalent non-recursive approach.',
 tc:'O(n · 2ⁿ)',sc:'O(n) recursion',
 py:`class Solution:
    def subsets(self, nums: list[int]) -> list[list[int]]:
        res, cur = [], []

        def dfs(i):
            if i == len(nums):
                res.append(cur[:])
                return
            cur.append(nums[i])        # include nums[i]
            dfs(i + 1)
            cur.pop()                  # undo
            dfs(i + 1)                 # skip nums[i]

        dfs(0)
        return res`,
 js:`function subsets(nums) {
  const res = [], cur = [];
  const dfs = i => {
    if (i === nums.length) { res.push([...cur]); return; }
    cur.push(nums[i]); dfs(i + 1);     // include
    cur.pop(); dfs(i + 1);             // skip
  };
  dfs(0);
  return res;
}`,
 java:`class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        dfs(nums, 0, new ArrayList<>(), res);
        return res;
    }

    private void dfs(int[] nums, int i, List<Integer> cur, List<List<Integer>> res) {
        if (i == nums.length) { res.add(new ArrayList<>(cur)); return; }
        cur.add(nums[i]);
        dfs(nums, i + 1, cur, res);
        cur.remove(cur.size() - 1);
        dfs(nums, i + 1, cur, res);
    }
}`,
 cpp:`class Solution {
    void dfs(vector<int>& nums, int i, vector<int>& cur, vector<vector<int>>& res) {
        if (i == (int)nums.size()) { res.push_back(cur); return; }
        cur.push_back(nums[i]);
        dfs(nums, i + 1, cur, res);
        cur.pop_back();
        dfs(nums, i + 1, cur, res);
    }
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        vector<vector<int>> res;
        vector<int> cur;
        dfs(nums, 0, cur, res);
        return res;
    }
};`});

P({n:39,s:'combination-sum',t:'Combination Sum',c:'backtrack',d:'Medium',rel:['subsets','coinchange'],
 sum:'Given distinct positive candidates, list every unique combination that sums to the target. A candidate may be used any number of times.',
 ex:'[2, 3, 6, 7], target 7 → [[2, 2, 3], [7]]',
 h:['To avoid listing [2, 3] and [3, 2] separately, only move forward through the candidates.','At each step either use candidates[i] again (stay at i) or move to i + 1.','Stop when the remaining amount hits 0 (record) or goes negative (dead end).'],
 app:'Backtrack with (index, remaining). Option 1: append candidates[i] and recurse with the same index and remaining − candidates[i]. Option 2: recurse with index + 1. Because indices never move backward, each combination is generated once in non-decreasing index order.',
 tc:'O(2^(t / min))',sc:'O(t / min) recursion',
 py:`class Solution:
    def combinationSum(self, candidates: list[int], target: int) -> list[list[int]]:
        res, cur = [], []

        def dfs(i, remaining):
            if remaining == 0:
                res.append(cur[:])
                return
            if i == len(candidates) or remaining < 0:
                return
            cur.append(candidates[i])          # use candidates[i] (reuse allowed)
            dfs(i, remaining - candidates[i])
            cur.pop()
            dfs(i + 1, remaining)              # move on to the next candidate

        dfs(0, target)
        return res`,
 js:`function combinationSum(candidates, target) {
  const res = [], cur = [];
  const dfs = (i, remaining) => {
    if (remaining === 0) { res.push([...cur]); return; }
    if (i === candidates.length || remaining < 0) return;
    cur.push(candidates[i]);
    dfs(i, remaining - candidates[i]);
    cur.pop();
    dfs(i + 1, remaining);
  };
  dfs(0, target);
  return res;
}`,
 java:`class Solution {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> res = new ArrayList<>();
        dfs(candidates, 0, target, new ArrayList<>(), res);
        return res;
    }

    private void dfs(int[] c, int i, int remaining, List<Integer> cur, List<List<Integer>> res) {
        if (remaining == 0) { res.add(new ArrayList<>(cur)); return; }
        if (i == c.length || remaining < 0) return;
        cur.add(c[i]);
        dfs(c, i, remaining - c[i], cur, res);
        cur.remove(cur.size() - 1);
        dfs(c, i + 1, remaining, cur, res);
    }
}`,
 cpp:`class Solution {
    void dfs(vector<int>& c, int i, int remaining, vector<int>& cur, vector<vector<int>>& res) {
        if (remaining == 0) { res.push_back(cur); return; }
        if (i == (int)c.size() || remaining < 0) return;
        cur.push_back(c[i]);
        dfs(c, i, remaining - c[i], cur, res);
        cur.pop_back();
        dfs(c, i + 1, remaining, cur, res);
    }
public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        vector<vector<int>> res;
        vector<int> cur;
        dfs(candidates, 0, target, cur, res);
        return res;
    }
};`});

P({n:46,s:'permutations',t:'Permutations',c:'backtrack',d:'Medium',rel:['permutations'],
 sum:'Return every ordering of an array of distinct integers.',
 ex:'[1, 2, 3] → [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]',
 h:['There are n! orderings.','Choose the first element, then permute the rest.','Swap each candidate into the current position, recurse, then swap back.'],
 app:'Backtrack on a position index start. For each i from start to n − 1, swap nums[i] into position start, recurse on start + 1, and swap back. When start reaches n, record a copy. A “used” boolean array with a growing path works too.',
 tc:'O(n · n!)',sc:'O(n) recursion',
 py:`class Solution:
    def permute(self, nums: list[int]) -> list[list[int]]:
        res = []

        def dfs(start):
            if start == len(nums):
                res.append(nums[:])
                return
            for i in range(start, len(nums)):
                nums[start], nums[i] = nums[i], nums[start]   # choose
                dfs(start + 1)
                nums[start], nums[i] = nums[i], nums[start]   # undo

        dfs(0)
        return res`,
 js:`function permute(nums) {
  const res = [];
  const dfs = start => {
    if (start === nums.length) { res.push([...nums]); return; }
    for (let i = start; i < nums.length; i++) {
      [nums[start], nums[i]] = [nums[i], nums[start]];
      dfs(start + 1);
      [nums[start], nums[i]] = [nums[i], nums[start]];
    }
  };
  dfs(0);
  return res;
}`,
 java:`class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        dfs(nums, 0, res);
        return res;
    }

    private void dfs(int[] nums, int start, List<List<Integer>> res) {
        if (start == nums.length) {
            List<Integer> p = new ArrayList<>();
            for (int x : nums) p.add(x);
            res.add(p);
            return;
        }
        for (int i = start; i < nums.length; i++) {
            swap(nums, start, i);
            dfs(nums, start + 1, res);
            swap(nums, start, i);
        }
    }

    private void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }
}`,
 cpp:`class Solution {
    void dfs(vector<int>& nums, int start, vector<vector<int>>& res) {
        if (start == (int)nums.size()) { res.push_back(nums); return; }
        for (int i = start; i < (int)nums.size(); i++) {
            swap(nums[start], nums[i]);
            dfs(nums, start + 1, res);
            swap(nums[start], nums[i]);
        }
    }
public:
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> res;
        dfs(nums, 0, res);
        return res;
    }
};`});

P({n:90,s:'subsets-ii',t:'Subsets II',c:'backtrack',d:'Medium',rel:['subsets'],
 sum:'Return every subset of an array that may contain duplicates, without listing the same subset twice.',
 ex:'[1, 2, 2] → [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]',
 h:['Sort first so equal values sit next to each other.','Duplicate subsets come from choosing a different copy of the same value at the same position.','In the loop at one recursion level, skip nums[i] if it equals nums[i − 1] and i is past the level’s start.'],
 app:'Sort, then backtrack where each call records the current path and then loops over the next element to add. Inside the loop, skip a value that equals the previous one at this same depth. Equal values can still be taken together (like [2, 2]) because the second 2 is chosen at the next depth.',
 tc:'O(n · 2ⁿ)',sc:'O(n) recursion',
 py:`class Solution:
    def subsetsWithDup(self, nums: list[int]) -> list[list[int]]:
        nums.sort()
        res, cur = [], []

        def dfs(start):
            res.append(cur[:])
            for i in range(start, len(nums)):
                if i > start and nums[i] == nums[i - 1]:
                    continue                    # same value at this depth: skip
                cur.append(nums[i])
                dfs(i + 1)
                cur.pop()

        dfs(0)
        return res`,
 js:`function subsetsWithDup(nums) {
  nums.sort((a, b) => a - b);
  const res = [], cur = [];
  const dfs = start => {
    res.push([...cur]);
    for (let i = start; i < nums.length; i++) {
      if (i > start && nums[i] === nums[i - 1]) continue;
      cur.push(nums[i]);
      dfs(i + 1);
      cur.pop();
    }
  };
  dfs(0);
  return res;
}`,
 java:`class Solution {
    public List<List<Integer>> subsetsWithDup(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> res = new ArrayList<>();
        dfs(nums, 0, new ArrayList<>(), res);
        return res;
    }

    private void dfs(int[] nums, int start, List<Integer> cur, List<List<Integer>> res) {
        res.add(new ArrayList<>(cur));
        for (int i = start; i < nums.length; i++) {
            if (i > start && nums[i] == nums[i - 1]) continue;
            cur.add(nums[i]);
            dfs(nums, i + 1, cur, res);
            cur.remove(cur.size() - 1);
        }
    }
}`,
 cpp:`class Solution {
    void dfs(vector<int>& nums, int start, vector<int>& cur, vector<vector<int>>& res) {
        res.push_back(cur);
        for (int i = start; i < (int)nums.size(); i++) {
            if (i > start && nums[i] == nums[i - 1]) continue;
            cur.push_back(nums[i]);
            dfs(nums, i + 1, cur, res);
            cur.pop_back();
        }
    }
public:
    vector<vector<int>> subsetsWithDup(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> res;
        vector<int> cur;
        dfs(nums, 0, cur, res);
        return res;
    }
};`});

P({n:40,s:'combination-sum-ii',t:'Combination Sum II',c:'backtrack',d:'Medium',rel:['subsets'],
 sum:'Find every unique combination of candidates that sums to the target, using each array element at most once. The candidates may contain duplicates.',
 ex:'[10, 1, 2, 7, 6, 1, 5], target 8 → [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]]',
 h:['This is Subsets II with a sum constraint.','Sort, then skip equal values at the same depth to avoid duplicate combinations.','Since the array is sorted, stop the loop once a candidate exceeds the remaining amount.'],
 app:'Sort the candidates. Backtrack with (start, remaining). Loop i from start; skip i if it equals its predecessor at this depth; break if candidates[i] > remaining. Otherwise take it and recurse with i + 1 (each element once). Record the path when remaining reaches 0.',
 tc:'O(2ⁿ)',sc:'O(n) recursion',
 py:`class Solution:
    def combinationSum2(self, candidates: list[int], target: int) -> list[list[int]]:
        candidates.sort()
        res, cur = [], []

        def dfs(start, remaining):
            if remaining == 0:
                res.append(cur[:])
                return
            for i in range(start, len(candidates)):
                if i > start and candidates[i] == candidates[i - 1]:
                    continue                        # skip duplicates at this depth
                if candidates[i] > remaining:
                    break                           # sorted: nothing later fits
                cur.append(candidates[i])
                dfs(i + 1, remaining - candidates[i])
                cur.pop()

        dfs(0, target)
        return res`,
 js:`function combinationSum2(candidates, target) {
  candidates.sort((a, b) => a - b);
  const res = [], cur = [];
  const dfs = (start, remaining) => {
    if (remaining === 0) { res.push([...cur]); return; }
    for (let i = start; i < candidates.length; i++) {
      if (i > start && candidates[i] === candidates[i - 1]) continue;
      if (candidates[i] > remaining) break;
      cur.push(candidates[i]);
      dfs(i + 1, remaining - candidates[i]);
      cur.pop();
    }
  };
  dfs(0, target);
  return res;
}`,
 java:`class Solution {
    public List<List<Integer>> combinationSum2(int[] candidates, int target) {
        Arrays.sort(candidates);
        List<List<Integer>> res = new ArrayList<>();
        dfs(candidates, 0, target, new ArrayList<>(), res);
        return res;
    }

    private void dfs(int[] c, int start, int remaining, List<Integer> cur, List<List<Integer>> res) {
        if (remaining == 0) { res.add(new ArrayList<>(cur)); return; }
        for (int i = start; i < c.length; i++) {
            if (i > start && c[i] == c[i - 1]) continue;
            if (c[i] > remaining) break;
            cur.add(c[i]);
            dfs(c, i + 1, remaining - c[i], cur, res);
            cur.remove(cur.size() - 1);
        }
    }
}`,
 cpp:`class Solution {
    void dfs(vector<int>& c, int start, int remaining, vector<int>& cur, vector<vector<int>>& res) {
        if (remaining == 0) { res.push_back(cur); return; }
        for (int i = start; i < (int)c.size(); i++) {
            if (i > start && c[i] == c[i - 1]) continue;
            if (c[i] > remaining) break;
            cur.push_back(c[i]);
            dfs(c, i + 1, remaining - c[i], cur, res);
            cur.pop_back();
        }
    }
public:
    vector<vector<int>> combinationSum2(vector<int>& candidates, int target) {
        sort(candidates.begin(), candidates.end());
        vector<vector<int>> res;
        vector<int> cur;
        dfs(candidates, 0, target, cur, res);
        return res;
    }
};`});

P({n:79,s:'word-search',t:'Word Search',c:'backtrack',d:'Medium',rel:['dfs'],
 sum:'Decide whether a word can be traced through a letter grid by moving between horizontally or vertically adjacent cells, using each cell at most once.',
 ex:'grid [["A","B","C","E"], ["S","F","C","S"], ["A","D","E","E"]], "ABCCED" → true',
 h:['Try every cell as a starting point.','From a cell matching word[i], explore the four neighbors for word[i + 1].','Mark the cell as used while exploring from it, and restore it when backtracking.'],
 app:'DFS(r, c, i) succeeds when i equals the word length. It fails if (r, c) is off the grid or doesn’t match word[i]. Otherwise temporarily overwrite the cell with a marker, try all four directions with i + 1, and restore the letter before returning.',
 tc:'O(m · n · 3^L)',sc:'O(L) recursion',
 py:`class Solution:
    def exist(self, board: list[list[str]], word: str) -> bool:
        rows, cols = len(board), len(board[0])

        def dfs(r, c, i):
            if i == len(word):
                return True
            if not (0 <= r < rows and 0 <= c < cols) or board[r][c] != word[i]:
                return False
            board[r][c] = "#"                  # mark as used
            found = (dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1)
                     or dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1))
            board[r][c] = word[i]              # restore
            return found

        return any(dfs(r, c, 0) for r in range(rows) for c in range(cols))`,
 js:`function exist(board, word) {
  const rows = board.length, cols = board[0].length;
  const dfs = (r, c, i) => {
    if (i === word.length) return true;
    if (r < 0 || c < 0 || r >= rows || c >= cols || board[r][c] !== word[i]) return false;
    board[r][c] = "#";
    const found = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
    board[r][c] = word[i];
    return found;
  };
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (dfs(r, c, 0)) return true;
  return false;
}`,
 java:`class Solution {
    public boolean exist(char[][] board, String word) {
        for (int r = 0; r < board.length; r++)
            for (int c = 0; c < board[0].length; c++)
                if (dfs(board, word, r, c, 0)) return true;
        return false;
    }

    private boolean dfs(char[][] b, String w, int r, int c, int i) {
        if (i == w.length()) return true;
        if (r < 0 || c < 0 || r >= b.length || c >= b[0].length || b[r][c] != w.charAt(i)) return false;
        b[r][c] = '#';
        boolean found = dfs(b, w, r + 1, c, i + 1) || dfs(b, w, r - 1, c, i + 1)
                     || dfs(b, w, r, c + 1, i + 1) || dfs(b, w, r, c - 1, i + 1);
        b[r][c] = w.charAt(i);
        return found;
    }
}`,
 cpp:`class Solution {
    bool dfs(vector<vector<char>>& b, const string& w, int r, int c, int i) {
        if (i == (int)w.size()) return true;
        if (r < 0 || c < 0 || r >= (int)b.size() || c >= (int)b[0].size() || b[r][c] != w[i]) return false;
        b[r][c] = '#';
        bool found = dfs(b, w, r + 1, c, i + 1) || dfs(b, w, r - 1, c, i + 1)
                  || dfs(b, w, r, c + 1, i + 1) || dfs(b, w, r, c - 1, i + 1);
        b[r][c] = w[i];
        return found;
    }
public:
    bool exist(vector<vector<char>>& board, string word) {
        for (int r = 0; r < (int)board.size(); r++)
            for (int c = 0; c < (int)board[0].size(); c++)
                if (dfs(board, word, r, c, 0)) return true;
        return false;
    }
};`});

P({n:131,s:'palindrome-partitioning',t:'Palindrome Partitioning',c:'backtrack',d:'Medium',rel:['subsets'],
 sum:'Split a string into pieces so that every piece is a palindrome. Return every such split.',
 ex:'"aab" → [["a", "a", "b"], ["aa", "b"]]',
 h:['Choose the first piece, then partition the rest.','Only continue when the chosen piece is a palindrome.','A precomputed table isPal[i][j] avoids re-checking substrings.'],
 app:'Backtrack on a start index. For each end from start to n − 1, if s[start..end] is a palindrome, append it and recurse from end + 1, then remove it. When start reaches n, record the path.',
 tc:'O(n · 2ⁿ)',sc:'O(n) recursion',
 py:`class Solution:
    def partition(self, s: str) -> list[list[str]]:
        res, cur = [], []

        def dfs(start):
            if start == len(s):
                res.append(cur[:])
                return
            for end in range(start, len(s)):
                piece = s[start:end + 1]
                if piece == piece[::-1]:        # only palindromic pieces
                    cur.append(piece)
                    dfs(end + 1)
                    cur.pop()

        dfs(0)
        return res`,
 js:`function partition(s) {
  const res = [], cur = [];
  const isPal = (i, j) => { while (i < j) if (s[i++] !== s[j--]) return false; return true; };
  const dfs = start => {
    if (start === s.length) { res.push([...cur]); return; }
    for (let end = start; end < s.length; end++) {
      if (isPal(start, end)) {
        cur.push(s.slice(start, end + 1));
        dfs(end + 1);
        cur.pop();
      }
    }
  };
  dfs(0);
  return res;
}`,
 java:`class Solution {
    public List<List<String>> partition(String s) {
        List<List<String>> res = new ArrayList<>();
        dfs(s, 0, new ArrayList<>(), res);
        return res;
    }

    private void dfs(String s, int start, List<String> cur, List<List<String>> res) {
        if (start == s.length()) { res.add(new ArrayList<>(cur)); return; }
        for (int end = start; end < s.length(); end++) {
            if (isPal(s, start, end)) {
                cur.add(s.substring(start, end + 1));
                dfs(s, end + 1, cur, res);
                cur.remove(cur.size() - 1);
            }
        }
    }

    private boolean isPal(String s, int i, int j) {
        while (i < j) if (s.charAt(i++) != s.charAt(j--)) return false;
        return true;
    }
}`,
 cpp:`class Solution {
    bool isPal(const string& s, int i, int j) {
        while (i < j) if (s[i++] != s[j--]) return false;
        return true;
    }
    void dfs(const string& s, int start, vector<string>& cur, vector<vector<string>>& res) {
        if (start == (int)s.size()) { res.push_back(cur); return; }
        for (int end = start; end < (int)s.size(); end++) {
            if (isPal(s, start, end)) {
                cur.push_back(s.substr(start, end - start + 1));
                dfs(s, end + 1, cur, res);
                cur.pop_back();
            }
        }
    }
public:
    vector<vector<string>> partition(string s) {
        vector<vector<string>> res;
        vector<string> cur;
        dfs(s, 0, cur, res);
        return res;
    }
};`});

P({n:17,s:'letter-combinations-of-a-phone-number',t:'Letter Combinations of a Phone Number',c:'backtrack',d:'Medium',rel:['subsets'],
 sum:'Each digit 2–9 maps to letters as on a phone keypad. Return every letter string the digit sequence could represent.',
 ex:'"23" → ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"]',
 h:['Each position independently picks one letter from its digit.','That is a Cartesian product, generated by recursion over positions.','An empty input should give an empty list, not [""].'],
 app:'Map digits to letter strings. Backtrack over positions: for each letter of the current digit, append it and recurse to the next position; when the path is as long as the input, record it. The result size is the product of the letter counts (at most 4ⁿ).',
 tc:'O(n · 4ⁿ)',sc:'O(n) recursion',
 py:`class Solution:
    def letterCombinations(self, digits: str) -> list[str]:
        if not digits:
            return []
        keys = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl",
                "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
        res = []

        def dfs(i, path):
            if i == len(digits):
                res.append(path)
                return
            for ch in keys[digits[i]]:
                dfs(i + 1, path + ch)

        dfs(0, "")
        return res`,
 js:`function letterCombinations(digits) {
  if (!digits) return [];
  const keys = { 2: "abc", 3: "def", 4: "ghi", 5: "jkl", 6: "mno", 7: "pqrs", 8: "tuv", 9: "wxyz" };
  const res = [];
  const dfs = (i, path) => {
    if (i === digits.length) { res.push(path); return; }
    for (const ch of keys[digits[i]]) dfs(i + 1, path + ch);
  };
  dfs(0, "");
  return res;
}`,
 java:`class Solution {
    private static final String[] KEYS = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};

    public List<String> letterCombinations(String digits) {
        List<String> res = new ArrayList<>();
        if (!digits.isEmpty()) dfs(digits, 0, new StringBuilder(), res);
        return res;
    }

    private void dfs(String digits, int i, StringBuilder path, List<String> res) {
        if (i == digits.length()) { res.add(path.toString()); return; }
        for (char ch : KEYS[digits.charAt(i) - '0'].toCharArray()) {
            path.append(ch);
            dfs(digits, i + 1, path, res);
            path.deleteCharAt(path.length() - 1);
        }
    }
}`,
 cpp:`class Solution {
    const vector<string> keys = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
    void dfs(const string& digits, int i, string& path, vector<string>& res) {
        if (i == (int)digits.size()) { res.push_back(path); return; }
        for (char ch : keys[digits[i] - '0']) {
            path.push_back(ch);
            dfs(digits, i + 1, path, res);
            path.pop_back();
        }
    }
public:
    vector<string> letterCombinations(string digits) {
        vector<string> res;
        string path;
        if (!digits.empty()) dfs(digits, 0, path, res);
        return res;
    }
};`});

P({n:51,s:'n-queens',t:'N-Queens',c:'backtrack',d:'Hard',rel:['nqueens'],
 sum:'Place n queens on an n × n chessboard so that no two attack each other. Return every distinct board, written as strings with "Q" and ".".',
 ex:'n = 4 → [[".Q..", "...Q", "Q...", "..Q."], ["..Q.", "Q...", "...Q", ".Q.."]]',
 h:['Exactly one queen per row, so pick a column for each row in turn.','A square is attacked if its column, its r − c diagonal or its r + c anti-diagonal is taken.','Use three sets for O(1) checks and backtrack row by row.'],
 app:'Recurse over rows. For each column in the current row that isn’t attacked, place a queen (mark column and both diagonals), recurse to the next row, then remove it. When all n rows are filled, convert the queen positions to strings.',
 tc:'O(n!)',sc:'O(n²) for the board',
 py:`class Solution:
    def solveNQueens(self, n: int) -> list[list[str]]:
        res, queens = [], []                  # queens[r] = column of the queen in row r
        cols, diag1, diag2 = set(), set(), set()

        def place(r):
            if r == n:
                res.append(["." * c + "Q" + "." * (n - c - 1) for c in queens])
                return
            for c in range(n):
                if c in cols or r - c in diag1 or r + c in diag2:
                    continue
                cols.add(c); diag1.add(r - c); diag2.add(r + c); queens.append(c)
                place(r + 1)
                cols.remove(c); diag1.remove(r - c); diag2.remove(r + c); queens.pop()

        place(0)
        return res`,
 js:`function solveNQueens(n) {
  const res = [], queens = [], cols = new Set(), d1 = new Set(), d2 = new Set();
  const place = r => {
    if (r === n) {
      res.push(queens.map(c => ".".repeat(c) + "Q" + ".".repeat(n - c - 1)));
      return;
    }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) continue;
      cols.add(c); d1.add(r - c); d2.add(r + c); queens.push(c);
      place(r + 1);
      cols.delete(c); d1.delete(r - c); d2.delete(r + c); queens.pop();
    }
  };
  place(0);
  return res;
}`,
 java:`class Solution {
    public List<List<String>> solveNQueens(int n) {
        List<List<String>> res = new ArrayList<>();
        place(0, n, new int[n], new boolean[n], new boolean[2 * n], new boolean[2 * n], res);
        return res;
    }

    private void place(int r, int n, int[] queens, boolean[] cols, boolean[] d1, boolean[] d2,
                       List<List<String>> res) {
        if (r == n) {
            List<String> board = new ArrayList<>();
            for (int c : queens) {
                char[] row = new char[n];
                Arrays.fill(row, '.');
                row[c] = 'Q';
                board.add(new String(row));
            }
            res.add(board);
            return;
        }
        for (int c = 0; c < n; c++) {
            if (cols[c] || d1[r - c + n] || d2[r + c]) continue;
            cols[c] = d1[r - c + n] = d2[r + c] = true;
            queens[r] = c;
            place(r + 1, n, queens, cols, d1, d2, res);
            cols[c] = d1[r - c + n] = d2[r + c] = false;
        }
    }
}`,
 cpp:`class Solution {
    void place(int r, int n, vector<string>& board, vector<bool>& cols, vector<bool>& d1,
               vector<bool>& d2, vector<vector<string>>& res) {
        if (r == n) { res.push_back(board); return; }
        for (int c = 0; c < n; c++) {
            if (cols[c] || d1[r - c + n] || d2[r + c]) continue;
            cols[c] = d1[r - c + n] = d2[r + c] = true;
            board[r][c] = 'Q';
            place(r + 1, n, board, cols, d1, d2, res);
            board[r][c] = '.';
            cols[c] = d1[r - c + n] = d2[r + c] = false;
        }
    }
public:
    vector<vector<string>> solveNQueens(int n) {
        vector<vector<string>> res;
        vector<string> board(n, string(n, '.'));
        vector<bool> cols(n), d1(2 * n), d2(2 * n);
        place(0, n, board, cols, d1, d2, res);
        return res;
    }
};`});

/* ---------- Tries ---------- */
P({n:208,s:'implement-trie-prefix-tree',t:'Implement Trie (Prefix Tree)',c:'tries',d:'Medium',rel:['trie'],
 sum:'Implement a trie with insert(word), search(word) for exact words, and startsWith(prefix).',
 ex:'insert("apple"); search("apple") → true; search("app") → false; startsWith("app") → true',
 h:['Each node maps a character to a child node.','Mark the node where a word ends.','search needs the end mark; startsWith only needs the path to exist.'],
 app:'Each node holds up to 26 children (or a map) and an end flag. insert walks the word, creating missing children, and sets the flag at the last node. search walks and requires the flag; startsWith walks and only requires that the path exists.',
 tc:'O(L) per operation',sc:'O(total characters inserted)',
 py:`class Trie:
    def __init__(self):
        self.children = {}
        self.end = False

    def insert(self, word: str) -> None:
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

    def search(self, word: str) -> bool:
        node = self._walk(word)
        return node is not None and node.end

    def startsWith(self, prefix: str) -> bool:
        return self._walk(prefix) is not None`,
 js:`class Trie {
  constructor() { this.children = {}; this.end = false; }
  insert(word) {
    let node = this;
    for (const ch of word) node = node.children[ch] || (node.children[ch] = new Trie());
    node.end = true;
  }
  walk(s) {
    let node = this;
    for (const ch of s) {
      node = node.children[ch];
      if (!node) return null;
    }
    return node;
  }
  search(word) { const n = this.walk(word); return !!n && n.end; }
  startsWith(prefix) { return this.walk(prefix) !== null; }
}`,
 java:`class Trie {
    private final Trie[] children = new Trie[26];
    private boolean end;

    public void insert(String word) {
        Trie node = this;
        for (char ch : word.toCharArray()) {
            if (node.children[ch - 'a'] == null) node.children[ch - 'a'] = new Trie();
            node = node.children[ch - 'a'];
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

    public boolean search(String word) { Trie n = walk(word); return n != null && n.end; }
    public boolean startsWith(String prefix) { return walk(prefix) != null; }
}`,
 cpp:`class Trie {
    Trie* children[26] = {};
    bool end = false;
    Trie* walk(const string& s) {
        Trie* node = this;
        for (char ch : s) {
            node = node->children[ch - 'a'];
            if (!node) return nullptr;
        }
        return node;
    }
public:
    void insert(string word) {
        Trie* node = this;
        for (char ch : word) {
            if (!node->children[ch - 'a']) node->children[ch - 'a'] = new Trie();
            node = node->children[ch - 'a'];
        }
        node->end = true;
    }
    bool search(string word) { Trie* n = walk(word); return n && n->end; }
    bool startsWith(string prefix) { return walk(prefix) != nullptr; }
};`});

P({n:211,s:'design-add-and-search-words-data-structure',t:'Design Add and Search Words Data Structure',c:'tries',d:'Medium',rel:['trie','dfs'],
 sum:'Support addWord(word) and search(pattern), where the pattern may contain "." to match any single letter.',
 ex:'addWord("bad"), addWord("dad"); search(".ad") → true; search("b..") → true; search("pad") → false',
 h:['Store words in a trie.','A normal letter follows one child; "." must try every child.','Write search as a DFS over (node, index in the pattern).'],
 app:'Insert words into a trie with end flags. search(i, node): if i is at the end, return node.end. For a letter, continue into that child if present. For ".", return true if any child succeeds. Without dots this is O(L); with dots it can branch up to 26 ways per dot.',
 tc:'add O(L), search O(26^d · L) worst case',sc:'O(total characters)',
 py:`class WordDictionary:
    def __init__(self):
        self.root = {}                           # nested dicts; "$" marks a word end

    def addWord(self, word: str) -> None:
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = True

    def search(self, word: str) -> bool:
        def dfs(node, i):
            if i == len(word):
                return "$" in node
            ch = word[i]
            if ch == ".":
                return any(dfs(child, i + 1) for key, child in node.items() if key != "$")
            return ch in node and dfs(node[ch], i + 1)

        return dfs(self.root, 0)`,
 js:`class WordDictionary {
  constructor() { this.root = { children: {}, end: false }; }
  addWord(word) {
    let node = this.root;
    for (const ch of word) node = node.children[ch] || (node.children[ch] = { children: {}, end: false });
    node.end = true;
  }
  search(word) {
    const dfs = (node, i) => {
      if (i === word.length) return node.end;
      const ch = word[i];
      if (ch === ".") return Object.values(node.children).some(child => dfs(child, i + 1));
      return !!node.children[ch] && dfs(node.children[ch], i + 1);
    };
    return dfs(this.root, 0);
  }
}`,
 java:`class WordDictionary {
    private static class Node { Node[] children = new Node[26]; boolean end; }
    private final Node root = new Node();

    public void addWord(String word) {
        Node node = root;
        for (char ch : word.toCharArray()) {
            if (node.children[ch - 'a'] == null) node.children[ch - 'a'] = new Node();
            node = node.children[ch - 'a'];
        }
        node.end = true;
    }

    public boolean search(String word) { return dfs(root, word, 0); }

    private boolean dfs(Node node, String w, int i) {
        if (i == w.length()) return node.end;
        char ch = w.charAt(i);
        if (ch == '.') {
            for (Node child : node.children) if (child != null && dfs(child, w, i + 1)) return true;
            return false;
        }
        Node next = node.children[ch - 'a'];
        return next != null && dfs(next, w, i + 1);
    }
}`,
 cpp:`class WordDictionary {
    struct Node { Node* children[26] = {}; bool end = false; };
    Node* root = new Node();
    bool dfs(Node* node, const string& w, int i) {
        if (i == (int)w.size()) return node->end;
        if (w[i] == '.') {
            for (Node* child : node->children) if (child && dfs(child, w, i + 1)) return true;
            return false;
        }
        Node* next = node->children[w[i] - 'a'];
        return next && dfs(next, w, i + 1);
    }
public:
    void addWord(string word) {
        Node* node = root;
        for (char ch : word) {
            if (!node->children[ch - 'a']) node->children[ch - 'a'] = new Node();
            node = node->children[ch - 'a'];
        }
        node->end = true;
    }
    bool search(string word) { return dfs(root, word, 0); }
};`});

P({n:212,s:'word-search-ii',t:'Word Search II',c:'tries',d:'Hard',rel:['trie','dfs'],
 sum:'Given a letter grid and a list of words, return every word that can be traced in the grid (adjacent cells, no cell reused within a word).',
 ex:'grid with "oath", "eat" traceable; words ["oath", "pea", "eat", "rain"] → ["eat", "oath"]',
 h:['Running Word Search separately for each word repeats a lot of work.','Put all words in a trie and search for all of them at once.','During the grid DFS, stop as soon as the current path isn’t a prefix in the trie.'],
 app:'Build a trie of all words, storing the full word at its end node. DFS from every cell, following the trie in step with the grid; abandon any path whose next letter isn’t a trie child. When you reach a node holding a word, record it and clear it so it isn’t reported twice. Pruning emptied branches speeds it up further.',
 tc:'O(m · n · 4 · 3^(L−1))',sc:'O(total word length)',
 py:`class Solution:
    def findWords(self, board: list[list[str]], words: list[str]) -> list[str]:
        root = {}
        for w in words:                             # build the trie
            node = root
            for ch in w:
                node = node.setdefault(ch, {})
            node["$"] = w                           # store the whole word at its end
        rows, cols, res = len(board), len(board[0]), []

        def dfs(r, c, parent):
            ch = board[r][c]
            node = parent[ch]
            if "$" in node:
                res.append(node.pop("$"))           # found; remove to avoid duplicates
            board[r][c] = "#"
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] in node:
                    dfs(nr, nc, node)
            board[r][c] = ch
            if not node:
                parent.pop(ch)                      # prune an exhausted branch

        for r in range(rows):
            for c in range(cols):
                if board[r][c] in root:
                    dfs(r, c, root)
        return res`,
 js:`function findWords(board, words) {
  const root = {};
  for (const w of words) {
    let node = root;
    for (const ch of w) node = node[ch] || (node[ch] = {});
    node.$ = w;
  }
  const rows = board.length, cols = board[0].length, res = [];
  const dfs = (r, c, parent) => {
    const ch = board[r][c], node = parent[ch];
    if (node.$) { res.push(node.$); delete node.$; }
    board[r][c] = "#";
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && node[board[nr][nc]]) dfs(nr, nc, node);
    }
    board[r][c] = ch;
    if (!Object.keys(node).length) delete parent[ch];   // prune
  };
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (root[board[r][c]]) dfs(r, c, root);
  return res;
}`,
 java:`class Solution {
    private static class Node { Node[] next = new Node[26]; String word; }

    public List<String> findWords(char[][] board, String[] words) {
        Node root = new Node();
        for (String w : words) {
            Node node = root;
            for (char ch : w.toCharArray()) {
                if (node.next[ch - 'a'] == null) node.next[ch - 'a'] = new Node();
                node = node.next[ch - 'a'];
            }
            node.word = w;
        }
        List<String> res = new ArrayList<>();
        for (int r = 0; r < board.length; r++)
            for (int c = 0; c < board[0].length; c++) dfs(board, r, c, root, res);
        return res;
    }

    private void dfs(char[][] b, int r, int c, Node parent, List<String> res) {
        if (r < 0 || c < 0 || r >= b.length || c >= b[0].length) return;
        char ch = b[r][c];
        if (ch == '#' || parent.next[ch - 'a'] == null) return;
        Node node = parent.next[ch - 'a'];
        if (node.word != null) { res.add(node.word); node.word = null; }
        b[r][c] = '#';
        dfs(b, r + 1, c, node, res); dfs(b, r - 1, c, node, res);
        dfs(b, r, c + 1, node, res); dfs(b, r, c - 1, node, res);
        b[r][c] = ch;
    }
}`,
 cpp:`class Solution {
    struct Node { Node* next[26] = {}; string word; };
    void dfs(vector<vector<char>>& b, int r, int c, Node* parent, vector<string>& res) {
        if (r < 0 || c < 0 || r >= (int)b.size() || c >= (int)b[0].size()) return;
        char ch = b[r][c];
        if (ch == '#' || !parent->next[ch - 'a']) return;
        Node* node = parent->next[ch - 'a'];
        if (!node->word.empty()) { res.push_back(node->word); node->word.clear(); }
        b[r][c] = '#';
        dfs(b, r + 1, c, node, res); dfs(b, r - 1, c, node, res);
        dfs(b, r, c + 1, node, res); dfs(b, r, c - 1, node, res);
        b[r][c] = ch;
    }
public:
    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {
        Node* root = new Node();
        for (auto& w : words) {
            Node* node = root;
            for (char ch : w) {
                if (!node->next[ch - 'a']) node->next[ch - 'a'] = new Node();
                node = node->next[ch - 'a'];
            }
            node->word = w;
        }
        vector<string> res;
        for (int r = 0; r < (int)board.size(); r++)
            for (int c = 0; c < (int)board[0].size(); c++) dfs(board, r, c, root, res);
        return res;
    }
};`});

/* ---------- Graphs ---------- */
P({n:200,s:'number-of-islands',t:'Number of Islands',c:'graphs',d:'Medium',rel:['dfs','bfs','unionfind'],
 sum:'In a grid of "1" (land) and "0" (water), count the islands: groups of land cells connected horizontally or vertically.',
 ex:'[["1","1","0"], ["1","0","0"], ["0","0","1"]] → 2',
 h:['Each island is a connected component of land cells.','Scan the grid; an unvisited land cell starts a new island.','Flood-fill from it (DFS or BFS) to mark the whole island as visited.'],
 app:'Iterate over all cells. When you meet a "1", increment the count and run a DFS that turns every connected "1" into "0" so it won’t be counted again. Union–find over land cells is an alternative.',
 tc:'O(m · n)',sc:'O(m · n) worst-case recursion',
 py:`class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        rows, cols = len(grid), len(grid[0])

        def sink(r, c):
            if 0 <= r < rows and 0 <= c < cols and grid[r][c] == "1":
                grid[r][c] = "0"                 # mark visited
                sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1)

        count = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == "1":
                    count += 1
                    sink(r, c)
        return count`,
 js:`function numIslands(grid) {
  const rows = grid.length, cols = grid[0].length;
  const sink = (r, c) => {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== "1") return;
    grid[r][c] = "0";
    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);
  };
  let count = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c] === "1") { count++; sink(r, c); }
  return count;
}`,
 java:`class Solution {
    public int numIslands(char[][] grid) {
        int count = 0;
        for (int r = 0; r < grid.length; r++)
            for (int c = 0; c < grid[0].length; c++)
                if (grid[r][c] == '1') { count++; sink(grid, r, c); }
        return count;
    }

    private void sink(char[][] g, int r, int c) {
        if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] != '1') return;
        g[r][c] = '0';
        sink(g, r + 1, c); sink(g, r - 1, c); sink(g, r, c + 1); sink(g, r, c - 1);
    }
}`,
 cpp:`class Solution {
    void sink(vector<vector<char>>& g, int r, int c) {
        if (r < 0 || c < 0 || r >= (int)g.size() || c >= (int)g[0].size() || g[r][c] != '1') return;
        g[r][c] = '0';
        sink(g, r + 1, c); sink(g, r - 1, c); sink(g, r, c + 1); sink(g, r, c - 1);
    }
public:
    int numIslands(vector<vector<char>>& grid) {
        int count = 0;
        for (int r = 0; r < (int)grid.size(); r++)
            for (int c = 0; c < (int)grid[0].size(); c++)
                if (grid[r][c] == '1') { count++; sink(grid, r, c); }
        return count;
    }
};`});

P({n:133,s:'clone-graph',t:'Clone Graph',c:'graphs',d:'Medium',rel:['dfs','bfs'],
 sum:'Given a node of a connected undirected graph, return a deep copy of the entire graph.',
 ex:'adjacency [[2, 4], [1, 3], [2, 4], [1, 3]] → an identical, separate graph',
 h:['Graphs can contain cycles, so naive recursion would loop forever.','Remember which originals you have already copied.','A hash map from original node to copy doubles as the “visited” set.'],
 app:'DFS from the given node. For each original node, if a copy exists in the map return it; otherwise create the copy, store it before visiting neighbors (this breaks cycles), then set its neighbor list to the clones of the original’s neighbors.',
 tc:'O(V + E)',sc:'O(V)',
 py:`class Solution:
    def cloneGraph(self, node):
        clones = {}

        def dfs(n):
            if n in clones:
                return clones[n]
            copy = Node(n.val)
            clones[n] = copy                     # register before recursing (handles cycles)
            copy.neighbors = [dfs(nb) for nb in n.neighbors]
            return copy

        return dfs(node) if node else None`,
 js:`function cloneGraph(node) {
  const clones = new Map();
  const dfs = n => {
    if (clones.has(n)) return clones.get(n);
    const copy = new Node(n.val);
    clones.set(n, copy);
    copy.neighbors = n.neighbors.map(dfs);
    return copy;
  };
  return node ? dfs(node) : null;
}`,
 java:`class Solution {
    private final Map<Node, Node> clones = new HashMap<>();

    public Node cloneGraph(Node node) {
        if (node == null) return null;
        Node copy = clones.get(node);
        if (copy != null) return copy;
        copy = new Node(node.val);
        clones.put(node, copy);
        for (Node nb : node.neighbors) copy.neighbors.add(cloneGraph(nb));
        return copy;
    }
}`,
 cpp:`class Solution {
    unordered_map<Node*, Node*> clones;
public:
    Node* cloneGraph(Node* node) {
        if (!node) return nullptr;
        auto it = clones.find(node);
        if (it != clones.end()) return it->second;
        Node* copy = new Node(node->val);
        clones[node] = copy;
        for (Node* nb : node->neighbors) copy->neighbors.push_back(cloneGraph(nb));
        return copy;
    }
};`});

P({n:695,s:'max-area-of-island',t:'Max Area of Island',c:'graphs',d:'Medium',rel:['dfs'],
 sum:'In a 0/1 grid, return the number of cells in the largest island (4-directionally connected 1s), or 0 if there is no land.',
 ex:'A grid whose biggest island covers 6 cells → 6',
 h:['Same as Number of Islands, but measure each island.','Have the flood fill return the number of cells it visits.','Track the maximum over all islands.'],
 app:'For every unvisited land cell, run a DFS that marks cells visited (set them to 0) and returns 1 + the areas from its four neighbors. Keep the largest result.',
 tc:'O(m · n)',sc:'O(m · n) worst-case recursion',
 py:`class Solution:
    def maxAreaOfIsland(self, grid: list[list[int]]) -> int:
        rows, cols = len(grid), len(grid[0])

        def area(r, c):
            if not (0 <= r < rows and 0 <= c < cols) or grid[r][c] == 0:
                return 0
            grid[r][c] = 0                           # mark visited
            return 1 + area(r + 1, c) + area(r - 1, c) + area(r, c + 1) + area(r, c - 1)

        return max(area(r, c) for r in range(rows) for c in range(cols))`,
 js:`function maxAreaOfIsland(grid) {
  const rows = grid.length, cols = grid[0].length;
  const area = (r, c) => {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] === 0) return 0;
    grid[r][c] = 0;
    return 1 + area(r + 1, c) + area(r - 1, c) + area(r, c + 1) + area(r, c - 1);
  };
  let best = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) best = Math.max(best, area(r, c));
  return best;
}`,
 java:`class Solution {
    public int maxAreaOfIsland(int[][] grid) {
        int best = 0;
        for (int r = 0; r < grid.length; r++)
            for (int c = 0; c < grid[0].length; c++) best = Math.max(best, area(grid, r, c));
        return best;
    }

    private int area(int[][] g, int r, int c) {
        if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] == 0) return 0;
        g[r][c] = 0;
        return 1 + area(g, r + 1, c) + area(g, r - 1, c) + area(g, r, c + 1) + area(g, r, c - 1);
    }
}`,
 cpp:`class Solution {
    int area(vector<vector<int>>& g, int r, int c) {
        if (r < 0 || c < 0 || r >= (int)g.size() || c >= (int)g[0].size() || g[r][c] == 0) return 0;
        g[r][c] = 0;
        return 1 + area(g, r + 1, c) + area(g, r - 1, c) + area(g, r, c + 1) + area(g, r, c - 1);
    }
public:
    int maxAreaOfIsland(vector<vector<int>>& grid) {
        int best = 0;
        for (int r = 0; r < (int)grid.size(); r++)
            for (int c = 0; c < (int)grid[0].size(); c++) best = max(best, area(grid, r, c));
        return best;
    }
};`});

P({n:417,s:'pacific-atlantic-water-flow',t:'Pacific Atlantic Water Flow',c:'graphs',d:'Medium',rel:['dfs','bfs'],
 sum:'Water flows from a cell to neighbors of equal or lower height. The Pacific touches the top and left edges, the Atlantic the bottom and right. Return every cell from which water can reach both oceans.',
 ex:'A 5 × 5 height map → the 7 cells that drain to both oceans',
 h:['Searching from every cell is O((m · n)²).','Reverse the flow: start at each ocean and climb to cells of equal or greater height.','Cells reachable from both oceans’ searches are the answer.'],
 app:'Run a DFS (or BFS) from every Pacific border cell, moving only to neighbors with height ≥ the current cell; mark them reachable. Do the same from the Atlantic border. Return cells marked in both sets.',
 tc:'O(m · n)',sc:'O(m · n)',
 py:`class Solution:
    def pacificAtlantic(self, heights: list[list[int]]) -> list[list[int]]:
        rows, cols = len(heights), len(heights[0])
        pacific, atlantic = set(), set()

        def climb(r, c, seen):
            seen.add((r, c))
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if (0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in seen
                        and heights[nr][nc] >= heights[r][c]):   # water could flow down to (r, c)
                    climb(nr, nc, seen)

        for r in range(rows):
            climb(r, 0, pacific)
            climb(r, cols - 1, atlantic)
        for c in range(cols):
            climb(0, c, pacific)
            climb(rows - 1, c, atlantic)
        return [list(cell) for cell in pacific & atlantic]`,
 js:`function pacificAtlantic(heights) {
  const rows = heights.length, cols = heights[0].length;
  const make = () => Array.from({ length: rows }, () => new Array(cols).fill(false));
  const pac = make(), atl = make();
  const climb = (r, c, seen) => {
    seen[r][c] = true;
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && !seen[nr][nc] && heights[nr][nc] >= heights[r][c])
        climb(nr, nc, seen);
    }
  };
  for (let r = 0; r < rows; r++) { climb(r, 0, pac); climb(r, cols - 1, atl); }
  for (let c = 0; c < cols; c++) { climb(0, c, pac); climb(rows - 1, c, atl); }
  const res = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (pac[r][c] && atl[r][c]) res.push([r, c]);
  return res;
}`,
 java:`class Solution {
    private int rows, cols;
    private int[][] h;

    public List<List<Integer>> pacificAtlantic(int[][] heights) {
        h = heights; rows = h.length; cols = h[0].length;
        boolean[][] pac = new boolean[rows][cols], atl = new boolean[rows][cols];
        for (int r = 0; r < rows; r++) { climb(r, 0, pac); climb(r, cols - 1, atl); }
        for (int c = 0; c < cols; c++) { climb(0, c, pac); climb(rows - 1, c, atl); }
        List<List<Integer>> res = new ArrayList<>();
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                if (pac[r][c] && atl[r][c]) res.add(List.of(r, c));
        return res;
    }

    private void climb(int r, int c, boolean[][] seen) {
        seen[r][c] = true;
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        for (int[] d : dirs) {
            int nr = r + d[0], nc = c + d[1];
            if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && !seen[nr][nc] && h[nr][nc] >= h[r][c])
                climb(nr, nc, seen);
        }
    }
}`,
 cpp:`class Solution {
    int rows, cols;
    void climb(vector<vector<int>>& h, int r, int c, vector<vector<bool>>& seen) {
        seen[r][c] = true;
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && !seen[nr][nc] && h[nr][nc] >= h[r][c])
                climb(h, nr, nc, seen);
        }
    }
public:
    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
        rows = heights.size(); cols = heights[0].size();
        vector<vector<bool>> pac(rows, vector<bool>(cols)), atl(rows, vector<bool>(cols));
        for (int r = 0; r < rows; r++) { climb(heights, r, 0, pac); climb(heights, r, cols - 1, atl); }
        for (int c = 0; c < cols; c++) { climb(heights, 0, c, pac); climb(heights, rows - 1, c, atl); }
        vector<vector<int>> res;
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                if (pac[r][c] && atl[r][c]) res.push_back({r, c});
        return res;
    }
};`});

P({n:130,s:'surrounded-regions',t:'Surrounded Regions',c:'graphs',d:'Medium',rel:['dfs'],
 sum:'In a board of "X" and "O", capture every region of "O" cells that is completely surrounded by "X" by flipping it to "X". Regions touching the border survive.',
 ex:'[["X","X","X","X"], ["X","O","O","X"], ["X","X","O","X"], ["X","O","X","X"]] → only the bottom-left "O" survives',
 h:['Deciding “surrounded” directly is awkward.','Instead, find the regions that are not surrounded: those connected to the border.','Mark border-connected "O"s as safe, then flip every other "O".'],
 app:'Flood-fill from every "O" on the border, temporarily marking those cells (e.g. "S"). Then scan the board: remaining "O"s are surrounded, so flip them to "X"; turn the "S" cells back into "O".',
 tc:'O(m · n)',sc:'O(m · n) worst-case recursion',
 py:`class Solution:
    def solve(self, board: list[list[str]]) -> None:
        rows, cols = len(board), len(board[0])

        def mark(r, c):
            if 0 <= r < rows and 0 <= c < cols and board[r][c] == "O":
                board[r][c] = "S"                   # safe: connected to the border
                mark(r + 1, c); mark(r - 1, c); mark(r, c + 1); mark(r, c - 1)

        for r in range(rows):
            mark(r, 0); mark(r, cols - 1)
        for c in range(cols):
            mark(0, c); mark(rows - 1, c)
        for r in range(rows):
            for c in range(cols):
                board[r][c] = "O" if board[r][c] == "S" else "X"`,
 js:`function solve(board) {
  const rows = board.length, cols = board[0].length;
  const mark = (r, c) => {
    if (r < 0 || c < 0 || r >= rows || c >= cols || board[r][c] !== "O") return;
    board[r][c] = "S";
    mark(r + 1, c); mark(r - 1, c); mark(r, c + 1); mark(r, c - 1);
  };
  for (let r = 0; r < rows; r++) { mark(r, 0); mark(r, cols - 1); }
  for (let c = 0; c < cols; c++) { mark(0, c); mark(rows - 1, c); }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) board[r][c] = board[r][c] === "S" ? "O" : "X";
}`,
 java:`class Solution {
    public void solve(char[][] board) {
        int rows = board.length, cols = board[0].length;
        for (int r = 0; r < rows; r++) { mark(board, r, 0); mark(board, r, cols - 1); }
        for (int c = 0; c < cols; c++) { mark(board, 0, c); mark(board, rows - 1, c); }
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++) board[r][c] = board[r][c] == 'S' ? 'O' : 'X';
    }

    private void mark(char[][] b, int r, int c) {
        if (r < 0 || c < 0 || r >= b.length || c >= b[0].length || b[r][c] != 'O') return;
        b[r][c] = 'S';
        mark(b, r + 1, c); mark(b, r - 1, c); mark(b, r, c + 1); mark(b, r, c - 1);
    }
}`,
 cpp:`class Solution {
    void mark(vector<vector<char>>& b, int r, int c) {
        if (r < 0 || c < 0 || r >= (int)b.size() || c >= (int)b[0].size() || b[r][c] != 'O') return;
        b[r][c] = 'S';
        mark(b, r + 1, c); mark(b, r - 1, c); mark(b, r, c + 1); mark(b, r, c - 1);
    }
public:
    void solve(vector<vector<char>>& board) {
        int rows = board.size(), cols = board[0].size();
        for (int r = 0; r < rows; r++) { mark(board, r, 0); mark(board, r, cols - 1); }
        for (int c = 0; c < cols; c++) { mark(board, 0, c); mark(board, rows - 1, c); }
        for (auto& row : board) for (char& ch : row) ch = ch == 'S' ? 'O' : 'X';
    }
};`});

P({n:994,s:'rotting-oranges',t:'Rotting Oranges',c:'graphs',d:'Medium',rel:['bfs'],
 sum:'In a grid, 0 is empty, 1 a fresh orange and 2 a rotten one. Each minute, rotten oranges rot their fresh neighbors. Return the minutes until no fresh orange remains, or −1 if some never rot.',
 ex:'[[2, 1, 1], [1, 1, 0], [0, 1, 1]] → 4',
 h:['Rot spreads in waves, one step per minute: that is BFS.','Start the BFS from all rotten oranges at once (multi-source).','Count fresh oranges up front; if any remain at the end, return −1.'],
 app:'Queue every rotten orange and count the fresh ones. Process the queue level by level; each level is one minute, rotting fresh neighbors and enqueuing them. Stop when the queue empties or no fresh oranges remain. Return the minutes if fresh = 0, else −1.',
 tc:'O(m · n)',sc:'O(m · n)',
 py:`from collections import deque

class Solution:
    def orangesRotting(self, grid: list[list[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        q, fresh = deque(), 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 2:
                    q.append((r, c))
                elif grid[r][c] == 1:
                    fresh += 1
        minutes = 0
        while q and fresh:
            for _ in range(len(q)):              # one minute = one BFS level
                r, c = q.popleft()
                for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                        grid[nr][nc] = 2
                        fresh -= 1
                        q.append((nr, nc))
            minutes += 1
        return minutes if fresh == 0 else -1`,
 js:`function orangesRotting(grid) {
  const rows = grid.length, cols = grid[0].length;
  let q = [], fresh = 0, minutes = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (grid[r][c] === 2) q.push([r, c]); else if (grid[r][c] === 1) fresh++;
  }
  while (q.length && fresh) {
    const next = [];
    for (const [r, c] of q) {
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && grid[nr][nc] === 1) {
          grid[nr][nc] = 2; fresh--; next.push([nr, nc]);
        }
      }
    }
    q = next;
    minutes++;
  }
  return fresh === 0 ? minutes : -1;
}`,
 java:`class Solution {
    public int orangesRotting(int[][] grid) {
        int rows = grid.length, cols = grid[0].length, fresh = 0, minutes = 0;
        Deque<int[]> q = new ArrayDeque<>();
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == 2) q.add(new int[]{r, c});
                else if (grid[r][c] == 1) fresh++;
            }
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        while (!q.isEmpty() && fresh > 0) {
            for (int i = q.size(); i > 0; i--) {
                int[] cell = q.poll();
                for (int[] d : dirs) {
                    int nr = cell[0] + d[0], nc = cell[1] + d[1];
                    if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && grid[nr][nc] == 1) {
                        grid[nr][nc] = 2; fresh--; q.add(new int[]{nr, nc});
                    }
                }
            }
            minutes++;
        }
        return fresh == 0 ? minutes : -1;
    }
}`,
 cpp:`class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        int rows = grid.size(), cols = grid[0].size(), fresh = 0, minutes = 0;
        queue<pair<int, int>> q;
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == 2) q.push({r, c});
                else if (grid[r][c] == 1) fresh++;
            }
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        while (!q.empty() && fresh > 0) {
            for (int i = q.size(); i > 0; i--) {
                auto [r, c] = q.front(); q.pop();
                for (int k = 0; k < 4; k++) {
                    int nr = r + dr[k], nc = c + dc[k];
                    if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && grid[nr][nc] == 1) {
                        grid[nr][nc] = 2; fresh--; q.push({nr, nc});
                    }
                }
            }
            minutes++;
        }
        return fresh == 0 ? minutes : -1;
    }
};`});

P({n:286,s:'walls-and-gates',t:'Walls and Gates',c:'graphs',d:'Medium',prem:1,rel:['bfs'],
 sum:'A grid holds −1 (wall), 0 (gate) and 2147483647 (empty room). Fill each empty room with its distance to the nearest gate, leaving unreachable rooms as they are.',
 ex:'Each room becomes its step distance to the closest gate',
 h:['A BFS from each room separately is too slow.','Start one BFS from all gates simultaneously.','The first time BFS reaches a room, it arrives from the nearest gate, so set the distance and never revisit.'],
 app:'Enqueue every gate. Pop cells in BFS order; for each neighbor that is still an empty room (value 2147483647), set it to the current cell’s value + 1 and enqueue it. Walls and already-filled rooms are skipped.',
 tc:'O(m · n)',sc:'O(m · n)',
 py:`from collections import deque

class Solution:
    def wallsAndGates(self, rooms: list[list[int]]) -> None:
        EMPTY = 2147483647
        rows, cols = len(rooms), len(rooms[0])
        q = deque((r, c) for r in range(rows) for c in range(cols) if rooms[r][c] == 0)
        while q:
            r, c = q.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < cols and rooms[nr][nc] == EMPTY:
                    rooms[nr][nc] = rooms[r][c] + 1       # first visit = nearest gate
                    q.append((nr, nc))`,
 js:`function wallsAndGates(rooms) {
  const EMPTY = 2147483647, rows = rooms.length, cols = rooms[0].length, q = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (rooms[r][c] === 0) q.push([r, c]);
  for (let head = 0; head < q.length; head++) {
    const [r, c] = q[head];
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && rooms[nr][nc] === EMPTY) {
        rooms[nr][nc] = rooms[r][c] + 1;
        q.push([nr, nc]);
      }
    }
  }
}`,
 java:`class Solution {
    public void wallsAndGates(int[][] rooms) {
        int rows = rooms.length, cols = rooms[0].length;
        Deque<int[]> q = new ArrayDeque<>();
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++) if (rooms[r][c] == 0) q.add(new int[]{r, c});
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        while (!q.isEmpty()) {
            int[] cell = q.poll();
            for (int[] d : dirs) {
                int nr = cell[0] + d[0], nc = cell[1] + d[1];
                if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && rooms[nr][nc] == Integer.MAX_VALUE) {
                    rooms[nr][nc] = rooms[cell[0]][cell[1]] + 1;
                    q.add(new int[]{nr, nc});
                }
            }
        }
    }
}`,
 cpp:`class Solution {
public:
    void wallsAndGates(vector<vector<int>>& rooms) {
        int rows = rooms.size(), cols = rooms[0].size();
        queue<pair<int, int>> q;
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++) if (rooms[r][c] == 0) q.push({r, c});
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        while (!q.empty()) {
            auto [r, c] = q.front(); q.pop();
            for (int k = 0; k < 4; k++) {
                int nr = r + dr[k], nc = c + dc[k];
                if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && rooms[nr][nc] == INT_MAX) {
                    rooms[nr][nc] = rooms[r][c] + 1;
                    q.push({nr, nc});
                }
            }
        }
    }
};`});

P({n:207,s:'course-schedule',t:'Course Schedule',c:'graphs',d:'Medium',rel:['topo'],
 sum:'There are numCourses courses and a list of prerequisite pairs [a, b] meaning b must be taken before a. Decide whether all courses can be finished.',
 ex:'2 courses, [[1, 0]] → true · [[1, 0], [0, 1]] → false',
 h:['Model courses as a directed graph with edges b → a.','All courses can be finished exactly when the graph has no cycle.','Kahn’s topological sort detects cycles: count how many courses get processed.'],
 app:'Build adjacency lists and in-degrees. Queue every course with in-degree 0. Repeatedly take one, count it, and decrement its dependents’ in-degrees, queuing those that reach 0. If every course was counted there is no cycle. A three-color DFS is the alternative.',
 tc:'O(V + E)',sc:'O(V + E)',
 py:`from collections import deque

class Solution:
    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> bool:
        graph = [[] for _ in range(numCourses)]
        indeg = [0] * numCourses
        for a, b in prerequisites:
            graph[b].append(a)
            indeg[a] += 1
        q = deque(i for i in range(numCourses) if indeg[i] == 0)
        taken = 0
        while q:
            u = q.popleft()
            taken += 1
            for v in graph[u]:
                indeg[v] -= 1
                if indeg[v] == 0:
                    q.append(v)
        return taken == numCourses           # fewer means a cycle`,
 js:`function canFinish(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []), indeg = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) { graph[b].push(a); indeg[a]++; }
  const q = [];
  for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) q.push(i);
  for (let head = 0; head < q.length; head++) for (const v of graph[q[head]]) if (--indeg[v] === 0) q.push(v);
  return q.length === numCourses;
}`,
 java:`class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());
        int[] indeg = new int[numCourses];
        for (int[] p : prerequisites) { graph.get(p[1]).add(p[0]); indeg[p[0]]++; }
        Deque<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) q.add(i);
        int taken = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            taken++;
            for (int v : graph.get(u)) if (--indeg[v] == 0) q.add(v);
        }
        return taken == numCourses;
    }
}`,
 cpp:`class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> graph(numCourses);
        vector<int> indeg(numCourses, 0);
        for (auto& p : prerequisites) { graph[p[1]].push_back(p[0]); indeg[p[0]]++; }
        queue<int> q;
        for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) q.push(i);
        int taken = 0;
        while (!q.empty()) {
            int u = q.front(); q.pop();
            taken++;
            for (int v : graph[u]) if (--indeg[v] == 0) q.push(v);
        }
        return taken == numCourses;
    }
};`});

P({n:210,s:'course-schedule-ii',t:'Course Schedule II',c:'graphs',d:'Medium',rel:['topo'],
 sum:'Same setup as Course Schedule, but return an order in which all courses can be taken, or an empty list if that’s impossible.',
 ex:'4 courses, [[1, 0], [2, 0], [3, 1], [3, 2]] → [0, 1, 2, 3] (or [0, 2, 1, 3])',
 h:['This asks for the topological order itself.','Kahn’s algorithm produces it as it processes courses.','If the order is shorter than numCourses, a cycle blocked some courses.'],
 app:'Run Kahn’s algorithm exactly as in Course Schedule, appending each course to the order as it leaves the queue. Return the order if it contains every course, otherwise an empty list.',
 tc:'O(V + E)',sc:'O(V + E)',
 py:`from collections import deque

class Solution:
    def findOrder(self, numCourses: int, prerequisites: list[list[int]]) -> list[int]:
        graph = [[] for _ in range(numCourses)]
        indeg = [0] * numCourses
        for a, b in prerequisites:
            graph[b].append(a)
            indeg[a] += 1
        q = deque(i for i in range(numCourses) if indeg[i] == 0)
        order = []
        while q:
            u = q.popleft()
            order.append(u)
            for v in graph[u]:
                indeg[v] -= 1
                if indeg[v] == 0:
                    q.append(v)
        return order if len(order) == numCourses else []`,
 js:`function findOrder(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []), indeg = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) { graph[b].push(a); indeg[a]++; }
  const order = [];
  for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) order.push(i);
  for (let head = 0; head < order.length; head++)
    for (const v of graph[order[head]]) if (--indeg[v] === 0) order.push(v);
  return order.length === numCourses ? order : [];
}`,
 java:`class Solution {
    public int[] findOrder(int numCourses, int[][] prerequisites) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());
        int[] indeg = new int[numCourses];
        for (int[] p : prerequisites) { graph.get(p[1]).add(p[0]); indeg[p[0]]++; }
        int[] order = new int[numCourses];
        int head = 0, tail = 0;
        for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) order[tail++] = i;
        while (head < tail) {
            int u = order[head++];
            for (int v : graph.get(u)) if (--indeg[v] == 0) order[tail++] = v;
        }
        return tail == numCourses ? order : new int[0];
    }
}`,
 cpp:`class Solution {
public:
    vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> graph(numCourses);
        vector<int> indeg(numCourses, 0), order;
        for (auto& p : prerequisites) { graph[p[1]].push_back(p[0]); indeg[p[0]]++; }
        for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) order.push_back(i);
        for (size_t head = 0; head < order.size(); head++)
            for (int v : graph[order[head]]) if (--indeg[v] == 0) order.push_back(v);
        if ((int)order.size() != numCourses) order.clear();
        return order;
    }
};`});

P({n:684,s:'redundant-connection',t:'Redundant Connection',c:'graphs',d:'Medium',rel:['unionfind'],
 sum:'A tree on nodes 1..n had one extra edge added, creating exactly one cycle. Return the edge that can be removed to restore a tree; if several qualify, return the one listed last.',
 ex:'[[1, 2], [1, 3], [2, 3]] → [2, 3]',
 h:['Add edges one at a time and watch for the first one that closes a cycle.','An edge closes a cycle when its endpoints are already connected.','Union–find answers “already connected?” in nearly O(1).'],
 app:'Process edges in order with a union–find. For each edge (u, v), if find(u) = find(v) they are already connected, so this edge is the redundant one; return it. Otherwise union them. Because edges are processed in input order, the edge returned is the last one that could complete the cycle.',
 tc:'O(n · α(n))',sc:'O(n)',
 py:`class Solution:
    def findRedundantConnection(self, edges: list[list[int]]) -> list[int]:
        parent = list(range(len(edges) + 1))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        for u, v in edges:
            ru, rv = find(u), find(v)
            if ru == rv:
                return [u, v]               # already connected: this edge makes the cycle
            parent[ru] = rv
        return []`,
 js:`function findRedundantConnection(edges) {
  const parent = Array.from({ length: edges.length + 1 }, (_, i) => i);
  const find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  for (const [u, v] of edges) {
    const ru = find(u), rv = find(v);
    if (ru === rv) return [u, v];
    parent[ru] = rv;
  }
  return [];
}`,
 java:`class Solution {
    private int[] parent;

    public int[] findRedundantConnection(int[][] edges) {
        parent = new int[edges.length + 1];
        for (int i = 0; i < parent.length; i++) parent[i] = i;
        for (int[] e : edges) {
            int ru = find(e[0]), rv = find(e[1]);
            if (ru == rv) return e;
            parent[ru] = rv;
        }
        return new int[0];
    }

    private int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
}`,
 cpp:`class Solution {
    vector<int> parent;
    int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
public:
    vector<int> findRedundantConnection(vector<vector<int>>& edges) {
        parent.resize(edges.size() + 1);
        iota(parent.begin(), parent.end(), 0);
        for (auto& e : edges) {
            int ru = find(e[0]), rv = find(e[1]);
            if (ru == rv) return e;
            parent[ru] = rv;
        }
        return {};
    }
};`});

P({n:323,s:'number-of-connected-components-in-an-undirected-graph',t:'Number of Connected Components in an Undirected Graph',c:'graphs',d:'Medium',prem:1,rel:['unionfind','dfs'],
 sum:'Given n nodes labeled 0..n − 1 and a list of undirected edges, count the connected components.',
 ex:'n = 5, edges [[0, 1], [1, 2], [3, 4]] → 2',
 h:['Start with n separate components.','Each edge that joins two different components reduces the count by one.','Union–find tracks this directly; DFS from each unvisited node works too.'],
 app:'Initialize a union–find with n sets and count = n. For each edge, if its endpoints have different roots, union them and decrement count. The final count is the number of components.',
 tc:'O(n + E · α(n))',sc:'O(n)',
 py:`class Solution:
    def countComponents(self, n: int, edges: list[list[int]]) -> int:
        parent = list(range(n))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        count = n
        for u, v in edges:
            ru, rv = find(u), find(v)
            if ru != rv:
                parent[ru] = rv
                count -= 1                  # two components became one
        return count`,
 js:`function countComponents(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  let count = n;
  for (const [u, v] of edges) {
    const ru = find(u), rv = find(v);
    if (ru !== rv) { parent[ru] = rv; count--; }
  }
  return count;
}`,
 java:`class Solution {
    private int[] parent;

    public int countComponents(int n, int[][] edges) {
        parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        int count = n;
        for (int[] e : edges) {
            int ru = find(e[0]), rv = find(e[1]);
            if (ru != rv) { parent[ru] = rv; count--; }
        }
        return count;
    }

    private int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
}`,
 cpp:`class Solution {
    vector<int> parent;
    int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
public:
    int countComponents(int n, vector<vector<int>>& edges) {
        parent.resize(n);
        iota(parent.begin(), parent.end(), 0);
        int count = n;
        for (auto& e : edges) {
            int ru = find(e[0]), rv = find(e[1]);
            if (ru != rv) { parent[ru] = rv; count--; }
        }
        return count;
    }
};`});

P({n:261,s:'graph-valid-tree',t:'Graph Valid Tree',c:'graphs',d:'Medium',prem:1,rel:['unionfind'],
 sum:'Given n nodes and a list of undirected edges, decide whether they form a valid tree: connected and without cycles.',
 ex:'n = 5, [[0, 1], [0, 2], [0, 3], [1, 4]] → true',
 h:['A tree on n nodes has exactly n − 1 edges.','With exactly n − 1 edges, no cycle implies connected (and vice versa).','Check the edge count, then use union–find to detect a cycle.'],
 app:'If the edge count isn’t n − 1, return false. Otherwise union the endpoints of each edge; if any edge joins two nodes already in the same set, there is a cycle. If no cycle appears, the graph is a tree.',
 tc:'O(n · α(n))',sc:'O(n)',
 py:`class Solution:
    def validTree(self, n: int, edges: list[list[int]]) -> bool:
        if len(edges) != n - 1:
            return False
        parent = list(range(n))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        for u, v in edges:
            ru, rv = find(u), find(v)
            if ru == rv:
                return False                # cycle
            parent[ru] = rv
        return True`,
 js:`function validTree(n, edges) {
  if (edges.length !== n - 1) return false;
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  for (const [u, v] of edges) {
    const ru = find(u), rv = find(v);
    if (ru === rv) return false;
    parent[ru] = rv;
  }
  return true;
}`,
 java:`class Solution {
    private int[] parent;

    public boolean validTree(int n, int[][] edges) {
        if (edges.length != n - 1) return false;
        parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        for (int[] e : edges) {
            int ru = find(e[0]), rv = find(e[1]);
            if (ru == rv) return false;
            parent[ru] = rv;
        }
        return true;
    }

    private int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
}`,
 cpp:`class Solution {
    vector<int> parent;
    int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
public:
    bool validTree(int n, vector<vector<int>>& edges) {
        if ((int)edges.size() != n - 1) return false;
        parent.resize(n);
        iota(parent.begin(), parent.end(), 0);
        for (auto& e : edges) {
            int ru = find(e[0]), rv = find(e[1]);
            if (ru == rv) return false;
            parent[ru] = rv;
        }
        return true;
    }
};`});

P({n:127,s:'word-ladder',t:'Word Ladder',c:'graphs',d:'Hard',rel:['bfs'],
 sum:'Transform beginWord into endWord by changing one letter at a time, where every intermediate word must be in the word list. Return the number of words in the shortest such sequence, or 0.',
 ex:'"hit" → "cog" with ["hot", "dot", "dog", "lot", "log", "cog"] → 5 (hit, hot, dot, dog, cog)',
 h:['Words are nodes; one-letter differences are edges. Shortest path in an unweighted graph means BFS.','Comparing every pair of words to build edges is O(n² · L).','Group words by wildcard patterns like "h*t": words sharing a pattern are neighbors.'],
 app:'Precompute a map from each pattern (word with one letter replaced by *) to the words matching it. BFS from beginWord, level by level. For each word, look up its L patterns to find neighbors, skipping visited words. Return the level count when endWord is reached. The Java and C++ versions instead try all 26 letters at each position and check a hash set, which finds the same neighbors in O(26 · L) per word.',
 tc:'O(n · L²)',sc:'O(n · L²)',
 py:`from collections import defaultdict, deque

class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: list[str]) -> int:
        if endWord not in wordList:
            return 0
        patterns = defaultdict(list)            # "h*t" -> ["hot", "hit", ...]
        for w in wordList + [beginWord]:
            for i in range(len(w)):
                patterns[w[:i] + "*" + w[i + 1:]].append(w)
        seen, q, steps = {beginWord}, deque([beginWord]), 1
        while q:
            for _ in range(len(q)):
                w = q.popleft()
                if w == endWord:
                    return steps
                for i in range(len(w)):
                    for nb in patterns[w[:i] + "*" + w[i + 1:]]:
                        if nb not in seen:
                            seen.add(nb)
                            q.append(nb)
            steps += 1
        return 0`,
 js:`function ladderLength(beginWord, endWord, wordList) {
  if (!wordList.includes(endWord)) return 0;
  const patterns = new Map();
  for (const w of [...wordList, beginWord]) {
    for (let i = 0; i < w.length; i++) {
      const p = w.slice(0, i) + "*" + w.slice(i + 1);
      if (!patterns.has(p)) patterns.set(p, []);
      patterns.get(p).push(w);
    }
  }
  const seen = new Set([beginWord]);
  let level = [beginWord], steps = 1;
  while (level.length) {
    const next = [];
    for (const w of level) {
      if (w === endWord) return steps;
      for (let i = 0; i < w.length; i++) {
        for (const nb of patterns.get(w.slice(0, i) + "*" + w.slice(i + 1))) {
          if (!seen.has(nb)) { seen.add(nb); next.push(nb); }
        }
      }
    }
    level = next;
    steps++;
  }
  return 0;
}`,
 java:`class Solution {
    public int ladderLength(String beginWord, String endWord, List<String> wordList) {
        Set<String> words = new HashSet<>(wordList);
        if (!words.contains(endWord)) return 0;
        Deque<String> q = new ArrayDeque<>(List.of(beginWord));
        Set<String> seen = new HashSet<>(List.of(beginWord));
        int steps = 1;
        while (!q.isEmpty()) {
            for (int k = q.size(); k > 0; k--) {
                String w = q.poll();
                if (w.equals(endWord)) return steps;
                char[] chars = w.toCharArray();
                for (int i = 0; i < chars.length; i++) {          // try every one-letter change
                    char orig = chars[i];
                    for (char c = 'a'; c <= 'z'; c++) {
                        chars[i] = c;
                        String nb = new String(chars);
                        if (words.contains(nb) && seen.add(nb)) q.add(nb);
                    }
                    chars[i] = orig;
                }
            }
            steps++;
        }
        return 0;
    }
}`,
 cpp:`class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        unordered_set<string> words(wordList.begin(), wordList.end());
        if (!words.count(endWord)) return 0;
        queue<string> q;
        q.push(beginWord);
        unordered_set<string> seen{beginWord};
        int steps = 1;
        while (!q.empty()) {
            for (int k = q.size(); k > 0; k--) {
                string w = q.front(); q.pop();
                if (w == endWord) return steps;
                for (size_t i = 0; i < w.size(); i++) {          // try every one-letter change
                    char orig = w[i];
                    for (char c = 'a'; c <= 'z'; c++) {
                        w[i] = c;
                        if (words.count(w) && seen.insert(w).second) q.push(w);
                    }
                    w[i] = orig;
                }
            }
            steps++;
        }
        return 0;
    }
};`});
