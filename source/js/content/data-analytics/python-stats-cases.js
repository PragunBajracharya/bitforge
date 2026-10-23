/* ===== Data analytics D: Python, statistics, communication, cases ===== */
DAT('da-pandas', { name: 'Python & pandas for analysis', cat: 'dapy',
  blurb: `pandas is Python’s table library: a DataFrame is a spreadsheet you control with code. Everything you do in Excel or SQL (filter, sort, join, group, pivot) has a pandas equivalent, but scripted, repeatable and fast on millions of rows.`,
  facts: [['Table', 'DataFrame'], ['Column', 'Series'], ['Environment', 'Jupyter notebooks'], ['Install', 'pip install pandas']],
  sections: [
    ['Why Python for analysts', UL([`Repeatability: a script reruns the whole analysis on new data.`, `Scale: millions of rows that would crash Excel.`, `Breadth: statistics (scipy, statsmodels), visualization (matplotlib, seaborn, plotly), machine learning (scikit-learn), APIs and automation.`, `Jupyter notebooks mix code, results, charts and notes, which makes analysis easy to share and review.`])],
    ['Core operations', TBL(['Task', 'pandas', 'SQL equivalent'], [['Load', 'pd.read_csv, read_excel, read_sql', 'FROM'], ['Select columns', "df[['a', 'b']]", 'SELECT a, b'], ['Filter rows', "df[df.amount > 100] or df.query('amount > 100')", 'WHERE'], ['New column', 'df.assign(tax=df.amount * 0.08)', 'SELECT amount * 0.08 AS tax'], ['Sort', "df.sort_values('amount', ascending=False)", 'ORDER BY'], ['Group & aggregate', "df.groupby('region').agg(rev=('amount', 'sum'))", 'GROUP BY'], ['Join', "df.merge(other, on='key', how='left')", 'LEFT JOIN'], ['Stack', 'pd.concat([a, b])', 'UNION ALL'], ['Pivot', "df.pivot_table(index='region', columns='month', values='amount', aggfunc='sum')", 'Conditional aggregation'], ['Unpivot', "df.melt(id_vars='region', var_name='month', value_name='sales')", 'UNPIVOT'], ['Window', "df.groupby('c')['amount'].cumsum(), .rank(), .shift(), .rolling(3)", 'OVER (…)']])],
    ['Cleaning', UL([`<code>df.info()</code>, <code>df.describe()</code>, <code>df.isna().sum()</code> for a first look.`, `Types: <code>pd.to_datetime</code>, <code>pd.to_numeric(errors='coerce')</code>, <code>.astype('category')</code>.`, `Missing values: <code>dropna</code>, <code>fillna</code>, or flag them.`, `Duplicates: <code>drop_duplicates(subset=['order_id'])</code>.`, `Text: <code>.str.strip().str.lower()</code>, <code>.str.contains</code>, <code>.str.extract</code>.`, `Dates: <code>.dt.to_period('M')</code>, <code>.dt.dayofweek</code>.`])],
    ['Habits that prevent bugs', UL([`Check shapes (<code>df.shape</code>) after every merge; use <code>validate='many_to_one'</code> in merge to catch duplicate keys.`, `Avoid chained assignment warnings: use <code>.loc[row_mask, 'col'] = value</code>.`, `Keep raw data untouched; write cleaned outputs to new files.`, `Put reusable steps in functions; restart the notebook and run all before sharing.`])]
  ],
  snips: [
    ['Load & explore', 'python', `import pandas as pd

orders = pd.read_csv("orders.csv", parse_dates=["order_date"])
customers = pd.read_csv("customers.csv")

orders.head()
orders.info()
orders.describe()
orders["status"].value_counts()
orders.isna().sum()`],
    ['Clean & join', 'python', `orders = (orders
          .drop_duplicates(subset="order_id")
          .assign(status=lambda d: d.status.str.strip().str.lower(),
                  amount=lambda d: pd.to_numeric(d.amount, errors="coerce"))
          .query("status != 'test'"))

df = orders.merge(customers, on="customer_id", how="left", validate="many_to_one")
assert len(df) == len(orders)          # the join must not add rows`],
    ['Group & pivot', 'python', `completed = df[df.status == "completed"]

by_region = (completed.groupby("region")
             .agg(revenue=("amount", "sum"), orders=("order_id", "count"),
                  customers=("customer_id", "nunique"))
             .assign(aov=lambda d: d.revenue / d.orders)
             .sort_values("revenue", ascending=False))

monthly = completed.pivot_table(index=completed.order_date.dt.to_period("M"),
                                columns="region", values="amount",
                                aggfunc="sum", fill_value=0)
monthly.pct_change()                   # month-over-month growth by region`],
    ['SQL from Python', 'python', `import sqlite3
import pandas as pd

con = sqlite3.connect("shop.db")
top = pd.read_sql("""
    SELECT c.region, SUM(o.amount) AS revenue
    FROM orders o JOIN customers c USING (customer_id)
    WHERE o.status = 'completed'
    GROUP BY c.region
""", con)
top.to_excel("revenue_by_region.xlsx", index=False)   # hand results to Excel users`]
  ],
  qs: [SQ('After df.merge(customers, on="customer_id"), the row count grew. What does that indicate?', ['Nothing unusual', 'customers has duplicate customer_id values, so orders matched several rows', 'The merge was inner', 'pandas added NaN rows'], 1, 'A many-to-one join should keep the row count; validate="many_to_one" would have raised an error.')]
});

