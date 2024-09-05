import {
    Controller,
    Get,
    Param,
    HttpException,
    HttpStatus,
    Inject,
    Logger
} from "@nestjs/common"
import { GOOGLE_SHEET_SERVICE_TOKEN } from "./google-sheet.providers"
import { IGoogleSheet } from "./interface/IGoogleSheet"

@Controller("google-sheet")
export class GoogleSheetController {
    private readonly logger = new Logger(GoogleSheetController.name)

    constructor(
        @Inject(GOOGLE_SHEET_SERVICE_TOKEN)
        private readonly googleSheetService: IGoogleSheet
    ) {}

    @Get("fetch/:sheetId")
    async fetchData(@Param("sheetId") sheetId: string): Promise<string[][]> {
        this.logger.log(`Received request to fetch data from sheet: ${sheetId}`)

        const result = await this.googleSheetService.fetchData(sheetId)

        return result.cata({
            Ok: data => data,
            Err: error => {
                this.logger.error(
                    `Error fetching data from Google Sheet: ${error.message}`
                )
                throw new HttpException(
                    {
                        status: HttpStatus.INTERNAL_SERVER_ERROR,
                        error: error.message
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR
                )
            }
        })
    }
}
