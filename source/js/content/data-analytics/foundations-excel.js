/* ===== Data analytics A: foundations, statistics, Excel ===== */
SD_CATS.push(['dafound', 'Foundations & statistics'], ['daexcel', 'Excel'], ['dasql', 'SQL'], ['dapbi', 'Power BI'], ['datab', 'Tableau'], ['dapy', 'Python'], ['dacomm', 'Visualization & communication'], ['dacase', 'Case studies']);

DAT('da-what', { name: 'What data analysts do', cat: 'dafound',
  blurb: `Data analysts turn raw data into answers people can act on. The work follows a repeatable cycle: ask a clear question, get and clean the data, analyze it, visualize it, and communicate a recommendation. Tools change; the cycle doesn’t.`,
  facts: [['Core tools', 'Excel, SQL, BI, Python'], ['Most time spent', 'Cleaning & preparing'], ['Output', 'Decisions, not charts'], ['Career path', 'Analyst → senior → analytics/data science']],
  dg: { w: 860, h: 250,
    n: [['ask', 'Ask', 80, 120, 'user', 'define the question'], ['get', 'Collect', 240, 120, 'db', 'SQL, files, APIs'], ['clean', 'Clean', 400, 120, 'worker', 'fix, join, shape'], ['an', 'Analyze', 560, 120, 'box', 'stats, pivots'], ['viz', 'Visualize', 710, 50, 'box', 'charts, dashboards'], ['act', 'Communicate', 710, 200, 'client', 'recommend']],
    e: [['ask', 'get'], ['get', 'clean'], ['clean', 'an'], ['an', 'viz'], ['viz', 'act'], ['act', 'ask', 'new questions', 'dN']] },
  cap: `The analytics cycle. Every project loops through it, and good answers usually raise the next question.`,
  walk: [[['ask'], `<b>Ask:</b> turn a vague request (“why are sales down?”) into a measurable question (“which regions and products drove the 8% drop in Q3 revenue versus Q2?”). Agree on the metric definitions and the decision the answer will inform.`],
    [['get', 'ask>get'], `<b>Collect:</b> find the data: query the database with SQL, export from a system, pull an API, or open a spreadsheet. Note where it comes from and how fresh it is.`],
    [['clean', 'get>clean'], `<b>Clean and prepare:</b> fix types, remove duplicates, handle missing values, join tables, reshape. This is often 50–80% of the time and where most errors hide.`],
    [['an', 'clean>an'], `<b>Analyze:</b> aggregate, compare segments, look at trends and distributions, test hypotheses. Check results against known totals.`],
    [['viz', 'act', 'an>viz', 'viz>act'], `<b>Visualize and communicate:</b> pick the chart that answers the question, then lead with the insight and the recommendation, not the method.`]],
  sections: [
    ['The four kinds of analytics', TBL(['Type', 'Question', 'Example', 'Typical tools'], [['Descriptive', 'What happened?', 'Revenue by month and region', 'Excel, SQL, Power BI, Tableau'], ['Diagnostic', 'Why did it happen?', 'Drop concentrated in one product line after a price change', 'Drill-downs, segmentation, cohort analysis'], ['Predictive', 'What will happen?', 'Forecast next quarter’s demand', 'Regression, time-series models, Python'], ['Prescriptive', 'What should we do?', 'Which customers to target with a discount', 'Optimization, experiments (A/B tests)']]) + PP(`Most analyst work is descriptive and diagnostic; predictive and prescriptive work overlaps with data science.`)],
    ['The toolkit and when to use each', TBL(['Tool', 'Best for', 'Limits'], [['Excel / Google Sheets', 'Quick analysis, small data (up to ~1M rows), ad-hoc models, sharing with business users', 'Manual steps are error-prone and hard to repeat'], ['SQL', 'Getting and aggregating data from databases of any size; the most requested analyst skill', 'Not for charts or presentation'], ['Power BI', 'Interactive dashboards and self-service reporting in Microsoft environments', 'DAX has a learning curve; licensing'], ['Tableau', 'Exploratory visual analysis and polished dashboards', 'Cost; calculations differ from Excel and DAX'], ['Python (pandas)', 'Repeatable cleaning, large files, statistics, automation, machine learning', 'Requires coding'], ['Statistics', 'Knowing whether a difference is real', 'Needs careful assumptions']])],
    ['Skills that separate good analysts', UL([`<b>Asking the right question</b> before touching data.`, `<b>Knowing the data:</b> what one row represents (its grain), where it comes from, and its quirks.`, `<b>Sanity checks:</b> totals that match the source system, row counts before and after joins.`, `<b>Clear metric definitions:</b> “active user”, “revenue” and “churn” mean different things to different teams.`, `<b>Communication:</b> one clear chart and one sentence beat a 20-chart dashboard.`])],
    ['How this track is organized', UL([`<b>Level 1:</b> data foundations and statistics.`, `<b>Level 2:</b> Excel, from formulas to PivotTables and Power Query.`, `<b>Level 3:</b> SQL, from SELECT to window functions and data modeling.`, `<b>Level 4:</b> Power BI and Tableau dashboards.`, `<b>Level 5:</b> Python, experiments, storytelling and three end-to-end projects.`])]
  ],
  qs: [SQ('“Why did conversions drop last week?” is which kind of analytics?', ['Descriptive', 'Diagnostic', 'Predictive', 'Prescriptive'], 1, 'It asks for the cause of something that already happened.')]
});

