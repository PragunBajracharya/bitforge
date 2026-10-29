/* ===== TypeScript C: frontend & backend ===== */

/* ---------------- Level 5: frontend & backend ---------------- */

TST('ts-dom', { name: 'TypeScript in the browser: typing the DOM & events', cat: 'tsapp',
  blurb: `On the frontend, TypeScript's lib.dom types describe every element, event and API — but they're deliberately cautious, because the DOM is full of things that might be null. This covers typing element lookups, narrowing to concrete element types, typing event handlers, and handling the nullability the DOM forces on you.`,
  facts: [['lib', 'add "DOM" to lib for browser types'], ['Lookups', 'querySelector returns Element | null'], ['Narrowing', 'cast/guard to the concrete element'], ['Events', 'typed Event targets need care']],
  cheat: [['"lib": ["DOM"]', 'Enable browser type definitions'], ['getElementById', 'Returns HTMLElement | null'], ['querySelector<T>', 'Generic-hint the element type'], ['e: MouseEvent', 'Typed DOM events'], ['e.target vs e.currentTarget', 'target is EventTarget | null'], ['instanceof HTMLInputElement', 'Narrow a target to read .value'], ['el as HTMLCanvasElement', 'Assert a concrete subtype (when sure)'], ['addEventListener', 'Infers the event type from the name'], ['HTMLElement subtypes', 'Input/Button/Canvas… each add members'], ['null checks', 'The DOM forces honest null handling']],
  sections: [
    ['Everything might be null', PP(`DOM lookups are typed <b>pessimistically</b> because they really can fail: <code>document.getElementById</code> returns <code>HTMLElement | null</code> and <code>querySelector</code> returns <code>Element | null</code>. Under <code>strictNullChecks</code> this forces you to <b>handle the missing case</b> before using the element — annoying at first, but it prevents the classic "cannot read property of null" crash when markup changes. Narrow with a check (or an <code>assertIsDefined</code>) rather than reflexively using <code>!</code>.`)],
    ['Narrowing to concrete element types', PP(`<code>querySelector</code> gives you a generic <code>Element</code>/<code>HTMLElement</code>, which lacks element-specific members like <code>.value</code> or <code>.getContext</code>. You get those by <b>narrowing to the concrete subtype</b>: pass a type hint (<code>querySelector&lt;HTMLInputElement&gt;("#email")</code>), check with <code>instanceof HTMLInputElement</code>, or assert <code>as HTMLCanvasElement</code> when you’re certain. Prefer <code>instanceof</code> guards for runtime safety; use assertions only when the type is guaranteed.`)],
    ['Typing events and their targets', PP(`Event handlers receive typed events (<code>MouseEvent</code>, <code>KeyboardEvent</code>, <code>SubmitEvent</code>…), and <code>addEventListener</code> <b>infers</b> the right event type from the event name. The sharp edge is <code>event.target</code>, typed as <code>EventTarget | null</code> — to read an input’s <code>value</code> you must narrow it (<code>e.target instanceof HTMLInputElement</code>). <code>currentTarget</code> is typed more precisely when you attach the listener to a known element.`)]
  ],
  snipTitle: 'Typed DOM code', snipNote: 'Lookups, narrowing, and event handlers.',
  snips: [['Lookups & narrowing', 'typescript', `// getElementById is HTMLElement | null — handle the null:
const canvas = document.getElementById("c");
if (!(canvas instanceof HTMLCanvasElement)) throw new Error("no canvas");
const ctx = canvas.getContext("2d");   // ✓ canvas narrowed → has getContext

// querySelector with a type hint:
const email = document.querySelector<HTMLInputElement>("#email");
if (email) console.log(email.value);   // ✓ narrowed away null`],
    ['Typed events', 'typescript', `const btn = document.querySelector("button");
btn?.addEventListener("click", (e: MouseEvent) => {
  console.log(e.clientX, e.clientY);   // MouseEvent members available
});

// e.target is EventTarget | null — narrow it to read .value:
function onInput(e: Event) {
  const target = e.target;
  if (target instanceof HTMLInputElement) {
    console.log(target.value);          // ✓ safe
  }
}`],
    ['A small typed helper', 'typescript', `// Reusable "must exist" query helper:
function must<T extends Element>(sel: string, root: ParentNode = document): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(\`Missing element: \${sel}\`);
  return el;
}
const input = must<HTMLInputElement>("#email");
input.value = "a@b.com";               // ✓ typed, non-null`]],
  edge: [`<code>e.target</code> is <code>EventTarget | null</code> and is <b>not</b> automatically the element you attached to — narrow it (<code>instanceof</code>) before reading element properties; <code>e.currentTarget</code> is the bound element.`, `<code>querySelector&lt;T&gt;</code>’s type hint is <b>unchecked</b> — TypeScript trusts your <code>T</code>; a wrong selector/type pair compiles but can fail at runtime. Prefer <code>instanceof</code> for safety.`, `Using <code>!</code> on DOM lookups removes the null type but not the runtime risk — if the element is missing you crash later.`, `You must include <code>"DOM"</code> (and often <code>"DOM.Iterable"</code>) in <code>lib</code>, or browser globals/types won’t exist; pure Node projects should omit it.`, `Some APIs return union/optional types (<code>getContext</code> can return <code>null</code>); don’t assume success.`],
  faq: [['Why does <code>getElementById</code> return <code>HTMLElement | null</code> — can I just use <code>!</code>?', PP(`It returns <code>| null</code> because the element genuinely might not exist (typo in the id, markup changed, script ran before the DOM was ready). The <code>!</code> operator <i>removes</i> the null from the type but does <b>nothing at runtime</b>, so if the element is actually missing you still crash — just later and with a worse stack trace. Prefer a real check (<code>if (el) …</code>), an <code>instanceof</code> guard (which also narrows to the concrete type), or a small <code>must()</code> helper that throws a clear error. Reserve <code>!</code> for cases where the element is provably present.`)],
    ['How do I get element-specific properties like <code>.value</code> or <code>.getContext</code>?', PP(`<code>querySelector</code> returns a generic <code>Element</code>/<code>HTMLElement</code> that doesn’t declare input- or canvas-specific members. Narrow to the <b>concrete subtype</b>: give a type hint (<code>querySelector&lt;HTMLInputElement&gt;(…)</code>), use an <code>instanceof HTMLInputElement</code> guard (safest — it checks at runtime), or assert <code>as HTMLCanvasElement</code> when you’re certain of the markup. After narrowing, the subtype’s members (<code>value</code>, <code>getContext</code>, <code>checked</code>, …) are available and type-checked.`)],
    ['Do I need to type event handler parameters?', PP(`Usually not when using <code>addEventListener</code>: it <b>infers</b> the event type from the event name (<code>"click"</code> → <code>MouseEvent</code>, <code>"keydown"</code> → <code>KeyboardEvent</code>, <code>"submit"</code> → <code>SubmitEvent</code>), so the callback parameter is already correctly typed. You only annotate explicitly for standalone handler functions defined apart from the listener. The common gotcha isn’t the event itself but <code>event.target</code>, which is <code>EventTarget | null</code> and must be narrowed before you read element properties from it.`)]],
  qs: [SQ('Why does <code>document.getElementById</code> return <code>HTMLElement | null</code>?', ['A TypeScript bug', 'The element may genuinely not exist, so you must handle the missing case', 'To force you to use any', 'Because of the DOM lib version'], 1, 'Lookups can fail; the null type forces honest handling under strictNullChecks.'),
    SQ('To safely read <code>.value</code> from <code>e.target</code> in an input handler, you should…', ['Use e.target.value directly', 'Narrow with e.target instanceof HTMLInputElement first', 'Cast with as any', 'Use e.currentTarget.value without checks'], 1, 'e.target is EventTarget | null; an instanceof guard narrows it safely.')]
});
DP('ts-dom', {
  fu: [['What is the difference between Element, HTMLElement, and specific types like HTMLInputElement?', 'They form a hierarchy: Element (any element, incl. SVG) → HTMLElement (HTML elements, adds style/dataset) → HTMLInputElement/HTMLCanvasElement/etc. (add element-specific members like value or getContext). Narrow down the chain to access specific features.'],
    ['How do I type a custom event or CustomEvent detail?', 'Use CustomEvent<DetailType> and, for listeners, either a typed wrapper or declaration-merge the element’s event map. Libraries/frameworks often provide typed event APIs so you rarely hand-roll this.'],
    ['Why include DOM.Iterable in lib?', 'It adds iterator types for DOM collections (NodeList, HTMLCollection) so for...of and spread work with correct types. Without it, iterating a NodeList can error or lose typing.']],
  deep: [['Technique', 'Treat DOM lookups as fallible: narrow with instanceof (runtime-safe) or a throwing must() helper rather than !. Let addEventListener infer event types, and narrow event.target before use.'],
    ['Failure mode', 'Reflexive ! on lookups and unchecked querySelector<T> hints — both compile but crash when markup drifts. instanceof guards prevent this.'],
    ['In real code', 'Framework code (React/Vue) abstracts most raw DOM typing, but typed DOM skills matter for vanilla widgets, canvas/WebGL, web components, and library authoring.']],
  src: ['TypeScript Handbook: DOM Manipulation', 'https://www.typescriptlang.org/docs/handbook/dom-manipulation.html'] });