DAT('da-pyviz', { name: 'Charts: choosing & building them', cat: 'dacomm',
  blurb: `The right chart makes the answer obvious; the wrong one hides it. Choose by the question: comparison, trend, distribution, relationship or composition. Then remove everything that doesn’t help the reader see the point.`,
  facts: [['Compare categories', 'Bar chart'], ['Trend over time', 'Line chart'], ['Distribution', 'Histogram / box plot'], ['Relationship', 'Scatter plot']],
  sections: [
    ['Chart chooser', TBL(['Question', 'Chart', 'Avoid'], [['How do categories compare?', 'Horizontal bar (sorted)', '3D bars, pie charts with many slices'], ['How did it change over time?', 'Line chart (column for few periods)', 'Unevenly spaced dates on a category axis'], ['How are values distributed?', 'Histogram, box plot, violin', 'Showing only the average'], ['Are two numbers related?', 'Scatter plot (+ trend line)', 'Dual-axis charts that imply a relationship'], ['What is it made of?', 'Stacked bar, 100% bar; pie/donut only for 2–4 parts', 'Pie with 10 slices'], ['How do we do against target?', 'Bullet chart, KPI card with variance', 'Gauges that waste space'], ['Where?', 'Filled or symbol map', 'Maps when geography isn’t the point'], ['How does it flow?', 'Funnel, Sankey', '']])],
    ['Design principles', UL([`Start bar-chart axes at zero (lines may zoom in, with clear labels).`, `Sort bars by value unless the categories have a natural order.`, `Use one highlight color for the point and grey for context.`, `Label directly instead of using legends where possible.`, `Remove chart junk: heavy gridlines, borders, 3D, shadows, unnecessary decimals.`, `Title with the takeaway: “Repeat customers drove 64% of Q3 revenue”.`, `Use color-blind-safe palettes and don’t rely on red vs green alone.`])],
    ['Python plotting libraries', TBL(['Library', 'Strength'], [['matplotlib', 'Full control; the foundation of most others'], ['seaborn', 'Statistical charts with good defaults (histograms, box plots, heatmaps)'], ['plotly', 'Interactive charts for notebooks and web apps'], ['pandas .plot()', 'Quick charts straight from a DataFrame']])]
  ],
  snips: [
    ['matplotlib', 'python', `import matplotlib.pyplot as plt

by_region = by_region.sort_values("revenue")          # sorted for a horizontal bar chart
fig, ax = plt.subplots(figsize=(7, 4))
colors = ["#bbbbbb"] * (len(by_region) - 1) + ["#3b7d23"]   # highlight the top region
ax.barh(by_region.index, by_region.revenue, color=colors)
ax.set_title("West leads revenue in 2026", loc="left", fontweight="bold")
ax.spines[["top", "right"]].set_visible(False)
for i, v in enumerate(by_region.revenue):
    ax.text(v, i, f" {v:,.0f}", va="center")
plt.tight_layout(); plt.savefig("revenue_by_region.png", dpi=150)`],
    ['seaborn', 'python', `import seaborn as sns
import matplotlib.pyplot as plt

sns.histplot(data=orders, x="amount", bins=40)                 # distribution
plt.show()
sns.boxplot(data=df, x="region", y="amount")                   # compare distributions
plt.show()
sns.lineplot(data=monthly_long, x="month", y="revenue", hue="region")   # trends
plt.show()
sns.heatmap(retention_table, annot=True, fmt=".0%", cmap="Greens")      # cohort triangle`],
    ['Excel', '', `1. Select the summary table (e.g., a PivotTable) → Insert → Recommended Charts.
2. Bar chart: sort the source descending; Format Axis → Categories in reverse order.
3. Delete the legend if only one series; add Data Labels.
4. Chart Title: write the insight, not "Sum of amount by region".
5. Format → Fill: grey for all bars, then click one bar twice and color it to highlight.`]
  ],
  qs: [SQ('You want to show how order values are spread, including outliers. Best chart?', ['Pie chart', 'Histogram or box plot', 'Line chart', 'Gauge'], 1, 'Distributions need histograms or box plots; averages alone hide the shape.')]
});

