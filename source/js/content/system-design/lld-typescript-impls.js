/* ===== TypeScript implementations for the low-level-design & new SD topics =====
   Non-destructively adds a "TypeScript" tab beside the existing "Python" one on
   each topic's code sample. Loads after all SD content files are defined. */
const addTS = (k, code) => {
  const t = SD[k];
  if (!t || !t.snips || !t.snips[0]) return;
  // Single-example topics get a clean "Python" tab; multi-example topics keep
  // their descriptive labels (so we don't mislabel one of two Python examples).
  if (t.snips.length === 1 && t.snips[0][1] === 'python') t.snips[0][0] = 'Python';
  if (!t.snips.some(s => s[1] === 'typescript')) t.snips.push(['TypeScript', 'typescript', code]);
};

/* ---------------- OOP fundamentals ---------------- */

addTS('oop-class', `class BankAccount {
  static bankName = "Bitforge Bank";       // class (static) attribute: shared by all
  owner: string;
  balance: number;
  constructor(owner: string, balance = 0) {  // instance attributes: per object
    this.owner = owner;
    this.balance = balance;
  }
  deposit(amount: number): void { this.balance += amount; }
  toString(): string {
    return "BankAccount(owner=" + this.owner + ", balance=" + this.balance + ")";
  }
}

const a = new BankAccount("Ada", 100);
const b = new BankAccount("Alan");
a.deposit(50);
console.log(a.toString());         // BankAccount(owner=Ada, balance=150)
console.log(BankAccount.bankName); // Bitforge Bank  (shared static attribute)
console.log(a === b);              // false  (=== is identity; JS has no value-equality op)`);

addTS('oop-encapsulation', `class BankAccount {
  #balance: number;                  // TRULY private field (runtime-enforced by JS)
  constructor(balance = 0) { this.#balance = balance; }

  get balance(): number {            // read like a property: acct.balance
    return this.#balance;
  }
  deposit(amount: number): void {
    if (amount <= 0) throw new Error("amount must be positive");
    this.#balance += amount;
  }
  withdraw(amount: number): void {
    if (amount > this.#balance) throw new Error("insufficient funds"); // invariant
    this.#balance -= amount;
  }
}

const acct = new BankAccount(100);
acct.withdraw(30);
console.log(acct.balance);   // 70
// no setter for balance, and #balance is unreachable from outside -> state is protected`);

addTS('oop-abstraction', `interface PaymentProcessor {          // the abstraction: "what"
  charge(amount: number): boolean;
}

class StripeProcessor implements PaymentProcessor {   // a "how"
  charge(amount: number): boolean { console.log("Stripe charged " + amount); return true; }
}
class PayPalProcessor implements PaymentProcessor {   // another "how"
  charge(amount: number): boolean { console.log("PayPal charged " + amount); return true; }
}

function checkout(processor: PaymentProcessor, amount: number): void {
  if (processor.charge(amount)) console.log("order confirmed");  // depends on the abstraction
}

checkout(new StripeProcessor(), 49.99);   // swap to new PayPalProcessor() freely`);

addTS('oop-inheritance', `class Account {
  constructor(public balance = 0) {}
  withdraw(amount: number): void {
    if (amount > this.balance) throw new Error("insufficient funds");
    this.balance -= amount;
  }
}

class SavingsAccount extends Account {     // SavingsAccount IS-A Account
  constructor(balance = 0, public rate = 0.02) {
    super(balance);                        // reuse base setup
  }
  addInterest(): void {                    // extend with new behavior
    this.balance += this.balance * this.rate;
  }
}

const s = new SavingsAccount(1000);
s.addInterest();   // 1020
s.withdraw(20);    // inherited behavior

// Composition (has-a) for reuse:
class Engine { start() { console.log("engine started"); } }
class Car {
  engine = new Engine();                   // Car HAS-A Engine (not IS-A)
  start() { this.engine.start(); }         // delegate to the part
}
new Car().start();`);

addTS('oop-polymorphism', `interface Shape { area(): number; }

class Circle implements Shape {
  constructor(private r: number) {}
  area(): number { return Math.PI * this.r ** 2; }
}
class Square implements Shape {
  constructor(private s: number) {}
  area(): number { return this.s ** 2; }
}

const shapes: Shape[] = [new Circle(2), new Square(3)];
const total = shapes.reduce((sum, s) => sum + s.area(), 0);  // one call site, many behaviors
console.log(total.toFixed(2));   // 21.57
// Add a Triangle implements Shape: the reduce above does NOT change.`);

addTS('oop-interface', `// Abstract class with shared code (Template Method):
abstract class Report {
  generate(): string {                     // shared template (concrete)
    return "# " + this.title() + "\\n" + this.body();
  }
  abstract title(): string;                // subclasses fill these in
  abstract body(): string;
}
class SalesReport extends Report {
  title() { return "Sales"; }
  body() { return "Revenue up 12%"; }
}
console.log(new SalesReport().generate());

// Interface = pure contract; TS interfaces are STRUCTURAL (no "implements" needed):
interface Chargeable { charge(amount: number): boolean; }
class Stripe {                             // note: does NOT declare implements Chargeable
  charge(amount: number): boolean { console.log("charged " + amount); return true; }
}
function pay(gateway: Chargeable, amount: number) { return gateway.charge(amount); }
pay(new Stripe(), 20);                     // works: Stripe structurally matches the shape`);

addTS('oop-relations', `// Composition: Order OWNS its lines; created inside and die with it
class OrderLine {
  constructor(public sku: string, public qty: number) {}
}
class Order {
  lines: OrderLine[] = [];                 // created & owned here
  add(sku: string, qty: number) {
    this.lines.push(new OrderLine(sku, qty));   // part's lifetime = order's
  }
}

// Aggregation: Team HAS players passed in; they exist independently
class Player { constructor(public name: string) {} }
class Team {
  constructor(public players: Player[]) {} // shared, outlive the team
}

// Association: a Trip just KNOWS its driver (no ownership)
class Trip {
  constructor(public driver: Player) {}
}`);

