/* ===== TypeScript D: testing & quality ===== */

/* ---------------- Level 6: testing & quality ---------------- */

TST('ts-testing', { name: 'Testing TypeScript: runners, setup & typed tests', cat: 'tstest',
  blurb: `Testing TypeScript means running tests written in TS without a slow build step, and getting type safety inside the tests themselves. This covers the modern runner landscape (Vitest, Jest, node:test), how each handles TS, and how typed tests catch mistakes the assertions alone would miss.`,
  facts: [['Vitest', 'TS/ESM-native, fast, Jest-compatible API'], ['Jest', 'ubiquitous; needs ts-jest or swc/babel'], ['node:test', 'built-in runner; run via tsx'], ['Benefit', 'types check your test code too']],
  cheat: [['Vitest', 'Fast runner, native TS/ESM, Vite-powered'], ['Jest + ts-jest', 'Jest with type-checking transform'], ['Jest + @swc/jest', 'Jest with fast (no-check) transform'], ['node:test + tsx', 'Built-in runner, run .ts directly'], ['describe / it / expect', 'Standard test structure'], ['Typed expect', 'Matchers typed to the value'], ['Transpile vs check', 'Runners transpile; add tsc for checking'], ['test file types', 'Tests are TS → typos are compile errors'], ['vitest --typecheck', 'Also type-check tests & type tests'], ['Coverage', 'v8 / istanbul coverage of TS source']],
  sections: [
    ['The runner landscape', PP(`<b>Vitest</b> is the modern default for TypeScript: it runs <code>.ts</code>/ESM natively (via Vite/esbuild), is extremely fast, has a Jest-compatible API, and offers a built-in <code>--typecheck</code> mode. <b>Jest</b> is still everywhere but needs a transform — <code>ts-jest</code> (type-checks during tests, slower) or <code>@swc/jest</code>/babel (fast, no checking). <b>node:test</b> (Node’s built-in runner) plus <code>tsx</code> is a zero-dependency option. All share the familiar <code>describe/it/expect</code> structure.`)],
    ['Transpile vs type-check — again', PP(`The same rule from the build world applies to tests: most runners <b>transpile</b> your TS (stripping types) and <b>don’t type-check</b> it, so a test file with type errors can still run. That’s usually fine for speed, but it means you should still run <code>tsc --noEmit</code> over your tests (or use <code>vitest --typecheck</code>) so type mistakes in test code are caught. <code>ts-jest</code> is the exception that checks during the run.`)],
    ['Typed tests catch more', PP(`Because tests are TypeScript, the compiler checks them too: calling a function with the wrong argument types, referencing a renamed export, or mis-shaping a fixture becomes a <b>compile error</b>, not a confusing runtime failure. Well-typed <code>expect</code> matchers also narrow to the value’s type. The upshot: typed tests fail for the <i>right</i> reasons and refactors that change signatures surface broken tests immediately.`)]
  ],
  snipTitle: 'A typed test suite', snipNote: 'Vitest setup and typed tests.',
  snips: [['A Vitest test file', 'typescript', `import { describe, it, expect } from "vitest";
import { add, parseUser } from "../src/user";

describe("add", () => {
  it("sums two numbers", () => {
    expect(add(2, 3)).toBe(5);
    // add(2, "3")  → ✗ compile error: tests are type-checked too
  });
});

describe("parseUser", () => {
  it("returns a typed User", () => {
    const user = parseUser({ id: 1, name: "Ada" });
    expect(user.name).toBe("Ada");   // user is typed → autocomplete + safety
  });
});`],
    ['Config & scripts', 'typescript', `// vitest.config.ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "node",        // or "jsdom" for DOM/React tests
    typecheck: { enabled: true },// also type-check tests & type tests
    coverage: { provider: "v8" },
  },
});`],
    ['package.json', 'json', `{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "test:all": "tsc --noEmit && vitest run --coverage"
  }
}`]],
  edge: [`Most runners <b>don’t type-check</b> while running — a test file with type errors can pass. Run <code>tsc --noEmit</code> over tests (or <code>vitest --typecheck</code>) so test-code type bugs are caught.`, `With Jest, your transform choice matters: <code>ts-jest</code> type-checks (slower), <code>@swc/jest</code>/babel don’t (faster) — know which you’re using and add a separate <code>tsc</code> gate if the latter.`, `ESM/CJS config bites tests too (Jest historically struggled with ESM); Vitest sidesteps most of this by being ESM-native.`, `For DOM/React tests set the environment to <code>jsdom</code>/<code>happy-dom</code>; otherwise <code>document</code> is undefined.`, `Type-checking tests can be slower than running them — keep it as a gate (CI / pre-push), not on every keystroke.`],
  faq: [['Which test runner should I use with TypeScript?', PP(`For new projects, <b>Vitest</b> is the strongest default: it runs TypeScript and ESM natively (no transform to configure), is very fast, has a Jest-compatible API (easy migration), and includes a <code>--typecheck</code> mode plus type-level test assertions. <b>Jest</b> remains a fine choice — especially in existing codebases — but you must pick a transform (<code>ts-jest</code> for type-checking, <code>@swc/jest</code> for speed). If you want zero dependencies, <b>node:test</b> run via <code>tsx</code> works well. All use the same <code>describe/it/expect</code> patterns, so the knowledge transfers.`)],
    ['If my tests pass, are my types correct?', PP(`Not necessarily — most runners <b>transpile tests without type-checking them</b>, so a test file can contain type errors and still run green. Passing tests verify <i>runtime behavior</i>, not type correctness. To check types too, run <code>tsc --noEmit</code> across your whole project (including tests) as a separate step, or enable <code>vitest --typecheck</code>. <code>ts-jest</code> is the exception that type-checks during the run. Treat "tests pass" and "types check" as two independent gates, both required in CI.`)],
    ['What’s the advantage of tests being written in TypeScript?', PP(`The compiler checks your <b>test code</b> just like production code: passing the wrong argument type, using a renamed or removed export, or building a fixture with the wrong shape becomes a <b>compile error</b> instead of a cryptic runtime failure. Typed <code>expect</code> matchers and typed return values give autocomplete and narrow correctly, so tests are easier to write and read. Most importantly, when you <b>refactor a signature</b>, every test that used the old shape fails to compile immediately — pointing you straight at what needs updating, rather than waiting for a flaky runtime error.`)]],
  qs: [SQ('Which runner is TS/ESM-native, fast, and Jest-API-compatible?', ['ts-jest', 'Vitest', 'Mocha', 'Karma'], 1, 'Vitest runs TypeScript/ESM natively with a Jest-compatible API and a typecheck mode.'),
    SQ('Your Vitest tests pass. Does that guarantee your types are correct?', ['Yes, always', 'No — most runners transpile without type-checking; run tsc --noEmit or vitest --typecheck separately', 'Only if strict is on', 'Only with Jest'], 1, 'Runners usually skip type-checking; type correctness is a separate gate.')]
});
DP('ts-testing', {
  fu: [['How do I migrate a Jest suite to Vitest?', 'Vitest’s API mirrors Jest (describe/it/expect, mocks), so migration is often changing imports and config. The globals option and a compat layer ease it. The payoff is native TS/ESM, speed, and built-in type testing.'],
    ['What is vitest --typecheck actually doing?', 'It runs the TypeScript compiler over your test files (and any expectTypeOf/type tests) so type errors in tests and type-level assertions become test failures — bridging the transpile-only gap without a separate tsc invocation.'],
    ['Should tests live next to source or in a separate folder?', 'Either works; co-locating (foo.ts + foo.test.ts) aids discoverability and refactors, while a tests/ folder centralizes. Configure include globs accordingly; keep test files excluded from production builds.']],
  deep: [['Technique', 'Use Vitest (or Jest + a chosen transform), keep two gates — tsc --noEmit for types and the runner for behavior — and enable typecheck mode so test-code and type-level mistakes fail CI.'],
    ['Failure mode', 'Assuming green tests mean correct types (transpile-only runners don’t check), or ESM/CJS config friction (less with Vitest).'],
    ['In real code', 'Vitest is now the common default for TS projects; CI runs typecheck + test + lint in parallel, with coverage gated on the source.']],
  src: ['Vitest documentation', 'https://vitest.dev/'] });

