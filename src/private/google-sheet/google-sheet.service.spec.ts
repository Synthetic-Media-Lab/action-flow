import { GoogleSheetService } from "./google-sheet.service"
import { Result } from "pratica"
import { GoogleSheetError } from "./error"
import { NotFoundError } from "src/error/not-found.error"
import { google } from "googleapis"

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

    beforeAll(() => {
        global.fetch = jest.fn(() => {
            throw new Error("Network request made during test")
        })
    })

    beforeEach(() => {
        service = new GoogleSheetService()
    })

    describe("fetchData", () => {
        it("should return data when the Google Sheet ID is valid", async () => {
            const sheetId = "valid-sheet-id"
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
                await service.fetchData(sheetId)

            expect(result.isOk()).toBe(true)

            result.map(data => {
                expect(data).toEqual(mockData)
            })
        })

        it("should return an error when the Google Sheet is not found (404)", async () => {
            const sheetId = "invalid-sheet-id"

            google.__mockGet.mockRejectedValueOnce({
                code: 404
            })

            const result: Result<string[][], GoogleSheetError> =
                await service.fetchData(sheetId)

            expect(result.isErr()).toBe(true)

            result.mapErr(error => {
                expect(error).toBeInstanceOf(NotFoundError)
                expect(error.message).toBe("Google Sheet not found")
            })
        })

        it("should return an error when the Google Cloud Platform service account key is missing", async () => {
            delete process.env.GCP_SERVICE_ACCOUNT_KEY

            const sheetId = "valid-sheet-id"

            const result: Result<string[][], GoogleSheetError> =
                await service.fetchData(sheetId)

            expect(result.isErr()).toBe(true)

            result.mapErr(error => {
                expect(error.message).toBe("Could not connect to Google Sheets")
            })
        })
    })
})
