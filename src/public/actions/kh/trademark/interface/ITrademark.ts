import { Result } from "neverthrow"
import { TrademarkError } from "../error/trademark.error"
import { CheckTrademarkDto } from "../dto/trademark.dto"
import { OAuthToken } from "src/private/oauth2/interface/oauth2.interface"
import { CloudMetadataFile } from "src/private/cloud-storage/types/cloud-fIle-types"
import {
    IEuipoTrademark,
    IEuipoTrademarksResult
} from "./IEuipoTrademarksResult"
import { CloudStorageError } from "src/private/cloud-storage/error"

/* Note: WIPO does not have an API, and does not allow webcrawling. Leaving the method commented out for now. */

export interface ITrademark
    extends /* ICheckWipoTrademark, */ ICheckEuipoTrademark,
        IUploadEuipoResultToCloudStorage {}

/* interface ICheckWipoTrademark {
    checkWipo(data: CheckTrademarkDto): Promise<Result<TrademarkResult, TrademarkError>>
} */

interface ICheckEuipoTrademark {
    checkEuipo(
        data: CheckTrademarkDto
    ): Promise<Result<IEuipoTrademarksResult<IEuipoTrademark>, TrademarkError>>
}

interface IUploadEuipoResultToCloudStorage {
    uploadEuipoResultToCloudStorage(
        euipoTrademarksResult: IEuipoTrademarksResult<IEuipoTrademark>,
        googleSheetBrandSelection: string
    ): Promise<Result<CloudMetadataFile, CloudStorageError>>
}

export enum EuipoTrademarkStatus {
    RECEIVED = "RECEIVED",
    UNDER_EXAMINATION = "UNDER_EXAMINATION",
    APPLICATION_PUBLISHED = "APPLICATION_PUBLISHED",
    REGISTRATION_PENDING = "REGISTRATION_PENDING",
    REGISTERED = "REGISTERED",
    WITHDRAWN = "WITHDRAWN",
    REFUSED = "REFUSED",
    OPPOSITION_PENDING = "OPPOSITION_PENDING",
    APPEALED = "APPEALED",
    CANCELLATION_PENDING = "CANCELLATION_PENDING",
    CANCELLED = "CANCELLED",
    SURRENDERED = "SURRENDERED",
    EXPIRED = "EXPIRED",
    APPEALABLE = "APPEALABLE",
    START_OF_OPPOSITION_PERIOD = "START_OF_OPPOSITION_PERIOD",
    ACCEPTANCE_PENDING = "ACCEPTANCE_PENDING",
    ACCEPTED = "ACCEPTED",
    REMOVED_FROM_REGISTER = "REMOVED_FROM_REGISTER"
}

export enum EuipoTrademarkSearchStrategy {
    EXACT = "EXACT",
    FUZZY = "FUZZY"
}

export interface EuipoOAuthTokenResponse extends OAuthToken {
    id_token?: string
    refresh_token?: string
    token_type: string
    scope: string
}
