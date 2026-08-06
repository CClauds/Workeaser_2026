import ExcelJs from 'exceljs';
import Invoice from 'App/Models/Invoice';
import Location from 'App/Models/Location';
import { DateTime } from 'luxon';
import { InvoiceStatusEnum, ServicesEnum } from 'Contracts/enums';
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
  locationName: string;
  virtualOffice: string;
  meetingRoom: string;
  openDesk: string;
  privateRoom: string;
  others: string;
  subTotal: string;
  taxes: string;
  totalRevenue: string;
}

export default class RevenueByLocationService {
  static async generate(coworkAccountId: number, filter: FilterInterface = {}) {
    const data = await this.getData(coworkAccountId, filter);
    const xlsx = await this.generateXls(
      data.items,
      data.virtualOffice,
      data.meetingRoom,
      data.openDesk,
      data.privateRoom,
      data.others,
      data.subTotal,
      data.taxes,
      data.totalRevenue,
      filter
    );

    return xlsx;
  }

  private static async getData(coworkAccountId: number, filter: FilterInterface) {
    let items: ItemInterface[] = [];
    let totalVirtualOffice = 0;
    let totalMeetingRoom = 0;
    let totalOpenDesk = 0;
    let totalPrivateRoom = 0;
    let totalOthers = 0;
    let totalSubTotal = 0;
    let totalTaxes = 0;
    let totalTotalRevenue = 0;

    const locations: Location[] = await Location.query().where(
      'cowork_account_id',
      coworkAccountId
    );

    for (const location of locations) {
      let virtualOffice = 0;
      let meetingRoom = 0;
      let openDesk = 0;
      let privateRoom = 0;
      let others = 0;
      let subTotal = 0;
      let taxes = 0;
      let totalRevenue = 0;

      const invoices: Invoice[] = await Invoice.query()
        .where('location_id', location.id)
        .whereIn('status', [InvoiceStatusEnum.FULLY_PAID])
        .where((q) => {
          if (filter.start_date && filter.end_date) {
            q.whereRaw('DATE(date) <= DATE(?)', [filter.end_date]);
            q.whereRaw('DATE(date) >= DATE(?)', [filter.start_date]);
          } else if (filter.start_date) {
            q.whereRaw('DATE(date) >= DATE(?)', [filter.start_date]);
          } else if (filter.end_date) {
            q.whereRaw('DATE(date) <= DATE(?)', [filter.end_date]);
          }
        })
        .preload('items', (q) => {
          q.whereNull('deleted_at');
        });

      for (const invoice of invoices) {
        subTotal += invoice.subtotal;
        taxes += invoice.totalTaxes;
        totalRevenue += invoice.total;

        for (const item of invoice.items) {
          switch (item.serviceType) {
            case ServicesEnum.MEETING_ROOM:
              meetingRoom += item.unitPrice * item.quantity;
              break;
            case ServicesEnum.OPEN_DESK:
              openDesk += item.unitPrice * item.quantity;
              break;
            case ServicesEnum.PRIVATE_ROOM:
              privateRoom += item.unitPrice * item.quantity;
              break;
            case ServicesEnum.VIRTUAL_OFFICE:
              virtualOffice += item.unitPrice * item.quantity;
              break;
            default:
              others += item.unitPrice * item.quantity;
              break;
          }
        }

        const isOverdue = await invoice.isOverdue();
        if (isOverdue) {
          taxes += invoice.totalTaxesOverdue;
          totalRevenue += invoice.totalTaxesOverdue;
        }
      }

      items.push({
        locationName: location.name,
        virtualOffice: this.maskMoney(virtualOffice),
        meetingRoom: this.maskMoney(meetingRoom),
        openDesk: this.maskMoney(openDesk),
        privateRoom: this.maskMoney(privateRoom),
        others: this.maskMoney(others),
        subTotal: this.maskMoney(subTotal),
        taxes: this.maskMoney(taxes),
        totalRevenue: this.maskMoney(totalRevenue)
      });

      totalMeetingRoom += meetingRoom;
      totalOpenDesk += openDesk;
      totalPrivateRoom += privateRoom;
      totalVirtualOffice += virtualOffice;
      totalOthers += others;
      totalSubTotal += subTotal;
      totalTaxes += taxes;
      totalTotalRevenue += totalRevenue;
    }

    return {
      items: items,
      virtualOffice: this.maskMoney(totalVirtualOffice),
      meetingRoom: this.maskMoney(totalMeetingRoom),
      openDesk: this.maskMoney(totalOpenDesk),
      privateRoom: this.maskMoney(totalPrivateRoom),
      others: this.maskMoney(totalOthers),
      subTotal: this.maskMoney(totalSubTotal),
      taxes: this.maskMoney(totalTaxes),
      totalRevenue: this.maskMoney(totalTotalRevenue)
    };
  }

