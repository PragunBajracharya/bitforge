/* ===== Problems batch 1: Arrays & Hashing, Two Pointers, Sliding Window, Stack ===== */

P({n:217,s:'contains-duplicate',t:'Contains Duplicate',c:'hashing',d:'Easy',rel:['bubble'],
 sum:'Given an array of integers, decide whether any value occurs more than once.',
 ex:'[1, 2, 3, 1] → true · [1, 2, 3, 4] → false',
 h:['Comparing every pair works, but costs O(n²).','You need a structure that answers “have I seen this value?” in O(1).','Walk the array, adding each value to a hash set. A value already in the set is a duplicate.'],
 app:'Keep a hash set of values seen so far. For each value, if it is already in the set, return true; otherwise add it. Sorting and checking adjacent pairs also works in O(n log n) time with O(1) extra space.',
 tc:'O(n)',sc:'O(n)',
 test:{fn:'containsDuplicate',cases:[[[[1,2,3,1]],true],[[[1,2,3,4]],false],[[[1,1,1,3,3,4,3,2,4,2]],true]]},
 py:`class Solution:
    def containsDuplicate(self, nums: list[int]) -> bool:
        seen = set()
        for x in nums:
            if x in seen:
                return True
            seen.add(x)
        return False`,
 js:`function containsDuplicate(nums) {
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}`,
 java:`class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int x : nums) {
            if (!seen.add(x)) return true;   // add() returns false if already present
        }
        return false;
    }
}`,
 cpp:`class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> seen;
        for (int x : nums) {
            if (!seen.insert(x).second) return true;   // insert fails if already present
        }
        return false;
    }
};`});

P({n:242,s:'valid-anagram',t:'Valid Anagram',c:'hashing',d:'Easy',rel:['counting'],
 sum:'Decide whether string t uses exactly the same letters as string s, each the same number of times.',
 ex:'"anagram", "nagaram" → true · "rat", "car" → false',
 h:['Different lengths can never be anagrams.','Sorting both strings and comparing works in O(n log n).','Count letters: add 1 for each letter of s, subtract 1 for each letter of t. Every count must end at zero.'],
 app:'Use an array of 26 counters. Increment for characters of s and decrement for characters of t in the same loop. The strings are anagrams exactly when every counter returns to zero. For Unicode input, use a hash map instead of a fixed array.',
 tc:'O(n)',sc:'O(1) (26 counters)',
 test:{fn:'isAnagram',cases:[[["anagram","nagaram"],true],[["rat","car"],false],[["a","ab"],false]]},
 py:`class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False
        count = [0] * 26
        for a, b in zip(s, t):
            count[ord(a) - ord("a")] += 1
            count[ord(b) - ord("a")] -= 1
        return all(c == 0 for c in count)`,
 js:`function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = new Array(26).fill(0);
  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - 97]++;
    count[t.charCodeAt(i) - 97]--;
  }
  return count.every(c => c === 0);
}`,
 java:`class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] count = new int[26];
        for (int i = 0; i < s.length(); i++) {
            count[s.charAt(i) - 'a']++;
            count[t.charAt(i) - 'a']--;
        }
        for (int c : count) if (c != 0) return false;
        return true;
    }
}`,
 cpp:`class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.size() != t.size()) return false;
        int count[26] = {0};
        for (size_t i = 0; i < s.size(); i++) {
            count[s[i] - 'a']++;
            count[t[i] - 'a']--;
        }
        for (int c : count) if (c != 0) return false;
        return true;
    }
};`});

P({n:1,s:'two-sum',t:'Two Sum',c:'hashing',d:'Easy',rel:['twopointers'],
 sum:'Return the indices of the two numbers in the array that add up to the target. Exactly one answer exists, and the same element can’t be used twice.',
 ex:'[2, 7, 11, 15], target 9 → [0, 1]',
 h:['The brute force checks every pair: O(n²).','For each number x, the partner you need is target − x.','Store each value’s index in a hash map as you go, and check whether the needed partner is already there.'],
 app:'Scan left to right with a map from value to index. At each x, look up target − x. If it is present, its index and the current index are the answer. Otherwise store x. Checking before storing prevents pairing an element with itself.',
 tc:'O(n)',sc:'O(n)',
 test:{fn:'twoSum',cases:[[[[2,7,11,15],9],[0,1]],[[[3,2,4],6],[1,2]],[[[3,3],6],[0,1]]]},
 py:`class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        index = {}                          # value -> index
        for i, x in enumerate(nums):
            if target - x in index:
                return [index[target - x], i]
            index[x] = i
        return []`,
 js:`function twoSum(nums, target) {
  const index = new Map();               // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (index.has(need)) return [index.get(need), i];
    index.set(nums[i], i);
  }
  return [];
}`,
 java:`class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> index = new HashMap<>();   // value -> index
        for (int i = 0; i < nums.length; i++) {
            Integer j = index.get(target - nums[i]);
            if (j != null) return new int[]{j, i};
            index.put(nums[i], i);
        }
        return new int[0];
    }
}`,
 cpp:`class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> index;   // value -> index
        for (int i = 0; i < (int)nums.size(); i++) {
            auto it = index.find(target - nums[i]);
            if (it != index.end()) return {it->second, i};
            index[nums[i]] = i;
        }
        return {};
    }
};`});

P({n:49,s:'group-anagrams',t:'Group Anagrams',c:'hashing',d:'Medium',rel:['counting'],
 sum:'Group a list of words so that words made of the same letters end up together.',
 ex:'["eat", "tea", "tan", "ate", "nat", "bat"] → [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]',
 h:['Anagrams become identical once you sort their letters.','You need a key that is the same for all anagrams of a word.','Use a 26-letter count (or the sorted word) as a hash map key and collect words under it.'],
 app:'For each word, build a signature: the counts of each letter a–z. Anagrams share a signature. Append each word to the list stored under its signature in a hash map, then return the map’s values. Sorting each word as the key also works, at O(k log k) per word.',
 tc:'O(n · k)',sc:'O(n · k)',
 test:{fn:'groupAnagrams',cmp:'sortinner',cases:[[[["eat","tea","tan","ate","nat","bat"]],[["bat"],["nat","tan"],["ate","eat","tea"]]],[[[""]],[[""]]],[[["a"]],[["a"]]]]},
 py:`from collections import defaultdict

class Solution:
    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:
        groups = defaultdict(list)
        for s in strs:
            key = [0] * 26
            for ch in s:
                key[ord(ch) - ord("a")] += 1
            groups[tuple(key)].append(s)     # anagrams share the same counts
        return list(groups.values())`,
 js:`function groupAnagrams(strs) {
  const groups = new Map();
  for (const s of strs) {
    const count = new Array(26).fill(0);
    for (const ch of s) count[ch.charCodeAt(0) - 97]++;
    const key = count.join(",");          // anagrams share the same counts
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  return [...groups.values()];
}`,
 java:`class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String s : strs) {
            int[] count = new int[26];
            for (char ch : s.toCharArray()) count[ch - 'a']++;
            groups.computeIfAbsent(Arrays.toString(count), k -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(groups.values());
    }
}`,
 cpp:`class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups;
        for (auto& s : strs) {
            string key(26, 0);                 // letter counts as a 26-char key
            for (char ch : s) key[ch - 'a']++;
            groups[key].push_back(s);
        }
        vector<vector<string>> res;
        for (auto& [key, words] : groups) res.push_back(move(words));
        return res;
    }
};`});

