/* ===== TypeScript B: type checking & tooling ===== */

/* ---------------- Level 3: type checking & safety ---------------- */

TST('ts-strict', { name: 'Strict mode & the safety flags', cat: 'tscheck',
  blurb: `"strict": true is the single most important setting in TypeScript — it switches on the family of flags that make the type checker actually catch bugs. This covers what strict turns on (especially strictNullChecks and noImplicitAny), the extra flags worth adding, and how to adopt strictness in an existing codebase.`,
  facts: [['strict', 'enables the whole strict family at once'], ['strictNullChecks', 'null/undefined are their own types'], ['noImplicitAny', 'un-inferable types must be annotated'], ['Add', 'noUncheckedIndexedAccess for real-world safety']],
  cheat: [['"strict": true', 'Turns on all strict-family flags'], ['strictNullChecks', 'Must handle null/undefined explicitly'], ['noImplicitAny', 'Error on implicit any (unannotated params)'], ['strictFunctionTypes', 'Stricter callback parameter checks'], ['strictPropertyInitialization', 'Class fields must be initialized'], ['noUncheckedIndexedAccess', 'arr[i] / obj[k] is T | undefined'], ['noImplicitReturns', 'All code paths must return'], ['exactOptionalPropertyTypes', 'a?: T ≠ a: T | undefined'], ['noImplicitOverride', 'override keyword required'], ['Migration', 'turn flags on one at a time']],
  sections: [
    ['What <code>strict</code> turns on', PP(`<code>"strict": true</code> is an umbrella that enables <code>strictNullChecks</code>, <code>noImplicitAny</code>, <code>strictFunctionTypes</code>, <code>strictBindCallApply</code>, <code>strictPropertyInitialization</code>, <code>noImplicitThis</code>, <code>useUnknownInCatchVariables</code> and <code>alwaysStrict</code>. The two that change daily life most are <b>strictNullChecks</b> (you can no longer treat a possibly-<code>null</code> value as present) and <b>noImplicitAny</b> (TS stops silently falling back to <code>any</code> for things it can’t infer, like un-annotated parameters).`)],
    ['strictNullChecks: the billion-dollar flag', PP(`Without it, <code>null</code> and <code>undefined</code> are assignable to <i>every</i> type, so <code>user.name.toUpperCase()</code> compiles even when <code>user</code> can be null — and crashes at runtime. <b>With it</b>, nullable values have types like <code>User | null</code>, and TypeScript forces you to <b>narrow</b> (check for null) before use. This eliminates the most common runtime error in JavaScript. Always keep it on.`)],
    ['Flags worth adding beyond strict', PP(`<code>strict</code> is the baseline; two more pay off hugely. <b><code>noUncheckedIndexedAccess</code></b> makes <code>arr[i]</code> and <code>record[key]</code> return <code>T | undefined</code>, reflecting the reality that an index might miss — catching a huge class of "undefined is not a function" bugs. <b><code>exactOptionalPropertyTypes</code></b> distinguishes "property absent" from "property set to undefined." For migrations, enable flags <b>incrementally</b> and fix the errors flag-by-flag rather than all at once.`)]
  ],
  snipTitle: 'Strictness in action', snipNote: 'The same code, with flags off vs on.',
  snips: [['strictNullChecks', 'typescript', `// Without strictNullChecks: compiles, crashes at runtime
function greet(user: { name: string } | null) {
  return user.name.toUpperCase();   // 💥 if user is null
}

// With strictNullChecks: compile error forces a check
function greet2(user: { name: string } | null) {
  if (!user) return "Hi, guest";     // narrow away null
  return user.name.toUpperCase();    // ✓ safe
}`],
    ['noImplicitAny & indexed access', 'typescript', `// noImplicitAny: this errors (parameter has implicit any)
// function double(x) { return x * 2; }     ✗
function double(x: number) { return x * 2; } // ✓ annotate it

// noUncheckedIndexedAccess: indexing is possibly-undefined
const names = ["Ada", "Alan"];
const first = names[0];        // type: string | undefined
first.toUpperCase();           // ✗ error — might be undefined
if (first) first.toUpperCase();// ✓`],
    ['tsconfig', 'json', `{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}`]],
  edge: [`Turning on <code>strict</code> in an existing codebase can produce hundreds of errors at once — enable the individual flags <b>one at a time</b> and fix incrementally, or use <code>// @ts-expect-error</code> sparingly during migration.`, `<code>noUncheckedIndexedAccess</code> is <i>not</i> part of <code>strict</code> — you must add it explicitly, and it will flag a lot of real (and some pedantic) cases.`, `Under <code>useUnknownInCatchVariables</code> (part of strict), <code>catch (e)</code> gives <code>e: unknown</code> — you must narrow before using it.`, `<code>strictPropertyInitialization</code> requires class fields to be assigned in the constructor or marked with <code>!</code> (definite assignment) — don’t reach for <code>!</code> reflexively.`, `Disabling <code>strict</code> to silence errors defeats the purpose; prefer fixing the types or isolating the <code>any</code>.`],
  faq: [['Should I always enable <code>strict</code>?', PP(`Yes — for any new project, turn on <code>"strict": true</code> from day one. It’s where the bug-catching value of TypeScript actually lives; without it you get autocomplete but miss the null-safety and implicit-any protections that prevent most real crashes. For <b>existing</b> JavaScript/loose-TS codebases, adopt it gradually: enable one strict-family flag at a time (start with <code>noImplicitAny</code>, then <code>strictNullChecks</code>), fix the errors each surfaces, and commit between steps so the diff stays reviewable.`)],
    ['What does <code>strictNullChecks</code> change, concretely?', PP(`It makes <code>null</code> and <code>undefined</code> <b>distinct types</b> instead of being silently assignable to everything. A value that can be absent gets a type like <code>string | null</code>, and TypeScript refuses to let you use it as a <code>string</code> until you’ve <b>checked</b>. The payoff is that "cannot read property of undefined/null" — the most common JavaScript runtime error — becomes a <i>compile</i> error you fix before shipping. It’s widely considered the most valuable single flag.`)],
    ['Why would I enable <code>noUncheckedIndexedAccess</code> if it’s not in <code>strict</code>?', PP(`Because array and object indexing can miss, and the default type doesn’t reflect that: <code>arr[10]</code> is typed as the element type even when the array has 3 items. This flag makes such accesses <code>T | undefined</code>, forcing a check and catching real "undefined at index" bugs. It’s left out of <code>strict</code> because it can be noisy in index-heavy code, but for most applications the safety is worth the extra checks. Enable it and handle the <code>undefined</code> cases honestly.`)]],
  qs: [SQ('Which flag makes "cannot read property of null/undefined" a compile-time error?', ['noImplicitAny', 'strictNullChecks', 'strictFunctionTypes', 'noImplicitReturns'], 1, 'strictNullChecks makes null/undefined distinct types you must narrow.'),
    SQ('How should you adopt strict mode in a large existing codebase?', ['Turn on strict everywhere and fix all errors in one commit', 'Enable individual strict flags one at a time and fix incrementally', 'Never use strict mode', 'Set every value to any'], 1, 'Incremental flag-by-flag adoption keeps the migration reviewable.')]
});
DP('ts-strict', {
  fu: [['What is the difference between strict and "all" strictness?', 'strict enables a curated family of flags. Beyond it, flags like noUncheckedIndexedAccess, exactOptionalPropertyTypes, noPropertyAccessFromIndexSignature and noImplicitOverride add further safety but aren’t in strict because they can be noisy. Teams opt into these deliberately.'],
    ['How do I silence a single stubborn error during migration?', 'Use // @ts-expect-error on the line (preferred over @ts-ignore because it errors if the problem is later fixed, so it self-cleans). Keep a count and drive it to zero; don’t let suppressions accumulate.'],
    ['What does useUnknownInCatchVariables do?', 'It types the catch binding as unknown instead of any, so you must narrow the error before using it (e instanceof Error). It reflects that thrown values can be anything, and prevents unsafe assumptions about error shapes.']],
  deep: [['Technique', 'Start every project at strict: true plus noUncheckedIndexedAccess; treat a clean tsc --noEmit as a CI gate. Model nullability explicitly rather than reaching for the non-null ! operator.'],
    ['Failure mode', 'Loosening flags to make errors disappear, or sprinkling ! and any — this converts compile-time safety back into runtime risk. Fix the real type instead.'],
    ['In real code', 'Mature TypeScript codebases run strict plus several extra flags and forbid implicit any via lint; migrations from JS flip flags one at a time over weeks.']],
  src: ['TypeScript Handbook: tsconfig strictness', 'https://www.typescriptlang.org/tsconfig/#strict'] });

