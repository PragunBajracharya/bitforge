/* ===== Interview prep B: frontend ===== */
IPT('ip-html-a11y', { name: 'HTML semantics & accessibility', cat: 'ipfe', roles: ['fe', 'fs'],
  blurb: `Semantic HTML gives content meaning that browsers, search engines and assistive technologies understand. Accessibility (a11y) means everyone, including keyboard and screen-reader users, can use your UI. Interviewers increasingly treat it as a core skill, not a bonus.`,
  facts: [['Standard', 'WCAG 2.2 AA'], ['First rule of ARIA', 'Use native HTML first'], ['Keyboard', 'Everything reachable & operable'], ['Contrast', '4.5:1 body text']],
  cheat: [['Landmarks', '&lt;header&gt; &lt;nav&gt; &lt;main&gt; &lt;aside&gt; &lt;footer&gt;'], ['Headings', 'One &lt;h1&gt;, then h2–h6 in order (outline)'], ['Buttons vs links', '&lt;button&gt; does an action; &lt;a href&gt; navigates'], ['Forms', '&lt;label for&gt; every input; fieldset/legend for groups'], ['Images', 'alt describes content; alt="" if decorative'], ['Lists & tables', 'ul/ol for lists; th with scope for tables'], ['Focus', 'Visible focus ring; logical tab order; no positive tabindex'], ['ARIA roles', 'role="dialog", "tablist", "alert" when no native element fits'], ['ARIA states', 'aria-expanded, aria-selected, aria-pressed, aria-invalid'], ['aria-label / labelledby', 'Accessible name for icon buttons, regions'], ['aria-live', 'Announce dynamic updates (polite / assertive)'], ['Meta', 'lang attribute, viewport meta, title per page']],
  sections: [
    ['Why semantics matter', UL([`Screen readers navigate by headings, landmarks, links and form controls; divs give them nothing.`, `Native elements come with keyboard support and focus behavior for free: a &lt;button&gt; responds to Enter and Space; a &lt;div onclick&gt; doesn’t.`, `Search engines rank structured content better.`, `Clean structure is easier to style and maintain.`])],
    ['Keyboard and focus', UL([`Every interactive element must be reachable with Tab and operable with Enter/Space (and arrows inside composite widgets like tabs and menus).`, `Never remove focus outlines without a visible replacement (use :focus-visible).`, `Modals: move focus in when opened, trap it inside, close on Escape, and return focus to the trigger.`, `Skip links (“Skip to main content”) help keyboard users bypass navigation.`])],
    ['ARIA, carefully', PP(`ARIA adds semantics for custom widgets but changes nothing about behavior. The first rule: if a native element exists, use it. Wrong ARIA is worse than none (role="button" on a div without keyboard handling lies to users). Common correct uses: aria-expanded on disclosure buttons, aria-live regions for toasts, aria-describedby linking inputs to error messages.`)],
    ['Testing accessibility', UL([`Navigate the page with only a keyboard.`, `Run axe DevTools or Lighthouse for automated checks (they catch ~30–40% of issues).`, `Try a screen reader: VoiceOver (Mac), NVDA (Windows).`, `Check color contrast and zoom to 200%.`, `In tests, query by role and label (Testing Library) so tests fail when accessibility breaks.`])]
  ],
  snips: [['HTML', 'html', `<!-- Accessible form field with error -->
<label for="email">Email</label>
<input id="email" type="email" autocomplete="email" required
       aria-invalid="true" aria-describedby="email-err">
<p id="email-err" role="alert">Enter a valid email address.</p>

<!-- Icon-only button needs an accessible name -->
<button type="button" aria-label="Close dialog">✕</button>

<!-- Disclosure (show/hide) -->
<button type="button" aria-expanded="false" aria-controls="faq1">Shipping times</button>
<div id="faq1" hidden>Orders ship in 2 days.</div>

<!-- Native dialog handles focus and Escape -->
<dialog id="confirm">
  <h2>Delete project?</h2>
  <button value="cancel" formmethod="dialog">Cancel</button>
  <button id="ok">Delete</button>
</dialog>`],
    ['JS', 'javascript', `// Disclosure toggle keeps ARIA state in sync
const btn = document.querySelector("[aria-controls=faq1]");
const panel = document.getElementById("faq1");
btn.addEventListener("click", () => {
  const open = btn.getAttribute("aria-expanded") === "true";
  btn.setAttribute("aria-expanded", String(!open));
  panel.hidden = open;
});

// Open a modal dialog and restore focus afterwards
const trigger = document.activeElement;
const dlg = document.getElementById("confirm");
dlg.showModal();                                   // traps focus, Esc closes
dlg.addEventListener("close", () => trigger.focus(), { once: true });`]],
  edge: [`Placeholder text is not a label: it disappears and often fails contrast.`, `Disabled buttons can’t be focused, so users don’t learn why; consider aria-disabled with an explanation.`, `display:none and hidden remove content from screen readers; visually-hidden CSS keeps it readable.`, `Color alone must not convey meaning (red error text also needs an icon or message).`, `Auto-playing media and moving content need pause controls; respect prefers-reduced-motion.`, `Single-page apps must move focus and announce the new page title on route change.`],
  faq: [['Why use a button instead of a clickable div?', PP(`A &lt;button&gt; is focusable, has the button role, fires click on Enter and Space, and works with forms. Recreating that on a div needs tabindex, role, key handlers and focus styles, and usually ends up incomplete.`)],
    ['How would you make a custom dropdown accessible?', PP(`Prefer a native &lt;select&gt;. If custom: a button with aria-haspopup="listbox" and aria-expanded; a list with role="listbox" and options with role="option" and aria-selected; arrow keys move focus (or aria-activedescendant), Enter selects, Escape closes and returns focus, type-ahead jumps to options. Follow the ARIA Authoring Practices pattern.`)]],
  qs: [SQ('An icon-only “trash” button has no text. What does it need?', ['A title only', 'An accessible name, e.g. aria-label="Delete item"', 'role="img"', 'tabindex="5"'], 1, 'Screen readers announce the accessible name; without one they say just “button”.')]
});

