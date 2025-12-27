export interface Topic {
  id: string;
  title: string;
  description: string;
  keyPoints: string[];
}

export interface InterviewQuestion {
  id: string;
  question: string;
  answer: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  color: 'blue' | 'purple' | 'pink' | 'green' | 'orange';
  topics: Topic[];
  questions: InterviewQuestion[];
}

export const techVaultData: Category[] = [
  {
    id: 'architectural-patterns',
    title: 'Architectural Patterns',
    icon: 'Layers',
    color: 'blue',
    topics: [
      {
        id: 'microservices-vs-monolith',
        title: 'Microservices vs Monolith',
        description: 'Understanding when to choose microservices architecture over monolithic design.',
        keyPoints: [
          'Monolith: Single deployable unit, simpler to develop initially, harder to scale independently',
          'Microservices: Independently deployable services, better scalability, increased operational complexity',
          'Consider team size, deployment frequency, and scaling requirements when choosing',
          'Monolith-first approach is often recommended for startups before splitting into microservices'
        ]
      },
      {
        id: 'event-driven-architecture',
        title: 'Event-Driven Architecture',
        description: 'Building loosely coupled systems using events for communication.',
        keyPoints: [
          'Events represent something that happened in the past (immutable facts)',
          'Publishers emit events without knowing who consumes them',
          'Consumers react to events asynchronously',
          'Event sourcing stores all changes as a sequence of events',
          'CQRS separates read and write operations for better scalability'
        ]
      },
      {
        id: 'serverless-functions',
        title: 'Serverless Functions',
        description: 'Function-as-a-Service (FaaS) execution model.',
        keyPoints: [
          'Pay-per-execution pricing model, no idle costs',
          'Automatic scaling from zero to thousands of instances',
          'Cold starts can impact latency-sensitive applications',
          'Best for: Event processing, APIs, scheduled tasks',
          'Limitations: Execution time limits, stateless nature, vendor lock-in'
        ]
      },
      {
        id: 'ssr-vs-isr',
        title: 'SSR vs ISR (Next.js)',
        description: 'Server-Side Rendering vs Incremental Static Regeneration.',
        keyPoints: [
          'SSR: Page rendered on every request, always fresh data, higher server load',
          'SSG: Page generated at build time, fastest but stale data',
          'ISR: Combines benefits - static pages that regenerate in background',
          'ISR uses revalidate option to set cache lifetime',
          'On-demand revalidation for instant updates when data changes'
        ]
      },
      {
        id: 'rest-api-design',
        title: 'REST API Design Standards',
        description: 'Best practices for designing RESTful APIs.',
        keyPoints: [
          'Use nouns for resources (users, posts) not verbs (getUsers)',
          'HTTP methods: GET (read), POST (create), PUT (replace), PATCH (update), DELETE',
          'Use proper status codes: 200s success, 400s client errors, 500s server errors',
          'Version your API (/api/v1/users)',
          'Implement pagination, filtering, and sorting for collections'
        ]
      }
    ],
    questions: [
      {
        id: 'q-isr-lifecycle',
        question: 'Explain the lifecycle of a Next.js ISR page',
        answer: `When a page with ISR is first built, it's generated as a static HTML file. When a user requests it:

1. **Initial Request**: The cached static page is served immediately
2. **Revalidation Timer**: After the 'revalidate' period (e.g., 60 seconds), the next request triggers background regeneration
3. **Stale-While-Revalidate**: The stale page is served while the new version generates in the background
4. **Cache Update**: Once regeneration completes, the new page replaces the old in cache
5. **On-Demand**: Use revalidatePath() or revalidateTag() to trigger immediate regeneration

Key config in getStaticProps: return { props: {...}, revalidate: 60 }`,
        difficulty: 'intermediate'
      },
      {
        id: 'q-data-consistency',
        question: 'How do you handle data consistency in Microservices?',
        answer: `Data consistency in microservices requires different strategies than traditional monolithic apps:

**Saga Pattern**: Orchestrate a sequence of local transactions. If one fails, execute compensating transactions to rollback.

**Event Sourcing**: Store all changes as events. Rebuild state by replaying events. Provides complete audit trail.

**Eventual Consistency**: Accept that data will be consistent eventually, not immediately. Use domain events to propagate changes.

**Two-Phase Commit (2PC)**: Distributed transaction protocol (generally avoided due to performance and complexity).

**Best Practices**:
- Design services around bounded contexts
- Use idempotent operations
- Implement retry with exponential backoff
- Use message queues for reliable async communication`,
        difficulty: 'advanced'
      },
      {
        id: 'q-serverless-vs-container',
        question: 'When would you choose Serverless over a container?',
        answer: `**Choose Serverless when:**
- Workloads are event-driven or sporadic
- You need automatic scaling to zero (cost optimization)
- Functions run under 15 minutes
- You want minimal operational overhead
- Building webhooks, APIs, scheduled jobs

**Choose Containers when:**
- You need predictable latency (no cold starts)
- Long-running processes or background workers
- Complex networking requirements
- Need to run on multiple cloud providers (portability)
- Require more than 10GB memory or specialized hardware

**Hybrid approach**: Use containers for core services with stable load, serverless for variable/event-driven workloads.`,
        difficulty: 'intermediate'
      }
    ]
  },
  {
    id: 'cloud-devops',
    title: 'Cloud & DevOps',
    icon: 'Cloud',
    color: 'purple',
    topics: [
      {
        id: 'aws-core',
        title: 'AWS Core Services',
        description: 'Essential AWS services for full-stack development.',
        keyPoints: [
          'EC2: Virtual servers, choose instance types based on compute/memory needs',
          'S3: Object storage, unlimited scalability, 11 9s durability',
          'Lambda: Serverless functions, 15-min max execution',
          'RDS: Managed databases (PostgreSQL, MySQL, etc.)',
          'CloudFront: CDN for static assets and API caching'
        ]
      },
      {
        id: 'docker',
        title: 'Docker Containerization',
        description: 'Creating portable, consistent application environments.',
        keyPoints: [
          'Dockerfile defines the image build steps',
          'Images are immutable templates, containers are running instances',
          'Multi-stage builds reduce final image size',
          'Use .dockerignore to exclude unnecessary files',
          'docker-compose for local multi-container development'
        ]
      },
      {
        id: 'kubernetes',
        title: 'Kubernetes Orchestration',
        description: 'Container orchestration at scale.',
        keyPoints: [
          'Pod: Smallest deployable unit, one or more containers',
          'Node: Physical or virtual machine running pods',
          'Deployment: Manages pod replicas and updates',
          'Service: Stable networking endpoint for pods',
          'ConfigMap/Secret: External configuration management'
        ]
      },
      {
        id: 'github-actions',
        title: 'GitHub Actions CI/CD',
        description: 'Automated workflows for testing and deployment.',
        keyPoints: [
          'Workflows triggered by events (push, PR, schedule)',
          'Jobs run on runners (GitHub-hosted or self-hosted)',
          'Steps execute commands or use actions',
          'Matrix builds test across multiple versions/platforms',
          'Secrets stored encrypted, accessed via secrets context'
        ]
      }
    ],
    questions: [
      {
        id: 'q-dockerfile-node',
        question: 'Write a Dockerfile for a Node.js app',
        answer: `\`\`\`dockerfile
# Multi-stage build for smaller final image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build if needed (TypeScript, etc.)
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nodejs -u 1001

# Copy built assets from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

USER nodejs

EXPOSE 3000

CMD ["node", "dist/index.js"]
\`\`\``,
        difficulty: 'intermediate'
      },
      {
        id: 'q-github-secrets',
        question: 'How do you manage secrets in GitHub Actions?',
        answer: `**Setting Secrets:**
1. Go to Settings > Secrets and variables > Actions
2. Add repository or organization secrets
3. Secrets are encrypted and masked in logs

**Accessing in Workflows:**
\`\`\`yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        env:
          API_KEY: \${{ secrets.API_KEY }}
          DATABASE_URL: \${{ secrets.DATABASE_URL }}
        run: npm run deploy
\`\`\`

**Best Practices:**
- Use environment-specific secrets (production/staging)
- Rotate secrets regularly
- Use OIDC for cloud provider auth (no long-lived credentials)
- Never echo or log secrets
- Use GitHub Environments for deployment protection rules`,
        difficulty: 'intermediate'
      },
      {
        id: 'q-pod-vs-node',
        question: 'Explain the difference between a Pod and a Node in K8s',
        answer: `**Pod:**
- Smallest deployable unit in Kubernetes
- Contains one or more containers that share storage/network
- Has a unique IP address within the cluster
- Ephemeral - can be terminated and recreated
- Defined in YAML manifests
- Managed by controllers (Deployments, StatefulSets)

**Node:**
- Physical or virtual machine in the cluster
- Runs the kubelet agent that manages pods
- Has allocatable CPU, memory, and storage
- Can run multiple pods
- Managed by the control plane
- Types: Control plane nodes and worker nodes

**Relationship:** Pods are scheduled onto Nodes based on resource requirements and constraints. A Node can run many Pods, but a Pod runs on exactly one Node.`,
        difficulty: 'beginner'
      }
    ]
  },
  {
    id: 'fullstack-core',
    title: 'Full Stack Core',
    icon: 'Code',
    color: 'green',
    topics: [
      {
        id: 'typescript-advanced',
        title: 'TypeScript Advanced',
        description: 'Generics, utility types, and type safety patterns.',
        keyPoints: [
          'Generics create reusable, type-safe components',
          'Utility types: Partial, Required, Pick, Omit, Record',
          'Conditional types for complex type logic',
          'Type guards narrow types at runtime',
          'Mapped types transform existing types'
        ]
      },
      {
        id: 'react-internals',
        title: 'React.js Internals',
        description: 'Understanding React\'s rendering mechanism.',
        keyPoints: [
          'Virtual DOM: In-memory representation of UI',
          'Reconciliation: Diffing algorithm to minimize DOM updates',
          'Fiber: React\'s internal reconciliation algorithm',
          'Hooks: useState, useEffect, useMemo, useCallback, useRef',
          'Concurrent features: Suspense, transitions, streaming SSR'
        ]
      },
      {
        id: 'nodejs-internals',
        title: 'Node.js & Express.js',
        description: 'Event loop, async patterns, and middleware.',
        keyPoints: [
          'Event Loop: Single-threaded, non-blocking I/O',
          'Phases: Timers, Pending callbacks, Poll, Check, Close',
          'libuv handles async operations via thread pool',
          'Middleware pattern: req → middleware chain → res',
          'Error handling: next(err) propagates to error middleware'
        ]
      },
      {
        id: 'prisma-orm',
        title: 'Prisma ORM',
        description: 'Type-safe database access with Prisma.',
        keyPoints: [
          'Schema defines models, relations, and database config',
          'Prisma Client: Auto-generated, type-safe query builder',
          'Migrations: Version control for database schema',
          'Relations: One-to-one, one-to-many, many-to-many',
          'Prisma Studio: GUI for viewing/editing data'
        ]
      },
      {
        id: 'databases',
        title: 'PostgreSQL vs MongoDB',
        description: 'Choosing between relational and document databases.',
        keyPoints: [
          'PostgreSQL: ACID compliant, complex queries, joins, transactions',
          'MongoDB: Flexible schema, horizontal scaling, document model',
          'PostgreSQL for: Financial data, complex relations, reporting',
          'MongoDB for: Rapid prototyping, varied data structures, high write loads',
          'Consider hybrid: PostgreSQL for core data, MongoDB for logs/analytics'
        ]
      }
    ],
    questions: [
      {
        id: 'q-event-loop',
        question: 'How does the Node.js Event Loop handle asynchronous tasks?',
        answer: `The Event Loop processes async operations in phases:

**1. Timers Phase:** Execute setTimeout/setInterval callbacks whose time has elapsed

**2. Pending Callbacks:** Execute I/O callbacks deferred from previous iteration

**3. Poll Phase:** 
   - Retrieve new I/O events
   - Execute I/O callbacks (almost all except timers and close)
   - Block here if nothing else is scheduled

**4. Check Phase:** Execute setImmediate() callbacks

**5. Close Callbacks:** Execute close event callbacks (socket.on('close'))

**Microtask Queues** (run between phases):
- process.nextTick() - highest priority
- Promise callbacks

**Thread Pool (libuv):** Heavy operations like file I/O and crypto run on worker threads (default 4), completing via callbacks to the event loop.`,
        difficulty: 'advanced'
      },
      {
        id: 'q-prisma-relations',
        question: 'Explain Prisma Schema relations',
        answer: `Prisma supports three relation types:

**One-to-One:**
\`\`\`prisma
model User {
  id      Int      @id @default(autoincrement())
  profile Profile?
}

model Profile {
  id     Int  @id @default(autoincrement())
  user   User @relation(fields: [userId], references: [id])
  userId Int  @unique
}
\`\`\`

**One-to-Many:**
\`\`\`prisma
model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}

model Post {
  id       Int  @id @default(autoincrement())
  author   User @relation(fields: [authorId], references: [id])
  authorId Int
}
\`\`\`

**Many-to-Many (implicit):**
\`\`\`prisma
model Post {
  id       Int        @id
  categories Category[]
}

model Category {
  id    Int    @id
  posts Post[]
}
\`\`\`

Query with relations: \`prisma.user.findMany({ include: { posts: true } })\``,
        difficulty: 'intermediate'
      },
      {
        id: 'q-slow-sql',
        question: 'Optimize a slow SQL query in Postgres',
        answer: `**Diagnosis Steps:**

1. **EXPLAIN ANALYZE** - See execution plan and actual times
   \`\`\`sql
   EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123;
   \`\`\`

2. **Check for Seq Scans** - Table scans on large tables are slow

**Optimization Techniques:**

1. **Add Indexes:**
   \`\`\`sql
   CREATE INDEX idx_orders_user_id ON orders(user_id);
   CREATE INDEX idx_orders_created ON orders(created_at DESC);
   \`\`\`

2. **Use Covering Indexes** for SELECT columns

3. **Optimize JOINs:**
   - Ensure join columns are indexed
   - Use INNER JOIN over LEFT JOIN when possible

4. **Pagination:**
   \`\`\`sql
   -- Bad: OFFSET 10000 LIMIT 10
   -- Good: Keyset pagination
   WHERE id > last_seen_id ORDER BY id LIMIT 10
   \`\`\`

5. **Partial Indexes** for filtered queries
6. **VACUUM ANALYZE** to update statistics`,
        difficulty: 'advanced'
      }
    ]
  },
  {
    id: 'frontend-ui',
    title: 'Frontend & Modern UI',
    icon: 'Palette',
    color: 'pink',
    topics: [
      {
        id: 'shadcn-tailwind',
        title: 'Shadcn UI & TailwindCSS',
        description: 'Utility-first styling with component primitives.',
        keyPoints: [
          'Tailwind: Utility classes, JIT compilation, purging unused CSS',
          'Shadcn: Copy-paste components built on Radix primitives',
          'Design tokens via CSS variables for theming',
          'cn() utility for conditional class merging',
          'Variants with class-variance-authority (CVA)'
        ]
      },
      {
        id: 'framer-motion',
        title: 'Framer Motion',
        description: 'Production-ready animations for React.',
        keyPoints: [
          'motion.div wraps elements for animation',
          'initial, animate, exit define animation states',
          'variants for coordinated child animations',
          'AnimatePresence for exit animations',
          'useSpring, useTransform for physics-based motion'
        ]
      },
      {
        id: 'state-management',
        title: 'State Management',
        description: 'Comparing Zustand and Redux approaches.',
        keyPoints: [
          'Zustand: Minimal API, hooks-based, no boilerplate',
          'Redux: Predictable state container, middleware ecosystem',
          'Redux Toolkit simplifies Redux patterns',
          'Zustand for small-medium apps, Redux for complex state logic',
          'Both support devtools, persistence, and middleware'
        ]
      },
      {
        id: 'atomic-design',
        title: 'Atomic Design Systems',
        description: 'Component hierarchy for scalable UI architecture.',
        keyPoints: [
          'Atoms: Basic elements (buttons, inputs, labels)',
          'Molecules: Simple component groups (search bar, card)',
          'Organisms: Complex sections (header, sidebar)',
          'Templates: Page layouts with placeholder content',
          'Pages: Templates with real data'
        ]
      }
    ],
    questions: [
      {
        id: 'q-zustand-vs-redux',
        question: 'Compare Zustand and Redux for a large application',
        answer: `**Zustand Pros:**
- Minimal boilerplate, simple API
- No providers needed, just import and use
- Built-in selectors prevent unnecessary re-renders
- Easy to split into multiple stores
- ~1KB bundle size

**Redux Pros:**
- Mature ecosystem (saga, thunk, toolkit)
- Time-travel debugging, action replay
- Middleware for logging, persistence, API calls
- Strict patterns help with team consistency
- Better DevTools experience

**For Large Apps:**
Use **Redux Toolkit** when you need:
- Complex async logic (RTK Query)
- Team onboarding (standardized patterns)
- Advanced debugging needs

Use **Zustand** when you want:
- Faster development velocity
- Less ceremony around state updates
- Simpler mental model
- Multiple independent stores

**Verdict:** Both scale well. Zustand for pragmatism, Redux for tooling.`,
        difficulty: 'intermediate'
      },
      {
        id: 'q-prevent-rerenders',
        question: 'How do you prevent re-renders in React?',
        answer: `**1. React.memo() for Components:**
\`\`\`jsx
const MemoizedChild = React.memo(({ data }) => {
  return <div>{data.name}</div>;
});
\`\`\`

**2. useMemo for Expensive Calculations:**
\`\`\`jsx
const sortedList = useMemo(() => 
  items.sort((a, b) => a.price - b.price), 
  [items]
);
\`\`\`

**3. useCallback for Function References:**
\`\`\`jsx
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
\`\`\`

**4. State Colocation:** Move state closer to where it's used

**5. Zustand Selectors:**
\`\`\`jsx
// Only re-renders when 'count' changes
const count = useStore((state) => state.count);
\`\`\`

**6. Key Prop:** Ensure stable, unique keys for lists

**7. Context Splitting:** Split context to prevent cascading updates`,
        difficulty: 'intermediate'
      },
      {
        id: 'q-atomic-design',
        question: 'Explain the folder structure of an Atomic Design system',
        answer: `**Typical Structure:**
\`\`\`
src/
├── components/
│   ├── atoms/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Label/
│   │   └── Icon/
│   │
│   ├── molecules/
│   │   ├── SearchBar/      (Input + Button + Icon)
│   │   ├── FormField/      (Label + Input + Error)
│   │   └── Card/
│   │
│   ├── organisms/
│   │   ├── Header/         (Logo + NavMolecule + SearchBar)
│   │   ├── Sidebar/
│   │   └── DataTable/
│   │
│   ├── templates/
│   │   ├── DashboardLayout/
│   │   └── AuthLayout/
│   │
│   └── pages/
│       ├── HomePage/
│       └── ProfilePage/
├── styles/
│   └── tokens.css
└── index.ts
\`\`\`

**Rules:**
- Atoms import nothing from components
- Molecules import only atoms
- Organisms import atoms + molecules
- Templates are layout wrappers
- Pages connect to data/routing`,
        difficulty: 'beginner'
      }
    ]
  },
  {
    id: 'api-security',
    title: 'API & Security',
    icon: 'Shield',
    color: 'orange',
    topics: [
      {
        id: 'api-validation',
        title: 'API Validation with Postman',
        description: 'Testing and validating API endpoints.',
        keyPoints: [
          'Collections organize related requests',
          'Environment variables for different stages (dev/prod)',
          'Pre-request scripts for dynamic data',
          'Test scripts validate responses',
          'Newman CLI for CI/CD integration'
        ]
      },
      {
        id: 'oauth2',
        title: 'OAuth 2.0 Flows',
        description: 'Delegated authorization framework.',
        keyPoints: [
          'Authorization Code: Best for server-side apps',
          'PKCE: Secure extension for public clients (SPAs, mobile)',
          'Client Credentials: Machine-to-machine auth',
          'Access tokens: Short-lived, carried in requests',
          'Refresh tokens: Long-lived, used to get new access tokens'
        ]
      },
      {
        id: 'rbac',
        title: 'Role-Based Access Control',
        description: 'Managing permissions through roles.',
        keyPoints: [
          'Roles group permissions (admin, editor, viewer)',
          'Users assigned to roles, not individual permissions',
          'Hierarchical roles inherit from parent roles',
          'Check permissions at API and UI layers',
          'Consider ABAC for complex attribute-based rules'
        ]
      },
      {
        id: 'jwt',
        title: 'JWT Stateless Auth',
        description: 'JSON Web Tokens for authentication.',
        keyPoints: [
          'Structure: header.payload.signature (base64 encoded)',
          'Stateless: No server session storage required',
          'Contains claims: sub, exp, iat, custom data',
          'Signed (JWS) or encrypted (JWE)',
          'Verify signature on each request'
        ]
      },
      {
        id: 'websockets',
        title: 'WebSocket Communication',
        description: 'Real-time bidirectional communication.',
        keyPoints: [
          'Persistent connection after HTTP upgrade handshake',
          'Full-duplex: Server and client can send anytime',
          'Use cases: Chat, live updates, gaming, collaboration',
          'Socket.io adds fallbacks and reconnection',
          'Consider Server-Sent Events for server→client only'
        ]
      }
    ],
    questions: [
      {
        id: 'q-oauth-flow',
        question: 'Explain the flow of OAuth 2.0',
        answer: `**Authorization Code Flow (with PKCE for SPAs):**

1. **User clicks "Login with Google"**
   - App generates code_verifier and code_challenge
   - Redirects to: \`/authorize?client_id=X&redirect_uri=Y&code_challenge=Z&response_type=code\`

2. **User authenticates** at provider (Google)

3. **Provider redirects back** with authorization code:
   \`callback?code=AUTH_CODE\`

4. **App exchanges code for tokens** (backend):
   \`\`\`
   POST /token
   { code, code_verifier, client_id, client_secret }
   \`\`\`

5. **Provider returns:**
   - access_token (short-lived, ~1 hour)
   - refresh_token (long-lived)
   - id_token (user info, if OpenID Connect)

6. **App uses access_token** in API requests:
   \`Authorization: Bearer <access_token>\`

7. **On expiry, use refresh_token** to get new access_token`,
        difficulty: 'intermediate'
      },
      {
        id: 'q-websocket-security',
        question: 'How do you secure a WebSocket connection?',
        answer: `**1. Use WSS (WebSocket Secure):**
Always use \`wss://\` in production - encrypted like HTTPS.

**2. Authentication on Connection:**
\`\`\`javascript
const ws = new WebSocket('wss://api.com?token=JWT_TOKEN');

// Server side:
wss.on('connection', (ws, req) => {
  const token = parseToken(req.url);
  if (!verifyJWT(token)) ws.close(4001, 'Unauthorized');
});
\`\`\`

**3. Origin Validation:**
\`\`\`javascript
if (req.headers.origin !== 'https://trusted-domain.com') {
  ws.close();
}
\`\`\`

**4. Rate Limiting:** Track messages per client, disconnect abusers

**5. Input Validation:** Sanitize all incoming messages

**6. Heartbeat/Ping:** Detect and close stale connections

**7. Authorization per Message:** Check permissions for each action type`,
        difficulty: 'advanced'
      },
      {
        id: 'q-jwt-storage',
        question: 'Where should you store a JWT on the client side?',
        answer: `**Option 1: HTTP-Only Cookie (Recommended)**
\`\`\`javascript
// Server sets:
Set-Cookie: token=JWT; HttpOnly; Secure; SameSite=Strict
\`\`\`
✅ XSS-safe (JavaScript can't access)
✅ Automatically sent with requests
⚠️ Needs CSRF protection
⚠️ Cookie size limits (~4KB)

**Option 2: In-Memory (Variable)**
\`\`\`javascript
let accessToken = response.access_token;
\`\`\`
✅ Safest from XSS
❌ Lost on refresh (use refresh token rotation)

**Option 3: localStorage (Least Secure)**
\`\`\`javascript
localStorage.setItem('token', jwt);
\`\`\`
❌ Vulnerable to XSS attacks
✅ Persists across sessions
⚠️ Only if you trust all scripts

**Best Practice:**
- Access token: In-memory or short-lived HttpOnly cookie
- Refresh token: HttpOnly, Secure, SameSite cookie
- Implement token rotation on refresh`,
        difficulty: 'intermediate'
      }
    ]
  }
];
