import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { err, ok, Result } from "neverthrow"
import puppeteer from "puppeteer"
import {
    IPuppeteerService,
    ITakeScreenshotOptions
} from "./interface/puppeteer.interface"
import { formatErrorForLogging } from "src/shared/pure-utils/pure-utils"

@Injectable()
export class PuppeteerService implements IPuppeteerService {
    private readonly logger = new Logger(PuppeteerService.name)
    private readonly isLocal: boolean
    private readonly chromeExecutablePath: string | undefined
    private readonly screenshotsDir: string

    constructor(private readonly configService: ConfigService) {
        this.isLocal =
            this.configService.get<string>("NODE_ENV") !== "production"

        this.chromeExecutablePath = this.configService.get<string>(
            "CHROME_EXECUTABLE_PATH",
            "/usr/bin/google-chrome-stable"
        )

        this.screenshotsDir = this.isLocal
            ? "./screenshots"
            : "/usr/src/app/screenshots"
    }

    public async testCheckPageContent(): Promise<Result<string, Error>> {
        try {
            this.logger.debug("Launching Puppeteer to check page content...")
            const browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
                executablePath: this.isLocal
                    ? undefined
                    : this.chromeExecutablePath
            })

            const page = await browser.newPage()
            this.logger.debug("Navigating to Google homepage...")
            await page.goto("https://www.google.com", {
                timeout: 10000,
                waitUntil: "networkidle2"
            })

            const pageContent = await page.content()
            const visibleContent = pageContent.substring(0, 1000)

            await browser.close()
            return ok(`Page content: ${visibleContent}`)
        } catch (error) {
            const { message, stack } = formatErrorForLogging(error)

            this.logger.error(`Failed to access page: ${message}`, stack)

            return err(new Error("Failed to access page."))
        }
    }

    public async takeScreenshot(
        options: ITakeScreenshotOptions
    ): Promise<Result<string, Error>> {
        const { url, width = 1920, height = 1080 } = options

        try {
            this.logger.debug(
                `Launching Puppeteer to take a screenshot of: ${url} with dimensions ${width}x${height}`
            )

            const browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
                executablePath: this.isLocal
                    ? undefined
                    : this.chromeExecutablePath
            })

            const page = await browser.newPage()
            await page.setViewport({ width, height })

            this.logger.debug(`Navigating to ${url}...`)
            await page.goto(url, {
                timeout: 60000,
                waitUntil: "networkidle2"
            })

            const screenshotPath = `${this.screenshotsDir}/screenshot_${Date.now()}.png`

            await page.screenshot({ path: screenshotPath })

            this.logger.debug(`Screenshot saved at: ${screenshotPath}`)

            await browser.close()

            return ok(screenshotPath)
        } catch (error) {
            const { message, stack } = formatErrorForLogging(error)

            this.logger.error(`Failed to take screenshot: ${message}`, stack)

            return err(new Error("Failed to take screenshot"))
        }
    }

    private async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}
