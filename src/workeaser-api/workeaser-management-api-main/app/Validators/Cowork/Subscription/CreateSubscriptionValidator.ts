/**
 * CreateSubscriptionValidator — Sprint A (HF-SPRINT-A-06).
 *
 * Valida payload de POST /api/cowork/subscriptions.
 */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { rules, schema } from '@ioc:Adonis/Core/Validator';

export default class CreateSubscriptionValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    plan_id: schema.number([
      rules.unsigned(),
      rules.exists({ table: 'subscription_plans', column: 'id', where: { active: true, deleted_at: null } }),
    ]),
    /** Stripe Payment Method id (pm_xxx) — exigido se não for PIX */
    payment_method_id: schema.string.optional({ trim: true }, [
      rules.maxLength(120),
      rules.regex(/^pm_[A-Za-z0-9]+$/),
    ]),
    use_pix: schema.boolean.optional(),
    trial_days: schema.number.optional([rules.unsigned(), rules.range(0, 90)]),
    // HF-SPRINT-I-01: discount code opcional
    discount_code: schema.string.optional({ trim: true }, [
      rules.maxLength(60),
      rules.regex(/^[A-Z0-9_-]{3,60}$/i),
    ]),
  });

  public messages = {
    'plan_id.required': 'plan_id é obrigatório',
    'plan_id.exists': 'Plano não encontrado ou inativo',
    'payment_method_id.regex': 'Formato de payment_method_id inválido (esperado pm_*)',
    'discount_code.regex': 'Formato de discount_code inválido (3-60 chars: A-Z, 0-9, _, -)',
  };
}
