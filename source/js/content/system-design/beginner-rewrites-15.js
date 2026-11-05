/* ===== Beginner-first rewrites — batch 15 (LLD sub-track: 14 design patterns). SDPATCH: prose only, keeps code/quizzes. ===== */

SDPATCH('pat-strategy', {
  blurb: `<b>Strategy</b> puts a family of interchangeable algorithms behind one interface so you can swap them at runtime. It turns a sprawling “if this case… else if that case…” over <i>which algorithm to use</i> into a set of small, swappable classes (or functions) you inject — the behavioural pattern you’ll reach for most often.`,
  sections: [
    ['What is the Strategy pattern?', PLAIN(`Sometimes there are several different ways to do the <i>same kind of job</i> — calculate a price, sort a list, compress data. Strategy says: give each way a common interface, and let the object that needs the job (the “context”) hold one of them and <b>delegate</b> to it. Because they all share an interface, you can swap one for another at runtime without changing the context.`) +
      ANALOGY(`It’s like the mode selector in a maps app. “Get me from A to B” is the job; <b>driving</b>, <b>walking</b>, and <b>cycling</b> are interchangeable strategies for it. You tap a different mode and the app computes the route a different way — but <i>you</i> didn’t change; you just swapped the strategy. Checkout payment methods work the same way: card, PayPal, or gift card are interchangeable strategies behind one “pay” step.`)],
    ['Words you’ll need', KEYTERMS([
      ['Strategy', 'One interchangeable algorithm, behind a shared interface.'],
      ['Context', 'The object that holds a strategy and delegates the varying step to it.'],
      ['Inject', 'Pass the chosen strategy in (via constructor or setter) rather than hard-coding it.'],
      ['Behavioural pattern', 'A pattern about how objects interact / how behaviour is organised.'],
      ['Open/closed', 'Add a new algorithm as a new class, without editing existing code — what Strategy gives you.']])],
    ['When to use it (vs State)', WHY(`Reach for Strategy when you spot <b>several ways to perform one operation</b> chosen by a condition — a price that depends on customer tier, a shipping cost that depends on carrier. Instead of an <code>if tier == …</code> you edit for every new rule, each rule becomes a class and adding one is open/closed. In Python a strategy can even just be a <b>function</b>, since functions are first-class. It’s often confused with <b>State</b>: both have a context delegating to a swappable object, but in Strategy the client <i>picks</i> the algorithm and it usually stays put; in State the object <i>transitions itself</i> between behaviours.`) +
      RECAP([
        `Strategy makes a family of algorithms <b>interchangeable</b> behind one interface.`,
        `A <b>context</b> holds the chosen strategy and <b>delegates</b> the varying step to it; you <b>inject</b> and can swap it at runtime.`,
        `It replaces a growing <b>if/elif</b> that selects an algorithm — adding one becomes a new class (open/closed).`,
        `In Python a strategy can simply be a <b>function</b>.`,
        `vs State: in Strategy the client <b>picks</b> the algorithm; in State the object <b>transitions itself</b>.`])]
  ]
});

SDPATCH('pat-factory', {
  blurb: `<b>Factory Method</b> gives you a single place that creates objects, deciding which concrete class to build from some input — so callers ask for “a thing” without naming or importing the concrete class. It decouples <i>creating</i> an object from <i>using</i> it.`,
  sections: [
    ['What is the Factory pattern?', PLAIN(`Normally you create an object by calling its class directly (<code>EmailNotifier()</code>). But that ties the caller to that exact class, and choosing between several types forces a conditional at every spot you create one. A <b>factory</b> moves that decision into one function: callers pass a key (<code>"email"</code>) and get back an object implementing the shared interface, without knowing which concrete class was built.`) +
      ANALOGY(`It’s like ordering at a coffee counter. You say “a flat white” (a key); the barista makes the right drink and hands it over. You don’t go behind the counter and assemble it yourself, and you don’t need to know <i>which</i> machine or recipe produced it. Add a new drink to the menu and only the counter changes — not every customer.`)],
    ['Words you’ll need', KEYTERMS([
      ['Factory', 'The single function/place that creates objects and decides the concrete class.'],
      ['Creational pattern', 'A pattern about how objects are created.'],
      ['Registry', 'A map of {key → class} the factory looks up — the Pythonic way to avoid an if/elif.'],
      ['Decouple creation from use', 'Callers depend on the interface and a key, not on concrete classes they import.'],
      ['vs Abstract Factory', 'Factory Method makes one product; Abstract Factory makes a whole matching family.']])],
    ['Why not just call the constructor?', WHY(`Because the factory <b>decouples callers from concrete classes</b>. Calling <code>EmailNotifier()</code> directly means importing and depending on it, and picking among types scatters conditionals across every call site. A factory centralises that: add a new type by updating <b>one place</b> (ideally a registry dict, so it’s a single new entry rather than a new <code>elif</code>), and give yourself one hook for creation-time concerns like validation or pooling. Keep it returning the <b>interface</b> type, not a concrete class, or you re-couple callers.`) +
      RECAP([
        `A factory is one place that creates objects and decides the concrete class from input.`,
        `Callers get an object by <b>key</b> without naming/importing the concrete class — creation is decoupled from use.`,
        `Prefer a <b>registry dict</b> ({key: class}) over an internal if/elif so adding a type is one entry.`,
        `Return the shared <b>interface</b> type, not a concrete class, to keep callers decoupled.`,
        `Use <b>Factory Method</b> for one varying product; <b>Abstract Factory</b> for a matching family.`])]
  ]
});

