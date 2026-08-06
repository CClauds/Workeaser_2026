import ExcelJs from 'exceljs';
import Invoice from 'App/Models/Invoice';
import { DateTime } from 'luxon';
import { InvoiceStatusEnum } from 'Contracts/enums';
import {
  cellBlue,
  headerColumnTitlesStyle,
  headerFilterStyle,
  headerTitleStyle,
  rowDark,
  rowLigth
} from './Styles';

interface FilterInterface {
  start_date?: string;
  end_date?: string;
}

interface ItemInterface {
  userId: number;
  memberName: string;
  companyName: string;
  subTotal: number;
  taxes: number;
  totalRevenue: number;
}

export default class RevenueByMemberService {
  static async generate(coworkAccountId: number, filter: FilterInterface = {}) {
    const data = await this.getData(coworkAccountId, filter);
    const xlsx = await this.generateXls(
      data.items,
      data.subTotal,
      data.taxes,
      data.totalRevenue,
      filter
    );

    return xlsx;
  }

  private static async getData(coworkAccountId: number, filter: FilterInterface) {
    let items: ItemInterface[] = [];

    let totalSubTotal = 0;
    let totalTaxes = 0;
    let totalTotalRevenue = 0;

    const invoices: Invoice[] = await Invoice.query()
      .preload('user', (u) => {
        u.preload('clientAccount');
      })
      .where('cowork_account_id', coworkAccountId)
      .where('status', InvoiceStatusEnum.FULLY_PAID)
      .whereHas('location', (l) => {
        l.whereNull('deleted_at');
      })
      .whereHas('user', (l) => {
        l.whereNull('deleted_at');
      })
      .where((q) => {
        if (filter.start_date && filter.end_date) {
          q.whereRaw('DATE(date) <= DATE(?)', [filter.end_date]);
          q.whereRaw('DATE(date) >= DATE(?)', [filter.start_date]);
        } else if (filter.start_date) {
          q.whereRaw('DATE(date) >= DATE(?)', [filter.start_date]);
        } else if (filter.end_date) {
          q.whereRaw('DATE(date) <= DATE(?)', [filter.end_date]);
        }
      });

    for (const invoice of invoices) {
      let taxes = invoice.totalTaxes;
      let totalRevenue = invoice.total;

      const isOverdue = await invoice.isOverdue();
      if (isOverdue) {
        taxes += invoice.totalTaxesOverdue;
        totalRevenue += invoice.totalTaxesOverdue;
      }

      const existUser = items.findIndex((i) => i.userId === invoice.userId);

      if (existUser < 0) {
        items.push({
          userId: invoice.userId,
          memberName: invoice.user.fullName,
          companyName: invoice.user.clientAccount.companyName || '',
          subTotal: invoice.subtotal,
          taxes: taxes,
          totalRevenue: totalRevenue
        });
      } else {
        items[existUser].subTotal += invoice.subtotal;
        items[existUser].taxes += taxes;
        items[existUser].totalRevenue += totalRevenue;
      }

      totalSubTotal += invoice.subtotal;
      totalTaxes += taxes;
      totalTotalRevenue += totalRevenue;
    }

    return {
      items: items,
      subTotal: this.maskMoney(totalSubTotal),
      taxes: this.maskMoney(totalTaxes),
      totalRevenue: this.maskMoney(totalTotalRevenue)
    };
  }

  private static async generateXls(
    items: ItemInterface[],
    subTotal: string,
    taxes: string,
    totalRevenue: string,
    filter: FilterInterface
  ) {
    const workbook = new ExcelJs.Workbook();
    const ws = workbook.addWorksheet('Revenue by Member');
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

    const columns = ['Member Name', 'Company Name', 'Sub Total', 'Taxes', 'Total Revenue'];

    // Set header title
    const headerTitleColumns = `A1:${String.fromCharCode(64 + columns.length - 2)}1`;
    ws.mergeCells(headerTitleColumns);
    ws.getCell('A1').value = 'Revenue by Member';
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
      ws.getCell(`B${idx + 3}`).value = item.companyName;
      ws.getCell(`B${idx + 3}`).style = style;
      ws.getCell(`C${idx + 3}`).value = this.maskMoney(item.subTotal);
      ws.getCell(`C${idx + 3}`).style = style;
      ws.getCell(`D${idx + 3}`).value = this.maskMoney(item.taxes);
      ws.getCell(`D${idx + 3}`).style = style;
      ws.getCell(`E${idx + 3}`).value = this.maskMoney(item.totalRevenue);
      ws.getCell(`E${idx + 3}`).style = style;
    }

    ws.getCell(`C${items.length + 3}`).value = subTotal;
    ws.getCell(`C${items.length + 3}`).style = cellBlue;
    ws.getCell(`D${items.length + 3}`).value = taxes;
    ws.getCell(`D${items.length + 3}`).style = cellBlue;
    ws.getCell(`E${items.length + 3}`).value = totalRevenue;
    ws.getCell(`E${items.length + 3}`).style = cellBlue;

    return workbook.xlsx.writeBuffer();
  }

  private static maskMoney(value: number) {
    return `$${Math.round(value / 100).toFixed(2)}`;
  }
}
