/* ===== Data analytics C: Power BI & Tableau ===== */
DAT('da-pbi-intro', { name: 'Power BI: the big picture', cat: 'dapbi',
  blurb: `Power BI is Microsoft’s business intelligence platform. You connect to data and clean it in Power Query, model it with relationships and DAX measures, build interactive reports in Power BI Desktop, and publish them to the Power BI Service for sharing, scheduled refresh and security.`,
  facts: [['Build', 'Power BI Desktop (free)'], ['Share', 'Power BI Service'], ['Clean', 'Power Query (M)'], ['Calculate', 'DAX measures']],
  dg: { w: 900, h: 260,
    n: [['src', 'Data sources', 85, 130, 'db', 'SQL, Excel, APIs'], ['pq', 'Power Query', 270, 130, 'worker', 'clean & shape'], ['mod', 'Data model', 460, 130, 'db', 'tables + relationships'], ['dax', 'DAX measures', 460, 240, 'box', 'Revenue, YoY %'], ['rep', 'Report', 650, 130, 'client', 'visuals, slicers'], ['svc', 'Power BI Service', 820, 130, 'cdn', 'share · refresh · RLS']],
    e: [['src', 'pq', 'connect'], ['pq', 'mod', 'load'], ['dax', 'mod', '', 'b'], ['mod', 'rep'], ['rep', 'svc', 'publish']] },
  cap: `The Power BI workflow: get and transform data, model it, write measures, design the report, publish and schedule refresh.`,
  walk: [[['src', 'pq', 'src>pq'], `<b>Get Data</b> from 100+ connectors: SQL Server, Excel, SharePoint, Snowflake, web APIs. Choose <b>Import</b> (data copied into the model, fastest) or <b>DirectQuery</b> (queries the source live; for huge or real-time data).`], [['pq', 'mod', 'pq>mod'], `<b>Power Query</b> cleans and shapes each table with recorded steps, exactly as in Excel.`], [['mod', 'dax', 'dax>mod'], `In <b>Model view</b> you relate tables in a star schema and add a date table. <b>DAX measures</b> define the business logic once (Revenue, Margin %, YoY growth).`], [['rep', 'mod>rep'], `In <b>Report view</b> you drag fields onto visuals. Every visual, slicer and click filters the others automatically through the model.`], [['svc', 'rep>svc'], `<b>Publish</b> to a workspace in the Power BI Service, schedule refresh (through a gateway for on-premises data), apply row-level security, and share as an app or embed in Teams.`]],
  sections: [
    ['The three views in Desktop', TBL(['View', 'What you do'], [['Report', 'Build pages of visuals, slicers, buttons and bookmarks'], ['Table (Data)', 'Inspect loaded tables and calculated columns'], ['Model', 'Create relationships, set cardinality and filter direction, hide technical columns, organize measures']])],
    ['Import vs DirectQuery vs Live', TBL(['Mode', 'How', 'Pros', 'Cons'], [['Import', 'Data compressed into the in-memory VertiPaq engine', 'Fastest, full DAX and Power Query', 'Data as fresh as the last refresh; size limits per license'], ['DirectQuery', 'Each visual sends a query to the source', 'Near real-time, no size limit', 'Slower, some DAX and transform limitations, load on the source'], ['Live connection', 'Connects to a published semantic model or Analysis Services', 'One governed model for many reports', 'Model is edited elsewhere']])],
    ['Power BI vs Excel vs Tableau', TBL(['', 'Excel', 'Power BI', 'Tableau'], [['Strength', 'Flexible calculations and models', 'Data modeling + DAX + Microsoft integration, low cost', 'Visual exploration and design flexibility'], ['Data size', '≈ 1M rows per sheet (more in Power Pivot)', 'Hundreds of millions of rows (compressed)', 'Very large via extracts / live'], ['Calculation language', 'Formulas', 'DAX, M', 'Calculated fields, LOD, table calcs'], ['Sharing', 'Files', 'Service, apps, Teams', 'Tableau Server / Cloud']])],
    ['A first report in 10 steps', OL([`Get Data → load orders, customers, products.`, `In Power Query, set types, trim text, remove test orders.`, `Create a Date table (DAX CALENDAR or Power Query) and mark it as a date table.`, `Relate orders to customers, products and date (one-to-many, single direction).`, `Write measures: Revenue, Orders, AOV, Revenue YoY %.`, `Add KPI cards for the headline numbers.`, `Add a line chart of Revenue by month and a bar chart by region.`, `Add slicers for year and category.`, `Format: consistent colors, titles that state insights, tooltips.`, `Publish and schedule refresh.`])]
  ],
  qs: [SQ('Your source has 2 billion rows that change every minute. Which storage mode fits?', ['Import', 'DirectQuery (or a composite model)', 'Excel export', 'Copy and paste'], 1, 'DirectQuery queries the source live instead of copying data into the model.')]
});

