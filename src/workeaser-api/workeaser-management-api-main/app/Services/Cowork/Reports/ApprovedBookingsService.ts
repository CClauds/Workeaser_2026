import Invoice from 'App/Models/Invoice';
import Meeting from 'App/Models/Meeting';
import ExcelJs from 'exceljs';
import { DateTime } from 'luxon';
import { MeetingPaymentMethodEnum, MeetingStatusEnum } from 'Contracts/enums';
import {
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
  dateToSort: DateTime; // Only for sort
  date: string;
  from?: string;
  to?: string;
  total: string;
  resource: string;
  memberName: string;
  invoiceNumber?: string;
  totalCharged?: string;
  invoiceStatus?: string;
}

export default class ApprovedBookingsService {
  static async generate(coworkAccountId: number, filter: FilterInterface = {}) {
    const data = await this.getData(coworkAccountId, filter);
    const xlsx = await this.generateXls(data, filter);

    return xlsx;
  }

  private static async getData(coworkAccountId: number, filter: FilterInterface) {
    let items: ItemInterface[] = [];

    const query = Meeting.query()
      .where('cowork_account_id', coworkAccountId)
      .where('status', MeetingStatusEnum.APPROVED)
      .preload('user')
      .preload('meetroom')
      .preload('billings')
      .preload('location')
      .preload('invoice')
      .whereHas('location', (q) => {
        q.whereNull('deleted_at');
      })
      .whereHas('user', (q) => {
        q.whereNull('deleted_at');
      })
      .whereHas('meetroom', (q) => {
        q.whereNull('deleted_at');
      });

    if (filter.start_date && filter.end_date) {
      query.whereRaw('DATE(date_start) <= DATE(?)', [filter.end_date]);
      query.whereRaw('DATE(date_start) >= DATE(?)', [filter.start_date]);
    } else if (filter.start_date) {
      query.whereRaw('DATE(date_start) >= DATE(?)', [filter.start_date]);
    } else if (filter.end_date) {
      query.whereRaw('DATE(date_start) <= DATE(?)', [filter.end_date]);
    }

    const meetings = await query;

    for (const meeting of meetings) {
      const total = this.calcTotal(
        meeting.quantityMinutes,
        meeting.pricePerHour,
        meeting.amountDiscount
      );
      let charged;
      let invoiceStatus;

      if (meeting.paymentMethod === MeetingPaymentMethodEnum.CAPTURE) {
        charged = meeting.invoice.total;
        invoiceStatus = meeting.invoice.status;
      }

      if (meeting.paymentMethod === MeetingPaymentMethodEnum.BILLING && meeting.billings[0]) {
        charged = this.calcTotal(
          meeting.billings[0].quantityMinutes,
          meeting.pricePerHour,
          meeting.amountDiscount
        );
      }

      items.push({
        dateToSort: meeting.dateStart,
        date: meeting.dateStart.toFormat('MM/dd/yyyy'),
        from: meeting.dateStart.toFormat('HH:mm a'),
        to: meeting.dateEnd.toFormat('HH:mm a'),
        total: this.maskMoney(total),
        resource: meeting.meetroom.name,
        memberName: meeting.user.fullName,
        invoiceNumber: meeting.invoice
          ? `#${meeting.invoice.id.toString().padStart(6, '0')}`
          : '---',
        totalCharged: charged ? this.maskMoney(charged) : '---',
        invoiceStatus: invoiceStatus ? Invoice.getInvoiceStatusFormatted(invoiceStatus) : '---'
      });

      items = items.sort((a, b) => a.dateToSort.toMillis() - b.dateToSort.toMillis());
    }

    return items;
  }

  private static async generateXls(items: ItemInterface[], filter: FilterInterface) {
    const workbook = new ExcelJs.Workbook();
    const ws = workbook.addWorksheet('Approved Bookings');
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
      'Date',
      'From',
      'To',
      'Total',
      'Resource',
      'Member Name',
      'Invoice Number',
      'Total Charged',
      'Invoice Status'
    ];

    // Set header title
    const headerTitleColumns = `A1:${String.fromCharCode(64 + columns.length - 2)}1`;
    ws.mergeCells(headerTitleColumns);
    ws.getCell('A1').value = 'Approved Bookings';
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

      ws.getCell(`A${idx + 3}`).value = item.date;
      ws.getCell(`A${idx + 3}`).style = style;
      ws.getCell(`B${idx + 3}`).value = item.from;
      ws.getCell(`B${idx + 3}`).style = style;
      ws.getCell(`C${idx + 3}`).value = item.to;
      ws.getCell(`C${idx + 3}`).style = style;
      ws.getCell(`D${idx + 3}`).value = item.total;
      ws.getCell(`D${idx + 3}`).style = style;
      ws.getCell(`E${idx + 3}`).value = item.resource;
      ws.getCell(`E${idx + 3}`).style = style;
      ws.getCell(`F${idx + 3}`).value = item.memberName;
      ws.getCell(`F${idx + 3}`).style = style;
      ws.getCell(`G${idx + 3}`).value = item.invoiceNumber;
      ws.getCell(`G${idx + 3}`).style = style;
      ws.getCell(`H${idx + 3}`).value = item.totalCharged;
      ws.getCell(`H${idx + 3}`).style = style;
      ws.getCell(`I${idx + 3}`).value = item.invoiceStatus;
      ws.getCell(`I${idx + 3}`).style = style;
    }

    return workbook.xlsx.writeBuffer();
  }

  private static maskMoney(value: number) {
    return `$${Math.round(value / 100).toFixed(2)}`;
  }

  private static calcTotal(
    quantityMinutes: number,
    pricePerHour: number,
    amountDiscount: number = 0
  ) {
    return Math.round((quantityMinutes / 60) * (pricePerHour / 100) * 100) - amountDiscount;
  }
}
