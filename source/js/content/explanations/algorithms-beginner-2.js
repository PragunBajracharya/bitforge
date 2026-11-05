/* ===== Beginner-first additions — Algorithms batch 2 (searching + array patterns). XPATCH defined in algo_beg1. ===== */

XPATCH('binary', {
  plain: `Binary search finds a value in a <b>sorted</b> list fast by repeatedly halving the search range: look at the middle, and if it’s not your target, throw away the half that can’t contain it. Each step eliminates half of what’s left, so even a million items take only about 20 checks.`,
  analogy: `It’s how you look up a word in a paper dictionary. You don’t read from page 1 — you flop it open near the middle, see whether your word comes before or after, and keep halving. Or the “guess my number 1–100” game: guess 50, get told “higher”, guess 75, and so on — each guess cuts the possibilities in half.`,
  keyterms: [
    ['Sorted input', 'Required — halving only works if order tells you which half holds the target.'],
    ['Midpoint', 'The middle element you compare against each step.'],
    ['Discard half', 'Each comparison eliminates half the remaining range.'],
    ['O(log n)', 'The number of halvings — ~20 for a million, ~30 for a billion.'],
    ['Low / high pointers', 'The two ends of the range you keep shrinking.']],
  recap: [
    `Binary search halves a <b>sorted</b> range each step by comparing the <b>midpoint</b> to the target.`,
    `Each comparison discards half the remaining elements.`,
    `It runs in <b>O(log n)</b> — a million items in ~20 checks.`,
    `It <b>requires sorted input</b>; order is what tells you which half to keep.`,
    `The same halving idea finds boundaries and “first/last that satisfies X”, not just exact matches.`]
});

XPATCH('lowerbound', {
  plain: `Lower bound is a binary-search variant that finds the <b>first position where a value could go</b> — the first element that is greater than or equal to your target — instead of an exact match. It’s the workhorse behind “insert in sorted order”, counting how many items are below a value, and range queries.`,
  analogy: `You have an alphabetized bookshelf and a new book to file. Lower bound is finding the exact slot where it belongs: the first book whose title is <i>not</i> earlier than yours. Even if no book has that exact title, you’ve found precisely where it would slide in.`,
  keyterms: [
    ['Lower bound', 'The first position whose value is ≥ the target.'],
    ['Upper bound', 'The first position whose value is strictly > the target (the sibling query).'],
    ['Insertion point', 'Where a new value would go to keep the list sorted.'],
    ['Half-open range', 'Carefully shrinking [lo, hi) so the boundary is found exactly.'],
    ['O(log n)', 'Same halving cost as binary search.']],
  recap: [
    `Lower bound finds the <b>first position where a value belongs</b> (first element ≥ target), not just an exact hit.`,
    `It’s binary search adapted to return a <b>boundary</b> rather than a match.`,
    `With its sibling <b>upper bound</b>, it gives insertion points and counts of values in a range.`,
    `It runs in <b>O(log n)</b> on sorted data.`,
    `Getting the half-open range right is the only fiddly part.`]
});

XPATCH('quickselect', {
  plain: `Quickselect finds the <b>k-th smallest</b> value (for example, the median) <i>without fully sorting</i> the list. It borrows quicksort’s partition step, but only recurses into the one side that contains the position you’re after — so it’s linear time on average instead of O(n log n).`,
  analogy: `To find the 10th-tallest person in a crowd, you don’t line everyone up. Pick a pivot height, split the crowd into shorter-than and taller-than groups, and see which group the 10th rank falls in — then repeat only inside that group. You ignore the other half entirely each time, zeroing in on the rank you want.`,
  keyterms: [
    ['Selection', 'Finding the element of a given rank (k-th smallest), e.g. the median.'],
    ['Partition', 'The quicksort step: split around a pivot into smaller / larger.'],
    ['Recurse one side', 'Only continue in the side that contains rank k — the key saving.'],
    ['O(n) average', 'Linear on average (n + n/2 + n/4 + … ≈ 2n).'],
    ['O(n²) worst case', 'Bad pivots; a random pivot makes it unlikely.']],
  recap: [
    `Quickselect finds the <b>k-th smallest</b> element without sorting the whole list.`,
    `It uses quicksort’s <b>partition</b>, but recurses into <b>only the side</b> containing rank k.`,
    `That gives <b>O(n) average</b> time (vs O(n log n) to sort), with an O(n²) worst case avoided by a random pivot.`,
    `It’s the standard way to get a median or “top-k boundary” quickly.`,
    `Same partition logic as quicksort, half the recursion.`]
});