P({n:347,s:'top-k-frequent-elements',t:'Top K Frequent Elements',c:'hashing',d:'Medium',rel:['counting','binheap'],
 sum:'Return the k values that appear most often in the array, in any order.',
 ex:'[1, 1, 1, 2, 2, 3], k = 2 → [1, 2]',
 h:['First count each value with a hash map.','Sorting by count is O(n log n); a heap of size k is O(n log k).','A count can be at most n, so you can bucket values by count and read buckets from high to low: O(n).'],
 app:'Count frequencies, then place each value into bucket[count], where buckets are indexed 0..n. Walk the buckets from the highest count down, collecting values until you have k. This bucket sort avoids comparison sorting entirely.',
 tc:'O(n)',sc:'O(n)',
 test:{fn:'topKFrequent',cmp:'sorted',cases:[[[[1,1,1,2,2,3],2],[1,2]],[[[1],1],[1]],[[[4,4,5,5,5,6],1],[5]]]},
 py:`class Solution:
    def topKFrequent(self, nums: list[int], k: int) -> list[int]:
        count = {}
        for x in nums:
            count[x] = count.get(x, 0) + 1
        buckets = [[] for _ in range(len(nums) + 1)]   # buckets[f] = values seen f times
        for x, f in count.items():
            buckets[f].append(x)
        res = []
        for f in range(len(buckets) - 1, 0, -1):
            for x in buckets[f]:
                res.append(x)
                if len(res) == k:
                    return res
        return res`,
 js:`function topKFrequent(nums, k) {
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) || 0) + 1);
  const buckets = Array.from({ length: nums.length + 1 }, () => []);   // buckets[f]
  for (const [x, f] of count) buckets[f].push(x);
  const res = [];
  for (let f = buckets.length - 1; f > 0 && res.length < k; f--) {
    for (const x of buckets[f]) {
      res.push(x);
      if (res.length === k) break;
    }
  }
  return res;
}`,
 java:`class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int x : nums) count.merge(x, 1, Integer::sum);
        List<List<Integer>> buckets = new ArrayList<>();
        for (int i = 0; i <= nums.length; i++) buckets.add(new ArrayList<>());
        for (var e : count.entrySet()) buckets.get(e.getValue()).add(e.getKey());
        int[] res = new int[k];
        int idx = 0;
        for (int f = nums.length; f > 0 && idx < k; f--)
            for (int x : buckets.get(f)) {
                res[idx++] = x;
                if (idx == k) break;
            }
        return res;
    }
}`,
 cpp:`class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> count;
        for (int x : nums) count[x]++;
        vector<vector<int>> buckets(nums.size() + 1);   // buckets[f]
        for (auto& [x, f] : count) buckets[f].push_back(x);
        vector<int> res;
        for (int f = nums.size(); f > 0 && (int)res.size() < k; f--)
            for (int x : buckets[f]) {
                res.push_back(x);
                if ((int)res.size() == k) break;
            }
        return res;
    }
};`});

P({n:271,s:'encode-and-decode-strings',t:'Encode and Decode Strings',c:'hashing',d:'Medium',prem:1,rel:[],
 sum:'Design an encoder that turns a list of strings into one string, and a decoder that recovers the exact list. The strings may contain any characters, including your delimiter.',
 ex:'["neet", "code"] → "4#neet4#code" → ["neet", "code"]',
 h:['Joining with a delimiter breaks if a string contains the delimiter.','What if each piece announced its own length first?','Write len + "#" + string for each item. When decoding, read digits up to "#", then take exactly that many characters.'],
 app:'Length-prefix each string: "5#hello". The decoder reads the number up to the first "#" after its position, then slices exactly that many characters, so any "#" inside a string is treated as data. This is how many network protocols frame messages.',
 tc:'O(total length)',sc:'O(total length)',
 test:{custom:'codec',cases:[["neet","code","love","you"],["we","say",":","yes","#3#",""],[""],[]]},
 py:`class Codec:
    def encode(self, strs: list[str]) -> str:
        return "".join(f"{len(s)}#{s}" for s in strs)

    def decode(self, s: str) -> list[str]:
        res, i = [], 0
        while i < len(s):
            j = s.index("#", i)               # end of the length prefix
            n = int(s[i:j])
            res.append(s[j + 1 : j + 1 + n])
            i = j + 1 + n
        return res`,
 js:`function encode(strs) {
  return strs.map(s => s.length + "#" + s).join("");
}

function decode(s) {
  const res = [];
  let i = 0;
  while (i < s.length) {
    const j = s.indexOf("#", i);          // end of the length prefix
    const n = Number(s.slice(i, j));
    res.push(s.slice(j + 1, j + 1 + n));
    i = j + 1 + n;
  }
  return res;
}`,
 java:`class Codec {
    public String encode(List<String> strs) {
        StringBuilder sb = new StringBuilder();
        for (String s : strs) sb.append(s.length()).append('#').append(s);
        return sb.toString();
    }

    public List<String> decode(String s) {
        List<String> res = new ArrayList<>();
        int i = 0;
        while (i < s.length()) {
            int j = s.indexOf('#', i);            // end of the length prefix
            int n = Integer.parseInt(s.substring(i, j));
            res.add(s.substring(j + 1, j + 1 + n));
            i = j + 1 + n;
        }
        return res;
    }
}`,
 cpp:`class Codec {
public:
    string encode(vector<string>& strs) {
        string out;
        for (auto& s : strs) out += to_string(s.size()) + "#" + s;
        return out;
    }

    vector<string> decode(string s) {
        vector<string> res;
        size_t i = 0;
        while (i < s.size()) {
            size_t j = s.find('#', i);            // end of the length prefix
            int n = stoi(s.substr(i, j - i));
            res.push_back(s.substr(j + 1, n));
            i = j + 1 + n;
        }
        return res;
    }
};`});

P({n:238,s:'product-of-array-except-self',t:'Product of Array Except Self',c:'hashing',d:'Medium',rel:['prefixsum'],
 sum:'For each index, return the product of every other element, without using division and in linear time.',
 ex:'[1, 2, 3, 4] → [24, 12, 8, 6]',
 h:['Division fails when there are zeros, and it is not allowed anyway.','The answer at i is (product of everything left of i) × (product of everything right of i).','Fill the output with prefix products in one pass, then multiply in suffix products in a backward pass.'],
 app:'First pass: res[i] = product of nums[0..i−1], built with a running prefix. Second pass from the right: multiply res[i] by a running suffix product of nums[i+1..n−1]. The output array doubles as the prefix storage, so extra space is O(1).',
 tc:'O(n)',sc:'O(1) extra',
 test:{fn:'productExceptSelf',cases:[[[[1,2,3,4]],[24,12,8,6]],[[[-1,1,0,-3,3]],[0,0,9,0,0]]]},
 py:`class Solution:
    def productExceptSelf(self, nums: list[int]) -> list[int]:
        n = len(nums)
        res = [1] * n
        prefix = 1
        for i in range(n):                 # res[i] = product of everything left of i
            res[i] = prefix
            prefix *= nums[i]
        suffix = 1
        for i in range(n - 1, -1, -1):     # multiply in everything right of i
            res[i] *= suffix
            suffix *= nums[i]
        return res`,
 js:`function productExceptSelf(nums) {
  const n = nums.length, res = new Array(n).fill(1);
  let prefix = 1;
  for (let i = 0; i < n; i++) { res[i] = prefix; prefix *= nums[i]; }
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) { res[i] *= suffix; suffix *= nums[i]; }
  return res.map(x => x + 0);   // normalizes -0 to 0
}`,
 java:`class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] res = new int[n];
        int prefix = 1;
        for (int i = 0; i < n; i++) { res[i] = prefix; prefix *= nums[i]; }
        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) { res[i] *= suffix; suffix *= nums[i]; }
        return res;
    }
}`,
 cpp:`class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> res(n, 1);
        int prefix = 1;
        for (int i = 0; i < n; i++) { res[i] = prefix; prefix *= nums[i]; }
        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) { res[i] *= suffix; suffix *= nums[i]; }
        return res;
    }
};`});