TST('ts-react', { name: 'TypeScript with React: props, hooks & events', cat: 'tsapp',
  blurb: `React and TypeScript are the dominant frontend pairing. This covers typing component props and children, the hooks (useState, useRef, useReducer, useContext), typing event handlers in JSX, generic components, and the patterns that keep a component tree fully type-safe.`,
  facts: [['Props', 'type/interface for the props object'], ['Hooks', 'useState<T>, useRef<T>, useReducer'], ['Events', 'React.ChangeEvent<HTMLInputElement> etc.'], ['Children', 'React.ReactNode']],
  cheat: [['type Props = { … }', 'Type a component’s props'], ['React.ReactNode', 'Type for children / renderable content'], ['useState&lt;T&gt;(init)', 'Type state when it can’t be inferred'], ['useRef&lt;T&gt;(null)', 'DOM ref (T | null) or mutable box'], ['useReducer', 'Typed state + discriminated-union actions'], ['React.ChangeEvent&lt;T&gt;', 'Typed form/input events'], ['React.FormEvent', 'Submit handler event'], ['PropsWithChildren&lt;P&gt;', 'Add children to props'], ['ComponentProps&lt;"button"&gt;', 'Reuse built-in element prop types'], ['Generic component', '&lt;T,&gt;(props: Props&lt;T&gt;)']],
  sections: [
    ['Typing props and children', PP(`Declare a <b>props type</b> (a <code>type</code> or <code>interface</code>) and annotate the component’s parameter with it. For components that render passed content, type <code>children</code> as <code>React.ReactNode</code> (the broadest renderable type) or use the <code>PropsWithChildren</code> helper. You can also <b>reuse built-in element props</b> with <code>ComponentProps&lt;"button"&gt;</code> to build wrappers that accept all native attributes plus your own.`)],
    ['Typing hooks', PP(`<code>useState</code> usually <b>infers</b> from the initial value; supply a type argument when it can’t (<code>useState&lt;User | null&gt;(null)</code>). <code>useRef&lt;HTMLInputElement&gt;(null)</code> types a DOM ref as <code>T | null</code>, so you null-check before use. <code>useReducer</code> shines with a <b>discriminated-union action type</b>, giving exhaustive, type-safe reducers. <code>useContext</code> returns your context’s type — design the default so consumers don’t get <code>undefined</code> surprises.`)],
    ['Events and generic components', PP(`React wraps DOM events in <b>synthetic event</b> types: <code>React.ChangeEvent&lt;HTMLInputElement&gt;</code> for inputs, <code>React.FormEvent</code> for submits, <code>React.MouseEvent</code> for clicks. In JSX, inline handlers are inferred; standalone handlers you annotate. For reusable components over a data type (a <code>List&lt;T&gt;</code>, a typed <code>Select&lt;T&gt;</code>), write a <b>generic component</b> — in <code>.tsx</code> use <code>&lt;T,&gt;</code> to avoid the JSX ambiguity.`)]
  ],
  snipTitle: 'Typed React', snipNote: 'Props, hooks, events, and a generic component.',
  snips: [['Props & children', 'typescript', `import { type ReactNode } from "react";

type CardProps = {
  title: string;
  onClose?: () => void;     // optional callback
  children: ReactNode;      // renderable content
};

function Card({ title, onClose, children }: CardProps) {
  return (
    <section>
      <header>{title} {onClose && <button onClick={onClose}>×</button>}</header>
      {children}
    </section>
  );
}`],
    ['Hooks', 'typescript', `import { useState, useRef, useReducer } from "react";

const [user, setUser] = useState<User | null>(null);   // can't infer null→User
const inputRef = useRef<HTMLInputElement>(null);        // ref: T | null

// useReducer with a discriminated-union action — exhaustive & safe:
type Action = { type: "inc" } | { type: "add"; by: number } | { type: "reset" };
function reducer(count: number, a: Action): number {
  switch (a.type) {
    case "inc":   return count + 1;
    case "add":   return count + a.by;
    case "reset": return 0;
  }
}
const [count, dispatch] = useReducer(reducer, 0);`],
    ['Events & generic component', 'typescript', `function SearchBox({ onSearch }: { onSearch: (q: string) => void }) {
  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    onSearch(e.target.value);         // e.target is correctly typed
  }
  return <input onChange={handle} />;
}

// Generic, reusable List — note <T,> in .tsx:
function List<T,>({ items, render }: { items: T[]; render: (item: T) => React.ReactNode }) {
  return <ul>{items.map((it, i) => <li key={i}>{render(it)}</li>)}</ul>;
}
<List items={[1, 2, 3]} render={(n) => n.toFixed(0)} />;   // T = number`]],
  edge: [`In <code>.tsx</code>, a lone arrow generic <code>&lt;T&gt;</code> is parsed as a JSX tag — write <code>&lt;T,&gt;</code> or <code>&lt;T extends unknown&gt;</code> to disambiguate.`, `<code>useRef&lt;T&gt;(null)</code> yields <code>RefObject&lt;T&gt;</code> with <code>current: T | null</code> — always null-check before using the DOM node.`, `Avoid <code>React.FC</code> for typing components in modern code — it adds an implicit <code>children</code> and complicates generics; type props directly instead.`, `<code>useState</code> infers from the initializer, so <code>useState(null)</code> infers <code>null</code> only — pass a type argument when the eventual value differs.`, `Context typed as <code>T | undefined</code> forces consumers to null-check; provide a sensible default or a custom hook that throws if used outside the provider.`],
  faq: [['Should I use <code>React.FC</code> to type my components?', PP(`Modern guidance is generally <b>no</b> — type the <b>props object directly</b> (<code>function Card(props: CardProps)</code>) instead. <code>React.FC</code> historically forced an implicit <code>children</code> prop (even for components that don’t accept children), interacts awkwardly with <b>generic components</b>, and complicates <code>defaultProps</code>. Typing props directly is clearer, works cleanly with generics, and lets you opt into <code>children</code> explicitly (via <code>React.ReactNode</code> or <code>PropsWithChildren</code>) only when you actually render it.`)],
    ['When do I need to pass a type argument to <code>useState</code>?', PP(`When the <b>initial value doesn’t represent the full type</b> the state can hold. <code>useState(0)</code> infers <code>number</code> fine, but <code>useState(null)</code> infers only <code>null</code> — if the state will later hold a <code>User</code>, you must write <code>useState&lt;User | null&gt;(null)</code>. Same for empty arrays/objects whose element type can’t be inferred (<code>useState&lt;Todo[]&gt;([])</code>). When the initializer already pins the type, let inference do the work.`)],
    ['How do I type a reusable component that works over any data type?', PP(`Make it a <b>generic component</b>: parameterize the props with a type variable and thread it through — e.g. <code>function List&lt;T,&gt;(props: { items: T[]; render: (x: T) =&gt; React.ReactNode })</code>. At the call site TypeScript <b>infers</b> <code>T</code> from the <code>items</code> you pass, so <code>render</code> receives the correct element type. The one gotcha is syntax: in <code>.tsx</code> a bare <code>&lt;T&gt;</code> looks like JSX, so write <code>&lt;T,&gt;</code> (trailing comma) or <code>&lt;T extends unknown&gt;</code> to tell the parser it’s a type parameter.`)]],
  qs: [SQ('In a <code>.tsx</code> file, how do you write a generic arrow/function component’s type parameter to avoid JSX ambiguity?', ['<T>', '<T,> (trailing comma) or <T extends unknown>', '{T}', 'generic T'], 1, 'A bare <T> parses as JSX; <T,> or <T extends unknown> disambiguates.'),
    SQ('Why pass a type argument in <code>useState<User | null>(null)</code>?', ['It is required for all useState calls', 'The initializer null would otherwise infer only null, not the eventual User', 'To make it run faster', 'To disable strict mode'], 1, 'Inference from null alone can’t know the state will later hold a User.')]
});
DP('ts-react', {
  fu: [['How do I type props that extend a native element?', 'Use ComponentProps<"button"> (or ComponentPropsWithoutRef) intersected with your own props, so your wrapper accepts all native attributes plus extras. This is the idiomatic way to build typed design-system components.'],
    ['What’s the best way to type context so consumers aren’t stuck with undefined?', 'Create the context with a typed default or undefined, then expose a custom hook (useTheme) that reads it and throws if it’s undefined — consumers get a non-null type and a clear error if used outside the provider.'],
    ['Do Next.js/server components change the typing story?', 'The core typing (props, hooks, events) is the same; server components add typed async components and server/client boundaries. Data-fetching types benefit hugely from end-to-end schemas (e.g. shared Zod types or tRPC) across the server/client split.']],
  deep: [['Technique', 'Type props directly (not React.FC), let useState/handlers infer where possible, model useReducer actions as discriminated unions, and reuse native prop types via ComponentProps for wrappers.'],
    ['Failure mode', 'React.FC + generics friction, forgetting the <T,> comma in .tsx, and unchecked ref.current access. Each has a clean idiom.'],
    ['In real code', 'The React+TS stack pairs with shared boundary schemas (Zod/tRPC) so API data is typed end to end; component libraries lean on ComponentProps and generic components heavily.']],
  src: ['React + TypeScript Cheatsheet', 'https://react-typescript-cheatsheet.netlify.app/'] });