DAT('da-abtest', { name: 'Inferential statistics & A/B testing', cat: 'dafound',
  blurb: `Is the new checkout really better, or did we get lucky? Inferential statistics answers that. An A/B test randomly splits users between versions and uses a hypothesis test and confidence interval to decide whether the difference is likely real.`,
  facts: [['Significance level', 'α = 0.05 typical'], ['Power', '80% typical'], ['Output', 'p-value + confidence interval'], ['Key rule', 'Decide sample size in advance']],
  sections: [
    ['Samples and uncertainty', PP(`We measure a sample (this month’s visitors) to learn about a population (all future visitors). Different samples give different results; the standard error describes how much a metric would wobble from sample to sample. For a conversion rate p measured on n users, SE = √(p(1 − p)/n). Bigger samples → smaller standard errors → more precise estimates.`)],
    ['Hypothesis testing in plain words', OL([`Null hypothesis H₀: the new version makes no difference.`, `Collect data and compute a test statistic (for conversion rates, a two-proportion z-test).`, `The p-value is the probability of seeing a difference at least this large if H₀ were true.`, `If p &lt; α (0.05), reject H₀: the difference is statistically significant.`, `Report the effect size with a 95% confidence interval (e.g., +1.2 percentage points, CI 0.3 to 2.1), not just “significant”.`]) + CO('Remember:', `a p-value is not the probability that the new version is better, and “not significant” does not mean “no effect”. It may just mean too little data.`)],
    ['Designing an A/B test', UL([`Pick one primary metric (conversion rate, revenue per visitor) and guardrail metrics (refunds, latency).`, `Randomize by user, not by visit, and keep assignment stable.`, `Compute the sample size from the baseline rate, the minimum detectable effect, α and power, and run for full weeks to cover weekday patterns.`, `Don’t stop the test early when it first looks significant (“peeking” inflates false positives), unless you use sequential testing methods.`, `Check sample ratio mismatch: a 50/50 split should be close to 50/50; if not, assignment is broken.`, `Beware of novelty effects and multiple comparisons (testing many metrics or segments raises false positives; adjust α).`])],
    ['Which test?', TBL(['Data', 'Test'], [['Two conversion rates', 'Two-proportion z-test or chi-square test'], ['Two means (revenue per user)', 'Welch’s t-test (or bootstrap for skewed data)'], ['Before/after on the same units', 'Paired t-test'], ['More than two groups', 'ANOVA / chi-square, then pairwise tests with correction'], ['Relationship between variables', 'Correlation, linear or logistic regression']])]
  ],
  snips: [
    ['Python', 'python', `from statsmodels.stats.proportion import proportions_ztest, confint_proportions_2indep
from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportion_effectsize

conversions = [530, 600]       # A, B
visitors    = [10_000, 10_000]
z, p = proportions_ztest(conversions, visitors)
low, high = confint_proportions_2indep(conversions[1], visitors[1], conversions[0], visitors[0])
print(f"A {530/10000:.2%}  B {600/10000:.2%}  z={z:.2f}  p={p:.4f}")
print(f"95% CI for B − A: {low:.2%} to {high:.2%}")

# Sample size per group to detect 5.0% → 5.5% with 80% power, α = 0.05
es = proportion_effectsize(0.055, 0.05)
n = NormalIndPower().solve_power(effect_size=es, alpha=0.05, power=0.8)
print(round(n), "users per group")`],
    ['Excel', '', `' A: conversions B2, visitors C2;  B: conversions B3, visitors C3
pA  = B2/C2                 pB = B3/C3
pooled = (B2+B3)/(C2+C3)
SE  = SQRT(pooled*(1-pooled)*(1/C2+1/C3))
z   = (pB - pA) / SE
p-value (two-sided) = 2*(1 - NORM.S.DIST(ABS(z), TRUE))
95% CI of difference = (pB-pA) ± 1.96*SQRT(pA*(1-pA)/C2 + pB*(1-pB)/C3)`],
    ['SQL', 'sql', `-- Per-variant results from an experiment assignment table
SELECT a.variant,
       COUNT(DISTINCT a.user_id)                                   AS users,
       COUNT(DISTINCT CASE WHEN o.order_id IS NOT NULL THEN a.user_id END) AS converters,
       ROUND(100.0 * COUNT(DISTINCT CASE WHEN o.order_id IS NOT NULL THEN a.user_id END)
             / COUNT(DISTINCT a.user_id), 2)                       AS conversion_pct
FROM assignments a
LEFT JOIN orders o
       ON o.customer_id = a.user_id AND o.order_date >= a.assigned_at
GROUP BY a.variant;`]
  ],
  qs: [SQ('An A/B test shows p = 0.03. What does that mean?', ['There is a 97% chance B is better', 'If there were truly no difference, a gap this large would happen about 3% of the time', 'B is 3% better', 'The test was 3% too short'], 1, 'The p-value is computed assuming the null hypothesis is true.'),
    SQ('Why not stop the test the first day it becomes significant?', ['It costs more', 'Repeatedly checking and stopping at the first significant result inflates false positives', 'Significance can’t change', 'Tools forbid it'], 1, 'Fix the sample size in advance or use a sequential method designed for peeking.')]
});

