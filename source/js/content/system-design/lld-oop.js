/* ===== Low-level design A: object-oriented fundamentals (Python) ===== */
SD_CATS.push(['sdoop', 'Object-oriented design']);

SDX('oop-class', { name: 'Class & object', cat: 'sdoop',
  blurb: `A class is a blueprint; an object is a concrete instance of it with its own state. This is the atom of object-oriented design — in an LLD interview you turn the nouns in the requirements into classes and the verbs into their methods.`,
  facts: [['Class', 'a blueprint / type'], ['Object', 'an instance with its own state'], ['State', 'attributes (fields)'], ['Behavior', 'methods']],
  cheat: [['Class', 'Defines attributes + methods for a kind of thing'], ['Object / instance', 'A concrete value created from a class'], ['Attribute', 'Per-object data (self.x)'], ['Method', 'A function bound to the object'], ['Constructor', '__init__ sets up initial state'], ['Instance vs class attr', 'Per-object vs shared across all instances'], ['self', 'The current instance (explicit in Python)'], ['__repr__', 'Developer-facing string for debugging'], ['Nouns → classes', 'Verbs → methods (LLD heuristic)'], ['Identity vs equality', 'is (same object) vs == (same value)']],
  sections: [
    ['From requirements to classes', PP(`The core LLD move: read the problem, pull out the <b>nouns</b> (a user, an account, a parking spot) and make each a <b>class</b>, then pull out the <b>verbs</b> (deposit, park, cancel) and make each a <b>method</b> on the class that owns that responsibility. Each object carries its own <b>state</b> (attributes) and exposes <b>behavior</b> (methods) that operates on that state. Keeping state and the behavior that changes it together, in one class, is what makes code easy to reason about.`)],
    ['Instance vs class attributes', PP(`<b>Instance attributes</b> (set on <code>self</code>) are unique to each object. <b>Class attributes</b> are shared by every instance of the class — useful for constants or counters, but a frequent bug source when a mutable default (a list/dict) is shared accidentally. In an interview, be explicit about which data belongs to the object and which is shared.`)]
  ],
  snipTitle: 'Classes and objects in Python', snipNote: 'A blueprint, two instances, and the instance/class attribute distinction.',
  snips: [['Class & objects', 'python', `class BankAccount:
    bank_name = "Bitforge Bank"          # class attribute: shared by all

    def __init__(self, owner: str, balance: float = 0.0):
        self.owner = owner               # instance attributes: per object
        self.balance = balance

    def deposit(self, amount: float) -> None:
        self.balance += amount

    def __repr__(self) -> str:
        return f"BankAccount(owner={self.owner!r}, balance={self.balance})"

a = BankAccount("Ada", 100)
b = BankAccount("Alan")
a.deposit(50)
print(a)                 # BankAccount(owner='Ada', balance=150)
print(b.bank_name)       # Bitforge Bank  (shared class attribute)
print(a is b, a == b)    # False False  (different objects)`]],
  edge: [`A <b>mutable class attribute</b> (e.g. <code>items = []</code> at class level) is shared by every instance — mutating it changes it for all; use an instance attribute set in <code>__init__</code> instead.`, `A <b>mutable default argument</b> (<code>def __init__(self, tags=[])</code>) is created once and shared across calls — use <code>tags=None</code> then <code>tags or []</code>.`, `<code>is</code> checks identity (same object in memory); <code>==</code> checks value equality (via <code>__eq__</code>). Don’t use <code>is</code> to compare values.`, `Forgetting <code>self</code> on an attribute makes it a local variable that vanishes when the method returns.`],
  faq: [['How do you decide what becomes a class in an LLD interview?', PP(`Start from the requirements and extract the <b>nouns</b> — the real-world entities the system talks about (Parking Lot, Spot, Vehicle, Ticket). Each distinct noun with its own data and behavior becomes a <b>class</b>; the <b>verbs</b> (park, calculate fee) become <b>methods</b> on whichever class owns that responsibility. Group data with the behavior that acts on it. If a "class" has only data and no behavior, it may just be a data holder; if it has behavior but no state, it might be a function or a strategy. State this reasoning out loud — interviewers grade the modeling, not just the final diagram.`)],
    ['What’s the difference between an instance attribute and a class attribute?', PP(`An <b>instance attribute</b> (assigned via <code>self.x = ...</code>, usually in <code>__init__</code>) belongs to one object — each instance has its own copy. A <b>class attribute</b> is defined in the class body and <b>shared by every instance</b> of that class, which suits constants and shared counters. The classic trap is a <i>mutable</i> class attribute (a list or dict): mutating it through one instance affects all of them, because they all reference the same object. When in doubt, put per-object data in <code>__init__</code>.`)]],
  qs: [SQ('In LLD, the usual heuristic for turning requirements into a design is…', ['Random guessing', 'Nouns become classes; verbs become methods', 'Everything is one class', 'Only use functions'], 1, 'Nouns → classes (with their state), verbs → methods on the owning class.'),
    SQ('A list defined directly in the class body (not in __init__) is…', ['A separate copy per object', 'A class attribute shared by all instances', 'Illegal in Python', 'Automatically thread-safe'], 1, 'Class-level mutable data is shared; mutating it affects every instance.')]
});
DP('oop-class', {
  fu: [['When is a dataclass the right choice?', 'When a class is mostly structured data with little behavior, @dataclass auto-generates __init__, __repr__ and __eq__, reducing boilerplate. Add methods for the behavior. For richer invariants or validation, a hand-written class (or Pydantic) is clearer.'],
    ['What is the difference between a classmethod and a staticmethod?', 'A classmethod receives the class (cls) and is often used for alternative constructors (factory methods); a staticmethod receives neither self nor cls and is just a namespaced function. Instance methods receive self.'],
    ['How do __eq__ and __hash__ relate?', 'If you define __eq__ to compare by value, you should also define __hash__ consistently (equal objects must have equal hashes) or the object becomes unhashable / breaks in sets and dict keys.']],
  deep: [['Mental model', 'A class bundles state (attributes) with the behavior (methods) that maintains that state’s invariants. An object is one running instance of that bundle.'],
    ['Failure mode', 'God classes that accumulate unrelated state and behavior; or anemic classes that are pure data with logic scattered elsewhere. Aim for cohesive classes with one clear responsibility.'],
    ['In interviews', 'Verbalize the noun→class / verb→method extraction; it shows structured thinking and gives the interviewer your modeling rationale.']],
  src: ['Python docs: Classes', 'https://docs.python.org/3/tutorial/classes.html'] });