DAT('da-pbi-model', { name: 'Power BI data modeling', cat: 'dapbi',
  blurb: `The model is the heart of Power BI. Relationships between a central fact table and dimension tables let filters flow from slicers to numbers. Get the model right (a star schema with a proper date table) and DAX becomes simple; get it wrong and every measure fights it.`,
  facts: [['Shape', 'Star schema'], ['Default relationship', 'One-to-many, single direction'], ['Must have', 'Marked date table'], ['Avoid', 'Bi-directional & many-to-many unless needed']],
  sections: [
    ['Relationships', TBL(['Setting', 'Meaning', 'Recommendation'], [['Cardinality: one-to-many', 'One dimension row relates to many fact rows', 'The normal case (customers 1 → * orders)'], ['Many-to-many', 'Both sides have duplicates', 'Avoid; usually means a bridge or dimension is missing'], ['Cross-filter direction: single', 'Filters flow from the one side to the many side', 'Default; predictable'], ['Both directions', 'Filters flow both ways', 'Only for specific needs; can cause ambiguity and slow models'], ['Active / inactive', 'Only one active path between two tables', 'Use USERELATIONSHIP in DAX for alternate dates (ship date)']])],
    ['The date table', PP(`Time intelligence (YTD, previous year, rolling 12 months) requires a continuous date table with one row per day covering all years in the data, related to the fact’s date column, and marked as a date table (Table tools → Mark as date table). Build it in DAX: <code>Date = ADDCOLUMNS(CALENDAR(DATE(2024,1,1), DATE(2026,12,31)), "Year", YEAR([Date]), "Month", FORMAT([Date], "MMM"), "MonthNo", MONTH([Date]), "YearMonth", FORMAT([Date], "YYYY-MM"))</code>. Sort Month by MonthNo.`)],
    ['Modeling best practices', UL([`Star schema: facts in the middle, dimensions around; flatten snowflakes.`, `Remove columns you don’t need (especially high-cardinality text and IDs); they cost memory.`, `Prefer measures over calculated columns for aggregations.`, `Hide foreign keys and technical columns from report view.`, `Use a dedicated table to hold measures, organized in display folders.`, `Set data categories (country, city, URL) and default summarization (don’t sum year or ID columns).`])],
    ['Calculated columns vs measures', TBL(['', 'Calculated column', 'Measure'], [['Computed', 'At refresh, row by row, stored', 'At query time, for the current filter context'], ['Uses', 'Row context', 'Filter context'], ['Use for', 'Values to slice or filter by (price band, age group)', 'Aggregations (Revenue, Margin %, YoY)'], ['Cost', 'Memory', 'CPU at query time']])]
  ],
  qs: [SQ('Why should you build and mark a dedicated date table?', ['It makes the file smaller', 'Time-intelligence functions need a continuous calendar related to the facts', 'It is required for bar charts', 'DAX can’t read dates otherwise'], 1, 'Functions like SAMEPERIODLASTYEAR and TOTALYTD rely on a complete, marked date table.')]
});

