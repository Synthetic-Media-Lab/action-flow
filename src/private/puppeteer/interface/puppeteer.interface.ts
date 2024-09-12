import { Result } from "pratica"
import { CheckTrademarkDto } from "../dto/puppeteer.dto"

export interface IPuppeteerService
    extends IPuppeteerCheckPageContent,
        IPuppeteerTakeScreenshot,
        IPuppeteerCheckTrademark {}

interface IPuppeteerCheckPageContent {
    testCheckPageContent(): Promise<Result<string, Error>>
}

interface IPuppeteerTakeScreenshot {
    takeScreenshot(
        options: ITakeScreenshotOptions
    ): Promise<Result<string, Error>>
}

export interface IPuppeteerCheckTrademark {
    checkTrademark(
        options: CheckTrademarkDto
    ): Promise<Result<TrademarkResult, Error>>
}

/* Entity Interfaces */

export interface CheckTrademarkOptions {
    brand: string // Brand name to check
    url?: string // Optional URL for checking, defaults to the WIPO brand database URL
}

export interface TrademarkResult {
    name: string // Trademark name being searched for
    classes: number[] // List of relevant trademark classes (e.g., 9, 35, etc.)
    matches: MatchResult[] // Detailed list of trademark matches
    status: string // Overall status of the trademark search
}

export interface MatchResult {
    name: string // Name of the matching trademark
    class: number // Class of the matching trademark
    similarityScore: number // Similarity score (0 to 1, where 1 is an exact match)
    status: string // Status of the matching trademark (e.g., registered, pending, etc.)
}

export interface DomainAvailability {
    domain: string
    available: boolean
    price?: number
}

export interface ITakeScreenshotOptions {
    url: string
    width?: number
    height?: number
}
