import { Result } from "pratica"

export interface IPuppeteerService {
    searchGoogle(searchTerm: string): Promise<Result<string[], Error>>
    testCheckPageContent(): Promise<Result<string, Error>>
}