const SUDOKU_OK=[["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]];
const SUDOKU_BAD=SUDOKU_OK.map((r,i)=>i===0?["8",...r.slice(1)]:r);
P({n:36,s:'valid-sudoku',t:'Valid Sudoku',c:'hashing',d:'Medium',rel:[],
 sum:'Check whether a partially filled 9 × 9 Sudoku board breaks any rule: no repeated digit in a row, a column, or one of the nine 3 × 3 boxes. Empty cells are “.”.',
 ex:'A board with two 8s in its first column → false',
 h:['You only need to check the filled cells against the rules, not solve the puzzle.','Keep a set of seen digits for every row, every column and every box.','Cell (r, c) belongs to box (r / 3) × 3 + c / 3.'],
 app:'Make 9 sets for rows, 9 for columns and 9 for boxes. For each filled cell, compute its box index and check all three sets; a repeat means the board is invalid. Otherwise add the digit to all three. The board is fixed at 81 cells, so this is constant time.',
 tc:'O(81) = O(1)',sc:'O(81) = O(1)',
 test:{fn:'isValidSudoku',cases:[[[SUDOKU_OK],true],[[SUDOKU_BAD],false]]},
 py:`class Solution:
    def isValidSudoku(self, board: list[list[str]]) -> bool:
        rows = [set() for _ in range(9)]
        cols = [set() for _ in range(9)]
        boxes = [set() for _ in range(9)]
        for r in range(9):
            for c in range(9):
                v = board[r][c]
                if v == ".":
                    continue
                b = (r // 3) * 3 + c // 3
                if v in rows[r] or v in cols[c] or v in boxes[b]:
                    return False
                rows[r].add(v)
                cols[c].add(v)
                boxes[b].add(v)
        return True`,
 js:`function isValidSudoku(board) {
  const rows = [], cols = [], boxes = [];
  for (let i = 0; i < 9; i++) { rows.push(new Set()); cols.push(new Set()); boxes.push(new Set()); }
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = board[r][c];
      if (v === ".") continue;
      const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      if (rows[r].has(v) || cols[c].has(v) || boxes[b].has(v)) return false;
      rows[r].add(v); cols[c].add(v); boxes[b].add(v);
    }
  }
  return true;
}`,
 java:`class Solution {
    public boolean isValidSudoku(char[][] board) {
        boolean[][] rows = new boolean[9][9], cols = new boolean[9][9], boxes = new boolean[9][9];
        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                if (board[r][c] == '.') continue;
                int d = board[r][c] - '1', b = (r / 3) * 3 + c / 3;
                if (rows[r][d] || cols[c][d] || boxes[b][d]) return false;
                rows[r][d] = cols[c][d] = boxes[b][d] = true;
            }
        }
        return true;
    }
}`,
 cpp:`class Solution {
public:
    bool isValidSudoku(vector<vector<char>>& board) {
        bool rows[9][9] = {}, cols[9][9] = {}, boxes[9][9] = {};
        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                if (board[r][c] == '.') continue;
                int d = board[r][c] - '1', b = (r / 3) * 3 + c / 3;
                if (rows[r][d] || cols[c][d] || boxes[b][d]) return false;
                rows[r][d] = cols[c][d] = boxes[b][d] = true;
            }
        }
        return true;
    }
};`});

P({n:128,s:'longest-consecutive-sequence',t:'Longest Consecutive Sequence',c:'hashing',d:'Medium',rel:['unionfind'],
 sum:'Find the length of the longest run of consecutive integers (like 1, 2, 3, 4) that can be formed from the array’s values, in O(n) time.',
 ex:'[100, 4, 200, 1, 3, 2] → 4 (the run 1, 2, 3, 4)',
 h:['Sorting gives O(n log n). Can you avoid it?','Put every value in a hash set for O(1) membership tests.','Only start counting from x when x − 1 is not in the set; that way each run is walked exactly once.'],
 app:'Insert all values into a set. For each x whose predecessor x − 1 is absent, x starts a run: count upward while x + 1, x + 2, … are present. Because counting only begins at run starts, every value is visited a constant number of times overall.',
 tc:'O(n)',sc:'O(n)',
 test:{fn:'longestConsecutive',cases:[[[[100,4,200,1,3,2]],4],[[[0,3,7,2,5,8,4,6,0,1]],9],[[[]],0]]},
 py:`class Solution:
    def longestConsecutive(self, nums: list[int]) -> int:
        s = set(nums)
        best = 0
        for x in s:
            if x - 1 not in s:          # x starts a run
                y = x
                while y + 1 in s:
                    y += 1
                best = max(best, y - x + 1)
        return best`,
 js:`function longestConsecutive(nums) {
  const s = new Set(nums);
  let best = 0;
  for (const x of s) {
    if (!s.has(x - 1)) {               // x starts a run
      let y = x;
      while (s.has(y + 1)) y++;
      best = Math.max(best, y - x + 1);
    }
  }
  return best;
}`,
 java:`class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> s = new HashSet<>();
        for (int x : nums) s.add(x);
        int best = 0;
        for (int x : s) {
            if (!s.contains(x - 1)) {          // x starts a run
                int y = x;
                while (s.contains(y + 1)) y++;
                best = Math.max(best, y - x + 1);
            }
        }
        return best;
    }
}`,
 cpp:`class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> s(nums.begin(), nums.end());
        int best = 0;
        for (int x : s) {
            if (!s.count(x - 1)) {             // x starts a run
                int y = x;
                while (s.count(y + 1)) y++;
                best = max(best, y - x + 1);
            }
        }
        return best;
    }
};`});

/* ---------- Two Pointers ---------- */
P({n:125,s:'valid-palindrome',t:'Valid Palindrome',c:'twoptr',d:'Easy',rel:['twopointers'],
 sum:'Ignoring case and every character that isn’t a letter or digit, decide whether the string reads the same forwards and backwards.',
 ex:'"A man, a plan, a canal: Panama" → true · "race a car" → false',
 h:['You could build a cleaned copy and compare it with its reverse, using O(n) extra space.','Or compare in place with one pointer at each end.','Skip non-alphanumeric characters on either side, then compare lowercase versions.'],
 app:'Put i at the start and j at the end. Advance i past characters that are not letters or digits, and move j back likewise. Compare the lowercase characters; any mismatch means false. Move both inward until they meet.',
 tc:'O(n)',sc:'O(1)',
 test:{fn:'isPalindrome',cases:[[["A man, a plan, a canal: Panama"],true],[["race a car"],false],[[" "],true],[["0P"],false]]},
 py:`class Solution:
    def isPalindrome(self, s: str) -> bool:
        i, j = 0, len(s) - 1
        while i < j:
            if not s[i].isalnum():
                i += 1
            elif not s[j].isalnum():
                j -= 1
            elif s[i].lower() != s[j].lower():
                return False
            else:
                i += 1
                j -= 1
        return True`,
 js:`function isPalindrome(s) {
  const ok = ch => /[a-z0-9]/i.test(ch);
  let i = 0, j = s.length - 1;
  while (i < j) {
    if (!ok(s[i])) i++;
    else if (!ok(s[j])) j--;
    else if (s[i].toLowerCase() !== s[j].toLowerCase()) return false;
    else { i++; j--; }
  }
  return true;
}`,
 java:`class Solution {
    public boolean isPalindrome(String s) {
        int i = 0, j = s.length() - 1;
        while (i < j) {
            char a = s.charAt(i), b = s.charAt(j);
            if (!Character.isLetterOrDigit(a)) i++;
            else if (!Character.isLetterOrDigit(b)) j--;
            else if (Character.toLowerCase(a) != Character.toLowerCase(b)) return false;
            else { i++; j--; }
        }
        return true;
    }
}`,
 cpp:`class Solution {
public:
    bool isPalindrome(string s) {
        int i = 0, j = (int)s.size() - 1;
        while (i < j) {
            unsigned char a = s[i], b = s[j];
            if (!isalnum(a)) i++;
            else if (!isalnum(b)) j--;
            else if (tolower(a) != tolower(b)) return false;
            else { i++; j--; }
        }
        return true;
    }
};`});

P({n:167,s:'two-sum-ii-input-array-is-sorted',t:'Two Sum II – Input Array Is Sorted',c:'twoptr',d:'Medium',rel:['twopointers'],
 sum:'The array is sorted ascending. Return the 1-based positions of the two numbers that add up to the target, using only constant extra space.',
 ex:'[2, 7, 11, 15], target 9 → [1, 2]',
 h:['A hash map works but uses O(n) space.','Sorted input means moving an end pointer changes the sum predictably.','Too small? Move the left pointer right. Too big? Move the right pointer left.'],
 app:'Start with i at the smallest value and j at the largest. If their sum is below the target, the smallest value can’t be part of any pair with the remaining elements, so advance i. If it is above, retreat j. Stop on an exact match.',
 tc:'O(n)',sc:'O(1)',
 test:{fn:'twoSum',cases:[[[[2,7,11,15],9],[1,2]],[[[2,3,4],6],[1,3]],[[[-1,0],-1],[1,2]]]},
 py:`class Solution:
    def twoSum(self, numbers: list[int], target: int) -> list[int]:
        i, j = 0, len(numbers) - 1
        while i < j:
            s = numbers[i] + numbers[j]
            if s == target:
                return [i + 1, j + 1]
            if s < target:
                i += 1
            else:
                j -= 1
        return []`,
 js:`function twoSum(numbers, target) {
  let i = 0, j = numbers.length - 1;
  while (i < j) {
    const s = numbers[i] + numbers[j];
    if (s === target) return [i + 1, j + 1];
    if (s < target) i++; else j--;
  }
  return [];
}`,
 java:`class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int i = 0, j = numbers.length - 1;
        while (i < j) {
            int s = numbers[i] + numbers[j];
            if (s == target) return new int[]{i + 1, j + 1};
            if (s < target) i++; else j--;
        }
        return new int[0];
    }
}`,
 cpp:`class Solution {
public:
    vector<int> twoSum(vector<int>& numbers, int target) {
        int i = 0, j = numbers.size() - 1;
        while (i < j) {
            int s = numbers[i] + numbers[j];
            if (s == target) return {i + 1, j + 1};
            if (s < target) i++; else j--;
        }
        return {};
    }
};`});

P({n:15,s:'3sum',t:'3Sum',c:'twoptr',d:'Medium',rel:['twopointers'],
 sum:'Find every unique triplet of values in the array that sums to zero. No triplet may appear twice in the output.',
 ex:'[−1, 0, 1, 2, −1, −4] → [[−1, −1, 2], [−1, 0, 1]]',
 h:['Three nested loops is O(n³). Sorting first helps a lot.','Fix the first number; the other two form a Two Sum II problem on the sorted remainder.','To avoid duplicate triplets, skip equal values for the first number and after each match.'],
 app:'Sort the array. For each index i (skipping repeats of nums[i]), run two pointers on the rest looking for −nums[i]. When a triplet is found, record it and advance the left pointer past equal values. If nums[i] > 0, no later triplet can sum to zero, so stop.',
 tc:'O(n²)',sc:'O(1) extra (besides sorting)',
 test:{fn:'threeSum',cmp:'sortinner',cases:[[[[-1,0,1,2,-1,-4]],[[-1,-1,2],[-1,0,1]]],[[[0,1,1]],[]],[[[0,0,0,0]],[[0,0,0]]]]},
 py:`class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        nums.sort()
        res = []
        for i in range(len(nums) - 2):
            if nums[i] > 0:
                break
            if i > 0 and nums[i] == nums[i - 1]:
                continue                        # skip duplicate first values
            lo, hi = i + 1, len(nums) - 1
            while lo < hi:
                s = nums[i] + nums[lo] + nums[hi]
                if s < 0:
                    lo += 1
                elif s > 0:
                    hi -= 1
                else:
                    res.append([nums[i], nums[lo], nums[hi]])
                    lo += 1
                    while lo < hi and nums[lo] == nums[lo - 1]:
                        lo += 1                 # skip duplicate second values
        return res`,
 js:`function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const res = [];
  for (let i = 0; i < nums.length - 2 && nums[i] <= 0; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;   // skip duplicate first values
    let lo = i + 1, hi = nums.length - 1;
    while (lo < hi) {
      const s = nums[i] + nums[lo] + nums[hi];
      if (s < 0) lo++;
      else if (s > 0) hi--;
      else {
        res.push([nums[i], nums[lo], nums[hi]]);
        lo++;
        while (lo < hi && nums[lo] === nums[lo - 1]) lo++;
      }
    }
  }
  return res;
}`,
 java:`class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> res = new ArrayList<>();
        for (int i = 0; i < nums.length - 2 && nums[i] <= 0; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int lo = i + 1, hi = nums.length - 1;
            while (lo < hi) {
                int s = nums[i] + nums[lo] + nums[hi];
                if (s < 0) lo++;
                else if (s > 0) hi--;
                else {
                    res.add(List.of(nums[i], nums[lo], nums[hi]));
                    lo++;
                    while (lo < hi && nums[lo] == nums[lo - 1]) lo++;
                }
            }
        }
        return res;
    }
}`,
 cpp:`class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> res;
        for (int i = 0; i + 2 < (int)nums.size() && nums[i] <= 0; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int lo = i + 1, hi = nums.size() - 1;
            while (lo < hi) {
                int s = nums[i] + nums[lo] + nums[hi];
                if (s < 0) lo++;
                else if (s > 0) hi--;
                else {
                    res.push_back({nums[i], nums[lo], nums[hi]});
                    lo++;
                    while (lo < hi && nums[lo] == nums[lo - 1]) lo++;
                }
            }
        }
        return res;
    }
};`});

P({n:11,s:'container-with-most-water',t:'Container With Most Water',c:'twoptr',d:'Medium',rel:['twopointers'],
 sum:'Vertical lines stand at each index with the given heights. Pick two lines that, together with the x-axis, hold the most water.',
 ex:'[1, 8, 6, 2, 5, 4, 8, 3, 7] → 49',
 h:['Area = width × the shorter of the two heights.','Start with the widest container (both ends).','Moving the taller line inward can never help, since width shrinks and height is capped by the shorter line. So move the shorter one.'],
 app:'Place pointers at both ends and record the area. Then move whichever pointer has the shorter line, because any container using that line with a narrower width can only be smaller. Track the best area until the pointers meet.',
 tc:'O(n)',sc:'O(1)',
 test:{fn:'maxArea',cases:[[[[1,8,6,2,5,4,8,3,7]],49],[[[1,1]],1],[[[4,3,2,1,4]],16]]},
 py:`class Solution:
    def maxArea(self, height: list[int]) -> int:
        i, j, best = 0, len(height) - 1, 0
        while i < j:
            best = max(best, (j - i) * min(height[i], height[j]))
            if height[i] < height[j]:
                i += 1          # the shorter wall limits the area: move it
            else:
                j -= 1
        return best`,
 js:`function maxArea(height) {
  let i = 0, j = height.length - 1, best = 0;
  while (i < j) {
    best = Math.max(best, (j - i) * Math.min(height[i], height[j]));
    if (height[i] < height[j]) i++; else j--;   // move the shorter wall
  }
  return best;
}`,
 java:`class Solution {
    public int maxArea(int[] height) {
        int i = 0, j = height.length - 1, best = 0;
        while (i < j) {
            best = Math.max(best, (j - i) * Math.min(height[i], height[j]));
            if (height[i] < height[j]) i++; else j--;
        }
        return best;
    }
}`,
 cpp:`class Solution {
public:
    int maxArea(vector<int>& height) {
        int i = 0, j = height.size() - 1, best = 0;
        while (i < j) {
            best = max(best, (j - i) * min(height[i], height[j]));
            if (height[i] < height[j]) i++; else j--;
        }
        return best;
    }
};`});

P({n:42,s:'trapping-rain-water',t:'Trapping Rain Water',c:'twoptr',d:'Hard',rel:['twopointers','prefixsum'],
 sum:'Given bar heights forming an elevation map, compute how many units of rain water are trapped between the bars.',
 ex:'[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] → 6',
 h:['Water above bar i = min(tallest bar to the left, tallest to the right) − height[i].','Prefix and suffix maximum arrays give an O(n) time, O(n) space solution.','With two pointers, the side with the smaller current max is limited by that max alone, so you can settle it immediately.'],
 app:'Keep i and j at the ends with leftMax and rightMax. If height[i] < height[j], the right side has a wall at least as tall as height[i], so water at i is determined by leftMax: add leftMax − height[i] and move i. Otherwise handle j symmetrically. This removes the need for the two max arrays.',
 tc:'O(n)',sc:'O(1)',
 test:{fn:'trap',cases:[[[[0,1,0,2,1,0,1,3,2,1,2,1]],6],[[[4,2,0,3,2,5]],9],[[[]],0]]},
 py:`class Solution:
    def trap(self, height: list[int]) -> int:
        i, j = 0, len(height) - 1
        left_max = right_max = water = 0
        while i < j:
            if height[i] < height[j]:
                left_max = max(left_max, height[i])
                water += left_max - height[i]
                i += 1
            else:
                right_max = max(right_max, height[j])
                water += right_max - height[j]
                j -= 1
        return water`,
 js:`function trap(height) {
  let i = 0, j = height.length - 1, leftMax = 0, rightMax = 0, water = 0;
  while (i < j) {
    if (height[i] < height[j]) {
      leftMax = Math.max(leftMax, height[i]);
      water += leftMax - height[i++];
    } else {
      rightMax = Math.max(rightMax, height[j]);
      water += rightMax - height[j--];
    }
  }
  return water;
}`,
 java:`class Solution {
    public int trap(int[] height) {
        int i = 0, j = height.length - 1, leftMax = 0, rightMax = 0, water = 0;
        while (i < j) {
            if (height[i] < height[j]) {
                leftMax = Math.max(leftMax, height[i]);
                water += leftMax - height[i++];
            } else {
                rightMax = Math.max(rightMax, height[j]);
                water += rightMax - height[j--];
            }
        }
        return water;
    }
}`,
 cpp:`class Solution {
public:
    int trap(vector<int>& height) {
        int i = 0, j = (int)height.size() - 1, leftMax = 0, rightMax = 0, water = 0;
        while (i < j) {
            if (height[i] < height[j]) {
                leftMax = max(leftMax, height[i]);
                water += leftMax - height[i++];
            } else {
                rightMax = max(rightMax, height[j]);
                water += rightMax - height[j--];
            }
        }
        return water;
    }
};`});

/* ---------- Sliding Window ---------- */
P({n:121,s:'best-time-to-buy-and-sell-stock',t:'Best Time to Buy and Sell Stock',c:'window',d:'Easy',rel:['kadane'],
 sum:'Given daily prices, choose one day to buy and a later day to sell to maximize profit. Return 0 if no profit is possible.',
 ex:'[7, 1, 5, 3, 6, 4] → 5 (buy at 1, sell at 6)',
 h:['Checking every buy/sell pair is O(n²).','For each selling day, the best buying day is the cheapest day before it.','Track the minimum price seen so far and the best profit in one pass.'],
 app:'Walk the prices once, keeping the lowest price so far. At each day, the best profit from selling today is price − lowest. Keep the maximum of those. The window is effectively [day of lowest price, today].',
 tc:'O(n)',sc:'O(1)',
 test:{fn:'maxProfit',cases:[[[[7,1,5,3,6,4]],5],[[[7,6,4,3,1]],0],[[[2,4,1]],2]]},
 py:`class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        lowest, best = float("inf"), 0
        for p in prices:
            lowest = min(lowest, p)
            best = max(best, p - lowest)
        return best`,
 js:`function maxProfit(prices) {
  let lowest = Infinity, best = 0;
  for (const p of prices) {
    lowest = Math.min(lowest, p);
    best = Math.max(best, p - lowest);
  }
  return best;
}`,
 java:`class Solution {
    public int maxProfit(int[] prices) {
        int lowest = Integer.MAX_VALUE, best = 0;
        for (int p : prices) {
            lowest = Math.min(lowest, p);
            best = Math.max(best, p - lowest);
        }
        return best;
    }
}`,
 cpp:`class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int lowest = INT_MAX, best = 0;
        for (int p : prices) {
            lowest = min(lowest, p);
            best = max(best, p - lowest);
        }
        return best;
    }
};`});

P({n:3,s:'longest-substring-without-repeating-characters',t:'Longest Substring Without Repeating Characters',c:'window',d:'Medium',rel:['slidingwindow'],
 sum:'Find the length of the longest contiguous substring in which no character repeats.',
 ex:'"abcabcbb" → 3 ("abc") · "pwwkew" → 3 ("wke")',
 h:['A window [left, right] is valid while it has no repeated characters.','When s[right] already appears inside the window, the window must start just after that earlier copy.','Store each character’s last index so you can jump left forward directly.'],
 app:'Expand right one character at a time. Keep a map from character to its last index. If the current character was last seen at or after left, move left to one past that position. The window is then valid; record its length.',
 tc:'O(n)',sc:'O(min(n, alphabet))',
 test:{fn:'lengthOfLongestSubstring',cases:[[["abcabcbb"],3],[["bbbbb"],1],[["pwwkew"],3],[[""],0],[["abba"],2]]},
 py:`class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        last = {}                       # char -> last index seen
        left = best = 0
        for right, ch in enumerate(s):
            if ch in last and last[ch] >= left:
                left = last[ch] + 1     # jump past the previous copy
            last[ch] = right
            best = max(best, right - left + 1)
        return best`,
 js:`function lengthOfLongestSubstring(s) {
  const last = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (last.has(ch) && last.get(ch) >= left) left = last.get(ch) + 1;
    last.set(ch, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
 java:`class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> last = new HashMap<>();
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            char ch = s.charAt(right);
            Integer prev = last.get(ch);
            if (prev != null && prev >= left) left = prev + 1;
            last.put(ch, right);
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}`,
 cpp:`class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        vector<int> last(256, -1);
        int left = 0, best = 0;
        for (int right = 0; right < (int)s.size(); right++) {
            unsigned char ch = s[right];
            if (last[ch] >= left) left = last[ch] + 1;
            last[ch] = right;
            best = max(best, right - left + 1);
        }
        return best;
    }
};`});

P({n:424,s:'longest-repeating-character-replacement',t:'Longest Repeating Character Replacement',c:'window',d:'Medium',rel:['slidingwindow'],
 sum:'You may change up to k characters of an uppercase string. Return the length of the longest substring that can be made of a single repeated letter.',
 ex:'"AABABBA", k = 1 → 4',
 h:['In a window, the cheapest fix keeps the most frequent letter and replaces the rest.','The window is valid when (window length − count of its most common letter) ≤ k.','When invalid, shrink from the left. The recorded max frequency never needs to decrease for the answer to be correct.'],
 app:'Expand the window and maintain letter counts plus the highest count seen. If length − maxCount exceeds k, slide left forward by one. Since the answer only improves when maxCount grows, a stale maxCount never produces a wrong larger answer.',
 tc:'O(n)',sc:'O(26)',
 test:{fn:'characterReplacement',cases:[[["ABAB",2],4],[["AABABBA",1],4],[["AAAA",0],4]]},
 py:`class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        count = {}
        left = max_freq = best = 0
        for right, ch in enumerate(s):
            count[ch] = count.get(ch, 0) + 1
            max_freq = max(max_freq, count[ch])
            while (right - left + 1) - max_freq > k:   # too many letters to replace
                count[s[left]] -= 1
                left += 1
            best = max(best, right - left + 1)
        return best`,
 js:`function characterReplacement(s, k) {
  const count = new Array(26).fill(0);
  let left = 0, maxFreq = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    maxFreq = Math.max(maxFreq, ++count[s.charCodeAt(right) - 65]);
    while (right - left + 1 - maxFreq > k) count[s.charCodeAt(left++) - 65]--;
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
 java:`class Solution {
    public int characterReplacement(String s, int k) {
        int[] count = new int[26];
        int left = 0, maxFreq = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            maxFreq = Math.max(maxFreq, ++count[s.charAt(right) - 'A']);
            while (right - left + 1 - maxFreq > k) count[s.charAt(left++) - 'A']--;
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}`,
 cpp:`class Solution {
public:
    int characterReplacement(string s, int k) {
        int count[26] = {0}, left = 0, maxFreq = 0, best = 0;
        for (int right = 0; right < (int)s.size(); right++) {
            maxFreq = max(maxFreq, ++count[s[right] - 'A']);
            while (right - left + 1 - maxFreq > k) count[s[left++] - 'A']--;
            best = max(best, right - left + 1);
        }
        return best;
    }
};`});