TST('ts-node', { name: 'TypeScript on the backend: Node runtime & setup', cat: 'tsapp',
  blurb: `On the server, TypeScript runs on Node (or Deno/Bun) and needs different configuration than the browser: Node types instead of DOM, decisions about ESM vs CommonJS, and a choice between running TS directly (tsx) in dev and compiling for production. This covers the runtime setup that everything else sits on.`,
  facts: [['Types', '@types/node (or built-in for Deno/Bun)'], ['lib', 'no "DOM"; use ES + Node types'], ['Run (dev)', 'tsx / ts-node / node --experimental-strip-types'], ['Build (prod)', 'tsc or a bundler → JS']],
  cheat: [['@types/node', 'Type definitions for Node’s APIs'], ['"lib": ["ES2023"]', 'No DOM on the server'], ['"module": "nodenext"', 'Match Node’s ESM/CJS rules'], ['tsx', 'Run .ts directly in dev (no checking)'], ['node --experimental-strip-types', 'Native TS stripping (recent Node)'], ['ESM vs CJS', 'package.json "type"; .mts/.cts'], ['process.env', 'string | undefined — validate it'], ['Build step', 'tsc --outDir dist, then node dist'], ['Deno / Bun', 'Run TS natively, types built-in'], ['tsconfig for Node', 'node base config + strict']],
  sections: [
    ['Server types, not browser types', PP(`Backend TypeScript needs <b>Node’s type definitions</b> (<code>@types/node</code> for the Node runtime; Deno and Bun ship their own) and should <b>omit <code>"DOM"</code></b> from <code>lib</code> — there’s no <code>window</code> or <code>document</code> on the server. Set <code>lib</code> to the ES version your runtime supports. This keeps browser-only globals from leaking into server code and gives you correct types for <code>fs</code>, <code>http</code>, <code>process</code>, Buffers and streams.`)],
    ['ESM vs CommonJS', PP(`Node supports both module systems, and mismatches are the #1 setup headache. Decide up front: <b>ESM</b> (<code>"type": "module"</code>, <code>import</code>/<code>export</code>, often explicit <code>.js</code> extensions under <code>nodenext</code>) or <b>CommonJS</b> (<code>require</code>/<code>module.exports</code>). Set <code>module</code>/<code>moduleResolution</code> to <code>"nodenext"</code> so TypeScript enforces Node’s real rules, and respect <code>package.json</code> <code>"exports"</code> when publishing.`)],
    ['Run directly in dev, compile for prod', PP(`In <b>development</b>, run TypeScript directly with <code>tsx</code> (fast, no build step) — recent Node can also strip types natively (<code>--experimental-strip-types</code>), and Deno/Bun run <code>.ts</code> out of the box. For <b>production</b>, either compile with <code>tsc</code> to a <code>dist/</code> folder and run the JS, or bundle. Remember the recurring theme: <code>tsx</code>/strippers <b>don’t type-check</b>, so run <code>tsc --noEmit</code> separately as a gate.`)]
  ],
  snipTitle: 'Node + TypeScript setup', snipNote: 'Config, scripts, and a typed server entry.',
  snips: [['tsconfig (Node, ESM)', 'json', `{
  "compilerOptions": {
    "target": "es2022",
    "lib": ["es2023"],              // no DOM on the server
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]
  }
}`],
    ['package.json', 'json', `{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "typecheck": "tsc --noEmit",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "devDependencies": { "typescript": "^5.6.0", "tsx": "^4.0.0", "@types/node": "^22.0.0" }
}`],
    ['Typed server entry', 'typescript', `import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 3000);   // env is string | undefined

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: true, url: req.url }));
});

server.listen(port, () => console.log(\`listening on \${port}\`));`]],
  edge: [`Leaving <code>"DOM"</code> in <code>lib</code> for server code lets browser-only globals (<code>window</code>, <code>localStorage</code>) type-check and then crash at runtime — omit it.`, `ESM/CJS mismatches (missing <code>"type": "module"</code>, wrong extensions under <code>nodenext</code>, <code>__dirname</code> in ESM) cause confusing runtime errors; pick one system and configure consistently.`, `<code>tsx</code> and native strippers <b>don’t type-check</b> — a server can start with type errors; keep a <code>tsc --noEmit</code> gate.`, `<code>process.env.X</code> is <code>string | undefined</code> (and strings only) — never assume presence or type; validate/coerce at startup.`, `Node’s native type-stripping has limits (no <code>enum</code>, no namespaces, no emit transforms) — know what it won’t run.`],
  faq: [['How do I run TypeScript on the server — do I have to compile first?', PP(`Not during development. Use <b><code>tsx</code></b> (or <code>ts-node</code>) to run <code>.ts</code> files directly with instant startup and watch mode; recent <b>Node</b> can strip types natively via <code>--experimental-strip-types</code>, and <b>Deno/Bun</b> execute TypeScript out of the box. For <b>production</b>, the common choices are to compile with <code>tsc</code> into a <code>dist/</code> folder and run the emitted JavaScript, or to bundle. Whichever you choose, the type <i>check</i> is a separate step (<code>tsc --noEmit</code>) because the fast runners don’t verify types.`)],
    ['What’s different about tsconfig for a Node project versus a browser project?', PP(`Two main things. First, <b><code>lib</code></b>: a server project should <b>omit <code>"DOM"</code></b> (there’s no <code>window</code>/<code>document</code>) and include only the ES libs its runtime supports, while also pulling in Node’s types via <code>@types/node</code> (and <code>"types": ["node"]</code>). Second, <b>module settings</b>: servers run on Node directly, so <code>module</code>/<code>moduleResolution</code> are typically <code>"nodenext"</code> to follow Node’s real ESM/CJS resolution — whereas browser apps usually use <code>"bundler"</code> because a bundler resolves modules for them.`)],
    ['Should I use ESM or CommonJS for a new Node + TS project?', PP(`Prefer <b>ESM</b> for new projects — it’s the standard going forward, matches browser modules, and is fully supported by Node. Set <code>"type": "module"</code>, use <code>import</code>/<code>export</code>, and configure <code>moduleResolution: "nodenext"</code> (which, for relative imports, often wants explicit <code>.js</code> extensions even in <code>.ts</code> sources). Be aware of ESM differences: no <code>__dirname</code>/<code>require</code> (use <code>import.meta.url</code> / <code>createRequire</code>), and some older CJS-only packages need interop. CommonJS remains fine for legacy codebases, but new code trends ESM.`)]],
  qs: [SQ('What should a server-side tsconfig’s <code>lib</code> typically exclude?', ['ES2023', '"DOM" (there is no window/document on the server)', 'node types', 'All libs'], 1, 'Server code has no DOM; including it lets browser globals type-check then crash.'),
    SQ('Which lets you run <code>.ts</code> files directly in development without a build step?', ['tsc --build', 'tsx (or ts-node)', 'prettier', 'eslint'], 1, 'tsx/ts-node execute TypeScript directly; tsx skips type-checking for speed.')]
});
DP('ts-node', {
  fu: [['How does Deno/Bun differ from Node for TypeScript?', 'Deno and Bun run TypeScript natively with types built in (no @types/node needed, different std libs), and Bun is notably fast. Node now also strips types natively but with restrictions. The type system is identical; the runtime/tooling and some APIs differ.'],
    ['What are .mts and .cts files?', 'Explicit module-format extensions: .mts is always ESM, .cts is always CommonJS (emitting .mjs/.cjs). They let you force a format per-file regardless of package.json "type", useful in mixed codebases.'],
    ['How do I replace __dirname in ESM?', 'Use import.meta.url with fileURLToPath: const __dirname = path.dirname(fileURLToPath(import.meta.url)). ESM has no __dirname/__filename/require by default; import.meta and createRequire fill the gaps.']],
  deep: [['Technique', 'Configure for the runtime (Node types, no DOM, nodenext modules), run with tsx in dev and compile/bundle for prod, choose ESM for new projects, and keep tsc --noEmit as a CI gate.'],
    ['Failure mode', 'ESM/CJS misconfiguration and leftover DOM lib — the two most common "works in editor, breaks at runtime" server issues.'],
    ['In real code', 'Backends standardize on ESM + tsx (dev) + tsc/bundler (prod), or adopt Bun/Deno for native TS; env validation at startup is a near-universal practice.']],
  src: ['Node.js: TypeScript support', 'https://nodejs.org/en/learn/typescript/introduction'] });