DAT('da-story', { name: 'KPIs, dashboards & storytelling', cat: 'dacomm',
  blurb: `Analysis only matters if it changes a decision. Define metrics precisely, build dashboards for monitoring and reports for decisions, and present findings as a short story: the situation, the insight, the recommendation.`,
  facts: [['Structure', 'Situation → insight → action'], ['Good KPI', 'Clear, owned, actionable'], ['Dashboards', 'Monitor'], ['Reports', 'Decide']],
  sections: [
    ['Defining metrics', UL([`Write the exact definition: “Active customer = placed at least one completed order in the last 90 days, excluding test and staff accounts.”`, `Specify grain, filters, time zone and how refunds and cancellations count.`, `Distinguish leading indicators (sign-ups, trials) from lagging ones (revenue, churn).`, `Pair metrics to avoid gaming: conversion rate with average order value; speed with quality.`, `Keep one source of truth: a shared view, dbt model or Power BI semantic model.`])],
    ['Dashboards vs analyses', TBL(['', 'Dashboard', 'Analysis / report'], [['Purpose', 'Monitor known metrics over time', 'Answer a specific question once'], ['Audience', 'Many users, repeatedly', 'Decision makers, once'], ['Shape', 'KPIs, trends, filters', 'A narrative with a few focused charts'], ['Success', 'People check it and notice changes', 'A decision was made']])],
    ['Telling the story', OL([`<b>Start with the answer:</b> “Revenue fell 8% because repeat purchases dropped in the West after the shipping-fee change.”`, `<b>Show the evidence:</b> two or three charts, each making one point, titled with that point.`, `<b>Quantify the impact</b> and your confidence in it.`, `<b>Recommend an action</b> and what you would measure next.`, `Put methods, caveats and extra charts in an appendix.`]) + PP(`Tailor depth to the audience: executives want the decision and the impact; peers want the method.`)],
    ['Common pitfalls', UL([`Reporting numbers without comparison (versus last period, target or benchmark).`, `Simpson’s paradox: a trend that reverses when data is split by group; check key segments.`, `Survivorship bias: analyzing only customers who stayed.`, `Correlation presented as causation.`, `Dashboards with 30 charts and no clear question.`])]
  ],
  qs: [SQ('Which is the best opening line for a findings presentation?', ['“First, I loaded the data from three tables…”', '“Revenue fell 8%, mainly from fewer repeat orders in the West after the shipping-fee change; I recommend testing a free-shipping threshold.”', '“Here are 25 charts.”', '“The p-value was 0.04.”'], 1, 'Lead with the insight and the recommendation; methods come later.')]
});

