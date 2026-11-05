/* ===== Low-level design B: design patterns (Python) ===== */
SD_CATS.push(['sdpat', 'Design patterns']);

SDX('pat-strategy', { name: 'Strategy', cat: 'sdpat',
  blurb: `Strategy defines a family of interchangeable algorithms behind one interface and lets you swap them at runtime. It turns a sprawling if/elif over "which algorithm" into a set of small classes you inject — the behavioral pattern you reach for most often.`,
  facts: [['Type', 'Behavioral'], ['Intent', 'interchangeable algorithms'], ['Swaps', 'at runtime'], ['Replaces', 'conditional algorithm selection']],
  cheat: [['Strategy', 'Encapsulate each algorithm behind one interface'], ['Context', 'Holds a strategy and delegates to it'], ['Swap', 'Change behavior by changing the injected object'], ['Use when', 'Several ways to do one thing (pricing, sorting)'], ['Replaces', 'if/elif choosing an algorithm'], ['SOLID', 'Open/closed + dependency inversion'], ['Python', 'A strategy can just be a function'], ['vs State', 'Strategy is chosen; State transitions itself'], ['Inject', 'Via constructor or setter'], ['Example', 'Payment, shipping, compression'] ],
  sections: [
    ['Intent & structure', PP(`Strategy captures <b>a family of algorithms</b> that do the same <i>kind</i> of job (compute a price, sort a list, compress bytes) behind a <b>common interface</b>, so the <b>context</b> that uses one can treat them interchangeably and <b>swap at runtime</b>. The context holds a reference to a strategy object and <b>delegates</b> the varying step to it, rather than implementing all variants itself with conditionals.`)],
    ['When to use it', PP(`Reach for Strategy when you notice <b>multiple ways to perform one operation</b> selected by a condition — a pricing rule that depends on customer tier, a shipping cost that depends on carrier. Instead of an <code>if tier == ...</code> that you edit for every new rule, each rule becomes a class; adding one is open/closed. In Python a strategy can simply be a <b>function</b> passed in, since functions are first-class.`)]
  ],
  snipTitle: 'Strategy in Python', snipNote: 'Interchangeable pricing strategies injected into a cart.',
  snips: [['Strategy', 'python', `from abc import ABC, abstractmethod

class PricingStrategy(ABC):
    @abstractmethod
    def total(self, subtotal: float) -> float: ...

class NoDiscount(PricingStrategy):
    def total(self, subtotal): return subtotal

class PercentOff(PricingStrategy):
    def __init__(self, pct): self.pct = pct
    def total(self, subtotal): return subtotal * (1 - self.pct)

class Cart:                                  # the context
    def __init__(self, pricing: PricingStrategy):
        self.pricing = pricing               # injected strategy
        self.items = []
    def checkout(self) -> float:
        return self.pricing.total(sum(self.items))

c = Cart(PercentOff(0.1)); c.items = [100, 50]
print(c.checkout())        # 135.0
c.pricing = NoDiscount()   # swap algorithm at runtime
print(c.checkout())        # 150

# Pythonic shortcut: a strategy can just be a function
def member_price(subtotal): return subtotal * 0.85`]],
  edge: [`A Strategy interface with <b>one</b> implementation is needless indirection — introduce it when a second algorithm actually exists.`, `The <b>context must not know</b> which concrete strategy it holds; if it branches on the strategy type, you’ve reintroduced the conditional you meant to remove.`, `Strategies that need lots of context data lead to passing the whole context in — keep the strategy interface focused on what it truly needs.`, `In Python, prefer a plain function when the strategy is a single operation; a full class is overkill.`],
  faq: [['How is Strategy different from just using if/elif?', PP(`Functionally they can produce the same result, but Strategy makes the design <b>open/closed and testable</b>. With <code>if/elif</code>, every new algorithm means <b>editing the same function</b> — more risk of breaking existing cases, and all variants live tangled in one place. With Strategy, each algorithm is an <b>isolated class</b> (or function) you can test in isolation, and adding one means <b>writing a new class, not modifying old code</b>. The context depends only on the interface, so it never changes. Use <code>if/elif</code> for two trivial, stable cases; reach for Strategy when the set of algorithms grows or changes.`)],
    ['What’s the difference between Strategy and State?', PP(`They share the same structure (a context delegating to an interchangeable object), but the <b>intent and control differ</b>. In <b>Strategy</b>, the algorithm is chosen <b>from outside</b> and usually stays fixed for the operation — the client picks a pricing or sorting strategy. In <b>State</b>, the object <b>changes its own behavior as its internal state changes</b>, and the state objects <b>trigger transitions</b> between themselves (a vending machine moving from "no coin" to "has coin"). Rule of thumb: if the client selects the behavior, it’s Strategy; if the object transitions between behaviors on its own, it’s State.`)]],
  qs: [SQ('Strategy is primarily used to…', ['Create objects', 'Make a family of algorithms interchangeable behind one interface', 'Restrict instantiation to one object', 'Traverse a collection'], 1, 'Strategy encapsulates interchangeable algorithms the context delegates to.'),
    SQ('A growing if/elif that selects which algorithm to run is best refactored into…', ['A singleton', 'Strategy classes implementing a common interface', 'A global variable', 'Deeper inheritance'], 1, 'Each branch becomes a strategy; adding one no longer edits existing code.')]
});
DP('pat-strategy', {
  fu: [['When is a function enough instead of a Strategy class?', 'When the strategy is a single stateless operation, pass a function (or lambda) — Python’s first-class functions make a full class unnecessary. Use a class when the strategy needs its own state or multiple methods.'],
    ['How does Strategy relate to dependency injection?', 'Injecting the strategy into the context IS dependency injection of a behavior. It realizes the dependency inversion principle: the context depends on the strategy abstraction, not a concrete algorithm.'],
    ['Where does Strategy show up in LLD problems?', 'Pricing in a parking lot, dispatch algorithms in an elevator, rate-limiting algorithms in a limiter, routing in a load balancer — anywhere the problem says "the rule can vary".']],
  deep: [['Technique', 'Spot "several ways to do one operation", define an interface for it, make each way a class/function, and inject the chosen one into the context.'],
    ['Failure mode', 'Single-implementation strategies (premature) or a context that still branches on strategy type (defeats the pattern).'],
    ['In interviews', 'Call it out when requirements say a rule varies; it demonstrates open/closed design and earns points for extensibility.']],
  src: ['Refactoring Guru: Strategy', 'https://refactoring.guru/design-patterns/strategy'] });

SDX('pat-factory', { name: 'Factory Method', cat: 'sdpat',
  blurb: `Factory Method provides a single place to create objects, deciding which concrete class to instantiate based on input — so callers ask for "a thing" without naming or importing the concrete class. It decouples creation from use.`,
  facts: [['Type', 'Creational'], ['Intent', 'create without naming the concrete class'], ['Decouples', 'creation from use'], ['Decides', 'which subtype to build']],
  cheat: [['Factory', 'Centralize object creation'], ['Caller', 'Asks for a type by key, gets an instance'], ['Hides', 'Which concrete class is built'], ['Use when', 'Creation logic varies or will grow'], ['Add type', 'Register/extend the factory, not every caller'], ['vs Abstract Factory', 'One product vs families of products'], ['Python', 'Often a dict of {key: class} or a function'], ['Benefit', 'Callers don’t import concrete classes'], ['Pair with', 'Strategy, polymorphism'], ['Smell it fixes', 'new ConcreteClass() scattered everywhere'] ],
  sections: [
    ['Intent & structure', PP(`Factory Method puts object <b>creation behind one function or method</b> that decides <b>which concrete class</b> to instantiate from some input (a type key, a config, a file extension). Callers say "give me a notifier for <code>email</code>" and receive an object implementing the common interface, without <code>import</code>ing or naming <code>EmailNotifier</code>. When the set of products grows, you change the <b>factory</b>, not every call site.`)],
    ['When to use it', PP(`Use a factory when <b>creation logic is non-trivial or will change</b>: choosing a subtype by input, applying setup/validation, or avoiding scattered <code>ConcreteClass()</code> calls that all need editing when a new type appears. In Python the lightest form is a <b>dict mapping keys to classes</b> (or constructor functions); reach for a class-based factory only when creation itself needs state.`)]
  ],
  snipTitle: 'Factory Method in Python', snipNote: 'A registry-style factory that builds the right notifier.',
  snips: [['Factory', 'python', `from abc import ABC, abstractmethod

class Notifier(ABC):
    @abstractmethod
    def send(self, msg: str) -> None: ...

class EmailNotifier(Notifier):
    def send(self, msg): print(f"email: {msg}")
class SMSNotifier(Notifier):
    def send(self, msg): print(f"sms: {msg}")
class PushNotifier(Notifier):
    def send(self, msg): print(f"push: {msg}")

_REGISTRY = {"email": EmailNotifier, "sms": SMSNotifier, "push": PushNotifier}

def make_notifier(channel: str) -> Notifier:      # the factory
    try:
        return _REGISTRY[channel]()
    except KeyError:
        raise ValueError(f"unknown channel: {channel}")

n = make_notifier("sms")      # caller never names SMSNotifier
n.send("hello")               # sms: hello
# Add a new channel -> register one class; no caller changes.`]],
  edge: [`A factory with a growing internal <code>if/elif</code> just <b>moves</b> the conditional — prefer a <b>registry dict</b> so adding a type is one entry, not a new branch.`, `Returning concrete types from the factory (instead of the common interface) re-couples callers — the return type should be the abstraction.`, `Over-factory-ing simple objects (<code>make_point(x, y)</code> for a trivial class) adds indirection with no benefit.`, `Don’t confuse Factory Method (one product, subclass/dispatch decides) with Abstract Factory (families of related products).`],
  faq: [['Why use a factory instead of calling the constructor directly?', PP(`Because it <b>decouples callers from concrete classes</b>. When code does <code>EmailNotifier()</code> directly, it imports and depends on that concrete class, and choosing between several types forces a conditional at <b>every</b> call site. A factory centralizes that decision: callers pass a key ("email") and get back something implementing the interface, without knowing or importing the concrete class. Adding a new type then means updating <b>one place</b> (the factory/registry), not hunting down every <code>if channel == ...</code>. It also gives you a single hook for creation-time concerns like validation, pooling, or configuration.`)],
    ['What’s the difference between Factory Method and Abstract Factory?', PP(`<b>Factory Method</b> creates <b>one product</b> and decides which concrete subclass to return — "give me a Notifier." <b>Abstract Factory</b> creates <b>families of related products</b> that are meant to be used together — "give me a UI toolkit" that produces a matching Button, Checkbox, and Menu for one theme. Abstract Factory is essentially a bundle of factory methods behind one interface, ensuring the products it returns are <b>compatible with each other</b>. Use Factory Method when you vary a single object; use Abstract Factory when you must vary a whole consistent set at once.`)]],
  qs: [SQ('The main benefit of a Factory is…', ['Faster object creation', 'Callers get objects without naming or importing the concrete class', 'Guaranteeing one instance', 'Adding behavior to objects'], 1, 'It decouples creation from use, centralizing which concrete class is built.'),
    SQ('A Pythonic way to implement a factory without a big if/elif is…', ['Global variables', 'A dict mapping keys to classes/constructors', 'Multiple inheritance', 'A singleton'], 1, 'A registry dict makes adding a type one entry rather than a new branch.')]
});
DP('pat-factory', {
  fu: [['What is a "simple factory" vs the Factory Method pattern?', 'A "simple factory" is just a function/dict that returns objects (very common in Python). The GoF Factory Method defers the choice to subclasses that override a creator method. In practice Python code usually uses the simple factory/registry form.'],
    ['How do registries help extensibility?', 'A {key: class} registry (optionally populated via a decorator that self-registers each class) lets new types plug in without editing the factory body — the closest thing to open/closed creation.'],
    ['When is a classmethod factory (alternative constructor) appropriate?', 'When a class offers multiple ways to be built (User.from_dict, Date.from_timestamp). classmethods keep these named constructors on the class itself, which is idiomatic Python.']],
  deep: [['Technique', 'Hide creation behind a function/registry returning the interface type; add new products by registering a class, not editing callers.'],
    ['Failure mode', 'Factories that just relocate an if/elif, or return concrete types and re-couple callers.'],
    ['In interviews', 'Use a factory when the problem creates objects of a type chosen at runtime (vehicles, notifiers, parsers); pair it with polymorphism.']],
  src: ['Refactoring Guru: Factory Method', 'https://refactoring.guru/design-patterns/factory-method'] });

