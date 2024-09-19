export class CloudMetadataFile {
    private constructor(
        readonly id: string = "",
        readonly name: string = "",
        readonly contentType: string = "",
        readonly size: string = "",
        readonly mediaLink: string = "",
        readonly publicLink: string = "",
        readonly path: string = "",
        readonly createdDate: string = ""
    ) {}

    static create(data: Partial<CloudMetadataFile>): CloudMetadataFile {
        return new CloudMetadataFile(
            data.id || "",
            data.name || "",
            data.contentType || "",
            data.size || "",
            data.mediaLink || "",
            data.publicLink || "",
            data.path || "",
            data.createdDate || ""
        )
    }
}

export class CloudDataFile {
    private constructor(
        readonly id: string = "",
        readonly name: string = "",
        readonly contentType: string = "",
        readonly size: string = "",
        readonly mediaLink: string = "",
        readonly publicLink: string = "",
        readonly path: string = "",
        readonly data: string = ""
    ) {}

    static create(data: Partial<CloudDataFile>): CloudDataFile {
        return new CloudDataFile(
            data.id || "",
            data.name || "",
            data.contentType || "",
            data.size || "",
            data.mediaLink || "",
            data.publicLink || "",
            data.path || "",
            data.data || ""
        )
    }
}
