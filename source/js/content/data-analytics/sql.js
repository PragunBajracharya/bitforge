/* ===== Data analytics B: SQL ===== */
DAT('da-sql-select', { name: 'SELECT, WHERE & ORDER BY', cat: 'dasql',
  blurb: `SQL (Structured Query Language) asks a database for exactly the rows and columns you want. Every query is built from the same clauses, and knowing the order the database evaluates them in explains most beginner errors.`,
  facts: [['Read data', 'SELECT … FROM'], ['Filter rows', 'WHERE'], ['Sort', 'ORDER BY'], ['Missing values', 'IS NULL, never = NULL']],
  dg: { w: 960, h: 200,
    n: [['f', 'FROM / JOIN', 70, 100, 'db', 'pick tables'], ['w', 'WHERE', 210, 100, 'box', 'filter rows'], ['g', 'GROUP BY', 350, 100, 'box', 'make groups'], ['h', 'HAVING', 490, 100, 'box', 'filter groups'], ['s', 'SELECT', 630, 100, 'box', 'compute columns'], ['o', 'ORDER BY', 775, 100, 'box', 'sort'], ['l', 'LIMIT', 895, 100, 'box']],
    e: [['f', 'w'], ['w', 'g'], ['g', 'h'], ['h', 's'], ['s', 'o'], ['o', 'l']] },
  cap: `The logical order of evaluation: not the order you write the clauses. It is why a column alias defined in SELECT can’t be used in WHERE, but can be used in ORDER BY.`,
  walk: [[['f'], `<b>FROM</b> (and JOINs) first: decide which tables and rows exist to work with.`], [['w', 'f>w'], `<b>WHERE</b> keeps only rows matching the condition. Aggregates like SUM aren’t available yet, because groups don’t exist.`], [['g', 'h', 'w>g', 'g>h'], `<b>GROUP BY</b> collapses rows into groups; <b>HAVING</b> filters those groups (e.g. HAVING SUM(amount) &gt; 1000).`], [['s', 'h>s'], `<b>SELECT</b> computes the output columns and aliases. Only now does an alias like total_sales exist.`], [['o', 'l', 's>o', 'o>l'], `<b>ORDER BY</b> sorts (aliases allowed here), and <b>LIMIT</b> returns the first n rows.`]],
  sections: [
    ['The basic query', PP(`<code>SELECT columns FROM table WHERE condition ORDER BY column LIMIT n;</code> Keywords aren’t case sensitive; end statements with a semicolon. Use <code>SELECT *</code> only to explore; list columns explicitly in real queries so they are faster and don’t break when tables change.`)],
    ['Filtering with WHERE', TBL(['Operator', 'Example'], [['=, <>, <, >, <=, >=', "status = 'completed'"], ['AND, OR, NOT (use parentheses)', "region = 'West' AND (amount > 100 OR status = 'vip')"], ['IN', "region IN ('West', 'North')"], ['BETWEEN (inclusive)', "amount BETWEEN 50 AND 100"], ['LIKE (% any, _ one char)', "name LIKE 'A%'"], ['IS NULL / IS NOT NULL', 'email IS NULL'], ['Dates', "order_date >= '2026-01-01' AND order_date < '2026-02-01'"]])],
    ['NULL: the missing value', UL([`NULL means unknown or missing. Any comparison with NULL (even NULL = NULL) is unknown, so <code>WHERE email = NULL</code> returns nothing: use <code>IS NULL</code>.`, `Arithmetic with NULL gives NULL; aggregates (SUM, AVG, COUNT(col)) skip NULLs; COUNT(*) counts all rows.`, `<code>COALESCE(discount, 0)</code> replaces NULL with a default.`, `<code>NOT IN</code> with a NULL in the list returns no rows: prefer NOT EXISTS.`])],
    ['Expressions and aliases', PP(`SELECT can compute: <code>amount * 1.08 AS amount_with_tax</code>, <code>UPPER(name)</code>, <code>CASE WHEN amount &gt;= 100 THEN 'large' ELSE 'small' END AS size</code>. DISTINCT removes duplicate rows: <code>SELECT DISTINCT region FROM customers</code>.`)],
    ['Dialects', PP(`The core is standard across PostgreSQL, MySQL, SQL Server, SQLite, BigQuery and Snowflake, but details differ: LIMIT 10 vs SQL Server’s TOP 10, string concatenation with || vs CONCAT or +, and date functions. The playground in this track runs SQLite; the topics note differences where they matter.`)]
  ],
  snips: [
    ['SQL', 'sql', `-- Ten largest completed orders in 2026
SELECT order_id, customer_id, order_date, amount
FROM orders
WHERE status = 'completed'
  AND order_date >= '2026-01-01'
ORDER BY amount DESC
LIMIT 10;

-- Customers in two regions without an email on file
SELECT customer_id, name, region
FROM customers
WHERE region IN ('West', 'North')
  AND email IS NULL;

-- Computed column with CASE
SELECT order_id, amount,
       CASE WHEN amount >= 100 THEN 'large'
            WHEN amount >= 50  THEN 'medium'
            ELSE 'small' END AS size
FROM orders;`],
    ['pandas', 'python', `top = (orders[(orders.status == "completed") & (orders.order_date >= "2026-01-01")]
       .sort_values("amount", ascending=False)
       .head(10)[["order_id", "customer_id", "order_date", "amount"]])

customers[customers.region.isin(["West", "North"]) & customers.email.isna()]`],
    ['Excel', '', `' Same filter in Excel 365:
=TAKE(SORT(FILTER(Orders, (Orders[status]="completed") * (Orders[order_date]>=DATE(2026,1,1))), 4, -1), 10)
' (column 4 = amount, -1 = descending)`]
  ],
  ex: [
    [`List the <code>name</code>, <code>category</code> and <code>price</code> of all <b>Footwear</b> products, most expensive first.`, `SELECT name, category, price
FROM products
WHERE category = 'Footwear'
ORDER BY price DESC;`, 'sql'],
    [`Use <code>IN</code> to list the 10 most recent orders whose status is <b>cancelled or refunded</b>.`, `SELECT order_id, order_date, status, amount
FROM orders
WHERE status IN ('cancelled', 'refunded')
ORDER BY order_date DESC
LIMIT 10;`, 'sql'],
    [`Find customers in the <b>West or East</b> region who have <b>no email</b> on file.`, `SELECT customer_id, name, region
FROM customers
WHERE region IN ('West', 'East')
  AND email IS NULL;`, 'sql', `Remember <code>email = NULL</code> never matches — use <code>IS NULL</code>.`],
    [`Use <code>BETWEEN</code> to list completed orders with an amount between 100 and 200 (inclusive), cheapest first.`, `SELECT order_id, amount
FROM orders
WHERE status = 'completed'
  AND amount BETWEEN 100 AND 200
ORDER BY amount;`, 'sql'],
    [`Add a computed <code>size</code> column with <code>CASE</code> ("large" if amount &ge; 150, "medium" if &ge; 60, else "small") and show the 15 biggest orders.`, `SELECT order_id, amount,
       CASE WHEN amount >= 150 THEN 'large'
            WHEN amount >= 60  THEN 'medium'
            ELSE 'small' END AS size
FROM orders
ORDER BY amount DESC
LIMIT 15;`, 'sql'],
  ],
  qs: [SQ('Why does WHERE total > 100 fail when total is a SELECT alias for SUM(amount)?', ['Aliases must be uppercase', 'WHERE runs before SELECT and GROUP BY, so neither the alias nor the aggregate exists yet; use HAVING', 'SUM is not allowed in SQL', 'You need ORDER BY first'], 1, 'Filter groups with HAVING; WHERE filters individual rows.'),
    SQ('Which condition finds rows with no email?', ["email = NULL", "email IS NULL", "email = ''", "NOT email"], 1, 'Comparisons with NULL are unknown; IS NULL tests for it.')]
});

