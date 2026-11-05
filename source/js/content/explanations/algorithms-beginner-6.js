/* ===== Beginner-first additions — Algorithms batch 6 (backtracking + math & bits). Completes the Algorithms course. ===== */

XPATCH('nqueens', {
  plain: `The N-Queens puzzle asks you to place N chess queens on an N×N board so that <b>no two attack each other</b> (no shared row, column, or diagonal). It’s the showcase problem for <b>backtracking</b>: place a queen, move to the next row, and if you get stuck, undo the last placement and try the next option.`,
  analogy: `Imagine seating N guests who all feud, at a round of tables, where any two in the same row, column, or diagonal will fight. You seat them one row at a time, trying the first safe seat; if a later row has <i>no</i> safe seat, you go back, re-seat the previous guest elsewhere, and try again. That “try, and rewind on a dead end” is backtracking.`,
  keyterms: [
    ['Backtracking', 'Build a solution step by step; undo (“backtrack”) the moment a step can’t lead anywhere.'],
    ['Choose / explore / unchoose', 'Place a queen, recurse, then remove it to try the next option.'],
    ['Constraint / safe check', 'A placement is valid only if it shares no row, column, or diagonal with another queen.'],
    ['Pruning', 'Abandoning a partial placement early once it’s doomed — the key to efficiency.'],
    ['Decision tree', 'The branching space of choices backtracking walks, pruning dead branches.']],
  recap: [
    `N-Queens places N queens so none attack each other — the classic <b>backtracking</b> problem.`,
    `Backtracking = <b>choose → explore → unchoose</b>: place a queen, recurse, and undo on a dead end.`,
    `A <b>safe check</b> (no shared row/column/diagonal) validates each placement.`,
    `<b>Pruning</b> doomed partial placements early is what keeps it tractable.`,
    `The same choose/explore/unchoose template solves mazes, Sudoku, and many combinatorial puzzles.`]
});

XPATCH('permutations', {
  plain: `Generating permutations means producing <b>every possible ordering</b> of a set of items. It’s a backtracking problem: pick which item goes first, then recursively arrange the rest, undoing each choice before trying the next.`,
  analogy: `It’s listing every order N people could line up in. You decide who stands first (N choices), then for each of those, who stands second from the remaining people, and so on. The tree of choices has N! leaves — every distinct line-up — and backtracking walks all of them, swapping people back after each branch.`,
  keyterms: [
    ['Permutation', 'An arrangement of all items in a specific order.'],
    ['N! (factorial)', 'The number of permutations of N items — grows explosively.'],
    ['Backtracking', 'Fix one position, recurse on the rest, then undo to try the next option.'],
    ['Used set / swap', 'Track which items are placed (or swap in place) to avoid reusing one.'],
    ['Handling duplicates', 'Skip equal choices at the same level to avoid repeated permutations.']],
  recap: [
    `Permutations = every <b>ordering</b> of the items; there are <b>N!</b> of them.`,
    `Backtracking builds each: choose the next item, recurse on the rest, then <b>undo</b> and try another.`,
    `Track placed items (a used-set or in-place swaps) so none is reused.`,
    `Because the count is N!, it’s only feasible for small N.`,
    `It shares the choose/explore/unchoose template with subsets and N-Queens.`]
});

XPATCH('subsets', {
  plain: `Generating subsets means producing every possible selection from a set — the “power set”. The clean way to see it: for each element, make a binary choice — <b>include it or not</b> — so N elements give 2^N subsets.`,
  analogy: `Think of building a pizza from a list of toppings. For each topping you make one yes/no decision: on or off. Every distinct combination of those yes/no choices is one possible pizza — and listing all of them is generating all subsets.`,
  keyterms: [
    ['Subset / power set', 'A selection of some (or none/all) items; the power set is the set of all subsets.'],
    ['2^N', 'The number of subsets of N items (each is in or out).'],
    ['Include/exclude', 'The per-element binary choice that generates them all.'],
    ['Backtracking', 'Recurse making the include/exclude choice at each element, undoing to explore both.'],
    ['Bitmask trick', 'Each subset maps to an N-bit number, so counting 0…2^N−1 enumerates them.']],
  recap: [
    `Subsets enumerate every selection (the <b>power set</b>); there are <b>2^N</b> of them.`,
    `Each element has a simple <b>include-or-exclude</b> choice.`,
    `Backtracking recurses through those choices (undoing to explore both branches).`,
    `A neat alternative is the <b>bitmask trick</b>: counting 0…2^N−1 lists every subset.`,
    `Feasible only for modest N, since 2^N grows fast.`]
});

