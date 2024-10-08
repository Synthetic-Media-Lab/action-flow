# Error Handling

[← Back to Main Documentation](../README.md)

## Error Handling with `Result` Type

We use the **`Result` type** (monad) from the [neverthrow library](https://github.com/supermacro/neverthrow) in our codebase to represent operations that can either succeed or fail. This allows for more explicit and structured handling of success and error cases, improving the overall readability and maintainability of our code.

-   **Success (`Ok`)**: Contains the value when the operation is successful.
-   **Error (`Err`)**: Contains an error object when the operation fails.

> This design pattern exists in many languages:
>
> -   **Rust**: `Result`
> -   **Haskell**: `Either`
> -   **Scala**: `Try`
> -   **Elm**: `Result`
> -   **F#**: `Result`
> -   **Swift**: `Result`

### Why Use `Result`?

1. **Clear error handling**: You’re forced to handle both success (`Ok`) and error (`Err`), reducing the chance of missed errors.
2. **Functional and clean**: Use `.match()` to handle both cases in one block, making code easier to follow.
3. **Type-safe**: `Result` ensures errors are handled explicitly, preventing runtime issues. With eslint-plugin-neverthrow, unhandled `Result` objects are caught by linting, ensuring consistency.
4. **Enforced consistency**: The ESLint plugin guarantees everyone follows the same pattern, improving code quality across the team.

### Example Usage:

You can handle success and error cases using the `match` method, which allows you to map both the `Ok` (success) and `Err` (error) cases to appropriate actions.

```typescript
const result = this.actionAService.executeActionA(dto)

return result.match(
    successMessage => successMessage,
    error => {
        // Handle the error based on its type
    }
)
```

## Error Handling with Custom `type` Field

In our custom error classes, we define a `type` field that uniquely identifies each error. This `type` field allows us to handle errors in a structured and readable way. The `type` field is specific to our codebase, so this pattern will only work with our custom error classes.

### Example Error Class with `type` Field:

```typescript
export class ActionAError extends BaseError {
    readonly type = "action-a" // Custom type field

    constructor(message: string) {
        super(message)
        this.name = "ActionAError"
    }
}
```

### Handling Errors Using a `switch` Statement on `type` Field

When an error occurs, you can switch on the `type` field to differentiate between error types and handle them accordingly. This keeps the error-handling logic clean and maintainable.

#### Example:

```typescript
const result = this.actionAService.executeActionA(dto)

return result.match(
    successMessage => successMessage,
    error => {
        switch (error.type) {
            case "action-a":
                this.logger.error(`Action A Error: ${error.message}`)

                throw new HttpException(
                    { status: HttpStatus.BAD_REQUEST, error: error.message },
                    HttpStatus.BAD_REQUEST
                )

            case "not-found":
                this.logger.error(`Not Found: ${error.message}`)

                throw new HttpException(
                    { status: HttpStatus.NOT_FOUND, error: error.message },
                    HttpStatus.NOT_FOUND
                )

            default:
                this.logger.error("Unexpected Error")

                throw new HttpException(
                    {
                        status: HttpStatus.INTERNAL_SERVER_ERROR,
                        error: "Unexpected Error"
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR
                )
        }
    }
)
```

### Key Points:

-   **Custom `type` Field**: Our custom errors include a `type` field, which is used to differentiate errors.
-   **Switching on `type`**: We use a `switch` statement to handle different error types based on this field.
-   **Extensible**: If new error types are added, you can easily extend the `switch` statement to handle them.
-   **Logging**: Always log the error before throwing an appropriate HTTP exception.

## Ensuring Proper Error Handling with `eslint-plugin-neverthrow`

We use the [eslint-plugin-neverthrow](https://github.com/mdbetancourt/eslint-plugin-neverthrow) to enforce that all `Result` objects are explicitly handled. This plugin ensures that errors are not silently ignored by requiring the use of `.match()`, `.unwrapOr()`, or `._unsafeUnwrap()`.

### Installation

Install the plugin with:

```bash
pnpm install eslint-plugin-neverthrow --save-dev
```

### Configuration

In your `.eslintrc.js`, add the plugin and configure the `must-use-result` rule:

```javascript
module.exports = {
    plugins: ["neverthrow"],
    rules: {
        "neverthrow/must-use-result": "error",
        overrides: [
            {
                files: ["*.spec.ts"],
                rules: {
                    "neverthrow/must-use-result": "off" // Disable rule for test files
                }
            }
        ]
    }
}
```

This configuration enforces handling of all `Result` objects in production code, while allowing you to disable the rule in specific files such as test files.

## Optional Value Handling with `Maybe` Type

In some cases, you may need to handle optional values where a result may or may not be present.

For these cases, we use the **`Maybe` type** from the [Pratica library](https://github.com/pratica-js/pratica). This type is useful when a value may either be present (`Just`) or absent (`Nothing`).

> For example, imagine using a "head" function that gets the first value out of an array. What if the array is empty? Then what should be returned?
>
> In this case it is good to return the result as a Maybe<"something">, representing that either you have something, or you are in an invalid state that can never ever occur, and should handle it accordingly.

### Example Usage of `Maybe`:

The `pratica` library uses the `.cata` method to handle both cases of a Maybe, much like `neverthrow` uses the `.match` method to handle both cases of a Result.

```typescript
const toolCall = this.aiFunctionCallService.parseToolCall(completion)

return toolCall.cata({
    Just: toolCall => {
        this.logger.debug(`Tool call detected: \${toolCall.function.name}`)
        // Handle the tool call
        return toolCall
    },
    Nothing: () => {
        this.logger.debug("No tool call detected")
        // Handle the absence of the value
        return ok(undefined)
    }
})
```

If you need to handle optional values like this, you can integrate the **Pratica** library in your codebase for `Maybe` types.

## Restricting the Use of Pratica's `Result`

To ensure that developers only use **neverthrow's `Result`** and avoid mistakenly using **Pratica's `Result`**, we have configured ESLint to restrict the import of `Result` from the Pratica library.

Here is the configuration in our `.eslintrc.js`:

```javascript
module.exports = {
    rules: {
        "no-restricted-imports": [
            "error",
            {
                paths: [
                    {
                        name: "pratica",
                        importNames: ["Result"],
                        message:
                            "Please use neverthrow's Result instead of Pratica's Result."
                    }
                ]
            }
        ]
    }
}
```

With this rule in place, any attempt to import `Result` from `pratica` will trigger an ESLint error:

```
'Result' import from 'pratica' is restricted. Please use neverthrow's Result instead of Pratica's Result.
```

This helps maintain consistency in the codebase by enforcing the usage of **neverthrow's `Result`** for error handling.

---

[← Back to Main Documentation](../README.md)