SDX('pat-abstract-factory', { name: 'Abstract Factory', cat: 'sdpat',
  blurb: `Abstract Factory creates families of related objects that must be used together, behind one interface, so you can switch the whole family at once without mixing incompatible parts.`,
  facts: [['Type', 'Creational'], ['Intent', 'families of related products'], ['Guarantees', 'products are compatible'], ['Switch', 'the whole family at once']],
  cheat: [['Abstract Factory', 'Interface to create a family of products'], ['Family', 'Related products used together (Button+Checkbox)'], ['Concrete factory', 'One per variant (Light/Dark theme)'], ['Guarantee', 'You can’t mix a dark button with a light menu'], ['Use when', 'Multiple product sets that must stay consistent'], ['vs Factory Method', 'Family of products vs one product'], ['Composed of', 'Several factory methods'], ['Switch', 'Change one factory to change the whole set'], ['Example', 'UI themes, cross-platform widgets, DB drivers'], ['Cost', 'More classes; use only with real families'] ],
  sections: [
    ['Intent & structure', PP(`Abstract Factory is an interface with <b>several creation methods</b>, one per product in a <b>family</b> (a <code>Button</code>, a <code>Checkbox</code>, a <code>Menu</code>). Each <b>concrete factory</b> produces a <b>mutually consistent set</b> (all "dark theme," all "Windows"). Client code depends only on the abstract factory and the abstract products, so switching the entire family is a matter of injecting a different concrete factory — and it’s <b>impossible to accidentally mix</b> a dark button with a light menu.`)],
    ['When to use it', PP(`Use it when your system must work with <b>multiple families of related objects</b> and you need to guarantee the members <b>match</b>: UI themes, cross-platform widget toolkits, or storage backends that each need a matching connection, query builder, and migration tool. If you only vary a single object, a plain Factory Method is enough — Abstract Factory earns its extra classes only when there’s a genuine family to keep consistent.`)]
  ],
  snipTitle: 'Abstract Factory in Python', snipNote: 'Two consistent UI families selected by one factory.',
  snips: [['Abstract Factory', 'python', `from abc import ABC, abstractmethod

class Button(ABC):
    @abstractmethod
    def render(self) -> str: ...
class Checkbox(ABC):
    @abstractmethod
    def render(self) -> str: ...

class LightButton(Button):   render = lambda self: "[ Light Button ]"
class LightCheckbox(Checkbox): render = lambda self: "[x] light"
class DarkButton(Button):    render = lambda self: "[ Dark Button ]"
class DarkCheckbox(Checkbox):  render = lambda self: "[x] dark"

class UIFactory(ABC):                      # the abstract factory
    @abstractmethod
    def button(self) -> Button: ...
    @abstractmethod
    def checkbox(self) -> Checkbox: ...

class LightUI(UIFactory):
    def button(self): return LightButton()
    def checkbox(self): return LightCheckbox()
class DarkUI(UIFactory):
    def button(self): return DarkButton()
    def checkbox(self): return DarkCheckbox()

def build_form(ui: UIFactory):             # client uses one family only
    print(ui.button().render(), ui.checkbox().render())

build_form(DarkUI())      # [ Dark Button ] [x] dark  (consistent set)`]],
  edge: [`Abstract Factory multiplies classes quickly — use it only when you truly have <b>families</b> that must stay consistent, not for a single varying product.`, `Adding a <b>new product</b> to the family (a new method on the factory interface) forces changing <b>every</b> concrete factory — the pattern is open to new <i>families</i>, not new <i>products</i>.`, `Clients must depend on the <b>abstract products</b>; if they downcast to concrete products they lose the consistency guarantee.`, `Don’t confuse with Factory Method — that creates one product and often uses inheritance to decide; Abstract Factory composes multiple creators.`],
  faq: [['How do I know I need Abstract Factory rather than a simple Factory?', PP(`Ask whether you’re creating <b>one object or a consistent set of several</b>. If you need a single object whose concrete type varies (a notifier, a parser), a <b>Factory Method / simple factory</b> is enough. Reach for <b>Abstract Factory</b> only when you have a <b>family of related products that must match</b> — a UI theme’s button, checkbox, and menu; a database backend’s connection, query builder, and migrator — and mixing members from different families would be a bug. Abstract Factory’s whole purpose is to make that mismatch <b>impossible</b> by having each concrete factory hand out a coherent set.`)],
    ['What’s the main drawback of Abstract Factory?', PP(`<b>Class explosion and rigidity when products change.</b> You get an abstract factory, a concrete factory per family, and an abstract plus concrete class per product — a lot of types. More importantly, the pattern is <b>open to new families but closed to new products</b>: adding a brand-new product kind (say a <code>Slider</code>) means adding a method to the factory interface and implementing it in <b>every</b> concrete factory. So it fits domains where the <i>set</i> of products is stable but the <i>variants/families</i> grow (themes, platforms), and it’s overkill when you only vary a single object.`)]],
  qs: [SQ('Abstract Factory is for creating…', ['One object whose type varies', 'Families of related products that must be used together', 'A single shared instance', 'Objects step by step'], 1, 'It produces consistent families (e.g. a themed button + checkbox + menu).'),
    SQ('A limitation of Abstract Factory is that adding a new product kind requires…', ['No changes anywhere', 'Changing every concrete factory', 'Only a new caller', 'A new singleton'], 1, 'It’s open to new families but closed to new products; each factory must add the method.')]
});
DP('pat-abstract-factory', {
  fu: [['How does Abstract Factory relate to Factory Method?', 'Abstract Factory is typically composed of several factory methods — one per product in the family. Factory Method decides one product (often via subclassing); Abstract Factory bundles several to keep a set consistent.'],
    ['Real-world uses?', 'Cross-platform UI toolkits (Windows/macOS widgets), theming systems, and pluggable backends where a driver must supply a matching set of collaborating objects.'],
    ['Can Python make this lighter?', 'Yes — a concrete factory can be a simple object or module whose functions return the family members, avoiding deep class hierarchies while keeping the "one source for a consistent set" idea.']],
  deep: [['Technique', 'Model each product as an interface, each family as a concrete factory producing a matching set, and have clients depend only on the abstract factory + abstract products.'],
    ['Failure mode', 'Using it for a single varying product (overkill), or clients downcasting to concrete products and losing consistency.'],
    ['In interviews', 'Mention it when the problem has multiple coherent variant sets (themes, platforms); otherwise prefer a simple factory.']],
  src: ['Refactoring Guru: Abstract Factory', 'https://refactoring.guru/design-patterns/abstract-factory'] });

SDX('pat-builder', { name: 'Builder', cat: 'sdpat',
  blurb: `Builder constructs a complex object step by step, separating the construction process from the final representation. It replaces telescoping constructors and lets you build immutable objects with many optional fields readably.`,
  facts: [['Type', 'Creational'], ['Intent', 'step-by-step construction'], ['Replaces', 'telescoping constructors'], ['Good for', 'many optional fields']],
  cheat: [['Builder', 'Assemble a complex object in steps'], ['Fluent', 'Chained calls: .with_x().with_y().build()'], ['build()', 'Validates and returns the final object'], ['Use when', 'Many optional/complex construction params'], ['Replaces', 'Constructors with 8 positional args'], ['Immutable result', 'Build then freeze'], ['Director (optional)', 'Encodes common build recipes'], ['Python alt', 'Keyword args / dataclass defaults often suffice'], ['Validate', 'In build(), not scattered'], ['Example', 'SQL query, HTTP request, Pizza'] ],
  sections: [
    ['Intent & structure', PP(`Builder lets you <b>construct an object incrementally</b> — set some fields, add some parts, then call <code>build()</code> which <b>validates</b> and returns the finished (often immutable) object. It separates <i>how</i> the object is assembled from <i>what</i> it ends up being, which is valuable when construction has <b>many optional fields</b> or steps whose order/validity matters. A <b>fluent</b> interface (methods returning <code>self</code>) makes the construction read like a sentence.`)],
    ['When to use it', PP(`Use Builder when a constructor would need <b>many parameters, most optional</b> — the "telescoping constructor" smell where you see <code>Pizza("L", True, False, True, None, 2)</code> and can’t tell what the args mean. In Python, <b>keyword arguments and dataclass defaults</b> already solve much of this, so reserve a full Builder for cases with <b>interdependent steps, validation, or an immutable result</b> assembled over time.`)]
  ],
  snipTitle: 'Builder in Python', snipNote: 'A fluent builder that validates in build() and returns an immutable object.',
  snips: [['Builder', 'python', `from dataclasses import dataclass

@dataclass(frozen=True)              # immutable result
class HttpRequest:
    method: str
    url: str
    headers: dict
    body: str | None

class RequestBuilder:
    def __init__(self, url: str):
        self._url = url
        self._method = "GET"
        self._headers: dict = {}
        self._body: str | None = None
    def method(self, m): self._method = m; return self      # fluent
    def header(self, k, v): self._headers[k] = v; return self
    def body(self, b): self._body = b; return self
    def build(self) -> HttpRequest:
        if self._body and self._method == "GET":            # validate here
            raise ValueError("GET cannot have a body")
        return HttpRequest(self._method, self._url, dict(self._headers), self._body)

req = (RequestBuilder("https://api.x.com/users")
       .method("POST")
       .header("Content-Type", "application/json")
       .body('{"name":"Ada"}')
       .build())
print(req.method, req.url)      # POST https://api.x.com/users`]],
  edge: [`In Python, <b>keyword arguments and dataclass defaults</b> often make a full Builder unnecessary — don’t add one just to feel enterprise-y.`, `Put <b>validation in <code>build()</code></b>, not scattered across setters, so the object is only created when fully valid.`, `A fluent builder that forgets to <code>return self</code> breaks the chain — a common bug.`, `If the builder is reused after <code>build()</code>, later mutations can leak into prior results unless you copy the collected state (note <code>dict(self._headers)</code> above).`],
  faq: [['When is Builder worth it in Python, given keyword arguments exist?', PP(`Python’s <b>keyword arguments with defaults</b> (and <code>@dataclass</code>) already handle the "many optional fields" case cleanly — <code>Pizza(size="L", cheese=True, mushrooms=True)</code> is readable without any Builder. So reserve a real Builder for when construction is genuinely <b>multi-step or stateful</b>: fields that are added incrementally (headers, query clauses), <b>interdependent validation</b> that should run once at the end, building an <b>immutable</b> object from mutable intermediate state, or offering a <b>fluent DSL</b> (query builders, test-data builders). If a single keyword-argument constructor expresses it clearly, prefer that; Builder is for assembly that unfolds over several calls.`)],
    ['What is the Director in the Builder pattern?', PP(`The <b>Director</b> is an optional collaborator that <b>encapsulates a specific build recipe</b> — it knows the sequence of builder calls to produce a common configuration, so clients can request "a standard margherita" without repeating the steps. For example a <code>PizzaDirector.margherita(builder)</code> calls <code>builder.cheese().tomato().build()</code>. It’s useful when several canonical variants are built the same way repeatedly. In practice many codebases skip the Director and just expose the fluent builder directly, adding small factory functions for common presets instead.`)]],
  qs: [SQ('Builder is most useful when…', ['You need exactly one instance', 'An object has many optional fields / multi-step construction', 'You want to add behavior at runtime', 'You need to traverse a tree'], 1, 'Builder shines for complex/optional construction, replacing telescoping constructors.'),
    SQ('Where should a Builder validate the object?', ['In each setter', 'In build(), before returning the object', 'Never', 'In the caller'], 1, 'Validating in build() ensures the object is only created when fully valid.')]
});
DP('pat-builder', {
  fu: [['How is Builder different from a Factory?', 'A Factory decides which class to create and returns it in one call; a Builder assembles one (usually complex) object step by step. Factory = "which object"; Builder = "how to construct this object".'],
    ['What’s the telescoping constructor problem?', 'Overloaded constructors with increasing parameter counts (or one constructor with many positional args) that are unreadable and error-prone. Builder (or keyword args in Python) fixes it.'],
    ['Can dataclasses replace Builder?', 'Often yes for simple cases (defaults + keyword args). Builder adds value for incremental assembly, end-of-build validation, fluent DSLs, or producing immutable objects from mutable steps.']],
  deep: [['Technique', 'Collect fields via fluent setters that return self, validate once in build(), and return an immutable result; copy mutable collected state to avoid leaks.'],
    ['Failure mode', 'Over-applying it where keyword args suffice, scattering validation across setters, or leaking shared state between builds.'],
    ['In interviews', 'Use it for query/request/config objects with many optional parts; mention that Python keyword args cover simpler cases.']],
  src: ['Refactoring Guru: Builder', 'https://refactoring.guru/design-patterns/builder'] });

