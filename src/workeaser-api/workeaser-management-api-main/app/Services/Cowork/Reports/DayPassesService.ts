import ExcelJs from 'exceljs';
import Desk from 'App/Models/Desk';
import Room from 'App/Models/Room';
import DayPass from 'App/Models/DayPass';
import { DateTime } from 'luxon';
import {
  DayPassPaymentMethodEnum,
  DayPassStatusEnum,
  DayPassUserTypeEnum,
  ServicesEnum
} from 'Contracts/enums';
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
  date: string;
  memberName: string;
  company: string;
  email: string;
  phone: string;
  visiting: string;
  resource: string;
  paymentMethod: string;
  passPrice: string;
}

export default class DayPassesService {
  static async generate(coworkAccountId: number, filter: FilterInterface = {}) {
    const data = await this.getData(coworkAccountId, filter);
    const xlsx = await this.generateXls(data.items, data.total, filter);

    return xlsx;
  }

  private static async getData(coworkAccountId: number, filter: FilterInterface) {
    let items: ItemInterface[] = [];
    let total = 0;

    const query = DayPass.query()
      .where('cowork_account_id', coworkAccountId)
      .where('status', DayPassStatusEnum.APPROVED)
      .preload('location')
      .preload('client', (query) => {
        query.preload('clientAccount');
      })
      .preload('lead', (query) => {
        query.preload('clientAccount', (clientAccountQuery) => {
          clientAccountQuery.preload('user');
        });
      })
      .whereHas('location', (q) => {
        q.whereNull('deleted_at');
      })
      .where((w) => {
        w.whereHas('client', (q) => {
          q.whereNull('deleted_at');
        });
        w.orWhereHas('lead', (q) => {
          q.whereNull('deleted_at');
          q.whereHas('clientAccount', (c) => {
            c.whereNull('deleted_at');
            c.whereHas('user', (u) => {
              u.whereNull('deleted_at');
            });
          });
        });
      });

    if (filter.start_date && filter.end_date) {
      query.whereRaw('DATE(date) <= DATE(?)', [filter.end_date]);
      query.whereRaw('DATE(date) >= DATE(?)', [filter.start_date]);
    } else if (filter.start_date) {
      query.whereRaw('DATE(date) >= DATE(?)', [filter.start_date]);
    } else if (filter.end_date) {
      query.whereRaw('DATE(date) <= DATE(?)', [filter.end_date]);
    }

    const dayPasses: DayPass[] = await query;

    for (const dayPass of dayPasses) {
      let price = '';
      const userInfo = this.getUser(dayPass);
      const serviceName = await this.getServiceName(dayPass.resourceId, dayPass.space);

      if (
        dayPass.userType === DayPassUserTypeEnum.CLIENT &&
        dayPass.paymentMethod === DayPassPaymentMethodEnum.CAPTURE &&
        dayPass.priceCharged
      ) {
        price = this.maskMoney(dayPass.priceCharged);
        total += dayPass.priceCharged;
      }

      items.push({
        date: dayPass.date.toFormat('MM/dd/yyyy'),
        memberName: userInfo.name,
        company: userInfo.company,
        email: userInfo.email,
        phone: userInfo.phone,
        visiting: dayPass.location ? dayPass.location.name : '',
        resource: serviceName,
        paymentMethod: this.getPaymentMethod(dayPass.paymentMethod),
        passPrice: price
      });
    }

    return { items: items, total: this.maskMoney(total) };
  }

  private static async generateXls(items: ItemInterface[], total: string, filter: FilterInterface) {
    const workbook = new ExcelJs.Workbook();
    const ws = workbook.addWorksheet('Day Passes Listing');
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
      'Name',
      'Company',
      'Email',
      'Phone',
      'Visiting',
      'Resource',
      'Payment Method',
      'Pass Price'
    ];

    // Set header title
    const headerTitleColumns = `A1:${String.fromCharCode(64 + columns.length - 2)}1`;
    ws.mergeCells(headerTitleColumns);
    ws.getCell('A1').value = 'Day Passes Listing';
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
      ws.getCell(`B${idx + 3}`).value = item.memberName;
      ws.getCell(`B${idx + 3}`).style = style;
      ws.getCell(`C${idx + 3}`).value = item.company;
      ws.getCell(`C${idx + 3}`).style = style;
      ws.getCell(`D${idx + 3}`).value = item.email;
      ws.getCell(`D${idx + 3}`).style = style;
      ws.getCell(`E${idx + 3}`).value = item.phone;
      ws.getCell(`E${idx + 3}`).style = style;
      ws.getCell(`F${idx + 3}`).value = item.visiting;
      ws.getCell(`F${idx + 3}`).style = style;
      ws.getCell(`G${idx + 3}`).value = item.resource;
      ws.getCell(`G${idx + 3}`).style = style;
      ws.getCell(`H${idx + 3}`).value = item.paymentMethod;
      ws.getCell(`H${idx + 3}`).style = style;
      ws.getCell(`I${idx + 3}`).value = item.passPrice;
      ws.getCell(`I${idx + 3}`).style = style;
    }

    ws.getCell(`I${items.length + 3}`).value = total;
    ws.getCell(`I${items.length + 3}`).style = cellBlue;

    return workbook.xlsx.writeBuffer();
  }

  private static maskMoney(value: number) {
    return `$${Math.round(value / 100).toFixed(2)}`;
  }

  private static async getServiceName(id: number, space: ServicesEnum | string) {
    let result = '';

    switch (space) {
      case ServicesEnum.OPEN_DESK:
        const desk = await Desk.find(id);
        if (desk) {
          result = desk.name;
        }
        break;
      case ServicesEnum.PRIVATE_ROOM:
        const room = await Room.find(id);
        if (room) {
          result = room.name;
        }
        break;
    }

    return result;
  }

  private static getUser(daypass: DayPass) {
    const client = { name: '', email: '', phone: '', company: '' };

    switch (daypass.userType) {
      case DayPassUserTypeEnum.CLIENT:
        client.name = daypass.client.fullName;
        client.email = daypass.client.email;
        client.phone = daypass.client.clientAccount.companyPhone || '';
        client.company = daypass.client.clientAccount.companyName || '';
        break;
      case DayPassUserTypeEnum.LEAD:
        client.name = daypass.lead.clientAccount.user.fullName;
        client.email = daypass.lead.clientAccount.user.email;
        client.phone = daypass.lead.clientAccount.companyPhone || '';
        client.company = daypass.lead.clientAccount.companyName || '';
        break;
    }

    return client;
  }

  private static getPaymentMethod(method: string) {
    switch (method) {
      case DayPassPaymentMethodEnum.BENEFIT:
        return 'Benefit';
      case DayPassPaymentMethodEnum.CAPTURE:
        return 'Capture';
      case DayPassPaymentMethodEnum.COURTESY:
        return 'Courtesy';
      default:
        return '';
    }
  }
}
