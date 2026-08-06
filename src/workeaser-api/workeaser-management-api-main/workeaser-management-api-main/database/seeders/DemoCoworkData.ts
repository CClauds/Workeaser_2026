/**
 * Sprint K (HF-SPRINT-K-01) — Demo data seeder
 *
 * Popula um cowork demo COMPLETO pra Rogerio fazer apresentação comercial:
 *   - 1 cowork "Coworking Demo São Paulo"
 *   - 1 owner: demo@workeaser.com / demo1234 (role COWORKING)
 *   - 1 endereço completo (Av. Paulista, SP)
 *   - 1 location com descrição comercial
 *   - 3 amenities + 1 serviço linkados
 *   - 4 desks (2 fixos R$ 800/mês + 2 hot desks R$ 300/mês)
 *   - 2 meetrooms (sala 4p + sala 10p)
 *   - 1 cliente membro fictício "Empresa Acme Ltda" com 1 fatura paga
 *   - 1 subscription Stripe "Growth" em trialing (próximo billing em 14 dias)
 *
 * Idempotente: pode rodar várias vezes sem duplicar.
 *
 * Rodar:
 *   node ace db:seed --files=./database/seeders/DemoCoworkData.ts
 *
 * NÃO rodar em produção real (popula dados fake com email demo@).
 */
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder';
import Database from '@ioc:Adonis/Lucid/Database';
import User from 'App/Models/User';
import CoworkAccount from 'App/Models/CoworkAccount';
import { UserRoleEnum, CoworkUserRoleEnum } from 'Contracts/enums';
import { DateTime } from 'luxon';

const DEMO_EMAIL = 'demo@workeaser.com';
const DEMO_PASSWORD = 'demo1234';
const DEMO_COWORK_NAME = 'Coworking Demo São Paulo';
const DEMO_LOCATION_NAME = 'Filial Paulista';
const DEMO_CLIENT_EMAIL = 'cliente.demo@example.com';

export default class DemoCoworkDataSeeder extends BaseSeeder {
  public static developmentOnly = true;

