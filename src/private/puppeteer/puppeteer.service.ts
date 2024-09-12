import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Err, Ok, Result } from "pratica"
import puppeteer, { ElementHandle, Page } from "puppeteer"
import { CheckTrademarkDto } from "./dto/puppeteer.dto"
import {
    IPuppeteerService,
    ITakeScreenshotOptions,
    TrademarkResult
} from "./interface/puppeteer.interface"

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
            return Ok(`Page content: ${visibleContent}`)
        } catch (error) {
            this.logger.error(
                `Failed to access page: ${error.message}`,
                error.stack
            )
            return Err(new Error("Failed to access page."))
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

            return Ok(screenshotPath)
        } catch (error) {
            this.logger.error(
                `Failed to take screenshot: ${error.message}`,
                error.stack
            )
            return Err(new Error("Failed to take screenshot"))
        }
    }

    public async checkTrademark(
        options: CheckTrademarkDto
    ): Promise<Result<TrademarkResult, Error>> {
        try {
            const {
                brand,
                url,
                searchStrategy = "embedded",
                width = 1920,
                height = 1080,
                industryClasses = []
            } = options

            this.logger.debug(
                `Launching Puppeteer to check trademark: ${brand} with search strategy: ${searchStrategy} at ${url || "default WIPO URL"}`
            )

            const browser = await puppeteer.launch({
                headless: !this.isLocal,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    `--window-size=${width},${height}`
                ],
                executablePath: this.isLocal
                    ? undefined
                    : this.chromeExecutablePath
            })

            const page = await browser.newPage()

            await page.setViewport({ width, height })

            await page.goto(url || "https://branddb.wipo.int/en/", {
                waitUntil: "networkidle2",
                timeout: 60000
            })

            const brandInputResult = await this.enterBrandName(page, brand)
            const brandInputHandled = brandInputResult.cata({
                Ok: () => null,
                Err: err => Err(err)
            })
            if (brandInputHandled) return brandInputHandled

            const searchSelectResult = await this.selectSearchStrategy(
                page,
                searchStrategy
            )
            const searchSelectHandled = searchSelectResult.cata({
                Ok: () => null,
                Err: err => Err(err)
            })
            if (searchSelectHandled) return searchSelectHandled

            const industryClassesResult = await this.enterIndustryClasses(
                page,
                industryClasses
            )
            const industryClassesHandled = industryClassesResult.cata({
                Ok: () => null,
                Err: err => Err(err)
            })
            if (industryClassesHandled) return industryClassesHandled

            await this.submitSearch(page)

            await page.waitForNavigation({ waitUntil: "networkidle2" })

            await this.inspectDataOnPage(page)

            this.logger.debug("Search page content loaded.")

            /* if (this.isLocal) {
                this.logger.log("Press Enter to continue...")
                await new Promise(resolve =>
                    process.stdin.once("data", resolve)
                )
            } */

            await browser.close()

            const mockResult: TrademarkResult = {
                name: brand,
                classes: [9, 35],
                matches: [
                    {
                        name: "Nike",
                        class: 9,
                        similarityScore: 0.95,
                        status: "registered"
                    }
                ],
                status: "Search performed"
            }

            return Ok(mockResult)
        } catch (error) {
            this.logger.error(
                `Error during Puppeteer execution: ${error.message}`,
                error.stack
            )
            return Err(new Error("Failed to perform trademark check."))
        }
    }

    private async inspectDataOnPage(page: Page): Promise<Result<void, Error>> {
        try {
            this.logger.debug(
                "Inspecting trademark search results on the page..."
            )

            // Use the incremental scrolling method
            const scrollResult = await this.scrollAndLoadData(page)
            if (scrollResult.isErr()) {
                this.logger.error("Failed to scroll and load all items.")
                return scrollResult
            }

            // Wait briefly to ensure everything is loaded
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Evaluate the page content and extract the necessary data
            const data = await page.evaluate(() => {
                const listItems = Array.from(
                    document.querySelectorAll("ul.results.gridView li")
                )

                return listItems.map((item, index) => {
                    const brandName =
                        item.querySelector(".brandName")?.textContent?.trim() ||
                        "N/A"
                    const owner =
                        item
                            .querySelector(".owner .value")
                            ?.textContent?.trim() || "N/A"
                    const status =
                        item
                            .querySelector(".status .value")
                            ?.textContent?.trim() || "N/A"
                    const country =
                        item
                            .querySelector(".designation .value")
                            ?.textContent?.trim() || "N/A"
                    const classNumber =
                        item
                            .querySelector(".class .value")
                            ?.textContent?.trim() || "N/A"
                    const registrationNumber =
                        item
                            .querySelector(".number .value")
                            ?.textContent?.trim() || "N/A"

                    return {
                        index,
                        brandName,
                        owner,
                        status,
                        country,
                        classNumber,
                        registrationNumber
                    }
                })
            })

            // Log the data extracted from the page
            this.logger.debug(
                `Extracted Data: ${JSON.stringify(data, null, 2)}`
            )

            // Filter out items with missing data
            const missingDataItems = data.filter(
                item => item.brandName === "N/A" && item.owner === "N/A"
            )
            if (missingDataItems.length > 0) {
                this.logger.warn(
                    `Items with missing data: ${missingDataItems.length}`
                )
            }

            return Ok(undefined)
        } catch (error) {
            this.logger.error(
                `Error inspecting trademark search results: ${error.message}`
            )
            return Err(new Error("Failed to inspect trademark search results."))
        }
    }

    private async scrollAndLoadData(page: Page): Promise<Result<void, Error>> {
        try {
            this.logger.debug("Initiating scroll to load more results...")

            let lastItemsLoaded = 0
            let itemsLoaded = 0
            let scrollAttempts = 0
            let scrollPosition = 100 // Start by scrolling 100px

            while (scrollAttempts < 20) {
                // Limit scroll attempts to avoid infinite loop
                // Scroll down the 'mainGrid noflex column' container by increasing increments
                await page.evaluate(scrollPosition => {
                    const container = document.querySelector(
                        "div.mainGrid.noflex.column"
                    )
                    if (container) {
                        container.scrollBy(0, scrollPosition) // Scroll down by incrementally increasing px
                    }
                }, scrollPosition)

                // Add a delay to give more time for content to load
                await this.delay(1500) // 1.5-second delay for content loading

                // Check how many items are loaded now
                itemsLoaded = await page.evaluate(() => {
                    return document.querySelectorAll("ul.results.gridView li")
                        .length
                })

                this.logger.debug(
                    `Scroll attempt ${scrollAttempts}: Items loaded: ${itemsLoaded}`
                )

                // Break if no new items were loaded
                if (itemsLoaded === lastItemsLoaded) {
                    this.logger.debug(
                        `No new items loaded after scroll attempt ${scrollAttempts}. Stopping scroll.`
                    )
                    break
                }

                // Update the last loaded item count for the next iteration
                lastItemsLoaded = itemsLoaded

                // Increment the scroll position for the next attempt
                scrollPosition += 100

                scrollAttempts++
            }

            this.logger.debug(
                `Finished scrolling, total items loaded: ${itemsLoaded}`
            )
            return Ok(undefined)
        } catch (error) {
            this.logger.error(
                `Error while scrolling and loading data: ${error.message}`
            )
            return Err(new Error("Failed to scroll and load additional data."))
        }
    }

    private async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    private async enterBrandName(
        page: Page,
        brand: string
    ): Promise<Result<void, Error>> {
        try {
            this.logger.debug("Navigating to the brand input field...")

            const brandInput = await page.waitForSelector(
                "input.b-input__text-input",
                { visible: true }
            )

            if (!brandInput) {
                this.logger.error("Failed to find brand input field.")
                return Err(new Error("Failed to find brand input field."))
            }

            this.logger.debug("Brand name input found. Entering brand name...")
            await brandInput.type(brand)

            const brandInputValueResult = await this.getElementValue(brandInput)
            this.logger.debug(
                `Brand input value: ${brandInputValueResult.cata({
                    Ok: value => value,
                    Err: err => err.message
                })}`
            )

            return Ok(undefined)
        } catch (error) {
            this.logger.error(`Error entering brand name: ${error.message}`)
            return Err(new Error("Failed to enter brand name."))
        }
    }

    private async selectSearchStrategy(
        page: Page,
        searchStrategy: string
    ): Promise<Result<void, Error>> {
        try {
            this.logger.debug(
                `Selecting search strategy (${searchStrategy})...`
            )

            const searchSelect = await page.waitForSelector(
                "select.b-input__dropdown-input",
                { visible: true }
            )

            if (!searchSelect) {
                this.logger.error("Search strategy dropdown not found.")
                return Err(
                    new Error("Failed to find search strategy dropdown.")
                )
            }

            await page.evaluate(searchStrategy => {
                const selectElement = document.querySelector(
                    "select.b-input__dropdown-input"
                ) as HTMLSelectElement
                const options = Array.from(selectElement.options)
                const option = options.find(opt =>
                    opt.textContent
                        ?.trim()
                        .toLowerCase()
                        .includes(searchStrategy.toLowerCase())
                )
                if (option) {
                    option.selected = true
                    selectElement.dispatchEvent(new Event("change"))
                }
            }, searchStrategy)

            const searchSelectValueResult = await page.evaluate(() => {
                const selectElement = document.querySelector(
                    "select.b-input__dropdown-input"
                ) as HTMLSelectElement
                return selectElement.options[
                    selectElement.selectedIndex
                ].textContent?.trim()
            })

            this.logger.debug(
                `Search strategy selected: ${searchSelectValueResult}`
            )

            return Ok(undefined)
        } catch (error) {
            this.logger.error(
                `Error selecting search strategy: ${error.message}`
            )
            return Err(new Error("Failed to select search strategy."))
        }
    }

    private async enterIndustryClasses(
        page: Page,
        industryClasses: number[]
    ): Promise<Result<void, Error>> {
        try {
            this.logger.debug(
                "Navigating to the industry classes input field..."
            )

            // Ensure there is at least one industry class to enter
            if (!industryClasses || industryClasses.length === 0) {
                this.logger.debug("No industry classes provided.")
                return Ok(undefined)
            }

            // Select the industry class input using the 'suggest-multiselect' and the 'Nice classification' label
            const industryClassInput = await page.$(
                'suggest-multiselect[what="niceClass"] input[type="text"]'
            )

            if (!industryClassInput) {
                this.logger.error(
                    "Failed to find industry classes input field."
                )
                return Err(
                    new Error("Failed to find industry classes input field.")
                )
            }

            for (const classToEnter of industryClasses) {
                const result = await this.enterSingleIndustryClass(
                    page,
                    industryClassInput,
                    classToEnter
                )

                if (result.isErr()) {
                    return result // Return the error if any industry class fails to be entered
                }

                // Wait for the suggestion list to disappear after the selection
                await page.waitForFunction(() => {
                    const suggestionList =
                        document.querySelector("ul.suggestionList")
                    return (
                        !suggestionList || suggestionList.children.length === 0
                    )
                })
            }

            return Ok(undefined)
        } catch (error) {
            this.logger.error(
                `Error entering industry classes: ${error.message}`
            )
            return Err(new Error("Failed to enter industry classes."))
        }
    }

    private async enterSingleIndustryClass(
        page: Page,
        industryClassInput: ElementHandle<Element>,
        classToEnter: number
    ): Promise<Result<void, Error>> {
        try {
            this.logger.debug(`Entering industry class: ${classToEnter}`)

            // Focus the input before typing
            await industryClassInput.focus()

            // Type the industry class number
            await industryClassInput.type(classToEnter.toString())

            // Wait for the suggestion dropdown to appear
            await page.waitForSelector("ul.suggestionList li", {
                visible: true
            })

            // Use page.evaluate to find and click the matching suggestion
            const clicked = await page.evaluate(classToEnter => {
                const suggestions = Array.from(
                    document.querySelectorAll("ul.suggestionList li")
                )

                // Logic for extracting the class number from <em> tags within the suggestion
                const getClassNumberFromSuggestionPopup = (
                    liElement: Element
                ): string => {
                    const emTags = Array.from(liElement.querySelectorAll("em"))
                    return emTags.map(em => em.textContent?.trim()).join("")
                }

                // Find the matching suggestion
                const matchingSuggestion = suggestions.find(suggestion => {
                    const classNumber =
                        getClassNumberFromSuggestionPopup(suggestion)
                    return classNumber === classToEnter.toString() // Exact match
                })

                if (matchingSuggestion) {
                    ;(matchingSuggestion as HTMLElement).click() // Click the <li> element
                    return true
                }
                return false // Return false if no matching suggestion was found
            }, classToEnter)

            // Ensure we clicked a suggestion
            if (!clicked) {
                this.logger.error(
                    `Failed to find and click the suggestion for class: ${classToEnter}`
                )
                return Err(
                    new Error(
                        `Failed to find and click the suggestion for class: ${classToEnter}`
                    )
                )
            }

            return Ok(undefined)
        } catch (error) {
            this.logger.error(`Error entering industry class: ${error.message}`)
            return Err(
                new Error(`Failed to enter industry class: ${classToEnter}`)
            )
        }
    }

    private async submitSearch(page: Page): Promise<void> {
        this.logger.debug("Submitting the search...")
        await page.click("button.search")
    }

    private async getElementValue<
        T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >(element: ElementHandle<T>): Promise<Result<string, Error>> {
        try {
            const value = await element.evaluate(el => {
                if (
                    el instanceof HTMLInputElement ||
                    el instanceof HTMLTextAreaElement
                ) {
                    return el.value
                } else if (el instanceof HTMLSelectElement) {
                    return el.options[el.selectedIndex]?.value || ""
                }
                return ""
            })

            return Ok(value)
        } catch (error) {
            this.logger.error(`Error fetching element value: ${error.message}`)
            return Err(new Error("Failed to get element value"))
        }
    }
}