DAT('da-data', { name: 'Data types, tables & tidy data', cat: 'dafound',
  blurb: `Before analyzing anything, know what a row means. Tidy data has one row per observation and one column per variable, with consistent types. Most cleaning work is turning messy data into this shape.`,
  facts: [['Row', 'One observation'], ['Column', 'One variable'], ['Grain', 'What one row represents'], ['Keys', 'Uniquely identify rows']],
  sections: [
    ['Kinds of data', TBL(['Type', 'Examples', 'What you can do'], [['Numeric: continuous', 'Revenue, temperature, time on page', 'Sum, average, distributions'], ['Numeric: discrete', 'Number of orders, items in cart', 'Counts, averages'], ['Categorical: nominal', 'Region, product category, channel', 'Group by, count, share of total'], ['Categorical: ordinal', 'Satisfaction 1–5, size S/M/L', 'Order and compare; averages are debatable'], ['Date / time', 'Order date, signup timestamp', 'Trends, periods, durations, cohorts'], ['Text', 'Reviews, product names', 'Search, categorize, sentiment'], ['Boolean', 'Is_active, churned', 'Rates and filters']])],
    ['Tidy data', PP(`Three rules (Hadley Wickham): every variable is a column, every observation is a row, every value is a cell. Spreadsheets for humans often break them, for example months spread across columns (Jan, Feb, Mar…). Analytical tools want the long format instead: one Month column and one Sales column. Converting wide to long is called unpivoting (Excel/Power Query: Unpivot; pandas: melt; SQL: UNPIVOT or UNION ALL).`) +
      TBL(['Wide (report-friendly)', 'Long / tidy (analysis-friendly)'], [['Region | Jan | Feb | Mar', 'Region | Month | Sales'], ['West | 120 | 135 | 150', 'West | Jan | 120'], ['', 'West | Feb | 135 …']])],
    ['Grain, keys and relationships', UL([`<b>Grain:</b> what one row represents: one order, one order line, one customer per day. Mixing grains (adding order totals to line-level rows) double-counts.`, `<b>Primary key:</b> a column (or set) that uniquely identifies each row, such as order_id.`, `<b>Foreign key:</b> a column pointing to another table’s key (orders.customer_id → customers.customer_id).`, `<b>Fact tables</b> hold events with numbers (orders, clicks); <b>dimension tables</b> describe things (customers, products, dates).`])],
    ['The sample data used in this track', PP(`SQL, Excel, Power BI and Python examples all use the same small shop:`) + TBL(['Table', 'Columns', 'Grain'], [['customers', 'customer_id, name, region, signup_date', 'one row per customer'], ['orders', 'order_id, customer_id, order_date, amount, status', 'one row per order'], ['products', 'product_id, name, category, price', 'one row per product'], ['order_items', 'order_id, product_id, quantity', 'one row per product within an order']]) + PP(`You can query all of it live in the SQL playground in Level 3.`)],
    ['File formats', TBL(['Format', 'Notes'], [['CSV', 'Plain text, universal; no types, watch delimiters, quotes and encodings (use UTF-8)'], ['Excel (.xlsx)', 'Rich, but formatting and merged cells get in the way of analysis'], ['JSON', 'Nested data from APIs; needs flattening'], ['Parquet', 'Columnar, compressed, typed; the standard for large analytical data']])]
  ],
  qs: [SQ('A table has one row per order line. You add the order’s total amount to every line and sum it. What goes wrong?', ['Nothing', 'Orders with several lines are counted several times', 'Sums ignore NULLs', 'The total becomes negative'], 1, 'The total belongs to the order grain; repeating it at line grain inflates sums.')]
});