SDX('pat-singleton', { name: 'Singleton', cat: 'sdpat',
  blurb: `Singleton ensures a class has exactly one instance and a global access point to it. It’s the most controversial pattern — often an anti-pattern because it hides dependencies and hurts testability — so know both how to implement it and why to usually prefer a single injected instance.`,
  facts: [['Type', 'Creational'], ['Intent', 'exactly one instance'], ['Risk', 'global state; hard to test'], ['Prefer', 'one injected instance (DI)']],
  cheat: [['Singleton', 'One instance, global access point'], ['Use for', 'Truly single resources (config, a pool)'], ['Risk', 'Hidden global state, tight coupling'], ['Testability', 'Hard to isolate/reset in tests'], ['Thread-safety', 'Lazy init needs a lock'], ['Python idiom', 'A module (imported once) is a singleton'], ['Better', 'Create one instance, inject it (DI)'], ['Metaclass/decorator', 'Enforce single instance if needed'], ['Global ≠ good', 'Single instance without global access is cleaner'], ['Smell', 'Reached via Class.instance() everywhere'] ],
  sections: [
    ['Intent & how', PP(`Singleton guarantees <b>one instance</b> of a class and gives a <b>global access point</b> to it. Common implementations in Python: a <b>module-level object</b> (modules are imported once, so a module <i>is</i> effectively a singleton), a <b>decorator</b> or <b>metaclass</b> that returns the existing instance, or overriding <code>__new__</code>. For <b>lazy</b> creation in multithreaded code, the initialization must be guarded by a <b>lock</b> so two threads don’t both create it.`)],
    ['Why it’s usually an anti-pattern', PP(`Singleton is <b>global mutable state in disguise</b>. Any code can reach it, so dependencies become <b>hidden</b> (you can’t tell from a function’s signature that it uses the singleton), <b>coupling</b> increases, and <b>tests</b> are hard because the shared instance leaks state between them and can’t easily be swapped for a fake. The usual better design: create <b>one instance</b> at startup and <b>inject</b> it where needed (dependency injection). You still have exactly one, but dependencies are explicit and swappable.`)]
  ],
  snipTitle: 'Singleton in Python (and the better alternative)', snipNote: 'A metaclass singleton, plus why a single injected instance is usually preferable.',
  snips: [['Singleton + the DI alternative', 'python', `import threading

class SingletonMeta(type):
    _instances = {}
    _lock = threading.Lock()
    def __call__(cls, *a, **kw):
        with cls._lock:                       # thread-safe lazy init
            if cls not in cls._instances:
                cls._instances[cls] = super().__call__(*a, **kw)
        return cls._instances[cls]

class Config(metaclass=SingletonMeta):
    def __init__(self):
        self.settings = {"env": "prod"}

print(Config() is Config())        # True — same instance everywhere

# ✅ Usually better: ONE instance, injected explicitly (no global access)
class Service:
    def __init__(self, config: Config):       # dependency is visible & swappable
        self.config = config
config = Config()
svc = Service(config)              # tests can pass a fake Config here`]],
  edge: [`Singletons are <b>global state</b>: they couple code, hide dependencies, and leak state between tests — prefer a single <b>injected</b> instance.`, `Lazy initialization without a <b>lock</b> is a race in multithreaded code (two threads create two instances); the double-checked lock above fixes it.`, `A Python <b>module</b> already gives you a one-per-process object cheaply — often the simplest "singleton" with no metaclass needed.`, `Singletons make <b>resetting state between tests</b> hard; if you must use one, provide a way to replace/clear it in tests.`],
  faq: [['Why is Singleton often called an anti-pattern?', PP(`Because it’s effectively <b>global mutable state</b> with a friendly name. Three concrete problems: (1) <b>Hidden dependencies</b> — a function that calls <code>Config.instance()</code> doesn’t declare that it needs config, so you can’t see its real inputs from the signature. (2) <b>Tight coupling</b> — every user is bound to the one concrete class and its global access point, making it hard to substitute. (3) <b>Testability</b> — the shared instance carries state <i>across</i> tests, causing order-dependent failures, and it can’t easily be swapped for a fake. The standard fix is <b>dependency injection</b>: create one instance at the composition root and pass it in. You keep "exactly one" without the global access point and its downsides.`)],
    ['When is a Singleton actually acceptable?', PP(`When there is a <b>genuinely single resource</b> and the global access doesn’t hurt testability much — for example a process-wide <b>configuration</b> loaded once, a <b>connection pool</b>, a <b>logger</b>, or a cache that must be shared. Even then, the <b>Pythonic</b> approach is usually a <b>module-level object</b> (modules are imported once, so you get one instance for free) rather than a metaclass. And if you need to swap it in tests, prefer creating the single instance at startup and <b>injecting</b> it, so "one instance" and "global access" are decoupled — you get the uniqueness without welding every caller to a global.`)]],
  qs: [SQ('The biggest criticism of Singleton is that it…', ['Is slow', 'Introduces hidden global state that hurts coupling and testability', 'Can’t be implemented in Python', 'Requires inheritance'], 1, 'Global access makes dependencies implicit and tests hard; prefer injecting one instance.'),
    SQ('The usually-preferred alternative to a Singleton is…', ['Many instances', 'Create one instance and inject it (dependency injection)', 'A global variable', 'Deep inheritance'], 1, 'DI keeps exactly one instance while making the dependency explicit and swappable.')]
});
DP('pat-singleton', {
  fu: [['Why is a Python module a natural singleton?', 'A module is imported and initialized once per process; any state defined at module level (objects, dicts) is shared by all importers. So putting a single config/logger object in a module gives singleton semantics without a metaclass.'],
    ['How do you make a lazy singleton thread-safe?', 'Guard the "create if absent" step with a lock (double-checked locking), as in the metaclass example, so concurrent first-callers don’t each create an instance.'],
    ['How do you keep a needed singleton testable?', 'Inject it rather than reaching for a global, and/or provide a reset/replace hook used only in tests so state doesn’t leak between them.']],
  deep: [['Technique', 'If you truly need one instance, prefer a module-level object or create-once-and-inject; reserve metaclass/decorator singletons for when enforcement is required.'],
    ['Failure mode', 'Global access reached everywhere (hidden deps, cross-test state leaks) and unsynchronized lazy init races.'],
    ['In interviews', 'Mention you’d usually inject a single instance; show you can implement the thread-safe version but know its downsides.']],
  src: ['Refactoring Guru: Singleton', 'https://refactoring.guru/design-patterns/singleton'] });