P({n:567,s:'permutation-in-string',t:'Permutation in String',c:'window',d:'Medium',rel:['slidingwindow','counting'],
 sum:'Decide whether s2 contains some rearrangement of s1 as a contiguous substring.',
 ex:'s1 = "ab", s2 = "eidbaooo" → true ("ba")',
 h:['A permutation of s1 is any window of length |s1| with the same letter counts.','Use a fixed-size window that slides one character at a time.','Update counts incrementally: add the entering character, remove the leaving one, then compare.'],
 app:'Count the letters of s1. Slide a window of length |s1| over s2, maintaining its letter counts by adding the new right character and removing the one that drops off the left. Whenever the two count arrays match, a permutation exists.',
 tc:'O(26 · n)',sc:'O(26)',
 test:{fn:'checkInclusion',cases:[[["ab","eidbaooo"],true],[["ab","eidboaoo"],false],[["abc","ab"],false]]},
 py:`class Solution:
    def checkInclusion(self, s1: str, s2: str) -> bool:
        if len(s1) > len(s2):
            return False
        need, window = [0] * 26, [0] * 26
        for ch in s1:
            need[ord(ch) - 97] += 1
        for i, ch in enumerate(s2):
            window[ord(ch) - 97] += 1
            if i >= len(s1):
                window[ord(s2[i - len(s1)]) - 97] -= 1   # character leaving the window
            if window == need:
                return True
        return False`,
 js:`function checkInclusion(s1, s2) {
  if (s1.length > s2.length) return false;
  const need = new Array(26).fill(0), win = new Array(26).fill(0);
  for (const ch of s1) need[ch.charCodeAt(0) - 97]++;
  for (let i = 0; i < s2.length; i++) {
    win[s2.charCodeAt(i) - 97]++;
    if (i >= s1.length) win[s2.charCodeAt(i - s1.length) - 97]--;
    if (win.every((c, k) => c === need[k])) return true;
  }
  return false;
}`,
 java:`class Solution {
    public boolean checkInclusion(String s1, String s2) {
        if (s1.length() > s2.length()) return false;
        int[] need = new int[26], win = new int[26];
        for (char ch : s1.toCharArray()) need[ch - 'a']++;
        for (int i = 0; i < s2.length(); i++) {
            win[s2.charAt(i) - 'a']++;
            if (i >= s1.length()) win[s2.charAt(i - s1.length()) - 'a']--;
            if (Arrays.equals(need, win)) return true;
        }
        return false;
    }
}`,
 cpp:`class Solution {
public:
    bool checkInclusion(string s1, string s2) {
        if (s1.size() > s2.size()) return false;
        array<int, 26> need{}, win{};
        for (char ch : s1) need[ch - 'a']++;
        for (size_t i = 0; i < s2.size(); i++) {
            win[s2[i] - 'a']++;
            if (i >= s1.size()) win[s2[i - s1.size()] - 'a']--;
            if (win == need) return true;
        }
        return false;
    }
};`});