DAT('da-stats', { name: 'Descriptive statistics', cat: 'dafound',
  blurb: `Summary numbers describe a dataset’s center (mean, median), spread (standard deviation, range, percentiles) and shape (skew, outliers). Choosing the right one matters: one outlier can make the average lie.`,
  facts: [['Center', 'Mean, median, mode'], ['Spread', 'Std dev, IQR, range'], ['Robust to outliers', 'Median, IQR'], ['Shape', 'Histogram, box plot']],
  sections: [
    ['Measures of center', TBL(['Measure', 'Definition', 'Use when'], [['Mean (average)', 'Sum ÷ count', 'Data is roughly symmetric, no extreme outliers'], ['Median', 'Middle value when sorted (50th percentile)', 'Skewed data: incomes, house prices, order values, response times'], ['Mode', 'Most frequent value', 'Categories (most common product)']]) +
      PP(`Example: order amounts 20, 25, 30, 35, 1,000. Mean = 222; median = 30. The median describes a typical order; the mean is pulled up by one large order.`)],
    ['Measures of spread', UL([`<b>Range:</b> max − min. Simple, but driven entirely by the two extremes.`, `<b>Variance and standard deviation (σ):</b> the typical distance from the mean. For roughly normal data, about 68% of values fall within ±1σ and 95% within ±2σ.`, `<b>Percentiles / quartiles:</b> the 25th (Q1), 50th (median), 75th (Q3), 90th, 99th. Performance and latency are always described with percentiles (p95, p99).`, `<b>Interquartile range (IQR):</b> Q3 − Q1, the spread of the middle half. Values below Q1 − 1.5×IQR or above Q3 + 1.5×IQR are a common outlier rule.`])],
    ['Distributions', UL([`<b>Normal (bell curve):</b> symmetric; heights, measurement errors.`, `<b>Right-skewed:</b> long tail of large values; income, order size, time on site. Mean &gt; median.`, `<b>Bimodal:</b> two peaks, often two different groups mixed together (mobile vs desktop users).`, `Always look at a histogram before summarizing: different shapes can have the same mean and standard deviation (Anscombe’s quartet).`])],
    ['Correlation', PP(`The correlation coefficient r (−1 to 1) measures how strongly two numeric variables move together in a straight line. Correlation is not causation: ice-cream sales and drownings both rise in summer. Check scatter plots, and confirm causes with experiments (A/B tests).`)],
    ['Common mistakes', UL([`Averaging averages (the average of regional averages is not the overall average unless regions are the same size). Recompute from totals.`, `Reporting means for skewed data.`, `Ignoring missing values: AVERAGE in Excel skips blanks, but blanks may mean “zero” in your business.`, `Comparing groups of very different sizes without rates or percentages.`])]
  ],
  snips: [
    ['Excel', '', `=AVERAGE(D2:D500)            ' mean
=MEDIAN(D2:D500)             ' median
=MODE.SNGL(D2:D500)          ' mode
=STDEV.S(D2:D500)            ' sample standard deviation
=PERCENTILE.INC(D2:D500, 0.9)  ' 90th percentile
=QUARTILE.INC(D2:D500, 3)    ' Q3
=CORREL(D2:D500, E2:E500)    ' correlation between two columns`],
    ['SQL', 'sql', `SELECT
  COUNT(*)                                   AS orders,
  AVG(amount)                                AS mean_amount,
  MIN(amount)                                AS min_amount,
  MAX(amount)                                AS max_amount,
  -- PostgreSQL: percentiles
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) AS median_amount,
  PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY amount) AS p90_amount,
  STDDEV_SAMP(amount)                        AS sd_amount
FROM orders
WHERE status = 'completed';`],
    ['Python', 'python', `import pandas as pd

orders = pd.read_csv("orders.csv")
amt = orders.loc[orders["status"] == "completed", "amount"]

print(amt.describe())              # count, mean, std, min, 25%, 50%, 75%, max
print("median:", amt.median())
print("p90:", amt.quantile(0.9))
q1, q3 = amt.quantile([0.25, 0.75])
iqr = q3 - q1
outliers = amt[(amt < q1 - 1.5 * iqr) | (amt > q3 + 1.5 * iqr)]
print(len(outliers), "outliers")`],
    ['Power BI (DAX)', '', `Mean Amount   = AVERAGE ( orders[amount] )
Median Amount = MEDIAN ( orders[amount] )
P90 Amount    = PERCENTILEX.INC ( orders, orders[amount], 0.9 )
Std Dev       = STDEV.S ( orders[amount] )`]
  ],
  qs: [SQ('Order values are heavily right-skewed. Which single number best describes a typical order?', ['Mean', 'Median', 'Maximum', 'Standard deviation'], 1, 'The median ignores the long tail of large orders.'),
    SQ('Region A averages $50 over 10 orders; region B $100 over 990 orders. What is the overall average?', ['$75', 'About $99.50', '$50', '$150'], 1, '(10×50 + 990×100) ÷ 1,000 = 99.5. Never average the averages.')]
});

