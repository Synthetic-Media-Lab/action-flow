# RetryModule

[← Back to Main Documentation](../README.md)

The `RetryModule` provides a service that allows you to retry asynchronous operations with configurable options such as retries, delay, exponential backoff, and timeout.

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

    private async someAsyncFunction(): Promise<any> {
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
export interface IRetryOptions {
    retries: number // Number of retry attempts
    delay?: number // Optional delay between retries (in milliseconds)
    exponentialBackoff?: boolean // Optional exponential backoff for retries
    retryOn?: (error: Error) => boolean // Optional function to filter which errors should trigger a retry
    timeout?: number // Optional total time (in milliseconds) after which retries will stop
}
```

### Example with Exponential Backoff and Error Filter

```typescript
const options: IRetryOptions = {
    retries: 5,
    delay: 500,
    exponentialBackoff: true,
    retryOn: error => error.message === "Retryable error", // Only retry on specific errors
    timeout: 3000 // Stop retrying after 3 seconds
}

await retryService.retry(() => someFailingAsyncFunction(), options)
```

### Exponential Backoff

When `exponentialBackoff` is enabled, the delay between retries increases with each retry. For example, if the initial delay is 500ms, subsequent delays would be 500ms, 1000ms, 1500ms, and so on. This helps reduce strain on systems when failures are persistent.

## Testing

Unit tests are provided to ensure the robustness of the retry logic, covering scenarios such as retries with and without delays, exponential backoff, retrying only on specific errors, and stopping after a timeout.

To run the tests:

```bash
npm run test
```

## Conclusion

The `RetryModule` offers a flexible and easy-to-use way to add retry logic to your NestJS services. It supports advanced features like exponential backoff, filtering errors for retries, and a global timeout, making it suitable for many real-world use cases.

---

[← Back to Main Documentation](../README.md)