SDX('oop-encapsulation', { name: 'Encapsulation', cat: 'sdoop',
  blurb: `Encapsulation means bundling data with the methods that operate on it and hiding internal state behind a controlled interface, so invariants can’t be broken from outside. It is the property that makes an object trustworthy.`,
  facts: [['Bundles', 'state + behavior together'], ['Hides', 'internal representation'], ['Protects', 'invariants (e.g. balance ≥ 0)'], ['Python', 'convention (_), name-mangling (__)']],
  cheat: [['Encapsulation', 'Hide state; expose controlled operations'], ['Invariant', 'A rule that must always hold (balance ≥ 0)'], ['_single underscore', 'Convention: "internal, don’t touch"'], ['__double underscore', 'Name-mangled to avoid subclass clashes'], ['@property', 'Computed/validated access that looks like an attribute'], ['Getter/setter', 'Validate on read/write when needed'], ['Interface', 'The public methods callers rely on'], ['Why', 'Change internals without breaking callers'], ['Tell, don’t ask', 'Put logic in the object, not in callers'], ['Immutability', 'Another way to protect state'] ],
  sections: [
    ['Hiding state to protect invariants', PP(`An object owns an <b>invariant</b> — a condition that must always be true (an account balance never goes negative, a cart total equals the sum of its items). Encapsulation enforces it by making the state <b>private</b> and only allowing changes through <b>methods that check the rules</b>. If callers could set <code>balance</code> directly, any one of them could break the invariant; by funneling changes through <code>withdraw()</code>, the object guarantees it stays valid no matter who calls it.`)],
    ['Encapsulation in Python', PP(`Python has no hard <code>private</code>, but it has clear conventions: a leading underscore (<code>_x</code>) means "internal, use at your own risk," and a double underscore (<code>__x</code>) triggers <b>name-mangling</b> to avoid accidental clashes in subclasses. For controlled access that still <i>looks</i> like a plain attribute, use <code>@property</code> to add validation or computation on get/set without changing the caller’s syntax. The goal isn’t secrecy — it’s a stable public interface you can refactor behind.`)]
  ],
  snipTitle: 'Encapsulation with validation', snipNote: 'A protected balance that cannot go negative, exposed via a property.',
  snips: [['Protected invariant', 'python', `class BankAccount:
    def __init__(self, balance: float = 0.0):
        self._balance = balance          # "internal": don't poke directly

    @property
    def balance(self) -> float:          # read like an attribute: acct.balance
        return self._balance

    def deposit(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("amount must be positive")
        self._balance += amount

    def withdraw(self, amount: float) -> None:
        if amount > self._balance:       # invariant: never overdraw
            raise ValueError("insufficient funds")
        self._balance -= amount

acct = BankAccount(100)
acct.withdraw(30)
print(acct.balance)       # 70
# acct.balance = 1000     # AttributeError: no setter -> state is protected`]],
  edge: [`Returning a reference to an internal mutable object (a list/dict) <b>leaks</b> encapsulation — callers can mutate your internals; return a copy or an immutable view.`, `Python’s privacy is by <i>convention</i>; <code>_x</code> and even <code>__x</code> can be reached if someone insists. Encapsulation is about a clear contract, not security.`, `Over-encapsulating with getters/setters for every trivial field adds noise; expose plain attributes until you actually need validation (<code>@property</code> lets you add it later without changing callers).`, `Name-mangling (<code>__x</code>) is per-class; it prevents <i>accidental</i> subclass clashes, not deliberate access.`],
  faq: [['Why encapsulate at all — why not just use public attributes?', PP(`Because an object is responsible for keeping its own state <b>valid</b>. If any caller can write the state directly, the object can’t guarantee its invariants, and a bug anywhere becomes a bug in the object’s data. Encapsulation funnels every change through methods that <b>enforce the rules</b> (positive amounts, no overdraft), so the object is correct no matter who uses it. It also lets you <b>change the internal representation</b> later (store cents instead of dollars, cache a computed value) without breaking any caller, because they only depend on the public interface.`)],
    ['How do you encapsulate in Python if there’s no real <code>private</code>?', PP(`By convention and tooling rather than enforcement. A single leading underscore (<code>_balance</code>) signals "internal — not part of the public API," which linters and teammates respect. A double underscore (<code>__x</code>) invokes <b>name-mangling</b> so subclasses don’t accidentally overwrite it. For validated or computed access that still reads like an attribute, use <code>@property</code> (and an optional setter). The point is a <b>clear, stable public interface</b>; Python trusts developers rather than hard-blocking access, which in practice is enough to keep designs clean.`)]],
  qs: [SQ('The main purpose of encapsulation is to…', ['Make code run faster', 'Protect an object’s invariants by hiding state behind controlled methods', 'Avoid writing classes', 'Enable multiple inheritance'], 1, 'Hiding state and funneling changes through methods keeps invariants valid.'),
    SQ('In Python, how do you add validation to attribute access without changing caller syntax?', ['You cannot', 'Use @property (and a setter)', 'Rename the class', 'Use a global variable'], 1, '@property exposes a computed/validated value that is read like a plain attribute.')]
});
DP('oop-encapsulation', {
  fu: [['What is "tell, don’t ask"?', 'A design guideline: instead of asking an object for its data and acting on it externally (if acct.balance >= x: acct.balance -= x), tell the object to do the operation (acct.withdraw(x)). This keeps logic and the data it guards together, reinforcing encapsulation.'],
    ['When should a field be exposed vs wrapped in a property?', 'Expose a plain attribute when it’s simple data with no rules. Wrap it in @property when you need validation, a computed value, lazy loading, or to keep the option of changing internals later. Python lets you start plain and upgrade to a property without breaking callers.'],
    ['How does immutability relate to encapsulation?', 'Immutable objects can’t have their invariants violated after construction, which is the strongest form of protection. Frozen dataclasses or tuples remove whole classes of bugs for value objects (money, coordinates).']],
  deep: [['Technique', 'Identify each class’s invariant first, make the state that the invariant depends on internal, and expose only operations that preserve it. Return copies/immutable views of internal collections.'],
    ['Failure mode', 'Leaky encapsulation: public mutable fields or getters that hand out internal references, letting callers break invariants from outside.'],
    ['In interviews', 'Call out the invariant each class protects — it demonstrates you understand why the methods exist, not just what they do.']],
  src: ['Python docs: property', 'https://docs.python.org/3/library/functions.html#property'] });

