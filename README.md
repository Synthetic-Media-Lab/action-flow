# ActionFlow

## Description

A scalable, client-agnostic framework built with NestJS for executing modular actions in parallel or sequence. Designed with TypeScript for type safety, it leverages adapters to transform and process data efficiently across various clients, making it ideal for projects that require structured, maintainable, and flexible action handling.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Code Quality

### Linting and Formatting

We use ESLint and Prettier to enforce consistent code style:

-   **Lint the code:** `pnpm run lint`
-   **Auto-fix lint issues:** `pnpm run lint:fix`
-   **Format the code:** `pnpm run format`
-   **Auto-fix formatting:** `pnpm run format:fix`

### Commit Guidelines

-   **Create a commit:** `pnpm run commit`

### Husky Hooks

-   **Pre-commit:** Lints, formats, tests, and builds before committing.
-   **Commit-msg:** Ensures commit messages follow the conventional format.

## Run Tests

```bash
# unit tests
pnpm run test

# e2e tests
pnpm run test:e2e

# test coverage
pnpm run test:cov
```

## Configuration

-   **ESLint:** `.eslintrc.cjs`
-   **Commitlint:** `commitlint.config.js`
-   **Prettier (if applicable):** `prettier.config.js`