SDPATCH('pat-abstract-factory', {
  blurb: `<b>Abstract Factory</b> creates whole <b>families of related objects</b> that are meant to be used together, behind one interface — so you can switch the entire family at once and never accidentally mix incompatible parts.`,
  sections: [
    ['What is the Abstract Factory pattern?', PLAIN(`Sometimes you don’t need one object — you need a <b>matching set</b> of several that must be consistent with each other (all “dark theme”, all “Windows”). Abstract Factory is an interface with one creation method per product in the family; each concrete factory produces a coherent set. Client code depends only on the abstract factory and abstract products, so switching the whole family means injecting a different factory.`) +
      ANALOGY(`Think of ordering a <b>matching furniture set</b> rather than individual pieces. You pick the “Scandinavian” range and get a sofa, chair, and table that all go together; pick “Industrial” and you get a different but equally coordinated set. You can’t end up with a Scandinavian sofa and an Industrial table by accident — the range (the factory) guarantees the pieces match.`)],
    ['Words you’ll need', KEYTERMS([
      ['Family of products', 'Several related objects meant to be used together (Button + Checkbox + Menu).'],
      ['Concrete factory', 'One factory per variant (LightUI, DarkUI) that produces a matching set.'],
      ['Consistency guarantee', 'The point: you can’t mix a dark button with a light menu.'],
      ['vs Factory Method', 'One product vs a whole family; Abstract Factory is several factory methods bundled.'],
      ['Open to families, closed to products', 'Easy to add a new variant; adding a new product kind changes every factory.']])],
    ['When it’s worth it', WHY(`Use Abstract Factory only when you genuinely have <b>multiple families that must stay consistent</b> — UI themes, cross-platform widget toolkits, storage backends whose connection/query-builder/migrator must match. If you’re only varying a single object, a plain Factory Method is enough; Abstract Factory earns its extra classes solely when there’s a real family to keep coherent. Its one sharp edge: it’s <b>open to new families but closed to new products</b> — adding a brand-new product kind forces a new method in <i>every</i> concrete factory.`) +
      RECAP([
        `Abstract Factory creates <b>families of related products</b> that must be used together.`,
        `Each <b>concrete factory</b> hands out a mutually <b>consistent set</b>, making mismatches impossible.`,
        `Clients depend only on the abstract factory + abstract products, so switching families is one injection.`,
        `Use it only for genuine families (themes, platforms); a single varying product → Factory Method.`,
        `It’s open to new <b>families</b> but closed to new <b>products</b> (a new product kind touches every factory).`])]
  ]
});

