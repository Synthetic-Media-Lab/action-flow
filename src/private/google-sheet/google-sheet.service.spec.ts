import { ConfigModule, ConfigService } from "@nestjs/config"
import { Test, TestingModule } from "@nestjs/testing"
import { google } from "googleapis"
import { Result } from "pratica"
import { NotFoundError } from "src/error/not-found.error"
import { GoogleSheetError } from "./error"
import { GoogleSheetService } from "./google-sheet.service"

jest.mock("googleapis", () => {
    const mockGet = jest.fn().mockResolvedValue({ data: { values: [] } })
    const mockBatchGet = jest.fn()

    return {
        google: {
            auth: {
                GoogleAuth: jest.fn().mockImplementation(() => ({
                    getClient: jest.fn().mockResolvedValue({})
                }))
            },
            sheets: jest.fn(() => ({
                spreadsheets: {
                    values: {
                        get: mockGet,
                        batchGet: mockBatchGet
                    }
                }
            })),
            __mockGet: mockGet,
            __mockBatchGet: mockBatchGet
        }
    }
})

describe("GoogleSheetService", () => {
    let service: GoogleSheetService
    let configService: ConfigService

    beforeAll(() => {
        global.fetch = jest.fn(() => {
            throw new Error("Network request made during test")
        })
    })

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule],
            providers: [GoogleSheetService]
        }).compile()

        service = module.get<GoogleSheetService>(GoogleSheetService)
        configService = module.get<ConfigService>(ConfigService)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe("fetchData", () => {
        it("should return data when valid inputs are provided", async () => {
            const sheetId = "valid-sheet-id"
            const sheetName = "MockSheet"
            const mockData = [
                ["Column 1", "Column 2", "Column 3"],
                ["Row 1 Data 1", "Row 1 Data 2", "Row 1 Data 3"]
            ]

            google.__mockGet.mockResolvedValueOnce({
                data: {
                    values: mockData
                }
            })

            const result: Result<string[][], GoogleSheetError> =
                await service.fetchData(sheetId, sheetName, 3)

            expect(result.isOk()).toBe(true)

            result.map(data => {
                expect(data).toEqual([...mockData])
            })
        })

        it("should return an error when the Google Sheet is not found (404)", async () => {
            const sheetId = "invalid-sheet-id"
            const sheetName = "NonExistentSheet"

            google.__mockGet.mockRejectedValueOnce({
                code: 404
            })

            const result: Result<string[][], GoogleSheetError> =
                await service.fetchData(sheetId, sheetName, 3)

            expect(result.isErr()).toBe(true)

            result.mapErr(error => {
                expect(error).toBeInstanceOf(NotFoundError)
                expect(error.message).toBe("Google Sheet not found")
            })
        })

        it("should return an error when the Google Cloud Platform service account key is missing", async () => {
            jest.spyOn(configService, "get").mockReturnValueOnce(undefined)

            const sheetId = "valid-sheet-id"
            const sheetName = "MockSheet"

            const result: Result<string[][], GoogleSheetError> =
                await service.fetchData(sheetId, sheetName, 3)

            expect(result.isErr()).toBe(true)

            result.mapErr(error => {
                expect(error.message).toBe("Could not connect to Google Sheets")
            })
        })

        it("should fetch data with dynamic columns and rows", async () => {
            const sheetId = "valid-sheet-id"
            const sheetName = "MockSheet"
            const mockData = [["Row 5 Data 1", "Row 5 Data 2", "Row 5 Data 3"]]

            google.__mockGet.mockResolvedValueOnce({
                data: {
                    values: mockData
                }
            })

            const result: Result<string[][], GoogleSheetError> =
                await service.fetchData(sheetId, sheetName, 5, "B", "D")

            expect(result.isOk()).toBe(true)

            result.map(data => {
                expect(data).toEqual([...mockData])
            })
        })
    })
})
