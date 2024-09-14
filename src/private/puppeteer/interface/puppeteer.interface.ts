import { Result } from "pratica"

export interface IPuppeteerService
    extends IPuppeteerCheckPageContent,
        IPuppeteerTakeScreenshot {}

interface IPuppeteerCheckPageContent {
    testCheckPageContent(): Promise<Result<string, Error>>
}

interface IPuppeteerTakeScreenshot {
    takeScreenshot(
        options: ITakeScreenshotOptions
    ): Promise<Result<string, Error>>
}

/* Entity Interfaces */

export interface ITakeScreenshotOptions {
    url: string
    width?: number
    height?: number
}