SDPATCH('pat-builder', {
  blurb: `<b>Builder</b> constructs a complex object step by step, separating <i>how</i> it’s assembled from the final result. It replaces unreadable “telescoping” constructors (a dozen positional arguments) and makes it easy to build objects with many optional fields — often immutable ones validated at the end.`,
  sections: [
    ['What is the Builder pattern?', PLAIN(`When an object has lots of fields — many optional — a single constructor with a dozen arguments becomes unreadable and error-prone (which <code>None</code> was which again?). Builder lets you set the pieces one call at a time, in any order, and then produce the finished object with a final <code>build()</code> that can validate everything at once.`) +
      ANALOGY(`It’s a <b>build-your-own order</b>, like a Subway sandwich or a custom pizza. You go down the line adding pieces one at a time — bread, then fillings, then sauces — in a readable sequence, and only at the end do you get the finished, assembled sandwich. You’re never forced to specify everything up front in one confusing breath, and the final step checks it all makes sense before handing it over.`)],
    ['Words you’ll need', KEYTERMS([
      ['Builder', 'An object that collects the parts and assembles the final object.'],
      ['Telescoping constructor', 'The anti-pattern Builder replaces: one constructor overloaded with many (often optional) parameters.'],
      ['Fluent interface', 'Builder methods that return the builder itself, so calls chain readably.'],
      ['build()', 'The final step that validates and produces the finished (often immutable) object.'],
      ['Immutable', 'An object that can’t change after construction — Builder makes these easy to assemble.']])],
    ['When to use it', WHY(`Reach for Builder when an object has <b>many fields, several optional</b>, or needs validation that only makes sense once everything is set. The step-by-step, often <b>fluent</b> (chainable) style reads far better than a giant constructor call, and doing validation in <code>build()</code> means you never create a half-valid object. It pairs naturally with <b>immutable</b> results: collect everything in the mutable builder, then freeze it into an unchangeable object at the end.`) +
      RECAP([
        `Builder assembles a complex object <b>step by step</b>, separating construction from the final representation.`,
        `It replaces <b>telescoping constructors</b> (many confusing parameters) with readable, order-independent steps.`,
        `A <b>fluent</b> (chainable) interface makes the assembly read naturally.`,
        `<code>build()</code> validates everything at once and returns the finished object — often <b>immutable</b>.`,
        `Use it for objects with many optional fields or end-of-construction validation.`])]
  ]
});

SDPATCH('pat-singleton', {
  blurb: `<b>Singleton</b> ensures a class has exactly one instance and a global point of access to it. It’s the most controversial pattern — often an <b>anti-pattern</b>, because it hides dependencies and hurts testability — so the real lesson is knowing how it works <i>and</i> why a single <b>injected</b> instance is usually better.`,
  sections: [
    ['What is the Singleton pattern?', PLAIN(`Singleton restricts a class so that only one instance of it can ever exist, and gives everyone a global way to reach that one instance. It’s used for things there should only be one of — a configuration object, a connection pool, a logger. The catch is that a global single instance is really <b>global state</b>, which brings well-known problems.`) +
      ANALOGY(`Think of “the government” of a country: there’s meant to be exactly one at a time, and everyone refers to the same one. That’s convenient — but it also means everything quietly depends on this one global authority, and in a “test country” you can’t easily swap in a pretend government to try things out. That hidden, hard-to-replace global dependency is exactly why Singletons are controversial.`)],
    ['Words you’ll need', KEYTERMS([
      ['Singleton', 'A class limited to exactly one instance, globally accessible.'],
      ['Global state', 'Data reachable from anywhere — convenient but makes code harder to reason about and test.'],
      ['Hidden dependency', 'Code that uses a singleton doesn’t declare it needs it, so it’s easy to miss.'],
      ['Testability', 'How easily you can substitute a fake in tests — singletons hurt it because they’re hard to replace.'],
      ['Dependency injection', 'The usual better alternative: create one instance and pass it to whoever needs it.']])],
    ['Why it’s usually an anti-pattern', WHY(`A Singleton couples every user to a single global object they didn’t declare needing (a <b>hidden dependency</b>), makes <b>testing</b> hard (you can’t easily swap in a fake, and state leaks between tests), and can cause subtle bugs in concurrent code. The better default in almost every case is to <b>create one instance yourself and inject it</b> wherever it’s needed — you still have exactly one, but now the dependency is explicit and replaceable in tests. Know how to implement a Singleton for interviews, but reach for an injected single instance in real code.`) +
      RECAP([
        `Singleton guarantees <b>exactly one instance</b> with a global access point.`,
        `It’s really <b>global state</b>, which brings hidden dependencies, poor testability, and concurrency pitfalls.`,
        `It’s widely considered an <b>anti-pattern</b> — know it, but don’t reach for it by default.`,
        `Prefer creating one instance and <b>injecting</b> it: same “only one”, but explicit and testable.`,
        `Legitimate-ish uses (logger, config) still read better as a single injected dependency.`])]
  ]
});

