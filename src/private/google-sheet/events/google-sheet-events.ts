export class GoogleSheetUpdateEvent {
    constructor(
        public readonly sheetId: string,
        public readonly sheetName: string,
        public readonly row: number,
        public readonly column: string,
        public readonly value: string
    ) {}
}
