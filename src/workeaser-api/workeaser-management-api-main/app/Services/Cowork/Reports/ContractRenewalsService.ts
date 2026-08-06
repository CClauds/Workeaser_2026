import ExcelJs from 'exceljs';
import Desk from 'App/Models/Desk';
import Room from 'App/Models/Room';
import Contract from 'App/Models/Contract';
import VirtualOffice from 'App/Models/VirtualOffice';
import { DateTime } from 'luxon';
import { ContractStatusEnum, ServicesEnum } from 'Contracts/enums';
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
  renewalDate: string;
  inDays: number;
  memberName: string;
  category: string;
  resource: string;
  actualPrice: string;
  adjustment: string;
  nextPrice: string;
  autoRenewal: string;
  cancelation: string;
}

export default class ApprovedBookingsService {
  static async generate(coworkAccountId: number, filter: FilterInterface = {}) {
    const data = await this.getData(coworkAccountId, filter);
    const xlsx = await this.generateXls(data, filter);

    return xlsx;
  }

  private static async getData(coworkAccountId: number, filter: FilterInterface) {
    let items: ItemInterface[] = [];

    const query = Contract.query()
      .where('cowork_account_id', coworkAccountId)
      .where('status', ContractStatusEnum.ACTIVE)
      .preload('user')
      .whereHas('user', (q) => {
        q.whereNull('deleted_at');
      });

    if (filter.start_date && filter.end_date) {
      query.whereRaw('DATE(date_end) <= DATE(?)', [filter.end_date]);
      query.whereRaw('DATE(date_end) >= DATE(?)', [filter.start_date]);
    } else if (filter.start_date) {
      query.whereRaw('DATE(date_end) >= DATE(?)', [filter.start_date]);
    } else if (filter.end_date) {
      query.whereRaw('DATE(date_end) <= DATE(?)', [filter.end_date]);
    }

    const contracts: Contract[] = await query;

    for (const contract of contracts) {
      const serviceInfo = await this.getServiceInfos(contract.resourceId, contract.serviceType);

      items.push({
        renewalDate: contract.dateEnd.toFormat('MM/dd/yyyy'),
        inDays: Math.round(contract.dateEnd.diffNow('days').days),
        memberName: contract.user.fullName,
        category: contract.getServiceCategory,
        resource: serviceInfo.name,
        actualPrice: this.maskMoney(contract.amount),
        adjustment: this.maskPercentage(serviceInfo.renewal),
        nextPrice: this.calcNextPrice(contract.amount, serviceInfo.renewal),
        autoRenewal: contract.autoRenewal ? 'Yes' : 'No',
        cancelation: contract.autoRenewal ? '---' : contract.dateEnd.toFormat('MM/dd/yyyy')
      });
    }

    return items;
  }

  private static async generateXls(items: ItemInterface[], filter: FilterInterface) {
    const workbook = new ExcelJs.Workbook();
    const ws = workbook.addWorksheet('Contract Renewals');
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
      'Renewal Date',
      'In Days',
      'Member Name',
      'Category',
      'Resource',
      'Actual Price',
      'Adjustment',
      'Next Price',
      'Auto-Renewal',
      'Cancelation'
    ];

    // Set header title
    const headerTitleColumns = `A1:${String.fromCharCode(64 + columns.length - 2)}1`;
    ws.mergeCells(headerTitleColumns);
    ws.getCell('A1').value = 'Contract Renewals';
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

      ws.getCell(`A${idx + 3}`).value = item.renewalDate;
      ws.getCell(`A${idx + 3}`).style = style;
      ws.getCell(`B${idx + 3}`).value = item.inDays;
      ws.getCell(`B${idx + 3}`).style = style;
      ws.getCell(`C${idx + 3}`).value = item.memberName;
      ws.getCell(`C${idx + 3}`).style = style;
      ws.getCell(`D${idx + 3}`).value = item.category;
      ws.getCell(`D${idx + 3}`).style = style;
      ws.getCell(`E${idx + 3}`).value = item.resource;
      ws.getCell(`E${idx + 3}`).style = style;
      ws.getCell(`F${idx + 3}`).value = item.actualPrice;
      ws.getCell(`F${idx + 3}`).style = style;
      ws.getCell(`G${idx + 3}`).value = item.adjustment;
      ws.getCell(`G${idx + 3}`).style = style;
      ws.getCell(`H${idx + 3}`).value = item.nextPrice;
      ws.getCell(`H${idx + 3}`).style = style;
      ws.getCell(`I${idx + 3}`).value = item.autoRenewal;
      ws.getCell(`I${idx + 3}`).style = style;
      ws.getCell(`J${idx + 3}`).value = item.cancelation;
      ws.getCell(`J${idx + 3}`).style = style;
    }

    return workbook.xlsx.writeBuffer();
  }

  private static maskMoney(value: number) {
    return `$${Math.round(value / 100).toFixed(2)}`;
  }

  private static maskPercentage(value: number) {
    return `${Math.round(value / 100).toFixed(2)}%`;
  }

  private static calcNextPrice(amount: number, renewalTax: number = 0) {
    if (!renewalTax) {
      return this.maskMoney(amount);
    }

    return this.maskMoney(amount + amount * (renewalTax / 10000));
  }

  private static async getServiceInfos(id: number, serviceType: ServicesEnum | string) {
    const result = { name: '', renewal: 0 };

    switch (serviceType) {
      case ServicesEnum.OPEN_DESK:
        const desk = await Desk.query().where('id', id).first();
        if (!desk) return result;
        result.name = desk.name;
        result.renewal = desk.renewalTax;
        break;
      case ServicesEnum.PRIVATE_ROOM:
        const privateRoom = await Room.query().where('id', id).first();
        if (!privateRoom) return result;
        result.name = privateRoom.name;
        result.renewal = privateRoom.renewalTax;
        break;
      case ServicesEnum.VIRTUAL_OFFICE:
        const virtualOffice = await VirtualOffice.query().where('id', id).first();
        if (!virtualOffice) return result;
        result.name = virtualOffice.name;
        result.renewal = virtualOffice.renewalTax;
        break;
    }

    return result;
  }
}
