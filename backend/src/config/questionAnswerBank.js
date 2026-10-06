// src/config/questionAnswerBank.js
// Per-question sample strong answers and relevant keyword categories for every role.
// Used by the offline fallback evaluation engine to provide question-specific feedback
// instead of returning the same generic answer for all questions.

// ============================================================
// FUZZY QUESTION MATCHING UTILITIES
// ============================================================

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'and', 'but', 'or', 'if', 'while', 'because', 'until', 'about',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
  'you', 'your', 'its', 'it', 'they', 'them', 'their', 'we', 'our',
  'explain', 'describe', 'discuss', 'compare', 'contrast', 'design',
  'would', 'implement', 'using', 'use', 'give', 'example', 'work',
  'works', 'working', 'different', 'difference', 'between',
]);

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#@.\s/-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function jaccardSimilarity(tokens1, tokens2) {
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  let intersection = 0;
  for (const t of set1) {
    if (set2.has(t)) intersection++;
    // Also check partial matches for compound terms
    for (const t2 of set2) {
      if (t !== t2 && (t.includes(t2) || t2.includes(t)) && t.length > 3 && t2.length > 3) {
        intersection += 0.5;
      }
    }
  }
  const union = new Set([...set1, ...set2]).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * Find the best matching question entry for a given question text within a role.
 * @param {string} questionText - The question asked to the candidate
 * @param {string} role - The role name (e.g., 'Java Developer')
 * @returns {{ entry: object|null, score: number }}
 */
