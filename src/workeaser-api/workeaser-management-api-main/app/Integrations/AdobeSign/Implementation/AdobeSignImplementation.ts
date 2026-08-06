import {
  CombinedDocumentInterface,
  LocationInteface,
  ParticipantSetsInfoInterface
} from '../AdobeSign.inteface';
import AdobeSignApi from './AdobeSignApi';
const FormData = require('form-data');

export default class AdobeSignImplementation {
  static async SendContract(
    data: any,
    participantSetsInfo: ParticipantSetsInfoInterface[],
    locationClient: LocationInteface[],
    locationCowork: LocationInteface[]
  ) {
    try {
      const form = new FormData();
      form.append('File', data);
      form.append('File-Name', 'contract.pdf');
      const resUpload = await AdobeSignApi.post('transientDocuments', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Cache-Control': 'no-cache, no-store'
        }
      });

      const resSendContract = await AdobeSignApi.post('agreements', {
        fileInfos: [
          {
            transientDocumentId: `${resUpload.data.transientDocumentId}`
          }
        ],
        name: 'Contract Workeaser',
        participantSetsInfo: participantSetsInfo,
        signatureType: 'ESIGN',
        state: 'AUTHORING'
      });

      const agreements = await AdobeSignApi.get(`agreements/${resSendContract.data.id}`);

      const fields = {
        fields: [
          {
            locations: locationClient,
            contentType: 'SIGNER_INITIALS',
            name: 'signClient',
            inputType: 'SIGNATURE',
            visible: true,
            required: true,
            alignment: 'LEFT',
            calculated: false,
            assignee: `${agreements.data.participantSetsInfo[0].id}`
          },
          {
            locations: locationCowork,
            contentType: 'SIGNER_INITIALS',
            name: 'signCowork',
            inputType: 'SIGNATURE',
            visible: true,
            required: true,
            alignment: 'LEFT',
            calculated: false,
            assignee: `${agreements.data.participantSetsInfo[1].id}`
          }
        ]
      };

      setTimeout(async () => {
        await AdobeSignApi.put(`agreements/${resSendContract.data.id}/formFields`, fields);
      }, 2000);

      return resSendContract.data;
    } catch (err) {
      throw new Error(err);
    }
  }

  static async getDocumentPdf(agreementId: string): Promise<CombinedDocumentInterface> {
    const file = await AdobeSignApi.get(`agreements/${agreementId}/combinedDocument/url`);
    return file.data;
  }
}