TST('ts-backend-api', { name: 'Typed APIs: requests, responses & end-to-end types', cat: 'tsapp',
  blurb: `The biggest payoff of full-stack TypeScript is sharing types between client and server so an API change is a compile error, not a production bug. This covers typing request/response shapes, validating inputs with schemas, and the patterns (shared types, OpenAPI, tRPC) that make an API end-to-end type-safe.`,
  facts: [['Goal', 'client & server agree on types at compile time'], ['Inputs', 'validate with a schema (never trust)'], ['Shared types', 'one definition imported by both sides'], ['Tools', 'tRPC, OpenAPI codegen, shared schemas']],
  cheat: [['Request/response types', 'Model the API contract explicitly'], ['z.object(...).parse(body)', 'Validate inbound requests'], ['Shared package/types', 'Client imports the same types'], ['z.infer<typeof schema>', 'One schema → type for both ends'], ['tRPC', 'Infer client types from server routers'], ['OpenAPI codegen', 'Generate a typed client from a spec'], ['Typed fetch wrapper', 'Return typed data per endpoint'], ['Discriminated result', '{ ok:true;data } | { ok:false;error }'], ['Status + body types', 'Type each status’s payload'], ['Never ship as', 'Validate responses, don’t assert them']],
  sections: [
    ['Model the contract, validate the inputs', PP(`Start by <b>typing the API contract</b> — the shape of each request body, query params, and response. Then <b>validate inbound data at the server boundary</b> with a schema (a request body is <code>unknown</code> until proven otherwise; see the runtime-validation page). Typing alone isn’t safety — <code>req.body as CreateUser</code> is a lie — so the pattern is: declare the schema, <code>parse</code> the input, and only then use the typed value.`)],
    ['Share one definition across the stack', PP(`The full-stack superpower is a <b>single source of truth</b> for types used by both client and server. Put shared types/schemas in a common module (a workspace package in a monorepo) and <b>import them on both sides</b>. Now renaming a field or changing a response shape produces <b>compile errors on the client</b> immediately — the class of "frontend and backend disagree" bugs largely disappears.`)],
    ['End-to-end type safety tools', PP(`Several approaches automate the sharing. <b>tRPC</b> infers client types directly from your server routers — no codegen, no schema duplication, fully typed calls (great for TS-on-both-ends apps). <b>OpenAPI</b> codegen generates a typed client from a spec (good when the API is language-agnostic or external). <b>GraphQL</b> codegen types queries from the schema. All share the goal: make the wire contract a <i>typed</i> thing the compiler checks, not a hand-maintained guess.`)]
  ],
  snipTitle: 'Typed API, end to end', snipNote: 'Shared schema, server validation, typed client.',
  snips: [['Shared schema (one source of truth)', 'typescript', `// shared/user.ts — imported by BOTH client and server
import { z } from "zod";

export const CreateUser = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});
export type CreateUser = z.infer<typeof CreateUser>;

export const User = CreateUser.extend({ id: z.string() });
export type User = z.infer<typeof User>;`],
    ['Server: validate then use', 'typescript', `import express from "express";
import { CreateUser, type User } from "../shared/user.js";

app.post("/users", (req, res) => {
  const parsed = CreateUser.safeParse(req.body);     // body is untrusted
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
  const user: User = { id: crypto.randomUUID(), ...parsed.data };
  res.status(201).json(user);
});`],
    ['Client: typed fetch wrapper', 'typescript', `import { User, type CreateUser } from "../shared/user.js";

async function createUser(input: CreateUser): Promise<User> {
  const res = await fetch("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),            // input is type-checked
  });
  if (!res.ok) throw new Error("request failed");
  return User.parse(await res.json());      // validate the RESPONSE too
}`]],
  edge: [`Typing a request body (<code>req.body as T</code>) does <b>not</b> validate it — always run a schema <code>parse</code>/<code>safeParse</code>; the body is genuinely <code>unknown</code>.`, `Validate <b>responses</b> on the client too when the server is external or versioned — the client’s compile-time type can diverge from what the server actually returns.`, `Shared types only catch mismatches if <b>both sides import the same definition</b>; copy-pasting types defeats the purpose and silently drifts.`, `tRPC gives end-to-end inference but couples client and server to the same TypeScript codebase — not suitable for public/polyglot APIs (use OpenAPI there).`, `Type the <b>error</b> shapes too (status codes, error bodies), not just the happy path, or callers can’t handle failures safely.`],
  faq: [['How do I make a change to my API a compile error on the frontend instead of a runtime bug?', PP(`Put the request/response <b>types (or schemas) in a shared module</b> and import them from both the server and the client, so there is <b>one definition</b>. When you rename a field or change a response shape, every client call site that relied on the old shape fails to type-check immediately — the mismatch surfaces at build time, not in production. In a monorepo this is a shared workspace package; tools like <b>tRPC</b> take it further by <i>inferring</i> the client types from the server code automatically, eliminating even the shared-schema step.`)],
    ['Do shared types mean I don’t need runtime validation?', PP(`No — they’re complementary. Shared types guarantee the <b>client and server code agree at compile time</b>, but they’re still <b>erased at runtime</b>, so actual request/response <i>data</i> can violate them (a malformed body, a stale deployment, an external caller). You still <b>validate at the boundary</b>: <code>schema.parse(req.body)</code> on the server, and ideally <code>schema.parse(response)</code> on the client for external APIs. Using a schema library lets the <i>same</i> schema serve as both the shared type (via <code>z.infer</code>) and the runtime check.`)],
    ['When should I use tRPC versus OpenAPI codegen?', PP(`Use <b>tRPC</b> when <b>both ends are TypeScript</b> and live in the same codebase/monorepo — it gives fully inferred, zero-codegen end-to-end types with the least ceremony, ideal for internal apps. Use <b>OpenAPI</b> (or GraphQL) codegen when the API must be <b>language-agnostic or public</b>: you publish a spec and <i>generate</i> a typed client from it, so non-TS consumers and external clients are supported. Rule of thumb: tRPC for tightly-coupled TS fullstack, OpenAPI for contract-first/polyglot APIs.`)]],
  qs: [SQ('What makes an API change show up as a compile error on the client?', ['Using any for responses', 'Sharing one type/schema definition imported by both client and server', 'Casting responses with as', 'Running tsc only on the server'], 1, 'A single shared definition means client call sites fail to compile when it changes.'),
    SQ('Shared types between client and server remove the need for…', ['Runtime validation of request/response data', 'Nothing — you still validate data at the boundary because types are erased', 'A database', 'HTTP status codes'], 1, 'Shared types align code at compile time, but runtime data must still be validated.')]
});
DP('ts-backend-api', {
  fu: [['How does tRPC achieve types without codegen?', 'The client imports the server router’s TYPE (not its code) and infers procedure inputs/outputs from it, so calls are fully typed and refactors propagate instantly. It works because both ends share one TS program; there’s nothing to generate.'],
    ['What about typing errors and non-200 responses?', 'Model responses as discriminated unions or per-status types, and validate error bodies too. Libraries (tRPC, ts-rest, OpenAPI clients) provide typed error channels so callers must handle failure explicitly.'],
    ['How do I keep an external REST API typed?', 'Generate a client from its OpenAPI spec (openapi-typescript, orval) so endpoints, params and responses are typed, and validate responses with the generated/zod schemas. This gives contract-first safety without controlling the server.']],
  deep: [['Technique', 'One schema per contract (z.infer for the type), validate inputs at the server boundary and external responses on the client, and share definitions via a workspace package or tRPC for end-to-end inference.'],
    ['Failure mode', 'Treating typed bodies as validated (as T), or duplicating types across client/server so they silently drift. Share one source and parse real data.'],
    ['In real code', 'TS monorepos use tRPC or shared Zod schemas; contract-first/polyglot teams use OpenAPI/GraphQL codegen. Either way the wire contract becomes compiler-checked.']],
  src: ['tRPC documentation', 'https://trpc.io/docs'] });

