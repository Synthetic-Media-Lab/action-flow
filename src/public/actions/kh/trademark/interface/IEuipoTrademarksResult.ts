export interface IEuipoTrademarksResult<T = unknown> {
    trademarks: T[]
    totalElements: number
    totalPages: number
    size: number
    page: number
}

export interface IEuipoTrademark {
    applicationNumber: string
    applicantReference: string
    markKind: string
    markFeature: string
    markBasis: string
    niceClasses: number[]
    wordMarkSpecification: WordMarkSpecification
    applicants: Applicant[]
    representatives: Applicant[]
    applicationDate: string
    status: string
    registrationDate?: string
    expiryDate?: string
}

interface Applicant {
    office: string
    identifier: string
    name: string
}

interface WordMarkSpecification {
    verbalElement: string
}
