import { Result } from "neverthrow"
import { GoogleSheetError } from "../error"

export interface IGoogleSheet extends IFetchData, IUpdateCell {}

interface IFetchData {
    fetchData(params: {
        sheetId: string
        sheetName: string
        row?: number
        columnStart?: string
        columnEnd?: string
    }): Promise<Result<string[][], GoogleSheetError>>
}

export interface IUpdateCell {
    updateCell(params: {
        sheetId: string
        sheetName: string
        row: number
        column: string
        value: string
    }): Promise<Result<void, GoogleSheetError>>
}