DAT('da-dax', { name: 'DAX fundamentals', cat: 'dapbi',
  blurb: `DAX (Data Analysis Expressions) is the formula language of Power BI, Power Pivot and Analysis Services. It looks like Excel, but it works on whole tables and columns and is evaluated in a filter context set by the report. CALCULATE, which changes that context, is the key to all of it.`,
  facts: [['Key function', 'CALCULATE'], ['Contexts', 'Filter & row'], ['Iterators', 'SUMX, AVERAGEX, …'], ['Safe division', 'DIVIDE']],
  sections: [
    ['Filter context', PP(`Every time a measure is evaluated (in a cell of a matrix, a bar of a chart, a card) the report sets filters: the row’s region, the column’s year, the slicer selections. <code>Revenue = SUM(orders[amount])</code> returns a different number in every cell because each cell has a different filter context. You write the measure once; context does the slicing.`)],
    ['CALCULATE', PP(`<code>CALCULATE(expression, filter1, filter2, …)</code> evaluates an expression in a modified filter context. Filters can add or replace conditions (<code>customers[region] = "West"</code>), remove them (<code>ALL(customers)</code>, <code>REMOVEFILTERS(customers[region])</code>), or shift time (<code>SAMEPERIODLASTYEAR('Date'[Date])</code>). Nearly every interesting measure (share of total, year-over-year, running totals) is CALCULATE plus the right filter.`)],
    ['Row context and iterators', PP(`Calculated columns and iterator functions (SUMX, AVERAGEX, COUNTX, MAXX, RANKX, FILTER) evaluate an expression row by row. <code>Revenue = SUMX(order_items, order_items[quantity] * RELATED(products[price]))</code> multiplies per row and then sums. Use iterators when the calculation must happen before aggregating. RELATED follows a many-to-one relationship from the current row.`)],
    ['Essential functions', TBL(['Group', 'Functions'], [['Aggregation', 'SUM, AVERAGE, MIN, MAX, COUNTROWS, DISTINCTCOUNT'], ['Iterators', 'SUMX, AVERAGEX, MAXX, RANKX, CONCATENATEX'], ['Filter', 'CALCULATE, FILTER, ALL, ALLEXCEPT, REMOVEFILTERS, KEEPFILTERS, VALUES, SELECTEDVALUE'], ['Time intelligence', 'TOTALYTD, DATESYTD, SAMEPERIODLASTYEAR, DATEADD, DATESINPERIOD, PARALLELPERIOD'], ['Logic', 'IF, SWITCH, ISBLANK, COALESCE, DIVIDE'], ['Relationships', 'RELATED, RELATEDTABLE, USERELATIONSHIP, TREATAS']])],
    ['Writing good measures', UL([`Use VAR … RETURN to name intermediate values: clearer and evaluated once.`, `Use DIVIDE(a, b) instead of a / b to avoid errors on zero.`, `Build measures on measures: Margin % = DIVIDE([Profit], [Revenue]).`, `Format measures (currency, %), and name them as business users speak.`, `Test a measure in a matrix by region and month to see it in many contexts at once.`])]
  ],
  snips: [
    ['Basics', '', `Revenue        = SUM ( orders[amount] )
Orders         = COUNTROWS ( orders )
Customers      = DISTINCTCOUNT ( orders[customer_id] )
AOV            = DIVIDE ( [Revenue], [Orders] )
Item Revenue   = SUMX ( order_items, order_items[quantity] * RELATED ( products[price] ) )`],
    ['CALCULATE', '', `West Revenue   = CALCULATE ( [Revenue], customers[region] = "West" )
All Regions    = CALCULATE ( [Revenue], REMOVEFILTERS ( customers[region] ) )
% of Total     = DIVIDE ( [Revenue], [All Regions] )
Completed Rev  = CALCULATE ( [Revenue], orders[status] = "completed" )
Big Orders     = CALCULATE ( [Orders], orders[amount] >= 100 )`],
    ['Time intelligence', '', `Revenue YTD    = TOTALYTD ( [Revenue], 'Date'[Date] )
Revenue PY     = CALCULATE ( [Revenue], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )
YoY %          = DIVIDE ( [Revenue] - [Revenue PY], [Revenue PY] )
Revenue PM     = CALCULATE ( [Revenue], DATEADD ( 'Date'[Date], -1, MONTH ) )
Rolling 3M     = CALCULATE ( [Revenue], DATESINPERIOD ( 'Date'[Date], MAX ( 'Date'[Date] ), -3, MONTH ) )`],
    ['VAR & SWITCH', '', `Margin % =
VAR Rev  = [Revenue]
VAR Cost = SUMX ( order_items, order_items[quantity] * RELATED ( products[unit_cost] ) )
RETURN DIVIDE ( Rev - Cost, Rev )

Size Band =                      -- calculated column on orders
SWITCH ( TRUE (),
    orders[amount] >= 500, "XL",
    orders[amount] >= 100, "Large",
    "Small" )

Top Region = MAXX ( TOPN ( 1, VALUES ( customers[region] ), [Revenue] ), customers[region] )`],
    ['Ranking', '', `Region Rank   = RANKX ( ALL ( customers[region] ), [Revenue], , DESC, DENSE )
Top 5 Products Revenue =
CALCULATE ( [Revenue], TOPN ( 5, ALL ( products[name] ), [Revenue] ) )`]
  ],
  qs: [SQ('A matrix shows Revenue by region. What does CALCULATE([Revenue], REMOVEFILTERS(customers[region])) return in the West row?', ['West revenue', 'Total revenue across all regions', 'Blank', 'An error'], 1, 'The region filter from the row is removed, so every row shows the grand total: the denominator of % of total.'),
    SQ('Why prefer a measure over a calculated column for “Revenue”?', ['Columns can’t sum', 'Measures are computed for the current filter context at query time and use no stored memory per row', 'Measures are faster to type', 'Columns can’t be formatted'], 1, 'Aggregations belong in measures; columns are for row-level attributes you slice by.')]
});