P({n:76,s:'minimum-window-substring',t:'Minimum Window Substring',c:'window',d:'Hard',rel:['slidingwindow'],
 sum:'Find the shortest substring of s that contains every character of t (including repeats). Return "" if none exists.',
 ex:'s = "ADOBECODEBANC", t = "ABC" → "BANC"',
 h:['Expand the window until it covers t, then shrink it as far as possible.','Track how many required characters are still missing, so “covers t” is an O(1) check.','A need count that goes negative means the window has extras of that character, which are safe to drop.'],
 app:'Count what t needs. Move right through s, decrementing the need for each character; when a needed one is satisfied, reduce missing. Whenever missing hits 0, the window is valid: record it, then move left forward, restoring needs, until it becomes invalid again.',
 tc:'O(|s| + |t|)',sc:'O(alphabet)',
 test:{fn:'minWindow',cases:[[["ADOBECODEBANC","ABC"],"BANC"],[["a","a"],"a"],[["a","aa"],""]]},
 py:`from collections import Counter

class Solution:
    def minWindow(self, s: str, t: str) -> str:
        need = Counter(t)
        missing = len(t)                    # characters of t still uncovered
        left = start = 0
        best = float("inf")
        for right, ch in enumerate(s):
            if need[ch] > 0:
                missing -= 1
            need[ch] -= 1
            while missing == 0:             # window covers t: shrink it
                if right - left + 1 < best:
                    best, start = right - left + 1, left
                need[s[left]] += 1
                if need[s[left]] > 0:
                    missing += 1
                left += 1
        return "" if best == float("inf") else s[start:start + best]`,
 js:`function minWindow(s, t) {
  const need = new Array(128).fill(0);
  for (const ch of t) need[ch.charCodeAt(0)]++;
  let missing = t.length, left = 0, start = 0, best = Infinity;
  for (let right = 0; right < s.length; right++) {
    if (need[s.charCodeAt(right)]-- > 0) missing--;
    while (missing === 0) {
      if (right - left + 1 < best) { best = right - left + 1; start = left; }
      if (++need[s.charCodeAt(left++)] > 0) missing++;
    }
  }
  return best === Infinity ? "" : s.slice(start, start + best);
}`,
 java:`class Solution {
    public String minWindow(String s, String t) {
        int[] need = new int[128];
        for (char ch : t.toCharArray()) need[ch]++;
        int missing = t.length(), left = 0, start = 0, best = Integer.MAX_VALUE;
        for (int right = 0; right < s.length(); right++) {
            if (need[s.charAt(right)]-- > 0) missing--;
            while (missing == 0) {
                if (right - left + 1 < best) { best = right - left + 1; start = left; }
                if (++need[s.charAt(left++)] > 0) missing++;
            }
        }
        return best == Integer.MAX_VALUE ? "" : s.substring(start, start + best);
    }
}`,
 cpp:`class Solution {
public:
    string minWindow(string s, string t) {
        vector<int> need(128, 0);
        for (char ch : t) need[ch]++;
        int missing = t.size(), left = 0, start = 0, best = INT_MAX;
        for (int right = 0; right < (int)s.size(); right++) {
            if (need[s[right]]-- > 0) missing--;
            while (missing == 0) {
                if (right - left + 1 < best) { best = right - left + 1; start = left; }
                if (++need[s[left++]] > 0) missing++;
            }
        }
        return best == INT_MAX ? "" : s.substr(start, best);
    }
};`});

