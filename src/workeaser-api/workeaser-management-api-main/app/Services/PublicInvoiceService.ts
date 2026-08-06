import Mail from '@ioc:Adonis/Addons/Mail';
import Env from '@ioc:Adonis/Core/Env';
import View from '@ioc:Adonis/Core/View';
import Database from '@ioc:Adonis/Lucid/Database';
import CoworkAccount from 'App/Models/CoworkAccount';
import CoworkUser from 'App/Models/CoworkUser';
import Invoice, { DetailedInvoice } from 'App/Models/Invoice';
import InvoicePaymentHistory from 'App/Models/InvoicePaymentHistory';
import Location from 'App/Models/Location';
import Payment from 'App/Models/Payment';
import User from 'App/Models/User';
import StripeConnectService from 'App/Services/Cowork/StripeConnectService';
import WalletService from 'App/Services/WalletService';
import AppError from 'App/Utils/AppError';
import ApplicationUrls from 'App/Utils/ApplicationUrls';
import {
  CoworkUserRoleEnum,
  IntegrationServiceEnum,
  PaymentStatusEnum,
  PaymentTypesEnum
} from 'Contracts/enums';
import { DateTime } from 'luxon';
import { launch } from 'puppeteer';

export interface PaymentInterface {
  amount: number;
  date: string;
}

export interface ItemInterface {
  id: number;
  service_type?: string;
  name: string;
  date: string;
  amount: number;
  unit_price: number;
}

export interface IniFeeInterface {
  id: number;
  name: string;
  value: number;
}

export interface PublicInvoiceResponse {
  uuid: string;
  coworking_name: string;
  coworking_logo?: string;
  location_address?: string;
  due_date: string;
  amount: number;
  open_amount: number;
  payments: PaymentInterface[];
  items: ItemInterface[];
  total_taxes: number;
  status: string;
  total_taxes_overdue: number;
  iniFees: IniFeeInterface[];
}

export interface PublicInvoiceItem {
  invoice_item_id: number;
  amount: number;
}

export interface PublicPayInvoiceRequest {
  payment_method: PaymentTypesEnum;
  token?: string;
  public_token?: string;
  account_id?: string;
  items: PublicInvoiceItem[];
  bank_account_id?: number;
  card_id?: number;
}

export interface ItemPdf {
  date: string;
  name: string;
  description: string;
  quantity: number;
  isTaxable: boolean;
  unitPrice: string;
  subtotal: string;
}

export interface InvoiceDetailedInfo extends DetailedInvoice {
  cowork_account: {
    id: number;
    name: string;
    email: string;
    phone: string;
    photo_id: number;
    created_at: string;
    updated_at: string;
    photo?: {
      id: number;
      user_id?: number;
      file: string;
      created_at: string;
      updated_at: string;
    };
  };
}

