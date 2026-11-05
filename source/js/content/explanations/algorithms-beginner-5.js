/* ===== Beginner-first additions — Algorithms batch 5 (dynamic programming). ===== */

XPATCH('memo', {
  plain: `Dynamic programming (DP) solves a big problem by breaking it into smaller <b>subproblems</b>, solving each once, and <b>remembering the answers</b> so you never recompute them. <b>Memoization</b> is the easiest way in: write the natural recursive solution, then cache each result. It’s the whole trick behind turning exponential recursion into something fast.`,
  analogy: `Think of computing Fibonacci numbers by the naive recursion: to get F(10) you compute F(9) and F(8), which each recompute F(7), and so on — the same values calculated over and over, exploding exponentially. Memoization is simply keeping a notepad: the first time you work out F(7), you jot it down; every later time you just read it off. Suddenly the work collapses to linear.`,
  keyterms: [
    ['Subproblem', 'A smaller instance of the same problem whose answer helps solve the bigger one.'],
    ['Overlapping subproblems', 'The same subproblems recur many times — what makes caching pay off.'],
    ['Memoization (top-down)', 'Recurse as normal, but cache each subproblem’s result the first time.'],
    ['Tabulation (bottom-up)', 'Fill a table of subproblem answers from smallest to largest, no recursion.'],
    ['Optimal substructure', 'The big answer is built from optimal answers to subproblems — the condition DP needs.']],
  recap: [
    `DP breaks a problem into <b>subproblems</b>, solves each once, and reuses the answers.`,
    `It applies when there are <b>overlapping subproblems</b> and <b>optimal substructure</b>.`,
    `<b>Memoization</b> (top-down) = recursion + a cache; <b>tabulation</b> (bottom-up) = fill a table smallest-first.`,
    `This turns exponential recomputation (like naive Fibonacci) into linear or polynomial time.`,
    `Spotting the subproblem and its “state” is the real skill — the caching is mechanical.`]
});

XPATCH('knapsack', {
  plain: `The 0/1 knapsack problem: given items each with a <b>weight</b> and a <b>value</b>, and a bag that can hold a limited total weight, pick the subset that maximizes value. “0/1” means each item is taken whole or left — no fractions. It’s the classic DP where the state is “best value using the first i items within weight w”.`,
  analogy: `You’re packing a backpack for a trip with a strict weight limit. Each thing you could bring has a usefulness (value) and a weight. You can’t take half a camera — it’s in or out. DP works through it methodically: for each item, compare “skip it” against “take it and use the best packing of the remaining weight”, keeping whichever is better.`,
  keyterms: [
    ['0/1 knapsack', 'Each item is taken entirely or not at all (no fractions).'],
    ['Capacity', 'The weight limit the chosen items must fit within.'],
    ['State', '“Best value using the first i items with weight budget w.”'],
    ['Take vs skip', 'The core choice at each item: include it (if it fits) or leave it.'],
    ['O(n·W)', 'Items × capacity — “pseudo-polynomial” (depends on the capacity’s size).']],
  recap: [
    `0/1 knapsack picks a subset of weighted, valued items to <b>maximize value within a weight limit</b>, each item taken whole or not.`,
    `The DP state is “best value using the first i items within budget w”.`,
    `At each item you take the better of <b>skip it</b> vs <b>take it + best of the rest</b>.`,
    `It runs in <b>O(n·W)</b> (items × capacity) — pseudo-polynomial.`,
    `It’s the template for countless “choose a subset under a constraint” problems.`]
});

XPATCH('coinchange', {
  plain: `Coin change asks for the <b>fewest coins</b> that add up to a target amount, given some coin denominations. It’s a clean DP: the best way to make an amount is one coin plus the best way to make the remainder, so you build answers up from amount 0.`,
  analogy: `It’s making change at a till with the fewest coins. To work out the fewest coins for 63p, you ask: for each coin you could hand over first (1p, 2p, 5p…), what’s the fewest coins for the leftover? Build a little table from 0p upward, and by the time you reach 63p the answer is already assembled from the smaller amounts.`,
  keyterms: [
    ['Denominations', 'The coin values available (e.g. 1, 5, 10, 25).'],
    ['Target amount', 'The total you’re trying to make.'],
    ['Build up from 0', 'Compute the best for every amount from 0 to the target.'],
    ['Recurrence', 'best(amount) = 1 + min over coins of best(amount − coin).'],
    ['Greedy fails', 'Grabbing the biggest coin first isn’t always optimal — DP is needed for arbitrary denominations.']],
  recap: [
    `Coin change finds the <b>fewest coins</b> (or number of ways) to make a target from given denominations.`,
    `DP builds answers <b>up from amount 0</b>: best(amount) = 1 + min over coins of best(amount − coin).`,
    `A naive <b>greedy</b> “biggest coin first” can be wrong for arbitrary denominations — hence DP.`,
    `It runs in <b>O(amount × coins)</b>.`,
    `It’s a canonical “build the answer from smaller amounts” DP.`]
});

