export interface GetDocumentDetailsResponse {
  documentId: string;
  brandId: string;
  messageTitle: string;
  documentDescription: string;
  status: string;
  files: File[];
  senderDetail: SenderDetail;
  signerDetails: SignerDetail[];
  behalfOf: any;
  ccDetails: any[];
  reminderSettings: ReminderSettings;
  reassign: any[];
  documentHistory: DocumentHistory[];
  activityBy: string;
  activityDate: number;
  activityAction: string;
  createdDate: number;
  expiryDays: number;
  expiryDate: any;
  enableSigningOrder: boolean;
  isDeleted: boolean;
  revokeMessage: string;
  declineMessage: string;
  applicationId: string;
  labels: any[];
  disableEmails: boolean;
  disableExpiryAlert: boolean;
  hideDocumentId: boolean;
  enablePrintAndSign: boolean;
  enableReassign: boolean;
}

export interface File {
  documentName: string;
  order: number;
  pageCount: number;
}

export interface SenderDetail {
  name: string;
  privateMessage: any;
  emailAddress: string;
  isViewed: boolean;
}

export interface SignerDetail {
  signerName: string;
  signerRole: string;
  signerEmail: string;
  status: string;
  enableAccessCode: boolean;
  isAuthenticationFailed: any;
  enableEmailOTP: boolean;
  isDeliveryFailed: boolean;
  isViewed: boolean;
  order: number;
  signerType: string;
  hostEmail: string;
  hostName: string;
  isReassigned: boolean;
  privateMessage: string;
  formFields: FormField[];
  language: number;
}

export interface FormField {
  id: string;
  type: string;
  value: string;
  font: string;
  isRequired: boolean;
  isReadOnly: boolean;
  lineHeight: number;
  fontSize: number;
  fontColor: string;
  isUnderline: boolean;
  isItalic: boolean;
  isBold: boolean;
  groupName: string;
  placeholder: string;
  validationtype: string;
  validationCustomRegex: string;
  validationCustomRegexMessage: string;
  dateFormat: string;
  imageInfo: any;
  attachmentInfo: any;
  fileInfo: any;
  editableDateFieldSettings: any;
  conditionalLogic: any[];
  hyperlinkText: string;
  dropdownOptions: any[];
  bounds: Bounds;
  pageNumber: number;
  dataSyncTag: string;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ReminderSettings {
  enableAutoReminder: boolean;
  reminderDays: number;
  reminderCount: number;
}

export interface DocumentHistory {
  id: string;
  name: string;
  email: string;
  toName: string;
  toEmail: string;
  ipaddress: string;
  action: string;
  timestamp: number;
}
