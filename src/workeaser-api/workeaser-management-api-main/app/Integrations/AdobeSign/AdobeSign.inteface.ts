export interface AdobeSignAuthorization {
  Authorization: string;
}

export interface ParticipantSetsInfoInterface {
  memberInfos: MemberInfosInterface[];
  name: string;
  order: number;
  role: string;
}

export interface MemberInfosInterface {
  email: string;
}

export interface AgreementsInfoInterface {
  name: string;
  participantSetsInfo: ParticipantSetsInfoInterface[];
  signatureType: string;
  state: string;
}

export interface LocationInteface {
  height: number;
  left: number;
  pageNumber: number;
  top: number;
  width: number;
}

export interface CombinedDocumentInterface {
  url: string;
}