addTS('oop-overload', `class Animal { speak(): string { return "..."; } }
class Dog extends Animal { speak(): string { return "Woof"; } }       // overrides
class Puppy extends Dog {
  speak(): string { return super.speak() + " (tiny)"; }               // extend via super
}
for (const a of [new Animal(), new Dog(), new Puppy()])
  console.log(a.speak());   // ... / Woof / Woof (tiny) — chosen at runtime

// TS HAS compile-time overload SIGNATURES, but a single implementation underneath:
function area(shape: { kind: "circle"; r: number }): number;
function area(shape: { kind: "square"; s: number }): number;
function area(shape: any): number {
  return shape.kind === "circle" ? Math.PI * shape.r ** 2 : shape.s ** 2;
}
console.log(area({ kind: "square", s: 3 }));   // 9`);

addTS('oop-solid', `// D: high-level OrderService depends on an abstraction, injected in
interface PaymentProcessor { charge(amount: number): boolean; }
class StripeProcessor implements PaymentProcessor {
  charge(amount: number) { console.log("stripe " + amount); return true; }
}
class OrderService {
  constructor(private processor: PaymentProcessor) {}   // injected abstraction
  checkout(amount: number) { return this.processor.charge(amount); }
}
// O: add a PayPalProcessor without editing OrderService at all
new OrderService(new StripeProcessor()).checkout(50);

// Liskov violation to avoid:
class Rectangle {
  constructor(protected w: number, protected h: number) {}
  setW(w: number) { this.w = w; }
  setH(h: number) { this.h = h; }
  area() { return this.w * this.h; }
}
class Square extends Rectangle {           // NOT substitutable
  setW(w: number) { this.w = this.h = w; } // changing width also changes height
  setH(h: number) { this.w = this.h = h; }
}
function grow(r: Rectangle) {
  r.setW(5); r.setH(4);
  return r.area();                         // 20 for Rectangle, 16 for Square (broken!)
}`);

/* ---------------- Design patterns ---------------- */

addTS('pat-strategy', `interface PricingStrategy { total(subtotal: number): number; }
class NoDiscount implements PricingStrategy { total(s: number) { return s; } }
class PercentOff implements PricingStrategy {
  constructor(private pct: number) {}
  total(s: number) { return s * (1 - this.pct); }
}
class Cart {                               // the context
  items: number[] = [];
  constructor(public pricing: PricingStrategy) {}   // injected strategy
  checkout(): number { return this.pricing.total(this.items.reduce((a, b) => a + b, 0)); }
}
const c = new Cart(new PercentOff(0.1));
c.items = [100, 50];
console.log(c.checkout());   // 135
c.pricing = new NoDiscount();              // swap algorithm at runtime
console.log(c.checkout());   // 150

// JS shortcut: a strategy can just be a function
const memberPrice = (subtotal: number) => subtotal * 0.85;`);

addTS('pat-factory', `interface Notifier { send(msg: string): void; }
class EmailNotifier implements Notifier { send(m: string) { console.log("email: " + m); } }
class SMSNotifier implements Notifier { send(m: string) { console.log("sms: " + m); } }
class PushNotifier implements Notifier { send(m: string) { console.log("push: " + m); } }

const REGISTRY: Record<string, new () => Notifier> = {
  email: EmailNotifier, sms: SMSNotifier, push: PushNotifier,
};
function makeNotifier(channel: string): Notifier {   // the factory
  const Ctor = REGISTRY[channel];
  if (!Ctor) throw new Error("unknown channel: " + channel);
  return new Ctor();
}
const n = makeNotifier("sms");   // caller never names SMSNotifier
n.send("hello");                 // sms: hello
// Add a channel -> one registry entry; no caller changes.`);

addTS('pat-abstract-factory', `interface Button { render(): string; }
interface Checkbox { render(): string; }
class LightButton implements Button { render() { return "[ Light Button ]"; } }
class LightCheckbox implements Checkbox { render() { return "[x] light"; } }
class DarkButton implements Button { render() { return "[ Dark Button ]"; } }
class DarkCheckbox implements Checkbox { render() { return "[x] dark"; } }

interface UIFactory { button(): Button; checkbox(): Checkbox; }   // the abstract factory
class LightUI implements UIFactory {
  button() { return new LightButton(); }
  checkbox() { return new LightCheckbox(); }
}
class DarkUI implements UIFactory {
  button() { return new DarkButton(); }
  checkbox() { return new DarkCheckbox(); }
}
function buildForm(ui: UIFactory) {        // client uses ONE family only
  console.log(ui.button().render(), ui.checkbox().render());
}
buildForm(new DarkUI());   // [ Dark Button ] [x] dark  (consistent set)`);

addTS('pat-builder', `interface HttpRequest {
  readonly method: string; readonly url: string;
  readonly headers: Record<string, string>; readonly body: string | null;
}
class RequestBuilder {
  private _method = "GET";
  private _headers: Record<string, string> = {};
  private _body: string | null = null;
  constructor(private _url: string) {}
  method(m: string) { this._method = m; return this; }        // fluent
  header(k: string, v: string) { this._headers[k] = v; return this; }
  body(b: string) { this._body = b; return this; }
  build(): HttpRequest {
    if (this._body && this._method === "GET")                 // validate here
      throw new Error("GET cannot have a body");
    return { method: this._method, url: this._url,
             headers: { ...this._headers }, body: this._body };
  }
}
const req = new RequestBuilder("https://api.x.com/users")
  .method("POST")
  .header("Content-Type", "application/json")
  .body('{"name":"Ada"}')
  .build();
console.log(req.method, req.url);   // POST https://api.x.com/users`);

addTS('pat-singleton', `class Config {
  private static _instance: Config | null = null;
  settings: Record<string, string> = { env: "prod" };
  private constructor() {}                  // prevent direct "new"
  static instance(): Config {               // single access point
    if (!Config._instance) Config._instance = new Config();
    return Config._instance;
  }
}
console.log(Config.instance() === Config.instance());   // true

// Usually better: ONE instance, injected explicitly (no global access)
class Service {
  constructor(private config: Config) {}    // dependency is visible & swappable
}
const svc = new Service(Config.instance()); // tests can pass a fake Config
// Note: a JS module is evaluated once, so "export const config = ..." in a module
// is itself a singleton — often simpler than this class.`);

addTS('pat-adapter', `interface PaymentGateway { pay(amountCents: number): boolean; }   // target

class StripeSDK {                           // adaptee (different interface; can't change)
  createCharge(dollars: number, currency: string) {
    return { status: "succeeded", amount: dollars };
  }
}
class StripeAdapter implements PaymentGateway {
  constructor(private sdk: StripeSDK) {}     // composition (object adapter)
  pay(amountCents: number): boolean {
    const res = this.sdk.createCharge(amountCents / 100, "usd");  // translate
    return res.status === "succeeded";
  }
}
function checkout(gw: PaymentGateway, cents: number) {
  console.log(gw.pay(cents) ? "paid" : "failed");
}
checkout(new StripeAdapter(new StripeSDK()), 4999);   // your code never touches StripeSDK`);