DAT('da-sql-agg', { name: 'Aggregation: GROUP BY & HAVING', cat: 'dasql',
  blurb: `Aggregate functions collapse many rows into summary numbers; GROUP BY computes them per group. This is SQL’s version of a PivotTable, and the most common thing analysts write.`,
  facts: [['Functions', 'COUNT, SUM, AVG, MIN, MAX'], ['Per group', 'GROUP BY'], ['Filter groups', 'HAVING'], ['Unique counts', 'COUNT(DISTINCT col)']],
  sections: [
    ['Aggregates', TBL(['Function', 'Returns', 'Note'], [['COUNT(*)', 'Number of rows', 'Includes NULLs'], ['COUNT(col)', 'Non-NULL values', ''], ['COUNT(DISTINCT col)', 'Unique non-NULL values', 'e.g. unique customers'], ['SUM(col), AVG(col)', 'Total, mean', 'Skip NULLs; AVG of integers may truncate in some databases: cast to decimal'], ['MIN, MAX', 'Smallest, largest', 'Also works on dates and text']])],
    ['The GROUP BY rule', PP(`Every column in SELECT must either be in GROUP BY or be inside an aggregate. <code>SELECT region, SUM(amount) FROM orders GROUP BY region</code> is valid; adding customer_id to SELECT without grouping by it is an error (or, in MySQL’s loose mode, a random value). Group by several columns for a cross-tab: <code>GROUP BY region, strftime('%Y-%m', order_date)</code>.`)],
    ['HAVING vs WHERE', PP(`WHERE filters rows before grouping; HAVING filters groups after aggregation. Put every condition you can in WHERE (faster), and only aggregate conditions in HAVING: <code>WHERE status = 'completed' … HAVING COUNT(*) &gt;= 5</code>.`)],
    ['Conditional aggregation', PP(`Count or sum only some rows inside one query with CASE: <code>SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled</code>. This turns long data into a wide summary in one pass, like a PivotTable with columns, and makes ratios easy: cancellation rate = cancelled ÷ total. PostgreSQL also supports <code>COUNT(*) FILTER (WHERE …)</code>.`)],
    ['Pitfalls', UL([`Joining before aggregating can duplicate rows (one order joined to many items) and inflate SUMs. Aggregate at the right grain first.`, `Ratios of averages vs averages of ratios: compute rates from summed numerators and denominators.`, `Integer division: 3/4 = 0 in many databases. Use 3.0/4 or CAST.`])]
  ],
  snips: [
    ['SQL', 'sql', `-- Revenue, orders and average order value by region
SELECT c.region,
       COUNT(*)                      AS orders,
       COUNT(DISTINCT o.customer_id) AS customers,
       SUM(o.amount)                 AS revenue,
       ROUND(AVG(o.amount), 2)       AS avg_order_value
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
WHERE o.status = 'completed'
GROUP BY c.region
HAVING SUM(o.amount) > 1000
ORDER BY revenue DESC;

-- Conditional aggregation: cancellation rate per month
SELECT strftime('%Y-%m', order_date) AS month,      -- SQLite; PostgreSQL: to_char(order_date, 'YYYY-MM')
       COUNT(*) AS orders,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
       ROUND(100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS cancel_pct
FROM orders
GROUP BY month
ORDER BY month;`],
    ['pandas', 'python', `summary = (orders[orders.status == "completed"]
           .merge(customers, on="customer_id")
           .groupby("region")
           .agg(orders=("order_id", "count"),
                customers=("customer_id", "nunique"),
                revenue=("amount", "sum"),
                avg_order_value=("amount", "mean"))
           .query("revenue > 1000")
           .sort_values("revenue", ascending=False))`],
    ['Power BI (DAX)', '', `Revenue   = SUM ( orders[amount] )
Orders    = COUNTROWS ( orders )
Customers = DISTINCTCOUNT ( orders[customer_id] )
AOV       = DIVIDE ( [Revenue], [Orders] )
-- Put region on rows of a matrix: grouping happens automatically.`]
  ],
  ex: [
    [`Count how many <b>products</b> are in each category, most first.`, `SELECT category, COUNT(*) AS products
FROM products
GROUP BY category
ORDER BY products DESC;`, 'sql'],
    [`For each order <b>status</b>, show the number of orders and total revenue.`, `SELECT status, COUNT(*) AS orders, ROUND(SUM(amount), 2) AS revenue
FROM orders
GROUP BY status
ORDER BY orders DESC;`, 'sql'],
    [`Show the average order value and order count per <b>region</b> (completed orders only).`, `SELECT c.region, ROUND(AVG(o.amount), 2) AS aov, COUNT(*) AS orders
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
WHERE o.status = 'completed'
GROUP BY c.region
ORDER BY aov DESC;`, 'sql'],
    [`Use <code>HAVING</code> to list customers with <b>5 or more</b> completed orders.`, `SELECT customer_id, COUNT(*) AS orders
FROM orders
WHERE status = 'completed'
GROUP BY customer_id
HAVING COUNT(*) >= 5
ORDER BY orders DESC;`, 'sql', `Conditions on an aggregate go in <code>HAVING</code>; row conditions stay in <code>WHERE</code>.`],
    [`With conditional aggregation, show per region the completed count, cancelled count and cancellation rate (%).`, `SELECT c.region,
       SUM(CASE WHEN o.status = 'completed' THEN 1 ELSE 0 END) AS completed,
       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS cancel_pct
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
GROUP BY c.region
ORDER BY c.region;`, 'sql'],
  ],
  qs: [SQ('Which query returns customers with at least 3 orders?', ['SELECT customer_id FROM orders WHERE COUNT(*) >= 3 GROUP BY customer_id', 'SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 3', 'SELECT customer_id, COUNT(*) >= 3 FROM orders', 'SELECT DISTINCT customer_id FROM orders LIMIT 3'], 1, 'Conditions on aggregates go in HAVING.')]
});