IPT('ip-css', { name: 'CSS: layout, specificity & responsive design', cat: 'ipfe', roles: ['fe', 'fs'],
  blurb: `CSS interviews test whether you can predict what the browser will do: which rule wins (cascade and specificity), how boxes are sized (box model), and how to lay things out with Flexbox and Grid, responsively.`,
  facts: [['1-D layout', 'Flexbox'], ['2-D layout', 'Grid'], ['Sizing', 'box-sizing: border-box'], ['Responsive', 'Mobile-first media queries']],
  cheat: [['Specificity', 'inline (1,0,0,0) > #id (0,1,0,0) > .class/[attr]/:hover (0,0,1,0) > element (0,0,0,1)'], ['Cascade order', 'Importance → origin/layer → specificity → source order'], ['!important', 'Overrides normal rules; avoid'], ['Box model', 'content + padding + border + margin'], ['border-box', 'width includes padding and border'], ['Margin collapse', 'Vertical margins of blocks merge (not in flex/grid)'], ['position', 'static, relative, absolute (to positioned ancestor), fixed, sticky'], ['Stacking context', 'Created by z-index on positioned, opacity<1, transform…'], ['Flexbox', 'justify-content (main axis), align-items (cross axis), gap, flex: 1'], ['Grid', 'grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))'], ['Units', 'rem (root font), em (parent), %, vw/vh, dvh, ch'], ['Centering', 'display:grid; place-items:center'], ['Media query', '@media (min-width: 768px) { … }'], ['Container query', '@container (min-width: 400px) { … }']],
  sections: [
    ['The cascade and specificity', PP(`When several rules set the same property, the browser picks by: importance (!important), origin and cascade layers, specificity, then the last rule in source order. Specificity is compared as a tuple (ids, classes/attributes/pseudo-classes, elements): <code>#nav a</code> = (1,0,1) beats <code>.menu .item a</code> = (0,2,1). :where() has zero specificity; :is() and :not() take their most specific argument. Keep specificity low and flat (one class per selector) so overrides stay easy.`)],
    ['Flexbox vs Grid', TBL(['', 'Flexbox', 'Grid'], [['Dimension', 'One axis at a time (row or column)', 'Rows and columns together'], ['Driven by', 'Content size', 'Container template'], ['Best for', 'Toolbars, nav bars, aligning items in a row, centering', 'Page layouts, card grids, forms with aligned labels'], ['Key properties', 'flex-direction, justify-content, align-items, flex-wrap, flex-grow/shrink/basis', 'grid-template-columns/rows/areas, gap, minmax, auto-fill/auto-fit']])],
    ['Responsive design', UL([`Mobile-first: base styles for small screens, then min-width media queries add complexity.`, `Fluid layouts with %, fr, minmax and clamp() (<code>font-size: clamp(1rem, 2.5vw, 1.5rem)</code>).`, `Responsive images: srcset/sizes, the picture element, aspect-ratio to avoid layout shift.`, `Container queries let components respond to their container instead of the viewport.`, `Viewport meta tag: <code>&lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;</code>.`])],
    ['Common layout recipes', UL([`<b>Centering:</b> <code>display:grid; place-items:center</code> or flex with justify-content and align-items center.`, `<b>Sticky footer:</b> body as a flex column with min-height:100dvh; main gets flex:1.`, `<b>Responsive card grid:</b> <code>grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))</code>.`, `<b>Holy-grail layout:</b> grid-template-areas with header, nav, main, aside, footer.`, `<b>Truncate text:</b> white-space:nowrap; overflow:hidden; text-overflow:ellipsis (plus min-width:0 on flex children).`])],
    ['Architecture', PP(`Large codebases avoid global CSS collisions with naming conventions (BEM: <code>.card__title--large</code>), CSS Modules (scoped class names), utility-first frameworks (Tailwind), or CSS-in-JS. Custom properties (variables) power theming: define tokens on :root and override them for dark mode.`)]
  ],
  snips: [['CSS', 'css', `*, *::before, *::after { box-sizing: border-box; }

:root { --space: 1rem; --brand: #1c6b74; }
@media (prefers-color-scheme: dark) { :root { --brand: #4db2bc; } }

/* Responsive card grid, no media queries */
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--space); }

/* Header: logo left, nav right */
.header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }

/* Page layout with named areas, stacked on small screens */
.page { display: grid; grid-template-areas: "head" "main" "foot"; min-height: 100dvh; }
@media (min-width: 900px) {
  .page { grid-template-columns: 240px 1fr; grid-template-areas: "head head" "nav main" "foot foot"; }
}

/* Flex child that must shrink and truncate */
.item { min-width: 0; }
.item p { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Accessible focus and motion */
:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }`]],
  edge: [`Flex children default to min-width:auto, so long content overflows; set min-width:0.`, `z-index has no effect on position:static elements, and only competes within the same stacking context (a transformed parent creates a new one).`, `100vh on mobile includes the area under browser chrome; use 100dvh.`, `Percent heights need a parent with a defined height.`, `Margin collapse surprises: a child’s top margin can “leak” out of its parent.`, `position:sticky fails if an ancestor has overflow:hidden.`],
  faq: [['How do you center a div horizontally and vertically?', PP(`On the parent: <code>display:grid; place-items:center;</code> (or display:flex; justify-content:center; align-items:center). For an absolutely positioned child: <code>inset:0; margin:auto;</code> with a set size, or top:50%; left:50%; transform:translate(-50%,-50%).`)],
    ['Why isn’t my z-index working?', PP(`z-index only applies to positioned elements (or flex/grid items) and is compared only within the same stacking context. If an ancestor creates a stacking context (z-index with position, opacity &lt; 1, transform, filter), the element can’t rise above content outside that ancestor, whatever its value.`)],
    ['rem vs em vs px?', PP(`px is fixed. em is relative to the element’s (or parent’s, for font-size) font size and compounds when nested. rem is relative to the root font size, so it scales with user settings without compounding: the usual choice for spacing and type.`)]],
  qs: [SQ('Which selector wins: #nav .link (from styles.css) or .menu .item .link (loaded later)?', ['.menu .item .link, because it comes later', '#nav .link, because an ID outranks any number of classes', 'Both apply', 'Whichever is shorter'], 1, 'Specificity (1,1,0) beats (0,3,0) regardless of source order.')]
});

