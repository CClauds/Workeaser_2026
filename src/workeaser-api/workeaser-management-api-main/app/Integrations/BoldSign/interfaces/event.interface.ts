export interface BoldsignEvent {
  event: Event;
  data: Data;
  document: Data;
}

export interface Data {
  object: string;
  documentId: string;
  messageTitle: string;
  documentDescription: string;
  status: string;
  senderDetail: SenderDetail;
  signerDetails: SignerDetail[];
  ccDetails: any[];
  onBehalfOf: null;
  createdDate: number;
  expiryDate: number;
  enableSigningOrder: boolean;
  disableEmails: boolean;
  revokeMessage: string;
  errorMessage: null;
  labels: any[];
  isCombinedAudit: boolean;
}

export interface SenderDetail {
  name: string;
  emailAddress: string;
}

export interface SignerDetail {
  signerName: string;
  signerRole: string;
  signerEmail: string;
  status: string;
  enableAccessCode: boolean;
  isAuthenticationFailed: null;
  enableEmailOTP: boolean;
  isDeliveryFailed: boolean;
  isViewed: boolean;
  order: number;
  signerType: string;
  isReassigned: boolean;
  reassignMessage: null;
  declineMessage: null;
}

export interface Event {
  id: string;
  created: number;
  eventType: string;
  clientId: null;
  environment: string;
}