DAT('da-sql-joins', { name: 'Joins', cat: 'dasql',
  blurb: `Joins combine rows from two tables using a key. INNER keeps matches only; LEFT keeps every row from the left table, filling NULLs where there is no match. Choosing the wrong join, or joining on a non-unique key, is the most common source of wrong numbers.`,
  facts: [['INNER', 'Matches only'], ['LEFT', 'All left rows'], ['Anti-join', 'LEFT … WHERE right IS NULL'], ['Danger', 'Many-to-many fan-out']],
  dg: { w: 820, h: 270,
    n: [['c', 'customers', 110, 135, 'db', '1 row per customer'], ['o', 'orders', 410, 135, 'db', 'many per customer'], ['i', 'order_items', 700, 60, 'db', 'many per order'], ['p', 'products', 700, 210, 'db', '1 row per product']],
    e: [['c', 'o', 'customer_id (1 : many)'], ['o', 'i', 'order_id (1 : many)'], ['i', 'p', 'product_id', 'b']] },
  cap: `The sample schema and its relationships. Joining along 1-to-many keys multiplies rows: one customer row becomes one row per order, and each order becomes one row per item.`,
  walk: [[['c', 'o', 'c>o'], `customers INNER JOIN orders ON customer_id returns one row per order, with the customer’s columns repeated. Customers with no orders disappear.`], [['c', 'o'], `customers LEFT JOIN orders keeps every customer; those without orders get NULLs in the order columns. Add WHERE o.order_id IS NULL to find customers who never ordered (an anti-join).`], [['o', 'i', 'o>i'], `Joining orders to order_items multiplies each order by its number of items. SUM(orders.amount) after this join counts each order several times: aggregate items first, or sum at item level.`], [['i', 'p', 'i>p'], `order_items JOIN products adds category and price to each line. This is a many-to-one join, so it doesn’t multiply rows.`]],
  sections: [
    ['Join types', TBL(['Join', 'Returns', 'Use for'], [['INNER JOIN', 'Rows with a match in both tables', 'Orders with their customer details'], ['LEFT (OUTER) JOIN', 'All rows from the left, matches or NULLs from the right', 'All customers and their orders, including none'], ['RIGHT JOIN', 'Mirror of LEFT', 'Rarely used; swap the table order instead'], ['FULL OUTER JOIN', 'All rows from both sides', 'Reconciling two lists'], ['CROSS JOIN', 'Every combination', 'Building a calendar × product grid'], ['Self join', 'A table joined to itself', 'Employees and their managers; pairs of events']])],
    ['Writing joins well', UL([`Always use table aliases and qualify columns: <code>o.amount</code>, <code>c.region</code>.`, `Join on keys, with the ON clause, not in WHERE.`, `Know the cardinality (1:1, 1:many, many:many) before joining; check with <code>SELECT key, COUNT(*) … GROUP BY key HAVING COUNT(*) &gt; 1</code>.`, `Compare row counts before and after each join.`, `Conditions on the right table of a LEFT JOIN belong in ON, not WHERE; in WHERE they silently turn it into an INNER JOIN.`])],
    ['Anti-joins and semi-joins', PP(`Find customers who never ordered: <code>LEFT JOIN orders o … WHERE o.order_id IS NULL</code>, or <code>WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)</code>. Find customers who have ordered at least once without duplicating rows: <code>WHERE EXISTS (…)</code> (a semi-join).`)],
    ['Joins in other tools', TBL(['Tool', 'Equivalent'], [['Excel', 'XLOOKUP (left join of one column at a time)'], ['Power Query', 'Merge Queries (choose Left Outer, Inner, Left Anti…)'], ['Power BI / Tableau', 'Relationships between tables in the model (filters flow along them)'], ['pandas', 'df.merge(other, on="key", how="left")']])]
  ],
  snips: [
    ['SQL', 'sql', `-- Revenue by product category (item-level grain, no double counting)
SELECT p.category,
       SUM(oi.quantity * p.price) AS revenue
FROM order_items oi
JOIN products p ON p.product_id = oi.product_id
JOIN orders   o ON o.order_id   = oi.order_id
WHERE o.status = 'completed'
GROUP BY p.category
ORDER BY revenue DESC;

-- Every customer with their number of orders (including zero)
SELECT c.customer_id, c.name, COUNT(o.order_id) AS orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.name;

-- Customers who never ordered (anti-join)
SELECT c.customer_id, c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;`],
    ['pandas', 'python', `items = order_items.merge(products, on="product_id").merge(orders, on="order_id")
by_cat = (items[items.status == "completed"]
          .assign(revenue=lambda d: d.quantity * d.price)
          .groupby("category")["revenue"].sum()
          .sort_values(ascending=False))

never = customers.merge(orders, on="customer_id", how="left", indicator=True)
never = never[never["_merge"] == "left_only"]`],
    ['Power Query (M)', '', `= Table.NestedJoin(Orders, {"customer_id"}, Customers, {"customer_id"}, "Customer", JoinKind.LeftOuter)
// then expand the Customer column to pick region, name…
// JoinKind.LeftAnti keeps orders with no matching customer`]
  ],
  ex: [
    [`Use an <code>INNER JOIN</code> to show the 10 largest completed orders with the customer's name and region.`, `SELECT o.order_id, c.name, c.region, o.amount
FROM orders o
INNER JOIN customers c ON c.customer_id = o.customer_id
WHERE o.status = 'completed'
ORDER BY o.amount DESC
LIMIT 10;`, 'sql'],
    [`Compute revenue and units per product <b>category</b> at the item grain (order_items &rarr; products &rarr; orders), completed only.`, `SELECT p.category,
       ROUND(SUM(oi.quantity * p.price), 2) AS revenue,
       SUM(oi.quantity) AS units
FROM order_items oi
JOIN products p ON p.product_id = oi.product_id
JOIN orders   o ON o.order_id   = oi.order_id
WHERE o.status = 'completed'
GROUP BY p.category
ORDER BY revenue DESC;`, 'sql', `Summing at the item grain avoids the fan-out double-counting of <code>SUM(orders.amount)</code>.`],
    [`Use a <code>LEFT JOIN</code> to list every customer with their order count — <b>including those with zero orders</b>.`, `SELECT c.customer_id, c.name, COUNT(o.order_id) AS orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.name
ORDER BY orders ASC
LIMIT 15;`, 'sql'],
    [`Find customers who have <b>never placed a completed order</b> (anti-join). Put the status condition in <code>ON</code>, not <code>WHERE</code>.`, `SELECT c.customer_id, c.name
FROM customers c
LEFT JOIN orders o
       ON o.customer_id = c.customer_id AND o.status = 'completed'
WHERE o.order_id IS NULL
ORDER BY c.customer_id;`, 'sql', `If <code>status = 'completed'</code> went in <code>WHERE</code>, the LEFT JOIN would collapse to an INNER JOIN and drop exactly the rows you want.`],
    [`Show units sold for <b>every</b> product, including any with zero sales, highest first.`, `SELECT p.product_id, p.name, COALESCE(SUM(oi.quantity), 0) AS units_sold
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.product_id
GROUP BY p.product_id, p.name
ORDER BY units_sold DESC;`, 'sql'],
  ],
  qs: [SQ('You LEFT JOIN customers to orders and add WHERE o.status = \'completed\'. What happens to customers without orders?', ['They stay with NULLs', 'They are removed: the WHERE condition on the right table makes it behave like an INNER JOIN', 'They get status completed', 'The query errors'], 1, 'Move the condition into the ON clause to keep unmatched customers.'),
    SQ('SUM(orders.amount) is too high after joining orders to order_items. Why?', ['Prices changed', 'Each order row is repeated once per item (fan-out)', 'NULLs were summed', 'The join was LEFT'], 1, 'Aggregate at the correct grain or sum item-level values instead.')]
});