DAT('da-pbi-viz', { name: 'Power BI reports, sharing & security', cat: 'dapbi',
  blurb: `A good report answers specific questions at a glance and lets people drill into the why. Power BI adds interactivity (cross-filtering, drill-through, tooltips, bookmarks), and the Service adds refresh, sharing and row-level security.`,
  facts: [['Interactivity', 'Cross-filter, drill, tooltips'], ['Navigation', 'Bookmarks, buttons, drill-through'], ['Security', 'Row-level security (RLS)'], ['Refresh', 'Scheduled; gateway for on-prem']],
  sections: [
    ['Report layout', UL([`Top-left: the headline KPIs as cards (Revenue, Orders, AOV, YoY %).`, `Middle: the main trend (line chart by month) and the main breakdown (bar chart by region or category).`, `Side or top: slicers (date range, category), consistent across pages.`, `Detail: a table or matrix for people who need exact numbers.`, `Use one accent color for what matters and grey for context.`])],
    ['Interactivity features', TBL(['Feature', 'What it does'], [['Cross-filtering', 'Clicking a bar filters the other visuals (Edit interactions to control it)'], ['Drill-down', 'Year → quarter → month in a hierarchy'], ['Drill-through', 'Right-click a customer → open a detail page filtered to that customer'], ['Report-page tooltips', 'A mini page shown on hover'], ['Bookmarks + buttons', 'Saved states for toggles, guided stories, “reset filters”'], ['Field parameters', 'Let users switch the measure or dimension a chart shows'], ['Q&A and smart narratives', 'Natural-language questions and auto-generated summaries']])],
    ['Row-level security', PP(`RLS limits the rows each user sees. In Desktop, Modeling → Manage roles: create a role with a DAX filter such as <code>[region] = "West"</code>, or a dynamic one: <code>customers[manager_email] = USERPRINCIPALNAME()</code>. In the Service, assign people or groups to roles. One report then serves every region securely.`)],
    ['Publishing and refresh', UL([`Publish to a workspace; package reports as an App for consumers.`, `Schedule refresh (up to 8×/day on Pro, 48×/day on Premium/Fabric capacity); on-premises sources need an on-premises data gateway.`, `Incremental refresh loads only recent partitions of large tables.`, `Separate semantic models (datasets) from reports so many reports share one governed model.`, `Use deployment pipelines (dev → test → prod) for larger teams.`])],
    ['Performance tips', UL([`Use the Performance Analyzer to find slow visuals.`, `Reduce columns and cardinality; avoid bi-directional relationships.`, `Fewer visuals per page; avoid tables with many rows by default.`, `Prefer measures over calculated columns; avoid FILTER over whole fact tables when a simple predicate in CALCULATE works.`])]
  ],
  qs: [SQ('Each regional manager must see only their region in the same report. What do you use?', ['One report copy per region', 'Row-level security with a role filtering on region or USERPRINCIPALNAME()', 'A slicer', 'Bookmarks'], 1, 'RLS enforces data access in the model, regardless of what the user clicks.')]
});