SDPATCH('pat-adapter', {
  blurb: `<b>Adapter</b> wraps an object with an incompatible interface so it fits the interface your code expects — letting classes that otherwise couldn’t work together collaborate. It’s the glue for integrating third-party or legacy code <i>without changing it</i>.`,
  sections: [
    ['What is the Adapter pattern?', PLAIN(`Your code expects objects to have a certain interface (say a <code>charge(amount)</code> method), but a third-party library gives you something with a different shape (<code>make_payment(cents, currency)</code>). You can’t (or don’t want to) change the library. An <b>adapter</b> is a small wrapper that presents <i>your</i> expected interface on the outside and translates each call into the library’s interface on the inside.`) +
      ANALOGY(`It’s a <b>travel power adapter</b>. Your laptop’s plug (your code) doesn’t fit the wall socket in another country (the third-party library). You don’t rewire the laptop or the building — you slot in a little adapter that makes the plug fit the socket. The adapter changes neither side; it just translates between them.`)],
    ['Words you’ll need', KEYTERMS([
      ['Adapter', 'A wrapper that presents your expected interface and translates to the wrapped object’s interface.'],
      ['Adaptee', 'The existing/third-party object with the incompatible interface.'],
      ['Target interface', 'The interface your own code is written against.'],
      ['Structural pattern', 'A pattern about how objects are composed/wired together.'],
      ['Wrap, don’t modify', 'The adapter leaves the original code untouched.']])],
    ['When to use it', WHY(`Use an Adapter whenever you need to <b>integrate code you can’t change</b> — a third-party SDK, a legacy module — into a system built around a different interface. Instead of scattering translation logic everywhere or editing the external code, you confine all the “impedance matching” to one wrapper class. Bonus: your own code now depends only on <i>your</i> interface, so you can swap the underlying library later by writing a new adapter, with nothing else changing.`) +
      RECAP([
        `Adapter makes an incompatible interface fit the one your code expects.`,
        `It <b>wraps</b> the existing object (the adaptee) and <b>translates</b> calls, changing neither side.`,
        `It’s the glue for third-party or legacy code you can’t or shouldn’t modify.`,
        `Your code depends only on <i>your</i> interface, so the underlying library becomes swappable.`,
        `All the translation lives in one place, not scattered across callers.`])]
  ]
});

SDPATCH('pat-decorator', {
  blurb: `<b>Decorator</b> wraps an object to add behaviour while keeping the <b>same interface</b>, so you can layer features — logging, caching, compression — at runtime without subclassing. It’s extension by composition, and it’s the idea behind Python’s <code>@decorators</code>.`,
  sections: [
    ['What is the Decorator pattern?', PLAIN(`You want to add a feature (logging, caching) to an object without permanently changing its class or creating a subclass for every combination. Decorator wraps the object in another object that has the <b>same interface</b>: the wrapper adds its behaviour, then passes the call through to the thing it wraps. Because wrappers share the interface, you can <b>stack</b> several, each adding one feature.`) +
      ANALOGY(`Think of <b>gift-wrapping</b> (or adding toppings). You start with a plain box (the base object). Wrap it in bubble wrap (adds protection), then in gift paper (adds presentation), then add a bow. Each layer adds something, but from the outside it’s still “a package” you handle the same way. You can add or remove layers freely without changing the box inside.`)],
    ['Words you’ll need', KEYTERMS([
      ['Decorator', 'A wrapper that adds behaviour and keeps the same interface as what it wraps.'],
      ['Same interface', 'The key constraint: a decorated object is used exactly like the original.'],
      ['Stacking / layering', 'Wrapping multiple decorators so each adds one feature.'],
      ['Composition-based extension', 'Adding behaviour by wrapping at runtime, not by subclassing.'],
      ['Python @decorator', 'Language syntax built on this same idea (wrapping a function to add behaviour).']])],
    ['When to use it', WHY(`Use Decorator when you want to add <b>optional, combinable features</b> to objects and subclassing would explode (a class for Logged, Cached, LoggedAndCached, Compressed, …). Each feature becomes one decorator, and you compose only the combinations you actually need, at runtime. Because every decorator keeps the same interface, callers never know or care how many layers are wrapped around the core object — which is exactly why it composes so cleanly.`) +
      RECAP([
        `Decorator wraps an object to <b>add behaviour</b> while keeping the <b>same interface</b>.`,
        `Wrappers can be <b>stacked</b>, each adding one feature (logging, caching, compression).`,
        `It’s extension by <b>composition</b> at runtime — no subclass-per-combination explosion.`,
        `Callers use a decorated object exactly like the original.`,
        `Python’s <code>@decorator</code> syntax is the same idea applied to functions.`])]
  ]
});