export default class PublicInvoiceService {
  static async show(uuid: string): Promise<PublicInvoiceResponse> {
    const invoice = await this.getInvoiceDetailedInfos(uuid);

    const itemsNormalized: ItemInterface[] = [];
    const paymentsNormalized: PaymentInterface[] = [];
    const iniFeesNormalized: IniFeeInterface[] = [];

    try {
      invoice.items.forEach((item) => {
        const itemNormalized: ItemInterface = {
          id: item.id,
          service_type: item.service_type,
          name: item.name,
          date: item.date,
          amount: item.total_amount,
          unit_price: item.unit_price
        };

        itemsNormalized.push(itemNormalized);
      });

      invoice.historic.forEach((payment) => {
        const paymentNormalized: PaymentInterface = {
          amount: payment.payment_available,
          date: DateTime.fromISO(payment.created_at).toFormat('yyyy-MM-dd')
        };

        paymentsNormalized.push(paymentNormalized);
      });

      invoice.iniFees.forEach((iniFee) => {
        const iniFeeNormalized: IniFeeInterface = {
          id: iniFee.id,
          name: iniFee.name,
          value: iniFee.value
        };

        iniFeesNormalized.push(iniFeeNormalized);
      });

      const result: PublicInvoiceResponse = {
        uuid: invoice.uuid,
        coworking_name: invoice.cowork_account.name,
        coworking_logo: invoice.cowork_account.photo?.file,
        due_date: DateTime.fromISO(invoice.due_date).toFormat('yyyy-MM-dd'),
        amount: invoice.total,
        open_amount: invoice.open_amount,
        payments: paymentsNormalized,
        items: itemsNormalized,
        location_address: invoice.location.address?.fulltext || '',
        total_taxes: invoice.total_taxes,
        status: this.getInvoiceStatusFormatted(invoice.status),
        total_taxes_overdue: invoice.total_taxes_overdue,
        iniFees: iniFeesNormalized
      };

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async pay(uuid: string, data: PublicPayInvoiceRequest, user?: User) {
    if (!user && (data.card_id || data.bank_account_id)) {
      throw new AppError(
        AppError.BAD_REQUEST,
        'You must be logged to use card_id or bank_account_id'
      );
    }

    if (!user && !data.public_token && !data.account_id && !data.token) {
      throw new AppError(AppError.BAD_REQUEST, 'You must be set a valid payment info');
    }

    const invoice = await this.getInvoiceDetailedInfos(uuid);
    const coworkStripeAccount = await StripeConnectService.createOrGetAccount(
      invoice.cowork_account_id
    );

    let applicationFee = 0;
    if (!invoice.application_fee_paid && invoice.application_fee) {
      applicationFee = invoice.application_fee;
    }

    const invoicePaymentHistory: any[] = [];
    let totalPayment = 0;

    data.items.forEach((item) => {
      invoicePaymentHistory.push({
        invoice_id: invoice.id,
        invoice_item_id: item.invoice_item_id,
        amount: item.amount
      });

      totalPayment += item.amount;
    });

    const openAmount = invoice.total - invoice.total_invoice_paid;
    let openAmountAfterP = invoice.total - totalPayment;

    if (totalPayment > openAmount) {
      throw new AppError(
        AppError.BAD_REQUEST,
        'The total received is greater than the open amount'
      );
    }

    if (applicationFee && totalPayment < applicationFee) {
      throw new AppError(
        AppError.BAD_REQUEST,
        'The total payment must be greater than or equal to the application fee'
      );
    }

    const trx = await Database.transaction();

    try {
      let onlinePayment;

      if (user && (data.card_id || data.bank_account_id)) {
        onlinePayment = await this.doUserPayment(
          data,
          invoice.user_id,
          totalPayment,
          coworkStripeAccount.accountId,
          applicationFee
        );
      } else {
        onlinePayment = await this.doPublicPayment(
          data,
          totalPayment,
          coworkStripeAccount.accountId,
          applicationFee
        );
      }

      const newPayment = await Payment.create(
        {
          invoiceId: invoice.id,
          paymentType: data.payment_method,
          amount: onlinePayment.amount,
          userId: user?.id,
          status: String(onlinePayment.status).toUpperCase(),
          gatewayId: onlinePayment.id,
          integrationService: IntegrationServiceEnum.STRIPE,
          applicationFee: applicationFee ? true : false,
          available: 0
        },
        { client: trx }
      );

      invoicePaymentHistory.forEach((history) => {
        history.payment_id = newPayment.id;
      });

      await InvoicePaymentHistory.createMany(invoicePaymentHistory, { client: trx });
      await trx.commit();

      const client = await User.query().where('id', invoice.user_id).first();

      const location = await Location.query().where('id', invoice.location_id).first();

      const coworkUser = await CoworkUser.query()
        .where('cowork_account_id', invoice.cowork_account_id)
        .first();

      const manager = await User.query().where('id', coworkUser.userId).first();

      if (!client) {
        throw new AppError(AppError.BAD_REQUEST, 'Client not found');
      }

      if (!manager) {
        throw new AppError(AppError.BAD_REQUEST, 'Manager not found');
      }

      if (!location) {
        throw new AppError(AppError.BAD_REQUEST, 'Location not found');
      }

      let dollarUSLocale = Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      });

      let totalPaidAmount: any = 0.0;
      let totalOpenAmount: any = 0;

      totalPaidAmount = totalPayment.toString();

      totalPaidAmount =
        totalPaidAmount.substring(0, totalPaidAmount.length - 2) +
        '.' +
        totalPaidAmount.substring(totalPaidAmount.length - 2);

      totalPaidAmount = dollarUSLocale.format(parseFloat(totalPaidAmount));

      totalOpenAmount = openAmountAfterP.toString();

      totalOpenAmount =
        totalOpenAmount.substring(0, totalOpenAmount.length - 2) +
        '.' +
        totalOpenAmount.substring(totalOpenAmount.length - 2);

      totalOpenAmount = dollarUSLocale.format(parseFloat(totalOpenAmount));

      this.sendPaymentEmailClient(
        client,
        location.name,
        totalPaidAmount,
        invoice.id,
        totalOpenAmount,
        invoice.uuid
      );

      this.sendPaymentEmailCoworking(
        manager,
        client,
        location.name,
        totalPaidAmount,
        invoice.id,
        totalOpenAmount,
        invoice.uuid
      );

      return newPayment;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async doPublicPayment(
    data: PublicPayInvoiceRequest,
    totalPayment: number,
    stripeAccountId: string,
    applicationFee?: number
  ) {
    let onlinePayment;

    switch (data.payment_method) {
      case PaymentTypesEnum.BANK_ACCOUNT:
        if (!data.public_token || !data.account_id) {
          throw new Error('Unexpected error');
        }

        onlinePayment = await WalletService.createPublicChargeBank(
          totalPayment,
          data.public_token,
          data.account_id,
          stripeAccountId,
          applicationFee
        );

        break;
      case PaymentTypesEnum.CARD:
        if (!data.token) {
          throw new Error('Unexpected error');
        }

        onlinePayment = await WalletService.createPublicChargeCard(
          totalPayment,
          data.token,
          stripeAccountId,
          applicationFee
        );

        break;
    }

    return onlinePayment;
  }

  static async doUserPayment(
    data: PublicPayInvoiceRequest,
    userId: number,
    totalPayment: number,
    stripeAccountId: string,
    applicationFee?: number
  ) {
    let methodId;
    switch (data.payment_method) {
      case PaymentTypesEnum.BANK_ACCOUNT:
        methodId = data.bank_account_id;
        break;
      case PaymentTypesEnum.CARD:
        methodId = data.card_id;
        break;
    }

    const checkPaymentMethod = await WalletService.userHasPermissionToUsePaymentMethod(
      userId,
      data.payment_method,
      methodId
    );

    if (!checkPaymentMethod) {
      throw new AppError(AppError.BAD_REQUEST, 'Invalid payment method');

      //this.sendPaymentIssueEmailClient(

      //);
    }

    const onlinePayment = await WalletService.createCharge(
      userId,
      totalPayment,
      data.payment_method,
      methodId,
      stripeAccountId,
      applicationFee
    );

    return onlinePayment;
  }

  static async generatePdf(invoiceUuid: string): Promise<Buffer> {
    const invoice: Invoice = await Invoice.query()
      .preload('coworkAccount', (coworkQuery) => {
        coworkQuery.preload('photo');
      })
      .preload('user', (userQuery) => {
        userQuery.preload('clientAccount');
        userQuery.preload('personalAddress');
      })
      .preload('items')
      .preload('historic', (historicQuery) => {
        historicQuery.whereHas('payment', (paymentQuery) => {
          paymentQuery.where('status', PaymentStatusEnum.SUCCEEDED);
        });
      })
      .where('uuid', invoiceUuid)
      .first();

    if (!invoice) {
      throw new AppError(AppError.NOT_FOUND, 'Invoice not found');
    }

    const managerCowork = await CoworkUser.query()
      .where('cowork_account_id', invoice.coworkAccountId)
      .where('role', CoworkUserRoleEnum.MANAGER)
      .firstOrFail();

    const managerCoworkingUser = await User.findOrFail(managerCowork.userId);
    const isOverdue = await invoice.isOverdue();
    const dateFormat = 'MM/dd/yyyy';
    const numFormatter = new Intl.NumberFormat('en', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: 'currency',
      currency: 'USD'
    });

    let totalPaid = 0;
    let totalInvoice = 0;
    let openAmount = 0;

    invoice.historic.forEach((payment) => {
      totalPaid += payment.amount;
    });

    totalInvoice = isOverdue ? invoice.total + invoice.totalTaxesOverdue : invoice.total;
    openAmount = totalInvoice - totalPaid;

    const data = {
      coworkingLogo: invoice.coworkAccount.photo ? invoice.coworkAccount.photo.getPhotoUrl : null,
      coworkingOwner: managerCoworkingUser.fullName || '',
      coworkingName: invoice.coworkAccount.name || '',
      coworkingEmail: invoice.coworkAccount.email || '',

      customerName: invoice.user.fullName || '',
      customerCompany: invoice.user.clientAccount.companyName || '',
      customerAddress: invoice.user.personalAddress ? invoice.user.personalAddress.fulltext : '',
      customerEmail: invoice.user.email || '',

      invoice: String(invoice.id).padStart(7, '0'),
      issued: invoice.date.toFormat(dateFormat),
      dueDate: invoice.dueDate.toFormat(dateFormat),
      invoiceStatus: this.getInvoiceStatusFormatted(invoice.status),

      items: [],

      subtotal: numFormatter.format(invoice.subtotal / 100),
      tax: numFormatter.format(invoice.totalTaxes / 100),
      isOverdue: isOverdue,
      taxOverdue: numFormatter.format(invoice.totalTaxesOverdue / 100),
      hasPaid: totalPaid,
      totalPaid: numFormatter.format(totalPaid / 100),
      openAmount: numFormatter.format(openAmount / 100),
      total: numFormatter.format(totalInvoice / 100),

      additionalNotes: invoice.additionalNotes
    };

    invoice.items.forEach((item) => {
      const newItem: ItemPdf = {
        date: item.date.toFormat(dateFormat),
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        isTaxable: item.totalTaxes ? true : false,
        unitPrice: numFormatter.format(item.unitPrice / 100),
        subtotal: numFormatter.format((item.unitPrice * item.quantity) / 100)
      };

      (data.items as ItemPdf[]).push(newItem);
    });

    const render = await View.render('invoices/invoice', data);
    const browser = await launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(render, { waitUntil: 'networkidle0' });

    const pageBuffer = await page.pdf({ format: 'a4' });

    await browser.close();

    return pageBuffer;
  }

  private static async getInvoiceDetailedInfos(uuid: string): Promise<InvoiceDetailedInfo> {
    const invoice: Invoice = await Invoice.query().where('uuid', uuid).first();

    const coworkAccount = await CoworkAccount.query()
      .where('id', invoice.coworkAccountId)
      .preload('photo')
      .first();

    if (!invoice || !coworkAccount) {
      throw new AppError(AppError.NOT_FOUND, 'Invoice not found');
    }

    const invoiceDetails = await invoice.getDetailed();

    return {
      ...invoiceDetails,
      cowork_account: coworkAccount
    };
  }

  private static getInvoiceStatusFormatted(status: string) {
    switch (status) {
      case 'OPEN':
        return 'Open';
      case 'SENT':
        return 'Open';
      case 'VIEWED':
        return 'Open';
      case 'PARTLY_PAID':
        return 'Partly Paid';
      case 'FULLY_PAID':
        return 'Fully Paid';
      case 'DEPOSITED':
        return '';
      case 'PARTLY_REFUNDED':
        return 'Partly Refunded';
      case 'FULLY_REFUNDED':
        return 'Fully Refunded';
      case 'OVERDUE':
        return 'Overdue';
      default:
        return status;
    }
  }

  static async checkInvoiceReminder() {
    try {
      const invoices = await Invoice.query().select('*');

      const currentDate = DateTime.now();

      let dollarUSLocale = Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      });

      let totalOpenAmount: any = 0;

      invoices.map(async (item) => {
        const client = await User.find(item.userId);

        if (!client) {
          throw new AppError(AppError.BAD_REQUEST, 'Related client not found');
        }

        let diff = Math.abs(item.dueDate.toMillis() - currentDate.toMillis());
        let diffDays = Math.ceil(diff / (1000 * 3600 * 24));
        let newTotal = 0;

        if (diffDays === 1) {
          newTotal = item.total + item.totalTaxesOverdue;

          await Invoice.query().where('id', item.id).update({ total: newTotal, status: 'OVERDUE' });

          totalOpenAmount = newTotal.toString();

          totalOpenAmount =
            totalOpenAmount.substring(0, totalOpenAmount.length - 2) +
            '.' +
            totalOpenAmount.substring(totalOpenAmount.length - 2);

          totalOpenAmount = dollarUSLocale.format(parseFloat(totalOpenAmount));

          this.sendPaymentRimenderEmailClient(
            client,
            item.id,
            item.dueDate.toLocaleString(DateTime.DATE_FULL),
            totalOpenAmount,
            item.uuid
          );
        } // end if
      });

      return { result: 1 };
    } catch (error) {
      throw error;
    } // end try catch
  } // end checkInvoiceReminder

  static async sendPaymentRimenderEmailClient(
    client: User,
    invoiceId: number,
    dueDate: string,
    openBalance: number,
    invoiceUuid: string
  ) {
    await Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(client.email, client.firstName)
        .subject('Payment reminder')
        .htmlView('emails/coworker/invoiceAndPayment/payment_reminder', {
          clientFirstName: client.firstName,
          invoiceId: invoiceId,
          dueDate: dueDate,
          memberPanelToken: `${ApplicationUrls.AUTH.LOGIN}`,
          openBalance: openBalance,
          token: `${ApplicationUrls.PUB.INVOICES}` + invoiceUuid + '/pdf'
        });
    });
  }

  static async sendPaymentEmailClient(
    client: User,
    locationName: string,
    totalPaidAmount: number,
    invoiceId: number,
    openAmount: number,
    invoiceUuid: string
  ) {
    await Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(client.email, client.firstName)
        .subject('Payment received')
        .htmlView('emails/coworker/invoiceAndPayment/payment_made', {
          clientFirstName: client.firstName,
          locationName: locationName,
          totalPaidAmount: totalPaidAmount,
          invoiceId: invoiceId,
          openAmount: openAmount,
          token: `${ApplicationUrls.PUB.INVOICES}` + invoiceUuid + '/pdf'
        });
    });
  }

  static async sendPaymentEmailCoworking(
    manager: User,
    client: User,
    locationName: string,
    totalPaidAmount: number,
    invoiceId: number,
    openAmount: number,
    invoiceUuid: string
  ) {
    await Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(manager.email, manager.firstName)
        .subject('Payment received')
        .htmlView('emails/coworking/invoiceAndPayment/payment_made', {
          managerFirstName: manager.firstName,
          clientFirstName: client.firstName,
          locationName: locationName,
          totalPaidAmount: totalPaidAmount,
          invoiceId: invoiceId,
          openAmount: openAmount,
          token: `${ApplicationUrls.PUB.INVOICE_SINGLE_VIEW_COWORKING}` + invoiceUuid 
        });
    });
  }

  static async sendPaymentIssueEmailClient(
    client: User,
    manager: User,
    locationName: string,
    openAmount: number,
    invoiceUuid: string
  ) {
    await Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(client.email, client.firstName)
        .subject('Payment issue')
        .htmlView('emails/coworker/invoiceAndPayment/declined_payment', {
          clientFirstName: client.firstName,
          managerFirstName: manager.firstName,
          locationName: locationName,
          memberPanelToken: `${ApplicationUrls.AUTH.LOGIN}`,
          openAmount: openAmount,
          token: `${ApplicationUrls.PUB.INVOICES}` + invoiceUuid + '/pdf'
        });
    });
  }
}