/* ---------- Tableau ---------- */
DAT('da-tab-basics', { name: 'Tableau fundamentals', cat: 'datab',
  blurb: `Tableau turns drag-and-drop into charts: dimensions (categorical fields) split the view, measures (numbers) are aggregated, and the Marks card controls color, size, label and detail. Learn the difference between discrete (blue) and continuous (green) fields and the rest follows.`,
  facts: [['Blue pill', 'Discrete → headers'], ['Green pill', 'Continuous → axis'], ['Marks card', 'Color, size, label, detail, tooltip'], ['Products', 'Desktop, Prep, Cloud/Server, Public']],
  dg: { w: 880, h: 250,
    n: [['ds', 'Data source', 90, 125, 'db', 'live or extract'], ['prep', 'Tableau Prep', 290, 50, 'worker', 'optional cleaning'], ['ws', 'Worksheets', 290, 190, 'box', 'one chart each'], ['db', 'Dashboard', 510, 125, 'client', 'sheets + filters + actions'], ['st', 'Story', 700, 50, 'box', 'guided sequence'], ['cl', 'Tableau Cloud / Server', 730, 190, 'cdn', 'publish, share, refresh']],
    e: [['ds', 'prep'], ['prep', 'ws', '', 'd'], ['ds', 'ws', 'connect'], ['ws', 'db', 'combine'], ['db', 'st'], ['db', 'cl', 'publish']] },
  cap: `The Tableau workflow: connect (live or extract), optionally clean in Prep, build one chart per worksheet, combine worksheets into interactive dashboards and stories, and publish.`,
  walk: [[['ds'], `Connect to a file or database. <b>Live</b> queries the source each time; an <b>extract</b> (.hyper) is a fast compressed snapshot refreshed on a schedule.`], [['prep', 'ds>prep'], `Tableau Prep Builder handles heavier cleaning, joins and unions in a visual flow (like Power Query).`], [['ws', 'ds>ws'], `Each worksheet holds one view. Drag fields to Rows, Columns and the Marks card.`], [['db', 'ws>db'], `A dashboard arranges several worksheets with filters, parameters and actions that link them.`], [['cl', 'st', 'db>cl', 'db>st'], `Publish to Tableau Cloud or Server to share, set refresh schedules and permissions; stories walk viewers through a narrative.`]],
  sections: [
    ['Dimensions, measures, discrete and continuous', TBL(['Concept', 'Meaning', 'In the view'], [['Dimension', 'Field you group or slice by (Region, Category, Order Date)', 'Creates headers or marks per value'], ['Measure', 'Numeric field you aggregate (Sales, Profit)', 'Aggregated: SUM, AVG, COUNTD…'], ['Discrete (blue)', 'Distinct values', 'Headers; dates as parts (YEAR, MONTH names)'], ['Continuous (green)', 'An unbroken range', 'Axes; dates as a timeline (exact month)']]) +
      PP(`Right-click any pill to switch between discrete and continuous, change the aggregation, or choose a date part vs date value.`)],
    ['Building views', UL([`<b>Bar chart:</b> dimension on Rows, measure on Columns. Sort with the toolbar.`, `<b>Line chart:</b> continuous date (green MONTH(Order Date)) on Columns, measure on Rows.`, `<b>Map:</b> double-click a geographic field (Country, State); Tableau geocodes it.`, `<b>Scatter plot:</b> two measures on Rows and Columns; a dimension on Detail makes one mark per item.`, `<b>Show Me</b> suggests chart types for the fields you selected.`, `<b>Filters shelf</b> with dimension, measure, date or top-N filters; right-click → Show Filter to expose it.`])],
    ['The Marks card', TBL(['Property', 'Use'], [['Color', 'Encode a category or a measure (diverging palettes for profit)'], ['Size', 'Magnitude'], ['Label', 'Show values on marks'], ['Detail', 'Increase granularity without encoding'], ['Tooltip', 'Hover text; can embed another sheet (viz in tooltip)'], ['Shape / Path', 'Point shapes; line order']])],
    ['Order of operations', PP(`Tableau applies filters in a set order: extract filters → data source filters → context filters → FIXED LOD calculations → dimension filters → INCLUDE/EXCLUDE LODs → measure filters → table calculations and table-calc filters. Many “why is my number wrong?” questions are answered by where a filter sits in this list (e.g., add a filter to context so it applies before a FIXED calculation).`)]
  ],
  qs: [SQ('You drag Order Date to Columns and get YEAR headers, but you want a continuous timeline. What do you do?', ['Add a filter', 'Change it to a continuous date (green), e.g. exact MONTH(Order Date)', 'Convert it to a measure', 'Use a dashboard action'], 1, 'Continuous dates draw an axis; discrete date parts draw headers.')]
});