SDPATCH('pat-observer', {
  blurb: `<b>Observer</b> lets one object (the subject) automatically notify many dependent objects when its state changes — without the subject knowing who or what they are. It’s the foundation of event systems, pub/sub, and reactive UIs.`,
  sections: [
    ['What is the Observer pattern?', PLAIN(`You have one thing whose state changes (a stock price, a data model) and several other things that need to react when it does (charts, displays, logs). Rather than the source calling each of them directly (which would couple it to all of them), the source keeps a list of <b>observers</b> that have <b>subscribed</b>, and simply <b>notifies</b> them all when something changes. New observers can subscribe or unsubscribe at any time, and the source never needs to know their concrete types.`) +
      ANALOGY(`It’s a <b>newsletter subscription</b> (or hitting “subscribe” on a channel). The publisher doesn’t know or care who its subscribers are — when a new issue comes out, everyone on the list is notified automatically. People can subscribe or unsubscribe freely, and the publisher’s job doesn’t change as the list grows or shrinks.`)],
    ['Words you’ll need', KEYTERMS([
      ['Subject (observable)', 'The object whose state changes and that sends notifications.'],
      ['Observer (subscriber)', 'An object that wants to be told when the subject changes.'],
      ['Subscribe / unsubscribe', 'Observers register (and deregister) interest at runtime.'],
      ['Notify', 'The subject pushing an update to all current observers.'],
      ['Decoupling', 'The subject depends only on the observer interface, not on who the observers are.']])],
    ['When to use it', WHY(`Use Observer when a change in one place must <b>trigger reactions in many others</b> that you don’t want the source to know about individually — UI elements reacting to a model, services reacting to an event, multiple displays tracking one value. It keeps the subject <b>decoupled</b> from its observers (it only knows the observer interface), so you can add or remove reactions without touching the source. It’s the in-process cousin of the pub/sub and event-bus patterns used across services.`) +
      RECAP([
        `Observer lets a <b>subject</b> notify many <b>observers</b> automatically when its state changes.`,
        `Observers <b>subscribe/unsubscribe</b> at runtime; the subject just <b>notifies</b> the current list.`,
        `The subject stays <b>decoupled</b> — it knows the observer interface, not who the observers are.`,
        `It underpins event systems, pub/sub, and reactive UIs.`,
        `Add or remove reactions without changing the source.`])]
  ]
});

SDPATCH('pat-state', {
  blurb: `<b>State</b> lets an object change its behaviour when its internal mode changes, by delegating to a <b>state object</b> that represents the current mode. It replaces a sprawling state-machine built from conditionals with one tidy class per state.`,
  sections: [
    ['What is the State pattern?', PLAIN(`Some objects behave differently depending on what mode they’re in — a vending machine acts differently when it has no coin vs. a coin inserted vs. sold out. The messy way is giant <code>if state == …</code> checks in every method. State says: make <b>one class per mode</b>, each handling the same events in its own way and deciding which mode comes next. The object just holds its current state object and delegates to it.`) +
      ANALOGY(`Think of a <b>traffic light</b>. In the “green” state it behaves one way and, after its timer, moves itself to “amber”; “amber” moves itself to “red”; “red” to “green”. Each colour knows how to behave and which colour comes next. You don’t have one tangled controller full of conditionals — each state is its own self-contained behaviour that hands off to the next.`)],
    ['Words you’ll need', KEYTERMS([
      ['State object', 'A class representing one mode, handling events in that mode’s way.'],
      ['Transition', 'Moving from one state to the next — in this pattern, states trigger their own transitions.'],
      ['Context', 'The object that holds the current state and delegates to it.'],
      ['State machine', 'A model of modes and the allowed transitions between them.'],
      ['vs Strategy', 'Same shape, but State transitions itself; Strategy is chosen from outside.']])],
    ['When to use it', WHY(`Reach for State when an object has a clear set of <b>modes</b> and its methods are full of conditionals checking “what state am I in?”. Turning each mode into a class makes the behaviour for that mode self-contained and the legal transitions explicit — easy to read, extend, and get right. The structure matches <b>Strategy</b>, but the intent differs: here the object <b>transitions between behaviours on its own</b> as events arrive, rather than a client picking one fixed behaviour.`) +
      RECAP([
        `State lets an object change behaviour by delegating to a <b>state object</b> for its current mode.`,
        `Each mode is <b>one class</b> that handles events its own way and sets the next state.`,
        `It replaces sprawling <b>state-machine conditionals</b> with tidy per-state classes.`,
        `The <b>context</b> just holds the current state and delegates to it.`,
        `Same shape as Strategy, but <b>State transitions itself</b> rather than being chosen from outside.`])]
  ]
});