DAT('da-sql-cte', { name: 'Subqueries, CTEs & set operations', cat: 'dasql',
  blurb: `Complex questions are answered in steps. Subqueries nest one query inside another; common table expressions (WITH … AS) name each step so the query reads top to bottom like a recipe. UNION stacks results.`,
  facts: [['CTE', 'WITH name AS (…)'], ['Scalar subquery', 'Returns one value'], ['EXISTS', 'Row-by-row test'], ['UNION ALL', 'Stack results']],
  sections: [
    ['Subqueries', TBL(['Kind', 'Example'], [['Scalar (one value)', 'WHERE amount > (SELECT AVG(amount) FROM orders)'], ['List (IN)', 'WHERE customer_id IN (SELECT customer_id FROM orders WHERE amount > 500)'], ['Correlated (per row)', 'WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)'], ['Derived table (FROM)', 'FROM (SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id) t']])],
    ['Common table expressions', PP(`<code>WITH step1 AS (…), step2 AS (SELECT … FROM step1) SELECT … FROM step2;</code> Each CTE is a named temporary result usable by later steps. CTEs make multi-step logic readable, testable (run each step alone) and reusable within the query. They are the analyst’s main tool for building metrics like retention or funnels.`)],
    ['Recursive CTEs', PP(`A CTE can reference itself to walk hierarchies (org charts, category trees) or generate series (every date in a range): an anchor query, UNION ALL, and a recursive part that stops when it returns no rows.`)],
    ['Set operations', TBL(['Operator', 'Result'], [['UNION ALL', 'All rows from both queries (fast; keeps duplicates)'], ['UNION', 'Distinct rows from both (removes duplicates; slower)'], ['INTERSECT', 'Rows in both'], ['EXCEPT (MINUS in Oracle)', 'Rows in the first but not the second']]) + PP(`Both queries must return the same number of columns with compatible types.`)],
    ['Views', PP(`A view saves a query under a name (<code>CREATE VIEW monthly_revenue AS …</code>) so analysts and BI tools reuse one agreed definition of a metric instead of each rewriting it.`)]
  ],
  snips: [
    ['SQL', 'sql', `-- Customers whose lifetime spend is above the average customer's spend
WITH customer_totals AS (
    SELECT customer_id, SUM(amount) AS total_spend, COUNT(*) AS orders
    FROM orders
    WHERE status = 'completed'
    GROUP BY customer_id
),
benchmark AS (
    SELECT AVG(total_spend) AS avg_spend FROM customer_totals
)
SELECT c.name, c.region, t.total_spend, t.orders
FROM customer_totals t
JOIN customers c ON c.customer_id = t.customer_id
CROSS JOIN benchmark b
WHERE t.total_spend > b.avg_spend
ORDER BY t.total_spend DESC;

-- Generate every month of 2026 (recursive CTE), e.g. to show months with zero sales
WITH RECURSIVE months(m) AS (
    SELECT date('2026-01-01')
    UNION ALL
    SELECT date(m, '+1 month') FROM months WHERE m < '2026-12-01'
)
SELECT m FROM months;`],
    ['pandas', 'python', `totals = (orders[orders.status == "completed"]
          .groupby("customer_id")
          .agg(total_spend=("amount", "sum"), orders=("order_id", "count")))
above = totals[totals.total_spend > totals.total_spend.mean()]
result = above.join(customers.set_index("customer_id")[["name", "region"]])`]
  ],
  ex: [
    [`With a <code>CTE</code>, find customers whose total completed spend is above the average customer's spend.`, `WITH spend AS (
  SELECT customer_id, SUM(amount) AS total
  FROM orders
  WHERE status = 'completed'
  GROUP BY customer_id
)
SELECT c.name, c.region, ROUND(s.total, 2) AS total
FROM spend s
JOIN customers c ON c.customer_id = s.customer_id
WHERE s.total > (SELECT AVG(total) FROM spend)
ORDER BY s.total DESC
LIMIT 15;`, 'sql'],
    [`Use a <b>scalar subquery</b> to list the 10 orders above the overall average order amount.`, `SELECT order_id, amount
FROM orders
WHERE amount > (SELECT AVG(amount) FROM orders)
ORDER BY amount DESC
LIMIT 10;`, 'sql'],
    [`Use <code>EXISTS</code> to list customers who have at least one <b>cancelled</b> order.`, `SELECT c.customer_id, c.name
FROM customers c
WHERE EXISTS (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.customer_id AND o.status = 'cancelled'
)
ORDER BY c.customer_id
LIMIT 15;`, 'sql'],
    [`Use an <code>IN</code> subquery to find customers who have ever ordered a <b>Tent</b>.`, `SELECT customer_id, name, region
FROM customers
WHERE customer_id IN (
  SELECT o.customer_id
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  JOIN products p ON p.product_id = oi.product_id
  WHERE p.name = 'Tent'
)
ORDER BY customer_id
LIMIT 15;`, 'sql'],
    [`Use <code>UNION ALL</code> for a two-row summary: completed orders vs everything else.`, `SELECT 'completed' AS bucket, COUNT(*) AS orders
FROM orders WHERE status = 'completed'
UNION ALL
SELECT 'not completed', COUNT(*)
FROM orders WHERE status <> 'completed';`, 'sql'],
  ],
  qs: [SQ('What is the main benefit of CTEs over deeply nested subqueries?', ['They are always faster', 'Readability: named steps that read top to bottom and can be checked one at a time', 'They store data permanently', 'They avoid joins'], 1, 'Performance is usually similar; clarity is the win.')]
});

