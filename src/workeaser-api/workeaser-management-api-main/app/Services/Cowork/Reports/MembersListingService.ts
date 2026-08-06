import ExcelJs from 'exceljs';
import { DateTime } from 'luxon';
import {
  headerColumnTitlesStyle,
  headerFilterStyle,
  headerTitleStyle,
  rowDark,
  rowLigth
} from './Styles';
import { ContractStatusEnum, InvoiceStatusEnum } from 'Contracts/enums';
import Invoice from 'App/Models/Invoice';
import Contract from 'App/Models/Contract';
import Service from 'App/Models/Service';
import InvoiceContract from 'App/Models/InvoiceContract';

interface FilterInterface {
  start_date?: string;
  end_date?: string;
}

interface ItemInterface {
  memberName: string;
  company: string;
  email: string;
  phone: string;
  clientSince: string;
  activeServices: string;
  financial: string;
  nextRenewal: string;
  autoRenewal: string;
  ltv: string;
}

export default class MembersListingService {
  static async generate(coworkAccountId: number, filter: FilterInterface = {}) {
    const items = await this.getData(coworkAccountId, filter);
    const xlsx = await this.generateXls(items, filter);

    return xlsx;
  }

  private static async getData(coworkAccountId: number, filter: FilterInterface) {
    let items: ItemInterface[] = [];

    const contracts: Contract[] = await Contract.query()
      .preload('user', (q) => {
        q.preload('clientAccount');
      })
      .where('cowork_account_id', coworkAccountId)
      .where('status', ContractStatusEnum.ACTIVE)
      .where((q) => {
        if (filter.start_date && filter.end_date) {
          q.whereRaw('DATE(date_end) <= DATE(?)', [filter.end_date]);
          q.whereRaw('DATE(date_end) >= DATE(?)', [filter.start_date]);
        } else if (filter.start_date) {
          q.whereRaw('DATE(date_end) >= DATE(?)', [filter.start_date]);
        } else if (filter.end_date) {
          q.whereRaw('DATE(date_end) <= DATE(?)', [filter.end_date]);
        }
      })
      .orderBy('user_id');

    for (const contract of contracts) {
      const financialStatus = await this.getFinancial(contract.id);

      items.push({
        memberName: contract.user.fullName,
        company: contract.user.clientAccount?.companyName || '',
        email: contract.user.clientAccount?.companyEmail || '',
        phone: contract.user.clientAccount?.companyPhone || '',
        clientSince: contract.createdAt.toFormat('MM/dd/yyyy') || '',
        activeServices: Service.formatServiceName(contract.serviceType),
        financial: Invoice.getInvoiceStatusFormatted(financialStatus),
        nextRenewal: contract.autoRenewal ? contract.dateEnd.toFormat('MM/dd/yyyy') : '',
        autoRenewal: contract.autoRenewal ? 'Yes' : 'No',
        ltv: this.maskMoney(contract.amount)
      });
    }

    return items;
  }

  private static async generateXls(items: ItemInterface[], filter: FilterInterface) {
    const workbook = new ExcelJs.Workbook();
    const ws = workbook.addWorksheet('Members Listing');
    ws.properties.defaultColWidth = 20;
    ws.properties.defaultRowHeight = 20;

    let filterText = '';

    if (filter.start_date) {
      filterText += `from ${DateTime.fromFormat(filter.start_date, 'yyyy-MM-dd').toFormat(
        'MM/dd/yyyy'
      )} `;
    }

    if (filter.end_date) {
      filterText += `to ${DateTime.fromFormat(filter.end_date, 'yyyy-MM-dd').toFormat(
        'MM/dd/yyyy'
      )}`;
    }

    const columns = [
      'Member Name',
      'Company',
      'Email',
      'Phone',
      'Client Since',
      'Active Services',
      'Financial',
      'Next Renewal',
      'Auto-Renewal',
      'LTV'
    ];

    // Set header title
    const headerTitleColumns = `A1:${String.fromCharCode(64 + columns.length - 2)}1`;
    ws.mergeCells(headerTitleColumns);
    ws.getCell('A1').value = 'Members Listing';
    ws.getCell('A1').style = headerTitleStyle;
    ws.getRow(1).height = 30;

    // Set date filter title
    const headerFilterColumns = `${String.fromCharCode(
      64 + columns.length - 1
    )}1:${String.fromCharCode(64 + columns.length)}1`;
    ws.mergeCells(headerFilterColumns);
    ws.getCell(`${String.fromCharCode(64 + columns.length - 1)}1`).value = filterText;
    ws.getCell(`${String.fromCharCode(64 + columns.length - 1)}1`).style = headerFilterStyle;

    // Set columns titles
    for (const [idx, title] of columns.entries()) {
      const cell = `${String.fromCharCode(64 + idx + 1)}}2`;
      ws.getCell(cell).value = title;
      ws.getCell(cell).style = headerColumnTitlesStyle;
    }

    for (const [idx, item] of items.entries()) {
      const style = (idx + 3) % 2 ? rowLigth : rowDark;

      ws.getCell(`A${idx + 3}`).value = item.memberName;
      ws.getCell(`A${idx + 3}`).style = style;
      ws.getCell(`B${idx + 3}`).value = item.company;
      ws.getCell(`B${idx + 3}`).style = style;
      ws.getCell(`C${idx + 3}`).value = item.email;
      ws.getCell(`C${idx + 3}`).style = style;
      ws.getCell(`D${idx + 3}`).value = item.phone;
      ws.getCell(`D${idx + 3}`).style = style;
      ws.getCell(`E${idx + 3}`).value = item.clientSince;
      ws.getCell(`E${idx + 3}`).style = style;
      ws.getCell(`F${idx + 3}`).value = item.activeServices;
      ws.getCell(`F${idx + 3}`).style = style;
      ws.getCell(`G${idx + 3}`).value = item.financial;
      ws.getCell(`G${idx + 3}`).style = style;
      ws.getCell(`H${idx + 3}`).value = item.nextRenewal;
      ws.getCell(`H${idx + 3}`).style = style;
      ws.getCell(`I${idx + 3}`).value = item.autoRenewal;
      ws.getCell(`I${idx + 3}`).style = style;
      ws.getCell(`J${idx + 3}`).value = item.ltv;
      ws.getCell(`J${idx + 3}`).style = style;
    }

    return workbook.xlsx.writeBuffer();
  }

  private static async getFinancial(contractId: number) {
    const invoicesContracts = await InvoiceContract.query()
      .select('invoice_id')
      .where('contract_id', contractId);

    const invoicesIds = invoicesContracts.map((x) => x.invoiceId);

    const invoices: Invoice[] = await Invoice.query().whereIn('id', invoicesIds);

    // Check if has overdue invoice
    for (const invoice of invoices) {
      const isOverdue = await invoice.isOverdue();
      if (isOverdue) return 'OVERDUE';
    }

    // Check if has partially paid invoice
    for (const invoice of invoices) {
      if (invoice.status === InvoiceStatusEnum.PARTLY_PAID) return 'PARTLY_PAID';
    }

    // Check if has open invoices
    for (const invoice of invoices) {
      if (
        invoice.status === InvoiceStatusEnum.SENT ||
        invoice.status === InvoiceStatusEnum.VIEWED
      ) {
        return 'OPEN';
      }
    }

    return 'FULLY_PAID';
  }

  private static maskMoney(value: number) {
    return `$${Math.round(value / 100).toFixed(2)}`;
  }
}
