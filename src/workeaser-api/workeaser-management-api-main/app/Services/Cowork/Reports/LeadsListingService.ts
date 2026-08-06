import ExcelJs from 'exceljs';
import LeadOpportunity from 'App/Models/LeadOpportunity';
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
  memberName: string;
  company: string;
  email: string;
  phone: string;
  interest: string;
  lastContact: string;
}

export default class LeadsListingService {
  static async generate(coworkAccountId: number, filter: FilterInterface = {}) {
    const items = await this.getData(coworkAccountId, filter);
    const xlsx = await this.generateXls(items, filter);

    return xlsx;
  }

  private static async getData(coworkAccountId: number, filter: FilterInterface) {
    let items: ItemInterface[] = [];

    const query = LeadOpportunity.query()
      .preload('lead', (l) => {
        l.preload('clientAccount', (c) => {
          c.preload('user');
        });
      })
      .preload('service')
      .orderBy('lead_id', 'asc')
      .whereHas('lead', (q) => {
        q.whereNull('deleted_at');
        q.where('cowork_account_id', coworkAccountId);
        q.whereHas('clientAccount', (c) => {
          c.whereNull('deleted_at');
          c.whereHas('user', (u) => {
            u.whereNull('deleted_at');
          });
        });

        if (filter.start_date && filter.end_date) {
          q.whereRaw('DATE(last_contact) <= DATE(?)', [filter.end_date]);
          q.whereRaw('DATE(last_contact) >= DATE(?)', [filter.start_date]);
        } else if (filter.start_date) {
          q.whereRaw('DATE(last_contact) >= DATE(?)', [filter.start_date]);
        } else if (filter.end_date) {
          q.whereRaw('DATE(last_contact) <= DATE(?)', [filter.end_date]);
        }
      });

    const opportunities: LeadOpportunity[] = await query;

    for (const opportunity of opportunities) {
      items.push({
        memberName: opportunity.lead.clientAccount.user.fullName,
        company: opportunity.lead.clientAccount.companyName || '',
        email: opportunity.lead.clientAccount.companyEmail || '',
        phone: opportunity.lead.clientAccount.companyPhone || '',
        interest: opportunity.service.name,
        lastContact: opportunity.lead.lastContact
          ? opportunity.lead.lastContact.toFormat('MM/dd/yyyy')
          : ''
      });
    }

    return items;
  }

  private static async generateXls(items: ItemInterface[], filter: FilterInterface) {
    const workbook = new ExcelJs.Workbook();
    const ws = workbook.addWorksheet('Leads Listing');
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

    const columns = ['Name', 'Company', 'Email', 'Phone', 'Interest', 'Last Contact'];

    // Set header title
    const headerTitleColumns = `A1:${String.fromCharCode(64 + columns.length - 2)}1`;
    ws.mergeCells(headerTitleColumns);
    ws.getCell('A1').value = 'Leads Listing';
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
      ws.getCell(`E${idx + 3}`).value = item.interest;
      ws.getCell(`E${idx + 3}`).style = style;
      ws.getCell(`F${idx + 3}`).value = item.lastContact;
      ws.getCell(`F${idx + 3}`).style = style;
    }

    return workbook.xlsx.writeBuffer();
  }
}
