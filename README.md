# TEEM Onboarding (Fullstack POC)

> ## Resources Used

- Next.js 16 (App Router)
- React 19
- TypeScript
- Prisma 7
- PostgreSQL (Supabase)
- TanStack Query (React Query)
- Zod (validation)
- Vitest
- Tailwind CSS 4

> ## Local Dependencies

- Node.js 20+
- pnpm
- PostgreSQL database (Supabase account)

> ## Development Environment

To run the development environment, clone the project and execute the commands below at the project root:

First, set up your environment variables:

```bash
cp .env.example .env
```

Fill in your Supabase credentials in the `.env` file.

Then, set up the database:

```bash
pnpm db:migrate
pnpm db:seed
```

Finally, start the development server:

```bash
pnpm dev
```

After that, access http://localhost:3000/

The login page will accept any email address (no password required for this POC). After logging in, you'll be redirected to the onboarding page.

> ## Testing

To run the tests, execute the command below at the project root:

```bash
pnpm test
```

To run tests once (CI mode):

```bash
pnpm test:run
```

Current test coverage includes:

- Unit tests for authorization logic
- API route tests with mocked Prisma
- ~42 tests total

> ## Project Structure

```
teem/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── login/             # Login page
│   └── onboarding/        # Onboarding page
├── src/
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and business logic
│   └── types/            # TypeScript definitions
└── prisma/               # Database schema and migrations
```

> ## Key Features

This is a fullstack POC that implements a multi-user onboarding system with:

- **4 Onboarding Sections:** Company Information, Billing Setup, Team Members, Security Settings
- **Section Ownership:** Each section can have multiple owners (identified by email)
- **Access Control:** Users can only access sections they own (or sections with no owners yet)
- **Form Persistence:** Each section has a form with at least 2 inputs, data is persisted via API
- **Mock User System:** Simulate different users without real authentication (cookie-based)

> ## Design Decisions

### Mock Authentication

I implemented a simple cookie-based mock user system since the requirements specified no real authentication was needed. This allows easy user simulation for testing - just enter any email on the login page. In production, this would obviously need proper authentication.

### Section Ownership Model

I went with a flexible many-to-many relationship for section ownership. The logic is:

- If a section has no owners, anyone can access it (first-come-first-served)
- If a section has owners, only those owners can access it
- One user can own multiple sections, and one section can have multiple owners

This allows for collaborative onboarding scenarios while maintaining clear access control.

### Validation Strategy

I implemented validation on both frontend and backend using Zod schemas. This "defense in depth" approach ensures data integrity even if someone bypasses the frontend validation.

### React Query for State Management

I used React Query for data fetching and caching. It handles loading states, error states, and caching automatically, which keeps the components clean and focused on presentation.

> ## Design Patterns & Principles Applied

I applied several design patterns and software engineering principles throughout the codebase:

### Design Patterns

**1. Custom Hooks Pattern**

- Created reusable hooks (`useSections`, `useSubmission`, `useOwners`) to encapsulate data fetching and state management logic
- Separates business logic from UI components, making components more focused and testable

**2. Singleton Pattern**

- Prisma client instance is created as a singleton to prevent multiple database connections
- Uses global variable pattern for Next.js development hot-reloading compatibility

**3. Factory Pattern**

- API client uses a factory function (`apiRequest`) to create HTTP requests with consistent configuration
- Endpoints are generated using factory functions (e.g., `submission(sectionKey)`, `owners(sectionKey)`)

**4. Repository Pattern (Implicit)**

- Prisma ORM acts as a repository abstraction layer
- Data access logic is centralized, making it easy to swap implementations if needed

**5. Custom Error Classes**

- Created `AuthorizationError` class for type-safe error handling
- Allows for consistent error responses with proper status codes

**6. Query Key Factory Pattern**

- Centralized query keys in `queryClient.ts` to prevent typos and ensure consistency
- Makes cache invalidation more reliable

**7. Schema Validation Pattern**

- Zod schemas for runtime validation
- Separate validation schemas per section type for type safety

**8. Composition Pattern**

- UI components are composed of smaller, reusable components
- Example: `OnboardingAccordion` composes `SectionForm`, `OwnerEditor`, and UI components

### SOLID Principles

