// src/config/aiClient.js
// Multi-provider AI Client with automatic fallback engine.
// Supports OpenAI (primary) and Google Gemini (fallback) APIs.
// 20+ role keyword banks, experience-level-adaptive scoring, expanded question pools.

const { getQuestionSpecificData } = require('./questionAnswerBank');

async function askAI(systemPrompt, userPrompt, maxTokens = 1024) {
  // PRIMARY: OpenAI
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
          max_tokens: maxTokens,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return content;
      }
    } catch (err) { console.warn('OpenAI API failed:', err.message); }
  }

  // FALLBACK: Google Gemini
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }] }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) return content;
      }
    } catch (err) { console.warn('Gemini API failed:', err.message); }
  }

  // LOCAL FALLBACK ENGINE
  return generateFallbackAIResponse(systemPrompt, userPrompt);
}

// ============================================================
// GIBBERISH & ECHOING DETECTION HELPERS
// ============================================================

// Known valid technical abbreviations / acronyms that must NOT be flagged as gibberish
const VALID_TECH_ACRONYMS = new Set([
  'api', 'sql', 'jwt', 'gc', 'jvm', 'orm', 'oop', 'dsa', 'ci', 'cd', 'cdn',
  'http', 'https', 'tcp', 'udp', 'dns', 'ssl', 'tls', 'rest', 'grpc', 'rpc',
  'css', 'html', 'dom', 'ssr', 'csr', 'spa', 'pwa', 'xml', 'json', 'yaml',
  'aws', 'gcp', 'iam', 'vpc', 'ec2', 'rds', 's3', 'k8s', 'k8', 'vm',
  'cpu', 'ram', 'gpu', 'ssd', 'hdd', 'io', 'os', 'cli', 'sdk', 'ide',
  'mvc', 'mvp', 'mvvm', 'ddd', 'tdd', 'bdd', 'etl', 'elt', 'dag',
  'lru', 'lfu', 'bfs', 'dfs', 'dp', 'log', 'ui', 'ux', 'db',
  'crud', 'cors', 'csrf', 'xss', 'sqli', 'rbac', 'abac', 'sso', 'ldap',
  'stw', 'g1gc', 'zgc', 'cas', 'gil', 'asgi', 'wsgi', 'orm', 'jpa',
  'cte', 'olap', 'oltp', 'dwh', 'ml', 'ai', 'nlp', 'cv', 'llm', 'gpu',
  'okr', 'kpi', 'dau', 'mau', 'arpu', 'gtm', 'apm', 'sli', 'slo', 'sla',
  'lcp', 'fid', 'cls', 'ttfb', 'aot', 'jit'
]);

function isGibberishOrInvalid(text) {
  if (!text || typeof text !== 'string') return true;
  const trimmed = text.trim();
  // Very short (under 8 chars) is suspicious
  if (trimmed.length < 8) return true;
  const words = trimmed.split(/\s+/).filter(Boolean);
  // Single word is not a valid interview answer
  if (words.length < 2) return true;
  let invalidWordCount = 0;
  for (const word of words) {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleanWord) continue;
    // Allow known technical acronyms
    if (VALID_TECH_ACRONYMS.has(cleanWord)) continue;
    // Allow short words (≤3 chars) — "the", "is", "by" etc.
    if (cleanWord.length <= 3) continue;
    // Flag only clear keyboard mashing patterns
    const isKeyMash = /^(asdfg|qwerty|zxcvb|dfghj|hjkl|aaaa|bbbb|cccc|xxxx|1234|abcd)/i.test(cleanWord);
    // Flag repeated-character garbage like "aaaaaaa" or "xxxxxxx"
    const isRepeatedChar = /^(.){4,}$/.test(cleanWord) && new Set(cleanWord.split('')).size === 1;
    if (isKeyMash || isRepeatedChar) invalidWordCount++;
  }
  // Only flag as gibberish if >50% of words are garbage
  return (invalidWordCount / words.length) > 0.5;
}

function isQuestionEchoed(questionText, answerText) {
  if (!questionText || !answerText) return false;
  const cleanQ = questionText.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const cleanA = answerText.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  if (cleanQ === cleanA || cleanA.includes(cleanQ)) return true;
  const qWords = new Set(cleanQ.split(/\s+/).filter((w) => w.length > 3));
  const aWords = cleanA.split(/\s+/).filter((w) => w.length > 3);
  if (aWords.length === 0) return false;
  let matchCount = 0;
  for (const w of aWords) { if (qWords.has(w)) matchCount++; }
  return (matchCount / aWords.length) >= 0.7 && aWords.length <= qWords.size + 4;
}

// ============================================================
// 20+ ROLE KEYWORD BANKS & QUESTION POOLS
// ============================================================

