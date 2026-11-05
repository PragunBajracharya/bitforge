/* ===== Beginner-first rewrites — batch 14 (LLD sub-track: OOP fundamentals). SDPATCH: prose only, keeps code/quizzes. ===== */

SDPATCH('oop-class', {
  blurb: `A <b>class</b> is a blueprint; an <b>object</b> is one real thing built from that blueprint, with its own data. This is the atom of object-oriented design. The core interview move: turn the <b>nouns</b> in the requirements into classes and the <b>verbs</b> into the methods on them.`,
  sections: [
    ['What is a class, what is an object?', PLAIN(`A <b>class</b> defines a <i>kind</i> of thing — what data it holds and what it can do. An <b>object</b> (or “instance”) is one concrete example of that kind, with its own values. You write the class once; you can make as many objects from it as you like, each with its own state.`) +
      ANALOGY(`A class is a <b>cookie cutter</b>; objects are the <b>cookies</b> you stamp out with it. The cutter defines the shape (the structure), but each cookie is its own physical thing you can decorate differently (its own data). Or: a class is an architect’s <b>blueprint</b>, and each <b>house</b> built from it is an object — same design, but one house can be painted blue and another red.`)],
    ['Words you’ll need', KEYTERMS([
      ['Class', 'The blueprint — defines the attributes and methods for a kind of thing.'],
      ['Object / instance', 'One concrete thing created from a class, with its own data.'],
      ['Attribute (field)', 'A piece of data an object holds (e.g. an account’s balance).'],
      ['Method', 'A function that belongs to the object and acts on its data (e.g. deposit).'],
      ['Constructor (__init__)', 'The special method that sets up a new object’s starting state.'],
      ['Instance vs class attribute', 'Data unique to each object vs data shared by every object of that class.']])],
    ['The core LLD move, and a common trap', PP(`In a low-level-design interview, the fastest way to start is to read the requirements and pull out the <b>nouns</b> — a user, an account, a parking spot — and make each one a <b>class</b>. Then pull out the <b>verbs</b> — deposit, park, cancel — and make each a <b>method</b> on whichever class owns that job. Keeping an object’s data together with the methods that change it is what makes code easy to reason about.`) +
      WHY(`Mind the difference between <b>instance</b> and <b>class</b> attributes. Instance attributes (set with <code>self.x</code> in the constructor) are unique to each object. Class attributes (defined in the class body) are <b>shared by every object</b> — fine for a constant, but a classic bug when it’s something mutable like a list, because changing it through one object changes it for all of them. When in doubt, put per-object data in the constructor.`) +
      RECAP([
        `A <b>class</b> is a blueprint; an <b>object</b> is one instance of it with its own data.`,
        `Objects bundle <b>attributes</b> (data) with <b>methods</b> (behaviour that acts on that data).`,
        `The LLD heuristic: <b>nouns → classes</b>, <b>verbs → methods</b> on the owning class.`,
        `<b>Instance attributes</b> are per-object; <b>class attributes</b> are shared by all — a mutable shared one is a common bug.`,
        `Keeping state with the behaviour that changes it is what makes a class easy to reason about.`])]
  ]
});