SDX('pat-adapter', { name: 'Adapter', cat: 'sdpat',
  blurb: `Adapter wraps an incompatible interface so it fits the one your code expects, letting classes that couldn’t otherwise work together collaborate. It’s the glue for integrating third-party or legacy code without changing it.`,
  facts: [['Type', 'Structural'], ['Intent', 'make an incompatible interface fit'], ['Wraps', 'a third-party/legacy class'], ['Keeps', 'your code depending on your interface']],
  cheat: [['Adapter', 'Translate one interface into another'], ['Adaptee', 'The class with the wrong interface'], ['Target', 'The interface your code expects'], ['Use when', 'Integrating third-party/legacy code'], ['No source change', 'Wrap, don’t modify the adaptee'], ['vs Facade', 'Adapter converts; Facade simplifies'], ['vs Decorator', 'Adapter changes interface; Decorator adds behavior'], ['Object adapter', 'Hold the adaptee (composition) — preferred'], ['Keeps clean', 'Your core depends on your target interface'], ['Example', 'Wrap a legacy XML lib behind a JSON interface'] ],
  sections: [
    ['Intent & structure', PP(`Adapter sits between your code and a class whose <b>interface doesn’t match</b> what you need (a third-party SDK, a legacy module). The adapter <b>implements the interface your code expects</b> (the <i>target</i>) and <b>translates</b> each call into the vocabulary of the wrapped class (the <i>adaptee</i>). Your core code keeps depending on <b>your</b> interface; the mismatch is isolated in one small class you can replace if the dependency changes.`)],
    ['When to use it', PP(`Use Adapter when you must <b>integrate something you can’t (or shouldn’t) change</b> — a vendor library, an old internal module, an API that returns the wrong shape — and you want the rest of your code to stay clean and vendor-agnostic. The preferred form is the <b>object adapter</b>: the adapter <b>holds</b> the adaptee as an attribute (composition) and delegates, rather than inheriting from it.`)]
  ],
  snipTitle: 'Adapter in Python', snipNote: 'Wrapping a third-party payment SDK behind your own interface.',
  snips: [['Adapter', 'python', `from abc import ABC, abstractmethod

# Target: the interface YOUR code expects
class PaymentGateway(ABC):
    @abstractmethod
    def pay(self, amount_cents: int) -> bool: ...

# Adaptee: a third-party class with a different interface (can't change it)
class StripeSDK:
    def create_charge(self, dollars: float, currency: str) -> dict:
        return {"status": "succeeded", "amount": dollars}

# Adapter: makes StripeSDK fit PaymentGateway
class StripeAdapter(PaymentGateway):
    def __init__(self, sdk: StripeSDK):
        self._sdk = sdk                       # composition (object adapter)
    def pay(self, amount_cents: int) -> bool:
        res = self._sdk.create_charge(amount_cents / 100, "usd")  # translate
        return res["status"] == "succeeded"

def checkout(gw: PaymentGateway, cents: int):
    print("paid" if gw.pay(cents) else "failed")

checkout(StripeAdapter(StripeSDK()), 4999)    # your code never touches StripeSDK`]],
  edge: [`Prefer the <b>object adapter</b> (hold the adaptee via composition) over a class adapter (multiple inheritance) — it’s more flexible and avoids inheriting the adaptee’s unwanted methods.`, `An adapter should <b>only translate</b>; if it starts adding real business logic, that logic is now hidden in glue code — move it out.`, `Translating a <b>rich</b> interface down to a narrow one can lose information (errors, metadata) — map error cases deliberately, not just the happy path.`, `Don’t confuse Adapter (change the interface) with Decorator (same interface, add behavior) or Facade (simplify a subsystem).`],
  faq: [['How is Adapter different from Facade and Decorator?', PP(`All three wrap something, but with <b>different intents</b>. <b>Adapter</b> changes an <b>interface</b> — it makes an existing class usable through a <i>different</i> interface your code expects, without changing the class. <b>Facade</b> doesn’t change interfaces so much as <b>simplify</b> — it provides one easy, high-level interface over a <i>complicated subsystem</i> of many classes. <b>Decorator</b> keeps the <b>same</b> interface and <b>adds behavior</b> (logging, caching) by wrapping. Quick test: converting A’s interface to B’s = Adapter; hiding a messy subsystem behind a simple door = Facade; same interface but enhanced = Decorator.`)],
    ['Why prefer composition (object adapter) over inheritance (class adapter)?', PP(`A <b>class adapter</b> inherits from both the target and the adaptee (multiple inheritance), which <b>couples</b> the adapter to the adaptee’s implementation and drags in all its methods — including ones you don’t want exposed. An <b>object adapter holds the adaptee as an attribute</b> and delegates, which is looser: you can adapt a <b>final/sealed</b> class, swap the wrapped instance, adapt <b>multiple</b> adaptees, and expose only the translated methods. It also sidesteps multiple-inheritance pitfalls (MRO surprises). That’s why the object adapter is the recommended form, and it’s the natural one in Python where composition is idiomatic.`)]],
  qs: [SQ('Adapter’s purpose is to…', ['Add behavior to an object', 'Make an incompatible interface fit the one your code expects', 'Ensure one instance', 'Simplify a complex subsystem'], 1, 'Adapter translates one interface into another so classes can collaborate.'),
    SQ('The preferred Adapter form holds the adaptee via…', ['Multiple inheritance', 'Composition (object adapter)', 'A global variable', 'A singleton'], 1, 'Object adapters delegate to a held instance, avoiding inheritance coupling.')]
});
DP('pat-adapter', {
  fu: [['Where does Adapter show up in real systems?', 'Wrapping vendor SDKs behind your own interface (payments, SMS, storage), normalizing different APIs to one shape, and shielding core code from a dependency you may later replace.'],
    ['How does Adapter aid testability?', 'Because your code depends on your target interface, you can inject a fake adapter in tests instead of the real third-party client, isolating your logic from the network.'],
    ['Can an adapter wrap multiple adaptees?', 'Yes — an object adapter can delegate to several underlying objects to synthesize the target interface, which a class adapter (inheritance) can’t do as cleanly.']],
  deep: [['Technique', 'Define the interface your core needs, then write a thin object adapter per external dependency that translates calls and maps errors, keeping core code vendor-agnostic.'],
    ['Failure mode', 'Adapters that smuggle in business logic, lose error information, or use class-adapter inheritance that leaks the adaptee’s API.'],
    ['In interviews', 'Reach for Adapter when integrating an external/legacy component with a mismatched interface; note it keeps your core depending on your own abstraction.']],
  src: ['Refactoring Guru: Adapter', 'https://refactoring.guru/design-patterns/adapter'] });

SDX('pat-decorator', { name: 'Decorator', cat: 'sdpat',
  blurb: `Decorator wraps an object to add behavior while keeping the same interface, so you can layer features (logging, caching, compression) at runtime without subclassing. It’s composition-based extension — and the idea behind Python’s @decorators.`,
  facts: [['Type', 'Structural'], ['Intent', 'add behavior without subclassing'], ['Keeps', 'the same interface'], ['Stackable', 'wrap multiple layers']],
  cheat: [['Decorator', 'Wrap an object; add behavior; same interface'], ['Stackable', 'Wrap a wrapper (logging(caching(svc)))'], ['Runtime', 'Compose features dynamically'], ['vs subclassing', 'Avoids class explosion for feature combos'], ['vs Adapter', 'Same interface vs changed interface'], ['Transparent', 'Clients can’t tell it’s wrapped'], ['Python @', 'Function/method decorators are this idea'], ['Use when', 'Optional, combinable responsibilities'], ['Keep delegation', 'Call the wrapped object, then add'], ['Example', 'Streams, middleware, caching layers'] ],
  sections: [
    ['Intent & structure', PP(`A Decorator <b>wraps</b> another object that implements the same interface, <b>forwards</b> calls to it, and <b>adds behavior</b> before or after. Because it preserves the interface, clients treat the decorated object exactly like the original — and because decorators can wrap other decorators, you can <b>stack</b> features (caching around logging around the real service) and choose the combination <b>at runtime</b>. This is <b>composition-based extension</b>: new behavior without touching the original class.`)],
    ['When to use it', PP(`Use Decorator when you have <b>optional, combinable responsibilities</b> to attach to objects — logging, caching, retries, compression, access checks — and subclassing would explode into one class per combination (<code>LoggingCachingService</code>, <code>LoggingRetryingService</code>…). Each concern becomes one decorator, and callers compose the ones they want. This is exactly the model behind <b>Python’s <code>@</code> decorators</b> and web <b>middleware</b>.`)]
  ],
  snipTitle: 'Decorator in Python', snipNote: 'Stacking logging and caching around a data service, same interface throughout.',
  snips: [['Decorator', 'python', `from abc import ABC, abstractmethod

class DataSource(ABC):
    @abstractmethod
    def get(self, key: str) -> str: ...

class RealSource(DataSource):
    def get(self, key): print(f"  fetch {key}"); return f"value:{key}"

class SourceDecorator(DataSource):         # base wrapper: same interface
    def __init__(self, wrapped: DataSource): self._wrapped = wrapped
    def get(self, key): return self._wrapped.get(key)

class LoggingSource(SourceDecorator):
    def get(self, key):
        print(f"log: get({key})")
        return super().get(key)            # delegate, then add

class CachingSource(SourceDecorator):
    def __init__(self, wrapped): super().__init__(wrapped); self._cache = {}
    def get(self, key):
        if key not in self._cache:
            self._cache[key] = super().get(key)
        return self._cache[key]

src = LoggingSource(CachingSource(RealSource()))   # stack features at runtime
src.get("a"); src.get("a")     # fetched once, logged twice`]],
  edge: [`Decorators must <b>preserve the interface</b> and delegate to the wrapped object — forgetting to call the inner object drops its behavior.`, `<b>Order matters</b> when stacking (caching-then-logging differs from logging-then-caching); be deliberate about which wraps which.`, `Deeply nested decorators can make <b>debugging</b> harder (long call chains) and obscure where behavior comes from — keep stacks shallow and named clearly.`, `Python function <code>@decorators</code> should use <code>functools.wraps</code> to preserve the wrapped function’s name/metadata.`],
  faq: [['How is Decorator different from inheritance for adding behavior?', PP(`Inheritance adds behavior at <b>class-definition time</b> and <b>statically</b> — to combine three optional features you’d need a subclass for every combination (<code>LoggingCachingRetryingService</code>), which explodes combinatorially. Decorator adds behavior at <b>runtime</b> by <b>wrapping</b>: each feature is one decorator, and callers compose exactly the ones they want in any order (<code>Logging(Caching(Retrying(svc)))</code>). It also keeps each concern in its own small class (single responsibility) and lets you decorate objects you didn’t create. The trade-off is more small objects and longer call chains; the win is flexible, combinable, run-time extension without subclass explosion.`)],
    ['How does this relate to Python’s <code>@</code> decorators?', PP(`They’re the same core idea applied to functions. A Python <code>@decorator</code> is a callable that <b>wraps a function, forwards the call, and adds behavior</b> before/after (timing, caching via <code>lru_cache</code>, auth checks) — exactly the Decorator pattern’s "same interface, added behavior" with functions instead of objects. Web <b>middleware</b> is the same pattern at request scope. One practical note: function decorators should apply <code>functools.wraps</code> so the wrapper keeps the original function’s name, docstring, and signature. The object form (wrapping instances behind a shared interface) is what you’d draw in an LLD interview; the <code>@</code> form is its everyday Python incarnation.`)]],
  qs: [SQ('Decorator adds behavior to an object while…', ['Changing its interface', 'Keeping the same interface so clients are unaffected', 'Ensuring one instance', 'Creating object families'], 1, 'Decorator preserves the interface and delegates, adding behavior around calls.'),
    SQ('Compared to subclassing for every feature combination, Decorator…', ['Causes more class explosion', 'Lets you compose features at runtime, avoiding combinatorial subclasses', 'Requires multiple inheritance', 'Prevents reuse'], 1, 'One decorator per concern, composed as needed, avoids a class per combination.')]
});
DP('pat-decorator', {
  fu: [['What’s the difference between the Decorator pattern and Python function decorators?', 'Same concept, different granularity: the pattern wraps objects behind a shared interface; Python @decorators wrap functions/methods. Both forward the call and add behavior; use functools.wraps for the function form.'],
    ['How do decorators compare to middleware?', 'Web middleware is the Decorator/Chain idea at request scope: each layer wraps the next handler, adding behavior (auth, logging, compression) before/after calling it.'],
    ['When would you NOT use Decorator?', 'When there’s only one fixed combination of behaviors (just put them in the class), or when behaviors must share lots of state (wrapping gets awkward). Keep stacks shallow for debuggability.']],
  deep: [['Technique', 'Define a base wrapper that delegates to the wrapped object; make each concern a decorator that calls super()/the inner object and adds behavior; compose at runtime.'],
    ['Failure mode', 'Forgetting to delegate, order-dependent bugs when stacking, and deep stacks that obscure behavior.'],
    ['In interviews', 'Use it for optional, combinable cross-cutting concerns (logging/caching/retries); mention it underpins Python decorators and middleware.']],
  src: ['Refactoring Guru: Decorator', 'https://refactoring.guru/design-patterns/decorator'] });

