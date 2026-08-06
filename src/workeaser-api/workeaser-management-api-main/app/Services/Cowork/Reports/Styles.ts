import { Style } from 'exceljs';

export const headerTitleStyle: Partial<Style> = {
  font: { color: { argb: 'FFFFFF' } },
  alignment: { horizontal: 'left', vertical: 'middle' },
  fill: {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '2F3853' }
  }
};

export const headerFilterStyle: Partial<Style> = {
  alignment: { horizontal: 'left', vertical: 'middle' },
  fill: {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'F7F9FB' }
  }
};

export const headerColumnTitlesStyle: Partial<Style> = {
  fill: {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'ECF1F6' }
  },
  border: { bottom: { color: { argb: '000000' } } }
};

export const rowLigth: Partial<Style> = {
  fill: {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFF' }
  }
};

export const rowDark: Partial<Style> = {
  fill: {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'F3F3F3' }
  }
};

export const cellBlue: Partial<Style> = {
  font: { color: { argb: 'FFFFFF' } },
  fill: {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '2F3853' }
  }
};