XPATCH('gcd', {
  plain: `The greatest common divisor (GCD) of two numbers is the largest number that divides both. Euclid’s algorithm finds it with astonishing speed: repeatedly replace the larger number with its <b>remainder</b> when divided by the smaller, until one becomes zero — the other is the GCD.`,
  analogy: `Imagine tiling a rectangle with the largest identical square tiles that fit exactly. You keep slicing off the biggest square you can from the rectangle, leaving a smaller rectangle, and repeat. The side length of the final square that tiles everything perfectly is the GCD of the original sides.`,
  keyterms: [
    ['GCD', 'The largest integer dividing both numbers.'],
    ['Euclid’s algorithm', 'Replace (a, b) with (b, a mod b) until b = 0; then a is the GCD.'],
    ['Modulo (remainder)', 'The remainder after division — the operation that shrinks the numbers fast.'],
    ['O(log) steps', 'The numbers shrink rapidly, so it finishes in logarithmically many steps.'],
    ['LCM link', 'Least common multiple = a×b ÷ gcd(a,b).']],
  recap: [
    `GCD is the largest number dividing both inputs.`,
    `<b>Euclid’s algorithm</b>: repeatedly replace (a, b) with (b, a mod b) until b = 0; the remaining a is the GCD.`,
    `Using the <b>remainder</b> shrinks the numbers fast, so it finishes in <b>O(log)</b> steps.`,
    `The <b>LCM</b> follows immediately: a×b ÷ gcd.`,
    `It’s one of the oldest algorithms and a building block across number theory and crypto.`]
});

XPATCH('sieve', {
  plain: `The Sieve of Eratosthenes finds <b>all prime numbers up to n</b> efficiently. Instead of testing each number for primality, you start with every number marked “prime”, then repeatedly take the next prime and <b>cross out all its multiples</b>. Whatever is never crossed out is prime.`,
  analogy: `Picture the numbers 2…n written in a grid. Circle 2, then cross out 4, 6, 8, … (all multiples of 2). Circle the next uncrossed number (3), cross out 6, 9, 12, … Keep going. The numbers left circled at the end are exactly the primes — you found them all without dividing anything to test it.`,
  keyterms: [
    ['Prime', 'A number greater than 1 divisible only by 1 and itself.'],
    ['Sieve', 'Mark all as prime, then eliminate multiples of each prime found.'],
    ['Cross out multiples', 'Each prime p removes 2p, 3p, 4p… — start at p² for efficiency.'],
    ['O(n log log n)', 'Nearly linear — far faster than testing each number individually.'],
    ['Space O(n)', 'A boolean array of size n marks prime/not-prime.']],
  recap: [
    `The Sieve of Eratosthenes finds <b>all primes up to n</b> by elimination, not by testing each number.`,
    `Mark everything prime, then for each prime <b>cross out its multiples</b> (starting at p²); survivors are prime.`,
    `It runs in about <b>O(n log log n)</b> — nearly linear — using an O(n) boolean array.`,
    `Far faster than checking each number’s divisibility separately.`,
    `It’s the standard way to get many primes at once (and a base for number-theory problems).`]
});

XPATCH('bits', {
  plain: `Bit manipulation works directly on the individual 0/1 bits of a number using operations like AND, OR, XOR, NOT, and shifts. It lets you pack many flags into one integer, test or flip a single bit, and do certain tricks far faster than ordinary arithmetic.`,
  analogy: `Think of an integer as a row of light switches, each on (1) or off (0). <b>AND</b> keeps only switches on in both numbers; <b>OR</b> turns on any that were on in either; <b>XOR</b> flips where they differ; <b>shifting</b> slides the whole row left or right (doubling or halving). With a “mask” you can target and flip exactly one switch without disturbing the others.`,
  keyterms: [
    ['AND / OR / XOR / NOT', 'The bitwise operators: both-on, either-on, differ, flip-all.'],
    ['Shift (<< >>)', 'Move bits left (×2 each) or right (÷2 each).'],
    ['Mask', 'A number crafted to select/clear/flip specific bits (e.g. 1 << k targets bit k).'],
    ['Test/set/clear a bit', 'Use masks: test = n & (1<<k); set = n | (1<<k); clear = n & ~(1<<k).'],
    ['Common tricks', 'n & (n−1) clears the lowest set bit; XOR finds the unique unpaired value.']],
  recap: [
    `Bit manipulation operates on a number’s individual <b>bits</b> with AND, OR, XOR, NOT, and shifts.`,
    `Think of an integer as a row of <b>switches</b>: AND (both), OR (either), XOR (differ), shift (slide).`,
    `A <b>mask</b> (like 1 &lt;&lt; k) lets you test, set, or clear one specific bit.`,
    `Handy tricks: <code>n & (n−1)</code> clears the lowest set bit; XOR cancels pairs to find a lone value.`,
    `It packs flags compactly and speeds up certain operations versus arithmetic.`]
});