addTS('pat-decorator', `interface DataSource { get(key: string): string; }
class RealSource implements DataSource {
  get(key: string) { console.log("  fetch " + key); return "value:" + key; }
}
class SourceDecorator implements DataSource {    // base wrapper: same interface
  constructor(protected wrapped: DataSource) {}
  get(key: string) { return this.wrapped.get(key); }
}
class LoggingSource extends SourceDecorator {
  get(key: string) { console.log("log: get(" + key + ")"); return super.get(key); }
}
class CachingSource extends SourceDecorator {
  private cache: Record<string, string> = {};
  get(key: string) {
    if (!(key in this.cache)) this.cache[key] = super.get(key);
    return this.cache[key];
  }
}
const src = new LoggingSource(new CachingSource(new RealSource()));  // stack at runtime
src.get("a"); src.get("a");   // fetched once, logged twice`);

addTS('pat-observer', `interface Observer { update(...args: any[]): void; }
class Subject {
  private observers: Observer[] = [];
  subscribe(o: Observer) { this.observers.push(o); }
  unsubscribe(o: Observer) { this.observers = this.observers.filter(x => x !== o); }
  protected notify(...args: any[]) {
    for (const o of [...this.observers]) o.update(...args);   // copy: safe if one unsubscribes
  }
}
class Stock extends Subject {
  private price = 0;
  constructor(public symbol: string) { super(); }
  setPrice(price: number) { this.price = price; this.notify(this.symbol, price); }
}
class PriceDisplay implements Observer {
  constructor(public name: string) {}
  update(symbol: string, price: number) { console.log(this.name + ": " + symbol + " = " + price); }
}
const aapl = new Stock("AAPL");
const d1 = new PriceDisplay("web"), d2 = new PriceDisplay("mobile");
aapl.subscribe(d1); aapl.subscribe(d2);
aapl.setPrice(190);        // both displays update
aapl.unsubscribe(d2);
aapl.setPrice(191);        // only web`);

addTS('pat-state', `interface State {
  insertCoin(m: VendingMachine): void;
  dispense(m: VendingMachine): void;
}
class NoCoin implements State {
  insertCoin(m: VendingMachine) { console.log("coin accepted"); m.state = new HasCoin(); }
  dispense(_m: VendingMachine) { console.log("insert a coin first"); }
}
class HasCoin implements State {
  insertCoin(_m: VendingMachine) { console.log("already have a coin"); }
  dispense(m: VendingMachine) { console.log("dispensing"); m.state = new NoCoin(); }
}
class VendingMachine {                      // the context
  state: State = new NoCoin();
  insertCoin() { this.state.insertCoin(this); }
  dispense() { this.state.dispense(this); }
}
const vm = new VendingMachine();
vm.dispense();     // insert a coin first
vm.insertCoin();   // coin accepted
vm.dispense();     // dispensing (back to NoCoin)`);

addTS('pat-command', `interface Command { execute(): void; undo(): void; }
class Doc { text = ""; }                     // receiver
class AppendText implements Command {
  constructor(private doc: Doc, private s: string) {}
  execute() { this.doc.text += this.s; }
  undo() { this.doc.text = this.doc.text.slice(0, -this.s.length); }
}
class Editor {                              // invoker
  private history: Command[] = [];
  run(cmd: Command) { cmd.execute(); this.history.push(cmd); }
  undo() { const c = this.history.pop(); if (c) c.undo(); }
}
const doc = new Doc(), ed = new Editor();
ed.run(new AppendText(doc, "Hello "));
ed.run(new AppendText(doc, "World"));
console.log(doc.text);   // Hello World
ed.undo();
console.log(doc.text);   // Hello`);

addTS('pat-proxy', `interface Database { query(sql: string): string[]; }
class RealDatabase implements Database {     // expensive to create
  constructor() { console.log("opening real connection..."); }
  query(sql: string) { return ["row for " + sql]; }
}
class DatabaseProxy implements Database {
  private real: RealDatabase | null = null;  // not created yet (virtual)
  constructor(private role: string) {}
  query(sql: string): string[] {
    if (sql.toLowerCase().startsWith("drop") && this.role !== "admin")
      throw new Error("not allowed");         // protection
    if (!this.real) this.real = new RealDatabase();   // lazy init on first real use
    return this.real.query(sql);
  }
}
const db = new DatabaseProxy("viewer");
console.log(db.query("SELECT 1"));   // opens the connection only now, then returns
// db.query("DROP TABLE users") -> Error: not allowed`);

addTS('pat-chain', `abstract class Approver {
  private next: Approver | null = null;
  setNext(nxt: Approver): Approver { this.next = nxt; return nxt; }   // chainable
  handle(amount: number): void {
    if (this.canApprove(amount)) console.log(this.constructor.name + " approved " + amount);
    else if (this.next) this.next.handle(amount);                    // escalate
    else console.log(amount + " needs board approval");
  }
  protected abstract canApprove(amount: number): boolean;
}
class Manager extends Approver { protected canApprove(a: number) { return a <= 1000; } }
class Director extends Approver { protected canApprove(a: number) { return a <= 10000; } }
class VP extends Approver { protected canApprove(a: number) { return a <= 100000; } }

const mgr = new Manager();
mgr.setNext(new Director()).setNext(new VP());   // build the chain
mgr.handle(500);      // Manager approved 500
mgr.handle(8000);     // Director approved 8000
mgr.handle(250000);   // needs board approval`);

addTS('pat-composite', `interface Node { name: string; size(): number; }
class FileNode implements Node {             // leaf
  constructor(public name: string, private _size: number) {}
  size() { return this._size; }
}
class Directory implements Node {            // composite
  children: Node[] = [];
  constructor(public name: string) {}
  add(node: Node) { this.children.push(node); }
  size(): number { return this.children.reduce((sum, c) => sum + c.size(), 0); }  // recurse
}
const root = new Directory("root");
root.add(new FileNode("a.txt", 100));
const sub = new Directory("sub"); sub.add(new FileNode("b.txt", 250));
root.add(sub);
console.log(root.size());   // 350 — leaf and group treated the same way`);

