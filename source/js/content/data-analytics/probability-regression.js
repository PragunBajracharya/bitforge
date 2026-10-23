/* ===== Data analytics E: probability and regression ===== */
DAT('da-prob', { name: 'Probability for analysts', cat: 'dafound',
  blurb: `Probability is the language behind sampling, A/B tests, forecasts and risk. Analysts need a working toolkit: basic rules, conditional probability and Bayes’ theorem, expected value, and the handful of distributions that describe real data (binomial, Poisson, normal).`,
  facts: [['Range', '0 to 1'], ['Key rule', 'P(A|B) = P(A∩B) / P(B)'], ['Bayes', 'update beliefs with evidence'], ['Workhorse', 'normal distribution']],
  sections: [
    ['The basic rules', TBL(['Rule', 'Formula', 'Example'], [['Complement', 'P(not A) = 1 − P(A)', 'P(at least one signup in 3 visits) = 1 − P(none)'], ['Addition', 'P(A or B) = P(A) + P(B) − P(A and B)', 'Users on mobile or from ads'], ['Multiplication (independent)', 'P(A and B) = P(A) · P(B)', 'Two independent servers both down'], ['Conditional', 'P(A | B) = P(A and B) / P(B)', 'P(buy | added to cart)']]) +
      PP(`Independence is an assumption to check, not a default: two servers in the same rack are not independent, and a user’s sessions are not independent of each other.`)],
    ['Bayes’ theorem', PP(`P(A | B) = P(B | A) · P(A) / P(B). It turns “how likely is the evidence if the hypothesis is true” into “how likely is the hypothesis given the evidence”. The base rate P(A) matters enormously.`) +
      CO('Example:', 'A fraud model flags 99% of fraud and 2% of legitimate payments. If 0.5% of payments are fraud, P(fraud | flagged) = 0.99 × 0.005 / (0.99 × 0.005 + 0.02 × 0.995) ≈ 20%. Four in five flags are false alarms because fraud is rare.')],
    ['Expected value and variance', PP(`Expected value is the probability-weighted average outcome: a promotion that costs $5 per user and lifts conversion 2 points on a $60 order is worth 0.02 × 60 − 5 = −$3.80 per user. Variance measures spread; for decisions with big downside, the spread matters as much as the mean.`)],
    ['Distributions you will meet', TBL(['Distribution', 'Describes', 'Mean / variance', 'Example'], [['Bernoulli / binomial', 'Number of successes in n yes/no trials', 'np / np(1 − p)', 'Conversions out of 1,000 visitors'], ['Poisson', 'Count of events in a fixed interval', 'λ / λ', 'Support tickets per hour'], ['Exponential', 'Time between Poisson events', '1/λ', 'Time until the next order'], ['Normal', 'Sums and averages of many small effects', 'μ / σ²', 'Sample means (central limit theorem)'], ['Log-normal', 'Positive, right-skewed values', '—', 'Order values, session lengths, incomes']])],
    ['The central limit theorem', PP(`Averages of many independent observations are approximately normal, whatever the shape of the original data, with standard error σ / √n. This is why confidence intervals and t-tests work for conversion rates and revenue means, and why quadrupling the sample halves the uncertainty.`)]
  ],
  snips: [['Python', 'python', `from scipy import stats

# Binomial: P(at least 60 conversions out of 1,000 if p = 5%)
print(1 - stats.binom.cdf(59, n=1000, p=0.05))        # ≈ 0.08

# Poisson: tickets per hour average 4; P(10 or more in an hour)
print(1 - stats.poisson.cdf(9, mu=4))                  # ≈ 0.008

# Normal: share of orders above $100 if mean $70, sd $20
print(1 - stats.norm.cdf(100, loc=70, scale=20))       # ≈ 0.067

# Bayes: fraud example
p_f, tpr, fpr = 0.005, 0.99, 0.02
print(tpr * p_f / (tpr * p_f + fpr * (1 - p_f)))       # ≈ 0.199`],
    ['Excel', null, `=BINOM.DIST(59, 1000, 0.05, TRUE)        → P(X ≤ 59)
=1 - POISSON.DIST(9, 4, TRUE)             → P(X ≥ 10)
=1 - NORM.DIST(100, 70, 20, TRUE)         → P(order > $100)
=NORM.INV(0.95, 70, 20)                   → 95th percentile order value
=0.99*0.005/(0.99*0.005+0.02*0.995)       → Bayes`],
    ['SQL', 'sql', `-- Empirical conditional probability: P(purchase | added to cart)
SELECT
  AVG(CASE WHEN purchased THEN 1.0 ELSE 0 END) AS p_purchase_given_cart
FROM sessions
WHERE added_to_cart;`]],
  edge: [`Confusing P(A | B) with P(B | A) (the prosecutor’s fallacy).`, `Assuming independence between events that share a cause.`, `Using the normal distribution for heavily skewed data with small samples.`, `Treating a rare event that “never happened” in your data as impossible.`],
  faq: [['What is the difference between independent and mutually exclusive events?', PP(`Mutually exclusive events can’t both happen (P(A and B) = 0). Independent events don’t affect each other (P(A and B) = P(A)P(B)). Two mutually exclusive events with non-zero probability are actually dependent: knowing one happened tells you the other didn’t.`)],
    ['Why do analysts care about the central limit theorem?', PP(`It justifies treating sample means and proportions as approximately normal, which is what confidence intervals and most A/B test calculations rely on, even when the underlying data (revenue, time on site) is skewed.`)],
    ['Explain Bayes’ theorem with a business example.', PP(`A lead-scoring model flags 90% of buyers and 10% of non-buyers. If 5% of leads buy, a flagged lead buys with probability 0.9 × 0.05 / (0.9 × 0.05 + 0.1 × 0.95) ≈ 32%. The low base rate keeps precision modest.`)]],
  qs: [SQ('A test is 99% sensitive and 98% specific; the condition affects 1 in 200. Roughly what share of positives are true?', ['99%', '50%', '20%', '1%'], 2, '0.99·0.005 / (0.99·0.005 + 0.02·0.995) ≈ 0.2.'),
    SQ('Which distribution fits “number of support tickets per hour”?', ['Normal', 'Poisson', 'Uniform', 'Exponential'], 1, 'Counts of independent events in a fixed interval.'),
    SQ('To halve the standard error of a sample mean, you need…', ['2× the sample', '4× the sample', '√2× the sample', 'half the sample'], 1, 'Standard error ∝ 1/√n.')]
});
DP('da-prob', { work: ['Sizing experiments, estimating risk, forecasting staffing from arrival rates, interpreting model alerts.'],
  fu: [['How would you estimate the probability a user churns this month from historical data?', 'Use the empirical rate in comparable cohorts (same tenure, plan), with a confidence interval; for individual users, a logistic regression or survival model.'],
    ['When is the Poisson assumption wrong for event counts?', 'When events cluster (outages cause ticket bursts) or rates vary by time of day; the variance then exceeds the mean (overdispersion), better modeled by a negative binomial.'],
    ['What is the birthday problem and where does it show up?', 'With 23 people there’s a 50% chance two share a birthday. It explains hash collisions and duplicate random IDs far sooner than intuition expects.']],
  deep: [['Edge case', 'Rare events: with zero occurrences in n trials, a rough 95% upper bound on the rate is 3/n (rule of three).'],
    ['Failure mode', 'Base-rate neglect when reading model precision for rare classes.'],
    ['In real systems', 'Call centers size staff with Erlang C (Poisson arrivals); fraud teams tune thresholds with Bayes-style precision trade-offs.']],
  src: ['Blitzstein & Hwang, Introduction to Probability 2nd ed. (free online)', 'https://projects.iq.harvard.edu/stat110/home'] });

