/* ===== Beginner-first additions — Algorithms batch 3 (intervals, monotonic stack, BST, heap, hash table, trie). ===== */

XPATCH('intervals', {
  plain: `Interval problems deal with ranges that have a start and an end — meetings, bookings, segments on a line — and ask things like “merge the overlapping ones” or “how many rooms do I need?”. The universal first move is to <b>sort the intervals</b> (usually by start time), which turns a tangled set into something you can sweep through in order.`,
  analogy: `Picture a day’s calendar full of overlapping bookings. To tidy it, you line them up by start time and walk down: if the next booking begins before the current block ends, they overlap, so you stretch the block to cover both; otherwise you start a fresh block. That sorted left-to-right sweep is the heart of nearly every interval problem.`,
  keyterms: [
    ['Interval', 'A range with a start and an end (e.g. a meeting 9:00–10:30).'],
    ['Overlap', 'Two intervals share time — the next one starts before the current ends.'],
    ['Sort by start', 'The near-universal first step that makes overlaps appear in order.'],
    ['Merge', 'Combine overlapping intervals into one spanning block.'],
    ['Sweep line', 'Process start/end events in time order (e.g. to count concurrent intervals).']],
  recap: [
    `Interval problems involve ranges (start–end) and ask to merge, count, or schedule them.`,
    `The universal first step is to <b>sort by start</b>, which lines overlaps up in order.`,
    `Then <b>sweep</b> left to right: extend the current block when the next interval overlaps, else start a new one.`,
    `A <b>sweep line</b> over start/end events counts how many overlap at once (e.g. meeting rooms needed).`,
    `Sorting dominates the cost, so these run in <b>O(n log n)</b>.`]
});

XPATCH('monostack', {
  plain: `A monotonic stack is a stack you deliberately keep in sorted order (always increasing, or always decreasing) by popping anything that would break that order before pushing. It answers questions like “what’s the next larger element to the right?” for a whole array in a single O(n) pass.`,
  analogy: `Imagine people queued up, each waiting to spot the <i>next taller person</i> ahead of them. You keep a stack of people still waiting. When a taller person arrives, everyone shorter in the stack has found their answer (it’s this newcomer), so they pop off satisfied. The newcomer then waits in the stack for someone even taller. Everyone is pushed and popped once — hence linear time.`,
  keyterms: [
    ['Monotonic stack', 'A stack kept entirely increasing or decreasing.'],
    ['Pop to maintain order', 'Before pushing, remove elements that would violate the order.'],
    ['Next greater/smaller element', 'The classic question a monotonic stack answers in O(n).'],
    ['Amortized O(n)', 'Each element is pushed and popped at most once across the whole scan.'],
    ['Resolved on pop', 'An element’s answer is found exactly when it gets popped.']],
  recap: [
    `A monotonic stack stays sorted (increasing or decreasing) by <b>popping</b> order-breaking elements before each push.`,
    `It answers <b>next-greater / next-smaller element</b> (and similar) for the whole array in one pass.`,
    `Each element is pushed and popped at most once, giving <b>O(n)</b> total.`,
    `An element’s answer is determined at the moment it’s popped.`,
    `It underlies problems like daily temperatures, stock spans, and largest rectangle in a histogram.`]
});

XPATCH('bst', {
  plain: `A binary search tree keeps values in a tree where, at every node, everything in the left branch is smaller and everything in the right branch is larger. That ordering lets you search, insert, and delete by walking down one path — O(log n) when the tree stays balanced — and it visits values in sorted order for free.`,
  analogy: `It’s the “guess my number” game frozen into a structure. Each node asks “bigger or smaller?” and sends you left or right, so you zero in on any value by following a single path from the top — just like halving the range in binary search, but stored as a tree you can also update.`,
  keyterms: [
    ['Binary search tree (BST)', 'A tree where left < node < right at every node.'],
    ['Traversal (in-order)', 'Visiting left, node, right yields the values in sorted order.'],
    ['Search/insert/delete', 'Each walks one root-to-leaf path.'],
    ['Balanced', 'Depth stays ~log n, keeping operations fast.'],
    ['Degenerate tree', 'Inserting sorted data unbalanced makes it a list — O(n); self-balancing trees (AVL, red-black) prevent this.']],
  recap: [
    `A BST stores values so that <b>left < node < right</b> everywhere.`,
    `Search, insert, and delete each follow <b>one path</b> down the tree.`,
    `<b>In-order traversal</b> returns the values sorted, for free.`,
    `Operations are <b>O(log n)</b> only while the tree is <b>balanced</b>; unbalanced it degrades to O(n).`,
    `Self-balancing variants (AVL, red-black) guarantee the log-n depth; they back ordered maps/sets.`]
});