SDX('oop-abstraction', { name: 'Abstraction', cat: 'sdoop',
  blurb: `Abstraction means exposing what an object does while hiding how it does it, so callers depend on a simple concept rather than messy details. Encapsulation hides data; abstraction hides complexity behind a clean interface.`,
  facts: [['Exposes', 'what (the interface)'], ['Hides', 'how (the implementation)'], ['Tool', 'interfaces / abstract base classes'], ['Benefit', 'swap implementations freely']],
  cheat: [['Abstraction', 'Model the essentials; hide the rest'], ['Interface', 'The set of operations callers can use'], ['ABC', 'abc.ABC + @abstractmethod in Python'], ['Protocol', 'Structural typing: "has these methods"'], ['Abstraction vs encapsulation', 'Hide complexity vs hide data'], ['Depend on abstractions', 'Not concrete classes (the D in SOLID)'], ['Leaky abstraction', 'Details bleed through the interface'], ['Example', 'PaymentProcessor.charge(amount)'], ['Swap', 'Stripe/PayPal behind one interface'], ['Level', 'Pick the right amount to expose'] ],
  sections: [
    ['What vs how', PP(`Abstraction lets a caller work with a <b>concept</b> — "a payment processor can <code>charge</code> an amount" — without knowing whether Stripe, PayPal, or a mock is behind it. You define the <b>interface</b> (the <i>what</i>) and hide each concrete <b>implementation</b> (the <i>how</i>). Callers depend only on the interface, so you can add or replace implementations without touching them. This is the mechanism that makes systems extensible and testable.`)],
    ['Abstract base classes and protocols', PP(`Python expresses abstraction two ways. An <b>abstract base class</b> (<code>abc.ABC</code> with <code>@abstractmethod</code>) declares required methods and can’t be instantiated until a subclass implements them — explicit, inheritance-based. A <b>Protocol</b> (structural typing) says "anything with these methods qualifies," with no inheritance needed — closer to duck typing but checkable by type checkers. Use an ABC when you want an explicit contract and shared base behavior; a Protocol when you just need "looks like this."`)]
  ],
  snipTitle: 'Abstraction with an interface', snipNote: 'One PaymentProcessor interface, interchangeable implementations.',
  snips: [['Abstract interface', 'python', `from abc import ABC, abstractmethod

class PaymentProcessor(ABC):          # the abstraction: "what"
    @abstractmethod
    def charge(self, amount: float) -> bool: ...

class StripeProcessor(PaymentProcessor):   # a "how"
    def charge(self, amount: float) -> bool:
        # ... call Stripe API ...
        print(f"Stripe charged {amount}")
        return True

class PayPalProcessor(PaymentProcessor):   # another "how"
    def charge(self, amount: float) -> bool:
        print(f"PayPal charged {amount}")
        return True

def checkout(processor: PaymentProcessor, amount: float):
    if processor.charge(amount):       # depends only on the abstraction
        print("order confirmed")

checkout(StripeProcessor(), 49.99)     # swap to PayPalProcessor() freely
# PaymentProcessor()  -> TypeError: can't instantiate abstract class`]],
  edge: [`A <b>leaky abstraction</b> exposes implementation details through its interface (a "generic cache" whose methods only make sense for Redis) — callers end up coupled to the thing you tried to hide.`, `An ABC with a single implementation is premature abstraction; add the interface when a <i>second</i> implementation (or a test double) actually appears.`, `Forgetting to implement an <code>@abstractmethod</code> means the subclass is still abstract and can’t be instantiated — a helpful compile-time-ish error.`, `Protocols are checked by static type checkers, not enforced at runtime unless you use <code>@runtime_checkable</code> (and even then only method presence).`],
  faq: [['What’s the difference between abstraction and encapsulation?', PP(`They’re related but distinct. <b>Encapsulation</b> hides <i>data</i> — it bundles state with behavior and prevents outside code from reaching the internals, protecting invariants. <b>Abstraction</b> hides <i>complexity</i> — it exposes a simple concept (an interface) and hides the complicated implementation behind it, so callers reason about <i>what</i> something does, not <i>how</i>. Encapsulation is about a trustworthy object; abstraction is about a simple, swappable interface. In practice you use both: an abstract <code>PaymentProcessor</code> interface (abstraction) whose concrete <code>StripeProcessor</code> keeps its API keys private (encapsulation).`)],
    ['When should I use an abstract base class versus a Protocol?', PP(`Use an <b>abstract base class</b> (<code>abc.ABC</code>) when you want an <b>explicit contract</b> — subclasses declare "I am a PaymentProcessor" and inherit any shared base behavior, and instantiation is blocked until all abstract methods are implemented. Use a <b>Protocol</b> when you only care that an object <b>has the right methods</b>, regardless of its class hierarchy (structural typing / duck typing made checkable). Protocols give looser coupling and work with classes you don’t own; ABCs give a clearer, enforced inheritance relationship. Many codebases use Protocols for interfaces and ABCs when shared implementation is involved.`)]],
  qs: [SQ('Abstraction is best described as…', ['Hiding an object’s data fields', 'Exposing what an object does while hiding how it does it', 'Making everything static', 'Copying objects'], 1, 'Abstraction hides implementation complexity behind a simple interface.'),
    SQ('Which lets callers swap Stripe for PayPal without changing their code?', ['A God class', 'Depending on a PaymentProcessor interface rather than a concrete class', 'Global variables', 'Hardcoding Stripe everywhere'], 1, 'Coding to the abstraction decouples callers from the concrete implementation.')]
});
DP('oop-abstraction', {
  fu: [['How does abstraction enable testing?', 'By depending on an interface, you can inject a fake/mock implementation in tests (a FakePaymentProcessor that records calls) instead of hitting a real service. The code under test doesn’t know or care it’s a double.'],
    ['What is a leaky abstraction, concretely?', 'An interface whose correct use still requires knowing the implementation — e.g. an ORM that silently issues N+1 queries, or a "filesystem" abstraction that behaves differently on network drives. Leaks force callers to learn the very details you hid.'],
    ['Abstraction vs the Dependency Inversion Principle?', 'DIP is the SOLID principle that says high-level modules should depend on abstractions, not concrete low-level modules. Abstraction is the tool (interfaces); DIP is the discipline of pointing dependencies at those abstractions.']],
  deep: [['Technique', 'Define interfaces at the seams where behavior varies or where you’ll want test doubles. Keep the interface about the caller’s needs, not the implementation’s structure, to avoid leaks.'],
    ['Failure mode', 'Premature or leaky abstractions: interfaces invented before a second implementation exists, or ones that expose implementation-specific details.'],
    ['In interviews', 'Introduce an interface exactly where the problem says a behavior will vary (pricing, notification channel, storage backend) — it signals extensible design.']],
  src: ['Python docs: abc', 'https://docs.python.org/3/library/abc.html'] });

SDX('oop-inheritance', { name: 'Inheritance', cat: 'sdoop',
  blurb: `Inheritance lets a subclass reuse and extend a base class, modeling an "is-a" relationship. It is powerful but easily overused — deep hierarchies become rigid, and composition is usually the better default.`,
  facts: [['Models', '"is-a" (Dog is an Animal)'], ['Reuses', 'base attributes and methods'], ['Extends', 'add or override behavior'], ['Caution', 'prefer composition for reuse']],
  cheat: [['Inheritance', 'Subclass gets base’s attributes + methods'], ['is-a', 'The relationship inheritance models'], ['super()', 'Call the base implementation'], ['Override', 'Subclass replaces a base method'], ['Extend', 'Subclass adds new behavior'], ['MRO', 'Method resolution order (multiple inheritance)'], ['Mixin', 'Small class adding one capability'], ['Composition', '"has-a"; usually preferred for reuse'], ['LSP', 'Subtypes must be substitutable for the base'], ['Deep hierarchies', 'Fragile; avoid'] ],
  sections: [
    ['Reuse and extension via "is-a"', PP(`Inheritance expresses that a subclass <b>is a kind of</b> its base: a <code>SavingsAccount</code> <i>is an</i> <code>Account</code>. The subclass inherits the base’s attributes and methods, can <b>override</b> them to change behavior, and can <b>add</b> new ones. Use <code>super()</code> to call the base implementation (especially in <code>__init__</code>) so you extend rather than duplicate. The relationship must be a true "is-a" — if it’s really "has-a" or "uses-a," reach for composition instead.`)],
    ['Why prefer composition', PP(`Inheritance couples the subclass tightly to the base’s implementation, and <b>deep hierarchies</b> become rigid: a change high up ripples everywhere, and behavior gets split across many files. <b>Composition</b> ("has-a") assembles behavior from parts you hold as attributes, which is more flexible — you can swap parts at runtime and avoid fragile base classes. The guideline "favor composition over inheritance" doesn’t ban inheritance; it says reach for it only for genuine is-a relationships and shallow hierarchies, and use composition for <i>reuse</i>.`)]
  ],
  snipTitle: 'Inheritance vs composition', snipNote: 'A correct is-a hierarchy, and the composition alternative for reuse.',
  snips: [['Inheritance (is-a)', 'python', `class Account:
    def __init__(self, balance: float = 0.0):
        self.balance = balance

    def withdraw(self, amount: float) -> None:
        if amount > self.balance:
            raise ValueError("insufficient funds")
        self.balance -= amount

class SavingsAccount(Account):           # SavingsAccount IS-A Account
    def __init__(self, balance=0.0, rate=0.02):
        super().__init__(balance)        # reuse base setup
        self.rate = rate

    def add_interest(self) -> None:      # extend with new behavior
        self.balance += self.balance * self.rate

s = SavingsAccount(1000)
s.add_interest()      # 1020.0 (new behavior)
s.withdraw(20)        # inherited behavior`],
    ['Composition (has-a) for reuse', 'python', `class Engine:
    def start(self): print("engine started")

class Car:
    def __init__(self):
        self.engine = Engine()           # Car HAS-A Engine (not IS-A)

    def start(self):
        self.engine.start()              # delegate to the part

Car().start()
# Swap the engine type at runtime without touching a class hierarchy.`]],
  edge: [`Deep or wide inheritance trees are <b>fragile</b>: a change in a base class can silently break distant subclasses (the "fragile base class" problem).`, `Overriding a method but forgetting to call <code>super()</code> when you meant to extend (not replace) drops base behavior — common in <code>__init__</code>.`, `Multiple inheritance follows the <b>MRO</b> (C3 linearization); the "diamond problem" can cause surprising method resolution — keep multiple inheritance to small, orthogonal mixins.`, `Using inheritance for <i>reuse</i> when the relationship isn’t "is-a" (e.g. <code>Stack(list)</code>) exposes unwanted base methods and violates substitutability.`],
  faq: [['When should I use inheritance instead of composition?', PP(`Use <b>inheritance</b> only for a true <b>"is-a"</b> relationship where the subtype can stand in for the base everywhere (a <code>SavingsAccount</code> genuinely is an <code>Account</code>), and keep the hierarchy <b>shallow</b>. Use <b>composition ("has-a")</b> for <b>reuse</b> and for assembling behavior — a <code>Car</code> has an <code>Engine</code>, an <code>Order</code> has a <code>PricingStrategy</code>. Composition is more flexible (swap parts at runtime, no fragile base coupling) and is the recommended default. A quick test: if you’re inheriting just to reuse some methods, not because the subclass truly <i>is</i> the base type, prefer composition.`)],
    ['What problems do deep inheritance hierarchies cause?', PP(`They become <b>rigid and fragile</b>. Behavior is spread across many levels, so understanding one subclass means reading the whole chain; a change in a base class can unexpectedly break far-away subclasses (the <b>fragile base class</b> problem); and you can’t vary behavior at runtime because the hierarchy is fixed at class-definition time. Multiple inheritance adds method-resolution surprises. The fix is usually to flatten the hierarchy and move reuse into <b>composed components</b> or <b>strategies</b> you inject, keeping any remaining inheritance shallow and strictly "is-a".`)]],
  qs: [SQ('Inheritance should model which relationship?', ['has-a', 'is-a', 'uses-a', 'any relationship'], 1, 'Inheritance expresses "is-a"; use composition for "has-a"/reuse.'),
    SQ('The widely recommended default for code reuse is…', ['Deep inheritance', 'Composition over inheritance', 'Copy-paste', 'Multiple inheritance'], 1, 'Composition is more flexible and avoids fragile base-class coupling.')]
});
DP('oop-inheritance', {
  fu: [['What is a mixin?', 'A small class that adds a single, orthogonal capability (e.g. a SerializableMixin) meant to be combined with others via multiple inheritance. Keep mixins focused and stateless where possible to avoid MRO surprises.'],
    ['How does super() work with multiple inheritance?', 'super() follows the MRO (the linearized order of base classes), not just "the parent". Cooperative multiple inheritance relies on every class calling super() so each contributes once, in MRO order.'],
    ['Why is Stack(list) a bad idea?', 'Inheriting from list to make a Stack exposes all list methods (insert, __getitem__), letting callers violate stack semantics. Composition (hold a private list, expose only push/pop) models it correctly.']],
  deep: [['Technique', 'Reserve inheritance for genuine is-a with shallow depth; use composition and strategies for reuse and varying behavior. Always call super() appropriately when extending.'],
    ['Failure mode', 'Inheritance-for-reuse that breaks substitutability (LSP), and deep/diamond hierarchies that are fragile and hard to follow.'],
    ['In interviews', 'Default to composition; justify any inheritance with a clear is-a and substitutability argument. It signals mature design judgment.']],
  src: ['Python docs: Inheritance', 'https://docs.python.org/3/tutorial/classes.html#inheritance'] });

