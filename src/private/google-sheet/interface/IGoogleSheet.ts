import { Result } from "pratica"
import { GoogleSheetError } from "../error"

export interface IGoogleSheet
    extends IFetchData,
        ICreateData,
        IUpdateData,
        IDeleteData {}

interface IFetchData {
    fetchData(sheetId: string): Promise<Result<string[][], GoogleSheetError>>
}

interface ICreateData {
    createData(
        sheetId: string,
        values: string[][]
    ): Promise<Result<void, GoogleSheetError>>
}

interface IUpdateData {
    updateData(
        sheetId: string,
        range: string,
        values: string[][]
    ): Promise<Result<void, GoogleSheetError>>
}

interface IDeleteData {
    deleteData(
        sheetId: string,
        range: string
    ): Promise<Result<void, GoogleSheetError>>
}