IPT('ip-js-core', { name: 'JavaScript fundamentals', cat: 'ipfe', roles: ['fe', 'fs', 'be'],
  blurb: `The questions that separate JavaScript users from JavaScript engineers: scope and closures, hoisting and the temporal dead zone, how this is bound, prototypes, equality and type coercion, and value vs reference.`,
  facts: [['Scope', 'Lexical (block for let/const)'], ['this', 'Set by how a function is called'], ['Inheritance', 'Prototype chain'], ['Equality', 'Prefer ===']],
  cheat: [['var / let / const', 'var: function-scoped, hoisted as undefined; let/const: block-scoped, TDZ until declared'], ['Closure', 'A function remembers variables from where it was defined'], ['Hoisting', 'Function declarations fully hoisted; var hoisted as undefined'], ['this (method)', 'obj.fn() → obj'], ['this (plain call)', 'undefined in strict mode (globalThis otherwise)'], ['this (arrow)', 'Inherited from the enclosing scope'], ['call / apply / bind', 'Set this explicitly; bind returns a new function'], ['new', 'Creates object, links prototype, binds this'], ['Prototype chain', 'Property lookup walks obj → obj.__proto__ → … → null'], ['== vs ===', '== coerces types; === doesn’t'], ['Falsy values', 'false, 0, -0, 0n, "", null, undefined, NaN'], ['typeof null', '"object" (historical bug)'], ['Primitives', 'Copied by value; objects shared by reference'], ['?? vs ||', '?? only falls back on null/undefined'], ['Optional chaining', 'a?.b?.c returns undefined instead of throwing']],
  sections: [
    ['Scope and closures', PP(`JavaScript uses lexical scope: a function can read variables from the place it was written. A closure is a function together with those captured variables, which live as long as the function does. Closures power data privacy (module pattern), function factories, memoization, event handlers and hooks.`)],
    ['How this is determined', TBL(['Call', 'this'], [['obj.method()', 'obj'], ['fn() (strict mode, modules, classes)', 'undefined'], ['new Fn()', 'The new object'], ['fn.call(x) / fn.apply(x) / fn.bind(x)()', 'x'], ['Arrow function', 'this of the enclosing scope (cannot be rebound)'], ['DOM event handler (function)', 'The element (currentTarget)'], ['setTimeout(obj.method)', 'Lost: method is called without obj; use an arrow or bind']])],
    ['Prototypes and classes', PP(`Every object has an internal link to a prototype. Property lookups walk up the chain until found or null. class syntax is sugar over this: methods live on Class.prototype, and extends sets up the chain. Object.create(proto) creates an object with a chosen prototype.`)],
    ['Types and coercion', UL([`Primitives: string, number, bigint, boolean, undefined, symbol, null. Everything else is an object (arrays, functions, dates).`, `== converts types: <code>0 == ""</code> is true, <code>null == undefined</code> is true, <code>[] == false</code> is true. Use === except for the deliberate x == null check.`, `NaN !== NaN; use Number.isNaN.`, `0.1 + 0.2 !== 0.3 (binary floating point); compare with a tolerance or use integers (cents).`, `Arrays and objects are compared by reference: [1] === [1] is false.`])],
    ['Copying', PP(`Spread ({...obj}, [...arr]) and Object.assign make shallow copies: nested objects are still shared. structuredClone(obj) makes a deep copy (no functions). JSON.parse(JSON.stringify(x)) loses dates, undefined, Map/Set and fails on cycles.`)]
  ],
  snips: [['Closures', 'javascript', `// Function factory + private state
function makeCounter() {
  let count = 0;                               // captured by the closure
  return { inc: () => ++count, get: () => count };
}
const c = makeCounter(); c.inc(); c.inc(); c.get();   // 2

// Classic loop bug and fix
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i));   // 3 3 3 (one shared var)
for (let j = 0; j < 3; j++) setTimeout(() => console.log(j));   // 0 1 2 (new binding per iteration)

// Memoize with a closure
function memoize(fn) {
  const cache = new Map();
  return function (arg) {
    if (!cache.has(arg)) cache.set(arg, fn.call(this, arg));
    return cache.get(arg);
  };
}`],
    ['this & bind', 'javascript', `const user = {
  name: "Ada",
  greet() { return "Hi " + this.name; },
  greetLater() { setTimeout(() => console.log(this.greet()), 100); }   // arrow keeps this
};
const g = user.greet;
g();                         // TypeError or "Hi undefined": this is lost
const bound = user.greet.bind(user);
bound();                     // "Hi Ada"

// Implement bind (common interview question)
Function.prototype.myBind = function (ctx, ...preset) {
  const fn = this;
  return function (...args) { return fn.apply(ctx, [...preset, ...args]); };
};`],
    ['Prototypes', 'javascript', `function Animal(name) { this.name = name; }
Animal.prototype.speak = function () { return this.name + " makes a sound"; };

class Dog extends Animal {                     // same chain, class syntax
  speak() { return super.speak() + " (woof)"; }
}
const d = new Dog("Rex");
Object.getPrototypeOf(d) === Dog.prototype;    // true
d.hasOwnProperty("speak");                     // false: found on the prototype

// Deep equality for plain data (interview favorite)
function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length && ka.every(k => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]));
}`]],
  edge: [`Accessing a let variable before its declaration throws (temporal dead zone), unlike var.`, `Array.prototype.sort sorts as strings by default: [10, 9, 1].sort() → [1, 10, 9]; pass (a, b) =&gt; a - b.`, `parseInt("08") is 8 but always pass a radix; parseInt with map: ["1","2","3"].map(parseInt) → [1, NaN, NaN].`, `for…in iterates inherited enumerable keys and array indices as strings; use for…of or Object.keys.`, `Default parameters and destructuring with null: null doesn’t trigger defaults, undefined does.`, `Floating point: use integer cents or a decimal library for money.`],
  faq: [['What is a closure? Give a practical use.', PP(`A function bundled with references to the variables in scope where it was created. Practical uses: private state (a counter or cache only reachable through returned functions), partial application, event handlers that remember data, and React hooks, which rely on closures over props and state.`)],
    ['Explain == vs === with examples.', PP(`=== compares type and value with no conversion. == converts operands first by complex rules: '1' == 1, 0 == '', null == undefined are all true. Use === by default; x == null is an accepted shorthand for “null or undefined”.`)],
    ['What does new do?', PP(`Creates an empty object, sets its prototype to Constructor.prototype, calls the constructor with this bound to the new object, and returns that object unless the constructor explicitly returns another object.`)]],
  qs: [SQ('What does this log? const o = { n: 1, f() { return () => this.n; } }; console.log(o.f()());', ['undefined', '1', 'TypeError', 'NaN'], 1, 'The arrow inherits this from f, which was called as o.f(), so this is o.')]
});