SDX('pat-observer', { name: 'Observer', cat: 'sdpat',
  blurb: `Observer lets a subject notify many dependent objects automatically when its state changes, without the subject knowing who they are. It’s the basis of event systems, pub/sub, and reactive UIs.`,
  facts: [['Type', 'Behavioral'], ['Intent', 'one-to-many change notification'], ['Decouples', 'subject from observers'], ['Basis of', 'events, pub/sub, reactive UI']],
  cheat: [['Subject', 'Holds state; notifies observers on change'], ['Observer', 'Subscribes; reacts to updates'], ['subscribe/unsubscribe', 'Register/deregister observers'], ['notify', 'Push updates to all observers'], ['Decoupled', 'Subject doesn’t know observer types'], ['Push vs pull', 'Send the data, or send "changed" and let them fetch'], ['Use when', 'Many parts must react to one change'], ['Risk', 'Leaks if you never unsubscribe'], ['vs Pub/Sub', 'Pub/sub adds a broker between them'], ['Example', 'UI bindings, stock tickers, event buses'] ],
  sections: [
    ['Intent & structure', PP(`Observer sets up a <b>one-to-many</b> dependency: a <b>subject</b> keeps a list of <b>observers</b> and, when its state changes, <b>notifies</b> each by calling an agreed method (<code>update</code>). The subject doesn’t know the observers’ concrete types — only that they implement the observer interface — so you can <b>add or remove reactions</b> without touching the subject. Observers <b>subscribe</b> and <b>unsubscribe</b> dynamically.`)],
    ['When to use it', PP(`Use Observer when a <b>change in one object must trigger updates in many others</b> that shouldn’t be hard-wired to it: a spreadsheet cell recalculating dependents, UI widgets reflecting a model, a stock price updating every display. It underpins <b>event systems</b> and <b>reactive</b> frameworks. For cross-process or many-to-many at scale, you graduate to <b>pub/sub with a broker</b> (Kafka, Redis), which is Observer with an intermediary.`)]
  ],
  snipTitle: 'Observer in Python', snipNote: 'A stock ticker notifying multiple displays; observers subscribe and unsubscribe.',
  snips: [['Observer', 'python', `class Subject:
    def __init__(self):
        self._observers = []
    def subscribe(self, obs): self._observers.append(obs)
    def unsubscribe(self, obs): self._observers.remove(obs)
    def _notify(self, *args):
        for obs in list(self._observers):     # copy: safe if one unsubscribes
            obs.update(*args)

class Stock(Subject):
    def __init__(self, symbol):
        super().__init__(); self.symbol = symbol; self._price = 0
    def set_price(self, price):
        self._price = price
        self._notify(self.symbol, price)       # push the change

class PriceDisplay:
    def __init__(self, name): self.name = name
    def update(self, symbol, price):
        print(f"{self.name}: {symbol} = {price}")

aapl = Stock("AAPL")
d1, d2 = PriceDisplay("web"), PriceDisplay("mobile")
aapl.subscribe(d1); aapl.subscribe(d2)
aapl.set_price(190)      # both displays update
aapl.unsubscribe(d2)
aapl.set_price(191)      # only web updates`]],
  edge: [`<b>Memory leaks</b>: observers that never unsubscribe keep the subject referencing them (and vice versa) — a classic bug in long-lived subjects and UI components (React effects need cleanup for this reason).`, `Notifying while an observer <b>unsubscribes during the callback</b> mutates the list mid-iteration — iterate over a <b>copy</b> (as above).`, `A slow or throwing observer can <b>block or break</b> notification for the rest — isolate failures, or dispatch asynchronously.`, `<b>Update storms</b>: a change triggering cascades of further changes can loop or thrash; batch or debounce notifications.`],
  faq: [['How is Observer different from pub/sub?', PP(`They’re the same idea at different scales. In the classic <b>Observer</b> pattern, observers register <b>directly with the subject</b>, and the subject calls them — it’s in-process and the two sides know each other through an interface. <b>Publish/subscribe</b> inserts a <b>broker/event bus</b> between publishers and subscribers: publishers emit to a <b>topic</b>, subscribers listen to topics, and <b>neither knows the other exists</b>. That extra indirection buys you many-to-many fan-out, cross-process/cross-service delivery, buffering, and durability (think Kafka or Redis pub/sub). So Observer is the in-memory, directly-coupled form; pub/sub is the distributed, broker-mediated form you reach for when the parties are separate processes or you need the broker’s guarantees.`)],
    ['What are the main pitfalls of Observer?', PP(`The biggest is <b>lifecycle/memory leaks</b>: because the subject holds references to its observers, an observer that forgets to <b>unsubscribe</b> is kept alive by the subject (and may keep the subject alive too), which is a frequent leak in UIs and long-running subjects — this is exactly why UI frameworks make you clean up subscriptions. Other pitfalls: <b>mutating the observer list during notification</b> (iterate over a copy), a single <b>slow or failing observer</b> stalling or breaking the rest (isolate errors or notify asynchronously), and <b>update storms</b> where one change cascades into many (debounce/batch, and guard against cycles). Designing explicit subscribe/unsubscribe and defensive notification avoids most of these.`)]],
  qs: [SQ('Observer establishes what kind of relationship?', ['One-to-one', 'One-to-many: a subject notifies many observers on change', 'Many-to-one', 'No relationship'], 1, 'A subject notifies all registered observers when its state changes.'),
    SQ('A classic Observer bug is…', ['Too few classes', 'Memory leaks from observers that never unsubscribe', 'Being impossible in Python', 'Requiring inheritance'], 1, 'The subject keeps referencing observers that don’t unsubscribe, leaking memory.')]
});
DP('pat-observer', {
  fu: [['Push vs pull notification — which to use?', 'Push sends the changed data to observers (convenient, but couples to a payload shape); pull sends only "something changed" and observers query the subject for what they need (more flexible, more calls). Choose based on how much observers need and coupling tolerance.'],
    ['How does Observer scale to distributed systems?', 'It becomes pub/sub with a broker (Kafka, Redis, SNS/SQS) that decouples producers and consumers, adds durability and fan-out, and crosses process/service boundaries.'],
    ['Why do UI frameworks emphasize unsubscribing?', 'Because component instances subscribe to stores/events; if they don’t unsubscribe on unmount, the store keeps them alive, leaking memory and causing updates to dead components. Hence cleanup in effects/lifecycle hooks.']],
  deep: [['Technique', 'Maintain a subscriber list with subscribe/unsubscribe, notify over a copy, isolate observer failures, and ensure observers unsubscribe when done.'],
    ['Failure mode', 'Leaks from missing unsubscribe, list mutation during notify, and cascading update storms.'],
    ['In interviews', 'Use Observer for in-process event reactions; note you’d switch to broker-based pub/sub for cross-service, durable, or high-fan-out needs.']],
  src: ['Refactoring Guru: Observer', 'https://refactoring.guru/design-patterns/observer'] });

SDX('pat-state', { name: 'State', cat: 'sdpat',
  blurb: `State lets an object change its behavior when its internal state changes, by delegating to a state object that represents the current mode. It replaces sprawling state-machine conditionals with one class per state.`,
  facts: [['Type', 'Behavioral'], ['Intent', 'behavior varies by internal state'], ['Each state', 'is its own class'], ['Replaces', 'big state-machine if/elif']],
  cheat: [['State', 'Encapsulate each state as a class'], ['Context', 'Delegates to its current state object'], ['Transition', 'A state sets the context’s next state'], ['Use when', 'An object behaves differently per mode'], ['Replaces', 'if self.state == ... everywhere'], ['vs Strategy', 'States transition themselves; strategies are chosen'], ['Each handles', 'The same events differently'], ['Example', 'Vending machine, order lifecycle, TCP'], ['Benefit', 'Add a state without editing others'], ['Transitions', 'Explicit and localized'] ],
  sections: [
    ['Intent & structure', PP(`State turns each <b>mode</b> of an object into its own <b>class</b> implementing a common interface, and the <b>context</b> holds a reference to the <b>current state</b> and <b>delegates</b> event handling to it. Because each state class handles the same events <b>differently</b> and decides the <b>next state</b>, the context’s behavior changes as its state object changes — and the transition logic lives <b>inside the states</b>, localized rather than scattered.`)],
    ['When to use it', PP(`Use State when an object has a clear <b>finite set of modes</b> and its behavior for the <i>same</i> operations differs per mode — a vending machine (<code>no-coin</code>, <code>has-coin</code>, <code>dispensing</code>), an order (<code>pending</code>, <code>paid</code>, <code>shipped</code>), a connection (<code>closed</code>, <code>open</code>). Without the pattern you get the same <code>if self.state == ...</code> ladder duplicated across every method; with it, each state is one cohesive class and adding a mode doesn’t disturb the others.`)]
  ],
  snipTitle: 'State in Python', snipNote: 'A vending machine where each state handles events and sets the next state.',
  snips: [['State', 'python', `from abc import ABC, abstractmethod

class State(ABC):
    @abstractmethod
    def insert_coin(self, m): ...
    @abstractmethod
    def dispense(self, m): ...

class NoCoin(State):
    def insert_coin(self, m):
        print("coin accepted"); m.state = HasCoin()
    def dispense(self, m):
        print("insert a coin first")

class HasCoin(State):
    def insert_coin(self, m):
        print("already have a coin")
    def dispense(self, m):
        print("dispensing"); m.state = NoCoin()

class VendingMachine:                      # the context
    def __init__(self): self.state = NoCoin()
    def insert_coin(self): self.state.insert_coin(self)
    def dispense(self): self.state.dispense(self)

vm = VendingMachine()
vm.dispense()       # insert a coin first
vm.insert_coin()    # coin accepted
vm.dispense()       # dispensing  (back to NoCoin)`]],
  edge: [`Transition logic should live <b>inside the state classes</b> (each state knows its valid next states) — if the context decides transitions with a conditional, you’ve lost the pattern’s benefit.`, `States that need <b>shared data</b> read/write it through the context; don’t duplicate state data in each state object.`, `A large number of states can mean <b>many small classes</b>; for truly trivial machines a simple enum + dict of transitions may be clearer.`, `Beware <b>illegal transitions</b> — handle "invalid event for this state" explicitly rather than silently ignoring.`],
  faq: [['How is State different from Strategy — they look identical?', PP(`Structurally they’re twins (a context delegating to an interchangeable object), but the <b>intent and who controls the object</b> differ. In <b>Strategy</b>, the behavior is <b>chosen from outside</b> and typically stays put for the operation — the client picks a sorting or pricing strategy, and strategies are <b>independent</b> of each other. In <b>State</b>, the object <b>moves between a known set of modes on its own</b>, and the <b>state objects trigger the transitions</b> between themselves (the <code>HasCoin</code> state flips the machine back to <code>NoCoin</code> after dispensing). So Strategy is about <i>interchangeable algorithms selected by a client</i>; State is about <i>an object whose behavior and allowed actions change as it transitions through a lifecycle</i>.`)],
    ['When is the State pattern overkill?', PP(`When the state machine is <b>small and stable</b>. If you have two or three states and simple transitions, a class per state can be more ceremony than it’s worth — an <b>enum plus a transition table</b> (a dict mapping <code>(state, event) → next_state</code>) or a couple of methods may be clearer and shorter. The pattern pays off when there are <b>several states</b>, each with <b>meaningfully different behavior across several operations</b>, and when you expect to <b>add states</b> over time — then one cohesive class per state keeps things readable and makes adding a mode a localized change. As always, apply the pattern to remove real duplication/conditionals, not preemptively.`)]],
  qs: [SQ('The State pattern replaces…', ['Object creation logic', 'Sprawling "if current_state == ..." conditionals across methods', 'A single instance', 'Interface conversion'], 1, 'Each state becomes a class handling events and transitions, removing the ladders.'),
    SQ('A key difference from Strategy is that in State…', ['The client always picks the behavior', 'State objects trigger transitions between themselves as the object’s mode changes', 'There is no context', 'Behavior never changes'], 1, 'States move the context between modes on their own; strategies are chosen externally.')]
});
DP('pat-state', {
  fu: [['State pattern vs an enum + transition table?', 'For simple machines, an enum with a dict of (state, event) -> next_state is concise. The State pattern suits richer behavior: when each state does substantial, differing work across several methods and you expect growth.'],
    ['Where do transitions belong?', 'Inside the state objects (each knows its valid next states), so adding or changing a state is localized. The context just delegates and holds the current state.'],
    ['Real examples?', 'Vending machines, order/payment lifecycles, document workflows (draft/review/published), TCP connection states, and game character modes.']],
  deep: [['Technique', 'One class per state implementing a common interface; the context delegates events to the current state; states set the next state. Share data via the context.'],
    ['Failure mode', 'Transition logic leaking back into the context, duplicated state data, or over-engineering a trivial machine.'],
    ['In interviews', 'Use State when a lifecycle with distinct modes drives behavior (vending machine, order status); contrast it with Strategy if asked.']],
  src: ['Refactoring Guru: State', 'https://refactoring.guru/design-patterns/state'] });