TST('ts-narrowing', { name: 'Type guards, user-defined guards & assertion functions', cat: 'tscheck',
  blurb: `Beyond the built-in typeof/instanceof/in checks, TypeScript lets you write your own narrowing logic: type predicate functions (x is Foo) and assertion functions (asserts x is Foo). These are how you teach the checker about validation you perform yourself — essential for safely consuming external data.`,
  facts: [['Type predicate', 'function isFoo(x): x is Foo'], ['Assertion fn', 'function assert(x): asserts x is Foo'], ['Built-ins', 'typeof, instanceof, in, truthiness'], ['Purpose', 'teach TS about your own checks']],
  cheat: [['x is Foo', 'Type predicate: return type that narrows'], ['asserts x is Foo', 'Assertion function: throws if not Foo'], ['asserts x', 'Assert a condition is truthy'], ['Array.isArray', 'Built-in narrowing guard'], ['typeof / instanceof / in', 'Built-in guards'], ['Discriminant check', 'Narrow a tagged union'], ['Guard composition', 'Build complex guards from simple ones'], ['Return boolean', 'Predicate body must actually verify the claim'], ['Trust', 'A wrong guard silently corrupts types'], ['Use at boundaries', 'Validate external data, then narrow']],
  sections: [
    ['User-defined type guards (<code>x is T</code>)', PP(`A function whose return type is a <b>type predicate</b> <code>arg is T</code> tells the checker: "if this returns true, treat <code>arg</code> as <code>T</code> from here on." Inside, you perform the actual runtime checks and return a boolean; TypeScript takes your word for it. This lets you encapsulate validation (e.g. <code>isUser(x)</code>) and get narrowing at every call site — crucial for turning <code>unknown</code> parsed data into typed values.`)],
    ['Assertion functions (<code>asserts x is T</code>)', PP(`An <b>assertion function</b> narrows by <b>throwing</b> instead of returning a boolean. <code>function assertIsString(x): asserts x is string</code> throws if <code>x</code> isn’t a string; after calling it, TypeScript treats <code>x</code> as <code>string</code> for the rest of the scope. The variant <code>asserts condition</code> (no type) narrows based on a boolean condition. These mirror Node’s <code>assert</code> and are great for preconditions and invariants.`)],
    ['Guards are a promise you must keep', PP(`Both forms are <b>trusted, not verified</b> — TypeScript assumes your predicate body actually checks what it claims. If <code>isUser</code> returns true without really validating, you’ve lied to the type system and corrupted every downstream type silently. So keep guard bodies simple, exhaustive, and ideally generated from a schema (see the runtime-validation page), rather than hand-written checks that can drift from the type.`)]
  ],
  snipTitle: 'Custom narrowing', snipNote: 'Type predicates and assertion functions.',
  snips: [['Type predicates', 'typescript', `interface Cat { meow(): void; }
interface Dog { bark(): void; }

// Type predicate: the "x is Cat" return type does the narrowing
function isCat(animal: Cat | Dog): animal is Cat {
  return "meow" in animal;
}

function speak(animal: Cat | Dog) {
  if (isCat(animal)) animal.meow();  // narrowed to Cat
  else animal.bark();                 // narrowed to Dog
}

// Guarding unknown external data:
function isUser(x: unknown): x is { id: number; name: string } {
  return typeof x === "object" && x !== null
    && typeof (x as any).id === "number"
    && typeof (x as any).name === "string";
}`],
    ['Assertion functions', 'typescript', `function assertIsDefined<T>(v: T | null | undefined, msg?: string): asserts v is T {
  if (v === null || v === undefined) throw new Error(msg ?? "Expected a value");
}

function render(el: HTMLElement | null) {
  assertIsDefined(el, "element missing");
  el.classList.add("ready");   // ✓ el narrowed to HTMLElement
}

// asserts condition (boolean) form:
function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}`]],
  edge: [`A type predicate body is <b>not checked</b> for correctness — returning true without real validation makes the type a lie. Keep guards honest and minimal.`, `Assertion functions must have an <b>explicit return type annotation</b> (<code>: asserts x is T</code>) — TypeScript won’t infer the assertion.`, `An assertion function that doesn’t actually throw on failure (falls through) will wrongly narrow and cause runtime bugs.`, `Guards over <code>unknown</code> need careful property access (cast to <code>any</code> or use <code>in</code>) because you can’t read members of <code>unknown</code> directly.`, `Prefer schema-based validators (next page) for complex shapes — hand-written deep guards are easy to get subtly wrong.`],
  faq: [['When do I need a user-defined type guard instead of a plain <code>typeof</code> check?', PP(`When the condition is more complex than a single built-in check — verifying an object has a particular shape, distinguishing two interfaces, or validating parsed <code>unknown</code> data. A type predicate (<code>x is T</code>) <b>packages that logic into a reusable function</b> that narrows at every call site, so you write the validation once and get type-safe narrowing everywhere. Built-in guards (<code>typeof</code>, <code>instanceof</code>, <code>in</code>, <code>Array.isArray</code>) handle the simple cases; predicates handle your domain-specific ones.`)],
    ['What’s the difference between a type predicate and an assertion function?', PP(`A <b>type predicate</b> returns a <code>boolean</code> and you branch on it (<code>if (isUser(x)) { … }</code>) — narrowing happens inside the <code>true</code> branch. An <b>assertion function</b> returns <code>void</code> but <b>throws</b> when the check fails (<code>assertIsUser(x)</code>) — after the call, the value is narrowed for the <i>rest of the scope</i> with no branch needed. Use a predicate when you want to handle both cases; use an assertion when failure should abort (preconditions, invariants, "this must be defined by now").`)],
    ['Isn’t it dangerous that TypeScript trusts my guard?', PP(`Yes — that’s the key caveat. Both predicates and assertion functions are <b>trusted, not verified</b>: TypeScript assumes your body genuinely checks what the signature claims. A buggy guard silently mis-types everything downstream, which can be worse than no guard. Mitigate this by keeping guard bodies small and obvious, unit-testing them, and — for anything non-trivial — <b>deriving the guard from a schema</b> (e.g. a Zod/validator library whose parse both checks and infers the type), so the runtime check and the type can’t drift apart.`)]],
  qs: [SQ('What does a return type of <code>x is Foo</code> do?', ['Casts x to Foo unconditionally', 'Makes the function a type guard: a true result narrows x to Foo at the call site', 'Throws if x is not Foo', 'Nothing at runtime or compile time'], 1, 'A type predicate narrows the argument in the branch where it returns true.'),
    SQ('An assertion function (<code>asserts x is T</code>) narrows by…', ['Returning a boolean', 'Throwing when the check fails, narrowing for the rest of the scope', 'Casting with as', 'Logging a warning'], 1, 'Assertion functions throw on failure and then narrow the value onward.')]
});
DP('ts-narrowing', {
  fu: [['How do I compose guards for nested objects?', 'Write small guards (isString, isUser) and call them inside larger ones, or better, use a schema validator that composes automatically. Hand-composing deep guards is error-prone; libraries handle recursion, arrays and optionals correctly.'],
    ['Can I make a generic assertIsDefined?', 'Yes — asserts v is T with a T | null | undefined parameter is a common, reusable helper that removes null/undefined and is clearer than the non-null ! operator because it fails loudly at runtime if the invariant is violated.'],
    ['Why not just use "as" to cast external data?', 'Because as is an unchecked assertion — it tells the compiler to trust you with no runtime verification, so malformed data flows in typed as valid. A guard or validator performs a real check, making the narrowing safe.']],
  deep: [['Technique', 'Encapsulate domain validation in type predicates (for branching) or assertion functions (for preconditions), and prefer schema-derived guards over hand-written ones for anything beyond trivial shapes.'],
    ['Failure mode', 'A guard whose body doesn’t fully verify the claimed type — TypeScript trusts it, so the lie propagates. Test guards and keep them minimal.'],
    ['In real code', 'assertIsDefined-style helpers replace scattered ! operators; type predicates wrap isAxiosError-type checks; serious boundary validation uses Zod/io-ts whose parsers double as guards.']],
  src: ['TypeScript Handbook: Type Predicates & Assertion Functions', 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates'] });

TST('ts-assertions', { name: 'Type assertions, satisfies, non-null & const assertions', cat: 'tscheck',
  blurb: `TypeScript gives you several ways to override or refine what it infers: the as assertion, the non-null ! operator, as const, and the satisfies operator. Each has a right use and a dangerous misuse. Knowing when each is safe — and that satisfies is usually what you actually want — prevents a lot of silent bugs.`,
  facts: [['x as T', 'unchecked assertion — trust me'], ['x!', 'assert not null/undefined (unchecked)'], ['as const', 'literal, deeply readonly'], ['satisfies', 'check against a type WITHOUT widening']],
  cheat: [['value as T', 'Reinterpret type (no runtime check)'], ['value as unknown as T', 'Force an otherwise-illegal cast (red flag)'], ['value!', 'Non-null assertion (unchecked)'], ['value as const', 'Narrow to literals, deeply readonly'], ['expr satisfies T', 'Verify expr fits T, keep its precise type'], ['Angle-bracket <T>value', 'Old assertion syntax (not in .tsx)'], ['Assertion ≠ conversion', 'as changes types, not runtime values'], ['Prefer satisfies', 'Over "as T" for config/objects'], ['Prefer guards', 'Over "as" for external data'], ['! is a smell', 'Usually hides a real nullability case']],
  sections: [
    ['Assertions are unchecked — use sparingly', PP(`<code>value as T</code> tells the compiler to <b>treat</b> a value as <code>T</code> with <b>no runtime check</b>. It does not convert anything — it only changes the static type. This is occasionally necessary (you know more than the checker, e.g. a DOM element’s concrete subtype) but is a frequent source of bugs when used to silence errors on data that <i>isn’t</i> actually <code>T</code>. The non-null operator <code>value!</code> is the same idea for <code>null</code>/<code>undefined</code>: unchecked, and usually a sign you should narrow instead.`)],
    ['<code>satisfies</code>: validate without widening', PP(`Often you want to <b>check that an object conforms to a type</b> while <b>keeping its precise inferred type</b>. An annotation (<code>const c: Config = …</code>) widens the value to the annotation’s type, losing literal information; an assertion (<code>as Config</code>) doesn’t validate. <b><code>satisfies</code></b> does both right: <code>const c = { … } satisfies Config</code> errors if the object doesn’t fit <code>Config</code>, but <code>c</code> keeps its narrow type (exact keys, literal values) so you still get precise autocomplete and indexing.`)],
    ['<code>as const</code> for literals', PP(`<code>as const</code> freezes a literal into its <b>narrowest, deeply readonly</b> form — strings become literal types, arrays become readonly tuples. It’s the tool for config, discriminated-union tags, and deriving unions from data (<code>typeof ARR[number]</code>). Unlike <code>as T</code>, it doesn’t reinterpret to an unrelated type; it only narrows, so it’s safe.`)]
  ],
  snipTitle: 'Assertions vs satisfies', snipNote: 'Why satisfies usually wins for objects.',
  snips: [['as & non-null', 'typescript', `// "as" — unchecked reinterpretation (use when you truly know better):
const el = document.getElementById("app") as HTMLCanvasElement;

// Non-null assertion — unchecked; prefer a real check:
function len(s?: string) {
  return s!.length;        // 💥 if s is undefined — risky
}
function lenSafe(s?: string) {
  return s ? s.length : 0; // ✓ narrowed, no assertion
}

// Double assertion is a loud red flag:
const n = ("5" as unknown) as number;  // lying to the compiler`],
    ['satisfies vs annotation vs as', 'typescript', `type Config = Record<string, string | number>;

// Annotation: widens — loses that "port" is specifically a number
const a: Config = { host: "localhost", port: 8080 };
// a.port is string | number (widened)

// satisfies: validates AND keeps precise types
const b = { host: "localhost", port: 8080 } satisfies Config;
b.port.toFixed(0);   // ✓ b.port is number (precise!)
b.host.toUpperCase();// ✓ b.host is string
// { bad: true } satisfies Config  → ✗ boolean not allowed`],
    ['as const', 'typescript', `const palette = { primary: "#2F74C0", radius: 8 } as const;
// primary: "#2F74C0" (literal), radius: 8, both readonly

const DAYS = ["mon", "tue", "wed"] as const;
type Day = typeof DAYS[number];   // "mon" | "tue" | "wed"`]],
  edge: [`<code>as</code> performs <b>no runtime conversion or check</b> — asserting <code>"5" as unknown as number</code> doesn’t make it a number; it just lies to the type system.`, `The non-null <code>!</code> operator removes <code>null</code>/<code>undefined</code> from the type but does nothing at runtime — if the value <i>is</i> null, you crash later with a worse stack trace.`, `<code>satisfies</code> checks conformance but does <b>not</b> change the variable’s type to the target — that’s the point (you keep the precise type), but it surprises people expecting annotation-like widening.`, `Angle-bracket assertions <code>&lt;T&gt;value</code> don’t work in <code>.tsx</code> (they clash with JSX) — use <code>as</code>.`, `Reaching for <code>as</code> to fix an error usually means the real type is wrong; fix the source or use a guard instead.`],
  faq: [['What’s the difference between <code>as Config</code> and <code>satisfies Config</code>?', PP(`<code>as Config</code> is an <b>unchecked assertion</b>: it forces the type to <code>Config</code> whether or not the value fits, and widens it to <code>Config</code> (losing precise literal/key info). <code>satisfies Config</code> is a <b>checked constraint</b>: TypeScript verifies the value is assignable to <code>Config</code> (erroring if not) but leaves the variable’s type as its precise inferred shape. So for a config object you want <code>satisfies</code> — you get the validation of an annotation <i>and</i> the precise types of a bare literal. Reach for <code>as</code> only when you genuinely know a type the checker can’t infer.`)],
    ['Is the non-null assertion (<code>!</code>) ever okay?', PP(`Occasionally — when you have a true invariant the checker can’t see (e.g. you just pushed to an array and read it back, or a field is guaranteed initialized by a framework). But it’s <b>unchecked</b>: if you’re wrong, you get a runtime crash with a confusing stack trace. Most <code>!</code> usages are better replaced by an actual narrowing check, an <code>assertIsDefined</code> assertion function (which fails loudly), or fixing the type so the value isn’t nullable. Treat each <code>!</code> as a claim you must be certain of.`)],
    ['When should I use <code>as const</code>?', PP(`Whenever you want a literal’s <b>narrowest, immutable</b> type: configuration objects, the tag values in discriminated unions, and arrays you’ll derive a union type from (<code>typeof ARR[number]</code>). It’s safe because it only <i>narrows</i> and makes things <code>readonly</code> — it never reinterprets a value as an unrelated type the way <code>as T</code> can. It’s the idiomatic way to turn runtime data into precise types and keep a single source of truth.`)]],
  qs: [SQ('Which operator checks that an object fits a type but keeps its precise inferred type?', ['as', '!', 'satisfies', 'keyof'], 2, 'satisfies validates conformance without widening the value’s type.'),
    SQ('What does <code>value as T</code> do at runtime?', ['Converts value to T', 'Nothing — it only changes the static type (unchecked)', 'Throws if value is not T', 'Deep-clones value'], 1, 'Assertions are compile-time only; no conversion or check happens at runtime.')]
});
DP('ts-assertions', {
  fu: [['Why did satisfies get added if we had as and annotations?', 'Because neither did the common job well: annotations validate but widen (losing literals), and as doesn’t validate. satisfies fills the gap — validate against a type while preserving the precise inferred type — which is exactly what you want for config, route tables, and typed constants.'],
    ['Is there any runtime difference between as and a validator?', 'Huge: as is compile-time only (no check), a validator (Zod/guard) performs a real runtime check. For trusted internal values a narrowing or satisfies is fine; for external data you need a validator, never as.'],
    ['What is a definite assignment assertion (foo!: T on a field)?', 'It tells TypeScript a class field will be assigned before use even though the constructor doesn’t initialize it (e.g. set by a framework or an init method). Like !, it is unchecked — use only with a real guarantee.']],
  deep: [['Technique', 'Default to satisfies for objects/config, as const for literal constants, guards/validators for external data, and reserve as / ! for cases where you provably know more than the checker.'],
    ['Failure mode', 'Using as or ! to silence errors on values that don’t actually match — this re-introduces exactly the runtime crashes TypeScript exists to prevent.'],
    ['In real code', 'satisfies is now the idiomatic way to type config and route maps; as const underpins discriminated-union tags and derived unions; ! is increasingly discouraged by lint rules in favor of explicit checks.']],
  src: ['TypeScript Handbook: satisfies & Assertions', 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator'] });

TST('ts-runtime', { name: 'Runtime validation: parse, don’t validate', cat: 'tscheck',
  blurb: `Types are erased at runtime, so data crossing a trust boundary — API responses, request bodies, env vars, localStorage, JSON files — can violate your types no matter how strict your compiler settings are. The fix is runtime validation with a schema library (like Zod) that both checks the data and gives you a correctly inferred type. This is where frontend and backend safety actually meet.`,
  facts: [['Problem', 'types are erased; external data is unknown at runtime'], ['Boundaries', 'API, forms, env, storage, files, IPC'], ['Solution', 'schema validation → inferred type'], ['Principle', '"parse, don’t validate"']],
  cheat: [['Trust boundary', 'Where untyped data enters your program'], ['Zod / Valibot / io-ts', 'Schema validation libraries'], ['z.object({...})', 'Define a schema'], ['schema.parse(x)', 'Validate; throw on failure'], ['schema.safeParse(x)', 'Validate; return success/error object'], ['z.infer<typeof schema>', 'Derive the TS type from the schema'], ['Single source of truth', 'Schema defines both runtime check and type'], ['Parse at the edge', 'Validate once on entry, trust internally'], ['Never trust as', 'as on fetch data is a lie; parse it'], ['Env validation', 'Validate process.env at startup']],
  sections: [
    ['Why strict mode isn’t enough', PP(`<code>const user = await res.json() as User</code> compiles cleanly under the strictest settings — and is still a lie. <code>json()</code> returns <code>any</code>/<code>unknown</code>; the <code>as User</code> is an <b>unchecked assertion</b>, so if the API returns a different shape (a renamed field, a null where you expected a string), TypeScript never knows and you crash deep inside your code with a misleading stack trace. Types describe <i>intent</i>; they do not inspect runtime values.`)],
    ['Parse, don’t validate', PP(`The principle (from a well-known essay): instead of checking data and then <i>continuing to treat it as untyped</i>, <b>parse</b> it once at the boundary into a <b>typed value</b>, and let the type system carry that guarantee inward. A schema library like <b>Zod</b> does exactly this: you define a schema, call <code>schema.parse(input)</code>, and get back either a value <b>typed and guaranteed</b> to match, or an error. Everything downstream can then trust the type because it was actually verified.`)],
    ['One schema, both worlds', PP(`The big win: the schema is a <b>single source of truth</b> for the runtime check <i>and</i> the static type. <code>z.infer&lt;typeof UserSchema&gt;</code> derives the TypeScript type from the schema, so they can never drift apart. This pattern works identically on the <b>frontend</b> (validating API responses, form input) and the <b>backend</b> (validating request bodies, query params, env vars), which is why it’s the connective tissue of a full-stack TypeScript app.`)]
  ],
  snipTitle: 'Validating at the boundary', snipNote: 'Zod schema → runtime check → inferred type, on both ends.',
  snips: [['The unsafe way vs safe way', 'typescript', `// ✗ Unsafe: compiles, but no runtime guarantee
const user = await res.json() as User;   // a lie if the API changes

// ✓ Safe: validate, then the type is earned
import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "user"]),
});
type User = z.infer<typeof UserSchema>;   // type derived from schema

const data: unknown = await res.json();
const user2 = UserSchema.parse(data);     // throws if shape is wrong
// user2 is now guaranteed to be a valid User`],
    ['safeParse & errors', 'typescript', `const result = UserSchema.safeParse(await res.json());
if (!result.success) {
  console.error(result.error.issues);     // structured validation errors
} else {
  const user = result.data;               // typed User
}`],
    ['Backend: request body & env', 'typescript', `// Express route: validate the body before using it
app.post("/users", (req, res) => {
  const parsed = UserSchema.omit({ id: true }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const input = parsed.data;              // typed & validated
  // ...create user
});

// Validate environment variables at startup (fail fast):
const Env = z.object({ PORT: z.coerce.number(), DATABASE_URL: z.string().url() });
export const env = Env.parse(process.env);`]],
  edge: [`Casting external data with <code>as</code> gives <b>zero</b> runtime protection — it’s the single most common way "fully typed" apps still crash on bad data.`, `Validate at the <b>boundary only</b>; don’t re-validate everywhere internally — once parsed, trust the type (that’s the point of "parse, don’t validate").`, `Keep the schema as the source of truth and derive the type with <code>z.infer</code>; defining both by hand lets them drift.`, `Validation has a runtime cost — for very hot paths validate at the edge and pass typed values inward rather than per-call.`, `Don’t forget non-HTTP boundaries: <code>localStorage</code>/<code>sessionStorage</code>, <code>JSON.parse</code> of files, env vars, message queues, and IPC are all untyped at runtime.`],
  faq: [['If I use strict mode and type everything, why do I still need runtime validation?', PP(`Because <b>types are erased before the code runs</b>. The compiler checks your <i>source</i>, but at runtime your program receives real bytes from the network, forms, storage and env — and nothing stops those from violating the types you declared. A <code>fetch().json() as User</code> is just a promise you made to the compiler, not a fact about the data. Runtime validation at trust boundaries is the <b>only</b> way to make the declared types actually true for external data; strictness handles your code, validation handles the world.`)],
    ['What does "parse, don’t validate" mean in practice?', PP(`It means: don’t write a boolean <code>isValid(data)</code> check and then keep passing the still-untyped <code>data</code> around. Instead, <b>parse</b> the input once into a <b>typed value</b> at the boundary — <code>const user = UserSchema.parse(input)</code> — so the <i>type</i> of the result encodes the guarantee. Downstream code receives a <code>User</code> that is known-good, with no need to re-check. You concentrate all the uncertainty at the edge and enjoy full type safety everywhere inside.`)],
    ['Why use Zod instead of hand-writing type guards?', PP(`Three reasons. First, <b>single source of truth</b>: <code>z.infer</code> derives the TypeScript type from the schema, so the runtime check and the static type can’t drift apart (hand-written guards and types drift constantly). Second, <b>correctness</b>: schema libraries handle nested objects, arrays, optionals, unions, coercion and good error messages that are easy to get wrong by hand. Third, <b>composability</b>: you can derive request/response variants (<code>.omit</code>, <code>.partial</code>, <code>.extend</code>) from one schema. For trivial cases a guard is fine; for real API/body/env validation, a schema library is the standard, safer choice.`)]],
  qs: [SQ('Why can a fully strict, fully typed app still crash on an API response?', ['Strict mode has bugs', 'Types are erased at runtime, so "as User" on fetched data is an unchecked promise, not a verified fact', 'Because of noImplicitAny', 'It cannot — strict mode guarantees runtime safety'], 1, 'Types don’t exist at runtime; external data must be validated to be trusted.'),
    SQ('What is the key advantage of deriving your type from a schema with <code>z.infer</code>?', ['It runs faster', 'The runtime check and the static type stay in sync as a single source of truth', 'It removes the need for strict mode', 'It avoids importing Zod'], 1, 'One schema defines both the runtime validation and the TS type, preventing drift.')]
});
DP('ts-runtime', {
  fu: [['Zod vs Valibot vs io-ts vs Yup — which should I pick?', 'Zod is the most popular and ergonomic with excellent inference. Valibot is similar but tree-shakeable (smaller bundles) for the frontend. io-ts is more FP-oriented. Yup predates good inference and is weaker on types. For most TS apps, Zod (or Valibot where bundle size matters) is the default.'],
    ['Can I generate validators from my OpenAPI/DB schema?', 'Yes — tools generate Zod schemas from OpenAPI specs, and ORMs like Prisma/Drizzle can emit types or Zod schemas, so your DB, API and client share one definition. This extends single-source-of-truth across the stack.'],
    ['Does validation hurt performance?', 'There is a per-parse cost, but it’s at boundaries (once per request/response), not hot inner loops. For extreme throughput, validate at the edge and pass typed values inward; compiled validators (typia, Valibot) reduce overhead.']],
  deep: [['Technique', 'Define one schema per boundary type, derive the TS type with z.infer, parse (or safeParse) all inbound data at the edge, and trust the types internally. Validate env at startup and fail fast.'],
    ['Failure mode', 'as on fetched/parsed data — the classic "typed but unsafe" bug. Also forgetting non-HTTP boundaries (storage, files, queues).'],
    ['In real code', 'tRPC, modern form libraries (React Hook Form + Zod resolver), and backend frameworks all center on schema validation; sharing one schema between client and server is a hallmark of well-built full-stack TS.']],
  src: ['Zod documentation', 'https://zod.dev/'] });

/* ---------------- Level 4: organization & tooling ---------------- */

TST('ts-modules', { name: 'Modules, imports & module resolution', cat: 'tsorg',
  blurb: `How TypeScript finds and types the code you import: ES modules vs CommonJS, type-only imports, the module and moduleResolution settings, path aliases, and declaration files. Getting module configuration right is the difference between a project that "just works" and endless cannot-find-module errors.`,
  facts: [['Syntax', 'ES modules: import/export'], ['Type-only', 'import type { T }'], ['Resolution', 'moduleResolution: "bundler" | "node16" | "nodenext"'], ['Declarations', '.d.ts describe JS for TS']],
  cheat: [['import { x } from "m"', 'Named import'], ['import type { T }', 'Import only a type (erased)'], ['export / export default', 'Named / default export'], ['module', 'Output module format (esnext, commonjs…)'], ['moduleResolution', 'How specifiers are resolved (bundler/nodenext)'], ['paths / baseUrl', 'Path aliases like @/utils'], ['.d.ts', 'Declaration file (types for JS)'], ['verbatimModuleSyntax', 'Keep import/export exactly; force import type'], ['allowImportingTsExtensions', 'Import "./x.ts" (bundler/nodenext)'], ['@types/*', 'Community types from DefinitelyTyped']],
  sections: [
    ['ES modules and type-only imports', PP(`Modern TypeScript uses <b>ES module</b> syntax (<code>import</code>/<code>export</code>) regardless of the output format. Because types are erased, TS distinguishes <b>value</b> imports from <b>type</b> imports: <code>import type { User } from "./types"</code> is guaranteed to be removed from the output, which prevents accidental runtime dependencies and side-effect imports. Under <code>verbatimModuleSyntax</code>, TS won’t silently elide imports, so marking type-only imports explicitly becomes required — and clearer.`)],
    ['Module resolution', PP(`<code>moduleResolution</code> tells TS <b>how to find</b> a module from its specifier. Use <code>"bundler"</code> when a bundler (Vite, esbuild, webpack) handles resolution — it’s the most ergonomic (no file extensions needed). Use <code>"nodenext"</code>/<code>"node16"</code> for native Node ESM/CJS projects, where <code>package.json</code> <code>"type"</code> and explicit <code>.js</code> extensions matter. Mismatched settings are the root cause of most "cannot find module" and "ESM/CJS" errors.`)],
    ['Path aliases and declaration files', PP(`<code>paths</code> + <code>baseUrl</code> let you write <code>@/components/Button</code> instead of <code>../../../components/Button</code> — but the <b>bundler/runtime must be configured to match</b>, since TS paths are compile-time only. <b>Declaration files</b> (<code>.d.ts</code>) describe the types of JavaScript code; packages ship their own or rely on community <code>@types/*</code> packages, and you write them to type untyped JS or augment globals.`)]
  ],
  snipTitle: 'Modules & resolution', snipNote: 'Imports, type-only imports, aliases, and config.',
  snips: [['Imports & exports', 'typescript', `// value import + type-only import (type is erased from output):
import { createServer } from "node:http";
import type { Server } from "node:http";

export function start(): Server { return createServer(); }  // uses the type
export default start;

// Re-export a type:
export type { User } from "./models";`],
    ['tsconfig for a bundler project', 'json', `{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}`],
    ['A declaration file', 'typescript', `// legacy-lib.d.ts — typing an untyped JS module
declare module "legacy-lib" {
  export function compute(input: number): number;
  export const version: string;
}

// Ambient global augmentation:
declare global {
  interface Window { __APP_CONFIG__?: { apiUrl: string }; }
}
export {};   // make this file a module`]],
  edge: [`TS <code>paths</code> aliases are <b>compile-time only</b> — the bundler/runtime (or a tool like <code>tsc-alias</code>/<code>tsconfig-paths</code>) must be configured identically, or imports fail at runtime.`, `ESM/CJS interop is a common pain: under <code>nodenext</code> you often need explicit <code>.js</code> extensions in relative imports (even from <code>.ts</code> files) and must respect <code>package.json</code> <code>"type"</code>.`, `Forgetting <code>import type</code> can accidentally pull a module in at runtime for its side effects, or break tree-shaking.`, `A missing <code>@types/*</code> package leaves an import typed as <code>any</code> (or errors under <code>noImplicitAny</code>); install the types or write a <code>.d.ts</code>.`, `A <code>.d.ts</code> with no top-level <code>import</code>/<code>export</code> is treated as <b>global</b>; add <code>export {}</code> to make it a module when you don’t intend globals.`],
  faq: [['Why does TypeScript have a separate <code>import type</code>?', PP(`Because types are <b>erased</b>, TS needs to know which imports are only for types so it can safely remove them from the emitted JavaScript. <code>import type { User }</code> is guaranteed to disappear, which (a) avoids pulling a module in at runtime just for a type, (b) prevents circular-dependency and side-effect surprises, and (c) helps bundlers tree-shake. Under <code>verbatimModuleSyntax</code> (recommended), TS stops guessing and requires you to mark type-only imports, making the output predictable.`)],
    ['What should <code>moduleResolution</code> be set to?', PP(`It depends on <i>who resolves your modules</i>. If a <b>bundler</b> (Vite, esbuild, webpack, Next.js) handles it, use <code>"bundler"</code> — the most forgiving (no extensions, supports <code>paths</code> and modern <code>package.json</code> exports). If you run output <b>directly in Node</b>, use <code>"nodenext"</code> (or <code>"node16"</code>), which enforces Node’s ESM/CJS rules, including explicit file extensions and <code>package.json</code> <code>"type"</code>. Most "cannot find module" headaches come from a resolution mode that doesn’t match the actual runtime.`)],
    ['My <code>@/...</code> import works in the editor but crashes at runtime — why?', PP(`Because <code>paths</code> aliases in <code>tsconfig</code> only affect <b>type checking</b>, not the emitted JavaScript or how Node/the bundler loads modules. The editor and <code>tsc</code> understand <code>@/components</code>, but at runtime the import string is still <code>@/components</code> unless your bundler or runtime is told how to resolve it. Fix it by configuring the same alias in your bundler (Vite <code>resolve.alias</code>, webpack <code>resolve.alias</code>), or using <code>tsconfig-paths</code>/<code>tsc-alias</code> for plain Node. Keep the two definitions in sync.`)]],
  qs: [SQ('Why does TypeScript distinguish <code>import type</code> from a regular import?', ['For faster builds only', 'So type-only imports are guaranteed erased from the output, avoiding runtime dependencies and aiding tree-shaking', 'It is required syntax for all imports', 'It changes the runtime behavior of the module'], 1, 'Type imports are erased; marking them keeps the emitted JS free of unneeded runtime deps.'),
    SQ('Your <code>paths</code> alias type-checks but fails at runtime. The cause is usually…', ['A TypeScript bug', 'paths are compile-time only; the bundler/runtime must be configured to resolve the alias too', 'Missing strict mode', 'The alias needs import type'], 1, 'TS path aliases don’t rewrite output; the runtime resolver must match them.')]
});
DP('ts-modules', {
  fu: [['What is verbatimModuleSyntax and should I use it?', 'It makes TS preserve import/export statements exactly as written (eliding only explicit import type), removing ambiguous auto-elision. Recommended for new projects: output is predictable and ESM/CJS behavior is clearer. It does require you to mark type-only imports.'],
    ['How do I type a JS library that ships no types?', 'Install @types/<pkg> if it exists on DefinitelyTyped; otherwise write a .d.ts with declare module "pkg" { ... } describing the API you use. Even a minimal declaration beats a blanket any.'],
    ['What changed with "module": "nodenext"?', 'It follows Node’s real ESM/CJS resolution: honors package.json "type" and "exports", requires explicit extensions in relative ESM imports, and distinguishes .mts/.cts. It’s stricter but matches how Node actually loads code.']],
  deep: [['Technique', 'Pick moduleResolution to match the runtime (bundler for bundled apps, nodenext for native Node), enable verbatimModuleSyntax, and keep tsconfig paths in sync with the bundler’s aliases.'],
    ['Failure mode', 'ESM/CJS mismatch and alias drift — the top causes of cannot-find-module and "exports is not defined" errors. Align tsconfig, package.json, and bundler config.'],
    ['In real code', 'Monorepos lean on paths/project references; libraries ship both ESM and CJS with declaration files; apps targeting Node ESM deal carefully with extensions and type: module.']],
  src: ['TypeScript Handbook: Modules & Module Resolution', 'https://www.typescriptlang.org/docs/handbook/modules/theory.html'] });

TST('ts-classes', { name: 'Classes: access modifiers, abstract & parameter properties', cat: 'tsorg',
  blurb: `TypeScript adds a full type layer to JavaScript classes: access modifiers (public/private/protected), readonly fields, abstract classes, implements, parameter properties, and the distinction between TypeScript's private and JavaScript's real #private. Knowing what is enforced at compile time versus runtime matters.`,
  facts: [['Modifiers', 'public (default), private, protected'], ['#private', 'JS-level true privacy (runtime)'], ['abstract', 'class/method that must be implemented'], ['Parameter props', 'constructor(private x: T) declares + assigns']],
  cheat: [['public / private / protected', 'Access control (compile-time, except #)'], ['readonly', 'Field assignable only in constructor'], ['#field', 'True private (enforced at runtime by JS)'], ['abstract class / method', 'Cannot instantiate; must be implemented'], ['implements I', 'Class must satisfy interface I'], ['constructor(private x: T)', 'Parameter property: declare + assign in one'], ['static', 'Class-level member'], ['override', 'Mark an overriding method (noImplicitOverride)'], ['get / set', 'Accessors'], ['Prefer composition', 'Classes aren’t always the answer in TS']],
  sections: [
    ['Access modifiers (compile-time) vs <code>#private</code> (runtime)', PP(`<code>private</code>/<code>protected</code> are <b>TypeScript-only</b> — enforced by the compiler but erased, so at runtime the field is a normal, accessible property. JavaScript’s <code>#field</code> is <b>truly private</b> and enforced by the engine at runtime. Use <code>#</code> when real encapsulation matters (library internals, security-ish invariants); <code>private</code> is fine for ordinary app code where compile-time checking suffices. <code>readonly</code> allows assignment only in the constructor.`)],
    ['Abstract classes and <code>implements</code>', PP(`An <b>abstract</b> class can’t be instantiated and may declare <b>abstract methods</b> that subclasses must implement — useful for template patterns and shared base behavior. <code>implements I</code> checks that a class satisfies an interface’s shape without inheriting anything, letting you type-check contracts (a class can implement several interfaces). Note <code>implements</code> only checks — it doesn’t add members.`)],
    ['Parameter properties and pragmatism', PP(`<b>Parameter properties</b> are a TS shorthand: marking a constructor parameter <code>private</code>/<code>public</code>/<code>readonly</code> both declares the field and assigns it, cutting boilerplate. Beyond syntax, remember TypeScript is structurally typed and loves plain data + functions — <b>don’t force class hierarchies</b> where a type alias, a discriminated union, or a module of functions is simpler. Classes earn their place for stateful objects, DI, and framework base classes.`)]
  ],
  snipTitle: 'Typed classes', snipNote: 'Modifiers, abstract, implements, parameter properties.',
  snips: [['Modifiers & parameter properties', 'typescript', `interface Logger { log(msg: string): void; }

class Service implements Logger {    // must satisfy Logger
  readonly id = crypto.randomUUID(); // assignable only here
  #secret = "token";                 // TRUE private (runtime-enforced)

  // Parameter properties: declare + assign in the signature:
  constructor(private db: Database, protected name: string) {}

  log(msg: string) { console.log(this.name, msg); }   // satisfies Logger
  reveal() { return this.#secret.length; }            // ok inside
}
// new Service(db, "svc").#secret   → ✗ syntax error (truly private)`],
    ['Abstract classes', 'typescript', `abstract class Shape {
  abstract area(): number;            // subclasses must implement
  describe(): string { return \`area=\${this.area()}\`; }  // shared
}
class Circle extends Shape {
  constructor(private r: number) { super(); }
  override area(): number { return Math.PI * this.r ** 2; }
}
// new Shape()  → ✗ cannot instantiate an abstract class`]],
  edge: [`<code>private</code>/<code>protected</code> are <b>not</b> runtime-private — they’re erased; reflection or <code>obj["field"]</code> can still reach them. Use <code>#field</code> for real privacy.`, `<code>implements</code> only <b>checks</b> the shape; it does not inherit or add members, and it doesn’t infer parameter types for the methods — you still annotate them.`, `Parameter properties are convenient but hide field declarations from readers skimming the class body; teams sometimes disallow them for clarity.`, `<code>strictPropertyInitialization</code> requires non-optional fields to be initialized; <code>#field</code> and <code>readonly</code> interact with this.`, `Overusing inheritance fights TypeScript’s structural, data-oriented grain — prefer composition, unions, and plain functions unless a class is clearly warranted.`],
  faq: [['Is TypeScript’s <code>private</code> actually private?', PP(`Only at <b>compile time</b>. The compiler stops <i>your TypeScript</i> from accessing a <code>private</code> field outside the class, but the keyword is <b>erased</b> in the output — at runtime it’s an ordinary property reachable via <code>obj["field"]</code>, JSON serialization, or debugging tools. For <b>true</b> runtime privacy, use JavaScript’s <code>#field</code> syntax, which the engine enforces (accessing it elsewhere is a syntax/runtime error). Choose <code>#</code> when encapsulation must hold at runtime; <code>private</code> is adequate for ordinary code where compile-time checking is enough.`)],
    ['What are parameter properties?', PP(`A TypeScript shorthand that lets you <b>declare and initialize a field directly in the constructor signature</b>. Writing <code>constructor(private db: Database) {}</code> is equivalent to declaring a <code>db</code> field, typing it, and assigning <code>this.db = db</code> in the body — all collapsed into one. It removes boilerplate common in dependency-injection-style classes. The trade-off is that the fields no longer appear in the class body, which some teams find less readable and disable via lint.`)],
    ['Should I use classes or just types and functions?', PP(`Use whichever fits — but don’t reach for class hierarchies by reflex. TypeScript is <b>structurally typed</b> and works beautifully with plain object types, discriminated unions, and modules of functions, which are often simpler to test and compose than inheritance. <b>Classes</b> earn their place for genuinely stateful objects, dependency injection, framework base classes (e.g. NestJS controllers), and when you want instances with methods and encapsulation. A good heuristic: model <i>data</i> with types/unions, reach for a class when you need <i>behavior bound to mutable state</i>.`)]],
  qs: [SQ('Which gives TRUE runtime privacy in a class?', ['private field', 'protected field', '#field (JS private)', 'readonly field'], 2, 'Only #field is enforced by the JS engine at runtime; private/protected are erased.'),
    SQ('<code>constructor(private db: Database) {}</code> is an example of…', ['An abstract method', 'A parameter property that declares and assigns the field', 'An interface implementation', 'A static member'], 1, 'Parameter properties declare + initialize a field from the constructor signature.')]
});
DP('ts-classes', {
  fu: [['What happened to experimental decorators?', 'TypeScript originally shipped legacy decorators (experimentalDecorators) used by Angular/NestJS. TC39 Stage-3 decorators are now standardized and supported natively; new code targets the standard version, while some frameworks still use the legacy flag. Check your framework’s requirement.'],
    ['When is an abstract class better than an interface?', 'Use an abstract class when you want to share implementation (concrete methods, state) alongside the contract; use an interface when you only need a shape and want multiple implementations or structural typing. Classes can implement interfaces to get both.'],
    ['Why do some teams ban parameter properties?', 'Because fields declared in the constructor signature are easy to miss when skimming a class and mix declaration with DI wiring. It’s a style choice; frameworks like NestJS lean into them heavily.']],
  deep: [['Technique', 'Reach for #private when runtime encapsulation matters, readonly for immutable fields, abstract for shared base behavior, and parameter properties to cut DI boilerplate — but model plain data with types/unions, not classes.'],
    ['Failure mode', 'Assuming private means runtime-private (it does not), or building deep inheritance trees that fight structural typing. Prefer composition.'],
    ['In real code', 'Backend frameworks (NestJS) and some frontend state libs are class-heavy with decorators; much modern app/domain code favors functions + types, using classes selectively for stateful services.']],
  src: ['TypeScript Handbook: Classes', 'https://www.typescriptlang.org/docs/handbook/2/classes.html'] });

TST('ts-enums', { name: 'Enums vs union types vs const objects', cat: 'tsorg',
  blurb: `Enums are one of the few TypeScript features that add real runtime code, and they come with surprising pitfalls. This explains numeric and string enums, const enums, and why experienced TypeScript developers usually reach for literal union types or const objects instead.`,
  facts: [['Numeric enum', 'auto-numbered; reverse-mapped'], ['String enum', 'explicit string values; nominal-ish'], ['const enum', 'inlined, no runtime object'], ['Often better', 'union of literals or as const object']],
  cheat: [['enum E { A, B }', 'Numeric enum (A=0, B=1) + runtime object'], ['enum E { A="a" }', 'String enum (no reverse map)'], ['const enum', 'Inlined at use sites; emits nothing (caveats)'], ['"a" | "b"', 'Literal union — zero runtime, simplest'], ['as const object', '{ A:"a" } as const + typeof[keyof]'], ['Reverse mapping', 'Numeric enums create E[0] === "A"'], ['Enum is a value+type', 'Occupies a runtime binding'], ['Tree-shaking', 'Non-const enums aren’t erased'], ['isolatedModules', 'const enum restricted under it'], ['Prefer unions', 'For most "set of options" cases']],
  sections: [
    ['Numeric and string enums', PP(`A <b>numeric enum</b> auto-assigns <code>0, 1, 2…</code> and creates a two-way <b>reverse mapping</b> (<code>Color[0] === "Red"</code>), which bloats output and can surprise you in iteration. A <b>string enum</b> requires explicit values and behaves more predictably (no reverse map). Crucially, <b>enums emit a real runtime object</b> — they are a value <i>and</i> a type — so they aren’t free and aren’t tree-shaken away.`)],
    ['<code>const enum</code> and its caveats', PP(`A <b>const enum</b> is <b>inlined</b> at each use site and emits no object, so it’s cheap — but it has sharp edges: it’s restricted or disallowed under <code>isolatedModules</code> (used by Babel/esbuild/Vite), can break across package boundaries, and complicates some bundlers. Because of this, many projects avoid <code>const enum</code> entirely.`)],
    ['Why unions and <code>as const</code> are usually better', PP(`For "a fixed set of options," a <b>literal union</b> (<code>type Status = "idle" | "loading" | "done"</code>) is simpler: zero runtime cost, perfect narrowing, and great for discriminated unions. When you also need the values at runtime (to iterate, validate, or map), an <b>\`as const\` object</b> plus <code>typeof OBJ[keyof typeof OBJ]</code> gives you both a runtime value and a precise type from one declaration — the modern idiom that avoids every enum pitfall.`)]
  ],
  snipTitle: 'Enums and the alternatives', snipNote: 'The pitfalls, and the patterns most teams prefer.',
  snips: [['Enums', 'typescript', `enum Color { Red, Green, Blue }      // 0,1,2 + reverse map
const c = Color.Green;                // 1
const name = Color[1];                // "Green" (reverse mapping)

enum Status { Idle = "idle", Done = "done" }  // string enum (no reverse map)

// Both emit a runtime object (not erased, not tree-shaken).`],
    ['Union (usually best)', 'typescript', `type Status = "idle" | "loading" | "done";   // zero runtime cost

function set(s: Status) { /* narrows perfectly in switch */ }
set("loading");        // ✓
// set("nope");        // ✗ compile error`],
    ['as const object (runtime values + type)', 'typescript', `const Role = {
  Admin: "admin",
  Editor: "editor",
  Viewer: "viewer",
} as const;

type Role = typeof Role[keyof typeof Role];  // "admin"|"editor"|"viewer"

Object.values(Role).forEach((r) => console.log(r));  // iterate at runtime
function grant(r: Role) {}                   // typed
grant(Role.Admin);                           // ✓`]],
  edge: [`Numeric enums allow assigning <i>any</i> number in some positions and create a <b>reverse mapping</b> that pollutes <code>Object.keys</code>/iteration — a classic gotcha.`, `Enums are <b>not erased</b>: they emit runtime objects and aren’t tree-shaken, unlike union types which cost nothing.`, `<code>const enum</code> is inlined but is problematic under <code>isolatedModules</code> (Vite/esbuild/Babel) and across package boundaries — often best avoided.`, `Enum members are <i>nominal-ish</i> (a plain string isn’t assignable to a string enum), which occasionally helps but more often just adds friction versus a union.`, `Mixing numeric and heterogeneous enum values is legal but confusing — avoid it.`],
  faq: [['Should I use enums at all?', PP(`For most cases, <b>no</b> — prefer a <b>literal union</b> for a fixed set of options (zero runtime cost, ideal narrowing) or an <b>\`as const\` object</b> when you also need the values at runtime (iteration, validation, mapping). Enums are worth considering when a framework or team convention expects them, or when you specifically want the two-way reverse mapping of numeric enums. But they emit runtime code, aren’t tree-shaken, and carry gotchas that the union / const-object patterns simply don’t have.`)],
    ['What’s wrong with numeric enums specifically?', PP(`Two things. First, the <b>reverse mapping</b>: TypeScript generates both <code>Color.Red === 0</code> and <code>Color[0] === "Red"</code>, which bloats the emitted object and makes <code>Object.keys(Color)</code> return both names and numbers — surprising when you iterate. Second, numeric enums are <b>loosely checked</b> in places (you can assign arbitrary numbers in some positions), weakening the safety you wanted. String enums avoid the reverse map and are safer, but even they emit runtime objects you often don’t need.`)],
    ['How do I get both a runtime value and a precise type without an enum?', PP(`Declare a plain object with <code>as const</code> and derive the type from it: <code>const Role = { Admin: "admin", … } as const; type Role = typeof Role[keyof typeof Role];</code>. Now <code>Role</code> the <i>value</i> is a real object you can iterate/validate with (<code>Object.values(Role)</code>), and <code>Role</code> the <i>type</i> is the exact union of its values — a single source of truth with none of the enum pitfalls (fully tree-shakeable, predictable iteration, no reverse map). This is the modern idiom most TypeScript codebases adopt.`)]],
  qs: [SQ('For a fixed set of options with no runtime iteration needed, the simplest choice is…', ['A numeric enum', 'A literal union type ("a" | "b" | "c")', 'A const enum', 'A class with static fields'], 1, 'A literal union has zero runtime cost and perfect narrowing.'),
    SQ('Which is a real drawback of (non-const) enums versus union types?', ['They can’t be narrowed', 'They emit runtime objects and aren’t tree-shaken away', 'They require strict mode', 'They cannot hold string values'], 1, 'Enums are a value+type that emit code; unions are erased and cost nothing.')]
});
DP('ts-enums', {
  fu: [['Is there a case where an enum is clearly the right call?', 'When a framework or external contract expects a TS enum, when you deliberately want numeric reverse mapping, or when a team standardizes on string enums for consistency. Otherwise unions / const objects are usually preferable.'],
    ['Why is const enum discouraged in modern toolchains?', 'Because const enums rely on the type checker inlining values, but fast transpilers (esbuild, Babel, swc) run per-file without full type info (isolatedModules), so they either error or need special handling. Plain unions/const objects sidestep this entirely.'],
    ['How do I validate that an arbitrary string is a valid option?', 'With a const-object/union, use a Set or Object.values(...).includes(x) guarded by a type predicate, or validate with a schema (z.enum([...])). This gives both runtime checking and the inferred union type.']],
  deep: [['Technique', 'Default to literal unions for option sets; use as const objects when runtime values are needed; reserve enums for framework/interop requirements. Pair with z.enum for boundary validation.'],
    ['Failure mode', 'Reaching for enums by habit and inheriting reverse-mapping bloat and tooling friction, or using const enum under a bundler that doesn’t support it well.'],
    ['In real code', 'Modern TS style guides (and many large codebases) prefer unions / const objects; enums persist mainly in Angular/older NestJS code and some library APIs.']],
  src: ['TypeScript Handbook: Enums', 'https://www.typescriptlang.org/docs/handbook/enums.html'] });

TST('ts-tsconfig', { name: 'Configuring the compiler: tsconfig.json', cat: 'tsorg',
  blurb: `tsconfig.json controls everything about how your project is checked and compiled: which JS version to target, how modules resolve, which strictness flags apply, whether to emit output or just type-check, and how a monorepo's packages reference each other. A well-tuned tsconfig is the backbone of a healthy TypeScript project.`,
  facts: [['target', 'JS language level of the output'], ['lib', 'ambient APIs available (DOM, ESNext)'], ['noEmit', 'type-check only; let a bundler emit'], ['Project refs', 'scalable multi-package builds']],
  cheat: [['target', 'Output JS version (es2022, esnext…)'], ['lib', 'Available APIs ("DOM", "ES2023"…)'], ['module / moduleResolution', 'Module format & resolution'], ['strict', 'All strict-family checks'], ['noEmit', 'Check only; bundler produces JS'], ['outDir / rootDir', 'Where emitted files go / source root'], ['declaration', 'Emit .d.ts (for libraries)'], ['sourceMap', 'Emit source maps for debugging'], ['skipLibCheck', 'Skip checking .d.ts files (faster)'], ['references', 'Project references for monorepos'], ['jsx', 'How to handle JSX (react-jsx)'], ['types / typeRoots', 'Which @types to include']],
  sections: [
    ['target and lib: what runs, what’s available', PP(`<code>target</code> sets the <b>JavaScript version of the emitted code</b> — pick one your runtime supports (modern Node/browsers handle <code>es2022</code>+). <code>lib</code> declares which <b>ambient APIs</b> exist for type-checking: include <code>"DOM"</code> for browser code, omit it for pure Node, and add <code>"ES2023"</code> etc. for newer built-ins. They’re independent: <code>target</code> affects output syntax, <code>lib</code> affects what types the checker knows about.`)],
    ['Emit or not: <code>noEmit</code> and bundlers', PP(`In most modern setups a <b>bundler</b> (Vite, esbuild, swc) strips types and produces JS, while <code>tsc</code> runs with <b><code>noEmit: true</code></b> purely as the <b>type checker</b> (often as a CI gate). For <b>libraries</b> you instead emit <code>declaration: true</code> (<code>.d.ts</code> files) so consumers get types, plus <code>sourceMap</code> for debugging. <code>skipLibCheck: true</code> speeds things up by not re-checking dependencies’ declaration files.`)],
    ['Scaling: project references and base configs', PP(`For monorepos and large codebases, <b>project references</b> (<code>references</code> + <code>composite</code>) let TypeScript build and type-check packages incrementally in dependency order, caching results. Shared settings live in a <b>base tsconfig</b> that packages <code>extends</code>. Community base configs (e.g. <code>@tsconfig/node20</code>, <code>@tsconfig/strictest</code>) give sensible, pre-tuned starting points.`)]
  ],
  snipTitle: 'tsconfig recipes', snipNote: 'A bundler app, a library, and a shared base.',
  snips: [['App (type-check only; bundler emits)', 'json', `{
  "compilerOptions": {
    "target": "es2022",
    "lib": ["es2023", "DOM", "DOM.Iterable"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "skipLibCheck": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}`],
    ['Library (emit JS + declarations)', 'json', `{
  "compilerOptions": {
    "target": "es2021",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src"
  }
}`],
    ['Monorepo base + extends', 'json', `// tsconfig.base.json
{ "compilerOptions": { "strict": true, "skipLibCheck": true, "composite": true } }

// packages/web/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "lib": ["DOM", "ES2023"], "outDir": "dist" },
  "references": [{ "path": "../core" }]
}`]],
  edge: [`<code>target</code> and <code>lib</code> are different concerns — a low <code>target</code> with a high <code>lib</code> lets you <i>use</i> new APIs in types while down-compiling syntax (you still need runtime polyfills for the APIs).`, `In bundler setups, <code>tsc</code> usually runs with <code>noEmit</code>; forgetting this can make <code>tsc</code> and the bundler fight over output.`, `<code>skipLibCheck</code> is almost always on for speed, but it can hide real type errors inside dependencies’ <code>.d.ts</code> files.`, `Project references require <code>composite: true</code> and correct <code>references</code> ordering; misconfiguration causes stale or missing builds.`, `<code>include</code>/<code>exclude</code> and <code>types</code> control what gets checked — an overly broad <code>include</code> slows builds; an accidental global <code>@types</code> can inject unwanted ambient types.`],
  faq: [['What’s the difference between <code>target</code> and <code>lib</code>?', PP(`<code>target</code> controls the <b>syntax level of the emitted JavaScript</b> — e.g. <code>es2022</code> keeps modern syntax, a lower target down-compiles features like <code>async</code>/optional-chaining. <code>lib</code> controls <b>which ambient type declarations the checker loads</b> — <code>"DOM"</code> for browser globals, <code>"ES2023"</code> for newer standard-library types like <code>Array.prototype.findLast</code>. You can mix them: target old syntax but allow new <i>APIs</i> in your types (shipping a runtime polyfill for those APIs). In short: <code>target</code> = output syntax, <code>lib</code> = available APIs for checking.`)],
    ['Why would I set <code>noEmit: true</code>?', PP(`Because in modern toolchains a <b>bundler</b> (Vite, esbuild, swc, Next.js) is responsible for stripping types and producing the JavaScript — and it does so far faster than <code>tsc</code>. You then run <code>tsc --noEmit</code> purely as the <b>type checker</b>, typically in your editor and as a required <b>CI gate</b>, so the two jobs are cleanly separated: the bundler builds, <code>tsc</code> verifies. Libraries are the exception — they usually <i>do</i> emit, with <code>declaration: true</code>, so consumers get <code>.d.ts</code> types.`)],
    ['How do I keep tsconfig manageable across a large monorepo?', PP(`Put shared settings in a <b>base config</b> (or extend a community one like <code>@tsconfig/strictest</code>) and have each package <code>extends</code> it, overriding only what differs (e.g. <code>lib</code> for browser vs Node). For build performance and correctness, use <b>project references</b> (<code>composite: true</code> + <code>references</code>), which let TypeScript build packages incrementally in dependency order and cache results. This avoids duplicated config, keeps strictness consistent, and scales type-checking to hundreds of packages.`)]],
  qs: [SQ('In a typical Vite/esbuild app, what role does <code>tsc</code> usually play?', ['It bundles and minifies the app', 'It runs with noEmit as the type checker while the bundler produces the JS', 'It serves the dev server', 'It replaces the need for a bundler'], 1, 'Bundlers strip types fast; tsc --noEmit is the actual type-checking gate.'),
    SQ('What is the difference between <code>target</code> and <code>lib</code>?', ['They are the same', 'target sets emitted JS syntax level; lib sets which ambient APIs the checker knows about', 'target is for libraries, lib is for apps', 'lib controls strictness'], 1, 'target = output syntax; lib = available API typings for checking.')]
});
DP('ts-tsconfig', {
  fu: [['What are the @tsconfig/* base configs?', 'Official, pre-tuned tsconfig bases (e.g. @tsconfig/node20, @tsconfig/strictest, @tsconfig/recommended) you extend to get sensible target/lib/strictness defaults for a given runtime without hand-tuning dozens of flags.'],
    ['How do incremental and composite builds speed things up?', 'incremental caches type-check results in a .tsbuildinfo file; composite (required for project references) makes a package independently buildable and cacheable, so tsc only rechecks what changed and its dependents — crucial for large repos.'],
    ['Should I ever down-level with tsc for production?', 'For apps, usually no — a bundler handles transpilation/polyfills better and faster; tsc is the checker. For published libraries, emitting with tsc (or tsup/rollup) and shipping declarations is standard.']],
  deep: [['Technique', 'Separate concerns: bundler emits, tsc --noEmit checks (CI gate). Extend a shared/community base for consistency, enable strict + skipLibCheck, and use project references for monorepos.'],
    ['Failure mode', 'target/lib confusion (using new APIs without polyfills), tsc and bundler both emitting, or missing composite/references causing stale builds.'],
    ['In real code', 'Framework starters ship tuned tsconfigs; teams add noUncheckedIndexedAccess and keep a green tsc --noEmit in CI as a non-negotiable gate.']],
  src: ['TypeScript: tsconfig reference', 'https://www.typescriptlang.org/tsconfig'] });

TST('ts-lint', { name: 'The tooling ecosystem: tsc, ESLint, Prettier & build tools', cat: 'tsorg',
  blurb: `TypeScript rarely works alone. A healthy project combines tsc for type-checking, typescript-eslint for lint rules that understand types, Prettier for formatting, a fast transpiler/bundler (esbuild/swc/Vite) for builds, and a runner like tsx for executing TS directly. Knowing who does what — and that fast tools don't type-check — avoids a lot of confusion.`,
  facts: [['tsc', 'the only full type checker'], ['typescript-eslint', 'type-aware lint rules'], ['Prettier', 'formatting (not correctness)'], ['esbuild/swc/tsx', 'fast transpile — no type checking']],
  cheat: [['tsc --noEmit', 'Type-check the whole project'], ['typescript-eslint', 'ESLint + TS, incl. type-aware rules'], ['Prettier', 'Opinionated code formatting'], ['esbuild / swc', 'Very fast TS→JS transpilers (no checking)'], ['Vite', 'Dev server + bundler (uses esbuild)'], ['tsx / ts-node', 'Run .ts files directly (dev)'], ['tsup', 'Zero-config library bundler (+ d.ts)'], ['Separation', 'Transpile fast, type-check with tsc separately'], ['CI gate', 'tsc --noEmit + eslint in CI'], ['type-aware rules', 'Require parserOptions.project']],
  sections: [
    ['Who type-checks, and who doesn’t', PP(`The single most important thing to understand: <b>fast transpilers don’t type-check</b>. esbuild, swc, Babel, Vite and <code>tsx</code> achieve their speed by <b>stripping types per-file without understanding them</b> — they’ll happily compile code with type errors. Only <b><code>tsc</code></b> (and editors/IDE language service) performs real type checking. So the standard architecture is: a fast tool builds/runs your code, and <code>tsc --noEmit</code> checks it separately (locally and in CI).`)],
    ['Lint and format: ESLint + Prettier', PP(`<b>typescript-eslint</b> brings ESLint to TypeScript, including <b>type-aware rules</b> (e.g. no-floating-promises, no-unsafe-assignment) that require type information via <code>parserOptions.project</code>. ESLint catches <i>bug patterns and style</i>; <b>Prettier</b> handles <i>formatting</i> only. Keep them in separate lanes (disable ESLint’s formatting rules, or use <code>eslint-config-prettier</code>) so they don’t conflict.`)],
    ['Running and building TypeScript', PP(`For <b>development</b>, <code>tsx</code> (or <code>ts-node</code>) runs <code>.ts</code> files directly without a build step. For <b>apps</b>, Vite/esbuild bundle for production. For <b>libraries</b>, tools like <code>tsup</code> or <code>rollup</code> produce ESM/CJS output plus declaration files. Across all of these, remember the type check is a <i>separate</i> step — wire <code>tsc --noEmit</code> and <code>eslint</code> into your CI so nothing untyped or lint-broken merges.`)]
  ],
  snipTitle: 'A typical toolchain', snipNote: 'Scripts, ESLint flat config, and the CI gate.',
  snips: [['package.json scripts', 'json', `{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}`],
    ['ESLint flat config (type-aware)', 'typescript', `// eslint.config.ts
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...tseslint.configs.recommendedTypeChecked,   // needs type info
  {
    languageOptions: {
      parserOptions: { project: true },         // enable type-aware rules
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
);`],
    ['CI gate', 'bash', `# Fast transpilers skip type errors, so check explicitly in CI:
npm run typecheck   # tsc --noEmit  (the real type check)
npm run lint        # eslint .      (bug patterns + type-aware rules)
npm test            # your tests`]],
  edge: [`<b>Builds can pass with type errors</b> if you rely only on esbuild/swc/Vite — they transpile, they don’t check. Always run <code>tsc --noEmit</code> separately.`, `Type-aware ESLint rules need <code>parserOptions.project</code> (type information) and are slower; without it, those rules silently don’t run.`, `ESLint and Prettier can fight over formatting — disable ESLint’s stylistic rules (<code>eslint-config-prettier</code>) and let Prettier own formatting.`, `<code>ts-node</code> type-checks by default (slower); <code>tsx</code> and <code>ts-node --transpile-only</code> skip checking for speed — know which you’re using.`, `A green editor doesn’t guarantee a green CI if the editor’s TS version or config differs — pin the <code>typescript</code> version and share config.`],
  faq: [['If my build succeeds, doesn’t that mean there are no type errors?', PP(`Not if you build with a <b>fast transpiler</b> (esbuild, swc, Babel, Vite, <code>tsx</code>). These tools get their speed by <b>stripping types without checking them</b> — a file full of type errors transpiles to perfectly runnable JavaScript. The type check is a <i>separate</i> job that only <code>tsc</code> (and your editor) performs. That’s why real projects run <code>tsc --noEmit</code> explicitly — in the editor and as a <b>CI gate</b> — rather than assuming a successful build implies correct types.`)],
    ['What does typescript-eslint add over plain ESLint and tsc?', PP(`<code>tsc</code> checks <i>types</i>; <b>typescript-eslint</b> checks <i>patterns and practices</i> that aren’t type errors — like floating (unawaited) promises, unsafe <code>any</code> usage, unused vars, or banning certain constructs. Its most powerful rules are <b>type-aware</b>: they use the type checker’s information (enabled via <code>parserOptions.project</code>) to catch things like awaiting a non-Promise or unsafe member access. Together: <code>tsc</code> for type correctness, ESLint for code quality, Prettier for formatting — three complementary tools.`)],
    ['What’s the difference between tsx, ts-node, and the bundler?', PP(`<b><code>tsx</code></b> and <b><code>ts-node</code></b> let you <i>run</i> <code>.ts</code> files directly during development without a separate build. <code>ts-node</code> type-checks by default (slower); <code>tsx</code> (and <code>ts-node --transpile-only</code>) skip checking for speed. A <b>bundler</b> (Vite/esbuild/rollup/tsup) <i>builds</i> optimized output for production — bundling, minifying, and (for libraries) emitting declarations. None of these replace <code>tsc</code>’s type checking; they handle running/building, while <code>tsc --noEmit</code> handles verification.`)]],
  qs: [SQ('Your Vite build succeeds but the app has type errors. Why?', ['Vite silently fixed them', 'Fast transpilers (esbuild) strip types without checking; only tsc type-checks', 'Type errors never affect builds', 'Vite requires strict: false'], 1, 'esbuild/Vite transpile without checking — run tsc --noEmit to actually verify types.'),
    SQ('Which tool is responsible for code formatting (not correctness)?', ['tsc', 'typescript-eslint', 'Prettier', 'esbuild'], 2, 'Prettier handles formatting; tsc checks types and ESLint checks patterns.')]
});
DP('ts-lint', {
  fu: [['Why is tsc slower than esbuild/swc?', 'Because tsc does full semantic type checking across the whole program (building a type graph), while esbuild/swc only parse and strip types per file. Different jobs: correctness vs transpilation speed. Use both — fast tool to build, tsc to check.'],
    ['Do I still need Babel with TypeScript?', 'Usually not — esbuild/swc/Vite handle TS directly and faster. Babel is relevant mainly for specific plugin ecosystems or legacy setups. For type checking you still need tsc regardless.'],
    ['How do I make type-aware lint rules fast enough?', 'Use parserOptions.project (or projectService in newer versions), limit linting to source files, and run lint in CI in parallel with typecheck. The newer project-service reduces the historical slowness of type-aware linting.']],
  deep: [['Technique', 'Separate concerns: tsx/esbuild/Vite to run and build fast, tsc --noEmit to type-check, typescript-eslint for bug patterns, Prettier for formatting. Gate merges on typecheck + lint + tests in CI.'],
    ['Failure mode', 'Trusting a successful transpile as proof of type correctness, or letting type-aware lint rules silently not run because parserOptions.project is unset.'],
    ['In real code', 'The ubiquitous stack is Vite/Next + typescript-eslint flat config + Prettier + a tsc --noEmit CI gate; libraries add tsup for ESM/CJS + d.ts output.']],
  src: ['typescript-eslint documentation', 'https://typescript-eslint.io/'] });
