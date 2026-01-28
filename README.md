# TEEM Onboarding (Fullstack POC)

**Live Demo:** [https://teem-poc.vercel.app/](https://teem-poc.vercel.app/)

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

The login page uses mock authentication - enter any valid email address to simulate a user session. After logging in, you'll be redirected to the onboarding page.

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
- 42 tests total

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
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
└── prisma.config.ts      # Prisma 7 configuration
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

I implemented a simple cookie-based mock user system since the requirements specified no real authentication was needed. This allows easy user simulation for testing - just enter any email on the login page. In production, this would be replaced with a proper authentication system (OAuth, JWT, etc.).

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

### API Route Handler Pattern

I created a `withAuth` wrapper (`src/lib/apiHandler.ts`) to handle authentication and authorization error handling consistently across all API routes. This eliminates code duplication and ensures consistent behavior.

> ## Architecture Overview

### Key Patterns Applied

- **Custom Hooks Pattern**: Reusable hooks (`useSections`, `useSubmission`, `useOwners`) encapsulate data fetching logic
- **Singleton Pattern**: Prisma client uses global instance for hot-reload compatibility
- **Factory Pattern**: Centralized API client with endpoint generators
- **Query Key Factory**: Type-safe, centralized cache key management
- **Higher-Order Function**: `withAuth` wrapper for API route authentication

### Code Organization

- **Authorization**: Centralized in `src/lib/authorization.ts` with custom `AuthorizationError` class
- **Validation**: Zod schemas in `src/lib/sectionValidation.ts` with type-safe section keys
- **API Client**: Factory-based client in `src/lib/api.ts` with typed endpoints
- **Database**: Prisma singleton in `src/lib/prisma.ts` with pg adapter for connection pooling

### Database Design

- Indexed columns for performance: `ownerEmail` and `userEmail`
- Unique constraints to prevent duplicates
- Cascade deletes for referential integrity
- JSON field for flexible form data storage

> ## Technical Decisions

### Next.js App Router with Cookies

The App Router requires async handling of cookies via `cookies()` from `next/headers`. I created a centralized `getMockUserEmail()` helper to handle this consistently across server components and API routes.

### Authorization Logic

The "first-come-first-served" rule for unowned sections added complexity. I centralized this logic in `src/lib/authorization.ts` with dedicated functions (`assertCanAccessSection`, `assertCanManageOwners`) that throw typed errors for consistent handling.

### Prisma 7 Configuration

Prisma 7 introduces `prisma.config.ts` for configuration. I use this to set the direct URL for migrations while the application uses the pooled connection string for runtime queries.

> ## Considerations

Since this is a POC, I focused on:

- Meeting all the specified requirements
- Writing testable code with comprehensive test coverage
- Clear separation of concerns (components, hooks, business logic)
- Type safety throughout with TypeScript strict mode
- DRY principles with reusable utilities and wrappers

The code is structured to be maintainable and can serve as a foundation for a production version with the improvements outlined below.

> ## Production Improvements

This POC is functional but would need several improvements for production:

### 1. Authentication & Authorization

**Current:** Mock cookie-based authentication

**Production Needs:**

- OAuth 2.0 / OpenID Connect (Auth0, Clerk, NextAuth.js)
- JWT with refresh token rotation
- RBAC beyond just ownership
- Audit logging, rate limiting, MFA/2FA

### 2. Database & Storage

**Current:** PostgreSQL via Supabase with indexes on `ownerEmail` and `userEmail`

**Production Needs:**

- Soft deletes for audit trail
- Data encryption at rest for PII
- Read replicas for scaling
- Automated backups with point-in-time recovery

### 3. API Security

**Current:** Zod validation, consistent error handling

**Production Needs:**

- Rate limiting per user/IP
- CORS with specific allowed origins
- Security headers (CSP, HSTS, X-Frame-Options)
- API versioning, request/response logging

### 4. Error Handling

**Current:** Typed errors with consistent responses

**Production Needs:**

- Structured logging (Sentry, DataDog)
- Error boundaries for React
- Correlation IDs for request tracing

### 5. Testing

**Current:** 42 unit/integration tests

**Production Needs:**

- E2E tests with Playwright/Cypress
- Integration tests with test containers
- Visual regression testing

### 6. Monitoring & Observability

**Current:** Console logging

**Production Needs:**

- APM (New Relic, DataDog)
- Health check endpoints
- Custom metrics and dashboards

> ## ToDo

- [ ] Add integration tests with test containers
- [ ] Implement error boundaries
- [ ] Add skeleton screens for loading states
- [ ] Implement optimistic updates for owner management
- [ ] Add health check endpoints (`/api/health`)
- [ ] Add API documentation with OpenAPI/Swagger
- [ ] Set up structured logging

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
