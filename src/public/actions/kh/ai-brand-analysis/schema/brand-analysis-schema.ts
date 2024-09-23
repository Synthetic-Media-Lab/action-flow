import { z } from "zod"

export const brandAnalysisSchema = z.object({
    summary: z.object({
        riskLevel: z.enum(["Green", "Yellow", "Red"]),
        analysis: z.string()
    })
})