SDX('oop-polymorphism', { name: 'Polymorphism', cat: 'sdoop',
  blurb: `Polymorphism lets one call site work with many types: the same method name does the right thing depending on the actual object. It is what lets you write code against an interface and have each implementation behave correctly.`,
  facts: [['Means', '"many forms"'], ['Same call', 'different behavior by type'], ['Via', 'overriding / duck typing / interfaces'], ['Enables', 'open/closed extensibility']],
  cheat: [['Polymorphism', 'One interface, many implementations'], ['Runtime (subtype)', 'Overriding: subclass method is chosen at runtime'], ['Duck typing', '"If it has the method, call it"'], ['Ad-hoc', 'Overloading (same name, different params)'], ['Parametric', 'Generics over any type'], ['Dynamic dispatch', 'The actual type decides which method runs'], ['Benefit', 'Add new types without changing callers'], ['Open/closed', 'Polymorphism is how you honor it'], ['Example', 'shape.area() for Circle and Square'], ['Avoid', 'Big if/elif type checks'] ],
  sections: [
    ['One call, many behaviors', PP(`With polymorphism, a single piece of code — <code>for s in shapes: total += s.area()</code> — works for every shape type, because each class provides its own <code>area()</code> and the <b>actual object</b> decides which runs (dynamic dispatch). You write the loop once against the common interface; adding a <code>Triangle</code> later needs <b>no change to the loop</b>. This is the runtime, subtype flavor of polymorphism and the most important one for design.`)],
    ['Duck typing and replacing conditionals', PP(`Python leans on <b>duck typing</b>: code calls <code>obj.area()</code> and works with anything that has that method, regardless of inheritance. Polymorphism is the antidote to sprawling <code>if isinstance(...)</code> / <code>elif type == ...</code> chains: instead of the caller branching on type, each type carries its own behavior and the caller just calls the method. When you see a big type-switch, that’s usually a signal to make the branches into polymorphic classes (often via the Strategy or State pattern).`)]
  ],
  snipTitle: 'Polymorphism in action', snipNote: 'The same loop over different shapes; adding a type needs no caller change.',
  snips: [['Subtype polymorphism', 'python', `from abc import ABC, abstractmethod
import math

class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...

class Circle(Shape):
    def __init__(self, r): self.r = r
    def area(self): return math.pi * self.r ** 2

class Square(Shape):
    def __init__(self, s): self.s = s
    def area(self): return self.s ** 2

shapes = [Circle(2), Square(3)]
total = sum(s.area() for s in shapes)   # one call site, many behaviors
print(round(total, 2))                  # 21.57
# Add a Triangle(Shape): the loop above does NOT change.`],
    ['Replacing a type-switch', 'python', `# ❌ caller branches on type (closed to extension):
def area_bad(shape):
    if shape["kind"] == "circle": return 3.14159 * shape["r"] ** 2
    elif shape["kind"] == "square": return shape["s"] ** 2
    # every new shape edits this function

# ✅ polymorphism: each type owns its behavior; caller just calls .area()
def total_area(shapes): return sum(s.area() for s in shapes)`]],
  edge: [`Big <code>isinstance</code>/<code>type ==</code> chains are an <b>anti-pattern</b> — they must be edited for every new type (violating open/closed); replace them with polymorphic methods.`, `Python’s polymorphism is runtime <b>duck typing</b>; a missing method fails at call time with <code>AttributeError</code>, not at compile time — type hints + a checker catch it earlier.`, `Overriding a method with an <b>incompatible signature</b> or weaker guarantees breaks callers that rely on the base contract (an LSP violation).`, `True compile-time method <b>overloading</b> (same name, different parameter types) doesn’t exist in Python; use default args, <code>*args</code>, or <code>functools.singledispatch</code>.`],
  faq: [['How does polymorphism help me follow the open/closed principle?', PP(`The open/closed principle says code should be <b>open to extension but closed to modification</b>. Polymorphism is the mechanism: when callers depend on a common interface and each type supplies its own behavior, <b>adding a new type doesn’t require editing existing code</b> — you just add a new class that implements the interface. The <code>total_area</code> loop works for a brand-new <code>Triangle</code> with zero changes. Contrast that with a type-switch (<code>if kind == ...</code>), which you must open and modify for every new case — exactly what open/closed warns against.`)],
    ['What’s the difference between overriding and overloading?', PP(`<b>Overriding</b> is runtime (subtype) polymorphism: a subclass provides its own version of a base method, and the <b>actual object’s type</b> decides which runs — this is the design-relevant kind. <b>Overloading</b> is having multiple methods with the <b>same name but different parameter lists</b>, resolved at compile time by argument types — common in Java/C++. Python doesn’t have true overloading; the last definition wins, so you emulate it with default arguments, variable arguments, or <code>functools.singledispatch</code> for type-based dispatch. In interviews, "polymorphism" almost always means overriding/duck typing.`)]],
  qs: [SQ('Polymorphism primarily lets you…', ['Hide data', 'Use one call site with many types, each behaving correctly', 'Inherit from multiple classes', 'Make objects immutable'], 1, 'The actual object’s type determines which method runs (dynamic dispatch).'),
    SQ('A large if/elif chain branching on an object’s type usually should be replaced with…', ['More elif branches', 'Polymorphic methods (one per type)', 'A global variable', 'A singleton'], 1, 'Move each branch’s behavior into the type; the caller just calls the method.')]
});
DP('oop-polymorphism', {
  fu: [['What is functools.singledispatch?', 'A decorator that gives a function type-based dispatch: you register implementations per argument type and Python picks the right one at runtime. It’s Python’s idiomatic answer to ad-hoc overloading on the first argument.'],
    ['Does polymorphism require inheritance?', 'No — in Python, duck typing gives polymorphism without a shared base class: any object with the expected method works. Inheritance/ABCs/Protocols just make the shared interface explicit and checkable.'],
    ['How does the Liskov Substitution Principle relate?', 'LSP says a subtype must be usable anywhere the base type is expected. Polymorphism only works safely if overrides honor the base contract (same signature, no stronger preconditions, no weaker postconditions).']],
  deep: [['Technique', 'Program to a common interface and let each type implement its own behavior; replace type-switches with polymorphic classes (often Strategy/State). Keep override signatures compatible.'],
    ['Failure mode', 'isinstance chains that must change for each new type, and overrides that break the base contract (LSP violations) causing surprising behavior.'],
    ['In interviews', 'When requirements list several "kinds" that behave differently, model them as polymorphic classes implementing one interface — it’s cleaner and extensible.']],
  src: ['Python docs: singledispatch', 'https://docs.python.org/3/library/functools.html#functools.singledispatch'] });