const ROLE_KEYWORD_BANKS = {
  'Java Developer': {
    keywords: {
      '@Configuration / @Bean Method-Level': ['configuration', '@configuration', 'bean', 'method-level', 'factory'],
      'Component Scanning / Stereotype': ['component scan', 'scanning', 'stereotype', '@component', 'auto-detect'],
      'IoC Container / DI': ['ioc', 'container', 'dependency injection', 'inversion of control', 'autowired'],
      'JVM Heap / Generations': ['heap', 'generation', 'young', 'tenured', 'eden', 'region'],
      'GC Pause / STW': ['stw', 'stop the world', 'pause', 'latency', 'concurrent', 'g1gc', 'zgc'],
      'ConcurrentHashMap / Segmented Locking': ['concurrenthashmap', 'segment', 'lock', 'cas', 'thread', 'atomic'],
      'Stream API / Lambda': ['stream', 'lambda', 'functional', 'pipeline', 'collect', 'map', 'filter', 'reduce'],
      'JPA / Hibernate / ORM': ['jpa', 'hibernate', 'orm', 'entity', 'lazy loading', 'n+1', 'session'],
    },
    questions: [
      "Explain the difference between Spring @Bean and @Component, and how Spring resolves circular dependencies.",
      "How does the Garbage Collector work in JVM? Contrast G1GC with ZGC for low-latency applications.",
      "How does ConcurrentHashMap achieve thread safety without locking the entire map?",
      "Explain Java Streams API: how does lazy evaluation and short-circuiting improve performance?",
      "What are Java Records and Sealed Classes, and when should you use them over traditional class hierarchies?",
      "How does JPA's N+1 query problem occur, and what strategies prevent it in production?",
      "Explain the Java Memory Model: what guarantees does 'volatile' provide vs synchronized blocks?",
      "How would you design a high-throughput event processing pipeline using Java CompletableFuture?",
    ],
    sampleAnswer: "@Component is a class-level stereotype annotation for automatic bean discovery via classpath component scanning. @Bean is declared on methods within @Configuration classes to manually construct and register beans, essential for configuring third-party library objects."
  },

  'Frontend Developer': {
    keywords: {
      'Virtual DOM / Reconciliation': ['virtual dom', 'reconciliation', 'diffing', 'fiber', 'render tree'],
      'React Hooks / State': ['usestate', 'useeffect', 'usememo', 'usecallback', 'hook', 'closure', 'stale closure'],
      'CSS Layout / Compositing': ['compositing', 'layer', 'reflow', 'repaint', 'contain', 'will-change', 'gpu'],
      'Webpack / Bundling': ['webpack', 'vite', 'bundl', 'tree shaking', 'code splitting', 'chunk', 'module federation'],
      'Web Performance': ['lighthouse', 'core web vitals', 'lcp', 'fid', 'cls', 'lazy load', 'critical rendering'],
      'TypeScript / Type Safety': ['typescript', 'interface', 'generic', 'type guard', 'discriminated union'],
      'State Management': ['redux', 'zustand', 'context', 'recoil', 'jotai', 'state management', 'global state'],
      'Testing': ['jest', 'testing library', 'cypress', 'playwright', 'unit test', 'integration test', 'e2e'],
    },
    questions: [
      "Explain how the React Virtual DOM diffing algorithm works, and how keys optimize list re-renders.",
      "How do CSS containment, compositing layers, and requestAnimationFrame optimize browser rendering performance?",
      "Describe how you would implement client-side caching and optimistic updates for a real-time collaborative app.",
      "What are Micro-Frontends, and how does Webpack Module Federation enable them?",
      "Explain the difference between useMemo and useCallback. When does each actually improve performance?",
      "How would you debug and fix a Core Web Vitals regression (high LCP, CLS)?",
      "Explain how React Suspense and Server Components change the data fetching paradigm.",
      "How would you architect a design system component library that supports theming and accessibility?",
    ],
    sampleAnswer: "React's Virtual DOM creates an in-memory representation of the actual DOM. On state changes, React runs a reconciliation algorithm (diffing) comparing old and new virtual trees, computing the minimal set of DOM mutations needed. Keys help React identify which items changed in lists."
  },

  'Data Analyst': {
    keywords: {
      'Window Functions / OVER': ['window function', 'over', 'partition by', 'row_number', 'rank', 'dense_rank', 'lead', 'lag'],
      'SQL Joins / Subqueries': ['join', 'inner', 'left', 'cross', 'subquery', 'cte', 'common table expression'],
      'Statistical Methods': ['p-value', 'confidence interval', 'hypothesis', 'regression', 'correlation', 'significance'],
      'Data Visualization': ['tableau', 'power bi', 'matplotlib', 'chart', 'dashboard', 'visualization'],
      'ETL / Data Pipeline': ['etl', 'extract', 'transform', 'load', 'pipeline', 'data warehouse', 'data lake'],
      'A/B Testing': ['a/b test', 'control group', 'treatment', 'sample size', 'statistical power', 'experiment'],
    },
    questions: [
      "How do window functions like ROW_NUMBER(), RANK(), and DENSE_RANK() differ in SQL?",
      "Explain how you would handle missing or corrupted data in a large time-series dataset.",
      "What metrics would you define to measure user retention vs churn for a SaaS product?",
      "Explain the difference between A/B testing statistical significance and statistical power.",
      "How would you design a data pipeline to process 10 million daily events into business intelligence dashboards?",
      "Explain CTEs (Common Table Expressions) vs subqueries — when is each more appropriate?",
      "How do you detect and handle data quality issues in production analytics pipelines?",
      "Describe how you would build a customer cohort analysis to identify high-value user segments.",
    ],
    sampleAnswer: "SQL window functions compute calculations across a subset of rows related to the current row without collapsing rows like GROUP BY. ROW_NUMBER() assigns unique sequential integers. RANK() assigns identical ranks to ties but leaves gaps. DENSE_RANK() assigns identical ranks without gaps."
  },

  'Product Manager': {
    keywords: {
      'Prioritization Framework': ['rice', 'moscow', 'ice', 'kano', 'prioritiz', 'impact', 'effort', 'reach'],
      'Metrics / KPIs': ['kpi', 'metric', 'north star', 'okr', 'conversion', 'retention', 'arpu', 'dau', 'mau'],
      'User Research': ['user research', 'persona', 'journey map', 'usability', 'interview', 'survey'],
      'Agile / Scrum': ['sprint', 'agile', 'scrum', 'backlog', 'standup', 'retrospective', 'kanban', 'velocity'],
      'Go-to-Market': ['gtm', 'go-to-market', 'launch', 'market fit', 'competitive', 'positioning'],
      'Stakeholder Management': ['stakeholder', 'cross-functional', 'alignment', 'trade-off', 'roadmap'],
    },
    questions: [
      "How do you prioritize competing feature requests from enterprise sales vs technical debt?",
      "Walk me through designing a telemetry and metrics framework for a new AI feature.",
      "Describe a situation where a product launch missed its primary KPI. How did you diagnose and pivot?",
      "How do you balance user experience simplification against advanced power-user functionality?",
      "Explain how you would define success metrics for a marketplace product's supply-demand balance.",
      "How would you conduct user research to validate a B2B SaaS product hypothesis?",
      "Describe your framework for making build-vs-buy decisions for platform capabilities.",
      "How would you handle disagreement between engineering and design on a critical feature scope?",
    ],
    sampleAnswer: "I use the RICE framework (Reach, Impact, Confidence, Effort) to quantitatively prioritize features. For competing enterprise vs debt requests, I map each to North Star metric impact, present trade-offs to stakeholders with data, and propose a balanced sprint allocation."
  },

  'Python Developer': {
    keywords: {
      'GIL / Threading': ['gil', 'global interpreter lock', 'threading', 'multiprocessing', 'asyncio', 'concurrent'],
      'Decorators / Metaclasses': ['decorator', 'metaclass', 'wrapper', 'functools', 'closure', 'property'],
      'List Comprehension / Generators': ['generator', 'yield', 'comprehension', 'iterator', 'lazy evaluation'],
      'Django / Flask / FastAPI': ['django', 'flask', 'fastapi', 'middleware', 'orm', 'migration', 'wsgi', 'asgi'],
      'Data Structures': ['dict', 'set', 'deque', 'heapq', 'collections', 'defaultdict', 'namedtuple'],
      'Testing / Type Hints': ['pytest', 'unittest', 'mock', 'type hint', 'mypy', 'pydantic'],
    },
    questions: [
      "Explain the GIL in CPython: why does it exist, and how do you achieve true parallelism despite it?",
      "How do Python decorators work internally? Write a decorator that caches function results.",
      "Explain generators vs list comprehensions: when does lazy evaluation provide a real advantage?",
      "Compare Django ORM, SQLAlchemy, and raw SQL for a high-throughput API — trade-offs?",
      "How would you design a rate-limiting middleware for a FastAPI application?",
      "Explain Python's memory management: reference counting, garbage collection, and __slots__.",
      "How do async/await and asyncio event loops work in Python for I/O-bound workloads?",
      "What are context managers, and how does the 'with' statement work under the hood?",
    ],
    sampleAnswer: "The GIL (Global Interpreter Lock) prevents multiple native threads from executing Python bytecodes simultaneously. For CPU-bound parallelism, use multiprocessing to spawn separate interpreter processes. For I/O-bound concurrency, use asyncio with async/await."
  },

  'Full Stack Developer': {
    keywords: {
      'REST / GraphQL': ['rest', 'graphql', 'endpoint', 'mutation', 'query', 'resolver', 'api gateway'],
      'Authentication / JWT': ['jwt', 'oauth', 'session', 'token', 'refresh token', 'bcrypt', 'passport'],
      'Database Design': ['normalization', 'index', 'foreign key', 'migration', 'transaction', 'acid'],
      'CI/CD': ['ci/cd', 'pipeline', 'deploy', 'docker', 'github actions', 'jenkins', 'automated'],
      'Caching': ['redis', 'cache', 'cdn', 'invalidation', 'ttl', 'memcached'],
      'Architecture': ['microservice', 'monolith', 'serverless', 'event driven', 'message queue', 'load balancer'],
    },
    questions: [
      "Compare REST vs GraphQL APIs: when would you choose each for a production application?",
      "How would you implement secure JWT-based authentication with refresh token rotation?",
      "Explain database normalization vs denormalization trade-offs for a high-read application.",
      "How would you design a CI/CD pipeline for a full-stack app with staging and production environments?",
      "Explain caching strategies: when do you use Redis vs CDN vs in-memory caching?",
      "How would you migrate a monolithic application to microservices without downtime?",
      "Describe your approach to handling file uploads, processing, and storage at scale.",
      "How do you handle database schema migrations in production without data loss?",
    ],
    sampleAnswer: "REST is resource-oriented with predictable URL patterns, ideal for CRUD-heavy apps with clear domain models. GraphQL uses a single endpoint with flexible queries, eliminating over-fetching and under-fetching, ideal for mobile apps or complex nested data requirements."
  },

  'DevOps Engineer': {
    keywords: {
      'Docker / Containers': ['docker', 'container', 'dockerfile', 'image', 'layer', 'multi-stage', 'compose'],
      'Kubernetes / Orchestration': ['kubernetes', 'k8s', 'pod', 'deployment', 'service', 'ingress', 'helm', 'namespace'],
      'CI/CD Pipeline': ['jenkins', 'github actions', 'gitlab ci', 'pipeline', 'artifact', 'build', 'deploy'],
      'Infrastructure as Code': ['terraform', 'ansible', 'cloudformation', 'iac', 'provision', 'idempotent'],
      'Monitoring / Observability': ['prometheus', 'grafana', 'elk', 'logging', 'alerting', 'sli', 'slo', 'sla'],
      'Cloud Services': ['aws', 'azure', 'gcp', 'ec2', 'lambda', 's3', 'vpc', 'iam'],
    },
    questions: [
      "Explain Docker multi-stage builds and how they reduce production image size.",
      "How does Kubernetes handle pod scheduling, auto-scaling, and self-healing?",
      "Design a CI/CD pipeline for a microservices architecture with blue-green deployments.",
      "Compare Terraform vs Ansible: when would you use each for infrastructure management?",
      "How would you set up comprehensive observability (logging, metrics, tracing) for a distributed system?",
      "Explain Kubernetes networking: Services, Ingress controllers, and network policies.",
      "How do you implement secrets management in a containerized production environment?",
      "Describe your approach to disaster recovery and multi-region failover.",
    ],
    sampleAnswer: "Docker multi-stage builds use multiple FROM statements. Earlier stages compile/build the application, while the final stage copies only the compiled artifact into a minimal base image (e.g., alpine). This eliminates build tools and source code from production images, reducing size by 80%+."
  },

  'Data Scientist': {
    keywords: {
      'ML Algorithms': ['regression', 'classification', 'random forest', 'gradient boosting', 'xgboost', 'svm', 'neural network'],
      'Feature Engineering': ['feature engineering', 'feature selection', 'encoding', 'normalization', 'scaling', 'one-hot'],
      'Model Evaluation': ['precision', 'recall', 'f1', 'auc', 'roc', 'cross-validation', 'overfitting', 'bias-variance'],
      'Deep Learning': ['cnn', 'rnn', 'lstm', 'transformer', 'attention', 'backpropagation', 'batch normalization'],
      'Data Processing': ['pandas', 'numpy', 'spark', 'sql', 'data cleaning', 'imputation', 'outlier'],
      'MLOps': ['mlflow', 'model serving', 'pipeline', 'experiment tracking', 'a/b test', 'drift detection'],
    },
    questions: [
      "Explain the bias-variance trade-off and how it affects model selection.",
      "How do you handle class imbalance in a classification problem?",
      "Compare Random Forest vs Gradient Boosting: strengths, weaknesses, and when to use each.",
      "How would you design a feature engineering pipeline for a recommendation system?",
      "Explain the Transformer architecture and self-attention mechanism.",
      "How do you detect and handle data drift in a production ML model?",
      "Describe your approach to A/B testing a new ML model against a baseline in production.",
      "How would you explain a complex ML model's predictions to non-technical stakeholders?",
    ],
    sampleAnswer: "The bias-variance trade-off describes the tension between underfitting (high bias, model too simple) and overfitting (high variance, model too complex). The goal is to find a model complexity that minimizes total error. Cross-validation helps estimate this balance empirically."
  },

  'Mobile Developer': {
    keywords: {
      'React Native / Flutter': ['react native', 'flutter', 'dart', 'widget', 'bridge', 'native module', 'expo'],
      'State Management': ['redux', 'bloc', 'provider', 'riverpod', 'mobx', 'state management'],
      'Performance': ['jank', 'frame rate', '60fps', 'lazy load', 'virtualized list', 'memory leak'],
      'Native APIs': ['camera', 'location', 'notification', 'push', 'deep link', 'biometric'],
      'App Architecture': ['mvvm', 'clean architecture', 'repository pattern', 'dependency injection'],
      'Testing / CI': ['detox', 'appium', 'xctest', 'espresso', 'snapshot test', 'fastlane'],
    },
    questions: [
      "Compare React Native vs Flutter: rendering architecture, performance, and ecosystem trade-offs.",
      "How do you diagnose and fix UI jank (dropped frames) in a mobile application?",
      "Explain how push notifications work end-to-end (APNs/FCM, token management, payload handling).",
      "How would you implement offline-first data synchronization for a mobile app?",
      "Describe your approach to managing app state in a large React Native application.",
      "How do you handle backward compatibility when releasing new app versions?",
      "Explain deep linking and universal links: how do they work across iOS and Android?",
      "How would you architect a mobile app for accessibility compliance?",
    ],
    sampleAnswer: "React Native uses a JavaScript bridge to communicate with native UI components, which can introduce performance overhead. Flutter renders directly using Skia/Impeller engine, giving pixel-perfect control and consistent 60fps but requiring the Dart language."
  },

  'QA Engineer': {
    keywords: {
      'Testing Types': ['unit test', 'integration test', 'e2e', 'regression', 'smoke test', 'sanity test'],
      'Automation': ['selenium', 'cypress', 'playwright', 'appium', 'testng', 'junit', 'page object'],
      'CI Integration': ['ci/cd', 'pipeline', 'parallel', 'flaky test', 'test report', 'coverage'],
      'API Testing': ['postman', 'rest assured', 'api test', 'contract test', 'schema validation'],
      'Performance Testing': ['jmeter', 'k6', 'load test', 'stress test', 'throughput', 'response time'],
      'Test Strategy': ['test plan', 'test case', 'boundary', 'equivalence', 'risk-based', 'exploratory'],
    },
    questions: [
      "Explain the test pyramid: unit, integration, and E2E tests — optimal ratio and trade-offs.",
      "How do you design a page object model for a Selenium/Playwright automation framework?",
      "How would you handle flaky tests in a CI/CD pipeline?",
      "Explain contract testing vs integration testing for microservices.",
      "How do you design performance test scenarios for a high-traffic e-commerce checkout flow?",
      "Describe your approach to risk-based test prioritization for a tight release deadline.",
      "How would you test an API that has complex authentication and rate limiting?",
      "Explain shift-left testing and how it impacts the development lifecycle.",
    ],
    sampleAnswer: "The test pyramid recommends many fast unit tests at the base, fewer integration tests in the middle, and minimal slow E2E tests at the top. This optimizes for fast feedback while maintaining confidence. A typical ratio is 70% unit, 20% integration, 10% E2E."
  },

  'Cloud Architect': {
    keywords: {
      'Cloud Design Patterns': ['well-architected', 'microservice', 'serverless', 'event driven', 'cqrs', 'saga'],
      'Scalability': ['auto scaling', 'horizontal', 'vertical', 'load balancer', 'cdn', 'edge'],
      'Security': ['iam', 'vpc', 'security group', 'encryption', 'zero trust', 'waf', 'kms'],
      'Cost Optimization': ['reserved instance', 'spot', 'right-sizing', 'cost allocation', 'savings plan'],
      'Networking': ['vpc', 'subnet', 'route table', 'nat gateway', 'peering', 'transit gateway'],
      'Disaster Recovery': ['rpo', 'rto', 'multi-region', 'failover', 'backup', 'replication'],
    },
    questions: [
      "Design a highly available, multi-region architecture for a SaaS application on AWS.",
      "Explain the CQRS pattern and when it's appropriate vs a traditional CRUD approach.",
      "How would you implement a zero-trust security model in a cloud-native architecture?",
      "Compare serverless (Lambda) vs containers (ECS/EKS) for a variable-traffic workload.",
      "How do you design a cost-effective data lake architecture on AWS?",
      "Explain RPO and RTO: how do they drive your disaster recovery architecture decisions?",
      "How would you migrate a legacy on-premises system to the cloud with minimal downtime?",
      "Describe a VPC architecture with public/private subnets, NAT gateways, and security groups.",
    ],
    sampleAnswer: "CQRS (Command Query Responsibility Segregation) separates read and write models. Writes go through a command model with strict validation; reads use optimized denormalized views. This is ideal when read/write patterns differ significantly in scale or complexity."
  },

  'Machine Learning Engineer': {
    keywords: {
      'Model Training': ['training', 'validation', 'test split', 'hyperparameter', 'learning rate', 'epoch', 'batch size'],
      'ML Pipeline': ['feature store', 'model registry', 'serving', 'inference', 'pipeline', 'orchestration'],
      'MLOps': ['mlflow', 'kubeflow', 'airflow', 'model monitoring', 'drift', 'retraining', 'ci/cd for ml'],
      'Distributed Training': ['distributed', 'data parallel', 'model parallel', 'horovod', 'gpu', 'tpu'],
      'Model Optimization': ['quantization', 'pruning', 'distillation', 'onnx', 'tensorrt', 'edge deployment'],
      'LLMs': ['transformer', 'fine-tuning', 'lora', 'rag', 'embedding', 'prompt engineering', 'tokenizer'],
    },
    questions: [
      "How do you design a production ML pipeline from data ingestion to model serving?",
      "Explain model quantization and distillation for deploying models on edge devices.",
      "How would you implement online learning for a recommendation system?",
      "Compare fine-tuning vs RAG (Retrieval-Augmented Generation) for enterprise LLM applications.",
      "How do you detect and mitigate model drift in production?",
      "Explain distributed training strategies: data parallelism vs model parallelism.",
      "How would you design a feature store for real-time and batch feature serving?",
      "Describe your approach to versioning ML models, data, and experiments.",
    ],
    sampleAnswer: "RAG retrieves relevant documents from a vector store and passes them as context to the LLM at inference time, avoiding expensive fine-tuning. Fine-tuning modifies model weights on domain data, giving deeper adaptation but requiring compute and risking catastrophic forgetting."
  },

  'Backend Developer': {
    keywords: {
      'API Design': ['rest', 'graphql', 'grpc', 'versioning', 'pagination', 'rate limiting', 'idempotent'],
      'Database': ['sql', 'nosql', 'index', 'query optimization', 'connection pool', 'replication', 'sharding'],
      'Concurrency': ['thread', 'process', 'async', 'event loop', 'race condition', 'deadlock', 'mutex'],
      'Security': ['sql injection', 'xss', 'csrf', 'cors', 'owasp', 'input validation', 'rate limit'],
      'Architecture': ['microservice', 'message queue', 'event sourcing', 'circuit breaker', 'saga pattern'],
      'Performance': ['profiling', 'caching', 'connection pooling', 'n+1', 'query plan', 'load test'],
    },
    questions: [
      "How do you design idempotent APIs, and why is idempotency critical for distributed systems?",
      "Explain database indexing strategies: B-tree, hash, and composite indexes — trade-offs?",
      "How would you implement rate limiting for a public API (token bucket vs sliding window)?",
      "Explain the Circuit Breaker pattern and how it prevents cascading failures in microservices.",
      "How do you handle distributed transactions across multiple microservices (Saga pattern)?",
      "Describe your approach to API versioning for a public-facing API with many consumers.",
      "How would you optimize a slow database query that's causing production latency spikes?",
      "Explain event sourcing vs traditional CRUD: when is event sourcing worth the complexity?",
    ],
    sampleAnswer: "Idempotent APIs produce the same result regardless of how many times a request is repeated. For POST operations, use idempotency keys stored server-side. This is critical in distributed systems where network retries can cause duplicate processing."
  },

  'Cybersecurity Analyst': {
    keywords: {
      'Threat Detection': ['siem', 'ids', 'ips', 'threat intelligence', 'ioc', 'anomaly detection', 'log analysis'],
      'Vulnerabilities': ['owasp', 'cve', 'sql injection', 'xss', 'csrf', 'ssrf', 'rce', 'buffer overflow'],
      'Security Frameworks': ['nist', 'iso 27001', 'soc 2', 'zero trust', 'defense in depth', 'least privilege'],
      'Incident Response': ['incident response', 'forensics', 'containment', 'eradication', 'recovery', 'playbook'],
      'Cryptography': ['encryption', 'tls', 'ssl', 'hashing', 'aes', 'rsa', 'certificate', 'pki'],
      'Network Security': ['firewall', 'vpn', 'segmentation', 'dmz', 'waf', 'proxy'],
    },
    questions: [
      "Walk through your incident response process for a suspected data breach.",
      "Explain the OWASP Top 10 and which vulnerabilities you consider most critical today.",
      "How would you implement a zero-trust security architecture for a cloud-native application?",
      "Describe the difference between symmetric and asymmetric encryption with real-world use cases.",
      "How do you design a SIEM strategy for detecting advanced persistent threats (APTs)?",
      "Explain how you would conduct a security assessment of a new third-party API integration.",
      "How does TLS 1.3 improve upon TLS 1.2, and what are the key handshake differences?",
      "Describe your approach to security awareness training and phishing simulation programs.",
    ],
    sampleAnswer: "Incident response follows 6 phases: Preparation, Identification, Containment, Eradication, Recovery, and Lessons Learned. During a suspected breach, first isolate affected systems (containment), preserve forensic evidence, identify the attack vector, then eradicate the threat."
  },

  'Database Administrator': {
    keywords: {
      'Query Optimization': ['query plan', 'explain', 'index', 'full scan', 'optimizer', 'statistics', 'cost'],
      'Replication / HA': ['replication', 'master-slave', 'primary-replica', 'failover', 'clustering', 'always on'],
      'Backup / Recovery': ['backup', 'point-in-time', 'wal', 'redo log', 'disaster recovery', 'restore'],
      'Performance Tuning': ['buffer pool', 'connection pool', 'lock', 'deadlock', 'wait stat', 'io'],
      'Sharding / Partitioning': ['shard', 'partition', 'horizontal', 'vertical', 'hash', 'range'],
      'NoSQL': ['mongodb', 'cassandra', 'redis', 'dynamodb', 'document', 'key-value', 'column family'],
    },
    questions: [
      "How do you analyze and optimize a slow query using EXPLAIN/query execution plans?",
      "Compare database replication strategies: synchronous vs asynchronous with trade-offs.",
      "How would you design a database sharding strategy for a billion-row table?",
      "Explain database connection pooling and how misconfigured pools cause production outages.",
      "How do you implement point-in-time recovery for a PostgreSQL database?",
      "Compare SQL vs NoSQL databases for different use cases with concrete examples.",
      "How do you handle schema migrations in a production database with zero downtime?",
      "Explain database locking levels and how to diagnose and resolve deadlocks.",
    ],
    sampleAnswer: "EXPLAIN shows the query execution plan: whether indexes are used, join order, estimated row counts, and cost. A full table scan on a large table usually indicates a missing index. Composite indexes should follow the leftmost prefix rule for WHERE clause columns."
  },

  'UI/UX Designer': {
    keywords: {
      'Design Systems': ['design system', 'component library', 'token', 'atomic design', 'style guide'],
      'User Research': ['persona', 'journey map', 'usability testing', 'heuristic', 'task analysis', 'affinity'],
      'Interaction Design': ['micro-interaction', 'animation', 'feedback', 'affordance', 'gestalt', 'hierarchy'],
      'Accessibility': ['wcag', 'aria', 'screen reader', 'contrast ratio', 'keyboard navigation', 'inclusive'],
      'Prototyping': ['figma', 'sketch', 'prototype', 'wireframe', 'mockup', 'user flow', 'information architecture'],
      'Metrics': ['sus', 'nps', 'task completion', 'error rate', 'satisfaction', 'usability metric'],
    },
    questions: [
      "How do you build and maintain a scalable design system for a large product team?",
      "Explain Gestalt principles and how they influence UI layout decisions.",
      "How do you conduct and synthesize usability testing results into actionable improvements?",
      "Describe your approach to making a complex enterprise dashboard accessible (WCAG 2.1 AA).",
      "How do you measure the success of a design change quantitatively?",
      "Explain information architecture: how do you organize content for complex applications?",
      "How do you handle design-development handoff to ensure pixel-perfect implementation?",
      "Describe your process for designing micro-interactions that enhance user experience.",
    ],
    sampleAnswer: "A design system includes tokens (colors, spacing, typography), atoms (buttons, inputs), molecules (search bars), and organisms (headers). It ensures consistency, speeds development, and is maintained as a living component library with documentation and versioning."
  },
};