IPT('ip-js-async', { name: 'Event loop, promises & async patterns', cat: 'ipfe', roles: ['fe', 'fs', 'be'],
  blurb: `JavaScript runs on one thread. The event loop decides when callbacks run: synchronous code first, then all microtasks (promise callbacks), then the next macrotask (timers, I/O, events). Predicting log order and implementing debounce, throttle and Promise.all are interview staples.`,
  facts: [['Thread', 'One call stack'], ['Microtasks', 'Promises, queueMicrotask'], ['Macrotasks', 'setTimeout, I/O, events'], ['Order', 'Sync → all microtasks → one macrotask']],
  dg: { w: 860, h: 280,
    n: [['cs', 'Call stack', 120, 140, 'box', 'runs sync code'], ['api', 'Web APIs / libuv', 380, 50, 'worker', 'timers, fetch, I/O'], ['mq', 'Microtask queue', 380, 230, 'queue', 'promise callbacks'], ['tq', 'Task queue', 640, 50, 'queue', 'timers, events'], ['el', 'Event loop', 640, 230, 'svc', 'stack empty? run next']],
    e: [['cs', 'api', 'setTimeout / fetch'], ['api', 'tq', 'callback ready'], ['cs', 'mq', '.then()'], ['mq', 'el', 'drain ALL first'], ['tq', 'el', 'then ONE task'], ['el', 'cs', 'push callback', 'u']] },
  cap: `The event loop: when the call stack is empty, it runs every queued microtask, then one task (macrotask), then renders (in browsers) and repeats.`,
  walk: [[['cs'], `Synchronous code runs to completion on the call stack. Nothing interrupts it.`], [['cs', 'api', 'cs>api'], `setTimeout and fetch hand work to the browser (or libuv in Node) and return immediately.`], [['api', 'tq', 'api>tq'], `When a timer fires or I/O completes, its callback joins the task queue.`], [['cs', 'mq', 'cs>mq'], `Promise reactions (.then, await continuations) go to the microtask queue.`], [['mq', 'el', 'tq', 'mq>el', 'tq>el', 'el>cs'], `When the stack is empty, the loop drains all microtasks (including ones added meanwhile), then takes one task, then may render, and repeats. That is why a resolved promise’s callback runs before a 0 ms timer.`]],
  cheat: [['Promise states', 'pending → fulfilled | rejected (settled once)'], ['Promise.all', 'All fulfill → array; first rejection rejects'], ['Promise.allSettled', 'Waits for all; reports each outcome'], ['Promise.race', 'First to settle wins'], ['Promise.any', 'First to fulfill; AggregateError if all reject'], ['async function', 'Always returns a promise'], ['await', 'Pauses the function; continuation is a microtask'], ['Error handling', 'try/catch around await; .catch() on chains'], ['Debounce', 'Run after calls stop for N ms (search input)'], ['Throttle', 'Run at most once per N ms (scroll)'], ['AbortController', 'Cancel fetches and listeners'], ['Unhandled rejection', 'Always handle or return promises']],
  sections: [
    ['Predicting output', PP(`<code>console.log(1); setTimeout(() =&gt; console.log(2)); Promise.resolve().then(() =&gt; console.log(3)); console.log(4);</code> prints 1, 4, 3, 2: synchronous logs first, then the microtask (3), then the timer task (2). Code after an <code>await</code> behaves like a .then callback.`)],
    ['Common async mistakes', UL([`Awaiting in a loop when calls are independent (slow); use Promise.all.`, `forEach with async callbacks doesn’t wait; use for…of or Promise.all with map.`, `Forgetting to return a promise from .then, breaking the chain.`, `Swallowing errors: a catch that only logs hides failures from callers.`, `Race conditions in UI: an older, slower response overwrites a newer one; cancel with AbortController or ignore stale results.`])],
    ['Debounce vs throttle', TBL(['', 'Debounce', 'Throttle'], [['Fires', 'Once, after input pauses for N ms', 'At most once every N ms while input continues'], ['Use for', 'Search-as-you-type, autosave, resize end', 'Scroll position, mouse move, rate-limited API calls']])]
  ],
  snips: [['Debounce & throttle', 'javascript', `function debounce(fn, wait) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

function throttle(fn, wait) {
  let last = 0, timer = null, pendingArgs = null;
  return function (...args) {
    const now = Date.now(), remaining = wait - (now - last);
    if (remaining <= 0) { last = now; fn.apply(this, args); }
    else { pendingArgs = args; if (!timer) timer = setTimeout(() => { last = Date.now(); timer = null; fn.apply(this, pendingArgs); }, remaining); }
  };
}

input.addEventListener("input", debounce(e => search(e.target.value), 300));`],
    ['Promise.all polyfill', 'javascript', `function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const items = Array.from(iterable), results = new Array(items.length);
    let remaining = items.length;
    if (remaining === 0) return resolve(results);          // edge case: empty input
    items.forEach((item, i) => {
      Promise.resolve(item).then(value => {                 // accept non-promise values
        results[i] = value;                                 // keep original order
        if (--remaining === 0) resolve(results);
      }, reject);                                           // first rejection wins
    });
  });
}`],
    ['Retry & timeout', 'javascript', `const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchWithRetry(url, { retries = 3, timeoutMs = 5000 } = {}) {
  for (let attempt = 0; ; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (res.status >= 500 && attempt < retries) throw new Error("server " + res.status);
      return res;
    } catch (err) {
      if (attempt >= retries) throw err;
      await sleep(Math.random() * 100 * 2 ** attempt);      // exponential backoff + jitter
    } finally { clearTimeout(t); }
  }
}

// Ignore stale responses in a search box
let latest = 0;
async function onSearch(q) {
  const id = ++latest;
  const data = await (await fetch("/api/search?q=" + encodeURIComponent(q))).json();
  if (id === latest) render(data);                          // only the newest request renders
}`]],
  edge: [`Promise.all with an empty array resolves immediately with [].`, `A rejected promise with no handler triggers unhandledrejection (and crashes Node by default).`, `await inside forEach doesn’t pause the loop.`, `setTimeout(fn, 0) is at least ~1–4 ms and waits behind all microtasks; nested timers are clamped.`, `Long microtask chains can starve rendering just like long sync code.`, `Debounced handlers lose the event object if it’s pooled or reused; copy needed values.`],
  faq: [['What is the output order: sync log, setTimeout 0, promise then, sync log?', PP(`Both synchronous logs, then the promise callback (microtask), then the timeout (task).`)],
    ['How would you run 100 requests with at most 5 in flight?', PP(`Keep a pool: start 5 workers that each pull the next index from a shared counter, await the request, store the result by index, and loop until none remain; await all workers with Promise.all. (See mapLimit in the Concurrency topic.)`)],
    ['How do you cancel a fetch?', PP(`Create an AbortController, pass controller.signal to fetch, and call controller.abort(). The promise rejects with an AbortError, which you handle separately from real errors. In React, abort in the effect’s cleanup function.`)]],
  qs: [SQ('What prints? setTimeout(()=>log("A")); Promise.resolve().then(()=>log("B")); log("C");', ['A B C', 'C B A', 'C A B', 'B C A'], 1, 'Sync first (C), then microtasks (B), then tasks (A).')]
});