SDX('pat-command', { name: 'Command', cat: 'sdpat',
  blurb: `Command turns a request into a standalone object carrying everything needed to perform it later, enabling undo/redo, queuing, logging, and decoupling the invoker from the receiver.`,
  facts: [['Type', 'Behavioral'], ['Intent', 'encapsulate a request as an object'], ['Enables', 'undo/redo, queues, logging'], ['Decouples', 'invoker from receiver']],
  cheat: [['Command', 'An object with execute() (and often undo())'], ['Receiver', 'The object that does the real work'], ['Invoker', 'Triggers commands (button, queue, scheduler)'], ['Undo/redo', 'Keep a history of commands'], ['Queue', 'Commands can be stored and run later'], ['Decouples', 'Invoker needn’t know the receiver'], ['Use when', 'Actions must be parameterized/deferred/undone'], ['Macro', 'Composite command = sequence'], ['Python', 'A command can be a closure/partial'], ['Example', 'Editor actions, job queues, remote controls'] ],
  sections: [
    ['Intent & structure', PP(`Command wraps a request as an object with an <code>execute()</code> method (and often <code>undo()</code>), bundling the <b>receiver</b> (who does the work) and the <b>arguments</b>. An <b>invoker</b> (a button, a queue, a scheduler) holds commands and calls <code>execute()</code> without knowing what they do or who they target. Because the request is now a <b>first-class object</b>, you can <b>store</b> it (queues, logs), <b>replay</b> it, or keep a <b>history</b> to support undo/redo.`)],
    ['When to use it', PP(`Use Command when actions must be <b>parameterized, deferred, queued, logged, or undone</b>: editor operations with undo/redo, a <b>job queue</b> of tasks to run later, transactional operations you can roll back, or decoupling a UI from the logic it triggers. Each action becomes a command object; the invoker just manages and fires them. In Python a simple command can be a <b>closure or <code>functools.partial</code></b>, with a full class when you also need <code>undo()</code> or metadata.`)]
  ],
  snipTitle: 'Command in Python', snipNote: 'Editor commands with undo and a history stack.',
  snips: [['Command', 'python', `from abc import ABC, abstractmethod

class Command(ABC):
    @abstractmethod
    def execute(self): ...
    @abstractmethod
    def undo(self): ...

class Document:                            # the receiver
    def __init__(self): self.text = ""

class AppendText(Command):
    def __init__(self, doc: Document, s: str):
        self.doc, self.s = doc, s
    def execute(self): self.doc.text += self.s
    def undo(self): self.doc.text = self.doc.text[: -len(self.s)]

class Editor:                              # the invoker
    def __init__(self): self.history = []
    def run(self, cmd: Command):
        cmd.execute(); self.history.append(cmd)
    def undo(self):
        if self.history: self.history.pop().undo()

doc = Document(); ed = Editor()
ed.run(AppendText(doc, "Hello "))
ed.run(AppendText(doc, "World"))
print(doc.text)      # Hello World
ed.undo()
print(doc.text)      # Hello`]],
  edge: [`For <b>undo</b>, each command must capture enough state to reverse itself precisely (what it added, previous values) — storing too little makes undo wrong.`, `Commands that hold references to large receivers/state can keep them alive (memory) — be mindful in long histories.`, `In Python, a full Command class is overkill for fire-and-forget actions — a <b>closure/partial</b> suffices unless you need <code>undo()</code> or serialization.`, `Serializing commands for a durable queue requires them to be <b>pickle/JSON-friendly</b> — avoid capturing unserializable objects if they must persist.`],
  faq: [['What does turning a request into an object actually buy you?', PP(`It makes the action <b>manipulable</b> instead of a one-shot method call. Once a request is an object with <code>execute()</code>, you can: keep a <b>history</b> of executed commands to support <b>undo/redo</b> (call <code>undo()</code> in reverse); <b>queue</b> commands to run later or on a worker (a job/task queue is a queue of commands); <b>log</b> them for audit or replay; <b>compose</b> them into macros; and <b>decouple</b> the thing that triggers an action (a button, a scheduler) from the thing that performs it (the receiver), so the invoker needs no knowledge of the work. None of that is possible when the action is just an inline method call — the pattern’s value is precisely that the request becomes data you can store, defer, and reverse.`)],
    ['When should a Command be a class versus just a function?', PP(`Use a <b>function/closure (or <code>functools.partial</code>)</b> when the command is <b>fire-and-forget</b> — you just need to defer or queue a callable, as in <code>queue.put(lambda: send_email(user))</code>. Reach for a <b>full Command class</b> when you need more than execution: an <code>undo()</code> counterpart (so the object must remember how to reverse itself and the state it changed), <b>metadata</b> (name, timestamp, user for an audit log), <b>serialization</b> for a durable queue, or <b>composition</b> into macro commands. In short: closures for simple deferral, classes when the command needs identity, reversibility, or persistence. Python’s first-class functions mean you often start with a closure and graduate to a class only when undo/metadata appear.`)]],
  qs: [SQ('Command is especially useful for implementing…', ['One instance', 'Undo/redo, queuing, and logging of actions', 'Interface conversion', 'Object families'], 1, 'Turning requests into objects enables history, deferral, and replay.'),
    SQ('The Command pattern decouples…', ['Two unrelated interfaces', 'The invoker (what triggers the action) from the receiver (what performs it)', 'Data from its schema', 'Parents from children'], 1, 'The invoker fires commands without knowing the receiver or the work.')]
});
DP('pat-command', {
  fu: [['How do job/task queues relate to Command?', 'A task queue is a queue of commands: each job encapsulates a request (function + args) to run later on a worker. Serializing the command lets it persist and run on another process/machine.'],
    ['How is undo/redo implemented?', 'Keep a stack (history) of executed commands; undo pops and calls undo(); redo pushes back and calls execute(). Each command must store enough to reverse itself exactly.'],
    ['What is a macro command?', 'A Composite command holding a list of commands; its execute() runs them in order (and undo() reverses them), letting you treat a sequence as one undoable action.']],
  deep: [['Technique', 'Encapsulate each action as a command (execute/undo), have invokers manage and fire them, and keep a history for undo/redo or a queue for deferral.'],
    ['Failure mode', 'Undo that captures too little state, heavy commands leaking memory in long histories, or over-classing simple callables.'],
    ['In interviews', 'Reach for Command when the problem needs undo/redo, queued jobs, or decoupling UI triggers from logic; mention closures for the simple case.']],
  src: ['Refactoring Guru: Command', 'https://refactoring.guru/design-patterns/command'] });

SDX('pat-proxy', { name: 'Proxy', cat: 'sdpat',
  blurb: `Proxy provides a stand-in for another object that controls access to it — adding lazy loading, caching, access control, or remote communication while keeping the same interface.`,
  facts: [['Type', 'Structural'], ['Intent', 'control access via a stand-in'], ['Same interface', 'as the real object'], ['Kinds', 'virtual, protection, remote, caching']],
  cheat: [['Proxy', 'Stand-in that controls access to a real subject'], ['Same interface', 'Clients can’t tell it’s a proxy'], ['Virtual proxy', 'Lazy-create/load the expensive object'], ['Protection proxy', 'Check permissions before delegating'], ['Caching proxy', 'Return cached results'], ['Remote proxy', 'Represent an object in another process'], ['vs Decorator', 'Controls access vs adds behavior'], ['vs Adapter', 'Same interface vs changed interface'], ['Delegates', 'To the real subject when allowed'], ['Example', 'ORM lazy fields, API client, access guard'] ],
  sections: [
    ['Intent & structure', PP(`A Proxy implements the <b>same interface</b> as the real object (the <i>subject</i>) and <b>stands in</b> for it, deciding <b>when and whether</b> to forward calls to it. Because the interface matches, clients use the proxy exactly as they would the real thing, while the proxy transparently adds a <b>gatekeeping concern</b> — creating the real object lazily, checking permissions, caching results, or talking to a remote instance.`)],
    ['The four common kinds', PP(`<b>Virtual proxy</b>: delay creating/loading an expensive object until it’s actually used (ORM lazy relations, loading a big image on demand). <b>Protection proxy</b>: check <b>access rights</b> before delegating. <b>Caching proxy</b>: return a <b>stored result</b> instead of recomputing/refetching. <b>Remote proxy</b>: represent an object living in <b>another process/machine</b>, hiding the network call (an RPC/API client stub). All share the "same interface, controlled access" shape.`)]
  ],
  snipTitle: 'Proxy in Python', snipNote: 'A virtual + protection proxy around an expensive, access-controlled resource.',
  snips: [['Proxy', 'python', `from abc import ABC, abstractmethod

class Database(ABC):
    @abstractmethod
    def query(self, sql: str) -> list: ...

class RealDatabase(Database):              # expensive to create
    def __init__(self): print("opening real connection...")
    def query(self, sql): return [f"row for {sql}"]

class DatabaseProxy(Database):
    def __init__(self, user_role: str):
        self._role = user_role
        self._real = None                  # not created yet (virtual)
    def query(self, sql):
        if sql.lower().startswith("drop") and self._role != "admin":
            raise PermissionError("not allowed")     # protection
        if self._real is None:
            self._real = RealDatabase()    # lazy init on first real use
        return self._real.query(sql)

db = DatabaseProxy(user_role="viewer")
print(db.query("SELECT 1"))     # opens connection only now, then returns
# db.query("DROP TABLE users") -> PermissionError`]],
  edge: [`A proxy must <b>faithfully preserve the interface and semantics</b> — clients assume it behaves like the real subject; surprising differences (e.g. silent caching staleness) cause subtle bugs.`, `<b>Caching proxies</b> need an invalidation story; stale cached results are a classic source of hard-to-find bugs.`, `<b>Remote proxies</b> hide the network but not its reality — add timeouts, retries, and error handling; "it looks local but can fail/latency-spike" surprises callers.`, `Don’t confuse Proxy (controls access, same interface) with Decorator (adds behavior) or Adapter (changes interface) — though a proxy can <i>also</i> add behavior, its defining intent is access control.`],
  faq: [['How is Proxy different from Decorator — both wrap an object with the same interface?', PP(`The structure is similar (wrap an object, keep its interface), but the <b>intent</b> differs. A <b>Decorator</b>’s job is to <b>add behavior</b> — layering features like logging or caching <i>onto</i> the object’s normal operation, and decorators are meant to be <b>stacked</b>. A <b>Proxy</b>’s job is to <b>control access to</b> the real object — deciding whether to create it (lazy), whether the caller is allowed (protection), whether to go over the network (remote), or whether a cached answer suffices. A decorator always delegates to the wrapped object (it’s enhancing it); a proxy may <b>decide not to delegate at all</b> (deny access, return a cache, defer creation). In short: Decorator = "same thing, plus extra"; Proxy = "gatekeeper that may stand in for the real thing".`)],
    ['What’s a virtual proxy and why is it useful?', PP(`A <b>virtual proxy</b> delays the <b>creation or loading of an expensive object until it’s actually needed</b>. Clients get the proxy immediately (cheap), and only when they first call a real operation does the proxy create/load the heavyweight subject. This is exactly how <b>ORM lazy relationships</b> work — accessing <code>order.customer</code> doesn’t hit the database until you actually read a field — and how on-demand loading of large images, documents, or remote resources is implemented. The benefit is <b>faster startup and no wasted work</b> for objects that may never be used, while the client code stays unchanged because the proxy shares the subject’s interface. The trade-off is a hidden cost (and possible latency/failure) on first real use, so the "it’s just a field access" can secretly trigger I/O.`)]],
  qs: [SQ('A Proxy’s defining purpose is to…', ['Add stackable behavior', 'Control access to a real object while sharing its interface', 'Change an interface', 'Create object families'], 1, 'Proxy gatekeeps access (lazy, protection, caching, remote) behind the same interface.'),
    SQ('ORM lazy-loaded relationships are an example of which proxy kind?', ['Protection proxy', 'Virtual proxy (defer loading until used)', 'Remote proxy', 'Caching proxy'], 1, 'A virtual proxy delays creating/loading the expensive object until first real use.')]
});
DP('pat-proxy', {
  fu: [['What are the four classic proxy types again?', 'Virtual (lazy creation/loading), Protection (access control), Caching (return stored results), and Remote (represent an object in another process/machine, e.g. an RPC stub).'],
    ['How does a remote proxy relate to RPC/API clients?', 'An RPC/API client stub IS a remote proxy: it exposes the service’s interface locally and translates calls into network requests, hiding serialization and transport from the caller.'],
    ['How do proxies help cross-cutting concerns?', 'They centralize access-related concerns (auth checks, caching, lazy init, rate limiting) in one place without changing the real object or the clients, keeping those concerns out of business logic.']],
  deep: [['Technique', 'Implement the subject’s interface in a proxy that gatekeeps: lazily create, check permissions, cache, or call remotely, delegating to the real subject when appropriate.'],
    ['Failure mode', 'Stale caches, hidden network cost/failures in remote proxies, and proxies that diverge from the subject’s expected semantics.'],
    ['In interviews', 'Use a proxy for access control, lazy loading, caching, or representing remote resources; distinguish its access-control intent from Decorator’s behavior-adding one.']],
  src: ['Refactoring Guru: Proxy', 'https://refactoring.guru/design-patterns/proxy'] });

