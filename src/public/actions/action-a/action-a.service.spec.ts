import { NotFoundError } from "src/error/not-found.error"
import { ActionAService } from "./action-a.service"
import { ActionAError } from "./error/action-a.error"
import { CreateActionADto } from "./dto/create-action-a.dto"
import { err, ok, Result } from "neverthrow"
import { ActionAAsyncError } from "./error"

describe("ActionAService", () => {
    let service: ActionAService

    beforeEach(() => {
        service = new ActionAService()
    })

    describe("executeActionA", () => {
        it("should return a success message when actionId is provided", () => {
            const dto: CreateActionADto = {
                actionId: "123",
                description: "Test description"
            }

            const result: Result<string, ActionAError> =
                service.executeActionA(dto)

            expect(result.isOk()).toBe(true)

            result.map(successMessage => {
                expect(successMessage).toBe(
                    'Action A executed with action ID: 123 Optional description: "Test description"'
                )
            })
        })

        it("should return an ActionAError when actionId is missing", () => {
            const dto: CreateActionADto = {
                actionId: "",
                description: "Test description"
            }

            const result: Result<string, ActionAError> =
                service.executeActionA(dto)

            expect(result.isErr()).toBe(true)

            result.mapErr(error => {
                expect(error).toBeInstanceOf(ActionAError)
                expect(error.message).toBe("Invalid action ID")
            })
        })
    })

    describe("executeAsyncActionA", () => {
        it("should return a success message when async operation is successful", async () => {
            const dto: CreateActionADto = {
                actionId: "123",
                description: "Test description"
            }

            jest.spyOn(service, "simulateAsyncOperation").mockResolvedValue(
                ok(undefined)
            )

            const result: Result<string, ActionAAsyncError> =
                await service.executeAsyncActionA(dto)

            expect(result.isOk()).toBe(true)

            result.map(successMessage => {
                expect(successMessage).toBe(
                    'Async action completed for action ID: 123 Optional description: "Test description"'
                )
            })
        })

        it("should return an ActionAError when async operation fails", async () => {
            const dto: CreateActionADto = {
                actionId: "123",
                description: "Test description"
            }

            jest.spyOn(service, "simulateAsyncOperation").mockResolvedValue(
                err(new ActionAError("Simulated async failure"))
            )

            const result: Result<string, ActionAAsyncError> =
                await service.executeAsyncActionA(dto)

            expect(result.isErr()).toBe(true)

            result.mapErr(error => {
                expect(error).toBeInstanceOf(ActionAError)
                expect(error.message).toBe("Simulated async failure")
            })
        })

        it("should return a NotFoundError when async operation returns not found", async () => {
            const dto: CreateActionADto = {
                actionId: "123",
                description: "Test description"
            }

            jest.spyOn(service, "simulateAsyncOperation").mockResolvedValue(
                err(new NotFoundError("Simulated async not found"))
            )

            const result = await service.executeAsyncActionA(dto)

            expect(result.isErr()).toBe(true)

            result.mapErr(error => {
                expect(error).toBeInstanceOf(NotFoundError)
                expect(error.message).toBe("Simulated async not found")
            })
        })
    })
})
