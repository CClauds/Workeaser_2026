import Database from '@ioc:Adonis/Lucid/Database';
import Contract from 'App/Models/Contract';
import ContractRenewal from 'App/Models/ContractRenewal';
import { ContractStatusEnum } from 'Contracts/enums';
import { DateTime } from 'luxon';
import ContractService from './Cowork/ContractService';

export default class GenericContractService {
  static async activeContract(contractId: number) {
    await Database.transaction(async (trx) => {
      const contract = await Contract.findOrFail(contractId, { client: trx });
      const dateStart = DateTime.local();
      const dateEnd = ContractService.calculateDateEndOfContract(dateStart, contract.termSize);

      contract.dateStart = dateStart;
      contract.dateEnd = dateEnd;
      contract.status = ContractStatusEnum.ACTIVE;

      await ContractRenewal.create(
        {
          contractId: contract.id,
          dateStart: dateStart,
          dateEnd: dateEnd,
          termSize: contract.termSize,
          amount: contract.amount,
          generatedInvoice: true
        },
        { client: trx }
      );

      await contract.save();
      await contract.related('activities').create({ type: ContractStatusEnum.SIGNED });
      await contract.related('activities').create({ type: ContractStatusEnum.ACTIVE });
    });
  }
}