  public async run() {
    // Bail safety: nunca roda se NODE_ENV=production
    if (process.env.NODE_ENV === 'production') {
      // eslint-disable-next-line no-console
      console.log('[DemoCoworkDataSeeder] skip — NODE_ENV=production');
      return;
    }

    // 1. Owner do cowork
    const owner = await User.firstOrCreate(
      { email: DEMO_EMAIL },
      {
        firstName: 'Demo',
        middleName: 'Cowork',
        lastName: 'Owner',
        email: DEMO_EMAIL,
        emailConfirmed: true,
        password: DEMO_PASSWORD,
        role: UserRoleEnum.COWORKING,
        personalPhone: '+5511999990001',
      } as any
    );

    // 2. CoworkAccount
    let cowork = await CoworkAccount.query().where('email', DEMO_EMAIL).first();
    if (!cowork) {
      cowork = await CoworkAccount.create({
        name: DEMO_COWORK_NAME,
        email: DEMO_EMAIL,
        phone: '+551130000000',
      } as any);
    }

    // 3. Link owner ⇄ cowork (pivot coworks_users)
    const linkExists = await Database.from('coworks_users')
      .where('user_id', owner.id)
      .where('cowork_id', cowork.id)
      .first();
    if (!linkExists) {
      await Database.table('coworks_users').insert({
        user_id: owner.id,
        cowork_id: cowork.id,
        role: CoworkUserRoleEnum.MANAGER,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    // 4. Address (Av. Paulista)
    let addressId: number;
    const existingAddress = await Database.from('addresses')
      .where('street', 'Av. Paulista, 1000')
      .first();
    if (existingAddress) {
      addressId = existingAddress.id;
    } else {
      const [insertedAddressId] = await Database.table('addresses').insert({
        street: 'Av. Paulista, 1000',
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil',
        zip_code: '01310-100',
        created_at: new Date(),
        updated_at: new Date(),
      });
      addressId = insertedAddressId;
    }

    // 5. Location
    let locationId: number;
    const existingLocation = await Database.from('locations')
      .where('cowork_account_id', cowork.id)
      .where('name', DEMO_LOCATION_NAME)
      .first();
    if (existingLocation) {
      locationId = existingLocation.id;
    } else {
      const [insertedLocationId] = await Database.table('locations').insert({
        cowork_account_id: cowork.id,
        name: DEMO_LOCATION_NAME,
        description:
          'Espaço premium na Av. Paulista com 4 estações de trabalho, 2 salas de reunião e ' +
          'mesa compartilhada. Internet 1Gbps, café ilimitado, recepção 9h-19h. Vista do MASP.',
        address_id: addressId,
        created_at: new Date(),
        updated_at: new Date(),
      });
      locationId = insertedLocationId;
    }

    // 6. Amenities + Serviços (linka 3 amenities aleatórias)
    const amenityIds = await Database.from('amenities').limit(3).select('id');
    for (const a of amenityIds) {
      const exists = await Database.from('location_amenities')
        .where('location_id', locationId)
        .where('amenity_id', a.id)
        .first();
      if (!exists) {
        await Database.table('location_amenities').insert({
          location_id: locationId,
          amenity_id: a.id,
        });
      }
    }
    const serviceIds = await Database.from('services').limit(1).select('id');
    for (const s of serviceIds) {
      const exists = await Database.from('location_services')
        .where('location_id', locationId)
        .where('service_id', s.id)
        .first();
      if (!exists) {
        await Database.table('location_services').insert({
          location_id: locationId,
          service_id: s.id,
        });
      }
    }

    // 7. Desks (4: 2 fixos + 2 hot desks)
    const existingDesks = await Database.from('desks')
      .where('location_id', locationId)
      .count('* as c');
    if (Number(existingDesks[0].c) === 0) {
      await Database.table('desks').multiInsert([
        {
          location_id: locationId,
          name: 'Mesa Fixa 01 (vista Paulista)',
          description: 'Mesa privativa premium com vista para Av. Paulista. Inclui gaveteiro.',
          shareable: false,
          quantity: 1,
          minimum_rental_period: 30,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          location_id: locationId,
          name: 'Mesa Fixa 02',
          description: 'Mesa privativa com armário fechado.',
          shareable: false,
          quantity: 1,
          minimum_rental_period: 30,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          location_id: locationId,
          name: 'Hot Desk Manhã',
          description: 'Mesa compartilhada das 9h às 14h. Diária R$ 30 ou mensal R$ 300.',
          shareable: true,
          quantity: 6,
          minimum_rental_period: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          location_id: locationId,
          name: 'Hot Desk Tarde',
          description: 'Mesa compartilhada das 14h às 19h. Diária R$ 30 ou mensal R$ 300.',
          shareable: true,
          quantity: 6,
          minimum_rental_period: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    }

    // 8. Meetrooms (2)
    const existingMeetrooms = await Database.from('meetrooms')
      .where('location_id', locationId)
      .count('* as c');
    if (Number(existingMeetrooms[0].c) === 0) {
      await Database.table('meetrooms').multiInsert([
        {
          location_id: locationId,
          name: 'Sala Bossa Nova (4 pessoas)',
          description: 'Sala de reunião acústica com TV 55", videoconf Logitech, quadro branco.',
          capacity: 4,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          location_id: locationId,
          name: 'Sala Modernismo (10 pessoas)',
          description: 'Sala grande com mesa de mogno, TV 75", sistema Polycom, café incluso.',
          capacity: 10,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    }

    // 9. Cliente membro (Empresa Acme) — só cria se tabela existir
    const clientAccountsExists = await this.tableExists('client_accounts');
    if (clientAccountsExists) {
      let clientAccountId: number;
      const existingClient = await Database.from('client_accounts')
        .where('email', DEMO_CLIENT_EMAIL)
        .first();
      if (existingClient) {
        clientAccountId = existingClient.id;
      } else {
        const [insertedClientId] = await Database.table('client_accounts').insert({
          name: 'Empresa Acme Ltda',
          email: DEMO_CLIENT_EMAIL,
          phone: '+5511988887777',
          created_at: new Date(),
          updated_at: new Date(),
        });
        clientAccountId = insertedClientId;
      }

      // Link cowork ⇄ client se tabela existir
      const coworkClientsExists = await this.tableExists('cowork_clients');
      if (coworkClientsExists) {
        const linkClientExists = await Database.from('cowork_clients')
          .where('cowork_account_id', cowork.id)
          .where('client_account_id', clientAccountId)
          .first();
        if (!linkClientExists) {
          await Database.table('cowork_clients').insert({
            cowork_account_id: cowork.id,
            client_account_id: clientAccountId,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }

      // 10. Invoice fictícia paga
      const invoicesExists = await this.tableExists('invoices');
      if (invoicesExists) {
        const existingInvoice = await Database.from('invoices')
          .where('cowork_account_id', cowork.id)
          .where('client_account_id', clientAccountId)
          .first();
        if (!existingInvoice) {
          await Database.table('invoices').insert({
            cowork_account_id: cowork.id,
            client_account_id: clientAccountId,
            location_id: locationId,
            date: DateTime.now().minus({ days: 25 }).toSQLDate(),
            due_date: DateTime.now().minus({ days: 10 }).toSQLDate(),
            terms: 'Vencimento em 15 dias',
            additional_notes: 'Mensalidade Mesa Fixa 01 + 4h sala de reunião',
            subtotal: 80000, // R$ 800,00 em cents
            total: 80000,
            total_taxes: 0,
            tax_invoice_amount: 0,
            status: 'paid',
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }
    }

    // 11. Subscription Stripe demo (trialing) — se tabela existir e tiver plano Growth
    const subscriptionsExists = await this.tableExists('subscriptions');
    if (subscriptionsExists) {
      const growthPlan = await Database.from('subscription_plans')
        .where('code', 'growth')
        .first();
      if (growthPlan) {
        const existingSub = await Database.from('subscriptions')
          .where('user_id', owner.id)
          .first();
        if (!existingSub) {
          await Database.table('subscriptions').insert({
            user_id: owner.id,
            plan_id: growthPlan.id,
            stripe_subscription_id: 'sub_DEMO_FAKE_ID',
            stripe_customer_id: 'cus_DEMO_FAKE_ID',
            status: 'trialing',
            trial_end: DateTime.now().plus({ days: 14 }).toJSDate(),
            current_period_start: DateTime.now().toJSDate(),
            current_period_end: DateTime.now().plus({ days: 14 }).toJSDate(),
            cancel_at_period_end: false,
            self_service_trial_extensions: 0,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }
    }

    // eslint-disable-next-line no-console
    console.log(
      `[DemoCoworkDataSeeder] OK — login: ${DEMO_EMAIL} / senha: ${DEMO_PASSWORD} | cowork#${cowork.id} location#${locationId}`
    );
  }

  /**
   * Helper: verifica se tabela existe (compat MySQL).
   * Usado pra seeder funcionar mesmo se migrations parciais foram aplicadas.
   */
  private async tableExists(name: string): Promise<boolean> {
    try {
      const result = await Database.rawQuery(
        `SELECT COUNT(*) as c FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
        [name]
      );
      const rows = Array.isArray(result) ? result[0] : result.rows || result;
      const first = Array.isArray(rows) ? rows[0] : rows;
      return Number(first?.c) > 0;
    } catch {
      return false;
    }
  }
}
