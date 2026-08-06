/**
 * Sprint L (HF-SPRINT-L-01) — Simplified client batch import.
 *
 * Existe um `UserService.import(file)` (linha 468) que faz parse de XLSX/CSV com 21
 * colunas (nome, sobrenome, password, lat/long, etc) — bom pra migracao de power user
 * mas inviavel pra cowork novo querendo subir 50 clientes vindo de planilha simples.
 *
 * Este service oferece um caminho mais leve: recebe JSON array com 4 campos
 * (name, email, phone?, company?) e cria User+ClientAccount em batch transacional.
 *
 * Frontend parseia o CSV no browser e envia JSON pra ca; assim:
 *   - Nao precisa fazer upload de arquivo binario
 *   - Usuario ve preview ANTES de confirmar
 *   - Erro/skip por linha aparece imediato na UI sem reload
 *
 * Comportamento:
 *   - Email duplicado (User.findBy email) -> skip, registrado em `skippedExisting`
 *   - Erro de validacao -> linha vai pra `errors[]`, processa o resto
 *   - Tudo em transacao por linha (rollback granular)
 *   - Senha gerada automaticamente (16 chars, cliente recebe email pra setar depois)
 *
 * NAO envia email automaticamente — o frontend confirma e o admin decide se quer
 * disparar reset-password em batch depois (separado, controlavel).
 */
import Database from '@ioc:Adonis/Lucid/Database';
import User from 'App/Models/User';
import ClientAccount from 'App/Models/ClientAccount';
import { UserRoleEnum } from 'Contracts/enums';
import { randomBytes } from 'crypto';

export interface ImportRow {
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

export interface ImportResult {
  total: number;
  created: number;
  skippedExisting: string[]; // emails that already existed
  errors: Array<{ row: number; email: string; reason: string }>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default class ClientImportService {
  /**
   * Importa um batch de clientes. Idempotente (re-roda nao duplica).
   *
   * @param rows array de linhas vindas do CSV parseado pelo browser
   * @param coworkAccountId id do cowork onde os clientes serao linkados
   * @returns ImportResult com contadores e erros granulares
   */
  public static async importBatch(
    rows: ImportRow[],
    coworkAccountId: number
  ): Promise<ImportResult> {
    if (!Array.isArray(rows) || rows.length === 0) {
      return { total: 0, created: 0, skippedExisting: [], errors: [] };
    }

    // Limite defensivo: 500 por batch (evita timeout em planilhas gigantes; user pode dividir)
    if (rows.length > 500) {
      throw new Error(
        `Batch muito grande (${rows.length}). Divida em arquivos de ate 500 linhas.`
      );
    }

    const result: ImportResult = {
      total: rows.length,
      created: 0,
      skippedExisting: [],
      errors: [],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowIndex = i + 1;

      // 1. Validacao basica
      if (!row || typeof row !== 'object') {
        result.errors.push({ row: rowIndex, email: '', reason: 'Linha invalida' });
        continue;
      }
      const name = String(row.name || '').trim();
      const email = String(row.email || '').trim().toLowerCase();
      const phone = row.phone ? String(row.phone).trim() : null;
      const company = row.company ? String(row.company).trim() : null;

      if (!name) {
        result.errors.push({ row: rowIndex, email, reason: 'Nome obrigatorio' });
        continue;
      }
      if (!email || !EMAIL_RE.test(email)) {
        result.errors.push({ row: rowIndex, email, reason: 'Email invalido' });
        continue;
      }

      // 2. Skip duplicados
      const existing = await User.findBy('email', email);
      if (existing) {
        result.skippedExisting.push(email);
        continue;
      }

      // 3. Cria User + ClientAccount em transacao
      const trx = await Database.transaction();
      try {
        // Quebra nome em first/last (heuristica simples; se vier "Joao Silva da Costa",
        // first=Joao, middle="", last="Silva da Costa")
        const parts = name.split(/\s+/);
        const firstName = parts[0];
        const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '-';
        // Password aleatoria 16 chars hex (cliente reseta no proximo login)
        const tempPassword = randomBytes(8).toString('hex');

        const user = await User.create(
          {
            firstName,
            middleName: '',
            lastName,
            email,
            emailConfirmed: false, // cliente confirma quando setar senha
            password: tempPassword,
            role: UserRoleEnum.CLIENT,
            personalPhone: phone,
          } as any,
          { client: trx }
        );

        await ClientAccount.create(
          {
            userId: user.id,
            cowork_account_id: coworkAccountId,
            companyName: company,
            companyEmail: email, // default = email pessoal se nao tem company
            companyPhone: phone,
          } as any,
          { client: trx }
        );

        await trx.commit();
        result.created += 1;
      } catch (err: any) {
        await trx.rollback();
        result.errors.push({
          row: rowIndex,
          email,
          reason: String(err?.message || err).slice(0, 200),
        });
      }
    }

    return result;
  }
}