/* ---------- Case studies ---------- */
DAT('da-case-sales', { name: 'Project: sales performance dashboard', cat: 'dacase',
  blurb: `An end-to-end project that uses every tool in the track: extract sales data with SQL, prototype in Excel, model it in Power BI (or Tableau), and deliver a dashboard that answers “how are we doing, and where should we focus?”`,
  facts: [['Data', 'orders, customers, products'], ['Tools', 'SQL → Power Query → DAX'], ['Output', 'Executive dashboard'], ['Time', '1–2 days']],
  dg: { w: 900, h: 250,
    n: [['db', 'Sales database', 85, 125, 'db'], ['sql', 'SQL views', 270, 125, 'worker', 'clean star schema'], ['pq', 'Power Query', 450, 125, 'worker', 'types, date table'], ['m', 'Model + DAX', 620, 125, 'db', 'Revenue, YoY %'], ['dash', 'Dashboard', 800, 60, 'client', 'KPIs, trends'], ['svc', 'Service', 800, 190, 'cdn', 'refresh, RLS']],
    e: [['db', 'sql', 'SELECT'], ['sql', 'pq', 'import'], ['pq', 'm', 'load'], ['m', 'dash'], ['dash', 'svc', 'publish']] },
  cap: `The project pipeline, from raw tables to a shared, refreshing dashboard.`,
  walk: [[['db', 'sql', 'db>sql'], `Write SQL views that produce a clean star schema: fact_sales at order-line grain and dimensions for customer, product and date. Agree on definitions (completed orders only, net of refunds).`], [['pq', 'sql>pq'], `Import the views into Power BI. In Power Query set types and build (or import) the date table.`], [['m', 'pq>m'], `Create relationships and measures: Revenue, Orders, AOV, Customers, Revenue PY, YoY %, Margin %.`], [['dash', 'm>dash'], `Design one page: KPI cards with YoY, monthly trend, revenue by region and category, top products, and slicers for year and region. Add a drill-through page per customer.`], [['svc', 'dash>svc'], `Publish, schedule daily refresh, add row-level security by region, and share as an app.`]],
  sections: [
    ['The brief', PP(`“Leadership wants one place to see sales performance: are we growing, which regions and categories drive it, who are our best customers, and where are we slipping?” Clarify: which time comparisons (YoY, MoM), which definitions (net or gross revenue), who views it, and how fresh it must be (daily).`)],
    ['Step 1: SQL extract', PP(`<code>CREATE VIEW fact_sales AS SELECT oi.order_id, o.order_date, o.customer_id, oi.product_id, oi.quantity, oi.quantity * p.price AS revenue FROM order_items oi JOIN orders o USING (order_id) JOIN products p USING (product_id) WHERE o.status = 'completed';</code> plus dim_customer and dim_product views. Validate totals against finance’s monthly numbers.`)],
    ['Step 2: Excel prototype (optional)', PP(`A quick PivotTable of revenue by month and region, shown to stakeholders, confirms the layout and definitions before investing in the full build.`)],
    ['Step 3: model & measures', TBL(['Measure', 'DAX'], [['Revenue', 'SUM(fact_sales[revenue])'], ['Orders', 'DISTINCTCOUNT(fact_sales[order_id])'], ['AOV', 'DIVIDE([Revenue], [Orders])'], ['Revenue PY', "CALCULATE([Revenue], SAMEPERIODLASTYEAR('Date'[Date]))"], ['YoY %', 'DIVIDE([Revenue] - [Revenue PY], [Revenue PY])'], ['Active customers', 'DISTINCTCOUNT(fact_sales[customer_id])']])],
    ['Step 4: dashboard design', UL([`Row 1: KPI cards (Revenue, Orders, AOV, Customers) each with YoY % in green/red.`, `Row 2: monthly revenue line (this year vs last year) and revenue by region bar.`, `Row 3: category × month matrix with conditional formatting, and a top-10 products table.`, `Slicers: year, region, category. Drill-through: customer detail page.`, `Tableau version: the same sheets, with filter actions instead of slicers and a FIXED LOD for first-order cohorts.`])],
    ['Step 5: deliver', UL([`Publish, schedule refresh, set RLS for regional managers.`, `Write a one-paragraph “how to read this” note and metric definitions on the page.`, `Present the first insights: “Revenue +12% YoY, but the North declined 6% since March; its repeat-order rate fell from 38% to 29%.”`])]
  ],
  qs: [SQ('Why validate your SQL totals against finance’s numbers before building visuals?', ['Finance requires it', 'Definitions and filters often differ; fixing mismatches early prevents a dashboard nobody trusts', 'Power BI needs it', 'It speeds up refresh'], 1, 'Trust is the main product of a dashboard; reconcile first.')]
});