/* ---------- Excel ---------- */
DAT('da-excel-formulas', { name: 'Excel formulas & references', cat: 'daexcel',
  blurb: `Excel formulas start with =, combine functions, operators and cell references, and recalculate automatically. Understanding relative and absolute references ($) is the key to formulas you can copy down a column without breaking.`,
  facts: [['Relative', 'A1 shifts when copied'], ['Absolute', '$A$1 stays fixed'], ['Mixed', '$A1 or A$1'], ['Tables', 'Structured refs: Sales[Amount]']],
  sections: [
    ['Anatomy of a formula', PP(`<code>=ROUND(SUM(D2:D10) * (1 + $H$1), 2)</code>: the = starts a formula; SUM and ROUND are functions; D2:D10 is a range; $H$1 is an absolute reference to a tax-rate cell; * and + are operators. Operator precedence follows math: parentheses, then ^, then * and /, then + and −. Comparison operators (=, &lt;&gt;, &lt;, &gt;=) return TRUE or FALSE; &amp; joins text.`)],
    ['References', TBL(['Reference', 'When copied one cell down and right', 'Use for'], [['A1 (relative)', 'Becomes B2', 'Row-by-row calculations'], ['$A$1 (absolute)', 'Stays $A$1', 'A single input cell: tax rate, exchange rate'], ['$A1 (mixed)', 'Becomes $A2', 'Lock the column (lookup key column)'], ['A$1 (mixed)', 'Becomes B$1', 'Lock the row (header row in a multiplication grid)']]) +
      PP(`Press F4 while editing a reference to cycle through the four forms.`)],
    ['Excel Tables and structured references', PP(`Select your data and press Ctrl+T to make it a Table. Tables grow automatically when you add rows, keep formulas consistent down the column, and let you write <code>=[@Quantity]*[@Price]</code> (this row) or <code>=SUM(Sales[Amount])</code> (whole column) instead of cell addresses. PivotTables, charts and Power Query all work better from Tables. Always convert raw data to a Table first.`)],
    ['Essential functions', TBL(['Category', 'Functions', 'Example'], [['Math', 'SUM, AVERAGE, MIN, MAX, ROUND, ABS', '=ROUND(AVERAGE(D2:D100), 1)'], ['Counting', 'COUNT (numbers), COUNTA (non-empty), COUNTBLANK', '=COUNTA(A2:A100)'], ['Logic', 'IF, IFS, AND, OR, NOT, IFERROR, SWITCH', '=IF(D2>=100, "Large", "Small")'], ['Text', 'LEFT, RIGHT, MID, LEN, TRIM, UPPER, PROPER, TEXTJOIN, TEXTBEFORE, SUBSTITUTE', '=PROPER(TRIM(B2))'], ['Date', 'TODAY, YEAR, MONTH, EOMONTH, DATEDIF, NETWORKDAYS, WEEKDAY', '=EOMONTH(C2, 0)'], ['Rounding & conversion', 'INT, VALUE, TEXT', '=TEXT(C2, "yyyy-mm")']])],
    ['Errors and what they mean', TBL(['Error', 'Usual cause'], [['#DIV/0!', 'Dividing by zero or an empty cell'], ['#N/A', 'A lookup found no match'], ['#VALUE!', 'Wrong type, e.g. text in arithmetic'], ['#REF!', 'A referenced cell was deleted'], ['#NAME?', 'Misspelled function or range name'], ['#SPILL!', 'A dynamic array has no room to spill']]) +
      PP(`Wrap risky formulas: <code>=IFERROR(D2/E2, 0)</code>, but don’t hide errors you should fix.`)],
    ['Good habits', UL([`Keep inputs, calculations and outputs in separate areas or sheets.`, `Never type constants inside formulas; put them in labeled input cells.`, `Use Tables and named ranges so formulas read like sentences.`, `Use LET to name intermediate results in long formulas: <code>=LET(rev, SUM(D:D), cost, SUM(E:E), (rev-cost)/rev)</code>.`])]
  ],
  snips: [
    ['Logic', '', `=IF(D2 >= 100, "Large", "Small")
=IFS(D2 >= 500, "XL", D2 >= 100, "Large", TRUE, "Small")
=IF(AND(C2 = "West", D2 > 100), "Priority", "")
=IFERROR(D2 / E2, 0)`],
    ['Text', '', `=TRIM(B2)                         ' remove extra spaces
=PROPER(B2)                       ' "ada LOVELACE" → "Ada Lovelace"
=LEFT(A2, 3)                      ' first 3 characters
=TEXTBEFORE(B2, "@")              ' part of an email before @
=B2 & " (" & C2 & ")"             ' join text
=TEXTJOIN(", ", TRUE, B2:B10)     ' join a range, skipping blanks`],
    ['Dates', '', `=TODAY()
=YEAR(C2)   =MONTH(C2)   =DAY(C2)
=EOMONTH(C2, 0)                   ' last day of C2's month
=EOMONTH(C2, -1) + 1              ' first day of C2's month
=TEXT(C2, "yyyy-mm")              ' month label for grouping
=NETWORKDAYS(C2, D2)              ' working days between dates
=DATEDIF(C2, TODAY(), "m")        ' whole months since C2`],
    ['Table refs', '', `' In a Table named Orders:
=[@amount] * (1 + Rate)           ' this row's amount; Rate is a named cell
=SUM(Orders[amount])              ' whole column
=AVERAGE(Orders[amount])
=COUNTROWS(Orders)                ' (Power Pivot/DAX); in a sheet use =ROWS(Orders)`]
  ],
  qs: [SQ('You copy =B2*$F$1 from C2 down to C3. What does C3 contain?', ['=B3*$F$2', '=B3*$F$1', '=B2*$F$1', '=C3*$F$1'], 1, 'B2 is relative and shifts down; $F$1 is absolute and stays.')]
});

