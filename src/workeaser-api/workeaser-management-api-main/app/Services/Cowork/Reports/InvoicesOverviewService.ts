import ExcelJs from 'exceljs';
import Invoice from 'App/Models/Invoice';
import { DateTime } from 'luxon';
import {
  headerColumnTitlesStyle,
  headerFilterStyle,
  headerTitleStyle,
  rowDark,
  rowLigth,
  cellBlue
} from './Styles';

interface FilterInterface {
  start_date?: string;
  end_date?: string;
}

interface ItemInterface {
  invoiceNumber: string;
  memberName: string;
  createdOn: string;
  dueDate: string;
  status: string;
  lastPayment: string;
  openAmount: string;
  subTotal: string;
  taxes: string;
  totalRevenue: string;
}

export default class InvoicesOverviewService {
  static async generate(coworkAccountId: number, filter: FilterInterface = {}) {
    const data = await this.getData(coworkAccountId, filter);
    const xlsx = await this.generateXls(
      data.items,
      data.openAmount,
      data.subTotal,
      data.taxes,
      data.totalRevenue,
      filter
    );

    return xlsx;
  }

  private static async getData(coworkAccountId: number, filter: FilterInterface) {
    let items: ItemInterface[] = [];
    let openAmount = 0;
    let subTotal = 0;
    let taxes = 0;
    let totalRevenue = 0;

    const query = Invoice.query()
      .where('cowork_account_id', coworkAccountId)
      .preload('user')
      .whereHas('user', (userQuery) => {
        userQuery.whereNull('deleted_at');
      });

    if (filter.start_date && filter.end_date) {
      query.whereRaw('DATE(date) <= DATE(?)', [filter.end_date]);
      query.whereRaw('DATE(date) >= DATE(?)', [filter.start_date]);
    } else if (filter.start_date) {
      query.whereRaw('DATE(date) >= DATE(?)', [filter.start_date]);
    } else if (filter.end_date) {
      query.whereRaw('DATE(date) <= DATE(?)', [filter.end_date]);
    }

    const invoices: Invoice[] = await query;

    for (const invoice of invoices) {
      const invoiceDetailed = await invoice.getDetailed();
      let lastPayment = '';

      if (invoiceDetailed.historic.length) {
        const last = invoiceDetailed.historic[invoiceDetailed.historic.length - 1];

        if (last) {
          lastPayment = DateTime.fromISO(last.created_at).toFormat('MM/dd/yyyy');
        }
      }

      items.push({
        invoiceNumber: `#${invoice.id.toString().padStart(6, '0')}`,
        memberName: invoice.user.fullName,
        createdOn: invoice.date.toFormat('MM/dd/yyyy'),
        dueDate: invoice.dueDate.toFormat('MM/dd/yyyy'),
        status: Invoice.getInvoiceStatusFormatted(invoice.status),
        lastPayment: lastPayment,
        openAmount: this.maskMoney(invoiceDetailed.open_amount),
        subTotal: this.maskMoney(invoice.subtotal),
        taxes: this.maskMoney(invoice.totalTaxes),
        totalRevenue: this.maskMoney(invoice.total)
      });

      openAmount += invoiceDetailed.open_amount;
      subTotal += invoice.subtotal;
      taxes += invoice.totalTaxes;
      totalRevenue += invoice.total;
    }

    return {
      items: items,
      openAmount: this.maskMoney(openAmount),
      subTotal: this.maskMoney(subTotal),
      taxes: this.maskMoney(taxes),
      totalRevenue: this.maskMoney(totalRevenue)
    };
  }

  private static async generateXls(
    items: ItemInterface[],
    openAmount: string,
    subTotal: string,
    taxes: string,
    totalRevenue: string,
    filter: FilterInterface
  ) {
    const workbook = new ExcelJs.Workbook();
    const ws = workbook.addWorksheet('Invoices Overview');
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
      'Invoice Number',
      'Member Name',
      'Created On',
      'Due Date',
      'Status',
      'Last Payment',
      'Open Amount',
      'Sub Total',
      'Taxes',
      'Total Revenue'
    ];

    // Set header title
    const headerTitleColumns = `A1:${String.fromCharCode(64 + columns.length - 2)}1`;
    ws.mergeCells(headerTitleColumns);
    ws.getCell('A1').value = 'Invoices Overview';
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

      ws.getCell(`A${idx + 3}`).value = item.invoiceNumber;
      ws.getCell(`A${idx + 3}`).style = style;
      ws.getCell(`B${idx + 3}`).value = item.memberName;
      ws.getCell(`B${idx + 3}`).style = style;
      ws.getCell(`C${idx + 3}`).value = item.createdOn;
      ws.getCell(`C${idx + 3}`).style = style;
      ws.getCell(`D${idx + 3}`).value = item.dueDate;
      ws.getCell(`D${idx + 3}`).style = style;
      ws.getCell(`E${idx + 3}`).value = item.status;
      ws.getCell(`E${idx + 3}`).style = style;
      ws.getCell(`F${idx + 3}`).value = item.lastPayment;
      ws.getCell(`F${idx + 3}`).style = style;
      ws.getCell(`G${idx + 3}`).value = item.openAmount;
      ws.getCell(`G${idx + 3}`).style = style;
      ws.getCell(`H${idx + 3}`).value = item.subTotal;
      ws.getCell(`H${idx + 3}`).style = style;
      ws.getCell(`I${idx + 3}`).value = item.taxes;
      ws.getCell(`I${idx + 3}`).style = style;
      ws.getCell(`J${idx + 3}`).value = item.totalRevenue;
      ws.getCell(`J${idx + 3}`).style = style;
    }

    ws.getCell(`G${items.length + 3}`).value = openAmount;
    ws.getCell(`G${items.length + 3}`).style = cellBlue;
    ws.getCell(`H${items.length + 3}`).value = subTotal;
    ws.getCell(`H${items.length + 3}`).style = cellBlue;
    ws.getCell(`I${items.length + 3}`).value = taxes;
    ws.getCell(`I${items.length + 3}`).style = cellBlue;
    ws.getCell(`J${items.length + 3}`).value = totalRevenue;
    ws.getCell(`J${items.length + 3}`).style = cellBlue;

    return workbook.xlsx.writeBuffer();
  }

  private static maskMoney(value: number) {
    return `$${Math.round(value / 100).toFixed(2)}`;
  }
}