DAT('da-tab-calcs', { name: 'Tableau calculations: fields, LOD & table calcs', cat: 'datab',
  blurb: `Tableau has three kinds of calculations. Calculated fields work row by row or on aggregates; level-of-detail (LOD) expressions compute at a grain different from the view; table calculations compute across the marks already in the view (running totals, rank, percent of total).`,
  facts: [['Row / aggregate', 'Calculated fields'], ['Other grain', 'FIXED, INCLUDE, EXCLUDE'], ['Across the view', 'Table calculations'], ['Inputs', 'Parameters']],
  sections: [
    ['Calculated fields', PP(`Create with Analysis → Create Calculated Field. Row-level: <code>[Sales] - [Cost]</code>, <code>IF [Sales] &gt;= 100 THEN "Large" ELSE "Small" END</code>. Aggregate: <code>SUM([Profit]) / SUM([Sales])</code> (a ratio of sums, correct at any level). Mixing row-level and aggregated fields in one expression is an error: aggregate everything or nothing.`) +
      TBL(['Kind', 'Functions'], [['Logic', 'IF/ELSEIF/ELSE/END, CASE, IIF, ZN, IFNULL, ISNULL'], ['String', 'LEFT, CONTAINS, SPLIT, REPLACE, UPPER, TRIM'], ['Date', 'DATETRUNC, DATEPART, DATEADD, DATEDIFF, TODAY'], ['Aggregate', 'SUM, AVG, COUNTD, MEDIAN, PERCENTILE, ATTR']])],
    ['Level-of-detail expressions', TBL(['Expression', 'Computes at', 'Example'], [['{FIXED [dim] : agg}', 'Exactly the listed dimensions, ignoring the view (but after context filters)', '{FIXED [Customer ID] : MIN([Order Date])} → each customer’s first order date (cohorts)'], ['{INCLUDE [dim] : agg}', 'The view’s dimensions plus the listed ones', 'AVG({INCLUDE [Customer ID] : SUM([Sales])}) → average sales per customer within each region'], ['{EXCLUDE [dim] : agg}', 'The view’s dimensions minus the listed ones', 'SUM([Sales]) / SUM({EXCLUDE [Region] : SUM([Sales])}) → share of the higher level']]) +
      PP(`LODs answer questions like “how many customers made only one purchase?” or “compare each order to its customer’s average” that are awkward with plain aggregates.`)],
    ['Table calculations', PP(`Table calculations run on the aggregated results in the view, so they depend on how the view is laid out. Quick table calcs (right-click a measure): running total, difference, percent difference, percent of total, rank, moving average, YTD. Edit “Compute Using” (table across, down, a specific dimension) to control the direction. Functions include RUNNING_SUM, WINDOW_AVG, LOOKUP, RANK, INDEX, TOTAL, FIRST, LAST.`)],
    ['Parameters', PP(`A parameter is a user-controlled value (number, date, list) used in calculations, filters or reference lines: a what-if growth rate, a top-N size, or a selector that switches which measure a chart shows (<code>CASE [Measure Choice] WHEN "Sales" THEN SUM([Sales]) WHEN "Profit" THEN SUM([Profit]) END</code>). Parameter actions let users set them by clicking marks.`)],
    ['Equivalents across tools', TBL(['Need', 'Tableau', 'DAX', 'SQL'], [['Share of total', 'Percent of total table calc, or EXCLUDE LOD', 'DIVIDE([Rev], CALCULATE([Rev], ALL(dim)))', 'SUM(x) / SUM(SUM(x)) OVER ()'], ['First order date per customer', '{FIXED [Customer] : MIN([Date])}', 'CALCULATE(MIN(orders[date]), ALLEXCEPT(orders, orders[customer_id]))', 'MIN(date) OVER (PARTITION BY customer)'], ['Running total', 'RUNNING_SUM(SUM([Sales]))', 'CALCULATE with FILTER(ALL(Date), Date <= MAX)', 'SUM(x) OVER (ORDER BY date)']])]
  ],
  snips: [
    ['Calculated fields', '', `// Profit ratio (aggregate: correct at any level of detail)
SUM([Profit]) / SUM([Sales])

// Order size band (row level)
IF [Sales] >= 500 THEN "XL"
ELSEIF [Sales] >= 100 THEN "Large"
ELSE "Small"
END

// Month start for grouping
DATETRUNC('month', [Order Date])

// Days to ship
DATEDIFF('day', [Order Date], [Ship Date])`],
    ['LOD', '', `// Each customer's first purchase month (cohort)
DATETRUNC('month', {FIXED [Customer ID] : MIN([Order Date])})

// Number of orders per customer, then count customers by that number
{FIXED [Customer ID] : COUNTD([Order ID])}

// Average sales per customer within each region in the view
AVG({INCLUDE [Customer ID] : SUM([Sales])})

// Region's share of its country's sales
SUM([Sales]) / SUM({EXCLUDE [Region] : SUM([Sales])})`],
    ['Table calcs', '', `RUNNING_SUM(SUM([Sales]))                           // running total
(SUM([Sales]) - LOOKUP(SUM([Sales]), -1)) / ABS(LOOKUP(SUM([Sales]), -1))   // % change vs previous
WINDOW_AVG(SUM([Sales]), -2, 0)                     // 3-period moving average
SUM([Sales]) / TOTAL(SUM([Sales]))                  // percent of total
RANK_DENSE(SUM([Sales]))                            // rank`],
    ['Parameters', '', `// Parameter [Top N] (integer, 5..20) used in a Top filter: Top [Top N] by SUM([Sales])

// Parameter [Measure Choice] (string list: Sales, Profit, Quantity)
CASE [Measure Choice]
  WHEN "Sales"    THEN SUM([Sales])
  WHEN "Profit"   THEN SUM([Profit])
  WHEN "Quantity" THEN SUM([Quantity])
END`]
  ],
  qs: [SQ('You need each customer’s first order date regardless of what is in the view. Which calculation?', ['RUNNING_SUM', '{FIXED [Customer ID] : MIN([Order Date])}', '{EXCLUDE [Customer ID] : MIN([Order Date])}', 'MIN([Order Date])'], 1, 'FIXED computes at exactly the customer level, independent of the view’s dimensions.'),
    SQ('A percent-of-total table calc gives 100% on every row. Why?', ['The data is wrong', '“Compute Using” is set so each partition contains only one mark; change the direction or addressing', 'Tableau can’t do percentages', 'You need an extract'], 1, 'Table calcs depend on addressing and partitioning in the view.')]
});

