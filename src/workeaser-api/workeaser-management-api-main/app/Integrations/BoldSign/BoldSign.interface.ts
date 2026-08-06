export interface IlocationSign {
  height: number;
  left: number;
  pageNumber: number;
  top: number;
  width: number;
}

export interface BoldSigner {
  name: string;
  emailAddress: string;
  signerType: SignerType;
  formFields: FormField[];
  language: LanguageEnum;
  signerRole?: string;
  useTextTags?: boolean;
  privateMessage?: string;
}

export enum LanguageEnum {
  English = 1,
  Spanish = 2,
  German = 3,
  French = 4
}

type SignerType = 'Signer' | 'Reviewer' | 'InPersonSigner';

type FieldType =
  | 'Signature'
  | 'Initial'
  | 'CheckBox'
  | 'TextBox'
  | 'Label'
  | 'DateSigned'
  | 'RadioButton'
  | 'Image'
  | 'Attachment'
  | 'EditableDate'
  | 'Hyperlink'
  | 'Dropdown';

export interface FormField {
  id?: string;
  name?: string;
  fieldType: FieldType;
  pageNumber: number;
  bounds: Bounds;
  isRequired: boolean;
}
export type SignerRole = 'Client' | 'Manager';

export enum SignerRoleEnum {
  MANAGER = 'Manager',
  CLIENT = 'Client'
}
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