SDX('oop-interface', { name: 'Interface & abstract class', cat: 'sdoop',
  blurb: `Both let you program to a contract rather than a concrete type, but they differ: an abstract class can carry shared implementation and state, while an interface (or Protocol) is a pure capability contract. Knowing when to use each is a common interview question.`,
  facts: [['Abstract class', 'contract + shared code/state'], ['Interface', 'pure contract, no state'], ['Python ABC', 'can mix both'], ['Protocol', 'structural interface (no inheritance)']],
  cheat: [['Abstract class', 'Has abstract + concrete methods; can’t instantiate'], ['Interface', 'Only method signatures (a capability)'], ['abc.ABC', 'Python’s abstract base class'], ['@abstractmethod', 'Must be implemented by subclasses'], ['Protocol', 'Structural typing: no explicit inheritance'], ['Shared state', 'Abstract class can; interface can’t'], ['Multiple', 'A class implements many interfaces'], ['Use ABC', 'When sharing base behavior'], ['Use Protocol', 'When you only need "has these methods"'], ['ISP', 'Keep interfaces small and focused'] ],
  sections: [
    ['Abstract class vs interface', PP(`An <b>abstract class</b> defines a contract <i>and</i> can provide <b>shared implementation and state</b> — concrete methods and attributes that all subclasses inherit, plus abstract methods they must implement. An <b>interface</b> (in Python, a <code>Protocol</code> or an ABC with only abstract methods) is a <b>pure contract</b>: a set of operations with no state and no implementation. Rule of thumb: use an <b>abstract class</b> when subclasses share real behavior (a template with some steps filled in); use an <b>interface</b> when you only need to say "whatever implements this can do X."`)],
    ['Protocols: interfaces without inheritance', PP(`Python’s <code>typing.Protocol</code> lets you define an interface by <b>shape</b>: any class that has the required methods satisfies it, with no explicit <code>implements</code> or base class. This is ideal for decoupling — you can accept a <code>SupportsCharge</code> protocol and pass any object with a <code>charge()</code> method, including classes you don’t own. ABCs, by contrast, require subclasses to explicitly inherit, which gives a stronger, declared relationship and lets you ship shared code.`)]
  ],
  snipTitle: 'Abstract class, ABC interface, and Protocol', snipNote: 'Shared behavior vs pure contract vs structural typing.',
  snips: [['Abstract class with shared code', 'python', `from abc import ABC, abstractmethod

class Report(ABC):
    def generate(self) -> str:           # shared template (concrete)
        return f"# {self.title()}\\n{self.body()}"

    @abstractmethod
    def title(self) -> str: ...          # subclasses fill these in
    @abstractmethod
    def body(self) -> str: ...

class SalesReport(Report):
    def title(self): return "Sales"
    def body(self): return "Revenue up 12%"

print(SalesReport().generate())          # reuses generate(), fills the holes`],
    ['Interface via Protocol (no inheritance)', 'python', `from typing import Protocol

class Chargeable(Protocol):              # pure contract, structural
    def charge(self, amount: float) -> bool: ...

class Stripe:                            # note: does NOT inherit Chargeable
    def charge(self, amount: float) -> bool:
        print(f"charged {amount}"); return True

def pay(gateway: Chargeable, amount: float):
    return gateway.charge(amount)        # accepts anything with charge()

pay(Stripe(), 20)                        # works: Stripe matches the shape`]],
  edge: [`An abstract class can hold <b>state</b> and concrete methods; a pure interface/Protocol should not — mixing state into an "interface" turns it into an abstract class.`, `<b>Fat interfaces</b> force implementers to define methods they don’t need; split them (Interface Segregation Principle) into small, focused contracts.`, `Protocols are primarily a <b>static typing</b> tool — at runtime they don’t enforce anything unless marked <code>@runtime_checkable</code>, and even then only check method presence, not signatures.`, `In Python a class can inherit multiple ABCs/mixins; watch the MRO when they overlap.`],
  faq: [['When do I use an abstract class versus an interface/Protocol?', PP(`Use an <b>abstract class</b> when implementations should <b>share real behavior or state</b> — it gives you a place to put concrete helper methods and a template, while still forcing subclasses to fill in the abstract parts (the Template Method pattern). Use an <b>interface</b> (a <code>Protocol</code>, or an ABC with only abstract methods) when you just need a <b>capability contract</b> — "anything that can <code>charge()</code>" — with no shared code. Interfaces also allow a class to satisfy <b>many</b> contracts at once and, as Protocols, require no inheritance, which keeps coupling low. Short version: abstract class = shared implementation; interface = pure contract.`)],
    ['Why would I prefer a Protocol over an ABC in Python?', PP(`Because a <b>Protocol</b> uses <b>structural typing</b>: any object with the right methods satisfies it, without inheriting anything. That lets you define an interface and accept objects you <b>don’t control</b> (third-party classes, simple stand-ins in tests) as long as they have the methods — maximal decoupling. An <b>ABC</b> requires implementers to explicitly subclass it, which creates a declared relationship and lets you ship shared base code, but couples them to your hierarchy. Choose Protocol when you only need "looks like this"; choose ABC when you want an explicit contract or shared implementation.`)]],
  qs: [SQ('Which can provide shared implementation and state to its subclasses?', ['A pure interface', 'An abstract class', 'A Protocol', 'Neither'], 1, 'Abstract classes can mix concrete methods/state with abstract methods; pure interfaces cannot.'),
    SQ('A Python Protocol is satisfied by…', ['Only classes that explicitly inherit it', 'Any class that has the required methods (structural typing)', 'Only abstract classes', 'Only dataclasses'], 1, 'Protocols use structural typing — matching methods is enough, no inheritance needed.')]
});
DP('oop-interface', {
  fu: [['What is the Template Method pattern’s link to abstract classes?', 'An abstract class defines the skeleton of an algorithm in a concrete method and leaves specific steps as abstract methods for subclasses — exactly the SalesReport.generate() example. It’s the canonical use of abstract classes with shared code.'],
    ['Can a class implement multiple interfaces in Python?', 'Yes — a class can satisfy several Protocols simultaneously (just have all the methods), and can inherit multiple ABCs/mixins. This supports the Interface Segregation Principle: many small contracts rather than one fat one.'],
    ['Do I need ABCs at all with duck typing?', 'Not strictly — duck typing works without them. ABCs/Protocols make the intended contract explicit and checkable by type checkers and reviewers, which pays off as the codebase grows.']],
  deep: [['Technique', 'Use abstract classes for shared behavior + a template; use Protocols/interfaces for pure contracts and low coupling. Keep interfaces small and role-specific (ISP).'],
    ['Failure mode', 'Fat interfaces that force unused methods, or "interfaces" that secretly carry state and become abstract classes by accident.'],
    ['In interviews', 'State whether a type needs shared code (abstract class) or just a contract (interface) — picking correctly shows you understand the trade-off.']],
  src: ['Python docs: typing.Protocol', 'https://docs.python.org/3/library/typing.html#typing.Protocol'] });