  private static async generateXls(
    items: ItemInterface[],
    virtualOffice: string,
    meetingRoom: string,
    openDesk: string,
    privateRoom: string,
    others: string,
    subTotal: string,
    taxes: string,
    totalRevenue: string,
    filter: FilterInterface
  ) {
    const workbook = new ExcelJs.Workbook();
    const ws = workbook.addWorksheet('Revenue by Location');
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
      'Location',
      'Virtual Office',
      'Meeting Room',
      'Open Desk',
      'Private Room',
      'Others',
      'Sub Total',
      'Taxes',
      'Total Revenue'
    ];

    // Set header title
    const headerTitleColumns = `A1:${String.fromCharCode(64 + columns.length - 2)}1`;
    ws.mergeCells(headerTitleColumns);
    ws.getCell('A1').value = 'Revenue by Location';
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

      ws.getCell(`A${idx + 3}`).value = item.locationName;
      ws.getCell(`A${idx + 3}`).style = style;
      ws.getCell(`B${idx + 3}`).value = item.virtualOffice;
      ws.getCell(`B${idx + 3}`).style = style;
      ws.getCell(`C${idx + 3}`).value = item.meetingRoom;
      ws.getCell(`C${idx + 3}`).style = style;
      ws.getCell(`D${idx + 3}`).value = item.openDesk;
      ws.getCell(`D${idx + 3}`).style = style;
      ws.getCell(`E${idx + 3}`).value = item.privateRoom;
      ws.getCell(`E${idx + 3}`).style = style;
      ws.getCell(`F${idx + 3}`).value = item.others;
      ws.getCell(`F${idx + 3}`).style = style;
      ws.getCell(`G${idx + 3}`).value = item.subTotal;
      ws.getCell(`G${idx + 3}`).style = style;
      ws.getCell(`H${idx + 3}`).value = item.taxes;
      ws.getCell(`H${idx + 3}`).style = style;
      ws.getCell(`I${idx + 3}`).value = item.totalRevenue;
      ws.getCell(`I${idx + 3}`).style = style;
    }

    ws.getCell(`B${items.length + 3}`).value = virtualOffice;
    ws.getCell(`B${items.length + 3}`).style = cellBlue;
    ws.getCell(`C${items.length + 3}`).value = meetingRoom;
    ws.getCell(`C${items.length + 3}`).style = cellBlue;
    ws.getCell(`D${items.length + 3}`).value = openDesk;
    ws.getCell(`D${items.length + 3}`).style = cellBlue;
    ws.getCell(`E${items.length + 3}`).value = privateRoom;
    ws.getCell(`E${items.length + 3}`).style = cellBlue;
    ws.getCell(`F${items.length + 3}`).value = others;
    ws.getCell(`F${items.length + 3}`).style = cellBlue;
    ws.getCell(`G${items.length + 3}`).value = subTotal;
    ws.getCell(`G${items.length + 3}`).style = cellBlue;
    ws.getCell(`H${items.length + 3}`).value = taxes;
    ws.getCell(`H${items.length + 3}`).style = cellBlue;
    ws.getCell(`I${items.length + 3}`).value = totalRevenue;
    ws.getCell(`I${items.length + 3}`).style = cellBlue;

    return workbook.xlsx.writeBuffer();
  }

  private static maskMoney(value: number) {
    return `$${Math.round(value / 100).toFixed(2)}`;
  }
}
