import Desk from 'App/Models/Desk';
import Room from 'App/Models/Room';
import Database from '@ioc:Adonis/Lucid/Database';
import Contract from 'App/Models/Contract';
import VirtualOffice from 'App/Models/VirtualOffice';
import ContractRenewal from 'App/Models/ContractRenewal';
import ContractService from 'App/Services/Cowork/ContractService';
import { BaseTask } from 'adonis5-scheduler/build';
import { DateTime } from 'luxon';
import { ContractStatusEnum, ServicesEnum } from 'Contracts/enums';

export default class RenewContractTask extends BaseTask {
  public static get schedule() {
    return '0 1 * * *';
  }

  public static get useLock() {
    return false;
  }

  /**
   * Renew contracts
   *
   * Renew contracts that are nearing their expiration date.
   * Contracts must have autoRenewal = true and dateEnd = now().
   *
   * RenewContractTask must always be executed before GenerateInvoice.
   */
  public async handle() {
    console.log('Running renew contracts task');

    const contracts = await Contract.query()
      .where('status', ContractStatusEnum.ACTIVE)
      .where('date_end', '<', DateTime.now().toFormat('yyyy-MM-dd'));

    for (const contract of contracts) {
      // Set contract inactive
      if (!contract.autoRenewal) {
        await ContractService.updateContractStatus(contract.id, ContractStatusEnum.INACTIVE);
      } else {
        let resource;

        switch (contract.serviceType) {
          case ServicesEnum.OPEN_DESK:
            resource = await Desk.find(contract.resourceId);
            break;
          case ServicesEnum.PRIVATE_ROOM:
            resource = await Room.find(contract.resourceId);
            break;
          case ServicesEnum.VIRTUAL_OFFICE:
            resource = await VirtualOffice.find(contract.resourceId);
            break;
        }

        // Check if the renewal will have value readjustments
        let amount = contract.amount;
        let hasRenewalAdjustment = false;

        if (resource.renewalTax) {
          const renewalHistoric = await ContractRenewal.query()
            .where('contract_id', contract.id)
            .orderBy('date_end', 'desc');

          let monthsWithoutReadjustments = 0;

          for (const renewal of renewalHistoric) {
            if (renewal.hasRenewalAdjustment) {
              break;
            }

            monthsWithoutReadjustments += ContractService.getTermsizeInMonths(renewal.termSize);
          }

          if (monthsWithoutReadjustments >= 12) {
            hasRenewalAdjustment = true;
            amount = amount + amount * (resource.renewalTax / 10000);
          }
        }

        // Calculate new dateStart and dateEnd
        const dateStart = DateTime.local();
        const dateEnd = ContractService.calculateDateEndOfContract(dateStart, contract.termSize);

        // Create new renewal
        const trx = await Database.transaction();

        try {
          await ContractRenewal.create(
            {
              contractId: contract.id,
              dateStart: dateStart,
              dateEnd: dateEnd,
              termSize: contract.termSize,
              amount: amount,
              hasRenewalAdjustment: hasRenewalAdjustment,
              generatedInvoice: false
            },
            { client: trx }
          );

          contract.dateStart = dateStart;
          contract.dateEnd = dateEnd;
          contract.amount = amount;

          await contract.useTransaction(trx).save();

          await trx.commit();
        } catch (error) {
          console.log(error);
          await trx.rollback();
        }
      }
    }
  }
}