SDX('oop-relations', { name: 'Association, aggregation & composition', cat: 'sdoop',
  blurb: `These describe how objects relate and own each other. Association is a general "knows-a"; aggregation is a "has-a" where the part can outlive the whole; composition is a "has-a" where the part’s lifetime is bound to the whole. Getting these right drives correct class relationships in LLD.`,
  facts: [['Association', 'objects know each other'], ['Aggregation', 'has-a; part lives independently'], ['Composition', 'has-a; part dies with the whole'], ['Shown in UML', 'line / hollow / filled diamond']],
  cheat: [['Association', 'A uses/knows B (teacher ↔ student)'], ['Aggregation', 'Whole has parts that can exist alone (team ↔ players)'], ['Composition', 'Whole owns parts that die with it (house ↔ rooms)'], ['Ownership', 'Composition owns lifetime; aggregation shares'], ['UML', 'plain line / hollow diamond / filled diamond'], ['Multiplicity', '1, 0..1, 1..*, * on each end'], ['Code', 'Reference held as an attribute'], ['Create inside', 'Usually composition'], ['Passed in', 'Usually aggregation/association'], ['Drives', 'Cascade delete, cloning, invariants'] ],
  sections: [
    ['The three relationships', PP(`<b>Association</b> is the loosest: two objects simply <b>know</b> each other (a <code>Driver</code> and a <code>Trip</code>). <b>Aggregation</b> is a "has-a" where the <b>part can exist independently</b> of the whole — a <code>Team</code> has <code>Player</code>s, but a player still exists if the team disbands; the whole usually <b>receives</b> the parts from outside. <b>Composition</b> is a stronger "has-a" where the <b>part’s lifetime is bound</b> to the whole — a <code>House</code> is composed of <code>Room</code>s that don’t exist without the house; the whole usually <b>creates</b> the parts itself. The distinction decides cascade deletes, cloning depth, and who owns invariants.`)],
    ['How it shows up in code', PP(`All three are implemented as one object holding a <b>reference</b> to another as an attribute — the difference is <b>ownership and lifecycle</b>, not syntax. If the whole <b>creates</b> the part in its constructor and no one else references it, that’s <b>composition</b> (the part dies with the whole). If the part is <b>passed in</b> and shared/owned elsewhere, that’s <b>aggregation</b> or <b>association</b>. Modeling this correctly tells you, for example, whether deleting an <code>Order</code> should delete its <code>OrderLine</code>s (composition → yes) or just detach a shared <code>Customer</code> (association → no).`)]
  ],
  snipTitle: 'Association, aggregation, composition in code', snipNote: 'Same attribute-reference mechanism, different ownership.',
  snips: [['The three, in Python', 'python', `# Composition: Order OWNS its lines; they’re created inside and die with it
class OrderLine:
    def __init__(self, sku, qty): self.sku, self.qty = sku, qty

class Order:
    def __init__(self):
        self.lines: list[OrderLine] = []        # created & owned here
    def add(self, sku, qty):
        self.lines.append(OrderLine(sku, qty))  # part's lifetime = order's

# Aggregation: Team HAS players passed in; they exist independently
class Player:
    def __init__(self, name): self.name = name

class Team:
    def __init__(self, players: list[Player]):
        self.players = players                  # shared, outlive the team

# Association: a Trip just KNOWS its driver (no ownership)
class Trip:
    def __init__(self, driver):
        self.driver = driver`]],
  edge: [`The line between aggregation and association is fuzzy in practice; the one that <b>matters</b> is <b>composition</b>, because it implies the part has no independent life (cascade delete, deep copy).`, `Modeling a shared entity as composition causes bugs: deleting one <code>Order</code> shouldn’t delete a <code>Customer</code> shared by many orders — that’s association/aggregation.`, `Deep <b>composition</b> affects <b>cloning</b>: a shallow copy shares the parts; you often need a deep copy so the copy owns its own parts.`, `Circular references (A holds B, B holds A) complicate ownership and can leak memory in languages without cycle collection; Python handles cycles but they still muddy the model.`],
  faq: [['What’s the practical difference between aggregation and composition?', PP(`It’s about <b>lifetime and ownership</b>. In <b>composition</b>, the part <b>cannot exist without the whole</b> and is owned by it — a <code>House</code>’s <code>Room</code>s, an <code>Order</code>’s <code>OrderLine</code>s. When the whole is destroyed, the parts go with it (cascade delete), and the whole typically <b>creates</b> them. In <b>aggregation</b>, the part <b>can exist independently</b> and may be shared — <code>Player</code>s in a <code>Team</code>, <code>Book</code>s in a <code>Library</code> catalog; the whole usually <b>receives</b> them and destroying the whole doesn’t destroy the parts. In code both are "an attribute holding a reference," so you decide which by asking: <i>does the part die with the whole?</i> If yes, composition; if it lives on, aggregation.`)],
    ['Why does this distinction matter in an LLD interview?', PP(`Because it drives real behavior: <b>cascade deletes</b> (deleting an <code>Order</code> should remove its lines but not its <code>Customer</code>), <b>copy depth</b> (cloning a composed object needs a deep copy so it owns its own parts), and <b>where invariants live</b> (a composed whole can guarantee rules about its parts because it fully controls them). Interviewers watch whether your class relationships imply the right lifecycles — e.g. in a parking-lot design, a <code>Level</code> is <b>composed</b> of <code>Spot</code>s (they don’t exist without the level), while a <code>Ticket</code> is merely <b>associated</b> with a <code>Vehicle</code> (the vehicle exists on its own). Getting this right makes the model correct, not just plausible.`)]],
  qs: [SQ('Which relationship means the part cannot exist without the whole (dies with it)?', ['Association', 'Aggregation', 'Composition', 'Inheritance'], 2, 'Composition binds the part’s lifetime to the whole (e.g. rooms in a house).'),
    SQ('A Team holding Players that are passed in and can exist on their own is…', ['Composition', 'Aggregation', 'Inheritance', 'Polymorphism'], 1, 'Aggregation: a has-a where the parts live independently of the whole.')]
});
DP('oop-relations', {
  fu: [['How do these map to UML notation?', 'Association is a plain line; aggregation is a hollow (open) diamond at the owning end; composition is a filled (solid) diamond. Multiplicities (1, 0..1, 1..*, *) annotate each end to show how many objects relate.'],
    ['How does this affect database modeling?', 'Composition often maps to a parent/child table with ON DELETE CASCADE and no independent existence; aggregation/association map to separate tables linked by foreign keys without cascade, since the referenced rows live independently.'],
    ['When does cloning get tricky?', 'For composed objects you usually need a deep copy (copy.deepcopy) so the clone owns its own parts; for aggregated/shared parts a shallow copy that shares references is often correct. Model dictates copy depth.']],
  deep: [['Technique', 'For each relationship ask "does the part die with the whole?" to pick composition vs aggregation, and set cascade/copy behavior accordingly. Hold the reference as an attribute either way.'],
    ['Failure mode', 'Treating shared entities as composition (accidental cascade deletes) or composed parts as shared (orphaned, inconsistent state).'],
    ['In interviews', 'Annotate class relationships with ownership/multiplicity; it shows you’ve thought about lifecycle, not just which classes reference which.']],
  src: ['UML association, aggregation, composition (overview)', 'https://en.wikipedia.org/wiki/Object_composition'] });