DAT('da-tab-dash', { name: 'Tableau dashboards & sharing', cat: 'datab',
  blurb: `Dashboards combine worksheets into one interactive page. Actions connect them: clicking a region filters the others, hovering highlights related marks. Published to Tableau Cloud or Server, dashboards refresh on schedule and respect user permissions.`,
  facts: [['Actions', 'Filter, highlight, URL, parameter, set'], ['Layout', 'Tiled & floating, containers'], ['Devices', 'Device-specific layouts'], ['Security', 'Permissions & user filters']],
  sections: [
    ['Building a dashboard', OL([`New Dashboard; set a fixed size (e.g. 1200 × 800) or automatic.`, `Drag worksheets into layout containers (horizontal/vertical) for tidy alignment.`, `Add filters (“Apply to worksheets → all using this data source”) and parameters.`, `Add actions: Dashboard → Actions → Filter (click a bar to filter others), Highlight, Go to URL, Change Parameter, Change Set Values.`, `Add titles that state the insight, a short note on definitions, and consistent colors.`, `Use Device Preview to make phone layouts.`])],
    ['Actions in detail', TBL(['Action', 'Effect', 'Example'], [['Filter', 'Selecting marks filters target sheets', 'Click a region on the map → product chart shows that region'], ['Highlight', 'Emphasizes related marks', 'Hover a category → highlight it everywhere'], ['URL', 'Opens a web page with field values', 'Open the CRM record for a customer'], ['Parameter', 'Sets a parameter from a click', 'Click a month to set the comparison period'], ['Set', 'Adds clicked marks to a set', 'Build “selected customers” on the fly'], ['Go to sheet', 'Navigates to another dashboard', 'Drill to a detail dashboard']])],
    ['Stories', PP(`A story is a sequence of story points, each a dashboard or sheet in a particular state, with captions. Use it to present an analysis step by step: the problem, the evidence, the recommendation.`)],
    ['Publishing', UL([`Publish workbooks and data sources to Tableau Cloud or Server; published data sources let many workbooks share one governed source.`, `Schedule extract refreshes; live connections need the server to reach the database.`, `Control access with projects and permissions; row-level security with user filters, USERNAME() in calculated fields, or virtual connections with data policies.`, `Subscriptions email a dashboard image on a schedule; data-driven alerts fire when a measure crosses a threshold.`, `Tableau Public is free but everything published there is public.`])],
    ['Design checklist', UL([`One question per dashboard; 3–6 views at most.`, `Most important view top-left.`, `Consistent color meaning across sheets; color-blind-safe palettes.`, `Clear filters and a reset option; show which filters are applied.`, `Fast: use extracts, limit marks and quick filters with many values, aggregate in the data source.`])]
  ],
  qs: [SQ('Clicking a region on a map should update a product bar chart on the same dashboard. Which feature?', ['A story', 'A filter dashboard action', 'An extract', 'A calculated field'], 1, 'Filter actions pass the selected mark’s values as filters to target sheets.')]
});