DAT('da-excel-cond', { name: 'Conditional aggregation: SUMIFS & COUNTIFS', cat: 'daexcel',
  blurb: `SUMIFS, COUNTIFS and AVERAGEIFS add, count or average only the rows that meet one or more conditions. They answer most “how much for this segment?” questions without a PivotTable.`,
  facts: [['SUMIFS', 'Sum with conditions'], ['COUNTIFS', 'Count with conditions'], ['Operators', '">100", "<>Cancelled", "W*"'], ['Modern alternative', 'FILTER + SUM']],
  sections: [
    ['Syntax', PP(`<code>SUMIFS(sum_range, criteria_range1, criteria1, [criteria_range2, criteria2], …)</code>. All ranges must be the same size. Conditions are combined with AND. COUNTIFS has no sum_range: <code>COUNTIFS(criteria_range1, criteria1, …)</code>. AVERAGEIFS, MAXIFS and MINIFS follow the SUMIFS pattern.`)],
    ['Writing criteria', TBL(['Criterion', 'Meaning'], [['"West"', 'Equals West (not case sensitive)'], ['">100"', 'Greater than 100'], ['">="&H1', 'Greater than or equal to the value in H1 (concatenate the operator)'], ['"<>Cancelled"', 'Not equal'], ['"W*"', 'Starts with W (* any characters, ? one character)'], ['"<>"', 'Not blank'], ['""', 'Blank']])],
    ['Typical uses', UL([`Revenue by region and month in a summary grid: put regions down the side, months across the top, and copy one SUMIFS with mixed references.`, `Counting customers in each segment.`, `Date ranges: <code>SUMIFS(amount, date, "&gt;="&amp;start, date, "&lt;"&amp;end)</code>. Using “&lt; next start” avoids missing the last day’s timestamps.`])],
    ['OR conditions', PP(`SUMIFS only does AND. For OR, add two SUMIFS (<code>=SUMIFS(..,"West")+SUMIFS(..,"North")</code>), use an array constant (<code>=SUM(SUMIFS(D:D, B:B, {"West","North"}))</code>), or in Excel 365 use FILTER: <code>=SUM(FILTER(D2:D100, (B2:B100="West")+(B2:B100="North")))</code>, where + means OR and * means AND.`)],
    ['SUMIFS vs PivotTable vs SQL', PP(`SUMIFS is ideal for fixed-layout reports and models that must update cell by cell. A PivotTable is faster for exploring many cuts. When the data lives in a database, do the aggregation in SQL with GROUP BY and bring only the results into Excel.`)]
  ],
  snips: [
    ['SUMIFS', '', `' Revenue from completed orders in the West
=SUMIFS(Orders[amount], Orders[region], "West", Orders[status], "completed")

' Revenue in a date range given in H1 (start) and H2 (end, exclusive)
=SUMIFS(Orders[amount], Orders[order_date], ">=" & H1, Orders[order_date], "<" & H2)

' Summary grid: region in $A5, month start in B$4
=SUMIFS(Orders[amount], Orders[region], $A5, Orders[order_date], ">=" & B$4, Orders[order_date], "<" & EDATE(B$4, 1))`],
    ['COUNTIFS', '', `=COUNTIFS(Orders[status], "cancelled")
=COUNTIFS(Orders[region], "West", Orders[amount], ">100")
=COUNTIFS(Customers[email], "<>")                ' non-blank emails
=COUNTIFS(Orders[customer_id], A2) > 1           ' does this customer have repeat orders?`],
    ['AVERAGEIFS / MAXIFS', '', `=AVERAGEIFS(Orders[amount], Orders[region], "West")
=MAXIFS(Orders[amount], Orders[status], "completed")
=MINIFS(Orders[order_date], Orders[customer_id], A2)   ' first order date per customer`],
    ['FILTER (365)', '', `' All West orders over 100, as a spilled table
=FILTER(Orders, (Orders[region]="West") * (Orders[amount]>100), "none")

' OR logic: West or North
=SUM(FILTER(Orders[amount], (Orders[region]="West") + (Orders[region]="North")))`]
  ],
  qs: [SQ('Which formula counts West orders over $100?', ['=COUNTIF(B:B,"West",D:D,">100")', '=COUNTIFS(B:B,"West",D:D,">100")', '=SUMIFS(B:B,"West",D:D,">100")', '=COUNT(B:B="West")'], 1, 'COUNTIFS takes pairs of range and criterion, combined with AND.')]
});

