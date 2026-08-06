/**
 * Polish+ seed: planos default (Solo, Growth, Network).
 *
 * stripe_price_id fica null aqui — preenchido depois com IDs reais do Stripe
 * (gerados manualmente no painel Stripe ou via API durante setup do cowork).
 */
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder';
import Database from '@ioc:Adonis/Lucid/Database';

export default class SubscriptionPlanSeeder extends BaseSeeder {
  public async run() {
    const exists = await Database.from('subscription_plans').select('code');
    const existingCodes = new Set(exists.map((r: any) => r.code));

    const plans = [
      {
        code: 'solo',
        name: 'Solo',
        description: 'Para 1 local, até 30 membros ativos. Inclui invoices, contratos, agenda.',
        currency: 'USD',
        amount_cents: 4900,
        interval: 'monthly',
        features: JSON.stringify({
          max_locations: 1,
          max_members: 30,
          contracts_per_month: 30,
          docusign_included: true,
          whatsapp_included: false,
          ai_support: false,
          custom_branding: false,
        }),
        active: true,
      },
      {
        code: 'growth',
        name: 'Growth',
        description: 'Até 3 locais, até 150 membros. WhatsApp transacional incluído.',
        currency: 'USD',
        amount_cents: 14900,
        interval: 'monthly',
        features: JSON.stringify({
          max_locations: 3,
          max_members: 150,
          contracts_per_month: 200,
          docusign_included: true,
          whatsapp_included: true,
          ai_support: false,
          custom_branding: false,
        }),
        active: true,
      },
      {
        code: 'network',
        name: 'Network',
        description: 'Locais ilimitados, white-label, IA suporte 1ª linha.',
        currency: 'USD',
        amount_cents: 49900,
        interval: 'monthly',
        features: JSON.stringify({
          max_locations: -1,
          max_members: -1,
          contracts_per_month: -1,
          docusign_included: true,
          whatsapp_included: true,
          ai_support: true,
          custom_branding: true,
        }),
        active: true,
      },
    ];

    for (const p of plans) {
      if (existingCodes.has(p.code)) continue;
      await Database.table('subscription_plans').insert({
        ...p,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
  }
}