DAT('da-case-ab', { name: 'Project: analyzing an A/B test', cat: 'dacase',
  blurb: `A checkout redesign was tested on 20,000 users. You pull the results with SQL, check the experiment is valid, test significance in Python or Excel, look at guardrails and segments, and write a recommendation.`,
  facts: [['Users', '2 × 10,000'], ['Metric', 'Conversion rate'], ['Result', '5.3% → 6.0%'], ['Decision', 'Ship, with monitoring']],
  sections: [
    ['The setup', PP(`Variant A (current checkout) and B (one-page checkout) were assigned 50/50 by user ID for two full weeks. Primary metric: purchase conversion within 7 days of assignment. Guardrails: average order value, refund rate, page load time. Planned sample: 10,000 per group, enough to detect 5.0% → 5.8% with 80% power.`)],
    ['1 · Validate the experiment', UL([`Sample ratio: 10,040 vs 9,960 users. A chi-square test gives p ≈ 0.57: no sample ratio mismatch.`, `Assignment balanced across devices and regions (compare proportions).`, `No overlap: each user in exactly one variant.`, `Test ran for the planned 14 days; no early stopping.`])],
    ['2 · Primary result', TBL(['Variant', 'Users', 'Converters', 'Conversion'], [['A', '10,040', '532', '5.30%'], ['B', '9,960', '598', '6.00%']]) +
      PP(`Difference +0.70 percentage points (+13% relative). Two-proportion z-test: z ≈ 2.16, p ≈ 0.031. 95% CI for the difference ≈ +0.07 to +1.35 points. Significant at α = 0.05, and the whole interval is positive.`)],
    ['3 · Guardrails and segments', UL([`AOV: $64.10 vs $63.40 (Welch’s t-test p ≈ 0.6): no meaningful change.`, `Refund rate unchanged; page load time slightly better.`, `Mobile shows the biggest lift (+1.1 points), desktop +0.3 (not significant alone). Treat segment results as hypotheses, since many segments mean many tests.`])],
    ['4 · Recommendation', PP(`“Ship the one-page checkout. It raised conversion from 5.3% to 6.0% (95% CI +0.1 to +1.3 points) with no harm to order value or refunds. At about 300,000 checkout visitors a month that is roughly 2,100 extra orders (≈ $135K). Monitor conversion for four weeks after launch to confirm the effect holds, and consider a mobile-specific follow-up test.”`)]
  ],
  snips: [
    ['Python', 'python', `from statsmodels.stats.proportion import proportions_ztest, confint_proportions_2indep
from scipy.stats import chisquare

users, conv = [10_040, 9_960], [532, 598]
print("SRM p =", chisquare(users).pvalue)                  # ≈ 0.57: split is fine
z, p = proportions_ztest(conv[::-1], users[::-1])          # B vs A
lo, hi = confint_proportions_2indep(conv[1], users[1], conv[0], users[0])
print(f"z = {z:.2f}, p = {p:.3f}, CI = [{lo:.4f}, {hi:.4f}]")`]
  ],
  qs: [SQ('Variant assignment came out 10,800 vs 9,200 users on an intended 50/50 split. What should you do first?', ['Celebrate the bigger group', 'Investigate a sample ratio mismatch before trusting any result', 'Ignore it', 'Drop the smaller group'], 1, 'A large imbalance signals broken assignment or logging, which can bias every metric.')]
});

