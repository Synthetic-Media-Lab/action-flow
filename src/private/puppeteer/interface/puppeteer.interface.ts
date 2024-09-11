import { Result } from "pratica"

export interface IPuppeteerService
    extends IPuppeteerSearchGoogle,
        IPuppeteerCheckPageContent,
        IPuppeteerTakeScreenshot {}

interface IPuppeteerCheckPageContent {
    testCheckPageContent(): Promise<Result<string, Error>>
}

interface IPuppeteerSearchGoogle {
    searchGoogle(searchTerm: string): Promise<Result<string[], Error>>
}

interface IPuppeteerTakeScreenshot {
    takeScreenshot(
        options: ITakeScreenshotOptions
    ): Promise<Result<string, Error>>
}

export interface ITakeScreenshotOptions {
    url: string
    width?: number // Optional width for the screenshot (default: 1920)
    height?: number // Optional height for the screenshot (default: 1080)
}
