import { Result } from "pratica"
import { GoogleSheetError } from "../error"

export interface IGoogleSheet extends IFetchData {}

interface IFetchData {
    fetchData(
        sheetId: string,
        sheetName: string,
        row?: number,
        columnStart?: string,
        columnEnd?: string
    ): Promise<Result<string[][], GoogleSheetError>>
}
