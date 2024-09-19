import { Test, TestingModule } from "@nestjs/testing"
import { RetryService } from "./retry.service"
import { IRetryOptions } from "./interface/retry.interface"

describe("RetryService", () => {
    let service: RetryService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RetryService]
        }).compile()

        service = module.get<RetryService>(RetryService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should retry a failing function the specified number of times", async () => {
        let attempts = 0
        const failingFunction = jest.fn(async () => {
            attempts++
            if (attempts < 3) {
                throw new Error("Failed attempt")
            }
            return "Success"
        })

        const options: IRetryOptions<string, Error> = { retries: 5, delay: 0 }
        const result = await service.retry(failingFunction, options)
        expect(result).toBe("Success")
        expect(failingFunction).toHaveBeenCalledTimes(3)
    })

    it("should succeed on the first attempt without retries", async () => {
        const successfulFunction = jest.fn(async () => "Immediate Success")

        const options: IRetryOptions<string, Error> = { retries: 3, delay: 0 }
        const result = await service.retry(successfulFunction, options)
        expect(result).toBe("Immediate Success")
        expect(successfulFunction).toHaveBeenCalledTimes(1)
    })

    it("should throw an error after all retries are exhausted", async () => {
        const failingFunction = jest.fn(async () => {
            throw new Error("Always fails")
        })

        const options: IRetryOptions<unknown, Error> = { retries: 2, delay: 0 }
        await expect(service.retry(failingFunction, options)).rejects.toThrow(
            "Always fails"
        )
        expect(failingFunction).toHaveBeenCalledTimes(3)
    })

    it("should not allow negative retries (treat as zero retries)", async () => {
        const failingFunction = jest.fn(async () => {
            throw new Error("Negative retries")
        })

        const options: IRetryOptions<unknown, Error> = { retries: -1, delay: 0 }
        await expect(service.retry(failingFunction, options)).rejects.toThrow(
            "Negative retries"
        )
        expect(failingFunction).toHaveBeenCalledTimes(1)
    })

    it("should handle a function that always fails with multiple retries", async () => {
        const failingFunction = jest.fn(async () => {
            throw new Error("Always fails")
        })

        const options: IRetryOptions<unknown, Error> = { retries: 5, delay: 0 }
        await expect(service.retry(failingFunction, options)).rejects.toThrow(
            "Always fails"
        )
        expect(failingFunction).toHaveBeenCalledTimes(6)
    })

    it("should respect delay between retries", async () => {
        jest.spyOn(service, "delay").mockResolvedValue(undefined)

        const failingFunction = jest.fn(async () => {
            throw new Error("Delayed failure")
        })

        const options: IRetryOptions<unknown, Error> = {
            retries: 1,
            delay: 1000
        }
        await expect(service.retry(failingFunction, options)).rejects.toThrow(
            "Delayed failure"
        )
        expect(failingFunction).toHaveBeenCalledTimes(2)
        expect(service.delay).toHaveBeenCalledWith(1000)
    })

    it("should handle a function that succeeds after some retries with delays", async () => {
        jest.spyOn(service, "delay").mockResolvedValue(undefined)

        let attempts = 0
        const intermittentFunction = jest.fn(async () => {
            attempts++
            if (attempts < 4) {
                throw new Error("Intermittent failure")
            }
            return "Eventual Success"
        })

        const options: IRetryOptions<string, Error> = { retries: 5, delay: 500 }
        const result = await service.retry(intermittentFunction, options)

        expect(result).toBe("Eventual Success")
        expect(intermittentFunction).toHaveBeenCalledTimes(4)
        expect(service.delay).toHaveBeenCalledTimes(3)
        expect(service.delay).toHaveBeenCalledWith(500)
    })

    it("should retry with exponential backoff", async () => {
        jest.spyOn(service, "delay").mockResolvedValue(undefined)

        let attempts = 0
        const failingFunction = jest.fn(async () => {
            attempts++
            throw new Error("Exponential failure")
        })

        const options: IRetryOptions<unknown, Error> = {
            retries: 3,
            delay: 100,
            exponentialBackoff: true
        }

        await expect(service.retry(failingFunction, options)).rejects.toThrow(
            "Exponential failure"
        )
        expect(service.delay).toHaveBeenNthCalledWith(1, 100)
        expect(service.delay).toHaveBeenNthCalledWith(2, 200)
        expect(service.delay).toHaveBeenNthCalledWith(3, 300)
    })

    it("should retry only on specific errors", async () => {
        const retryOnError = (error: Error) =>
            error.message === "Retryable error"
        let attempts = 0
        const retryableFunction = jest.fn(async () => {
            attempts++
            throw new Error(
                attempts === 1 ? "Non-retryable error" : "Retryable error"
            )
        })

        const options: IRetryOptions<unknown, Error> = {
            retries: 2,
            delay: 100,
            retryOnError
        }

        await expect(service.retry(retryableFunction, options)).rejects.toThrow(
            "Non-retryable error"
        )
        expect(retryableFunction).toHaveBeenCalledTimes(1)
    })

    it("should retry based on result conditions, e.g. a status code of 401", async () => {
        let attempts = 0
        const resultFunction = jest.fn(async () => {
            attempts++
            return { statusCode: attempts === 1 ? 401 : 200 }
        })

        const options: IRetryOptions<{ statusCode: number }, Error> = {
            retries: 2,
            delay: 100,
            retryOnResult: result => result.statusCode === 401
        }

        const result = await service.retry(resultFunction, options)
        expect(result).toEqual({ statusCode: 200 })
        expect(resultFunction).toHaveBeenCalledTimes(2)
    })

    it("should stop retrying after the global timeout", async () => {
        jest.spyOn(service, "delay").mockImplementation(
            ms => new Promise(resolve => setTimeout(resolve, ms))
        )

        const longRunningFunction = jest.fn(async () => {
            throw new Error("Any error")
        })

        const options: IRetryOptions<unknown, Error> = {
            retries: 5,
            delay: 500,
            timeout: 1000
        }

        await expect(
            service.retry(longRunningFunction, options)
        ).rejects.toThrow("Retry timeout exceeded")
        expect(longRunningFunction).toHaveBeenCalledTimes(2)
    })
})