SDPATCH('pat-command', {
  blurb: `<b>Command</b> turns a request into a standalone object that carries everything needed to perform it later. That makes it easy to support undo/redo, queue or schedule requests, log them, and decouple the thing that triggers an action from the thing that carries it out.`,
  sections: [
    ['What is the Command pattern?', PLAIN(`Instead of calling an action directly, you wrap “do this action with these details” into an <b>object</b> — a command. Because the request is now an object, you can store it, pass it around, put it on a queue, log it, or keep a history of commands to support <b>undo</b> (each command knows how to reverse itself). The object that triggers the command (the “invoker”, e.g. a button) is decoupled from the object that actually does the work (the “receiver”).`) +
      ANALOGY(`It’s a <b>restaurant order ticket</b>. Rather than the waiter running to the kitchen and cooking, they write the order on a ticket (a command object). That ticket can be queued on the rail, logged, handed to whichever cook is free, and — if the customer changes their mind — voided (undone). The request became a thing you can hold, pass along, and reverse.`)],
    ['Words you’ll need', KEYTERMS([
      ['Command', 'An object representing a request, with everything needed to execute (and often undo) it.'],
      ['Invoker', 'What triggers the command (a button, a menu, a scheduler) — doesn’t know how the work is done.'],
      ['Receiver', 'The object that actually performs the work when the command runs.'],
      ['Undo/redo', 'Supported by each command knowing how to reverse itself, plus a history stack.'],
      ['Queue / log', 'Because commands are objects, they can be stored, scheduled, and recorded.']])],
    ['When to use it', WHY(`Use Command when you need to treat actions as data — for <b>undo/redo</b> (editors, drawing apps), for <b>queuing or scheduling</b> work, for <b>logging</b> what was done (and replaying it), or to decouple menus/buttons/shortcuts (invokers) from the operations they trigger (receivers). Turning a request into an object is what unlocks all of these: you can’t queue, log, or reverse a bare method call, but you can do all three with a command object.`) +
      RECAP([
        `Command turns a request into a standalone <b>object</b> carrying everything needed to run it later.`,
        `It enables <b>undo/redo</b> (commands reverse themselves + a history stack), queuing, scheduling, and logging.`,
        `It decouples the <b>invoker</b> (button/menu) from the <b>receiver</b> (what does the work).`,
        `The key move: an action becomes <b>data</b> you can store, pass, and reverse.`,
        `Reach for it in editors, task queues, and anywhere actions must be recorded or undone.`])]
  ]
});

