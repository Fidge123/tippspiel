# Agent Instructions for Tippspiel Project

This document contains specific instructions for AI agents working on the Tippspiel (German-language American Football prediction game) project.

## Project Overview

Tippspiel is a Next.js application for American Football game prediction among friends.
Key characteristics:
- **Tech Stack**: Next.js 15, TypeScript, tRPC, Drizzle ORM, PostgreSQL, Auth.js v5, Tailwind CSS v4, Zod v4
- **Architecture**: T3 Stack with App Router, server-side rendering, and type-safe APIs
- **Language**: Mixed German/English (UI in German, code in English)
- **Deployment**: Designed for production with environment validation

## Core Development Principles

- **ALWAYS** use TypeScript with strict settings (`noUncheckedIndexedAccess: true`)
- Use Zod schemas for all data validation (API inputs, environment variables)
- Never use `any` - use proper typing or `unknown` with type guards
- All environment variables MUST be defined in `src/env.js`
- Use `~/env` import for accessing environment variables
- Use Drizzle ORM exclusively - NO raw SQL except in migrations
- Define all schemas in `src/server/db/schema.ts` and relations in `src/server/db/relations.ts`
- Keep components and functions small and focused
- Use clear, descriptive names for variables and functions
- Avoid unnecessary complexity - prefer simple solutions
- Use Bun for package management - NEVER npm or yarn
- Always use the `node:` prefix for Node.js built-in modules (e.g., `node:fs`, `node:path`)

## Import Path Conventions
- Use `~/*` alias for all internal imports (configured in `tsconfig.json`)
- Server-only imports: `~/server/*`
- Client-side tRPC: `~/trpc/react`
- Database: `~/server/db`
- Environment: `~/env`

## Database Patterns

- Table names: singular, lowercase (e.g., `user`, `bet`, `game`)
- Primary keys: prefer `id` and `defaultRandom()` unless provided by external sources
- Foreign keys: use `references()` with `onDelete: "cascade"` where appropriate
- Timestamps: `createdAt`, `updatedAt` with `timestamp({ mode: "string" })`
- Use Drizzle's query builder syntax

## Authentication Patterns

- Server components: `await auth()` directly
- Client components: Use tRPC context or session provider
- Protect routes with session checks in server components
- Use `protectedProcedure` for authenticated tRPC routes

## Testing Patterns
- Use Bun's built-in test runner for unit tests
- Place unit tests as `[filename].spec.ts` files next to source files
- Use Playwright for end-to-end tests in `tests/` directory
- Test critical user flows (auth, core functionality)
- Use environment variables for test configuration
- Follow the existing naming pattern: `[feature].e2e.ts`

## Markup and Styling Patterns
- Use semantic and accessible HTML elements (e.g., `<header>`, `<main>`, `<footer>`)
- Keep ARIA attributes to a minimum, use them only when necessary
- Use HeadlessUI components (`Field`, `Label`, `Input`, `Button`, `Description`)
- Implement form validation states with `invalid` prop

## Language Usage
- UI text: German (following existing patterns)
- Code: English (variables, functions, comments)
- Database: English field names
- Error messages: German for user-facing, English for developer logs

## Documentation
- Prefer self-explanatory code over adding comments
- Update README.md if local build instructions change
- Never add JSDoc comments and never comments for simple code

## Code Quality Standards
- Use Biome for linting and formatting (configured in `biome.jsonc`)
- Run `bun check:write` to check and fix code style
- Use `bun typecheck` to validate TypeScript types

## Performance Considerations
- Prefer Server Components that can be static rendered
- Optimize for partial prerendering by wrapping dynamic content with `<Suspense>`
- Always provide a static fallback for dynamic components
- Use Client Components only when interactivity is required

## Common Pitfalls to Avoid

1. **Don't** use raw SQL queries - use Drizzle ORM
2. **Don't** forget to validate environment variables in `env.js`
3. **Don't** use `any` types - maintain strict TypeScript
4. **Don't** bypass tRPC error handling - use proper error codes
5. **Don't** call `npm` - use `bun` for package management and scripts
6. **Don't** use English for user-facing text - keep it in German
7. **Don't** use Client Components unnecessarily - Server Components are preferred
8. **Don't** skip Zod validation for API inputs

This document should be your primary reference when working on the Tippspiel project.
Follow these patterns consistently to maintain code quality and project coherence.