P({n:239,s:'sliding-window-maximum',t:'Sliding Window Maximum',c:'window',d:'Hard',rel:['monostack','binheap'],
 sum:'Slide a window of size k across the array and report the maximum value inside it at every position.',
 ex:'[1, 3, −1, −3, 5, 3, 6, 7], k = 3 → [3, 3, 5, 5, 6, 7]',
 h:['Recomputing each window’s max is O(n · k).','A heap gives O(n log n), but stale values must be lazily removed.','Keep a deque of indices with decreasing values: smaller values behind a newcomer can never be a future maximum.'],
 app:'Maintain a deque of indices whose values decrease from front to back. Before adding i, pop indices from the back whose values are ≤ nums[i]. Pop the front if it has slid out of the window. The front is then the window’s maximum. Each index enters and leaves once.',
 tc:'O(n)',sc:'O(k)',
 test:{fn:'maxSlidingWindow',cases:[[[[1,3,-1,-3,5,3,6,7],3],[3,3,5,5,6,7]],[[[1],1],[1]],[[[9,8,7,6],2],[9,8,7]]]},
 py:`from collections import deque

class Solution:
    def maxSlidingWindow(self, nums: list[int], k: int) -> list[int]:
        dq, res = deque(), []           # indices; their values decrease front to back
        for i, x in enumerate(nums):
            while dq and nums[dq[-1]] <= x:
                dq.pop()
            dq.append(i)
            if dq[0] <= i - k:
                dq.popleft()            # front slid out of the window
            if i >= k - 1:
                res.append(nums[dq[0]])
        return res`,
 js:`function maxSlidingWindow(nums, k) {
  const dq = [], res = [];
  let head = 0;                          // dq[head..] is the live deque
  for (let i = 0; i < nums.length; i++) {
    while (dq.length > head && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();
    dq.push(i);
    if (dq[head] <= i - k) head++;       // front slid out of the window
    if (i >= k - 1) res.push(nums[dq[head]]);
  }
  return res;
}`,
 java:`class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        Deque<Integer> dq = new ArrayDeque<>();
        int[] res = new int[nums.length - k + 1];
        for (int i = 0; i < nums.length; i++) {
            while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i]) dq.pollLast();
            dq.addLast(i);
            if (dq.peekFirst() <= i - k) dq.pollFirst();
            if (i >= k - 1) res[i - k + 1] = nums[dq.peekFirst()];
        }
        return res;
    }
}`,
 cpp:`class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        deque<int> dq;
        vector<int> res;
        for (int i = 0; i < (int)nums.size(); i++) {
            while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();
            dq.push_back(i);
            if (dq.front() <= i - k) dq.pop_front();
            if (i >= k - 1) res.push_back(nums[dq.front()]);
        }
        return res;
    }
};`});

/* ---------- Stack ---------- */
P({n:20,s:'valid-parentheses',t:'Valid Parentheses',c:'stack',d:'Easy',rel:[],
 sum:'Decide whether a string of brackets ()[]{} is properly balanced and nested.',
 ex:'"()[]{}" → true · "([)]" → false',
 h:['The most recently opened bracket must be the first one closed.','That “last in, first out” rule is exactly a stack.','Push opening brackets; on a closing bracket, the top of the stack must be its partner.'],
 app:'Scan the string. Push every opening bracket. For a closing bracket, pop the stack and check that it is the matching opener; an empty stack or a mismatch means invalid. At the end the stack must be empty.',
 tc:'O(n)',sc:'O(n)',
 test:{fn:'isValid',cases:[[["()"],true],[["()[]{}"],true],[["(]"],false],[["([)]"],false],[["{[]}"],true],[["("],false]]},
 py:`class Solution:
    def isValid(self, s: str) -> bool:
        pairs = {")": "(", "]": "[", "}": "{"}
        stack = []
        for ch in s:
            if ch in pairs:
                if not stack or stack.pop() != pairs[ch]:
                    return False
            else:
                stack.append(ch)
        return not stack`,
 js:`function isValid(s) {
  const pairs = { ")": "(", "]": "[", "}": "{" }, stack = [];
  for (const ch of s) {
    if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false;
    } else stack.push(ch);
  }
  return stack.length === 0;
}`,
 java:`class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char ch : s.toCharArray()) {
            if (ch == '(' || ch == '[' || ch == '{') stack.push(ch);
            else {
                if (stack.isEmpty()) return false;
                char open = stack.pop();
                if ((ch == ')' && open != '(') || (ch == ']' && open != '[') || (ch == '}' && open != '{'))
                    return false;
            }
        }
        return stack.isEmpty();
    }
}`,
 cpp:`class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char ch : s) {
            if (ch == '(' || ch == '[' || ch == '{') st.push(ch);
            else {
                if (st.empty()) return false;
                char open = st.top(); st.pop();
                if ((ch == ')' && open != '(') || (ch == ']' && open != '[') || (ch == '}' && open != '{'))
                    return false;
            }
        }
        return st.empty();
    }
};`});

