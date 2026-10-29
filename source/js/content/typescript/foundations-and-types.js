/* ===== TypeScript A: foundations & the type system ===== */
SD_CATS.push(['tsfound', 'Foundations'], ['tstypes', 'The type system'], ['tscheck', 'Type checking & safety'], ['tsorg', 'Organization & tooling'], ['tsapp', 'Frontend & backend'], ['tstest', 'Testing & quality']);
const TST = (k, o) => { o.domain = 'TypeScript'; o.edgeTitle = o.edgeTitle || 'Pitfalls & gotchas'; SDX(k, o); };

TST('ts-what', { name: 'What TypeScript is & how it checks types', cat: 'tsfound',
  blurb: `TypeScript is JavaScript plus a static type system. You write types, a compiler checks them before your code runs, and then the types are erased to produce plain JavaScript. Understanding that pipeline — check, then erase — explains almost everything about how TypeScript behaves.`,
  facts: [['Is', 'a typed superset of JavaScript'], ['Checks', 'at compile time, before running'], ['Produces', 'plain JavaScript (types erased)'], ['Typing', 'structural, not nominal']],
  cheat: [['tsc', 'The TypeScript compiler / type checker'], ['.ts / .tsx', 'TypeScript source (tsx = with JSX)'], ['Type erasure', 'Types vanish in the emitted JS — no runtime cost or checks'], ['Structural typing', 'Compatibility by shape, not by name'], ['Type inference', 'TS infers types you don’t annotate'], ['tsconfig.json', 'Compiler configuration'], ['any', 'Opt out of checking (avoid)'], ['Superset', 'All valid JS is valid TS'], ['DefinitelyTyped', '@types/* packages for untyped libraries'], ['Playground', 'typescriptlang.org/play — try TS in the browser']],
  sections: [
    ['Check at compile time, erase at runtime', PP(`TypeScript runs in two conceptual phases. First the <b>type checker</b> reads your annotations and inferred types and reports errors — a function called with the wrong argument, a possibly-undefined value used unsafely. Then the compiler <b>emits JavaScript with all the types removed</b>. The crucial consequence: <b>types do not exist at runtime</b>. You cannot branch on a TypeScript type, and a type never changes what the program does — it only decides whether the program is allowed to compile. Runtime safety at the edges (API responses, user input) still needs real runtime checks, covered later in the course.`)],
    ['Structural typing: shapes, not names', PP(`Most languages use <i>nominal</i> typing — a value fits a type only if it was declared as that type. TypeScript is <b>structural</b>: a value fits a type if it has the right <b>shape</b>. Two independently-declared types with the same members are interchangeable, and an object with <i>extra</i> properties is assignable to a type that needs fewer. This matches how JavaScript is actually used and is why "duck typing" works with full type safety.`)],
    ['Inference means fewer annotations', PP(`You rarely annotate everything. TypeScript <b>infers</b> types from initializers, return statements, and context. The guidance: annotate the <b>boundaries</b> — function parameters, public APIs, and exported values — and let TS infer the <b>insides</b>. Over-annotating is noise; under-annotating boundaries loses safety and good error messages.`)]
  ],
  snipTitle: 'How checking and erasure work', snipNote: 'The same code, before and after compilation, plus structural typing in action.',
  snips: [['Check → erase', 'typescript', `// TypeScript you write:
function greet(name: string): string {
  return "Hello, " + name.toUpperCase();
}
greet(42);          // ✗ Error at COMPILE time: number is not assignable to string

// Emitted JavaScript (types erased — this is what actually runs):
// function greet(name) { return "Hello, " + name.toUpperCase(); }
// There is no "string" check at runtime; TS caught it before shipping.`],
    ['Structural typing', 'typescript', `interface Point { x: number; y: number; }

function length(p: Point): number {
  return Math.hypot(p.x, p.y);
}

// Never declared as Point, but has the right shape → accepted:
const v = { x: 3, y: 4, label: "vec" };
length(v);          // ✓ OK (extra "label" is fine on an existing object)

// Two separate types with the same shape are interchangeable:
type Coord = { x: number; y: number };
const c: Coord = v; // ✓ OK — compatibility is by structure, not name`],
    ['Inference', 'typescript', `let count = 0;              // inferred: number
const name = "Ada";          // inferred: "Ada" (a literal type, because const)
const nums = [1, 2, 3];      // inferred: number[]

// Return type inferred as { id: number; name: string }:
function makeUser(id: number, name: string) {
  return { id, name };
}
// Annotate the boundary (params), let TS infer the return:
const u = makeUser(1, "Ada");  // u: { id: number; name: string }`]],
  edge: [`Types are erased — you can’t do <code>if (x is MyType)</code> at runtime; use real checks (typeof, in, or a validator) at boundaries.`, `A passing compile does not guarantee runtime safety: data from the network or JSON can still violate your types unless you validate it.`, `Structural typing means extra properties are usually allowed — but object <b>literals</b> get "excess property checks" that flag unknown keys (a deliberate safety net).`, `<code>any</code> silently disables checking for that value and everything it touches; it defeats the purpose of TypeScript.`, `TS types are not enforced by JavaScript engines; libraries shipped as JS still need <code>@types</code> or bundled declarations.`],
  faq: [['Is TypeScript a different language from JavaScript?', PP(`No — it is a <b>superset</b>. Every valid JavaScript file is valid TypeScript, so you can rename <code>.js</code> to <code>.ts</code> and start adding types incrementally. TypeScript adds a static type layer (plus a few features like enums and parameter properties) that is checked by the compiler and then removed. The program that runs is ordinary JavaScript.`)],
    ['If types are erased, do they make my code faster or safer at runtime?', PP(`Neither directly. Types are a <b>compile-time</b> tool: they catch bugs, power editor autocomplete and refactoring, and document intent — all before the code runs. At runtime the code is plain JS with no type information, so types add no speed and enforce nothing. For runtime guarantees (validating external data), you add explicit checks, which the course covers in the type-checking unit.`)],
    ['Why does TypeScript use structural typing?', PP(`Because JavaScript is structurally used — objects are passed around by shape, not by class hierarchy. Structural typing lets TS describe real JS patterns (plain object literals, duck typing) precisely, makes types composable, and avoids forcing you to declare a named type just to satisfy the checker. It occasionally surprises people (unrelated types being compatible), but it is what makes TS feel like "JavaScript with types" rather than a different language.`)]],
  qs: [SQ('What happens to TypeScript types when the code is compiled and run?', ['They are enforced by the JS engine at runtime', 'They are erased; the output is plain JavaScript with no type checks at runtime', 'They are converted into runtime assertions automatically', 'They become comments'], 1, 'TS checks at compile time, then erases types — runtime is plain JS.'),
    SQ('TypeScript determines type compatibility primarily by…', ['The declared name of the type (nominal typing)', 'The structure/shape of the value (structural typing)', 'The file it is declared in', 'Alphabetical order'], 1, 'TS is structurally typed: same shape = compatible, regardless of name.')]
});
DP('ts-what', {
  fu: [['What is the difference between tsc and a bundler like esbuild for building TS?', 'tsc is the reference compiler and the only full type checker; it is accurate but slower. Bundlers (esbuild, swc, Vite) strip TS types very fast but do NOT type-check — so the common setup is to transpile with a fast tool and run tsc --noEmit separately (and in CI) for the actual checking.'],
    ['Does "all JS is valid TS" mean my JS compiles cleanly?', 'It parses as TS, but under strict settings the checker may flag real issues (implicit any, possibly-undefined). That is the point of migration: start loose, tighten flags gradually. The code still runs either way.'],
    ['What are declaration files (.d.ts)?', 'Files that describe the types of JavaScript code without implementation, so TS can check calls into untyped JS libraries. Many packages ship their own; others are covered by community @types/* packages from DefinitelyTyped.']],
  deep: [['Mental model', 'Think of TypeScript as a linter with a very powerful type system bolted onto JavaScript: it runs before your code, approves or rejects it, then gets out of the way. Nothing it computes survives to runtime.'],
    ['Failure mode', 'Trusting types for runtime safety. A value typed as User that actually came from JSON.parse can be anything; types describe intent, not reality, until you validate.'],
    ['In real projects', 'The highest-value settings are the strict family; teams treat a clean tsc --noEmit as a required CI gate, catching whole classes of bugs before tests even run.']],
  src: ['TypeScript Handbook: The Basics', 'https://www.typescriptlang.org/docs/handbook/2/basic-types.html'] });