SDX('pat-chain', { name: 'Chain of Responsibility', cat: 'sdpat',
  blurb: `Chain of Responsibility passes a request along a chain of handlers until one handles it, decoupling the sender from the specific handler. It’s the pattern behind middleware pipelines and escalation flows.`,
  facts: [['Type', 'Behavioral'], ['Intent', 'pass a request along handlers'], ['Each handler', 'handles or forwards'], ['Basis of', 'middleware, event bubbling']],
  cheat: [['Chain', 'Linked handlers; request flows until handled'], ['Handler', 'Handles the request or passes it on'], ['Decouples', 'Sender from the concrete handler'], ['Order matters', 'Handlers run in chain order'], ['Use when', 'Several objects may handle a request'], ['Middleware', 'Web request pipelines are this pattern'], ['Escalation', 'Support tiers, approval limits'], ['May go unhandled', 'End of chain with no handler'], ['Compose', 'Add/remove/reorder handlers freely'], ['vs Decorator', 'Pass-along vs always-wrap-and-add'] ],
  sections: [
    ['Intent & structure', PP(`Each <b>handler</b> in the chain gets a chance to <b>process the request or pass it to the next</b> handler. The sender just hands the request to the first handler and doesn’t know which one (if any) will deal with it. Handlers are <b>linked</b> (each holds a reference to the next), so you can <b>add, remove, or reorder</b> them freely, and a request may flow through several — or reach the end <b>unhandled</b>.`)],
    ['When to use it', PP(`Use it when <b>more than one object might handle a request</b> and the handler isn’t known in advance, or when you want a <b>pipeline</b> of processing steps: web <b>middleware</b> (auth → logging → rate-limit → route), <b>escalation</b> flows (an expense approved by a manager, director, or VP depending on amount), event <b>bubbling</b> in UIs, and validation pipelines. Each concern is an independent handler you can compose.`)]
  ],
  snipTitle: 'Chain of Responsibility in Python', snipNote: 'An expense-approval chain where each level handles up to a limit or escalates.',
  snips: [['Chain', 'python', `from abc import ABC, abstractmethod

class Approver(ABC):
    def __init__(self): self._next = None
    def set_next(self, nxt):               # returns nxt for easy chaining
        self._next = nxt; return nxt
    def handle(self, amount: float):
        if self._can_approve(amount):
            print(f"{type(self).__name__} approved {amount}")
        elif self._next:
            self._next.handle(amount)      # escalate
        else:
            print(f"{amount} needs board approval")
    @abstractmethod
    def _can_approve(self, amount) -> bool: ...

class Manager(Approver):
    def _can_approve(self, a): return a <= 1_000
class Director(Approver):
    def _can_approve(self, a): return a <= 10_000
class VP(Approver):
    def _can_approve(self, a): return a <= 100_000

mgr = Manager()
mgr.set_next(Director()).set_next(VP())    # build the chain
mgr.handle(500)        # Manager approved 500
mgr.handle(8_000)      # Director approved 8000
mgr.handle(250_000)    # needs board approval`]],
  edge: [`A request can reach the <b>end of the chain unhandled</b> — decide deliberately whether that’s an error, a default, or silently allowed.`, `<b>Order matters</b>: putting auth after logging logs unauthenticated requests; design the sequence intentionally.`, `Long chains can be <b>hard to trace</b> (where was this handled?) — keep handlers focused and the chain observable (log which handler acted).`, `A handler that forgets to forward (<code>self._next.handle(...)</code>) silently <b>drops</b> requests that it didn’t handle.`],
  faq: [['How does Chain of Responsibility power web middleware?', PP(`Web <b>middleware</b> is essentially a Chain of Responsibility over HTTP requests. Each middleware is a handler that receives the request, does its part (authentication, logging, CORS, rate limiting, body parsing), and then either <b>short-circuits</b> (e.g. returns 401 without passing further) or <b>calls the next</b> handler in the pipeline. The framework wires them in order, and the final handler is your route logic. This gives you exactly the pattern’s benefits: each cross-cutting concern is an <b>independent, reorderable, composable</b> unit; the request sender (the server) doesn’t know which middleware will handle or reject it; and you can insert or remove steps without touching the others. The response often flows back through the chain in reverse, which is why order matters so much.`)],
    ['What should happen when no handler handles the request?', PP(`That’s a design decision you must make <b>explicitly</b>, because Chain of Responsibility allows a request to fall off the end <b>unhandled</b>. There are three common choices: (1) treat it as an <b>error</b> — raise or return a failure (e.g. "no approver can authorize this amount"), which is right when every request <i>should</i> be handled; (2) apply a <b>default</b> at the end of the chain — a catch-all handler that does something sensible (log and drop, return a 404 route, use a fallback value); or (3) allow it to pass silently, acceptable only when "nobody handled it" is a valid outcome. The pitfall is leaving it <b>implicit</b>: a request that quietly vanishes because the last handler neither handled nor had a next link is a hard bug to find. Make the terminal behavior a deliberate, visible part of the chain.`)]],
  qs: [SQ('In Chain of Responsibility, each handler…', ['Always handles the request', 'Either handles the request or passes it to the next handler', 'Creates objects', 'Converts interfaces'], 1, 'Handlers decide to handle or forward, decoupling sender from handler.'),
    SQ('Web middleware pipelines are an example of…', ['Singleton', 'Chain of Responsibility', 'Abstract Factory', 'Builder'], 1, 'Each middleware handles or forwards the request down the chain.')]
});
DP('pat-chain', {
  fu: [['How is Chain different from Decorator?', 'Both link wrappers, but a Decorator always delegates and adds behavior (it enhances every call), while a Chain handler may STOP the request (handle it) or pass it on — the request might not reach later handlers at all.'],
    ['Can multiple handlers act on one request?', 'Yes — handlers can do their part and still forward (middleware logging then continuing), or a handler can be terminal. The pattern supports both "first match wins" and "all applicable act" styles depending on whether handlers forward after acting.'],
    ['How do you keep long chains debuggable?', 'Log which handler acted (and short-circuited), keep handlers single-purpose, and make the chain construction explicit so the order is obvious.']],
  deep: [['Technique', 'Link focused handlers that either handle or forward; order them deliberately; define explicit terminal behavior for unhandled requests.'],
    ['Failure mode', 'Requests silently dropped (no handler, forgotten forward), order bugs, and untraceable long chains.'],
    ['In interviews', 'Use it for middleware/validation pipelines and escalation/approval flows; state what happens at the end of the chain.']],
  src: ['Refactoring Guru: Chain of Responsibility', 'https://refactoring.guru/design-patterns/chain-of-responsibility'] });