DAT('da-excel-lookup', { name: 'Lookups: XLOOKUP, INDEX/MATCH & VLOOKUP', cat: 'daexcel',
  blurb: `Lookups bring a value from another table into this one: a customer’s region into the orders list, a price into a quote. XLOOKUP is the modern default; INDEX/MATCH works in every version; VLOOKUP is common but fragile.`,
  facts: [['Modern', 'XLOOKUP'], ['Any version', 'INDEX + MATCH'], ['Legacy', 'VLOOKUP'], ['Always', 'Exact match (0 / FALSE)']],
  sections: [
    ['XLOOKUP', PP(`<code>XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])</code>. It looks up in one column and returns from another, in either direction, with exact match by default and a built-in “not found” value. It can return several columns at once and search from the bottom (latest match).`)],
    ['INDEX/MATCH', PP(`MATCH finds a position; INDEX returns the value at a position: <code>=INDEX(return_col, MATCH(value, lookup_col, 0))</code>. The 0 means exact match. Works in all Excel versions, looks left, and doesn’t break when columns are inserted. Two-way lookups use two MATCHes: <code>=INDEX(grid, MATCH(row_key, row_labels, 0), MATCH(col_key, col_labels, 0))</code>.`)],
    ['VLOOKUP and its traps', UL([`<code>=VLOOKUP(value, table, col_index, FALSE)</code> searches the first column of table and returns column number col_index.`, `Forgetting FALSE gives approximate match on unsorted data: silently wrong answers.`, `It can’t look to the left, and inserting a column shifts col_index and breaks results.`, `Use it only where XLOOKUP isn’t available and you know the traps.`])],
    ['Lookup hygiene', UL([`Keys must match exactly: trim spaces (TRIM), fix numbers stored as text (VALUE), and watch letter case in IDs.`, `Duplicates in the lookup column return only the first match; check uniqueness first with COUNTIFS.`, `#N/A means no match: decide whether that is an error to fix or a valid “not found”.`, `Many lookups over large data are slow; in Power Query or Power BI use a merge or a relationship instead.`])]
  ],
  snips: [
    ['XLOOKUP', '', `' Customer region for the order's customer_id in B2
=XLOOKUP(B2, Customers[customer_id], Customers[region], "Unknown")

' Return several columns at once (name and region)
=XLOOKUP(B2, Customers[customer_id], Customers[[name]:[region]])

' Latest order amount for a customer (search last to first)
=XLOOKUP(A2, Orders[customer_id], Orders[amount], , 0, -1)

' Approximate match: commission tier for a sales amount (tiers sorted ascending)
=XLOOKUP(D2, Tiers[min_sales], Tiers[rate], , -1)`],
    ['INDEX/MATCH', '', `=INDEX(Customers[region], MATCH(B2, Customers[customer_id], 0))

' Two-way lookup: price for product in A2 and size in B2
=INDEX(PriceGrid, MATCH(A2, ProductList, 0), MATCH(B2, SizeList, 0))`],
    ['VLOOKUP', '', `' Region is the 3rd column of the Customers table
=VLOOKUP(B2, Customers, 3, FALSE)     ' FALSE = exact match. Never omit it.`]
  ],
  qs: [SQ('VLOOKUP returns plausible but wrong values on an unsorted table. Most likely cause?', ['The table is too large', 'The last argument was omitted, so it used approximate match', 'XLOOKUP is required', 'The key has duplicates'], 1, 'Without FALSE, VLOOKUP assumes sorted data and returns the nearest smaller match.')]
});