TST('ts-db', { name: 'Typed data access: ORMs & query builders', cat: 'tsapp',
  blurb: `Databases are another trust boundary, and modern TypeScript ORMs make queries type-safe end to end — your schema generates types, queries are checked against them, and results come back typed. This covers the landscape (Prisma, Drizzle, Kysely), how schema-to-type generation works, and the safety it buys.`,
  facts: [['Goal', 'queries & results typed from the schema'], ['Prisma', 'schema file → generated client & types'], ['Drizzle', 'schema in TS → inferred types'], ['Kysely', 'typed SQL query builder']],
  cheat: [['Schema → types', 'DB schema generates TS types'], ['Prisma', 'schema.prisma + generated client'], ['Drizzle', 'TS-defined schema, SQL-like, inferred types'], ['Kysely', 'Typed query builder over your DB types'], ['Typed results', 'Row types match selected columns'], ['Relations', 'Typed joins/includes'], ['InferSelectModel', 'Drizzle: derive a row type'], ['Migrations', 'Keep schema and DB in sync'], ['Still validate input', 'User input → schema before DB'], ['No raw any', 'Avoid untyped raw queries where possible']],
  sections: [
    ['Schema is the source of truth', PP(`Typed data layers derive your <b>row and query types from the database schema</b>. In <b>Prisma</b> you write a <code>schema.prisma</code> and generate a fully-typed client; in <b>Drizzle</b> you define the schema in TypeScript and the types are <b>inferred</b> directly; <b>Kysely</b> is a typed query builder you parameterize with your DB’s types. In all cases the schema is the single source of truth, so a column change updates the types and breaks affected queries at compile time.`)],
    ['Queries and results are checked', PP(`Because the client knows your schema, <b>queries are validated</b> (you can’t select a column that doesn’t exist, or filter by the wrong type) and <b>results are typed to match what you selected</b> — select three columns and you get a row type with exactly those three. Relations/joins are typed too, so included relations show up with the right shape. This turns a huge class of "undefined column" / "wrong field" bugs into compile errors.`)],
    ['The boundary still needs validation', PP(`Typed queries protect the <b>database side</b>, but data coming <i>into</i> your handlers (request bodies, params) is still untrusted — <b>validate it with a schema before it reaches the DB layer</b>. And raw/escape-hatch queries (<code>$queryRaw</code>, raw SQL) often return <code>any</code>/loosely-typed rows, so prefer the typed API and, when you must go raw, type and validate the result explicitly.`)]
  ],
  snipTitle: 'Typed database access', snipNote: 'Drizzle (TS schema) and Prisma (generated client).',
  snips: [['Drizzle: schema in TS → inferred types', 'typescript', `import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { type InferSelectModel } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

type User = InferSelectModel<typeof users>;   // type derived from the schema

// Query: columns and result are type-checked
const rows = await db.select({ id: users.id, name: users.name }).from(users);
// rows: { id: number; name: string }[]  — exactly the selected columns`],
    ['Prisma: generated client', 'typescript', `// schema.prisma defines the models; "prisma generate" emits a typed client.
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const user = await prisma.user.findUnique({
  where: { email: "a@b.com" },
  select: { id: true, name: true },   // result typed to these fields
});
// user: { id: number; name: string } | null

// prisma.user.create({ data: { nmae: "x" } })  → ✗ compile error (typo)`],
    ['Validate input before the DB', 'typescript', `import { CreateUser } from "../shared/user.js";   // a Zod schema

const input = CreateUser.parse(req.body);          // validate untrusted input
await prisma.user.create({ data: input });         // then persist (typed)`]],
  edge: [`Typed ORMs protect queries, not <b>inputs</b> — validate request data with a schema before it hits the database layer.`, `Raw queries (<code>$queryRaw</code>, <code>sql\`…\`</code>) frequently return <code>any</code> or require you to supply the result type manually — the safety you rely on evaporates unless you type/validate.`, `Schema and database must stay in sync via <b>migrations</b>; types generated from a schema that doesn’t match the real DB give false confidence.`, `Prisma needs a <b>codegen step</b> (<code>prisma generate</code>) — forgetting it after a schema change leaves stale types; Drizzle infers without codegen.`, `Deeply nested relation includes can produce large, hard-to-read inferred types and slower builds.`],
  faq: [['How do typed ORMs know the types of my query results?', PP(`They derive everything from your <b>schema</b>. Prisma reads a <code>schema.prisma</code> and <b>generates</b> a client whose methods are typed to your models; Drizzle defines the schema in TypeScript so the types are <b>inferred</b> directly (no codegen); Kysely is given your DB’s types and builds queries against them. Because the client knows every table and column, it types the <b>result to match exactly what you select</b> — pick three columns and the row type has those three — and rejects selecting or filtering by columns that don’t exist. The schema is the single source of truth.`)],
    ['Does a typed ORM mean I no longer need runtime validation?', PP(`It means the <b>database side</b> is type-safe — queries and results are checked against the schema. But data arriving from <b>outside</b> (request bodies, query params, uploaded files) is still untrusted and type-erased at runtime, so you must <b>validate it with a schema before passing it to the ORM</b>. The division of labor: a validator (e.g. Zod) guards the input boundary; the ORM guarantees the query/result types. Together they make the whole path — request → validation → query → typed result — safe.`)],
    ['Prisma vs Drizzle vs Kysely — how do they differ?', PP(`<b>Prisma</b> uses a dedicated schema file and a <b>generated</b> client with a high-level, ergonomic API and great DX, at the cost of a codegen step and a heavier runtime. <b>Drizzle</b> defines the schema in <b>TypeScript</b>, infers types without codegen, and stays close to SQL — lightweight and popular for edge/serverless. <b>Kysely</b> is a pure <b>typed query builder</b> (not a full ORM): you write SQL-like queries with full type checking and minimal abstraction. Choose Prisma for DX and rich features, Drizzle for lightweight SQL-close typing, Kysely when you want typed SQL without ORM conventions.`)]],
  qs: [SQ('Where do typed ORMs get the types for your query results?', ['You hand-write them', 'From your database schema (generated or inferred), matching selected columns', 'From the HTTP request', 'They are always any'], 1, 'The schema is the source of truth; results are typed to the columns you select.'),
    SQ('A typed ORM makes queries safe. What still needs runtime validation?', ['Nothing', 'Untrusted input (request bodies/params) before it reaches the DB layer', 'The database schema', 'The TypeScript compiler'], 1, 'ORMs type the query side; inbound external data must still be validated.')]
});
DP('ts-db', {
  fu: [['How do Drizzle/Prisma handle relations in types?', 'Both type relations: Prisma’s include/select produce result types with the nested relation shapes; Drizzle’s relational queries infer nested types. The result type reflects exactly which relations you fetched, so you can’t read an un-included relation.'],
    ['What is InferSelectModel / InferInsertModel in Drizzle?', 'Helpers that derive the row type (select) and the insert type (insert, with defaults/optional) from a table definition — a single source of truth for both reading and writing, mirroring the Omit-for-insert pattern.'],
    ['How do I safely use raw SQL when needed?', 'Provide an explicit result type to the raw query and validate the rows (e.g. with Zod) since raw results are not schema-checked. Keep raw queries rare and well-typed; prefer the typed builder/client for everything else.']],
  deep: [['Technique', 'Make the schema the source of truth (generated or inferred), rely on typed queries/results, validate external input before the DB, and type+validate any raw queries explicitly.'],
    ['Failure mode', 'Trusting the ORM to validate user input (it doesn’t), stale generated types after a schema change, or any-typed raw queries slipping past the type system.'],
    ['In real code', 'Prisma dominates for DX-heavy apps; Drizzle is favored in serverless/edge and SQL-first teams; Kysely suits typed-SQL purists. All pair with boundary validation for end-to-end safety.']],
  src: ['Prisma & Drizzle docs', 'https://www.prisma.io/docs'] });