IPT('ip-react', { name: 'React', cat: 'ipfe', roles: ['fe', 'fs'],
  blurb: `React renders UI as a function of state. Interviews cover how rendering and reconciliation work, the rules and pitfalls of hooks (especially useEffect), state management choices, keys, memoization, and building a small component live.`,
  facts: [['Model', 'UI = f(state)'], ['Re-render when', 'State, props or context change'], ['Effects', 'Sync with external systems'], ['Lists', 'Stable unique keys']],
  cheat: [['useState', 'Local state; setter can take an updater fn'], ['useEffect', 'Side effects after render; return cleanup; deps array'], ['useMemo', 'Cache an expensive computed value'], ['useCallback', 'Cache a function identity'], ['useRef', 'Mutable box that doesn’t re-render; DOM refs'], ['useContext', 'Read shared values without prop drilling'], ['useReducer', 'State transitions as actions (complex state)'], ['React.memo', 'Skip re-render if props are equal (shallow)'], ['key', 'Identity of list items; never index for reorderable lists'], ['Controlled input', 'value + onChange from state'], ['Lifting state up', 'Move shared state to the nearest common parent'], ['Rules of hooks', 'Top level only; only in components/custom hooks'], ['Server components', 'Render on the server, no client JS (Next.js app router)'], ['Suspense', 'Declarative loading boundaries']],
  sections: [
    ['Rendering and reconciliation', PP(`When state changes, React calls the component again to get a new element tree, diffs it with the previous one (reconciliation), and applies the minimal DOM changes. Children re-render when the parent does, unless memoized. Elements of a different type at the same position are torn down and recreated; keys tell React which list items are the same between renders.`)],
    ['useEffect done right', UL([`Effects are for synchronizing with things outside React: subscriptions, timers, network requests, manual DOM work.`, `Declare every reactive value the effect uses in the dependency array; the lint rule enforces this.`, `Return a cleanup function to unsubscribe, clear timers or abort fetches; it runs before the next effect and on unmount (twice in StrictMode development, to expose missing cleanups).`, `You often don’t need an effect: derive values during render, and handle user events in event handlers.`])],
    ['State management choices', TBL(['Need', 'Tool'], [['Local UI state', 'useState / useReducer'], ['Shared by a subtree', 'Lift state up, or Context'], ['Server data (fetching, caching, refetching)', 'TanStack Query, SWR, RTK Query, framework loaders'], ['Complex global client state', 'Redux Toolkit, Zustand, Jotai'], ['Form state', 'React Hook Form, Formik'], ['URL state (filters, tabs)', 'The router’s search params']])],
    ['Performance', UL([`Measure with the React DevTools Profiler first.`, `Keep state close to where it is used to limit re-renders.`, `React.memo for expensive pure children, with useMemo/useCallback to keep prop identities stable.`, `Virtualize long lists (react-window, TanStack Virtual).`, `Code-split routes with lazy() and Suspense.`, `Split contexts so frequent updates don’t re-render every consumer.`])]
  ],
  snips: [['Data fetching hook', 'javascript', `import { useEffect, useState } from "react";

function useFetch(url) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  useEffect(() => {
    const ctrl = new AbortController();
    setState(s => ({ ...s, loading: true }));
    fetch(url, { signal: ctrl.signal })
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(data => setState({ data, error: null, loading: false }))
      .catch(error => { if (error.name !== "AbortError") setState({ data: null, error, loading: false }); });
    return () => ctrl.abort();                 // cleanup: cancel on url change / unmount
  }, [url]);
  return state;
}`],
    ['Todo component', 'javascript', `import { useState } from "react";

export default function Todos() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");

  function add(e) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;                                            // edge case: empty input
    setItems(prev => [...prev, { id: crypto.randomUUID(), text: t, done: false }]);   // updater fn
    setText("");
  }
  const toggle = id => setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i));  // immutable update

  return (
    <form onSubmit={add}>
      <label htmlFor="new">New task</label>
      <input id="new" value={text} onChange={e => setText(e.target.value)} />
      <button>Add</button>
      <ul>
        {items.map(i => (
          <li key={i.id}>                                     {/* stable key, not index */}
            <label><input type="checkbox" checked={i.done} onChange={() => toggle(i.id)} /> {i.text}</label>
          </li>
        ))}
      </ul>
    </form>
  );
}`],
    ['useReducer', 'javascript', `function reducer(state, action) {
  switch (action.type) {
    case "added":   return [...state, action.item];
    case "removed": return state.filter(i => i.id !== action.id);
    case "toggled": return state.map(i => i.id === action.id ? { ...i, done: !i.done } : i);
    default: throw new Error("unknown action " + action.type);
  }
}
const [todos, dispatch] = useReducer(reducer, []);
dispatch({ type: "toggled", id });`]],
  edge: [`Stale closures: an interval callback reads old state; use the updater form setX(x =&gt; x + 1) or a ref.`, `Mutating state (push, obj.x = 1) doesn’t trigger a re-render; always create new objects/arrays.`, `Index as key breaks state of list items when reordering or deleting.`, `Objects/arrays/functions created during render change identity every time, defeating memo and re-running effects.`, `Setting state during render causes infinite loops.`, `Race conditions when props change quickly during a fetch: abort or ignore stale responses.`, `Effects run twice in development StrictMode: write effects that clean up properly.`],
  faq: [['Why do keys matter in lists?', PP(`Keys tell React which item is which between renders. With stable keys it moves the right DOM node and preserves each item’s state; with index keys, deleting the first item makes every later item inherit the previous item’s state (input text, checkbox, focus).`)],
    ['useMemo vs useCallback vs React.memo?', PP(`useMemo caches a computed value; useCallback caches a function (useMemo returning a function); React.memo skips re-rendering a component when its props are shallowly equal. They work together: memoized children need stable props. Use them where profiling shows a cost.`)],
    ['How does React decide to re-render a component?', PP(`A component re-renders when its own state changes, when its parent re-renders (unless memoized with equal props), or when a context it consumes changes. Re-rendering means calling the function again; the DOM only changes where the output differs.`)]],
  qs: [SQ('A counter uses setCount(count + 1) three times in one click handler, but only increases by 1. Fix?', ['Use useEffect', 'Use the updater form setCount(c => c + 1)', 'Use a key', 'Use React.memo'], 1, 'All three calls read the same stale count; updaters chain correctly.')]
});