DAT('da-excel-pivot', { name: 'PivotTables & charts', cat: 'daexcel',
  blurb: `A PivotTable summarizes thousands of rows by dragging fields into Rows, Columns, Values and Filters, with no formulas. It is the fastest way to explore a dataset in Excel, and the same idea (dimensions × measures) underlies Power BI and Tableau.`,
  facts: [['Rows / Columns', 'Categories to group by'], ['Values', 'Numbers to aggregate'], ['Filters & slicers', 'Limit the data'], ['Refresh', 'Data → Refresh All']],
  sections: [
    ['Building one', OL([`Click inside your data (ideally an Excel Table) → Insert → PivotTable.`, `Drag a category (Region) to <b>Rows</b>.`, `Drag a number (amount) to <b>Values</b>; it defaults to Sum (Count for text).`, `Drag another category (order month) to <b>Columns</b> for a cross-tab.`, `Drag a field to <b>Filters</b>, or insert a <b>Slicer</b> for clickable filter buttons.`, `Change aggregation via Value Field Settings: Sum, Count, Average, Max, Distinct Count (with the Data Model).`])],
    ['Useful features', TBL(['Feature', 'What it does'], [['Show Values As', '% of grand total, % of column/row, running total, difference from previous period, rank'], ['Grouping', 'Group dates by months/quarters/years; group numbers into bins'], ['Calculated fields', 'Formulas on aggregated fields (profit = revenue − cost)'], ['Slicers & timelines', 'Clickable filters that can drive several PivotTables'], ['Drill-down', 'Double-click a value to see the underlying rows'], ['PivotCharts', 'A chart that stays in sync with the PivotTable'], ['Data Model', 'Relate several tables and write DAX measures (Power Pivot)']])],
    ['When to use them', UL([`Exploring: which regions, products and months drive a change.`, `Recurring summaries on data that gets refreshed.`, `Not for fixed-layout financial reports (use SUMIFS) or data too large for Excel (use SQL or Power BI).`])],
    ['Pitfalls', UL([`Source range that doesn’t include new rows: use a Table as the source.`, `Forgetting to Refresh after the data changes.`, `Counting text fields when you meant summing (numbers stored as text).`, `Averages of averages in calculated fields: compute ratios from sums instead.`])],
    ['Charts in Excel', PP(`Choose the chart for the question: bar for comparing categories, line for trends over time, scatter for relationships, histogram for distributions, stacked bar for composition. Remove chart junk (3D, heavy gridlines), label directly, start bar axes at zero, and title the chart with the insight (“West drove 70% of Q3 growth”) rather than the field names.`)]
  ],
  qs: [SQ('You want each region’s share of total revenue in a PivotTable. What do you use?', ['A calculated field', 'Show Values As → % of Grand Total', 'A slicer', 'Group by region'], 1, 'Show Values As computes shares, running totals and differences directly.')]
});