SDPATCH('oop-encapsulation', {
  blurb: `Encapsulation means bundling an object’s data together with the methods that work on it, and <b>hiding the internal data</b> behind a controlled set of operations — so the object’s rules can’t be broken from outside. It’s what makes an object trustworthy.`,
  sections: [
    ['What is encapsulation?', PLAIN(`Every object has rules that must always hold — an account balance never goes negative, a shopping cart’s total always matches its items. These are called <b>invariants</b>. Encapsulation protects them by making the raw data <b>private</b> and only letting the outside world change it through <b>methods that check the rules</b>. If anyone could set the balance directly, any bug anywhere could corrupt it; by funnelling every change through <code>withdraw()</code>, the object guarantees it stays valid no matter who calls it.`) +
      ANALOGY(`Think of an <b>ATM</b>. You can’t reach inside and grab the cash drawer directly — you interact through buttons and a slot that <b>enforce the rules</b> (you can only withdraw what’s in your account, in allowed amounts). The machine hides its internals and exposes a safe, controlled interface. An encapsulated object is the same: the data is locked inside, and you can only touch it through operations that keep it valid.`)],
    ['Words you’ll need', KEYTERMS([
      ['Invariant', 'A rule that must always be true for the object (balance ≥ 0).'],
      ['Private / internal state', 'Data not meant to be touched directly from outside.'],
      ['Public interface', 'The set of methods callers are allowed to use — the stable “control panel”.'],
      ['Getter / setter', 'Methods that read/write a value, often adding validation.'],
      ['@property (Python)', 'Lets a method be accessed like a plain attribute, so you can add validation without changing callers.'],
      ['Leading underscore (_x)', 'Python convention meaning “internal — don’t touch directly”.']])],
    ['Why hide data, and how Python does it', WHY(`The reason to encapsulate isn’t secrecy — it’s <b>trust and freedom to change</b>. Because every change goes through rule-checking methods, the object is always correct, and because callers only depend on the public interface, you can later change <i>how</i> the data is stored (cents instead of dollars, a cached value) without breaking anyone. Python has no hard <code>private</code> keyword; instead it uses conventions — a leading underscore (<code>_balance</code>) signals “internal”, and <code>@property</code> lets you expose a validated or computed value that still reads like a plain attribute. The goal is a clear, stable public interface you can refactor behind.`) +
      RECAP([
        `Encapsulation bundles data with its methods and <b>hides the data</b> behind controlled operations.`,
        `It protects the object’s <b>invariants</b> — rules that must always hold — by funnelling every change through rule-checking methods.`,
        `This makes the object trustworthy and lets you change its internals later without breaking callers.`,
        `Python has no hard <code>private</code>: a leading underscore means “internal”, and <code>@property</code> adds validation while still looking like an attribute.`,
        `Don’t leak internals (e.g. by returning a reference to an internal list) — that defeats the protection.`])]
  ]
});

SDPATCH('oop-abstraction', {
  blurb: `Abstraction means exposing <b>what</b> an object does while hiding <b>how</b> it does it, so callers depend on a simple idea instead of messy details. (Encapsulation hides an object’s <i>data</i>; abstraction hides its <i>complexity</i> behind a clean interface.)`,
  sections: [
    ['What is abstraction?', PLAIN(`Abstraction lets you work with a simple <b>concept</b> — “a payment processor can <code>charge</code> an amount” — without knowing whether Stripe, PayPal, or a fake test version is behind it. You define the <b>interface</b> (the <i>what</i>) and hide each concrete <b>implementation</b> (the <i>how</i>). Callers depend only on the interface, so you can add or swap implementations without touching them.`) +
      ANALOGY(`Think of <b>driving a car</b>. You steer with a wheel and pedals (the interface) without knowing anything about combustion, fuel injection, or electric motors underneath. Swap a petrol car for an electric one and you still just steer and press pedals — the complex “how” is hidden behind a simple, stable “what”. A universal TV remote is the same idea: one set of buttons, many different TVs behind it.`)],
    ['Words you’ll need', KEYTERMS([
      ['Interface', 'The set of operations callers can use — the “what”.'],
      ['Implementation', 'The actual code behind an operation — the “how”, hidden from callers.'],
      ['Abstract base class (ABC)', 'A class that declares required methods but can’t be used directly until a subclass implements them.'],
      ['Protocol (Python)', 'A structural interface: “anything with these methods qualifies”, no inheritance needed.'],
      ['Depend on abstractions', 'Write code against the interface, not a specific concrete class — so implementations are swappable.'],
      ['Leaky abstraction', 'When implementation details bleed through the interface and re-couple callers to what you tried to hide.']])],
    ['Abstraction vs encapsulation, and the payoff', WHY(`They’re related but distinct. <b>Encapsulation</b> hides <i>data</i> (protecting invariants); <b>abstraction</b> hides <i>complexity</i> (a simple, swappable interface). You usually use both: an abstract <code>PaymentProcessor</code> interface (abstraction) whose concrete <code>StripeProcessor</code> keeps its API keys private (encapsulation). The payoff is <b>extensibility and testability</b>: because <code>checkout()</code> depends only on the interface, you can switch Stripe for PayPal, or inject a fake processor in tests, without changing it. In Python, use an <b>abstract base class</b> when implementations share real behaviour, or a <b>Protocol</b> when you only need “has these methods”.`) +
      RECAP([
        `Abstraction exposes <b>what</b> an object does and hides <b>how</b> — callers depend on a simple concept.`,
        `You define an <b>interface</b> and hide each concrete <b>implementation</b> behind it.`,
        `It differs from encapsulation: abstraction hides <b>complexity</b>, encapsulation hides <b>data</b>.`,
        `Depending on the interface (not a concrete class) makes implementations <b>swappable</b> and code <b>testable</b> (inject a fake).`,
        `Python offers <b>abstract base classes</b> (explicit, shared code) and <b>Protocols</b> (structural, “looks like this”); beware <b>leaky abstractions</b>.`])]
  ]
});

