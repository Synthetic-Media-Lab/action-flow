import { z } from "zod"

const GoogleSheetBrandSelectionSchema = z
    .string()
    .min(1, "A Google Sheet brand selection is required")

export type GoogleSheetBrandSelection = z.infer<
    typeof GoogleSheetBrandSelectionSchema
>
