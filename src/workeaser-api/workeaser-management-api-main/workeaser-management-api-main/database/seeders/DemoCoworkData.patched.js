"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Seeder_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Seeder"));
const Database_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Database"));
const User_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/User"));
const CoworkAccount_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/CoworkAccount"));
const enums_1 = global[Symbol.for('ioc.use')]("Contracts/enums");
const luxon_1 = require("luxon");
const DEMO_EMAIL = 'demo@workeaser.com';
const DEMO_PASSWORD = 'demo1234';
const DEMO_COWORK_NAME = 'Coworking Demo São Paulo';
const DEMO_LOCATION_NAME = 'Filial Paulista';
const DEMO_CLIENT_EMAIL = 'cliente.demo@example.com';
class DemoCoworkDataSeeder extends Seeder_1.default {
    async run() {
        if (process.env.NODE_ENV === 'production') {
            console.log('[DemoCoworkDataSeeder] skip — NODE_ENV=production');
            return;
        }
        const owner = await User_1.default.firstOrCreate({ email: DEMO_EMAIL }, {
            firstName: 'Demo',
            middleName: 'Cowork',
            lastName: 'Owner',
            email: DEMO_EMAIL,
            emailConfirmed: true,
            password: DEMO_PASSWORD,
            role: enums_1.UserRoleEnum.COWORKING,
            personalPhone: '+5511999990001',
        });
        let cowork = await CoworkAccount_1.default.query().where('email', DEMO_EMAIL).first();
        if (!cowork) {
            cowork = await CoworkAccount_1.default.create({
                name: DEMO_COWORK_NAME,
                email: DEMO_EMAIL,
                phone: '+551130000000',
            });
        }
        const linkExists = await Database_1.default.from('cowork_users')
            .where('user_id', owner.id)
            .where('cowork_account_id', cowork.id)
            .first();
        if (!linkExists) {
            await Database_1.default.table('cowork_users').insert({
                user_id: owner.id,
                cowork_account_id: cowork.id,
                role: enums_1.CoworkUserRoleEnum.MANAGER,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }
        let addressId;
        const existingAddress = await Database_1.default.from('addresses')
            .where('fulltext', 'Av. Paulista, 1000')
            .first();
        if (existingAddress) {
            addressId = existingAddress.id;
        }
        else {
            const [insertedAddressId] = await Database_1.default.table('addresses').insert({
                fulltext: 'Av. Paulista, 1000',
                city: 'São Paulo',
                state: 'SP',
                country: 'Brasil',
                zipcode: '01310-100',
                created_at: new Date(),
                updated_at: new Date(),
            });
            addressId = insertedAddressId;
        }
        let locationId;
        const existingLocation = await Database_1.default.from('locations')
            .where('cowork_account_id', cowork.id)
            .where('name', DEMO_LOCATION_NAME)
            .first();
        if (existingLocation) {
            locationId = existingLocation.id;
        }
        else {
            const [insertedLocationId] = await Database_1.default.table('locations').insert({
                cowork_account_id: cowork.id,
                name: DEMO_LOCATION_NAME,
                description: 'Espaço premium na Av. Paulista com 4 estações de trabalho, 2 salas de reunião e ' +
                    'mesa compartilhada. Internet 1Gbps, café ilimitado, recepção 9h-19h. Vista do MASP.',
                address_id: addressId,
                created_at: new Date(),
                updated_at: new Date(),
            });
            locationId = insertedLocationId;
        }
        const amenityIds = await Database_1.default.from('amenities').limit(3).select('id');
        for (const a of amenityIds) {
            const exists = await Database_1.default.from('location_amenities')
                .where('location_id', locationId)
                .where('amenity_id', a.id)
                .first();
            if (!exists) {
                await Database_1.default.table('location_amenities').insert({
                    location_id: locationId,
                    amenity_id: a.id,
                });
            }
        }
        const serviceIds = await Database_1.default.from('services').limit(1).select('id');
        for (const s of serviceIds) {
            const exists = await Database_1.default.from('location_services')
                .where('location_id', locationId)
                .where('service_id', s.id)
                .first();
            if (!exists) {
                await Database_1.default.table('location_services').insert({
                    location_id: locationId,
                    service_id: s.id,
                });
            }
        }
        const existingDesks = await Database_1.default.from('desks')
            .where('location_id', locationId)
            .count('* as c');
        if (Number(existingDesks[0].c) === 0) {
            await Database_1.default.table('desks').multiInsert([
                {
                    location_id: locationId,
                    uuid: crypto.randomUUID(),
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
                    uuid: crypto.randomUUID(),
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
                    uuid: crypto.randomUUID(),
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
                    uuid: crypto.randomUUID(),
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
        const existingMeetrooms = await Database_1.default.from('meetrooms')
            .where('location_id', locationId)
            .count('* as c');
        if (Number(existingMeetrooms[0].c) === 0) {
            await Database_1.default.table('meetrooms').multiInsert([
                {
                    location_id: locationId,
                    uuid: crypto.randomUUID(),
                    name: 'Sala Bossa Nova (4 pessoas)',
                    description: 'Sala de reunião acústica com TV 55", videoconf Logitech, quadro branco.',
                    measure_unit: 'people',
                    type: 'MEETING',
                    rental_timeframe: 'HOURS_1',
                    minimum_rental: 'HOURS_1',
                    cancelation_full: 24,
                    cancelation_half: 12,
                    cancelation_no: 2,
                    discount_three: 0,
                    discount_half: 0,
                    discount_full: 0,
                    measure_occupancy: 4,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    location_id: locationId,
                    uuid: crypto.randomUUID(),
                    name: 'Sala Modernismo (10 pessoas)',
                    description: 'Sala grande com mesa de mogno, TV 75", sistema Polycom, café incluso.',
                    measure_unit: 'people',
                    type: 'MEETING',
                    rental_timeframe: 'HOURS_1',
                    minimum_rental: 'HOURS_1',
                    cancelation_full: 24,
                    cancelation_half: 12,
                    cancelation_no: 2,
                    discount_three: 0,
                    discount_half: 0,
                    discount_full: 0,
                    measure_occupancy: 10,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ]);
        }
        const clientAccountsExists = await this.tableExists('client_accounts');
        if (clientAccountsExists) {
            const clientUser = await User_1.default.firstOrCreate({ email: DEMO_CLIENT_EMAIL }, {
                firstName: 'Cliente',
                middleName: 'Demo',
                lastName: 'Acme',
                email: DEMO_CLIENT_EMAIL,
                emailConfirmed: true,
                password: DEMO_PASSWORD,
                role: enums_1.UserRoleEnum.CLIENT,
                personalPhone: '+5511988887777',
            });
            let clientAccountId;
            const existingClient = await Database_1.default.from('client_accounts')
                .where('company_email', DEMO_CLIENT_EMAIL)
                .first();
            if (existingClient) {
                clientAccountId = existingClient.id;
            }
            else {
                const [insertedClientId] = await Database_1.default.table('client_accounts').insert({
                    company_name: 'Empresa Acme Ltda',
                    company_email: DEMO_CLIENT_EMAIL,
                    company_phone: '+5511988887777',
                    cowork_account_id: cowork.id,
                    user_id: clientUser.id,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
                clientAccountId = insertedClientId;
            }
            const coworkClientsExists = await this.tableExists('cowork_clients');
            if (coworkClientsExists) {
                const linkClientExists = await Database_1.default.from('cowork_clients')
                    .where('cowork_account_id', cowork.id)
                    .where('user_id', clientUser.id)
                    .first();
                if (!linkClientExists) {
                    await Database_1.default.table('cowork_clients').insert({
                        cowork_account_id: cowork.id,
                        user_id: clientUser.id,
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                }
            }
            const invoicesExists = await this.tableExists('invoices');
            if (invoicesExists) {
                const existingInvoice = await Database_1.default.from('invoices')
                    .where('cowork_account_id', cowork.id)
                    .where('user_id', clientUser.id)
                    .first();
                if (!existingInvoice) {
                    await Database_1.default.table('invoices').insert({
                        cowork_account_id: cowork.id,
                        user_id: clientUser.id,
                        uuid: crypto.randomUUID(),
                        location_id: locationId,
                        date: luxon_1.DateTime.now().minus({ days: 25 }).toSQLDate(),
                        due_date: luxon_1.DateTime.now().minus({ days: 10 }).toSQLDate(),
                        additional_notes: 'Mensalidade Mesa Fixa 01 + 4h sala de reunião',
                        subtotal: 80000,
                        total: 80000,
                        total_taxes: 0,
                        status: 'paid',
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                }
            }
        }
        const subscriptionsExists = await this.tableExists('subscriptions');
        if (subscriptionsExists) {
            const growthPlan = await Database_1.default.from('subscription_plans')
                .where('code', 'growth')
                .first();
            if (growthPlan) {
                const existingSub = await Database_1.default.from('subscriptions')
                    .where('user_id', owner.id)
                    .first();
                if (!existingSub) {
                    await Database_1.default.table('subscriptions').insert({
                        user_id: owner.id,
                        subscription_plan_id: growthPlan.id,
                        stripe_subscription_id: 'sub_DEMO_FAKE_ID',
                        stripe_customer_id: 'cus_DEMO_FAKE_ID',
                        status: 'trialing',
                        trial_end: luxon_1.DateTime.now().plus({ days: 14 }).toJSDate(),
                        current_period_start: luxon_1.DateTime.now().toJSDate(),
                        current_period_end: luxon_1.DateTime.now().plus({ days: 14 }).toJSDate(),
                        self_service_trial_extensions: 0,
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                }
            }
        }
        console.log(`[DemoCoworkDataSeeder] OK — login: ${DEMO_EMAIL} / senha: ${DEMO_PASSWORD} | cowork#${cowork.id} location#${locationId}`);
    }
    async tableExists(name) {
        try {
            const result = await Database_1.default.rawQuery(`SELECT COUNT(*) as c FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`, [name]);
            const rows = Array.isArray(result) ? result[0] : result.rows || result;
            const first = Array.isArray(rows) ? rows[0] : rows;
            return Number(first?.c) > 0;
        }
        catch {
            return false;
        }
    }
}
DemoCoworkDataSeeder.developmentOnly = true;
exports.default = DemoCoworkDataSeeder;
//# sourceMappingURL=DemoCoworkData.js.map