SDPATCH('oop-inheritance', {
  blurb: `Inheritance lets a new class reuse and extend an existing one, modelling an <b>“is-a”</b> relationship (a SavingsAccount <i>is an</i> Account). It’s powerful but easily overused — deep hierarchies turn rigid, so <b>composition</b> (“has-a”) is usually the better default for reuse.`,
  sections: [
    ['What is inheritance?', PLAIN(`Inheritance says a subclass <b>is a kind of</b> its base class, and automatically gets the base’s data and methods. The subclass can <b>override</b> methods to change behaviour and <b>add</b> new ones. Use it only for a genuine “is-a” relationship — if the relationship is really “has-a” or “uses-a”, you want composition instead.`) +
      ANALOGY(`Inheritance is like <b>specialised job roles</b>. An “Employee” has a name and can clock in; a “Manager” <i>is an</i> Employee (so gets all of that for free) but <i>also</i> can approve budgets. The Manager didn’t re-learn clocking in — it inherited it. <b>Composition</b>, by contrast, is like <b>building with Lego</b>: instead of saying a Car <i>is a</i> kind of Engine, you say a Car <i>has an</i> Engine as a part — and you can swap that part out freely.`)],
    ['Words you’ll need', KEYTERMS([
      ['Base class / subclass', 'The class inherited from, and the class that inherits (also called parent/child or superclass/subclass).'],
      ['is-a', 'The relationship inheritance should model (a Dog is an Animal).'],
      ['has-a', 'A “owns/uses a part” relationship — model this with composition, not inheritance.'],
      ['Override', 'A subclass replacing an inherited method with its own version.'],
      ['super()', 'Calls the base class’s version of a method, so you can extend rather than fully replace it.'],
      ['Composition', 'Building behaviour by holding other objects as parts — the preferred way to reuse code.']])],
    ['Why composition is the usual default', WHY(`Inheritance tightly couples a subclass to the base’s implementation, and <b>deep hierarchies become fragile</b>: a change high up ripples through everything below (the “fragile base class” problem), and behaviour ends up scattered across many files. <b>Composition</b> assembles behaviour from parts held as attributes, which is far more flexible — you can swap parts at runtime and avoid that coupling. The guideline “favour composition over inheritance” doesn’t ban inheritance; it says reserve it for true, shallow “is-a” relationships, and use composition for <i>reuse</i>. A quick test: if you’re only inheriting to grab some methods, not because the subclass genuinely <i>is</i> the base type, prefer composition.`) +
      RECAP([
        `Inheritance lets a subclass reuse and extend a base class, modelling an <b>“is-a”</b> relationship.`,
        `A subclass <b>inherits</b> the base’s members, can <b>override</b> them, and <b>adds</b> new behaviour; use <code>super()</code> to extend the base.`,
        `Deep hierarchies are <b>fragile</b> — a base change breaks distant subclasses, and behaviour scatters.`,
        `Prefer <b>composition (“has-a”)</b> for reuse: assemble behaviour from swappable parts.`,
        `Use inheritance only for genuine, shallow “is-a” relationships where the subtype can stand in for the base.`])]
  ]
});

