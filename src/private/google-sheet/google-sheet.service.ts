import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { google } from "googleapis"
import { Result, err, ok } from "neverthrow"
import { NotFoundError } from "src/error/not-found.error"
import { CloudStorageError } from "../cloud-storage/error"
import { GoogleSheetAPIError } from "../cloud-storage/error/cloud-storage-error"
import { GoogleSheetError } from "./error"
import { IGoogleSheet } from "./interface/IGoogleSheet"

@Injectable()
export class GoogleSheetService implements IGoogleSheet {
    private readonly logger = new Logger(GoogleSheetService.name)

    constructor(private readonly configService: ConfigService) {}

    private async getGoogleSheetClient() {
        const credentials = this.configService.get("GCP_SERVICE_ACCOUNT_KEY")

        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(credentials),
            scopes: ["https://www.googleapis.com/auth/spreadsheets"]
        })

        return google.sheets({ version: "v4", auth })
    }

    public async fetchData({
        sheetId,
        sheetName,
        row = 1,
        columnStart = "A",
        columnEnd = "Z"
    }: {
        sheetId: string
        sheetName: string
        row?: number
        columnStart?: string
        columnEnd?: string
    }): Promise<Result<string[][], GoogleSheetError>> {
        try {
            const gcpServiceAccountKey = this.configService.get(
                "GCP_SERVICE_ACCOUNT_KEY"
            )

            if (!gcpServiceAccountKey) {
                this.logger.error(
                    "Google Cloud Platform service account key not found"
                )
                return err(new Error("Could not connect to Google Sheets"))
            }

            const sheets = await this.getGoogleSheetClient()

            this.logger.log(
                `Fetching data from Google Sheets with ID: ${sheetId}`
            )

            const range = [
                sheetName,
                row
                    ? `!${columnStart || "A"}${row}:${columnEnd || "Z"}${row}`
                    : ""
            ].join("")

            this.logger.log(`Fetching data from range: ${range}`)

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: sheetId,
                range
            })

            if (!response?.data?.values) {
                this.logger.warn("No data found.")
                return err(
                    new NotFoundError("No data found in the Google Sheet")
                )
            }

            const data = response.data.values

            this.logger.log(
                "Fetched Data Preview:",
                data.length > 5 ? data.slice(0, 5) : data
            )

            return ok([...data])
        } catch (error) {
            const googleSheetError = this.handleGoogleSheetsError(error)

            return err(googleSheetError)
        }
    }

    public async updateCell({
        sheetId,
        sheetName,
        row,
        column,
        value
    }: {
        sheetId: string
        sheetName: string
        row: number
        column: string
        value: string
    }): Promise<Result<void, GoogleSheetError>> {
        try {
            const sheets = await this.getGoogleSheetClient()
            const range = `${sheetName}!${column}${row}`

            this.logger.log(
                `Updating cell at range: ${range} with value: ${value}`
            )

            await sheets.spreadsheets.values.update({
                spreadsheetId: sheetId,
                range: range,
                valueInputOption: "RAW",
                requestBody: {
                    values: [[value]]
                }
            })

            return ok(undefined)
        } catch (error) {
            this.logger.error("Error updating cell in Google Sheets:", error)

            return err(new Error("Failed to update cell"))
        }
    }

    private handleGoogleSheetsError(error: unknown): CloudStorageError {
        if (typeof error === "object" && error !== null && "code" in error) {
            const { code, message } = error as { code: number; message: string }

            this.logger.error(`Google Sheets API error: ${message}`)

            if (code === 404) {
                return new NotFoundError("Google Sheet not found")
            }

            return new GoogleSheetAPIError(message, code)
        }

        this.logger.error("Unknown error occurred in Google Sheets API", error)

        return new GoogleSheetAPIError(
            "Unknown error occurred in Google Sheets",
            500
        )
    }
}