XPATCH('prefixsum', {
  plain: `A prefix sum is a precomputed array of running totals. Build it once, and then the sum of <i>any</i> range is a single subtraction — turning repeated range-sum questions from slow (re-adding every time) into instant.`,
  analogy: `Think of mile markers along a road. To find the distance between mile 30 and mile 70 you don’t re-measure the road — you just subtract: 70 − 30 = 40. Prefix sums are mile markers for a list: store the total up to each point, and any stretch is just the difference of two markers.`,
  keyterms: [
    ['Prefix sum', 'An array where entry i holds the total of everything up to i.'],
    ['Range sum', 'Sum of a slice = prefix[end] − prefix[start] — one subtraction.'],
    ['Precompute once', 'O(n) to build, then O(1) per query.'],
    ['Difference array', 'The inverse trick: apply many range updates cheaply, then sum.'],
    ['2D version', 'The same idea extends to sums over rectangles in a grid.']],
  recap: [
    `A prefix-sum array stores <b>running totals</b> so any <b>range sum</b> is one subtraction.`,
    `Build it once in <b>O(n)</b>, then answer each range query in <b>O(1)</b>.`,
    `It turns “sum this slice” asked many times from O(n) each into instant.`,
    `A <b>difference array</b> is the mirror trick for many range <i>updates</i>; it also extends to 2D grids.`,
    `A foundational pattern behind many array and subarray problems.`]
});

XPATCH('twopointers', {
  plain: `The two-pointers pattern uses two indices moving through a (usually sorted) array to solve in one pass what would otherwise need nested loops. By moving the right pointer based on a comparison, you avoid re-checking combinations — dropping O(n²) down to O(n).`,
  analogy: `Picture two people standing at opposite ends of a sorted line, walking toward each other. Looking for two numbers that add to a target? If their sum is too big, the person on the high end steps inward; too small, the low end steps up. They converge on the answer in one sweep instead of every pair trying every other pair.`,
  keyterms: [
    ['Two pointers', 'Two indices scanning the array, moved by a rule rather than brute force.'],
    ['Converging', 'Pointers start at both ends and move toward each other (sorted-array problems).'],
    ['Same-direction', 'Both move forward (e.g. removing duplicates, fast/slow pointers).'],
    ['O(n) from O(n²)', 'One coordinated pass replaces checking all pairs.'],
    ['Sorted input', 'Many two-pointer tricks rely on the data being ordered.']],
  recap: [
    `Two pointers walk two indices through an array with a <b>rule</b>, replacing nested loops.`,
    `<b>Converging</b> pointers (from both ends) solve sorted-pair problems like two-sum in O(n).`,
    `<b>Same-direction</b> pointers handle dedup, window edges, and fast/slow cycle tricks.`,
    `It turns many <b>O(n²)</b> scans into a single <b>O(n)</b> pass.`,
    `It usually relies on the array being <b>sorted</b> (or on a monotonic property).`]
});

XPATCH('slidingwindow', {
  plain: `The sliding-window pattern looks at a <b>contiguous run</b> of a sequence and slides that window along, adding the new element and removing the one that left — so you compute things over every window in one pass instead of recomputing each from scratch.`,
  analogy: `Imagine a window frame you slide along a train of boxcars, always seeing a few cars at once. As you slide one car forward, a new car enters on the right and one leaves on the left — you just add the newcomer’s value and subtract the leaver’s, rather than re-counting all the cars in view each time.`,
  keyterms: [
    ['Window', 'A contiguous range of the array/string you’re currently considering.'],
    ['Fixed vs variable', 'The window has a set size, or grows/shrinks to satisfy a condition.'],
    ['Slide', 'Add the entering element, remove the leaving one — O(1) per step.'],
    ['Expand / contract', 'Grow the right edge to include more; shrink the left when a rule breaks.'],
    ['O(n)', 'Each element enters and leaves the window at most once.']],
  recap: [
    `A sliding window tracks a <b>contiguous run</b> and moves it along, updating incrementally.`,
    `<b>Fixed-size</b> windows compute things like “max sum of k consecutive”; <b>variable-size</b> windows grow/shrink to meet a condition.`,
    `Each slide is <b>O(1)</b> (add the new element, drop the old), so the whole scan is <b>O(n)</b>.`,
    `It replaces recomputing every window from scratch (which would be O(n·k)).`,
    `A go-to for “longest/shortest/at-most-k” substring and subarray problems.`]
});

XPATCH('kadane', {
  plain: `Kadane’s algorithm finds the <b>largest-sum contiguous slice</b> of an array in a single pass. The insight: keep a running sum, and whenever it drops below zero, throw it away and start fresh — because a negative prefix can only drag down whatever comes next.`,
  analogy: `Think of tracking your best winning streak over a season of daily gains and losses. You keep a running tally, but the moment it goes negative you reset to zero and start counting from the next day — carrying a loss forward would only make a future streak look worse. You also remember the best tally you ever reached; that’s the answer.`,
  keyterms: [
    ['Maximum subarray', 'The contiguous slice with the greatest sum — what Kadane finds.'],
    ['Running sum', 'The best sum of a slice ending at the current position.'],
    ['Reset on negative', 'If the running sum goes below 0, start a new slice — the key move.'],
    ['Best-so-far', 'Track the maximum running sum ever seen; that’s the result.'],
    ['O(n), one pass', 'A single sweep with O(1) memory.']],
  recap: [
    `Kadane finds the <b>maximum-sum contiguous subarray</b> in one pass.`,
    `Keep a <b>running sum</b> of the best slice ending here; <b>reset to 0</b> when it goes negative.`,
    `Track the <b>best-so-far</b> maximum — that’s the answer.`,
    `It runs in <b>O(n)</b> time with <b>O(1)</b> memory.`,
    `The “drop a negative prefix” insight is a classic example of greedy/DP thinking.`]
});
