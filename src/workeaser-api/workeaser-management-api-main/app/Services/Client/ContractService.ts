import { BoldSign } from 'App/Integrations/BoldSign/implemetation/BoldSign.impl';
import Contract from 'App/Models/Contract';
import AppError from 'App/Utils/AppError';
import { ContractStatusEnum } from 'Contracts/enums';
import GenericContractService from '../GenericContractService';

export default class ContractService {
  static STATUS_COMPLETED_BOLDSIGN = 'Completed';
  static async updateContractStatus(id: number, status: ContractStatusEnum) {
    const contract = await Contract.findOrFail(id);
    contract.status = status;
    await contract.save();
    await contract.related('activities').create({ type: status });
  }

  static async getContractUrl(user: any, contractId: number) {
    const contract = await Contract.find(contractId);

    if (!contract || contract.userId !== user.id) {
      throw new AppError(AppError.BAD_REQUEST, 'Contract not found');
    }

    const boldSign = new BoldSign(contract);
    const document = await boldSign.getDocumentDetails(contract.envelopeId);
    if (document.status === this.STATUS_COMPLETED_BOLDSIGN) {
      await GenericContractService.activeContract(contractId);
      throw new AppError(
        AppError.BAD_REQUEST,
        'This contract has already been signed by both parties.'
      );
    }

    const signer = document.signerDetails.find((signer) => signer.signerEmail === user.email);
    if (signer && signer.status === this.STATUS_COMPLETED_BOLDSIGN) {
      contract.status = ContractStatusEnum.SIGN_BY_CLIENT;
      await contract.save();
      await contract.related('activities').create({ type: ContractStatusEnum.SIGN_BY_CLIENT });
      throw new AppError(AppError.BAD_REQUEST, 'Sorry, you already signed this contract.');
    }

    const signUrl = await boldSign.getEmbeddedSignLink(user.email);

    return signUrl;
  }
}
