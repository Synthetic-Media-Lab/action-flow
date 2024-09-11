import { Result } from "pratica"

export interface IPuppeteerService
    extends IPuppeteerSearchGoogle,
        IPuppeteerCheckPageContent {}

interface IPuppeteerSearchGoogle {
    searchGoogle(searchTerm: string): Promise<Result<string[], Error>>
}

interface IPuppeteerCheckPageContent {
    testCheckPageContent(): Promise<Result<string, Error>>
}
