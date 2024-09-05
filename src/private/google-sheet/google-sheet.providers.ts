import { GoogleSheetService } from "./google-sheet.service"

export const GOOGLE_SHEET_SERVICE_TOKEN = "GOOGLE_SHEET_SERVICE_TOKEN"

export const googleSheetServiceProvider = {
    provide: GOOGLE_SHEET_SERVICE_TOKEN,
    useClass: GoogleSheetService
}
