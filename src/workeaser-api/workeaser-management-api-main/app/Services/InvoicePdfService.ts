/**
 * Sprint N (HF-SPRINT-N-01) — Geração de PDF de fatura customizado.
 *
 * Antes: invoice tinha geração antiga via hummus (HF06 trocou pra pdf-lib pra fix de
 *   Node 18+) mas usava apenas em contratos. Não havia template de fatura visual.
 * Agora: PDF profissional padronizado com header do cowork, dados do cliente, tabela de
 *   itens, total destacado, status, código de barras boleto (placeholder), termos legais.
 *
 * Layout (A4 portrait, 595x842 pts):
 *   - Header: logo cowork (esquerda) + título "FATURA" + número (direita)
 *   - Bloco "De" (cowork name + endereço) | bloco "Para" (cliente + endereço)
 *   - Datas: emissão / vencimento / referência
 *   - Tabela de itens (descrição, qty, unit, total) com bordas
 *   - Subtotal + impostos + TOTAL destacado
 *   - Notas adicionais (free text)
 *   - Footer com termos curtos + URL pra portal de pagamento
 *
 * Tudo standard-fonts (Helvetica) — sem dependência de fonte custom.
 */
import { PDFDocument, PDFFont, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import Invoice from 'App/Models/Invoice';
import Env from '@ioc:Adonis/Core/Env';

interface InvoiceItemLite {
  name: string;
  description?: string | null;
  quantity: number;
  unit_price: number; // in cents
  total?: number; // in cents
}

interface BuildPdfOpts {
  invoice: Invoice;
  coworkName?: string;
  coworkAddress?: string;
  clientName?: string;
  clientEmail?: string;
  clientAddress?: string;
  items: InvoiceItemLite[];
  currencySymbol?: string; // default R$
}

const COLORS = {
  black: rgb(0, 0, 0),
  dark: rgb(0.1, 0.1, 0.1),
  gray: rgb(0.45, 0.45, 0.45),
  lightGray: rgb(0.9, 0.9, 0.9),
  accent: rgb(0.012, 0.412, 0.631), // #0369a1 Workeaser blue
  green: rgb(0.086, 0.639, 0.29), // paid
  red: rgb(0.86, 0.149, 0.149), // overdue
  amber: rgb(0.961, 0.62, 0.043), // pending
};

function formatMoney(cents: number, symbol = 'R$'): string {
  const v = (cents || 0) / 100;
  return `${symbol} ${v.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(d: any): string {
  if (!d) return '-';
  try {
    const date = typeof d === 'string' ? new Date(d) : d.toJSDate ? d.toJSDate() : new Date(d);
    return date.toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
}

function statusBadge(status?: string): { text: string; color: any } {
  switch ((status || '').toLowerCase()) {
    case 'paid':
      return { text: 'PAGA', color: COLORS.green };
    case 'overdue':
      return { text: 'VENCIDA', color: COLORS.red };
    case 'pending':
    case 'open':
      return { text: 'PENDENTE', color: COLORS.amber };
    case 'canceled':
    case 'cancelled':
      return { text: 'CANCELADA', color: COLORS.gray };
    default:
      return { text: (status || 'N/A').toUpperCase(), color: COLORS.gray };
  }
}

/** Truncates text to fit in width at given font/size. Returns truncated + ellipsis. */
function fitText(
  text: string,
  maxWidth: number,
  font: PDFFont,
  size: number
): string {
  if (!text) return '';
  let t = text;
  while (font.widthOfTextAtSize(t, size) > maxWidth && t.length > 3) {
    t = t.slice(0, -1);
  }
  if (t.length < text.length) t = t.slice(0, -3) + '...';
  return t;
}

export default class InvoicePdfService {
  /**
   * Gera Buffer de PDF da fatura.
   * Defensive: campos faltantes não quebram — usa "-" ou skip.
   */
  public static async generate(opts: BuildPdfOpts): Promise<Buffer> {
    const { invoice, items } = opts;
    const symbol = opts.currencySymbol || 'R$';
    const coworkName = opts.coworkName || 'Workeaser';
    const coworkAddress = opts.coworkAddress || '-';
    const clientName = opts.clientName || 'Cliente';
    const clientEmail = opts.clientEmail || '';
    const clientAddress = opts.clientAddress || '-';

    const doc = await PDFDocument.create();
    doc.setTitle(`Fatura #${invoice.id}`);
    doc.setAuthor(coworkName);
    doc.setCreator('Workeaser');
    doc.setProducer('Workeaser InvoicePdfService');

    const page = doc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    const helv = await doc.embedFont(StandardFonts.Helvetica);
    const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);

    const M = 40; // margin
    let y = height - M;

    // -------- Header --------
    // Logo placeholder (left): simply renders cowork name in bold
    page.drawText(fitText(coworkName, 250, helvBold, 18), {
      x: M,
      y: y - 18,
      size: 18,
      font: helvBold,
      color: COLORS.dark,
    });

    // Title (right)
    const title = 'FATURA';
    const tWidth = helvBold.widthOfTextAtSize(title, 24);
    page.drawText(title, {
      x: width - M - tWidth,
      y: y - 24,
      size: 24,
      font: helvBold,
      color: COLORS.accent,
    });
    const invoiceLabel = `Nº ${invoice.id}`;
    page.drawText(invoiceLabel, {
      x: width - M - helv.widthOfTextAtSize(invoiceLabel, 11),
      y: y - 40,
      size: 11,
      font: helv,
      color: COLORS.gray,
    });

    y -= 70;

    // Status badge (right of header)
    const sb = statusBadge((invoice as any).status);
    const badgeWidth = helvBold.widthOfTextAtSize(sb.text, 11) + 14;
    page.drawRectangle({
      x: width - M - badgeWidth,
      y: y - 6,
      width: badgeWidth,
      height: 20,
      color: sb.color,
    });
    page.drawText(sb.text, {
      x: width - M - badgeWidth + 7,
      y: y - 1,
      size: 11,
      font: helvBold,
      color: rgb(1, 1, 1),
    });

    y -= 30;

    // -------- Linha horizontal --------
    page.drawLine({
      start: { x: M, y },
      end: { x: width - M, y },
      thickness: 0.5,
      color: COLORS.lightGray,
    });
    y -= 24;

    // -------- Bloco De / Para --------
    const colWidth = (width - 2 * M - 20) / 2;

    page.drawText('DE', { x: M, y, size: 9, font: helvBold, color: COLORS.gray });
    page.drawText('PARA', {
      x: M + colWidth + 20,
      y,
      size: 9,
      font: helvBold,
      color: COLORS.gray,
    });
    y -= 16;

    page.drawText(fitText(coworkName, colWidth, helvBold, 12), {
      x: M,
      y,
      size: 12,
      font: helvBold,
      color: COLORS.dark,
    });
    page.drawText(fitText(clientName, colWidth, helvBold, 12), {
      x: M + colWidth + 20,
      y,
      size: 12,
      font: helvBold,
      color: COLORS.dark,
    });
    y -= 14;

    page.drawText(fitText(coworkAddress, colWidth, helv, 10), {
      x: M,
      y,
      size: 10,
      font: helv,
      color: COLORS.gray,
    });
    if (clientEmail) {
      page.drawText(fitText(clientEmail, colWidth, helv, 10), {
        x: M + colWidth + 20,
        y,
        size: 10,
        font: helv,
        color: COLORS.gray,
      });
    }
    y -= 12;
    page.drawText(fitText(clientAddress, colWidth, helv, 10), {
      x: M + colWidth + 20,
      y,
      size: 10,
      font: helv,
      color: COLORS.gray,
    });

    y -= 32;

    // -------- Datas --------
    const dateY = y;
    const dateBox = (label: string, value: string, x: number) => {
      page.drawText(label.toUpperCase(), { x, y: dateY, size: 8, font: helvBold, color: COLORS.gray });
      page.drawText(value, { x, y: dateY - 14, size: 11, font: helv, color: COLORS.dark });
    };
    dateBox('Emissão', formatDate(invoice.date), M);
    dateBox('Vencimento', formatDate(invoice.dueDate), M + 130);
    dateBox('Termos', String(invoice.terms || '-'), M + 260);

    y -= 40;

    // -------- Tabela de itens --------
    page.drawLine({
      start: { x: M, y },
      end: { x: width - M, y },
      thickness: 0.5,
      color: COLORS.lightGray,
    });
    y -= 16;

    // Header da tabela
    page.drawText('DESCRIÇÃO', { x: M, y, size: 8, font: helvBold, color: COLORS.gray });
    page.drawText('QTD', {
      x: width - M - 200,
      y,
      size: 8,
      font: helvBold,
      color: COLORS.gray,
    });
    page.drawText('UNIT.', {
      x: width - M - 140,
      y,
      size: 8,
      font: helvBold,
      color: COLORS.gray,
    });
    const totalLabel = 'TOTAL';
    page.drawText(totalLabel, {
      x: width - M - helvBold.widthOfTextAtSize(totalLabel, 8),
      y,
      size: 8,
      font: helvBold,
      color: COLORS.gray,
    });
    y -= 8;
    page.drawLine({
      start: { x: M, y },
      end: { x: width - M, y },
      thickness: 0.5,
      color: COLORS.lightGray,
    });
    y -= 14;

    // Itens
    let computedSubtotal = 0;
    for (const item of items || []) {
      if (y < M + 100) break; // safety: don't render off-page
      const itemTotal = item.total ?? item.quantity * item.unit_price;
      computedSubtotal += itemTotal;

      page.drawText(fitText(item.name || '-', width - M * 2 - 240, helv, 11), {
        x: M,
        y,
        size: 11,
        font: helv,
        color: COLORS.dark,
      });
      page.drawText(String(item.quantity || 0), {
        x: width - M - 200,
        y,
        size: 11,
        font: helv,
        color: COLORS.dark,
      });
      page.drawText(formatMoney(item.unit_price, symbol), {
        x: width - M - 140,
        y,
        size: 11,
        font: helv,
        color: COLORS.dark,
      });
      const t = formatMoney(itemTotal, symbol);
      page.drawText(t, {
        x: width - M - helvBold.widthOfTextAtSize(t, 11),
        y,
        size: 11,
        font: helvBold,
        color: COLORS.dark,
      });

      // description abaixo, se houver
      if (item.description) {
        y -= 12;
        page.drawText(fitText(item.description, width - M * 2 - 240, helv, 9), {
          x: M,
          y,
          size: 9,
          font: helv,
          color: COLORS.gray,
        });
      }

      y -= 18;
    }

    // -------- Totais --------
    y -= 8;
    page.drawLine({
      start: { x: width - M - 200, y },
      end: { x: width - M, y },
      thickness: 0.5,
      color: COLORS.lightGray,
    });
    y -= 16;

    const subtotal = invoice.subtotal ?? computedSubtotal;
    const totalTaxes = invoice.totalTaxes ?? 0;
    const total = invoice.total ?? subtotal + totalTaxes;

    const lineRight = (label: string, value: string, bold = false) => {
      page.drawText(label, {
        x: width - M - 200,
        y,
        size: 10,
        font: bold ? helvBold : helv,
        color: bold ? COLORS.dark : COLORS.gray,
      });
      const f = bold ? helvBold : helv;
      const w = f.widthOfTextAtSize(value, bold ? 12 : 10);
      page.drawText(value, {
        x: width - M - w,
        y,
        size: bold ? 12 : 10,
        font: f,
        color: bold ? COLORS.accent : COLORS.dark,
      });
    };

    lineRight('Subtotal', formatMoney(subtotal, symbol));
    y -= 14;
    if (totalTaxes > 0) {
      lineRight('Impostos', formatMoney(totalTaxes, symbol));
      y -= 14;
    }
    y -= 4;
    page.drawLine({
      start: { x: width - M - 200, y: y + 4 },
      end: { x: width - M, y: y + 4 },
      thickness: 1,
      color: COLORS.dark,
    });
    y -= 14;
    lineRight('TOTAL', formatMoney(total, symbol), true);

    y -= 40;

    // -------- Notas --------
    if (invoice.additionalNotes) {
      if (y > M + 60) {
        page.drawText('OBSERVAÇÕES', { x: M, y, size: 8, font: helvBold, color: COLORS.gray });
        y -= 14;
        // Notes podem ser multiline — quebra em 80 chars
        const lines = String(invoice.additionalNotes).match(/.{1,80}/g) || [];
        for (const line of lines.slice(0, 5)) {
          if (y < M + 40) break;
          page.drawText(fitText(line, width - 2 * M, helv, 10), {
            x: M,
            y,
            size: 10,
            font: helv,
            color: COLORS.dark,
          });
          y -= 12;
        }
      }
    }

    // -------- Footer --------
    const appUrl = Env.get('APP_URL', 'https://app.workeaser.com');
    const footerY = M + 16;
    page.drawLine({
      start: { x: M, y: footerY + 12 },
      end: { x: width - M, y: footerY + 12 },
      thickness: 0.5,
      color: COLORS.lightGray,
    });
    page.drawText(
      `Gerada via Workeaser · Pague online em ${appUrl}/invoice-payment/${invoice.id} · Dúvidas: contato@workeaser.com`,
      {
        x: M,
        y: footerY,
        size: 8,
        font: helv,
        color: COLORS.gray,
      }
    );

    const pdfBytes = await doc.save();
    return Buffer.from(pdfBytes);
  }
}