function findBestMatch(questionText, role) {
  const entries = QUESTION_ANSWERS[role];
  if (!entries || entries.length === 0) return { entry: null, score: 0 };

  const qTokens = tokenize(questionText);
  let bestScore = 0;
  let bestEntry = null;

  for (const entry of entries) {
    const entryTokens = tokenize(entry.q);
    const score = jaccardSimilarity(qTokens, entryTokens);
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  return { entry: bestEntry, score: bestScore };
}

/**
 * Get question-specific evaluation data (sample answer + relevant keyword categories).
 * @param {string} questionText - The question asked
 * @param {string} role - The candidate's role
 * @returns {{ sampleAnswer: string, relevantCategories: string[], matchScore: number }}
 */
function getQuestionSpecificData(questionText, role) {
  // Try exact role first
  let { entry, score } = findBestMatch(questionText, role);

  // If no good match, try all roles
  if (score < 0.08) {
    for (const [roleName, entries] of Object.entries(QUESTION_ANSWERS)) {
      if (roleName === role) continue;
      const result = findBestMatch(questionText, roleName);
      if (result.score > score) {
        score = result.score;
        entry = result.entry;
      }
    }
  }

  if (entry && score >= 0.05) {
    return {
      sampleAnswer: entry.answer,
      relevantCategories: entry.categories || [],
      matchScore: score,
    };
  }

  return {
    sampleAnswer: '',
    relevantCategories: [],
    matchScore: 0,
  };
}

// ============================================================
// PER-QUESTION ANSWER BANK — ALL ROLES
// ============================================================

const QUESTION_ANSWERS = {
  // ────────────────────────────────────────────────────────────
  // JAVA DEVELOPER
  // ────────────────────────────────────────────────────────────
  'Java Developer': [
    {
      q: "Explain the difference between Spring @Bean and @Component, and how Spring resolves circular dependencies.",
      answer: "@Component is a class-level stereotype annotation for automatic bean discovery via classpath component scanning. @Bean is declared on methods within @Configuration classes to manually construct and register beans, essential for configuring third-party library objects. Spring resolves circular dependencies using a three-level singleton cache with early reference exposure, though constructor injection prevents this by design.",
      categories: ['@Configuration / @Bean Method-Level', 'Component Scanning / Stereotype', 'IoC Container / DI'],
    },
    {
      q: "How does the Garbage Collector work in JVM? Contrast G1GC with ZGC for low-latency applications.",
      answer: "The JVM heap is divided into Young Generation (Eden + Survivor spaces) and Old Generation. Minor GC collects short-lived objects from Young Gen, while Major GC collects Old Gen causing longer Stop-The-World (STW) pauses. G1GC uses region-based collection with predictable pause targets (~200ms), while ZGC uses colored pointers and load barriers for sub-millisecond pauses even on multi-terabyte heaps.",
      categories: ['JVM Heap / Generations', 'GC Pause / STW'],
    },
    {
      q: "How does ConcurrentHashMap achieve thread safety without locking the entire map?",
      answer: "In Java 7, ConcurrentHashMap uses segmented locking — the map is divided into 16 segments, each independently locked, allowing 16 concurrent writes. In Java 8+, it replaced segments with CAS (Compare-And-Swap) operations on individual nodes, plus synchronized blocks only on the first node of a bucket during collisions, achieving finer-grained concurrency.",
      categories: ['ConcurrentHashMap / Segmented Locking'],
    },
    {
      q: "Explain Java Streams API: how does lazy evaluation and short-circuiting improve performance?",
      answer: "Java Streams use lazy evaluation — intermediate operations (map, filter) are not executed until a terminal operation (collect, forEach) is invoked. The pipeline fuses operations so each element is processed through all stages before the next element. Short-circuiting operations (findFirst, anyMatch, limit) terminate early without processing remaining elements, dramatically improving performance on large datasets.",
      categories: ['Stream API / Lambda'],
    },
    {
      q: "What are Java Records and Sealed Classes, and when should you use them over traditional class hierarchies?",
      answer: "Records (Java 14+) are immutable data carriers that auto-generate equals(), hashCode(), toString(), and accessor methods — ideal for DTOs and value objects. Sealed classes (Java 17) restrict which classes can extend them using 'permits', enabling exhaustive pattern matching in switch expressions. Use Records for transparent data holders and Sealed Classes for controlled type hierarchies.",
      categories: ['Stream API / Lambda'],
    },
    {
      q: "How does JPA's N+1 query problem occur, and what strategies prevent it in production?",
      answer: "The N+1 problem occurs when JPA/Hibernate lazily loads a collection: 1 query fetches N parent entities, then N additional queries fetch each parent's children. Prevention: JOIN FETCH in JPQL queries, @EntityGraph annotations for declarative eager loading, @BatchSize to batch lazy loads, and DTO projections to bypass entity loading entirely.",
      categories: ['JPA / Hibernate / ORM'],
    },
    {
      q: "Explain the Java Memory Model: what guarantees does 'volatile' provide vs synchronized blocks?",
      answer: "The Java Memory Model (JMM) defines happens-before relationships for memory visibility across threads. 'volatile' guarantees visibility (reads see latest write) and prevents instruction reordering, but does NOT provide atomicity for compound operations. Synchronized blocks provide both visibility (cache flushing) AND mutual exclusion (atomicity) via monitor acquisition, at higher performance cost.",
      categories: ['JVM Heap / Generations', 'ConcurrentHashMap / Segmented Locking'],
    },
    {
      q: "How would you design a high-throughput event processing pipeline using Java CompletableFuture?",
      answer: "Use CompletableFuture.supplyAsync() for non-blocking ingestion, chained with thenApplyAsync() for transformation and thenAcceptAsync() for output. Control parallelism with a custom ForkJoinPool to prevent thread starvation. Implement backpressure with bounded queues, handle failures with exceptionally()/handle() combinators, and compose parallel stages with allOf()/anyOf() for fan-out/fan-in patterns.",
      categories: ['Stream API / Lambda', 'ConcurrentHashMap / Segmented Locking'],
    },
    // Additional questions from questionBank.js that map to existing categories
    {
      q: "Explain the JVM memory model in detail: heap generations, metaspace, Eden/Survivor spaces.",
      answer: "The JVM heap has Young Generation (Eden space + two Survivor spaces S0/S1) and Old/Tenured Generation. New objects allocate in Eden; surviving Minor GCs promote to Survivor spaces, then to Old Gen. Metaspace (replacing PermGen in Java 8+) stores class metadata in native memory with auto-expansion. Tuning generational sizes (-Xms, -Xmx, -XX:NewRatio) directly impacts GC frequency and pause times.",
      categories: ['JVM Heap / Generations', 'GC Pause / STW'],
    },
    {
      q: "Compare G1GC vs ZGC vs Shenandoah for low-latency JVM applications.",
      answer: "G1GC divides heap into equal-sized regions, prioritizing garbage-first collection of regions with most reclaimable space — targets configurable pause times (~200ms default). ZGC uses colored pointers and load barriers for concurrent compaction with sub-millisecond STW pauses regardless of heap size. Shenandoah uses Brooks forwarding pointers for concurrent compaction with similar low-pause goals but different trade-offs in throughput overhead.",
      categories: ['JVM Heap / Generations', 'GC Pause / STW'],
    },
    {
      q: "How does Java's HashMap internally work? Explain hashing, collisions, and rehashing.",
      answer: "HashMap stores entries in a bucket array indexed by hash(key) & (capacity-1). It uses key.hashCode() with additional bit-spreading to reduce collisions. Collisions are resolved with linked lists (Java 7) that treeify into red-black trees when a bucket exceeds 8 entries (Java 8+). When load factor (default 0.75) is exceeded, rehashing doubles the array capacity and redistributes all entries.",
      categories: ['ConcurrentHashMap / Segmented Locking'],
    },
    {
      q: "How does Spring's dependency injection work? Compare constructor injection vs field injection.",
      answer: "Spring's IoC Container manages bean lifecycle and injects dependencies. Constructor injection provides dependencies via constructor parameters — preferred because it enforces immutability, makes dependencies explicit, and supports final fields. Field injection uses @Autowired on fields — convenient but hides dependencies, prevents immutability, and makes unit testing harder (requires reflection). Spring resolves beans by type or @Qualifier name from the ApplicationContext.",
      categories: ['IoC Container / DI', 'Component Scanning / Stereotype', '@Configuration / @Bean Method-Level'],
    },
    {
      q: "What is the difference between @Component, @Service, @Repository in Spring?",
      answer: "@Component is the generic stereotype annotation for any Spring-managed bean discovered via component scanning. @Service and @Repository are specializations — @Service marks business logic layer beans (no additional behavior), while @Repository marks data access layer beans and enables automatic exception translation from database-specific exceptions to Spring's DataAccessException hierarchy. All three are detected by @ComponentScan.",
      categories: ['Component Scanning / Stereotype', 'IoC Container / DI'],
    },
    {
      q: "Explain lazy loading vs eager loading in Hibernate/JPA.",
      answer: "Lazy loading (FetchType.LAZY) defers loading associated entities until they're first accessed — reduces initial query overhead but risks LazyInitializationException outside a session. Eager loading (FetchType.EAGER) loads associations immediately with the parent entity — simpler but can cause unnecessary data fetching and N+1 problems. Best practice: default to LAZY and use JOIN FETCH or @EntityGraph for specific queries that need the associations.",
      categories: ['JPA / Hibernate / ORM'],
    },
    {
      q: "What is the N+1 problem in ORM frameworks? How do you solve it?",
      answer: "N+1 occurs when an ORM executes 1 query for parent entities then N individual queries to load each parent's lazy-loaded children. Solutions: JOIN FETCH in JPQL/HQL to load parents and children in a single query, @EntityGraph for declarative eager loading per use case, @BatchSize to batch lazy loads into groups of N queries, DTO projections to fetch only needed columns without entity hydration.",
      categories: ['JPA / Hibernate / ORM'],
    },
    {
      q: "Explain Java's Stream API: how do map(), filter(), and reduce() work together?",
      answer: "Stream operations form a pipeline: filter() selects elements matching a Predicate (intermediate, lazy), map() transforms each element via a Function (intermediate, lazy), and reduce() combines all elements into a single result using a BinaryOperator (terminal, triggers execution). The pipeline is lazily evaluated — no work occurs until the terminal operation, and elements flow through all stages one at a time, enabling short-circuiting and fusion optimizations.",
      categories: ['Stream API / Lambda'],
    },
    {
      q: "Explain Spring's bean lifecycle in detail: all callbacks, BeanPostProcessor hooks, and scope interactions.",
      answer: "Spring bean lifecycle: instantiation → dependency injection → BeanNameAware/BeanFactoryAware callbacks → BeanPostProcessor.postProcessBeforeInitialization → @PostConstruct / InitializingBean.afterPropertiesSet / init-method → BeanPostProcessor.postProcessAfterInitialization → bean is ready. On shutdown: @PreDestroy / DisposableBean.destroy / destroy-method. Scope impacts lifecycle: singleton beans live for the container's lifetime; prototype beans are created per request and not tracked for destruction by the container.",
      categories: ['IoC Container / DI', '@Configuration / @Bean Method-Level', 'Component Scanning / Stereotype'],
    },
  ],

  // ────────────────────────────────────────────────────────────
  // FRONTEND DEVELOPER
  // ────────────────────────────────────────────────────────────
  'Frontend Developer': [
    {
      q: "Explain how the React Virtual DOM diffing algorithm works, and how keys optimize list re-renders.",
      answer: "React maintains an in-memory Virtual DOM tree. On state change, it creates a new virtual tree and runs a reconciliation algorithm comparing old and new trees with a heuristic O(n) approach: elements of different types produce new subtrees; same-type elements update only changed attributes. Keys provide stable identity for list items, allowing React to match moved elements instead of destroying and recreating them.",
      categories: ['Virtual DOM / Reconciliation'],
    },
    {
      q: "How do CSS containment, compositing layers, and requestAnimationFrame optimize browser rendering performance?",
      answer: "CSS containment (contain: layout paint) tells the browser a subtree is independent, allowing it to skip re-layout/repaint of contained areas. Compositing layers (triggered by will-change, transform, opacity) are GPU-accelerated, enabling smooth animations without reflow. requestAnimationFrame synchronizes JavaScript animations with the browser's 60fps paint cycle, preventing jank from off-cycle DOM mutations.",
      categories: ['CSS Layout / Compositing'],
    },
    {
      q: "Describe how you would implement client-side caching and optimistic updates for a real-time collaborative app.",
      answer: "Use a normalized client-side cache (React Query or Apollo Client) storing entities by ID for instant UI updates. For optimistic updates: immediately mutate the local cache with the expected result before the API responds, display the change, then reconcile with the server response — rolling back on error. Implement conflict resolution using version vectors or last-write-wins for collaboration.",
      categories: ['State Management', 'Web Performance'],
    },
    {
      q: "What are Micro-Frontends, and how does Webpack Module Federation enable them?",
      answer: "Micro-Frontends decompose a monolithic frontend into independently deployable units owned by different teams. Webpack Module Federation allows separate webpack builds to share modules at runtime: a 'host' application dynamically loads 'remote' components via manifest URLs without bundling them, enabling independent deployment while sharing common dependencies like React.",
      categories: ['Webpack / Bundling'],
    },
    {
      q: "Explain the difference between useMemo and useCallback. When does each actually improve performance?",
      answer: "useMemo memoizes a computed VALUE — re-computing only when dependencies change, useful for expensive calculations. useCallback memoizes a FUNCTION REFERENCE — returning the same function instance between renders, useful when passing callbacks to React.memo-wrapped children. Both add complexity; only use them when profiling shows actual re-render or computation bottlenecks.",
      categories: ['React Hooks / State'],
    },
    {
      q: "How would you debug and fix a Core Web Vitals regression (high LCP, CLS)?",
      answer: "For high LCP: use Chrome DevTools Performance tab to identify the LCP element, optimize by preloading key resources, using responsive images with srcset, and implementing SSR for above-the-fold content. For high CLS: add explicit width/height to images/videos, use CSS aspect-ratio, avoid dynamically injecting content above existing elements, and use font-display: swap with size-adjusted fallback fonts.",
      categories: ['Web Performance'],
    },
    {
      q: "Explain how React Suspense and Server Components change the data fetching paradigm.",
      answer: "React Suspense allows components to 'suspend' rendering while waiting for async data, showing a fallback UI. Instead of useEffect fetch-on-render, components throw Promises that Suspense boundaries catch. React Server Components run on the server, fetching data directly with zero client-side JavaScript, eliminating client-side data fetching waterfalls and reducing bundle size.",
      categories: ['Virtual DOM / Reconciliation', 'React Hooks / State'],
    },
    {
      q: "How would you architect a design system component library that supports theming and accessibility?",
      answer: "Build using atomic design: tokens (CSS custom properties for colors, spacing, typography), atoms (Button, Input), molecules (SearchBar), organisms (Header). Implement theming via CSS custom properties per-theme context. Ensure WCAG 2.1 AA accessibility: semantic HTML, ARIA attributes, keyboard navigation, focus management, and minimum 4.5:1 contrast ratios. Distribute as a versioned npm package with Storybook documentation.",
      categories: ['CSS Layout / Compositing', 'TypeScript / Type Safety', 'Testing'],
    },
    {
      q: "Explain how the browser critical rendering path works: HTML parsing, CSSOM, render tree.",
      answer: "The browser parses HTML into the DOM tree, parses CSS into the CSSOM tree, then combines them into the Render Tree (only visible elements). Layout (reflow) computes each element's geometry and position. Paint fills pixels for each element. Compositing combines layers for GPU-accelerated rendering. Render-blocking CSS and parser-blocking JavaScript delay this pipeline — optimize with async/defer scripts, critical CSS inlining, and resource preloading.",
      categories: ['CSS Layout / Compositing', 'Web Performance'],
    },
    {
      q: "How do CSS containment, compositing layers optimize browser rendering?",
      answer: "CSS containment (contain: layout paint style) isolates an element's subtree from the rest of the document, allowing the browser to skip re-layout and repaint of unrelated areas during updates. Compositing layers (promoted via will-change, transform, or opacity) are rendered independently on the GPU, enabling smooth 60fps animations without triggering expensive reflow/repaint cycles on the main thread.",
      categories: ['CSS Layout / Compositing'],
    },
  ],

  // ────────────────────────────────────────────────────────────
  // DATA ANALYST
  // ────────────────────────────────────────────────────────────
  'Data Analyst': [
    {
      q: "How do window functions like ROW_NUMBER(), RANK(), and DENSE_RANK() differ in SQL?",
      answer: "All three use OVER(PARTITION BY ... ORDER BY ...) clause. ROW_NUMBER() assigns unique sequential integers. RANK() assigns identical ranks to ties but leaves gaps (1,2,2,4). DENSE_RANK() assigns identical ranks without gaps (1,2,2,3). Use ROW_NUMBER for pagination/deduplication, RANK for competition rankings, DENSE_RANK for continuous ranking.",
      categories: ['Window Functions / OVER'],
    },
    {
      q: "Explain how you would handle missing or corrupted data in a large time-series dataset.",
      answer: "Quantify missingness patterns: MCAR, MAR, or MNAR. For time-series: use forward-fill or linear interpolation for short gaps. For longer gaps, apply seasonal decomposition from historical patterns. Flag corrupted values using z-score outlier detection or domain-specific range checks, then exclude, cap, or impute. Always document imputation methods and report the percentage of imputed values.",
      categories: ['Statistical Methods', 'ETL / Data Pipeline'],
    },
    {
      q: "What metrics would you define to measure user retention vs churn for a SaaS product?",
      answer: "Retention: Day-N retention (% returning on day N), rolling retention, and cohort curves. Churn: monthly churn rate (lost / starting customers), revenue churn (lost MRR / starting MRR), net revenue retention (including expansion). Define 'active' precisely (logged in + performed core action). Track leading indicators: feature adoption depth, session frequency, and time-to-value.",
      categories: ['Data Visualization', 'A/B Testing'],
    },
    {
      q: "Explain the difference between A/B testing statistical significance and statistical power.",
      answer: "Statistical significance (1-α, typically 95%) controls the false positive rate — probability of correctly rejecting the null when the alternative is true. Statistical power (1-β, typically 80%) is the probability of detecting a true effect. Low power means the test likely misses real differences. Power depends on sample size, effect size, and significance level — use power analysis before experiments to determine required sample size.",
      categories: ['A/B Testing', 'Statistical Methods'],
    },
    {
      q: "How would you design a data pipeline to process 10 million daily events into business intelligence dashboards?",
      answer: "Ingest via Kafka/Kinesis for reliable streaming. Transform with Spark or Flink for aggregations. Store raw events in a data lake (S3 with Parquet) for replayability, aggregated tables in a columnar warehouse (BigQuery, ClickHouse) for fast queries. Orchestrate with Airflow, monitor data quality with Great Expectations, serve dashboards via Tableau/Looker with materialized views.",
      categories: ['ETL / Data Pipeline', 'Data Visualization'],
    },
    {
      q: "Explain CTEs (Common Table Expressions) vs subqueries — when is each more appropriate?",
      answer: "CTEs (WITH clauses) create named temporary result sets referenceable multiple times in the same query, improving readability for complex multi-step transformations. CTEs support recursion (hierarchical data). Subqueries are inline and cannot be reused. Performance is usually identical as most databases optimize CTEs the same as subqueries. Use CTEs for recursive queries, multi-step aggregations, and readability.",
      categories: ['SQL Joins / Subqueries', 'Window Functions / OVER'],
    },
    {
      q: "How do you detect and handle data quality issues in production analytics pipelines?",
      answer: "Automated checks at each pipeline stage: schema validation, volume checks (row count anomalies vs historical baseline), distribution checks (unexpected nulls, outliers, cardinality shifts), freshness monitoring (SLA-based alerts), and cross-source reconciliation. Use Great Expectations or dbt tests for declarative assertions. Set up alerts with Slack/PagerDuty integration.",
      categories: ['ETL / Data Pipeline'],
    },
    {
      q: "Describe how you would build a customer cohort analysis to identify high-value user segments.",
      answer: "Define cohorts by acquisition date (month/week of first purchase). Track cumulative revenue, retention, and engagement over time periods using SQL window functions (SUM OVER PARTITION BY cohort ORDER BY period). Segment by acquisition channel, plan tier, or geography. Apply RFM (Recency, Frequency, Monetary) scoring. Visualize as retention heatmaps to identify high-LTV segments.",
      categories: ['Window Functions / OVER', 'Statistical Methods'],
    },
  ],

  // ────────────────────────────────────────────────────────────
  // PRODUCT MANAGER
  // ────────────────────────────────────────────────────────────
  'Product Manager': [
    {
      q: "How do you prioritize competing feature requests from enterprise sales vs technical debt?",
      answer: "Apply the RICE framework (Reach × Impact × Confidence / Effort) to quantitatively score each item including tech debt by its impact on developer velocity. Present trade-offs with data to stakeholders. Propose balanced sprint allocation (e.g., 70% features / 30% debt) and use OKRs to track both product growth and engineering health metrics.",
      categories: ['Prioritization Framework', 'Metrics / KPIs', 'Stakeholder Management'],
    },
    {
      q: "Walk me through designing a telemetry and metrics framework for a new AI feature.",
      answer: "Define the North Star metric (e.g., AI-assisted task completion rate). Layer metrics: adoption (% users engaging), engagement (frequency, depth), quality (precision/recall, user correction rate), and business impact (time saved, revenue). Implement structured event tracking, funnel analysis for AI interaction flow, A/B testing to measure lift vs non-AI baseline.",
      categories: ['Metrics / KPIs', 'User Research'],
    },
    {
      q: "Describe a situation where a product launch missed its primary KPI. How did you diagnose and pivot?",
      answer: "Use STAR framework: identify the metric gap, diagnose by segmenting data — cohort analysis, funnel drop-off analysis, user session recordings, qualitative feedback. Root cause: identify the specific step where users churned. Pivot by running rapid A/B tests on the friction point, shipping quick wins first, and adjusting metric targets based on learnings.",
      categories: ['Metrics / KPIs', 'User Research', 'Agile / Scrum'],
    },
    {
      q: "How do you balance user experience simplification against advanced power-user functionality?",
      answer: "Apply progressive disclosure: surface common workflows (80% of use cases) in a clean interface while hiding advanced features behind expandable sections or settings. Use analytics to validate which features are used by power users vs beginners. Implement persona-based design: beginners get guided flows, power users get customization and API access. Measure via task completion time for both segments.",
      categories: ['User Research', 'Metrics / KPIs'],
    },
    {
      q: "Explain how you would define success metrics for a marketplace product's supply-demand balance.",
      answer: "Track liquidity: search-to-fill rate, time-to-match, inventory utilization. Supply metrics: active listing growth, seller activation rate. Demand metrics: buyer conversion funnel, repeat purchase rate, GMV. Monitor supply-demand ratio by category and geography. Set up early warning dashboards for imbalances and trigger automated incentive campaigns.",
      categories: ['Metrics / KPIs', 'Go-to-Market'],
    },
    {
      q: "How would you conduct user research to validate a B2B SaaS product hypothesis?",
      answer: "Discovery interviews (15-20 target users) with open-ended questions to validate the problem. Map the user journey. Build a clickable Figma prototype and run moderated usability testing with 5-7 participants. Supplement with quantitative validation: fake-door tests, landing page conversion tests, or concierge MVP experiments. Triangulate qualitative with behavioral analytics.",
      categories: ['User Research', 'Go-to-Market'],
    },
    {
      q: "Describe your framework for making build-vs-buy decisions for platform capabilities.",
      answer: "Evaluate on four axes: (1) Core vs Context — is this your competitive differentiator? Build if core. (2) Total cost of ownership — build costs vs licensing/vendor lock-in. (3) Time-to-market — buying is faster for commoditized capabilities. (4) Customization needs — building provides more control for deep integration. Document in an Architecture Decision Record (ADR) with reversibility analysis.",
      categories: ['Stakeholder Management', 'Prioritization Framework'],
    },
    {
      q: "How would you handle disagreement between engineering and design on a critical feature scope?",
      answer: "Facilitate structured discussion focused on user outcomes, not opinions. Present user research, analytics, and competitive data. Reframe around constraints — define the MVP that achieves the user outcome within technical constraints. Use timeboxed prototypes to resolve uncertainty. If no consensus, escalate with a decision memo presenting both perspectives with trade-offs.",
      categories: ['Stakeholder Management', 'Agile / Scrum'],
    },
  ],

  // ────────────────────────────────────────────────────────────
  // PYTHON DEVELOPER
  // ────────────────────────────────────────────────────────────
  'Python Developer': [
    {
      q: "Explain the GIL in CPython: why does it exist, and how do you achieve true parallelism despite it?",
      answer: "The GIL (Global Interpreter Lock) is a mutex preventing multiple native threads from executing Python bytecodes simultaneously. It exists because CPython's reference counting memory management is not thread-safe. For CPU-bound parallelism, use multiprocessing or ProcessPoolExecutor. For I/O-bound concurrency, use asyncio with async/await or threading (GIL is released during I/O waits).",
      categories: ['GIL / Threading'],
    },
    {
      q: "How do Python decorators work internally? Write a decorator that caches function results.",
      answer: "Decorators are higher-order functions: @decorator is syntactic sugar for func = decorator(func). The decorator wraps the original in a closure. A caching decorator maintains a dictionary mapping arguments to results, checks cache before calling the function. Python's functools.lru_cache implements this with O(1) lookup via a doubly-linked list and dictionary. Use functools.wraps to preserve metadata.",
      categories: ['Decorators / Metaclasses'],
    },
    {
      q: "Explain generators vs list comprehensions: when does lazy evaluation provide a real advantage?",
      answer: "List comprehensions create the entire list in memory at once (O(n) space). Generators (yield or generator expressions) produce values one-at-a-time on demand (O(1) space). Generators advantage when: processing large datasets that don't fit in memory, building pipelines needing only partial results, or infinite sequences. Trade-off: generators are single-use and don't support indexing or len().",
      categories: ['List Comprehension / Generators'],
    },
    {
      q: "Compare Django ORM, SQLAlchemy, and raw SQL for a high-throughput API — trade-offs?",
      answer: "Django ORM: rapid development, tight framework integration, auto-migrations, but limited query expressiveness and model instantiation overhead. SQLAlchemy: flexible Core layer for raw SQL performance plus ORM layer, supports complex queries. Raw SQL: maximum performance but loses portability and type safety. For high-throughput: use SQLAlchemy Core or raw SQL for hot paths, ORM for CRUD.",
      categories: ['Django / Flask / FastAPI'],
    },
    {
      q: "How would you design a rate-limiting middleware for a FastAPI application?",
      answer: "Implement as ASGI middleware or FastAPI dependency. Use Redis sorted sets for sliding window rate limiting: ZADD timestamps per client, ZREMRANGEBYSCORE to remove expired entries, ZCARD for count. If count exceeds limit, return 429 with Retry-After header. Redis ensures consistency across distributed instances. Add X-RateLimit headers to every response.",
      categories: ['Django / Flask / FastAPI', 'Data Structures'],
    },
    {
      q: "Explain Python's memory management: reference counting, garbage collection, and __slots__.",
      answer: "Python uses reference counting as primary memory management: objects are deallocated when refcount reaches zero. The cyclic garbage collector handles reference cycles using generational collection (gen 0, 1, 2). __slots__ replaces per-instance __dict__ with fixed attribute slots, reducing memory by ~40% per instance and preventing dynamic attribute assignment.",
      categories: ['GIL / Threading', 'Data Structures'],
    },
    {
      q: "How do async/await and asyncio event loops work in Python for I/O-bound workloads?",
      answer: "asyncio provides a single-threaded event loop using cooperative multitasking via coroutines. When a coroutine hits 'await' on I/O, it yields control to the event loop, which runs other coroutines. The event loop uses OS-level I/O multiplexing (epoll/kqueue) to monitor file descriptors efficiently. High concurrency for I/O-bound workloads without threading overhead, but CPU-bound tasks block the loop.",
      categories: ['GIL / Threading'],
    },
    {
      q: "What are context managers, and how does the 'with' statement work under the hood?",
      answer: "Context managers implement __enter__() and __exit__() protocol. 'with' calls __enter__() on entry (value bound by 'as') and guarantees __exit__() on exit — even if exceptions occur. __exit__ receives exception info and can suppress by returning True. contextlib.contextmanager simplifies creation using a generator with a single yield. Common uses: file handling, database transactions, locks.",
      categories: ['Decorators / Metaclasses', 'Data Structures'],
    },
  ],

  // ────────────────────────────────────────────────────────────
  // FULL STACK DEVELOPER
  // ────────────────────────────────────────────────────────────
  'Full Stack Developer': [
    {
      q: "Compare REST vs GraphQL APIs: when would you choose each for a production application?",
      answer: "REST uses resource-oriented endpoints with predictable URL patterns and HTTP methods, offering strong caching via HTTP semantics — ideal for CRUD-heavy apps. GraphQL uses a single endpoint with flexible queries eliminating over/under-fetching — ideal for mobile apps with diverse data needs or complex nested relationships. Choose REST for cacheable resource APIs, GraphQL for aggregated multi-service schemas.",
      categories: ['REST / GraphQL'],
    },
    {
      q: "How would you implement secure JWT-based authentication with refresh token rotation?",
      answer: "Issue short-lived access tokens (15 min) and long-lived refresh tokens (7 days). Store refresh tokens server-side with token family tracking. Implement rotation: invalidate old refresh token and issue new pair with each refresh. If a used token is replayed (attack), invalidate the entire family. Store access tokens in memory, refresh tokens as HttpOnly/Secure/SameSite cookies.",
      categories: ['Authentication / JWT'],
    },
    {
      q: "Explain database normalization vs denormalization trade-offs for a high-read application.",
      answer: "Normalization (3NF) eliminates redundancy, ensuring update consistency. Denormalization duplicates data to reduce JOIN overhead for read performance. For high-read apps: denormalize hot read paths (materialized views, precomputed aggregations) while keeping the source of truth normalized. Use database triggers or application-level sync for consistency.",
      categories: ['Database Design'],
    },
    {
      q: "How would you design a CI/CD pipeline for a full-stack app with staging and production environments?",
      answer: "Stages: lint and type-check on PR → parallel unit tests (frontend + backend) → build Docker images with commit SHA tags → auto-deploy to staging on main merge → E2E tests against staging → manual approval gate → production deploy via blue-green/canary → post-deploy smoke tests with automated rollback on failure. Environment-specific secrets management.",
      categories: ['CI/CD'],
    },
    {
      q: "Explain caching strategies: when do you use Redis vs CDN vs in-memory caching?",
      answer: "In-memory (LRU cache): fastest, single-process — for config, computed values. Redis: distributed, shared across instances — for sessions, rate limiting, API response caching. CDN (CloudFront): edge-cached close to users — for static assets and cacheable API responses. Layer all three: CDN → Redis → in-memory → database for optimal performance.",
      categories: ['Caching'],
    },
    {
      q: "How would you migrate a monolithic application to microservices without downtime?",
      answer: "Use the Strangler Fig pattern: incrementally extract modules as independent services while the monolith serves traffic. Route through an API gateway that shifts traffic from monolith to microservice endpoints. Extract by bounded context starting with least-coupled, highest-value domains. Implement an anti-corruption layer for data model translation. Feature flags for gradual cutover.",
      categories: ['Architecture'],
    },
    {
      q: "Describe your approach to handling file uploads, processing, and storage at scale.",
      answer: "Client uploads directly to S3/GCS using pre-signed URLs to avoid server bottlenecks. On completion, trigger processing pipeline (resize, thumbnails, malware scan, metadata extraction) via message queue. Store processed files with CDN distribution. Track upload status in database. Implement size/type validation, virus scanning, multipart uploads for large files.",
      categories: ['Architecture', 'Caching'],
    },
    {
      q: "How do you handle database schema migrations in production without data loss?",
      answer: "Use expand-contract pattern: (1) Expand — add new columns alongside existing ones, deploy code writing to both. (2) Migrate — backfill historical data with batched updates. (3) Contract — deploy code reading from new schema, then drop old columns in separate release. Never combine destructive schema changes with code changes. Use migration tools (Knex, Prisma) for version control.",
      categories: ['Database Design'],
    },
  ],

  // ────────────────────────────────────────────────────────────
  // DEVOPS ENGINEER
  // ────────────────────────────────────────────────────────────
  'DevOps Engineer': [
    {
      q: "Explain Docker multi-stage builds and how they reduce production image size.",
      answer: "Multi-stage builds use multiple FROM statements. Earlier stages install build tools, compile code, and run tests. The final stage starts from a minimal base (alpine, distroless) and copies only the compiled artifact via COPY --from=build_stage. Build tools and source code are discarded, reducing production image size by 80-90%.",
      categories: ['Docker / Containers'],
    },
    {
      q: "How does Kubernetes handle pod scheduling, auto-scaling, and self-healing?",
      answer: "kube-scheduler assigns pods to nodes based on resource requests, affinity rules, taints/tolerations. HPA (Horizontal Pod Autoscaler) scales replicas based on CPU/memory or custom metrics. Self-healing: kubelet monitors health via liveness probes (restart unhealthy), readiness probes (remove from endpoints), and ReplicaSet controller ensures desired pod count.",
      categories: ['Kubernetes / Orchestration'],
    },
    {
      q: "Design a CI/CD pipeline for a microservices architecture with blue-green deployments.",
      answer: "Per-service pipelines triggered by directory changes: lint → unit test → build Docker image → push to registry → deploy to blue environment → integration tests → switch load balancer from green to blue → monitor error rates → automated rollback if threshold exceeded. Use Kubernetes Deployments with service label switching for blue-green.",
      categories: ['CI/CD Pipeline'],
    },
    {
      q: "Compare Terraform vs Ansible: when would you use each for infrastructure management?",
      answer: "Terraform is declarative IaC for provisioning cloud resources — maintains state file, computes diffs for desired state, idempotent infrastructure creation. Ansible is procedural configuration management for configuring existing servers — SSH/WinRM based, agentless. Use Terraform for infrastructure provisioning, Ansible for server configuration. They complement each other.",
      categories: ['Infrastructure as Code'],
    },
    {
      q: "How would you set up comprehensive observability (logging, metrics, tracing) for a distributed system?",
      answer: "Three pillars: (1) Logging — structured JSON via Fluentd/Filebeat to Elasticsearch, with correlation IDs. (2) Metrics — Prometheus client libraries, scrape and visualize in Grafana. Track RED metrics (Rate, Errors, Duration). (3) Tracing — OpenTelemetry SDK propagating trace context to Jaeger/Tempo. Define SLIs/SLOs and set up PagerDuty alerts.",
      categories: ['Monitoring / Observability'],
    },
    {
      q: "Explain Kubernetes networking: Services, Ingress controllers, and network policies.",
      answer: "Services: ClusterIP (internal), NodePort (external via node ports), LoadBalancer (cloud LB). Ingress controllers (Nginx, Traefik) provide HTTP/HTTPS routing with path/host rules and TLS termination. Network Policies are Kubernetes-native firewall rules controlling pod-to-pod traffic using label selectors, enforced by CNI plugins (Calico, Cilium).",
      categories: ['Kubernetes / Orchestration', 'Cloud Services'],
    },
    {
      q: "How do you implement secrets management in a containerized production environment?",
      answer: "Never store secrets in images, env vars, or repos. Use HashiCorp Vault, AWS Secrets Manager, or Kubernetes External Secrets Operator for dynamic injection. Sync cloud secrets into Kubernetes Secret objects mounted as volumes. Implement rotation without pod restarts using sidecar containers or volume-mounted secrets with inotify watches. Audit all access.",
      categories: ['Cloud Services', 'Kubernetes / Orchestration'],
    },
    {
      q: "Describe your approach to disaster recovery and multi-region failover.",
      answer: "Define RPO/RTO per service by business criticality. Implement: automated cross-region database backups, Infrastructure as Code for rapid recreation, DNS-based failover (Route53 health checks), regular DR drills with chaos engineering, and clear runbooks. Active-passive for cost efficiency; active-active for zero-RTO critical services.",
      categories: ['Cloud Services', 'Monitoring / Observability'],
    },
  ],

  // ────────────────────────────────────────────────────────────
  // DATA SCIENTIST
  // ────────────────────────────────────────────────────────────
  'Data Scientist': [
    {
      q: "Explain the bias-variance trade-off and how it affects model selection.",
      answer: "Bias is error from incorrect model assumptions (underfitting). Variance is error from sensitivity to training data (overfitting). Total error = bias² + variance + irreducible noise. Simple models: high bias, low variance. Complex models: low bias, high variance. Use cross-validation to estimate balance, regularization (L1/L2) to control variance, ensemble methods to address both.",
      categories: ['ML Algorithms', 'Model Evaluation'],
    },
    {
      q: "How do you handle class imbalance in a classification problem?",
      answer: "Data-level: oversampling minority (SMOTE, ADASYN), undersampling majority. Algorithm-level: class_weight='balanced', cost-sensitive learning. Metric-level: use precision, recall, F1, PR-AUC instead of accuracy. For severe imbalance (>100:1), consider anomaly detection framing. Always evaluate on stratified test sets with original class distribution.",
      categories: ['ML Algorithms', 'Model Evaluation'],
    },
    {
      q: "Compare Random Forest vs Gradient Boosting: strengths, weaknesses, and when to use each.",
      answer: "Random Forest: parallel independent trees (bagging), reduces variance, resistant to overfitting, fast training. Gradient Boosting: sequential trees correcting errors, reduces bias, higher accuracy but prone to overfitting. Use RF for fast, robust baselines. Use GB (XGBoost, LightGBM) when maximum accuracy is needed with hyperparameter tuning investment.",
      categories: ['ML Algorithms'],
    },
    {
      q: "How would you design a feature engineering pipeline for a recommendation system?",
      answer: "Collaborative features: user-item interaction matrix, implicit feedback signals. Content features: item embeddings (TF-IDF, BERT), category encodings. User features: demographics, engagement patterns, RFM scores. Temporal features: time-of-day, recency, trending items. Compute offline with Spark, store in feature store (Feast) for online serving. Handle cold-start with popularity fallbacks.",
      categories: ['Feature Engineering', 'Data Processing'],
    },
    {
      q: "Explain the Transformer architecture and self-attention mechanism.",
      answer: "Transformers process sequences in parallel using self-attention. Each token creates Query, Key, Value vectors. Attention(Q,K,V) = softmax(QK^T / √d_k)V — each token attends to all others, learning contextual relationships. Multi-head attention captures different relationship types. Positional encodings inject sequence order. Architecture uses encoder/decoder stacks with residual connections and layer normalization.",
      categories: ['Deep Learning'],
    },
    {
      q: "How do you detect and handle data drift in a production ML model?",
      answer: "Monitor input distributions with KS test, PSI, or JS divergence against training baselines. Track performance metrics on labeled production data. Set automated alerts when drift exceeds thresholds. Response: retrain on recent data, update features, expand training diversity. Shadow deploy retrained models before promoting. Use Evidently AI or Arize for monitoring.",
      categories: ['MLOps', 'Model Evaluation'],
    },
    {
      q: "Describe your approach to A/B testing a new ML model against a baseline in production.",
      answer: "Deploy new model alongside baseline with traffic splitting (90/10). Define primary and guardrail metrics before launch. Randomize at user level to avoid Simpson's paradox. Run for sufficient duration for statistical significance with adequate power. Monitor for novelty/learning effects. Use sequential testing for early stopping. Document in experiment registry.",
      categories: ['MLOps', 'Model Evaluation'],
    },
    {
      q: "How would you explain a complex ML model's predictions to non-technical stakeholders?",
      answer: "Use SHAP values to show each feature's contribution to predictions (force/waterfall charts). LIME for simplified local explanations. Aggregate into global feature importance rankings. Translate to business language: 'The model flagged high churn risk because login frequency dropped 60%.' Use dashboards with interactive drill-downs and confidence intervals.",
      categories: ['Model Evaluation', 'Data Processing'],
    },
  ],

  // ────────────────────────────────────────────────────────────
  // MOBILE DEVELOPER
  // ────────────────────────────────────────────────────────────
  'Mobile Developer': [
    {
      q: "Compare React Native vs Flutter: rendering architecture, performance, and ecosystem trade-offs.",
      answer: "React Native uses a JavaScript bridge to platform-native UI components — new architecture (Fabric + TurboModules) replaces bridge with JSI for direct calls. Flutter renders directly using Skia/Impeller engine with its own widget system for pixel-perfect consistency and 60fps. RN benefits from JS ecosystem; Flutter offers superior animation performance but requires Dart.",
      categories: ['React Native / Flutter'],
    },
    {
      q: "How do you diagnose and fix UI jank (dropped frames) in a mobile application?",
      answer: "Jank occurs when frames take >16ms (below 60fps). Diagnose with Flipper Performance (RN), DevTools Timeline (Flutter). Common causes: expensive renders on UI thread, large unvirtualized lists, excessive re-renders. Fixes: FlatList/ListView.builder for virtualization, memoize computations, move work off main thread, React.memo for preventing re-renders, optimize image caching.",
      categories: ['Performance'],
    },
    {
      q: "Explain how push notifications work end-to-end (APNs/FCM, token management, payload handling).",
      answer: "App registers with OS service and receives a device token → token sent to backend → backend sends payload to APNs (iOS) or FCM (Android) → platform delivers to device. Handle token refresh on reinstall/OS updates, remove invalid tokens from feedback. Support foreground display, background processing, deep linking from tap, and silent notifications for data sync.",
      categories: ['Native APIs'],
    },
    {
      q: "How would you implement offline-first data synchronization for a mobile app?",
      answer: "Use local database (SQLite, Realm, WatermelonDB) as primary source. Queue mutations locally with timestamps. On connectivity, push changes via sync queue with retry logic. Conflict resolution: last-write-wins or field-level merging. Server-side versioning for conflict detection. Cache API responses with staleness indicators. Show sync status in UI.",
      categories: ['App Architecture', 'State Management'],
    },
    {
      q: "Describe your approach to managing app state in a large React Native application.",
      answer: "Layer by scope: (1) UI state — useState/useReducer for ephemeral state. (2) Feature state — Zustand or Context for feature-scoped sharing. (3) Global state (auth, theme) — Redux Toolkit or Zustand with persist. (4) Server state — React Query/TanStack Query for API data with caching and optimistic updates. Colocate state close to where it's used.",
      categories: ['State Management'],
    },
    {
      q: "How do you handle backward compatibility when releasing new app versions?",
      answer: "API versioning with backward-compatible endpoints. Feature flags via Firebase Remote Config for gradual rollout. Minimum version check on launch for critical changes. Versioned database schema migrations. Deep link URL scheme backward compatibility. Track version distribution analytics to know when to deprecate.",
      categories: ['App Architecture', 'Testing / CI'],
    },
    {
      q: "Explain deep linking and universal links: how do they work across iOS and Android?",
      answer: "Deep links use custom URL schemes (myapp://product/123) — don't work if app not installed. Universal Links (iOS) and App Links (Android) use HTTPS URLs verified via apple-app-site-association/assetlinks.json on your domain. OS intercepts matching URLs and opens app directly. If not installed, opens browser (deferred deep linking). Implement with routing that parses link parameters.",
      categories: ['Native APIs'],
    },
    {
      q: "How would you architect a mobile app for accessibility compliance?",
      answer: "Semantic markup: accessibilityLabel, accessibilityRole, accessibilityHint on all interactive elements. Screen reader support with logical focus order. Minimum 4.5:1 contrast ratios (WCAG AA), dynamic type/font scaling support, sufficient touch targets (44x44pt minimum). Respect prefers-reduced-motion. Test with VoiceOver, TalkBack, and automated tools.",
      categories: ['App Architecture', 'Testing / CI'],
    },
  ],

  // ────────────────────────────────────────────────────────────
  // QA ENGINEER
  // ────────────────────────────────────────────────────────────
  'QA Engineer': [
    {
      q: "Explain the test pyramid: unit, integration, and E2E tests — optimal ratio and trade-offs.",
      answer: "The pyramid recommends ~70% fast unit tests (isolated, pinpoint failures), ~20% integration tests (verify component interactions), ~10% E2E tests (validate user workflows but slow and flaky). This ratio maximizes fast feedback while maintaining system confidence. Unit tests can't catch integration issues; E2E tests are expensive to maintain.",
      categories: ['Testing Types'],
    },
    {
      q: "How do you design a page object model for a Selenium/Playwright automation framework?",
      answer: "POM encapsulates page elements and interactions into reusable classes. Each page gets its own class with: locators as private properties, public methods for user actions (login(), searchFor()), return types chaining to next page object. Use base page classes for common interactions. Store locators as data-testid attributes (more stable than XPath). Benefits: DRY, easy maintenance.",
      categories: ['Automation'],
    },
    {
      q: "How would you handle flaky tests in a CI/CD pipeline?",
      answer: "Quarantine flaky tests to prevent blocking. Root cause categories: timing issues (explicit waits, not sleep), data dependencies (factory patterns for independent data), shared state (isolated databases, unique IDs), environment differences. Implement automatic retry (1-2x with logging). Track flaky metrics over time. Prioritize fixing most frequently flaky tests.",
      categories: ['CI Integration', 'Automation'],
    },
    {
      q: "Explain contract testing vs integration testing for microservices.",
      answer: "Integration testing deploys real services end-to-end — comprehensive but slow and expensive. Contract testing (Pact) verifies consumer expectations match provider behavior independently. Consumer generates expected request/response contract; provider verifies it separately. Faster, more isolated, catches API breaking changes early. Use contract testing for interfaces, integration testing for critical E2E flows.",
      categories: ['API Testing'],
    },
    {
      q: "How do you design performance test scenarios for a high-traffic e-commerce checkout flow?",
      answer: "Model realistic traffic from production analytics. Scenarios: (1) Load test — sustained expected traffic for 30+ min. (2) Stress test — 2-3x load to find breaking points. (3) Spike test — sudden surge (flash sale). (4) Soak test — sustained load for 8-12hr to detect memory leaks. Use JMeter/k6 with parameterized data. Monitor p50/p95/p99 response times, error rates, throughput.",
      categories: ['Performance Testing'],
    },
    {
      q: "Describe your approach to risk-based test prioritization for a tight release deadline.",
      answer: "Score by: (1) Business impact — revenue-critical, user-facing features highest. (2) Change complexity — new/refactored code has higher defect probability. (3) Historical defect density — areas with past bugs need more testing. (4) User frequency — most-used features have highest impact if broken. Prioritize: critical path smoke tests first, then high-risk areas, regression of unchanged areas last.",
      categories: ['Test Strategy'],
    },
    {
      q: "How would you test an API that has complex authentication and rate limiting?",
      answer: "Auth testing: valid tokens (happy path), expired/malformed/missing tokens, permission-based access per role. Rate limiting: send requests at exactly the limit to verify acceptance, exceed to verify 429 with Retry-After header, test reset after window expires. Test per API key vs per IP. Automate with Postman/Newman or REST Assured with parameterized auth scenarios.",
      categories: ['API Testing', 'Performance Testing'],
    },
    {
      q: "Explain shift-left testing and how it impacts the development lifecycle.",
      answer: "Shift-left moves testing earlier: developers write unit tests (TDD), static analysis in pre-commit hooks, QA participates in requirements refinement for edge case identification, API contract tests before integration. Defects caught early are 10-100x cheaper to fix. Trade-off: requires cultural change and developer testing skills investment.",
      categories: ['Test Strategy', 'CI Integration'],
    },
  ],

  // ────────────────────────────────────────────────────────────
  // CLOUD ARCHITECT
  // ────────────────────────────────────────────────────────────
  'Cloud Architect': [
    {
      q: "Design a highly available, multi-region architecture for a SaaS application on AWS.",
      answer: "Active-active across 2+ regions with Route53 latency-based routing. ECS/EKS with auto-scaling per region behind ALBs. Aurora Global Database with <1s cross-region replication. ElastiCache Redis with replication. S3 + CloudFront for edge delivery. DynamoDB Global Tables for session data. Define RPO <1min, RTO <5min with health-based failover.",
      categories: ['Scalability', 'Cloud Services', 'Disaster Recovery'],
    },
    {
      q: "Explain the CQRS pattern and when it's appropriate vs a traditional CRUD approach.",
      answer: "CQRS separates read and write models into distinct services. Commands mutate via write model with strict validation. Queries read from optimized denormalized views. Appropriate when read/write workloads differ in scale or complexity, or implementing event sourcing. Adds eventual consistency complexity — read model may lag behind writes. Overkill for simple CRUD apps.",
      categories: ['Cloud Design Patterns'],
    },
    {
      q: "How would you implement a zero-trust security model in a cloud-native architecture?",
      answer: "Never trust, always verify regardless of network location. Identity-based access with short-lived certificates (SPIFFE/SPIRE). mTLS for all service-to-service communication via service mesh. Fine-grained IAM with least privilege. Micro-segmentation with VPC policies. Device posture verification. Continuous monitoring with behavioral analytics. Just-in-time access for privileged operations.",
      categories: ['Security'],
    },
    {
      q: "Compare serverless (Lambda) vs containers (ECS/EKS) for a variable-traffic workload.",
      answer: "Lambda: zero management, scales to zero (no idle cost), auto-scales per request, 15-min limit, cold start latency — ideal for event-driven, bursty traffic. ECS/EKS: full runtime control, no cold starts, long-running processes, predictable pricing — ideal for steady-state, latency-sensitive workloads. Choose Lambda for variable/event-driven, containers for consistent workloads.",
      categories: ['Cloud Services', 'Cost Optimization'],
    },
    {
      q: "How do you design a cost-effective data lake architecture on AWS?",
      answer: "Ingest raw data into S3 in Parquet/ORC format partitioned by date. AWS Glue crawlers catalog schema. Query with Athena (serverless, pay-per-scan). Redshift Spectrum for joining lake with warehouse data. Lifecycle policies: S3 Intelligent-Tiering and Glacier for cold data. Optimize with Parquet compression and partition pruning. Secure with Lake Formation access controls and KMS encryption.",
      categories: ['Cost Optimization', 'Cloud Services'],
    },
    {
      q: "Explain RPO and RTO: how do they drive your disaster recovery architecture decisions?",
      answer: "RPO (max acceptable data loss) and RTO (max acceptable downtime) drive architecture cost. RPO=0 requires synchronous replication. RPO=1hr allows async replication with snapshots. RTO=0 requires active-active multi-region (most expensive). RTO=4hrs allows warm standby with automated failover. RTO=24hrs allows cold backup-restore (cheapest). Cost increases exponentially as RPO/RTO approach zero.",
      categories: ['Disaster Recovery'],
    },
    {
      q: "How would you migrate a legacy on-premises system to the cloud with minimal downtime?",
      answer: "Use the 6 R's framework (Rehost, Replatform, Refactor, Repurchase, Retire, Retain). For minimal downtime: hybrid connectivity (Direct Connect/VPN), database replication via DMS with continuous sync, parallel cloud deployment, DNS-based gradual traffic cutover (weighted routing), both environments running during validation. Rollback plan: keep on-prem 2-4 weeks post-migration.",
      categories: ['Cloud Services', 'Networking'],
    },
    {
      q: "Describe a VPC architecture with public/private subnets, NAT gateways, and security groups.",
      answer: "VPC CIDR across 3 AZs. Public subnets host ALBs and bastions with Internet Gateway. Private subnets host app servers and databases — no direct internet access. NAT Gateways in public subnets allow private subnet outbound calls. Security groups: ALB allows 443 inbound, app servers accept only from ALB SG, database accepts only from app SG — layered defense in depth.",
      categories: ['Networking', 'Security'],
    },
  ],

  // ────────────────────────────────────────────────────────────
  // MACHINE LEARNING ENGINEER
  // ────────────────────────────────────────────────────────────
  'Machine Learning Engineer': [
    {
      q: "How do you design a production ML pipeline from data ingestion to model serving?",
      answer: "Stages: data ingestion (Kafka/Airflow → data lake), feature engineering (Spark/dbt → feature store like Feast), training (GPU clusters with hyperparameter tuning, MLflow tracking), evaluation (automated metrics on holdout sets), model registry (version and promote), serving (TorchServe/Triton with autoscaling), monitoring (prediction drift, latency, accuracy).",
      categories: ['ML Pipeline', 'MLOps'],
    },
    {
      q: "Explain model quantization and distillation for deploying models on edge devices.",
      answer: "Quantization reduces precision from FP32 to INT8/INT4, shrinking size 2-4x and accelerating inference. PTQ calibrates with data; QAT fine-tunes with simulated low-precision for better accuracy. Knowledge distillation trains a smaller 'student' to mimic the 'teacher' model's output distributions, preserving 90%+ accuracy at 10x smaller size. ONNX/TensorRT optimize inference for specific hardware.",
      categories: ['Model Optimization'],
    },
    {
      q: "How would you implement online learning for a recommendation system?",
      answer: "Update models incrementally as new interaction data arrives. Stream events via Kafka, update real-time features, perform incremental SGD updates with learning rate decay. Periodic full retraining prevents concept drift accumulation. Exploration-exploitation via Thompson sampling for multi-armed bandits to balance known-good vs new item discovery. Monitor for feedback loops.",
      categories: ['Model Training', 'ML Pipeline'],
    },
    {
      q: "Compare fine-tuning vs RAG (Retrieval-Augmented Generation) for enterprise LLM applications.",
      answer: "Fine-tuning modifies model weights on domain data: deep adaptation, domain language/style, but requires compute and risks catastrophic forgetting. RAG retrieves documents from a vector store as context at inference: no weight modification, always current information, but limited by context window and retrieval quality. Choose fine-tuning for behavioral adaptation, RAG for factual accuracy with source attribution.",
      categories: ['LLMs'],
    },
    {
      q: "How do you detect and mitigate model drift in production?",
      answer: "Data drift: PSI, KS tests, JS divergence against training baselines. Concept drift: track performance on labeled production data. Prediction drift: monitor output distribution shifts. Mitigation: automated retraining triggers, shadow deployment validation, gradual traffic shifting. Feedback loop for ground truth label collection. Tools: Evidently AI, WhyLabs, Arize.",
      categories: ['MLOps'],
    },
    {
      q: "Explain distributed training strategies: data parallelism vs model parallelism.",
      answer: "Data parallelism: replicate full model on each GPU, split batch, synchronize gradients via all-reduce. Simple, scales well for moderate models. Model parallelism: split model layers across GPUs for models that don't fit in single GPU memory. Pipeline parallelism splits sequentially; tensor parallelism splits layers. Hybrid (Megatron-LM, DeepSpeed ZeRO) combines all three for billion-parameter training.",
      categories: ['Distributed Training'],
    },
    {
      q: "How would you design a feature store for real-time and batch feature serving?",
      answer: "Dual-mode: offline store (data warehouse/lake in Parquet for training, computed via Spark/dbt), online store (Redis/DynamoDB for low-latency serving, materialized from offline and updated by streaming pipelines). Feature registry for metadata, schemas, lineage, freshness SLAs. Ensure training-serving consistency with point-in-time correct joins for training.",
      categories: ['ML Pipeline'],
    },
    {
      q: "Describe your approach to versioning ML models, data, and experiments.",
      answer: "Models: MLflow Model Registry with version numbers and stage labels (staging/production/archived). Data: DVC or Delta Lake/LakeFS for versioned datasets. Experiments: log hyperparameters, metrics, code commits, artifacts per run in MLflow/W&B. Reproducibility: pin packages (poetry), containerize environments (Docker), log random seeds. Tag production artifacts with exact data version and code commit.",
      categories: ['MLOps', 'ML Pipeline'],
    },
  ],

  // ────────────────────────────────────────────────────────────
  // BACKEND DEVELOPER
  // ────────────────────────────────────────────────────────────
  'Backend Developer': [
    {
      q: "How do you design idempotent APIs, and why is idempotency critical for distributed systems?",
      answer: "Idempotent APIs produce the same result regardless of how many times a request is repeated. GET, PUT, DELETE are naturally idempotent. For POST, use client-generated idempotency keys: server stores key-to-response mapping, returns cached response for duplicates. Critical because network retries, message redelivery, and timeouts can cause duplicate processing — leading to double charges or inconsistent state.",
      categories: ['API Design'],
    },
    {
      q: "Explain database indexing strategies: B-tree, hash, and composite indexes — trade-offs?",
      answer: "B-tree: sorted balanced tree supporting equality, range queries, and ORDER BY (default in most databases). Hash: O(1) equality lookups but no range queries or sorting. Composite: index multiple columns following leftmost prefix rule. Trade-offs: every index speeds reads but slows writes. Too many indexes waste storage and degrade write performance. Use EXPLAIN to verify index usage.",
      categories: ['Database'],
    },
    {
      q: "How would you implement rate limiting for a public API (token bucket vs sliding window)?",
      answer: "Token bucket: bucket fills at fixed rate, each request consumes a token, allows bursts up to capacity. Simple with Redis INCR + EXPIRE. Sliding window: tracks request timestamps, more accurate than fixed windows (prevents boundary bursts), implemented with Redis sorted sets (ZADD, ZREMRANGEBYSCORE, ZCARD). Return 429 with Retry-After header. Use API key or IP for client identification.",
      categories: ['API Design', 'Security'],
    },
    {
      q: "Explain the Circuit Breaker pattern and how it prevents cascading failures in microservices.",
      answer: "Three states: CLOSED (requests pass, failures counted), OPEN (requests fail immediately — triggered when failure rate exceeds threshold), HALF-OPEN (after timeout, limited test requests to check recovery). Prevents cascading failures: stops sending requests to failing services, preventing thread pool exhaustion. Implement with resilience4j (Java) or Polly (.NET).",
      categories: ['Architecture'],
    },
    {
      q: "How do you handle distributed transactions across multiple microservices (Saga pattern)?",
      answer: "Saga replaces distributed ACID with sequence of local transactions publishing events. Choreography: services react to events autonomously (OrderCreated → PaymentProcessed). Orchestration: central coordinator directs steps and handles failures. Compensating transactions handle rollback: if step 3 fails, undo steps 1 and 2. Use message queues (Kafka/RabbitMQ) for reliable delivery.",
      categories: ['Architecture'],
    },
    {
      q: "How would you optimize a slow database query that's causing production latency spikes?",
      answer: "Systematic: (1) EXPLAIN ANALYZE — identify full scans, nested loops, missing indexes. (2) Add targeted indexes on WHERE/JOIN/ORDER BY columns. (3) Fix N+1 patterns with JOINs or IN clauses. (4) Optimize query — remove unnecessary columns, add LIMIT, use EXISTS over IN. (5) Check connection pool config. (6) Consider read replicas. (7) Add Redis caching for repeated expensive queries.",
      categories: ['Database', 'Performance'],
    },
    {
      q: "Explain event sourcing vs traditional CRUD: when is event sourcing worth the complexity?",
      answer: "CRUD stores current state, overwriting previous values. Event sourcing stores every change as immutable events; state is derived by replay. Benefits: complete audit trail, temporal queries, event-driven integration. Worth it for: audit requirements (financial), event-driven domains (order lifecycle), multiple read models (CQRS). Overkill for simple CRUD apps.",
      categories: ['Architecture'],
    },
    {
      q: "How do you handle database schema migrations in production without data loss?",
      answer: "Expand-contract pattern: (1) Expand — add new columns alongside existing. (2) Migrate — backfill historical data with batched updates to avoid locks. (3) Contract — drop old columns in separate release. Never combine destructive migrations with code changes. Use Flyway/Liquibase/Knex for version-controlled, reversible migrations. Test on production-size staging first.",
      categories: ['Database'],
    },
  ],

  // ────────────────────────────────────────────────────────────
  // CYBERSECURITY ANALYST
  // ────────────────────────────────────────────────────────────
  'Cybersecurity Analyst': [
    {
      q: "Walk through your incident response process for a suspected data breach.",
      answer: "NIST six phases: (1) Preparation — IR team, playbooks, communication channels. (2) Identification — triage SIEM alerts, correlate IoCs, confirm scope. (3) Containment — isolate affected systems, block attacker IPs, revoke compromised credentials. (4) Eradication — remove malware, patch vulnerabilities. (5) Recovery — restore from clean backups, monitor for re-infection. (6) Lessons Learned — post-mortem, update detection rules.",
      categories: ['Incident Response'],
    },
    {
      q: "Explain the OWASP Top 10 and which vulnerabilities you consider most critical today.",
      answer: "OWASP Top 10 (2021): A01-Broken Access Control (most common — IDOR, privilege escalation), A02-Cryptographic Failures, A03-Injection (SQLi, XSS still prevalent), A04-Insecure Design, A05-Security Misconfiguration, A06-Vulnerable Components (supply chain attacks), A07-Auth Failures, A08-Software Integrity, A09-Logging Failures, A10-SSRF. Most critical: A01, A03, and A06.",
      categories: ['Vulnerabilities'],
    },
    {
      q: "How would you implement a zero-trust security architecture for a cloud-native application?",
      answer: "Verify explicitly, least privilege, assume breach. Strong identity: MFA for humans, mTLS with SPIFFE for services. Micro-segmentation via network policies. Just-in-time access with approval workflows. Continuous monitoring with behavioral analytics on authentication. Data-centric: encrypt at rest and in transit, classify sensitive data. Never trust network location alone.",
      categories: ['Security Frameworks'],
    },
    {
      q: "Describe the difference between symmetric and asymmetric encryption with real-world use cases.",
      answer: "Symmetric (AES-256): same key for encrypt/decrypt — fast for bulk data but key distribution challenge. Asymmetric (RSA, ECDSA): public/private key pair — slower but solves distribution. TLS uses asymmetric (ECDHE) to exchange a symmetric session key, then symmetric (AES-GCM) for data — combining security of asymmetric with speed of symmetric. Digital signatures: sign with private, verify with public.",
      categories: ['Cryptography'],
    },
    {
      q: "How do you design a SIEM strategy for detecting advanced persistent threats (APTs)?",
      answer: "Ingest from all sources: endpoint EDR, network firewall/DNS/proxy, identity AD/SSO, cloud (CloudTrail). Normalize to common schema. Detection layers: signature-based rules for known IoCs, behavioral analytics for anomalies (lateral movement, data exfiltration), threat intelligence correlation. SOAR for automated playbooks. Long retention (90+ days) for hunting APTs that persist for months.",
      categories: ['Threat Detection'],
    },
    {
      q: "Explain how you would conduct a security assessment of a new third-party API integration.",
      answer: "Assessment: (1) Authentication — OAuth2, API keys, mTLS? Credential rotation? (2) Data exposure — PII handling, encryption in transit (TLS 1.2+). (3) Input validation — injection testing. (4) Rate limiting protections. (5) SLA and breach notification policies. (6) Compliance — SOC 2, GDPR certifications. (7) Supply chain risk — vendor security posture. Document as risk assessment with accept/mitigate/reject.",
      categories: ['Security Frameworks', 'Network Security'],
    },
    {
      q: "How does TLS 1.3 improve upon TLS 1.2, and what are the key handshake differences?",
      answer: "TLS 1.3 reduces handshake from 2 round trips to 1 (1-RTT), supports 0-RTT resumption. Removes insecure algorithms: no RSA key exchange (only ECDHE for forward secrecy), no CBC ciphers, no SHA-1. Server messages are encrypted for handshake privacy. Mandates forward secrecy — past sessions protected even if server key is later compromised via ephemeral ECDHE keys.",
      categories: ['Cryptography', 'Network Security'],
    },
    {
      q: "Describe your approach to security awareness training and phishing simulation programs.",
      answer: "Baseline phishing simulation to measure click rates by department. Role-based training: all employees (phishing, passwords, social engineering), developers (secure coding, OWASP), admins (hardening, IR). Monthly realistic campaigns with increasing sophistication. Track click rates, report rates, time-to-report. Positive reinforcement: recognize reporters, don't punish clickers. Real-time teachable moments on simulated phish clicks.",
      categories: ['Security Frameworks'],
    },
  ],

  // ────────────────────────────────────────────────────────────
  // DATABASE ADMINISTRATOR
  // ────────────────────────────────────────────────────────────
  'Database Administrator': [
    {
      q: "How do you analyze and optimize a slow query using EXPLAIN/query execution plans?",
      answer: "EXPLAIN ANALYZE shows: execution nodes (Seq Scan, Index Scan, Nested Loop, Hash Join), estimated vs actual rows, cost and time per node. Red flags: Sequential Scans on large tables (missing index), Nested Loops with high row counts, Sort without indexes. Optimize: add indexes on WHERE/JOIN columns (leftmost prefix rule), rewrite subqueries as JOINs, add LIMIT, update statistics with ANALYZE.",
      categories: ['Query Optimization'],
    },
    {
      q: "Compare database replication strategies: synchronous vs asynchronous with trade-offs.",
      answer: "Synchronous: primary waits for replica acknowledgment before committing — zero data loss (RPO=0) but adds write latency. Asynchronous: primary commits immediately, replicates in background — lower latency but risk of data loss if primary fails before replication. Semi-synchronous waits for one replica — middle ground. Choose based on durability requirements vs performance needs.",
      categories: ['Replication / HA'],
    },
    {
      q: "How would you design a database sharding strategy for a billion-row table?",
      answer: "Choose shard key for: even distribution (avoid hotspots), alignment with query patterns, minimized cross-shard queries. Strategies: hash-based (consistent hashing on user_id — even but no range queries), range-based (dates — range queries but hotspot risk), directory-based (flexible but lookup overhead). Use virtual shards (256 virtual → 4 physical) to simplify future rebalancing.",
      categories: ['Sharding / Partitioning'],
    },
    {
      q: "Explain database connection pooling and how misconfigured pools cause production outages.",
      answer: "Pooling maintains pre-established connections for reuse, avoiding per-request TCP/auth/SSL overhead. Failures: pool too small — high load causes connection wait timeouts (exhaustion). Pool too large — exceeds max_connections. No validation — stale connections cause query failures. No timeout — leaked connections exhaust pool. Use PgBouncer or HikariCP with proper sizing.",
      categories: ['Performance Tuning'],
    },
    {
      q: "How do you implement point-in-time recovery for a PostgreSQL database?",
      answer: "PostgreSQL PITR uses Write-Ahead Logging (WAL). Setup: continuous archiving (archive_command ships WAL to S3/NFS), periodic base backups (pg_basebackup). Recovery: restore latest base backup, replay archived WAL files to target timestamp using recovery_target_time. Database replays transactions to exactly the specified point, recovering to seconds before corruption.",
      categories: ['Backup / Recovery'],
    },
    {
      q: "Compare SQL vs NoSQL databases for different use cases with concrete examples.",
      answer: "SQL (PostgreSQL, MySQL): structured data, ACID, complex JOINs — for financial systems, ERP. Document (MongoDB): flexible schema, nested objects — for CMS, user profiles. Key-Value (Redis, DynamoDB): ultra-fast lookups — for sessions, caching. Column-family (Cassandra): high write throughput — for time-series, IoT. Graph (Neo4j): relationship traversal — for social networks, recommendations.",
      categories: ['NoSQL'],
    },
    {
      q: "How do you handle schema migrations in a production database with zero downtime?",
      answer: "Expand-contract: (1) ALTER TABLE to add new columns (non-blocking in PostgreSQL, use pt-online-schema-change in MySQL). Deploy code writing to both schemas. (2) Backfill in batches with sleep to avoid lock contention. (3) Deploy code reading from new schema, drop old columns separately. Never rename columns in-place — add, backfill, switch, drop.",
      categories: ['Performance Tuning', 'Backup / Recovery'],
    },
    {
      q: "Explain database locking levels and how to diagnose and resolve deadlocks.",
      answer: "Lock levels: row-level (most concurrent), page-level, table-level (least concurrent). Types: shared (read), exclusive (write). Deadlocks: circular wait when T1 holds A, wants B, while T2 holds B, wants A. Diagnose with pg_locks/SHOW ENGINE INNODB STATUS. Databases auto-detect and kill one transaction. Prevent: consistent lock ordering, short transactions, SELECT...FOR UPDATE NOWAIT.",
      categories: ['Performance Tuning'],
    },
  ],

  // ────────────────────────────────────────────────────────────
  // UI/UX DESIGNER
  // ────────────────────────────────────────────────────────────
  'UI/UX Designer': [
    {
      q: "How do you build and maintain a scalable design system for a large product team?",
      answer: "Atomic design: tokens (CSS custom properties), atoms (Button, Input), molecules (SearchBar), organisms (Header). Maintain as versioned npm package with Storybook documentation. Design tokens synced between Figma and code. Governance: dedicated team, PR-based contributions, changelogs, adoption metrics. Automated visual regression tests (Chromatic) catch unintended changes.",
      categories: ['Design Systems'],
    },
    {
      q: "Explain Gestalt principles and how they influence UI layout decisions.",
      answer: "Gestalt principles: (1) Proximity — close elements perceived as grouped (spacing creates sections). (2) Similarity — similar appearance means related (consistent button styles). (3) Continuity — eye follows smooth paths (grid alignment). (4) Closure — brain completes incomplete shapes (icon design). (5) Figure-Ground — foreground vs background distinction (card elevation, modals). These inform card grouping, navigation hierarchy, form layout.",
      categories: ['Interaction Design'],
    },
    {
      q: "How do you conduct and synthesize usability testing results into actionable improvements?",
      answer: "Recruit 5-7 participants (surfaces 85% of issues). Moderate with think-aloud protocol, record sessions. Synthesize: affinity mapping into themes, severity rating (impact × frequency), prioritized recommendations with user quotes and video timestamps. Present as severity-ranked action list with before/after wireframes.",
      categories: ['User Research'],
    },
    {
      q: "Describe your approach to making a complex enterprise dashboard accessible (WCAG 2.1 AA).",
      answer: "Color: minimum 4.5:1 contrast, don't rely on color alone (add icons/patterns to charts). Keyboard: all elements focusable and operable, visible focus indicators, logical tab order. Screen readers: semantic HTML, ARIA labels on charts, live regions for dynamic updates. Motion: respect prefers-reduced-motion. Zoom: maintain usability at 200%. Test with VoiceOver, NVDA, axe-core.",
      categories: ['Accessibility'],
    },
    {
      q: "How do you measure the success of a design change quantitatively?",
      answer: "Define metrics before launch: task completion rate, time-on-task, error rate, SUS (System Usability Scale), CSAT, NPS. A/B test against current version with sufficient sample size. Track behavioral analytics: click-through rates, funnel changes, bounce rate, feature adoption. Compare usability test results before/after. Report: '85% task completion (up from 62%), 40% reduction in time-on-task.'",
      categories: ['Metrics'],
    },
    {
      q: "Explain information architecture: how do you organize content for complex applications?",
      answer: "IA structures content for findability. Process: card sorting (discover user mental models), tree testing (validate hierarchy without UI), sitemap creation, navigation patterns (global nav, local nav, breadcrumbs for deep hierarchies). Progressive disclosure: surface top-level first, drill into details. Label using user language, not internal jargon.",
      categories: ['User Research', 'Interaction Design'],
    },
    {
      q: "How do you handle design-development handoff to ensure pixel-perfect implementation?",
      answer: "Figma specs with auto-layout, spacing tokens, component variants for direct inspection. Interactive prototypes showing micro-interactions, hover states, transitions. Behavior documentation: edge cases, error states, empty states, loading states. Design tokens exported as CSS custom properties. Regular design review sessions during sprints. Visual QA with overlay comparison tools.",
      categories: ['Design Systems', 'Prototyping'],
    },
    {
      q: "Describe your process for designing micro-interactions that enhance user experience.",
      answer: "Dan Saffer's four stages: (1) Trigger — user action or system event. (2) Rules — what happens (button depresses, menu slides). (3) Feedback — visual/haptic/audio confirmation (checkmark animation, ripple effect). (4) Loops/Modes — over-time behavior (progress indication). Keep animations under 300ms, use easing curves (ease-out for entering, ease-in for exiting), respect prefers-reduced-motion.",
      categories: ['Interaction Design', 'Prototyping'],
    },
  ],
};

module.exports = { getQuestionSpecificData, findBestMatch };
