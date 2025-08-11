# Agent Instructions for Tippspiel Project

This document contains specific instructions for AI agents working on the Tippspiel (German-language American Football prediction game) project.

## Project Overview

Tippspiel is a Next.js application for American Football game prediction among friends.
Key characteristics:
- **Tech Stack**: Next.js 15, TypeScript, tRPC, Drizzle ORM, PostgreSQL, NextAuth.js, Tailwind CSS v4, Zod v4
- **Architecture**: T3 Stack with App Router, server-side rendering, and type-safe APIs
- **Language**: Mixed German/English (UI in German, code in English)
- **Deployment**: Designed for production with environment validation

## Core Development Principles

### 1. Type Safety First
- **ALWAYS** use TypeScript with strict settings (`noUncheckedIndexedAccess: true`)
- Use Zod schemas for all data validation (API inputs, environment variables)
- Prefer `satisfies` operator over type assertions where appropriate
- Never use `any` - use proper typing or `unknown` with type guards

### 2. Environment & Configuration
- All environment variables MUST be defined in `src/env.js` with Zod validation
- Use `~/env` import for accessing environment variables
- Server-only variables go in `server` object, client variables in `client` object
- Follow the existing pattern for `runtimeEnv` destructuring

### 3. Database & Schema Management
- Use Drizzle ORM exclusively - NO raw SQL except in migrations
- Define all schemas in `src/server/db/schema.ts`
- Use relations in `src/server/db/relations.ts`
- Database operations should be done through the `db` export from `~/server/db`
- Use UUIDs for primary keys with `uuid_generate_v4()` default
- Always include `createdAt` and `updatedAt` timestamps with string mode

### 4. Simplicity & Clarity
- Keep components and functions small and focused
- Use clear, descriptive names for variables and functions
- Avoid unnecessary complexity - prefer simple solutions

### 5. Dependencies
- Use Bun for package management - NO npm or yarn
- Make use of existing dependencies and language features
- Avoid adding new dependencies unless it has a clear benefit
- Always use the `node:` prefix for Node.js built-in modules (e.g., `node:fs`, `node:path`)

## Architecture Patterns

### 1. File Organization
```
src/
├── app/                   # Next.js App Router
│   ├── api/               # API routes
│   └── [routes]/          # Page routes
├── server/                # Server-only code
│   ├── api/               # tRPC routers and procedures
│   ├── auth/              # Authentication logic
│   └── db/                # Database schema and connection
├── trpc/                  # tRPC client configuration
└── styles/                # Global styles
```

### 2. Import Path Conventions
- Use `~/*` alias for all internal imports (configured in tsconfig.json)
- Server-only imports: `~/server/*`
- Client-side tRPC: `~/trpc/react`
- Database: `~/server/db`
- Environment: `~/env`

### 3. Component Patterns
- **Client Components**: Mark with `"use client"` directive only when needed
- **Server Actions**: Use separate `.ts` files with `"use server"` directive
- **Forms**: Use HeadlessUI components with `useActionState` hook
- **Styling**: Use Tailwind CSS classes exclusively, leverage the custom theme in `globals.css`

## tRPC & API Patterns

### 1. Router Structure
- Place routers in `src/server/api/routers/[name].ts`
- Export as `[name]Router` (e.g., `userRouter`)
- Add to `src/server/api/root.ts` as `appRouter`

### 2. Procedure Types
- `publicProcedure`: No authentication required
- `protectedProcedure`: Requires authenticated user
- Always use Zod `.input()` validation for procedure inputs
- Follow the existing timing middleware pattern

### 3. Error Handling
- Use `TRPCError` with appropriate error codes:
  - `UNAUTHORIZED`: Not logged in
  - `FORBIDDEN`: Logged in but no permission
  - `NOT_FOUND`: Resource doesn't exist
  - `CONFLICT`: Duplicate/constraint violation
  - `INTERNAL_SERVER_ERROR`: Unexpected errors

## Database Patterns

### 1. Schema Conventions
- Table names: singular, lowercase (e.g., `user`, `bet`, `game`)
- Primary keys: `id` (UUID with `uuid_generate_v4()` default)
- Foreign keys: `[table]Id` (e.g., `userId`, `gameId`)
- Timestamps: `createdAt`, `updatedAt` with `timestamp({ mode: "string" })`
- Use `varchar()` for strings, specify length for constrained fields
- Use `unique()` constraints in table definition callbacks

### 2. Query Patterns
- Use Drizzle's query builder syntax
- Prefer `eq()`, `and()`, `or()` from `drizzle-orm` for conditions
- Always handle potential undefined results from queries
- Use `.returning()` for insert/update operations when you need the data