addTS('pat-facade', `class Inventory { reserve(sku: string, qty: number) { console.log("reserved " + qty + "x " + sku); return true; } }
class Payments { charge(user: string, amount: number) { console.log("charged " + user + " " + amount); return true; } }
class Shipping { schedule(user: string, sku: string) { console.log("shipping " + sku + " to " + user); } }

class OrderFacade {                          // one simple door
  private inv = new Inventory();
  private pay = new Payments();
  private ship = new Shipping();
  placeOrder(user: string, sku: string, qty: number, amount: number): string {
    if (!this.inv.reserve(sku, qty)) throw new Error("out of stock");   // orchestrate
    if (!this.pay.charge(user, amount)) throw new Error("payment failed");
    this.ship.schedule(user, sku);
    return "order placed";
  }
}
console.log(new OrderFacade().placeOrder("ada", "book-1", 1, 25.0));
// clients call ONE method; they never touch Inventory/Payments/Shipping`);

/* ---------------- LLD problems ---------------- */

addTS('lld-parking', `enum Size { MOTORCYCLE = 1, CAR = 2, TRUCK = 3 }   // numeric: a vehicle fits a >= spot

interface Vehicle { plate: string; size: Size; }

class Spot {
  vehicle: Vehicle | null = null;
  constructor(public id: string, public size: Size) {}
  isFree() { return this.vehicle === null; }
  fits(v: Vehicle) { return this.isFree() && this.size >= v.size; }
}
class Ticket {
  entry = Date.now();
  constructor(public id: string, public spot: Spot, public vehicle: Vehicle) {}
}
interface PricingStrategy { fee(hours: number): number; }   // Strategy: swap pricing rules
class HourlyPricing implements PricingStrategy {
  constructor(private rate = 2.0) {}
  fee(hours: number) { return Math.round(Math.max(1, hours) * this.rate * 100) / 100; }
}
class Level {
  constructor(public idx: number, public spots: Spot[]) {}
  find(v: Vehicle): Spot | null {            // smallest fitting free spot
    let best: Spot | null = null;
    for (const s of this.spots)
      if (s.fits(v) && (!best || s.size < best.size)) best = s;
    return best;
  }
}
class ParkingLot {
  private seq = 1;
  tickets = new Map<string, Ticket>();
  constructor(private levels: Level[], private pricing: PricingStrategy) {}
  park(v: Vehicle): Ticket {
    // JS is single-threaded, so this find+reserve is atomic within one tick.
    // (A multi-process/distributed version needs an atomic DB update or a lock.)
    for (const lvl of this.levels) {
      const spot = lvl.find(v);
      if (spot) {
        spot.vehicle = v;
        const t = new Ticket("T" + (this.seq++), spot, v);
        this.tickets.set(t.id, t);
        return t;
      }
    }
    throw new Error("lot full");
  }
  unpark(ticketId: string, now = Date.now()): number {
    const t = this.tickets.get(ticketId)!;
    this.tickets.delete(ticketId);
    const hours = (now - t.entry) / 3_600_000;
    t.spot.vehicle = null;                    // free the spot
    return this.pricing.fee(hours);
  }
}
const lot = new ParkingLot(
  [new Level(0, [new Spot("A1", Size.CAR), new Spot("A2", Size.TRUCK)])],
  new HourlyPricing(3.0));
const t = lot.park({ plate: "KA-01", size: Size.CAR });
console.log(t.id, t.spot.id);   // T1 A1
console.log(lot.unpark(t.id));  // fee (>= 1 hour minimum)`);

addTS('lld-vending', `interface Product { name: string; price: number; count: number; }  // price in cents

interface State {
  insertCoin(m: VendingMachine, cents: number): void;
  select(m: VendingMachine, name: string): void;
  dispense(m: VendingMachine): void;
}
class Idle implements State {
  insertCoin(m: VendingMachine, cents: number) { m.balance += cents; m.state = new HasMoney(); }
  select() { console.log("insert coins first"); }
  dispense() { console.log("nothing selected"); }
}
class HasMoney implements State {
  insertCoin(m: VendingMachine, cents: number) { m.balance += cents; }
  select(m: VendingMachine, name: string) {
    const p = m.inventory.get(name);
    if (!p || p.count === 0) { console.log("sold out"); return; }
    if (m.balance < p.price) { console.log("need " + (p.price - m.balance) + " more"); return; }
    m.selected = name; m.state = new Dispensing();
  }
  dispense() { console.log("select a product"); }
}
class Dispensing implements State {
  insertCoin() { console.log("dispensing, please wait"); }
  select() { console.log("dispensing, please wait"); }
  dispense(m: VendingMachine) {
    const p = m.inventory.get(m.selected!)!;
    p.count -= 1;                             // atomic: stock down + change out
    const change = m.balance - p.price;
    console.log("dispensed " + p.name + ", change " + change);
    m.balance = 0; m.selected = null; m.state = new Idle();
  }
}
class VendingMachine {                        // the context
  balance = 0;
  selected: string | null = null;
  state: State = new Idle();
  constructor(public inventory: Map<string, Product>) {}
  insertCoin(c: number) { this.state.insertCoin(this, c); }
  select(n: string) { this.state.select(this, n); }
  dispense() { this.state.dispense(this); }
}
const vm = new VendingMachine(new Map([["coke", { name: "coke", price: 150, count: 2 }]]));
vm.select("coke");    // insert coins first
vm.insertCoin(100); vm.insertCoin(100);
vm.select("coke");    // ok -> Dispensing
vm.dispense();        // dispensed coke, change 50`);

