/* ===== Beginner-first additions — Algorithms batch 1 (sorting). Adds plain/analogy/keyterms/recap to EXPLAIN; keeps all existing detail. ===== */
const XPATCH = (k, o) => { if (typeof EXPLAIN !== 'undefined' && EXPLAIN[k]) Object.assign(EXPLAIN[k], o); };

XPATCH('bubble', {
  plain: `Bubble sort is the simplest way to sort: walk along the list comparing each pair of neighbours, and swap them whenever they’re in the wrong order. Repeat these passes until nothing needs swapping. It’s slow, but it’s the easiest sort to understand, which is why it’s taught first.`,
  analogy: `Imagine a line of people and you walk down it comparing each person with the next, swapping any pair that’s out of height order. After one full walk, the tallest person has “bubbled” all the way to the end. Walk again and the next-tallest settles into place, and so on — like bubbles of air rising to the top of water.`,
  keyterms: [
    ['Pass', 'One full walk along the list comparing neighbours.'],
    ['Swap', 'Exchanging two adjacent elements that are in the wrong order.'],
    ['In place', 'Sorts the list itself without needing a second copy (O(1) extra memory).'],
    ['Stable', 'Keeps equal values in their original relative order — bubble sort is stable.'],
    ['Early exit', 'If a pass makes no swaps, the list is already sorted, so you can stop.'],
    ['O(n²)', 'Roughly n×n work — fine for tiny lists, too slow for large ones.']],
  recap: [
    `Bubble sort repeatedly compares <b>adjacent pairs</b> and swaps the out-of-order ones.`,
    `Each pass “bubbles” the largest remaining value to the end.`,
    `It’s <b>in place</b> and <b>stable</b>, with an <b>early-exit</b> when a pass makes no swaps (making already-sorted input O(n)).`,
    `In general it’s <b>O(n²)</b> — simple to understand, but too slow for real use (insertion sort beats it).`,
    `Its value is educational: the clearest first example of how sorting works.`]
});

XPATCH('insertion', {
  plain: `Insertion sort builds the sorted list one item at a time: it keeps a sorted section at the front and, for each new item, slides it left until it sits in the right spot. It’s genuinely useful — fast on small or nearly-sorted lists — and it’s how most people instinctively sort by hand.`,
  analogy: `It’s exactly how you sort a hand of playing cards. You keep the cards you’ve already arranged in order, pick up each new card, and slide it leftward past the bigger cards until it drops into its correct place. The sorted part grows by one card at a time until the whole hand is in order.`,
  keyterms: [
    ['Sorted prefix', 'The front part of the list that’s already in order and growing.'],
    ['Insert', 'Placing the next item into its correct spot within the sorted prefix.'],
    ['Shift', 'Moving bigger elements one step right to make room for the inserted item.'],
    ['Nearly sorted', 'Input that’s almost in order — insertion sort runs close to O(n) on it.'],
    ['Stable & in place', 'Keeps equal items’ order and uses no extra memory.']],
  recap: [
    `Insertion sort grows a <b>sorted prefix</b>, inserting each new item into its right place by shifting bigger ones right.`,
    `It’s like sorting a hand of cards — the intuitive by-hand method.`,
    `Excellent on <b>small</b> or <b>nearly-sorted</b> lists (close to O(n) there); O(n²) in the worst case.`,
    `It’s <b>stable</b> and <b>in place</b>, and beats bubble sort on every input.`,
    `Real sorts often switch to insertion sort for small chunks.`]
});

XPATCH('selection', {
  plain: `Selection sort repeatedly finds the smallest value in the unsorted part and moves it to the front of it. It always does the same amount of work regardless of the input, and its only real virtue is that it makes very few swaps.`,
  analogy: `Imagine lining people up by height by scanning the whole crowd for the shortest person, pulling them to the front, then scanning the rest for the next shortest, and so on. You look at everyone every time (that’s the slow part), but each person is moved only once.`,
  keyterms: [
    ['Select the minimum', 'Scan the unsorted part to find its smallest value.'],
    ['Sorted prefix / unsorted suffix', 'The list splits into a finished front and an unsorted back.'],
    ['Few swaps', 'At most n−1 swaps total — useful when writing/moving is expensive.'],
    ['No best case', 'It scans everything every pass, so even sorted input takes O(n²).'],
    ['Not stable', 'A long-distance swap can jump an equal value out of order.']],
  recap: [
    `Selection sort repeatedly <b>selects the minimum</b> of the unsorted part and appends it to the sorted prefix.`,
    `It does the <b>same work on every input</b> (no fast case) — always O(n²).`,
    `Its one strength is making very <b>few swaps</b> (≤ n−1), handy when moves are costly.`,
    `It’s in place but <b>not stable</b>.`,
    `Insertion sort is usually the better simple sort.`]
});

