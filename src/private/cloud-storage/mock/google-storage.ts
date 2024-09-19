import { Readable } from "stream"

export const mockFileMetadata = {
    id: "mocked-id",
    name: "mocked-name",
    contentType: "text/plain",
    size: "mocked-size",
    mediaLink: "mocked-mediaLink",
    bucket: "mocked-bucket",
    path: "mocked-bucket",
    timeCreated: "2022-01-01T00:00:00Z"
}

export const mockDirectoryMetadata = {
    id: "mocked-id",
    name: "mocked-name/",
    contentType: "text/plain",
    size: "0",
    mediaLink: "mocked-mediaLink",
    bucket: "mocked-bucket",
    path: "mocked-bucket/",
    timeCreated: "2022-01-01T00:00:00Z"
}

export const mockFileMetadataBeforeDate = {
    ...mockFileMetadata,
    name: "test-folder/old-file.txt",
    timeCreated: "2022-01-01T00:00:00Z"
}

export const mockFileMetadataAfterDate = {
    ...mockFileMetadata,
    name: "test-folder/new-file.txt",
    timeCreated: "2023-01-01T00:00:00Z"
}

export const mockFileReadStream = () => {
    const readable = new Readable()
    readable.push("hello")
    readable.push("world")
    readable.push(null)

    return readable
}
