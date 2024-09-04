# Development Workflow

[← Back to Main Documentation](../README.md)

## Linting and Formatting

We use ESLint and Prettier to enforce consistent code style:

-   **Lint the code:** `pnpm run lint`
-   **Auto-fix lint issues:** `pnpm run lint:fix`
-   **Format the code:** `pnpm run format`
-   **Auto-fix formatting:** `pnpm run format:fix`

## Commit Guidelines

We use Commitizen to guide commit message formatting:

-   **Create a commit:** `pnpm run commit`

## Husky Hooks

-   **Pre-commit:** Lints, formats, tests, and builds before committing.
-   **Commit-msg:** Ensures commit messages follow the conventional format.

## Configuration

-   **ESLint:** `.eslintrc.cjs`
-   **Commitlint:** `commitlint.config.js`
-   **Prettier (if applicable):** `prettier.config.js`

---

[← Back to Main Documentation](../README.md)