DAT('da-excel-pq', { name: 'Cleaning data & Power Query', cat: 'daexcel',
  blurb: `Real data is messy: extra spaces, inconsistent spellings, duplicates, numbers stored as text, wide layouts. Power Query (Data → Get & Transform) records each cleaning step so the whole process reruns with one click when new data arrives. The same engine powers Power BI.`,
  facts: [['Where', 'Data → Get Data'], ['Language', 'M (recorded for you)'], ['Rerun', 'Refresh'], ['Also in', 'Power BI']],
  sections: [
    ['Common cleaning tasks', TBL(['Problem', 'Quick Excel fix', 'Power Query fix'], [['Extra spaces / odd casing', 'TRIM, PROPER', 'Transform → Format → Trim / Capitalize'], ['Duplicates', 'Data → Remove Duplicates', 'Home → Remove Rows → Remove Duplicates'], ['Numbers stored as text', 'VALUE, Text to Columns', 'Change column type'], ['One column holding two fields', 'Text to Columns, TEXTSPLIT, Flash Fill (Ctrl+E)', 'Split Column by Delimiter'], ['Missing values', 'Filter blanks, IF', 'Replace Values, Fill Down'], ['Months as columns (wide)', 'Hard', 'Unpivot Columns'], ['Combine monthly files', 'Copy-paste', 'Get Data → From Folder → Combine']])],
    ['Power Query workflow', OL([`Get Data from a file, folder, database or web page; Power Query opens with a preview.`, `Apply steps with the ribbon: remove columns, filter rows, change types, split, merge, unpivot, group by.`, `Each step appears in Applied Steps and can be edited or reordered.`, `Close &amp; Load to a Table, a PivotTable, or only the Data Model.`, `Next month, drop in the new file and click Refresh: every step reruns.`])],
    ['Merge vs append', UL([`<b>Append</b> stacks tables with the same columns (January + February sales) like SQL UNION ALL.`, `<b>Merge</b> joins tables side by side on a key (orders + customer region) like SQL JOIN; choose Left Outer, Inner, Anti joins and so on.`])],
    ['Data validation and quality checks', UL([`Data → Data Validation restricts what users can type (lists, dates, numbers in a range).`, `Conditional formatting highlights duplicates, blanks and outliers.`, `In Power Query, View → Column quality / distribution / profile shows errors, empties and distinct counts per column.`, `Reconcile totals: row counts and sums before and after cleaning should match expectations.`])]
  ],
  snips: [
    ['Power Query (M)', '', `let
    Source   = Csv.Document(File.Contents("C:\\data\\orders.csv"), [Delimiter=",", Encoding=65001]),
    Headers  = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    Typed    = Table.TransformColumnTypes(Headers, {{"order_id", Int64.Type}, {"order_date", type date}, {"amount", type number}}),
    Trimmed  = Table.TransformColumns(Typed, {{"status", Text.Trim, type text}}),
    NoDupes  = Table.Distinct(Trimmed, {"order_id"}),
    Done     = Table.SelectRows(NoDupes, each [status] <> "test")
in
    Done`],
    ['Unpivot (M)', '', `// Wide: Region | Jan | Feb | Mar   →   Long: Region | Month | Sales
= Table.UnpivotOtherColumns(Source, {"Region"}, "Month", "Sales")`],
    ['Excel formulas', '', `=TRIM(CLEAN(A2))                    ' strip spaces and non-printing characters
=VALUE(SUBSTITUTE(B2, ",", ""))     ' "1,234" (text) → 1234
=TEXTSPLIT(A2, ",")                 ' split into columns (365)
=UNIQUE(Orders[region])             ' distinct list (365)
=COUNTIF(A:A, A2) > 1               ' flag duplicates`]
  ],
  qs: [SQ('Each month you receive a new CSV with the same layout. What saves the most effort?', ['Copy-paste and redo formulas', 'Power Query “From Folder” with recorded cleaning steps, then Refresh', 'VLOOKUP', 'A macro that deletes data'], 1, 'Power Query reruns the same transformation on every file automatically.')]
});
