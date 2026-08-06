import ExcelJs from 'exceljs';
import AppError from 'App/Utils/AppError';
import LinkedBankAccount from 'App/Models/LinkedBankAccount';
import BankAccountTransaction from 'App/Models/BankAccountTransaction';
import { DateTime } from 'luxon';
import {
  cellBlue,
  headerColumnTitlesStyle,
  headerFilterStyle,
  headerTitleStyle,
  rowDark,
  rowLigth
} from './Styles';
import { TransactionStatus } from 'Contracts/enums';

interface FilterInterface {
  start_date?: string;
  end_date?: string;
}

interface ItemInterface {
  date: string;
  customer: string;
  category: string;
  additional: string;
  status: string;
  spent: string;
  received: string;
}

export default class TransactionHistoryService {
  static async generate(
    coworkAccountId: number,
    linkedBankAccountId: number,
    filter: FilterInterface = {}
  ) {
    const data = await this.getData(coworkAccountId, linkedBankAccountId, filter);
    const xlsx = await this.generateXls(data.items, data.totalSpent, data.totalReceived, filter);

    return xlsx;
  }

  private static async getData(
    coworkAccountId: number,
    linkedBankAccountId: number,
    filter: FilterInterface
  ) {
    let items: ItemInterface[] = [];
    let totalSpent = 0;
    let totalReceived = 0;

    const bankAccount = await LinkedBankAccount.query()
      .where('cowork_account_id', coworkAccountId)
      .where('id', linkedBankAccountId)
      .first();

    if (!bankAccount) {
      throw new AppError(AppError.NOT_FOUND, 'Linked Bank Account not found');
    }

    const transactions: BankAccountTransaction[] = await BankAccountTransaction.query()
      .where('linked_bank_account_id', linkedBankAccountId)
      .whereIn('status', [TransactionStatus.RECORDED, TransactionStatus.VOIDED])
      .whereHas('linkedBankAccount', (b) => {
        b.where('cowork_account_id', coworkAccountId);
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

    for (const transaction of transactions) {
      totalSpent += transaction.spent || 0;
      totalReceived += transaction.received || 0;

      items.push({
        date: transaction.date?.toFormat('MM/dd/yyyy') || '',
        customer: transaction.customer || '',
        category: BankAccountTransaction.getCategoryFormatted(transaction.category) || '',
        additional: transaction.description || '',
        status: BankAccountTransaction.getStatusFormatted(transaction.status),
        spent: transaction.spent ? this.maskMoney(transaction.spent) : '',
        received: transaction.received ? this.maskMoney(transaction.received) : ''
      });
    }

    return {
      items: items,
      totalReceived: this.maskMoney(totalReceived),
      totalSpent: this.maskMoney(totalSpent)
    };
  }

  private static async generateXls(
    items: ItemInterface[],
    totalSpent: string,
    totalReceived: string,
    filter: FilterInterface
  ) {
    const workbook = new ExcelJs.Workbook();
    const ws = workbook.addWorksheet('Transaction History');
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
      'Customer/Payee',
      'Transaction Category',
      'Additional Information',
      'Status',
      'Spent',
      'Received'
    ];

    // Set header title
    const headerTitleColumns = `A1:${String.fromCharCode(64 + columns.length - 2)}1`;
    ws.mergeCells(headerTitleColumns);
    ws.getCell('A1').value = 'Transaction History';
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
      ws.getCell(`B${idx + 3}`).value = item.customer;
      ws.getCell(`B${idx + 3}`).style = style;
      ws.getCell(`C${idx + 3}`).value = item.category;
      ws.getCell(`C${idx + 3}`).style = style;
      ws.getCell(`D${idx + 3}`).value = item.additional;
      ws.getCell(`D${idx + 3}`).style = style;
      ws.getCell(`E${idx + 3}`).value = item.status;
      ws.getCell(`E${idx + 3}`).style = style;
      ws.getCell(`F${idx + 3}`).value = item.spent;
      ws.getCell(`F${idx + 3}`).style = style;
      ws.getCell(`G${idx + 3}`).value = item.received;
      ws.getCell(`G${idx + 3}`).style = style;
    }

    ws.getCell(`F${items.length + 3}`).value = totalSpent;
    ws.getCell(`F${items.length + 3}`).style = cellBlue;
    ws.getCell(`G${items.length + 3}`).value = totalReceived;
    ws.getCell(`G${items.length + 3}`).style = cellBlue;

    return workbook.xlsx.writeBuffer();
  }

  private static maskMoney(value: number) {
    return `$${Math.round(value / 100).toFixed(2)}`;
  }
}