DAT('da-sql-window', { name: 'Window functions', cat: 'dasql',
  blurb: `Window functions compute across a set of related rows without collapsing them: a running total, a rank within each region, the previous month’s value, a 7-day moving average. They are the most powerful SQL feature for analysts.`,
  facts: [['Syntax', 'f() OVER (PARTITION BY … ORDER BY …)'], ['Ranking', 'ROW_NUMBER, RANK, DENSE_RANK'], ['Offsets', 'LAG, LEAD'], ['Frames', 'ROWS BETWEEN …']],
  sections: [
    ['How they work', PP(`<code>SUM(amount) OVER (PARTITION BY region ORDER BY order_date)</code>: PARTITION BY splits rows into groups (like GROUP BY, but rows are kept); ORDER BY orders rows within each group; the function is computed for each row from its window. Without PARTITION BY, the whole result is one window. Window functions run after WHERE, GROUP BY and HAVING, so to filter on them (e.g. rank = 1) wrap the query in a CTE.`)],
    ['The functions', TBL(['Function', 'Returns', 'Typical use'], [['ROW_NUMBER()', '1, 2, 3… unique', 'Latest order per customer (rn = 1), deduplication'], ['RANK() / DENSE_RANK()', 'Ranks with ties (gaps / no gaps)', 'Top 3 products per category'], ['NTILE(n)', 'Bucket number 1..n', 'Quartiles, deciles of customers by spend'], ['LAG(col, k) / LEAD(col, k)', 'Value k rows before / after', 'Month-over-month change, time between orders'], ['SUM / AVG / COUNT OVER', 'Aggregate over the window', 'Running totals, moving averages, share of total'], ['FIRST_VALUE / LAST_VALUE', 'First / last value in the window', 'First product a customer bought']])],
    ['Frames', PP(`With ORDER BY, aggregates default to a frame from the start of the partition to the current row (a running total). Specify frames explicitly: <code>ROWS BETWEEN 6 PRECEDING AND CURRENT ROW</code> for a 7-row moving average, <code>ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING</code> for the whole partition. RANGE frames group ties together; ROWS counts physical rows.`)],
    ['Patterns to memorize', UL([`<b>Top N per group:</b> ROW_NUMBER() OVER (PARTITION BY group ORDER BY metric DESC), then filter rn &lt;= N.`, `<b>Deduplicate:</b> ROW_NUMBER() OVER (PARTITION BY natural_key ORDER BY updated_at DESC) = 1 keeps the latest version.`, `<b>Period-over-period:</b> revenue − LAG(revenue) OVER (ORDER BY month).`, `<b>Share of total:</b> revenue / SUM(revenue) OVER ().`, `<b>Running total:</b> SUM(revenue) OVER (ORDER BY month).`])]
  ],
  snips: [
    ['SQL', 'sql', `-- Monthly revenue with month-over-month growth, running total and 3-month moving average
WITH monthly AS (
    SELECT strftime('%Y-%m', order_date) AS month, SUM(amount) AS revenue
    FROM orders
    WHERE status = 'completed'
    GROUP BY month
)
SELECT month,
       revenue,
       revenue - LAG(revenue) OVER (ORDER BY month)                       AS change,
       ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
             / LAG(revenue) OVER (ORDER BY month), 1)                     AS growth_pct,
       SUM(revenue) OVER (ORDER BY month)                                 AS running_total,
       ROUND(AVG(revenue) OVER (ORDER BY month
             ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2)                AS moving_avg_3m
FROM monthly
ORDER BY month;

-- Each customer's largest order (top 1 per group)
WITH ranked AS (
    SELECT o.*, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC) AS rn
    FROM orders o
)
SELECT customer_id, order_id, amount FROM ranked WHERE rn = 1;`],
    ['pandas', 'python', `monthly = (orders[orders.status == "completed"]
           .assign(month=lambda d: d.order_date.str[:7])
           .groupby("month", as_index=False)["amount"].sum()
           .rename(columns={"amount": "revenue"}))
monthly["change"] = monthly.revenue.diff()
monthly["growth_pct"] = monthly.revenue.pct_change() * 100
monthly["running_total"] = monthly.revenue.cumsum()
monthly["moving_avg_3m"] = monthly.revenue.rolling(3, min_periods=1).mean()

largest = orders.sort_values("amount", ascending=False).groupby("customer_id").head(1)`],
    ['DAX', '', `Revenue PM  = CALCULATE ( [Revenue], DATEADD ( 'Date'[Date], -1, MONTH ) )
MoM %       = DIVIDE ( [Revenue] - [Revenue PM], [Revenue PM] )
Running Tot = CALCULATE ( [Revenue], FILTER ( ALL ( 'Date' ), 'Date'[Date] <= MAX ( 'Date'[Date] ) ) )
Rank Region = RANKX ( ALL ( customers[region] ), [Revenue] )`],
    ['Tableau', '', `// Table calculations (Compute Using: Month)
RUNNING_SUM(SUM([Amount]))
(ZN(SUM([Amount])) - LOOKUP(ZN(SUM([Amount])), -1)) / ABS(LOOKUP(ZN(SUM([Amount])), -1))
WINDOW_AVG(SUM([Amount]), -2, 0)       // 3-month moving average
RANK(SUM([Amount]))`]
  ],
  ex: [
    [`Build monthly completed revenue, then use <code>LAG</code> to add the month-over-month <b>change</b>.`, `WITH monthly AS (
  SELECT strftime('%Y-%m', order_date) AS month, SUM(amount) AS revenue
  FROM orders WHERE status = 'completed'
  GROUP BY month
)
SELECT month, ROUND(revenue, 2) AS revenue,
       ROUND(revenue - LAG(revenue) OVER (ORDER BY month), 2) AS change
FROM monthly
ORDER BY month;`, 'sql'],
    [`Use <code>ROW_NUMBER()</code> to find the <b>top 3 customers by spend within each region</b> (completed).`, `WITH ranked AS (
  SELECT c.region, c.name, SUM(o.amount) AS spend,
         ROW_NUMBER() OVER (PARTITION BY c.region ORDER BY SUM(o.amount) DESC) AS rn
  FROM orders o
  JOIN customers c ON c.customer_id = o.customer_id
  WHERE o.status = 'completed'
  GROUP BY c.region, c.customer_id
)
SELECT region, rn AS rank, name, ROUND(spend, 2) AS spend
FROM ranked WHERE rn <= 3
ORDER BY region, rn;`, 'sql'],
    [`Show each category's revenue and its <b>share of total</b> with <code>SUM(...) OVER ()</code>.`, `WITH cat AS (
  SELECT p.category AS category, SUM(oi.quantity * p.price) AS revenue
  FROM order_items oi
  JOIN products p ON p.product_id = oi.product_id
  JOIN orders o ON o.order_id = oi.order_id
  WHERE o.status = 'completed'
  GROUP BY p.category
)
SELECT category, ROUND(revenue, 2) AS revenue,
       ROUND(100.0 * revenue / SUM(revenue) OVER (), 1) AS pct_of_total
FROM cat
ORDER BY revenue DESC;`, 'sql'],
    [`Use a partitioned <code>ROW_NUMBER()</code> to return <b>each customer's single largest order</b>.`, `WITH ranked AS (
  SELECT customer_id, order_id, amount,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC) AS rn
  FROM orders
)
SELECT customer_id, order_id, ROUND(amount, 2) AS amount
FROM ranked WHERE rn = 1
ORDER BY amount DESC
LIMIT 10;`, 'sql'],
    [`Add a <b>running total</b> and a <b>3-month moving average</b> to monthly revenue with windowed aggregates.`, `WITH monthly AS (
  SELECT strftime('%Y-%m', order_date) AS month, SUM(amount) AS revenue
  FROM orders WHERE status = 'completed'
  GROUP BY month
)
SELECT month, ROUND(revenue, 2) AS revenue,
       ROUND(SUM(revenue) OVER (ORDER BY month), 2) AS running_total,
       ROUND(AVG(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS moving_avg_3m
FROM monthly
ORDER BY month;`, 'sql'],
  ],
  qs: [SQ('You need the top 3 products by revenue in each category. Which approach is correct?', ['GROUP BY category LIMIT 3', 'ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) in a CTE, then WHERE rn <= 3', 'ORDER BY revenue LIMIT 3', 'HAVING COUNT(*) <= 3'], 1, 'LIMIT applies to the whole result; a partitioned window ranks within each category.'),
    SQ('What is the difference between RANK and DENSE_RANK for values 100, 90, 90, 80?', ['None', 'RANK: 1,2,2,4; DENSE_RANK: 1,2,2,3', 'RANK: 1,2,3,4; DENSE_RANK: 1,2,2,3', 'RANK: 1,1,2,3'], 1, 'RANK leaves gaps after ties; DENSE_RANK doesn’t.')]
});

