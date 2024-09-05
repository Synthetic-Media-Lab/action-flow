export class ActionAError extends Error {
    readonly type = "action-a"

    constructor(message: string) {
        super(message)
        this.name = "ActionAError"
    }
}
