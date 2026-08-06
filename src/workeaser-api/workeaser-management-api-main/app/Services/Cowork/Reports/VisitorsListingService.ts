import DayPass from 'App/Models/DayPass';
import Tour from 'App/Models/Tour';
import { DayPassStatusEnum, DayPassUserTypeEnum, ToursStatusEnum } from 'Contracts/enums';
import ExcelJs from 'exceljs';
import { DateTime } from 'luxon';
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
  date: DateTime;
  name: string;
  company: string;
  email: string;
  phone: string;
  visiting: string;
}

export default class VisitorsListingService {
  static async generate(coworkAccountId: number, filter: FilterInterface = {}) {
    const items = await this.getData(coworkAccountId, filter);
    const xlsx = await this.generateXls(items, filter);

    return xlsx;
  }

  private static async getData(coworkAccountId: number, filter: FilterInterface) {
    let items: ItemInterface[] = [];

    const tours: Tour[] = await Tour.query()
      .preload('user', (l) => {
        l.preload('clientAccount');
      })
      .preload('location')
      .where('status', ToursStatusEnum.APPROVED)
      .whereHas('location', (q) => {
        q.where('cowork_account_id', coworkAccountId);
        q.whereNull('deleted_at');
      })
      .where((q) => {
        if (filter.start_date && filter.end_date) {
          q.whereRaw('DATE(date_start) <= DATE(?)', [filter.end_date]);
          q.whereRaw('DATE(date_start) >= DATE(?)', [filter.start_date]);
        } else if (filter.start_date) {
          q.whereRaw('DATE(date_start) >= DATE(?)', [filter.start_date]);
        } else if (filter.end_date) {
          q.whereRaw('DATE(date_start) <= DATE(?)', [filter.end_date]);
        }
      });

    const dayPasses: DayPass[] = await DayPass.query()
      .where('user_type', DayPassUserTypeEnum.LEAD)
      .where('status', DayPassStatusEnum.APPROVED)
      .preload('lead', (l) => {
        l.preload('clientAccount', (c) => {
          c.preload('user');
        });
      })
      .preload('location')
      .whereHas('location', (q) => {
        q.where('cowork_account_id', coworkAccountId);
        q.whereNull('deleted_at');
      })
      .whereHas('lead', (l) => {
        l.whereNull('deleted_at');
        l.whereHas('clientAccount', (c) => {
          c.whereNull('deleted_at');
          c.whereHas('user', (u) => {
            u.whereNull('deleted_at');
          });
        });
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

    for (const tour of tours) {
      items.push({
        date: tour.dateStart,
        name: tour.user.fullName || '',
        company: tour.user.clientAccount.companyName || '',
        email: tour.user.email || '',
        phone: tour.user.personalPhone || '',
        visiting: tour.location.name || ''
      });
    }

    for (const dayPass of dayPasses) {
      items.push({
        date: dayPass.date,
        name: dayPass.lead.clientAccount.user.fullName || '',
        company: dayPass.lead.clientAccount.companyName || '',
        email: dayPass.lead.clientAccount.user.email || '',
        phone: dayPass.lead.clientAccount.user.personalPhone || '',
        visiting: dayPass.location.name || ''
      });
    }

    items = items.sort((a, b) => b.date.toMillis() - a.date.toMillis());

    return items;
  }

  private static async generateXls(items: ItemInterface[], filter: FilterInterface) {
    const workbook = new ExcelJs.Workbook();
    const ws = workbook.addWorksheet('Visitors Listing');
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

    const columns = ['Date', 'Name', 'Company', 'Email', 'Phone', 'Visiting'];

    // Set header title
    const headerTitleColumns = `A1:${String.fromCharCode(64 + columns.length - 2)}1`;
    ws.mergeCells(headerTitleColumns);
    ws.getCell('A1').value = 'Visitors Listing';
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

      ws.getCell(`A${idx + 3}`).value = item.date.toFormat('MM/dd/yyyy');
      ws.getCell(`A${idx + 3}`).style = style;
      ws.getCell(`B${idx + 3}`).value = item.name;
      ws.getCell(`B${idx + 3}`).style = style;
      ws.getCell(`C${idx + 3}`).value = item.company;
      ws.getCell(`C${idx + 3}`).style = style;
      ws.getCell(`D${idx + 3}`).value = item.email;
      ws.getCell(`D${idx + 3}`).style = style;
      ws.getCell(`E${idx + 3}`).value = item.phone;
      ws.getCell(`E${idx + 3}`).style = style;
      ws.getCell(`F${idx + 3}`).value = item.visiting;
      ws.getCell(`F${idx + 3}`).style = style;
    }

    return workbook.xlsx.writeBuffer();
  }
}
