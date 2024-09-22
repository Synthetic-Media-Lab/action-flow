import { z, ZodError } from "zod"

export const CloudMetadataSchema = z.object({
    id: z.string().min(1, "ID must be a non-empty string"),
    name: z.string().min(1, "Name must be a non-empty string"),
    contentType: z.string().min(1, "Content Type must be a non-empty string"),
    size: z.string().min(1, "Size must be a non-empty string"),
    mediaLink: z.string().min(1, "Media Link must be a non-empty string"),
    publicLink: z.string().optional(),
    path: z.string().min(1, "Path must be a non-empty string"),
    createdDate: z.string().min(1, "Created Date must be a non-empty string")
})

export class CloudMetadataFile {
    private constructor(
        readonly id: string = "",
        readonly name: string = "",
        readonly contentType: string = "",
        readonly size: string = "",
        readonly mediaLink: string = "",
        readonly publicLink?: string,
        readonly path: string = "",
        readonly createdDate: string = ""
    ) {}

    static create(data: {
        id: string
        name: string
        contentType: string
        size: string
        mediaLink: string
        publicLink?: string
        path: string
        createdDate: string
    }): CloudMetadataFile | ZodError {
        const result = CloudMetadataSchema.safeParse({
            ...data,
            contentType: data.contentType || "application/octet-stream",
            size: data.size || "0",
            createdDate: data.createdDate || ""
        })

        if (!result.success) {
            return result.error
        }

        const {
            id,
            name,
            contentType,
            size,
            mediaLink,
            publicLink,
            path,
            createdDate
        } = result.data

        return new CloudMetadataFile(
            id,
            name,
            contentType,
            size,
            mediaLink,
            publicLink,
            path,
            createdDate
        )
    }
}

export const CloudDataSchema = z.object({
    id: z.string().min(1, "ID must be a non-empty string"),
    name: z.string().min(1, "Name must be a non-empty string"),
    contentType: z.string().min(1, "Content Type must be a non-empty string"),
    size: z.string().min(1, "Size must be a non-empty string"),
    mediaLink: z.string().min(1, "Media Link must be a non-empty string"),
    publicLink: z.string().optional(),
    path: z.string().min(1, "Path must be a non-empty string"),
    data: z.string().min(1, "Data must be a non-empty string")
})

export class CloudDataFile {
    private constructor(
        readonly id: string = "",
        readonly name: string = "",
        readonly contentType: string = "",
        readonly size: string = "",
        readonly mediaLink: string = "",
        readonly publicLink?: string,
        readonly path: string = "",
        readonly data: string = ""
    ) {}

    static create(data: {
        id: string
        name: string
        contentType: string
        size: string
        mediaLink: string
        publicLink?: string
        path: string
        data: string
    }): CloudDataFile | ZodError {
        const result = CloudDataSchema.safeParse({
            ...data,
            contentType: data.contentType || "application/octet-stream",
            size: data.size || "0"
        })

        if (!result.success) {
            return result.error
        }

        const {
            id,
            name,
            contentType,
            size,
            mediaLink,
            publicLink,
            path,
            data: fileData
        } = result.data

        return new CloudDataFile(
            id,
            name,
            contentType,
            size,
            mediaLink,
            publicLink,
            path,
            fileData
        )
    }
}