P({n:155,s:'min-stack',t:'Min Stack',c:'stack',d:'Medium',rel:[],
 sum:'Design a stack that supports push, pop, top and retrieving the minimum element, all in O(1) time.',
 ex:'push −2, push 0, push −3, getMin → −3, pop, top → 0, getMin → −2',
 h:['Scanning for the minimum is O(n).','The minimum only changes when you push or pop.','Store, alongside each value, the minimum of the stack at the moment it was pushed.'],
 app:'Push pairs (value, current minimum), where the current minimum is min(value, minimum below it). The top pair always knows the minimum of the whole stack, and popping restores the previous minimum automatically.',
 tc:'O(1) per operation',sc:'O(n)',
 test:{design:true,seqs:[[["MinStack","push","push","push","getMin","pop","top","getMin"],[[],[-2],[0],[-3],[],[],[],[]],[null,null,null,null,-3,null,0,-2]]]},
 py:`class MinStack:
    def __init__(self):
        self.stack = []                     # pairs (value, minimum so far)

    def push(self, val: int) -> None:
        cur_min = min(val, self.stack[-1][1]) if self.stack else val
        self.stack.append((val, cur_min))

    def pop(self) -> None:
        self.stack.pop()

    def top(self) -> int:
        return self.stack[-1][0]

    def getMin(self) -> int:
        return self.stack[-1][1]`,
 js:`class MinStack {
  constructor() { this.stack = []; }                 // pairs [value, minimum so far]
  push(val) {
    const m = this.stack.length ? Math.min(val, this.stack[this.stack.length - 1][1]) : val;
    this.stack.push([val, m]);
  }
  pop() { this.stack.pop(); }
  top() { return this.stack[this.stack.length - 1][0]; }
  getMin() { return this.stack[this.stack.length - 1][1]; }
}`,
 java:`class MinStack {
    private final Deque<int[]> stack = new ArrayDeque<>();   // {value, minimum so far}

    public void push(int val) {
        int m = stack.isEmpty() ? val : Math.min(val, stack.peek()[1]);
        stack.push(new int[]{val, m});
    }

    public void pop() { stack.pop(); }
    public int top() { return stack.peek()[0]; }
    public int getMin() { return stack.peek()[1]; }
}`,
 cpp:`class MinStack {
    vector<pair<int, int>> st;   // (value, minimum so far)
public:
    void push(int val) {
        int m = st.empty() ? val : min(val, st.back().second);
        st.push_back({val, m});
    }
    void pop() { st.pop_back(); }
    int top() { return st.back().first; }
    int getMin() { return st.back().second; }
};`});

P({n:150,s:'evaluate-reverse-polish-notation',t:'Evaluate Reverse Polish Notation',c:'stack',d:'Medium',rel:[],
 sum:'Evaluate an arithmetic expression written in postfix (operators after their operands). Division truncates toward zero.',
 ex:'["2", "1", "+", "3", "*"] → 9, because (2 + 1) × 3',
 h:['Operands appear before the operator that uses them.','Keep numbers on a stack until an operator needs them.','On an operator, pop b then a, push a ∘ b. The order matters for − and ÷.'],
 app:'Push numbers onto a stack. When an operator arrives, pop the right operand, then the left, apply the operator and push the result. Use truncation toward zero for division (int(a / b) in Python, Math.trunc in JavaScript). The final stack holds one value.',
 tc:'O(n)',sc:'O(n)',
 test:{fn:'evalRPN',cases:[[[["2","1","+","3","*"]],9],[[["4","13","5","/","+"]],6],[[["10","6","9","3","+","-11","*","/","*","17","+","5","+"]],22]]},
 py:`class Solution:
    def evalRPN(self, tokens: list[str]) -> int:
        stack = []
        for t in tokens:
            if t in {"+", "-", "*", "/"}:
                b, a = stack.pop(), stack.pop()
                if t == "+":
                    stack.append(a + b)
                elif t == "-":
                    stack.append(a - b)
                elif t == "*":
                    stack.append(a * b)
                else:
                    stack.append(int(a / b))     # truncate toward zero
            else:
                stack.append(int(t))
        return stack[0]`,
 js:`function evalRPN(tokens) {
  const stack = [];
  for (const t of tokens) {
    if ("+-*/".includes(t) && t.length === 1) {
      const b = stack.pop(), a = stack.pop();
      if (t === "+") stack.push(a + b);
      else if (t === "-") stack.push(a - b);
      else if (t === "*") stack.push(a * b);
      else stack.push(Math.trunc(a / b));       // truncate toward zero
    } else stack.push(Number(t));
  }
  return stack[0];
}`,
 java:`class Solution {
    public int evalRPN(String[] tokens) {
        Deque<Integer> stack = new ArrayDeque<>();
        for (String t : tokens) {
            switch (t) {
                case "+" -> stack.push(stack.pop() + stack.pop());
                case "*" -> stack.push(stack.pop() * stack.pop());
                case "-" -> { int b = stack.pop(), a = stack.pop(); stack.push(a - b); }
                case "/" -> { int b = stack.pop(), a = stack.pop(); stack.push(a / b); }
                default -> stack.push(Integer.parseInt(t));
            }
        }
        return stack.pop();
    }
}`,
 cpp:`class Solution {
public:
    int evalRPN(vector<string>& tokens) {
        stack<long long> st;
        for (auto& t : tokens) {
            if (t == "+" || t == "-" || t == "*" || t == "/") {
                long long b = st.top(); st.pop();
                long long a = st.top(); st.pop();
                if (t == "+") st.push(a + b);
                else if (t == "-") st.push(a - b);
                else if (t == "*") st.push(a * b);
                else st.push(a / b);                 // C++ division truncates toward zero
            } else st.push(stoll(t));
        }
        return st.top();
    }
};`});

P({n:22,s:'generate-parentheses',t:'Generate Parentheses',c:'stack',d:'Medium',rel:['subsets'],
 sum:'List every string of n pairs of parentheses that is correctly balanced.',
 ex:'n = 3 → ["((()))", "(()())", "(())()", "()(())", "()()()"]',
 h:['Generating all 2^(2n) strings and filtering is wasteful.','Build strings left to right, only making choices that keep them valid.','You may add "(" while fewer than n are open, and ")" while there are more opens than closes.'],
 app:'Backtrack with counts of open and close parentheses used. Add "(" if open < n; add ")" if close < open. When the string reaches length 2n it is valid by construction. The number of results is the n-th Catalan number.',
 tc:'O(4ⁿ / √n)',sc:'O(n) recursion',
 test:{fn:'generateParenthesis',cmp:'sorted',cases:[[[3],["((()))","(()())","(())()","()(())","()()()"]],[[1],["()"]]]},
 py:`class Solution:
    def generateParenthesis(self, n: int) -> list[str]:
        res = []

        def build(cur, opened, closed):
            if len(cur) == 2 * n:
                res.append(cur)
                return
            if opened < n:
                build(cur + "(", opened + 1, closed)
            if closed < opened:
                build(cur + ")", opened, closed + 1)

        build("", 0, 0)
        return res`,
 js:`function generateParenthesis(n) {
  const res = [];
  const build = (cur, opened, closed) => {
    if (cur.length === 2 * n) { res.push(cur); return; }
    if (opened < n) build(cur + "(", opened + 1, closed);
    if (closed < opened) build(cur + ")", opened, closed + 1);
  };
  build("", 0, 0);
  return res;
}`,
 java:`class Solution {
    public List<String> generateParenthesis(int n) {
        List<String> res = new ArrayList<>();
        build(new StringBuilder(), 0, 0, n, res);
        return res;
    }

    private void build(StringBuilder cur, int opened, int closed, int n, List<String> res) {
        if (cur.length() == 2 * n) { res.add(cur.toString()); return; }
        if (opened < n) {
            cur.append('(');
            build(cur, opened + 1, closed, n, res);
            cur.deleteCharAt(cur.length() - 1);
        }
        if (closed < opened) {
            cur.append(')');
            build(cur, opened, closed + 1, n, res);
            cur.deleteCharAt(cur.length() - 1);
        }
    }
}`,
 cpp:`class Solution {
    void build(string& cur, int opened, int closed, int n, vector<string>& res) {
        if ((int)cur.size() == 2 * n) { res.push_back(cur); return; }
        if (opened < n) { cur.push_back('('); build(cur, opened + 1, closed, n, res); cur.pop_back(); }
        if (closed < opened) { cur.push_back(')'); build(cur, opened, closed + 1, n, res); cur.pop_back(); }
    }
public:
    vector<string> generateParenthesis(int n) {
        vector<string> res;
        string cur;
        build(cur, 0, 0, n, res);
        return res;
    }
};`});