SDPATCH('oop-polymorphism', {
  blurb: `Polymorphism (“many forms”) lets one piece of code work with many types: the same method call does the right thing depending on the <b>actual object</b>. It’s what lets you write code against an interface and have each implementation behave correctly — and it’s the cure for sprawling “if this type… else if that type…” chains.`,
  sections: [
    ['What is polymorphism?', PLAIN(`With polymorphism, a single call site works for every type that shares an interface. Write <code>for s in shapes: total += s.area()</code> once, and it works for circles, squares, and any shape you add later, because each class provides its own <code>area()</code> and the <b>actual object</b> decides which one runs. Adding a new shape needs <b>no change to the loop</b>.`) +
      ANALOGY(`Imagine a single “<b>make your sound</b>” button that works on any animal toy. Press it on the dog and it barks; press it on the cat and it meows; press it on a brand-new duck toy and it quacks — you didn’t rewire the button, each toy just knows its own sound. Same command, different behaviour depending on which object receives it. That’s polymorphism.`)],
    ['Words you’ll need', KEYTERMS([
      ['Polymorphism', 'One interface, many implementations — the same call behaves differently per type.'],
      ['Dynamic dispatch', 'The mechanism: the object’s actual type decides which method runs, at runtime.'],
      ['Overriding', 'A subclass supplying its own version of a method — the design-relevant kind of polymorphism.'],
      ['Duck typing (Python)', '“If it has the method, call it” — any object with the right method works, no shared base needed.'],
      ['Open/closed', 'The principle polymorphism supports: add new types without editing existing code.'],
      ['Type-switch (anti-pattern)', 'A big if/elif chain branching on an object’s type — replace it with polymorphic methods.']])],
    ['Replacing type-switches, and open/closed', WHY(`The practical superpower of polymorphism is killing big <code>if isinstance(...)</code> / <code>elif kind == ...</code> chains. Those are an anti-pattern because you must <b>edit them for every new type</b> — exactly what the open/closed principle warns against. Instead, give each type its own method and let the caller just call it. Now adding a <code>Triangle</code> means writing a new class, not editing a function everyone else depends on. In Python this leans on <b>duck typing</b>: the caller just calls <code>obj.area()</code> and anything with that method works, inheritance or not.`) +
      RECAP([
        `Polymorphism lets one call site work with many types, each behaving correctly (the actual object decides, via <b>dynamic dispatch</b>).`,
        `The design-relevant form is <b>overriding</b>: each subclass provides its own version of a shared method.`,
        `Python uses <b>duck typing</b> — any object with the expected method works, no shared base required.`,
        `It supports <b>open/closed</b>: add a new type as a new class, with no change to existing callers.`,
        `Replace big <b>type-switch</b> chains with polymorphic methods (often via the Strategy or State pattern).`])]
  ]
});

