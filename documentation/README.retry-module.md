# RetryModule

[← Back to Main Documentation](../README.md)

The `RetryModule` provides a service that allows you to retry asynchronous operations with configurable options such as retries, delay, exponential backoff, and timeout. You can also retry based on specific error conditions or result conditions using customizable retry filters.

## Installation

To use the `RetryModule`, first import it into your NestJS application:

```typescript
import { RetryModule } from "./retry/retry.module"

@Module({
    imports: [RetryModule]
})
export class AppModule {}
```

## Usage

You can inject the `RetryService` into any service where you need to retry an operation.

### Basic Example

```typescript
import { Injectable } from "@nestjs/common"
import { RetryService } from "./retry/retry.service"

@Injectable()
export class SomeService {
    constructor(private readonly retryService: RetryService) {}

    async fetchDataWithRetry() {
        const data = await this.retryService.retry(
            () => this.someAsyncFunction(),
            {
                retries: 3,
                delay: 500
            }
        )
        return data
    }

    private async someAsyncFunction(): Promise<unknown> {
        // Simulate an async operation (e.g., API call)
        return fetch("https://api.example.com/data")
    }
}
```

### Options

The `retry` method accepts two parameters:

1. **fn**: The asynchronous function to be retried.
2. **options**: Configuration options.

### IRetryOptions

```typescript
export interface IRetryOptions<T = unknown, E extends Error = Error> {
    retries: number // Number of retry attempts
    delay?: number // Optional delay between retries (in milliseconds)
    exponentialBackoff?: boolean // Optional exponential backoff for retries
    retryOnError?: (error: E) => boolean // Optional function to filter which errors should trigger a retry
    retryOnResult?: (result: T) => boolean // Optional function to filter which results should trigger a retry
    timeout?: number // Optional total time (in milliseconds) after which retries will stop
}
```

-   **`retryOnError`**: Used to specify which types of errors should trigger a retry. For example, retry only on `UnauthorizedError`.
-   **`retryOnResult`**: Used to specify result conditions that should trigger a retry. For example, retry if the result status code is `401`.

### Example with `retryOnError` and `retryOnResult`

```typescript
const options: IRetryOptions<MyResultType, MyErrorType> = {
    retries: 5,
    delay: 1000,
    exponentialBackoff: true,
    retryOnError: error => error instanceof UnauthorizedError, // Retry on specific error type
    retryOnResult: result => result.status === 401, // Retry on specific result condition
    timeout: 5000 // Stop retrying after 5 seconds
}

await retryService.retry(() => this.someAsyncFunction(), options)
```

### Exponential Backoff

When `exponentialBackoff` is enabled, the delay between retries increases with each retry. For example, if the initial delay is 500ms, subsequent delays would be 500ms, 1000ms, 1500ms, and so on. This helps reduce strain on systems when failures are persistent.

## Retry Strategies

The `RetryService` allows you to implement different retry strategies using both `retryOnError` and `retryOnResult`.

-   **`retryOnError`**: Ideal when the operation may fail due to specific error types, and you want to retry based on the type or message of the error.

    Example:

    ```typescript
    retryOnError: error => error.message.includes("Service Unavailable")
    ```

-   **`retryOnResult`**: Useful when the operation succeeds but returns an undesirable result (e.g., an HTTP status code of `401` or `5xx`), and you want to retry based on the result.

    Example:

    ```typescript
    retryOnResult: result =>
        result.status === 401 || (result.status >= 500 && result.status < 600)
    ```

## Testing

Unit tests are provided to ensure the robustness of the retry logic, covering scenarios such as retries with and without delays, exponential backoff, retrying only on specific errors or result conditions, and stopping after a timeout.

To run the tests:

```bash
npm run test
```

## Conclusion

The `RetryModule` offers a flexible and easy-to-use way to add retry logic to your NestJS services. It supports advanced features like exponential backoff, retrying based on specific error or result conditions, and a global timeout, making it suitable for many real-world use cases.

---

[← Back to Main Documentation](../README.md)
