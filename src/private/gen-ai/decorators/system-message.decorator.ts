import { SetMetadata } from "@nestjs/common"

export const SystemMessage = (message: string) =>
    SetMetadata("systemMessage", message)