SDPATCH('oop-interface', {
  blurb: `Both an <b>interface</b> and an <b>abstract class</b> let you program to a contract instead of a concrete type — but they differ: an abstract class can carry <b>shared code and state</b>, while an interface (a Python <code>Protocol</code>) is a <b>pure capability contract</b> with no implementation. Knowing when to use each is a classic interview question.`,
  sections: [
    ['What’s the difference?', PLAIN(`An <b>abstract class</b> defines a contract <i>and</i> can provide shared implementation — some concrete methods and data all subclasses inherit, plus abstract methods they must fill in. An <b>interface</b> is a <b>pure contract</b>: just a set of operations, no state, no code. Rule of thumb: use an abstract class when subclasses genuinely <b>share behaviour</b>; use an interface when you only need to say “whatever implements this can do X”.`) +
      ANALOGY(`An <b>interface</b> is like the <b>standard for a power socket</b>: it only specifies the shape of the plug. Any appliance with a matching plug works — kettle, laptop, lamp — and the socket neither knows nor cares what the appliance does inside. An <b>abstract class</b> is more like a <b>partly-built kit</b>: the frame and some parts are already assembled (shared code), and you just finish the few pieces left blank.`)],
    ['Words you’ll need', KEYTERMS([
      ['Interface', 'A pure contract — method signatures only, no state or implementation.'],
      ['Abstract class', 'A class with some methods implemented and some left abstract; can’t be instantiated until completed.'],
      ['Abstract method', 'A declared method with no body that subclasses must implement.'],
      ['Protocol (structural typing)', 'Python’s interface-by-shape: any class with the right methods qualifies, no inheritance.'],
      ['Shared state/behaviour', 'What an abstract class can give subclasses and an interface cannot.'],
      ['Interface segregation', 'Keep interfaces small and focused rather than one fat “do everything” contract.']])],
    ['When to use which', WHY(`Use an <b>abstract class</b> when implementations should share real behaviour — it gives you a place for concrete helper methods and a “template” while still forcing subclasses to fill in the blanks. Use an <b>interface</b> (a <code>Protocol</code>, or an ABC with only abstract methods) when you just need a capability contract — “anything that can <code>charge()</code>” — with no shared code; interfaces also let one class satisfy <b>many</b> contracts at once. In Python, prefer a <b>Protocol</b> when you only care that an object <i>has</i> the right methods (it works even with classes you don’t own, and keeps coupling low), and an <b>ABC</b> when you want an explicit, declared relationship or shared implementation.`) +
      RECAP([
        `An <b>interface</b> is a pure contract (operations only); an <b>abstract class</b> is a contract <i>plus</i> shared code and state.`,
        `Use an <b>abstract class</b> when subclasses share real behaviour (a template with blanks to fill).`,
        `Use an <b>interface</b> when you only need “can do X”, and a class can satisfy many interfaces at once.`,
        `In Python, a <b>Protocol</b> is satisfied by any class with the right methods (no inheritance) — great for low coupling.`,
        `Keep interfaces <b>small and focused</b> (interface segregation) rather than one fat contract.`])]
  ]
});

SDPATCH('oop-relations', {
  blurb: `These describe how objects relate and <b>own</b> each other. <b>Association</b> is a loose “knows-a”; <b>aggregation</b> is a “has-a” where the part can live on its own; <b>composition</b> is a “has-a” where the part’s life is bound to the whole. Getting these right drives correct behaviour like cascade deletes and cloning.`,
  sections: [
    ['Three kinds of relationship', PLAIN(`Objects reference each other, but <i>how tightly</i> varies. <b>Association</b> is the loosest — two objects simply know each other (a driver and a trip). <b>Aggregation</b> is a “has-a” where the part can exist independently of the whole (a team has players, but a player still exists if the team disbands). <b>Composition</b> is a stronger “has-a” where the part’s lifetime is <b>bound to the whole</b> (a house is composed of rooms that don’t exist without it). The distinction decides what happens on delete, how deep a copy goes, and who guards invariants.`) +
      ANALOGY(`Compare a car and a house. A <b>car has an engine</b>: you can take the engine out and put it in another car — it can outlive this car (aggregation). A <b>house has rooms</b>: demolish the house and the rooms cease to exist — they can’t be moved to another house as-is (composition). And a <b>car knows its current driver</b>, but doesn’t own them — the driver exists with or without the car (association).`)],
    ['Words you’ll need', KEYTERMS([
      ['Association', 'Objects simply know/use each other, no ownership (driver ↔ trip).'],
      ['Aggregation', 'A “has-a” where parts can exist independently and may be shared (team ↔ players).'],
      ['Composition', 'A “has-a” where parts are owned and die with the whole (house ↔ rooms).'],
      ['Lifetime / ownership', 'Who controls when the part is created and destroyed — the real distinguisher.'],
      ['Cascade delete', 'Deleting the whole deletes its composed parts (but not merely associated ones).'],
      ['Multiplicity', 'How many objects relate on each end (one, many, optional).']])],
    ['How it shows up in code, and why it matters', WHY(`In code all three look the same — one object holds a <b>reference</b> to another as an attribute. The difference is <b>ownership and lifecycle</b>, and you infer it from the construction: if the whole <b>creates</b> the part itself and nobody else holds it, that’s <b>composition</b> (the part dies with the whole); if the part is <b>passed in</b> and shared elsewhere, that’s <b>aggregation/association</b>. This matters because it drives real behaviour: deleting an <code>Order</code> should remove its <code>OrderLine</code>s (composition → cascade) but not its shared <code>Customer</code> (association → detach only); and cloning a composed object needs a <b>deep copy</b> so the clone owns its own parts. In a parking-lot design, a <code>Level</code> is <i>composed</i> of <code>Spot</code>s, while a <code>Ticket</code> is merely <i>associated</i> with a <code>Vehicle</code>.`) +
      RECAP([
        `<b>Association</b> = objects know each other; <b>aggregation</b> = has-a with independent parts; <b>composition</b> = has-a where parts die with the whole.`,
        `All three are “hold a reference as an attribute” in code — the difference is <b>ownership and lifetime</b>, not syntax.`,
        `Whole <b>creates</b> the part and owns it → composition; part <b>passed in</b> / shared → aggregation or association.`,
        `This drives <b>cascade deletes</b> and <b>copy depth</b> (composed parts need deep copies).`,
        `The one that really matters is <b>composition</b>, because it means the part has no independent life.`])]
  ]
});