TST('ts-typetest', { name: 'Type-level testing: asserting your types are correct', cat: 'tstest',
  blurb: `Complex generics, conditional types and utility types are code too — and they can have bugs. Type-level testing lets you assert that a type resolves to exactly what you expect, so a refactor that silently broadens or breaks a type fails a test. This is essential for library authors and anyone with non-trivial type logic.`,
  facts: [['Why', 'types can be wrong; assert them'], ['Tools', 'expectTypeOf (Vitest), tsd, ts-expect'], ['Assert', 'equality, assignability, errors'], ['Runs', 'at type-check time, not runtime']],
  cheat: [['expectTypeOf<T>()', 'Vitest type assertions'], ['.toEqualTypeOf<U>()', 'Assert exact type equality'], ['.toMatchTypeOf<U>()', 'Assert assignability (looser)'], ['tsd / expectType', 'Dedicated type-testing package'], ['@ts-expect-error', 'Assert that code SHOULD fail to compile'], ['Equality vs assignability', 'Exact match vs "fits into"'], ['Runtime no-op', 'Type tests check types, run as nothing'], ['Guard inference', 'Verify z.infer / ReturnType results'], ['Catch widening', 'Fail when a type loosens to any/unknown'], ['Library CI', 'Type tests protect public type APIs']],
  sections: [
    ['Types are code and can have bugs', PP(`A generic, a conditional type, or a <code>z.infer</code> result can silently resolve to something <b>wrong</b> — too wide, <code>any</code>, or a shape you didn’t intend — and ordinary runtime tests won’t notice because the values still behave. <b>Type-level tests</b> assert that a type is <i>exactly</i> what you expect, so if a refactor broadens or breaks it, a test fails. This matters most for <b>library authors</b> and anyone maintaining non-trivial type utilities.`)],
    ['Asserting types: equality, assignability, errors', PP(`The tools let you assert three things: <b>exact equality</b> (the type is precisely <code>U</code> — the strictest and most useful), <b>assignability</b> (the type fits into <code>U</code>), and <b>expected errors</b> (code that <i>should</i> fail to compile does, via <code>@ts-expect-error</code>). Vitest’s <code>expectTypeOf</code>, the <code>tsd</code> package, and <code>ts-expect</code> all provide these; they’re checked by the compiler and are <b>no-ops at runtime</b>.`)],
    ['A safety net for inference', PP(`Type tests are especially valuable for verifying <b>inferred</b> types: that <code>z.infer&lt;typeof Schema&gt;</code> produces the intended shape, that a <code>ReturnType</code> stays correct, that a mapped/conditional utility behaves on edge cases, and — crucially — that a type hasn’t <b>degraded to <code>any</code></b>. Add them to CI alongside runtime tests so your public type surface is protected the same way your runtime behavior is.`)]
  ],
  snipTitle: 'Type-level assertions', snipNote: 'expectTypeOf, @ts-expect-error, and verifying inference.',
  snips: [['Vitest expectTypeOf', 'typescript', `import { expectTypeOf, it } from "vitest";
import type { Result } from "../src/result";

it("Result narrows correctly", () => {
  type Ok = Result<number>;
  expectTypeOf<Ok>().toMatchTypeOf<{ ok: boolean }>();   // assignable
  expectTypeOf<Extract<Ok, { ok: true }>["value"]>()
    .toEqualTypeOf<number>();                             // exact equality
});

// Catch accidental widening to any:
function identity<T>(x: T): T { return x; }
expectTypeOf(identity("hi")).toEqualTypeOf<string>();     // not any!`],
    ['@ts-expect-error: assert a failure', 'typescript', `type Method = "GET" | "POST";
function call(m: Method) {}

call("GET");                     // ✓ compiles
// This line MUST error — the directive asserts it does:
// @ts-expect-error — "PATCH" is not a Method
call("PATCH");
// If "PATCH" ever becomes valid, the unused @ts-expect-error itself errors.`],
    ['Verifying inferred schema types', 'typescript', `import { expectTypeOf } from "vitest";
import { z } from "zod";

const User = z.object({ id: z.number(), name: z.string() });
type User = z.infer<typeof User>;

// Assert the inferred type is exactly what we intend:
expectTypeOf<User>().toEqualTypeOf<{ id: number; name: string }>();`]],
  edge: [`<code>toEqualTypeOf</code> (exact) vs <code>toMatchTypeOf</code> (assignable) matter: a type can be <i>assignable</i> to the target yet not <i>equal</i> — use equality to catch widening.`, `<code>@ts-expect-error</code> is self-policing: if the line it guards stops erroring, the directive itself becomes an error — great for asserting "this must not compile," but it also suppresses <i>any</i> error on that line, so keep it tightly scoped.`, `Type tests are <b>no-ops at runtime</b>; they only fail during type-checking, so they require a <code>tsc</code>/<code>--typecheck</code> step to run.`, `A type silently resolving to <code>any</code> passes many naive assertions — explicitly test against <code>any</code> (e.g. <code>expectTypeOf(...).not.toBeAny()</code>) when that’s a risk.`, `Overtesting trivial types adds noise; reserve type tests for generics, conditional/mapped types, public APIs, and inference you rely on.`],
  faq: [['Why would I test my types — doesn’t the compiler already check them?', PP(`The compiler checks that your code is <b>consistent</b>, but it doesn’t know your <b>intent</b>. A generic or conditional type can compile fine while resolving to the <i>wrong</i> shape — too wide, missing a field, or silently <code>any</code> — and runtime tests won’t catch it because the values still work. Type-level tests <b>pin down the exact type you expect</b>, so if a refactor changes what a type resolves to, a test fails and tells you. It’s the type-world equivalent of a unit test: verifying behavior (here, type behavior) against intent.`)],
    ['What’s the difference between <code>toEqualTypeOf</code> and <code>toMatchTypeOf</code>?', PP(`<code>toEqualTypeOf&lt;U&gt;</code> asserts the type is <b>exactly</b> <code>U</code> — same shape, no wider, no narrower. <code>toMatchTypeOf&lt;U&gt;</code> asserts the type is <b>assignable to</b> <code>U</code> — it "fits," but could be more specific. Prefer <b>equality</b> when you want to catch accidental <b>widening</b> (e.g. a type drifting toward <code>any</code> or gaining optional fields), and use <b>assignability</b> when you only care that a value satisfies a contract. The distinction mirrors <code>===</code> vs "is a subtype of."`)],
    ['How do I assert that some code *should not* compile?', PP(`Use the <b><code>@ts-expect-error</code></b> directive on the offending line. It tells TypeScript "I expect the next line to have a type error" — the suite only passes if that line <i>does</i> error. The clever part is it’s <b>self-correcting</b>: if the code stops erroring (say you widened a type so the previously-invalid call is now valid), the unused <code>@ts-expect-error</code> itself becomes an error, forcing you to update the test. Keep it tightly scoped, since it suppresses any error on that line, and add a comment explaining what should fail.`)]],
  qs: [SQ('Why write type-level tests when the compiler already type-checks?', ['They run faster', 'To assert a type resolves to exactly the intended shape, catching silent widening or wrong inference the compiler accepts', 'They replace runtime tests', 'To disable strict mode'], 1, 'The compiler checks consistency, not intent; type tests pin the expected type.'),
    SQ('Which assertion catches a type accidentally widening (e.g. toward any)?', ['toMatchTypeOf (assignability)', 'toEqualTypeOf (exact equality)', '@ts-ignore', 'expect(...).toBe(...)'], 1, 'Exact equality fails on widening; assignability would still pass.')]
});
DP('ts-typetest', {
  fu: [['Vitest expectTypeOf vs the tsd package — which to use?', 'If you already use Vitest, expectTypeOf (with --typecheck) keeps type tests alongside runtime tests. tsd is a standalone tool popular for libraries, running tsc over .test-d.ts files. Both assert equality/assignability/errors; choose based on your toolchain.'],
    ['How do I assert a type is NOT any?', 'Use expectTypeOf(x).not.toBeAny() (Vitest) or equivalent, because any passes most assertions silently. Guarding against accidental any is one of the highest-value type tests for libraries.'],
    ['Where do type tests pay off most?', 'In libraries and shared packages whose PUBLIC type API others depend on, and in codebases with heavy generics/conditional types. For plain app code, lighter use (verifying key inferred shapes) is usually enough.']],
  deep: [['Technique', 'Assert exact equality for critical types, use @ts-expect-error to lock in "must not compile" cases, verify inferred (z.infer/ReturnType) shapes, and run type tests via tsc/--typecheck in CI.'],
    ['Failure mode', 'Using assignability where equality is needed (misses widening), or forgetting type tests don’t run without a type-check step. Also silent any passing naive checks.'],
    ['In real code', 'Type-safe libraries (Zod, tRPC, utility-type packages) ship extensive type tests; apps add them around core generics and shared schemas to guard refactors.']],
  src: ['Vitest: Testing Types', 'https://vitest.dev/guide/testing-types'] });