addTS('lld-elevator', `enum Dir { UP = 1, DOWN = -1, IDLE = 0 }

class Elevator {
  floor = 0;
  direction: Dir = Dir.IDLE;
  upStops = new Set<number>();                // floors above
  downStops = new Set<number>();              // floors below
  constructor(public id: number) {}

  addStop(floor: number) {
    (floor > this.floor ? this.upStops : this.downStops).add(floor);
    if (this.direction === Dir.IDLE) this.direction = floor > this.floor ? Dir.UP : Dir.DOWN;
  }
  private sorted(set: Set<number>, asc: boolean) {
    return [...set].sort((a, b) => asc ? a - b : b - a);
  }
  step() {                                     // LOOK: sweep, then reverse
    const stops = this.direction === Dir.UP ? this.upStops : this.downStops;
    if (stops.size === 0) {
      const other = this.direction === Dir.UP ? this.downStops : this.upStops;
      this.direction = other.size ? (this.direction === Dir.UP ? Dir.DOWN : Dir.UP) : Dir.IDLE;
      return;
    }
    const target = this.direction === Dir.UP ? this.sorted(stops, true)[0] : this.sorted(stops, false)[0];
    this.floor += this.direction;
    if (this.floor === target) {
      stops.delete(target);                    // doors open here
      console.log("car " + this.id + " stops at " + this.floor);
    }
  }
}
interface DispatchStrategy { choose(cars: Elevator[], floor: number): Elevator; }
class NearestCar implements DispatchStrategy {
  choose(cars: Elevator[], floor: number) {    // simplest heuristic
    return cars.reduce((best, c) => Math.abs(c.floor - floor) < Math.abs(best.floor - floor) ? c : best);
  }
}
class ElevatorController {
  constructor(private cars: Elevator[], private strategy: DispatchStrategy) {}
  request(floor: number) { const car = this.strategy.choose(this.cars, floor); car.addStop(floor); return car.id; }
  step() { for (const c of this.cars) c.step(); }
}
const ctrl = new ElevatorController([new Elevator(0), new Elevator(1)], new NearestCar());
ctrl.request(5); ctrl.request(3);
for (let i = 0; i < 6; i++) ctrl.step();`);

addTS('lld-movie', `enum SeatStatus { AVAILABLE, HELD, BOOKED }
class Seat {
  status = SeatStatus.AVAILABLE;
  holdUntil = 0;
  heldBy: string | null = null;
  constructor(public id: string) {}
}
class Show {
  seats = new Map<string, Seat>();
  bookings = new Map<string, string[]>();
  private seq = 1;
  constructor(public id: string, seatIds: string[]) {
    for (const s of seatIds) this.seats.set(s, new Seat(s));
  }
  private expire(now: number) {               // release stale holds
    for (const s of this.seats.values())
      if (s.status === SeatStatus.HELD && s.holdUntil && s.holdUntil < now) {
        s.status = SeatStatus.AVAILABLE; s.holdUntil = 0; s.heldBy = null;
      }
  }
  hold(user: string, seatIds: string[], ttlMs = 5 * 60_000): string {
    const now = Date.now();
    this.expire(now);
    // all-or-nothing: verify EVERY seat first, then commit (atomic in single-threaded JS)
    for (const id of seatIds)
      if (this.seats.get(id)!.status !== SeatStatus.AVAILABLE)
        throw new Error("seat " + id + " not available");
    for (const id of seatIds) {
      const s = this.seats.get(id)!;
      s.status = SeatStatus.HELD; s.holdUntil = now + ttlMs; s.heldBy = user;
    }
    const holdId = "H" + (this.seq++);
    this.bookings.set(holdId, seatIds);
    return holdId;
  }
  confirm(holdId: string, user: string): string {
    this.expire(Date.now());
    const seatIds = this.bookings.get(holdId);
    if (!seatIds) throw new Error("hold expired or invalid");
    for (const id of seatIds) {
      const s = this.seats.get(id)!;
      if (s.status !== SeatStatus.HELD || s.heldBy !== user) throw new Error("hold no longer valid");
    }
    for (const id of seatIds) this.seats.get(id)!.status = SeatStatus.BOOKED;
    return "BOOKING-" + holdId;
  }
}
const show = new Show("S1", ["A1", "A2", "A3"]);
const h = show.hold("ada", ["A1", "A2"]);   // both held atomically
console.log(show.confirm(h, "ada"));        // BOOKING-H1
// show.hold("bob", ["A1"])  -> Error: seat A1 not available`);

addTS('lld-splitwise', `interface SplitStrategy { shares(amount: number, parts: any): Map<string, number>; }
class EqualSplit implements SplitStrategy {           // parts: string[]
  shares(amount: number, parts: string[]) {
    const each = Math.round((amount / parts.length) * 100) / 100;
    return new Map(parts.map(u => [u, each] as [string, number]));
  }
}
class ExactSplit implements SplitStrategy {           // parts: Map<user, exact>
  shares(amount: number, parts: Map<string, number>) {
    const sum = [...parts.values()].reduce((a, b) => a + b, 0);
    if (Math.round(sum * 100) !== Math.round(amount * 100)) throw new Error("exact shares must sum to total");
    return new Map(parts);
  }
}
class PercentSplit implements SplitStrategy {         // parts: Map<user, percent>
  shares(amount: number, parts: Map<string, number>) {
    const sum = [...parts.values()].reduce((a, b) => a + b, 0);
    if (Math.round(sum * 100) !== 10000) throw new Error("percentages must sum to 100");
    return new Map([...parts].map(([u, p]) => [u, Math.round(amount * p) / 100] as [string, number]));
  }
}
class ExpenseBook {
  net = new Map<string, number>();            // + owed to them, - they owe
  private add(u: string, v: number) { this.net.set(u, (this.net.get(u) || 0) + v); }
  addExpense(payer: string, amount: number, parts: any, strategy: SplitStrategy) {
    for (const [user, owed] of strategy.shares(amount, parts)) {
      if (user === payer) continue;
      this.add(user, -owed);                  // participant owes their share
      this.add(payer, owed);                  // payer is owed it back
    }
  }
  settle(): [string, string, number][] {      // greedy: biggest debtor pays biggest creditor
    const debtors = [...this.net].filter(([, v]) => v < -1e-9).map(([u, v]) => [u, -v] as [string, number]);
    const creditors = [...this.net].filter(([, v]) => v > 1e-9).map(([u, v]) => [u, v] as [string, number]);
    const transfers: [string, string, number][] = [];
    while (debtors.length && creditors.length) {
      debtors.sort((a, b) => b[1] - a[1]); creditors.sort((a, b) => b[1] - a[1]);
      const d = debtors[0], c = creditors[0];
      const pay = Math.round(Math.min(d[1], c[1]) * 100) / 100;
      transfers.push([d[0], c[0], pay]);       // d pays c
      d[1] -= pay; c[1] -= pay;
      if (d[1] <= 1e-9) debtors.shift();
      if (c[1] <= 1e-9) creditors.shift();
    }
    return transfers;
  }
}
const book = new ExpenseBook();
book.addExpense("ada", 90, ["ada", "bob", "cara"], new EqualSplit());   // each owes 30
book.addExpense("bob", 60, new Map([["bob", 50], ["ada", 10]]), new PercentSplit());
console.log([...book.net]);
console.log(book.settle());   // minimal list of [debtor, creditor, amount]`);