XPATCH('merge', {
  plain: `Merge sort uses “divide and conquer”: split the list in half, sort each half (by splitting again, recursively), then <b>merge</b> the two sorted halves back together in one linear pass. It’s reliably fast — O(n log n) on every input — and stable, at the cost of some extra memory.`,
  analogy: `Hand half the deck to a friend; each of you sorts your half (perhaps by handing halves to more friends). Then the two of you merge your sorted piles by repeatedly taking the smaller card off the top of the two piles — like a careful riffle shuffle that keeps everything in order. Combine, combine, combine, until one sorted deck remains.`,
  keyterms: [
    ['Divide and conquer', 'Break the problem in half, solve each half, combine the results.'],
    ['Merge', 'Combining two already-sorted lists into one, in a single linear pass.'],
    ['Recursion', 'The splitting repeats on each half until pieces are size 1.'],
    ['O(n log n)', 'log n levels of splitting × O(n) work per level — fast and guaranteed.'],
    ['Stable', 'Keeps equal items in order.'],
    ['Extra memory', 'Needs O(n) scratch space for the merge (unlike in-place sorts).']],
  recap: [
    `Merge sort <b>splits</b> the list in half, recursively sorts each half, then <b>merges</b> the sorted halves in a linear pass.`,
    `It’s <b>divide and conquer</b>, with log n levels of splitting and O(n) merging per level.`,
    `Guaranteed <b>O(n log n)</b> on every input, and <b>stable</b>.`,
    `The cost is <b>O(n) extra memory</b> for merging.`,
    `It’s the go-to when you need stability or a guaranteed worst case (and it’s great for linked lists and external sorting).`]
});

XPATCH('quick', {
  plain: `Quicksort also divides and conquers, but in place: pick a <b>pivot</b> value, rearrange the list so everything smaller is on its left and everything larger on its right (this is <b>partitioning</b>), then sort the two sides the same way. It’s usually the fastest sort in practice, with one weakness — bad pivots.`,
  analogy: `To line a crowd up by height, pick one person as the “pivot”. Tell everyone shorter to stand on the left and everyone taller on the right — now the pivot is in their final spot. Then repeat the exact same trick within the left group and within the right group, until every small group is sorted.`,
  keyterms: [
    ['Pivot', 'The value you partition around; it lands in its final position.'],
    ['Partition', 'Rearranging so smaller values go left of the pivot, larger go right.'],
    ['In place', 'Rearranges within the list — no big extra array needed.'],
    ['O(n log n) average', 'With balanced partitions, log n levels of O(n) work.'],
    ['O(n²) worst case', 'When pivots are always the smallest/largest (e.g. sorted input with a bad pivot).'],
    ['Randomized pivot', 'Choosing the pivot randomly makes the bad case extremely unlikely.']],
  recap: [
    `Quicksort picks a <b>pivot</b>, <b>partitions</b> values smaller/larger around it, then recursively sorts each side.`,
    `It works <b>in place</b> and is usually the <b>fastest in practice</b> — O(n log n) on average.`,
    `Its weakness is <b>O(n²)</b> when partitions are lopsided (bad pivots); a <b>random</b> or median-of-three pivot avoids this.`,
    `It’s <b>not stable</b> by default.`,
    `Merge sort vs quicksort: merge for a guaranteed worst case and stability, quicksort for raw in-place speed.`]
});

XPATCH('heapsort', {
  plain: `Heapsort turns the list into a <b>heap</b> — a tree structure that always keeps the largest value on top — then repeatedly removes the top (the current maximum) and puts it at the end. It guarantees O(n log n) time with no extra memory, though it’s usually a bit slower than quicksort in practice.`,
  analogy: `Think of a knockout tournament that always tells you the current champion. You take the champion out and place them last, let the tournament re-settle to reveal the next-best, take them, and so on. Each extraction shuffles the bracket a little (that’s the log n cost), and the players come out in sorted order from the back.`,
  keyterms: [
    ['Heap', 'A binary-tree structure where each parent outranks its children (max-heap = biggest on top).'],
    ['Heapify', 'Rearranging the array into a valid heap.'],
    ['Extract max', 'Removing the top element and restoring the heap — O(log n) each time.'],
    ['In place', 'The heap lives inside the same array; no extra memory.'],
    ['O(n log n)', 'Guaranteed on every input (n extractions × log n each).'],
    ['Not stable', 'Reordering through the heap doesn’t preserve equal items’ order.']],
  recap: [
    `Heapsort builds a <b>max-heap</b> (biggest on top), then repeatedly <b>extracts the max</b> to the end.`,
    `Each extraction restores the heap in O(log n), for a guaranteed <b>O(n log n)</b> total.`,
    `It sorts <b>in place</b> (no extra memory) but is <b>not stable</b> and usually a bit slower than quicksort.`,
    `The heap is the same structure used for priority queues.`,
    `Choose it when you want O(n log n) guaranteed <i>and</i> no extra memory.`]
});

XPATCH('counting', {
  plain: `Counting sort doesn’t compare items at all. If the values are integers in a small range, it just <b>counts how many of each value</b> there are, then writes them out in order. That lets it beat the O(n log n) limit of comparison sorts — it runs in linear time — but only when the value range is small.`,
  analogy: `To sort a stack of exam papers by score (0–100), you don’t compare papers to each other. You make a pile for each possible score, drop each paper on its pile, then stack the piles in order from 0 to 100. Done — and you never once compared two papers directly.`,
  keyterms: [
    ['Non-comparison sort', 'Sorts without ever comparing two items — so the O(n log n) limit doesn’t apply.'],
    ['Count array', 'A tally of how many times each value appears.'],
    ['Value range (k)', 'The span of possible values; counting sort costs O(n + k).'],
    ['Linear time', 'O(n + k) — fast when k (the range) is not much bigger than n.'],
    ['Stable version', 'Using a prefix-sum of counts lets it place equal items in original order.']],
  recap: [
    `Counting sort <b>counts occurrences</b> of each value and writes them out in order — no comparisons.`,
    `Because it avoids comparisons, it beats the O(n log n) barrier, running in <b>O(n + k)</b> linear time.`,
    `It only works for <b>integers (or mappable keys) in a small range k</b>; a huge range makes it wasteful.`,
    `With a prefix-sum of counts it can be made <b>stable</b>.`,
    `It’s the building block of radix sort and great for things like sorting by age or score.`]
});