TST('ts-mocking', { name: 'Mocks, stubs & test doubles — typed', cat: 'tstest',
  blurb: `Tests often need to replace a dependency with a controllable double. In TypeScript the challenge is keeping those doubles type-safe so they can't drift from the real thing. This covers typed mocking with Vitest/Jest, dependency injection for testability, and why a type-safe double is better than a cast-to-any.`,
  facts: [['Doubles', 'mock / stub / spy / fake'], ['Typed mocks', 'vi.fn<...>(), MockedFunction'], ['DI', 'inject deps so you can swap them'], ['Avoid', 'as any doubles that drift']],
  cheat: [['vi.fn() / jest.fn()', 'Create a mock function'], ['vi.fn<Args, Ret>()', 'Type a mock’s signature'], ['vi.mocked(x)', 'Typed view of a mocked module/fn'], ['mockResolvedValue', 'Typed async return for mocks'], ['spyOn(obj, "m")', 'Wrap a real method, typed'], ['satisfies Interface', 'Type a hand-made fake'], ['Dependency injection', 'Pass deps in so tests can swap them'], ['Partial<T> mocks', 'Mock only what you use (carefully)'], ['Avoid as any', 'Untyped doubles silently drift'], ['vitest-mock-extended', 'Deeply typed mocks of interfaces']],
  sections: [
    ['Kinds of test doubles', PP(`A <b>mock</b> records calls and lets you assert on them; a <b>stub</b> returns canned values; a <b>spy</b> wraps a real function to observe (and optionally override) it; a <b>fake</b> is a lightweight working implementation (e.g. an in-memory repository). The goal in TypeScript is that each double <b>conforms to the real type</b>, so when the real dependency’s signature changes, the double fails to compile instead of silently lying.`)],
    ['Typed mocking with Vitest/Jest', PP(`<code>vi.fn&lt;Args, Return&gt;()</code> (or Jest’s equivalent) creates a <b>typed mock function</b>; <code>vi.mocked(mod)</code> gives a <b>type-safe view</b> of an auto-mocked module so <code>mockResolvedValue</code>/<code>mockReturnValue</code> are checked against the real return type. <code>spyOn</code> wraps a real method with full typing. For whole interfaces, <code>satisfies</code> on a hand-written fake (or a helper like <code>vitest-mock-extended</code>) keeps the double aligned with the contract.`)],
    ['Design for testability: inject dependencies', PP(`The cleanest way to substitute a dependency is to <b>inject it</b> rather than import it hard — pass a repository, clock, or HTTP client in (as a constructor arg or function parameter) typed by an <b>interface</b>. Tests then supply a typed fake that satisfies the interface, no module mocking needed. This keeps mocks honest (the interface is the contract) and your code decoupled. Reserve module-level mocking for cases you can’t inject.`)]
  ],
  snipTitle: 'Typed doubles', snipNote: 'Typed mock functions, DI with interfaces, and typed fakes.',
  snips: [['Typed mock functions & spies', 'typescript', `import { vi, expect, it } from "vitest";

// Typed mock function — signature is enforced:
const fetchUser = vi.fn<(id: string) => Promise<{ id: string; name: string }>>();
fetchUser.mockResolvedValue({ id: "1", name: "Ada" });   // checked vs return type
// fetchUser.mockResolvedValue({ id: 1 })   → ✗ type error

// Spy on a real method, typed:
const obj = { now: () => Date.now() };
const spy = vi.spyOn(obj, "now").mockReturnValue(1000);
expect(obj.now()).toBe(1000);`],
    ['DI with an interface (preferred)', 'typescript', `interface UserRepo {
  findById(id: string): Promise<{ id: string; name: string } | null>;
}

// Code depends on the interface, not a concrete module:
class UserService {
  constructor(private repo: UserRepo) {}
  async nameOf(id: string) { return (await this.repo.findById(id))?.name ?? "?"; }
}

// Test supplies a typed fake — must satisfy UserRepo:
const fakeRepo = {
  findById: async (id) => ({ id, name: "Ada" }),
} satisfies UserRepo;

const name = await new UserService(fakeRepo).nameOf("1");  // "Ada"`],
    ['Typed module mock', 'typescript', `import { vi } from "vitest";
import * as api from "../src/api";

vi.mock("../src/api");
const mockedApi = vi.mocked(api);                 // typed view
mockedApi.getUser.mockResolvedValue({ id: "1", name: "Ada" });  // type-checked`]],
  edge: [`Casting a double with <code>as any</code> (or a loose <code>as Repo</code>) removes the check that keeps it in sync — when the real type changes, the lie compiles and the test gives false confidence. Prefer typed mocks / <code>satisfies</code>.`, `<code>Partial&lt;T&gt;</code> mocks (mock only the methods you use) are convenient but let you forget a method the code paths actually call — use deliberately and consider typed helpers.`, `Module mocking (<code>vi.mock</code>) is hoisted and global to the file; forgetting <code>vi.mocked</code> loses typing, and over-mocking couples tests to implementation.`, `A fake that drifts from the real implementation’s <i>behavior</i> (not just its types) causes tests to pass while production breaks — keep fakes faithful or test the real thing in integration tests.`, `Mocking what you don’t own (third-party internals) is brittle; wrap it behind your own typed interface and mock that.`],
  faq: [['Why not just cast a mock with <code>as any</code> or <code>as MyType</code>?', PP(`Because an unchecked cast <b>severs the link between the double and the real dependency</b>. The whole value of a typed double is that when the real interface changes — a renamed method, a new required argument, a different return type — your mock <b>fails to compile</b>, telling you the test is now out of date. <code>as any</code> (and loose assertions) make the mock compile regardless, so it silently diverges and the test passes while production is broken. Use <code>vi.fn&lt;Sig&gt;</code>, <code>vi.mocked</code>, or a <code>satisfies Interface</code> fake so the compiler keeps doubles honest.`)],
    ['What’s the best way to make code easy to mock in TypeScript?', PP(`<b>Dependency injection against an interface.</b> Instead of importing a concrete dependency directly, accept it as a constructor argument or function parameter typed by an <b>interface</b> (e.g. <code>UserRepo</code>). In tests you pass a <b>typed fake</b> that <code>satisfies</code> that interface — no module mocking, no hoisting quirks, and the compiler guarantees the fake matches the contract. This keeps your code decoupled and your doubles honest. Reserve module-level mocking (<code>vi.mock</code>/<code>jest.mock</code>) for dependencies you can’t inject (deep imports, third-party singletons).`)],
    ['When should I use a fake instead of a mock?', PP(`Use a <b>fake</b> (a small working implementation, like an in-memory repository) when the test needs the dependency to <b>behave</b> across several interactions — storing and returning data, enforcing simple rules — because a pile of per-call <code>mockReturnValue</code>s becomes brittle and hard to read. Use a <b>mock/stub</b> when you only need to <b>control a return value or assert a call happened</b>. Fakes give more realistic, less coupled tests; mocks are quicker for isolated units. Either way, type them against the real interface so they can’t drift.`)]],
  qs: [SQ('Why prefer a typed mock (vi.fn<Sig>) over casting a mock with <code>as any</code>?', ['It runs faster', 'A typed mock fails to compile when the real dependency’s signature changes, keeping the double honest', 'as any is deprecated', 'There is no difference'], 1, 'Typed doubles catch drift at compile time; as any silently diverges.'),
    SQ('What design makes code easiest to substitute dependencies in tests?', ['Importing dependencies directly everywhere', 'Injecting dependencies typed by an interface, so tests pass a typed fake that satisfies it', 'Casting everything to any', 'Avoiding interfaces'], 1, 'DI against an interface lets tests supply a typed, contract-conforming fake.')]
});
DP('ts-mocking', {
  fu: [['What is vitest-mock-extended / jest-mock-extended?', 'Libraries that generate a deeply-typed mock of an entire interface (mock<UserRepo>()), so every method is a typed mock automatically and new interface methods are covered. Useful when injecting a full interface is impractical to hand-fake.'],
    ['How do I mock timers, dates, or fetch with types?', 'Use the runner’s fake timers (vi.useFakeTimers), spy on Date, and type network mocks via a typed wrapper or tools like msw (which types handlers against your API). Keep these behind injected interfaces when possible.'],
    ['Is heavy mocking a smell?', 'Often. Excessive mocking couples tests to implementation and can mask real integration bugs. Prefer DI + fakes for collaborators and reserve mocks for true boundaries (network, time); cover real wiring with a few integration tests.']],
  deep: [['Technique', 'Inject dependencies via interfaces and supply satisfies-typed fakes; use vi.fn<Sig>/vi.mocked for function/module mocks; keep every double conformant so refactors break tests loudly.'],
    ['Failure mode', 'as any / loose-cast doubles that drift, Partial mocks missing called methods, and over-mocking that tests the mocks rather than the code.'],
    ['In real code', 'Well-structured TS codebases lean on DI + interfaces (easy, honest fakes) and use typed module mocks sparingly; msw handles network, fake timers handle time.']],
  src: ['Vitest: Mocking', 'https://vitest.dev/guide/mocking'] });

