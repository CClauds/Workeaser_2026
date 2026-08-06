import Mail from '@ioc:Adonis/Addons/Mail';
import Drive from '@ioc:Adonis/Core/Drive';
import Env from '@ioc:Adonis/Core/Env';
import Event from '@ioc:Adonis/Core/Event';
import View from '@ioc:Adonis/Core/View';
import Database from '@ioc:Adonis/Lucid/Database';
import { BoldSign } from 'App/Integrations/BoldSign/implemetation/BoldSign.impl';
import { BoldsignEvent } from 'App/Integrations/BoldSign/interfaces/event.interface';
import Contract from 'App/Models/Contract';
import ContractActivity from 'App/Models/ContractActivity';
import ContractNotification from 'App/Models/ContractNotification';
import CoworkUser from 'App/Models/CoworkUser';
import Desk from 'App/Models/Desk';
import DeskPrice from 'App/Models/DeskPrice';
import Document from 'App/Models/Document';
import Invoice from 'App/Models/Invoice';
import InvoiceContract from 'App/Models/InvoiceContract';
import Location from 'App/Models/Location';
import Room from 'App/Models/Room';
import RoomPrice from 'App/Models/RoomPrice';
import Tax from 'App/Models/Tax';
import User from 'App/Models/User';
import VirtualOffice from 'App/Models/VirtualOffice';
import VirtualOfficePrice from 'App/Models/VirtualOfficePrice';
import ApplicationFeeService from 'App/Services/ApplicationFeeService';
import ClientService from 'App/Services/Cowork/ClientService';
import InvoiceService, {
  InvoiceItemRequestInterface,
  InvoiceRequestInterface
} from 'App/Services/Cowork/InvoiceService';
import AppError, { BoldSignError } from 'App/Utils/AppError';
import ApplicationUrls from 'App/Utils/ApplicationUrls';
import {
  ContractPaymentStyleEnum,
  ContractStatusEnum,
  ContractTermEnum,
  CoworkUserRoleEnum,
  InvoiceStatusEnum,
  ServicesEnum
} from 'Contracts/enums';
import { DateTime } from 'luxon';
import { PDFDocument } from 'pdf-lib';
import puppeteer from 'puppeteer';

/**
 * Drop-in replacement for the abandoned `merge-pdf-buffers` package.
 * `merge-pdf-buffers` depended on `hummus`, which has broken native bindings on
 * Node 18+ and is unmaintained. `pdf-lib` is pure JS and maintained.
 */
async function mergePdfBuffers(parts: Array<Buffer | Uint8Array>): Promise<Buffer> {
  const merged = await PDFDocument.create();
  for (const part of parts) {
    const src = await PDFDocument.load(part as Uint8Array);
    const pages = await merged.copyPages(src, src.getPageIndices());
    for (const p of pages) merged.addPage(p);
  }
  return Buffer.from(await merged.save());
}
import AdobeSignApi from '../../Integrations/AdobeSign/Implementation/AdobeSignApi';
import GenericContractService from '../GenericContractService';

export default class ContractService {
  private static COMPLETE_STATUS_BOLDSIGN = 'Completed';
  private static SIGNED_STATUS_BOLDSIGN = 'Signed';

  static async list(user: User, filters: any, page = 1) {
    await user.load('coworkUser');

    const query = Contract.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .preload('user', (userQuery) => {
        userQuery.preload('clientAccount');
      })
      .whereNull('deleted_at');

    if (filters.name) {
      query.whereHas('user', (userQuery) => {
        userQuery
          .where('first_name', 'like', `%${filters.name}%`)
          .orWhere('last_name', 'like', `%${filters.name}%`);
      });
    }

    const contracts = (await query.paginate(page, Env.get('ITEMS_PER_PAGE'))).toJSON();
    const contractsResponse: any[] = [];

    for (const contract of contracts.data) {
      if (!contract) {
        continue;
      }
      const contractJSON = contract.toJSON();
      const serviceName = await this.getServiceName(contract);

      const documentFile = await Document.query()
        .select('file')
        .where('id', contractJSON.contract_document_id);

      contractJSON.document_file = documentFile;
      contractJSON.service_name = serviceName;
      contractsResponse.push(contractJSON);
    }

    return {
      toJSON() {
        return {
          data: contractsResponse,
          meta: contracts.meta
        };
      }
    };
  }

  static async show(id: number, user: User) {
    await user.load('coworkUser');
    const contract = await Contract.query()
      .where('id', id)
      .preload('documents')
      .preload('user', (userQuery) => {
        userQuery.preload('clientAccount');
      })
      .preload('activities')
      .first();

    if (!contract || contract?.coworkAccountId !== user?.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Contract not found');
    }

    const serviceInfo = await this.getServiceInfos(
      contract.resourceId,
      contract.serviceType,
      contract.termSize,
      contract.paymentRecurringStyle
    );

    return { ...contract.toJSON(), service: serviceInfo };
  }