TST('ts-basics', { name: 'Everyday types: primitives, arrays, objects, any/unknown/never', cat: 'tsfound',
  blurb: `The building blocks: the primitive types, how to type arrays, tuples and objects, literal types, and the three special types — any, unknown and never — that most confuse beginners. Getting these right is the foundation for everything else.`,
  facts: [['Primitives', 'string, number, boolean, null, undefined, bigint, symbol'], ['Any', 'disables checking (avoid)'], ['Unknown', 'safe top type — must narrow before use'], ['Never', 'the empty type — impossible values']],
  cheat: [['string / number / boolean', 'The core primitives (lowercase)'], ['T[]', 'Array of T (also Array&lt;T&gt;)'], ['[string, number]', 'Tuple: fixed length and position types'], ['{ a: number; b?: string }', 'Object type; b? is optional'], ['readonly', 'Property or array cannot be reassigned'], ['Literal type', '"on" | "off" | 42 — exact values'], ['any', 'Turns off all checks for that value'], ['unknown', 'Anything, but you must narrow before using it'], ['never', 'No value is assignable; unreachable / exhaustiveness'], ['null / undefined', 'Absent values; see strictNullChecks']],
  sections: [
    ['Primitives, arrays, tuples and objects', PP(`Primitives are lowercase (<code>string</code>, <code>number</code>, <code>boolean</code>). Arrays are <code>T[]</code> or <code>Array&lt;T&gt;</code>. <b>Tuples</b> fix the length and the type at each position. Object types list properties, with <code>?</code> for optional and <code>readonly</code> for immutable. Prefer precise object types over the catch-all <code>object</code>.`)],
    ['Literal types and <code>as const</code>', PP(`A literal type is a single exact value, like <code>"GET"</code> or <code>200</code>. Combined with unions they model finite sets (a status that is only <code>"idle" | "loading" | "done"</code>). By default <code>let</code> widens a literal to its primitive; <code>const</code> keeps it narrow, and <code>as const</code> makes an entire object/array deeply readonly with literal types — invaluable for config and discriminated unions.`)],
    ['any vs unknown vs never', PP(`<b><code>any</code></b> is the escape hatch that turns off checking — it spreads silently and should be rare. <b><code>unknown</code></b> is the <i>safe</i> counterpart: you can hold anything in it, but TypeScript forces you to <b>narrow</b> it (with <code>typeof</code>, a check, or a validator) before you use it, so safety is preserved. <b><code>never</code></b> is the type with <i>no</i> values: it is what a function that always throws returns, and it is the key to <b>exhaustiveness checking</b> — if a value narrows to <code>never</code>, you have handled every case.`)]
  ],
  snipTitle: 'The everyday types', snipNote: 'Primitives through the three special types.',
  snips: [['Shapes', 'typescript', `let title: string = "TS";
let scores: number[] = [98, 72];
let pair: [string, number] = ["age", 30];      // tuple

type User = {
  id: number;
  name: string;
  email?: string;            // optional
  readonly createdAt: Date;  // can't be reassigned
};

// Literal union models a finite set of values:
type Method = "GET" | "POST" | "PUT" | "DELETE";
let m: Method = "GET";       // only those four are allowed`],
    ['as const', 'typescript', `// Without as const: widened types
const a = { role: "admin", retries: 3 };
// a.role: string, a.retries: number

// With as const: literal, deeply readonly
const b = { role: "admin", retries: 3 } as const;
// b.role: "admin", b.retries: 3, both readonly

const ROUTES = ["/", "/about", "/contact"] as const;
type Route = typeof ROUTES[number];   // "/" | "/about" | "/contact"`],
    ['any / unknown / never', 'typescript', `let loose: any = 5;
loose.foo.bar();             // ✗ no error — any disables checking (dangerous)

let safe: unknown = JSON.parse(input);
// safe.trim();              // ✗ Error: must narrow first
if (typeof safe === "string") {
  safe.trim();               // ✓ OK — narrowed to string
}

function fail(msg: string): never {   // never returns normally
  throw new Error(msg);
}`]],
  edge: [`<code>unknown</code> is almost always the right choice over <code>any</code> for "I don’t know the type yet" — it keeps you safe by forcing a check.`, `Object-literal <b>excess property checks</b>: assigning <code>{ id: 1, extra: true }</code> directly to a type without <code>extra</code> errors, even though structural typing would otherwise allow it.`, `Without <code>as const</code>, array/object literals widen (e.g. <code>["a","b"]</code> becomes <code>string[]</code>), losing the literal types you often want.`, `<code>null</code> and <code>undefined</code> are only distinct from other types when <code>strictNullChecks</code> is on (it is, under <code>strict</code>).`, `A variable typed <code>never</code> that you can actually reach usually means a logic error or an unhandled case.`],
  faq: [['When should I ever use <code>any</code>?', PP(`Almost never. Reach for <code>unknown</code> instead when a value’s type is genuinely not known (parsed JSON, a third-party return) — it forces you to narrow before use, preserving safety. <code>any</code> is a last resort for gradual migration or truly dynamic code, and even then it should be isolated and commented. Enabling <code>noImplicitAny</code> stops TS from silently falling back to <code>any</code>.`)],
    ['What is <code>never</code> actually for?', PP(`Two main uses. First, as the return type of functions that <b>never produce a value</b> — they always throw or loop forever. Second, and more importantly, for <b>exhaustiveness checking</b>: in a <code>switch</code> over a union, the <code>default</code> branch can assign the value to a <code>never</code>-typed variable; if you later add a new case to the union and forget to handle it, that assignment fails to compile, forcing you to handle it.`)],
    ['Why did TypeScript reject my object with an extra property?', PP(`Because of <b>excess property checks</b>. When you assign an object <i>literal</i> directly to a typed target, TS flags properties the target doesn’t declare — a safety net against typos like <code>colour</code> vs <code>color</code>. Structural typing still allows extra properties when the object comes from a variable; the strict check only applies to fresh literals. Fix it by removing the typo, widening the type, or assigning through a variable if the extra property is intentional.`)]],
  qs: [SQ('You parse untrusted JSON and don’t know its type. Which is the safest type to hold it in?', ['any', 'unknown', 'object', 'never'], 1, 'unknown forces you to narrow before use, unlike any which disables checks.'),
    SQ('What is the main purpose of the <code>never</code> type in day-to-day code?', ['To replace any', 'Exhaustiveness checking and typing functions that never return', 'To make values readonly', 'To allow extra properties'], 1, 'never powers exhaustiveness checks and types throw/infinite-loop functions.')]
});
DP('ts-basics', {
  fu: [['What is the difference between T[] and Array<T>?', 'Nothing — they are identical; T[] is shorthand. Teams pick one for consistency. ReadonlyArray<T> (or readonly T[]) is the immutable version.'],
    ['When do I need a tuple instead of an array?', 'When position carries meaning and the length is fixed — coordinates [x, y], a useState-style [value, setter], or CSV rows. Tuples type each position precisely, where an array gives one element type for all positions.'],
    ['How does as const help with unions?', 'It freezes an array/object into literal types, so typeof ARR[number] produces a union of the exact values. This keeps a single source of truth: define the values once, derive the type from them.']],
  deep: [['Technique', 'Model finite sets as literal unions ("idle" | "loading" | "error") rather than string — you get autocomplete, typo protection, and exhaustiveness checking for free.'],
    ['Failure mode', 'Reaching for any to "make the error go away". It hides the bug and infects every downstream value. unknown + a narrow, or fixing the real type, is almost always better.'],
    ['In real code', 'as const on configuration and route/event-name arrays is a widely-used pattern to derive precise types from runtime data without duplicating them.']],
  src: ['TypeScript Handbook: Everyday Types', 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html'] });

TST('ts-functions', { name: 'Typing functions: parameters, returns & overloads', cat: 'tsfound',
  blurb: `Functions are where types earn their keep. This covers parameter and return typing, optional/default/rest parameters, function types and call signatures, overloads, and the subtle rules around this and callback parameter counts.`,
  facts: [['Annotate', 'parameters always; return often inferred'], ['Optional', 'param?: T'], ['Rest', '...args: T[]'], ['Overloads', 'multiple signatures, one implementation']],
  cheat: [['(a: number) => string', 'A function type'], ['param?: T', 'Optional parameter (must come after required)'], ['param: T = default', 'Default value (implies optional)'], ['...rest: T[]', 'Variadic parameters'], ['void', 'Return value is ignored'], ['Overload', 'Several signatures above one implementation'], ['this: T', 'Type the this context (first "param", erased)'], ['Call signature', 'Object type with a callable member'], ['Contextual typing', 'Callback params inferred from where it’s used'], ['Fewer params OK', 'A callback may accept fewer args than given']],
  sections: [
    ['Parameters and returns', PP(`Always annotate <b>parameters</b> (TS can’t infer them from a function body), and let TS infer the <b>return type</b> unless you want it enforced at the boundary — annotating returns on exported functions catches mistakes where the body drifts from the contract. <code>void</code> means the caller ignores any return; a <code>void</code>-returning callback type may still be satisfied by a function that returns a value (a deliberate convenience, e.g. <code>arr.forEach</code>).`)],
    ['Optional, default and rest parameters', PP(`Optional parameters use <code>?</code> and must follow required ones. A parameter with a <b>default</b> is automatically optional. <b>Rest</b> parameters (<code>...args: number[]</code>) collect any number of trailing arguments into a typed array, and TS 4+ supports <b>variadic tuple</b> types for precise rest typing.`)],
    ['Overloads and call signatures', PP(`When a function returns different types depending on its arguments, write <b>overload signatures</b> — several declarations followed by a single, more general implementation that is not directly callable. Prefer <b>union parameters</b> or <b>generics</b> when they express the relationship more simply; reserve overloads for genuinely different argument <i>shapes</i>. A <b>call signature</b> lets an object type also be callable (useful for functions with properties).`)]
  ],
  snipTitle: 'Function typing', snipNote: 'From basics to overloads.',
  snips: [['Params & returns', 'typescript', `function add(a: number, b: number): number {
  return a + b;
}

// Optional, default, rest:
function log(msg: string, level: "info" | "warn" = "info", ...tags: string[]) {
  console.log(level, msg, tags);
}
log("hi");                 // ok
log("careful", "warn", "auth", "db");

// Function type as a parameter (callback):
function map<T, U>(arr: T[], fn: (item: T, index: number) => U): U[] {
  return arr.map(fn);
}`],
    ['Overloads', 'typescript', `// Overload signatures (what callers see):
function parse(input: string): string[];
function parse(input: number): number[];
// Implementation signature (not directly callable):
function parse(input: string | number): string[] | number[] {
  return typeof input === "string" ? input.split("") : [input];
}

const a = parse("ab");   // a: string[]
const b = parse(42);     // b: number[]`],
    ['this & call signatures', 'typescript', `// Type the "this" context (erased at runtime, must be first):
interface Button { label: string; }
function onClick(this: Button, e: Event) {
  console.log(this.label);
}

// Call signature: an object that is also callable
type Counter = {
  (): number;         // calling it returns a number
  reset(): void;      // and it has a method
};`]],
  edge: [`Optional and default parameters must come <b>after</b> all required ones.`, `A callback type that returns <code>void</code> can be satisfied by a function returning any value — so <code>void</code> return types don’t forbid returning something (this is intentional for APIs like <code>forEach</code>).`, `Functions are compared <b>bivariantly</b> for method parameters but checked more strictly for standalone function types under <code>strictFunctionTypes</code> — a known soundness trade-off.`, `Overload <i>implementation</i> signatures are invisible to callers; only the overload declarations count, so make sure they cover every real call.`, `<code>this</code> parameters are a TypeScript-only fiction erased at compile time; they don’t change the runtime <code>this</code>.`],
  faq: [['Should I annotate function return types?', PP(`For <b>exported/public</b> functions and anything non-trivial, yes — an explicit return type is a contract: if the body accidentally returns the wrong thing, you get an error at the function rather than at some distant call site, and the error messages are clearer. For small local functions, inference is fine and less noisy. A good rule: annotate the boundaries, infer the internals.`)],
    ['When should I use overloads versus a union or generic?', PP(`Use <b>overloads</b> only when the return type genuinely depends on <i>distinct argument shapes</i> that a single signature can’t express. Often a <b>union parameter</b> (<code>x: string | number</code>) or a <b>generic</b> (<code>&lt;T&gt;(x: T) =&gt; T</code>) is simpler, keeps one signature, and avoids the maintenance burden of overloads. Overloads also have sharp edges (the implementation signature isn’t checked against callers), so reach for them last.`)],
    ['Why can I pass a function that takes fewer arguments to a callback that provides more?', PP(`Because it is always safe to <b>ignore</b> extra arguments. JavaScript callers routinely pass more arguments than the callback uses (e.g. <code>arr.map((x) =&gt; x * 2)</code> ignores the index and array). TypeScript allows a function with fewer parameters where more are expected, since dropping arguments can’t cause a type error. The reverse — requiring more parameters than are supplied — is not allowed.`)]],
  qs: [SQ('Where must optional parameters appear in a function’s parameter list?', ['Anywhere', 'Before required parameters', 'After all required parameters', 'Only as the first parameter'], 2, 'Optional (and defaulted) parameters must follow required ones.'),
    SQ('A callback type declares two parameters. Can you pass a function that takes only one?', ['No, the counts must match exactly', 'Yes — a function may accept fewer arguments than provided', 'Only with an overload', 'Only if it returns void'], 1, 'Ignoring extra arguments is safe, so fewer-param functions are assignable.')]
});
DP('ts-functions', {
  fu: [['What are variadic tuple types?', 'They let rest parameters and tuples carry precise, position-aware types — e.g. a typed concat or a curry/partial-application helper where the remaining parameters are computed from a tuple. They make higher-order utilities fully typed without overloads.'],
    ['What does strictFunctionTypes change?', 'It makes standalone function-type parameters checked contravariantly (stricter, catching unsafe assignments), while method parameters remain bivariant for ergonomic reasons. It is part of strict mode and catches real callback mismatches.'],
    ['How do I type a function that has properties?', 'Use a call signature inside an object type (or interface): declare the callable shape plus the extra members. This models functions decorated with metadata, like middleware that also carries config.']],
  deep: [['Technique', 'Prefer generics and union parameters over overloads; reserve overloads for distinct argument shapes with different return types. Annotate returns on public functions as contracts.'],
    ['Failure mode', 'Overload lists whose implementation signature silently permits calls the declarations don’t cover, or that drift out of sync with the body.'],
    ['In real code', 'Most function typing is just parameters + inferred returns; the advanced tools (overloads, variadic tuples, this types) appear mainly in library and utility code.']],
  src: ['TypeScript Handbook: More on Functions', 'https://www.typescriptlang.org/docs/handbook/2/functions.html'] });

TST('ts-interfaces', { name: 'Interfaces vs type aliases', cat: 'tsfound',
  blurb: `Both interfaces and type aliases name a type, and most of the time either works. Knowing the real differences — declaration merging, what each can express, and performance/error-message nuances — lets you pick deliberately and follow a consistent convention.`,
  facts: [['Both', 'name a type; mostly interchangeable for objects'], ['Interface only', 'declaration merging'], ['Type only', 'unions, tuples, mapped & conditional types'], ['Convention', 'interface for objects/APIs; type for everything else']],
  cheat: [['interface X { }', 'Object/contract shape; can be extended and merged'], ['type X = { }', 'Alias for any type (object, union, primitive…)'], ['extends', 'Interface inheritance (also interface extends type)'], ['& (intersection)', 'Combine types (the "type" way to compose)'], ['Declaration merging', 'Two interfaces with the same name combine'], ['Unions/tuples', 'type only — interfaces can’t be a union'], ['Mapped/conditional', 'type only'], ['implements', 'A class can implement either'], ['Perf', 'interfaces cache better in large unions (minor)'], ['Errors', 'interface names often read better in messages']],
  sections: [
    ['What only each can do', PP(`<b>Interfaces</b> can be <b>re-opened and merged</b> (declaration merging) and are idiomatic for object shapes, class contracts, and public API surfaces. <b>Type aliases</b> can name <i>anything</i> a type expression can produce — <b>unions</b>, <b>tuples</b>, <b>primitives</b>, <b>mapped</b> and <b>conditional</b> types — which interfaces cannot. So unions and computed types must be <code>type</code>; mergeable/extendable object contracts are natural as <code>interface</code>.`)],
    ['Extending and composing', PP(`Interfaces compose with <code>extends</code> (and can extend a <code>type</code> that is an object). Type aliases compose with <b>intersections</b> (<code>&amp;</code>). Both support multiple bases. For plain object inheritance they are equivalent; the difference shows up only with the features above.`)],
    ['A practical convention', PP(`A common, low-friction rule: use <b>interface</b> for object shapes and anything a class will <code>implement</code> or that libraries may extend, and use <b>type</b> for unions, tuples, function types, and anything built with mapped/conditional/utility types. Consistency matters more than the exact choice; pick a rule and let linting enforce it.`)]
  ],
  snipTitle: 'Interface vs type', snipNote: 'The overlap and the real differences.',
  snips: [['Overlap & extension', 'typescript', `// These two are essentially equivalent:
interface User { id: number; name: string; }
type UserT = { id: number; name: string };

// Extending:
interface Admin extends User { role: "admin"; }     // interface way
type AdminT = UserT & { role: "admin" };             // type (intersection) way

class Account implements User {                      // class can implement either
  id = 1; name = "Ada";
}`],
    ['Only "type" can do', 'typescript', `type Status = "idle" | "loading" | "done";   // union — interface can't
type Pair = [number, number];                 // tuple — interface can't
type Id = string | number;                    // union of primitives
type Nullable<T> = T | null;                  // generic alias over a union`],
    ['Declaration merging (interface only)', 'typescript', `interface Window { myFlag: boolean; }
interface Window { myOtherFlag: number; }
// Window now has BOTH members — interfaces with the same name merge.
// Used to augment global or third-party types:
declare global {
  interface Window { analytics?: { track(e: string): void }; }
}`]],
  edge: [`A union or tuple <b>must</b> be a <code>type</code> — interfaces can only describe object/function/constructor shapes.`, `Declaration merging is powerful for augmenting globals/libraries but can cause surprising "where did this member come from?" moments; keep augmentations centralized.`, `Intersecting two object types with conflicting property types yields <code>never</code> for that property, which can be confusing.`, `Interfaces and type aliases are <i>not</i> the same in error messages: a named interface often appears by name, while a complex alias may be expanded inline.`, `You can’t <code>extends</code> a union type with an interface (there’s no single shape to inherit).`],
  faq: [['Interface or type — which should I use?', PP(`For <b>object shapes</b>, class contracts, and public/extensible APIs, prefer <b>interface</b>: it supports declaration merging and reads well. For <b>unions, tuples, function types, and computed types</b> (mapped/conditional/utility), you <i>must</i> use <b>type</b>. Many teams default to interface for objects and type for everything else and enforce it with a lint rule. The practical difference is small for ordinary objects; the choice matters when you need a feature only one of them has.`)],
    ['What is declaration merging and when is it useful?', PP(`If you declare two interfaces with the <b>same name</b> in the same scope, TypeScript <b>merges</b> their members into one. This is mainly useful for <b>augmenting</b> types you don’t own — adding a property to the global <code>Window</code>, extending a library’s interface (e.g. Express’s <code>Request</code>), or layering types across files. Type aliases cannot be re-opened this way, which is exactly why libraries that expect to be augmented expose interfaces.`)],
    ['Does the choice affect performance or error messages?', PP(`Marginally. In very large codebases, the compiler can cache interface relationships a bit more efficiently than sprawling intersection types, and <b>named interfaces</b> tend to produce cleaner error messages (shown by name rather than expanded structurally). These are minor considerations next to expressiveness; choose based on the feature you need and keep it consistent.`)]],
  qs: [SQ('You need to name a union type like "idle" | "loading" | "done". Can an interface do this?', ['Yes', 'No — unions must be a type alias', 'Only with extends', 'Only with declaration merging'], 1, 'Interfaces describe object/function shapes; unions require a type alias.'),
    SQ('Which feature is unique to interfaces?', ['Intersections', 'Declaration merging (re-opening to add members)', 'Generics', 'Optional properties'], 1, 'Only interfaces merge when declared multiple times with the same name.')]
});
DP('ts-interfaces', {
  fu: [['Can an interface extend a type alias (or vice versa)?', 'An interface can extend a type alias as long as that alias is an object type. A type alias composes other types with intersections instead of extends. Mixing is fine; the restriction is only that interfaces need object-like shapes to extend.'],
    ['Why do library authors prefer interfaces for public types?', 'Because consumers can augment them via declaration merging (e.g. adding properties to Express Request, or plugin fields). Exposing a type alias would lock users out of extending it. This is a deliberate API-design choice.'],
    ['What happens when intersected object types conflict?', 'A property present in both with incompatible types becomes never (no value satisfies both), which usually signals a modeling mistake. For unions of object shapes, prefer discriminated unions over intersections.']],
  deep: [['Technique', 'Default to interface for object/class/API shapes (mergeable, extensible) and type for unions, tuples, function types and computed types. Enforce with @typescript-eslint/consistent-type-definitions.'],
    ['Failure mode', 'Scattered declaration-merging augmentations that make a type’s real shape hard to find; centralize global/library augmentations in one declarations file.'],
    ['In real code', 'Framework typings (React, Express, Vue) lean on interfaces precisely so applications can augment them; application domain models are often interfaces too, with type used for state unions.']],
  src: ['TypeScript Handbook: Interfaces vs. Type Aliases', 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces'] });

/* ---------------- Level 2: the type system ---------------- */

TST('ts-unions', { name: 'Unions, intersections & narrowing', cat: 'tstypes',
  blurb: `Union types model "one of several" and are the heart of modeling in TypeScript. The skill that makes them safe is narrowing — using runtime checks that TypeScript understands to shrink a union down to a specific member. Discriminated unions turn this into a superpower.`,
  facts: [['Union A | B', 'a value of either type'], ['Intersection A & B', 'a value of both at once'], ['Narrowing', 'checks that refine the type in a branch'], ['Discriminated union', 'a shared literal "tag" field']],
  cheat: [['A | B', 'Union: one of A or B'], ['A & B', 'Intersection: has all members of both'], ['typeof x === "string"', 'Narrows primitives'], ['"key" in obj', 'Narrows by property presence'], ['x instanceof C', 'Narrows to a class'], ['Discriminant', 'A shared literal field (kind/type/tag)'], ['switch on tag', 'Clean discriminated-union handling'], ['Truthiness narrowing', 'if (x) removes null/undefined/""/0'], ['Equality narrowing', 'x === y refines both'], ['Exhaustiveness', 'default → never catches missed cases']],
  sections: [
    ['Unions and intersections', PP(`A <b>union</b> <code>A | B</code> holds a value that is either <code>A</code> or <code>B</code>; you may only access members common to <i>all</i> members until you narrow. An <b>intersection</b> <code>A &amp; B</code> holds a value that satisfies <i>both</i> — useful to combine object shapes (mixins, adding fields). Unions are for "one of"; intersections for "all of".`)],
    ['Narrowing: teaching TS what you checked', PP(`TypeScript performs <b>control-flow analysis</b>: inside an <code>if</code>/<code>switch</code> it tracks what your runtime checks imply. <code>typeof</code> narrows primitives, <code>instanceof</code> narrows classes, the <code>in</code> operator narrows by property presence, truthiness removes <code>null</code>/<code>undefined</code>, and equality refines both sides. After a check, the variable’s type is narrowed <i>within that branch</i>, so member access is safe.`)],
    ['Discriminated unions', PP(`The most powerful pattern: give each member of a union a shared <b>literal "tag"</b> field (often <code>kind</code> or <code>type</code>). A <code>switch</code> on that tag narrows each branch to the exact member, with full autocomplete and type safety. Add an exhaustiveness check in <code>default</code> (assign to a <code>never</code>) and the compiler forces you to handle every variant — and flags you the day someone adds a new one.`)]
  ],
  snipTitle: 'Unions & narrowing', snipNote: 'From basic narrowing to discriminated unions with exhaustiveness.',
  snips: [['Narrowing', 'typescript', `function format(x: string | number | null): string {
  if (x === null) return "none";        // x: string | number
  if (typeof x === "string") return x.trim();   // x: string
  return x.toFixed(2);                   // x: number (narrowed by elimination)
}

type A = { a: number };
type B = { b: number };
function use(v: A | B) {
  if ("a" in v) return v.a;              // narrowed to A
  return v.b;                            // narrowed to B
}`],
    ['Discriminated union', 'typescript', `type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "rect"; w: number; h: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;   // s: circle
    case "square": return s.side ** 2;               // s: square
    case "rect":   return s.w * s.h;                 // s: rect
    default:
      const _exhaustive: never = s;   // ✗ compile error if a case is missing
      return _exhaustive;
  }
}`],
    ['Intersection', 'typescript', `type WithId = { id: string };
type Timestamped = { createdAt: Date; updatedAt: Date };

type Entity = WithId & Timestamped;    // has ALL of: id, createdAt, updatedAt
const e: Entity = { id: "1", createdAt: new Date(), updatedAt: new Date() };`]],
  edge: [`Before narrowing, you can only touch members common to every union member — accessing a member specific to one is an error.`, `<code>typeof null === "object"</code>, so <code>typeof x === "object"</code> does <b>not</b> exclude <code>null</code>; check for null separately.`, `Forgetting the exhaustiveness <code>never</code> check means adding a new union variant compiles silently while leaving branches unhandled — a common source of bugs.`, `Narrowing is forgotten across function/closure boundaries and after awaits in some cases; re-check inside the new scope.`, `Intersecting conflicting primitive types (<code>string &amp; number</code>) yields <code>never</code> — no value satisfies both.`],
  faq: [['What makes discriminated unions so recommended?', PP(`They give you <b>exhaustive, type-safe handling of variants</b> with zero runtime machinery. The shared literal tag lets TypeScript narrow each <code>switch</code>/<code>if</code> branch to exactly one shape, so you get autocomplete for that shape’s fields and errors if you access the wrong ones. Paired with an exhaustiveness <code>never</code> check, the compiler guarantees you’ve handled every case and <b>forces an update whenever a new variant is added</b> — turning a whole class of "forgot to handle X" bugs into compile errors.`)],
    ['Why can’t I access a property right after a union, before any check?', PP(`Because the value might be <i>any</i> member of the union, TypeScript only lets you access members that <b>all</b> members share — anything else could be undefined at runtime. You must <b>narrow</b> first (with <code>typeof</code>, <code>in</code>, <code>instanceof</code>, a discriminant check, etc.). After the check, within that branch, the type is refined and the member is safe to use.`)],
    ['How do I guarantee I’ve handled every case of a union?', PP(`Use an <b>exhaustiveness check</b>: in the <code>default</code> of a <code>switch</code> (or the final <code>else</code>), assign the value to a variable of type <code>never</code>. If every case has been handled, the value has narrowed to <code>never</code> and it compiles; if a case is missing — including a newly added variant — the value isn’t <code>never</code> and you get a compile error pointing you to the gap. It is the single most valuable TypeScript pattern for maintainable code.`)]],
  qs: [SQ('What is a discriminated union?', ['Any union of two types', 'A union whose members share a common literal "tag" field used to narrow them', 'An intersection of objects', 'A union that cannot be narrowed'], 1, 'A shared literal discriminant lets a switch narrow each branch precisely.'),
    SQ('How do you make the compiler enforce that every union case is handled?', ['Use any in the default', 'Assign the value to a never-typed variable in the default/else branch', 'Add a comment', 'Use an intersection'], 1, 'A never assignment fails to compile if any case (including a new one) is unhandled.')]
});
DP('ts-unions', {
  fu: [['What is control-flow analysis?', 'The compiler’s tracking of how runtime checks change a variable’s type along each code path. It is why TS "knows" that after if (typeof x === "string") the variable is a string in that branch, and number in the else.'],
    ['Can I narrow with a custom function?', 'Yes — a user-defined type guard (a function returning arg is Type) teaches the compiler to narrow based on your own logic. Assertion functions (asserts arg is Type) narrow by throwing. Both are covered in the type-checking unit.'],
    ['Union vs enum vs discriminated union for state?', 'A literal union ("idle" | "loading" | ...) is the lightest way to model simple states. A discriminated union is best when each state carries different data (e.g. "error" has a message, "success" has data). Enums are heavier and usually unnecessary.']],
  deep: [['Technique', 'Model domain states as discriminated unions with a kind/type tag and always add an exhaustiveness never check; it makes impossible states unrepresentable and refactors safe.'],
    ['Failure mode', 'Optional fields instead of a discriminated union ("data?, error?, loading?") allow contradictory states (data AND error set); a tagged union makes each state carry exactly its own fields.'],
    ['In real code', 'Reducers, API result types (loading/success/error), and parser ASTs are classic discriminated unions; the pattern is pervasive in well-typed React/Redux and backend code.']],
  src: ['TypeScript Handbook: Narrowing', 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html'] });

TST('ts-generics', { name: 'Generics', cat: 'tstypes',
  blurb: `Generics let you write functions, types and classes that work over many types while preserving the relationships between them. They are how you get reuse without losing type safety — the difference between a function that returns any and one that returns exactly what you passed in.`,
  facts: [['Purpose', 'reuse while keeping type relationships'], ['Syntax', '<T>(x: T) => T'], ['Constraints', '<T extends U>'], ['Defaults', '<T = Default>']],
  cheat: [['<T>', 'A type parameter'], ['identity<T>(x: T): T', 'Returns exactly what it got'], ['<T extends U>', 'Constrain T to be assignable to U'], ['<T = D>', 'Default type argument'], ['<T extends keyof O>', 'A key of another type parameter'], ['Inference', 'Type args usually inferred from arguments'], ['Generic interface/type', 'Container<T>, Result<T, E>'], ['Generic class', 'class Box<T> { … }'], ['Don’t over-generify', 'If T is used once, you may not need it'], ['Explicit args', 'fn<string>(x) when inference can’t help']],
  sections: [
    ['Why generics beat any', PP(`A function typed to take and return <code>any</code> loses all type information: the caller gets back <code>any</code> and safety evaporates. A <b>generic</b> captures the caller’s type in a <b>type parameter</b> and threads it through, so <code>identity&lt;T&gt;(x: T): T</code> returns <i>exactly</i> the type passed in. Generics preserve relationships between inputs and outputs — the whole point.`)],
    ['Constraints and defaults', PP(`A <b>constraint</b> (<code>T extends U</code>) restricts what <code>T</code> can be, letting you safely use members of <code>U</code> inside the generic (e.g. <code>T extends { length: number }</code> to read <code>.length</code>). <code>keyof</code> constraints tie one parameter to the keys of another for safe property access. <b>Defaults</b> (<code>T = string</code>) supply a fallback when the argument can’t be inferred and keep call sites tidy.`)],
    ['Inference and restraint', PP(`You rarely pass type arguments explicitly — TypeScript <b>infers</b> them from the values you pass. Provide them only when inference can’t (empty collections, ambiguous cases). A good discipline: introduce a type parameter only when it <b>connects two or more positions</b> (a parameter to a return, or two parameters to each other). A <code>T</code> used in exactly one place is often unnecessary indirection.`)]
  ],
  snipTitle: 'Generics in practice', snipNote: 'Functions, constraints, keyof, and generic containers.',
  snips: [['Functions & inference', 'typescript', `function identity<T>(x: T): T { return x; }
const n = identity(42);        // T inferred as number → n: number
const s = identity("hi");      // T inferred as "hi" → s: string

function first<T>(arr: T[]): T | undefined { return arr[0]; }
const x = first([1, 2, 3]);    // x: number | undefined`],
    ['Constraints & keyof', 'typescript', `// Constrain T so we can use .length:
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
longest([1,2], [1,2,3]);       // ok (arrays have length)
longest("ab", "abc");          // ok (strings have length)

// Safe property access with a keyof constraint:
function getProp<O, K extends keyof O>(obj: O, key: K): O[K] {
  return obj[key];
}
const name = getProp({ id: 1, name: "Ada" }, "name");  // name: string`],
    ['Generic types & defaults', 'typescript', `type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function parseJSON<T>(s: string): Result<T> {
  try { return { ok: true, value: JSON.parse(s) as T }; }
  catch (e) { return { ok: false, error: e as Error }; }
}

class Box<T> {
  constructor(private value: T) {}
  get(): T { return this.value; }
}
const b = new Box(123).get();   // b: number`]],
  edge: [`Without a <b>constraint</b>, you can’t assume anything about <code>T</code> — you can only pass it around, not read its members.`, `<code>&lt;T&gt;(x: T): T</code> vs <code>(x: any): any</code> look similar but behave oppositely: the generic preserves the type, <code>any</code> discards it.`, `Explicit type arguments can <i>over-constrain</i> or hide inference bugs; let inference work unless it genuinely can’t.`, `A type parameter used only once (not linking inputs to outputs) is usually unnecessary — it adds indirection without adding safety.`, `In <code>.tsx</code> files, a lone <code>&lt;T&gt;</code> arrow generic can be parsed as JSX; write <code>&lt;T,&gt;</code> or <code>&lt;T extends unknown&gt;</code> to disambiguate.`],
  faq: [['When do I actually need a generic?', PP(`When a function or type needs to <b>preserve a relationship between types</b> — the return depends on an argument, or two arguments must match. <code>first&lt;T&gt;(arr: T[]): T | undefined</code> needs <code>T</code> so the result type tracks the input. If you’re tempted to use <code>any</code> to "accept anything," a generic almost always expresses it better while keeping the result typed. If a type parameter appears in only one position and links nothing, you probably don’t need it.`)],
    ['What do constraints (<code>T extends …</code>) give me?', PP(`They let you <b>use</b> the constrained capabilities of <code>T</code> inside the generic and <b>restrict</b> what callers can pass. <code>&lt;T extends { length: number }&gt;</code> means you can read <code>.length</code> safely and only length-bearing types are accepted. <code>&lt;K extends keyof O&gt;</code> ties a key to an object so property access returns the precise value type (<code>O[K]</code>) rather than a widened one. Constraints are what turn "any T" into "any T that can do X".`)],
    ['Do I have to pass type arguments like <code>fn&lt;string&gt;(x)</code>?', PP(`Usually no — TypeScript <b>infers</b> type arguments from the values you pass, which is cleaner and less error-prone. You only supply them explicitly when inference has nothing to go on (e.g. <code>new Set&lt;string&gt;()</code>, or a function whose <code>T</code> doesn’t appear in its parameters). Over-specifying can even mask bugs by forcing a type the arguments don’t actually match, so prefer inference and annotate only when needed.`)]],
  qs: [SQ('Why prefer a generic <code>&lt;T&gt;(x: T) =&gt; T</code> over <code>(x: any) =&gt; any</code>?', ['It runs faster', 'The generic preserves the caller’s exact type; any discards all type information', 'any is deprecated', 'They are identical'], 1, 'Generics keep the input/output type relationship; any erases it.'),
    SQ('What does the constraint in <code>&lt;K extends keyof O&gt;</code> enable?', ['Nothing useful', 'Safe property access where the return type is O[K], the precise value type', 'It makes O optional', 'It disables inference'], 1, 'Tying K to keyof O lets obj[key] return the exact value type O[K].')]
});
DP('ts-generics', {
  fu: [['What is the difference between a generic and overloads?', 'A generic expresses one relationship that holds for all types; overloads list several concrete signatures. Generics are more general and composable; overloads suit a small fixed set of distinct argument shapes. Prefer generics when the logic is uniform across types.'],
    ['How does generic inference actually work?', 'TypeScript matches the types of the arguments against the parameter types to solve for each type parameter, sometimes using the "best common type" across several positions and contextual type from the expected return. When it can’t infer, it falls back to the constraint or the default, or errors.'],
    ['What are variance and why does it matter for generics?', 'Variance describes how Container<Sub> relates to Container<Super>. Arrays are (unsoundly) covariant; function parameters are contravariant. Most app code doesn’t reason about variance explicitly, but it explains some surprising assignability errors with generic containers and callbacks.']],
  deep: [['Technique', 'Introduce a type parameter only when it links two or more positions. Use constraints (extends, keyof) to both enable member access and restrict inputs, and lean on inference at call sites.'],
    ['Failure mode', 'Reaching for any to accept "anything", or adding type parameters that appear once and connect nothing — both add noise or lose safety. '],
    ['In real code', 'Generics power typed data structures, API/result wrappers (Result<T,E>), React hooks (useState<T>), and ORM query builders — anywhere a type must flow from input to output.']],
  src: ['TypeScript Handbook: Generics', 'https://www.typescriptlang.org/docs/handbook/2/generics.html'] });

TST('ts-advanced', { name: 'Advanced types: keyof, typeof, indexed access & conditional types', cat: 'tstypes',
  blurb: `The type-level operators that let you derive types from other types instead of hand-writing them: keyof to get a type's keys, typeof to lift a value into a type, indexed access to pull out a member's type, and conditional types (with infer) to branch and extract. These power the utility types and most library typings.`,
  facts: [['keyof T', 'union of T’s property names'], ['typeof v', 'the type of a value'], ['T[K]', 'indexed access — the type at key K'], ['A extends B ? X : Y', 'conditional type']],
  cheat: [['keyof T', 'Union of the keys of T (e.g. "id" | "name")'], ['typeof value', 'The type of a runtime value (type context)'], ['T[K]', 'Type of property K on T (indexed access)'], ['T[number]', 'Element type of an array/tuple T'], ['A extends B ? X : Y', 'Pick X or Y based on assignability'], ['infer R', 'Capture a type inside a conditional'], ['Distributive', 'Conditionals distribute over naked union type params'], ['ReturnType<F>', 'Built on conditional + infer'], ['as const + typeof + [number]', 'Derive a union from a runtime array'], ['Derive, don’t duplicate', 'Compute types from a single source']],
  sections: [
    ['keyof, typeof and indexed access', PP(`<code>keyof T</code> produces the <b>union of T’s property names</b>. <code>typeof value</code> (in a <i>type</i> position) lifts a runtime value into its type — great with <code>as const</code> to turn data into types. <b>Indexed access</b> <code>T[K]</code> reads the <i>type</i> of a property: <code>User["id"]</code> is the id’s type, and <code>T[number]</code> is the element type of an array or tuple. Together they let you <b>derive</b> types from existing ones instead of repeating yourself.`)],
    ['Conditional types and <code>infer</code>', PP(`A <b>conditional type</b> <code>A extends B ? X : Y</code> chooses a type based on whether <code>A</code> is assignable to <code>B</code>. Inside the <code>true</code> branch you can use <code>infer R</code> to <b>capture</b> a type from a position and reuse it — this is how <code>ReturnType</code>, <code>Awaited</code>, element-type extractors and countless library types work. Conditional types also <b>distribute</b> over unions when the checked type is a bare type parameter, applying the condition to each member.`)],
    ['Deriving instead of duplicating', PP(`The theme of advanced types is <b>single source of truth</b>: define data or one type, then compute related types from it. Derive a union of route strings from a <code>readonly</code> array, a props type from a component, or a payload type from a schema. Hand-maintaining parallel types drifts; derived types update automatically.`)]
  ],
  snipTitle: 'Type-level operators', snipNote: 'keyof/typeof/indexed access and conditional types with infer.',
  snips: [['keyof / typeof / indexed', 'typescript', `interface User { id: number; name: string; roles: string[]; }

type UserKeys = keyof User;        // "id" | "name" | "roles"
type Name = User["name"];          // string
type Role = User["roles"][number]; // string (element type)

// typeof lifts a value into a type:
const config = { env: "prod", retries: 3 } as const;
type Config = typeof config;       // { readonly env: "prod"; readonly retries: 3 }
type Env = typeof config["env"];   // "prod"`],
    ['Conditional + infer', 'typescript', `// Pick the resolved type out of a Promise:
type Unwrap<T> = T extends Promise<infer U> ? U : T;
type A = Unwrap<Promise<number>>;  // number
type B = Unwrap<string>;           // string

// Reimplement ReturnType:
type MyReturn<F> = F extends (...args: any[]) => infer R ? R : never;
type R = MyReturn<() => User>;     // User

// Element type of any array:
type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
type E = ElementOf<number[]>;      // number`],
    ['Derive a union from data', 'typescript', `const METHODS = ["GET", "POST", "PUT", "DELETE"] as const;
type Method = typeof METHODS[number];   // "GET" | "POST" | "PUT" | "DELETE"

// One source of truth: the runtime array AND the type stay in sync.
function request(method: Method, url: string) { /* ... */ }
METHODS.forEach((m) => request(m, "/api"));   // fully typed`]],
  edge: [`<code>keyof</code> on a type with an index signature includes <code>string</code>/<code>number</code>, not just literal keys.`, `<code>typeof</code> in a <i>type</i> position (type of a value) is different from the runtime <code>typeof</code> operator (returns a string); context decides which you get.`, `Conditional types <b>distribute</b> over unions only when the checked type is a <i>naked</i> type parameter; wrap it in a tuple (<code>[T] extends [U]</code>) to prevent distribution when you don’t want it.`, `Deeply nested conditional/recursive types can hit the compiler’s recursion limits and slow down editors.`, `<code>infer</code> only works inside the <code>extends</code> clause of a conditional type.`],
  faq: [['What’s the difference between <code>keyof</code> and <code>typeof</code>?', PP(`<code>typeof value</code> takes a <b>runtime value</b> and gives you its <b>type</b> (lifting data into the type world). <code>keyof T</code> takes a <b>type</b> and gives you the <b>union of its keys</b>. They’re often combined: <code>keyof typeof config</code> yields the key names of a config object you defined as a value. One goes value→type, the other type→keys.`)],
    ['What does <code>infer</code> do?', PP(`Inside a conditional type’s <code>extends</code> clause, <code>infer R</code> introduces a <b>new type variable that TypeScript solves for you</b> by matching the shape. For example <code>T extends Promise&lt;infer U&gt; ? U : T</code> says "if T is a Promise of something, capture that something as U and return it." It’s how you <b>extract</b> a piece of a type — return types, element types, parameter types — and it underpins many built-in utility types.`)],
    ['Why would I derive types instead of just writing them?', PP(`To keep a <b>single source of truth</b> so related types can’t drift apart. If you define your routes/methods/config as data (with <code>as const</code>) and derive the type via <code>typeof … [number]</code>, adding a value updates the type automatically — no parallel list to forget. The same principle derives a component’s props type, a function’s return type, or a schema’s inferred type. Derived types are self-maintaining; duplicated types rot.`)]],
  qs: [SQ('<code>keyof { id: number; name: string }</code> produces…', ['number | string', '"id" | "name"', 'never', 'the whole object type'], 1, 'keyof yields the union of property names as literal types.'),
    SQ('What does <code>infer</code> allow inside a conditional type?', ['Running code at runtime', 'Capturing/extracting a type from a matched position for reuse', 'Declaring a variable', 'Importing a module'], 1, 'infer binds a type variable to a position so you can extract and reuse it.')]
});
DP('ts-advanced', {
  fu: [['What are distributive conditional types?', 'When the checked type is a bare type parameter, a conditional applies to each member of a union separately, then unions the results. E.g. ToArray<string | number> becomes string[] | number[]. Wrap in tuples ([T] extends [U]) to turn distribution off.'],
    ['How is ReturnType implemented?', 'type ReturnType<T> = T extends (...a: any) => infer R ? R : any — a conditional type that matches a function signature and infers its return. Most utility types are small conditional/mapped types like this.'],
    ['Can type-level code be recursive?', 'Yes — recursive conditional and mapped types enable things like deep readonly, JSON types, and path types. They’re powerful but can be slow and hit depth limits, so use them judiciously and prefer libraries for heavy cases.']],
  deep: [['Technique', 'Treat types as a small functional language: keyof/indexed access to read, typeof + as const to lift data, conditional + infer to branch and extract. Derive related types from one source.'],
    ['Failure mode', 'Over-engineering types into unreadable recursive conditionals that slow the compiler and confuse teammates; reach for a well-typed library (e.g. zod-inferred types) before hand-rolling heavy type gymnastics.'],
    ['In real code', 'These operators are the backbone of framework and ORM typings, form/route typing, and the standard utility types; app code uses them lightly (typeof+keyof+indexed access) and relies on libraries for the heavy lifting.']],
  src: ['TypeScript Handbook: Conditional, Keyof, Indexed Access Types', 'https://www.typescriptlang.org/docs/handbook/2/conditional-types.html'] });

TST('ts-mapped', { name: 'Mapped & template literal types', cat: 'tstypes',
  blurb: `Mapped types transform every property of a type at once — making them optional, readonly, nullable, or renamed. Template literal types build string types by interpolation. Together they let you generate whole families of types mechanically, and they are exactly how the built-in utility types are implemented.`,
  facts: [['Mapped type', '{ [K in keyof T]: … }'], ['Modifiers', '+/- readonly, +/- ?'], ['Key remapping', 'as to rename keys'], ['Template literal', '`${A}-${B}` string types']],
  cheat: [['{ [K in keyof T]: T[K] }', 'Iterate every property of T'], ['[K in keyof T]?:', 'Make all optional (Partial)'], ['-?', 'Remove optionality (Required)'], ['readonly [K in keyof T]', 'Make all readonly'], ['-readonly', 'Strip readonly (Mutable)'], ['as `get${Capitalize<K>}`', 'Remap/rename keys'], ['`${A}${B}`', 'Concatenate string literal types'], ['Capitalize/Uppercase', 'Intrinsic string-manipulation types'], ['`on${Capitalize<E>}`', 'Derive event-handler prop names'], ['Combine with keyof', 'Map over derived key unions']],
  sections: [
    ['Mapped types', PP(`A <b>mapped type</b> iterates over a union of keys and produces a property for each: <code>{ [K in keyof T]: T[K] }</code> copies <code>T</code>; add <code>?</code> to make everything optional, <code>readonly</code> to freeze it, or the <b>subtractive</b> modifiers <code>-?</code> and <code>-readonly</code> to remove them. You can also transform the <i>value</i> type (e.g. wrap each in <code>Nullable</code>). This single mechanism implements <code>Partial</code>, <code>Required</code>, <code>Readonly</code> and more.`)],
    ['Key remapping with <code>as</code>', PP(`Within a mapped type you can <b>rename</b> keys using <code>as</code>: <code>{ [K in keyof T as NewName]: … }</code>. Combined with template literals this derives new key sets — turning each property <code>name</code> into a getter <code>getName</code>, or each event into an <code>on&lt;Event&gt;</code> handler prop. Returning <code>never</code> from the <code>as</code> clause <b>filters</b> keys out.`)],
    ['Template literal types', PP(`<b>Template literal types</b> build string <i>types</i> by interpolation: <code>\`\${Method} \${string}\`</code> types strings like <code>"GET /users"</code>. The intrinsic helpers <code>Uppercase</code>, <code>Lowercase</code>, <code>Capitalize</code> and <code>Uncapitalize</code> manipulate string literals at the type level. These enable typed event names, route patterns, CSS units, and API path types.`)]
  ],
  snipTitle: 'Mapped & template literal types', snipNote: 'Reimplementing utility types, remapping keys, and string types.',
  snips: [['Mapped types', 'typescript', `type User = { id: number; name: string };

type MyPartial<T>  = { [K in keyof T]?: T[K] };         // all optional
type MyRequired<T> = { [K in keyof T]-?: T[K] };        // all required
type MyReadonly<T> = { readonly [K in keyof T]: T[K] }; // all readonly
type Mutable<T>    = { -readonly [K in keyof T]: T[K] };// strip readonly
type Nullable<T>   = { [K in keyof T]: T[K] | null };   // transform values

type P = MyPartial<User>;   // { id?: number; name?: string }`],
    ['Key remapping', 'typescript', `// Turn each property into a getter method name:
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};
type UserGetters = Getters<User>;
// { getId: () => number; getName: () => string }

// Filter keys by returning never from "as":
type StringKeys<T> = { [K in keyof T as T[K] extends string ? K : never]: T[K] };
type S = StringKeys<User>;   // { name: string }`],
    ['Template literal types', 'typescript', `type Method = "GET" | "POST";
type Path = \`/\${string}\`;
type Endpoint = \`\${Method} \${Path}\`;    // "GET /..." | "POST /..."
const e: Endpoint = "GET /users";         // ✓
// const bad: Endpoint = "PATCH /x";      // ✗

type EventName<E extends string> = \`on\${Capitalize<E>}\`;
type Click = EventName<"click">;          // "onClick"`]],
  edge: [`Mapped types operate over a <b>key union</b> — pair with <code>keyof</code>, a literal union, or a remapped set; iterating the wrong key source yields surprising results.`, `Key remapping with <code>as</code> that returns <code>never</code> <b>removes</b> that key — handy for filtering, surprising if unintended.`, `Template literal types over large unions <b>explode combinatorially</b> (every combination becomes a member) and can slow the compiler.`, `<code>Capitalize&lt;K&gt;</code> needs a string key; use <code>string &amp; K</code> since <code>keyof</code> can include <code>number</code>/<code>symbol</code>.`, `Homomorphic mapped types (<code>[K in keyof T]</code>) preserve modifiers and array-ness; mapping over an arbitrary union does not.`],
  faq: [['What problem do mapped types solve?', PP(`They let you <b>transform all properties of a type at once</b> instead of hand-writing a variant. Need an all-optional version for a PATCH payload, an all-readonly version for immutable state, or a version where every value can be <code>null</code>? A mapped type generates it from the original, so the two stay in sync. The standard utility types (<code>Partial</code>, <code>Required</code>, <code>Readonly</code>, <code>Record</code>, <code>Pick</code>) are all just mapped types, which is why learning the mechanism demystifies them.`)],
    ['What are template literal types good for?', PP(`Typing <b>strings that follow a pattern</b>. You can constrain a value to <code>\`\${Method} /\${string}\`</code> (an HTTP method + path), derive event-handler prop names (<code>on\${Capitalize&lt;E&gt;}</code> → <code>onClick</code>), type CSS values, or build route/path types. They turn stringly-typed APIs into checked ones, catching typos like <code>"GET/users"</code> (missing space) at compile time.`)],
    ['How do I rename keys in a mapped type?', PP(`Use the <code>as</code> clause: <code>{ [K in keyof T as NewKey]: … }</code>, where <code>NewKey</code> is usually a template literal based on <code>K</code> (e.g. <code>\`get\${Capitalize&lt;string &amp; K&gt;}\`</code>). This lets you generate getter/setter names, prefix or suffix keys, or — by returning <code>never</code> for some keys — <b>filter</b> the object down to a subset. It’s the mapped-type feature that makes deriving new shapes from old ones truly flexible.`)]],
  qs: [SQ('Which utility type is a mapped type that makes every property optional?', ['Readonly', 'Partial', 'Record', 'ReturnType'], 1, 'Partial<T> = { [K in keyof T]?: T[K] } — a mapped type.'),
    SQ('What do template literal types let you express?', ['Runtime string formatting', 'String types that follow a pattern, e.g. `${Method} /${string}`', 'Regular expressions at runtime', 'Numeric ranges'], 1, 'They build precise string literal types by interpolation.')]
});
DP('ts-mapped', {
  fu: [['What is a homomorphic mapped type?', 'One of the form { [K in keyof T]: … } that maps over an existing type T. It preserves property modifiers (optional/readonly) and maps arrays/tuples element-wise. Mapping over an arbitrary key union (not keyof T) loses these preservation properties.'],
    ['How do the intrinsic string types work?', 'Uppercase, Lowercase, Capitalize and Uncapitalize are compiler intrinsics (not written in TS) that transform string literal types. They enable deriving casing-dependent names like event handlers and getters.'],
    ['Why can template literal types blow up compile time?', 'Every combination of the interpolated unions becomes a distinct member, so `${A}${B}` over large unions produces |A|×|B| members. Keep the interpolated unions small or constrain with string to avoid combinatorial explosion.']],
  deep: [['Technique', 'Use mapped types to derive request/response variants (Partial for PATCH, Readonly for state) from one domain type, and template literals to type event names, routes and keys — keeping strings checked.'],
    ['Failure mode', 'Combinatorial template-literal unions and deep recursive mapped types that tank editor performance; measure and simplify, or push complexity into a library.'],
    ['In real code', 'The entire utility-type library, form libraries’ field types, typed i18n keys, and route builders are built on mapped + template literal types.']],
  src: ['TypeScript Handbook: Mapped & Template Literal Types', 'https://www.typescriptlang.org/docs/handbook/2/mapped-types.html'] });

TST('ts-utility', { name: 'Built-in utility types', cat: 'tstypes',
  blurb: `TypeScript ships a toolbox of ready-made type transformations — Partial, Required, Readonly, Pick, Omit, Record, Exclude, Extract, NonNullable, ReturnType, Parameters, Awaited and more. Knowing them prevents reinventing mapped/conditional types by hand and makes intent obvious.`,
  facts: [['Object shape', 'Partial, Required, Readonly, Pick, Omit, Record'], ['Union ops', 'Exclude, Extract, NonNullable'], ['Function/async', 'ReturnType, Parameters, Awaited'], ['They are', 'just mapped/conditional types']],
  cheat: [['Partial<T>', 'All properties optional'], ['Required<T>', 'All properties required'], ['Readonly<T>', 'All properties readonly'], ['Pick<T, K>', 'Keep only keys K'], ['Omit<T, K>', 'Remove keys K'], ['Record<K, V>', 'Object with keys K and values V'], ['Exclude<U, X>', 'Remove members X from union U'], ['Extract<U, X>', 'Keep only members of U assignable to X'], ['NonNullable<T>', 'Remove null and undefined'], ['ReturnType<F> / Parameters<F> / Awaited<T>', 'Function return / params tuple / unwrapped promise']],
  sections: [
    ['Object-shape utilities', PP(`<code>Partial</code>, <code>Required</code> and <code>Readonly</code> toggle modifiers across all properties. <code>Pick&lt;T, K&gt;</code> keeps a subset of keys; <code>Omit&lt;T, K&gt;</code> drops a subset — ideal for deriving a "create" payload from an entity by omitting <code>id</code>/timestamps. <code>Record&lt;K, V&gt;</code> builds an object type with a known key set and uniform value type (a typed dictionary or lookup).`)],
    ['Union and function utilities', PP(`On unions: <code>Exclude&lt;U, X&gt;</code> removes members, <code>Extract&lt;U, X&gt;</code> keeps matching ones, and <code>NonNullable&lt;T&gt;</code> strips <code>null</code>/<code>undefined</code>. On functions/async: <code>ReturnType&lt;F&gt;</code> and <code>Parameters&lt;F&gt;</code> extract the return type and parameter tuple, and <code>Awaited&lt;T&gt;</code> unwraps a (possibly nested) Promise. These let you <b>derive</b> types from existing functions and values rather than restating them.`)],
    ['They’re just the primitives you learned', PP(`Every utility type is a small <b>mapped</b> or <b>conditional</b> type — <code>Partial</code> is <code>{ [K in keyof T]?: T[K] }</code>, <code>ReturnType</code> is a conditional with <code>infer</code>. Using them is clearer and less error-prone than re-deriving by hand, but understanding how they’re built (previous two pages) lets you compose and extend them confidently.`)]
  ],
  snipTitle: 'Utility types in action', snipNote: 'Deriving payloads, dictionaries, and types from functions.',
  snips: [['Object shapes', 'typescript', `interface User { id: number; name: string; email: string; createdAt: Date; }

// A create payload: no server-managed fields
type CreateUser = Omit<User, "id" | "createdAt">;     // { name; email }
// A patch payload: everything optional
type PatchUser = Partial<Omit<User, "id">>;
// A public view: a subset
type PublicUser = Pick<User, "id" | "name">;

// Typed dictionary:
type RoleName = "admin" | "editor" | "viewer";
type Permissions = Record<RoleName, string[]>;
const perms: Permissions = { admin: ["*"], editor: ["write"], viewer: ["read"] };`],
    ['Union utilities', 'typescript', `type Status = "idle" | "loading" | "success" | "error";
type Settled = Exclude<Status, "idle" | "loading">;   // "success" | "error"
type Loadingish = Extract<Status, "loading" | "idle">;// "idle" | "loading"

type MaybeName = string | null | undefined;
type Name = NonNullable<MaybeName>;                   // string`],
    ['Function & async utilities', 'typescript', `function createUser(name: string, email: string) {
  return { id: 1, name, email };
}
type NewUser = ReturnType<typeof createUser>;   // { id: number; name: string; email: string }
type Args = Parameters<typeof createUser>;      // [name: string, email: string]

async function load(): Promise<User[]> { return []; }
type Loaded = Awaited<ReturnType<typeof load>>; // User[]`]],
  edge: [`<code>Omit</code> is <i>key-based</i> and doesn’t validate that the omitted keys exist (it won’t error on a typo in the key name); <code>Pick</code> does require valid keys.`, `<code>Record&lt;string, V&gt;</code> implies <i>every</i> string key exists — under <code>noUncheckedIndexedAccess</code>, lookups are still <code>V | undefined</code> to reflect reality.`, `<code>ReturnType&lt;typeof fn&gt;</code> needs <code>typeof</code> — it operates on the function’s <i>type</i>, not the function value.`, `Deriving a <code>CreateUser</code> with <code>Omit</code> keeps it in sync with <code>User</code> automatically — but renaming a field in <code>User</code> silently changes derived types, so review derived payloads when refactoring.`, `<code>Partial</code> is shallow; for nested optionality you need a recursive <code>DeepPartial</code> (often from a library).`],
  faq: [['When should I use Pick vs Omit?', PP(`Use <b>Pick</b> when you want a <i>small subset</i> of a large type (list the few keys to keep), and <b>Omit</b> when you want <i>most</i> of a type minus a few fields (list the keys to drop). A classic use of <code>Omit</code> is deriving a create/insert payload from an entity by removing server-managed fields like <code>id</code> and <code>createdAt</code>, so the payload type updates automatically when the entity changes. Note <code>Omit</code> doesn’t error on a mistyped key, so double-check the names.`)],
    ['What is Record for?', PP(`<code>Record&lt;K, V&gt;</code> builds an <b>object type with a known set of keys <code>K</code> and a uniform value type <code>V</code></b> — a typed dictionary or lookup table. <code>Record&lt;RoleName, string[]&gt;</code> requires an entry for every role and ensures the values are string arrays, so forgetting a role is a compile error. For open-ended dictionaries use <code>Record&lt;string, V&gt;</code>, ideally with <code>noUncheckedIndexedAccess</code> so lookups are treated as possibly-undefined.`)],
    ['How do I get the return type (or params) of an existing function as a type?', PP(`Use <code>ReturnType&lt;typeof fn&gt;</code> and <code>Parameters&lt;typeof fn&gt;</code> — the <code>typeof</code> lifts the function value into its type, and the utility extracts the piece you want. For async functions, wrap with <code>Awaited&lt;…&gt;</code> to unwrap the Promise. This lets you keep a derived type (e.g. the shape a factory returns, or an action’s payload) <b>in sync with the implementation</b> instead of maintaining a separate declaration.`)]],
  qs: [SQ('Which utility type derives a "create payload" by removing id and createdAt from User?', ['Pick<User, "id" | "createdAt">', 'Omit<User, "id" | "createdAt">', 'Partial<User>', 'Record<User, never>'], 1, 'Omit removes the listed keys, keeping the rest in sync with User.'),
    SQ('How do you get the return type of an existing function <code>fn</code> as a type?', ['ReturnType<fn>', 'ReturnType<typeof fn>', 'typeof fn()', 'Parameters<fn>'], 1, 'ReturnType operates on the function type, obtained with typeof fn.')]
});
DP('ts-utility', {
  fu: [['How do I make a deep (recursive) Partial or Readonly?', 'Write a recursive mapped type (type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> }) or use a library (type-fest). The built-ins are intentionally shallow; nested transforms need recursion and care around arrays and special objects.'],
    ['Why does Omit not catch a typo in the removed key?', 'Omit is defined as Pick<T, Exclude<keyof T, K>>, and Exclude silently ignores keys that aren’t present, so a misspelled key just omits nothing. Some teams use a stricter StrictOmit (from type-fest) that constrains K to keyof T.'],
    ['What is type-fest?', 'A popular community library of extra utility types (DeepPartial, SetOptional, Merge, etc.) built from the same mapped/conditional primitives. It saves re-deriving common advanced transforms by hand.']],
  deep: [['Technique', 'Derive request/response/view types from one domain model with Pick/Omit/Partial, build typed dictionaries with Record, and extract function/async types with ReturnType/Parameters/Awaited — a single source of truth that refactors safely.'],
    ['Failure mode', 'Hand-rolling transforms the utilities already provide, or assuming Partial/Readonly are deep. Reach for the built-in first; use a library for deep/strict variants.'],
    ['In real code', 'Omit for insert payloads, Partial for update payloads, Pick for DTOs/public views, and Record for config maps are everyday patterns in typed APIs and ORMs.']],
  src: ['TypeScript Handbook: Utility Types', 'https://www.typescriptlang.org/docs/handbook/utility-types.html'] });