**Single Responsibility Principle (SRP)**

- Each hook has a single responsibility (fetching sections, managing submissions, managing owners)
- Components are focused on presentation, hooks handle logic
- Authorization logic is separated into its own module

**Open/Closed Principle (OCP)**

- Validation schemas can be extended without modifying existing code
- New sections can be added by extending the `SectionKey` type and adding new schemas

**Dependency Inversion Principle (DIP)**

- Components depend on abstractions (hooks) rather than concrete implementations
- API client abstracts HTTP calls, making it easy to mock for testing

### Other Principles

**DRY (Don't Repeat Yourself)**

- Reusable API client instead of repeating fetch logic
- Shared validation utilities
- Centralized query keys and endpoints

**Separation of Concerns**

- Clear separation between:
  - UI components (`src/components/`)
  - Business logic (`src/lib/`)
  - Data fetching (`src/hooks/`)
  - Type definitions (`src/types/`)

**Type Safety**

- TypeScript throughout the codebase
- Type-safe API responses and function parameters
- Prisma generates types from schema

**Defense in Depth**

- Validation on both frontend and backend
- Authorization checks at multiple levels (API routes and business logic)

**Fail Fast**

- Authorization errors throw immediately with clear messages
- Validation happens early in the request lifecycle

> ## Difficulties

### Mock User Cookie Management

Working with Next.js server components and cookies required understanding the async nature of `cookies()` in the App Router. Had to make sure the cookie was properly set and read across both server and client components.

### Access Control Logic

The "first-come-first-served" rule when no owners exist added some complexity to the authorization logic. Had to make sure the logic was clear and testable, which is why I centralized it in `src/lib/authorization.ts`.

### Type Safety with Prisma

Getting the types right for Prisma queries, especially with the `include` option, took some trial and error. TypeScript's inference is great, but sometimes you need to be explicit about the return types.

> ## Considerations

I tried to keep the code clean and maintainable while meeting all the requirements. The structure is simple but organized, making it easy to understand and extend.

Since this is a POC, I focused on:

- Meeting all the specified requirements
- Writing testable code
- Clear separation of concerns (components, hooks, business logic)
- Type safety throughout

I didn't over-engineer it - kept it simple but professional. The code is ready to be reviewed and can serve as a foundation for a production version.

For production, there are several improvements needed (see Production Improvements section below), but for a POC, I believe this strikes a good balance between functionality and simplicity.

> ## Production Improvements

This POC is functional but would need several improvements for production. Here's a comprehensive breakdown:

### 1. Authentication & Authorization

**Current State (POC):**

- Mock authentication using a simple cookie (`mock_user_email`)
- No password verification
- No session management

**Production Recommendations:**

- Implement proper authentication using OAuth 2.0 / OpenID Connect (e.g., Auth0, Clerk, NextAuth.js)
- Add JWT tokens with proper expiration and refresh token rotation
- Implement RBAC (Role-Based Access Control) beyond just ownership
- Add audit logging for all authorization decisions
- Use secure session management with httpOnly, secure, sameSite cookies
- Add rate limiting to prevent brute force attacks
- Implement MFA/2FA for sensitive operations

### 2. Database & Storage

**Current State (POC):**

- PostgreSQL via Supabase with connection pooling
- Simple schema with basic relations
- No data encryption at rest

**Production Recommendations:**

- Add database indexes on frequently queried columns (e.g., `ownerEmail`, `sectionId`)
- Implement soft deletes instead of hard deletes for audit trail
- Add data encryption at rest for sensitive fields (PII, credentials)
- Set up read replicas for horizontal scaling
- Implement connection pooling with proper limits (PgBouncer already in use)
- Add database migrations versioning with rollback capabilities
- Set up automated backups with point-in-time recovery
- Consider data partitioning if sections/submissions grow large

### 3. API Security

**Current State (POC):**

- Basic input validation with Zod
- Simple error messages
- No rate limiting

**Production Recommendations:**

- Add rate limiting per user/IP (e.g., 100 requests/minute)
- Implement CORS properly with specific allowed origins
- Add request validation middleware for all endpoints
- Sanitize all inputs to prevent XSS/injection attacks
- Use HTTPS only with HSTS headers
- Add security headers (CSP, X-Frame-Options, X-Content-Type-Options)
- Implement API versioning (e.g., `/api/v1/sections`)
- Add request/response logging with PII redaction
- Set up API monitoring and alerting

### 4. Error Handling

**Current State (POC):**

- Basic try/catch with generic error messages
- Errors logged to console

**Production Recommendations:**

- Implement structured error logging (e.g., Sentry, LogRocket, DataDog)
- Create error boundary components for React
- Add correlation IDs for request tracing
- Return standardized error responses with error codes
- Never expose stack traces in production
- Implement graceful degradation for non-critical features

### 5. Performance

**Current State (POC):**

- React Query caching (5min stale time)
- No server-side caching
- No optimization for concurrent requests

**Production Recommendations:**

- Add Redis caching for frequently accessed data (sections, ownership)
- Use ISR (Incremental Static Regeneration) for semi-static pages
- Add database query optimization (N+1 prevention, query analysis)
- Implement lazy loading for accordion content
- Add CDN for static assets
- Use Web Workers for heavy computations
- Implement optimistic updates for better UX

### 6. Testing

**Current State (POC):**

- Unit tests for authorization logic
- API route tests with mocks
- ~42 tests total

**Production Recommendations:**

- Add integration tests with real database (test containers)
- Add E2E tests with Playwright/Cypress
- Implement contract testing for API
- Set up mutation testing for test quality
- Add visual regression testing for UI components

### 7. Monitoring & Observability

**Current State (POC):**

- Console logging only
- No metrics or tracing

**Production Recommendations:**

- Add APM (Application Performance Monitoring) - New Relic, DataDog
- Implement distributed tracing - OpenTelemetry
- Set up health check endpoints (`/api/health`, `/api/ready`)
- Add custom metrics (onboarding completion rate, section access patterns)
- Create dashboards for business and technical KPIs
- Set up alerting for anomalies and errors

### 8. Code Architecture

**Current State (POC):**

- Simple file-based structure
- Business logic mixed with API handlers

**Production Recommendations:**

- Implement clean architecture (separate domain, application, infrastructure layers)
- Add repository pattern for data access abstraction
- Create service layer for business logic
- Use dependency injection for better testability
- Add API documentation with OpenAPI/Swagger
- Implement feature flags for gradual rollouts
- Add internationalization (i18n) support

> ## ToDo

- [ ] Add integration tests with real database (test containers)
- [ ] Implement error boundaries for better error handling
- [ ] Add skeleton screens for better loading UX
- [ ] Implement optimistic updates for owner management
- [ ] Add health check endpoints (`/api/health`)
- [ ] Improve test coverage (currently ~42 tests, aim for >80% on critical paths)
- [ ] Add API documentation with OpenAPI/Swagger
- [ ] Implement proper authentication system
- [ ] Add rate limiting and security headers
- [ ] Set up structured logging (Sentry/DataDog)

> ## Conclusion

I enjoyed building this POC! It was a good exercise in fullstack development with Next.js, and I got to work with some technologies I hadn't used much before (like Prisma 7).

The requirements were clear, and I tried to implement everything as specified while keeping the code maintainable and testable. The mock authentication system works well for testing different user scenarios, and the ownership model provides flexibility for collaborative onboarding.

One of the main challenges was working within a 24-hour deadline. This constraint forced me to make strategic decisions about what to prioritize - focusing on meeting all requirements while still demonstrating good engineering practices. I had to balance between:

- Building a functional POC that meets all requirements
- Creating a codebase that demonstrates my knowledge of design patterns, SOLID principles, and best practices
- Writing testable, maintainable code
- Not over-engineering for a POC, but also not under-delivering

It was a delicate balance - I wanted to show that I can write production-quality code, but also that I understand when to keep things simple. I believe this POC strikes that balance: it's functional, well-structured, and demonstrates the core concepts while remaining maintainable and extensible.

I kept it simple and focused on functionality rather than over-engineering. In a real-world scenario with more time, I'd probably add more production-ready features (error boundaries, optimistic updates, better loading states, etc.), but for a POC within the given timeframe, I think this demonstrates the core concepts and my approach to software development well.

Feel free to explore the code, run the tests, and let me know if you have any questions!