  static async store(user: User, data: any = {}) {
    await user.load('coworkUser');

    // let assetName: string;
    // let termSize: string;
    // let startEndDate: string;
    // let autoRenewal: string;
    // let recurringPayment: string;

    let potentialEarnings: any = 0;

    let initialPayment: any = 0;
    initialPayment = 0;

    let dollarUSLocale = Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });

    let sumFees = 0;

    let renCancDate = this.calculateDateEndOfContract(data.service_started_date, data.term_size);
    let clientUUID = data.client_uuid;
    if (!clientUUID) {
      const client = await ClientService.store(
        user,
        {
          ...data.client,       
          client: {
            company_name: data.client.company_name
          }
        },
        user.coworkUser.coworkAccountId
      );
      clientUUID = client.uuid;
    }
    const client = await User.findByOrFail('uuid', clientUUID);
    const location = await Location.find(data.location_id);

    if (!location) {
      throw new AppError(AppError.BAD_REQUEST, 'Location not found');
    }

    // HF-SPRINT-M-01 (CRITICAL) — cross-tenant leak fix:
    // Antes do fix, qualquer cowork podia criar contrato apontando pra location_id
    // de OUTRO cowork. Permite contrato sendo binded a tenant errado.
    // Soft 404 (BAD_REQUEST genérico) pra não vazar existência do location alheio.
    if (location.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.BAD_REQUEST, 'Location not found');
    }

    let newContractData = {
      coworkAccountId: user.coworkUser.coworkAccountId,
      locationId: data.location_id,
      userId: client.id,
      serviceType: data.service_type,
      resourceId: data.resource_id,
      termSize: data.term_size,
      autoRenewal: data.auto_renewal,
      paymentRecurringStyle: data.payment_recurring_style,
      amount: 0,
      firstInvoiceAmount: 0,
      coworkUsagePerMonth: data.cowork_usage_per_month,
      meetingRoomUsagePerMonth: data.meeting_room_per_month,
      status: ContractStatusEnum.CREATED,
      contractDocumentId: data.contract_document_id,
      request_sign: data.request_sign,
      service_started_date: data.service_started_date,
      service_renew_cancel_date: renCancDate
    };

    // Check if service is available
    const serviceIsAvailable = await this.checkIfServiceIsAvailable(
      data.resource_id,
      newContractData.serviceType
    );

    if (!serviceIsAvailable.isAvailable) {
      throw new AppError(AppError.BAD_REQUEST, 'There is no vacancy available for this service.');
    }

    const trx = await Database.transaction();

    try {
      const applicationFee = await ApplicationFeeService.calculate(
        newContractData.userId,
        newContractData.coworkAccountId,
        newContractData.serviceType,
        newContractData.locationId,
        newContractData.resourceId,
        data.amount
      );

      const newContract = await new Contract().merge(newContractData).useTransaction(trx).save();

      await ContractActivity.create(
        { contractId: newContract.id, type: ContractStatusEnum.CREATED },
        { client: trx }
      );

      if (data.documents) {
        const documents = data.documents.map((p) => p.id);
        await newContract.related('documents').attach(documents);
      }

      // Add service to invoice
      const serviceInfo = await this.getServiceInfos(
        data.resource_id,
        data.service_type,
        data.term_size,
        data.payment_recurring_style
      );

      const taxes = await Tax.query()
        .preload('services')
        .where('cowork_account_id', user.coworkUser.coworkAccountId);

      const allFees: {
        name: string;
        description: string;
        value: number;
        type: string;
        method: string;
        recurring_type: string;
        taxes: [];
      }[] = [];

      await taxes.map((item) => {
        item.services.map((sitem) => {
          if (sitem.slug === data.service_type) {
            allFees.push({
              name: item.name,
              description: '',
              value: item.value,
              type: item.type,
              method: item.method,
              recurring_type: item.recurringType,
              taxes: []
            });
          } // end if
        }); // end second map
      }); // end first map

      const serviceData: InvoiceItemRequestInterface = {
        name: serviceInfo.name,
        unit_price: data.amount,
        service_type: newContract.serviceType,
        date: DateTime.local(),
        description: '',
        quantity: 1,
        fees: allFees,
        resource_id: data.resource_id
      };

      const invoiceData: InvoiceRequestInterface = {
        location_id: newContract.locationId,
        client_uuid: client.uuid,
        date: DateTime.local(),
        due_date: data.due_date,
        items: [serviceData],
        first_invoice_amount: newContract.firstInvoiceAmount,
        contracts: [newContract.id],
        application_fee: applicationFee,
        additional_notes: data.additional_notes
      };

      await InvoiceService.store(user, invoiceData, true);
      await ClientService.attachClientUserToCowork(
        newContractData.coworkAccountId,
        newContractData.userId,
        trx
      );

      await trx.commit();

      Event.emit('contract:new', { id: newContract.id });

      // // service labels
      // if ('VIRTUAL_OFFICE' === newContractData.serviceType) {
      //   assetName = 'Virtual Office';
      // } else if ('MEETING_ROOM' === newContractData.serviceType) {
      //   assetName = 'Meeting Room';
      // } else if ('OPEN_DESK' === newContractData.serviceType) {
      //   assetName = 'Open Desk';
      // } else {
      //   assetName = 'Private Room';
      // } // end if else sequence

      // // term size labels
      // switch (data.term_size) {
      //   case ContractTermEnum.MONTH_1:
      //     termSize = 'One Month';
      //     break;
      //   case ContractTermEnum.MONTH_3:
      //     termSize = 'Three Months';
      //     break;
      //   case ContractTermEnum.MONTH_6:
      //     termSize = 'Six Months';
      //     break;
      //   case ContractTermEnum.YEAR_1:
      //     termSize = 'One Year';
      //     break;
      //   case ContractTermEnum.YEAR_2:
      //     termSize = 'Two Years';
      //     break;
      //   case ContractTermEnum.YEAR_3:
      //     termSize = 'Three Years';
      //     break;
      //   default:
      //     termSize = 'One Month';
      // } // end switch case

      // startEndDate =
      //   data.service_started_date.toLocaleString(DateTime.DATE_FULL) +
      //   ' - ' +
      //   renCancDate.toLocaleString(DateTime.DATE_FULL);

      // if (data.auto_renewal) {
      //   autoRenewal = 'Active';
      // } else {
      //   autoRenewal = 'Inactive';
      // } // end if else

      // if (data.payment_recurring_style === 'TOTAL') {
      //   recurringPayment = 'Total';
      // } else {
      //   recurringPayment = 'Monthly';
      // } // end if else

      switch (data.service_type) {
        case ServicesEnum.VIRTUAL_OFFICE:
          const virtualOffice = await VirtualOffice.find(data.resource_id);

          if (!virtualOffice) {
            throw new AppError(AppError.VALIDATION_FAIL, 'Virtual Office not found');
          }

          await virtualOffice.load('prices', (b) => {
            b.where('duration', data.term_size);
          });

          await virtualOffice.load('fees', (f) => {
            f.select('amount');
          });

          sumFees = virtualOffice.fees.reduce((accumulator, object) => {
            return accumulator + object.amount;
          }, 0);

          if (!virtualOffice.prices[0]) {
            throw new AppError(
              AppError.BAD_REQUEST,
              'There is no Virtual Office plan available for this contract term size.'
            );
          }

          if (
            data.payment_recurring_style === ContractPaymentStyleEnum.TOTAL &&
            virtualOffice.prices[0].fullPrice
          ) {
            potentialEarnings = virtualOffice.prices[0].fullPrice;
            initialPayment += potentialEarnings + sumFees;
          } else {
            potentialEarnings =
              virtualOffice.prices[0].monthlyPrice *
              ContractService.getTermsizeInMonths(data.term_size);
            initialPayment += potentialEarnings + sumFees;
          }

          break;
        case ServicesEnum.OPEN_DESK:
          const desk = await Desk.find(data.resource_id);

          if (!desk) {
            throw new AppError(AppError.VALIDATION_FAIL, 'Desk not found');
          }

          await desk.load('prices', (b) => {
            b.where('duration', data.term_size);
          });

          await desk.load('fees', (f) => {
            f.select('amount');
          });

          sumFees = desk.fees.reduce((accumulator, object) => {
            return accumulator + object.amount;
          }, 0);

          if (!desk.prices[0]) {
            throw new AppError(
              AppError.BAD_REQUEST,
              'There is no Desk plan available for this contract term size.'
            );
          }

          if (
            data.payment_recurring_style === ContractPaymentStyleEnum.TOTAL &&
            desk.prices[0].fullPrice
          ) {
            potentialEarnings = desk.prices[0].fullPrice;
            initialPayment += potentialEarnings + sumFees;
          } else {
            potentialEarnings =
              desk.prices[0].monthlyPrice * ContractService.getTermsizeInMonths(data.term_size);
            initialPayment += potentialEarnings + sumFees;
          }

          break;
        case ServicesEnum.PRIVATE_ROOM:
          const room = await Room.find(data.resource_id);

          if (!room) {
            throw new AppError(AppError.VALIDATION_FAIL, 'Room not found');
          }

          await room.load('prices', (b) => {
            b.where('duration', data.term_size);
          });

          await room.load('fees', (f) => {
            f.select('amount');
          });

          sumFees = room.fees.reduce((accumulator, object) => {
            return accumulator + object.amount;
          }, 0);

          if (!room.prices[0]) {
            throw new AppError(
              AppError.BAD_REQUEST,
              'There is no Room plan available for this contract term size.'
            );
          }

          if (
            data.payment_recurring_style === ContractPaymentStyleEnum.TOTAL &&
            room.prices[0].fullPrice
          ) {
            potentialEarnings = room.prices[0].fullPrice;
            initialPayment += potentialEarnings + sumFees;
          } else {
            potentialEarnings =
              room.prices[0].monthlyPrice * ContractService.getTermsizeInMonths(data.term_size);
            initialPayment += potentialEarnings + sumFees;
          }

          break;
      }

      let iniPayment = initialPayment.toString();
      let resIniPStr =
        iniPayment.substring(0, iniPayment.length - 2) +
        '.' +
        iniPayment.substring(iniPayment.length - 2);

      initialPayment = dollarUSLocale.format(parseFloat(resIniPStr));

      let potEarn = potentialEarnings.toString();
      let resPotEarnStr =
        potEarn.substring(0, potEarn.length - 2) + '.' + potEarn.substring(potEarn.length - 2);

      potentialEarnings = dollarUSLocale.format(parseFloat(resPotEarnStr));
      this.sendContract(user, newContract.id);

      // // send sign request
      // if (data.request_sign) {

      //   // this.sendDocSignReqEmailClient(
      //   //   client,
      //   //   user,
      //   //   location.name,
      //   //   assetName,
      //   //   termSize,
      //   //   startEndDate,
      //   //   autoRenewal,
      //   //   recurringPayment,
      //   //   initialPayment
      //   // );

      //   // this.sendDocSignReqEmailCoworking(
      //   //   user,
      //   //   client,
      //   //   location.name,
      //   //   assetName,
      //   //   termSize,
      //   //   startEndDate,
      //   //   autoRenewal,
      //   //   recurringPayment,
      //   //   potentialEarnings
      //   // );
      // } // end if

      return newContract;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async detach(id: number, user: User) {
    await user.load('coworkUser');

    let assetName: string;

    const contract = await Contract.findOrFail(id);

    if (!contract || contract.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Contract not found');
    }

    await contract.load('location');

    const client = await User.find(contract.userId);

    if (!client) {
      throw new AppError(AppError.NOT_FOUND, 'Contract client not found');
    }

    const trx = await Database.transaction();

    // service labels
    if ('VIRTUAL_OFFICE' === contract.serviceType) {
      assetName = 'Virtual Office';
    } else if ('MEETING_ROOM' === contract.serviceType) {
      assetName = 'Meeting Room';
    } else if ('OPEN_DESK' === contract.serviceType) {
      assetName = 'Open Desk';
    } else {
      assetName = 'Private Room';
    } // end if else sequence

    try {
      contract.status = ContractStatusEnum.CANCELED;
      await contract.useTransaction(trx).save();

      await ContractActivity.create(
        { contractId: contract.id, type: ContractStatusEnum.CANCELED },
        { client: trx }
      );

      await trx.commit();
      Event.emit('contract:detach', { id: contract.id });

      this.sendDetchEmailClient(
        client,
        user,
        contract.location.name,
        assetName,
        contract.service_started_date.toLocaleString(DateTime.DATE_FULL),
        contract.service_renew_cancel_date.toLocaleString(DateTime.DATE_FULL)
      );

      return contract;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async getOpenContractsByUserUUID(user: User, userUUId: string) {
    await user.load('coworkUser');
    const client = await User.findByOrFail('uuid', userUUId);
    const contracts = await Contract.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('user_id', client.id)
      .whereNot('status', ContractStatusEnum.CANCELED);

    const contractsJson: any[] = [];

    for (const contract of contracts) {
      const serviceName = await this.getServiceName(contract);
      const contractJson = contract.serialize();
      contractJson.service_name = serviceName;
      contractsJson.push(contractJson);
    }

    return contractsJson;
  }

  static async getProductsAndContractsByUserId(coworkAccountId: number, userId: number) {
    const contracts: Contract[] = await Contract.query()
      .preload('contractDocument')
      .where('cowork_account_id', coworkAccountId)
      .where('user_id', userId);

    return contracts;
  }

  static async getCancelInfos(user: User, contractId: number) {
    await user.load('coworkUser');

    const contract = await Contract.find(contractId);

    if (!contract || contract.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Contract not found');
    }

    const daysLeftToExpire = this.getTotalDaysBetweenDates(DateTime.local(), contract.dateEnd);

    const futureIncomeLost = this.calculateTotalContract(contract);
    const openBalance = await this.getTotalAmountOpenInvoices(contract.id);

    const response = {
      days_left_to_expire: daysLeftToExpire && daysLeftToExpire > 0 ? daysLeftToExpire : 0,
      future_income_lost: futureIncomeLost && futureIncomeLost > 0 ? futureIncomeLost : 0,
      open_balance: openBalance && openBalance > 0 ? openBalance : 0
    };

    return response;
  }

  static async attachDocuments(id: number, user: User, data: any = {}) {
    await user.load('coworkUser');

    const contract = await Contract.findOrFail(id);

    if (!contract || contract.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Contract not found');
    }

    const documents = data.documents.map((p) => p.id);
    await contract.related('documents').attach(documents);

    Event.emit('contract:attach_documents', { id: contract.id });

    return contract;
  }

  static calculateDateEndOfContract(startDate: DateTime, termSize: string) {
    const dateResponse = startDate;

    switch (termSize) {
      case ContractTermEnum.MONTH_1:
        return dateResponse.plus({ months: 1 });
      case ContractTermEnum.MONTH_3:
        return dateResponse.plus({ months: 3 });
      case ContractTermEnum.MONTH_6:
        return dateResponse.plus({ months: 6 });
      case ContractTermEnum.YEAR_1:
        return dateResponse.plus({ years: 1 });
      case ContractTermEnum.YEAR_2:
        return dateResponse.plus({ years: 2 });
      case ContractTermEnum.YEAR_3:
        return dateResponse.plus({ years: 3 });
      default:
        return dateResponse;
    }
  }

  static getTotalDaysFromTermSize(startDate: DateTime, termSize: string) {
    if (!startDate) return 0;
    let dateStart = startDate.startOf('day');
    let dateEnd = dateStart;

    switch (termSize) {
      case ContractTermEnum.MONTH_1:
        dateEnd = dateEnd.plus({ months: 1 }).startOf('day');
        break;
      case ContractTermEnum.MONTH_3:
        dateEnd = dateEnd.plus({ months: 3 }).startOf('day');
        break;
      case ContractTermEnum.MONTH_6:
        dateEnd = dateEnd.plus({ months: 6 }).startOf('day');
        break;
      case ContractTermEnum.YEAR_1:
        dateEnd = dateEnd.plus({ years: 1 }).startOf('day');
        break;
      case ContractTermEnum.YEAR_2:
        dateEnd = dateEnd.plus({ years: 2 }).startOf('day');
        break;
      case ContractTermEnum.YEAR_3:
        dateEnd = dateEnd.plus({ years: 3 }).startOf('day');
        break;
    }

    return dateEnd.diff(dateStart).as('days');
  }

  static getTotalMonthsFromTermSize(startDate: DateTime, termSize: string) {
    if (!startDate) return 0;
    let dateStart = startDate.startOf('day');
    let dateEnd = dateStart;

    switch (termSize) {
      case ContractTermEnum.MONTH_1:
        dateEnd = dateEnd.plus({ months: 1 }).startOf('day');
        break;
      case ContractTermEnum.MONTH_3:
        dateEnd = dateEnd.plus({ months: 3 }).startOf('day');
        break;
      case ContractTermEnum.MONTH_6:
        dateEnd = dateEnd.plus({ months: 6 }).startOf('day');
        break;
      case ContractTermEnum.YEAR_1:
        dateEnd = dateEnd.plus({ years: 1 }).startOf('day');
        break;
      case ContractTermEnum.YEAR_2:
        dateEnd = dateEnd.plus({ years: 2 }).startOf('day');
        break;
      case ContractTermEnum.YEAR_3:
        dateEnd = dateEnd.plus({ years: 3 }).startOf('day');
        break;
    }

    return Math.round(dateEnd.diff(dateStart).as('months'));
  }

  static getTotalDaysBetweenDates(startDate: DateTime, endDate: DateTime) {
    if (!startDate || !endDate) return 0;
    const dateStart = startDate.startOf('day');
    const dateEnd = endDate.startOf('day');

    return dateEnd.diff(dateStart).as('days');
  }

  static async getTotalAmountOpenInvoices(contractId: number) {
    const contractInvoice = await InvoiceContract.query().where('contract_id', contractId);

    const invoicesIds = contractInvoice.map((c) => c.invoiceId);

    const invoices: Invoice[] = await Invoice.query()
      .whereIn('id', invoicesIds)
      .whereIn('status', [
        InvoiceStatusEnum.SENT,
        InvoiceStatusEnum.VIEWED,
        InvoiceStatusEnum.PARTLY_PAID,
        InvoiceStatusEnum.PARTLY_REFUNDED,
        InvoiceStatusEnum.FULLY_REFUNDED
      ]);

    let total = 0;

    for (const invoice of invoices) {
      let totalInvoice = 0;

      if (invoice.dueDate.startOf('day') < DateTime.now().startOf('day')) {
        totalInvoice = invoice.total + invoice.totalTaxesOverdue;
      } else {
        totalInvoice = invoice.total;
      }

      if (
        invoice.status === InvoiceStatusEnum.PARTLY_PAID ||
        invoice.status === InvoiceStatusEnum.PARTLY_REFUNDED
      ) {
        const totalPaid = await InvoiceService.calculatePaymentsInvoices(invoice.id);
        total += totalInvoice - totalPaid;
      } else {
        total += totalInvoice;
      }
    }

    return total;
  }

  static async sendContract(user: User, contractId: number) {
    await user.load('coworkUser');

    const contract = await Contract.find(contractId);

    if (!contract || contract.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Contract not found');
    }

    if (contract.status === ContractStatusEnum.CONTRACT_SENT) {
      throw new AppError(AppError.BAD_REQUEST, 'Contract already sent');
    }

    const userSigner = await User.findOrFail(contract.userId);
    const managerCowork = await CoworkUser.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('role', CoworkUserRoleEnum.MANAGER)
      .firstOrFail();
    const managerUser = await User.findOrFail(managerCowork.userId);

    try {
      const contractFile = await this.createContractPdf(contract);

      if (userSigner.email === managerUser.email) {
        throw new AppError(
          AppError.BAD_REQUEST,
          'Double signatures by the same e-mail are not allowed.'
        );
      }

      const build = new BoldSign(contract);
      const documentId = await build.SendDocument(userSigner, managerUser, contractFile);

      await this.updateContractStatus(contract.id, ContractStatusEnum.CONTRACT_SENT);
      if (documentId) {
        contract.envelopeId = documentId;
        await contract.save();
      }

      return { message: documentId };
    } catch (error) {
      throw error;
    }
  }

  static async getContractPdf(user: User, contractId: number) {
    await user.load('coworkUser');

    const contract = await Contract.find(contractId);

    if (!contract || contract.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Contract not found');
    }

    const boldSign = new BoldSign(contract);
    const document = await boldSign.getDocumentPDF();

    if (document) {
      return document;
    } else {
      throw new AppError(AppError.BAD_REQUEST, 'Document not found');
    }
  }

  private static async createContractPdf(contract: Contract): Promise<Buffer> {
    await contract.load('contractDocument');
    await contract.load('coworkAccount');
    await contract.load('user');
    await contract.coworkAccount.load('photo');
    await contract.user.load('personalAddress');
    await contract.user.load('clientAccount');

    if (!contract.contractDocument) {
      throw new AppError(
        AppError.BAD_REQUEST,
        'There are no documents available for this contract.'
      );
    }

    const managerCowork = await CoworkUser.query()
      .where('cowork_account_id', contract.coworkAccountId)
      .where('role', CoworkUserRoleEnum.MANAGER)
      .firstOrFail();

    const managerCoworkingUser = await User.findOrFail(managerCowork.userId);

    const data = {
      coworkLogo: contract.coworkAccount.photo ? contract.coworkAccount.photo.getPhotoUrl : null,
      clientAccountName: contract.user.clientAccount.companyName || '',
      serviceCategory: contract.getServiceCategory || '',
      serviceName: (await this.getServiceName(contract)) || '',
      customerName: contract.user.fullName || '',
      customerCompany: contract.user.clientAccount.companyName || '',
      customerAddress: contract.user.personalAddress ? contract.user.personalAddress.fulltext : '',
      customerEmail: contract.user.email || '',
      coworkOwner: managerCoworkingUser.fullName || '',
      coworkName: contract.coworkAccount.name || '',
      coworkEmail: managerCoworkingUser.email || '',
      todayDate: contract.createdAt.setLocale('en-US').toLocaleString(DateTime.DATE_SHORT)
    };

    // Generate cover and last page
    const renderCover = await View.render('contracts/cover', data);
    const renderLastPage = await View.render('contracts/lastpage', data);

    const browser = await puppeteer.launch({ headless: true });

    const firstPage = await browser.newPage();
    await firstPage.setContent(renderCover, { waitUntil: 'networkidle0' });
    const lastPage = await browser.newPage();
    await lastPage.setContent(renderLastPage, { waitUntil: 'networkidle0' });

    const firstPageBuffer = await firstPage.pdf({ format: 'a4' });
    const lastPageBuffer = await lastPage.pdf({ format: 'a4' });

    await browser.close();

    // Get contract file stream
    const stream = await Drive.get(`documents/${contract.contractDocument.file}`);
    const merged = await mergePdfBuffers([
      firstPageBuffer as Buffer,
      stream as Buffer,
      lastPageBuffer as Buffer,
    ]);

    return merged;
  }

  public static async getServiceName(contract: Contract): Promise<string> {
    switch (contract.serviceType) {
      case ServicesEnum.OPEN_DESK:
        const desk = await Database.from('desks').where('id', contract.resourceId).first();
        return desk.name;
      case ServicesEnum.PRIVATE_ROOM:
        const privateRoom = await Database.from('rooms')
          .where('id', contract.resourceId)
          .firstOrFail();
        return privateRoom.name;
      case ServicesEnum.VIRTUAL_OFFICE:
        const virtualOffice = await Database.from('virtual_offices')
          .where('id', contract.resourceId)
          .firstOrFail();
        return virtualOffice.name;
      default:
        return '';
    }
  }

  public static async getServiceInfos(
    id: number,
    serviceType: ServicesEnum | string,
    termSize: ContractTermEnum | string,
    paymentTerm: ContractPaymentStyleEnum | string
  ) {
    const result = { name: '', unitPrice: 0 };

    switch (serviceType) {
      case ServicesEnum.OPEN_DESK:
        const openDesk = await Desk.findOrFail(id);
        const openDeskPrice = await DeskPrice.query()
          .where('desk_id', id)
          .where('duration', termSize)
          .first();

        if (!openDeskPrice) {
          throw new AppError(
            AppError.BAD_REQUEST,
            'The service has no plan for this contract size.'
          );
        }

        result.name = openDesk.name;
        result.unitPrice =
          paymentTerm === ContractPaymentStyleEnum.TOTAL
            ? openDeskPrice.fullPrice
            : openDeskPrice.monthlyPrice;
        break;
      case ServicesEnum.PRIVATE_ROOM:
        const privateRoom = await Room.findOrFail(id);
        const privateRoomPrice = await RoomPrice.query()
          .where('room_id', id)
          .where('duration', termSize)
          .first();

        if (!privateRoomPrice) {
          throw new AppError(
            AppError.BAD_REQUEST,
            'The service has no plan for this contract size.'
          );
        }

        result.name = privateRoom.name;
        result.unitPrice =
          paymentTerm === ContractPaymentStyleEnum.TOTAL
            ? privateRoomPrice.fullPrice
            : privateRoomPrice.monthlyPrice;
        break;
      case ServicesEnum.VIRTUAL_OFFICE:
        const virtualOffice = await VirtualOffice.findOrFail(id);
        const virtualOfficePrice = await VirtualOfficePrice.query()
          .where('virtual_office_id', id)
          .where('duration', termSize)
          .first();

        if (!virtualOfficePrice) {
          throw new AppError(
            AppError.BAD_REQUEST,
            'The service has no plan for this contract size.'
          );
        }

        result.name = virtualOffice.name;
        result.unitPrice =
          paymentTerm === ContractPaymentStyleEnum.TOTAL
            ? virtualOfficePrice.fullPrice
            : virtualOfficePrice.monthlyPrice;
        break;
    }

    return result;
  }

  static async checkIfServiceIsAvailable(id: number, serviceType: ServicesEnum) {
    let qtyResource = 0;

    // Get max resource vacancies
    switch (serviceType) {
      case ServicesEnum.OPEN_DESK:
        const desk = await Desk.findOrFail(id);
        qtyResource = desk.quantity;
        break;
      case ServicesEnum.PRIVATE_ROOM:
        qtyResource = 1;
        break;
      default:
        return {
          isAvailable: true,
          available: 0,
          busy: 0
        };
    }

    // Get contracts
    let query = await Contract.query()
      .where('resource_id', id)
      .where('service_type', serviceType)
      .whereNotIn('status', [ContractStatusEnum.CANCELED, ContractStatusEnum.INACTIVE])
      .count('* as total');

    const result = {
      isAvailable: qtyResource > query[0].$extras.total,
      available: qtyResource || 0,
      busy: parseInt(query[0].$extras.total) || 0
    };

    return result;
  }

  static getTermsizeInMonths(duration: string) {
    switch (duration) {
      case ContractTermEnum.MONTH_1:
        return 1;
      case ContractTermEnum.MONTH_3:
        return 3;
      case ContractTermEnum.MONTH_6:
        return 6;
      case ContractTermEnum.YEAR_1:
        return 12;
      case ContractTermEnum.YEAR_2:
        return 24;
      case ContractTermEnum.YEAR_3:
        return 36;
      default:
        return 0;
    }
  }

  static async updateContractStatus(id: number, status: ContractStatusEnum) {
    const contract = await Contract.findOrFail(id);
    contract.status = status;
    await contract.save();
    await contract.related('activities').create({ type: status });
  }

  static async contractEnvelopeUpdate({ event, data }: BoldsignEvent) {
    if (!data?.documentId) {
      return;
    }
    const contract = await Contract.findBy('envelope_id', data.documentId);
    if (contract) {
      if (event.eventType === this.COMPLETE_STATUS_BOLDSIGN) {
        await GenericContractService.activeContract(contract.id);
      } else if (event.eventType === this.SIGNED_STATUS_BOLDSIGN) {
        const signedUser = data.signerDetails.find(
          (signer) => signer.status === this.COMPLETE_STATUS_BOLDSIGN
        );
        if (!signedUser) {
          return;
        }
        await contract.load('user');
        if (contract.user.email === signedUser.signerEmail) {
          await this.updateContractStatus(contract.id, ContractStatusEnum.SIGN_BY_CLIENT);
        } else {
          await this.updateContractStatus(contract.id, ContractStatusEnum.SIGN_BY_COWORK);
        }
      }

      await ContractNotification.create({
        envelopeId: data.documentId,
        status: event.eventType,
        contractId: contract.id
      });
    }
  }

  static async getContractUrl(user: any, contractId: number) {
    try {
      await user.load('coworkUser');

      const contract = await Contract.find(contractId);

      if (!contract || contract.coworkAccountId !== user.coworkUser.coworkAccountId) {
        throw new AppError(AppError.BAD_REQUEST, 'Contract not found');
      }

      const boldSign = new BoldSign(contract);
      const document = await boldSign.getDocumentDetails(contract.envelopeId);
      if (document.status === this.COMPLETE_STATUS_BOLDSIGN) {
        await GenericContractService.activeContract(contractId);
        throw new AppError(
          AppError.BAD_REQUEST,
          'Sorry, this contract has already been signed by both parties.'
        );
      }

      const managerCowork = await CoworkUser.query()
        .where('cowork_account_id', user.coworkUser.coworkAccountId)
        .where('role', CoworkUserRoleEnum.MANAGER)
        .firstOrFail();

      const managerUser = await User.findOrFail(managerCowork.userId);

      const signer = document.signerDetails.find(
        (signer) => signer.signerEmail === managerUser.email
      );
      if (signer && signer.status === this.COMPLETE_STATUS_BOLDSIGN) {
        contract.status = ContractStatusEnum.SIGN_BY_COWORK;
        await contract.save();
        await contract.related('activities').create({ type: ContractStatusEnum.SIGN_BY_COWORK });
        throw new AppError(AppError.BAD_REQUEST, 'Sorry, you already signed this contract.');
      }

      const signUrl = await boldSign.getEmbeddedSignLink(user.email);

      return signUrl;
    } catch (err) {
      throw new BoldSignError(err);
    }
  }

  static async ContractStatus(user: any, contractId: number) {
    const contract = await Contract.find(contractId);

    if (!contract || contract.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Contract not found');
    }

    const res = await AdobeSignApi.get(`agreements/${contract.envelopeId}`);
    const { status } = res.data;

    let client = {
      name: res.data.participantSetsInfo[0].name,
      status: ''
    };

    let cowork = {
      name: res.data.participantSetsInfo[1].name,
      status: ''
    };

    if (res.data.participantSetsInfo[0].memberInfos.name) {
      client.status = 'Signed';
    } else {
      client.status = 'AWAITING SIGNATURE';
    }
    if (res.data.participantSetsInfo[0].memberInfos.name) {
      cowork.status = 'Signed';
    } else {
      cowork.status = 'AWAITING SIGNATURE';
    }

    return {
      client,
      cowork,
      status
    };
  }

  private static calculateTotalContract(contract: Contract) {
    const contractTotalDays = this.getTotalDaysFromTermSize(contract.dateStart, contract.termSize);

    const daysLeftToExpire = this.getTotalDaysBetweenDates(DateTime.local(), contract.dateEnd);

    if (contractTotalDays === 0 || daysLeftToExpire === 0) return 0;

    if (contract.paymentRecurringStyle === ContractPaymentStyleEnum.TOTAL) {
      return Math.round((contract.amount / contractTotalDays) * daysLeftToExpire);
    }

    if (contract.paymentRecurringStyle === ContractPaymentStyleEnum.MONTHLY) {
      const totalMonthsContract = this.getTotalMonthsFromTermSize(
        contract.dateStart,
        contract.termSize
      );

      const daily = (contract.amount * totalMonthsContract) / contractTotalDays;
      const total = Math.round(daily * daysLeftToExpire);

      return total;
    }
  }

  // static async sendDocSignReqEmailClient(
  //   client: User,
  //   manager: User,
  //   locationName: string,
  //   assetName: string,
  //   termSize: string,
  //   startEndDate: string,
  //   autoRenewal: string,
  //   recurringPayment: string,
  //   paymentAmount: number
  // ) {
  //   Mail.send((message) => {
  //     message
  //       .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
  //       .to(client.email, client.firstName)
  //       .subject('Agreement Signature requested')
  //       .htmlView('emails/coworker/attachAndDetachService/signature_request', {
  //         memberName: client.firstName,
  //         managerName: manager.firstName,
  //         locationName: locationName,
  //         assetName: assetName,
  //         termSize: termSize,
  //         startEndDate: startEndDate,
  //         autoRenewal: autoRenewal,
  //         recurringPayment: recurringPayment,
  //         paymentAmount: paymentAmount,
  //         token: `${ApplicationUrls.AUTH.LOGIN}`
  //       });
  //   });
  // } // end sendDocSignReqEmailClient

  // static async sendDocSignReqEmailCoworking(
  //   manager: User,
  //   client: User,
  //   locationName: string,
  //   assetName: string,
  //   termSize: string,
  //   startEndDate: string,
  //   autoRenewal: string,
  //   recurringPayment: string,
  //   potentialEarnings: number
  // ) {
  //   Mail.send((message) => {
  //     message
  //       .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
  //       .to(manager.email, manager.firstName)
  //       .subject('Agreement Signature requested')
  //       .htmlView('emails/coworking/attachAndDetachService/signature_request', {
  //         managerName: manager.firstName,
  //         memberName: client.firstName,
  //         locationName: locationName,
  //         assetName: assetName,
  //         termSize: termSize,
  //         startEndDate: startEndDate,
  //         autoRenewal: autoRenewal,
  //         recurringPayment: recurringPayment,
  //         potentialEarnings: potentialEarnings,
  //         token: `${ApplicationUrls.AUTH.LOGIN}`
  //       });
  //   });
  // } // end sendDocSignReqEmailCoworking

  static async sendDetchEmailClient(
    client: User,
    manager: User,
    locationName: string,
    assetName: string,
    startDate: string,
    endDate: string
  ) {
    Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(client.email, client.firstName)
        .subject('You have been detached from service')
        .htmlView('emails/coworker/attachAndDetachService/detach_service', {
          memberName: client.firstName,
          managerName: manager.firstName,
          locationName: locationName,
          assetName: assetName,
          startDate: startDate,
          endDate: endDate,
          token: `${ApplicationUrls.AUTH.LOGIN}`
        });
    });
  } // end sendDetchEmailClient
}