SDPATCH('oop-overload', {
  blurb: `Two similar-sounding but different mechanisms. <b>Overriding</b> (runtime) is a subclass replacing a base method — the heart of polymorphism. <b>Overloading</b> (compile-time) is several methods sharing a name but taking different parameters — which Python doesn’t support natively and emulates in other ways.`,
  sections: [
    ['Overriding vs overloading', PLAIN(`They’re easy to confuse. <b>Overriding</b> is when a subclass provides its own version of a method it inherited, and the <b>actual object’s type</b> decides which runs at runtime — this is what makes polymorphism work. <b>Overloading</b> is having several methods with the <b>same name but different parameter lists</b> (e.g. one <code>add(int, int)</code> and one <code>add(str, str)</code>), with the language picking the right one by the argument types. Python has native overriding but <b>no true overloading</b>.`) +
      ANALOGY(`<b>Overriding</b> is a child cook who takes the family <b>recipe</b> and makes their own version of it — same dish name on the menu, but when <i>they</i> cook it, their method runs. <b>Overloading</b> is one dish name on the menu with <b>several recipes depending on what you bring</b>: “omelette” made one way if you bring cheese, another if you bring mushrooms — the kitchen picks the recipe from your ingredients (the arguments).`)],
    ['Words you’ll need', KEYTERMS([
      ['Overriding', 'A subclass redefining an inherited method; chosen at runtime by the object’s real type.'],
      ['super()', 'Call the base version of the method you’re overriding, to extend rather than replace it.'],
      ['Overloading', 'Multiple methods, same name, different parameters; resolved by argument types (Java/C++).'],
      ['Default arguments / *args', 'Python’s usual way to let one function accept varied arguments (emulating overloading).'],
      ['functools.singledispatch', 'Python tool for choosing an implementation based on the first argument’s type.'],
      ['Liskov substitution', 'An override must honour the base’s contract so callers relying on the base aren’t surprised.']])],
    ['How Python handles each', WHY(`<b>Overriding</b> is built in: define a method with the same name in a subclass and it takes over for objects of that subclass; use <code>super()</code> inside it to also run the base version. This is the design-relevant kind, and it must <b>respect the base’s contract</b> (same expectations) or callers break. <b>Overloading</b> doesn’t really exist in Python — a second <code>def</code> with the same name simply replaces the first. You get the same ergonomics with <b>default arguments</b>, <code>*args</code>/<code>**kwargs</code>, or <code>functools.singledispatch</code> for picking behaviour by argument type. (<code>typing.overload</code> exists but only annotates signatures for type checkers; it doesn’t change what runs.)`) +
      RECAP([
        `<b>Overriding</b> = a subclass replaces an inherited method; chosen at runtime by the object’s actual type (powers polymorphism).`,
        `Use <code>super()</code> to extend the base version instead of fully replacing it, and keep overrides compatible with the base contract.`,
        `<b>Overloading</b> = same method name, different parameter lists, resolved by argument types — standard in Java/C++.`,
        `Python has no true overloading (the last definition wins).`,
        `Emulate it with <b>default arguments</b>, <code>*args</code>, or <code>functools.singledispatch</code> for type-based dispatch.`])]
  ]
});

