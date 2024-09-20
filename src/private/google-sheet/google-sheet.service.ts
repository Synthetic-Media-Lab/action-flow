import { Injectable, Logger } from "@nestjs/common"
import { Result, ok, err } from "neverthrow"
import { IGoogleSheet } from "./interface/IGoogleSheet"
import { GoogleSheetError } from "./error"
import { NotFoundError } from "src/error/not-found.error"
import { google } from "googleapis"
import { ConfigService } from "@nestjs/config"
import { OnEvent } from "@nestjs/event-emitter"

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

    public async fetchData(
        sheetId: string,
        sheetName: string,
        row?: number,
        columnStart?: string,
        columnEnd?: string
    ): Promise<Result<string[][], GoogleSheetError>> {
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
            this.logger.error("Error fetching data from Google Sheets:", error)

            if (error.code === 404) {
                return err(new NotFoundError("Google Sheet not found"))
            }

            return err(new Error("Failed to fetch data from Google Sheets"))
        }
    }

    public async updateCell(
        sheetId: string,
        sheetName: string,
        row: number,
        column: string,
        value: string
    ): Promise<Result<void, GoogleSheetError>> {
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

    @OnEvent("file.upload.completed")
    async handleGoogleSheetUpdate(event: {
        sheetId: string
        sheetName: string
        row: number
        column: string
        value: string
    }) {
        this.logger.log(
            `Updating Google Sheet: ${event.sheetId}, Row: ${event.row}, Column: ${event.column}`
        )

        const updateResult = await this.updateCell(
            event.sheetId,
            event.sheetName,
            event.row,
            event.column,
            event.value
        )

        updateResult.match(
            () => this.logger.log("Google Sheet updated successfully"),
            error =>
                this.logger.error(
                    `Failed to update Google Sheet: ${error.message}`
                )
        )
    }
}
