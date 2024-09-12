import { ValueProvider } from "@nestjs/common"

export const FETCH_TOKEN = "FETCH_TOKEN"

export const fetchProvider: ValueProvider<typeof fetch> = {
    provide: FETCH_TOKEN,
    useValue: fetch
}