XPATCH('lis', {
  plain: `Longest Increasing Subsequence (LIS) finds the longest run of values that increase as you go left to right — but the chosen values <b>need not be next to each other</b>, just in order. For example in [3,1,4,1,5,9,2,6], one LIS is 1,4,5,9.`,
  analogy: `Line up a row of people and pick the longest chain of ever-taller people reading left to right, without changing anyone’s position — you’re allowed to skip people, but you can’t reorder them. Finding the longest such chain is LIS.`,
  keyterms: [
    ['Subsequence', 'Items kept in their original order, but not necessarily adjacent.'],
    ['Increasing', 'Each chosen value is larger than the previous one.'],
    ['DP O(n²)', 'For each element, the best chain ending there = 1 + best among smaller earlier elements.'],
    ['Patience / binary search O(n log n)', 'A faster method maintaining the smallest possible tail per length.'],
    ['Not contiguous', 'Unlike a subarray, skipped elements are allowed.']],
  recap: [
    `LIS finds the longest <b>in-order but not-necessarily-adjacent</b> run of increasing values.`,
    `The simple DP is <b>O(n²)</b>: best chain ending at i = 1 + best among earlier, smaller elements.`,
    `A <b>patience-sorting / binary-search</b> method does it in <b>O(n log n)</b>.`,
    `Note it’s a <b>subsequence</b> (skips allowed), unlike a contiguous subarray.`,
    `It generalizes to many “longest chain under an ordering” problems.`]
});

XPATCH('lcs', {
  plain: `Longest Common Subsequence (LCS) finds the longest sequence of characters that appears in <b>both</b> of two strings, in the same order but not necessarily adjacent. It measures how similar two sequences are, and it’s the backbone of “diff” tools that compare file versions.`,
  analogy: `Compare two slightly different drafts of the same paragraph. The LCS is the longest thread of words that survived, in order, in both drafts — ignoring the insertions and deletions around them. The longer that shared thread, the more similar the drafts; the gaps are exactly what a diff tool highlights as changes.`,
  keyterms: [
    ['Common subsequence', 'A sequence appearing in both strings, in order, with gaps allowed.'],
    ['Grid DP', 'A table over (prefix of A, prefix of B); fill it cell by cell.'],
    ['Match vs skip', 'If the current characters match, extend the diagonal; otherwise take the better of dropping one.'],
    ['O(m·n)', 'Length of A × length of B.'],
    ['Diff', 'File/line diffs are computed from the LCS of the two versions.']],
  recap: [
    `LCS finds the longest <b>in-order, gap-allowed</b> sequence common to two strings.`,
    `It’s solved with a <b>grid DP</b> over prefixes of the two strings, <b>O(m·n)</b>.`,
    `At each cell: if characters match, extend; otherwise take the better of dropping a character from either side.`,
    `It measures similarity and is the basis of <b>diff</b> tools and version comparison.`,
    `Close cousins: edit distance and longest common substring (contiguous).`]
});

XPATCH('editdistance', {
  plain: `Edit distance (Levenshtein) is the <b>minimum number of single-character edits</b> — insert, delete, or substitute — needed to turn one string into another. It quantifies how different two words are, and it’s what spell-checkers and “did you mean…?” suggestions use.`,
  analogy: `It’s the autocorrect question: how few keystroke-level fixes change “kitten” into “sitting”? Substitute k→s, substitute e→i, insert g — three edits. Spell-checkers rank suggestions by this distance: the real word reachable in the fewest edits is the most likely thing you meant.`,
  keyterms: [
    ['Levenshtein distance', 'Minimum insertions + deletions + substitutions to transform one string into another.'],
    ['Three operations', 'Insert a character, delete one, or substitute one.'],
    ['Grid DP', 'A table over prefixes of both strings, like LCS.'],
    ['Cell recurrence', 'Match → copy the diagonal; else 1 + min(insert, delete, substitute).'],
    ['O(m·n)', 'Length of one string × the other.']],
  recap: [
    `Edit distance is the <b>fewest single-character edits</b> (insert/delete/substitute) to turn string A into B.`,
    `It’s a <b>grid DP</b> over prefixes, <b>O(m·n)</b>, closely related to LCS.`,
    `Each cell: if characters match, carry the diagonal; else 1 + the best of the three operations.`,
    `It measures string similarity and powers <b>spell-check</b> and “did you mean…?” suggestions.`,
    `Fuzzy search and DNA-sequence alignment use the same idea.`]
});
