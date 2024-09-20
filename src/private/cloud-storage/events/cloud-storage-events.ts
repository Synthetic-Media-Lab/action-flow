export class FileUploadEvent {
    constructor(
        public readonly fileContent: string,
        public readonly destination: string
    ) {}
}
