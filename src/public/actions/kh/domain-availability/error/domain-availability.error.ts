export class DomainAvailabilityError extends Error {
    readonly type = "domain-availability"

    constructor(message: string) {
        super(message)
        this.name = "DomainAvailabilityError"
    }
}