DAT('da-sql-analytics', { name: 'Analytics patterns: dates, funnels & cohorts', cat: 'dasql',
  blurb: `A handful of query patterns answer most business questions: trends by period, conversion funnels, cohort retention, and customer metrics. They combine date functions, CASE, CTEs and window functions.`,
  facts: [['Trends', 'Truncate dates to periods'], ['Funnels', 'Conditional counts per step'], ['Cohorts', 'Group by first activity date'], ['RFM', 'Recency, frequency, monetary']],
  sections: [
    ['Working with dates', TBL(['Task', 'PostgreSQL', 'SQLite', 'SQL Server'], [['Month bucket', "date_trunc('month', d)", "strftime('%Y-%m', d)", 'DATETRUNC(month, d)'], ['Add interval', "d + interval '7 days'", "date(d, '+7 days')", 'DATEADD(day, 7, d)'], ['Difference in days', 'd2 - d1', 'julianday(d2) - julianday(d1)', 'DATEDIFF(day, d1, d2)'], ['Extract part', 'EXTRACT(dow FROM d)', "strftime('%w', d)", 'DATEPART(weekday, d)']]) +
      PP(`Filter with half-open ranges (<code>d &gt;= '2026-03-01' AND d &lt; '2026-04-01'</code>) so timestamps on the last day are included. Watch time zones: store UTC, convert for reporting.`)],
    ['Funnels', PP(`A funnel counts how many users reach each step (visit → sign up → add to cart → purchase) and the conversion between steps. Use one row per user with flags for each step (MAX(CASE WHEN event = 'signup' THEN 1 END)), then sum the flags. Enforce order when it matters (purchase after signup) by comparing step timestamps.`)],
    ['Cohort retention', OL([`Assign each customer a cohort: the month of their first order.`, `For each later order, compute the months since the cohort month.`, `Count distinct active customers per cohort and month number.`, `Divide by the cohort size to get retention percentages; pivot into the classic triangle chart.`]) + PP(`Cohorts reveal whether newer customers behave better or worse than older ones, which overall averages hide.`)],
    ['Customer metrics', TBL(['Metric', 'Definition'], [['AOV', 'Revenue ÷ orders'], ['Purchase frequency', 'Orders ÷ customers in a period'], ['Repeat rate', 'Customers with 2+ orders ÷ customers'], ['Churn', 'Customers active last period but not this period ÷ active last period'], ['CLV (simple)', 'AOV × purchase frequency × expected lifetime (or margin-adjusted)'], ['RFM', 'Score customers on Recency, Frequency, Monetary value (NTILE) to segment them']])],
    ['Data quality checks to run every time', UL([`Row counts and sums against a trusted report.`, `Duplicates on the supposed key.`, `NULLs in key columns.`, `Date ranges (no orders in the future or before launch).`, `Status values: unexpected categories like “test”.`])]
  ],
  snips: [
    ['Cohorts', 'sql', `-- Monthly cohort retention (SQLite syntax)
WITH firsts AS (
    SELECT customer_id, MIN(order_date) AS first_date
    FROM orders WHERE status = 'completed'
    GROUP BY customer_id
),
activity AS (
    SELECT o.customer_id,
           strftime('%Y-%m', f.first_date) AS cohort,
           (CAST(strftime('%Y', o.order_date) AS INT) - CAST(strftime('%Y', f.first_date) AS INT)) * 12
         + (CAST(strftime('%m', o.order_date) AS INT) - CAST(strftime('%m', f.first_date) AS INT)) AS month_n
    FROM orders o JOIN firsts f ON f.customer_id = o.customer_id
    WHERE o.status = 'completed'
)
SELECT cohort, month_n,
       COUNT(DISTINCT customer_id) AS active,
       ROUND(100.0 * COUNT(DISTINCT customer_id) /
             FIRST_VALUE(COUNT(DISTINCT customer_id)) OVER (PARTITION BY cohort ORDER BY month_n), 1) AS retention_pct
FROM activity
GROUP BY cohort, month_n
ORDER BY cohort, month_n;`],
    ['Funnel', 'sql', `-- events(user_id, event, ts)
WITH steps AS (
    SELECT user_id,
           MAX(CASE WHEN event = 'visit'       THEN 1 ELSE 0 END) AS visited,
           MAX(CASE WHEN event = 'signup'      THEN 1 ELSE 0 END) AS signed_up,
           MAX(CASE WHEN event = 'add_to_cart' THEN 1 ELSE 0 END) AS carted,
           MAX(CASE WHEN event = 'purchase'    THEN 1 ELSE 0 END) AS purchased
    FROM events
    GROUP BY user_id
)
SELECT SUM(visited) AS visits, SUM(signed_up) AS signups, SUM(carted) AS carts, SUM(purchased) AS purchases,
       ROUND(100.0 * SUM(purchased) / SUM(visited), 2) AS overall_conversion_pct
FROM steps;`],
    ['RFM', 'sql', `WITH c AS (
    SELECT customer_id,
           julianday('2026-10-01') - julianday(MAX(order_date)) AS recency_days,
           COUNT(*)    AS frequency,
           SUM(amount) AS monetary
    FROM orders WHERE status = 'completed'
    GROUP BY customer_id
)
SELECT customer_id, recency_days, frequency, monetary,
       NTILE(4) OVER (ORDER BY recency_days DESC) AS r_score,   -- 4 = most recent
       NTILE(4) OVER (ORDER BY frequency)         AS f_score,
       NTILE(4) OVER (ORDER BY monetary)          AS m_score
FROM c;`]
  ],
  ex: [
    [`Produce a monthly <b>trend</b>: orders and revenue per month (completed only).`, `SELECT strftime('%Y-%m', order_date) AS month,
       COUNT(*) AS orders,
       ROUND(SUM(amount), 2) AS revenue
FROM orders
WHERE status = 'completed'
GROUP BY month
ORDER BY month;`, 'sql'],
    [`Build <b>acquisition cohorts</b>: how many customers placed their first completed order in each month.`, `WITH firsts AS (
  SELECT customer_id, MIN(order_date) AS first_date
  FROM orders WHERE status = 'completed'
  GROUP BY customer_id
)
SELECT strftime('%Y-%m', first_date) AS cohort, COUNT(*) AS new_customers
FROM firsts
GROUP BY cohort
ORDER BY cohort;`, 'sql'],
    [`Compute the <b>repeat-purchase rate</b>: the % of customers with 2+ completed orders.`, `SELECT ROUND(100.0 * SUM(CASE WHEN orders >= 2 THEN 1 ELSE 0 END) / COUNT(*), 1) AS repeat_rate_pct
FROM (
  SELECT customer_id, COUNT(*) AS orders
  FROM orders WHERE status = 'completed'
  GROUP BY customer_id
);`, 'sql'],
    [`Build the raw <b>RFM</b> inputs per customer — frequency, monetary, and last order date — top 10 by spend.`, `SELECT customer_id,
       COUNT(*) AS frequency,
       ROUND(SUM(amount), 2) AS monetary,
       MAX(order_date) AS last_order
FROM orders
WHERE status = 'completed'
GROUP BY customer_id
ORDER BY monetary DESC
LIMIT 10;`, 'sql'],
    [`Run a <b>data-quality check</b>: count rows with a null/negative amount, missing customer, or an unexpected status.`, `SELECT COUNT(*) AS bad_rows
FROM orders
WHERE amount IS NULL OR amount <= 0
   OR customer_id IS NULL
   OR status NOT IN ('completed', 'cancelled', 'refunded');`, 'sql', `A clean result is 0 — but on real data this routinely surfaces test rows, typos and bad keys.`],
  ],
  qs: [SQ('Why filter a month with order_date >= \'2026-03-01\' AND order_date < \'2026-04-01\' rather than BETWEEN \'2026-03-01\' AND \'2026-03-31\'?', ['It is shorter', 'Timestamps during March 31 (after midnight) would be excluded by BETWEEN', 'BETWEEN is not standard', 'It is required for indexes'], 1, 'Half-open ranges include every moment of the last day.')]
});