IPT('ip-browser-perf', { name: 'Browser rendering & web performance', cat: 'ipfe', roles: ['fe', 'fs'],
  blurb: `Know what the browser does between receiving HTML and painting pixels, which work is expensive (layout, paint), and how to measure and improve the Core Web Vitals that Google uses to rate user experience.`,
  facts: [['LCP', '≤ 2.5 s (loading)'], ['INP', '≤ 200 ms (interactivity)'], ['CLS', '≤ 0.1 (visual stability)'], ['Tools', 'Lighthouse, DevTools Performance']],
  dg: { w: 900, h: 220,
    n: [['html', 'HTML → DOM', 85, 70, 'box'], ['css', 'CSS → CSSOM', 85, 170, 'box'], ['rt', 'Render tree', 280, 120, 'box', 'visible nodes + styles'], ['lay', 'Layout', 460, 120, 'box', 'sizes & positions'], ['pt', 'Paint', 620, 120, 'box', 'pixels per layer'], ['cmp', 'Composite', 790, 120, 'box', 'GPU layers']],
    e: [['html', 'rt'], ['css', 'rt'], ['rt', 'lay'], ['lay', 'pt'], ['pt', 'cmp']] },
  cap: `The critical rendering path. Changing geometry (width, top) re-runs layout and paint; changing transform or opacity can skip straight to compositing, which is why smooth animations use them.`,
  walk: [[['html', 'css'], `The browser parses HTML into the DOM and CSS into the CSSOM. CSS is render-blocking; synchronous scripts block parsing.`], [['rt', 'html>rt', 'css>rt'], `It combines them into a render tree of visible elements with computed styles.`], [['lay', 'rt>lay'], `Layout (reflow) computes every box’s size and position. Reading layout values right after writing styles forces it to run synchronously (layout thrashing).`], [['pt', 'lay>pt'], `Paint fills in pixels: text, colors, borders, shadows.`], [['cmp', 'pt>cmp'], `Compositing assembles layers on the GPU. Animating transform and opacity only touches this step.`]],
  cheat: [['LCP', 'Largest element rendered: optimize hero image, server response, render-blocking CSS'], ['INP', 'Slowest interaction latency: break up long tasks, less JS'], ['CLS', 'Unexpected layout shifts: set image dimensions, reserve space for ads/embeds'], ['TTFB', 'Server response time: caching, CDN'], ['defer / async', 'defer keeps order and runs after parse; async runs when loaded'], ['preload / preconnect', 'Fetch critical resources / open connections early'], ['Lazy loading', 'loading="lazy" for images and iframes below the fold'], ['Code splitting', 'Dynamic import() per route'], ['Tree shaking', 'Bundler removes unused exports'], ['Image formats', 'AVIF/WebP, responsive srcset, compression'], ['Caching', 'Cache-Control: immutable + hashed filenames'], ['Reflow triggers', 'Reading offsetHeight after style writes'], ['Cheap animations', 'transform, opacity'], ['Long task', '> 50 ms on the main thread']],
  sections: [
    ['Loading performance', UL([`Reduce bytes: compress (Brotli), minify, tree-shake, code-split, remove unused dependencies, optimize images.`, `Reduce round trips: HTTP/2 or 3, CDN, preconnect to critical origins, inline critical CSS.`, `Prioritize: preload the LCP image, fetchpriority="high", defer non-critical scripts.`, `Render on the server (SSR/SSG) for faster first paint and SEO; hydrate progressively.`])],
    ['Runtime performance', UL([`Keep the main thread free: split long tasks (scheduler.yield, setTimeout chunks), move heavy work to Web Workers.`, `Batch DOM reads, then writes, to avoid layout thrashing (or use requestAnimationFrame).`, `Virtualize long lists; debounce/throttle frequent handlers; use passive scroll listeners.`, `Avoid memory leaks: remove listeners, clear timers, abort requests on unmount.`])],
    ['Rendering strategies', TBL(['Strategy', 'How', 'Good for'], [['CSR', 'Empty HTML + JS renders in the browser', 'Dashboards behind login'], ['SSR', 'Server renders HTML per request, then hydrates', 'Dynamic, SEO-relevant pages'], ['SSG', 'HTML built at deploy time', 'Docs, blogs, marketing'], ['ISR / revalidation', 'Static pages regenerated periodically', 'Product catalogs'], ['Streaming / server components', 'Send HTML in chunks; less client JS', 'Large modern apps (Next.js, Remix)']])]
  ],
  snips: [['HTML', 'html', `<head>
  <link rel="preconnect" href="https://cdn.example.com" crossorigin>
  <link rel="preload" as="image" href="/hero.avif" fetchpriority="high">
  <link rel="stylesheet" href="/app.3f9a.css">
  <script src="/app.8c1d.js" defer></script>          <!-- doesn't block parsing -->
</head>
<img src="/hero.avif" width="1200" height="600" alt="…">    <!-- dimensions prevent CLS -->
<img src="/gallery-1.webp" loading="lazy" width="400" height="300" alt="…">`],
    ['JS', 'javascript', `// Layout thrashing (slow): read-write-read-write forces layout each time
items.forEach(el => { el.style.width = el.offsetWidth + 10 + "px"; });

// Batched (fast): all reads, then all writes
const widths = items.map(el => el.offsetWidth);
requestAnimationFrame(() => items.forEach((el, i) => { el.style.width = widths[i] + 10 + "px"; }));

// Route-level code splitting
const Settings = React.lazy(() => import("./Settings"));

// Yield during long work so input stays responsive
async function processAll(rows) {
  for (let i = 0; i < rows.length; i++) {
    handle(rows[i]);
    if (i % 500 === 0) await new Promise(r => setTimeout(r));   // let the browser breathe
  }
}`]],
  edge: [`Web fonts can cause invisible text or layout shifts; use font-display: swap and size-adjusted fallbacks.`, `Third-party scripts (analytics, chat, ads) often dominate main-thread time; load them late.`, `Lighthouse runs on a simulated device; validate with real-user data (CrUX, RUM).`, `Lazy-loading the LCP image makes LCP worse.`, `Hydration mismatches when server and client render different output (dates, random IDs).`],
  faq: [['What happens when you change an element’s width vs its transform?', PP(`Width changes geometry, so the browser recalculates layout for affected elements, then repaints and composites. A transform change can usually be handled by the compositor on the GPU without layout or paint, so it is far cheaper and smoother to animate.`)],
    ['How would you improve a slow LCP?', PP(`Find the LCP element in DevTools. Then reduce server time (caching, CDN), remove render-blocking resources, preload the LCP image with fetchpriority high, serve it in a modern format at the right size, and avoid client-side rendering for above-the-fold content.`)]],
  qs: [SQ('Which property is cheapest to animate?', ['width', 'top', 'transform', 'margin'], 2, 'transform (and opacity) can be handled by the compositor without layout or paint.')]
});