## Authentication Patterns

### 1. NextAuth.js Integration
- Configuration in `src/server/auth/config.ts`
- Cached auth function in `src/server/auth/index.ts`
- Use Drizzle adapter for session storage
- Custom password handling in `src/server/auth/password.ts`

### 2. Session Handling
- Server components: `await auth()` directly
- Client components: Use tRPC context or session provider
- Protect routes with session checks in server components
- Use `protectedProcedure` for authenticated tRPC routes

## Testing Patterns

### 1. Unit Testing
- Use Bun's built-in test runner
- Place `.spec.ts` files next to source files
- Test business logic, especially authentication and data validation
- Mock external dependencies appropriately

### 2. E2E Testing
- Use Playwright for end-to-end tests in `tests/` directory
- Test critical user flows (auth, core functionality)
- Use environment variables for test configuration
- Follow the existing naming pattern: `[feature].e2e.ts`

## Other Patterns and Guidelines

### 1. HTML & Accessibility
- Use semantic HTML elements (e.g., `<header>`, `<main>`, `<footer>`)
- Ensure all interactive elements are accessible (e.g., use `<button>` for actions)
- Keep ARIA attributes to a minimum, use them only when necessary
- Markup should be responsive and mobile-friendly

### 2. Form Patterns
- Use HeadlessUI components (`Field`, `Label`, `Input`, `Button`, `Description`)
- Implement form validation states with `invalid` prop
- Use `useActionState` hook for form state management
- Server actions should handle form validation and return structured state
- Error messages in German for user-facing forms

### 3. Language Usage
- UI text: German (following existing patterns)
- Code: English (variables, functions, comments)
- Database: English field names, German content where appropriate
- Error messages: German for user-facing, English for developer logs

### 4. Documentation
- Prefer self-explanatory code over adding comments
- Update README.md if local build instructions change
- Never add JSDoc comments
- Use implicit typing for functions and variables if possible

## Code Quality Standards

### 1. Biome Configuration
- Use Biome for linting and formatting (configured in `biome.jsonc`)
- Run `bun check` before commits
- Use `bun check:write` for auto-fixing
- Follow recommended rules with custom `useSortedClasses`

### 2. Code Structure
- Prefer named exports over default exports (except for pages/layouts)
- Use early returns to reduce nesting
- Extract complex logic into utility functions

## Security Best Practices

### 1. Authentication Security
- Use password hashing with salt (existing pattern in `password.ts`)
- Include password pepper from environment
- Implement proper session management
- Validate all user inputs with Zod

### 2. Environment Security
- Never commit secrets to version control
- Use environment validation to catch missing variables
- Separate client/server environment variables properly
- Use `SKIP_ENV_VALIDATION` only for Docker builds

## Performance Considerations

### 1. Database Optimization
- Use appropriate indexes (follow existing schema patterns)
- Implement connection pooling (already configured)
- Use database constraints for data integrity
- Cache database connection in development

### 2. Next.js Optimization
- Leverage Server Components by default
- Use Client Components only when necessary
- Implement proper caching strategies
- Use Next.js built-in optimizations (Image, Link components)

## Development Workflow

### 1. Scripts Usage
- `bun dev`: Development server with Turbo
- `bun check`: Lint and format check
- `bun typecheck`: TypeScript validation
- `bun test`: Unit tests
- `bun test:e2e`: Playwright tests
- `bun db:push`: Push schema changes to database

### 2. Database Workflow
- Make schema changes in `schema.ts`
- Run `bun db:generate` to create migrations
- Run `bun db:migrate` to apply migrations
- Use `bun db:studio` for database inspection

### 3. Server Actions Pattern
- Create separate action files (e.g., `login/action.ts`)
- Use `"use server"` directive at top of file
- Return structured state objects for form handling
- Handle redirects with `redirect()` from `next/navigation`
- Validate inputs and provide German error messages

## Common Pitfalls to Avoid

1. **Don't** use raw SQL queries - use Drizzle ORM
2. **Don't** import server code in client components
3. **Don't** forget to validate environment variables in `env.js`
4. **Don't** use `any` types - maintain strict TypeScript
5. **Don't** bypass tRPC error handling - use proper error codes
6. **Don't** call `npm` - use `bun` for package management and scripts
7. **Don't** use English for user-facing text - keep it in German
8. **Don't** use Client Components unnecessarily - Server Components are preferred
9. **Don't** skip Zod validation for API inputs
10. **Don't** hardcode configuration - use environment variables

This document should be your primary reference when working on the Tippspiel project.
Follow these patterns consistently to maintain code quality and project coherence.
