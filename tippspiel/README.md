# Tippspiel

This project is a American Football prediction game.
Currently the UI is only available in German.

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## Local Development

This project uses [bun](https://bun.sh/) as the package manager.
Make sure you provide environment variables as described in the `.env.example` file.
To run this project locally, follow these steps:

``` bash
# Install bun if you haven't already
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Start the server
bun dev # dev server
bun preview # production-like server

# Open your browser and go to http://localhost:3000
open http://localhost:3000
```

To run the tests, you can use:

``` bash
# Run bun test runner unit tests
bun test

# Run Playwright end-to-end tests
bun test:e2e

# Biome linting and formatting
bun check # Print issues to console
bun check:write # Write fixes to files
```

## Database

This project uses [Drizzle ORM](https://orm.drizzle.team/) with a PostgreSQL database.
To manage the database schema, you can use the following commands:

``` bash
# Push the current schema to the database
bun db:push
# Generate migration files based on schema changes
bun db:generate
# Apply migrations to the database
bun db:migrate
```