IPT('ip-web-security', { name: 'Web security essentials', cat: 'ipfe', roles: ['fe', 'be', 'fs'],
  blurb: `Every web developer is expected to know the OWASP basics: how XSS, CSRF, injection and broken access control happen, how CORS and the same-origin policy work, and which headers and cookie settings defend against them.`,
  facts: [['Top risks', 'OWASP Top 10'], ['XSS defense', 'Escape output + CSP'], ['CSRF defense', 'SameSite cookies + tokens'], ['SQLi defense', 'Parameterized queries']],
  cheat: [['XSS', 'Attacker script runs in your page; escape output, avoid innerHTML, CSP'], ['CSRF', 'Another site makes the user’s browser send an authenticated request; SameSite, CSRF tokens'], ['SQL injection', 'Untrusted input in SQL; use parameters'], ['Same-origin policy', 'Scripts can’t read responses from other origins'], ['CORS', 'Server opts in to cross-origin reads via Access-Control-Allow-Origin'], ['Preflight', 'OPTIONS request for non-simple methods/headers'], ['Cookie flags', 'HttpOnly (no JS), Secure (HTTPS), SameSite=Lax/Strict'], ['CSP', 'Content-Security-Policy restricts script sources'], ['Clickjacking', 'frame-ancestors / X-Frame-Options'], ['HSTS', 'Force HTTPS for the domain'], ['IDOR', 'Accessing others’ objects by changing an ID; check authorization'], ['SSRF', 'Server fetches attacker-chosen URLs; allow-list hosts'], ['Secrets', 'Never in frontend code or Git']],
  sections: [
    ['Cross-site scripting (XSS)', PP(`Untrusted data is rendered as code. Stored XSS (a comment containing &lt;script&gt;), reflected XSS (a URL parameter echoed into the page), and DOM XSS (client JS writing location.hash into innerHTML). Defenses: frameworks escape text by default (React’s JSX), so avoid dangerouslySetInnerHTML and innerHTML with untrusted data; sanitize rich HTML with DOMPurify; set a strict Content-Security-Policy; keep tokens in HttpOnly cookies so stolen script can’t read them.`)],
    ['Cross-site request forgery (CSRF)', PP(`If authentication relies on cookies, a malicious site can make the browser send a request to your site with those cookies. Defenses: SameSite=Lax or Strict cookies (Lax is the browser default for cookies without the attribute), anti-CSRF tokens for state-changing requests, checking Origin headers, and never changing state on GET.`)],
    ['CORS explained', PP(`The same-origin policy stops scripts on a.com from reading responses from b.com. CORS lets b.com allow it with response headers: Access-Control-Allow-Origin (a specific origin, or * for public data without credentials), Allow-Methods, Allow-Headers, Allow-Credentials. Browsers send a preflight OPTIONS request for non-simple requests (e.g. JSON with custom headers). CORS is enforced by browsers: it protects users, not your API from curl.`)],
    ['Server-side essentials', UL([`Parameterized queries / ORM bindings, never string concatenation.`, `Authorization checks on every request for every object (prevents IDOR).`, `Validate input with schemas; encode output for its context.`, `Hash passwords with Argon2id/bcrypt (see Cryptography course).`, `Rate limit login and expensive endpoints.`, `Keep dependencies patched; scan for vulnerabilities.`])]
  ],
  snips: [['Express', 'javascript', `import express from "express";
import helmet from "helmet";
import cors from "cors";

const app = express();
app.use(helmet({                                   // security headers incl. CSP, HSTS, frame-ancestors
  contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"] } }
}));
app.use(cors({ origin: ["https://app.example.com"], credentials: true }));   // explicit allow-list
app.use(express.json({ limit: "100kb" }));

res.cookie("session", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 7 * 864e5 });

// Parameterized query (pg)
const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [req.body.email]);

// Authorization: the order must belong to the user (prevents IDOR)
const order = await db.order.findFirst({ where: { id: req.params.id, userId: req.user.id } });
if (!order) return res.sendStatus(404);`],
    ['React', 'javascript', `// Safe: JSX escapes text
<p>{comment.body}</p>

// Dangerous unless sanitized
import DOMPurify from "dompurify";
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.html) }} />

// Validate URLs before using them in href (blocks javascript: URLs)
const safeHref = /^https?:\\/\\//i.test(url) ? url : "#";`]],
  edge: [`Access-Control-Allow-Origin: * cannot be combined with credentials.`, `Reflecting the request Origin back without an allow-list is equivalent to allowing every site.`, `JWTs in localStorage are readable by any XSS; prefer HttpOnly cookies with CSRF protection.`, `Escaping for HTML doesn’t protect URLs, CSS or JavaScript contexts; encode per context.`, `File uploads: check type by content, limit size, store outside the web root, serve with Content-Disposition.`],
  faq: [['What is CORS and why does my fetch fail with a CORS error?', PP(`Browsers block scripts from reading cross-origin responses unless the server returns matching CORS headers. The fix is on the server: allow your frontend’s origin (and credentials/headers if needed) and handle the OPTIONS preflight. Proxying through your own backend also avoids it.`)],
    ['How do XSS and CSRF differ?', PP(`XSS runs attacker code inside your site, so it can do anything the user can. CSRF tricks the user’s browser into sending a request from another site, without reading the response. XSS defeats CSRF protections, so preventing XSS comes first.`)]],
  qs: [SQ('Which cookie setting prevents JavaScript from reading a session cookie?', ['Secure', 'HttpOnly', 'SameSite=None', 'Max-Age'], 1, 'HttpOnly hides the cookie from document.cookie, limiting XSS damage.')]
});