SDPATCH('pat-proxy', {
  blurb: `<b>Proxy</b> provides a stand-in for another object that <b>controls access</b> to it — adding things like lazy loading, caching, access control, or remote communication — while keeping the <b>same interface</b>, so callers can’t tell they’re talking to the stand-in.`,
  sections: [
    ['What is the Proxy pattern?', PLAIN(`A proxy is a substitute object that sits in front of a “real” object and has the <b>same interface</b>. Calls go to the proxy first, which can do something extra — delay creating the expensive real object until it’s actually needed (lazy loading), cache results, check permissions, or forward the call to a remote machine — before (maybe) passing the call along. Callers use the proxy exactly as they’d use the real thing.`) +
      ANALOGY(`Think of a <b>celebrity’s personal assistant</b>. You don’t reach the celebrity directly — you go through the assistant, who has the “same interface” (you can make requests). The assistant screens who’s allowed through (access control), handles simple things without bothering the celebrity (caching), and only actually interrupts them when necessary (lazy access to the expensive real resource). To you, it feels like dealing with the celebrity’s office.`)],
    ['Words you’ll need', KEYTERMS([
      ['Proxy', 'A stand-in with the same interface as the real object, controlling access to it.'],
      ['Real subject', 'The actual object the proxy fronts.'],
      ['Virtual proxy', 'Delays creating/loading the expensive real object until first needed (lazy loading).'],
      ['Protection proxy', 'Checks permissions before allowing a call through.'],
      ['Remote proxy', 'Represents an object that actually lives on another machine.']])],
    ['When to use it', WHY(`Use a Proxy when you want to add an <b>access-control concern</b> around an object <i>without</i> changing the object or the callers: lazy-create something costly (don’t load the huge image until it’s shown), cache expensive results, enforce permissions, or stand in for a remote service. Because it shares the real object’s interface, you can slot it in transparently. It resembles Decorator (both wrap and share the interface), but the <i>intent</i> differs: Decorator <b>adds behaviour/features</b>, Proxy <b>controls access</b>.`) +
      RECAP([
        `Proxy is a <b>same-interface stand-in</b> that controls access to a real object.`,
        `Flavours: <b>virtual</b> (lazy loading), <b>protection</b> (access checks), <b>caching</b>, and <b>remote</b>.`,
        `Callers use the proxy transparently, unaware it isn’t the real object.`,
        `It adds an access concern without changing the real object or its callers.`,
        `Like Decorator in shape, but the intent is <b>controlling access</b>, not adding features.`])]
  ]
});

SDPATCH('pat-chain', {
  blurb: `<b>Chain of Responsibility</b> passes a request along a line of handlers until one of them handles it — decoupling the sender from whichever handler ends up doing the work. It’s the pattern behind middleware pipelines and escalation flows.`,
  sections: [
    ['What is the Chain of Responsibility pattern?', PLAIN(`You have a request that <i>one</i> of several handlers should deal with, but you don’t want the sender to know which. So you link the handlers into a chain: each one gets the request, decides whether it can handle it, and if not, <b>passes it to the next</b>. The sender just drops the request at the front of the chain and lets it flow until someone handles it.`) +
      ANALOGY(`It’s <b>escalating a complaint up a support ladder</b>. You explain your issue to the front-line agent; if it’s within their authority, they resolve it — if not, they pass it up to a supervisor, who passes it to a manager, and so on until someone with the right authority handles it. You (the sender) don’t need to know who that will be; you just start at the bottom and it travels up.`)],
    ['Words you’ll need', KEYTERMS([
      ['Handler', 'One link in the chain that either handles the request or passes it on.'],
      ['Chain', 'The ordered line of handlers the request travels along.'],
      ['Pass along / escalate', 'What a handler does when it can’t handle the request itself.'],
      ['Decoupled sender', 'The sender doesn’t know which handler will deal with the request.'],
      ['Middleware', 'A common real-world use: a pipeline of handlers each processing a request in turn.']])],
    ['When to use it', WHY(`Use Chain of Responsibility when a request could be handled at one of <b>several levels</b> and you want to decouple the sender from the choice — approval limits (each level approves up to an amount, else escalates), event handling, or request <b>middleware</b> (auth → logging → rate-limit → handler, each stage handling or passing on). Adding, removing, or reordering handlers is just changing the chain, with the sender untouched. A handler can also choose to do its bit <i>and</i> pass along, which is exactly how middleware pipelines work.`) +
      RECAP([
        `Chain of Responsibility sends a request down a line of <b>handlers</b> until one handles it.`,
        `Each handler either deals with the request or <b>passes it to the next</b>.`,
        `The <b>sender is decoupled</b> from which handler ultimately does the work.`,
        `Add/remove/reorder handlers by changing the chain, not the sender.`,
        `It’s the pattern behind <b>middleware pipelines</b> and escalation flows.`])]
  ]
});