DAT('da-sql-model', { name: 'Data modeling & star schemas', cat: 'dasql',
  blurb: `How tables are organized determines how easy analysis is. Operational databases are normalized to avoid duplication; analytical models use star schemas: a central fact table of events surrounded by dimension tables that describe them. Power BI and Tableau work best on star schemas.`,
  facts: [['Fact table', 'Events + numbers'], ['Dimension', 'Descriptive attributes'], ['Grain', 'Define it first'], ['History', 'Slowly changing dimensions']],
  dg: { w: 860, h: 340,
    n: [['f', 'fact_sales', 410, 170, 'db', 'keys · quantity · revenue'], ['d', 'dim_date', 410, 40, 'db', 'date, month, quarter, year'], ['c', 'dim_customer', 110, 170, 'db', 'name, region, segment'], ['p', 'dim_product', 740, 170, 'db', 'name, category, brand'], ['s', 'dim_store', 410, 300, 'db', 'city, channel']],
    e: [['d', 'f', '1 : many'], ['c', 'f', '1 : many'], ['p', 'f', '1 : many'], ['s', 'f', '1 : many']] },
  cap: `A star schema: one fact table at the chosen grain (one row per product per order) joined to dimensions. Filters flow from dimensions to facts; measures aggregate the fact columns.`,
  walk: [[['f'], `Choose the grain first: here, one row per product sold in an order. The fact table holds foreign keys and additive numbers (quantity, revenue).`], [['d', 'd>f'], `The date dimension has one row per day with month, quarter, year, weekday and holiday flags, so every report can slice by any calendar attribute without date functions.`], [['c', 'p', 'c>f', 'p>f'], `Customer and product dimensions describe who bought and what was bought. They are short and wide; facts are long and narrow.`], [['s', 's>f'], `Questions like “revenue by region, category and quarter” become simple joins from the fact to three dimensions, and BI tools turn those joins into click-to-filter relationships.`]],
  sections: [
    ['Normalized vs dimensional', TBL(['', 'Normalized (OLTP)', 'Star schema (OLAP)'], [['Purpose', 'Record transactions correctly', 'Analyze them easily and fast'], ['Duplication', 'Minimal (3rd normal form)', 'Dimensions are denormalized (category name repeated per product)'], ['Queries', 'Many joins', 'Few, predictable joins'], ['Where', 'Application databases', 'Data warehouses, Power BI and Tableau models']])],
    ['Fact and dimension tables', UL([`<b>Fact tables</b> record events or measurements: sales, clicks, shipments. Columns: keys to dimensions plus numeric measures. Measures should be additive where possible (quantity, revenue); ratios are computed in measures, not stored.`, `<b>Dimension tables</b> describe the who, what, where, when: customers, products, stores, dates. They have one row per entity and a surrogate key.`, `<b>Date dimension:</b> always build one; every BI tool’s time intelligence depends on it.`, `<b>Snowflake schema:</b> dimensions split into sub-dimensions (product → category). Saves space, costs joins; usually flatten for BI.`])],
    ['Slowly changing dimensions', TBL(['Type', 'Handling a change (customer moves region)', 'Effect'], [['Type 1', 'Overwrite the old value', 'History is restated to the new region'], ['Type 2', 'Add a new row with valid_from / valid_to dates', 'Past sales stay with the old region'], ['Type 3', 'Keep a previous_region column', 'Limited history']])],
    ['The modern data stack', PP(`Data is extracted from source systems, loaded into a cloud warehouse (Snowflake, BigQuery, Redshift, Databricks), and transformed with SQL into clean star schemas (often with dbt, which version-controls and tests SQL models). BI tools then connect to those models. Analysts increasingly own this transformation layer (“analytics engineering”).`)]
  ],
  ex: [
    [`In the shop schema, identify the <b>fact</b> table at the line-item grain and the <b>dimension</b> tables around it.`, '', '', `<code>order_items</code> is the fact at the order-line grain (the measurable events: quantity, and price &times; quantity = revenue). <code>products</code> and <code>customers</code> are dimensions (descriptive attributes you slice by). <code>orders</code> is the order header — part dimension (date, status), part fact (one row per order).`],
    [`State the <b>grain</b> of each of the four tables in one line each.`, '', '', `customers = one row per customer; products = one row per product; orders = one row per order; order_items = one row per product within an order. Defining the grain first is what prevents double-counting on joins.`],
    [`Sketch a <b>star schema</b> for sales reporting: name the fact table, its measures and keys, and the dimensions.`, '', '', `<code>fact_sales</code> at the order-line grain, foreign keys date_key / product_key / customer_key, measures quantity and amount; surrounded by <code>dim_date</code>, <code>dim_product</code> (name, category, price) and <code>dim_customer</code> (name, region). One central fact, denormalized dimensions radiating out.`],
    [`Explain why <code>SUM(orders.amount)</code> after joining <code>orders</code> to <code>order_items</code> over-counts revenue — and the fix.`, '', '', `The 1-to-many join repeats each order row once per line item (fan-out), so the order amount is summed several times. Fix: aggregate at the right grain — sum <code>order_items.quantity &times; products.price</code> at the item level, or aggregate items first in a CTE before joining the header.`],
    [`A customer can change region over time. Which <b>slowly changing dimension</b> type preserves that history, and how?`, '', '', `SCD Type 2: rather than overwriting the region, add a new dimension row with effective-from / effective-to dates (and a current flag), so each fact joins to the region that was true at the time. Type 1 overwrites and loses the history.`],
  ],
  qs: [SQ('In a star schema, where does “product category” belong?', ['In the fact table as a measure', 'In the product dimension', 'In the date dimension', 'In a separate fact table'], 1, 'Descriptive attributes live in dimensions; facts hold keys and measures.')]
});
