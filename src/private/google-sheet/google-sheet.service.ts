import { Injectable, Logger } from "@nestjs/common"
import { Result, Ok, Err } from "pratica"
import { IGoogleSheet } from "./interface/IGoogleSheet"
import { GoogleSheetError } from "./error"
import { NotFoundError } from "src/error/not-found.error"
import { google } from "googleapis"

@Injectable()
export class GoogleSheetService implements IGoogleSheet {
    private readonly logger = new Logger(GoogleSheetService.name)

    private async getGoogleSheetClient() {
        const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY)

        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"]
        })

        return google.sheets({ version: "v4", auth })
    }

    public async fetchData(
        sheetId: string
    ): Promise<Result<string[][], GoogleSheetError>> {
        try {
            if (!process.env.GCP_SERVICE_ACCOUNT_KEY) {
                this.logger.error(
                    "Google Cloud Platform service account key not found"
                )

                return Err(new Error("Could not connect to Google Sheets"))
            }

            const sheets = await this.getGoogleSheetClient()
            this.logger.log(
                `Fetching data from Google Sheets with ID: ${sheetId}`
            )

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: sheetId,
                range: "Sheet1!A1:Z100"
            })

            if (!response || !response.data || !response.data.values) {
                this.logger.warn("No data found.")
                return Err(
                    new NotFoundError("No data found in the Google Sheet")
                )
            }

            const data = response.data.values

            this.logger.log(
                "Fetched Data Preview:",
                data.length > 5 ? data.slice(0, 5) : data
            )

            return Ok(data)
        } catch (error) {
            this.logger.error("Error fetching data from Google Sheets:", error)

            if (error.code === 404) {
                return Err(new NotFoundError("Google Sheet not found"))
            }

            return Err(new Error("Failed to fetch data from Google Sheets"))
        }
    }

    createData(
        sheetId: string,
        values: string[][]
    ): Promise<Result<void, GoogleSheetError>> {
        throw new Error("Method not implemented.")
    }

    updateData(
        sheetId: string,
        range: string,
        values: string[][]
    ): Promise<Result<void, GoogleSheetError>> {
        throw new Error("Method not implemented.")
    }

    deleteData(
        sheetId: string,
        range: string
    ): Promise<Result<void, GoogleSheetError>> {
        throw new Error("Method not implemented.")
    }
}