DAT('da-case-churn', { name: 'Project: customer retention & churn', cat: 'dacase',
  blurb: `Subscriptions are flat despite strong sign-ups. You build cohort retention with SQL, segment customers with RFM, find who churns and why, and size the opportunity, then present it in a dashboard.`,
  facts: [['Method', 'Cohorts + RFM'], ['Tools', 'SQL, Python, Power BI/Tableau'], ['Finding', 'Month-2 drop-off'], ['Action', 'Onboarding fix']],
  dg: { w: 860, h: 240,
    n: [['o', 'Orders', 85, 120, 'db'], ['c', 'Cohort query', 270, 50, 'worker', 'first-order month'], ['r', 'RFM scores', 270, 190, 'worker', 'NTILE(4)'], ['p', 'Python', 470, 120, 'box', 'retention curves'], ['d', 'Dashboard', 660, 120, 'client', 'cohort heatmap'], ['a', 'Action', 810, 120, 'user', 'onboarding fix']],
    e: [['o', 'c'], ['o', 'r'], ['c', 'p'], ['r', 'p'], ['p', 'd'], ['d', 'a']] },
  cap: `From raw orders to an action: cohort and RFM queries feed a retention analysis and a dashboard that points to where customers are lost.`,
  walk: [[['o', 'c', 'o>c'], `Assign every customer to the month of their first order and count how many are still ordering 1, 2, 3… months later (the cohort query from the SQL analytics topic).`], [['o', 'r', 'o>r'], `Score customers on recency, frequency and monetary value to separate champions, at-risk and lost customers.`], [['p', 'c>p', 'r>p'], `In Python, plot retention curves per cohort and compare segments: which channel, first product or region retains best?`], [['d', 'a', 'p>d', 'd>a'], `Show the cohort heatmap in a dashboard. The biggest drop is between months 1 and 2, worst for customers whose first order was discounted. Recommendation: an onboarding sequence and a second-purchase incentive, measured with an A/B test.`]],
  sections: [
    ['Defining churn', PP(`For subscriptions, churn is a cancellation. For non-subscription shops, define it by inactivity: “no completed order in 90 days”. Choose the window from data: look at the distribution of days between orders (the 80th–90th percentile is a common choice).`)],
    ['Analysis plan', OL([`Cohort retention triangle by first-order month (SQL, heatmap in Power BI or seaborn).`, `Retention curves by acquisition channel, first product and discount use.`, `RFM segmentation to size groups: champions, loyal, at risk, lost.`, `Time between first and second order: the critical moment for most businesses.`, `Quantify: if month-2 retention rose from 30% to 35%, how much revenue would that add over a year?`])],
    ['Typical findings and actions', TBL(['Finding', 'Action', 'How to measure'], [['Big drop after the first order', 'Onboarding emails, second-order incentive', 'A/B test on new customers'], ['Discount-acquired customers churn faster', 'Shift acquisition spend; target full-price buyers', 'Cohort comparison over time'], ['At-risk high-value customers', 'Personal outreach, win-back offers', 'Win-back rate in the segment'], ['One region retains worse', 'Investigate delivery times, stock-outs', 'Region retention trend']])],
    ['Presenting it', PP(`Lead with the money: “We lose 70% of new customers before their second order; raising month-2 retention by 5 points is worth about $480K a year.” Then show the cohort heatmap, the comparison by first-order discount, and the proposed test.`)]
  ],
  qs: [SQ('Why analyze retention by cohort instead of a single overall retention number?', ['It is easier', 'Cohorts separate changes in customer quality over time from customer age; the overall number mixes them', 'Cohorts use less data', 'Dashboards require cohorts'], 1, 'An overall rate can look stable while newer cohorts retain much worse.')]
});
