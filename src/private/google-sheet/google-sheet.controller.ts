import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Inject,
    Logger,
    Post,
    Query,
    UsePipes,
    ValidationPipe
} from "@nestjs/common"
import { GOOGLE_SHEET_SERVICE_TOKEN } from "./google-sheet.providers"
import { IGoogleSheet } from "./interface/IGoogleSheet"
import { UpdateCellDto } from "./dto/update-cell.input"
import { identity } from "rxjs"

/* Please note: since this is a private module, this controller is only used during development. */

@Controller("google-sheet")
export class GoogleSheetController {
    private readonly logger = new Logger(GoogleSheetController.name)

    constructor(
        @Inject(GOOGLE_SHEET_SERVICE_TOKEN)
        private readonly googleSheetService: IGoogleSheet
    ) {}

    @Get("fetch")
    @UsePipes(new ValidationPipe())
    async fetchData(
        @Query("sheetId") sheetId: string,
        @Query("sheetName") sheetName: string,
        @Query("row") row?: number,
        @Query("columnStart") columnStart?: string,
        @Query("columnEnd") columnEnd?: string
    ): Promise<string[][]> {
        this.logger.log(
            `Fetching data from Google Sheet with the following parameters: 
            sheetId: ${sheetId}, 
            sheetName: ${sheetName}, 
            row: ${row}, 
            columnStart: ${columnStart}, 
            columnEnd: ${columnEnd}`
        )

        const result = await this.googleSheetService.fetchData({
            sheetId,
            sheetName,
            row,
            columnStart,
            columnEnd
        })

        return result.match(identity, error => {
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
        })
    }

    @Post("update")
    @UsePipes(new ValidationPipe())
    async updateCell(@Body() updateCellDto: UpdateCellDto): Promise<string> {
        const { sheetId, sheetName, row, column, value } = updateCellDto
        this.logger.log(
            `Updating cell in Google Sheet with the following parameters: 
        sheetId: ${sheetId}, 
        sheetName: ${sheetName}, 
        row: ${row}, 
        column: ${column}, 
        value: ${value}`
        )

        const result = await this.googleSheetService.updateCell({
            sheetId,
            sheetName,
            row,
            column,
            value
        })

        return result.match(
            () => {
                this.logger.log("Cell updated successfully")
                return "Cell updated successfully"
            },
            error => {
                this.logger.error(
                    `Error updating cell in Google Sheet: ${error.message}`
                )
                throw new HttpException(
                    {
                        status: HttpStatus.INTERNAL_SERVER_ERROR,
                        error: error.message
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR
                )
            }
        )
    }
}