XPATCH('binheap', {
  plain: `A binary heap is a tree-shaped structure (stored compactly in an array) that always keeps the top-priority element — the max, or the min — at the root. It doesn’t fully sort, it just guarantees quick access to the extreme, with O(log n) insert and remove. It’s the engine behind <b>priority queues</b>.`,
  analogy: `Think of a strict corporate hierarchy where every manager outranks their direct reports. The CEO (highest priority) is always at the top. When someone joins or the CEO leaves, you only need to shuffle people up or down <i>one chain of command</i> to restore the rule — not reorganize the whole company.`,
  keyterms: [
    ['Heap property', 'Every parent outranks its children (max-heap: biggest on top; min-heap: smallest).'],
    ['Priority queue', 'A queue that always serves the highest-priority item — implemented with a heap.'],
    ['Insert / extract', 'Add or remove the top, then “bubble up” / “sift down” one path to restore order — O(log n).'],
    ['Peek', 'Read the top element in O(1) without removing it.'],
    ['Array-backed', 'A complete binary tree packed into an array (children of i at 2i+1, 2i+2).']],
  recap: [
    `A binary heap keeps the highest- (or lowest-) priority element at the <b>root</b>.`,
    `It only maintains the <b>heap property</b> (parent outranks children), not a full sort.`,
    `<b>Insert</b> and <b>extract</b> fix order along one path in <b>O(log n)</b>; <b>peek</b> is O(1).`,
    `It’s stored compactly in an <b>array</b> and is the standard implementation of a <b>priority queue</b>.`,
    `Heaps power Dijkstra, heapsort, scheduling, and “top-k” problems.`]
});

XPATCH('hashtable', {
  plain: `A hash table stores key–value pairs so you can look one up almost instantly. A <b>hash function</b> turns a key into an array index (a “bucket”), so retrieval goes straight to the right spot instead of scanning. Average lookup, insert, and delete are O(1) — it’s the structure behind dictionaries, maps, and sets.`,
  analogy: `It’s a coat-check that computes your locker number from your ticket. Instead of searching every locker for your coat, the attendant runs your ticket through a rule that points directly at locker 47. Occasionally two tickets map to the same locker (a <b>collision</b>) — handled by keeping a small list in that locker and checking it.`,
  keyterms: [
    ['Hash function', 'Turns a key into a bucket index, ideally spreading keys evenly.'],
    ['Bucket', 'A slot in the backing array where a key’s entry lives.'],
    ['Collision', 'Two keys hashing to the same bucket — resolved by chaining or open addressing.'],
    ['Load factor', 'How full the table is; when high, it resizes (rehashes) to stay fast.'],
    ['O(1) average', 'Near-instant on average; O(n) worst case if many keys collide.']],
  recap: [
    `A hash table maps keys to <b>buckets</b> via a <b>hash function</b>, giving near-instant lookup.`,
    `Average <b>O(1)</b> for lookup/insert/delete — the structure behind dictionaries, maps, and sets.`,
    `<b>Collisions</b> (two keys, one bucket) are handled by chaining or open addressing.`,
    `It <b>resizes</b> when the load factor gets high, to keep operations fast.`,
    `Worst case is O(n) if hashing is poor and everything collides; a good hash function keeps that away.`]
});

XPATCH('trie', {
  plain: `A trie (“prefix tree”) stores strings by their characters: each step down the tree adds one letter, so words that share a prefix share the same path. That makes “find everything starting with these letters” extremely fast — which is why it powers autocomplete and dictionary lookups.`,
  analogy: `Picture a family tree of words where the common beginning is the shared trunk. “car”, “cart”, and “care” all travel down the same c→a→r branch before splitting. To find every word starting with “car”, you just walk to that node and look at everything below it — no scanning the whole dictionary.`,
  keyterms: [
    ['Trie / prefix tree', 'A tree keyed by characters; each path spells a string.'],
    ['Shared prefix', 'Words with the same start share the same path, saving space and time.'],
    ['Node marks a word end', 'A flag showing a path spells a complete word, not just a prefix.'],
    ['Prefix query', 'Finding all strings with a given prefix = walk to that node, read below.'],
    ['O(length)', 'Lookup/insert costs depend on the word length, not the number of words stored.']],
  recap: [
    `A trie stores strings character by character, so shared <b>prefixes</b> share a path.`,
    `Lookup and insert cost <b>O(word length)</b>, independent of how many words are stored.`,
    `A node flag marks where a complete word ends (vs a mere prefix).`,
    `<b>Prefix queries</b> are its superpower — walk to a node and everything below shares that prefix.`,
    `It’s the natural structure for <b>autocomplete</b>, spell-check, and dictionary problems.`]
});