DAT('da-regression', { name: 'Regression & forecasting', cat: 'dafound',
  blurb: `Regression estimates how an outcome changes with one or more inputs: how revenue moves with ad spend, which factors predict churn, what next month’s demand will be. Learn to fit and read linear and logistic regression, check assumptions, and avoid the classic traps.`,
  facts: [['Linear', 'y = b₀ + b₁x + …'], ['Fit', 'least squares'], ['Binary outcome', 'logistic regression'], ['Fit quality', 'R², RMSE']],
  sections: [
    ['Simple linear regression', PP(`A line ŷ = b₀ + b₁x chosen to minimize the sum of squared errors. The slope b₁ is the average change in y for a one-unit change in x: “each extra $1,000 of ad spend is associated with 42 more orders”. The intercept is the predicted y at x = 0, often meaningless outside the data range.`)],
    ['Reading the output', TBL(['Number', 'Meaning', 'Watch out'], [['Coefficient', 'Change in y per unit of x, holding other inputs fixed', 'Units matter; standardize to compare'], ['p-value / CI', 'Whether the coefficient is distinguishable from 0', 'Significant ≠ important'], ['R²', 'Share of variance in y explained', 'Rises with every added variable; use adjusted R²'], ['Residuals', 'Actual − predicted', 'Plot them: patterns mean the model is missing something'], ['RMSE / MAE', 'Typical prediction error in y’s units', 'Evaluate on held-out data']])],
    ['Multiple regression and confounding', PP(`Adding variables lets you estimate each effect while holding others constant. Ice-cream sales “predict” drownings until you add temperature. Regression shows association; causal claims need an experiment or a strong design (difference-in-differences, instrumental variables).`) +
      UL([`Multicollinearity: highly correlated inputs make individual coefficients unstable.`, `Categorical inputs become dummy variables (one fewer than categories).`, `Log transforms turn multiplicative effects into additive ones: a coefficient on log(x) means “per 1% change”.`])],
    ['Logistic regression', PP(`For yes/no outcomes (churned, converted), logistic regression models the log-odds as a linear function, producing probabilities between 0 and 1. A coefficient’s exponent is an odds ratio: e^0.4 ≈ 1.5 means 50% higher odds per unit increase. Evaluate with AUC, precision/recall and calibration.`)],
    ['Forecasting time series', UL([`Start with baselines: last value, same period last year, moving average. Many fancy models fail to beat them.`, `Decompose into trend, seasonality (weekly, yearly) and noise; Excel’s FORECAST.ETS and Python’s statsmodels/Prophet handle this.`, `Validate by back-testing: train on data up to a cutoff, forecast the next period, compare, repeat.`, `Always show a prediction interval, not just a line.`])]
  ],
  snips: [['Python', 'python', `import pandas as pd
import statsmodels.formula.api as smf

df = pd.read_csv("marketing.csv")            # week, ad_spend, price, orders
model = smf.ols("orders ~ ad_spend + price", data=df).fit()
print(model.summary().tables[1])             # coefficients, std err, p-values, CIs
print("R2:", round(model.rsquared, 3))

# Logistic regression for churn
churn = smf.logit("churned ~ tenure_months + support_tickets + C(plan)", data=pd.read_csv("users.csv")).fit()
print(churn.params.apply(lambda b: round(2.718281828 ** b, 2)))   # odds ratios`],
    ['Excel', null, `=SLOPE(orders, ad_spend)                 → b₁
=INTERCEPT(orders, ad_spend)             → b₀
=RSQ(orders, ad_spend)                   → R²
=LINEST(orders, ad_spend:price, TRUE, TRUE)   → multiple regression + stats (spills)
=FORECAST.LINEAR(5000, orders, ad_spend) → predicted orders at $5,000 spend
=FORECAST.ETS(A50, B2:B49, A2:A49)       → seasonal time-series forecast
Data → Data Analysis → Regression        → full output with residuals`],
    ['SQL', 'sql', `-- Simple linear regression in SQL (PostgreSQL)
SELECT REGR_SLOPE(orders, ad_spend)     AS slope,
       REGR_INTERCEPT(orders, ad_spend) AS intercept,
       REGR_R2(orders, ad_spend)        AS r2,
       CORR(orders, ad_spend)           AS r
FROM weekly_marketing;`]],
  edge: [`Extrapolating beyond the range of the data.`, `Outliers can dominate least squares; check influence (Cook’s distance) or use robust methods.`, `Time-series data violates independence; residuals are autocorrelated, so standard errors are too small.`, `Data leakage: including a variable that is only known after the outcome (e.g. “cancellation reason” to predict churn).`],
  faq: [['What does R² of 0.3 mean, and is it bad?', PP(`The model explains 30% of the variance in the outcome. For human behavior that can be useful; whether it’s “good” depends on the purpose. For prediction, judge by out-of-sample error; for explanation, by whether coefficients are stable and sensible.`)],
    ['Correlation vs causation in a regression context?', PP(`A coefficient shows how y moves with x in this data, holding included variables fixed. Unmeasured confounders, reverse causality or selection can create it. Causal claims need randomization or a design that rules those out.`)],
    ['When would you use logistic instead of linear regression?', PP(`When the outcome is binary. Linear regression can predict probabilities below 0 or above 1 and has the wrong error structure; logistic regression models log-odds and outputs valid probabilities.`)],
    ['How do you forecast next quarter’s sales?', PP(`Start with seasonal naive and moving-average baselines, then try a seasonal model (ETS, ARIMA, Prophet) with known drivers (promotions, holidays). Back-test on past quarters, choose by error, and present a range with assumptions.`)]],
  qs: [SQ('In orders = 120 + 0.042 × ad_spend, what does 0.042 mean?', ['Orders when spend is 0', 'About 42 more orders per extra $1,000 of spend, on average', 'The R²', '4.2% conversion rate'], 1, 'Slope: change in y per unit of x.'),
    SQ('Adding a random noise variable to a regression will…', ['lower R²', 'leave R² unchanged or raise it slightly', 'always raise adjusted R²', 'make it causal'], 1, 'R² never decreases when you add variables; adjusted R² penalizes them.'),
    SQ('The outcome is “did the customer churn (yes/no)”. Which model?', ['Linear regression', 'Logistic regression', 'Moving average', 'K-means'], 1, 'Logistic regression models probabilities of a binary outcome.')]
});
DP('da-regression', { work: ['Marketing mix analysis, pricing, churn drivers and demand forecasts.'],
  fu: [['How do you check regression assumptions?', 'Plot residuals vs fitted values (look for curves or funnels), a Q-Q plot of residuals, check for autocorrelation in time series, and inspect influential points.'],
    ['How would you measure the effect of a price increase without an experiment?', 'Difference-in-differences against comparable markets that didn’t change price, or a regression with controls and a before/after design; state the assumptions clearly.'],
    ['How do you pick variables?', 'Start from domain knowledge, avoid leakage, check correlation between inputs, compare models on held-out error, and prefer simpler models that perform similarly.']],
  deep: [['Edge case', 'Interaction effects: the effect of discounts may depend on the season; add x₁·x₂ terms.'],
    ['Failure mode', 'P-hacking by trying many models and reporting the one with significant coefficients.'],
    ['In real systems', 'Marketing mix models (Meta’s Robyn, Google’s Meridian) are regressions with adstock and saturation; Prophet popularized simple business forecasting.']],
  src: ['James, Witten, Hastie & Tibshirani, An Introduction to Statistical Learning, ch. 3–4 (free online)', 'https://www.statlearning.com/'] });
