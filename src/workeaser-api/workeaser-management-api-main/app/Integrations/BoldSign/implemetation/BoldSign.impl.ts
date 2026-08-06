import { rules, schema, validator } from '@ioc:Adonis/Core/Validator';
import Contract from 'App/Models/Contract';
import User from 'App/Models/User';
import AppError from 'App/Utils/AppError';
import FormData from 'form-data';
import pdfParse from 'pdf-parse';
import {
  BoldSigner,
  FormField,
  LanguageEnum,
  SignerRole,
  SignerRoleEnum
} from '../BoldSign.interface';
import { GetDocumentDetailsResponse } from '../interfaces/responses.interface';
import BoldSignAPI from './BoldSign.api';

export interface BSIdentityRequest {
  name: string;
  email: string;
}
export class BoldSign {
  private _contract?: Contract;

  constructor(contract?: Contract) {
    this._contract = contract;
  }

  async SendDocument(client: User, manager: User, contractFile: Buffer): Promise<string> {
    try {
      const pdfData = await pdfParse(contractFile);
      const totalPages = pdfData.numpages;

      const Signers: BoldSigner[] = ['Client', 'Manager'].map((signerRole: SignerRole) => ({
        name: signerRole === SignerRoleEnum.CLIENT ? client.fullName : manager.fullName,
        labels: [`contractId_${this._contract?.id}`],
        emailAddress: signerRole === SignerRoleEnum.CLIENT ? client.email : manager.email,
        signerType: 'Signer',
        language: LanguageEnum.English,
        signerRole: signerRole,
        formFields: [
          ...[...new Array(totalPages)].reduce((agg, _, index) => {
            if (index > 1 && index < totalPages) {
              agg.push(this._generateEveryPageInitials(signerRole, index, true));
            }
            return agg;
          }, []),
          this._generateLastPageSignature(signerRole, totalPages)
        ] as FormField[]
      }));

      const ClientSigner = JSON.stringify(Signers[0]);
      const ManagerSigner = JSON.stringify(Signers[1]);
      const form = new FormData();
      form.append('Title', `Contract ${this._contract?.coworkAccount?.name || 'Workeaser'}`);
      form.append('Message', 'Terms, purpose and duration of agreement.');
      form.append('OnBehalfOf', manager.email);
      form.append('Signers', ClientSigner);
      form.append('Signers', ManagerSigner);
      form.append('Files', contractFile, {
        filename: 'contract.pdf'
      });

      const response = await BoldSignAPI.post('/v1/document/send', form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.documentId;
    } catch (error) {
      if (error.response) {
        throw new AppError(error.response.status, error.response.data);
      }
      throw error;
    }
  }

  async getEmbeddedSignLink(signerEmail: string): Promise<string> {
    const response = await BoldSignAPI.get(
      `/v1/document/getEmbeddedSignLink?documentId=${this._contract?.envelopeId}&signerEmail=${signerEmail}`
    );

    return response.data.signLink;
  }

  async getDocumentDetails(envelopeId: string): Promise<GetDocumentDetailsResponse> {
    try {
      const response = await BoldSignAPI.get(`/v1/document/properties?documentId=${envelopeId}`);

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new AppError(error.response.status, error.response.data);
      }
      throw error;
    }
  }

  async getDocumentPDF() {
    try {
      const response = await BoldSignAPI.get(
        `/v1/document/download?documentId=${this._contract?.envelopeId}`
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new AppError(error.response.status, error.response.data);
      }
      throw error;
    }
  }

  async GetIdentityDetails(email: string) {
    try {
      const response = await BoldSignAPI.get(
        `/v1-beta/senderIdentities/list?Page=1&search=${email}`
      );
      return response.data.result[0];
    } catch (error) {
      if (error.response) {
        throw new AppError(error.response.status, error.response.data);
      }
      throw error;
    }
  }

  async CreateIdentity(identity: BSIdentityRequest) {
    try {
      await validator.validate({
        schema: schema.create({
          name: schema.string({ trim: true }, [rules.minLength(2)]),
          email: schema.string({ trim: true }, [rules.email()])
        }),
        data: identity
      });

      const response = await BoldSignAPI.post(`/v1-beta/senderIdentities/create`, {
        name: identity.name,
        email: identity.email
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new AppError(error.response.status, error.response.data);
      }
      throw error;
    }
  }

  async DeleteIdentity(email: string) {
    try {
      const response = await BoldSignAPI.delete(`/v1-beta/senderIdentities/delete`, {
        params: {
          email: email
        }
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new AppError(error.response.status, error.response.data);
      }
      throw error;
    }
  }

  async ResendIdentityRequest(email: string) {
    try {
      const response = await BoldSignAPI.post(`/v1-beta/senderIdentities/resendInvitation`, '', {
        params: {
          email
        }
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new AppError(error.response.status, error.response.data);
      }
      throw error;
    }
  }

  async ResendDeclinedIdentity(email: string) {
    try {
      const response = await BoldSignAPI.post(`/v1-beta/senderIdentities/rerequest`, '', {
        params: {
          email
        }
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new AppError(error.response.status, error.response.data);
      }
      throw error;
    }
  }

  private _generateEveryPageInitials(
    signerRole: SignerRole,
    pageNumber: number,
    isRequired: boolean = true
  ): FormField {
    return {
      id: `${signerRole.toLowerCase()}_${pageNumber}`,
      fieldType: 'Initial',
      pageNumber,
      bounds:
        signerRole === SignerRoleEnum.CLIENT
          ? {
              height: 23,
              width: 42.5,
              x: 58.5,
              y: 1041
            }
          : {
              height: 23,
              width: 42.5,
              x: 680.5,
              y: 1041
            },
      isRequired
    };
  }

  private _generateLastPageSignature(
    signerRole: SignerRole,
    lastPageNumber: number,
    isRequired: boolean = true
  ) {
    return {
      id: `${signerRole.toLowerCase()}_${lastPageNumber}`,
      fieldType: 'Signature',
      pageNumber: lastPageNumber,
      bounds:
        signerRole === SignerRoleEnum.CLIENT
          ? {
              height: 32,
              width: 124,
              x: 135.5,
              y: 302
            }
          : {
              height: 32,
              width: 124,
              x: 135.5,
              y: 181
            },
      isRequired
    };
  }
}