P({n:739,s:'daily-temperatures',t:'Daily Temperatures',c:'stack',d:'Medium',rel:['monostack'],
 sum:'For each day, report how many days you must wait for a strictly warmer temperature, or 0 if none comes.',
 ex:'[73, 74, 75, 71, 69, 72, 76, 73] → [1, 1, 4, 2, 1, 1, 0, 0]',
 h:['Scanning forward from every day is O(n²).','Days still waiting for a warmer day form a stack with decreasing temperatures.','When a warmer day arrives, it resolves every colder day on top of the stack.'],
 app:'Keep a stack of indices still waiting. For each day i, pop every index j whose temperature is lower than today’s and set its answer to i − j. Then push i. Each index is pushed and popped at most once.',
 tc:'O(n)',sc:'O(n)',
 test:{fn:'dailyTemperatures',cases:[[[[73,74,75,71,69,72,76,73]],[1,1,4,2,1,1,0,0]],[[[30,40,50,60]],[1,1,1,0]],[[[30,60,90]],[1,1,0]]]},
 py:`class Solution:
    def dailyTemperatures(self, temperatures: list[int]) -> list[int]:
        res = [0] * len(temperatures)
        stack = []                          # indices of days still waiting
        for i, t in enumerate(temperatures):
            while stack and temperatures[stack[-1]] < t:
                j = stack.pop()
                res[j] = i - j
            stack.append(i)
        return res`,
 js:`function dailyTemperatures(temperatures) {
  const res = new Array(temperatures.length).fill(0), stack = [];
  temperatures.forEach((t, i) => {
    while (stack.length && temperatures[stack[stack.length - 1]] < t) {
      const j = stack.pop();
      res[j] = i - j;
    }
    stack.push(i);
  });
  return res;
}`,
 java:`class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int[] res = new int[temperatures.length];
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i < temperatures.length; i++) {
            while (!stack.isEmpty() && temperatures[stack.peek()] < temperatures[i]) {
                int j = stack.pop();
                res[j] = i - j;
            }
            stack.push(i);
        }
        return res;
    }
}`,
 cpp:`class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        vector<int> res(temperatures.size(), 0);
        stack<int> st;
        for (int i = 0; i < (int)temperatures.size(); i++) {
            while (!st.empty() && temperatures[st.top()] < temperatures[i]) {
                res[st.top()] = i - st.top();
                st.pop();
            }
            st.push(i);
        }
        return res;
    }
};`});

P({n:853,s:'car-fleet',t:'Car Fleet',c:'stack',d:'Medium',rel:['monostack'],
 sum:'Cars drive toward a target on a one-lane road. A faster car that catches a slower one joins it and moves at the slower speed. Count how many groups (fleets) arrive.',
 ex:'target 12, positions [10, 8, 0, 5, 3], speeds [2, 4, 1, 1, 3] → 3',
 h:['Process cars from closest to the target to farthest.','Compute each car’s arrival time if it drove alone: (target − position) / speed.','A car that would arrive no later than the fleet ahead of it merges into that fleet.'],
 app:'Sort cars by position, descending. Track the arrival time of the fleet directly ahead. A car whose solo time is greater than that time can never catch up, so it leads a new fleet and becomes the new reference; otherwise it merges. Count the new fleets.',
 tc:'O(n log n)',sc:'O(n)',
 test:{fn:'carFleet',cases:[[[12,[10,8,0,5,3],[2,4,1,1,3]],3],[[10,[3],[3]],1],[[100,[0,2,4],[4,2,1]],1]]},
 py:`class Solution:
    def carFleet(self, target: int, position: list[int], speed: list[int]) -> int:
        cars = sorted(zip(position, speed), reverse=True)   # closest to target first
        fleets, slowest = 0, 0.0
        for p, s in cars:
            t = (target - p) / s            # arrival time if driving alone
            if t > slowest:                 # can't catch the fleet ahead: new fleet
                fleets += 1
                slowest = t
        return fleets`,
 js:`function carFleet(target, position, speed) {
  const cars = position.map((p, i) => [p, speed[i]]).sort((a, b) => b[0] - a[0]);
  let fleets = 0, slowest = 0;
  for (const [p, s] of cars) {
    const t = (target - p) / s;
    if (t > slowest) { fleets++; slowest = t; }
  }
  return fleets;
}`,
 java:`class Solution {
    public int carFleet(int target, int[] position, int[] speed) {
        int n = position.length;
        Integer[] order = new Integer[n];
        for (int i = 0; i < n; i++) order[i] = i;
        Arrays.sort(order, (a, b) -> position[b] - position[a]);   // closest first
        int fleets = 0;
        double slowest = 0;
        for (int i : order) {
            double t = (double) (target - position[i]) / speed[i];
            if (t > slowest) { fleets++; slowest = t; }
        }
        return fleets;
    }
}`,
 cpp:`class Solution {
public:
    int carFleet(int target, vector<int>& position, vector<int>& speed) {
        vector<pair<int, int>> cars;
        for (size_t i = 0; i < position.size(); i++) cars.push_back({position[i], speed[i]});
        sort(cars.rbegin(), cars.rend());                         // closest first
        int fleets = 0;
        double slowest = 0;
        for (auto [p, s] : cars) {
            double t = (double)(target - p) / s;
            if (t > slowest) { fleets++; slowest = t; }
        }
        return fleets;
    }
};`});

P({n:84,s:'largest-rectangle-in-histogram',t:'Largest Rectangle in Histogram',c:'stack',d:'Hard',rel:['monostack'],
 sum:'Bars of width 1 have the given heights. Find the area of the largest rectangle that fits entirely under the histogram.',
 ex:'[2, 1, 5, 6, 2, 3] → 10 (heights 5 and 6, width 2)',
 h:['For each bar, the best rectangle of that exact height extends left and right until a shorter bar.','A stack of increasing heights tells you where each bar’s rectangle starts.','When a shorter bar arrives, every taller bar on the stack can no longer extend right: pop it and compute its area.'],
 app:'Keep a stack of (start index, height) with increasing heights. For each new bar (plus a 0-height sentinel at the end), pop all taller-or-equal bars, computing height × (i − start). The new bar inherits the start index of the last bar popped, since it can extend back that far.',
 tc:'O(n)',sc:'O(n)',
 test:{fn:'largestRectangleArea',cases:[[[[2,1,5,6,2,3]],10],[[[2,4]],4],[[[1,1,1,1]],4]]},
 py:`class Solution:
    def largestRectangleArea(self, heights: list[int]) -> int:
        stack, best = [], 0                     # (start index, height); heights increase
        for i, h in enumerate(heights + [0]):   # the trailing 0 flushes the stack
            start = i
            while stack and stack[-1][1] >= h:
                idx, height = stack.pop()
                best = max(best, height * (i - idx))
                start = idx                     # h can extend back to here
            stack.append((start, h))
        return best`,
 js:`function largestRectangleArea(heights) {
  const stack = [];
  let best = 0;
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i];
    let start = i;
    while (stack.length && stack[stack.length - 1][1] >= h) {
      const [idx, height] = stack.pop();
      best = Math.max(best, height * (i - idx));
      start = idx;
    }
    stack.push([start, h]);
  }
  return best;
}`,
 java:`class Solution {
    public int largestRectangleArea(int[] heights) {
        Deque<int[]> stack = new ArrayDeque<>();    // {start index, height}
        int best = 0;
        for (int i = 0; i <= heights.length; i++) {
            int h = i == heights.length ? 0 : heights[i], start = i;
            while (!stack.isEmpty() && stack.peek()[1] >= h) {
                int[] top = stack.pop();
                best = Math.max(best, top[1] * (i - top[0]));
                start = top[0];
            }
            stack.push(new int[]{start, h});
        }
        return best;
    }
}`,
 cpp:`class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        vector<pair<int, int>> st;                 // (start index, height)
        int best = 0, n = heights.size();
        for (int i = 0; i <= n; i++) {
            int h = i == n ? 0 : heights[i], start = i;
            while (!st.empty() && st.back().second >= h) {
                best = max(best, st.back().second * (i - st.back().first));
                start = st.back().first;
                st.pop_back();
            }
            st.push_back({start, h});
        }
        return best;
    }
};`});