IPT('ip-fe-design', { name: 'Frontend system design', cat: 'ipfe', roles: ['fe', 'fs'],
  blurb: `Senior frontend interviews include designing a feature or app (a news feed, autocomplete, chat UI, image carousel): component architecture, state and data flow, API contracts, performance, accessibility and offline behavior. The RADIO framework keeps it structured.`,
  facts: [['Framework', 'RADIO'], ['Time', '45–60 min'], ['Depth', 'Components, state, API, perf, a11y'], ['Classic prompts', 'Feed, autocomplete, chat, editor']],
  dg: { w: 880, h: 270,
    n: [['ui', 'Components', 110, 135, 'client', 'Feed, PostCard, Composer'], ['st', 'Client state', 330, 60, 'box', 'UI state, drafts'], ['cache', 'Server cache', 330, 210, 'cache', 'TanStack Query'], ['api', 'API layer', 560, 210, 'svc', 'GET /feed?cursor='], ['ws', 'Realtime', 560, 60, 'svc', 'WebSocket / SSE'], ['be', 'Backend', 780, 135, 'db']],
    e: [['ui', 'st', 'read / dispatch'], ['ui', 'cache', 'useQuery'], ['cache', 'api', 'fetch page'], ['api', 'be'], ['ws', 'cache', 'new posts → update', 'd'], ['be', 'ws', 'push', 'd']] },
  cap: `A typical frontend architecture for a news feed: components read UI state and a server-data cache; the cache fetches paginated data through an API layer and is updated by real-time events.`,
  walk: [[['ui'], `<b>Components:</b> Feed (list, virtualization, infinite scroll), PostCard (memoized), Composer (form, optimistic submit).`], [['ui', 'st', 'ui>st'], `<b>Client state:</b> drafts, open menus, filters (some in the URL).`], [['ui', 'cache', 'api', 'ui>cache', 'cache>api'], `<b>Server state:</b> a query cache fetches pages with cursor pagination, dedupes requests, and retries.`], [['ws', 'cache', 'be', 'be>ws', 'ws>cache'], `<b>Real-time:</b> new posts arrive over a WebSocket and are inserted into the cache (or a “3 new posts” banner appears to avoid jumping content).`]],
  cheat: [['R · Requirements', 'Features, devices, offline, scale of data, a11y, i18n'], ['A · Architecture', 'Components and how they talk; server vs client rendering'], ['D · Data model', 'Entities, client state vs server state, normalization'], ['I · Interface (API)', 'Endpoints, pagination, real-time events, errors'], ['O · Optimizations', 'Performance, a11y, security, offline, testing'], ['Pagination', 'Cursor-based for feeds; infinite scroll + virtualization'], ['Optimistic UI', 'Update immediately, roll back on failure'], ['Caching', 'stale-while-revalidate; normalize by ID'], ['Offline', 'Service worker, IndexedDB, retry queue'], ['Images', 'Responsive srcset, lazy loading, placeholders']],
  sections: [
    ['Worked example: autocomplete', OL([`<b>Requirements:</b> suggestions as you type, keyboard navigation, highlights matches, handles slow networks, works on mobile, accessible.`, `<b>Architecture:</b> Autocomplete (input + listbox), SuggestionItem; a hook useSuggestions(query).`, `<b>Data:</b> query string, results, highlighted index, cache Map(query → results), loading/error.`, `<b>API:</b> GET /suggest?q=…&amp;limit=10 → [{id, label}]; server-side ranking.`, `<b>Optimizations:</b> debounce 200–300 ms; cache previous queries; abort or ignore stale responses; minimum query length; ARIA combobox pattern (aria-expanded, aria-activedescendant, role=listbox/option); keyboard Up/Down/Enter/Escape; announce result count.`])],
    ['Trade-offs to discuss', TBL(['Decision', 'Options'], [['Rendering', 'CSR vs SSR/SSG vs streaming (SEO, first paint, complexity)'], ['State', 'Local vs context vs store vs server-cache library'], ['Data shape', 'Nested vs normalized by ID (updates in one place)'], ['Real-time', 'Polling vs SSE vs WebSockets'], ['Pagination', 'Offset vs cursor; “load more” vs infinite scroll'], ['Styling', 'CSS modules vs utility CSS vs CSS-in-JS']])],
    ['Non-functional checklist', UL([`Performance budgets (JS size, LCP, INP), virtualization, image strategy.`, `Accessibility: keyboard, focus, ARIA patterns, reduced motion.`, `Internationalization: text expansion, RTL layouts, date/number formats.`, `Error and empty states, retry, offline.`, `Security: XSS in user content, token storage.`, `Observability: error reporting, Web Vitals RUM, feature flags.`])]
  ],
  snips: [['Autocomplete hook', 'javascript', `function useSuggestions(query, { delay = 250, min = 2 } = {}) {
  const [state, setState] = useState({ items: [], loading: false, error: null });
  const cache = useRef(new Map());
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length < min) { setState({ items: [], loading: false, error: null }); return; }
    if (cache.current.has(q)) { setState({ items: cache.current.get(q), loading: false, error: null }); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {                       // debounce
      setState(s => ({ ...s, loading: true }));
      try {
        const res = await fetch("/api/suggest?q=" + encodeURIComponent(q), { signal: ctrl.signal });
        const items = await res.json();
        cache.current.set(q, items);
        setState({ items, loading: false, error: null });
      } catch (e) { if (e.name !== "AbortError") setState({ items: [], loading: false, error: e }); }
    }, delay);
    return () => { clearTimeout(t); ctrl.abort(); };          // cancels stale requests
  }, [query, delay, min]);
  return state;
}`],
    ['Infinite scroll', 'javascript', `function useInfiniteScroll(loadMore, hasMore) {
  const sentinel = useRef(null);
  useEffect(() => {
    if (!hasMore || !sentinel.current) return;
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) loadMore(); },
                                        { rootMargin: "400px" });   // prefetch before the end
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [loadMore, hasMore]);
  return sentinel;                                             // <div ref={sentinel} /> after the list
}`]],
  edge: [`Infinite scroll breaks the back button and footer access; restore scroll position and offer “load more”.`, `Optimistic updates must reconcile with server IDs and roll back on errors.`, `Duplicate items when new posts shift offset-based pages; use cursors.`, `Very long lists without virtualization freeze low-end phones.`, `Autocomplete flicker from out-of-order responses.`],
  faq: [['How would you design an image carousel?', PP(`Requirements first (autoplay? swipe? thumbnails? infinite loop?). Components: Carousel, Slide, controls. State: current index. Use CSS scroll-snap or transforms for movement, lazy-load non-visible slides, preload neighbors, support keyboard arrows and swipe, pause autoplay on hover/focus and with prefers-reduced-motion, and expose roles/labels (“slide 2 of 5”) and live-region announcements.`)],
    ['Client state vs server state?', PP(`Server state is a cached copy of data owned by the backend: it can be stale, needs fetching, caching, deduping and invalidation (use a query library). Client state is owned by the UI: open panels, form drafts, selections. Mixing them in one global store creates sync bugs.`)]],
  qs: [SQ('In an autocomplete, results for “ap” sometimes replace results for “app”. Cause and fix?', ['CSS bug; add z-index', 'Out-of-order responses; abort or ignore stale requests', 'Missing keys', 'Too much caching'], 1, 'The slower older request finished last; cancel it or check it is still the latest.')]
});