SDX('oop-overload', { name: 'Overloading & overriding', cat: 'sdoop',
  blurb: `Two similarly-named but different mechanisms. Overriding (runtime) is a subclass replacing a base method — the heart of polymorphism. Overloading (compile-time) is several methods with the same name but different parameters, which Python doesn’t support natively and emulates differently.`,
  facts: [['Overriding', 'subclass replaces base method (runtime)'], ['Overloading', 'same name, different params (compile time)'], ['Python overriding', 'native, via MRO'], ['Python overloading', 'emulated (defaults, singledispatch)']],
  cheat: [['Overriding', 'Subclass redefines an inherited method'], ['Resolved', 'At runtime by the object’s actual type'], ['super()', 'Call the overridden base version'], ['Overloading', 'Multiple methods, same name, diff signatures'], ['Resolved', 'At compile time by argument types (Java/C++)'], ['Python has no', 'true overloading (last def wins)'], ['Emulate', 'Default args, *args/**kwargs'], ['singledispatch', 'Type-based function dispatch'], ['@typing.overload', 'Type hints only (not runtime behavior)'], ['LSP', 'Overrides must honor the base contract'] ],
  sections: [
    ['Overriding: runtime replacement', PP(`<b>Overriding</b> is when a subclass provides its own version of a method it inherited; at runtime the <b>actual object’s type</b> decides which version runs (dynamic dispatch). This is the engine of polymorphism — <code>__str__</code>, <code>area()</code>, or any method the base declares and the subclass refines. Use <code>super()</code> inside the override when you want to <b>extend</b> the base behavior rather than fully replace it. Overrides must respect the base’s contract (Liskov) so callers relying on the base type aren’t surprised.`)],
    ['Overloading: and how Python does it', PP(`<b>Overloading</b> means multiple methods sharing a name but differing in <b>parameters</b>, with the compiler picking the right one by argument types — standard in Java/C++. <b>Python has no true overloading</b>: a later <code>def</code> with the same name simply replaces the earlier one. You achieve the same ergonomics with <b>default arguments</b>, <code>*args</code>/<code>**kwargs</code>, or <code>functools.singledispatch</code> for type-based dispatch. (<code>typing.overload</code> exists but only annotates signatures for type checkers — it doesn’t change runtime behavior.)`)]
  ],
  snipTitle: 'Overriding vs overloading in Python', snipNote: 'Native overriding, and the idiomatic ways to emulate overloading.',
  snips: [['Overriding', 'python', `class Animal:
    def speak(self) -> str: return "..."

class Dog(Animal):
    def speak(self) -> str: return "Woof"      # overrides the base

class Puppy(Dog):
    def speak(self) -> str:
        return super().speak() + " (tiny)"     # extend via super()

for a in (Animal(), Dog(), Puppy()):
    print(a.speak())        # ... / Woof / Woof (tiny) — chosen at runtime`],
    ['Emulating overloading', 'python', `from functools import singledispatch

# Default args instead of multiple signatures:
def greet(name: str, greeting: str = "Hello"):
    return f"{greeting}, {name}"

# Type-based dispatch (the overloading-like tool):
@singledispatch
def area(shape): raise NotImplementedError

@area.register
def _(shape: "Circle"): return 3.14159 * shape.r ** 2
@area.register
def _(shape: "Square"): return shape.s ** 2`]],
  edge: [`Defining two methods with the same name in one Python class does <b>not</b> overload — the second silently <b>replaces</b> the first; a frequent beginner bug.`, `An override with a <b>changed signature</b> (different required params) breaks substitutability and callers using the base type — keep signatures compatible.`, `Calling an <b>overridable method from <code>__init__</code></b> can hit a subclass override before the subclass is fully initialized — avoid it.`, `<code>typing.overload</code> decorators are for the type checker only; you still write one real implementation underneath, or they do nothing at runtime.`],
  faq: [['What’s the core difference between overriding and overloading?', PP(`<b>Overriding</b> is about <b>inheritance and runtime</b>: a subclass replaces a base-class method, and which version runs is decided by the object’s actual type when the call happens (dynamic dispatch). It’s how polymorphism works. <b>Overloading</b> is about <b>one class and compile time</b>: several methods share a name but take different parameters, and the compiler selects one based on the arguments’ types. They sound alike but solve different problems — overriding varies behavior <i>across types</i>, overloading varies it <i>across argument shapes</i> within a type. In interviews, mixing these up is a common slip.`)],
    ['Does Python support method overloading?', PP(`Not natively. If you define two methods with the same name in a class, the <b>second definition just overwrites the first</b> — there’s no signature-based selection. Python instead gives you flexible single methods: <b>default arguments</b> and <code>*args</code>/<code>**kwargs</code> cover most "different ways to call this" needs, and <code>functools.singledispatch</code> provides <b>type-based dispatch</b> for a function (choosing an implementation by the first argument’s type). The <code>@typing.overload</code> decorator lets you document multiple signatures for a type checker, but it doesn’t create runtime overloading — you still write one concrete implementation. Overriding, by contrast, <i>is</i> fully supported and idiomatic.`)]],
  qs: [SQ('Which mechanism is resolved at runtime by the object’s actual type?', ['Overloading', 'Overriding', 'Both', 'Neither'], 1, 'Overriding uses dynamic dispatch; overloading (where it exists) is compile-time.'),
    SQ('In Python, defining two same-named methods in a class results in…', ['Overloading by argument type', 'The second method replacing the first', 'A syntax error', 'Both being callable'], 1, 'Python has no true overloading; the later definition wins.')]
});
DP('oop-overload', {
  fu: [['What is functools.singledispatch good for?', 'Giving a function different implementations based on the first argument’s type without if/isinstance chains — the closest idiomatic Python gets to overloading, useful for serialization, formatting, or area-style dispatch.'],
    ['How do magic methods relate to overriding?', 'Operator overloading in Python is really overriding dunder methods (__add__, __eq__, __len__). You "overload" + by defining __add__ — technically operator overloading via method overriding.'],
    ['What breaks when an override changes the contract?', 'Liskov violations: callers using the base type assume its guarantees. A subclass that strengthens preconditions or weakens postconditions causes bugs that only appear with that subtype.']],
  deep: [['Technique', 'Use overriding (with super() to extend) for type-varying behavior; emulate overloading with defaults, *args, or singledispatch. Keep override signatures compatible with the base.'],
    ['Failure mode', 'Accidental method replacement when "overloading" in Python, and incompatible overrides that violate LSP.'],
    ['In interviews', 'Be precise with the terms — demonstrate overriding for polymorphism and note Python’s overloading alternatives if asked.']],
  src: ['Python docs: singledispatch', 'https://docs.python.org/3/library/functools.html#functools.singledispatch'] });