addTS('lld-ratelimiter', `interface RateLimiter { allow(key: string): boolean; }

class TokenBucket implements RateLimiter {
  private buckets = new Map<string, { tokens: number; last: number }>();
  constructor(private ratePerSec: number, private capacity: number) {}
  allow(key: string): boolean {
    const now = performance.now() / 1000;      // monotonic seconds
    const b = this.buckets.get(key) ?? { tokens: this.capacity, last: now };
    b.tokens = Math.min(this.capacity, b.tokens + (now - b.last) * this.ratePerSec);  // refill
    b.last = now;
    const ok = b.tokens >= 1;
    if (ok) b.tokens -= 1;
    this.buckets.set(key, b);
    return ok;
  }
}
// 5 requests/sec, burst up to 10 (JS is single-threaded, so per-key update is atomic)
const rl = new TokenBucket(5, 10);
let allowed = 0;
for (let i = 0; i < 12; i++) if (rl.allow("user:1")) allowed++;
console.log(allowed);   // 10 immediately (burst), rest rejected until refill`);

addTS('lld-lru', `class DNode {
  prev: DNode | null = null;
  next: DNode | null = null;
  constructor(public key = 0, public val = 0) {}
}
class LRUCache {
  private map = new Map<number, DNode>();
  private head = new DNode();                  // dummy head (most-recent side)
  private tail = new DNode();                  // dummy tail (least-recent side)
  constructor(private cap: number) {
    this.head.next = this.tail; this.tail.prev = this.head;
  }
  private remove(n: DNode) { n.prev!.next = n.next; n.next!.prev = n.prev; }
  private addFront(n: DNode) {
    n.prev = this.head; n.next = this.head.next;
    this.head.next!.prev = n; this.head.next = n;
  }
  get(key: number): number {
    const n = this.map.get(key);
    if (!n) return -1;
    this.remove(n); this.addFront(n);          // mark most-recently-used
    return n.val;
  }
  put(key: number, value: number): void {
    const existing = this.map.get(key);
    if (existing) { existing.val = value; this.remove(existing); this.addFront(existing); return; }
    if (this.map.size >= this.cap) {           // evict least-recently-used
      const lru = this.tail.prev!;
      this.remove(lru); this.map.delete(lru.key);
    }
    const n = new DNode(key, value);
    this.map.set(key, n); this.addFront(n);
  }
}
const c = new LRUCache(2);
c.put(1, 1); c.put(2, 2);
console.log(c.get(1));   // 1  (now 1 is most recent)
c.put(3, 3);             // capacity full -> evicts key 2
console.log(c.get(2));   // -1 (evicted)
console.log(c.get(3));   // 3
// Note: a JS Map preserves insertion order, so a Map-only LRU also works;
// the map + doubly linked list here mirrors the language-agnostic O(1) design.`);

addTS('lld-notification', `interface Channel { send(recipient: string, message: string): boolean; }
class EmailChannel implements Channel { send(r: string, m: string) { console.log("EMAIL -> " + r + ": " + m); return true; } }
class SMSChannel implements Channel { send(r: string, m: string) { console.log("SMS   -> " + r + ": " + m); return true; } }
class PushChannel implements Channel { send(r: string, m: string) { console.log("PUSH  -> " + r + ": " + m); return true; } }

const CHANNELS: Record<string, new () => Channel> = { email: EmailChannel, sms: SMSChannel, push: PushChannel };
function makeChannel(kind: string): Channel { return new CHANNELS[kind](); }   // Factory

interface User { id: string; contacts: Record<string, string>; channels: string[]; }

function render(template: string, data: Record<string, any>): string {   // simple templating
  let out = template;
  for (const k of Object.keys(data)) out = out.split("{" + k + "}").join(String(data[k]));
  return out;
}
class NotificationService {
  constructor(private retries = 2) {}
  notify(user: User, template: string, data: Record<string, any>): string {
    const message = render(template, data);
    for (const kind of user.channels) {        // route by preference
      const recipient = user.contacts[kind];
      if (!recipient) continue;
      if (this.sendWithRetry(makeChannel(kind), recipient, message)) return kind;
    }
    throw new Error("all channels failed");
  }
  private sendWithRetry(ch: Channel, recipient: string, msg: string): boolean {
    for (let attempt = 0; attempt <= this.retries; attempt++)
      if (ch.send(recipient, msg)) return true;   // (would exponential-backoff between tries)
    return false;
  }
}
const u: User = { id: "u1", contacts: { email: "ada@x.com", sms: "+1555" }, channels: ["sms", "email"] };
new NotificationService().notify(u, "Hi {name}, your order {oid} shipped", { name: "Ada", oid: 42 });`);

addTS('lld-payment', `enum Status { INIT = "INIT", AUTHORIZED = "AUTHORIZED", CAPTURED = "CAPTURED", FAILED = "FAILED", REFUNDED = "REFUNDED" }

interface Provider {                         // common interface
  authorize(amount: number, token: string): boolean;
  capture(amount: number): boolean;
}
class StripeAdapter implements Provider {     // Adapter over a vendor SDK
  authorize(amount: number) { console.log("stripe authorize " + amount); return true; }
  capture(amount: number) { console.log("stripe capture " + amount); return true; }
}
class PayPalAdapter implements Provider {
  authorize(amount: number) { console.log("paypal authorize " + amount); return true; }
  capture(amount: number) { console.log("paypal capture " + amount); return true; }
}
class Payment {
  status = Status.INIT;
  history: [Status, Status, number][] = [];   // audit ledger
  constructor(public id: string, public amount: number) {}
  transition(next: Status) { this.history.push([this.status, next, Date.now()]); this.status = next; }
}
class PaymentGateway {
  private payments = new Map<string, Payment>();
  private idem = new Map<string, string>();   // idempotency key -> payment id
  constructor(private provider: Provider) {}
  charge(idemKey: string, amount: number, token: string): Payment {
    if (this.idem.has(idemKey)) return this.payments.get(this.idem.get(idemKey)!)!;  // retry-safe
    const p = new Payment(idemKey, amount);
    this.payments.set(p.id, p);
    this.idem.set(idemKey, p.id);             // atomic claim in a real DB (unique key)
    if (!this.provider.authorize(amount, token)) { p.transition(Status.FAILED); return p; }
    p.transition(Status.AUTHORIZED);
    if (this.provider.capture(amount)) p.transition(Status.CAPTURED);
    else p.transition(Status.FAILED);
    return p;
  }
}
const gw = new PaymentGateway(new StripeAdapter());
const p1 = gw.charge("order-42-key", 4999, "tok_visa");
const p2 = gw.charge("order-42-key", 4999, "tok_visa");   // retry: same key
console.log(p1 === p2, p1.status);   // true CAPTURED  (NOT charged twice)`);