SDPATCH('pat-composite', {
  blurb: `<b>Composite</b> lets you treat an individual object and a whole group of objects the <b>same way</b> through one interface, so client code handles a single leaf and an entire tree identically. It’s the pattern for part-whole hierarchies like file systems and UI trees.`,
  sections: [
    ['What is the Composite pattern?', PLAIN(`Some structures are trees: a thing can be a single item (a “leaf”) or a container of other things (which may themselves be leaves or containers). Composite gives both the <b>same interface</b>, so a client can call, say, <code>size()</code> on either one. A leaf just returns its own answer; a container asks each of its children and combines the results (recursively). The client doesn’t have to care whether it’s holding one item or a whole subtree.`) +
      ANALOGY(`It’s a <b>computer’s files and folders</b>. “How big is this?” makes sense for a single file (its own size) and for a folder (the sum of everything inside, drilling down through sub-folders). You interact with a file and a folder the same way — select, move, delete, get-size — even though one is a leaf and the other is a whole tree. Composite is that uniform treatment.`)],
    ['Words you’ll need', KEYTERMS([
      ['Component', 'The shared interface that both leaves and containers implement.'],
      ['Leaf', 'A single object with no children (a file).'],
      ['Composite', 'A container that holds children (a folder) and may hold other composites.'],
      ['Part-whole hierarchy', 'A tree where wholes are made of parts that can themselves be wholes.'],
      ['Uniform treatment', 'The payoff: clients handle a leaf and a tree identically.']])],
    ['When to use it', WHY(`Use Composite whenever you have a genuine <b>tree / part-whole hierarchy</b> and want clients to ignore the difference between a single element and a group — file systems, UI component trees, nested menus, org charts, grouped shapes in a drawing app. Operations like size, render, or price are naturally <b>recursive</b>: a container simply delegates to its children and aggregates. The big win is that client code has <b>no special cases</b> for “is this one thing or many?”.`) +
      RECAP([
        `Composite gives individual objects and groups the <b>same interface</b>, so clients treat them identically.`,
        `A <b>leaf</b> is a single object; a <b>composite</b> holds children (which may be composites too).`,
        `Operations are naturally <b>recursive</b> — a container delegates to and aggregates its children.`,
        `It models <b>part-whole hierarchies</b>: file systems, UI trees, menus, org charts.`,
        `The payoff: client code has no special-casing for one item vs a whole tree.`])]
  ]
});

SDPATCH('pat-facade', {
  blurb: `<b>Facade</b> puts one simple, high-level interface in front of a complex subsystem of many classes, hiding the internals so clients get an easy entry point. It reduces coupling without removing the detailed API for the few who need it.`,
  sections: [
    ['What is the Facade pattern?', PLAIN(`A subsystem can involve many classes that must be used together in the right order (check inventory, charge payment, arrange shipping). Making every client learn and orchestrate all of that is painful and couples them to the internals. A <b>facade</b> is a single class offering one or a few simple methods (like <code>place_order()</code>) that does the orchestration behind the scenes. Clients call the facade; the complexity stays hidden.`) +
      ANALOGY(`It’s a <b>hotel concierge</b>. Instead of you personally calling the restaurant, the taxi company, and the theatre box office and coordinating them, you make one request to the concierge — “dinner and a show tonight” — and they deal with all the separate services behind the scenes. You get one simple point of contact; the messy coordination is hidden. (You can still call those services yourself if you ever need to.)`)],
    ['Words you’ll need', KEYTERMS([
      ['Facade', 'The single simplified interface in front of the subsystem.'],
      ['Subsystem', 'The many collaborating classes whose complexity is hidden.'],
      ['High-level interface', 'One or a few easy methods covering the common use cases.'],
      ['Reduced coupling', 'Clients depend on the facade, not on all the internal classes.'],
      ['Not a wall', 'The detailed API still exists for advanced users who need it.']])],
    ['When to use it', WHY(`Use a Facade when a subsystem is <b>complex to use correctly</b> and most clients just want the common workflow — a single <code>place_order()</code> rather than wiring inventory, payment, and shipping themselves. It gives newcomers an easy entry point and <b>decouples</b> callers from the internal classes, so you can refactor the subsystem without breaking them. Crucially, a facade <b>simplifies without restricting</b>: it doesn’t hide the detailed API, so power users who need fine control can still reach the underlying classes.`) +
      RECAP([
        `Facade offers one <b>simple, high-level interface</b> over a complex subsystem of many classes.`,
        `It orchestrates the internals behind an easy entry point (e.g. a single <code>place_order()</code>).`,
        `It <b>reduces coupling</b> — clients depend on the facade, not the subsystem’s internals.`,
        `It <b>simplifies without restricting</b>: the detailed API is still available for those who need it.`,
        `Use it to give a tricky subsystem an easy, stable front door.`])]
  ]
});