SDX('oop-solid', { name: 'SOLID principles', cat: 'sdoop',
  blurb: `Five principles for object-oriented design that keep code flexible and maintainable: Single responsibility, Open/closed, Liskov substitution, Interface segregation, and Dependency inversion. They are the vocabulary interviewers use to judge your class design.`,
  facts: [['S', 'Single responsibility'], ['O', 'Open/closed'], ['L', 'Liskov substitution'], ['I / D', 'Interface segregation / Dependency inversion']],
  cheat: [['S · Single responsibility', 'One reason to change per class'], ['O · Open/closed', 'Open to extension, closed to modification'], ['L · Liskov substitution', 'Subtypes work wherever the base does'], ['I · Interface segregation', 'Many small interfaces > one fat one'], ['D · Dependency inversion', 'Depend on abstractions, inject them'], ['Goal', 'Change without breaking; extend without editing'], ['O via', 'Polymorphism / strategies'], ['D via', 'Inject interfaces, not concretes'], ['Smell', 'A class that changes for many reasons'], ['Not dogma', 'Apply where they reduce pain'] ],
  sections: [
    ['S, O, L', PP(`<b>Single responsibility:</b> a class should have <b>one reason to change</b> — if an <code>Invoice</code> both computes totals and emails itself, formatting and delivery concerns are tangled; split them. <b>Open/closed:</b> you should be able to add behavior by <b>adding new code, not editing existing code</b> — achieved with polymorphism/strategies (a new <code>Shape</code> subclass, not a new <code>elif</code>). <b>Liskov substitution:</b> a subtype must be <b>usable anywhere its base is</b> without surprising callers — the classic violation is <code>Square</code> extending <code>Rectangle</code> and breaking code that sets width and height independently.`)],
    ['I and D', PP(`<b>Interface segregation:</b> prefer <b>several small, focused interfaces</b> over one fat one, so implementers aren’t forced to define methods they don’t use (a <code>Printer</code> shouldn’t have to implement <code>fax()</code>). <b>Dependency inversion:</b> high-level code should depend on <b>abstractions, not concrete low-level classes</b>, and those dependencies should be <b>injected</b> — an <code>OrderService</code> depends on a <code>PaymentProcessor</code> interface, and you pass in Stripe or a fake. Together, I and D make code decoupled and testable.`)]
  ],
  snipTitle: 'SOLID, before and after', snipNote: 'Open/closed and Dependency inversion applied in Python.',
  snips: [['Open/closed + Dependency inversion', 'python', `from abc import ABC, abstractmethod

# D: high-level OrderService depends on an abstraction, injected in
class PaymentProcessor(ABC):
    @abstractmethod
    def charge(self, amount: float) -> bool: ...

class StripeProcessor(PaymentProcessor):
    def charge(self, amount): print(f"stripe {amount}"); return True

class OrderService:
    def __init__(self, processor: PaymentProcessor):  # injected abstraction
        self.processor = processor
    def checkout(self, amount: float):
        return self.processor.charge(amount)

# O: add PayPalProcessor without editing OrderService at all
OrderService(StripeProcessor()).checkout(50)`],
    ['Liskov violation to avoid', 'python', `class Rectangle:
    def __init__(self, w, h): self.w, self.h = w, h
    def set_w(self, w): self.w = w
    def set_h(self, h): self.h = h
    def area(self): return self.w * self.h

class Square(Rectangle):        # ❌ not substitutable
    def set_w(self, w): self.w = self.h = w   # changing width also changes height
    def set_h(self, h): self.w = self.h = h

def grow(r: Rectangle):
    r.set_w(5); r.set_h(4)
    assert r.area() == 20        # holds for Rectangle, FAILS for Square (16)`]],
  edge: [`SOLID is <b>guidance, not law</b> — applied dogmatically it produces over-abstracted code with needless interfaces; apply each principle where it <b>reduces real pain</b>.`, `<b>SRP is about reasons to change</b>, not line count — a cohesive class doing one job can be large; a tiny class doing two unrelated things still violates it.`, `The <b>Square/Rectangle</b> case shows LSP is about <b>behavioral</b> substitutability, not just inheritance compiling — the subtype must honor the base’s guarantees.`, `Dependency inversion without a DI framework is just <b>passing dependencies into constructors</b> — you don’t need a library to do it in Python.`],
  faq: [['What does the Open/Closed Principle mean in practice?', PP(`"Open for extension, closed for modification" means you should be able to add new behavior <b>without editing existing, working code</b>. In practice this is achieved with <b>polymorphism</b>: callers depend on an interface, and each new case is a <b>new class</b> that implements it — not a new branch in a growing <code>if/elif</code>. For example, a shipping-cost calculator that loops over <code>shipping_methods</code> and calls <code>method.cost()</code> supports a brand-new method by adding a class, leaving the calculator untouched. The payoff is that stable code stays stable (fewer regressions), and extension points are explicit. The smell it targets is the function everyone keeps editing for each new case.`)],
    ['Can you give a concrete Liskov Substitution violation?', PP(`The classic one is <code>Square</code> inheriting from <code>Rectangle</code>. A <code>Rectangle</code> promises that setting width and height are <b>independent</b>, so code can do <code>r.set_w(5); r.set_h(4)</code> and expect area 20. If <code>Square</code> overrides the setters to keep sides equal, that same code gets area 16 — the subtype <b>breaks a guarantee callers relied on</b>, even though it compiles and "is-a" rectangle in plain English. That’s an LSP violation: a subtype must be usable <b>anywhere</b> the base is <b>without changing expected behavior</b>. The fix is usually to not force the inheritance — model <code>Square</code> and <code>Rectangle</code> as separate <code>Shape</code> implementations instead.`)],
    ['How are Dependency Inversion and dependency injection related?', PP(`<b>Dependency Inversion</b> is the <i>principle</i>: high-level modules should depend on <b>abstractions</b> (interfaces), not on concrete low-level classes, so the important business logic isn’t welded to a specific database, payment provider, or notifier. <b>Dependency injection</b> is the common <i>technique</i> for achieving it: instead of a class creating its own dependencies (<code>self.db = Postgres()</code>), you <b>pass them in</b> (usually via the constructor) as the abstract type. In Python this needs no framework — just a constructor parameter typed as the interface. The result is decoupled, testable code: in production you inject the real implementation; in tests you inject a fake.`)]],
  qs: [SQ('"Open for extension, closed for modification" is best achieved by…', ['Editing the same function for each new case', 'Polymorphism — add a new class that implements the interface', 'Using global variables', 'Making everything a singleton'], 1, 'New behavior arrives as new classes; existing code stays untouched.'),
    SQ('The Square-extends-Rectangle problem is a violation of which principle?', ['Single responsibility', 'Liskov substitution', 'Interface segregation', 'Open/closed'], 1, 'The subtype breaks a guarantee the base made to callers — an LSP violation.')]
});
DP('oop-solid', {
  fu: [['Isn’t SOLID sometimes over-applied?', 'Yes — blindly creating an interface for every class, or splitting classes until logic is scattered, adds complexity without benefit. Apply SOLID to reduce real coupling and change-pain; skip it where a simple concrete class suffices.'],
    ['How do SOLID and design patterns connect?', 'Patterns are concrete ways to honor SOLID: Strategy and State realize open/closed via polymorphism; Dependency Injection realizes dependency inversion; Adapter/Facade help interface segregation. Learn patterns as applied SOLID.'],
    ['What’s a quick smell test for SRP?', 'Describe the class in one sentence. If you need "and" ("it validates orders AND sends emails AND writes to the DB"), it likely has multiple responsibilities and reasons to change.']],
  deep: [['Technique', 'Use SRP to split tangled classes, O/L via polymorphism and substitutable subtypes, and I/D by injecting small abstractions. Treat patterns as tools that implement these principles.'],
    ['Failure mode', 'Dogmatic application (interface explosion, anemic over-split classes) or ignoring them entirely (God classes, type-switches, hard-wired dependencies).'],
    ['In interviews', 'Name the principle you’re applying as you design ("I’ll inject the PricingStrategy — that’s dependency inversion and keeps the lot open/closed"); it maps your choices to shared vocabulary.']],
  src: ['SOLID principles (overview)', 'https://en.wikipedia.org/wiki/SOLID'] });