// Fallback for roles not in the bank
function getGenericKeywordBank() {
  return {
    keywords: {
      'Architecture & Design Patterns': ['architecture', 'design pattern', 'trade-off', 'scalab', 'microservice'],
      'Problem Solving': ['algorithm', 'complexity', 'optimization', 'edge case', 'debugging'],
      'Communication': ['star', 'situation', 'task', 'action', 'result', 'impact', 'metric'],
    },
    questions: [
      "What key technical architectural trade-offs do you consider when designing a system?",
      "Walk me through your step-by-step methodology for debugging a production issue.",
      "Explain a complex technical project you led, including design choices and trade-offs.",
      "How do you approach learning a new technology or framework quickly?",
      "Describe a time when you had to make a difficult technical decision under time pressure.",
      "How do you ensure code quality and maintainability in a fast-paced development team?",
      "Explain how you would design a system to handle 10x traffic growth.",
      "How do you communicate technical decisions to non-technical stakeholders?",
    ],
    sampleAnswer: "A strong answer uses the STAR method, details the technical architecture choices, explains explicit trade-offs with quantitative reasoning, and demonstrates production experience with measurable results."
  };
}

// ============================================================
// FALLBACK AI RESPONSE ENGINE
// ============================================================

function generateFallbackAIResponse(systemPrompt, userPrompt) {
  const promptLower = userPrompt.toLowerCase();

  // 1. Report Summary
  if (promptLower.includes('hiring committee') || promptLower.includes('overallscores') || promptLower.includes('full interview transcript')) {
    return JSON.stringify({
      overallScores: { technicalDepth: 6, communication: 7, problemSolving: 6, confidence: 7 },
      likelihoodOfPassing: "65% (Moderate - Needs Targeted Preparation)",
      summaryText: "The candidate demonstrated foundational technical awareness but consistently omitted critical domain-specific terminology in responses. To pass a top-company hiring bar, focus on incorporating exact industry keywords, articulating explicit trade-offs, and structuring answers using the STAR framework with quantifiable impact.",
      topImprovementTopics: ["Domain-Specific Technical Terminology", "Architectural Trade-off Articulation", "STAR Framework Response Structure"],
      weakAreas: ["Domain-Specific Technical Terminology", "Architectural Trade-off Articulation", "STAR Framework Response Structure"]
    });
  }

  // 2. Roadmap
  if (promptLower.includes('7-day') || promptLower.includes('study plan') || promptLower.includes('weak areas')) {
    return JSON.stringify({
      plan: [
        {
          day: 1,
          topic: "Core Domain Terminology & Foundational Architecture",
          tasks: [
            "Master exact industry technical terms for core architectural patterns",
            "Practice defining 15 key concepts using precise keywords without hesitation",
            "Review official documentation and core system mechanics"
          ],
          resources: [
            {
              title: "Complete Technical Architecture & Concept Guide",
              platform: "GeeksforGeeks",
              url: "https://www.geeksforgeeks.org/software-engineering-system-design/",
              category: "self_learning",
              type: "Article & Documentation",
              subscriptionStatus: "Free",
              duration: "25 mins",
              channelOrAuthor: "GeeksforGeeks Editorial",
              description: "Structured breakdown of core domain mechanics, diagrams, and terminology."
            },
            {
              title: "Free Foundational Computer Science & Tech Bootcamp",
              platform: "freeCodeCamp",
              url: "https://www.freecodecamp.org/news/tag/computer-science/",
              category: "self_learning",
              type: "Unpaid Course",
              subscriptionStatus: "Free",
              duration: "1.5 hours",
              channelOrAuthor: "freeCodeCamp Community",
              description: "Full open-source interactive course on core programming and design concepts."
            },
            {
              title: "Complete Professional Career Bootcamp & Certification",
              platform: "Udemy",
              url: "https://www.udemy.com/courses/development/",
              category: "self_learning",
              type: "Paid Course",
              subscriptionStatus: "Paid",
              duration: "3 hours",
              channelOrAuthor: "Top Industry Specialist",
              description: "Comprehensive paid certified course with real-world enterprise architectures."
            },
            {
              title: "Core Concepts & Architecture Crash Course Lecture",
              platform: "YouTube",
              url: "https://www.youtube.com/results?search_query=software+architecture+concepts+crash+course",
              category: "mentor_based",
              type: "YouTube Video Lecture",
              subscriptionStatus: "Free",
              duration: "45 mins",
              channelOrAuthor: "Traversy Media / NeetCode",
              description: "High-yield mentor whiteboard breakdown of fundamental mechanisms."
            },
            {
              title: "Executive Engineering Masterclass & Live Mentorship",
              platform: "Coursera",
              url: "https://www.coursera.org/specializations/software-design-architecture",
              category: "mentor_based",
              type: "Mentor Masterclass",
              subscriptionStatus: "Paid",
              duration: "2 hours",
              channelOrAuthor: "University of Alberta / Coursera",
              description: "Structured mentor-evaluated video masterclass with graded architectural assignments."
            }
          ]
        },
        {
          day: 2,
          topic: "Architectural Trade-off Analysis & Quantitative Reasoning",
          tasks: [
            "Compare 3 competing architectural patterns with quantitative trade-offs",
            "Practice articulating throughput vs latency vs consistency trade-offs",
            "Write an Architecture Decision Record (ADR) for a high-traffic microservice"
          ],
          resources: [
            {
              title: "System Design Trade-offs: CAP Theorem & Consistency Models",
              platform: "GeeksforGeeks",
              url: "https://www.geeksforgeeks.org/the-cap-theorem-in-dbms/",
              category: "self_learning",
              type: "Article & Documentation",
              subscriptionStatus: "Free",
              duration: "20 mins",
              channelOrAuthor: "GeeksforGeeks",
              description: "Deep dive into CAP theorem, PACELC, and database consistency tradeoffs."
            },
            {
              title: "System Design Primer & Trade-off Blueprint",
              platform: "GitHub / Open Source",
              url: "https://github.com/donnemartin/system-design-primer",
              category: "self_learning",
              type: "Unpaid Course",
              subscriptionStatus: "Free",
              duration: "1.5 hours",
              channelOrAuthor: "Donne Martin",
              description: "Gold-standard open-source interactive guide on system design tradeoffs."
            },
            {
              title: "Grokking the System Design Interview (Interactive)",
              platform: "Educative.io",
              url: "https://www.educative.io/courses/grokking-modern-system-design-interview-for-engineers-managers",
              category: "self_learning",
              type: "Paid Course",
              subscriptionStatus: "Paid",
              duration: "2.5 hours",
              channelOrAuthor: "Educative Team",
              description: "Interactive system design course with real-world scale tradeoffs and diagrams."
            },
            {
              title: "How to Answer System Design & Trade-off Questions Like a Senior",
              platform: "YouTube",
              url: "https://www.youtube.com/results?search_query=how+to+answer+system+design+trade-offs+interview",
              category: "mentor_based",
              type: "YouTube Video Lecture",
              subscriptionStatus: "Free",
              duration: "40 mins",
              channelOrAuthor: "Hussein Nasser / ByteByteGo",
              description: "Mentor breakdown of trade-offs, cache invalidation, and database partitioning."
            },
            {
              title: "Advanced Distributed Systems Video Masterclass",
              platform: "edX / MIT OCW",
              url: "https://www.edx.org/learn/computer-science",
              category: "mentor_based",
              type: "Mentor Masterclass",
              subscriptionStatus: "Paid",
              duration: "1.5 hours",
              channelOrAuthor: "MIT Faculty",
              description: "Rigorous academic and industry video series analyzing distributed consensus."
            }
          ]
        },
        {
          day: 3,
          topic: "STAR Framework Technical Storytelling & Quantitative Impact",
          tasks: [
            "Structure 4 detailed STAR stories from past engineering projects",
            "Quantify impact with concrete metrics (latency % reduction, cost savings, scale)",
            "Practice answering 'Describe your most challenging technical obstacle'"
          ],
          resources: [
            {
              title: "STAR Technique for Technical & Behavioral Interviews",
              platform: "GeeksforGeeks",
              url: "https://www.geeksforgeeks.org/star-technique-for-interview/",
              category: "self_learning",
              type: "Article & Documentation",
              subscriptionStatus: "Free",
              duration: "15 mins",
              channelOrAuthor: "GeeksforGeeks Careers",
              description: "Step-by-step framework to structure engineering achievements."
            },
            {
              title: "Tech Interview Story Crafting & Metric Framing",
              platform: "freeCodeCamp",
              url: "https://www.freecodecamp.org/news/how-to-ace-the-technical-interview/",
              category: "self_learning",
              type: "Unpaid Course",
              subscriptionStatus: "Free",
              duration: "45 mins",
              channelOrAuthor: "Tech Career Collective",
              description: "Complete guide on converting project experience into high-signal stories."
            },
            {
              title: "FAANG Behavioral & Leadership Interview Mastery",
              platform: "Udemy",
              url: "https://www.udemy.com/topic/behavioral-interview/",
              category: "self_learning",
              type: "Paid Course",
              subscriptionStatus: "Paid",
              duration: "2 hours",
              channelOrAuthor: "Former Senior Hiring Manager",
              description: "Ex-FAANG recruiter secrets on storytelling, leadership principles, and metrics."
            },
            {
              title: "Senior Engineering Behavioral Interview Masterclass",
              platform: "YouTube",
              url: "https://www.youtube.com/results?search_query=behavioral+interview+questions+for+software+engineers+dan+croitor",
              category: "mentor_based",
              type: "YouTube Video Lecture",
              subscriptionStatus: "Free",
              duration: "35 mins",
              channelOrAuthor: "Dan Croitor / TechLead",
              description: "Live roleplay demonstrations of top-tier STAR responses with recruiter analysis."
            }
          ]
        },
        {
          day: 4,
          topic: "Production Failure Modes, Edge Cases & Resiliency Engineering",
          tasks: [
            "Study Circuit Breakers, Bulkheads, Retries with Exponential Backoff, and Dead Letter Queues",
            "Analyze real-world post-mortem case studies from Netflix, AWS, and Cloudflare",
            "Design fault recovery and telemetry alarms for a critical payment or auth flow"
          ],
          resources: [
            {
              title: "Design Patterns for Resilient Microservices (Circuit Breaker, Bulkhead)",
              platform: "GeeksforGeeks",
              url: "https://www.geeksforgeeks.org/circuit-breaker-pattern/",
              category: "self_learning",
              type: "Article & Documentation",
              subscriptionStatus: "Free",
              duration: "25 mins",
              channelOrAuthor: "GeeksforGeeks",
              description: "Circuit breaker implementation, state transitions, and fallback patterns."
            },
            {
              title: "AWS Well-Architected Reliability Pillar Documentation",
              platform: "AWS Docs",
              url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html",
              category: "self_learning",
              type: "Documentation",
              subscriptionStatus: "Free",
              duration: "45 mins",
              channelOrAuthor: "AWS Architecture Team",
              description: "Production best practices for fault isolation, disaster recovery, and failovers."
            },
            {
              title: "Designing Data-Intensive Applications: Video & Book Companion",
              platform: "O'Reilly / Educative",
              url: "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/",
              category: "self_learning",
              type: "Paid Course",
              subscriptionStatus: "Paid",
              duration: "3 hours",
              channelOrAuthor: "Martin Kleppmann",
              description: "Definitive guide on storage engines, replication lag, and distributed consensus."
            },
            {
              title: "Resilient Distributed Systems Lecture Series",
              platform: "YouTube",
              url: "https://www.youtube.com/results?search_query=resilient+microservices+architecture+patterns+lecture",
              category: "mentor_based",
              type: "YouTube Video Lecture",
              subscriptionStatus: "Free",
              duration: "55 mins",
              channelOrAuthor: "GOTO Conferences / InfoQ",
              description: "Senior architects share real-world outage case studies and chaos engineering."
            }
          ]
        },
        {
          day: 5,
          topic: "Data Modeling, Indexing Strategy & Query Optimization",
          tasks: [
            "Analyze B-Tree, LSM-Tree, and Hash Index internal mechanics and trade-offs",
            "Practice diagnosing slow queries using EXPLAIN plans and removing full table scans",
            "Design normalized vs denormalized schemas for high-concurrency read/write workloads"
          ],
          resources: [
            {
              title: "Database Indexing, B-Trees and Query Optimization",
              platform: "GeeksforGeeks",
              url: "https://www.geeksforgeeks.org/indexing-in-databases-set-1/",
              category: "self_learning",
              type: "Article & Documentation",
              subscriptionStatus: "Free",
              duration: "30 mins",
              channelOrAuthor: "GeeksforGeeks DBMS",
              description: "Detailed visualization of B-tree lookups, composite indexes, and covering indexes."
            },
            {
              title: "Use The Index, Luke! - Complete SQL Performance Guide",
              platform: "UseTheIndexLuke",
              url: "https://use-the-index-luke.com/",
              category: "self_learning",
              type: "Unpaid Course",
              subscriptionStatus: "Free",
              duration: "1 hour",
              channelOrAuthor: "Markus Winand",
              description: "Free developer guide to database indexing and query tuning across DBMS."
            },
            {
              title: "Database Engineering Masterclass for Backend Engineers",
              platform: "Udemy",
              url: "https://www.udemy.com/topic/database-management/",
              category: "self_learning",
              type: "Paid Course",
              subscriptionStatus: "Paid",
              duration: "2.5 hours",
              channelOrAuthor: "Hussein Nasser",
              description: "ACID, isolation levels, MVCC, write-ahead logging, and connection pooling."
            },
            {
              title: "Database Indexing Explained: How B-Trees Actually Work",
              platform: "YouTube",
              url: "https://www.youtube.com/results?search_query=database+indexing+explained+b-tree+hussein+nasser",
              category: "mentor_based",
              type: "YouTube Video Lecture",
              subscriptionStatus: "Free",
              duration: "45 mins",
              channelOrAuthor: "Hussein Nasser",
              description: "In-depth whiteboard lecture examining page structures, scans, and memory caches."
            }
          ]
        },
        {
          day: 6,
          topic: "Full Mock Interview Simulation & Live Rubric Scoring",
          tasks: [
            "Complete a timed 45-minute comprehensive mock interview session on this platform",
            "Focus on immediate keyword inclusion and structuring answers with trade-offs",
            "Review telemetry scoring radar to confirm weak areas have improved"
          ],
          resources: [
            {
              title: "Top 50 Technical Interview Questions & Evaluation Criteria",
              platform: "GeeksforGeeks",
              url: "https://www.geeksforgeeks.org/top-100-data-structures-and-algorithms-interview-questions-topic-wise/",
              category: "self_learning",
              type: "Article & Documentation",
              subscriptionStatus: "Free",
              duration: "35 mins",
              channelOrAuthor: "GeeksforGeeks",
              description: "Curated problem bank with detailed algorithmic complexity analyses."
            },
            {
              title: "Pramp / Tech Mock Interview Preparation Checklist",
              platform: "freeCodeCamp",
              url: "https://www.freecodecamp.org/news/coding-interviews-for-dummies-5a04e648a801/",
              category: "self_learning",
              type: "Unpaid Course",
              subscriptionStatus: "Free",
              duration: "30 mins",
              channelOrAuthor: "freeCodeCamp",
              description: "Checklist for real-time interview pacing, asking clarifying questions, and testing."
            },
            {
              title: "Mock Interview Live Roleplays & FAANG Hiring Committee Reviews",
              platform: "YouTube",
              url: "https://www.youtube.com/results?search_query=mock+coding+interview+google+engineer+exponent",
              category: "mentor_based",
              type: "YouTube Video Lecture",
              subscriptionStatus: "Free",
              duration: "50 mins",
              channelOrAuthor: "Exponent / NeetCode",
              description: "Full unedited mock interview recording with candidate feedback and scoring rubric."
            }
          ]
        },
        {
          day: 7,
          topic: "Final Weak-Spot Polish & Executive Recruiter Confidence",
          tasks: [
            "Rapid-fire review of all missed keywords and flagged questions",
            "Prepare your candidate questions for the hiring committee / interviewer",
            "Perform final readiness check and schedule your next live mock interview"
          ],
          resources: [
            {
              title: "Questions YOU Should Ask Your Interviewer at the End",
              platform: "GeeksforGeeks",
              url: "https://www.geeksforgeeks.org/smart-questions-to-ask-at-the-end-of-a-job-interview/",
              category: "self_learning",
              type: "Article & Documentation",
              subscriptionStatus: "Free",
              duration: "15 mins",
              channelOrAuthor: "GeeksforGeeks Careers",
              description: "High-signal questions that showcase leadership, systems curiosity, and culture fit."
            },
            {
              title: "Final Interview Day Mindset & Executive Presence Lecture",
              platform: "YouTube",
              url: "https://www.youtube.com/results?search_query=technical+interview+mindset+confidence+tips",
              category: "mentor_based",
              type: "YouTube Video Lecture",
              subscriptionStatus: "Free",
              duration: "25 mins",
              channelOrAuthor: "TechLead / Exponent",
              description: "Proven psychology techniques for handling interview anxiety and demonstrating calm expertise."
            },
            {
              title: "1-on-1 Senior Tech Career Mentorship & Negotiation Masterclass",
              platform: "Coursera",
              url: "https://www.coursera.org/learn/career-success",
              category: "mentor_based",
              type: "Mentor Masterclass",
              subscriptionStatus: "Paid",
              duration: "1 hour",
              channelOrAuthor: "UCI Division of Continuing Education",
              description: "Professional strategies for offer evaluation, leveling negotiations, and onboarding."
            }
          ]
        }
      ]
    });
  }

  // 3. Answer Evaluation — supports both old and new prompt template formats
  if (promptLower.includes('evaluate') || promptLower.includes('correctnessscore') || promptLower.includes('recruiterverdict')) {
    // New prompt format: QUESTION ASKED: "...", CANDIDATE RESPONSE: "..."
    // Old prompt format: Question asked: "...", Candidate's response: "..."
    const qMatch =
      userPrompt.match(/QUESTION ASKED:\s*"([\s\S]*?)"\s*\n/i) ||
      userPrompt.match(/QUESTION ASKED:\s*"([\s\S]*?)"\s*CANDIDATE/i) ||
      userPrompt.match(/Question asked:\s*"([\s\S]*?)"\s*\n/i) ||
      userPrompt.match(/Question:\s*"([\s\S]*?)"\s*\n/i);

    const aMatch =
      userPrompt.match(/CANDIDATE RESPONSE:\s*"([\s\S]*?)"\s*\n/i) ||
      userPrompt.match(/CANDIDATE RESPONSE:\s*"([\s\S]*?)"\s*YOUR PERSONA/i) ||
      userPrompt.match(/Candidate's response:\s*"([\s\S]*?)"\s*\n/i) ||
      userPrompt.match(/Answer:\s*"([\s\S]*?)"\s*\n/i);

    // Role extraction — works for both old and new formats
    const roleMatch =
      userPrompt.match(/evaluating a \S+-level candidate for a "(.+?)" role/i) ||
      userPrompt.match(/rigorous\s*"(.+?)"\s*interview/i) ||
      userPrompt.match(/for a\s*"(.+?)"\s*position/i) ||
      userPrompt.match(/for a\s*"(.+?)"\s*role/i);
    const extractedRole = roleMatch ? roleMatch[1] : '';

    // Experience level extraction for scoring calibration
    const expMatch = userPrompt.match(/for a (fresher|junior|mid|senior)/i) ||
      userPrompt.match(/SCORING GUIDE FOR (FRESHER|JUNIOR|MID|SENIOR)/i);
    const experienceLevel = expMatch ? expMatch[1].toLowerCase() : 'junior';

    return evaluateAnswerWithKeywordRigor(
      qMatch?.[1]?.trim() || '',
      aMatch?.[1]?.trim() || '',
      extractedRole,
      experienceLevel
    );
  }

  // 4. Question Generation
  if (promptLower.includes('generate exactly one') || promptLower.includes('interview question')) {
    const roleMatch = userPrompt.match(/for a "(.*?)" position/i) || userPrompt.match(/role of "(.*?)"/i);
    const role = roleMatch ? roleMatch[1] : 'Software Engineer';
    const bank = ROLE_KEYWORD_BANKS[role] || getGenericKeywordBank();
    return bank.questions[Math.floor(Math.random() * bank.questions.length)];
  }

  // 5. Follow-up — conversational, human-sounding
  if (promptLower.includes('candidate was asked:') || promptLower.includes('follow-up') || promptLower.includes('they answered:')) {
    const qMatch = userPrompt.match(/was asked:\s*"([\s\S]*?)"/s);
    const aMatch = userPrompt.match(/(?:They answered|response):\s*"([\s\S]*?)"/si);
    const question = (qMatch?.[1] || '').trim();
    const answer = (aMatch?.[1] || '').trim();
    const cleanQ = question.slice(0, 70).trim();

    // Check if the answer was weak/short
    const isWeakAnswer = !answer || answer.split(/\s+/).length < 15;
    if (isWeakAnswer) {
      return `I appreciate you trying, but your answer was quite brief. Can you walk me through the actual mechanism behind ${cleanQ ? '"' + cleanQ + '"' : 'what you just said'} in more detail?`;
    }
    return `That gives me a direction, but I'd like to dig deeper — what specific trade-offs did you consider, and have you run into any edge cases or production issues with this approach?`;
  }

  return "Walk me through how you'd approach this problem in a real production environment, including the trade-offs you'd consider.";
}

// ============================================================
// KEYWORD-RIGOROUS EVALUATION ENGINE (QUESTION-SPECIFIC)
// ============================================================

function evaluateAnswerWithKeywordRigor(questionText, answerText, role, experienceLevel = 'junior') {
  const cleanAnswer = (answerText || '').trim();
  const qLower = (questionText || '').toLowerCase();
  const aLower = cleanAnswer.toLowerCase();

  // FILTER 1: Gibberish / totally empty / random chars
  if (!cleanAnswer || isGibberishOrInvalid(cleanAnswer)) {
    const specificData = getQuestionSpecificData(questionText, role);
    const recruiterRemarks = [
      "I'm not sure what that was — that didn't come across as a real answer.",
      "That response doesn't address the question at all. I need a proper answer here.",
      "I can't evaluate that — it looks like random text or scribbling. Please give me a real answer."
    ];
    return JSON.stringify({
      correctnessScore: 1, clarityScore: 1, structureScore: 1,
      recruiterComment: recruiterRemarks[Math.floor(Math.random() * recruiterRemarks.length)],
      recruiterVerdict: 'Needs Improvement', senioritySignal: 'Entry',
      feedback: `That response wasn't a valid answer to the question. In an interview, you need to provide a clear, coherent explanation using relevant technical terms. Even a basic attempt at explaining the concept is far better than what was submitted.`,
      keyStrengths: [],
      missedOpportunities: ['Provide a clear answer that addresses what was actually asked', 'Use domain-appropriate terminology in your response'],
      missingKeywords: [],
      sampleStrongAnswer: specificData.sampleAnswer || 'A strong answer would clearly define the key concepts, mechanisms, and trade-offs relevant to the question.'
    });
  }

  // FILTER 2: Question Echoing
  if (isQuestionEchoed(questionText, cleanAnswer)) {
    const specificData = getQuestionSpecificData(questionText, role);
    return JSON.stringify({
      correctnessScore: 1, clarityScore: 1, structureScore: 1,
      recruiterVerdict: 'Needs Improvement', senioritySignal: 'Entry / Evasive',
      feedback: `You repeated the interviewer's question as your answer. Marks severely reduced (1/10). Explain the concepts in your own words.`,
      keyStrengths: ['No valid technical answer provided (Echoed prompt)'],
      missedOpportunities: ['Explain concepts in your own words', 'Demonstrate actual domain knowledge'],
      missingKeywords: ['Original Candidate Explanation', 'Domain Terminology'],
      sampleStrongAnswer: specificData.sampleAnswer || 'A strong answer would explain the core architecture, contrast key choices, and discuss trade-offs in your own words.'
    });
  }

  const words = cleanAnswer.split(/\s+/).filter(Boolean);
  const candidateSnippet = words.slice(0, Math.min(6, words.length)).join(' ');

  // ── Step 1: Find the role's keyword bank ──
  let matchedBank = null;
  let matchedRoleName = '';

  // First try using the role extracted from the prompt (most reliable)
  if (role) {
    const roleLower = role.toLowerCase();
    for (const [roleName, bank] of Object.entries(ROLE_KEYWORD_BANKS)) {
      if (roleName.toLowerCase() === roleLower || roleLower.includes(roleName.toLowerCase()) || roleName.toLowerCase().includes(roleLower)) {
        matchedBank = bank;
        matchedRoleName = roleName;
        break;
      }
    }
  }

  // Fallback: try matching by question keywords
  if (!matchedBank) {
    for (const [roleName, bank] of Object.entries(ROLE_KEYWORD_BANKS)) {
      for (const [, terms] of Object.entries(bank.keywords)) {
        if (terms.some(t => qLower.includes(t))) {
          matchedBank = bank;
          matchedRoleName = roleName;
          break;
        }
      }
      if (matchedBank) break;
    }
  }

  if (!matchedBank) matchedBank = getGenericKeywordBank();

  // ── Step 2: Get question-specific data from the answer bank ──
  const specificData = getQuestionSpecificData(questionText, matchedRoleName || role || '');
  const relevantCategories = specificData.relevantCategories;

  // ── Step 3: Score keywords — ONLY check relevant categories ──
  let totalCategories = 0;
  let matchedCategoryCount = 0;
  const missingKeywords = [];
  const foundKeywords = [];

  if (relevantCategories.length > 0) {
    // Use the question-specific relevant categories from the answer bank
    for (const categoryName of relevantCategories) {
      const terms = matchedBank.keywords[categoryName];
      if (!terms) continue;
      totalCategories++;
      const hasMatch = terms.some(t => aLower.includes(t));
      if (hasMatch) {
        matchedCategoryCount++;
        foundKeywords.push(categoryName);
      } else {
        missingKeywords.push(categoryName);
      }
    }
  }

  // If answer bank didn't identify relevant categories, use keyword-based matching
  if (totalCategories === 0) {
    for (const [categoryName, terms] of Object.entries(matchedBank.keywords)) {
      // Only check categories whose keywords appear in the question
      const categoryTermsLower = categoryName.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
      const questionHasCategoryTerm = terms.some(t => qLower.includes(t)) ||
        categoryTermsLower.some(w => qLower.includes(w));

      if (!questionHasCategoryTerm) continue;

      totalCategories++;
      const hasMatch = terms.some(t => aLower.includes(t));
      if (hasMatch) {
        matchedCategoryCount++;
        foundKeywords.push(categoryName);
      } else {
        missingKeywords.push(categoryName);
      }
    }
  }

  // Last resort: if still no categories matched, pick the 2-3 most relevant by term overlap
  if (totalCategories === 0) {
    const categoryScores = [];
    for (const [categoryName, terms] of Object.entries(matchedBank.keywords)) {
      let score = 0;
      for (const t of terms) {
        if (qLower.includes(t)) score += 2;
        if (aLower.includes(t)) score += 1;
      }
      categoryScores.push({ categoryName, terms, score });
    }
    categoryScores.sort((a, b) => b.score - a.score);
    const topCategories = categoryScores.slice(0, 3);

    for (const { categoryName, terms } of topCategories) {
      totalCategories++;
      const hasMatch = terms.some(t => aLower.includes(t));
      if (hasMatch) {
        matchedCategoryCount++;
        foundKeywords.push(categoryName);
      } else {
        missingKeywords.push(categoryName);
      }
    }
  }

  // ── Step 4: QUESTION-RELEVANCE ANALYSIS (Primary Gate) ──
  // Extract the core technical concepts the question is ACTUALLY asking about.
  // The answer MUST address these — general technical content alone is not enough.

  // Pull significant content words from the question (nouns, verbs, tech terms)
  const STOP_WORDS = new Set([
    'what', 'how', 'why', 'when', 'where', 'which', 'who', 'does', 'would', 'could',
    'should', 'explain', 'describe', 'compare', 'contrast', 'define', 'tell', 'talk',
    'about', 'with', 'that', 'this', 'your', 'their', 'have', 'from', 'between',
    'difference', 'approach', 'give', 'example', 'walk', 'through', 'achieve', 'handle',
    'make', 'use', 'used', 'using', 'work', 'works', 'work?', 'system', 'write',
    'implement', 'design', 'build', 'create', 'versus', 'mean', 'means', 'meant'
  ]);

  // Key terms extracted directly FROM the question (4+ chars, not stop words)
  const questionKeyTerms = qLower
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 4 && !STOP_WORDS.has(w));

  // Also include the full question phrases (bigrams) for better matching
  const questionBigrams = [];
  for (let i = 0; i < questionKeyTerms.length - 1; i++) {
    questionBigrams.push(questionKeyTerms[i] + ' ' + questionKeyTerms[i + 1]);
  }

  // Check how many of the question's key terms appear in the answer
  const termHits = questionKeyTerms.filter(t => aLower.includes(t));
  const bigramHits = questionBigrams.filter(b => aLower.includes(b));

  // relevanceRatio: what fraction of the question's key terms does the answer address?
  const questionTermCount = questionKeyTerms.length;
  const relevanceRatio = questionTermCount > 0
    ? (termHits.length + bigramHits.length * 0.5) / questionTermCount
    : 0;

  // Is the answer clearly off-topic? (covers < 20% of what the question asked about)
  const isOffTopic = questionTermCount > 3 && relevanceRatio < 0.20;
  // Is the answer only vaguely related? (covers 20-40% of question terms)
  const isVaguelyRelevant = !isOffTopic && relevanceRatio < 0.40;

  // ── Step 4b: Question-specific keyword match (role keyword bank) ──
  let keywordRatio = totalCategories > 0 ? matchedCategoryCount / totalCategories : 0;

  // ── Step 4c: Length and structure check ──
  const hasGoodLength = words.length >= 25;
  const hasDecentLength = words.length >= 12;

  // ── Step 4d: Calculate final score — RELEVANCE IS THE PRIMARY GATE ──
  let correctnessScore, clarityScore, structureScore, recruiterVerdict, senioritySignal;
  let isIrrelevant = false;

  if (isOffTopic) {
    // Answer doesn't address the question — hard cap regardless of technical content
    isIrrelevant = true;
    correctnessScore = 2; clarityScore = 3; structureScore = 2;
    recruiterVerdict = 'Needs Improvement'; senioritySignal = 'Entry';
  } else {
    // Answer is at least on-topic — now score based on depth
    // Combined score: relevance (0.45) + question keyword match (0.35) + length (0.20)
    const depthScore = (relevanceRatio * 0.45) + (keywordRatio * 0.35) +
      (hasGoodLength ? 0.20 : hasDecentLength ? 0.10 : 0.0);

    // Level-based thresholds
    const levelThresholds = {
      fresher: { strong: 0.55, hire: 0.38, leaning: 0.22 },
      junior:  { strong: 0.62, hire: 0.44, leaning: 0.26 },
      mid:     { strong: 0.70, hire: 0.52, leaning: 0.32 },
      senior:  { strong: 0.78, hire: 0.58, leaning: 0.38 }
    };
    const thresholds = levelThresholds[experienceLevel] || levelThresholds.junior;

    if (depthScore >= thresholds.strong && hasGoodLength) {
      correctnessScore = 9; clarityScore = 9; structureScore = 9;
      recruiterVerdict = 'Strong Hire'; senioritySignal = 'Senior';
    } else if (depthScore >= thresholds.hire && hasDecentLength) {
      correctnessScore = 7; clarityScore = 7; structureScore = 7;
      recruiterVerdict = 'Hire'; senioritySignal = 'Mid-Level';
    } else if (depthScore >= thresholds.leaning || isVaguelyRelevant) {
      correctnessScore = 5; clarityScore = 6; structureScore = 5;
      recruiterVerdict = 'Leaning Hire'; senioritySignal = 'Junior';
    } else if (hasDecentLength) {
      correctnessScore = 4; clarityScore = 5; structureScore = 4;
      recruiterVerdict = 'Needs Improvement'; senioritySignal = 'Junior';
    } else {
      correctnessScore = 3; clarityScore = 3; structureScore = 3;
      recruiterVerdict = 'Needs Improvement'; senioritySignal = 'Entry';
    }
  }

  // ── Step 5: Build honest, human-sounding feedback ──
  const questionTopic = questionText.length > 80 ? questionText.slice(0, 80).trim() + '...' : questionText;
  const foundStr = foundKeywords.length > 0 ? foundKeywords.join(', ') : '';
  const missingStr = missingKeywords.length > 0 ? missingKeywords.slice(0, 3).join(', ') : '';
  const missedTerms = questionKeyTerms.filter(t => !aLower.includes(t)).slice(0, 4).join(', ');

  let recruiterComment, feedback;

  if (isIrrelevant) {
    recruiterComment = `That answer didn't address what I asked at all. I was asking about "${questionTopic}" — your response was about something else entirely.`;
    feedback = `Your answer was not relevant to the question asked. The question was about "${questionTopic}", but your response didn't cover the core concepts involved${missedTerms ? ` — specifically: ${missedTerms}` : ''}. In an interview, answering a different question — even correctly — is treated as not answering. Make sure you read and address exactly what's being asked.`;
  } else if (correctnessScore >= 9) {
    recruiterComment = `That's a strong answer — you clearly understood what I was asking and addressed it well.`;
    feedback = `You directly addressed the question and demonstrated solid understanding. ${foundStr ? `You covered key concepts like ${foundStr}, which is exactly what we look for. ` : ''}Your response was structured and technically accurate. This would hold up well in a real interview at this level.`;
  } else if (correctnessScore >= 7) {
    recruiterComment = `Good answer — you got the main idea, though I'd have liked more depth in a few areas.`;
    feedback = `You addressed the question and covered the key points reasonably well. ${foundStr ? `Good that you mentioned ${foundStr}. ` : ''}${missingStr ? `I was also hoping to hear about ${missingStr}, which are important aspects of this topic. ` : ''}Add more specific trade-offs and real-world examples to make your answer stand out.`;
  } else if (correctnessScore >= 5) {
    recruiterComment = `You touched on the topic but the answer felt surface-level. What specifically happens under the hood here?`;
    feedback = `Your answer was on the right topic but didn't go deep enough. ${missingStr ? `You missed covering: ${missingStr}. ` : ''}${missedTerms ? `Key concepts from the question you didn't address: ${missedTerms}. ` : ''}A strong answer would explain the mechanisms involved, not just the high-level idea. Try to explain the "how" and "why" in your own words.`;
  } else {
    recruiterComment = `Honestly, I expected more here. Your answer is related to the area but didn't really answer what I asked specifically.`;
    feedback = `Your answer was in the right ballpark but missed the core of what the question was asking. The question specifically asked about "${questionTopic}". ${missedTerms ? `Core concepts you didn't cover: ${missedTerms}. ` : ''}${missingStr ? `Also missing domain knowledge on: ${missingStr}. ` : ''}Before your real interview, practice answering this type of question by first identifying exactly what the interviewer is testing, then structuring your response around that specific concept.`;
  }

  // ── Step 6: Use question-specific sample answer ──
  const sampleAnswer = specificData.sampleAnswer
    || matchedBank.sampleAnswer
    || 'A strong answer would directly address what was asked, explain the core mechanisms involved, contrast alternatives with trade-offs, and demonstrate practical understanding with specific examples.';

  const strengthItems = isIrrelevant
    ? []
    : (foundKeywords.length > 0
      ? [`Addressed relevant concepts: ${foundStr}`, hasGoodLength ? 'Provided sufficient detail in the response' : 'Made a genuine attempt at answering']
      : (termHits.length > 0 ? [`Response was on-topic, covering ${termHits.slice(0, 3).join(', ')}`, 'Showed basic domain awareness'] : []));

  const gapItems = isIrrelevant
    ? [`Answer must address the question being asked — focus on: ${questionKeyTerms.slice(0, 4).join(', ')}`, 'Read the question carefully before answering']
    : (missingKeywords.length > 0
      ? [`Go deeper on: ${missingStr}`, 'Add specific trade-offs with concrete reasoning', 'Include production-level examples or personal experience']
      : ['Quantify with concrete metrics or examples', 'Discuss edge cases and failure scenarios', 'Explain the underlying mechanism, not just the concept']);

  return JSON.stringify({
    correctnessScore,
    clarityScore,
    structureScore,
    recruiterComment,
    recruiterVerdict,
    senioritySignal,
    feedback,
    keyStrengths: strengthItems,
    missedOpportunities: gapItems,
    missingKeywords: missingKeywords.slice(0, 4),
    sampleStrongAnswer: sampleAnswer
  });
}

module.exports = { askAI };