SDX('pat-composite', { name: 'Composite', cat: 'sdpat',
  blurb: `Composite lets you treat individual objects and compositions of objects uniformly through one interface, so clients handle a leaf and a whole tree the same way. It’s the pattern for part-whole hierarchies like file systems and UI trees.`,
  facts: [['Type', 'Structural'], ['Intent', 'treat leaves and groups uniformly'], ['Models', 'part-whole trees'], ['Recursion', 'operations recurse over children']],
  cheat: [['Composite', 'Uniform interface for leaf and group'], ['Leaf', 'A single object (no children)'], ['Composite node', 'Holds children; delegates to them'], ['Uniform', 'Clients treat one and many the same'], ['Recursive', 'Operations recurse through the tree'], ['Use when', 'Part-whole hierarchies (files, UI, menus)'], ['Add/remove', 'Children managed on composites'], ['Example', 'File system size(), org charts, DOM'], ['Benefit', 'No special-casing single vs group'], ['Trade-off', 'Interface may be broad (leaf ignores add/remove)'] ],
  sections: [
    ['Intent & structure', PP(`Composite defines a <b>common interface</b> for both <b>leaves</b> (individual objects) and <b>composites</b> (groups that contain children, which may themselves be leaves or composites). An operation called on a composite <b>recurses</b> into its children. The payoff: client code <b>doesn’t special-case</b> "one thing" versus "a group of things" — it calls the same method on a file or an entire folder tree and gets the right result.`)],
    ['When to use it', PP(`Use Composite for <b>part-whole hierarchies</b>: a <b>file system</b> where a folder’s size is the sum of its contents, <b>UI component</b> trees where rendering a panel renders its children, <b>menus and submenus</b>, organization charts, and graphics scenes. Whenever you catch yourself writing <code>if is_group: ... else: ...</code> across an entire tree, Composite removes the branching by making groups and items share an interface.`)]
  ],
  snipTitle: 'Composite in Python', snipNote: 'A file system where files and directories share one interface; size() recurses.',
  snips: [['Composite', 'python', `from abc import ABC, abstractmethod

class Node(ABC):
    def __init__(self, name): self.name = name
    @abstractmethod
    def size(self) -> int: ...

class File(Node):                          # leaf
    def __init__(self, name, size): super().__init__(name); self._size = size
    def size(self): return self._size

class Directory(Node):                     # composite
    def __init__(self, name): super().__init__(name); self.children = []
    def add(self, node: Node): self.children.append(node)
    def size(self):
        return sum(child.size() for child in self.children)   # recurse

root = Directory("root")
root.add(File("a.txt", 100))
sub = Directory("sub"); sub.add(File("b.txt", 250))
root.add(sub)
print(root.size())      # 350 — leaf and group treated the same way`]],
  edge: [`Deciding where child-management methods (<code>add</code>/<code>remove</code>) live is a trade-off: putting them on the <b>common interface</b> makes leaves implement no-ops; putting them only on composites keeps leaves clean but forces clients to type-check.`, `<b>Deep or cyclic</b> trees can cause recursion depth issues or infinite loops — guard against cycles and consider iterative traversal for very deep trees.`, `Operations that need <b>parent context</b> (path, ancestors) require back-references, which complicate the structure and copying.`, `Uniform treatment can hide <b>performance</b> differences — a <code>size()</code> that recurses a huge tree may be expensive; cache if hot.`],
  faq: [['What problem does Composite actually solve?', PP(`It eliminates the <b>"single vs group" branching</b> that otherwise spreads through code dealing with trees. Without it, every operation on a part-whole structure needs <code>if isinstance(x, Group): for child in x... else: handle(x)</code>, repeated everywhere and re-edited whenever the structure changes. Composite gives <b>leaves and groups a common interface</b>, so a client calls <code>node.size()</code>, <code>node.render()</code>, or <code>node.price()</code> without knowing or caring whether <code>node</code> is a single item or a whole subtree — the composite nodes handle recursion into their children internally. The result is simpler client code, easy extension (add new leaf or composite types), and a natural fit for anything shaped like a tree: file systems, UI component hierarchies, menus, org charts, and scene graphs.`)],
    ['Should add/remove be on the shared interface or only on composites?', PP(`This is the classic Composite trade-off between <b>transparency</b> and <b>safety</b>. Putting child-management methods (<code>add</code>, <code>remove</code>, <code>get_child</code>) on the <b>shared interface</b> (the "transparent" approach) means clients can treat every node identically and never type-check — but <b>leaves must implement these methods as no-ops or errors</b>, since a file has no children, which is a slightly dishonest interface. Putting them <b>only on composite nodes</b> (the "safe" approach) keeps the leaf interface honest, but clients must check "is this a composite?" before adding children, reintroducing some branching. The GoF leans toward transparency (uniformity) for client simplicity; many modern codebases prefer safety (methods only where they make sense). Pick based on whether your clients mostly traverse (favor transparency) or mostly build/modify the tree (favor safety).`)]],
  qs: [SQ('Composite lets clients…', ['Create one instance', 'Treat individual objects and groups of objects uniformly', 'Change an interface', 'Add behavior at runtime'], 1, 'Leaves and composites share one interface; operations recurse over the tree.'),
    SQ('Composite is the natural pattern for…', ['A single value', 'Part-whole hierarchies like file systems and UI trees', 'Access control', 'Undo/redo'], 1, 'Trees where a group is treated like an item (folders, components, menus).')]
});
DP('pat-composite', {
  fu: [['Transparent vs safe Composite — what’s the difference?', 'Transparent puts add/remove on the common interface (uniform clients, leaves have no-op methods); safe puts them only on composites (honest leaves, but clients must type-check). A trade-off between uniformity and interface honesty.'],
    ['How does Composite pair with the Visitor pattern?', 'Visitor lets you add new operations over a Composite tree without modifying the node classes — you traverse the composite and apply a visitor per node type. Handy when operations change more than the structure.'],
    ['Real-world Composites?', 'File systems (files/directories), UI/DOM trees, menus/submenus, organization charts, graphics scene graphs, and arithmetic expression trees.']],
  deep: [['Technique', 'Give leaves and composites a shared interface; composites hold children and recurse operations into them; decide where child-management methods live.'],
    ['Failure mode', 'Cyclic/very deep trees (recursion issues), dishonest leaf interfaces, and costly recursive operations on large trees.'],
    ['In interviews', 'Reach for Composite when the data is a part-whole tree and you want to treat items and groups uniformly (file system size, UI rendering).']],
  src: ['Refactoring Guru: Composite', 'https://refactoring.guru/design-patterns/composite'] });

SDX('pat-facade', { name: 'Facade', cat: 'sdpat',
  blurb: `Facade provides one simple, high-level interface over a complex subsystem of many classes, hiding its internals so clients get an easy entry point. It reduces coupling without removing the detailed API for those who need it.`,
  facts: [['Type', 'Structural'], ['Intent', 'simple interface over a complex subsystem'], ['Hides', 'subsystem internals'], ['Reduces', 'client coupling']],
  cheat: [['Facade', 'One easy door into a complex subsystem'], ['Subsystem', 'Many classes doing the real work'], ['Simplifies', 'Common tasks into one call'], ['Reduces coupling', 'Clients depend on the facade, not internals'], ['Not a wall', 'Advanced users can still use the subsystem'], ['vs Adapter', 'Simplify a subsystem vs convert one interface'], ['vs Mediator', 'One-way simplification vs peer coordination'], ['Use when', 'A subsystem is hard to use directly'], ['Keep thin', 'Orchestrate, don’t add business logic'], ['Example', 'A "compileVideo()" over codec/filter/muxer classes'] ],
  sections: [
    ['Intent & structure', PP(`A Facade is a single class offering <b>a few high-level methods</b> that orchestrate a <b>complicated subsystem</b> of many collaborating classes. Clients call the facade for the common cases and never touch the internals; the facade <b>wires the subsystem together</b> behind the scenes. Crucially, it’s <b>not a wall</b> — advanced code can still use the subsystem directly when it needs fine-grained control. The facade just provides the easy path.`)],
    ['When to use it', PP(`Use a Facade when a subsystem is <b>powerful but awkward to use directly</b> — many classes, specific call orders, lots of configuration — and most clients want a <b>simple, common operation</b>. Classic examples: a <code>VideoConverter.convert(file, format)</code> that hides codec, filter, and muxer classes; an <code>order.place()</code> facade over inventory, payment, and shipping services; a <b>client library</b> that wraps a sprawling API. It <b>reduces coupling</b>: clients depend on the small facade, so you can refactor the subsystem freely.`)]
  ],
  snipTitle: 'Facade in Python', snipNote: 'One place_order() call hiding inventory, payment and shipping subsystems.',
  snips: [['Facade', 'python', `class Inventory:
    def reserve(self, sku, qty): print(f"reserved {qty}x {sku}"); return True
class Payments:
    def charge(self, user, amount): print(f"charged {user} {amount}"); return True
class Shipping:
    def schedule(self, user, sku): print(f"shipping {sku} to {user}")

class OrderFacade:                         # one simple door
    def __init__(self):
        self._inv, self._pay, self._ship = Inventory(), Payments(), Shipping()
    def place_order(self, user, sku, qty, amount):
        if not self._inv.reserve(sku, qty):      # orchestrate the subsystem
            raise RuntimeError("out of stock")
        if not self._pay.charge(user, amount):
            raise RuntimeError("payment failed")
        self._ship.schedule(user, sku)
        return "order placed"

print(OrderFacade().place_order("ada", "book-1", 1, 25.0))
# clients call ONE method; they never touch Inventory/Payments/Shipping`]],
  edge: [`Keep the facade <b>thin</b>: it should <b>orchestrate</b> the subsystem, not accumulate business logic — a bloated "god facade" becomes its own problem.`, `A facade <b>shouldn’t block</b> access to the subsystem; expose the simple path but let advanced callers reach the internals when needed.`, `If clients routinely need capabilities the facade doesn’t expose, the facade is <b>too narrow</b> — widen it or let them use the subsystem, rather than leaking internals piecemeal.`, `Don’t confuse Facade (simplify a whole subsystem) with Adapter (convert one class’s interface) — they solve different problems.`],
  faq: [['How is a Facade different from an Adapter?', PP(`They’re both wrappers but aim at different problems. An <b>Adapter</b> is about <b>one class with the wrong interface</b> — it converts an existing object’s interface into the one your code expects so they can work together; the "shape" of functionality doesn’t change, just its signature. A <b>Facade</b> is about <b>a whole subsystem that’s hard to use</b> — it provides a new, <b>simpler high-level interface</b> over many classes, hiding their interactions. Adapter typically wraps <b>one</b> adaptee and changes its interface; Facade wraps <b>many</b> classes and <b>reduces complexity</b> (the underlying classes keep their interfaces; the facade just offers an easier entry point). Rule of thumb: converting an incompatible interface = Adapter; taming a complicated multi-class subsystem behind one door = Facade.`)],
    ['Does a Facade prevent access to the subsystem it wraps?', PP(`No — and that’s an important distinction. A Facade’s purpose is to provide a <b>convenient default path</b>, not to seal off the subsystem. Clients that only need the common operation use the facade and stay decoupled from the internals; but <b>advanced clients that need fine-grained control can still use the subsystem classes directly</b>. This is what separates a facade from an enforced boundary (like a module with truly hidden internals). Keeping the subsystem reachable is also why a facade shouldn’t hoard logic: it <b>orchestrates and simplifies</b> the common case while the full capability remains available underneath. If you find yourself needing to fully lock down access, that’s a different concern (encapsulation/an API boundary), not what Facade is for.`)]],
  qs: [SQ('A Facade provides…', ['A converted interface for one class', 'A simple high-level interface over a complex subsystem', 'Exactly one instance', 'Undo/redo of actions'], 1, 'Facade hides a multi-class subsystem behind one easy entry point.'),
    SQ('Compared to an Adapter, a Facade…', ['Converts a single incompatible interface', 'Simplifies a whole subsystem of many classes', 'Guarantees one instance', 'Adds stackable behavior'], 1, 'Adapter converts one interface; Facade simplifies an entire subsystem.')]
});
DP('pat-facade', {
  fu: [['How does Facade reduce coupling?', 'Clients depend only on the small facade interface, not on the many subsystem classes. You can refactor or replace subsystem internals freely as long as the facade’s contract holds.'],
    ['Facade vs Mediator?', 'A Facade offers a one-way simplified interface into a subsystem (clients -> facade -> subsystem). A Mediator coordinates peer objects that talk through it bidirectionally. Facade simplifies access; Mediator centralizes interaction.'],
    ['When does a facade become an anti-pattern?', 'When it swells into a god object holding business logic and every feature, or when it hides the subsystem so completely that needed capabilities become inaccessible. Keep it thin and non-blocking.']],
  deep: [['Technique', 'Offer a few high-level methods that orchestrate the subsystem for common cases; keep the facade thin and leave the subsystem reachable for advanced use.'],
    ['Failure mode', 'God facades full of logic, or overly restrictive facades that hide needed capability.'],
    ['In interviews', 'Use a facade to present a clean API over a multi-service operation (place order, convert video); distinguish it from Adapter.']],
  src: ['Refactoring Guru: Facade', 'https://refactoring.guru/design-patterns/facade'] });