addTS('lld-scheduler', `interface ScheduledTask {
  nextRun: number; priority: number; seq: number;
  fn: () => void; interval: number | null; retriesLeft: number;
}
class MinHeap {                               // ordered by nextRun, then priority, then seq
  private a: ScheduledTask[] = [];
  get size() { return this.a.length; }
  peek() { return this.a[0]; }
  private less(i: number, j: number) {
    const x = this.a[i], y = this.a[j];
    if (x.nextRun !== y.nextRun) return x.nextRun < y.nextRun;
    if (x.priority !== y.priority) return x.priority < y.priority;
    return x.seq < y.seq;
  }
  private swap(i: number, j: number) { [this.a[i], this.a[j]] = [this.a[j], this.a[i]]; }
  push(t: ScheduledTask) {
    this.a.push(t); let i = this.a.length - 1;
    while (i > 0) { const p = (i - 1) >> 1; if (this.less(i, p)) { this.swap(i, p); i = p; } else break; }
  }
  pop(): ScheduledTask {
    const top = this.a[0], last = this.a.pop()!;
    if (this.a.length) {
      this.a[0] = last; let i = 0;
      for (;;) {
        let s = i; const l = 2 * i + 1, r = 2 * i + 2;
        if (l < this.a.length && this.less(l, s)) s = l;
        if (r < this.a.length && this.less(r, s)) s = r;
        if (s === i) break; this.swap(i, s); i = s;
      }
    }
    return top;
  }
}
class Scheduler {
  private heap = new MinHeap();
  private seq = 0;
  schedule(fn: () => void, delay = 0, interval: number | null = null, priority = 0, retries = 0) {
    this.heap.push({ nextRun: performance.now() + delay, priority, seq: ++this.seq, fn, interval, retriesLeft: retries });
  }
  private runTask(t: ScheduledTask) {
    try { t.fn(); }
    catch (e) {
      if (t.retriesLeft > 0) this.schedule(t.fn, 1000, t.interval, t.priority, t.retriesLeft - 1);  // retry + backoff
      else console.log("task failed permanently");
    }
    if (t.interval) this.schedule(t.fn, t.interval, t.interval, t.priority);   // recurring: reschedule
  }
  // One iteration: run everything currently due. A real loop would setTimeout
  // until heap.peek().nextRun instead of busy-waiting (no CPU spin).
  tick() {
    const now = performance.now();
    while (this.heap.size && this.heap.peek().nextRun <= now) this.runTask(this.heap.pop());
  }
}
const s = new Scheduler();
s.schedule(() => console.log("once, now"));
s.schedule(() => console.log("tick"), 500, 500);   // recurring every 500ms
s.tick();   // runs the due 'once' task; a real loop waits on timers for the rest`);

/* ---------------- Concept gaps ---------------- */

addTS('servicediscovery', `class ServiceRegistry {
  private instances = new Map<string, Map<string, number>>();   // service -> (addr -> lastHeartbeat)
  constructor(private ttlMs = 10_000) {}
  register(service: string, addr: string) {
    if (!this.instances.has(service)) this.instances.set(service, new Map());
    this.instances.get(service)!.set(addr, Date.now());
  }
  heartbeat(service: string, addr: string) { this.instances.get(service)!.set(addr, Date.now()); }  // renew TTL
  healthy(service: string): string[] {
    const now = Date.now();
    const m = this.instances.get(service) ?? new Map<string, number>();
    return [...m].filter(([, ts]) => now - ts < this.ttlMs).map(([a]) => a);   // drop stale
  }
  discover(service: string): string | null {   // client-side pick
    const alive = this.healthy(service);
    return alive.length ? alive[Math.floor(Math.random() * alive.length)] : null;  // or round-robin
  }
}
const reg = new ServiceRegistry();
reg.register("orders", "10.0.0.1:8080");
reg.register("orders", "10.0.0.2:8080");
console.log(reg.discover("orders"));   // a healthy instance address`);

addTS('distlock', `import { randomUUID } from "crypto";   // conceptual; redis is an ioredis-style client

async function acquire(redis: any, key: string, ttlMs = 10_000): Promise<string | null> {
  const token = randomUUID();                 // unique owner token
  // SET key token NX PX ttl  -> set only if absent, with expiry
  const ok = await redis.set(key, token, "NX", "PX", ttlMs);
  return ok ? token : null;
}
// Safe release: only delete if WE still own it (atomic via Lua)
const RELEASE = [
  "if redis.call('get', KEYS[1]) == ARGV[1] then",
  "  return redis.call('del', KEYS[1])",
  "else return 0 end",
].join("\\n");
async function release(redis: any, key: string, token: string) {
  await redis.eval(RELEASE, 1, key, token);   // compares token, then deletes
}

const token = await acquire(redis, "lock:job-nightly");
if (token) {
  try { /* ... exclusive work — BUT see the fencing caveat ... */ }
  finally { await release(redis, "lock:job-nightly", token); }
}
// Caveat: a GC/network pause past the TTL means the lock can expire while you still
// "think" you hold it. For correctness, the protected resource must also check a
// monotonic FENCING TOKEN and reject writes that carry an older one.`);

/* ---------------- Failure & scale deep-dives ---------------- */

addTS('deepdive-fail', `// 1) Cache stampede: only ONE request rebuilds a hot key; others await the same promise.
const inflight = new Map<string, Promise<string>>();
async function getWithSingleflight(cache: any, db: any, key: string): Promise<string> {
  const hit = await cache.get(key);
  if (hit != null) return hit;                 // hit
  if (inflight.has(key)) return inflight.get(key)!;   // coalesce: reuse the in-flight rebuild
  const p = (async () => {
    const val = await db.load(key);            // the single expensive rebuild
    await cache.set(key, val, 300);
    inflight.delete(key);
    return val;
  })();
  inflight.set(key, p);
  return p;
}

// 2) Duplicate messages: idempotent consumer via a dedup key.
const processed = new Set<string>();           // in reality: Redis/DB with a TTL
function handle(msg: { id: string }) {
  if (processed.has(msg.id)) return;           // already handled -> no-op
  applyEffect(msg);                            // do the work (ideally itself idempotent)
  processed.add(msg.id);                       // record AFTER success
}`);