SDPATCH('oop-solid', {
  blurb: `SOLID is five principles for object-oriented design that keep code flexible and maintainable: <b>S</b>ingle responsibility, <b>O</b>pen/closed, <b>L</b>iskov substitution, <b>I</b>nterface segregation, and <b>D</b>ependency inversion. They’re the shared vocabulary interviewers use to judge your class design.`,
  sections: [
    ['What is SOLID?', PLAIN(`SOLID is a checklist of five habits that, followed sensibly, make object-oriented code easier to change without breaking it. They’re not laws — applied dogmatically they produce needless complexity — but each targets a real kind of pain, and naming them as you design signals that you understand <i>why</i> you’re structuring code a certain way.`) +
      ANALOGY(`Think of them as five rules for a <b>well-organised workshop</b>. Each tool has one clear home (single responsibility); you can add new tools without rebuilding the shelves (open/closed); any drawer labelled “screwdrivers” really does hold usable screwdrivers (Liskov); you have several small labelled drawers rather than one giant junk drawer (interface segregation); and the bench is bolted to standard fixtures you can swap, not welded to one specific wall (dependency inversion). The result: you can rearrange and extend the workshop without chaos.`)],
    ['Words you’ll need', KEYTERMS([
      ['Single responsibility (S)', 'A class should have one reason to change — one job.'],
      ['Open/closed (O)', 'Open to extension (add new code), closed to modification (don’t edit working code).'],
      ['Liskov substitution (L)', 'A subtype must be usable anywhere its base is, without surprising callers.'],
      ['Interface segregation (I)', 'Prefer several small, focused interfaces over one fat one.'],
      ['Dependency inversion (D)', 'Depend on abstractions (interfaces), not concrete classes — and inject them.'],
      ['Dependency injection', 'The technique for D: pass dependencies in (usually via the constructor) rather than creating them inside.']])],
    ['The five, with the key ideas', WHY(`<b>S</b> — if a class both computes an invoice total and emails itself, split it; those are two reasons to change. <b>O</b> — add behaviour by writing a new class that implements an interface, not a new <code>elif</code> in a growing function (achieved with polymorphism). <b>L</b> — the classic violation is <code>Square</code> extending <code>Rectangle</code> and breaking code that sets width and height independently; the subtype must honour the base’s guarantees, not just compile. <b>I</b> — don’t force a <code>Printer</code> to implement <code>fax()</code>; split fat interfaces into small ones. <b>D</b> — an <code>OrderService</code> should depend on a <code>PaymentProcessor</code> <i>interface</i> and have Stripe (or a fake) <b>injected</b>, not hard-wire itself to Stripe. Together, O/L/I/D make code decoupled, extensible, and testable — and most design patterns are just concrete ways to honour these principles.`) +
      RECAP([
        `<b>S</b>ingle responsibility: one reason to change per class (split tangled jobs).`,
        `<b>O</b>pen/closed: extend by adding new classes, not editing existing code (via polymorphism).`,
        `<b>L</b>iskov substitution: a subtype must stand in for its base without breaking callers’ expectations.`,
        `<b>I</b>nterface segregation: many small, focused interfaces beat one fat one.`,
        `<b>D</b>ependency inversion: depend on injected abstractions, not concrete classes — and treat SOLID as guidance, not dogma.`])]
  ]
});