TST('ts-env', { name: 'Config & environment variables, typed safely', cat: 'tsapp',
  blurb: `Environment variables are a classic blind spot: process.env is typed as string | undefined, values are always strings, and a missing or malformed variable usually fails deep in the app. The fix is to validate and type your config once at startup with a schema, so the rest of the app consumes a fully-typed, guaranteed config object.`,
  facts: [['process.env', 'Record of string | undefined'], ['All strings', 'numbers/booleans must be coerced'], ['Validate', 'once, at startup; fail fast'], ['Expose', 'a typed config object to the app']],
  cheat: [['process.env.X', 'string | undefined (always a string)'], ['z.coerce.number()', 'Parse numeric env vars'], ['Validate at startup', 'Fail fast with a clear message'], ['Typed config object', 'Export env, not raw process.env'], ['Required vs optional', 'Model with the schema'], ['Defaults', 'z.string().default(...)'], ['Secrets stay out', 'Never commit real values'], ['Client vs server env', 'Frontend only exposes prefixed vars'], ['NEXT_PUBLIC_ / VITE_', 'Build-time public vars'], ['import.meta.env', 'Vite’s typed env access']],
  sections: [
    ['Why <code>process.env</code> is dangerous', PP(`<code>process.env</code> is typed as <code>Record&lt;string, string | undefined&gt;</code> — every value is a <b>string</b> or missing. Reading <code>process.env.PORT</code> gives you <code>string | undefined</code>, so forgetting to coerce or null-check leads to <code>NaN</code> ports, <code>"false"</code> treated as truthy, or crashes when a required variable is absent — and these failures usually surface <b>far from the cause</b>, mid-request. Config is just another untrusted boundary.`)],
    ['Validate once, at startup', PP(`Define a <b>schema for your config</b> and <b>parse <code>process.env</code> a single time when the app boots</b>, coercing types (<code>z.coerce.number()</code>, booleans), applying defaults, and marking required vars. If anything is missing or malformed, the app <b>fails immediately with a clear message</b> rather than limping along. Export the resulting <b>typed config object</b> and have the rest of the codebase import <i>that</i>, never <code>process.env</code> directly.`)],
    ['Client vs server config', PP(`On the <b>frontend</b>, only variables with a framework prefix (<code>NEXT_PUBLIC_</code>, <code>VITE_</code>) are exposed to the browser bundle — a safety measure so secrets don’t leak client-side. Vite surfaces them via <code>import.meta.env</code> (typeable through a declarations file). Keep <b>secrets server-only</b>, validate client and server config separately, and never ship a private key into a client bundle.`)]
  ],
  snipTitle: 'Typed config', snipNote: 'Validate env at startup; consume a typed object.',
  snips: [['env.ts — validate once', 'typescript', `import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),  // string → number
  DATABASE_URL: z.string().url(),                           // required
  ENABLE_CACHE: z.coerce.boolean().default(false),
});

// Parse once at startup; throws with a clear error if invalid:
export const env = EnvSchema.parse(process.env);
// env.PORT is number, env.DATABASE_URL is string — guaranteed`],
    ['Consume the typed object (not process.env)', 'typescript', `import { env } from "./env.js";

server.listen(env.PORT);                 // number, not string | undefined
if (env.NODE_ENV === "production") enableMetrics();
const db = connect(env.DATABASE_URL);    // guaranteed present & a URL`],
    ['Frontend (Vite) typed env', 'typescript', `// vite-env.d.ts — type the public vars
interface ImportMetaEnv {
  readonly VITE_API_URL: string;         // only VITE_* reach the browser
}
interface ImportMeta { readonly env: ImportMetaEnv; }

// usage (build-time injected, typed):
const api = import.meta.env.VITE_API_URL;`]],
  edge: [`Every <code>process.env</code> value is a <b>string</b> — <code>PORT</code> is <code>"3000"</code>, not <code>3000</code>; coerce it, or <code>server.listen("3000")</code> and arithmetic misbehave.`, `A missing required variable is <code>undefined</code>; without startup validation it crashes deep in a request with a confusing trace instead of failing fast at boot.`, `Augmenting <code>ProcessEnv</code> via declaration merging makes <code>process.env.X</code> <i>look</i> typed as <code>string</code> but doesn’t guarantee it exists at runtime — prefer a parsed, validated config object.`, `On the frontend, only prefixed vars (<code>VITE_</code>, <code>NEXT_PUBLIC_</code>) are exposed; referencing an unprefixed var in client code silently yields <code>undefined</code>.`, `Never commit real secret values; keep them out of the repo (the <code>BITFORGE_PASSWORD</code>-style pattern) and inject via the environment.`],
  faq: [['Why not just read <code>process.env.PORT</code> directly where I need it?', PP(`Because it’s typed <code>string | undefined</code> and is <i>actually</i> a string, so every call site has to remember to check for absence and coerce the type — and a single missed check becomes a runtime crash or a subtle bug (a <code>NaN</code> port, a <code>"false"</code> string treated as truthy). Reading it in scattered places also means a <b>missing variable fails late</b>, mid-request, far from the cause. Validating once at startup and exporting a <b>typed config object</b> centralizes the uncertainty, fails fast with a clear message, and lets the rest of the app consume guaranteed-correct, correctly-typed values.`)],
    ['How do I turn string env vars into numbers/booleans safely?', PP(`<b>Coerce them in the schema</b>. With Zod, <code>z.coerce.number()</code> parses <code>"3000"</code> into <code>3000</code> (and you can chain <code>.int().positive()</code>), and <code>z.coerce.boolean()</code> / a custom transform handles flags. Because the coercion lives in the validated schema, the exported config has real <code>number</code>/<code>boolean</code> types and invalid values (a non-numeric <code>PORT</code>) are rejected at startup. Doing the conversion ad-hoc with <code>Number(process.env.PORT)</code> scattered around is where <code>NaN</code> bugs come from.`)],
    ['How is frontend env handling different from the backend?', PP(`On the frontend, environment variables are <b>baked into the build</b> and only those with a framework prefix — <code>VITE_</code> (Vite) or <code>NEXT_PUBLIC_</code> (Next.js) — are exposed to the browser bundle. This is a <b>security boundary</b>: it stops you from accidentally shipping server secrets (API keys, DB URLs) to the client. You access them via the framework’s typed API (<code>import.meta.env</code> in Vite, typed through a declarations file) and validate them like any other config. Secrets and anything sensitive stay <b>server-only</b> and are validated in the server’s config, never referenced in client code.`)]],
  qs: [SQ('What type does <code>process.env.PORT</code> have, and why is that a trap?', ['number — safe to use directly', 'string | undefined — it may be missing and is always a string needing coercion', 'boolean', 'any — fully safe'], 1, 'Env values are strings or undefined; you must coerce and check them.'),
    SQ('What is the recommended way to handle configuration in a TypeScript app?', ['Read process.env wherever needed', 'Validate and coerce env once at startup, then export a typed config object the app imports', 'Cast process.env as any', 'Hardcode values in source'], 1, 'Validate once, fail fast, and consume a guaranteed, typed config object.')]
});
DP('ts-env', {
  fu: [['How do I get autocomplete for process.env keys?', 'You can declaration-merge NodeJS.ProcessEnv to add known keys as string, which helps editing — but it’s a type-only hint with no runtime guarantee. The robust approach is to parse env with a schema and use the resulting typed object, which gives both autocomplete and real validation.'],
    ['What about .env files and loaders?', 'Tools like dotenv (or built-in support in Vite/Next/Bun) load .env files into process.env in development. Load them before you parse your schema, keep .env out of version control, and provide a .env.example documenting required keys.'],
    ['How do I share config types across client and server?', 'Validate them separately (client sees only public-prefixed vars) but you can share schema fragments. Keep secrets exclusively in the server schema; never import server config into client bundles.']],
  deep: [['Technique', 'Treat config as an untrusted boundary: one schema, parsed once at startup with coercion and defaults, exported as a typed object; validate client and server env separately with secrets server-only.'],
    ['Failure mode', 'Reading process.env ad hoc (string/undefined traps, late failures) or declaration-merging ProcessEnv and assuming presence. Parse and fail fast instead.'],
    ['In real code', 'Startup env validation (often with Zod, or t3-env on the T3 stack) is a near-universal practice; frameworks enforce public-var prefixes to keep secrets out of client bundles.']],
  src: ['Vite: Env Variables and Modes', 'https://vite.dev/guide/env-and-mode'] });