TST('ts-app-test', { name: 'Testing frontend & backend with types', cat: 'tstest',
  blurb: `Putting it together: how typed testing works for a React frontend (component tests with Testing Library) and a Node backend (API/integration tests), and how shared schemas make test fixtures type-safe on both ends. This is where the full-stack type safety story closes the loop.`,
  facts: [['Frontend', 'Testing Library + jsdom, typed queries'], ['Backend', 'supertest/fetch against the app, typed'], ['Fixtures', 'build from shared schemas → typed'], ['Pyramid', 'many unit, some integration, few e2e']],
  cheat: [['@testing-library/react', 'Render & query components, typed'], ['jsdom / happy-dom', 'DOM environment for component tests'], ['userEvent', 'Typed user interactions'], ['supertest', 'HTTP assertions against a Node app'], ['Typed fixtures', 'z.infer types + factory functions'], ['Integration test', 'Real wiring, mocked boundaries'], ['Playwright', 'Typed end-to-end browser tests'], ['Test the contract', 'Validate responses against schemas'], ['Factory functions', 'makeUser(overrides): User'], ['Pyramid', 'Lots of fast unit tests, few slow e2e']],
  sections: [
    ['Frontend: typed component tests', PP(`With <b>Testing Library</b> (plus a DOM env like <code>jsdom</code>), you render components and interact as a user would. In TypeScript, props you pass are <b>type-checked against the component</b>, query results and <code>userEvent</code> interactions are typed, and fixtures built from shared types can’t be malformed. Test behavior (what the user sees/does), not implementation details — typing makes the fixtures and props safe, Testing Library keeps the tests user-centric.`)],
    ['Backend: typed API/integration tests', PP(`On the server, <b>integration tests</b> exercise the real route wiring (often with boundaries like the DB mocked or run in-memory) and assert on responses. <code>supertest</code> (or a typed fetch) drives requests; you then <b>validate responses against the shared schema</b> — so the test checks not just status codes but that the payload matches the contract. Request bodies in tests are typed by the same schema, so fixtures stay correct.`)],
    ['Shared schemas close the loop', PP(`The payoff of full-stack TypeScript shows up in tests: <b>fixtures and factories built from shared <code>z.infer</code> types are type-safe on both ends</b>, and validating responses with the same schema means a contract change breaks the test. Combine a healthy <b>test pyramid</b> — many fast typed unit tests, a layer of integration tests, a few end-to-end (Playwright) — with the compiler as an always-on first line of defense.`)]
  ],
  snipTitle: 'Full-stack typed tests', snipNote: 'Component test, API integration test, shared-schema fixtures.',
  snips: [['Frontend component test', 'typescript', `import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBox } from "../src/SearchBox";

it("calls onSearch with typed input", async () => {
  const onSearch = vi.fn<(q: string) => void>();   // typed mock
  render(<SearchBox onSearch={onSearch} />);        // props type-checked
  await userEvent.type(screen.getByRole("textbox"), "ada");
  expect(onSearch).toHaveBeenLastCalledWith("ada");
});`],
    ['Backend integration test', 'typescript', `import request from "supertest";
import { app } from "../src/app";
import { User } from "../shared/user";   // shared Zod schema

it("POST /users creates and returns a valid User", async () => {
  const res = await request(app)
    .post("/users")
    .send({ name: "Ada", email: "ada@x.com" });   // body typed by schema elsewhere
  expect(res.status).toBe(201);
  const user = User.parse(res.body);               // validate the CONTRACT
  expect(user.name).toBe("Ada");
});`],
    ['Typed fixtures / factory', 'typescript', `import { type User } from "../shared/user";

// A factory keeps fixtures type-safe and DRY:
function makeUser(overrides: Partial<User> = {}): User {
  return { id: "u1", name: "Ada", email: "ada@x.com", ...overrides };
}
const admin = makeUser({ name: "Admin" });   // fully typed, overridable`]],
  edge: [`Component tests need a DOM environment (<code>jsdom</code>/<code>happy-dom</code>) — without it, <code>document</code> is undefined and renders fail.`, `Testing implementation details (internal state, exact DOM structure) makes tests brittle; assert on <b>user-visible behavior</b> and use role/text queries.`, `Validating a response’s <b>status</b> but not its <b>body shape</b> misses contract regressions — parse the body with the shared schema.`, `Factories with a <code>Partial&lt;T&gt;</code> override are convenient but can hide required-field changes; keep the base fixture complete so new required fields surface as type errors.`, `End-to-end tests are slow and flaky if overused — keep them few and focused (the pyramid), leaning on typed unit/integration tests and the compiler for the bulk of coverage.`],
  faq: [['How does TypeScript help a React component test specifically?', PP(`It makes the test <b>harder to get wrong</b>: the <b>props you pass when rendering are checked against the component’s prop type</b>, so a renamed or mis-typed prop is a compile error in the test; typed mocks (<code>vi.fn&lt;(q: string) =&gt; void&gt;</code>) ensure your assertions match the real handler signature; and fixtures built from shared types can’t be malformed. Testing Library still keeps the <i>style</i> of the test user-centric (query by role/text, interact via <code>userEvent</code>) — TypeScript’s role is to keep the <b>inputs and doubles</b> aligned with the real component so the test fails for real reasons, not setup typos.`)],
    ['What should a backend integration test actually assert?', PP(`Both the <b>status</b> and the <b>shape of the response</b>. Driving the real app with <code>supertest</code> (or fetch) and checking <code>res.status === 201</code> is necessary but insufficient — the body could still be wrong. <b>Parse the response with the shared schema</b> (<code>User.parse(res.body)</code>): now the test verifies the payload matches the <b>contract</b> the client depends on, and a drift in the response shape fails the test. Since the request body is typed by the same schema, your fixtures stay correct too — the whole request→response path is checked against one source of truth.`)],
    ['How do shared schemas make test fixtures safer?', PP(`When your request/response types come from a <b>shared schema</b> (<code>z.infer</code>), you can build <b>factory functions</b> (<code>makeUser(overrides): User</code>) whose output is the real, typed shape — so a fixture can’t omit a required field or use a wrong type without a compile error, and overrides are type-checked. The <i>same</i> schema validates responses in the test, so fixtures and assertions both track the contract. When the contract changes, the compiler flags every fixture and the response <code>parse</code> catches runtime drift — closing the loop between frontend, backend, and their tests.`)]],
  qs: [SQ('In a backend integration test, what’s the best way to catch a response-shape regression?', ['Check only the HTTP status code', 'Parse the response body with the shared schema to validate the contract', 'Cast res.body as any', 'Snapshot the entire server'], 1, 'Validating the body against the shared schema catches contract drift, not just status.'),
    SQ('How does TypeScript most directly help a React component test?', ['It renders faster', 'The props passed when rendering are type-checked against the component, catching setup mistakes', 'It removes the need for a DOM environment', 'It auto-generates assertions'], 1, 'Typed props/fixtures/mocks keep test inputs aligned with the real component.')]
});
DP('ts-app-test', {
  fu: [['Where does Playwright fit, and is it typed?', 'Playwright is a typed end-to-end browser testing tool (TS-first) for real user flows across the full app. Use it sparingly at the top of the pyramid; rely on typed unit/integration tests for the bulk, since e2e is slower and flakier.'],
    ['How do I keep fixtures DRY and typed?', 'Use factory functions returning the shared type with Partial overrides (makeUser(overrides): User), or a fixtures library. Keep the base complete so new required fields break fixtures at compile time.'],
    ['Should I mock the database in integration tests?', 'Depends on the layer: use an in-memory or test database for realistic integration, or mock the repository interface for faster, focused tests. Validate responses against shared schemas either way so the contract is covered.']],
  deep: [['Technique', 'Type test inputs with shared schemas and factories, test behavior (Testing Library, supertest), validate responses against the contract, and shape coverage as a pyramid with the compiler as the first gate.'],
    ['Failure mode', 'Asserting status but not body shape, testing implementation details, overusing flaky e2e, or fixtures that hide required-field changes.'],
    ['In real code', 'Full-stack TS teams share Zod schemas across client, server, and tests; CI runs typecheck + unit + integration + a thin e2e layer, making contract drift a compile or test failure.']],
  src: ['Testing Library docs', 'https://testing-library.com/docs/'] });