addTS('deepdive-scale', `// Hot key: a single viral counter would overload one shard.
// Split it into N sub-counters; write to a random one, sum on read.
const N = 16;
function incr(store: any, key: string) {
  store.incr(key + ":shard:" + Math.floor(Math.random() * N));   // spread writes
}
function read(store: any, key: string): number {
  let total = 0;
  for (let i = 0; i < N; i++) total += (store.get(key + ":shard:" + i) || 0);  // combine
  return total;
}

// Live migration (expand-contract) — the shape of a zero-downtime move:
function writeUser(oldDb: any, newDb: any, user: any, dualWrite: boolean, useNew: boolean) {
  if (useNew) newDb.put(user);        // phase 4+: new store is the source of truth
  else oldDb.put(user);               // phase 1: still old
  if (dualWrite) newDb.put(user);     // phase 2-3: write both while backfilling
}
// Steps: 1 old-only -> 2 dual-write -> 3 backfill+verify -> 4 read new -> 5 drop old`);

/* ---------------- Case studies ---------------- */

addTS('case-instagram', `function getFeed(userId: string, feedCache: any, graph: any, posts: any, celebThreshold = 100_000): string[] {
  // 1) precomputed part (fan-out on write): cheap cache read
  const feed: string[] = feedCache.getTimeline(userId);        // list of post ids

  // 2) celebrities this user follows are NOT pushed; pull at read time
  const celebs = graph.following(userId).filter((f: string) => graph.followerCount(f) > celebThreshold);
  let pulled: any[] = [];
  for (const c of celebs) pulled = pulled.concat(posts.recentByAuthor(c, 10));

  // 3) merge by timestamp, dedupe, paginate
  const ids = [...new Set([...feed, ...pulled.map(p => p.id)])];
  ids.sort((a, b) => posts.timestamp(b) - posts.timestamp(a));
  return ids.slice(0, 50);
}`);

addTS('case-fooddelivery', `// geohash is a conceptual lib: encode(lat,lng,precision) and neighbors(cell)
class LocationIndex {
  private cells = new Map<string, Set<string>>();   // geohash cell -> courier ids
  constructor(private precision = 6) {}
  update(courierId: string, lat: number, lng: number) {
    const cell = geohash.encode(lat, lng, this.precision);
    // (remove from old cell, add to new) ...
    if (!this.cells.has(cell)) this.cells.set(cell, new Set());
    this.cells.get(cell)!.add(courierId);
  }
  nearby(lat: number, lng: number): Set<string> {
    const cell = geohash.encode(lat, lng, this.precision);
    const out = new Set<string>();
    for (const c of [cell, ...geohash.neighbors(cell)])   // include neighbors (border cases!)
      for (const id of this.cells.get(c) ?? []) out.add(id);
    return out;
  }
}
function dispatch(order: any, index: LocationIndex, couriers: any): string | null {
  const cands = [...index.nearby(order.restaurantLat, order.restaurantLng)];
  // rank by ETA to restaurant, current load, rating
  cands.sort((a, b) => couriers[a].etaTo(order.restaurant) - couriers[b].etaTo(order.restaurant));
  return cands.length ? cands[0] : null;        // offer to best; retry on decline`);

addTS('case-netflix', `const renditions = [240, 480, 720, 1080, 4000];   // kbps tiers
class ABRPlayer {
  current = 240;                                  // start conservative for a fast start
  constructor(private manifest: any) {}
  pickRendition(measuredKbps: number): number {
    const safe = measuredKbps * 0.8;              // headroom to avoid rebuffering
    const candidates = renditions.filter(r => r <= safe);
    this.current = candidates.length ? Math.max(...candidates) : renditions[0];
    return this.current;
  }
  nextSegment(idx: number, measuredKbps: number) {
    const r = this.pickRendition(measuredKbps);
    return this.manifest.url(r, idx);             // fetch the segment from the CDN
  }
}
// As bandwidth drops, the player steps down a tier; as it recovers, it steps up.`);

addTS('case-maps', `function travelTime(u: string, v: string, w: Map<string, number>, traffic: Map<string, number>): number {
  const key = u + ">" + v;
  return w.get(key)! * (traffic.get(key) ?? 1.0);   // live traffic multiplier
}
function aStar(start: string, goal: string, graph: Map<string, string[]>,
               w: Map<string, number>, traffic: Map<string, number>,
               heuristic: (a: string, b: string) => number): number | null {
  const best = new Map<string, number>([[start, 0]]);
  const pq: [number, string][] = [[0, start]];      // simple priority queue (array + sort)
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const u = pq.shift()![1];
    if (u === goal) return best.get(goal)!;          // ETA in minutes
    for (const v of graph.get(u) ?? []) {
      const t = best.get(u)! + travelTime(u, v, w, traffic);
      if (t < (best.get(v) ?? Infinity)) {
        best.set(v, t);
        pq.push([t + heuristic(v, goal), v]);        // heuristic = straight-line time to goal
      }
    }
  }
  return null;
}
// Real systems precompute contraction hierarchies so this runs in ~ms on huge graphs.`);

addTS('case-logging', `// Producer side: the agent forwards structured log lines to Kafka (async).
function agentForward(producer: any, rawLine: string, host: string, service: string) {
  const event = {
    ts: new Date().toISOString(), host, service,
    level: parseLevel(rawLine), msg: rawLine, traceId: extractTraceId(rawLine),
  };
  producer.send("logs", service, event);            // partition by service
}
// Consumer side: indexers pull from Kafka and route by age/importance.
function indexWorker(consumer: any, hotIndex: any, coldStore: any) {
  for (const event of consumer) {                   // Kafka buffers spikes for us
    enrich(event);                                  // add geo, deployment, etc.
    hotIndex.add(event);                            // inverted index: fast recent search
    coldStore.append(event.service, event);         // cheap archive (compressed)
  }
}
// A lifecycle job later rolls hot -> warm -> cold and applies TTL deletion.`);
