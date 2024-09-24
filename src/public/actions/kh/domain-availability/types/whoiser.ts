export interface WhoisSearchResult {
    [key: string]: string | string[] | WhoisRecord | undefined
}

export interface WhoisRecord {
    "Domain Status"?: string[]
    "Name Server"?: string[]
    "Domain Name"?: string
    "Registry Domain ID"?: string
    "Registrar WHOIS Server"?: string
    "Registrar URL"?: string
    "Updated Date"?: string
    "Created Date"?: string
    "Expiry Date"?: string
    Registrar?: string
    "Registrar IANA ID"?: string
    DNSSEC?: string
    "Registrar Abuse Contact Email"?: string
    "Registrar Abuse Contact Phone"?: string
    text?: string[]
}

interface Whoiscomlaudecom extends WhoisRecord {
    "Registry Registrant ID"?: string
    "Registrant Name"?: string
    "Registrant Organization"?: string
    "Registrant Street"?: string
    "Registrant City"?: string
    "Registrant State/Province"?: string
    "Registrant Postal Code"?: string
    "Registrant Country"?: string
    "Registrant Phone"?: string
    "Registrant Phone Ext"?: string
    "Registrant Fax"?: string
    "Registrant Fax Ext"?: string
    "Registrant Email"?: string
    "Registry Admin ID"?: string
    "Admin Name"?: string
    "Admin Organization"?: string
    "Admin Street"?: string
    "Admin City"?: string
    "Admin State/Province"?: string
    "Admin Postal Code"?: string
    "Admin Country"?: string
    "Admin Phone"?: string
    "Admin Phone Ext"?: string
    "Admin Fax"?: string
    "Admin Fax Ext"?: string
    "Admin Email"?: string
    "Registry Tech ID"?: string
    "Tech Name"?: string
    "Tech Organization"?: string
    "Tech Street"?: string
    "Tech City"?: string
    "Tech State/Province"?: string
    "Tech Postal Code"?: string
    "Tech Country"?: string
    "Tech Phone"?: string
    "Tech Phone Ext"?: string
    "Tech Fax"?: string
    "Tech Fax Ext"?: string
    "Tech Email"?: string
}

interface Whoisverisigngrscom extends WhoisRecord {}
