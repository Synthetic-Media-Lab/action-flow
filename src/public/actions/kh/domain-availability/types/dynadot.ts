export interface DynadotSearchResponse {
    Results: {
        SearchResponse: {
            SearchHeader: {
                SuccessCode: string
                DomainName: string
                Available: "yes" | "no"
                Price?: string
            }
        }
    }
}