TST('ts-ci', { name: 'Quality gates: putting type safety into CI', cat: 'tstest',
  blurb: `A type system only prevents bugs if broken types can't be merged. This final topic assembles the pieces — type-checking, linting, tests, and formatting — into continuous-integration gates, and covers the practices (strict tsc, no-any policies, pre-commit hooks) that keep a TypeScript codebase healthy over time.`,
  facts: [['Gate', 'tsc --noEmit must pass to merge'], ['Lint', 'typescript-eslint, incl. type-aware rules'], ['Tests', 'unit + integration + type tests'], ['Local', 'pre-commit hooks catch issues early']],
  cheat: [['tsc --noEmit', 'The non-negotiable type gate'], ['eslint .', 'Bug patterns + type-aware rules'], ['prettier --check', 'Formatting gate'], ['vitest run', 'Tests (+ --typecheck for type tests)'], ['Run in parallel', 'typecheck / lint / test as jobs'], ['Pre-commit (husky + lint-staged)', 'Catch issues before push'], ['no-explicit-any', 'Policy to keep any out'], ['Cache', 'tsc incremental, action caches for speed'], ['Required checks', 'Block merge on red'], ['Pin TS version', 'Consistent editor/CI results']],
  sections: [
    ['The gates that matter', PP(`A healthy TypeScript project treats four things as <b>required checks</b> that block a merge: <b><code>tsc --noEmit</code></b> (type correctness — the one that makes types actually enforced), <b><code>eslint</code></b> (bug patterns and type-aware rules), <b>tests</b> (unit/integration, plus type tests via <code>--typecheck</code>), and <b><code>prettier --check</code></b> (formatting). Run them as <b>parallel CI jobs</b> for speed, and configure the repository so a red check <b>prevents merging</b> — otherwise type safety is optional, which means it erodes.`)],
    ['Catch it earlier: local hooks', PP(`CI is the backstop, but fixing issues at push time is cheaper. <b>Pre-commit hooks</b> (e.g. <code>husky</code> + <code>lint-staged</code>) run lint/format (and optionally a quick typecheck) on changed files before a commit lands, so obvious problems never reach CI. Keep hooks <b>fast</b> (staged files only) so they don’t slow the inner loop; leave the full, slower <code>tsc</code>/test run to CI.`)],
    ['Policies that keep types honest', PP(`Over time, discipline matters: enforce <b>strict mode</b> (and extras like <code>noUncheckedIndexedAccess</code>), adopt a <b>no-<code>any</code> policy</b> via <code>@typescript-eslint/no-explicit-any</code> and <code>no-unsafe-*</code> rules, and drive <code>@ts-expect-error</code> suppressions toward zero. <b>Pin the TypeScript version</b> so the editor and CI agree, and use <code>tsc</code> <b>incremental</b>/build caches to keep the gate fast as the codebase grows. These habits are what keep a large TS codebase from quietly rotting back toward untyped JavaScript.`)]
  ],
  snipTitle: 'CI gates & hooks', snipNote: 'A CI workflow and a pre-commit hook.',
  snips: [['GitHub Actions: parallel gates', 'json', `# .github/workflows/ci.yml (abridged)
# jobs run in parallel; all must pass to merge
#
# typecheck:  npm ci  →  npx tsc --noEmit
# lint:       npm ci  →  npx eslint .
# format:     npm ci  →  npx prettier --check .
# test:       npm ci  →  npx vitest run --coverage
#
# Branch protection: mark typecheck/lint/test as REQUIRED status checks.`],
    ['package.json: one command for all gates', 'json', `{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "verify": "npm run typecheck && npm run lint && npm run format:check && npm test"
  }
}`],
    ['Pre-commit hook (husky + lint-staged)', 'json', `// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
// .husky/pre-commit  →  npx lint-staged
// (fast, staged-only; full tsc --noEmit + tests run in CI)`]],
  edge: [`If broken types can still be merged, the type system is <b>advisory, not enforced</b> — make <code>tsc --noEmit</code> a <i>required</i> status check.`, `Fast transpilers/builders passing is <b>not</b> a type gate — CI must run <code>tsc</code> explicitly (a successful build can hide type errors).`, `Pre-commit hooks that run the full typecheck/tests on every commit become painful and get bypassed (<code>--no-verify</code>); keep hooks to staged lint/format and leave heavy checks to CI.`, `Editor-green but CI-red usually means a <b>TypeScript version mismatch</b> or differing config — pin <code>typescript</code> and share <code>tsconfig</code>.`, `Letting <code>any</code> and <code>@ts-expect-error</code> accumulate silently defeats strictness; enforce lint policies and track suppression counts.`],
  faq: [['What’s the single most important CI gate for a TypeScript project?', PP(`<b><code>tsc --noEmit</code> as a required check.</b> It’s what turns the type system from "nice editor feedback" into an <b>enforced guarantee</b> — if type-broken code can’t merge, types stay correct across the whole team over time. Everything else (lint, tests, formatting) is valuable, but type-checking is the gate unique to TypeScript, and it’s frequently missing because people assume a successful <i>build</i> implies correct types (it doesn’t — fast transpilers skip checking). Add it as a required status check, run it in CI on every PR, and treat a red typecheck as a hard block.`)],
    ['Why run checks in CI if my editor already shows errors?', PP(`Because the editor only reflects <b>one developer’s machine and settings</b> at one moment — it can use a different TypeScript version, a stale cache, or skip files not currently open, and it can’t stop a teammate from committing something broken. CI runs the <b>same checks, the same way, on every change</b>, and (with branch protection) <b>blocks the merge</b> when they fail. The editor is the fast inner loop; CI is the shared source of truth that enforces the standard for everyone. Pin the TypeScript version so the two agree.`)],
    ['How do I keep a TypeScript codebase from degrading over time?', PP(`Combine <b>enforced gates</b> with <b>policies</b>. Keep <code>strict</code> on (plus <code>noUncheckedIndexedAccess</code>), require <code>tsc --noEmit</code> + lint + tests to merge, and adopt a <b>no-<code>any</code> policy</b> via <code>@typescript-eslint/no-explicit-any</code> and the <code>no-unsafe-*</code> rules so untyped escapes are flagged. Track and drive down <code>@ts-expect-error</code> suppressions, add type-level tests around critical generics/APIs, and use pre-commit hooks to catch issues early. Pin the compiler version and cache incremental builds so the gates stay fast. Together these stop the slow drift back toward effectively-untyped JavaScript.`)]],
  qs: [SQ('What makes TypeScript’s type checking actually enforced across a team?', ['Everyone using the same editor', 'Making tsc --noEmit a required CI check that blocks merging broken types', 'Turning off strict mode', 'Running prettier'], 1, 'A required type-check gate is what turns types from advisory into enforced.'),
    SQ('A successful Vite/esbuild build in CI means your types are checked. True?', ['True', 'False — fast transpilers skip type-checking; CI must run tsc --noEmit explicitly', 'True only in production', 'True if strict is on'], 1, 'Build success ≠ type correctness; add an explicit tsc gate.')]
});
DP('ts-ci', {
  fu: [['How do I make the type-check gate fast on a big repo?', 'Use tsc incremental builds and project references (cache per package), run CI jobs in parallel, cache node_modules/.tsbuildinfo between runs, and lint only changed files locally. Keep the full typecheck in CI where caching absorbs the cost.'],
    ['Should pre-commit run tests and tsc?', 'Usually no — keep hooks to staged-file lint/format so they stay fast and aren’t bypassed. Run full tsc --noEmit and the test suite in CI, which is the authoritative gate.'],
    ['How do I enforce a no-any policy pragmatically?', 'Enable @typescript-eslint/no-explicit-any and the no-unsafe-* rules (as warnings first, then errors), allow narrowly-scoped, commented exceptions, and track @ts-expect-error counts so suppressions trend to zero rather than accumulating.']],
  deep: [['Technique', 'Make tsc --noEmit + lint + tests required merge checks, run them as parallel CI jobs, add fast staged pre-commit hooks, pin the TS version, and enforce strictness + no-any policies with lint.'],
    ['Failure mode', 'Relying on build success as a type gate, letting any/@ts-expect-error pile up, or editor-vs-CI version drift. Each quietly erodes safety.'],
    ['In real code', 'Mature repos gate PRs on typecheck/lint/test with branch protection, cache incremental builds for speed, and treat a clean tsc as non-negotiable — the practice that keeps large TS codebases trustworthy.']],
  src: ['typescript-eslint: Linting + CI', 'https://typescript-eslint.io/getting-started/'] });
