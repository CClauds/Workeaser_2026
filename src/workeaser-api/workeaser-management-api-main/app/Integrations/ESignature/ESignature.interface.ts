export default interface ESignatureInterface {
  sendEnvelope(envelopeArgs: EnvelopeArgsInterface): Promise<ESignatureResponseInterface>;
  makeEnvelope(args: EnvelopeArgsInterface): Promise<EnvelopeInterface>;
  getEnvelopePdf(envelopeId: string): Promise<Buffer>;
}

export interface ESignatureResponseInterface {
  envelopeId: string | undefined;
}

export interface EnvelopeInterface {
  status: string;
  emailSubject: string;
  documents: DocumentRequestInterface[];
  recipients: RecipientInterface;
  eventNotification?: any;
}

export interface DocumentRequestInterface {
  documentBase64: string;
  name: string;
  fileExtension: string;
  documentId: string;
}

export interface DocumentInterface {
  base64file: string;
  name: string;
  fileExtension: string;
  documentId: string;
}

export interface RecipientInterface {
  carbonCopies: CarbonCopyInterface[];
  signers: SignerInterface[];
}

export interface SignerInterface {
  email: string;
  name: string;
  recipientId: number;
  routingOrder: number;
  tabs: TabsInterface;
}

export interface TabsInterface {
  signHereTabs: SignHereInterface[];
  initialHereTabs: SignHereInterface[];
}

export interface SignHereInterface {
  anchorString?: string;
  anchorYOffset?: string;
  anchorXOffset?: string;
  anchorUnits?: string;
  xPosition?: string;
  yPosition?: string;
  documentId?: string;
  pageNumber?: string;
}

export interface CarbonCopyInterface {
  email: string;
  name: string;
  recipientId: number;
  routingOrder: number;
}

export interface EnvelopeArgsInterface {
  signers: SignerInterface[];
  cc: CarbonCopyInterface[];
  documents: DocumentInterface[];
  emailSubject: string;
}
